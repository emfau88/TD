"""Normalize the existing I07 foreground; no generation or change of timing."""
from pathlib import Path
import cv2
import numpy as np
import subprocess
import hashlib
import json
import shutil

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
ASSETS = REPO / 'experiments/idle-bastion/assets'
source = HERE / 'I07-approved-original.mp4'
if not source.exists():
    shutil.copy2(ASSETS / 'tavern-video/ilyra/hip.mp4', source)
background = cv2.imread(str(HERE / 'series-background.png'))
sheet = cv2.imread(str(ASSETS / 'tavern-rig/ilyra/hip/00.webp'), cv2.IMREAD_UNCHANGED)
reference = np.zeros((704, 480), np.uint8)
reference[2:702] = sheet[:700, :480, 3]
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41))
inside = cv2.erode((reference > 220).astype(np.uint8), kernel)
outside = cv2.dilate((reference > 10).astype(np.uint8), kernel)
cv2.setNumThreads(2)
capture = cv2.VideoCapture(str(source))
output = HERE / 'I07-size-corrected.mp4'
encoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-f', 'rawvideo',
    '-pixel_format', 'bgr24', '-video_size', '480x704', '-framerate', '24', '-i', '-',
    '-an', '-c:v', 'libx264', '-threads', '2', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', str(output)], stdin=subprocess.PIPE)
# A uniform 10% reduction aligns head/eyes and torso without changing neck
# proportions. The vertical anchor keeps the head at idle height. Extend only the
# already cropped last thigh row to retain a continuous bottom-frame cut.
scale = 0.90
matrix = np.float32([[scale, 0, 240 * (1 - scale)], [0, scale, 400 * (1 - scale)]])
samples = []
count = 0
try:
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        mask = np.where(reference > 127, cv2.GC_PR_FGD, cv2.GC_PR_BGD).astype(np.uint8)
        mask[outside == 0] = cv2.GC_BGD
        mask[inside > 0] = cv2.GC_FGD
        cv2.grabCut(frame, mask, None, np.zeros((1, 65), np.float64),
                    np.zeros((1, 65), np.float64), 2, cv2.GC_INIT_WITH_MASK)
        foreground = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)
        # Preserve enclosed details and avoid isolated room-colored noise.
        n, labels, stats, _ = cv2.connectedComponentsWithStats(foreground)
        foreground = (labels == (1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
        foreground = cv2.morphologyEx(foreground, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        foreground[700:] = foreground[699]
        alpha = cv2.GaussianBlur(foreground.astype(np.float32), (3, 3), .55)
        frame[700:] = frame[699]  # exclude the original two-pixel black frame edge
        # Premultiplied warping avoids a dark fringe around the cutout.
        rgb = cv2.copyMakeBorder(frame.astype(np.float32) * alpha[..., None], 0, 64, 0, 0, cv2.BORDER_REPLICATE)
        alpha = cv2.copyMakeBorder(alpha, 0, 64, 0, 0, cv2.BORDER_REPLICATE)
        warped = cv2.warpAffine(rgb, matrix, (480, 704), flags=cv2.INTER_LINEAR)
        alpha = cv2.warpAffine(alpha, matrix, (480, 704), flags=cv2.INTER_LINEAR)
        corrected = np.clip(warped + background * (1 - alpha[..., None]), 0, 255).astype(np.uint8)
        encoder.stdin.write(corrected.tobytes())
        if count in [0, 26, 53, 80, 106]:
            cv2.imwrite(str(HERE / f'corrected-{count:03}.png'), corrected)
            samples.append(cv2.resize(corrected, (240, 352)))
        count += 1
finally:
    capture.release()
    encoder.stdin.close()
    assert encoder.wait() == 0
assert count == 107
cv2.imwrite(str(HERE / 'corrected-samples.jpg'), np.hstack(samples))
(HERE / 'normalization.json').write_text(json.dumps({
    'source': source.name, 'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'output': output.name, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
    'frames': count, 'fps': 24, 'scale': scale, 'anchor': [240, 400],
    'method': 'Foreground normalization over original fixed series background. Existing motion/timing; no AI rendering.',
    'user_approval_of_derived_version': False
}, indent=2) + '\n', encoding='utf-8')
print(f'Normalized {count} existing frames; candidate ready for visual inspection.')

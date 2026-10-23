# T11 · ilyra · exakte Imagegen-Prompts

Eingebautes Imagegen-Werkzeug, transparente RGBA-Ausgabe, 21.10.2026. Auswahl und Aufbereitung siehe README.md; keine CLI/API-Fallbacks.

## Aufruf 1

Use case: precise-object-edit / identity-preserve. Production in-between sprite sheet for the existing approved adult Ilyra character shown in the input. This is a restrained animation refinement, NOT a redesign. Preserve the exact silver-white hairstyle and volume, golden goggles, blue eyes and their size, warm tan skin, mature face shape, white/royal-blue/gold clothing, navy cape, earrings, proportions, pixel scale, hands relaxed at hips, straight-on head-to-upper-thigh crop. Crisp blocky PIXEL ART matching the input, no smoothing, no painterly texture.

Make her face readable at the input's native scale: a small clearly visible warm dark nose shadow and highlight, and a natural short muted rose-brown mouth with a subtle lower-lip highlight. Small restrained closed-mouth expression. Keep eye size and face identity. Do not add lipstick, makeup, a big smile, a different nose shape, or enlarge the head.

Produce FIVE frames in a single horizontal strip of FIVE equal square cells. Each cell corresponds to the full 362x362 input cell or a consistent uniform enlargement. Character belt medallion center is fixed at native cell (240,269); all hands, lower body, head, hair outline and goggles stay almost perfectly still. The independent spear on the far left must stay identical in each cell with clear transparent space to her body. All character parts fully contained inside each cell, no clipping or overlap.
Frame 1: original quiet rest pose with only the face readability correction.
Frame 2: a true redrawn early inhale between rest and a very small shoulder lift, about ONE native pixel movement of shoulders/cape clasps/collar. Face remains still.
Frame 3: tiny peak inhale, about TWO native pixels shoulder/collar lift, never inflate her body. Hands and belt stay fixed, hair barely follows at the very tips.
Frame 4: exact frame-1 rest pose with BOTH eyes symmetrically HALF closed (blue irises still partly visible), nose and mouth remain clearly readable, no head tilt.
Frame 5: exact frame-1 rest pose with BOTH eyes gently CLOSED, no head tilt or expression change, nose/mouth remain visible.
These will play forward/backward between frame1 and frame3, and 1-4-5-4-1 for a blink. Real drawn local motion, no whole-image sliding, scaling, warping, crossfades, blur, double outlines. Exactly two arms and two hands per frame. No new accessories, props, effects, gestures, text, labels, grid, scenery or shadows. Genuine transparent RGBA background; the empty space between standing spear and body is also transparent.

## Aufruf 2

Precise local correction to the attached FIVE-FRAME Ilyra pixel-art strip. Keep all five figures, positions, scale, anatomy, pixel-art style, poses, timing order, hair, clothing, goggles and hands identical. Do not redesign or beautify.
Change ONLY:
1. REMOVE all five independently standing spears completely, including shafts, crystals and hanging ribbons. Replace them with true transparency. Leave each figure exactly where it already is and keep the rest of each cell empty at the left. The original spear will be drawn separately by the game, so do NOT replace it.
2. Make the small facial nose and mouth MORE LEGIBLE in EVERY frame, consistently: at native portrait size a 2–3 pixel warm dark-brown nose-tip/nostril shadow and one warm light pixel at bridge/tip, and a clear 5–7 pixel muted dark rose-brown closed-mouth line, with just 1–2 lower-lip highlight pixels. These should be visibly darker than the surrounding skin, not faint salmon freckles. Modest adult expression, NO lipstick or big smile. Preserve eye size/shape, face outline and head size. Both nose and mouth must remain readable in the half blink and closed blink frames.
Keep all five figures fully within their own cells; no new background, text, grid or shadows. Transparent RGBA output. Preserve the sheet dimensions and empty margins.

## Aufruf 3

Use case: identity-preserve. Create a tightly controlled animation refinement of the attached existing adult ILYRA pixel-art sprite. Approved face shape, skin, silver-white hair, goggles, eyes, earrings, white-blue-gold costume, navy cape, relaxed hands, hips, proportions and crisp pixel art are binding. NOT a new design.

Output SIX SQUARE CELLS in a THREE-COLUMN by TWO-ROW sheet (3x2), all the same size. Each character fully isolated with generous transparent space on ALL sides, including cape and hands; no neighboring figures touch, overlap, or get clipped. The same figure size and belt-medallion baseline in all cells. Use the original character without her separately standing spear: OMIT ALL SPEARS and their ribbons completely, real transparent space to image-left. The game supplies the unchanged original spear separately. Keep her body position as in the input, never center or enlarge independently by frame.

Improve face readability consistently across ALL SIX cells: clearly readable small warm-brown nose tip and tiny bridge highlight, a short dark muted rose-brown closed mouth, subtle lower lip highlight. Exactly the SAME nose and mouth in every cell, including rest and blink. Natural reserved adult expression, no lipstick or large smile, no huge dark nostril dot. Do not enlarge eyes or round the face.

Read in row order:
1. Calm rest, original hands relaxed at hips. This is the common beginning/end pose.
2. Genuine redrawn subtle early inhale: shoulder/clasp/collar about ONE native pixel raised, tiny fabric change, not a body scale. Face still and unchanged.
3. Genuine small peak inhale: shoulder/clasp/collar about TWO native pixels raised; belt, waist and hands fixed. Head/eyes/hair silhouette almost motionless.
4. Same rest pose as frame1, BOTH eyes symmetrically half closed, visible sliver of blue iris, no nod or smile change.
5. Same rest pose, BOTH eyes fully closed. Nose/mouth exactly match frame1.
6. Exact repeat of rest frame1 for visual reference.
The breathing will play 1-2-3-2-1; blink 1-4-5-4-1. Only these tiny changes, no other gesture. Preserve original scale/pixel-cluster size. No whole-image translation, stretch, blur, ghosting, fade, labels, grids, backdrop, ground shadow, magic or new props. Genuine transparent RGBA. Exactly TWO anatomically connected arms and hands in every frame.


"""Package the current Unity render for review; no changes to its artwork."""
from pathlib import Path
from PIL import Image
import json

project=Path(__file__).resolve().parent
root=project.parents[2]
art=root/'experiments/idle-bastion/assets/mara-tavern/unity-idle'
frames=[Image.open(project/f'Export/frame-{i:03}.png').convert('RGBA') for i in range(193)]
assert frames[0].tobytes()==frames[-1].tobytes(), 'Loop endpoint mismatch'
durations=[round((i+1)*1000/24)-round(i*1000/24) for i in range(192)]
frames[0].save(art/'rest-render.webp',lossless=True,exact=True,method=0)
frames[0].save(art/'idle.webp',save_all=True,append_images=frames[1:192],duration=durations,loop=0,lossless=True,exact=True,quality=0,method=0)
(root/'artifacts/idle-bastion/acceptance/t11-unity-idle/export.json').write_text(json.dumps({'durationMs':8000,'fps':24,'samples':192,'renderSize':[768,1024],'loopEndpointExact':True,'bytes':(art/'idle.webp').stat().st_size},indent=2),encoding='utf-8')
print('Preview ready:',art/'idle.webp',(art/'idle.webp').stat().st_size)

html=(root/'experiments/idle-bastion/unity-review.html').read_text(encoding='utf-8')
html=html.replace('Kleine Unity-Probe','Mara Idle-Versuch').replace('Mara · sanfte Stoffbewegung','Mara · Idle-Versuch')
html=html.replace('Eine kleine Probe mit dem festen Ruhebild: Nur die freien Umhangränder bewegen sich. Gesicht, Haare, Brust und Hände bleiben fest.','Aktueller Arbeitsstand: dezente Atmung, Kopf- und Haarbewegung sowie Blinzeln. Zur Beurteilung der Methode, noch nicht freigegeben.')
html=html.replace('<label>Tempo <select id="speed"><option value="1">Normal</option><option value="0.5">Halb so schnell</option></select></label>','')
html=html.replace('Stoff vergrößern','Details vergrößern').replace('transform-origin:20% 68%','transform-origin:50% 32%')
html=html.replace('unity-probe/rest.webp','unity-idle/rest-render.webp').replace('unity-probe/cloth.webp','unity-idle/idle.webp')
html=html.replace('Mara mit sanft bewegten Umhangrändern','Mara mit Atmung, Kopfbewegung und Blinzeln').replace('Vier Sekunden','Acht Sekunden')
html=html.replace('Ein Methodentest, noch keine vollständige Idle: Atmung, Blinzeln und Gesten sind hier nicht enthalten. Nicht im veröffentlichten Spiel eingebunden.','Versuch auf Basis des bestehenden Mara-Bildes. Noch keine finale Qualitätsabnahme. Nicht im veröffentlichten Spiel eingebunden.')
html=html.replace("  const speed = document.querySelector('#speed');\n",'')
html=html.replace("picture.src = './assets/mara-tavern/unity-probe/' + (running ? (speed.value === '1' ? 'cloth.webp' : 'cloth-slow.webp') : 'rest.webp');","picture.src = './assets/mara-tavern/unity-idle/' + (running ? 'idle.webp' : 'rest-render.webp');")
html=html.replace("caption.textContent = running ? (speed.value === '1' ? 'Acht Sekunden · durchgehender Loop · dezente Bewegung.' : 'Halbes Tempo zum Prüfen der Konturen.') : 'Zurück im unveränderten Ruhebild.';","caption.textContent = running ? 'Acht Sekunden · durchgehender Loop · aktueller Versuch.' : 'Zurück im Ruhebild.';")
html=html.replace("  speed.addEventListener('change', update);\n",'')
(root/'experiments/idle-bastion/unity-idle-review.html').write_text(html,encoding='utf-8')

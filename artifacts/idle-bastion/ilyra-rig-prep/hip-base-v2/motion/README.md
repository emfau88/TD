# Ilyra – Bewegung aus der freigegebenen Hüftpose

Sechssekündige Bewegungsprobe: Gewichtsverlagerung, leichte Gegenbewegung von Brustkorb und Kopf, ruhige Atmung und kleine Folgebewegungen von Haaren und Stoff. Die gezeichnete gebeugte Armhaltung bleibt erhalten. Die Hand folgt der Hüfte; der Schulter-/Unterarmverbund wird mit einer analytischen Zwei-Knochen-Lösung nachgeführt.

## Quellen und Wiedergabe

- Freigegebene Zeichnung: `../preview/ilyra-hand-on-hip.png`, unverändert kopiert nach `../../hip-v1/unity/Assets/HipBaseV2/IlyraHipBase.png`.
- Unity-Projekt: `../../hip-v1/unity/`, neue Szene/Prefab/Clip/Controller ausschließlich unter `Assets/HipBaseV2/`.
- Reproduzierbarer Aufbau: `Assets/Editor/BuildIlyraHipBaseV2.cs`, Aufruf `-executeMethod BuildIlyraHipBaseV2.Run -spire-export`.
- Wiedergabe: `preview/index.html`, transparente PNGs unter `preview/frames/`, verlustfreie WebP-Atlanten und `manifest.json`.
- Handy-GIF: `preview/Ilyra-Hand-an-der-Huefte.gif`, 480 × 800, 20 Bilder/s, sechs Sekunden, Endlosschleife. Ruhiger heller Hintergrund und gemeinsame Palette für alle GIF-Bilder. GIF ist farbreduziert; die PNG-/WebP-Quellen bleiben verlustfrei.
- Packung/Prüfung: `pack.py`; Rohdaten `preview/validation.json`, `rig-checks.json`, zusammengefasst `checks.json`.

## Technische Einordnung und Grenzen

Diese erste kleine Bewegung nutzt einen neuen, zur Kontaktpose passenden **kontinuierlichen SpriteSkin mit 16 Knochen** und gemeinsamen Mesh-Kanten. Die Mesh-Geometrie und Gewichte sind im Unity Sprite Editor editierbar. Das Gesicht bleibt starr an seinem Kopfanker. Die Hand ist direkt an die Hüfte gebunden, die Schulter-/Ellenbogenbewegung bleibt klein: maximal etwa 0,67° Oberarm und 2,65° Unterarm gegenüber der gezeichneten Haltung. Maximale rechnerische Abweichung des Handgelenkanschlusses: 0,00016 Quellpixel.

Es handelt sich **noch nicht um einen vollständig in neue Grafikebenen zerlegten Charakter**: Die freigegebene Zeichnung bleibt als zusammenhängende Textur erhalten. Damit werden bei dieser kleinen Bewegung keine verdeckten Flächen neu aufgedeckt. Hände lösen, große Armbewegungen, neue Überdeckungen oder Perspektiven sind damit nicht freigegeben; sie benötigen die zuvor geplanten ergänzten Ebenen/Zeichnungen. Keine neue PSB, kein Blinzeln und kein Übergang aus der alten neutralen Pose in dieser Probe. Der offene Ebenen-/Rig-Ausbau wird nicht als erledigt ausgegeben.

Zwei weiche Brustknochen folgen der Körperbeschleunigung über eine gedämpfte Feder bei 240 Hz. Ihre zusätzliche Auslenkung beträgt in dieser ruhigen Bewegung nur rund 0,29 Quellpixel; sichtbar ist vor allem die Mitbewegung mit Atmung und Oberkörper. Das ist keine kräftige Wippgeste. Die letzten 0,7 Sekunden blenden den kleinen Federrest aus, damit die Haltung exakt zum Schleifenanfang zurückkehrt.

181 gerenderte Posen, 2.252.364 Dreiecksprüfungen ohne Faltung; kleinster Flächenquotient 0,70466. Diese technische Prüfung ersetzt keine anatomische Nutzerabnahme. Ruhe und mehrere Zwischenzustände bei normaler und vergrößerter Ansicht auf Konturen, Gesicht, Armbeuge und Gürtelkontakt prüfen; Ergebnis der Wiedergabeprüfung in der zentralen Roadmap.

Bestehende Quellen und Animationen bleiben erhalten. Kein Eingriff ins Hauptspiel, kein Commit oder Push. Freigaben und verbleibende Aufgaben ausschließlich in `experiments/idle-bastion/ROADMAP.md`.

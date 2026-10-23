# Vorbeuge mit stärkerer Oberkörperbewegung

Separate Überarbeitung vom 23.10.2026. Nur die Vorbeuge wird variiert. Die vorherige Fassung, Hand in die Hüfte und Kichern bleiben einschließlich Clips, PNGs, GIFs und WebP-Seiten unverändert; Hashvergleich in `validation.json`.

Der Brustkorb kippt bis 35 Grad um die feste Hüfte in die Tiefe. Dadurch verkürzt sich die sichtbare Oberkörperlänge geometrisch, und Schultern, Arme, Kleidung und Hals bewegen sich gemeinsam. Hals und Kopf halten mit insgesamt bis 35 Grad dagegen, um Blickkontakt und Gesichtsproportionen zu erhalten. Die frühere zusätzliche Absenkung von Hals und Kopf entfällt. Die vorhandene frontale Zeichnung bleibt die Grundlage; es gibt keine neue perspektivische Ansicht von Scheitel oder Rücken.

Die 5-Sekunden-Geste und ihre Rückkehr bleiben zeitlich mit der alten Fassung vergleichbar. Die Brustphysik wird erneut aus der tatsächlichen Bewegung integriert: maximal 4,71 / 4,32 Quellpixel, kein Anschlag am 10-Pixel-Limit. Für den geneigten Brustkorb werden alle drei lokalen Positionskomponenten der Federbewegung gebacken. Die orthografische Kamera wird nur in der Tiefe versetzt, um die Bewegung vollständig innerhalb ihrer Clipping-Ebenen zu halten; Bildausschnitt und Bildmaßstab bleiben gleich.

## Quellen und Prüfung

- Szene: `../unity/Assets/ForwardLean/ForwardLean.unity`.
- Clips: `ForwardLeanBody.anim`, `ForwardLeanPhysics.anim` im selben Ordner.
- Builder: `../unity/Assets/Editor/BuildForwardLean.cs`.
- Exporter: `../unity/Assets/ForwardLeanExport.cs`.
- Transparente PNG-Sequenz: `../unity/Export/ForwardLean/ForwardLeanPhysics/`.
- Prüfung: `../unity/Assets/Editor/InspectForwardLean.cs`, `mesh-audit.json`, `spring-validation.json`, `validation.json`.
- Browser/GIF-Aufbereitung: `pack.py`; native verlustfreie WebP-Seiten mit RGBA-Roundtrip. GIF nur als verkleinerte Ansichtsdatei.

151 Posen und 527.292 Dreiecke ohne Faltungen. Die neue HTML-Seite zeigt links die bisherigen Atlanten und rechts die neue Fassung mit gemeinsamer Wiedergabe, Pause, Zeitpunkt und Zeitlupe. Kein Eingriff ins Hauptspiel, keine Änderung der beiden anderen Gesten.

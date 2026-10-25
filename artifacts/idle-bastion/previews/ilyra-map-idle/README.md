# Ilyra · Speer-Idle auf der Karte

**Nur Vorschau**, Branch `codex/ilyra-map-idle-preview`, Basis `main/f5b4a6f`. Kein Merge, kein Pages-Deployment und keine Einbindung ins Spiel. Die große Tavernenfigur wurde nicht als Kartenfigur verwendet.

## Handy-Vorschau

- **Aktuelle V3: [Ilyra-Speer-Idle-Handy-v3.gif](Ilyra-Speer-Idle-Handy-v3.gif)** — 390×680, 273.918 Bytes, **3,92 Sekunden / 33 Frames**. Der Hüftakzent dauert 720 ms länger: acht bewegte Abtastungen eines kleinen lokalen Hüftbogens (maximal 2,2 Kartenpixel), kein verlängertes Standbild. Speergriff und Füße bleiben währenddessen fest. Bei der Rückkehr ab Frame 23 verwendet der Unterkörper die ursprüngliche Idle-Beinstellung; die Bewegungsinterpolation läuft oberhalb davon aus. Dadurch wandern die Füße nicht mehr zusammen und Richtung Speer. Oberkörper, Arm und Speer bewegen sich weiter.
- V3: [Bildfolge](v3/contact-sheet.png), [Zeitfolge](v3/animation.json), [gezielte Medienprüfung](v3/checks.json), [mobile Browserprüfung](v3/browser-checks.json). Reproduktion mit `build_settled_preview.py`, Prüfung mit `check_settled_preview.py` im selben Verzeichnis (Python/Pillow/numpy/OpenCV). Bestehender Vorschau-Rig und bestehende Posen, keine neue Bildgenerierung. Quellbild, V1/V2 und Produktionsdateien bleiben unverändert. Weiterhin nur Vorschau, keine Integration oder Veröffentlichung auf Pages; Produktionsbuild/Vollsuite für die reine Medienkorrektur nicht wiederholt.
- **V2: [Ilyra-Speer-Idle-Handy-v2.gif](Ilyra-Speer-Idle-Handy-v2.gif)** — 390×680, 234.326 Bytes, weiterhin 3,2 Sekunden. Dieselben acht Schlüsselposen; 16 berechnete Zwischenbilder glätten die Übergänge. Der schmale goldene Speerkern wird aus seinem Quellbereich abgetastet, damit beim Verkleinern nicht nur die dunklen Außenkanten übrig bleiben. Außerhalb dieser ein Pixel breiten Schaftkorrektur bleiben die Schlüsselposen pixelgleich. Keine neue Bildgenerierung, keine neue Choreografie.
- V2: [24 Bewegungsbilder](v2/contact-sheet.png), [Zeitfolge und Verfahren](v2/animation.json), [Medienprüfung](v2/checks.json), [mobile Browserprüfung](v2/browser-checks.json). Das GIF enthält zusätzlich die identische Ausgangspose als Endpause, insgesamt 25 Frames. Zwischenbilder verwenden Bewegungsinterpolation aus der jeweils näheren vorhandenen Pose, ohne Überblendung; harte Pixelkanten bleiben erhalten. Anker und Kartenmaßstab bleiben gleich. Dies ist eine Vorschauinterpolation, kein handgezeichneter, fertig freigegebener Produktionsatlas.
- Reproduktion der V2: `python artifacts/idle-bastion/previews/ilyra-map-idle/build_smooth_preview.py` mit Pillow, numpy und opencv-python. Originalquelle und V1 bleiben erhalten; das Skript rekonstruiert zunächst V1 unverändert. Keine Änderungen an Spielcode oder Produktionsassets. Produktionsbuild/Vollsuite für diese reine Medienkorrektur nicht erneut ausgeführt.
- **[Ilyra-Speer-Idle-Handy.gif](Ilyra-Speer-Idle-Handy.gif)** — 390×680, 98.092 Bytes, endloser **3,2-Sekunden-Loop**.
- [Lokale Ansichtsseite](index.html), [acht Posen](contact-sheet.png), [Standbild](preview.png).
- Oben: **1× Kartenmaßstab** bei Darstellung des GIFs in seiner nativen Breite von 390 Pixeln. Links unverändert der echte aktuelle Ilyra-Stand, rechts die animierte Probe. Originalrasen und Waldwächter im bisherigen Maßstab helfen beim Größenvergleich. Das ist eine separat zusammengesetzte Kartenprobe, keine heimliche Ingame-Integration.
- Unten: exakt dieselben gepackten Frames **4× per Nearest Neighbor**, damit sich Hüfte, Speergriff und Beinstellung am Handy beurteilen lassen. Kleinere Bildschirme verkleinern die gesamte Vorschau proportional.

## Verwendete Repo-Assets

1. `experiments/idle-bastion/assets/ilyra/ilyra-atlas.png`: **tatsächlich geladener Laufzeitatlas**, Hauptreferenz für Figur, Stil und Maßstab; Frame 0 unverändert im GIF zum Vergleich.
2. `experiments/idle-bastion/assets/ilyra/sources/stand-approved.png`: zugehörige freigegebene große Designreferenz, ergänzend zur Kartenfigur.
3. `public/assets/Grass Tileset.png`, Ausschnitt (128,64)–(192,128), als 40×40-Spielzelle; `Tower 01.png` und `Tower 01 - Level 01 - Weapon.png` mit dem bisherigen Faktor 0,63.

Geprüft gegen `src/art.ts`, `src/ilyra-view.ts`, `src/ilyra.ts` und den Assetvertrag: Laufzeitrahmen 64×64, Maßstab 1, Fußpunkt **(32,56)**, Körper grob 37–39 Pixel hoch. Speer und angehobene Hand dürfen darüber hinausragen; alle Vorschauposen bleiben vollständig innerhalb des 64×64-Rahmens.

## Ursprüngliche V1: Bewegung / Dateien

**Acht unterschiedliche Posen:** starke Ausgangspose → Speer anheben → Schaftende aufsetzen → Hüfte deutlich nach außen → kurze Drehgeste am hoch gehaltenen Speer mit angewinkeltem Bein → spielerisch öffnen → Speer aufnehmen → starke Idle-Pose. Die Speerachse ist während der vier gepflanzten Posen auf x≈21 registriert. Die Bewegung bleibt aufrecht und nicht explizit; keine Kleideränderung oder zusätzliche Figur.

Das GIF hat **neun Bildphasen**, weil die erste Pose als identische Endpause wiederkehrt. Dauern: **850 / 200 / 220 / 380 / 340 / 280 / 220 / 260 / 450 ms**. Kein bloßes Wackeln/Skalieren eines unveränderten Sprites und keine vielen unlesbaren Zwischenbilder.

- `source/poses.png`: unverändertes generiertes Rohblatt mit echter Alphatransparenz.
- `prompt.txt`: vollständiger Prompt des **eingebauten Imagegen-Werkzeugs**, mit beiden oben genannten Referenzen. Kein CLI-/API-Fallback.
- `frames/00.png`–`07.png`, `idle-preview.png`: separate binär transparente 64×64-Frames / 512×64-Vorschauatlas.
- `animation.json`: vermessene Quellanker, gemeinsamer Faktor 0,109, Zeitfolge, Rahmen und Quellhashes.
- `build_preview.py`: reproduzierbare technische Packung und GIF-Montage mit Python/Pillow, Windows-Segoe-UI für Vorschautexte. Ausführen mit `python artifacts/idle-bastion/previews/ilyra-map-idle/build_preview.py`. Die Posen stammen aus Imagegen; das Skript zeichnet keine Ersatzfigur und überschreibt keine Produktionsassets.

## Prüfung und Integrationsgrenze

[Technische Prüfung](checks.json): GIF decodiert mit neun Frames und 3.200 ms, Endlosschleife, erstes/letztes Bild pixelgleich, binäre Alpha-Frames, kein Rahmen angeschnitten. Laufzeitatlas, freigegebene Standquelle und Ilyra-Animations-/Zeichencode stimmen per SHA-256 weiter exakt mit Main überein (bei Textdateien Zeilenenden auf LF normalisiert).

[Browserprüfung](browser-checks.json): lokale GIF-Seite bei **390 und 320 Pixeln** geladen; tatsächliche Animation durch mehrere zeitversetzte Bilder bestätigt; keine horizontale Überbreite/JavaScript-Fehler, Poseübersicht erreichbar. Mobile Chrome-Emulation; keine physische Smartphone- oder Nutzerabnahme behauptet. Produktionsbuild/Vollsuite nicht erneut ausgeführt, da ausschließlich Previewdateien, Roadmap und QA-Ignore ergänzt wurden.

**Noch nicht direkt als vollständiger Runtime-Ersatz integrierbar:** nur eine Frontrichtung, bewusst wenige Schlüsselposen, keine Idle-Auslöseplanung und keine Übergänge aus den anderen Blickrichtungen. Der 64×64-Atlas ist für einen späteren Prototyp vorbereitet; Auswahl, weitere Richtungen und Einbindung brauchen erst die visuelle Freigabe. Lauf-, Kampf- und Zauberanimationen sowie Gameplay bleiben unverändert.

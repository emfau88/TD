# Ilyra – mehrschichtige Animationsvorlage

Separates SPIRE-Experiment vom 23.10.2026. Keine Einbindung ins Hauptspiel.
Auftrag und Abnahmestatus stehen ausschließlich in `experiments/idle-bastion/ROADMAP.md`.

## Inhalt und Verwendung

- `preview/index.html`: Ruhefigur, Ebenenübersicht und begrenzte Unity-Gelenkprobe mit Zeitregler und Knochenanzeige. Lokal über `python -m http.server 5221 --bind 127.0.0.1 --directory <dieser Ordner>` erreichbar.
- `Ilyra.psb`: 13 transparente, registrierte Grafikebenen, 768 × 1280 px. PNG-Ebenen liegen unter `layers/`.
- `unity/`: eigenständiges Projekt für Unity **6000.4.0f1**, 2D Animation **14.0.3**, PSD Importer **13.0.2**. In Unity Hub diesen Ordner öffnen, dann `Assets/IlyraPreparation.unity`.
- `unity/Assets/Ilyra.prefab`: tatsächlich gebundenes Rig mit **26 Knochen und 13 SpriteSkins**. Hand-, Unterarm- und Oberschenkelknochen lassen sich einzeln auswählen. `ImageLeft` und `ImageRight` bezeichnen die Bildseite, nicht die anatomische Seite.
- `unity/Assets/Art/Ilyra.psb` samt `.meta`: PSB mit importierten Knochen, Geometrie und Gewichten. Im Sprite Editor / Skinning Editor weiterbearbeitbar. Die Datei im Paketwurzelordner ist die reine mehrschichtige Grafik; die Rig-Importdaten liegen in Unitys `.meta`-Datei.
- `art/`: unveränderte Imagegen-Ausgaben, vollständige Prompts und reproduzierbare Anordnung in `assembly.json`. Vorläufige Zeichnungen wurden erhalten.
- `rig-map.json`: Knochenhierarchie, Ruheanker und Längen in Bildkoordinaten.
- `prepare.py`, `setup_unity.py`, `finish.py`: Registrierung/PSB-Ausgabe, Unity-Projektvorbereitung und Kontaktblatt/Paketprüfung. Python benötigt Pillow, NumPy und OpenCV. `setup_unity.py` übernimmt die schon verwendeten Importhilfen aus dem benachbarten Mara-Experiment; das fertig erzeugte Unity-Projekt selbst ist eigenständig.

## Aufbau und Gelenke

Neue höher aufgelöste Zeichnungen aus dem eingebauten **Imagegen-Werkzeug**; kein Hochrechnen der alten Spielfigur. Designreferenz ist `experiments/idle-bastion/assets/ilyra-tavern/rest-reference/rest.png`: erwachsene Ilyra, silberweißes Haar, blaue Augen, goldene Brille, blau-goldene Ohrringe, weiß/blau/goldenes Kostüm und Umhang. Ohne Speer. Maras neue Darstellung diente nur als Referenz für die Ausarbeitungsqualität.

Die Vorlage wurde als Körper-/Haar-/Kleidungsbauteile erzeugt. In der ersten Montage zeigten sich sichtbare Hals- und Ellbogengrenzen. Deshalb wurden zwei gezielte Quellkorrekturen erstellt: ein durchgehend gezeichneter Oberkörper inklusive Armen und Händen sowie ein Kopf mit sauberer Kinnsilhouette. Der Hals gehört nun zur Körperfläche und liegt hinter dem Kopf. Kein nachträgliches Übermalen oder Überblenden von Rissen in Animationsframes.

**Eine Grafikebene muss nicht einem einzelnen Knochen entsprechen.** Schultern, Ellbogen und Handgelenke teilen sich eine zusammenhängende Textur und ein zusammenhängendes Mesh. Die Gewichte gehen über die Gelenke ineinander über. Damit sind die Hände getrennt steuerbar, ohne eine sichtbare Handgelenk-Schnittkante zu erzeugen. Eine mittlere Maskierung oder neue Hand-Swap-Vorlagen sind erst für weitere Handstellungen erforderlich.

Beide Oberschenkel haben eigene Ebenen mit gezeichneten oberen Überlappungen. Eine blickdichte Hüftunterlage liegt darüber, drei Rockbahnen davor. Umhang und hintere Haare liegen hinter den Armen. Vorderhaar mit Brille, seitliche Haarsträhnen und deren Spitzen haben eigene Bindungen.

Das Rig wurde über Unitys Editor-Datenanbieter aufgebaut, **nicht per manueller Bedienung des Skinning Editors**. Es verwendet dieselben editierbaren SpriteBones, Meshes, Bone Weights und SpriteSkins. Ausgangspunkt ist der [offizielle Unity-Workflow](https://learn.unity.com/article/how-to-animate-2d-characters): registrierte Ebenen, Skelett, Geometrie/Gewichte und Prüfung von Zwischenposen. Gemeinsame indizierte Meshpunkte vermeiden die getrennt gerasterten Dreiecke aus Maras erstem Versuch. Vollständig transparente Zellen der großen Körperfläche werden nicht trianguliert.

## Kompakte Prüfung

Die Gelenkprobe enthält 25 Zustände einer bewusst gleichmäßigen technischen Bewegung, keine ausgearbeitete Idle:

- Handgelenke ±15°, Ellbogen ±8°, Oberarme ±2°, Oberschenkel ±3°, Kopf ±2°, kleine begleitende Stoff-/Haarbewegung.
- **187.200 Dreiecksprüfungen, null umgeklappte Dreiecke.** Kleinster Flächenfaktor 0,5606 am Umhang.
- Alle Gewichte normiert; PSB-Importer bestätigt 26 Knochen und 13 Teile.
- Ruhe-Anfang und Ende der Unity-PNG-Probe pixelidentisch.
- Die 13 PNG-Ebenen ergeben exakt die gespeicherte Ruhefigur.
- Alpha der Unity-Ruheausgabe und der Ebenenmontage exakt identisch; mittlere absolute RGB-Abweichung über alle Bildkanäle etwa 0,067 von 255 durch Render-/Alpha-Rundung. Keine verlustbehaftete Texturkompression, keine Mipmaps.
- Ruhebild und beide maximalen Testauslenkungen visuell geprüft, insbesondere Hals, Schultern, Ellbogen, Handgelenke und Rocküberlappungen. Technische Faltungsfreiheit ist keine Garantie für jede künftig größere Pose.
- Browser: Ruhebild/Ebenen/Gelenkprobe, Zeitregler, Abspielen/Pause, Hintergrundwechsel und Knochenanzeige; Desktop und 390 × 844 Hochkant. Nur beim Aufruf der Gelenkprobe werden deren Bilder geladen. Kein Unity-Player im Browser.

Maschinenlesbare Ergebnisse: `preview/validation.json` und `preview/package-checks.json`. Native transparente Einzelbilder unter `preview/joint-test/`. GIF ist nur eine verkleinerte Sichtprobe auf hellem Hintergrund, kein Produktionsformat.

Beim Unity-Start meldete der editorinterne Suchindex eine `ArgumentOutOfRangeException`; der Stack betraf `UnityEditor.Search.SearchDatabase`. Rig-Erstellung und Export wurden danach vollständig ausgeführt. Es wurde keine Spielfunktion oder Lizenzkonfiguration verändert.

## Grenzen dieses Pakets

Dies ist eine neue Grafikgrundlage mit gebundenem Vorbereitungsrig. Das Gesicht ist derzeit eine stabile gemeinsame Fläche: **Blinzelstufen, Mundvarianten und wechselbare Handposen sind noch nicht angelegt.** Es gibt noch keine fertigen Idle-/Berührungsclips und keine abgestimmte Federphysik. Zusätzliche Physik muss auf dieser Vorlage separat gewichtet und geprüft werden; eine bessere Qualität als bei Mara ist noch nicht nachgewiesen.

Der Ausschnitt reicht bis zu den Oberschenkeln. Knie, Unterschenkel, Füße, einzelne Finger und neue Seiten-/Rückenansichten sind nicht enthalten. Deutliche Drehungen in die Tiefe benötigen weitere Zeichnungen. Die Gelenkprobe belegt nur die hier geprüften kleinen Bewegungsbereiche.

Alle Bildquellen und vorherigen Mara-Experimente bleiben erhalten. Kein Commit, Push oder Veröffentlichung aus diesem Paket.

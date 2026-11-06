# Mara am Tresen: erste Posen-Rigs

Eigenständiges Unity-6000.4.0f1-Projekt mit Unity 2D Animation 14.0.3. Die drei vorhandenen Zeichnungen werden als drei eigene Rigs verwendet. Es gibt keinen Bildmorph und keinen automatisch erzeugten Übergang zwischen den Posen.

## Dateien und Bearbeitung

| Pose | Bearbeitbare Unity-Szene / Prefab / Clip | Bewegungsprobe |
| --- | --- | --- |
| Grundpose | `unity/Assets/Rigs/base/` | 5 s, 150 Frames: kleine Kopfneigung und Nachgeben des Oberkörpers; beide Hände fest. |
| Vorbeugen | `unity/Assets/Rigs/lean/` | 5 s, 150 Frames: kleine interessierte Kopfbewegung; unterer Zopf folgt dem Körper, beide Hände fest. |
| Ellbogenstütze | `unity/Assets/Rigs/elbow/` | 5,2 s, 156 Frames: Kopf und stützende Hand bewegen sich gemeinsam um den tatsächlichen Ellbogen-Auflagepunkt; andere Hand fest. |

In jedem Ordner: `Preview.unity`, `MaraCounter.prefab`, `ContactIdle.anim` und `Counter.controller`. Das Rig wird vom normalen Animator abgespielt. Die Clipkurven enthalten die tatsächlichen Bone-Transformationen; der Exporter ist für die Animation nicht erforderlich.

Die Texturen unter `unity/Assets/Art/` sind byteidentische Kopien der vier vorhandenen Bilder aus `../static-scene-v2/`. Import-Metadaten enthalten editierbare Knochen, Meshkanten und Gewichte für Unitys Skinning Editor. Das Skelett hat 18 Bones, darunter zwei Kopfführungspunkte. `CounterRigInfo` zeigt die Hierarchie und Auflagepunkte als Gizmos. `BuildCounterRig.cs` enthält die anatomischen Zuordnungen, Gewichtsverläufe und reproduzierbaren Clipkurven.

## Gewählter Umfang

Dies ist eine erste Rig-Stufe für kleine Bewegungen **innerhalb** jeder gezeichneten Haltung: zusammenhängendes SpriteSkin-Mesh, starre Gesichtszone, gewichtete Übergänge und gebackene Armkinematik mit festen Handzielen. Bei der Ellbogenstütze bilden Kopf, Hand und stützender Unterarm eine gekoppelte Gruppe. Die Hintergrunddatei bleibt fest.

Es ist noch kein vollständig freigeschnittenes Ebenenmodell für beliebige Gesten. Verdeckte Körper-/Kleidungsflächen sind nicht nachgezeichnet; größere Armbewegungen, das Abheben einer Hand, neue Gesichtsausdrücke und Übergänge zwischen den drei Zeichnungen benötigen diese zusätzlichen Zeichnungen und eine weitere Abnahme. Die beiden Haar-Führungspunkte sind derzeit Hilfsbones; die sichtbare kleine Haarbewegung kommt aus Kopf-/Zopfgewichten. Kein unabhängiges Blinzeln, keine neue Federphysik und keine Spielintegration.

## Kontrolle und Vorschau

`index.html` spielt echte Unity-Renderframes mit Pause, Einzelbild, Zeitlupe, Knochenanzeige und direktem Vergleich zum unbewegten Ausgangsbild. Mobilansicht behält das vollständige Bild und legt die Bedienelemente darunter. Es werden nur einige benachbarte Atlas-Seiten gleichzeitig dekodiert.

```powershell
python -m http.server 5238 --bind 127.0.0.1 --directory artifacts/idle-bastion/mara-counter-pose-v1/rig-v1
```

Die zusätzlich angeforderte `Mara-Grundpose-Rigprobe.gif` zeigt die erste Grundpose mit festem Tavernenhintergrund: 543 × 724 Pixel, 75 GIF-Frames / 5 Sekunden. Die interaktive Vorschau verwendet 30 fps. Falls die Chat-Einbettung nicht erscheint: `http://127.0.0.1:5238/Mara-Grundpose-Rigprobe.gif` direkt öffnen.

## Prüfung

- Endstand: 459 native Prüfzustände, 3.098.246 Dreiecksprüfungen, keine Faltungen. Größte Auflagepunktabweichung 0,000906 Quellpixel. Alle drei Loops schließen pixelidentisch; sechs Browserfälle bei 1280/390 px bestanden.
- Jede Pose nacheinander nativ aus Unity aufgebaut und gerendert. Pro Clip zusätzlich ein Endframe zur Loopprüfung.
- `base-audit.json`, `lean-audit.json`, `elbow-audit.json`: gemeinsame Dreiecksindizes, positive Flächen über die komplette Bewegung und gemessene Auflagepunkte. Die Geometrieprüfung enthält auch sehr schwach transparente Randpixel der Originale; die zusätzlichen `visible*`-Werte berücksichtigen nur Dreiecke mit Alpha über 16 in ihrer Boundingbox.
- `pack.py` prüft unveränderte Originale/Kopien per SHA-256, bytegleiche gerenderte Loop-Endpunkte und verlustfreies Alpha/RGBA der WebP-Verpackung. Native Renderframes liegen unter dem lokal erhaltenen, ignorierten `exports/`; die Atlas-Vorschau unter `preview/`.
- `check-preview.mjs` prüft echte Wiedergabe, Pause, Einzelbild, Ausgangsbild/Knochen und horizontalen Platz auf Desktop und bei 390 px. Ergebnisse in `browser-check.json`, Ansichten `qa-*.png`.
- Unity meldete beim Editorstart einen Fehler im eigenen Suchindex (`UnityEditor.Search.SearchDatabase`). Die Szene-/SpriteSkin-Ausführung und die Exporte liefen danach vollständig durch. Keine entsprechende Ausnahme im Rig- oder Exportcode.

Die technische Prüfung ersetzt nicht die Nutzerbewertung der Bewegung. Verbindlicher Aufgaben-/Abnahmestand steht ausschließlich in der zentralen [Roadmap](../../../../experiments/idle-bastion/ROADMAP.md).

## Reproduktion

`prepare.py` kopiert Quellen unverändert und richtet das separate Projekt ein. Pro Pose Unity im Batchmodus mit `-executeMethod BuildCounterRig.Run -counter-pose base|lean|elbow -counter-export` aufrufen; anschließend `python pack.py base|lean|elbow`. Der Build verweigert das Überschreiben vorhandener generierter Rigs ohne `-counter-rebuild`. Dieser Schalter betrifft ausschließlich den ausdrücklich gewählten Pose-Unterordner dieses neuen Experiments.

`BuildCounterRig.ExportExisting` exportiert eine vorhandene gespeicherte Szene erneut. Die ursprünglichen Standbilder, früheren Unity-Projekte und aktuellen Spielatlanten werden von diesen Werkzeugen nicht verändert.

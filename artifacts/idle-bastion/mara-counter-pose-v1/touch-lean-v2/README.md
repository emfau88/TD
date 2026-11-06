# Mara: korrigierte Berührungsreaktion V2

Der Nutzer beanstandete gequetschte Arme und einen gestauchten Bauch in V1. Die frühere Prüfung auf umgeklappte Dreiecke war dafür unzureichend: Auch positive Dreiecksflächen können stark gestaucht oder gedehnt sein. V1 bleibt unverändert als Vergleich erhalten.

## Korrektur

- Der Oberkörper dreht sich um 5,5 Grad um den Hüftanker. Die frühere unabhängige Verschiebung der Brust nach unten entfällt. Bauch und Oberkörper folgen einer gemeinsamen Drehung.
- Die Hände dürfen auf dem Tresen gleiten. Die vordere Hand folgt weitgehend der aus der Hüftdrehung abgeleiteten Bahn (am Höhepunkt etwa 3,15 Pixel nach rechts und 12,60 nach unten); die hintere Hand bewegt sich 36 Pixel nach rechts und 22 nach unten. Die Maße beziehen sich auf das native Bild mit 1086 × 1448 Pixeln.
- Die inverse Kinematik verwendet unveränderte Ober- und Unterarmlängen. Die Handorientierungen bleiben flach; Handauflagen werden gegen ihre vorgesehenen bewegten Zielpositionen geprüft.
- Kopf, Zopf und Umhang erhalten kleine Gegen- beziehungsweise verzögerte Drehungen um denselben Bezugspunkt. Benachbarte Flächen werden nicht mehr durch gegensätzliche große Verschiebungen auseinandergezogen.

Die endgültige Fassung verwendet dieselbe Zeichnung und dieselben Meshgewichte wie V1. Der erfolgreiche Eingriff ist die überarbeitete Bewegung. Eine zusätzlich untersuchte stärkere lokale Gewichtssperre am Bauch verursachte an der Ärmelgrenze neue Stauchung und wurde nicht übernommen. Keine neuen Grafiken oder retuschierten Texturen, keine Spielintegration, kein Upload.

## Bearbeitbare Dateien

Im vorhandenen separaten Projekt `../rig-v1/unity/`:

- `Assets/Editor/BuildCounterTouchV2.cs`
- `Assets/CounterTouchV2Motion.cs`
- `Assets/CounterTouchV2Export.cs`
- `Assets/Reactions/touch-lean-v2/`: Szene, Prefab, `TouchLean.anim`, Animator und eigene Kopie der Quelldatei.

Der 4,2-Sekunden-Clip enthält normale Unity-Knochenkurven. Reproduktion: Unity 6000.4.0f1 mit `-batchmode -executeMethod BuildCounterTouchV2.Run -counter-export -touch-rebuild` starten, danach `python pack.py`. Der Rebuild ersetzt ausschließlich den eigenen neuen V2-Ordner. Alle früheren Rigs bleiben erhalten.

## Tatsächliche Prüfung

- 127 native Zustände, 762.762 Dreiecksprüfungen, keine Faltungen. Flächenverhältnisse über das gesamte sichtbare Mesh 0,736–1,351 statt 0,091–2,054 bei V1. Größte Abweichung von der vorgegebenen Handführung 0,000553 Quellpixel.
- `check-shape.py` prüft die tatsächlichen lokalen Oberflächenverformungen anhand der nativen Skinning-Matrizen. In den definierten Bauch-/Arm-Ausschnitten sinkt die mittlere lineare Verformung gegenüber V1 um rund 78–96 %. Beispiel Bauchausschnitt: schlechtester lokaler linearer Maßstab 0,873 statt 0,321. Regionen und vollständige Werte sind in `shape-comparison.json` reproduzierbar; dies sind keine pauschalen Aussagen über jede Körperfläche oder eine Nutzerabnahme.
- Anfang und Ende pixelidentisch, Originalzeichnungen unverändert, WebP-Atlanten verlustfrei geprüft (`verification.json`).
- Desktop 1280 px / Mobilformat 390 px: Antippen, Pause, Zeitregler, Einzelbilder, synchrones Umschalten zwischen V1/V2 und exakte Rückkehr zur Ruhepose bestanden. Keine JavaScript-Fehler, kein horizontaler Überlauf. Ansichten `qa-1280.png` und `qa-390.png`.
- GIF: 543 × 724, 84 Bilder bei 20 fps, 4,2 Sekunden; `gif-verification.json`. Native interaktive Vorschau mit 30 fps.

Unity meldet weiterhin beim Start den bekannten Fehler seines Suchindexes. Der native Export wurde vollständig abgeschlossen. Status und ausstehende visuelle Nutzerbewertung stehen ausschließlich in der zentralen Roadmap.

## Lokale Vorschau

Server über dem gemeinsamen Ordner `mara-counter-pose-v1` starten:

`python -m http.server 5240 --bind 127.0.0.1 --directory <mara-counter-pose-v1>`

Dann `http://127.0.0.1:5240/touch-lean-v2/` öffnen. **Vorher zum Vergleich zeigen** wechselt bei identischem Zeitpunkt zur beanstandeten Fassung. Die neue Reaktion bleibt entsprechend der Nutzerentscheidung lokal.

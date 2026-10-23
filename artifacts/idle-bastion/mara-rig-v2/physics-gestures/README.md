# Drei zusätzliche Mara-Gesten mit Federphysik

Separate Animationsprobe vom 23.10.2026. Bestehende Bilder, Rig-Versionen, Clips und Vorschauen bleiben erhalten. Keine Einbindung ins Hauptspiel.

| Clip | Dauer | Bewegung |
| --- | --- | --- |
| LeanForwardPhysics | 5,0 s | Leichte Vorbeuge mit gemeinsam abgesenktem Oberkörper, Hals und Kopf; Hände folgen Richtung Oberschenkel. |
| HandOnHipPhysics | 5,0 s | Gewichtsverlagerung, Ellbogen nach außen, Hand an Gürtel/Hüfte, gehaltene Pose und Rückkehr. |
| GigglePhysics | 5,4 s | Drei unterschiedlich starke Kicherimpulse von Oberkörper und Schultern; Lächeln, zweimaliges Blinzeln und nachlaufende Haare/Brustbewegung. |

## Bearbeitbare Quellen

- Szene: `../unity/Assets/PhysicsGestures/PhysicsGestures.unity`.
- Sechs neue Clips im selben Ordner: je eine `Body.anim` als Bewegungsquelle und eine `Physics.anim` mit gebackener Federbewegung.
- Builder: `../unity/Assets/Editor/BuildPhysicsGestures.cs`.
- Export: `../unity/Assets/PhysicsGesturesExport.cs`.
- Meshprüfung: `../unity/Assets/Editor/InspectPhysicsGestures.cs`.
- Halsanschluss: `../unity/Assets/Editor/RefineGestureNeck.cs` und `../unity/Assets/PhysicsGestures/HeadNeck.png`. Unveränderte Bildpixel in einer separaten Assetkopie; zusätzliche Meshreihen und gleitende Gewichte halten den unteren Halsansatz am Brustkorb. Dadurch rutscht dessen gezeichnete Unterkante beim Vorbeugen nicht unter dem Schal hervor. Die alte Kopfdatei und die alten Rigs bleiben unverändert.
- Verwendetes Rig und Solver bleiben aus der bestätigten Probe erhalten: `../unity/Assets/ChestPhysics/MaraPhysicsTuned.prefab` und `../unity/Assets/MaraChestSpring.cs`.

Die Brustbewegung entsteht aus der Beschleunigung der zwei Anker am Brustkorb. Der vorhandene Solver wird mit 240 Hz integriert; Frequenz 2,15 Hz, Dämpfung 0,24, Trägheit 1,15, Grenze 10 Quellpixel. Die drei Gesten erreichen diese Grenze nicht. Nach einer ausreichend langen Auslaufphase wird nur die geringe Restbewegung in den letzten 0,45 Sekunden zur gemeinsamen Ruhepose zurückgeführt. `spring-validation.json` enthält die gemessenen Werte.

Für die Live-Komponente die jeweilige Body-Animation verwenden. Bei den Physics-Clips die Live-Simulation ausschalten, damit die Bewegung nicht doppelt angewendet wird. Hier geprüft ist der gebackene Export; kein zusätzlicher Echtzeit-Playtest.

## Export und Prüfung

Transparente Einzelbilder in `../unity/Export/PhysicsGestures/`, 768 × 1024 Pixel bei 30 Bildern/s. `pack.py` erstellt native verlustfreie WebP-Atlanten und vergleicht deren RGBA-Pixel nach dem Zurücklesen. Die HTML-Seite lädt nur die ausgewählte Geste und braucht keine Unity-Laufzeit. GIFs sind verkleinerte Ansichtsdateien mit 20 Bildern/s und 256 Farben; sie ersetzen nicht die verlustfreien Quellen.

`mesh-audit.json` dokumentiert 465 Posen und 1.623.780 geprüfte Dreiecke ohne Faltungen. `validation.json` enthält den pixelgenauen Ruhevergleich, die Prüfung auf transparente Lücken im inneren Torso, Exportgrößen und den Hashvergleich sämtlicher zuvor vorhandener Unity-Quelldateien. Diese Prüfungen ersetzen nicht die visuelle Nutzerabnahme.

## Grenzen

Die Vorbeuge ist eine moderate Bewegung aus der vorhandenen frontalen 2D-Zeichnung. Eine tiefe perspektivische Verbeugung mit neuer Sicht auf Scheitel, Schultern oder Rücken würde zusätzliche Zeichnungen benötigen. Die Hand behält ihre vorhandene Fingerzeichnung. Das Kichern ist stumm; es wurde kein Audioclip ergänzt.

# Ilyra · Basis-Idle 1

Separate sechs Sekunden lange Idle auf der vom Nutzer akzeptierten Schultervariante. Keine Spielintegration, kein Commit oder Push. Der vorherige Entwurf und seine Gelenkprobe bleiben erhalten.

Vorschau: http://127.0.0.1:5221/idle-v1/preview/index.html

## Bewegung und Quellen

- Einatmen bis etwa 2,05 s, langsameres Ausatmen bis 5,1 s; kurze Ruhephase. Geringe Oberkörper-/Kopfneigung, kleine Armreaktionen und zeitversetzte Haare/Stoffe. Keine Skalierung der ganzen Figur.
- Die Brust folgt dem Brustkorb und erhält einen kleinen zusätzlichen Atemhub. Zwei neue, weich gewichtete Knochen deformieren die zusammenhängende Torsozeichnung; Mittelnaht, Hals und Schulteranschlüsse bleiben außerhalb des lokalen Einflusses. Keine separat ausgeschnittenen Brustflächen.
- Beschleunigungsabhängige gedämpfte Feder, 240 Hz, Frequenz 1,65 Hz, Dämpfung 0,58. Drei Vorlaufzyklen vor dem Backen sichern den periodischen Zustand. Maximaler zusätzlicher Federweg bei dieser sehr ruhigen Idle nur 0,050/0,055 Pixel; der sichtbare Hub stammt überwiegend aus der Atmung (3,6 Pixel Brustkorb plus lokal gewichteter Zusatzhub bis 1,15 Pixel). Größere Gesten wurden nicht getestet und werden hier nicht als fertig behauptet.
- Ein Blinzeln bei 2,8–3,03 s: offen → halb → geschlossen → halb → offen. Zwei gezielte neue Zeichnungen mit dem eingebauten Imagegen-Werkzeug. Rohquellen, registrierte Varianten und vollständige Prompts in `art/`; `prepare_idle.py` übernimmt nur die Augenregionen, außerhalb bleiben die Originalpixel exakt erhalten. Keine Überblendung der Gesichter.

## Editierbares Unity-Projekt

`unity/Assets/IlyraIdle.unity`: Szene mit sechssekündigem Clip. `IlyraIdle.prefab` nutzt den gebackenen Clip; `IlyraIdleLive.prefab` den Körperclip plus wiederverwendbare `IlyraSecondaryMotion`-Komponente. Nicht beide Physikwege gleichzeitig aktivieren. 28 Knochen, 13 zusammenhängend registrierte Ausgangsebenen; die zwei zusätzlichen Kopf-Sprites sind austauschbare Lidvarianten. Original-PSB bleibt enthalten, die erweiterten Knochen/Weights stehen in den Unity-Importmetadaten. Meshes, Gewichte und Kurven sind editierbar. Die beiden zusätzlichen Lidzeichnungen liegen als PNG-Sprites vor, noch nicht als eigene PSB-Ebenen.

`Assets/Clips/IlyraIdleBody.anim`: Körperbewegung und Blinzeln ohne Federzusatz. `IlyraIdle.anim`: gebackene Fassung für den Export. `BuildIlyraIdle.cs` hält Bewegungsparameter und Bake-Verfahren. Der Ausgangsimporter wurde nur in dieser unabhängigen Projektkopie erweitert; ursprünglicher und Schulter-Rig-Stand bleiben unberührt.

## Export und Prüfung

- Unity 6000.4.0f1, 2D Animation/SpriteSkin. 181 PNG-Zustände bei 30 Hz einschließlich doppeltem Prüf-Endpunkt; Browser spielt 180 Bilder bei 30 fps. 768 × 1280, transparent.
- 1.730.722 Dreiecksprüfungen, keine umgeklappten Dreiecke; kleinstes Flächenverhältnis 0,9430 am Torso. Start/Ende pixelidentisch, Federzustände nach Vorlauf ebenfalls identisch. Keine neuen sichtbaren Risse in den geprüften Zwischen-/Extrembildern; konservative zusätzliche Alpha-Innenprüfung ohne vollständig transparente Löcher. Vier teiltransparente Pixel am bewegten rechten Handrand liegen in der statischen Prüfmaske; dies ist keine Behauptung einer umfassenden Anatomieprüfung.
- 23 verlustfreie WebP-Atlanten: Alpha und sichtbares RGB exakt gleich den Unity-PNGs. RGB unter vollständiger Transparenz darf libwebp verändern. Gesamt etwa 72,4 MiB für die hochauflösende Prüfversion; noch kein endgültiges Laufzeitbudget fürs Spiel. Vorschau lädt zunächst nur das Ruhebild, danach bei Wiedergabe den aktuellen und nächsten Atlas. Keine Unity-Laufzeit im Browser.
- GIF: `preview/Ilyra-Idle.gif`, 384 × 640, 20 fps, ca. 9,9 MiB. Versandformat mit GIF-Palettenbeschränkung; die verlustfreie Browseransicht ist die Qualitätsreferenz.
- Desktop und 390 × 844: Abspielen/Pause, Positionsregler, Blinkposition 87, Atmung 61, Zoom, Hintergründe und Übergang 179 → 0 geprüft. Darstellung und Bedienelemente funktionieren; Browserkonsole ohne Warnungen/Fehler nach der Korrektur. Anfangs in der Vorschau gefundene negative erste Zeitposition und kollabierender Zoom behoben.
- Unity-Export Exit 0, `ILYRA_IDLE_EXPORT_DONE samples=181 folds=0`. Im Editorlog weiterhin die bekannte `ArgumentOutOfRangeException` aus UnityEditor.Search; kein fehlerfreies Editorlog behauptet.
- Vorgängerdateien per SHA256 unverändert. Nachweise: `preview/checks.json`, `validation.json`, `spring-validation.json`, `interior-alpha-check.json`, `poses.jpg`, Browseraufnahmen.

Diese Vorlage deckt nur die erste ruhige Idle ab. Reaktionen, zusätzliche Handzeichnungen, weitere Idle-Varianten und Integration bleiben spätere Arbeitspakete. Visuelle Freigabe dieser Bewegung steht aus.

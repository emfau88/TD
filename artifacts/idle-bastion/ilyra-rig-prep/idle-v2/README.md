# Ilyra – zweite Idle: ruhiger Gewichtswechsel

23.10.2026. Nutzer bestätigt den Vorschlag einer zweiten ruhigen Idle mit „Ok go“. Eigene Variante auf dem zuletzt korrigierten Rig aus `touch-v1`: freigegebene Armproportionen, korrigierte Fingergewichte. Bisherige Dateien unverändert; keine Spielintegration, kein Commit/Push. Visuelle Abnahme offen.

## Bewegung und Einspielung

4,8 Sekunden: kleine Gewichtsverlagerung mit ca. 4,5 Pixel seitlichem Hüftversatz, gegenläufigem Brustkorb und leicht unterschiedlich folgenden Oberschenkeln. Kleine gehaltene Kopfneigung (max. 2,8 Grad), ein ruhiger Lidschlag, dezente Hand-/Armbewegung, nachlaufende Haare und Stoffe. Gesicht und Blickrichtung bleiben aus der vorhandenen Zeichnung; keine neue Augen- oder Mundvariante.

Vorhandene Brustfeder mit 240 Hz gebacken. Wegen der langsamen Bewegung beträgt der zusätzliche Federweg nur etwa 0,043/0,046 Pixel; die sichtbare Brustbewegung kommt überwiegend aus dem Brustkorb. Kein künstlicher zusätzlicher Wackelimpuls.

HTML-Vorschau spielt die neue Variante zuerst einmal zum Ansehen, danach drei normale sechssekündige Idle-Loops und erneut eine Variante. Checkbox deaktiviert die automatische Einspielung. Wechsel erfolgen an den gemeinsamen Ruhe-Endpunkten. Die Einzelansicht und das GIF dienen der Abnahme; nur das GIF wiederholt die Variante ständig. Noch kein Zufallsplan oder Nachladesystem im Hauptspiel integriert.

## Dateien

- Vorschau: `http://127.0.0.1:5221/idle-v2/preview/index.html`
- PNG-Frames: `preview/frames/`; verlustfreie WebP-Atlanten: `preview/variant-*.webp`.
- GIF: `preview/Ilyra-Idle2.gif`; Poseübersicht: `preview/poses.jpg`.
- Unity-Projekt: `../head-reaction-v1/unity/`, neue Szene `Assets/IlyraIdleVariant.unity`, Prefab `Assets/IlyraIdleVariant.prefab`.
- Editierbare Körper-/Federclips `Assets/Clips/IlyraIdleVariantBody.anim` und `IlyraIdleVariant.anim`; Builder `Assets/Editor/BuildIlyraIdleVariant.cs`.
- Animator-Trigger `IdleVariant` erlaubt den Start am Ende der Basis-Idle und anschließende Rückkehr. Die Häufigkeit wird in dieser Vorschau separat gesteuert.

Die Basis-Idle wird aus `touch-v1/preview/` wiederverwendet; kein weiterer Export und keine Kopie ihrer Atlanten. Bilder werden bedarfsweise geladen. Nach dem manuellen Start aus einer beliebigen Bewegung springt die Prüfseite zur gemeinsamen Ruhepose; allgemeines Überblenden aus jeder Idle-Phase bleibt Integrationsarbeit.

## Prüfung

`preview/validation.json`: 146 exportierte Zustände, 1.396.052 Dreiecksprüfungen, keine Faltungen; minimale relative Dreiecksfläche ca. 0,476. Die Vorschau spielt 144 Bilder bei 30 fps, weitere Exportzustände prüfen den Ruhe-Endpunkt. `preview/spring-validation.json` dokumentiert Federparameter und Restschwingung. `preview/checks.json` dokumentiert Loop, Ruheanschluss, verlustfreie Atlaspackung und SHA-256-Erhalt der vorherigen Assets/Vorschau. Unity-Export Exit 0; bekannte Editor-Search-/Paketmeldungen bleiben im Log sichtbar. Keine neue Grafik und keine Änderung der Körperproportionen.

Ergebnisse: Loop-Endpunkte exakt; sichtbares RGBA aller neuen Atlanten verlustfrei; erfasste vorherige Assets/Vorschau unverändert. Übergang zur Basis-Idle maximal 1/255 Alpha- und 2,27/255 zusammengesetzte Farbabweichung durch Unity-Rundung. Neue Atlanten zusammen 59.412.284 Byte; die vorhandene Basis-Idle wird nur verlinkt. PNG-Zwischenposen bei 0, 1,6, 2,5 und 3,8 Sekunden als Übersicht visuell geprüft. `git diff --check` bestanden.

Das tatsächliche eingebettete Abspielskript wurde isoliert in Node mit virtueller Uhr und ersetzten Zeichen-/Ladefunktionen geprüft: Variante bei 0 s, Basis-Idle ab 4,8 s, weitere Basis-Loops ab 10,8 und 16,8 s, nächste Variante ab 22,8 s, Rückkehr ab 27,6 s. Abgewählte automatische Einspielung bleibt bei Basis-Idle. Dies ist ein Steuerungstest, kein visueller Browsertest. HTML und Manifest über den lokalen Server mit HTTP 200 erreichbar.

Browser-/Hochkantabnahme offen: Das Öffnen der neuen Seite über die Browsersteuerung scheiterte erneut mit einem Webview-Anschluss-Timeout. Kein erfolgreicher Browser- oder Screenshot-Test behauptet. GIF und lokale Vorschau zur Nutzerabnahme bereitgestellt.

# Ilyra – erste Berührungsreaktion

23.10.2026. Nutzer gibt die gezielte Unterarm-/Handkorrektur frei und bestätigt als nächsten Clip die erste Berührungsreaktion. Separates Experiment, bisherige Varianten erhalten, keine Spielintegration und kein Commit/Push. Visuelle Abnahme des neuen Clips offen.

## Bewegung

3,2 Sekunden: kurzes Aufmerken mit kleinem Schulter-/Brustkorbhub und Blinzeln; die Hand auf der linken Bildseite bewegt sich zur Hüfte, ohne bereits eine Hand-in-die-Hüfte-Pose einzunehmen. Kopf und Oberkörper begleiten die Geste, Haare und Stoff folgen verzögert. Ruhige Rückkehr in die gemeinsame Ausgangspose. Bestehendes Gesicht/Lidzeichnungen, keine neue Mimikzeichnung und keine Fingerartikulation.

Die beschleunigungsabhängige Brustfeder verwendet denselben Solver wie zuvor, mit 240 Hz gebacken. Zusätzlicher maximaler Versatz ca. 1,19/0,73 Bildpixel, zusätzlich zur Brustkorbbewegung. Parameter und Restschwingung stehen in `preview/spring-validation.json`.

## Korrektur am Rig

Die stärkere Armbewegung deckte einen Fehler in den ursprünglichen Gewichten auf: Eine schräge Grenze zwischen Arm und Rumpf verlief durch innere Fingerbereiche. Diese blieben teilweise am Rumpf hängen. Der erste Export zeigte 1748 invertierte Dreiecke und sichtbare Fingerverzerrung; dieser Versuch ist nicht das Ergebnis.

Eigene Sprite-Kopie `TorsoTouchWeights.png`, Bitmap identisch mit dem vorherigen Torso. Nur importierte Gewichte angepasst: Finger folgen vollständig ihrem Handknochen, Übergang zum Unterarm und zum Rumpf kontinuierlich über eine ausreichend breite Zone. Zwischenversuche mit zu enger Gewichtsgrenze wurden ebenfalls verworfen. Endgültiger Export ohne invertierte Dreiecke. Das ist eine Korrektur an der Ursache, keine Bildüberblendung oder nachträgliche Retusche.

Alle freigegebenen Knochenpositionen und Längenskalierungen bleiben erhalten. Da zuvor gemischt gebundene Finger jetzt vollständig der bereits verkürzten Hand folgen, ist die Handkontur in der Ruhepose geringfügig kompakter. Daher wurde die zugehörige Idle mit denselben Gewichten erneut exportiert; die bisherige freigegebene Idle bleibt separat erhalten.

## Quellen und Vorschau

Unity-Projekt: `../head-reaction-v1/unity/`. Neue Szene `Assets/IlyraTouchReaction.unity`, Prefab `Assets/IlyraTouchReaction.prefab`, Clips `Assets/Clips/IlyraTouchBody.anim` und `IlyraTouchReaction.anim`. Builder `Assets/Editor/BuildIlyraTouch.cs`; Gewichtsänderung `Assets/Editor/IlyraTouchWeights.cs`. Die vorherigen Assets werden nicht überschrieben.

Animator-Trigger `TouchReaction` beginnt am Ende des Idle-Loops und kehrt nach dem Clip zurück. Die eigenständige HTML-Vorschau startet auf Klick aus der Ruhepose; ein beliebiger Übergang aus jeder laufenden Idle-Phase bleibt spätere Integrationsarbeit. Keine Berührungszonen, Zuneigungsregeln oder Spielstände verändert.

`http://127.0.0.1:5221/touch-v1/preview/index.html`: Idle, Reaktion, Pause, Zeitregler, halbes Tempo und Zoom. Transparente PNGs unter `preview/frames/`, passende Idle unter `preview/idle/frames/`; verlustfreie WebP-Atlanten und `preview/Ilyra-Beruehrung.gif`. Bedarfsweises Nachladen, keine Komplettladung aller Bilder beim Start.

## Nachweise

`preview/validation.json` und `preview/idle/validation.json`: alle exportierten Zwischenzustände auf Faltungen geprüft. `preview/checks.json`: Loop-Endpunkte, verlustfreie Atlasprüfung, Ruheübergang und SHA-256-Erhalt früherer Assets/Vorschau. `preview/poses.jpg` zeigt vier Bewegungszustände. Die Unity-Logs enthalten weiterhin die bekannten Editor-Search-/Paket-Testdateimeldungen; die endgültigen Exportprozesse endeten mit Code 0. Keine Behauptung vollständig fehlerfreier Editorlogs.

Endergebnis: 98 Reaktions- und 182 Idle-Zustände; 937.076 beziehungsweise 1.740.284 Dreiecksprüfungen ohne Faltungen. Loop-Endpunkte exakt, sichtbares RGBA aller Atlanten verlustfrei, vorherige erfasste Dateien unverändert. Ruheübergang mit maximal 1/255 Alpha- und 2,27/255 zusammengesetzter Farbabweichung durch Unity-Rundung. Alle Atlanten zusammen 113.616.490 Byte; hochauflösende Prüfdateien, kein fertiges Produktionsbudget. Ausgewählte PNG-Zwischenzustände und die vierteilige Poseübersicht visuell geprüft. `git diff --check` bestanden.

Die abschließende Browser-/Hochkantprüfung der neuen Seite konnte nicht durchgeführt werden: Zwei Versuche, einen Tab zu öffnen, liefen beim Webview-Anschluss ins Timeout; auch das Binden des bestehenden Tabs 18 scheiterte an `Emulation.setFocusEmulationEnabled`. Keine alternative Browserautomation eingesetzt und kein erfolgreicher UI-Test behauptet. Die lokale Vorschau und das GIF liegen fertig vor; Browser-Abnahme bleibt offen.

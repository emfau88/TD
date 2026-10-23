# Ilyra – einladende offene Geste

Separate Alternative zu den vorerst geparkten Hüftproben, 23.10.2026. Dauer 4,2 s. Ilyra führt die vorhandene offene Hand vor den Körper, neigt leicht den Kopf, blinzelt und kehrt zur Ruhepose zurück. Oberkörper, Haare, Stoff und gebackene Federbewegung folgen. Kein neuer Hand-Sprite und kein Wechsel der Handzeichnung.

## Quellen

- Unity-Projekt: `../hip-v1/unity/` (bestehende Projektkopie; alte Dateien unverändert).
- Neuer Builder: `Assets/Editor/BuildIlyraGreeting.cs`.
- Neue Szene/Prefab: `Assets/IlyraGreeting.unity` / `.prefab`.
- Neue Clips: `Assets/Clips/IlyraGreetingBody.anim`, `IlyraGreeting.anim`; eigener Controller.
- Bestehender `TorsoHip0` mit korrigierter Armgeometrie und freigegebenen Proportionen. Hände sind die ursprünglichen durchgehenden Hände, keine HipHand-Elemente.
- Transparente PNGs: `preview/frames/`; verlustfreie WebP-Atlanten, HTML und GIF unter `preview/`.
- Passende Idle wird aus `../hip-v1/preview/` referenziert; Ordner bei Weitergabe zusammen behalten.

## Prüfung

128 exportierte Zustände, 1.250.560 Dreiecksprüfungen, keine Faltungen; kleinster Flächenquotient 0,1501. Start-/Endbild pixelidentisch, Ruheanschluss zur Idle maximal 1/255 Alpha und 2,27/255 im Composite. Alle Atlanten nach Dekodierung auf sichtbares RGBA verlustfrei geprüft. 1.069 vorherige Quelldateien/Exporte per SHA-256 unverändert. Einzelbilder bei 0,8 / 1,5 / 3,2 Sekunden visuell auf Handgelenk, Ellbogen, Schultern und Layer geprüft.

Abspielskript separat geprüft: Start der Geste, Rückkehr nach 4,2 s zur Idle, Scrubbing, Ruhepose und maximal vier Atlasbilder im Cache. Lokaler HTTP-Aufruf liefert 200. Desktop-/Hochkant-Browserprüfung diesmal offen: Die App-Browsersteuerung konnte keinen Tab verbinden. Keine abgeschlossene visuelle Browserprüfung behauptet.

## Grenzen

Bewusst moderate frontale Armbewegung; kein hohes Winken und keine neue Handflächenperspektive. GIF ist eine verkleinerte 20-fps-Vorschau auf hellem Hintergrund; HTML nutzt transparente 30-fps-Exporte. Neue Atlanten zusammen ca. 70 MB: lokale Qualitätsprobe, noch nicht für Spielauslieferung zugeschnitten. Manuelles Auslösen während der Idle startet derzeit an der gemeinsamen Ruhepose; eine spätere Spielintegration muss den Einstieg koordinieren.

Visuelle Nutzerfreigabe offen. Hüftproben und alle älteren Animationen erhalten. Kein Commit, Push oder Eingriff ins Hauptspiel.

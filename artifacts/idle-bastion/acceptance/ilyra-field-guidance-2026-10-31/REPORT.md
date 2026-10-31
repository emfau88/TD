# Ilyra-Kartenstimme und Ausbauhinweise · 31.10.2026

Ausgangspunkt: Main `47b4c360223fb52fa9ddfe26ac07a54b50e67e1f`.
Umfang: die drei vom Nutzer gemeldeten Punkte prüfen, nur nachgewiesene Ursachen ändern.

| Befund | Ergebnis |
| --- | --- |
| Ilyras Antworten auf der Karte zu leise | Quellenpegel korrekt normalisiert, aber beide Kartenstimmen zusätzlich mit 0,5 abgesenkt. Ilyra erhielt bei Standardregler nur −30,66 LUFS. Ausschließlich ihr Kartenfaktor steigt auf 0,8: +4,08 dB / −26,58 LUFS. Mara, Taverne und Audiodateien unverändert. |
| Wiederholte Upgrade-Ziele bei starken Türmen und neuen niedrigen Exemplaren | Bestätigt: das nächste Ziel wählte unbegrenzt das billigste Upgrade; ein neuer Zweitturm verdrängte damit den vorhandenen Ausbau. Nach einem Ausbau über die erste Werkstattgrenze (Level 7) erscheint stattdessen der neutrale Fortschritts-/Farmhinweis. Bis dahin berücksichtigt die Werkstatt-II-Empfehlung den stärksten Turm pro Typ. Frühere Tutorial-Upgrades und echte Bossziele bleiben erhalten. |
| Ilyras Speer-Tanz läuft nie | Bestätigt: bisher waren nur Standbild, Laufen und Salve integriert. Nach ausdrücklicher Nutzerbestätigung am 31.10.2026 nun die vorhandene 33-Frame-Speer-Tanzfassung V3 aus `codex/map-idle-trio-preview` (Ursprung `ed6a4e3`) pixelgleich eingebunden. Nach acht Sekunden Stillstand, Beginn höchstens alle 24 Sekunden; keine Änderung der gespeicherten Position/Richtung. Pause friert ein, Bewegung/Salve unterbrechen sofort. Einführung und reduzierte Bewegung behalten die Standpose. |

## Prüfung

- 19/19 erste gezielte Tests: Kartenstimme, Quellen-/Peakprüfung, Zielauswahl, Balance und B12 (einschließlich historischer Migrationen, Boss-/Reload-/Offlinefällen).
- 26/26 Nachbartests: Audio, Heldensteuerung, Feature-Probes, Fortschritt und Tutorial.
- Finale 8/8 Ziel-/Balancetests einschließlich zusätzlicher Regression: frühes Level-3-Limit darf ein gültiges Upgrade des zweiten Turms nicht verstecken.
- Tanz: 10/10 Tests für Renderer/Zeichenreihenfolge/Heldensteuerung; danach 42/42 für Ilyra, historische Spielstände und Speicherung.
- Abschließend gemeinsamer Lauf mit **95/95 unterschiedlichen gezielten Tests bestanden**, keine fehlgeschlagen oder übersprungen; [Protokoll](final-tests.log). Keine vollständige Testsuite behauptet.
- Neue UI-Regressionen: alle fünf Turmtypen mit Level 15/1/2, DE/EN, vor/nach zweitem Boss; Level 6→7, echte Bossziele und unveränderte Snapshots. Diese Struktur-Fixtures sind ausdrücklich keine historischen Save-Beispiele.
- Echter Voice-Player mit Audio-Stubs: Ilyras Verstärkung bleibt bei Mix-Aktualisierung erhalten; Mara bleibt 0,5; gemeinsamer 7-Sekunden-Abstand und Stummschaltung bleiben wirksam.
- Sieben Ilyra-Dateien frisch mit FFmpeg gemessen und Quellenhashes gegen die bestehende Kalibrierung abgeglichen. Einzelclip-True-Peak bei maximalem Stimmenregler höchstens −9,06 dBTP. [Messwerte](audio-audit.json). Keine Messung der gesamten summierten Kampfmischung und keine subjektive Hörabnahme.
- Finaler Produktionsbuild einschließlich TypeScript erfolgreich ([Protokoll](build.log)). Ein zwischenzeitlicher TypeScript-Fehler in der neuen Test-Fixture (`undefined` statt des bestehenden `null`-Zustands) wurde korrigiert; keine Änderung am Laufzeit-Saveformat.
- Echter Browser: getrennte `feature-check.html?scenario=heroes`-Partie aus verdientem Welle-40-Stand; Kampf Welle 41→42, Ilyra über Porträt ausgewählt, neutraler Zielhinweis, Chronikzugang, Pause und Reload. Gold 3.391 und später 3.659, Kern 20/20 und Welle 42 bei pausiertem Reload erhalten; korrekt 0 Offline-Gold. Desktop 1280×720 und Smartphone 390×844; keine Browserwarnungen/-fehler.
- Speer-Tanz auf beiden Größen sichtbar geprüft. Rückkehr zur bisherigen Standrichtung und unveränderte Fußposition bestätigt. In längerer Pause blieb der Figurenausschnitt pixelgleich. Abbruch bei Bewegung/Salve und reduzierte Bewegung automatisiert geprüft; kein neuer vollständiger Canvas-Klick-Durchlauf behauptet. Endgültige Hör-/Gestaltungsabnahme liegt beim Nutzer.

## Screenshots

[Desktop](desktop.png) · [390 px nach Reload](mobile-reload.png)

Tanz: [davor](ilyra-idle-before-390.png) · [währenddessen](ilyra-idle-dance-390.png) · [Pausenvergleich](ilyra-idle-paused-390.png) · [Rückkehr](ilyra-idle-return-390.png) · [Desktop](ilyra-idle-dance-desktop.png)

## Unverändert

Kampfwerte, Upgradekosten, Fähigkeiten, Offline-Regeln, Saveformat, Kartenlayout und bisherige Lauf-/Zauberanimationen. Ausschließlich die bestätigte vorhandene Idle ergänzt; neuer Atlas 76.635 Bytes / 640 KiB rohe Pixel. Kein neuer Kongregate-Export. Der vorhandene Export vom Kamera-Fix enthält diese spätere Korrektur noch nicht.

Geändert: `src/audio-cues.ts`, `src/hero-command-voice.ts`, `src/progress-ui.ts`, `src/locales/en.ts`, `src/art.ts`, `src/ilyra-view.ts`; neue `src/ilyra-idle.ts` und getrennte `assets/ilyra/idle-spear/`-Packung. Drei neue gezielte Testdateien, zwei bestehende Tests an die beabsichtigte UI-Erwartung bzw. den echten Laufzeitpegel angepasst. Quellenkalibrierung/Headroom-Grenze nicht abgeschwächt; keine Tests entfernt oder übersprungen. Audio-/Asset-Dokumentation und Roadmap ergänzt.

## Abschluss

ERLEDIGT als [`9a708d3`](https://github.com/emfau88/TD/commit/9a708d30b7162341871b026627fad4849611d73c) auf Main gepusht.
[Pages-Lauf 41227355432](https://github.com/emfau88/TD/actions/runs/41227355432) erfolgreich.
Öffentliches Spiel anschließend in separater englischer Probe-Partie gestartet: neue
Zielanzeige, Ilyra-Auswahl, sichtbarer Tanz und Pause bestätigt; keine Browserwarnungen/-fehler.
[Öffentlicher Nachweis](public-9a708d3.png). Alle drei gemeldeten Punkte bearbeitet;
keine offene Integrationsentscheidung. Die abschließende Dokumentation enthält keine weitere Laufzeitänderung.

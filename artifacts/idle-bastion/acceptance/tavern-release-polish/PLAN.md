# Towers & Tantrums – Tavernen- und Tutorial-Release-Polish

Stand: 28.10.2026. Dieser ausdrücklich beauftragte Masterplan ist die zentrale Arbeitsgrundlage für diese sechs Pakete; die fortlaufende ROADMAP verlinkt hierher.

## Ausgangsstand

- Main: `fa88b4a1cc3075a8e3d7ea2e6966ecb54b6d5c63`, mit origin/main synchronisiert; bestehender Main-Checkout sauber.
- Arbeitsort: bestehender Main-Checkout `C:/Users/madde/.codex/worktrees/english-default/TowerDefense`. Der andere Checkout mit lokalen Änderungen bleibt unberührt.
- Aktuelles Spiel: `experiments/idle-bastion/`; Veröffentlichung durch vorhandenen GitHub-Pages-Workflow auf Main.
- Vorprüfung: 70/70 gezielte bestehende Tests bestanden. Vollständige Baseline: **376/409 bestanden, 33 bereits vorhandene Fehler**; unverändertes Protokoll `baseline-tests.log`. Betroffen sind u. a. historische Balance-/Layout-/Schema-Erwartungen. Keine Tests entfernt oder abgeschwächt; Vergleich der Fehlernamen am Ende erforderlich.
- Die drei erwähnten Smartphone-Originalbilder sind in den verfügbaren Anhängen nicht enthalten. Stattdessen liegen selbst aufgenommene, ausdrücklich als Baseline gekennzeichnete Browserbilder dieses Main-Stands unter `before/`. Keine Behauptung einer Prüfung der fehlenden Originalbilder.
- Keine neuen Assets, Saveformate, Wirtschaftsquellen oder Kampf-/Bosswerte. Offline-Formeln und Grenzen von 2/8 Stunden bleiben unverändert.

## Bestätigte Befunde und korrigierte Annahmen

1. Tavernenöffnung hält die Simulation nicht an; in der Browserprobe sank das Kernleben während des Besuchs. Die gespeicherte manuelle Pause funktioniert, ist aber keine geeignete temporäre Tavernenpause.
2. Berührungen sind bisher ab Herz 2/3/4 zugänglich. Bei der aktuellen Drei-Herzen-Etappe ist die Hand für neue Spielstände unerreichbar. Die separate Ansicht und CSS verstecken Marker bei Reaktionen. Tatsächliche Marker sind durch Rig-CSS wesentlich größer als gewünscht.
3. Ladehinweise erscheinen sofort bei Reaktionsvorbereitung. Der Player unterstützt bereits Unterbrechung, letzte Pose und Überblendung. Cache bleibt auf 14 Atlas-Seiten und zwei gleichzeitige Downloads begrenzt; keine pauschale Vergrößerung.
4. Lachen ab Herz 2 und Kompliment ab Herz 3 existieren bereits und geben keine Punkte. Darstellung/Freischalterklärung sind inkonsistent. Normale Geschenke sind ab 23 Punkten möglich, erreichen maximal 58; persönliches Geschenk führt anschließend zu 70. Ein vorhandenes normales Geschenk kann daher korrekt unbrauchbar sein, wird aber unklar erklärt. Kein nachgewiesener Fehler bei der Sieg-Restzahl.
5. Herzfeedback und persönliche Geschichte sind noch nicht deutlich genug verbunden. Kleine Hochkantansichten bieten wenig Figurenhöhe, technische Informationen beanspruchen zu viel Platz.
6. Die gemeinsame Tutorialführung und der durchgehende Zähler mit 14 Schritten sind bereits umgesetzt. Gezielte Pfeil-/Stilkorrekturen genügen; kein Neubau der Anleitung.
7. Historisch verdiente Herzen 4/5 und Geschichten bleiben erhalten. Aktuelle Inhalte enden bei Herz 3; neue Freischaltungen 4/5 werden nicht suggeriert.

## Verbindlicher Ablauf

Vor jedem Paket Main/Origin prüfen und synchronisieren. Jeweils nur ein Paket in Arbeit. Paket isoliert implementieren, relevante Tests und Browserprüfung durchführen, Ergebnis hier dokumentieren, committen und pushen. Pages-Lauf des tatsächlichen Code-SHA prüfen, bevor das nächste Paket beginnt. Nach erfolgreichem Deployment wird dessen SHA/URL im nächsten Dokumentationscheckpoint festgehalten; keine erfundenen Selbst-SHAs. Änderungen anderer Autoren erhalten. Bei kritischer Regression, möglichem Datenverlust oder ungelöstem Konflikt anhalten und Beleg/Blocker dokumentieren.

Statuswerte: OFFEN / IN ARBEIT / ERLEDIGT / BLOCKIERT. ERLEDIGT setzt erfolgreiche technische Prüfung und Deployment voraus; subjektive Nutzerfreigabe und Kongregate-Review werden dadurch nicht vorweggenommen.

## Paketübersicht

| Paket | Status | Ergebnis / Commit / Deployment | Verbleibend |
|---|---|---|---|
| 1 Sichere automatische Tavernenpause | ERLEDIGT | `7cd014a`; 49/49 Tests, 14 DOM-Ausgangsfälle, Build/Browser; [Pages erfolgreich](https://github.com/emfau88/TD/actions/runs/40691206208) | Smartphone-System-Suspend nicht auf physischem Gerät geprüft |
| 2 Berührungen ab Herz 1/2/3 | ERLEDIGT | `d361e4d`; 20/20 Tests, DOM-/Browsermatrix, Build; [Pages erfolgreich](https://github.com/emfau88/TD/actions/runs/40692403336) | Geplante weitere UX-Pakete |
| 3 Reaktionsladezeiten | IN ARBEIT | Implementiert; Cache-, Player-, DOM- und Browserprüfung, Build bestanden | Commit / Deployment |
| 4 Gespräche und Geschenke | OFFEN | — | Vollständig |
| 5 Herzfeedback und Tavernenoptik | OFFEN | — | Vollständig |
| 6 Tutorial und Release-Regression | OFFEN | — | Vollständig |

## Paket 1 – Sichere automatische Tavernenpause

Dateien: `src/battle-session.ts`, `src/main.ts`, `src/tavern-ui.ts`, `src/locales/en.ts`, Session-Tests und vorhandene Browser-Teststarter.

Ansatz: temporäre Laufzeitunterbrechung getrennt vom gespeicherten manuellen Pausezustand. Kampf erhält während des Besuchs keine Simulationszeit; aktive Zeitgrenzen werden weiter gespeichert. Echter Tabwechsel/Abwesenheit nutzt bestehende Offline-Abrechnung. Bereits vor Öffnung empfangene Zeit darf sauber ihren Speicherabschluss erreichen.

Risiken: laufende Speichertransaktionen, Reopen nach Sichtbarkeitswechsel, verlorene Schreibberechtigung, fälschlich nachgeholte oder als offline vergütete Besuchszeit, verschiedene Dialog-Ausgänge.

Abnahme: normale und Bosswelle inklusive Gegner, Fähigkeiten, Uhr und Produktion stehen; soziale Aktionen bleiben nutzbar; Charakter-/Ansichts-/Storywechsel halten weiter an. Schließen per Button, Escape/Zurück und Gebäudenavigation setzt nur bei zuvor laufendem Kampf fort. Manuelle Pause bleibt erhalten. Wiederholte Besuche, Reload, Hintergrundtab und verzögerte Writes erzeugen keine doppelte Zeit oder Belohnung. Offline-Tests behalten bestehende Formeln/Grenzen.

Nachweis: Session-/Offline-Tests; Browser normale Welle/Boss, Pause, Wechsel und Reload; Screenshot mit eindeutiger Tavernenpause und unverändertem Kampfzustand.

Ergebnis: Laufzeit-Hold in BattleSession; Dialogöffnung/-schließung und Wiederanbindung nach Tab-Rückkehr; aktive Zeitgrenzen während des Besuchs über bestehende 1-s-Heartbeats. Keine Save-/Offline-Formeländerung. 49/49 Session-/Offline-Tests, darunter neue Fälle normale Welle und beide Bosse bei 60/10/2 FPS, Interaktionen, manuelle Pause, verzögerte Writes und echte Abwesenheitsvergütung. 14 DOM-Ausgangsfälle mit/ohne manuelle Pause sowie Story-/Figurenwechsel und Destroy bestanden. Produktionsbuild erfolgreich.

Browser: reales Hauptspiel mit getrennten Probe-Saves. Welle 26 blieb bei 20/20 Leben, Gold 10.876 und Mara-Timer 16,125 stehen, während das Gespräch von 8 auf 16 Punkte gespeichert wurde. Bosswelle 15 blieb bei neun Gegnern, 20/20 Leben und Mara-Timer 14,4 stehen; nach Schließen lief der Timer weiter. Manuelle Pause blieb nach Schließen und Reload gesetzt, Rückkehr zeigte +0 Gold. Reload aus der Taverne lädt den regulären Rückkehrdialog; Tavernenbesuch wird nicht als Kampf nachgeholt. Keine Browser-Warnungen/-Fehler beobachtet. Screenshots: `after/p1-tavern-pause-390.jpg`, `after/p1-boss-pause-390.jpg`.

Grenze: Hintergrund/Resume ist auf Session-Ebene gezielt geprüft; ein echter vom Betriebssystem suspendierter Smartphone-Tab wurde nicht behauptet. Wie bisher kann ein harter Prozessabbruch nur die letzte bestätigte aktive Speichergrenze verwenden. Die folgenden UX-Pakete sind noch offen.

SHA: `7cd014aec0314e4c835cf3a09ec6858c08a59ee5`. [Pages-Lauf 40691206208](https://github.com/emfau88/TD/actions/runs/40691206208): Deploy-Job erfolgreich, 28.10.2026 12:51:40 UTC. Ergebnis anhand des exakten Code-SHA verifiziert.

## Paket 2 – Berührungen ab Herz 1/2/3

Dateien: `src/tavern-social.ts`, `src/tavern-ui.ts`, `src/tavern-ui.css`, `src/tavern-rig.css`, Inhaltsdateien, DE/EN-Texte und Social-/Interaction-/Content-Tests.

Ansatz: Schulter 1, Haare 2, Hand 3. Drei Marker direkt auf der normalen Figur, bei 0 sichtbar gesperrt; nur Geschichten blenden sie aus. Antippen erklärt Voraussetzung. Herz-1-Schulter bleibt rein kosmetisch; Reserven und Punkte ab Herz 2 bleiben unverändert. Bestehendes Saveformat genügt voraussichtlich, daher keine unnötige Migration.

Risiken: versehentliche neue Punktequelle, alte Validatoren/Reservelogik, Markerpositionen auf beiden Figuren, Reaktionen/Pointer-Dragging.

Abnahme: beide Figuren bei Herz 0–3; richtige Sperren/Freigaben; sichtbare Herzen 22–26 px, Ziele mindestens 44 × 44 px; Marker bleiben bei Reaktionen sichtbar. Herz 1 verbraucht/erzeugt keine Punkte, Herz 2 behält bisherige Versorgung. Alte 4/5-Herzstände laden verlustfrei.

Nachweis: Fortschritts-/Save-Tests, Browsermatrix beider Figuren, Marker-Maße; Bilder bei 320 × 568 und 390 × 844.

Ergebnis: direkte Schulter-/Haar-/Handmarker bei Herz 1/2/3, sichtbar gesperrt ab 0, keine separate Berührungsansicht. Gesperrte Marker erklären ihre Schwelle beim Antippen; Berühren hebt sie hervor. Herzen 24 × 24 px, Ziele 44 × 44 px; Reaktionen verstecken sie nicht, persönliche Geschichten schon. Frühe Schulterberührung ist ausdrücklich kosmetisch und verändert auch bei Wiederholung weder Punkte noch Reserven. Kein Saveformatwechsel und keine Migration nötig; alte 4/5-Herzstände bleiben erhalten.

Prüfung: 20/20 Social-/Content-/Interaction-/Gift-Tests, erweiterte DOM-Matrix für beide Figuren 0–3 plus sämtliche 14 Ausgangs-/Pausenfälle, Produktionsbuild bestanden. Testplayer liefert jetzt das korrekte erfolgreiche Promise-Ergebnis; dadurch werden persönliche Storysequenzen in der DOM-Prüfung tatsächlich durchlaufen. Browsermatrix `p2-browser-matrix.json`: 0 erklärt die Sperre, 1 bleibt bei 10 Punkten, 2 erhält bestehende +4 auf 39, 3 bleibt bei 70. Haarreaktion bei Herz 2, Handreaktion bei Herz 3 sowie Storyausblendung geprüft. Bei 320 × 568 und 390 × 844 alle Ziele 44 px, sichtbare Herzen 24 px; keine Browserfehler. Screenshots `after/p2-mara-320-heart2.jpg`, `after/p2-ilyra-390-heart3.jpg`.

Verbleibend: Ladehinweis folgt in Paket 3, technische Texte/Gesprächsanordnung in Paket 4 und kleine 320-px-Figurenhöhe in Paket 5. SHA: `d361e4d782546c1851ca65bea3c6e0f84e6980a3`. [Pages-Lauf 40692403336](https://github.com/emfau88/TD/actions/runs/40692403336): erfolgreich für diesen Code-SHA.

## Paket 3 – Reaktionsladezeiten

Dateien: `src/tavern-rig-preview.ts`, `src/tavern-atlas-cache.ts` nur falls erforderlich, `src/tavern-ui.ts`, Tests zum Player/Cache/Ladehinweis.

Ansatz: Verzögerung vor sichtbarem Ladehinweis; bestehende Pose/Überblendung und priorisierte Vorladung verbessern. Reaktionsbedarf nach neuen Freischaltungen vorladen. Cachelimit und Downloadparallelität bleiben bestehen.

Risiken: veraltete asynchrone Antwort überschreibt aktuelle Aktion, Timer nach Schließen, Cache-Verdrängung, verschwiegener echter Fehler.

Abnahme: kurze Warm-/Kaltwechsel ohne aufblitzende Technikmeldung; längere Verzögerung verständlich angezeigt; Fehler sichtbar und wiederholbar. Letzte Pose bleibt soweit verfügbar. Schnelle Aktions-/Figurenwechsel stabil; keine zusätzlichen Atlanten/Assets und keine Cachevergrößerung.

Nachweis: deterministische verzögerte/fehlgeschlagene Ladefälle und Cachetests, Browseraktionen kalt/warm und schnelle Wechsel; Screenshot vor/während/nach wahrnehmbarer Verzögerung soweit reproduzierbar. Keine ungemessenen RAM-/FPS-Versprechen.

Ergebnis: Reaktionshinweis erst nach 450 ms; ruhiger Text „Einen kleinen Moment …“. Kurze Ladephasen und interne Übergänge blitzen nicht mehr als technische Meldung auf. Startpuffer zwei statt vier Seiten, danach vorhandene rollende Vier-Seiten-Vorladung. Lachen/Kompliment werden passend zu Herz 2/3 vorgeladen; persönliche Geschichten laden nur die benötigten Kopf-/Schulterclips. Letzte dargestellte Pose bleibt bei einer fehlenden Folgeseite erhalten. Cache unverändert 14 Einträge und zwei Downloads; keine neuen Assets.

Zusätzlicher Browserbefund behoben: Beim Figurenwechsel ohne Größenänderung konnten die in Paket 2 direkt sichtbaren Marker noch die Nullmaße des versteckten Lade-Canvas verwenden. Positionierung erfolgt jetzt auch nach dessen Einblendung. Eigenständige Regression prüft diesen Übergang.

Prüfung: 5/5 vorhandene Cachetests. Deterministischer Player-Test mit zurückgehaltenen Folgeseiten, Fortsetzung nach deren Freigabe, schnellen konkurrierenden Aktionen, tatsächlichem Atlasfehler und erfolgreicher erneuter Aktion; maximal 14 Cacheeinträge. DOM-Prüfung: kurze Wartephase bleibt auch später unsichtbar, längere wird angezeigt, Figur bleibt sichtbar, Fehler sofort sichtbar, Timer nach Schließen bereinigt; bisherige Marker-/Story-/Pausefälle weiterhin erfolgreich. Produktionsbuild bestanden.

Browser: sechs schnelle tatsächliche Aktionen mit korrekten Clips Kopf/Kopf/Kichern/Kichern/Hüfte/Schulter; in allen Messpunkten sichtbare Figur, keine Fehlermeldung und kein Ladehinweis, stabile getrennte 44-px-Ziele, Cache 14. `p3-browser-reactions.json`, `after/p3-reactions-390.jpg`. Kontrollierte Verzögerung/Fehler im deterministischen DOM-/Player-Test, kein behaupteter Browser-Netzwerk-Drosseltest oder physischer RAM-Messwert.

Verbleibend: echte langsame Netze können weiterhin einen sichtbaren Moment benötigen; Fehler werden nicht versteckt und dieselbe Aktion kann erneut ausgelöst werden. SHA / Deployment: ausstehend.

## Paket 4 – Gespräche und Geschenke

Dateien: `src/tavern-ui.ts`, `src/tavern-ui.css`, `src/tavern-rig.css`, Inhalts-/Sprachdateien, UI-/Social-Tests.

Ansatz: feste Hauptaktionen Sprechen/Berühren/Schenken; zugehörige Gesprächsauswahl mit Plaudern/Lachen/Kompliment immer am selben Ort sichtbar. Berühren hebt vorhandene Marker hervor. Technische Fortschrittsdetails einklappen. Geschenkhinweis benennt persönliche Voraussetzung, erhaltenen normalen Vorrat und fehlende Siege.

Risiken: zusätzlicher Klickzwang, Doppelvergabe bei raschen Aktionen, widersprüchliche Sperrtexte, unzugängliche Sondergesten.

Abnahme: Plaudern sofort, Lachen ab 2, Kompliment ab 3; sichtbare Voraussetzungen; freigeschaltete Optionen auch ohne Punktebudget nutzbar. Bestehende passende Clips, keinerlei zusätzliche Punkte. Geschenkgrenzen/Verbrauch unverändert; normaler Vorrat bleibt bei persönlicher Sperre erhalten. Herz-4-Angebote verwirren neue Stände nicht.

Nachweis: UI bei Herzen 0–3 und ausgeschöpften Budgets, Geschenkfälle 23/35/58/70 und 29/30 Siege, DE/EN-Bilder und Economytests.

Ergebnis / SHA / Deployment / Restprobleme: ausstehend.

## Paket 5 – Herzfeedback und Tavernenoptik

Dateien: `src/tavern-ui.ts`, Tavern-CSS, vorhandene Audio-Anbindung in `src/main.ts`, Sprach-/Inhaltsdateien und relevante Tests.

Ansatz: nach bestätigtem Save kurzes Herzleuchten, bestehender Klang/Clip, neue Berührung und persönliche Geschichte deutlich anzeigen. Einheitliche warme Gestaltung; Titel/kurze Buttons Pixel-Font, Dialoge lesbar; wenige gleichzeitige Statusmeldungen. Figuren und Hintergründe erhalten.

Risiken: Feedback vor erfolgreichem Commit, verlorene Nachricht nach Figurenwechsel, Audio bei Stummzustand, Überlagerungen/Scrollfallen auf kleinen Geräten.

Abnahme: Erfolg erst nach Speicherung, kein Erfolgsfeedback bei Fehler; keine Pflichtanimation/Bestätigung. Große Herzen ausschließlich Geschichten, kleine Herzen Berührung. Lesbare gleichwertige Aktionen, ≥44-px-Touchflächen; 320/390 px keine horizontalen Überläufe oder unbedienbaren Bereiche, Figur gegenüber Baseline möglichst größer. Details lassen sich sinnvoll einklappen.

Nachweis: kontrolliert verzögerter/fehlgeschlagener Commit, Desktop und beide mobilen Größen, DE/EN, Reduced Motion, Vorher-/Nachherbilder.

Ergebnis / SHA / Deployment / Restprobleme: ausstehend.

## Paket 6 – Tutorial und Release-Regression

Dateien: `src/lesson-pointer.ts`, `src/tutorial-guide.ts`, `src/premium.css` und betroffene Hinweis-/Sprachdateien; vorhandene Tests/Release-Skripte und Kongregate-Nachweise.

Ansatz: übergroße Baukachel-Pfeile und isolierte dekorative Pfeilzeichen entfernen, vorhandene dezente Zielhervorhebung nutzen. Tutorial-/Anschlusshinweise vereinheitlichen; 14 Schritte und echte Aktionen unverändert. Abschließender gemeinsamer Test aller Pakete.

Risiken: verlorene Lernführung, blockierter Frostbau, versteckte Pflichtaktion, veraltetes Kongregate-ZIP, Unterschiede Produktions-/Entwicklungsbuild.

Abnahme: kompletter frischer 14-Schritte-Einstieg inklusive kostenlosem Frost; nachgelagerte Hinweise konsistent. Vollständige Testsuite ohne Abschwächung; Baselinefehler gesondert ausweisen. Beide Figuren 0–3, Gespräche/Berührungen/Geschenke, Speichern/Reload/Offline, Boss während Taverne, wiederholte Besuche und unterschiedliche Simulations-FPS geprüft. Produktionsbuild und isolierter Kongregate-Export ohne fehlende referenzierte Assets/JS-Fehler; ZIP nach finalen Spieländerungen neu gebaut und geprüft. Kein Upload/Submit.

Nachweis: Test-/Buildprotokolle, Browsermatrix Desktop/320/390 DE/EN, Tutorial-/Tavernen-Vergleichsbilder, ZIP-Datei/Prüfsumme/Inhaltsprüfung, tatsächlicher Pages-Lauf. Physische Smartphone-/Kongregate-Hosttests nur behaupten, wenn tatsächlich durchgeführt.

Ergebnis / SHA / Deployment / Restprobleme: ausstehend.

## Gesamtergebnis und Releaseentscheidung

Noch offen. Abschlussbericht enthält Status aller sechs Pakete, Code-SHAs und erfolgreiche Deployments, tatsächliche Bugfixes, Browserbelege, verbleibende Probleme, kritische UX-Bewertung und begründete Kongregate-Review-Einschätzung.

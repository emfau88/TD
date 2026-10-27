# T12 – Prüfung der ersten Beziehungsetappe

Auftrag 27.10.2026: direkt auf Main, geprüfte Paketcommits, Push erst nach Gesamtprüfung. Ausgangspunkt `9b3807e`; Plancommit `bdea479`. Arbeitsstatus ausschließlich in der ROADMAP.

## Regeln und Migration

Ausgangsbasis 67/67 bestehende Social-/Interaktions-/Save-/Sessiontests. Nach Umstellung: 73/73 Social-/Interaktions-/Ilyra-/Save-/Sessiontests und TypeScript bestanden. Schema 32, Kampfregeln 16 unverändert. Explizite Migration aus Schema 31 mit eingefrorener Altvalidierung; Punkte/Bestand/Claims/Teilfortschritt und gesamte Kampfdaten erhalten. Grenzwerte 0/23/34/35/58/69/70/109/110/160 und exakter Reload geprüft. Bereits reservierte historische Offline-Erträge bleiben einmalig beanspruchbar. Die neue Oberfläche ist zu diesem Zeitpunkt noch nicht abgeschlossen.

## Geschenkvergabe und Aktionen

35/35 gezielte Session-/Interaktionstests und TypeScript bestanden. Region und angezeigte Geschenkart bleiben über wartende Saves eindeutig; die Ausführung validiert erneut. Normale/persönliche Geschenkereignisse werden ausschließlich nach dauerhaftem Commit erzeugt. Kontrolliert verzögerte und abgewiesene Schreibvorgänge sowie Reload erzeugen keine verfrühten oder doppelten Meldungen.

## Berührungen und Geschichte

25/25 Content-/Social-/Atlas-Tests und TypeScript bestanden. Isolierter Chrome-UI-Test beider Figuren bei 0–5 Herzen: Schulter→touch, zusätzlich Haare→head und ab altem Herz 4 Hand→giggle. Kein Browserfehler; maximal 14 vorgehaltene Atlas-Seiten. Ein im ersten Test gefundener Cache-Überlauf beim zusätzlichen Vorladen wurde behoben. Erste Storyszene schaltet korrekt auf Ruhe statt Hand/Kichern. Desktop- und 390-px-Screenshots visuell geprüft: Figur, Dialog und Rückkehr zum Kampf sichtbar. Nachweis: touches-results.json und check-touches.mjs; Bilder touches-mara.png / touches-ilyra.png. Keine subjektive Nutzerabnahme behauptet.

## Oberfläche und Hinweise

TypeScript und zusammen 9 gezielte i18n-/Geschenkstatus-/Interaktionstests bestanden. check-ui.mjs betreibt die echte Hauptspieloberfläche mit separaten IndexedDB-Proben: fertiges persönliches Geschenk bei noch fehlender Zuneigung bleibt erhalten; nur passende Empfängerin wird markiert; Enter überreicht genau ein persönliches Geschenk; Herz 3 und gesammelte Berührungen bleiben nach Reload. DE bei 1280/320 px, EN bei 390 px; keine Seitenfehler oder horizontales Überlaufen. Bilder ui-*-ready/complete.png wurden visuell geprüft. Abgeschnittene mobile Fortschrittszeile und drei fehlende EN-Suffixübersetzungen aus der ersten Sichtprobe korrigiert, anschließend erneut geprüft. Ergebnisse in ui-results.json. Details bleiben mobil scrollbar, Rückkehr zum Kampf dauerhaft oben sichtbar.

## Gesamtablauf und Abschluss

148/148 gezielte Tests aus 16 Dateien bestanden; keine übersprungenen Tests. Enthalten sind Social/Content/Atlas, Tavernenbau/Rekrutierung, Interaktionen, Battle-Save/Session/IndexedDB, Farming, Offline, Ilyra, Audio und Sprache. Keine Behauptung einer grünen Vollsuite. Produktionsbuild `npm run build` inklusive TypeScript bestanden; vollständige Ausgaben: regression.txt und build.txt.

Zwei abgeschlossene Browserabläufe mit nativer IndexedDB, echten BattleSession-Aktionen und regulären Simulationsschritten: historische verdiente Ausgangsstände clear15 für Mara / clear25 für Ilyra; Taverne bzw. Ausbau/Rekrutierung über vorhandene Spielbefehle. Je drei Gespräche + normales Geschenk ergeben sofort Herz 2. Drei Schulterberührungen und zwei später aufgefüllte Gespräche erreichen 58. Nach 29 echten normalen Siegen kein persönliches Geschenk; nach 30 genau eines und bewusstes Überreichen für Herz 3. Je drei normale Geschenkereignisse, ein persönliches Ereignis, Reload bei 15 Siegen und nach Herz 3; alle drei Momente vollständig durchgeklickt. Kein Browserfehler in den abgeschlossenen Läufen. Durchläufe getrennt abgeschlossen; check-flows.mjs enthält beide reproduzierbaren Szenarien. Kein manueller Sprung der Sieg- oder Zuneigungszähler.

| Figur | Automatisch zertifizierte Farmwelle | Aktive Simulationszeit von Herz 2 bis persönlichem Geschenk |
| --- | --- | --- |
| Mara | 12 | 513 s = 8:33 min |
| Ilyra | 24 | 855 s = 14:15 min |

Die Browserprobe liefert reguläre 0,25-s-Live-Schritte beschleunigt zu. Das sind gemessene aktive Spielsekunden, keine behaupteten 8–14 Minuten manueller Echtzeitbedienung. Die Zeitspanne hängt von Verteidigung und Farmwelle ab; 30 Siege sind keine starre 10-Minuten-Mindestdauer. Pausen beim Lesen und Neuladen sind nicht eingerechnet. Ausgangsstände und Ergebnisse: flow-results.json, flow-mara-save.json, flow-ilyra-save.json. Historische Punkte und vorhandene Herzen 4/5 bleiben zusätzlich über die Migrationstests und Browserstufenprobe abgesichert.

Das gebaute Produktionspaket wurde über HTTP bei 1440 und 390 px geprüft, einschließlich echtem Touch-Tap, Animation, Kapitelabschluss und Rückkehr zur Karte; keine Browserfehler. production-results.json und production-*.png, Sichtprobe angesehen. Hauptspielcode, neue Save-Migration und bestehende Assets bleiben beisammen; keine Kampfregel-/Goldkurvenänderung. Subjektive Nutzerabnahme ist weiterhin offen.

Paketcommits: Regeln 3fce7b5, Transaktionen b8f56e4, Berührungen 244c60f, Oberfläche 30a08b9; dieser Bericht bildet das fünfte Paket. Main-Push/Pages ist beauftragt und folgt der bestandenen Gesamtprüfung; tatsächlicher Deploymentnachweis wird im Abschlusschat genannt. Bei einer späteren Rücknahme die Schema-32-Lesbarkeit als Vorwärtskorrektur erhalten, statt neue Spielstände mit dem alten Schema-31-Binary zu öffnen.

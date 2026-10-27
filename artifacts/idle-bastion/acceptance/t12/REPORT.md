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

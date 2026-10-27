# T12 – Prüfung der ersten Beziehungsetappe

Auftrag 27.10.2026: direkt auf Main, geprüfte Paketcommits, Push erst nach Gesamtprüfung. Ausgangspunkt `9b3807e`; Plancommit `bdea479`. Arbeitsstatus ausschließlich in der ROADMAP.

## Regeln und Migration

Ausgangsbasis 67/67 bestehende Social-/Interaktions-/Save-/Sessiontests. Nach Umstellung: 73/73 Social-/Interaktions-/Ilyra-/Save-/Sessiontests und TypeScript bestanden. Schema 32, Kampfregeln 16 unverändert. Explizite Migration aus Schema 31 mit eingefrorener Altvalidierung; Punkte/Bestand/Claims/Teilfortschritt und gesamte Kampfdaten erhalten. Grenzwerte 0/23/34/35/58/69/70/109/110/160 und exakter Reload geprüft. Bereits reservierte historische Offline-Erträge bleiben einmalig beanspruchbar. Die neue Oberfläche ist zu diesem Zeitpunkt noch nicht abgeschlossen.

## Geschenkvergabe und Aktionen

35/35 gezielte Session-/Interaktionstests und TypeScript bestanden. Region und angezeigte Geschenkart bleiben über wartende Saves eindeutig; die Ausführung validiert erneut. Normale/persönliche Geschenkereignisse werden ausschließlich nach dauerhaftem Commit erzeugt. Kontrolliert verzögerte und abgewiesene Schreibvorgänge sowie Reload erzeugen keine verfrühten oder doppelten Meldungen.

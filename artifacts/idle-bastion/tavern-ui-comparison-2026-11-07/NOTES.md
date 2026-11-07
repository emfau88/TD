# Echte Tavernen-UI: drei Vorher-/Nachher-Paare

Aufnahme am 07.11.2026. Links: unveränderte veröffentlichte Basis `daf39fb7b13a05a78530b503fa45074b5f65c9de`. Rechts: Tavernenbranch `8726431214d34803419d59c5ce416a82fce91eff`. Je Seite 390 × 900 CSS-Pixel bei DPR 1, Deutsch, Mara. Jedes fertige Paar ist 828 Pixel breit.

## Beobachtete Unterschiede

1. **58 Zuneigung / 18 persönliche Siege:** Beide Fassungen nennen bereits die fehlenden zwölf Siege. Die neue Formulierung benennt gewonnene normale Wellen und erklärt ausdrücklich, dass Farmen zählt. Geschenkdetails sind beidseits zugeklappt; der komplette Hinweis ist sichtbar. Es wird kein zuvor fehlender Fortschrittshinweis behauptet.
2. **Gleicher Ausgangsstand: 35 Zuneigung / 10 persönliche Siege:** „Sprechen“ und die anschließende Gesprächsaktion ergeben links eine normale Antwort mit +8 Zuneigung, rechts die neue optionale Begegnung „Ein Zahnrad mit Geschichte“ mit zwei Antworten. Die neue Begegnung vergibt keine Zuneigung. Die unterschiedliche Punktzahl nach der Aktion ist reales Verhalten. Nach ihrem Abschluss sind die drei Hauptaktionen wieder sichtbar und beide Antwortbuttons verschwunden; das wurde ausdrücklich geprüft. Die zusätzliche Antwortauswahl ist kein dauerhaftes neues Menü.
3. **58 Zuneigung / 30 persönliche Siege, anschließend persönliches Geschenk:** Beide Fassungen erreichen real 70 Zuneigung und Herz 3. Bereits die alte Fassung trägt den Titel „Neu: Hand berühren“, bietet darunter aber den persönlichen Moment an. Neu führt der Knopf direkt zum Ausprobieren der Handberührung und heißt entsprechend „Ausprobieren“. Die neue persönliche Antwort nennt Maras Messingzahnrad. Das tatsächlich nach dem bestätigten Save erzeugte Herzleuchten wurde ungefähr 200 ms nach Bestätigung bei seinem echten 200-ms-Animationsstand pausiert. In beiden Fassungen bleibt der Dialog am Anfang, damit der persönliche Satz vollständig sichtbar ist. Der für diesen Vergleich nachrangige Etappenhinweis liegt weiter unten im natürlich scrollbar bleibenden Geschenkbereich.

## Herkunft und Prüfung

- `compare-ui.mjs` lädt die echten `TavernUI`-/`BattleSession`-Module aus beiden unveränderten Quellständen über getrennte lokale Vite-Server. Alte originale Atlasdarstellung links, neue originale Videodarstellung rechts; keine KI-Bilder und keine Clipbewertung.
- Basis ist derselbe aufgezeichnete `clear25`-Spielstand. Tavernenbau, Ausbau und Rekrutierung laufen über die jeweiligen regulären Aktionen. Nur die ausdrücklich benötigten sozialen Vergleichswerte werden im isolierten Fixture gesetzt.
- Jede Aufnahme erhält einen neuen Browserkontext und eine eigene IndexedDB mit dem Präfix `tavern-ui-comparison-`. Keine Hauptspiel-, historische Probe-, Turmvorschau- oder Tavernen-Testdatenbank wird geöffnet.
- Save, Rückkehrbestätigung, Writer-Heartbeat und eigentliche UI-Aktionen laufen über die echten Spielmodule. Alle sechs finalen Aufnahmen hatten keinen JavaScript- oder Sessionfehler; der Kampf blieb pausiert und es gab keinen horizontalen Überlauf.
- Für ruhige Standbilder wird ausschließlich die tatsächlich geladene Idle-Canvaszeichnung angehalten. UI-Text, DOM-Inhalte, Belohnungen und Bedienlogik werden nicht ersetzt. Die Herzanimation in Paar 3 ist der tatsächliche CSS-Effekt, für die Aufnahme zeitlich angehalten.
- `metadata.json` enthält Quellcommits, Viewport, den SHA-256 der gemeinsamen Basisdatei, vor/nach-Zustände, erfolgreiche Save-Revisionen und Sichtbarkeitsprüfungen. Die gemeinsamen sozialen Ausgangszustände haben pro Paar identische SHA-256-Werte. Vollständige Initial-/Capture-Snapshots und die sechs unveränderten Originalscreens liegen bei.
- Alle drei finalen zusammengesetzten PNGs wurden tatsächlich mit `view_image` angesehen. Diese technische Sichtkontrolle ersetzt keine Nutzerabnahme.

Die `*-pair.html`-Dateien setzen lediglich die zwei Original-PNGs nebeneinander, mit äußeren Vorher-/Nachher-Beschriftungen und einer kurzen Erläuterung. Kein Bildinhalt innerhalb der Tavernenoberfläche wird nachbearbeitet. Alle Dateien sind unter demselben relativen Pfad im Hauptcheckout gespiegelt.

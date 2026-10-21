# Erste Audiostufe · 21.10.2026

17 ausgewählte Dateien, keine neue Spielmechanik. Quellen, Urheber, Lizenzen und Bearbeitungen stehen vollständig auf [Audioquellen](../audio-credits.html), auch aus dem Spielmenü erreichbar.

| Situation | Originaldatei / Auswahl | Umsetzung |
| --- | --- | --- |
| Karte | Exploration.mp3 | Sehr dezente Schleife |
| Offene Taverne | inn_music.mp3 | Überblendung, leisere Kampfgeräusche |
| Waldwächter | Bow Arrow Draw / Shoot / Hit 01 | Kurzer Spannakzent vor Folgeschüssen, Abschuss und tatsächlicher Treffer |
| Scharfschütze | Bow Arrow Draw / Shoot / Hit 02 | Eigene Variante derselben Folge |
| Frostturm | Ice Shard Projectile Launch 01 / Impact 01 | Abschuss und Einschlag |
| Steinschleuder | break_stone.wav | Ein Klang je Einschlag, nicht je Opfer des Flächenschadens |
| Gebäude auswählen; Bau, Ausbau, Forschung | craft.ogg | Dezentes Handwerksgeräusch |
| Gegner erreicht Kern | alarm.wav | Höchstens einmal je 1,2 Sekunden, unabhängig vom Kampfklang-Limit |
| Geschenk erhalten oder erfolgreich überreichen | chimes.wav | Kein Klang für abgelehnte Übergabe oder bloß geladenen Bestand |
| Maras tatsächlicher Boost | magical_1.ogg | Manuelle und automatische Aktivierung |
| Ilyras tatsächliche Sternensalve | magical_3.ogg | Manuelle und automatische Aktivierung |
| Buttons und aufklappbare Details | click_1.wav | Kurzer leiser UI-Klang |

## Mischung und Laden

- Standardregler: Musik 16 %, Effekte 55 %. Zusätzlich eigene Pegel je Klang; das sind keine vergleichbaren wahrgenommenen Lautheiten. Inn Music wurde etwa 6 dB lauter gemessen und erhält deshalb vor dem Regler den Faktor 0,5.
- In der Taverne Kampfgeräusche auf 12 % ihres Kartenpegels absenken; Kernalarm bleibt deutlich. Maximal drei gleichzeitige Kampfklänge, acht Starts pro Sekunde und sechs Effekte insgesamt. Einzelklänge besitzen Wiederholungssperren. Bei voller Belegung darf der Kernalarm einen bestehenden Effekt ersetzen.
- AudioContext erst nach Bedienung. Kurze Effekte werden dann einmal vorbereitet; lange Musikstücke werden kontextabhängig über HTMLAudio/Web Audio gestreamt, nicht komplett als AudioBuffer dekodiert. Verborgener Tab, inaktiver Speicherbesitz und Stummschaltung stoppen Wiedergabe; normale Spielpause stoppt Kampfklänge, lässt Musik/UI zu.
- Einstellungen separat lokal gespeichert; keine Änderung der Spielstandstruktur. Musik und Effekte unabhängig, global stumm. Stimmenregler sichtbar deaktiviert, bis tatsächlich Clips ausgewählt werden.
- 17 Dateien benötigen zusammen **14.369.795 Byte (14,37 MB)**. Davon Musik **10.771.455 Byte (10,77 MB)**. MP3/WAV unverändert kopiert; drei OGG-Dateien ohne weitere verlustbehaftete Kodierung nach Float-PCM-WAV dekodiert. Bogen-Draw zur Laufzeit auf einen kurzen Endausschnitt mit Abblende begrenzt; keine Änderung der Schusszeiten.
- Aktuelle Gefährtenanimationen und Spielgrafiken unverändert. Kein zusätzlicher Bildbedarf.

## Noch offen

Nächste sinnvolle Ergänzungen nach Hörfeedback: ein seltener Boss-/Siegshinweis, eigener erfolgreicher Forschungs-/Freischaltklang, kurzer Steinschleuder-Abwurf. Charakterstimmen erst mit geeigneten, lizenzierten Clips und separatem Pegel; kein allgemeines Lachen auf jede Berührung legen. Elektrischer Kettenblitz/Feuerstoß erst mit den späteren Türmen.

Technische Pegelmessung und reale Browserwiedergabe wurden geprüft. Klangcharakter, musikalische Loopgrenzen und endgültige Mischung benötigen die Hörbewertung des Nutzers; keine subjektive Hörabnahme des Agenten behauptet. [Kompakter Prüfbericht](../../../artifacts/idle-bastion/acceptance/audio/REPORT.md).

# Erste Audiostufe · 21.10.2026

30 ausgewählte Spieldateien, keine neue Spielmechanik. Quellen, Urheber, Lizenzen und Bearbeitungen stehen vollständig auf [Audioquellen](../audio-credits.html), auch aus dem Spielmenü erreichbar. Weitere 24 Stimmenclips stehen ausschließlich zur Nutzerauswahl in der [Hörvergleichsseite](https://emfau88.github.io/TD/voice-check.html).

| Situation | Originaldatei / Auswahl | Umsetzung |
| --- | --- | --- |
| Karte | Exploration.mp3 | Sehr dezente Schleife |
| Offene Taverne | inn_music.mp3 | Überblendung, leisere Kampfgeräusche |
| Waldwächter | Bow Arrow Draw / Shoot / Hit 01 | Kurzer Spannakzent vor Folgeschüssen, Abschuss und tatsächlicher Treffer |
| Scharfschütze | Bow Arrow Draw / Shoot / Hit 02 | Eigene Variante derselben Folge |
| Frostturm | Ice Shard Projectile Launch 01 / Impact 01 | Abschuss und Einschlag |
| Steinschleuder | break_stone.wav | Ein Klang je Einschlag, nicht je Opfer des Flächenschadens |
| Gebäude auswählen; Siedlungsbau/-ausbau, Forschung | craft.ogg | Dezentes Handwerksgeräusch |
| Turm tatsächlich gebaut, einschließlich Startturm | 707864__lizelle__hammer-on-wood.wav | Auf 1,17 s gekürzt: Ausschnitt 0,23–1,75 s, Tempo ×1,3 ohne Tonhöhenänderung, kurze Schnittblenden |
| Turm tatsächlich aufgewertet | Ding.wav | Unverändert, eigener dezenter Bestätigungsklang |
| Rosenspiegel beginnt Tanzzauber | katjasavia-female-sensual-laughter-218077.mp3 | Einmal pro Beginn, kein Neustart beim Übergang Windup → Channel; stoppt bei Zauberende/Unterbrechung/Pause |
| Gegner erreicht Kern | alarm.wav | Höchstens einmal je 1,2 Sekunden, unabhängig vom Kampfklang-Limit |
| Geschenk erhalten oder erfolgreich überreichen | chimes.wav | Kein Klang für abgelehnte Übergabe oder bloß geladenen Bestand |
| Maras tatsächlicher Boost | magical_1.ogg | Manuelle und automatische Aktivierung |
| Ilyras tatsächliche Sternensalve | magical_3.ogg | Manuelle und automatische Aktivierung |
| Maras bestätigte Berührung | Zehn flirty_*.wav von Marti Topmade | Zufällig ohne direkte Wiederholung, keine Überlagerung; nach Figurenwechsel/Schließen stumm |
| Buttons und aufklappbare Details | click_1.wav | Kurzer leiser UI-Klang |

## Mischung und Laden

- Standardregler: Musik 16 %, Effekte 55 %. Zusätzlich eigene Pegel je Klang; das sind keine vergleichbaren wahrgenommenen Lautheiten. Inn Music wurde etwa 6 dB lauter gemessen und erhält deshalb vor dem Regler den Faktor 0,5.
- In der Taverne Kampfgeräusche auf 12 % ihres Kartenpegels absenken; Kernalarm bleibt deutlich. Maximal drei gleichzeitige Kampfklänge, acht Starts pro Sekunde und sechs Effekte insgesamt. Einzelklänge besitzen Wiederholungssperren. Bei voller Belegung darf der Kernalarm einen bestehenden Effekt ersetzen.
- AudioContext erst nach Bedienung. Kurze Effekte werden dann einmal vorbereitet; lange Musikstücke werden kontextabhängig über HTMLAudio/Web Audio gestreamt, nicht komplett als AudioBuffer dekodiert. Verborgener Tab, inaktiver Speicherbesitz und Stummschaltung stoppen Wiedergabe; normale Spielpause stoppt Kampfklänge, lässt Musik/UI zu.
- Einstellungen separat lokal gespeichert; keine Änderung der Spielstandstruktur. Musik, Effekte und Stimmen unabhängig, global stumm. Der aktive Stimmenregler steuert Maras Tavernenreaktionen und das Bosslachen (in der Taverne zusätzlich auf 30 % abgesenkt). Kein überlappendes Bosslachen; geladene/fortgesetzte Zauber werden nicht akustisch neu gestartet.
- 20 Basis-Spieldateien benötigen zusammen **15.045.847 Byte (15,05 MB)**, davon Musik **10.771.455 Byte (10,77 MB)**. A02 ergänzt nur 676.052 Byte. Bis auf den gekürzten Bauklang MP3/WAV unverändert kopiert; drei OGG-Dateien ohne weitere verlustbehaftete Kodierung nach Float-PCM-WAV dekodiert. Bogen-Draw zur Laufzeit auf einen kurzen Endausschnitt mit Abblende begrenzt; keine Änderung der Schusszeiten.
- **Stimmenauswahl:** A01–A08 / B01–B16 aus esperar-Aufnahmen 170767 / 170766, CC0. Zusammen 2,09 MB, ausschließlich in der Vergleichsseite und dort `preload="none"`. Kein Zusatzdownload im Hauptspiel. [Schnittmanifest und Reproduktion](../assets/voice-audition/README.md). Noch keine Berührung vertont, Nutzerauswahl abwarten.
- **A03 / Mara:** Weitere zehn WAVs (4.184.836 Byte, insgesamt nun 19.230.683 Byte Spielaudio). Nur der jeweils nächste Clip lädt in Maras Charakteransicht vor; kein Download beim Kartenstart. Englische Reaktionssätze aus dem vom Nutzer gewählten Pack, keine wortgetreue Vertonung der deutschen Dialogtexte. [Quelle, Lizenz und Dateiliste](../assets/mara-voice/README.md). Keine Änderungen an Animationen, Berührungszonen oder Belohnungen.
- Aktuelle Gefährtenanimationen und Spielgrafiken unverändert. Kein zusätzlicher Bildbedarf.

## Noch offen

Nächste sinnvolle Ergänzungen nach Hörfeedback: ein seltener Siegshinweis, eigener erfolgreicher Forschungs-/Freischaltklang, kurzer Steinschleuder-Abwurf. Ilyras Tavernenstimmen erst nach Auswahl der vorbereiteten Hmms-Clips; kein allgemeines Lachen auf jede Berührung legen. Elektrischer Kettenblitz/Feuerstoß erst mit den späteren Türmen.

Technische Pegelmessung und reale Browserwiedergabe wurden geprüft. Klangcharakter, musikalische Loopgrenzen und endgültige Mischung benötigen die Hörbewertung des Nutzers; keine subjektive Hörabnahme des Agenten behauptet. [Kompakter Prüfbericht](../../../artifacts/idle-bastion/acceptance/audio/REPORT.md).

# Erste Audiostufe · 21.10.2026

48 ausgewählte Spieldateien, keine neue Spielmechanik. Quellen, Urheber, Lizenzen und Bearbeitungen stehen zentral in [SOURCES_AND_LICENSES.txt](SOURCES_AND_LICENSES.txt). Die [Audio-Credits](../audio-credits.html) bleiben kurz; vollständige Hinweise sind lokal aufklappbar, ohne ausgehende Links. Weitere 24 Stimmenclips stehen ausschließlich zur Nutzerauswahl in der [Hörvergleichsseite](https://emfau88.github.io/TD/voice-check.html).

| Situation | Originaldatei / Auswahl | Umsetzung |
| --- | --- | --- |
| Karte | Exploration.mp3 | Sehr dezente Schleife |
| Offene Taverne | inn_music.mp3 | Überblendung, leisere Kampfgeräusche |
| Waldwächter | Bow Arrow Draw / Shoot / Hit 01 | Kurzer Spannakzent vor Folgeschüssen, Abschuss und tatsächlicher Treffer |
| Scharfschütze | Bow Arrow Draw / Shoot / Hit 02 | Eigene Variante derselben Folge |
| Frostturm | Single_Fantasy SFX Pack Vol 1_Ice Spell_Buildup.wav | Unverändert, 1,2 s; leiser Abschuss (Gain 0,2), global mindestens 1,3 s Abstand, kein Einschlagton |
| Steinschleuder | break_stone.wav | Ein Klang je Einschlag, nicht je Opfer des Flächenschadens |
| Gebäude auswählen; Siedlungsbau/-ausbau, Forschung | craft.ogg | Dezentes Handwerksgeräusch |
| Turm tatsächlich gebaut, einschließlich Startturm | 707864__lizelle__hammer-on-wood.wav | Auf 1,17 s gekürzt: Ausschnitt 0,23–1,75 s, Tempo ×1,3 ohne Tonhöhenänderung, kurze Schnittblenden |
| Turm tatsächlich aufgewertet | Ding.wav | Unverändert, eigener dezenter Bestätigungsklang |
| Rosenspiegel beginnt Tanzzauber | katjasavia-female-sensual-laughter-218077.mp3 | Einmal pro Beginn, kein Neustart beim Übergang Windup → Channel; stoppt bei Zauberende/Unterbrechung/Pause |
| Gegner erreicht Kern | alarm.wav | Höchstens einmal je 1,2 Sekunden, unabhängig vom Kampfklang-Limit |
| Geschenk erhalten oder erfolgreich überreichen | chimes.wav | Kein Klang für abgelehnte Übergabe oder bloß geladenen Bestand |
| Maras tatsächlicher Boost | magical_1.ogg | Manuelle und automatische Aktivierung |
| Ilyras tatsächliche Sternensalve | magical_3.ogg | Manuelle und automatische Aktivierung |
| Ilyras bestätigte Berührung | Sieben voice1-*.mp3 aus der Nutzerauswahl | Gemeinsamer Pool für Hand, Haare und Schulter; einzeln an Mara angepasster Pegel |
| Maras bestätigte Berührung | Zehn flirty_*.wav von Marti Topmade | Zufällig ohne direkte Wiederholung, keine Überlagerung; nach Figurenwechsel/Schließen stumm |
| Buttons und aufklappbare Details | click_1.wav | Kurzer leiser UI-Klang |

## Mischung und Laden

- Standardregler: Musik 16 %, Effekte 55 %. Zusätzlich eigene Pegel je Klang; das sind keine vergleichbaren wahrgenommenen Lautheiten. Inn Music wurde etwa 6 dB lauter gemessen und erhält deshalb vor dem Regler den Faktor 0,5.
- In der Taverne Kampfgeräusche auf 12 % ihres Kartenpegels absenken; Kernalarm bleibt deutlich. Maximal drei gleichzeitige Kampfklänge, acht Starts pro Sekunde und sechs Effekte insgesamt. Einzelklänge besitzen Wiederholungssperren. Bei voller Belegung darf der Kernalarm einen bestehenden Effekt ersetzen.
- Hörbarer AudioContext erst nach Bedienung. Der UI-Klick wird bereits beim Laden über OfflineAudioContext dekodiert, Kartenmusik ohne Wiedergabe über HTMLAudio vorbereitet. Erst nach Musikstart werden die übrigen Effekte vorgewärmt; bei Musiklautstärke null nach der Audiofreigabe. Lange Musikstücke werden weiter gestreamt, nicht komplett als AudioBuffer dekodiert. Frühe Bestätigungen warten auf die Audiofreigabe, statt den ersten Klick zu verlieren. Verborgener Tab, inaktiver Speicherbesitz und Stummschaltung stoppen Wiedergabe; normale Spielpause stoppt Kampfklänge, lässt Musik/UI zu.
- Einstellungen separat lokal gespeichert; keine Änderung der Spielstandstruktur. Musik, Effekte und Stimmen unabhängig, global stumm. Der aktive Stimmenregler steuert die Tavernenreaktionen von Mara und Ilyra sowie manuelle Befehlsantworten und das Bosslachen (in der Taverne zusätzlich auf 30 % abgesenkt). Kein überlappendes Bosslachen; geladene/fortgesetzte Zauber werden nicht akustisch neu gestartet.
- 20 Basis-Spieldateien benötigen zusammen **15.045.847 Byte (15,05 MB)**, davon Musik **10.771.455 Byte (10,77 MB)**. A02 ergänzt nur 676.052 Byte. Bis auf den gekürzten Bauklang MP3/WAV unverändert kopiert; drei OGG-Dateien ohne weitere verlustbehaftete Kodierung nach Float-PCM-WAV dekodiert. Bogen-Draw zur Laufzeit auf einen kurzen Endausschnitt mit Abblende begrenzt; keine Änderung der Schusszeiten.
- **Stimmenauswahl:** A01–A08 / B01–B16 aus esperar-Aufnahmen 170767 / 170766, CC0. Zusammen 2,09 MB, ausschließlich in der Vergleichsseite und dort `preload="none"`. Kein Zusatzdownload im Hauptspiel. [Schnittmanifest und Reproduktion](../assets/voice-audition/README.md). Diese Hmms-Auswahl bleibt außerhalb des Spiels.
- **A03 / Mara:** Weitere zehn WAVs (4.184.836 Byte, insgesamt nun 19.230.683 Byte Spielaudio). Nur der jeweils nächste Clip lädt in Maras Charakteransicht vor; kein Download beim Kartenstart. Englische Reaktionssätze aus dem vom Nutzer gewählten Pack, keine wortgetreue Vertonung der deutschen Dialogtexte. [Quelle, Lizenz und Dateiliste](../assets/mara-voice/README.md). Keine Änderungen an Animationen, Berührungszonen oder Belohnungen.
- **Ilyra / Voice 1:** Sieben ausdrücklich ausgewählte MP3s (325.440 Bytes), unverändert kopiert. Dieselbe Zufalls-/Abstands-/Abbruchlogik wie Mara; konstanter Pegelausgleich je Datei auf den Median von Maras zehn Clips (−19,445 LUFS vor gemeinsamem Faktor 0,7). [Dateien und reproduzierbare Messung](../assets/ilyra-voice/README.md). Manuelle Befehlsantworten verwenden einen getrennten Pool und geringeren Pegel (siehe unten).
- **Befehlsantworten:** Mara P11/P09/P07/P06/P03/P01/P14; Ilyra senpai1/2/3 und sweetheart1/2/3 für Auswahl/Bewegung, youremine1 für manuelle Sternensalve. Beide auf denselben Lautheitsreferenzwert angeglichen, gemeinsamer Faktor 0,5 (rund 2,92 dB unter Tavernenreaktionen). Ein Player mit sieben Sekunden Mindestabstand auch über Figurenwechsel hinweg; keine Warteschlange, keine Stimme bei Automatik/Reload/abgelehnten Befehlen. [Mara-Pool und Gesamtmischung](../assets/mara-command-voice/README.md). Alle 32 P-Dateien separat als Projektreserve archiviert, nur die sieben gewählten in der Spiellaufzeit.
- Aktuelle Gefährtenanimationen und Spielgrafiken unverändert. Kein zusätzlicher Bildbedarf.

## Noch offen

26.10.2026: Maras bewusste Auswahl auf der Karte oder über ihr Porträt bestätigt
sie auch vor Freischaltung ihrer Steuerung mit dem vorhandenen Auswahlpool.
Die frühe Infokarte vergibt keinen Bewegungsbefehl. Gleicher Pegel, gemeinsamer
7-Sekunden-Abstand, Mute-/Tabschutz; ihre selbstständigen kleinen Wege bleiben stumm.

Nächste sinnvolle Ergänzungen nach Hörfeedback: ein seltener Siegshinweis, eigener erfolgreicher Forschungs-/Freischaltklang, kurzer Steinschleuder-Abwurf. Elektrischer Kettenblitz/Feuerstoß erst mit den späteren Türmen.

Technische Pegelmessung und reale Browserwiedergabe wurden geprüft. Klangcharakter, musikalische Loopgrenzen und endgültige Mischung benötigen die Hörbewertung des Nutzers; keine subjektive Hörabnahme des Agenten behauptet. [Kompakter Prüfbericht](../../../artifacts/idle-bastion/acceptance/audio/REPORT.md).


Die isolierte `tavern-check.html` lädt nach der ersten Geste nur Klick, Handwerk und Geschenk vor (drei statt 17 Kurzklänge). Feldmusik wird dort nicht gestartet. Tavernenmusik und die einzelne nächste Stimme der ausgewählten Gefährtin bleiben bedarfsabhängig. Das Hauptspiel behält seine Kampfklänge und bisherigen Lautstärke-/Überlappungsgrenzen.

Frostkorrektur: ausdrücklich gewählte Ice-Spell-Buildup-Datei bytegleich übernommen, beide bisherigen Frostdateien entfernt. Sieben gezielte Audio-Tests, Audio-Lifecycle und Produktionsbuild bestanden; keine subjektive Hörabnahme behauptet. Die synthetischen Hörproben bleiben außerhalb des Spiels.

## Startbereitschaft · 27.10.2026

Der Ladeabschluss wartet bei eingeschalteter Kartenmusik auf `HAVE_ENOUGH_DATA` / `canplaythrough`. Diese Browsermeldung bestätigt Abspielbereitschaft; sie behauptet keinen vollständigen Download der gesamten MP3. Stumm oder Musiklautstärke 0 überspringen die Wartephase. Wiedergabe bleibt an die erste Bedienung gebunden. Bei Ladefehler oder nach 25 Sekunden ohne Bereitschaft bleiben Wiederholen und ausdrücklich „Ohne Musik fortfahren“ erreichbar. Diese Wahl setzt ausschließlich die Musiklautstärke auf 0. Kein stillschweigendes Überspringen und keine künstliche Mindestladezeit.

# Mara · manuelle Befehlsantworten

Nutzerauswahl vom 26.10.2026: **P11, P09, P07, P06, P03, P01, P14** aus der korrigierten
P01–P32-Hörliste. Sieben bytegleiche Kopien der geschnittenen Float-PCM-WAVs, zusammen
2.881.628 Bytes. [Vollständige Reserve, Schnittgrenzen und Reproduktion](../../../../artifacts/idle-bastion/audio-reserve/pyro-vocals/README.md).

Quelle: [Sexy vocals — pyro13djt](https://freesound.org/people/pyro13djt/sounds/337997/),
CC0, am 26.10.2026 auf der Quellenseite geprüft. Diese Dateien sind unabhängig von
Maras bisherigen zehn Tavernenstimmen aus dem Marti-Topmade-Pack.

Ein gemeinsamer Pool für manuelle Auswahl, erfolgreiche Bewegung/Zielzuweisung und
manuell gestarteten Zauber. Zufällig ohne direkte Wiederholung. Beide Heldinnen
teilen sich einen einzigen Player und sieben Sekunden Mindestabstand; keine
Warteschlange. Automatische Zauber, Laden und abgelehnte Befehle bleiben ohne
Sprachbestätigung. Taverne, Mute, Stimmenregler null, Hintergrund und Sessionverlust
stoppen den Player. Downloads erst bei einer tatsächlich ausgespielten Antwort.

`scripts/measure-tavern-voices.py` misst die unveränderten Dateien. Gemeinsamer
Referenzwert −19,445 LUFS, danach Befehlsfaktor **0,5** statt Tavernenfaktor 0,7:
rund **2,92 dB leiser**. Bei Standard-Stimmenregler 55 % liegt die angeglichene
integrierte Lautheit bei rund −30,66 LUFS. Auch beim maximalen Stimmenregler bleiben
alle Befehlsclips unter −8,19 dBTP. Keine neue Dynamikkompression; Musik-/Effektpegel
und gespeicherte Reglerwerte unverändert. Messwerte ersetzen keine subjektive Hörabnahme.

Die zentralen Messdaten inklusive SHA-256 liegen in `../ilyra-voice/levels.json`.

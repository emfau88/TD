# Ilyra · Tavernenreaktionen

Sieben am 26.10.2026 ausdrücklich gewählte Original-MP3s aus dem lokalen Nutzerordner
`SOUNDS/TD IDLE SPIRE/succubus/Voice 1`: `voice1-giggle1`, `voice1-good1`,
`voice1-goodboy1`, `voice1-lookonlyatme1`, `voice1-senpai1`, `voice1-sweetheart1`,
`voice1-wouldntyou1`. Zusammen 325.440 Bytes, bytegleich kopiert, nicht neu kodiert.
Quelle: [Free Yandere Voice Pack / Voice Pack 02](https://maskedintrovert.itch.io/free-yandere-voice-pack)
von **MaskedIntrovert**. Anbieterbedingungen am 27.10.2026 geprüft: persönliche und
kommerzielle Verwendung erlaubt; keine eigenständige Verwendung, kein Weiterverkauf
und kein Ausgeben als eigene Aufnahmen. Eigene Anbieterbedingungen, **nicht CC0**.
Namensnennung bleibt in den Audio-Credits im Spielmenü. Quellen und Bedingungen stehen in `docs/SOURCES_AND_LICENSES.txt` und werden als lokale, nicht verlinkte Lizenzangaben mitgeliefert.
Die Zuordnung beruht auf dem bereitgestellten Pack und den Dateinamen; ein zusätzlicher
Bytevergleich mit dem Original-Downloadarchiv wurde hier nicht durchgeführt.

Alle drei bestätigten Berührungen verwenden denselben Pool: keine direkte Wiederholung,
keine Überlagerung, mindestens 2,5 Sekunden zwischen Starts. Nur die nächste Datei lädt
in Ilyras Charakteransicht vor. Figurenwechsel, Schließen, Tabwechsel, Stimmenregler
auf null und Stummschalten stoppen die Stimme. Manuelle Kartenbefehle haben einen getrennten Pool (siehe unten).

`levels.json` enthält SHA-256, EBU-R128-Lautheit und True Peak aller sieben Dateien und
der zehn unveränderten Mara-Dateien. Zielwert ist deren Median −19,445 LUFS vor dem
gemeinsamen Faktor 0,7 und dem Stimmenregler. Ilyras konstante Anpassungen je Clip liegen
zwischen +2,315 und +10,345 dB; der höchste angepasste True Peak liegt vor dem Faktor 0,7
bei −5,695 dBTP. Keine dynamische Kompression oder Änderung an Tempo/Tonhöhe hinzugefügt.
Maras Pegel bleiben unverändert. Messwerte ersetzen keine subjektive Hörabnahme.

Reproduktion vom Repository-Verzeichnis:

```powershell
python scripts/measure-tavern-voices.py --ffmpeg <Pfad-zu-ffmpeg.exe>
```

Das erzeugt den Messbericht und `src/ilyra-voice-levels.ts` erneut; Audiodateien werden
nur gelesen. [Browserprüfung](../../../../artifacts/idle-bastion/acceptance/ilyra-voice/REPORT.md).

## Manuelle Befehle

Zusätzlich senpai2/3, sweetheart2/3 und youremine1 bytegleich übernommen (206.400 Bytes).
Auswahl und Bewegung verwenden senpai1/2/3 sowie sweetheart1/2/3, eine bestätigte
manuelle Sternensalve youremine1. Die ursprünglichen sieben Tavernenclips bleiben
unverändert ausgewählt. Derselbe Lautheitsreferenzwert, Befehlsfaktor 0,5 statt 0,7
(rund 2,92 dB leiser als die Tavernenreaktionen), Stimmenregler und sieben Sekunden
Mindestabstand gemeinsam mit Mara. Kein zusätzlicher Download beim Kartenstart.
Automatische Zauber, automatische Einführungsauswahl und abgelehnte Befehle sind stumm.

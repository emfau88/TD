# Ilyra · sieben Tavernenstimmen, 26.10.2026

Auf ausdrücklichen Nutzerauftrag direkt auf `main`, ausgehend von `d79e8e3`.
Die zuvor visuell freigegebene I03-Ellbogenkorrektur ist damit enthalten.

## Änderung

- Exakt die sieben ausgewählten `voice1-*.mp3` aus `succubus/Voice 1`, bytegleich
  übernommen (325.440 Bytes). Gemeinsamer Pool für bestätigte Hand-, Haar- und
  Schulterberührungen, keine unmittelbare Wiederholung, keine Überlagerung und
  mindestens 2,5 Sekunden zwischen Starts.
- Bisherige Mara-Wiedergabelogik in `CompanionVoice` geteilt; alle zehn Mara-Dateien
  und ihre Pegel unverändert. Nur der nächste Clip der geöffneten Gefährtin lädt vor.
  Bestehender Stimmenregler und Audio-Lifecycle steuern beide Gefährtinnen.
- Konstanter Pegelausgleich je Ilyra-Datei gegen den Median der zehn Mara-Dateien:
  −19,445 LUFS vor gemeinsamem Faktor 0,7 und Nutzerregler. Anpassungen +2,315 bis
  +10,345 dB, maximal −5,695 dBTP vor dem Faktor 0,7. Unveränderte Audiodateien,
  keine neue Dynamikkompression, Tempo- oder Tonhöhenänderung.
- DE-/EN-Menühilfe und Audioquellen aktualisiert. Keine neuen Karten-/Befehlsstimmen,
  Spielregeln, Savewerte, Animationen oder Belohnungen.

## Geprüft

- 14/14 gezielte Tests: bestehende sieben Audiotests, fünf Sprachtests und zwei
  Pool-/Originaldatei-/Kalibrierungsprüfungen.
- `npm run build`: TypeScript, Vite und vollständiges Pages-Paket erfolgreich.
- `check-browser.mjs`: isolierte native Spielstände auf Desktop (1280 px) und
  Hochkant (390 px). Alle drei Berührungszonen starten die Stimme, Folge-Taps
  überlagern sie nicht. Figurenwechsel stoppt Ilyra, Mara spielt mit unverändertem
  Faktor 0,7. Mute, Stimmenregler null und Schließen stoppen die Wiedergabe.
- Keine Mediendownloads auf der Karte; vor erster Berührung nur die nächste
  Ilyra-Datei vorgeladen. Alle sieben MP3s zusätzlich im Browser erfolgreich
  dekodiert; tatsächliche GainNode-Pegel entsprechen der Kalibrierung. Keine
  unmittelbare Wiederholung in den aufgezeichneten Abläufen und keine Browserfehler.
  [Messdaten](browser-results.json).
- Erste Durchläufe des Testskripts korrigiert: Vite-URL-Module zählen nicht als
  Mediendownload; schneller Folge-Tap ohne Playwright-Stabilitätswartezeit; aus
  Berührungsansicht zweimal Zurück bis zur Übersicht. Kein Produktfehler dabei gefunden.

Pegelreproduktion: `python scripts/measure-tavern-voices.py --ffmpeg <ffmpeg.exe>`.
[Kalibrierung und Dateiquellen](../../../../experiments/idle-bastion/assets/ilyra-voice/README.md).
Keine Vollsuite, physische Smartphone-Prüfung oder subjektive Hörabnahme behauptet.
Die separate lokale Pyro-Hörliste ist eine Auswahlhilfe und kein Teil des veröffentlichten Spiels.

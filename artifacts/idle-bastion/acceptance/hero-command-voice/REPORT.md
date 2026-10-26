# Mara und Ilyra · Befehlsstimmen und Reserve

26.10.2026 · direkt auf `main`, Ausgangsstand `224ee70`, auf ausdrückliche
Klarstellung und anschließende Clipauswahl des Nutzers. Commit/Push autorisiert.

## Umsetzung

- Mara: exakt P11, P09, P07, P06, P03, P01 und P14 aus der korrigierten Hörliste mit
  32 echten Einzeldateien. Gemeinsamer Zufallspool für Auswahl, erfolgreiche Bewegung/
  Turmzuweisung und manuell gestarteten Boost, ohne direkte Wiederholung.
- Ilyra: senpai1/2/3 und sweetheart1/2/3 für Auswahl/Bewegung; youremine1 für die
  erfolgreich gestartete manuelle Sternensalve. Fünf zusätzliche Original-MP3s,
  senpai1 und sweetheart1 mit den bestehenden Tavernenclips geteilt.
- Ein gemeinsamer HTMLAudio-/WebAudio-Player: sieben Sekunden Mindestabstand auch
  zwischen Figuren, keine Überlagerung und keine Warteschlange. Audio erst nach
  erfolgreichem manuellen Befehl; automatische Zauber/Einführungsauswahl, Laden und
  abgelehnte Aktionen erzeugen keine Sprachbestätigung. Auswahl benötigt eine
  bewusste Nutzeraktion. Kein Vorladen der Befehlsstimmen beim Kartenstart.
- Beide Pools auf denselben gemessenen Referenzwert −19,445 LUFS angeglichen, dann
  Faktor 0,5 statt 0,7 bei Tavernenreaktionen: 2,92 dB leiser. Am Standardregler 55 %
  rund −30,66 LUFS. Maximaler True Peak aller Befehlsdateien am Regler 100 % unter
  −8,19 dBTP. Quelldateien/Tempo/Tonhöhe und bestehende Musik-/Effektregler unverändert.
- Alle 32 P-Clips mit stabilen IDs, Samplegrenzen, Dateihashes, Quellen-/CC0-Angabe
  und eigenständiger Hörseite als Projektreserve abgelegt. 15.099.760 Bytes, nicht im
  Pages-Paket. Im Spiel nur sieben bytegleiche Runtime-WAVs (2.881.628 Bytes).
  Keine Kampf-/Save-/Wirtschaftsänderung; bisherige Tavernenpools bleiben identisch.

## Prüfung

- 19/19 gezielte Audio-, Stimmenpool-, Reserve-, Heldensteuerungs- und Sprachtests.
- TypeScript, Vite und vollständiges Pages-Paket erfolgreich. Paket enthält exakt
  die sieben ausgewählten Mara-WAVs; ungewählte P-Clips/Reserve nicht enthalten.
- `check-browser.mjs`: getrennte native Spielstände, Mara bei 1280 px und Ilyra bei
  390 px. Echte UI-Auswahl, gültiger Bewegungsbefehl und manuelle Fähigkeit spielen
  jeweils die richtige Stimme ab. Schnelle Figurenwechsel bleiben im gemeinsamen
  Abstand; abgelehnte Bewegung dispatcht keinen Sprachbefehl. Stimmenregler 55 %,
  normale Musik-/Effektregler 16/55 %. Mute stoppt laufenden Clip. Keine Browserfehler.
  [Abläufe und tatsächlich gemessene GainNode-Werte](browser-results.json).
- `check-media.mjs`: alle 14 Befehlsclips dekodiert, tatsächliche Wiedergabegains
  gegen Kalibrierung geprüft. Taverne stoppt/blockiert Kartenstimmen, Regler null
  und inaktive Session blockieren Wiedergabe; Destroy entfernt Player. [Ergebnis](media-results.json).
- Der erste Browserprüflauf benötigte eine Anpassung des Test-Interceptors an
  Vites HMR-Query; keine Produktänderung aus diesem Testproblem.

Keine Vollsuite, physische Smartphone-Prüfung oder subjektive Hörabnahme behauptet.
Mara/Ilyra-Lautheitsmessungen sind über `scripts/measure-tavern-voices.py` reproduzierbar.
[Vollständige Reserve](../../audio-reserve/pyro-vocals/README.md).

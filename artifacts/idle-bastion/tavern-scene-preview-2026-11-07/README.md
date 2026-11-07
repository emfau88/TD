# Beide Tavernenszenen direkt testen

**[Lokale Testansicht öffnen](http://127.0.0.1:5292/)** · **[Offline-Datei](index.html)**

Der Link läuft auf dem Entwicklungs-PC. Die einzelne `index.html` enthält alle Videos und funktioniert nach dem Öffnen im Browser auch ohne Server/Internet. Auf einem anderen Gerät die Datei dorthin kopieren; `127.0.0.1` verweist immer auf das jeweilige Gerät.

Mara am Tresen: MC01–MC07. Ilyra am Fenster: IF01–IF05. Figur wählen, Reaktion anklicken, automatische Rückkehr zur jeweiligen Ruhepose. IF01–IF05 und alle Mara-Clips freigegeben und im Spiel integriert. IF06/IF07 fehlen weiterhin. Keine Ersatzreaktion aus einem anderen Raum.

Reine stumme Sichtprobe, kein Spielstart und kein Zugriff auf Spielstände. Sie prüft Lesbarkeit, Zusammengehörigkeit und Übergänge der Clips. Maras tatsächliche Spielintegration und ihre unveränderten Stimmen wurden separat geprüft; [echte Ingame-Screenshots und Ergebnis](../tavern-counter-visual-audit-2026-11-07/REPORT.md). [Ilyras Fensterset ist jetzt ebenfalls integriert und geprüft](../ilyra-window-integration-2026-11-07/REPORT.md).

Die MP4s sind unverändert in die Datei eingebettet. `source.html` und `build.py` erzeugen die transportable Fassung; es werden keine neuen Clips berechnet. Server bei Bedarf aus diesem Verzeichnis starten:

```powershell
python -m http.server 5292 --bind 127.0.0.1
```

Geprüft bei 1200 und 390 Pixel Breite: sämtliche zehn Einzelreaktionen plus beide Ruheclips, automatische Rückkehr, schnelle konkurrierende Auswahl, keine Browserfehler oder horizontalen Überläufe. Die einzelne Offline-Datei separat geöffnet und IF05 abgespielt. [Messungen](results.json). Die tatsächliche Spielintegration wurde separat geprüft; diese Seite bleibt eine stumme Sichtprobe.

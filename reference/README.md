# Spire – ursprüngliche drei Karten als Vergleichsbasis

M0, erstellt am 16.10.2026. Separat spielbare Rekonstruktion des Quellstands vom 14.10.2026, kein wiedergefundenes historisches Programm. Anschließend wurden auf Nutzerwunsch Baumzuschnitte und Wasser korrigiert; [Änderungen und aktuelle Ansichten](../artifacts/terrain-fix/REPORT.md). Das neuere Spiel im übergeordneten Verzeichnis bleibt erhalten.

## Spielen

- Im Projektordner `ORIGINAL SPIEL STARTEN.cmd` doppelklicken oder hier `Spire-Original.html` öffnen.
- Enthalten: **Der alte Hain**, **Die Nebelbrücke**, **Die letzte Lichtung**, acht Türme und jeweils 20 Wellen.
- Maus: Turm auswählen und auf einer freien Wiese platzieren; gebauten Turm anklicken für Aufwertung, Priorität und Verkauf.
- `1–8`: Turmwahl, `Escape`: Auswahl aufheben, `N`: Welle starten, `U`: aufwerten, `Leertaste`: Pause, `F`: 1×/2×.

Sterne, beste Wellen, Tutorial und Audioeinstellungen werden separat unter `spire-reference-save-v1` gespeichert. Laufende Partien lassen sich nur innerhalb der geöffneten Seite fortsetzen; nach Neuladen gibt es in diesem ursprünglichen Stand keinen Bauphasen-Zwischenstand. Bestehende Daten des neueren Spiels unter `spire-save` werden nicht verändert.

## Spielbare Grafikprobe M1

`GRAFIKPROBE STARTEN.cmd` im Projektordner öffnet die separate Waldlichtung mit Originalgelände, Wisp, Mara und echtem Turmkampf. Alternativ `Spire-Style.html` öffnen oder auf dem Entwicklungsserver `/style.html` aufrufen. Q/E wählt eine Figur, Klick auf freien Boden bewegt sie. „Bewegung zeigen“ lässt beide Figuren alle Richtungen durchlaufen; „Testwelle starten“ startet die vorhandene Kampfsimulation. Die Probe speichert keinen Fortschritt.

Build aus dem Projektordner: `npm run reference:style:build`. Die Ausgabe liegt unter `reference/style-dist/` und `reference/Spire-Style.html`. [Konkrete Grafikvorgaben](STYLE_GUIDE.md), [Prüfbericht](../artifacts/m1/REPORT.md). Nutzerabnahme offen; Mara besitzt bisher zwei Gehposen je Richtung und vorläufige Aktionsposen.

## Entwicklung und Prüfung

Alle Befehle im **übergeordneten Projektordner** ausführen. Die Referenz verwendet dessen vorhandene Abhängigkeiten und `package-lock.json`:

```text
npm run reference:dev
npm run reference:test
npm run reference:build
```

Der Entwicklungsserver verwendet `http://127.0.0.1:5180/`. Der Build erstellt `reference/dist/` und `reference/Spire-Original.html`. Er kopiert und prüft die 84 ursprünglichen Spielgrafiken gegen die Foozle-Pakete sowie die sieben vorhandenen Wald-UI-Grafiken. Aus Git allein vor dem ersten Start den Referenzbuild ausführen; die erzeugten PNG-Kopien und die HTML-Ausgabe werden nicht doppelt versioniert. Bei fehlenden Abhängigkeiten zuerst im Projektordner `npm ci` ausführen.

Die historischen Hilfsskripte sind als Beleg erhalten. Insbesondere `scripts/prepare-assets.py` erwartet die frühere Ordnerstruktur; für diese isolierte Referenz stattdessen die obigen Befehle verwenden.

## Herkunft und aktueller Status

[M0-Prüfbericht](../artifacts/m0/REPORT.md) mit Screenshots, Tests und Abweichungen; [Roadmap](../ROADMAP.md) für die nächsten Schritte. Der unveränderte rekonstruierte Quellstand liegt zusätzlich in `artifacts/m0/historical-source.zip` im Projektordner. Historische Änderungen und Hashes sind in `artifacts/m0/recovery.json` protokolliert.

Unter Git-Tag `m0-original-reference` entsprechen Kartendaten, Renderer und Simulation dem rekonstruierten Quellstand. `reference-terrain-fixed` hält die bestätigten Baum- und Wasserkorrekturen fest. M1 erweitert die Basisklasse lediglich um Schnittstellen für die separate Probe; die drei Originalkarten behalten ihre Darstellung und Spielmechanik. M1 verwendet vorhandene Figuren und Originalgelände. Es wurden keine neuen Grafiken generiert.

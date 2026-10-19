# UI-Schriften

`PixelifySans.ttf`: unveränderte Originalschrift, Copyright/Projektadresse und SIL-OFL in `OFL.txt`.

`SpireClearDigits.ttf`: drei eigenständig gezeichnete Pixelglyphen für **2, 5, 8**. CSS bindet sie ausschließlich für diese Unicode-Zeichen vor Pixelify Sans ein. Zeichenbreite 586, Rasterbreite 93 und gemeinsame Grund-/Oberlinie passen zur bestehenden Schrift; alle anderen Zeichen bleiben original. Rund 1,3 KB, keine externe Schriftanfrage oder neue Laufzeitabhängigkeit.

Reproduzierbar mit `scripts/build-clear-digits.py` (optionales Autorenwerkzeug `fonttools` nötig). Die Rastermuster stehen vollständig im Skript. Keine Originalglyphen kopiert, Originalfont und Lizenz unverändert.

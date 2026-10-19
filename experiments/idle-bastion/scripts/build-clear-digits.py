"""Optional authoring utility: python -m pip install fonttools; then run this file.
Creates three original bitmap-style outlines, matching the existing Pixelify metrics.
No original font glyphs are copied; the application only loads the tiny output TTF.
"""
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

PATTERNS = {
    "two": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "five": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "eight": ["11111", "10001", "10001", "11111", "10001", "10001", "11111"],
}
fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder([".notdef", *PATTERNS])
fb.setupCharacterMap({ord(c): name for c, name in zip("258", PATTERNS)})
glyphs = {".notdef": TTGlyphPen(None).glyph()}
for name, rows in PATTERNS.items():
    pen = TTGlyphPen(None)
    for row, cells in enumerate(rows):
        # Merge each horizontal run to avoid seams between adjacent pixel cells.
        column = 0
        while column < 5:
            if cells[column] == "0":
                column += 1
                continue
            start = column
            while column < 5 and cells[column] == "1":
                column += 1
            left, right = 60 + start * 93, 60 + column * 93
            bottom, top = 632 - (row + 1) * 92, 632 - row * 92
            pen.moveTo((left, bottom)); pen.lineTo((left, top))
            pen.lineTo((right, top)); pen.lineTo((right, bottom)); pen.closePath()
    glyphs[name] = pen.glyph()
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics({name: (586, 60) for name in glyphs})
fb.setupHorizontalHeader(ascent=920, descent=-280)
fb.setupNameTable({"familyName": "Spire Clear Digits", "styleName": "Regular", "uniqueFontIdentifier": "Spire-Clear-Digits-1", "fullName": "Spire Clear Digits", "psName": "SpireClearDigits", "version": "Version 1.0"})
fb.setupOS2(sTypoAscender=920, sTypoDescender=-280, usWinAscent=920, usWinDescent=280, sxHeight=460, sCapHeight=632, usWeightClass=500)
fb.setupPost(); fb.setupMaxp()
# Stable asset hash on regeneration.
fb.font["head"].created = fb.font["head"].modified = 3864758400
fb.font.recalcTimestamp = False
fb.save(Path(__file__).resolve().parents[1] / "assets/ui/fonts/SpireClearDigits.ttf")

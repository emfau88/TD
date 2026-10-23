# Lokale Monsterimporte · E01

Grafiken: **Frakassets**, [Free Monster Pack](https://frakassets.itch.io/free-monster-pack),
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
Der unveränderte Lizenztext aus dem Download liegt in `LICENSE-Frakassets.txt`.
Namensnennung, Quelle, Lizenzlink und Änderungsvermerk sind im Spielmenü unter
[Gegnergrafiken & Lizenzen](../../enemy-credits.html) erreichbar.

## Auswahl und Änderungen

| Atlas | Original | Bewegung | PNG-Bytes |
| --- | --- | --- | ---: |
| MossShroom | mushroom-monster-red | Walk · 8 Bilder × 4 Ansichten, zwei Kappenpaletten | 19.195 |
| WoodSpider | fuzzy-spider-purple | Walk · 8 × 4 | 14.561 |
| HornedBat | horned-bat-purple | Idle/Flügelschlag · 6 × 4 | 10.269 |
| EmberBomb | bomb-walker-black | Walk · 8 × 4 | 8.744 |

Top-down, **48 Pixel, mit Kontur**, Lit + Shine zusammengeführt. Keine andere
Auflösung, Normalmap, Angriffsanimation oder Quellsammlung wird ausgeliefert.
Quellrechtecke, South/East/North/West, Index, Pivot und 83/84-ms-Dauern stammen
explizit aus dem mitgelieferten Pixor-JSON. West ist eine eigene Ansicht.
Die Originalframes werden ohne Resampling in 64er Zellen gepackt; der feste
Bodenpivot liegt bei (32,43), entsprechend SPIREs vorhandenem Schattenanker.
Der Quellpivot ist der Mittelpunkt des projizierten Bodenschattens, nicht die
unterste sichtbare Bein-/Flügelkante; einzelne Frames werden nicht neu zentriert.

Moospilz erhält zusätzlich eine grüne Kappenpalette durch gezieltes Umfärben
satter roter Pixel; Alpha, Kontur, Körper und Frames bleiben erhalten. Beide
Paletten teilen **eine** Gegnerdefinition und dieselben Clips. Die vorhandene,
gespeicherte Gegner-UID wählt die kosmetische Palette reproduzierbar. Keine
zusätzliche Save-Eigenschaft und kein zusätzlicher Gegnertyp pro Farbe.

Zusammen **52.769 Bytes / 51,5 KiB PNG**, vier Texturen, ca. **2,5 MiB** dekodierte
RGBA-Texturen. Die Original-JSON-Auszüge dienen nur dem Importnachweis und werden
nicht vom Spiel angefordert. Die benötigten Clipdaten liegen in
`src/local-enemy-frames.ts`. `sources.json` dokumentiert lokale Archivnamen,
Dateigrößen und SHA-256, enthält aber keine Originalarchive.

## Reproduzieren

Im Repository-Stamm mit Python 3 und Pillow:

```powershell
python experiments/idle-bastion/scripts/import-local-enemies.py --runtime
```

Der Import liest `%USERPROFILE%\Downloads`; `--downloads PATH` ändert den Ort.
Kein Netzwerkzugriff. Ohne `--runtime` wird ausschließlich die private Galerie
regeneriert. Zum normalen Bauen werden weder Downloads noch Python benötigt.

## Shroom Men bleibt privat

[The Game Smith · Shroom Men](https://not-a-kappa-games.itch.io/shroom-men)
erlaubt Spielnutzung und Bearbeitung, schränkt eigenständige Asset-Weitergabe ein.
Die öffentliche Repository-Weitergabe ist nicht eindeutig geregelt. Daher sind
**sämtliche Shroom-Men-Originale, Farbvarianten, Sporen und Vergleichsbilder** nur
unter `.local-assets/` lokal gespeichert, in Git ignoriert und nicht im Build.
Vor einer öffentlichen Integration ist eine ausdrückliche Klärung mit dem
Urheber erforderlich. Das ist kein Ausschluss einer erlaubten Spielnutzung.

Die fünf Figuren und 96 Originalpaletten sind lokal in `enemy-lab.html` wählbar;
sie teilen fünf Clipsätze. Ein Pilz im Spiel ist ausschließlich das separat
lizenzierte Frakassets-Original. `ShroomShadows.png` wird wegen des vorhandenen
SPIRE-Bodenschattens nicht verwendet; Sporeburst erhält keinen zusätzlichen
Kampfzweck. Das lokale Foozle-Skeleton-ZIP ist mit der bereits integrierten
Quelle byteidentisch und wird nicht erneut importiert.

# Waldwächter – isolierte Grafikstudie

Stand: 29.10.2026. Ausgangspunkt: `ff65d67b943d35d55f3e6518274ddf78760f88ab` auf main.

[HTML-Vorschau](https://emfau88.github.io/TD/prototypes/waldwaechter-evolution/) · [Vergleich aller sechs Stufen](comparison.png) · [Einzelassets](assets/)

## Ergebnis und Umfang

Drei neue statische Pixelart-Skins für die Vergleichsstufen 10, 15 und 20, jeweils mit separater Basis und Waffe. Level 1/4/7 sind pixelidentische Ausschnitte der Originalatlanten. Keine Änderung an produktivem Rendering, Spielregeln, Speicherständen, Originalassets oder Kongregate-Export. Nur die Pages-Verpackung kopiert die Studie unter eine eigene URL.

Nach der visuellen Rückmeldung des Nutzers wurden die hohen Brüstungen und Kronenspitzen verworfen. Die finalen Basen haben **alle dieselbe sichtbare Begrenzung wie Original-Level 7: 64 × 116 Pixel**, im unveränderten 64 × 128-Frame. Die drei neuen Stufen wachsen somit weder nach oben noch zur Seite. Unterschiede entstehen durch Träger, offene Plattformen und Waffenbau.

- **10:** Stahlträger und schwere dreifache Armbrust.
- **15:** kantige Doppelarme, verstärkte Verbindungspunkte, zurückhaltende Goldflächen.
- **20:** V-Streben, kräftigere goldene Verbindungen und Meistergeschütz.

Die separaten Waffen bleiben im 96 × 96-Frame. Ihr statischer Rotationsradius beträgt höchstens 31,69 native Pixel; damit bleiben sie auch beim Drehen innerhalb der 64-Pixel-Breite der Basis. Das ersetzt keine spätere Animationsprüfung.

## Authentischer Maßstab

Aus `tower-atlas.ts`, `art.ts` und `battle-scene.ts` übernommen:

- Basis: 64 × 128, Ursprung (0,5 / 0,8), Y-Versatz +13.
- Waffe: 96 × 96, Ursprung (0,5 / 0,5), Y-Versatz −23.
- Renderfaktor: 0,63. Kartenfeld: 40 Welteinheiten.
- Normale Hochkantkamera: max(Höhe / 640, Breite / 640).
- Normale Desktopkamera: min(Breite / 1120, Höhe / 640).
- Keine Anpassung an die Zahl der gezeigten Türme, kein künstliches Vergrößern des Kartenausschnitts.

Die Karte ist ein **separat nachgebildeter Ausschnitt** aus originalen Gras-, Weg- und Baumtexturen, nicht das laufende Spiel. Sechs Türme stehen auf unmittelbar benachbarten Feldern. Tutorialfokus, Übersichtszoom und manuelles Zoomen sind ausdrücklich nicht simuliert.

| Referenzfenster | Kamerazoom | Breite der Turmbasis |
|---|---:|---:|
| 390 × 844 | 1,31875 | 53,17 CSS-Pixel |
| 320 × 568 | 0,8875 | 35,78 CSS-Pixel |
| Desktop ca. 1280 × 800 | ca. 1,14 | ca. 46,1 CSS-Pixel |

Die Detailansicht nutzt ganzzahlige Vergrößerungen ohne Glättung. Der direkte Vergleich zeigt native Frames. Levelbeschriftungen lassen sich ausblenden; die in den unveränderten Originalfahnen enthaltenen römischen Ziffern bleiben erhalten.

## Nachweise

Echte Browser-Screenshots der separaten Vorschau, keine gestalteten Mockups:

- [390 × 844, mit Leveln](screenshots/waldwaechter-390.jpg)
- [390 × 844, ohne Level](screenshots/waldwaechter-390-blind.jpg)
- [320 × 568, mit Leveln](screenshots/waldwaechter-320.jpg)
- [320 × 568, ohne Level](screenshots/waldwaechter-320-blind.jpg)
- [Desktop](screenshots/waldwaechter-desktop.jpg)

Geprüft: alle sechs Detailstufen, Beschriftungen an/aus, 2×/3×/4×-Vergrößerung (4× mit eigenem horizontalem Scrollbereich), mobile Gesamtbreite ohne horizontalen Seitenüberlauf, getrennte Basis-/Waffenlinks, Reload. Keine Browser-Konsolenfehler bei diesen Prüfungen.

- `python prototypes/waldwaechter-evolution/verify-assets.py`: bestanden; Originalpixel, Frames, harte Transparenz, SHA-256, identische Gebäudegrenzen und statische Waffenradien.
- `node --check prototypes/waldwaechter-evolution/preview.js`: bestanden.
- `npm test`: **421/421**, keine übersprungenen Tests.
- `npm run build`: bestanden; eigenständige Vorschau im Pages-Ausgabeverzeichnis.

## Kritische Bewertung

Richtige neue Konstruktionen funktionieren hier besser als kleine Symbole oder Farbfilter: Waffenarme, Stützen und große Materialflächen bleiben bei Spielgröße lesbar. Der Sprung von Original-Level 7 zu Level 20 ist auch bei 320 Pixel Breite sichtbar, ohne die Gebäude zu vergrößern. Die Familie bleibt über Steinplattform, Holzfront, blaue Fahne und Armbrust erkennbar.

**Grenze:** Zwischen 15 und 20 ist die Abstufung bei 320 Pixel Breite weniger eindeutig als bei 390. Kleine Pfeilführungen und Nieten gehen verloren; der Eindruck trägt hauptsächlich über Goldflächen und Streben. Die neuen Stufen sind außerdem detailreicher als das Originalpack. Dies ist ein brauchbarer visueller Prototyp, noch keine Freigabe für die Integration.

Nicht geprüft/erst für eine spätere Integration relevant: neue Angriffsframes, wechselnde Schussrichtungen im Kampf, Effekte/Einheiten vor den Türmen und Performance im vollständigen Spiel. Die Studie erzeugt keine Animationen.

## Empfohlene spätere Levelstaffelung

Auf die anschließende Nutzerfrage wird **1 / 2 / 3 / 5 / 10 / 15 / 20 / 25** empfohlen: sichtbare frühe Entwicklung, danach klare Fünferschritte. Die drei Originalgrafikstufen würden dabei auf Spiellevel 1/2/3 rücken; aktuell sind sie bewusst noch mit den bestehenden Spielschwellen 1/4/7 gezeigt.

Die Entwürfe für 5 und 25 fehlen. Diese Empfehlung ist weder eine zusätzliche Assetproduktion noch eine Änderung der Spielzuordnung. Integration und endgültige Staffelung bleiben eine gemeinsame spätere Entscheidung.

## Quellen und Reproduktion

- Originale: `public/assets/Tower 01.png`, `Tower 01 - Level 01/02/03 - Weapon.png`, `Grass Tileset.png`.
- Neue Entwürfe: eingebautes **Imagegen**-Tool. Vollständige Prompts in [PROMPTS.json](sources/PROMPTS.json) und [COMPACT-PROMPTS.json](sources/COMPACT-PROMPTS.json).
- Generierte Quellen getrennt von den gepackten Sprites in `sources/`. Die älteren Gesamtentwürfe dienen weiter als Waffenquelle; für die Basen werden ausschließlich die kompakteren Revisionen verwendet.
- `pack-assets.py` schneidet die Bauteile zu, richtet sie an den ursprünglichen Montagepunkten aus und reduziert mit Nearest Neighbour auf das native Raster. Begrenzte 32-Farben-Palette je neuem Bauteil, binäre Transparenz, keine nachträglichen Farbfilter oder prozeduralen Verzierungen.
- Python/Pillow ist nur für die Asset-Aufbereitung erforderlich. Die Vorschau selbst hat keine zusätzliche Bibliothek.
- Lokal: `python -m http.server 5192 --directory prototypes/waldwaechter-evolution`, dann http://127.0.0.1:5192/ öffnen. Wegen JSON-Laden ist ein HTTP-Server erforderlich.


## Veröffentlichung

Prototyp-Commit: [48b2276](https://github.com/emfau88/TD/commit/48b2276aa18b3ab27030d664f9ffbf387888e9b9), direkt auf main gepusht.
[Pages-Lauf 40931266839](https://github.com/emfau88/TD/actions/runs/40931266839): erfolgreich.
Die öffentliche Vorschauseite wurde anschließend im echten Browser geöffnet: alle sechs Stufen geladen, Karte und Vergleich sichtbar, keine Konsolenfehler. Die gemeinsame gestalterische Freigabe bleibt offen.

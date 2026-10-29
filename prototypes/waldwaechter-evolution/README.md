# Waldwächter – kompakte Grafikstudie, Revision 2

Stand: 29.10.2026. Ausgangsstand dieser Revision: `67f5f86222ed0eea4d4e7ac43948bc0c7f213541` auf main.

[Interaktive Vorschau](https://emfau88.github.io/TD/prototypes/waldwaechter-evolution/?revision=2) · [Alle acht Stufen](comparison.png) · [Kompakte Assets](assets/compact/) · [Geometrieprüfung](geometry-check.json)

## Was geändert wurde

Die Rückmeldung zur Verdeckung hinterer Reihen war berechtigt. Die erste Studie begrenzte die neuen Gebäude lediglich auf die bereits hohe dritte Originalstufe. Das war kein ausreichender Mehrreihentest.

- **Staffelung im Prototyp: 1 / 2 / 3 / 5 / 10 / 15 / 20 / 25.**
- Die drei Originaldesigns entsprechen jetzt den Prototyp-Leveln 1/2/3. Ihre Originaldateien bleiben unverändert; für die Vorschau existieren separate kompakte Varianten.
- Neue Imagegen-Skins für **5** (Holz-/Eisenverstärkung) und **25** (Kreuzstreben und zwei kompakte Bogeneinheiten) ergänzen die bisherigen Entwürfe 10/15/20.
- Alle zusammengesetzten Türme inklusive ruhender Waffe passen in höchstens **64 × 92 native Pixel**. Die bisherige große Basis allein war 64 × 116 Pixel hoch.
- Bei Faktor 0,63 ergibt das höchstens **57,96 statt 73,08 Kartenpixel Höhe**: bei den hohen Stufen rund 21 % weniger.
- Breite und Bodenkontakt bleiben gleich. Oberer Aufbau und Waffe werden gemeinsam nach unten versetzt; der untere Körper wird verkürzt. Waffen werden dabei weder gestaucht noch verkleinert.
- Level 1 berücksichtigt zusätzlich seine über die Plattform ragende Pfeilspitze. Seine Basis ist 85 Pixel hoch; einschließlich Waffe bleibt er innerhalb des gemeinsamen 92-Pixel-Budgets.
- Neue Kartenansicht mit **zwei oder drei unmittelbar benachbarten Reihen**. Umschaltung zwischen kompaktem und bisherigem Höhenformat bei identischen Positionen. Beschriftungen sind optional und standardmäßig aus.

**Keine Integration ins Spiel.** Spielregeln, produktive Renderdateien, Levelzuordnung, Speicherstände, Originalassets und Kongregate-Export sind unverändert.

## Was der Reihenvergleich tatsächlich zeigt

Originale Gras-/Weg-/Baumtexturen, Feldabstand 40 Welteinheiten und dieselbe Tiefensortierung wie `battle-scene.ts`: Basis bei y+1000, Waffe bei y+1001. Die Kamera verwendet die normale Spielskalierung und vergrößert die Türme nicht, um die Vorschau zu füllen.

| Fenster | Kamerazoom | Reihenabstand | Breite einer Basis |
|---|---:|---:|---:|
| 390 × 844 | 1,31875 | 52,75 px | 53,17 px |
| 320 × 568 | 0,8875 | 35,50 px | 35,78 px |

Die Karte ist ein **separat nachgebildeter Ausschnitt**, keine Spielintegration. Zwei Reihen zeigen alle acht Stufen; drei Reihen wiederholen vier Stufen im Vordergrund. Der Modus „Bisheriges Format“ stellt auch die neuen Level 5/25 im alten Höhenbudget dar: Er ist eine Größenreferenz, keine Behauptung, diese Skins hätten vorher im Spiel existiert.

Die statische Alpha-Prüfung testet alle **64 Vorder-/Hinterturm-Kombinationen** bei 40 Welteinheiten Abstand:
- Alle ruhenden, nach oben gerichteten hinteren Geschütze bleiben vollständig sichtbar.
- Je nach hinterer Stufe waren im ungünstigsten Vordergrundfall zuvor **41,66–48,77 %** seiner undurchsichtigen Fläche verdeckt.
- In der kompakten Variante sind es **26,91–29,37 %**.
- Dies misst die verdeckte Grafikfläche, nicht den subjektiven Nutzen. Der hintere Unterbau wird weiterhin teilweise verdeckt.

## Echte Browsernachweise

| Größe | Bisheriges Höhenformat | Kompakt |
|---|---|---|
| 390 × 844 | [Screenshot](screenshots/waldwaechter-v2-390-before.jpg) | [Screenshot](screenshots/waldwaechter-v2-390-after.jpg) |
| 320 × 568 | [Screenshot](screenshots/waldwaechter-v2-320-before.jpg) | [Screenshot](screenshots/waldwaechter-v2-320-after.jpg) |
| Desktop | — | [Reihenvergleich](screenshots/waldwaechter-v2-desktop.jpg), [acht Einzelstufen](screenshots/waldwaechter-v2-desktop-comparison.jpg) |

Im Browser geprüft: 390/320 px, beide Höhenmodi, zwei/drei Reihen, Beschriftungen an/aus, alle acht Detailstufen, 4×-Vergrößerung mit eigenem Scrollbereich, getrennte Basis-/Waffenlinks, Reload und Desktop. Kein horizontaler Seitenüberlauf und keine Konsolenfehler bei diesen Prüfungen.

## Technische Prüfung

- `python prototypes/waldwaechter-evolution/verify-assets.py`: bestanden. Originalreferenzen pixelidentisch, native Framegrößen, harte Transparenz, SHA-256, unverzerrte Waffen, gemeinsames Höhenbudget, Rotationsradius innerhalb der Basisbreite und statische Verdeckung.
- `node --check prototypes/waldwaechter-evolution/preview.js`: bestanden.
- `npm run build`: bestanden. Nach den letzten statischen Anpassungen wurde das Pages-Paket erneut erzeugt und die kopierten Dateien verglichen.
- Keine Spielcodeänderung; daher in dieser Revision gezielte Asset-/Geometrie- und Browserprüfungen statt einer weiteren vollständigen Spieltestsuite. Die vorherige Revision hatte 421/421 bestandene Tests.

## Kritische Bewertung und Grenzen

Die kompakteren Körper sind für dichte Reihen überzeugender als das bisherige Höhenwachstum. Originalidentität, Waffenformen und starke Materialflächen bleiben lesbar. Die zusätzlichen Skins unterscheiden sich durch Konstruktion; Level 25 verwendet eine erkennbare Doppelbogen-Anordnung.

Drei direkt aufeinanderfolgende Reihen wirken weiterhin dicht. Das ist bei dieser Perspektive zu erwarten; Fahnen und Unterbauten können nicht gleichzeitig vollständig sichtbar bleiben. Level 15/20 sind bei 320 px näher beieinander als in der Detailansicht. Kompression reduziert außerdem die vertikale Auflösung der unteren Holz-/Steinflächen. Diese bewusste Grenze ist sichtbar und kein Anspruch auf fertige Produktionsgrafik.

Nicht durch die statische Prüfung abgedeckt: sämtliche Schusswinkel, neue Angriffsframes, bewegte Einheiten/Effekte zwischen den Türmen und Performance im laufenden Spiel. Der separate Waffenradius ist geometrisch begrenzt; das ersetzt keine spätere Animations-/Kampfprüfung. **Gemeinsame Sichtfreigabe und Spielintegration bleiben offen.**

## Quellen und Reproduktion

- `assets/reference/`: Vergleichsformat; Originalstufen 1/2/3 sind verlustfreie Ausschnitte aus den vorhandenen Atlanten.
- `assets/compact/`: separate kompakte Basis- und Waffen-PNGs für alle acht Level.
- Frames: Basis 64 × 128, Waffe 96 × 96. Basismontage +13, Ursprung (0,5 / 0,8), Faktor 0,63 unverändert. Der prototypeigene Waffenversatz steht pro Stufe in `manifest.json`.
- Neue Zeichnungen mit dem eingebauten **Imagegen**-Tool: [Prompts für 5 und 25](sources/PROGRESSION-PROMPTS.json). Frühere Entwürfe und [Prompts](sources/PROMPTS.json), [Brüstungsrevision](sources/COMPACT-PROMPTS.json) bleiben erhalten.
- `pack-assets.py`: reproduzierbare native Rasterpackung per Nearest Neighbour, binäre Transparenz und begrenzte Palette; keine Farbfilter als Ersatz für Skins. Der obere Bildbereich und die Waffe verschieben sich gemeinsam, nur der untere Körper wird vertikal verkürzt.
- `verify-assets.py` erzeugt `geometry-check.json`. Python/Pillow nur für Aufbereitung und Prüfung; keine neue Laufzeitbibliothek.
- Lokal: `python -m http.server 5192 --directory prototypes/waldwaechter-evolution`, danach http://127.0.0.1:5192/.

Vorgängerversion: Commit [48b2276](https://github.com/emfau88/TD/commit/48b2276aa18b3ab27030d664f9ffbf387888e9b9), damaliger [Pages-Lauf](https://github.com/emfau88/TD/actions/runs/40931266839). Alte Screenshots ohne „v2“ dokumentieren ausschließlich diesen früheren Stand.

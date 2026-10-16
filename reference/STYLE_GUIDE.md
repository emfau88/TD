# Spire – Grafikreferenz M1

Stand: 16.10.2026. **M1 vom Nutzer abgenommen.** Die spielbare Waldlichtung setzt die Maße konkret um; sie sind die Grundlage für M2. Die vollständige Waldkarte ist separat als `Spire-Wald.html` spielbar. Die M1-Probe bleibt als Vergleich erhalten.

Start: `GRAFIKPROBE STARTEN.cmd` im Projektordner oder `reference/Spire-Style.html`. Entwicklung: `http://127.0.0.1:5180/style.html`. [Prüfbericht und Spielansichten](../artifacts/m1/REPORT.md).

## Gemeinsamer Maßstab

Eine Spielzelle misst **40 × 40 Spieleinheiten**. Die Originalkarten bleiben 28 × 16 Zellen / 1120 × 640 groß. Die Grafikprobe zeigt 20 × 12 Zellen / 800 × 480 bei identischem Objektmaßstab. Bei ausreichender Fensterbreite entspricht eine Spieleinheit einem CSS-Pixel; auf kleinen Fenstern wird die gesamte Ansicht proportional verkleinert und die Ansichtsgröße angezeigt.

| Element | Quelle / Ausschnitt in Pixeln | Darstellung in der Probe | Bodenanker / Regel |
| --- | --- | --- | --- |
| Gras | `Grass Tileset`, x128/y64, 64 × 64 | 40 × 40; Faktor 0,625 | Kachelursprung links oben |
| Weg | 64 × 64, verbindende Originalteile; Zuordnung unten | 40 × 40; Faktor 0,625 | Durchgehende Breite und zusammenpassende Anschlüsse |
| Wasser | `Animated water tiles`; zehn 448 × 448 Konstruktionsframes; einzelne Teile 32 × 32 | 20 × 20 pro Teil; zwei Teile je Spielzelle | Quelle als Bauteilsatz, niemals den ganzen Frame auf einen Teich strecken |
| Einzelbaum | `Grass Tileset`; 62 × 64, vier grüne und vier herbstliche Varianten | Rahmen 49,6 × 51,2; Faktor 0,8 | Mitte unten, Position Zellmitte +12 y; blockiert eine Zelle |
| Waldwächter | `Tower 01`; Basis 64 × 128, Waffe 96 × 96 | Faktor 0,63; sichtbare Basis in Stufe I etwa 40 × 62 | Originalmontage: Basis Zellmitte +13 y, Ursprung (0,5 / 0,8); Waffe −23 y; eine Bauzelle |
| Blattkäfer | `Leafbug`; 64 × 64 pro Frame | Faktor 0,83; sichtbarer erster Frame etwa 18 × 32 | Originalgegner auf der Wegmittellinie; Größe variiert mit Pose |
| Wisp | `Wisp - Animations`; 64 × 64 pro Frame | Faktor 0,9; sichtbarer erster Frame etwa 23 × 30 | Ursprung (0,5 / 51÷64); bewusst kleiner als Mara |
| Mara | Bestehende `Hero Mara.png`, 1254 × 1254; 16 einzeln vermessene Ausschnitte | Laufzeit-Atlas 256 × 256 mit 64 × 64 Zellen; Quellmaßstab 1÷7; sichtbare Höhe etwa 38–42 | Gemeinsamer Fußpunkt (32 / 56); Laufzeitskalierung 1; eine Gehposition |

**Rahmen, sichtbare Silhouette und belegte Bodenfläche sind verschiedene Maße.** Ein 64er Rahmen bedeutet weder eine 64 Pixel breite Figur noch vier belegte Spielzellen. Neue Figuren werden nicht unabhängig auf maximale Zellgröße aufgeblasen.

Die Szene nutzt leichte Draufsicht und dieselbe Blickrichtung wie die Originaltürme. Objekte stehen über ihrem Bodenanker; Schatten liegen am Boden. Mara behält rote Haare, Zopf, petrolfarbenen Umhang und Werkzeug. Ihre höhere Detaildichte ist in der Probe auf Spielgröße reduziert; finale Pixelkorrekturen und eine vollständige Laufanimation bleiben offen.

## Gelände richtig zusammensetzen

Die Original-PNGs bleiben unverändert. Für M1 stehen Zuschnitte, Skalierung und zulässige Bereinigung im Code; diese Probe verwendet keine neuen generierten Geländepakete. Die gezielten M3-Ergänzungen für neue Regionen sind unten dokumentiert.

- **Gras:** Der ältere Ausschnitt x64/y64 ist vollständig transparent. M1 nutzt die tatsächlich gefüllte Fläche x128/y64. Die bereits bestätigten drei Karten behalten ihre bisherige Darstellung.
- **Wegteile:** Jeweils 64 × 64. Waagerecht x384/y64, senkrecht x320/y128; Verbindung Nord–Ost x320/y192, Nord–West x448/y192, Süd–Ost x320/y64, Süd–West x448/y64. Auswahl anhand der belegten Nachbarzellen. Diese Probe enthält keine Kreuzung; weitere Anschlüsse müssen vor ihrem Einsatz geprüft werden.
- **Bäume:** x833 bzw. x897; y384/448 für Grün, y576/640 für Herbst. Breite 62, Höhe 64. Die fremde Pixelspalte x832 und der darunterliegende zweite Baum gehören nicht zum Ausschnitt. Bäume werden einzeln gesetzt; Gruppen entstehen aus einzelnen Objekten.
- **Wasser:** Zehn Frames zu je 100 ms. Die Quelle enthält pro Frame eine kreuzförmige Konstruktion mit Ufern und Innenflächen. Eck-, Ufer- und Mittelteile werden passend kombiniert; die genaue Auswahl steht in `src/terrain.ts`. Nur der von außen erreichbare grüne Hintergrund wird in einer Laufzeitkopie transparent; eingeschlossene Details bleiben erhalten. Alle Teile laufen synchron. Pause hält die Animation an, 2× beschleunigt sie mit dem Spiel.
- **Lesbarkeit:** Weg und Wasser werden aus ihrer Geometrie abgeleitet. Wasser, Baumzellen und gebaute Türme sind für Begleiter gesperrt; Wege sind begehbar, aber nicht bebaubar. Ein Baum darf nicht rein dekorativ auf einer freien Bauzelle stehen.

Farbreferenz aus dem Originalgelände: Gras `#63ab3f`, helle Vegetation `#c8d45d`, dunkle Vegetation `#3b7d4f`, Erde `#ffae70`, Erdkontur `#bd6a62`, Wasser `#92e8c0`, Schaum `#f5ffe8`. Das sind Ankerfarben, keine nachträgliche Zwangsumfärbung aller Assets. Weitere Regionen benötigen eine zusammenhängende Palette bei gleicher Lichtführung und ähnlichen Helligkeitskontrasten.

## Figuren und Animation

**Wisp:** Die Originalanimation enthält drei Richtungsreihen mit je neun Frames (unten, seitlich, oben) sowie drei entsprechende Aktionsreihen. Wiedergabe mit 10 fps; links darf die seitliche Originalreihe gespiegelt werden.

**Mara:** Die Quelle ist nicht sauber durch vier ganzzahlige 313er Zellen teilbar. Zudem reicht die linke Aktionspose über die nominelle Zellgrenze. Deshalb sind die 16 Objektgrenzen und Fußpunkte einzeln in `src/style-assets.ts` erfasst. Ein pauschales Raster würde wieder Nachbarteile abschneiden oder mitnehmen.

- Reihen: unten, links, rechts, oben. Jede Reihe enthält Standpose, Gehpose A, Gehpose B und Aktionspose.
- Einheitlich um Faktor 1÷7 verkleinern, ohne Glättung; niemals jede Pose separat auf dieselbe sichtbare Breite/Höhe strecken.
- Ausschnitte in 64 × 64 Rahmen mit Fußpunkt (32 / 56) einsetzen. Kein Rand darf in die Nachbarzelle reichen. Halbtransparente Generationsfransen werden in der Laufzeitkopie bei Alpha 128 auf 0/255 gesetzt; die Quelldatei bleibt erhalten.
- M1-Laufzyklus: Gehpose A → Stand → Gehpose B → Stand, 7 fps. M2 verwendet die direkte Folge A → B mit 6 fps, um die Stand-Unterbrechungen zu entfernen. Es bleiben **zwei vorhandene Gehposen**; zusätzliche Zwischenposen wurden nicht erzeugt.
- Die Aktionspose wird kurz gezeigt. Sie implementiert noch kein Übertakten, Sammeln oder andere Spielfähigkeiten.
- Maras Richtungen werden einzeln verwendet; Werkzeug und asymmetrische Kleidung werden nicht durch Spiegelung vertauscht.

M2: Fußpunkte und getrennte Richtungen bleiben erhalten; die Schrittfolge läuft ohne eingeschobene Standpose. Die echte Fähigkeit wird erst nach Ankunft und Aktionspose ausgeführt. Die vorhandene kurze Pixelanimation ist weiterhin eine Grenze des Materials. Zusätzliche Bewegungsphasen sind eine mögliche spätere Grafikverbesserung. Neue Bilder nur dann anfordern, wenn diese konkrete Lücke nicht mit dem vorhandenen Material sauber lösbar ist.

## Vertrag für weitere Assets

1. Zuerst den tatsächlichen Bedarf im Kartenlayout festlegen: Materialfläche, Übergang, Objekt oder Animation. Größe und Anschlüsse vorher benennen.
2. Als Referenz eine aktuelle Spielansicht sowie die passenden Originalobjekte verwenden. Keine unabhängig gestalteten Gesamtatlanten für eine komplette Region auf einmal erzeugen.
3. Für neue Kachelteile das Quelldetailraster des Originals beibehalten: üblicherweise 64 × 64 pro Boden-/Wegteil → 40 × 40 im Spiel, Wasserteile 32 × 32 → 20 × 20. Große Props belegen dokumentierte Vielfache; Gebäude und Felswände nicht beliebig strecken.
4. Für neue Begleiterframes die 64 × 64 Laufzeitzelle und den vereinbarten Fußpunkt verwenden. Die sichtbare Körperhöhe wird an Mara/Wisp beurteilt. Höher aufgelöste Rohbilder werden einmal kontrolliert aufbereitet, nicht bei jeder Nutzung neu zugeschnitten.
5. Metadaten mitliefern: Quelldatei, exakte Rechtecke, Rahmen, sichtbare Größe, Fußpunkt, Bodenbelegung, Richtung, Framefolge, Dauer und Skalierung. PNG mit echter Transparenz; keine Schachbrettmuster als Bildinhalt.
6. Übergänge aneinanderlegen, Transparenz auf heller und dunkler Fläche prüfen, Atlasgrenzen kontrollieren und Animation in echter Spielgröße abspielen. Originale, Rohmaterial und abgeleitete Laufzeitfassungen nachvollziehbar trennen.
7. Erst einen kleinen repräsentativen Ausschnitt im laufenden Spiel ansehen. Danach die restlichen benötigten Teile produzieren. Freigabe erfolgt über die Spielansicht und Nutzerabnahme, nicht über ein hübsches Rohbild oder einen erfolgreichen Build.

Technische Prüfung, visuelle Eigenprüfung und Nutzerabnahme werden getrennt dokumentiert. Diese M1-Probe erfüllt noch nicht die Abnahmekriterien einer vollständigen Karte aus der [Roadmap](../ROADMAP.md).

## M3 – verbindliche regionale Ergänzungen

Die abgenommene Waldkarte bleibt Maßstabsreferenz. Neue Regionen ändern Landschaft und Palette, nicht Türme, Gegner, Figuren oder Spielraster. ImageGen liefert nur Rohmaterial; technische Anschlüsse entstehen anschließend deterministisch. Rohquellen bleiben unverändert in `public/assets/`, vollständige Prompts stehen in den jeweiligen Berichten: [Moor](../artifacts/m3/REPORT.md), [Winter](../artifacts/m3-winter/REPORT.md), [Windbruch](../artifacts/m3-wind/REPORT.md).

| Bereich | Laufzeitformat und Anschlussvertrag |
| --- | --- |
| Moor | Originalgras/-weg/-brücken. Zehn synchrone Wasserframes mit 100 ms; vier zusätzliche konkave Quellteile. Vier neue Objekte in 64er Rahmen, Fußpunkt (32/56), Quellmaßstab 0,09. |
| Winterterrain | 512 × 320, 8 Spalten mit 64er Zellen. Frame 0 Schnee; 4–19 Weg; 20–35 Eis. Nachbarmaske Nord 1, Ost 2, Süd 4, West 8. Darstellung 40 × 40, keine Animation unter dem gefrorenen See. |
| Windterrain | 512 × 448, 8 Spalten mit 64er Zellen. 4–19 Inseloberkante, 20–35 Weg, 36–51 Felsseite. Dieselbe Nachbarmaske. Außerhalb der Inseln transparent; Klippentiefe bekommt kleine unregelmäßige Versätze. |
| Winterobjekte | 256 × 64: zwei Bäume, Felsen, Eiskristall. Exakt vermessene Ausschnitte, Quellmaßstab 1/12, Fußpunkt (32/58). |
| Windobjekte | 256 × 64: Kristall, kleine Felsinsel, Wolke, Steinbogen. Exakte Ausschnitte, Quellmaßstab 1/11, Fußpunkt (32/58). Wolken/Ferninseln sind reine Hintergrunddekoration. |
| Windbrücken/-ränder | 384 × 192: horizontale Brücke im Rahmen (0,0,160,64), vertikale in (160,0,64,160), Felsnase (224,0,64,64), Ranken (288,0,64,64). Brückenanker jeweils Rahmenmitte; Ränder bei (32/8). Die Generations-Landekappen werden herausgeschnitten; die Deckenden verbinden die bestehenden drei Spielzellen. Quellmaßstab horizontal 0,25, vertikal 0,37, Fels 0,10, Ranken 0,12, jeweils proportional. |

Winterpalette: Schnee `#e5edf0 / #d2e0e8 / #bccfdc`, Weg `#9eafc0 / #afc0cf / #bdcdd8`, Eis `#85bed0 / #a4d4df / #cce9ed`. Windpalette: Boden `#729f91 / #a1bba1 / #567c79`, Weg `#ccbfa2 / #b0a68f / #e4d5b2`, Fels `#49566e / #657386 / #354156`. Kleine regionale Farbakzente dürfen die Gegner- und Weglesbarkeit nicht verdrängen.

Die Skripte `prepare-winter-atlas.mjs` und `prepare-wind-atlas.mjs` enthalten die exakten Zuschnitte. Kein pauschales Halbieren eines KI-Bildes für Objekte: Die Wolke überschreitet beispielsweise die nominelle Quadrantengrenze. Quellen werden einmal vermessen, proportional verkleinert und getrennt gepackt; Alpha wird bei 128 auf 0/255 normalisiert. `reference/tests/atlas.test.mjs` kontrolliert kompatible Kanten pixelgenau und prüft Sprite-/Brückenrahmen auf Überläufe. Die Spielansicht bleibt zusätzlich nötig; ein bestandener Atlas-Test ersetzt keine visuelle Abnahme.

# B05 — Originalgrafiken und Laufzeitmontage

Diese Datei dokumentiert Quellen und Maßstab der Startlichtung. Der tatsächliche Paketstatus steht in der [Roadmap](../ROADMAP.md). B05 erzeugt keine neuen Bilder und keine Gebäudeassets. Werkstattgebäude und ihre Zustände gehören B06.

| Bestandteil | Unveränderte Quelle | Laufzeit / Montage |
| --- | --- | --- |
| Gras und Wege | `public/assets/Grass Tileset.png` | 64er Originalteile auf 40×40; Gras x128/y64. Wegquadrat anhand der Nord/Ost/Süd/West-Nachbarn, wie im abgenommenen Wald |
| Bäume, Felsen, Blumen | Dasselbe Tileset | Bäume 62×64 aus x833/897, y384/448/576/640; Faktor 0,8, Mitte unten, Zellmitte +12 y. Felsen x832/y768 und Blumen x704/y576 mit Faktor 0,65 |
| Teich | `Animated water tiles.png` | Zehn ursprüngliche 448×448 Konstruktionsframes; Ufer/Mitte aus 32er Teilen auf 20×20, zwei Teile pro Spielzelle; 10 fps nach Simulationszeit |
| Waldwächter | `Tower 01.png`, Level-01-Waffe und -Projektil | Basis64×128, Waffe96×96, Faktor0,63. Originalanker: Basis Zellmitte +13 y, Ursprung0,5/0,8; Waffe bei Zellmitte y−23. Level1–3 behalten GrafikstufeI |
| Gegner | `Leafbug.png`, `Firebug.png` | Originalrahmen64×64 beziehungsweise128×64; Faktor0,83; gerichtete Move-Frames aus dem bestehenden Manifest, keine Größen-Normalisierung |
| Kern | `Tower 08.png` mit Level-03-Waffe | Bestehende Waldmontage; Basisframe2 bei Faktor0,65/Ursprung0,5/0,78, Waffe Faktor0,7 bei y−39. Gegnerpfad endet hier bei Zelle27/6 |
| Mara | `Hero Mara.png`, bestehende Quelle1254×1254 | Die16 vermessenen Rechtecke und Fußpunkte aus `reference/src/style-assets.ts`; einheitlich1/7 ohne Glättung in64er Rahmen mit Fußpunkt32/56. Laufzeitskalierung1. Zwei vorhandene Gehposen bei6 fps, vier echte Richtungen, eine Aktionspose |

Die konkrete Auswahl, Framefolgen, Ausschnitte und Skalierungen stehen in [art.ts](../src/art.ts) und [forest.ts](../src/forest.ts). Das Laden verwendet eine kleine feste Auswahl über Vite-Asset-URLs. Es wird weder das komplette klassische Assetverzeichnis kopiert noch ein Wisp-/Builder-Sprite geladen. Alpha wird nur in Maras abgeleiteter Laufzeitkopie bei128 auf0/255 bereinigt; für den Teich wird außerdem eine flüchtige Wasser-Laufzeitkopie vom Gras-Hintergrund bereinigt. Alle Quelldateien bleiben unverändert.

Die Bäume, Felsen und Wasserzellen aus [forest-world.ts](../src/forest-world.ts) sind zugleich Navigationshindernisse. Gegnerweg, Bauplätze, Maras Start und Grundstückszugänge bleiben frei. Blumen sind nicht blockierende Dekoration. Die Werkstattstelle ist nur ein zurückhaltend markierter Bodenbereich; keine reparierte Werkstatt oder Lagergrafik wird vorgetäuscht.

Quellen und Lizenz: Die jeweiligen Readmes für [Tileset1](../../../Foozle_2DT0012_Spire_Tileset_1/Foozle_2DT0012_Spire_Tileset_1/Readme.txt), [TowerPack1](../../../Foozle_2DS0017_Spire_TowerPack_1/Foozle_2DS0017_Spire_TowerPack_1/Readme.txt), [TowerPack4](../../../Foozle_2DS0020_Spire_TowerPack_4/Foozle_2DS0020_Spire_TowerPack_4/Readme.txt), [GroundEnemyPack](../../../Foozle_2DC0028_Spire_EnemyPack_2_Ground/Foozle_2DC0028_Spire_EnemyPack_2_Ground/Readme.txt) und [FlyingEnemyPack](../../../Foozle_2DC0027_Spire_EnemyPack_1_Flying/Foozle_2DC0027_Spire_EnemyPack_1_Flying/Readme.txt) nennen Baldur / Foozle und CC0. Mara ist die bereits im Projekt verwendete Figur; ihre vorhandene Aufbereitung und Materialgrenze stehen im [Grafikvertrag](../../../reference/STYLE_GUIDE.md). Für B05 wurde keine neue Mara-Produktion erstellt.

Die Vorgabe für jede spätere Grafik bleibt [ART_DIRECTION.md](ART_DIRECTION.md). Eine technisch passende Montage oder eine eigene Sichtprüfung ersetzt weder die Nutzerabnahme der Grafik noch G1 nach B07.

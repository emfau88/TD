# B06 — Werkstatt I und beschädigter Zustand

Zwei Bilder wurden mit dem eingebauten Imagegen-Werkzeug erzeugt; das Nutzerlimit beträgt vier. Keine späteren Gebäude oder Charakterbilder wurden erzeugt. Die Originalreferenzen und vorhandenen Grafikdateien bleiben unverändert.

## Bedarf, Maßstab und Aufbereitung

Grundstück `workshop`: Zellen x3–5/y11–12, blockierender Baukörper y11, begehbarer Vorplatz y12. Vorderer Bodenanker ist die Mitte der Gebäudekante bei Weltpunkt (180,480). Runtime: 128×128, Anker (64,112); sichtbare Silhouette ungefähr 96×87. Beide Zustände verwenden denselben proportionalen Faktor, Nearest-Neighbour und Alpha-Schwelle 128. Keine getrennte horizontale/vertikale Streckung.

Rohquellen: `assets/workshop/raw/workshop-i.png` und `workshop-damaged.png`. Runtime-Dateien und exakte vermessene Grenzen: [Werkstattordner](../assets/workshop/). Reproduzierbarer Befehl: `node scripts/prepare-idle-workshop.mjs`; Metadaten in `metadata.json`. Die Runtime liest diese kleinen PNGs, nicht die Rohquellen.

Die separat startbare [Maßstabprobe](../asset-check.html) zeigt beide Zustände neben Originalbaum, Waldwächter und Mara. Die fertige Werkstatt wurde zuerst bei echter Spielgröße geprüft; anschließend entstand die beschädigte Variante als Bearbeitung desselben Motivs. Im Spiel zeigt ein kurzer rein kosmetischer Staubeffekt den Bau. Kein Wisp wird geladen.

## Referenzen und vollständige Prompts

Bildreferenzen für das erste Motiv: `artifacts/m2/overview.png` (echte abgenommene Waldansicht) und `public/assets/Tower 01.png` (Originalbasis). Der Ursprung ist KI-generiertes Projektmaterial mit diesen vorhandenen SPIRE-Referenzen; es wird nicht als weiteres Foozle-Original oder als CC0-Grafik ausgegeben.

### Werkstatt I

> Use case: stylized-concept / style-transfer. Create ONE isolated repaired Workshop I sprite for the SPIRE top-down 2D pixel-art browser game. The input images are STYLE REFERENCES ONLY: image 1 is the actual game world, image 2 the original tower base. Do not edit or reproduce the scene or tower. Match the originals' simple hard pixel clusters, dark purplish outlines, modest flat shading and warm orange wood/grey-violet stone. Small low wooden and stone workshop, warm terracotta/brown roof, one short stone chimney, readable small workbench/tool sign and an amber work window. Orthographic top-down three-quarter view, front facing bottom, walls vertical in screen, roof visible from above, NOT diagonal isometric. Compact wider-than-tall silhouette, about 96x80 game pixels when reduced; use deliberately chunky low-resolution pixel artwork, not a detailed painting. Centered with generous transparent margins, all roof and chimney visible. Fixed front floor anchor centered under the doorway. No characters, text, letters, UI, landscape, grass base, huge ground shadow, watermark or extra objects. Genuine transparent background. This is the repaired workshop, not a ruined version.

### Beschädigte Werkstatt

Bearbeitungsreferenz: unveränderte Rohquelle der Werkstatt I.

> Use case: precise-object-edit. Edit ONLY this workshop sprite into its damaged, unrepaired initial state for a pixel-art game. Preserve exact image canvas size, scale, position, front doorway floor anchor, viewpoint, width, foundation, chimney silhouette, all surviving pixel clusters and muted original palette. Remove a small irregular patch of roof tiles near the left-center, revealing two dark wooden rafters. Break one small window pane and extinguish its amber light. Make the tool sign hang a little crooked. Keep the house mostly standing and still recognizable as this exact workshop, not rubble. No new characters or props, ground, terrain, smoke, text or scenery. Retain genuine transparent background and all margins. Keep the same low-resolution game-sprite style.

## Weitere Originalgrafiken

Frost verwendet ausschließlich die vorhandenen Foozle-Grafiken `Tower 02.png` (64×192 Frames), Level-01-Waffe (96×96), Level-02-Waffe (128×128) und Level-01-Projektil (32×32). Waldwächter-Level 4–6 nutzt Basisframe 2 und die vorhandene Level-02-Waffe (96×96). Zahlenlevel 1–3 entsprechen Grafikstufe I; 4–6 Stufe II. Quellen/Lizenzen stehen in [B05_ASSETS.md](B05_ASSETS.md).

Status: im Spiel eigengeprüft; die optische Nutzerabnahme erfolgt bei G1.

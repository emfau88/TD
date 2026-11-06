# Bildherkunft und vollständige Prompts

Erstellt am 06.11.2026 mit dem eingebauten ImageGen-Werkzeug. Dies sind eigene generierte Entwürfe, keine Behauptung einer neuen CC0-Lizenz.

## Referenz und erste Variante
Stilreferenz: Originalgegner Leafbug und Scorpion aus dem Repository, unverändert extrahierte Einzelbilder mit Nearest-Neighbor-Vergrößerung. Referenz: `sources/style-reference.png`.
Erste generierte Fassung: `sources/bark-parts-v1.png`. Originalausgabe: `exec-6061fe60-5018-48af-96fc-b07ac05b3dc8.png`.

```text
Use case: stylized-concept / modular pixel-art game sprite sheet.
Image 1 is STYLE AND PIXEL-DENSITY REFERENCE ONLY: two actual tiny enemies from the game, enlarged with nearest-neighbor. Do not reproduce either enemy. Create the new modular "Bark Wurm", an armored segmented forest worm for the SAME small top-down tower-defense game.

DELIVERABLE: one transparent sprite-part atlas, exactly FOUR equal square columns and THREE equal square rows, 4:3 overall aspect ratio. Exactly twelve isolated parts. No labels, lettering, grid lines, frames or checkerboard. True alpha transparency. Every part centered in its own cell, with transparent margins; no pixels crossing cells.

PIXEL STYLE IS CRITICAL: genuine low-resolution pixel clusters like the reference, visually designed on a logical 128 x 96 pixel atlas (each cell 32 x 32 pixels), displayed at a clean integer enlargement. Hard square pixel edges, dark navy/brown one-logical-pixel silhouette outline, 3 or 4 flat shade levels per material, restrained palette. NO smooth illustration, gradients, anti-aliased curves, texture noise, micro-details, painterly rendering, 3D gloss or soft glow. At final native scale the head is only about 26 x 24 pixels, body sections about 21 x 20, and tail about 20 x 18. Make it readable at that size.

DESIGN: moss-teal/olive armored plates, warm ochre-gold joint bands, dark blue-brown outline and underside, two unmistakable amber eyes ONLY on the head, a blunt wedge-shaped head with two short ivory-gold mandibles and a chunky brow. Slightly mischievous hostile fantasy crawler. Rounded overlapping body plates, two tiny dark ochre feet on either side of each body section, a distinct tapered armored tail. No leafy foliage, branches, runic writing or spindly antennae. Consistent light from upper left and slight elevated top-down perspective matching the reference.

COLUMN CONTENTS, repeated for every row:
1: HEAD ONLY with a very short rear connector. Do NOT attach any body sections.
2: ONE isolated BODY SECTION, leg pose A. No face, eyes or head.
3: EXACT SAME body section and shell as column 2, leg pose B; only the small foot positions differ by one or two logical pixels, so alternating them creates crawling.
4: TAIL ONLY, tapered tip pointing backwards relative to travel direction. No head or extra body sections.

ROW DIRECTIONS:
Top row: traveling RIGHT / east, showing top and near side. Head faces right; rear connector on left. Tail tip points left.
Middle row: traveling DOWN / towards viewer, top-down front view. Head faces bottom; rear connector at top. Tail tip points up.
Bottom row: traveling UP / away from viewer, rear/top view. Head faces top, with brow/eyes not painted on the back; connector below. Tail tip points down.

All three rows depict the SAME creature with identical palette and proportions. Head visibly wider than a body section; tail smaller. Body sections must be reusable repeatedly in a chain. No assembled full worms, no cast shadows, no ground, no visual effects. Transparent sprite parts only.
```

## Ausgewählte Obsidian-Variante
Bildbearbeitung der ersten generierten Fassung auf Nutzerwunsch; keine Naturthematik.
Unveränderte Originalausgabe: `sources/obsidian-parts-v1.png` (1448 × 1086).
ImageGen-Ausgabe: `exec-23cb1d42-057f-4bf5-9b00-2321e45ecf4d.png`.
Mechanischer Export: `prepare-parts.mjs`, gesamter Atlas auf 128 × 96, Nearest Neighbor, binäres Alpha, 32 Farben; keine neue Illustration.

```text
Use case: precise-object-edit / pixel-art game sprite atlas. Image 1 is the EDIT TARGET. Keep the EXACT 4-column by 3-row square-cell sprite-part layout, transparent background, fixed cell centers, approximate part sizes and three viewing directions. Redesign only this creature's material and visual motif into an OBSIDIAN WORM, with no forest/nature motif.

Hard low-resolution pixel art, designed on the same logical 128x96 pixel atlas with 32x32 logical cells; clean large square pixel clusters, dark outline, only 3-4 shade levels, no anti-aliasing or painterly textures. The creature will be tiny in game: no microdetails.

Replace green leafy-looking shell plates with heavy angular black-violet OBSIDIAN armor plates. Deep navy-black outlines, readable muted purple/slate-blue upper facets, very few bright amber-orange glowing joint seams, two bright amber eyes ONLY on the head and two short pale hot-orange mandibles. The top of every body plate should have a simple bold beveled shape, not intricate cracks. Small dark stone feet. No grass, moss, wood, leaves, green colors, jewelry, runes or letters. No soft bloom; glow is a few bright pixels.

IMPORTANT: these are modular parts for an assembled thirty-segment worm, not twelve whole worms. Column 1 isolated head, column 2 one isolated body segment leg-pose A, column 3 SAME body shell and size leg-pose B (only tiny feet move), column 4 isolated tapered tail. Head has a short rear connector only, no attached body. Body segments have NO faces/eyes. Keep body poses registered.

Rows: top moves RIGHT (east), middle moves DOWN toward viewer, bottom moves UP away from viewer. The TOP-RIGHT tail in the original points the wrong way: correct ONLY that tail so its tapered point faces LEFT and its broad connector is on the RIGHT, behind a right-moving head. Middle-row tail points UP; bottom-row tail points DOWN. Keep the head direction in every row correct.

True transparent alpha, no ground or cast shadows, no labels or cell borders. All sprite parts fully within their cells with transparent margins. Same clean chunky pixel art as the source, no increase in detail density.
```


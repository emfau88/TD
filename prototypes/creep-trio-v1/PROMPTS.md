# Kobaltschleim: Bildherkunft und Prompts

06.11.2026, eingebautes ImageGen-Werkzeug. Nur separate Grafikvorschau.
Flammengeist und Auge werden nicht generiert: unveränderte Frakassets-Originale
aus dem lokalen, zuvor inventarisierten Archiv, CC BY 4.0; Lizenz in `sources/`.

## Erstentwurf

Referenzen: `prototypes/segment-worm-v1/sources/style-reference.png` sowie
`artifacts/waves-b-refinement-2026-11-02/unused-monsters.png`.
Originalausgabe `exec-688eaa41-1cb2-494e-ad88-9a2f28859bdd.png`, als `sources/cobalt-slime-v1.png` unverändert erhalten.

```text
Use case: stylized-concept, pixel-art game sprite matching the supplied style references.
Create ONE transparent sprite concept for the "Kobaltschleim" / Cobalt Slime, a small enemy in the top-down pixel-art tower-defense game Towers & Tantrums.
Input image 1: scale, pixel density, dark contour and elevated top-down perspective reference only, showing the game's existing Leafbug and Scorpion. Input image 2: supporting style reference showing existing tiny creatures; match their simplicity, not their identity. Do not reproduce any reference creature, labels or background.
Deliverable: exactly ONE isolated cobalt-blue slime, no contact sheet, no alternate poses, no text, no scenery, no shadow, genuine transparent background. Its entire silhouette fits comfortably inside the image.
Design it as native low-resolution artwork on a logical 48x48 pixel cell shown at a clean integer enlargement. The visible creature should occupy roughly 36 logical pixels wide and 25 logical pixels tall: a low, broad asymmetrical jelly dome, a flatter soft underside with three broad simple lobes. Slight elevated top-down three-quarter view facing right and a little toward the viewer, like the references. A large recognisable blue silhouette with two chunky pale-cyan eyes with dark pupils near the right-hand leading face; one small mischievous straight mouth. Eyes must remain readable when reduced to about 30x21 screen pixels. Small irregular crown with one short thick droplet crest to avoid a generic oval. No arms, legs, horns, weapons or equipment.
Palette: dark navy 1-logical-pixel outline, cobalt mid-blue, deeper blue underside, a single broad lighter azure upper-left highlight and tiny restrained pale-cyan glint. 8 to 12 flat colours maximum. The cobalt silhouette is clearly different from the green leafbug, orange flame spirit and purple floating eye. Charming hostile game creature, not a toy, not a round emoji.
Hard square pixel clusters, stepped edges, clean two/three-tone shading, strong readability. Absolutely no smooth vector curves, soft gradients, antialiasing, blur, glass refraction, translucent body, glow, painterly brushwork, volumetric light or over-detailed high-resolution texture. No platform, rim, card, frame, backdrop or floor. This is one static design approval sprite, not an animation sheet. Preserve true alpha around the creature.
```

## Korrektur der Darstellung

Originalausgabe `exec-ba7e26d1-fc3b-4b1f-aced-793f51795b28.png`, als `sources/cobalt-slime-v2.png` unverändert erhalten.

```text
Use case: precise-object-edit. Edit the supplied cobalt slime sprite only. Keep the same blue slime identity, low broad body, asymmetrical droplet crest, two cyan eyes, mischievous expression, facing direction and proportions. This is a pixel-art sprite for a small top-down game.
Correct the rendering: REMOVE ALL OUTSIDE GLOW, fog, bloom and translucent dark halo. Surround the body with one clearly defined opaque dark-navy pixel contour and immediately outside this contour use completely transparent alpha. The body must be opaque, not translucent. Replace smooth colour ramps with 8–12 flat blue/navy/cyan colour areas, using consistent square pixel clusters on a logical 48x48 grid. No subpixel texture or antialiased outlines. Keep the broad upper-left highlight but make it two flat stepped shades. Preserve all empty surrounding space as true transparency. One isolated sprite, no backdrop, ground, shadow, card, checkerboard, lettering or extras. The goal is crisp legibility after reduction to about 30x23 pixels, matching real game sprites rather than an illuminated illustration.
```

## Nativer Export

`prepare.mjs`: proportionaler Nearest-Neighbor-Export auf 34 sichtbare Pixel
Breite, binäres Alpha an der Schwelle 128, 16-Farben-Palette ohne Dithering.
64er transparente Zelle, Bodenanker (32,43), Maßstab 0,83. Keine neue Zeichnung
durch das Exportscript. Die großen ImageGen-Rohbilder werden in der Vorschau
nicht geladen. Ergebnis war zunächst eine Standpose.

## Animationsprobe nach Nutzerfreigabe der drei Motive · 06.11.2026

Built-in ImageGen, ein Auftrag für ein zusammenhängendes Sechs-Bilder-Sheet.
Referenz: freigegebenes `assets/cobalt-slime.png`, ausschließlich mit Nearest
Neighbor auf 512×512 vergrößert (`sources/cobalt-slime-approved-reference.png`).
Originalausgabe `exec-8535d4b1-b983-482b-ac15-a174459ac024.png`, unverändert als
`sources/cobalt-slime-hop-v1.png` erhalten.

```text
Use case: identity-preserve
Asset type: transparent pixel-art animation sprite sheet for a tiny tower-defense creep.
Input image: approved cobalt slime sprite, enlarged nearest-neighbor from a 64x64 native frame. This is the exact character identity and art reference.
Create ONE six-frame looping hop animation sheet, arranged precisely in 3 equal columns and 2 equal rows, reading left to right, top to bottom. Each square cell has the same generous transparent margins. The sheet is 3:2 aspect ratio.
Keep the SAME friendly cobalt-blue slime in every frame: asymmetric little top crest leaning right, deep navy pixel outline/shadow, strong blue body, limited cyan highlight on the upper-left body, two simple pale cyan eyes and small dark smiling mouth on the front-right. Preserve its silhouette, perspective and chunky low-resolution pixel scale; no redesign, no additional anatomy, no new colors or smooth painting. Aim for 34 native pixels wide by 25 high in the neutral pose, within a 64x64 logical cell, visibly enlarged with square pixel clusters.
Six poses: (1) neutral matching reference, (2) anticipation squash, a little wider and lower, (3) springing upward, narrower and taller, (4) rounded airborne pose with crest lagging gently, (5) soft landing squash, (6) recovery close to neutral for a seamless return to frame 1.
All frames have the same horizontal center and the same bottom baseline at about 67 percent down each cell; do NOT bake jumping displacement into the sheet, the preview will move the sprite upward separately. Keep the eyes/mouth attached to the face as it deforms. No separate droplets or particles. Preserve overall apparent body volume. Variations should read clearly at actual tiny game size.
Genuinely transparent background, no checkerboard painted in, no ground shadows, no floor, no glow outside the silhouette, no labels, no grid lines, no cell borders, no text. Sharp un-antialiased pixel edges and small consistent palette.
```

`prepare-animation.mjs` zerlegt das 3×2-Sheet in sechs Zellen. Binäres Alpha
bei 128 entfernt den weichen Außenhalo. Eine gemeinsame Skalierung anhand der
34 Pixel breiten Neutralpose bewahrt Stauchung/Dehnung; Nearest Neighbor,
gemeinsame 16-Farben-Palette ohne Dithering, Bodenanker (32,43). Keine zusätzlichen
Posen per Code gezeichnet. Die kleine Sprunghöhe im Renderer ergänzt die sechs
generierten Körperposen; noch kein fertiger Vier-Richtungs-Gegneratlas.

Flammengeist und Auge: vorhandene acht Idle-Bilder jeweils South und East,
Originaltimings 83/84 ms und Originalpivots. Lit-/Shine-Layer zusammengeführt,
48er Originalzellen unvergrößert in 64er Vorschauzellen gesetzt. Keine neuen
Bilder generiert. Das Paket hat keine eigene Walk-Sequenz; seine schwebende
Idle-Bewegung läuft in der Wegansicht mit einer demonstrativen Translation.

# Generierte Schleim-Animationen

Built-in ImageGen; kein API-/CLI-Fallback. Freigegebene Standpose und seitliche
Hüpfprobe: [vollständige frühere Prompts](../../../../prototypes/creep-trio-v1/PROMPTS.md).
Seitliche Quelle `exec-8535d4b1-b983-482b-ac15-a174459ac024.png`, als
`sources/slime-side.png` unverändert erhalten. Das ist zugleich die Bildreferenz
für die folgenden zwei Richtungsaufträge. Keine neue Figur entworfen.

## Süden / zum Betrachter

Quelle `exec-38f5d365-530a-4ca7-86cb-9345826a9bc5.png` → `sources/slime-down.png`.

```text
Use case: identity-preserve. Game production sprite sheet, not concept redesign.
Reference is the approved six-pose cobalt slime hop animation. Preserve exactly this small cobalt blue slime, navy pixel outline, cyan highlights, asymmetrical crest, two cyan eyes and dark mouth. Same low-resolution chunky pixel-art style, apparent body volume and six squash/stretch poses.
Create one 3 columns by 2 rows sheet of exactly six poses in reading order: neutral, anticipation squash, stretched takeoff, rounded airborne, landing squash, recovering toward neutral. Uniform square cells, centered at same x and bottom baseline (67% of cell height), generous transparent margins. No baked jumping displacement; engine supplies hop height. Neutral visible body approx 34x27 logical pixels inside64x64 cell, exaggerated source enlargement with crisp square pixels. Same scale across all six frames.
True transparent alpha around the body, no outside glow, no halo, no ground shadow, no labels, no gridlines, no borders, no text, no detached particles, no smooth gradients.
Change only the VIEW DIRECTION to SOUTH / facing directly down the screen toward the viewer. Elevated top-down game view, BOTH eyes and mouth on the near/front lower face, centered face, see top of the slime. The crest remains asymmetrical leaning to its own left (viewer right). Do NOT keep the source's right-facing profile.
```

## Norden / vom Betrachter weg

Quelle `exec-fef067e3-63a9-4bcd-ae21-e4291cbc99d1.png` → `sources/slime-up.png`.

```text
Use case: identity-preserve. Game production sprite sheet, not concept redesign.
Reference is the approved six-pose cobalt slime hop animation. Preserve exactly this small cobalt blue slime, navy pixel outline, cyan highlights, asymmetrical crest, two cyan eyes and dark mouth. Same low-resolution chunky pixel-art style, apparent body volume and six squash/stretch poses.
Create one 3 columns by 2 rows sheet of exactly six poses in reading order: neutral, anticipation squash, stretched takeoff, rounded airborne, landing squash, recovering toward neutral. Uniform square cells, centered at same x and bottom baseline (67% of cell height), generous transparent margins. No baked jumping displacement; engine supplies hop height. Neutral visible body approx 34x27 logical pixels inside64x64 cell, exaggerated source enlargement with crisp square pixels. Same scale across all six frames.
True transparent alpha around the body, no outside glow, no halo, no ground shadow, no labels, no gridlines, no borders, no text, no detached particles, no smooth gradients.
Change only the VIEW DIRECTION to NORTH / moving directly up the screen AWAY from the viewer. Elevated top-down game view showing the BACK and top of the same slime. Absolutely NO visible eyes, mouth or face on the back. Preserve the asymmetrical crest and volume; crest lean mirrors the south-facing character's orientation. This is the SAME creature seen from behind, not a new design.
```

Der Packer zerlegt jedes 3×2-Sheet. Alpha-Schwelle 128 entfernt den Außenhalo;
eine gemeinsame Skalierung pro Richtung erhält Stauchen/Dehnen. Seitenneutrale
34 Pixel breit, Front-/Rückenneutrale 27 Pixel hoch; Nearest Neighbor und eine
gemeinsame 16-Farben-Palette. Der Bodenanker bleibt über alle Bilder (32,43).
Keine Posen per Code nachgezeichnet. Flamme/Auge sind Original-Frakassets und
wurden nicht mit ImageGen verändert.

# Q4 · Mara-Dialogporträts

Erstellt am 24.10.2026 mit ausdrücklich freigegebenem Imagegen (integriertes `image_gen.imagegen`, Bearbeitungsmodus mit lokaler Referenz, `transparent_background: true`). Keine Tavernenanimation oder Charaktersteuerung geändert.

## Korrektur nach Nutzerhinweis

**Aktuell eingebunden: `welcome-v2-source.png`, `focused-v2-source.png`, `mischievous-v2-source.png`.** Die ersten Quellen bleiben als nachvollziehbare Entwürfe erhalten. Den abrupt endenden Schal am rechten Halsbereich an der gemeinsamen Masterbüste korrigiert und den schräg nach oben ragenden goldenen Strich entfernt. Anschließend beide Ausdrücke aus dieser korrigierten Masterbüste abgeleitet. Körper, Gesicht, Frisur und Ausrüstung bleiben dieselbe Mara.

## Referenz und Konsistenz

Einzige Charaktervorlage: [`mara-portrait.webp`](../../../experiments/idle-bastion/assets/tavern-rig/mara-portrait.webp), das vorhandene finale Tavernenporträt (272 × 320). Die ältere Runtime-Mara wurde nicht vermischt. Die vorhandene kleine Büste reicht als klare Identitätsreferenz; zusätzliche große LFS-Animationsquellen wurden nicht benötigt.

1. `welcome-source.png` als gemeinsame Masterbüste aus dieser Referenz erstellt.
2. `focused-source.png` und `mischievous-source.png` jeweils direkt aus derselben Masterbüste editiert; nicht unabhängig generiert, keine verketteten Überarbeitungen.
3. Identität, grüne Augen, Haarform/Zopf, Schal, Anhänger, Schulter-/Kleidungsform, Perspektive und Ausschnitt visuell verglichen. Die Bilder erhalten die feine illustrative Darstellung des vorhandenen Dialogporträts; keine gröbere Karten-Sprite-Optik darübergelegt.
4. Ohne weitere inhaltliche Bildbearbeitung mit Sharp auf 272 × 320 verkleinert und als WebP exportiert: Qualität 88, Alphaqualität 100, Aufwand 6. Ein identischer UI-Bildrahmen verhindert Layoutsprünge. Originale bleiben hier erhalten.

| Ausdruck | Laufzeitdatei | Bytes |
| --- | --- | ---: |
| Einladend | [welcome.webp](../../../experiments/idle-bastion/assets/intro/mara/welcome.webp) | 26.492 |
| Konzentriert, zuversichtlich | [focused.webp](../../../experiments/idle-bastion/assets/intro/mara/focused.webp) | 27.186 |
| Verschmitzt | [mischievous.webp](../../../experiments/idle-bastion/assets/intro/mara/mischievous.webp) | 26.994 |
| **Gesamt** | Drei transparente Einzelbilder, keine Atlanten | **80.672** |

Die zweite Variante unterscheidet sich bewusst subtil durch einen wacheren Blick. Das Grinsen der dritten Variante ist deutlicher. Die abschließende visuelle Nutzerbewertung steht mit der Q4-Ingame-Abnahme noch aus.

## Prompts

### Gemeinsame Masterbüste / Begrüßung

> Use case: identity-preserve. Asset type: small static dialogue portrait for the existing pixel-art game SPIRE: Idle Bastion. Image 1 is the EDIT TARGET and the sole character master. Create ONE welcoming facial-expression variant of this exact adult Mara. Preserve her identity, existing face shape and proportions, green eyes, orange-red hairstyle and braid on the viewer's left, dark teal scarf, gold diamond pendant, clothes, shoulders, camera angle, lighting, palette, silhouette and bust crop. Only subtly change the facial expression: warm welcoming open eyes and a gentle confident friendly smile, mouth closed. Keep the existing illustrated pixel-game portrait style and crisp restrained shading; do not redesign or repaint her in a different style. Match the reference composition and framing closely so this image can swap in the same fixed UI box with later variants. Keep the same head size and position in a portrait canvas with aspect ratio 272:320. Transparent background with real alpha. No text, no frame, no scenery, no new objects, no extra character, no exaggerated cartoon expression. This is expression 1 of a consistent portrait set; all non-facial details should remain visually identical to the provided master.

### Konzentriert

> Edit this exact Mara portrait as expression 2 of a consistent game dialogue set. Change ONLY eyebrows, eyelids and mouth expression to focused, calmly determined and reassuring: slightly firmer brows, attentive open green eyes, relaxed closed lips with a very small confident smile. Preserve the exact identity, face shape, head angle, proportions, gaze direction, hairstyle, red hair braid, teal scarf, jewelry, clothing, lighting, palette, drawing style, body silhouette and transparent background. Keep every non-facial detail unchanged. Same portrait canvas, crop and head placement. Do not zoom, redraw the clothing, add accessories or change the character. No text. This is an edit of the provided master, not a new character design. Maintain true alpha transparency.

### Verschmitzt

> Edit this exact Mara portrait as expression 3 of a consistent game dialogue set. Change ONLY eyebrows, eyelids and mouth expression to a subtly mischievous confident grin: one eyebrow slightly raised, gently amused open green eyes and an asymmetrical closed-lip smile. Natural and slightly cheeky, not exaggerated or goofy. Preserve the exact identity, face shape, head angle, proportions, gaze direction, hairstyle, red hair braid, teal scarf, jewelry, clothing, lighting, palette, drawing style, body silhouette and transparent background. Keep every non-facial detail unchanged. Same portrait canvas, crop and head placement. Do not zoom, redraw clothing, add accessories or change the character. No text. This is an edit of the provided master, not a new character design. Maintain true alpha transparency.


### Korrekturprompt (V2-Master)

> Make a precise local clothing correction to this exact Mara portrait. There are two errors to fix. 1) On the VIEWER'S RIGHT side of her neck, the dark teal scarf currently ends in a strange tall cut-off flap. Make the scarf wrap naturally around the BACK of her neck and curve smoothly into the front scarf folds, with a coherent rounded fabric edge, visible neck anatomy and no abruptly chopped vertical end. 2) REMOVE the stray thin gold diagonal chain/line lying high across the teal scarf, which points upward from the necklace toward the neck. The gold necklace must consist only of the normal lower V-shaped chain on her upper chest leading down to the diamond pendant. No gold line across the upper scarf or pointing toward the neck. Preserve her exact face and welcoming expression, green eyes, head angle, red hair, braid, earring, shoulders, bust crop, burgundy clothes, existing pendant, palette, shading, drawing style and transparent background. Change ONLY the scarf wrapping at the viewer-right neck and remove the specified upper gold line; do not redesign anything else. Same canvas and exact character alignment, true alpha background.

Die beiden V2-Ausdrucksedits verwenden ausschließlich diesen korrigierten Master und die obigen Ausdrucksbeschreibungen. Zusätzliche verbindliche Einschränkung: “In particular preserve the corrected continuous rounded teal scarf wrapping behind the neck; preserve the clean upper scarf WITHOUT any gold line. Keep only the lower V-shaped necklace and diamond pendant.”

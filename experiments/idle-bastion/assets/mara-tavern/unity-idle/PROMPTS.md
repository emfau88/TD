# Mara · Unity-Idle · Bildvorbereitung

21.10.2026 · eingebautes Imagegen, kein CLI/API-Fallback. Beide Ausgaben als transparente PNG erhalten. Verbindliche sichtbare Referenz bleibt `../rest-reference/rest.png`.

## 1 · Verdeckte Körperflächen

`source-underpaint.png` aus `exec-8eb742f9-6d75-4cce-9e68-2c83261cba73.png`.

Use case: precise-object-edit.
Asset type: hidden BODY UNDERPAINT layer for a 2D skeletal animation rig, NOT a new character design or animation pose.
Input image 1 is the exact edit target and binding design reference: Mara, adult red-haired fantasy woman with teal scarf/cape, burgundy lace-up bodice, gold jewelry and belt, brown leather gloves and shorts.
Create ONE transparent PNG body underpainting. Keep the body, chest anatomy, clothing, arms, hands, belt, pouches, proportions, pose, camera, lighting and pixel-art rendering in exactly their original positions and shape. Remove ONLY the entire head and ALL red hair (including the long braid in front of the chest and the red strands behind the shoulders). Keep the neck below the chin and reconstruct the small portions of neck/scarf/shoulders/cape/bodice that were hidden behind the removed hair/braid, using the adjacent original colors and fabric details. Above the neck and outside the body is transparent. Do not invent a new neckline or redesign the outfit. Keep her brown-gloved hand resting on her hip and the other hand hanging as in the image. Keep the same top and bottom margins and original framing so the layer can register back onto the reference. Preserve crisp dark outlines and chunky hard-edged pixel clusters. No blur, no soft painted edges, no outlines around the missing head, no text, labels, guides, checkerboard, extra limbs, head, face, hair, animation sheet or multiple copies. This hidden layer will sit BEHIND the unchanged original visible artwork; only newly uncovered slivers are needed.

## 2 · Geschlossener Lidschlag

`source-blink.png` aus `exec-cf6aa73c-8d96-4e0f-9b5f-3b2af7fe938f.png`. Eingabe `head-reference.png` ist ein Nearest-Neighbor-vergrößerter Ausschnitt (85,65)–(260,213) der festen Referenz.

Use case: precise-object-edit. Asset type: one closed-eyes sprite for a 2D pixel-art blink.
Input image is the exact edit target, a magnified pixel-art crop of Mara's existing head.
Make exactly ONE change: close both eyes naturally for a brief relaxed blink. Upper eyelids lower over the green irises, eyes fully closed with a single clean dark eyelash line each. Preserve the exact inner/outer eye corners, eye angle and size; the head is tilted so the eyes are at different heights. Eyelid skin must match the surrounding face.
Everywhere else preserve the original: same head position, same face silhouette, nose and small mouth, eyebrows, hair strands, crisp dark hair outlines, golden earring, neck and scarf, pixel scale, canvas margins, size, viewing direction and lighting. Do not turn, nod, shift or reshape the head. Do not raise the cheeks or change the mouth. No open eyes, no new makeup, no smooth painterly style, no blur, no text, no sheet, no extra copies. Keep the existing transparent background and cropped framing. This is a registered closed-eye edit, not a new drawing of the character.

## 3 · Blinkzwischenzeichnung

`source-blink-half.png` aus `exec-bf8c5168-8939-422b-b76b-a64b7be1fed2.png`. Dieselbe Eingabe `head-reference.png`.

Use case: precise-object-edit. Asset: one HALF-CLOSED eyelids sprite for a pixel-art blink, an in-between stage.
Input image is the exact original head crop. Change ONLY BOTH EYELIDS: lower the upper eyelids so both green eyes are about half closed, halfway through a relaxed blink. The green irises remain partly visible below the lowered upper eyelash lines. Do NOT move the irises or either eye's inner or outer corner. Preserve the head's tilt, eye-angle difference, face, nose, mouth, expression, eyebrows, hair and clear outlines, earring, neck, scarf, framing and pixel scale exactly. No smile change, head movement, new hairstyle, softened art, text, sheets or extra copies. Keep transparent background. This is a registered intermediate eyelid drawing for the exact supplied character, not a redesign.

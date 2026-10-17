# UI-Materialien · SPIRE

Erstellt am 18.10.2026 mit dem eingebauten Imagegen-Werkzeug (vier Generierungen, kein CLI-Fallback). Referenz: [Nutzer-Mockup „Ausbau“](../../docs/references/vision-ausbau.png). Das Mockup diente ausschließlich als Stilreferenz.

## Laufzeit und Rohquellen

Alle Originale sind 1254 × 1254 px. Die PNG-Dateien unter `sources/` sind unverändert. Die WebP-Dateien daneben sind mit `prepare.py` in Qualität 88 kodiert, ohne Änderung der Abmessungen oder der Alpha-Kanäle. Keine neue Illustration durch die Aufbereitung. Zusammen 196.342 Bytes für die vier Laufzeitbilder; Original-PNGs werden nicht in die Web-App gepackt.

| Datei | Einsatz | Transparenz |
| --- | --- | --- |
| `brass-panel.webp` | HUD, Dock, Ziel, Hinweis, Details und Dialoge | RGB / deckend |
| `inset-card.webp` | Bau- und Begleiterkarten, Tabs, neutrale Schalter | RGB / deckend |
| `gold-action.webp` | Hauptaktionen wie Bauen, Aufwerten und Forschung | RGB / deckend |
| `gold-coin.webp` | Goldstatus und Kartenpreise | RGBA / echter freier Hintergrund |

Rahmen: CSS `border-image`, 14 % Randabschnitt, 6–12 CSS-px breite Kanten je nach Einsatz. Dadurch bleiben Ecken unverzerrt, ohne zusätzliche Layoutfläche zu reservieren. Texte und Zustandsinformationen stehen ausschließlich im DOM. Die Münze wird proportional bei 14–31 CSS-px dargestellt. UI-Elemente haben keine Welt-Bodenanker oder Kollisionsmasken.

Einheitliche kleine Kontrollsymbole werden in `src/ui-icons.ts` als SVG gezeichnet; vorhandene Spielsprites illustrieren weiterhin Turm- und Begleiterkarten. Schrift: **Pixelify Sans** (400–700), selbst gehostet; Quelle [Google Fonts / Pixelify Sans](https://github.com/google/fonts/tree/main/ofl/pixelifysans), Lizenz unter `fonts/OFL.txt`. Kleine Erklärtexte bleiben in der Systemschrift.

## Vollständiger gemeinsamer Prompt

Production UI asset for SPIRE, a refined woodland pixel-art tower defense game. Use the attached game mockup ONLY as material/style reference for its restrained antique brass borders, crisp pixel craft, dark ink surfaces and readable contrast. Match the UI, do not depict the game world. Premium hand-crafted 2D pixel art, front-facing orthographic, hard-edged stepped pixel clusters, disciplined palette. Deep ink/slate #182329 and #10191e, muted bronze #82683f, antique gold #c5a366, warm highlight #f4dda2. No bright green, no neon, no faux photography, no blur, no perspective, no letters, no text, no symbols unless specified, no watermark, no surrounding scene. This is a real reusable UI component, not a screenshot or mockup.

## Ergänzung je Generierung

### brass-panel.png

Create ONE square panel texture intended for CSS nine-slice scaling. Entire image is the panel, flush with all four image edges, no surrounding margin. A narrow elegant antique brass perimeter with two crisp hairline inner rails and small stepped reinforced corner brackets. Border plus corner ornament must fit entirely within the outermost 12% on each side; the inner 76% is almost uniform deep ink/slate, very subtle non-directional material grain, no ornament or lighting gradient in the center. Symmetrical corners and straight continuous edges, no emblem at the center of an edge. Gold trim is restrained, dark metal is substantial. Pixel details should read cleanly when the perimeter is displayed only 8–12 CSS pixels wide. Square output. Fully opaque.

### inset-card.png

Create ONE square recessed equipment-card panel for CSS nine-slice scaling, the whole image flush to its edges. Inset dark slate enamel center #1b292e, subtle barely-visible hammered metal grain. Straight double edge in desaturated pewter with small antique brass corner rivets and restrained stepped gold inlays. All border, corner details, and bevel confined to outermost 12% each side, inner 76% calm near-uniform dark slate. The center will be covered with game sprites and labels, so no image, icon or decoration there. Border should feel delicately machined, crisp pixel edges, no sweeping gradients. Same visual family as elegant brass forest-fantasy HUD. Square output, opaque.

### gold-action.png

Create ONE square blank golden action-button surface for CSS nine-slice scaling. Fill the whole canvas with the button, flush to all edges without margin. Warm muted antique gold parchment/enamel center #cfad6e with subtle non-directional grain, suitable for very dark readable text added later. Thin raised pale-gold inner bevel, dark bronze outline and small stepped corner bevels, corner ornaments and border confined within outermost 12%. Center inner 76% almost flat golden material, absolutely no text, no icon, no embossed pattern. Understated premium pixel-art craftsmanship, match referenced restrained gold UI accents, not shiny modern casino gold. Square output fully opaque.

### gold-coin.png

Create ONE premium pixel-art gold coin UI icon, front-facing circle, with actual transparent background. Large centered coin filling 86% of image height/width, complete unclipped silhouette. Double stepped rim, warm golden face, thick darker ochre beveled edge at lower right, a single simple embossed diamond/lozenge in the center with a short vertical stroke (not text or letter). Small pale-gold highlight on upper-left rim. Crisp chunky stepped pixel clusters, restricted 7–9 shade golden palette. Readable at 22–30 CSS pixels. Absolutely no ground shadow outside silhouette, no aura, no surrounding objects. Square output.

## Produktionsprüfung

Sichtprüfung in der echten Desktop- und Hochkantansicht, inklusive Goldaktion und Dialogen: [Prüfnachweis](../../../../artifacts/idle-bastion/acceptance/ui/PREMIUM.md). Die endgültige optische Nutzerabnahme wird dadurch nicht vorweggenommen.

# T04 · Tavernenraum und zusätzliche Mara-Reaktionen

Lokaler Entwurf vom 21.10.2026. **Visuelle Nutzerfreigabe am 21.10.2026 erteilt, Veröffentlichung beauftragt.**

- `room.png`: 1536 × 1024, RGB. Leerer Tavernenraum, als CSS-Hintergrund mit Lesbarkeitsverlauf verwendet.
- `mara-reactions.png`: 1774 × 887, RGBA, 6 Spalten × 2 Reihen. Oben Hand, unten Haare; jeweils sechs eigenständig gezeichnete Frames.
- `mara-reactions.json`: Ausschnitte, Gürtelschnallenregistrierung auf 384 × 512 und Abspielzeiten. Nur feste Registrierung, keine Körperverformung/Bewegung eines Standbilds.
- Freigegebene Idle- und Schulterreaktion bleiben unverändert unter `../mara-tavern/`; die neuen Clips ersetzen sie nicht.
- Ilyras Übersicht verwendet ihre vorhandene Originalgrafik. Ihre Tavernenanimation gehört zu T06.

## Produktion / Provenienz

Erzeugt mit dem eingebauten Imagegen-Werkzeug und dem Imagegen-Skill. Keine heruntergeladenen Fremdassets, keine Mockup-Ausschnitte. Ausgaben unverändert als PNG übernommen; Zuschnitt/Registrierung nur zur Laufzeit per Canvas.

Raum: Ausgabe `exec-35caa060-8017-4b38-a31a-ed3711f7c578.png`.
Reaktionen: Ausgabe `exec-41f5fd2d-953f-47c8-a912-f9e904fddaff.png`, Abstandsreparatur der ersten Erweiterung `exec-f25af6d5-1638-486b-9cbe-6a34b7199925.png`. Zweite Alternative `exec-ade7b813-c405-492f-bb81-3d3cb41b4b8c.png` verworfen. Nur zwei ausgewählte Bilder werden im Spiel verwendet.

## Produktionsbriefings

**Raum:** Production background for SPIRE, landscape 3:2. Empty refined medieval woodland tavern, warm oak beams, dark slate fireplace at right with small amber fire, candle walls, bottles, burgundy flag, back counter. Crisp pixel-art clusters, late-16-bit aesthetic. Amber/chestnut/charcoal blue/brass. Calm darker open center-left for character overlay, restrained contrast. No people, text, UI or logo. Suitable for center portrait crop and wide banner.

**Reaktionen:** Original-Mara aus `../mara-tavern/mara-atlas.png` als verbindliche erwachsene Charakterreferenz. Roter Zopf links im Bild, grüne Augen, petrolfarbener Umhang, heller Fellbesatz, goldene Verzierungen, burgunderfarbenes Leder, graue Hose, Handschuhe, zwei türkise Fläschchen. Sechs zusammenhängende Handreaktionsphasen: Ruhe, Blick zur Hand, Unterarm heben, Handfläche öffnen, lächeln, zurück zum Gürtel. Sechs Haarreaktionsphasen: Ruhe, Arm heben, Zopf berühren, Kopf neigen, lächeln, zurück zum Gürtel. Gleicher Kopf-bis-Oberschenkel-Ausschnitt, gleiche Figur und Skala, transparenter Hintergrund. Keine Beschriftungen oder Panels.

**Finaler Reparaturprompt (wörtlich):**

> Precise sprite-sheet repair. Keep all 12 adult Mara drawings and their gestures/outfits/identity exactly as in this image. Keep SIX columns TWO rows. Main problem: neighboring figures and cloaks currently overlap and clip. Re-layout all twelve figures into twelve generously spaced equal cells: every figure needs at least 35 transparent pixels to its left and right and 25 transparent pixels above and below. Increase canvas width as needed (wide 3:2 canvas is fine). Every individual figure, including entire cloak, hands and elbows, must be a complete isolated cutout with NOTHING touching adjacent figures. Fill in only missing cropped outer edges faithfully. Uniform body scale in all frames, belt buckle on the same baseline. No repainting the face or hair, no new animation, no changing outfits, no different number of figures. Real fully transparent background, no grid, no labels, no shadows behind the cutouts. Each figure should occupy at most 70% of the width of its cell. This output is a production atlas that will be cut into 6 x 2 equal rectangular frames.

## Wiederverwendung

Animationszeit bleibt unabhängig von Kampfzeit; verborgenes Dokument hält die Animation an. Schließen beendet den RAF und löst Bildreferenzen. Punkte/Geschenke werden ausschließlich durch bestätigte Session-Transaktionen verändert. Karten-Sprites und deren geplante Idle-Animationen bleiben separat.

# Taverne I — Imagegen-Asset

Erstellt am 19.10.2026 mit dem eingebauten Imagegen-Werkzeug, eine Generierung für dieses Gebäude. Keine behauptete Modell-Unterversion. Zusammen mit dem anderen B15a-Gebäude insgesamt zwei Bilder erzeugt.

- Referenz: vorhandene [Werkstatt I](../workshop/workshop-i.png) und tatsächliche Idle-Spielansicht (Perspektive, Palette und Maßstab).
- [Unverändertes Original](raw/tavern-i.png), [Laufzeitbild](tavern-i.png), [reproduzierbare technische Aufbereitung](pack.ps1).
- Laufzeit: 128 × 128 RGBA, sichtbare Silhouette 100 × 80, Fußanker (64, 112); keine Geländeplatte, Figuren oder Texte eingebrannt.
- Alpha-Grenze 128; Quellausschnitt (x, y, Breite, Höhe): 205, 180, 1002, 800. Nächster-Nachbar-Skalierung, harte Alpha-Kante; keine nachgezeichneten Gebäudeteile.
- Im Produktionsbuild auf Desktop 1440 × 960 und Hochkant 430 × 932/DPR 2 ansehen; [B15-Bericht](../../../../artifacts/idle-bastion/acceptance/b15/REPORT.md) dokumentiert die abschließende Prüfung.

## Vollständiger Prompt

Use case: style-transfer. Create exactly ONE isolated finished TAVERN building sprite for the existing SPIRE pixel-art game. Input image 1 is the existing workshop: match its slight overhead FRONT perspective, pixel density, dark navy-brown outlines, muted stone base and warm timber materials. Input image 2 is actual gameplay, only for style/scale context; do not redraw the screenshot. Transform the reference building design into a recognizably different welcoming tavern: broad burgundy-red tiled roof with a small front gable, cream plaster and dark timber frame, central wooden door, two warm amber windows, one hanging wooden sign with a simple mug silhouette (NO text), one small barrel tucked against the wall. Compact building with a clear horizontal front baseline and tiny hard contact shadow. Actual runtime silhouette about 100 pixels wide and 85 pixels tall in a 128x128 frame; front floor midpoint is the anchor. Use large readable pixel clusters, a limited palette, crisp steps and simple geometry suitable for nearest-neighbor reduction. No characters, no combat props, no forge, no ornate mansion, no grass or terrain tile, no background, no UI, no lettering, no watercolor, no soft lighting, no antialiased painterly edges. Genuine transparent alpha around the entire building with margin; output one finished sprite, not a sprite sheet or comparison. Preserve the reference perspective, not an isometric rotated diamond.

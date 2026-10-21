# Verlustfreie Laufzeitderivate

Originalbilder bleiben in ihren bisherigen Assetordnern bzw. `public/assets/Hero Mara.png`. Diese WebP-Dateien werden tatsächlich ausgeliefert, Originale bleiben Produktionsquellen. Keine Neugenerierung, Neuzeichnung, Palettenreduktion oder Skalierung.

Reproduzieren: `python experiments/idle-bastion/scripts/optimize-runtime-images.py` (Pillow mit WebP). Nur prüfen: gleicher Befehl mit `--check`. Alle RGBA-Bytes werden nach Dekodierung mit der Quelle verglichen; Porträts sind native 170×200-Ausschnitte aus genau den bisherigen Canvas-Quellrechtecken.

| Derivat | Quelle |
| --- | --- |
| mara-atlas.webp | ../mara-tavern/mara-atlas.png |
| mara-reactions.webp | ../tavern-ui/mara-reactions.png |
| ilyra-atlas.webp | ../ilyra-tavern/ilyra-atlas.png |
| ilyra-reactions.webp | ../ilyra-tavern/ilyra-reactions.png |
| room.webp | ../tavern-ui/room.png |
| mara-game.webp | public/assets/Hero Mara.png |
| mara-portrait.webp | Mara-Tavernenatlas: x82/y0, 170×200 |
| ilyra-portrait.webp | Ilyra-Tavernenatlas: x140/y8, 170×200 |

Die Übersicht verwendet ausschließlich Porträts. Bei Figurenwahl wird nur die erste Atlaszeile (Idle) angefragt; Schulter und weitere Reaktionen folgen erst beim Berührungsmodus oder Herzmoment. Darstellung, Framezeiten und Metadaten bleiben unverändert. Prüfbericht: `artifacts/idle-bastion/acceptance/image-loading/REPORT.md`.


## Getrennte Idle-/Schulterdateien (T08b)

`python experiments/idle-bastion/scripts/optimize-runtime-images.py --slices-only` erzeugt vier pixelidentische Ausschnitte; `--slices-only --check` prüft vorhandene Dateien. Keine Skalierung, neue Frames oder verlustbehaftete Kompression. Alte vollständige Atlanten bleiben für separate historische Vorschauen erhalten.

| Derivat | Quelle / Ausschnitt (links, oben, rechts, unten) | Bytes |
| --- | --- | ---: |
| mara-idle.webp | mara-atlas.png / (0, 0, 1254, 418) | 534796 |
| mara-shoulder.webp | mara-atlas.png / (0, 418, 1254, 1254) | 1182340 |
| ilyra-idle.webp | ilyra-atlas.png / (0, 0, 1448, 362) | 598100 |
| ilyra-shoulder.webp | ilyra-atlas.png / (0, 362, 1448, 1086) | 1255166 |

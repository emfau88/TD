# Verlustfreie Laufzeitderivate

Originalbilder bleiben in ihren bisherigen Assetordnern bzw. `public/assets/Hero Mara.png`. Diese acht WebP-Dateien werden tatsächlich ausgeliefert, Originale bleiben Produktionsquellen. Keine Neugenerierung, Neuzeichnung, Palettenreduktion oder Skalierung.

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

Die Übersicht verwendet ausschließlich Porträts. Animationsatlanten werden erst bei Figurenwahl angefragt; Darstellung und Metadaten sind unverändert. Prüfbericht: `artifacts/idle-bastion/acceptance/image-loading/REPORT.md`.

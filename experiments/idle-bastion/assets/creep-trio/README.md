# Kobaltschleim, Flammengeist und schwebendes Auge

Nach freigegebener Standbild- und Animationsprobe für das Spiel aufbereitet,
06.11.2026. Keine neuen Kampfmechaniken: HP, Tempo und vorhandener Boden-/Flugstatus.

- `CobaltSlime.png`: 384×192, 18 Bilder in 64er Zellen. Sechs seitliche,
  sechs südliche, sechs nördliche Hüpfposen; linke Seite gespiegelt. ImageGen,
  native Pixelaufbereitung mit binärem Alpha und gemeinsamer 16-Farben-Palette.
- `FlameWisp.png` und `FloatingEye.png`: je 512×256, je acht originale Idle-
  Bilder South/East/North/West. Originalzeiten 83/84 ms; West wird nicht gespiegelt.
  Frakassets, [CC BY 4.0](sources/LICENSE-Frakassets.txt),
  https://frakassets.itch.io/free-monster-pack. Lit-/Shine-Ebenen zusammengeführt;
  Originalpixel unvergrößert mit Bodenanker (32,43) in 64er Zellen.

Alle drei nutzen 0,83 Weltmaßstab. Der Schleim erhält nur einen visuellen
Hüpfversatz; Pfad, Trefferpunkt und Speicherposition bleiben unverändert.
Flammengeist/Auge nutzen die vorhandene Fliegerdarstellung. Kein Angriffssheet
erforderlich: normale Creeps laufen zum Kern und verwenden keine Nahkampfanimation.

`node experiments/idle-bastion/assets/creep-trio/pack.mjs` erzeugt drei kleine
Runtimeatlanten und `src/creep-trio-frames.ts`; insgesamt 15.118 Bytes PNG.
Rohbilder bleiben in `sources/` und werden nicht im Spiel geladen.
[Prompts und Herkunft](PROMPTS.md), [Spiel-/Balanceprüfung](../../../../artifacts/creep-trio-2026-11-06/REPORT.md).

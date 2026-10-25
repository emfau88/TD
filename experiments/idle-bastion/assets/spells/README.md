# Laufzeitgrafiken für Gefährtenzauber

Acht transparente, verlustfrei gespeicherte WebP-Dateien, zusammen 168.708 Bytes.
Die freigegebenen Imagegen-Originale und Prompts liegen unter
[`artifacts/idle-bastion/previews/ability-art`](../../../../artifacts/idle-bastion/previews/ability-art/PROMPTS.md).

Reproduzierbare Aufbereitung: `node experiments/idle-bastion/scripts/pack-spell-art.mjs`.
Benötigt `sharp`; alternativ den Paketpfad über `SPIRE_SHARP_MODULE` angeben.
Icons behalten den Originalrahmen, Welteffekte werden an ihrer sichtbaren Alphafläche
registriert; längste Kante höchstens 192 Pixel. `manifest.json` hält Quellhash,
Ausschnitt und Größen fest. Die Originaldateien werden nicht überschrieben.

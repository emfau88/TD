# Ilyra · T11 bestehende Idle und lesbares Gesicht

21.10.2026. Auf ausdrückliche Erweiterung während Maras Probe direkt danach bearbeitet. Gemeinsame visuelle Nutzerfreigabe **vor Commit/Push**. Nur lokale `idle-review.html`, keine Änderung des veröffentlichten Spiels.

Verbindlich ist der freigegebene Tavernenatlas `../ilyra-atlas.png`; `reference-rest.png` ist dessen erste Zelle, einschließlich des bisher separat ruhend gerenderten Speers. Gesicht, weiße Haare, goldene Brille, Kleidung, Schmuck und Körpermaßstab sind Referenz. Der Auftrag erlaubt zusätzlich besser lesbare Nase/Mund.

Eingebautes Imagegen, vollständige [Prompts](PROMPTS.md):

- `source-initial.png` (`exec-67a8ac92-2ee7-47fc-9024-abe5235ce88b.png`): fünf nebeneinanderliegende Entwürfe; Nase/Mund zu schwach, Speer noch enthalten. Nicht verwendet.
- `source-face-pass.png` (`exec-e95f9004-bf97-483b-8592-17819198fc26.png`): ohne Speer, aber wechselnde Nasenstärke und zu enge Zellen. Gesamte Figuren nicht verwendet. Nur ausgewählte generierte Nasen-/Mundpixel aus Zelle 2/3 werden als identische kleine Gesichtsdetails übernommen.
- `source-motion.png` (`exec-fe09e556-e8d6-4601-8327-97034f1eb64f.png`): 3×2-Anordnung; fünf ausgewählte Bewegungszeichnungen, sechste Ruheduplikation nicht benötigt. Kopf, Schultern, Hände und Gürtel in der gepackten Probe kontrolliert.

`pack-idle-study.py` verwendet einen gemeinsamen festen Faktor 0,635, ganzzahlige Gürtelregistrierung, fünf 384×512-Zellen mit Gürtel (240/360). Die lokale Vorschau rendert wie bisher mit Faktor 1,1. Die ausgewählten Nasen-/Munddetails werden einmal auf den nativen Pixelmaßstab aufbereitet und mit harter Alphaauswahl eingesetzt: keine Mischkonturen, kein Morphing, keine gezeichneten Ersatzbewegungen. Die festen Details vermeiden, dass Nase und Mund zwischen den vom Generator unterschiedlich behandelten Atembildern flackern. Unterer Ausschnitt y448 entfernt rote Exportflecken und unterschiedliche rohe Schnittkanten.

Zeitfolge in ms: Ruhe 1600 → Atemzwischenpose 230 → kleine Einatmung 340 → Zwischenpose 260 → Ruhe 1090 → halb geschlossen 80 → geschlossen 100 → halb geschlossen 80 → Ruhe 850. **4630 ms**, wie bisher. Der asymmetrische alte Lidschlag wird durch einen beidseitigen Lidschlag ersetzt. Beginn und Ende dieselbe Ruhezeichnung.

Der Speer ist **kein Teil des neuen Atlas**: Die Vorschau zeichnet in jedem Zustand exakt den unveränderten ersten Speerausschnitt aus `assets/runtime/ilyra-idle.webp`. Transparenter Zwischenraum und ruhender Speer wurden separat auf hellem Grund geprüft. Bestehende Berührungsreaktionen sind unverändert, einschließlich ihrer alten Gesichtszeichnung; der Wechsel zur überarbeiteten Idle ist in der Probe ausdrücklich vergleichbar. Die geänderte Gesichtszeichnung gilt in diesem Paket ausschließlich für die Idle.

Reproduktion: `python experiments/idle-bastion/scripts/pack-idle-study.py`. `candidate.png`, `candidate.webp` (585.988 Bytes) und `candidate.json` sind im Projekt gespeichert. WebP/PNG vollständig RGBA-identisch geprüft. Neue Zeichnungen und subjektive Übergangsqualität benötigen die visuelle Nutzerfreigabe. Keine zweite Idle-Variante produziert; Paketstatus nur in der [Roadmap](../../../ROADMAP.md).

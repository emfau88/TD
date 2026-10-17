# Vorratslager I — B09

Generiert am 18.10.2026 mit dem eingebauten `image_gen`-Tool (ein Aufruf, Stilreferenzen, transparente Ausgabe; keine CLI / kein API-Key). Das Tool gibt keine auswählbare Modellversionsnummer zurück.

- Original: [raw/warehouse-i.png](raw/warehouse-i.png), unverändert mit originalem Alpha, 1337 × 1176 px.
- Laufzeit: [warehouse-i.png](warehouse-i.png), 96 × 96 px; sichtbare Silhouette etwa 68 × 50 px. Kleiner als die Werkstatt.
- Technische Aufbereitung: [pack.ps1](pack.ps1), Quellrechteck (288,397)–(1049,957), Nearest-Neighbor-Sampling; Alpha ab 128 deckend für harte Spielpixel, transparente Ränder. Original erhalten. Kein generativer zweiter Bearbeitungsschritt.
- Bodenanker: (48,80); Weltanker (360,520), 40er Raster. Grundstück (8,12) 2 × 2; Baukörper 2 × 1, begehbarer Vorplatz darunter. Keine zusätzlichen Navigationssperren.
- Einbindung: `art.ts`, `forest.ts`, Siedlungskarte und Lagerdetails. Nach Bau verschwindet die Grundstücksmarkierung, Staubimpuls dauert 1,2 Simulationssekunden.
- Referenzen: [Werkstatt I](../workshop/workshop-i.png) und [echter B08-Spielstand](../../../../artifacts/idle-bastion/acceptance/p3/b08-desktop.png).
- Technisch und im Desktop-/Hochkantspiel selbst geprüft; keine separate Nutzerabnahme behauptet. Generierte Ergänzung, keine zusätzlich behauptete Fremdasset-Lizenz.

## Vollständiger Prompt

```text
Use case: style-transfer.
Create exactly ONE companion game sprite by transforming the workshop design in image 1 into a SMALL STORAGE SHED (Vorratslager I). Image 1 is the style/perspective/material reference, image 2 is the actual game context and relative size reference. Do not edit or reproduce the game screenshot.
Match the workshop's crisp low-resolution pixel clusters, dark navy-brown outlines, warm timber, muted stone foundation and slight top-down front view. This shed must be visibly smaller and simpler than the workshop: broad low ochre-brown shingled roof, open front storage bay, a few stacked crates and grain sacks contained under the roof. No chimney, forge, glowing furnace, characters, text, icon, grass, base tile, background or vignette. The entire compact silhouette and tiny contact shadow must fit comfortably inside the image with transparent margin.
Actual in-game silhouette will be about 68 pixels wide and 60 pixels high on a 96x96 frame, with the middle of the front floor edge as bottom anchor. Use large readable pixel clusters suited to that tiny output; flat limited palette, no painted noise, no antialiasing, no soft ambient lighting. Show only this finished building on genuine transparent alpha. Nearest-neighbor pixel sprite aesthetic, upright front walls, horizontal front baseline, same perspective as reference workshop. Output one isolated building, not a sheet or comparison.
```

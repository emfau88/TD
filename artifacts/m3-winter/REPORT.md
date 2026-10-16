# Spiegelwinter – M3

Stand: 16.10.2026. Umgesetzt und gezielt geprüft; visuelle Nutzerabnahme offen.

Die dritte Region besitzt zwei getrennte Anmarschwege, die vor dem Spire zusammenlaufen, 440 Startgold und 10 Wellen. Schnee, gefrorene Seen, zwei einzelne Nadelbaumvarianten, Felsen und Kristalle geben ihr eine eigene Thematik. Eisflächen sind gesperrte Landschaft, keine begehbaren Abkürzungen. Türme, Gegner und Begleiter bleiben die gemeinsamen Spielfiguren.

## Neue Assets und Aufbereitung

Zwei Generationsaufträge über das eingebaute ImageGen-Werkzeug, kein CLI-Aufruf:

- [Material-Prompt](terrain-prompt.txt) → [Spiegelwinter Materials v1.png](../../public/assets/Spiegelwinter%20Materials%20v1.png).
- [Objekt-Prompt](props-prompt.txt) → [Spiegelwinter Props v1.png](../../public/assets/Spiegelwinter%20Props%20v1.png).

Die Rohbilder bleiben unverändert. `scripts/prepare-winter-atlas.mjs` normalisiert die Materialien und packt vermessene Objekte. Laufzeitdateien: [Tiles v1](../../public/assets/Spiegelwinter%20Tiles%20v1.png), 512 × 320, und [Sprites v1](../../public/assets/Spiegelwinter%20Sprites%20v1.png), 256 × 64. 64er Geländezellen werden als 40er Spielzellen dargestellt. 16 Weg- und 16 Eisanschlüsse werden nach Nord/Ost/Süd/West-Masken konstruiert; Alpha und Spritegrenzen sind kontrolliert. Die Generierung allein wurde nicht als fertiges Tileset behandelt.

## Gezielte Prüfung

- Beide Anmarschwege, Dekorationssperren, Erreichbarkeit und Bauphasen-Roundtrip geprüft.
- 10-Wellen-Modelllauf: Sieg, 20 Leben, 133 Gegner, 8 Türme, 366 simulierte Sekunden.
- Anschlussprüfung vergleicht die Randpixel aller kompatiblen Tilekombinationen; Spritezellen sind transparent voneinander getrennt.
- Im Browser angesehen, Mausradzoom bis 120 % und zurück geprüft und bei 120 % einen Turm korrekt gebaut. Keine manuelle Balanceprüfung aller Wellen, keine mobilen Tests.

![Spiegelwinter im Spiel](../screenshots/spiegelwinter.jpg)

[Gemeinsame Bedienung](../../reference/README.md), [Roadmap](../../ROADMAP.md).

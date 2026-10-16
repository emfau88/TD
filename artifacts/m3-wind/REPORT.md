# Windbruch – M3

Stand: 16.10.2026. Vierte, ungewöhnliche Region umgesetzt und gezielt geprüft; abschließende Nutzerabnahme offen.

Vier schwebende Plateaus liegen über einer Wolkenschicht. Eine Route verbindet sie durch drei Brücken; nur die Inseln bieten Bauflächen. Es gibt 460 Startgold und 10 Wellen. Kristalle und Steinbögen geben der Region eigene Orientierungspunkte, bei denselben Türmen, Gegnern und Begleitern wie im Wald.

## Kleine Animationen

- Sechs transparente Wolken bewegen sich langsam um 75 Spieleinheiten, mit leichtem vertikalem Versatz und unterschiedlichen Zyklen von etwa 14–19 Sekunden.
- Vier kleine Felsinseln schweben um 9 Spieleinheiten auf und ab, mit leicht versetzten Zyklen.
- Kristalle und ihre Bodenlichter pulsieren dezent. Sie verdecken keine Route.

Die Dekoration verwendet die vorhandene Szenenzeit: Pause und Kartenmenü halten sie an; 2× wirkt gemeinsam mit dem Spieltempo. Ein Kartenwechsel entfernt die bisherigen Objekte und Animationen.

## Überarbeitung nach Nutzerfeedback

Die zunächst verwendeten orangefarbenen Originalholzbrücken passten nicht zum Inselthema. Sie sind in Windbruch durch eigene helle Steinbrücken mit cyanfarbenen Einlagen ersetzt. Beide Blickrichtungen wurden separat produziert und vermessen; die sichtbaren Deckenden liegen auf den bestehenden Brückenanschlüssen. Im Laternenmoor bleiben die passenden Originalholzbrücken erhalten.

Die gleichmäßig tiefen Felsunterseiten wurden aufgebrochen. Unterschiedliche Felsnasen, überhängende Grasränder, kleine Kristalle, Ranken und Wurzeln lockern die Silhouette auf. Wege, Bauzellen und Kollisionsgeometrie bleiben dabei unverändert. Die Rohbilder werden weder als komplette Szene gestreckt noch als ungeprüftes Raster übernommen.

## Gespeicherte Assets und Prompts

Drei Generationsaufträge über das eingebaute ImageGen-Werkzeug, kein CLI-Aufruf:

| Prompt | Unveränderte Rohdatei | Verwendung |
| --- | --- | --- |
| [Materialien](terrain-prompt.txt) | [Windbruch Materials v1.png](../../public/assets/Windbruch%20Materials%20v1.png) | Inselboden, Weg, Klippe |
| [Objekte](props-prompt.txt) | [Windbruch Props v1.png](../../public/assets/Windbruch%20Props%20v1.png) | Kristall, kleine Insel, Wolke, Steinbogen |
| [Brücken und Kanten](polish-prompt.txt) | [Windbruch Bridges and Rims v1.png](../../public/assets/Windbruch%20Bridges%20and%20Rims%20v1.png) | Steinbrücken, Felsvorsprung, Ranken |

`scripts/prepare-wind-atlas.mjs` baut daraus reproduzierbar [Tiles v1](../../public/assets/Windbruch%20Tiles%20v1.png), 512 × 448, [Sprites v1](../../public/assets/Windbruch%20Sprites%20v1.png), 256 × 64, und [Details v1](../../public/assets/Windbruch%20Details%20v1.png), 384 × 192. Die exakten Rechtecke, Anker und Maßstäbe stehen im Skript. Für alle drei neuen Regionen zusammen wurden sechs kleine Rohbilder erzeugt; keine weiteren Varianten auf Vorrat.

## Gezielte Prüfung

- Route über alle drei Brücken, gesperrte Abgründe, erreichbare Inseln und Bauphasen-Roundtrip geprüft.
- 10-Wellen-Modelllauf: Sieg, 20 Leben, 133 Gegner, 8 Türme, 273 simulierte Sekunden.
- Tileanschlüsse werden pixelgenau miteinander verglichen; Sprite-/Brückenrahmen auf Transparenz und Überläufe geprüft.
- Ansicht mit den neuen Brücken und Kanten im tatsächlichen Spiel kontrolliert. Die bestehende Zoom- und Speicherkontrolle gilt gemeinsam für alle Regionen.
- TypeScript und Browser-/Offline-Paket geprüft. Keine mobile Prüfung und keine vollständige manuelle Balanceabnahme.

![Windbruch mit Steinbrücken und überarbeiteten Inselrändern](../screenshots/windbruch.jpg)

[Gemeinsame Bedienung](../../reference/README.md), [Roadmap](../../ROADMAP.md).

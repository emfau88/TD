# Laternenmoor – M3

Stand: 16.10.2026. Umgesetzt und gezielt geprüft; visuelle Nutzerabnahme offen.

Die zweite Region verbindet mehrere Bauflächen durch drei Holzbrücken aus dem Originaltileset. Zusammenhängende Wasserarme nutzen die zehn Original-Animationsframes (100 ms je Frame), einschließlich konkaver Uferteile. Einzelbäume, Türme, Gegner und Begleiter behalten den bestätigten Maßstab. Neue Laternen, Schilf, Stümpfe und Moos ergänzen das Moor; große Objekte blockieren ihre Zellen.

## Assets

Ein Generationsauftrag über das eingebaute ImageGen-Werkzeug, kein CLI-Aufruf. [Vollständiger Prompt](asset-prompt.txt). Unveränderte Rohdatei: [Laternenmoor Props v1.png](../../public/assets/Laternenmoor%20Props%20v1.png). Die tatsächlich gemessenen vier Ausschnitte stehen in `reference/src/marsh-assets.ts`; der transparente Laufzeitatlas entsteht mit vier 64er Zellen und gemeinsamem Fußpunkt. Es wird kein angenommenes KI-Raster verwendet. Originalgelände und animiertes Wasser wurden nicht neu generiert.

## Gezielte Prüfung

- Wege, Wasser, Brücken, Begleiter-Erreichbarkeit und gesperrte Bauzellen geprüft.
- Vollständiger automatisierter 10-Wellen-Ablauf: Sieg mit 20 Leben, 133 besiegten Gegnern, 8 Türmen, 289 simulierten Sekunden. Das ist ein Modellnachweis, keine manuelle Balanceabnahme.
- Alte Waldstände werden übernommen; Kartenplätze behalten eigene Bauphasen. Kartenwechsel und Laden im Browser geprüft, vorhandener Moor-Spielstand erhalten.
- Aktueller Build enthält alle vier Karten und dieselben Assets in Browser- und Offline-Fassung.

![Laternenmoor im Spiel](../screenshots/laternenmoor.jpg)

[Gemeinsame Bedienung](../../reference/README.md), [Roadmap](../../ROADMAP.md).

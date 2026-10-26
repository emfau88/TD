# Schattenprüfung für Gegner und Gefährten

26.10.2026 · Nutzerauftrag: weitere falsche Schattenabstände korrigieren;
bei Fliegern ausdrücklich einen entsprechend größeren Abstand erhalten.

17 Gegnerarten, 478 unterschiedliche Lauf-/Heil-/Tanz-/Farbframes vermessen.
Transparente Bildränder sind keine Fußpunkte; bei Insekten liegt die Projektion
unter dem Körper, nicht automatisch unter dem tiefsten Fühler oder Vorderbein.

- Waldgoblin: Schattenmitte y+9 → y+7; Knochenwächter y+9 → y+6;
  Waldkultist y+9 → y+4. Vor allem der Kultist hatte sichtbar getrennten Bodenkontakt.
- Sechs Flieger erhalten feste artspezifische Schattenmitten unter ihren
  vollständigen Flügelframes: Heuschrecke +20, Feuerwespe +22, Panzerflieger +27,
  Leerenfalter +25, Laternenqualle +15, Hornfledermaus +22. Bereits vorhandene
  Sprite-Anhebung 5,5–8,5 px bleibt identisch. Der Schatten folgt weder den Flügeln
  noch der Auf-/Abbewegung, sondern bleibt am Boden.
- Rosenspiegel bleibt bei der bereits korrigierten Mitte y. Die übrigen
  Bodeninsekten/-läufer bleiben bei ihrem passenden Körperschwerpunkt.
- Tatsächlich gepackte Gefährtentexturen geprüft: Maras sichtbare Unterkante
  −1 bis +1 px zum Anker, Ilyra 0 bis +1 px; Schattenmitte beider +1 px korrekt.
  Wisp endet −1,8 bis 0 px am Anker und hat keine zusätzliche versetzte Ellipse.
  Keine Anpassung an diesen drei Figuren erforderlich.

## Prüfung

- TypeScript, Vite und Pages-Build bestanden.
- Echter Phaser-Renderer, 1280 und 390 px, alle 17 Arten: Texturen/Anker,
  aktualisierte Schattenpositionen und unveränderte Flugbewegung geprüft.
  Figuren ausschließlich synchron zum Darstellungscheck eingesetzt und vor
  Rückgabe wieder entfernt; Kampfmodell/Snapshot bytegleich erhalten.
- Keine Browserfehler. Eigene Sichtprüfung im vorhandenen Pixelmaßstab;
  keine behauptete Nutzerabnahme. Keine neuen Videos oder Laufzeitgrafiken.

[Messwerte](measurements.json) · [Browserprüfung](browser-results.json) ·
[Vergleich je Richtung, links vorher/rechts nachher](comparison.png).

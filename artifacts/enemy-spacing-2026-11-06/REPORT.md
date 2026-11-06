# Dezente Entzerrung der Gegner

06.11.2026 · Ausgangsstand `55202d0`, Spielcode zuvor `963170a`.
Aktueller Paket-/Veröffentlichungsstand ausschließlich in der Roadmap.

## Umsetzung

- Feuerkäfer in beiden Achsen × 0,8: Faktor 0,664 statt 0,83. Keine Bildbearbeitung,
  unveränderte Proportionen, Frames und Animationen; Schatten ebenfalls kleiner.
- Pro Gegner eine feste, aus seiner gespeicherten UID abgeleitete Spur innerhalb
  des Wegs. Höchstens ±3 Spieleinheiten, zusätzlich durch die gemessene Figurbreite
  begrenzt. Keine Nachbarsuche, kein Ausweichen, kein Zittern und keine Kollisionen.
- Sanfte Rückkehr zur Mitte zwischen 48 und 24 Einheiten vor jeder Kurve;
  auf den letzten/ersten 24 Einheiten kein Versatz. Breite Silhouetten erhalten
  keine zusätzliche Verschiebung. Rosenspiegel und beide Würmer bleiben mittig.
- Flieger: mittlere visuelle Anhebung 7 → 9,8 (+40 %), unverändertes ±1,5-Schweben.
  Das sind lediglich 2,8 zusätzliche Weltpixel. Bodenschatten bleiben unten;
  Tiefensortierung bleibt an die Bodenposition gebunden, kein globales Zeichnen
  vor Türmen/Bäumen. Lebensleisten und Statusmarken folgen der jeweiligen Ebene.
- Projektile, Einschläge und Sturmlicht-Verbindungen einschließlich Kettensprüngen
  berücksichtigen die sichtbaren Ziele. Unveränderte logische Trefferpunkte,
  Flugzeiten, Reichweiten und Flächenschäden. Keine neuen Speicherfelder.

## Prüfung

- [498/498 Tests](tests.txt), einschließlich aller vorhandenen Tests und drei
  gezielter Prüfungen für Wegbegrenzung/Kurven, Projektion und unveränderte Events.
- [TypeScript und Produktionsbuild](build.txt) erfolgreich. Kampfmodul weiterhin
  `battle-BKt7mIIl.js`; Kampf-/Gegnerwerte, Wellenrezepte, Farming und Offlinecode
  unverändert gegenüber dem veröffentlichten Ausgangsstand. Deshalb keine neue
  Balance-Variantenserie: die bereits geprüfte Progression bleibt dieselbe.
- [66 Richtungs-Silhouetten](sprite-measurements.json) aus den tatsächlichen
  Alpha-Pixeln einschließlich Heilposen und Kappenvarianten vermessen. Wo eine
  Figur seitlich verschoben wird, bleiben mindestens zwei Weltpixel Rand bis zur
  Begrenzung des 40-Pixel-Wegs. Bestehende breite Silhouetten werden nicht weiter
  nach außen versetzt. Reproduzierbar mit `node --import tsx artifacts/enemy-spacing-2026-11-06/measure.ts`.
- Neun [Entwicklungsbrowserfälle](browser/results.json) und neun Fälle am fertigen
  [Produktionsbuild](production/results.json): W3/W7/W12, 1440×900 / 844×390 /
  390×844, DE/EN, Bewegung/Pause/exakter Reload. Keine HTTP-/JavaScriptfehler.
  Derselbe bestehende Prüfer: `artifacts/creep-trio-2026-11-06/browser.ts`.
- Sechs zusätzliche [Kurven-/Frostfälle](corners/results.json): W21/W35 in denselben
  drei Formaten, mit nahen Türmen, Heilern und Fliegern. Sichtbare Sprite-/Schatten-
  positionen, proportionale Skalierung und Bodentiefe direkt am Renderer geprüft.
  Desktopbilder und W12 im Handy-Querformat vor/nachher visuell verglichen.
  Die zusätzlichen Szenen verwenden bewusst abgeschwächte Verteidigungen aus
  vorhandenen Saves, damit Gegner die Kurven erreichen: reine Darstellungsfixtures,
  keine Belege für die normale Schwierigkeit. Nur isolierte Probe-Spielstände.

Die neuen Testhilfen benötigten Korrekturen am kostenlosen Frostturm und am Zugriff
auf die tatsächlich geladene Vite-Modulinstanz; dafür wurde kein Spielcode geändert.
Ein Syntaxfehler im neuen Test wurde vor dem erfolgreichen Gesamtlauf korrigiert.

## Einschätzung und Grenzen

Die kleineren Feuerkäfer bringen den größten sichtbaren Gewinn. Versätze und
Flughöhe unterstützen das dezent; der Schwarmcharakter bleibt erhalten.
Überholungen, Frostansammlungen und teilweise Überdeckungen sind weiterhin möglich.
Keine Änderung von Startreihenfolge oder Spawnabständen nötig für diesen Umfang.

Breite Originalbeine/-flügel passen nicht in jeder Pose vollständig auf 40 Pixel.
Der Feuerkäfer misst seitlich jetzt maximal 37,85 statt 47,31 Weltpixel; frontal
einschließlich Beinen 42,50 statt 53,12. Auf senkrechten Abschnitten bleibt er deshalb
exakt mittig. Die perspektivische Höhe von Fliegern ist bewusst von ihrem Bodenpunkt
getrennt. Eine vollständige Überdeckungsfreiheit wird nicht behauptet.
Browseremulation ersetzt keine menschliche Sichtprüfung am eigenen Handy.

Keine neuen Assets/Bibliotheken, keine anderen Spielpakete geändert.

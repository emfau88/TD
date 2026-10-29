# Vier Turmarten · Impact-Vergleich

[Animierte Vergleichsvorschau](https://emfau88.github.io/TD/previews/tower-evolution/prototypes/tower-impact-study/)

**Nur Designstudie. Keine Integration in das Spiel – auch nicht in den Testbranch-Laufzeitcode.** Nach Scharfschützen-Commit/Push und erfolgreichem Deployment von 3072b9d auf ausdrücklichen Folgeauftrag erstellt.

## Vorschlag

| Turm | Ab Level 10 (auch 15) | Ab Level 20 (auch 25) |
| --- | --- | --- |
| Waldwächter | Vorhandener Pfeilkontakt, helle gerichtete Splitter | Vier kräftigere goldhelle Splitter und kurzer Kontaktkern |
| Frostkristall | Vorhandener Eisbruch mit vier cyanweißen Facetten | Fünf kräftigere Facetten, kompakter heller Kern |
| Steinschleuder | Flacher Staubstoß und sechs Steinsplitter | Breiterer, begrenzter Staubstoß und acht größere Splitter |
| Scharfschütze | Kompakter Originalstern mit grünweißem Richtungsakzent | Kräftigerer Stern und vier grüne Kontaktfunken |

1–5 können bei den vorhandenen Effekten bleiben. Drei Wirkungsgruppen reichen; acht eigenständige Impacts wären optisch unnötig. Keine zusätzliche Schadensfläche, kein neues Durchschlagen/Verlangsamen; Farb/Formgebung nur kosmetisch. Kein Bildschirmblitz, kein Kamerawackeln. Kontaktkern 90 ms, kleiner Kern bis 170 ms; Gesamtdauer 240–420 ms. Ein Effekt pro logischem Treffer, nicht je dekorativem Pfeil. Bei späterer Integration bestehende globale Begrenzung (96 Sprites) erhalten und zuerst Zusatzsplitter drosseln. Kein Performancegewinn nachgewiesen oder versprochen.

## Vergleich und Herkunft

- Heute: originale PNGs, hohe Stufe 3 bei Wald/Stein/Scharfschütze, Stufe 1 beim Frost wie im aktuellen CombatEffects. Skalierungen 0,6 / 0,8 / 1,6 / 0,6, Dauer 500 / 500 / 500 / 350 ms. Gleiche Framefolge. Sichtbare maximale Originalflächen (unskalierter Frame 64×64): ca. 18×13,2 / 26,4×13,6 / 59,2×54,4 / 38,4×38,4 Kartenpixel.
- Vorschläge: Canvas-Pixelformen, wiederverwendeter kurzer Originalkontakt bei Wald/Frost/Scharfschütze; neuer flacher Staub bei Stein. Keine nachproduzierten Rasterassets, Bibliotheken oder spielinternen Effekte.
- Gegner: originaler Leafbug, Side-Frames 40–47 bei 100 ms, Skalierung 0,83. Originale Gras-/Wegtextur, 40-Kartenpixel-Raster. Normaler Kameramaßstab nach Fenstergröße wie in den bisherigen Studien; keine Nachbildung eines vollständigen Gefechts oder Spezialzoom der Testarena.
- Alle drei Felder synchron, gleicher Gegner und Trefferpunkt. Ein vorgeschaltetes Projektil als Orientierung; keine vollständige Waldwächter-Mehrfachsalve. Projektilskalierungen entsprechen EvolutionView.
- Spielgröße, Detail 2×, Pause, Zeitregler, Vierteltempo, sechs Gegner/drei versetzte Treffer pro Feld. Mobile Detail-/Dichtansichten stehen untereinander, damit nichts abgeschnitten wird. Kein Speicherzugriff.
- Reduced Motion startet als pausiertes Trefferbild. Offscreen-Flächen werden nicht laufend gezeichnet; Hintergrundtabs halten an. Browser-Screenshots sind echte Aufnahmen der Designstudie, keine Spielintegration.

## Prüfung / kritische Bewertung

Scharfschütze vorher: 428/428 Spieltests, Produktionsbuild, 45 Szenarien/32 Einzelstufen, 2.880 Waffenrichtungen. Pages 40966998098 erfolgreich, alle 604 Main-Dateien bytegleich; veröffentlichter Kampf bis Welle 48 geprüft.

Diese zusätzliche Studie: JS-Syntaxprüfung, statisches Pages-Packaging, Browser bei Desktop 1280, Smartphone 390 (Browser meldet 391 CSS-Pixel) und 320. Zwölf Vergleichsfelder geladen; kein horizontaler Overflow. Spielgröße/Detail, Pause/Trefferbild, Zeitlupe und dichtes Gefecht funktionieren, keine Browserwarnungen/-fehler. Reduced Motion im Code berücksichtigt, OS-Einstellung nicht separat umgeschaltet. Keine erneute Vollsuite notwendig: seit 3072b9d kein Spiel-/Testcode geändert.

**Bewertung:** Frost und Scharfschütze bleiben gut lesbar. Wald 10/20 ist bewusst subtil und auf 320 px nicht immer eindeutig unterscheidbar. Stein verdeckt viel weniger als die rote Originalwolke, wirkt dadurch aber weniger explosiv: Material und kurzer Impuls sollen das Gewicht vermitteln, nicht mehr Deckfläche. Die Staubform ist ein Entwurf, kein final ausgearbeitetes FX-Atlas. Vor einer Integration diese Richtung gemeinsam ansehen; keine gestalterische Freigabe behauptet.

## Browserbilder

[Desktop · Detail 2×](screenshots/impact-comparison-desktop.png) · [390 · Spielgröße](screenshots/impact-comparison-390.png) · [320 · Spielgröße](screenshots/impact-comparison-320.png) · [390 · dichtes Gefecht](screenshots/impact-dense-390.png)

Quellen: public/assets/Tower 01 - Weapon - Impact.png; Tower 02 - Level 01 - Projectile - Impact.png; Tower 03/04 - Level 03 - Projectile - Impact.png; Grass Tileset.png; Leafbug.png. Alle in assets/ unverändert kopiert. Projektilreferenzen aus den vier bestehenden Prototypverzeichnissen; keine Originalassets überschrieben.

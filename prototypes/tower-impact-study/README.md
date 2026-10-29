# Impact-Studie · Revision 3 · Mit jedem Skin mehr Wucht

[Animierte Vergleichsvorschau](https://emfau88.github.io/TD/previews/tower-evolution/prototypes/tower-impact-study/?revision=3)

**Nur Vorschau, ausschließlich im Branch codex/tower-evolution-playtest. Keine Änderung am Spiel-Rendering, an Kampfwerten, Saveformat oder Offline-System.** Der frühere zurückhaltende Entwurf und die gemeinsame Wirkung für Level 10/15 sind durch diese Revision ersetzt.

## Vergleich

- Erste Spalte: **Level 1–3 des Hauptspiels**, unveränderte Originalprojektile/-Impacts direkt aus main (93703cb66e369ed7f3a724f0e42575775cc12bc4). Im Hauptspiel gilt visualStage=1 bis Level 3. Keine hochstufigen Branch-Effekte als angeblicher Einstieg.
- Standard: Original / neuer Level 10 / neuer Level 15 / neuer Level 20.
- Umschaltbar auf Original + alle acht neuen Stufen **1 / 2 / 3 / 5 / 10 / 15 / 20 / 25**.
- Alle acht Stufen besitzen eigene wachsende Parameter. Neues Level 1: 85 % der Original-Effektbasis. Danach mehr Ausdehnung, Splitter, Spuren und Dauer. Ab 15 ein kurzer zweiter Akzent; 20/25 mehr Feuerwerk.
- Wald: goldhelle gerichtete Splitter; Frost: cyanweiße Eisfacetten/gebrochener Impuls; Stein: originale Explosion mit Trümmern und Bodenimpuls, ab 5 die rote Originalvariante; Scharfschütze: Kontaktstern mit grünem Präzisionsblitz/Funken. Keine grüne Steinexplosion im finalen Entwurf.
- Bis 12 Splitter + sechs Spursegmente je Treffer, maximal 530 ms Gesamtdauer. Kein Bildschirmblitz/Kamerawackeln. Ein logischer Treffer, keine zusätzlichen Schadensereignisse.

## Quellen / Umsetzung

baseline-main.json enthält Commit, Originalpfade, Frame-Metadaten und SHA-256-Prüfsummen. Acht niedrigstufige Atlanten wurden bytegleich aus main kopiert; die zusätzliche rote Steinexplosion stammt ebenfalls aus main. Originaldateien unverändert. Neue Projektile aus den bestehenden vier Skin-Prototypen; shot-frames.json beschreibt mehrteilige Atlanten. Keine neuen Bibliotheken oder KI-Rastergrafiken.

Canvas-Pixeleffekte in effects.js, UI/Vergleich in preview.js. Originalimpact-Maßstäbe 0,6 / 0,8 / 1,6 / 0,6; Originaldauer 500 / 500 / 500 / 350 ms. Originale Projektilframes laufen mit 10 fps und Maßstab 0,45 / 0,5 / 0,85 / 0,85. Für den Vergleich feste 240 ms Flugzeit und 1,7 s Wiederholung; keine komplette Schadens-/Angriffssimulation. Ein Vergleichsprojektil pro Treffer, keine ganze Waldwächter-Mehrfachsalve.

Originaler Leafbug und Gelände, Kameramaßstab wie bisherige Studien. Mobile Zweispaltenansicht; Detail/dichtes Gefecht gestapelt. Reduced Motion startet pausiert; Hintergrundtabs halten an, unsichtbare Canvasflächen werden nicht laufend neu gezeichnet.

## Prüfung

- JS-Syntaxprüfung und Pages-Packaging erfolgreich.
- 32 Effektprofile / 2.664 Zeitposen: ausschließlich endliche Koordinaten, Alpha 0–1, balancierter Canvas-Zustand; strikt steigende Skalierung/Radius/Splitterzahl, Grenzen 12 Splitter/6 Spuren/530 ms eingehalten.
- Hauptspiel-Originale durch acht SHA-256-Vergleiche bestätigt.
- Browser Desktop und 390 px: normale/zweifache Größe, 16/36 Vergleichsfelder, Zeitlupe, Pause und dichtes Gefecht kontrolliert. 320 px: alle 36 Felder geladen, kein horizontaler Overflow, keine Browserwarnungen/-fehler.
- Screenshot-Aufnahme zeitweise mit „Unable to capture screenshot“ ausgefallen. Sichtkontrolle und DOM-Prüfung funktionierten; keine vollständige neue mobile Screenshotserie behauptet.
- Spiel-/Testcode unverändert. Letzte Vollsuite weiterhin 428/428; nicht als neu ausgeführter Testlauf ausgegeben. Kein Kongregate-Export.

## Gemessene Renderlast

96 Treffer / Bild — L1: Ø 0.27 ms · P95 0.40 ms | L10: Ø 1.29 ms · P95 1.50 ms | L25: Ø 2.42 ms · P95 3.10 ms. Nur Canvas-Effekte in diesem Browser; keine Messung des vollständigen Spiels oder eines echten Smartphones.

Messung über den sichtbaren Button „Renderlast prüfen“: 96 gleichzeitige Effekte, 40 Frames je Stufe, erste acht verworfen. Gleicher Canvas-Renderer wie im Vergleich. Das ist ein Desktop-Browser-Mikrobenchmark ohne Spielsimulation, kein Smartphone-FPS-Versprechen.

## Sichtbewertung

Die Steigerung ist jetzt deutlicher, insbesondere bei Frost und den oberen Splitter-/Blitzstufen. Stein darf den getroffenen Gegner während der kurzen Explosionsspitze verdecken; mehrere Treffer erzeugen sichtbar mehr Action, klingen aber schnell ab. Die frühen Schritte sind kleiner als die späten. Ein Standbild allein zeigt die unterschiedlichen Impulsfolgen nicht vollständig. Die gestalterische Freigabe und ein späterer Belastungstest im vollständigen Spiel stehen noch aus.

Die alten Screenshots mit „Heute“ dokumentieren Revision 1 und gelten nicht als aktuelle Abnahme. Aktuelle Bilder tragen das Präfix impact-v3-.

# Tavernenfläche auf Mobilansichten stabil

Die lokale Hauptspielprüfung ist bestanden: zehn echte Teststarts mit 180 gemessenen Zuständen, ohne Größen- oder Positionswechsel von Dialog, Bühne, Canvas, Textbereich, Aktionsleiste oder Herzbereich. Das gilt auch beim regulären Verdienen von Herz 3, beim eingeblendeten „Ausprobieren“-Angebot und nach dessen Rückkehr zum normalen Hilfetext. Beide Antwortmöglichkeiten bleiben durch lokales Scrollen erreichbar. Kein JavaScriptfehler, sichtbarer Sitzungsfehler oder horizontaler Seitenüberlauf wurde beobachtet.

## Ursache und Korrektur

Die ursprüngliche englische Rig-Baseline umfasste **52 Zustände**, davon 28 mit einem Geometriewechsel. Bei 390 × 844 sank die Bühnenhöhe von 421,531 px auf 332,813 px im persönlichen Moment und auf 272,094 px bei einer Begegnung. Ursache waren verschiedene `flex-basis`-Werte für normalen Dialog, Geschichten und Begegnungen sowie unterschiedliche Höhen der unteren Aktionsleiste. Das äußere Dialogfenster blieb gleich groß. Siehe [Baseline und Grenzen](BASELINE.md) und [originale Messwerte](before/measurements.json).

Die Korrektur verwendet einen gemeinsamen scrollbaren Textbereich und reserviert im Hochformat feste Zeilen für Herzen/Freischalthinweis sowie die untere Aktionsleiste. Diese Hochformatreserven verändern das vorhandene Touch-Querformatraster nicht. Die normale Figurenfläche wird dabei bewusst etwas kleiner als zuvor, bleibt dafür beim Öffnen längerer Inhalte gleich groß.

Produktionsstellen: [gemeinsame Textfläche](../../../../experiments/idle-bastion/src/tavern-rig.css#L45), [feste Hochformatzeilen und Aktionsleiste](../../../../experiments/idle-bastion/src/tavern-rig.css#L99), [Encounterdarstellung ohne eigene Flächenvergrößerung](../../../../experiments/idle-bastion/src/tavern-ui.css#L207). Der Layoutfix stammt von Root; diese Prüfung änderte keine Produktionsdateien.

## Tatsächlich geprüft

| Test | Umfang | Ergebnis |
| --- | --- | --- |
| Isolierte echte Rig-UI | DE und EN, je 390×844 / 320×844 / 390×650 / 844×390, 128 Zustände | Keine Hochformatabweichung; Antwortziele bedienbar |
| Echtes Hauptspiel über `tavern-test.html` | Mara auf Deutsch und Ilyra auf Englisch, je fünf Touch-Viewports, zehn Teststarts / 180 Zustände | Keine Abweichung in Hoch- oder Querformat |

Die Rig-Seite importiert `landscape.css` nicht. Ihre 18 Querformatabweichungen sind deshalb ausdrücklich **keine** Hauptspielabnahme. Die entscheidende Hauptspielreihe emuliert `isMobile:true` und `hasTouch:true` bei DPR 1 und prüft die echte Aktivierung von `(pointer:coarse)` sowie des flachen Touch-Querformats. Sie lädt den normalen Main inklusive `landscape.css`, Renderer, Dialogen und persistenter Session aus einem neuen isolierten Testslot.

| Viewport | Konstante Bühnen-/Canvashöhe im echten Main | Aktionsleiste |
| --- | ---: | ---: |
| 390 × 844 | 369,203 px | 90 px |
| 320 × 844 | 369,203 px | 90 px |
| 390 × 650 | 214 px | 90 px |
| 844 × 390, Touch-Querformat | 302 px | 57 px |
| 667 × 375, Touch-Querformat | 287 px | 57 px |

Jeder Main-Fall startet über das echte Preset „persönliches Geschenk bereit“ bei 58/30, überreicht es über die normale Schaltfläche und erreicht dadurch Herz 3. Danach folgen Momente 1/3, Weiter, Beenden, Zurück, der Wechsel vom tatsächlichen neuen Herzangebot zum Hilfetext und eine optionale Begegnung mit Antwort, Abschluss und Zurück. Beide Antwortbuttons werden getrennt in den Textbereich gescrollt, auf Viewport-/Textbereichgrenzen geprüft und am tatsächlichen Mittelpunkt mit `elementFromPoint` getroffen; Mindesthöhe 44 px. Anschließend erscheinen wieder die drei Hauptaktionen. Die Hauptpartie wird nicht geöffnet.

Ein erster Antworttest war um **0,453 CSS-Pixel** zu streng: Der Browser rundete `scrollTop` ganzzahlig, während die Schaltflächenkante gebrochen blieb. Der Button war sichtbar und tatsächlich treffbar. Die Begrenzungsprüfung erlaubt nun einen CSS-Pixel Rundungstoleranz, ebenso wie die Layoutprüfung. Die finale Main-Reihe hatte tatsächlich null Geometrieabweichungen, nicht lediglich Abweichungen innerhalb dieser Toleranz.

Nachweise: [Rig-Ergebnis](after/summary.json), [Main-Ergebnis](main-after/summary.json), [alle Main-Messwerte](main-after/measurements.json). Ausgewählte echte Main-Screens für Normalzustand, Begegnung und Touch-Querformat wurden zusätzlich mit `view_image` angesehen. CSS-Hashes vor/nach den lokalen Läufen stimmen überein; während der Tests wurde kein CSS-Mischstand akzeptiert.

## Wiederholen und öffentliche Stichprobe

Testskripte: [Rig-Regression](check-mobile-stability.mjs) und [echter Main](check-main-mobile-stability.mjs). Beide werden ohne Produktionsänderungen ausgeführt:

```powershell
node artifacts/idle-bastion/tavern-implementation-2026-11-07/mobile-stability/check-mobile-stability.mjs --verify
node artifacts/idle-bastion/tavern-implementation-2026-11-07/mobile-stability/check-main-mobile-stability.mjs --verify
```

Für eine kleine öffentliche Stichprobe nach dem Deployment unterstützt der Main-Test einen vollständigen Basispfad, ohne lokale CSS-Hashes als Nachweis für den entfernten Build auszugeben. Die tatsächlich geladenen CSS-Adressen werden je Messung aufgezeichnet.

```powershell
$env:STABILITY_ORIGIN='https://emfau88.github.io/TD/previews/tavern/'
$env:STABILITY_VIEWPORT='390x844'
$env:STABILITY_COMPANION='mara'
$env:STABILITY_PHASE='main-public-smoke'
node artifacts/idle-bastion/tavern-implementation-2026-11-07/mobile-stability/check-main-mobile-stability.mjs --verify
```

`STABILITY_LANGUAGE` kann Deutsch (`de`) oder Englisch (`en`) vorgeben. Ohne Filter prüft der Main-Test wieder alle zehn Fälle. Öffentliche Prüfung, Build und Veröffentlichung übernimmt Root; sie sind nicht Bestandteil der hier dokumentierten lokalen Ergebnisse. Reale Handyhardware, Betriebssystemleisten, Zoom-/Schriftvergrößerung, Safe-Area-Sonderfälle und eine menschliche Nutzerabnahme wurden damit nicht geprüft.

# Drei Karten-Idle-Vorschauen · 25.10.2026

Nur Prototypen auf `codex/map-idle-trio-preview`, ausgehend vom freigegebenen Speer-Vorschau-Stand `ed6a4e3` (Spielbasis Main `f5b4a6f`). Kein Merge, Deployment oder Einbau ins Spiel. Die bereits akzeptierte Ilyra-Speer-/Pole-Vorschau bleibt unverändert.

## V2 · Korrektur des Flimmerns

Nach Nutzerfeedback zu allen drei Loops wurde nur die Vorschau-Aufbereitung korrigiert. Keine neuen Zeichnungen oder generierten Posen. Die ursprünglichen Quellen, Schlüsselbilder und V1-GIFs bleiben erhalten.

| Aktuelle Vorschau | GIF-Frames | Loop | Größe |
| --- | ---: | ---: | ---: |
| [Mara Hip Shift V2](Mara-Hip-Shift-Handy-V2.gif) | 53 | 3,40 s | 402.998 Bytes |
| [Mara Hair Adjust V2](Mara-Hair-Adjust-Handy-V2.gif) | 49 | 3,20 s | 369.418 Bytes |
| [Ilyra Hip Shift V2](Ilyra-Hip-Shift-Handy-V2.gif) | 62 | 3,90 s | 382.297 Bytes |

Ursache: Der V1-Renderer wechselte bei der Hälfte jedes Übergangs abrupt von der ersten zur zweiten Quellzeichnung. Unterschiedliche kleine Highlights, Gesichtszüge und Konturen wurden dadurch schlagartig sichtbar. Nächste-Nachbar-Abtastung plus binäre Zwischenbild-Alpha-Schwelle verstärkten die Pixelsprünge. Die bisherigen Prüfungen für Füße/Speer/Loop allein erfassten dieses Problem nicht.

V2 verwendet durchgängige, beidseitig bewegungsangepasste Interpolation für Körper und Arme, vormultipliziertes Alpha, Subpixel-Abtastung und eine einheitliche Rekonstruktionsfilterung. Die bewegten Abschnitte bekommen 40–50 ms pro Bild, entsprechend etwa 20–25 fps. Looplängen und Gestenphasen bleiben erhalten. Kopf/Gesicht und obere Haare kommen durchgehend aus derselben Ruhepose; damit entfällt dort das Detailflackern vollständig. Die Kopfbewegung ist bewusst zurückgenommen, während Hüftverlagerung und Armgesten erhalten bleiben. Die bewegten Körperkonturen sind etwas weicher als bei V1. Füße, Ilyras Speer und die gemeinsame GIF-Palette bleiben stabil.

[V2-Medienprüfung](stable-checks.json): kein harter Wechsel in der Übergangsmitte, identische Anschlüsse zwischen Schlüsselphasen und am Loopende, fester Kopf/Fuß/Speer, freie Bildränder, ursprüngliche Quellen/Produktionsdateien und akzeptierte Pole-Vorschau unverändert. Bei gleichmäßiger 50-ms-Abtastung sinkt der größte mittlere RGB-Bildsprung der 1×-Figur von 7,10 auf 1,24 (Mara Hip), 4,87 auf 1,07 (Hair) und 5,21 auf 1,02 (Ilyra Hip). Das belegt kleinere abrupte Bildänderungen, ersetzt aber keine subjektive Nutzerfreigabe.

[V2-Browserprüfung](browser-checks-v2.json): alle drei neuen GIFs laden und animieren bei 320×568 und 390×844 ohne horizontalen Überlauf oder Seitenfehler; Downloadziele geprüft. Mobile Emulation, kein physisches Handy. Die [Übersicht](index.html) zeigt jetzt V2. Kontaktbögen und Einzelbilder liegen unter `<Pose>/stable/`. Weiterhin nur Vorschau, kein Merge/Deployment. Kein Produktionsbuild oder Spieltestlauf nötig, da der Spielcode und seine Assets unverändert sind.

Reproduktion der Korrektur: `python artifacts/idle-bastion/previews/map-idle-trio/build_stable.py`, anschließend `check_stable.py` und `node artifacts/idle-bastion/previews/map-idle-trio/check_browser.mjs`. Die bestehende V1-Aufbereitung bleibt separat reproduzierbar.

## Ursprüngliche Handy-GIFs · V1

| Pose | Datei | GIF-Frames | Loop | Größe |
| --- | --- | ---: | ---: | ---: |
| Mara · Hip Shift mit Hand an der Seite | [Mara-Hip-Shift-Handy.gif](Mara-Hip-Shift-Handy.gif) | 18 | 3,40 s | 121.989 Bytes |
| Mara · Hair Adjust | [Mara-Hair-Adjust-Handy.gif](Mara-Hair-Adjust-Handy.gif) | 20 | 3,20 s | 127.845 Bytes |
| Ilyra · Hip Shift | [Ilyra-Hip-Shift-Handy.gif](Ilyra-Hip-Shift-Handy.gif) | 22 | 3,90 s | 130.868 Bytes |

[Lokale mobile Übersicht](index.html). Jede Datei ist 390×680 Pixel groß: oben Originalsprite und neue Geste auf Originalrasen mit Turm zum Größenvergleich, unten 4×-Detail. Die Figuren oben verwenden 64×64-Zellen, Fußpunkt (32,56) und etwa 38 Pixel Körperhöhe wie die Laufzeitfiguren. Bei 390 CSS-Pixeln Breite entspricht dies 1×; bei 320 Pixeln wird die gesamte Vorschau proportional verkleinert. Es handelt sich um eine zusammengesetzte Maßstabsprobe, keine Aufnahme einer integrierten Spielanimation.

Jede Pose hat sieben generierte Schlüsselposen plus 14 berechnete Zwischenbilder und die identische Ausgangspose am Ende: 22 Zeitabschnitte. Der GIF-Encoder fasst nach Palettenumwandlung identische Nachbarbilder zusammen, wobei ihre Dauer erhalten bleibt. Deshalb unterscheiden sich die tatsächlichen GIF-Framezahlen. Ruhephasen und Bewegungsphasen sind bewusst unterschiedlich lang.

## Basis und Gestaltung

- **Mara:** tatsächliche Laufzeitquelle `experiments/idle-bastion/assets/runtime/mara-game.webp`, erster Idle-Ausschnitt gemäß `src/art.ts` und `reference/src/style-assets.ts`: Quelle (85,27,191,269), Ziel (20,18,27,38) in einer 64×64-Zelle. Rote Haare/Zopf, Umhang, Werkzeug und Kleidung bleiben die Designgrundlage.
- **Ilyra:** tatsächlicher Laufzeitatlas `experiments/idle-bastion/assets/ilyra/ilyra-atlas.png`, erste 64×64-Idle-Zelle. Ergänzende zugehörige Designreferenz: `experiments/idle-bastion/assets/ilyra/sources/stand-approved.png`.
- **Kartenkontext:** vorhandene `public/assets/Grass Tileset.png`, `Tower 01.png` und `Tower 01 - Level 01 - Weapon.png`.

Die neuen Posen wurden mit dem eingebauten Imagegen aus diesen Referenzen erzeugt. Originale Generierungen und genaue Prompts liegen in den jeweiligen Unterordnern; Mara Hip Shift verwendet die zweite, deutlichere Fassung. Gemeinsame Skalierung, Fußanker, harte Alpha-Kante und festgehaltene Stiefel verhindern Größenpumpen und Fußrutschen. Ilyras Speer bleibt über den gesamten neuen Hip-Shift-Loop räumlich und farblich fixiert; der goldene Schaft stammt aus der generierten Quellgrafik. Zwischenbilder verwenden optischen Fluss mit nächstgelegener Quellpose, ohne Überblendungs-Doppelkonturen.

Mara Hip Shift betont die sichtbare Hand an der Seite und den Gegenversatz von Hüfte und Oberkörper. Hair Adjust führt den freien Ellbogen deutlich nach außen/oben und die Hand zum Haar. Ilyra bekommt die langsamere, stärkere Körperpose mit leicht nachlaufendem Haar und Gewand. **Am klarsten in echter Kartengröße liest sich Maras Hair Adjust**, weil sich die Arm-Silhouette am stärksten verändert. Die beiden Hip Shifts sind bewusst ruhiger.

## Prüfung und Grenzen

- [Medienprüfung](checks.json): GIF-Decode, Loopdauer, identische Anfangs-/Endbilder, binäres Alpha, freie Rahmenränder, feste Stiefel und bei Ilyra fester Speer. Quellen per SHA-256 geprüft; alle Dateien der akzeptierten Speer-Vorschau und die geprüften Produktionsreferenzen unverändert.
- [Browserprüfung](browser-checks.json): drei GIFs jeweils bei 320×568 und 390×844 in mobilem Chrome emuliert. Laden, tatsächliche Animation, Downloadziele und fehlender horizontaler Überlauf bestätigt; keine Seitenfehler. Kontaktbögen und mobile Aufnahmen visuell geprüft. Kein physisches Handy getestet.
- Ausschließlich Vorschaugrafiken, Aufbereitung und Dokumentation geändert. Kein Spielcode, kein Lauf-/Kampf-/Zauberatlas, keine Wirtschaft oder Spielstände geändert. Produktionsbuild und Spielsuiten wurden für dieses reine Medienpaket nicht erneut ausgeführt.
- Noch **nicht direkt integriert**: nur Frontrichtung, keine Auslöselogik und keine geprüften Übergänge vom tatsächlichen Laufzeitatlas in diese neu gezeichneten Posen. Visuelle Nutzerfreigabe der drei neuen Gesten steht aus.

## Reproduktion

Python mit Pillow, NumPy, SciPy und OpenCV; für die Vorschautypografie Segoe UI unter Windows. Aus dem Repository:

```powershell
python artifacts/idle-bastion/previews/map-idle-trio/build_previews.py
python artifacts/idle-bastion/previews/map-idle-trio/check_previews.py
node artifacts/idle-bastion/previews/map-idle-trio/check_browser.mjs
```

Der Browsercheck benötigt Playwright und installiertes Chrome. Optional verweist `PLAYWRIGHT_MODULE` auf die `index.mjs` einer vorhandenen Playwright-Installation. Einzelbilder, Kontaktbögen und Manifeste liegen unter `mara-hip/`, `mara-hair/` und `ilyra-hip/`; Skripte schreiben ausschließlich Vorschau-/QA-Ausgaben.

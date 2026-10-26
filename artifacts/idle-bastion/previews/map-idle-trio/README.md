# Drei Karten-Idle-Vorschauen · 25.10.2026

Nur Prototypen auf `codex/map-idle-trio-preview`, ausgehend vom freigegebenen Speer-Vorschau-Stand `ed6a4e3` (Spielbasis Main `f5b4a6f`). Kein Merge, Deployment oder Einbau ins Spiel. Die bereits akzeptierte Ilyra-Speer-/Pole-Vorschau bleibt unverändert.

## Mara · Hand an die Hüfte · neuer Versuch V3 · 26.10.2026

**[Mara-Hip-Shift-Handy-V3.gif](Mara-Hip-Shift-Handy-V3.gif)** · [ungeglättete Ansicht mit Einzelbildsteuerung](mara-hip-v3.html) · [Kontaktbogen](mara-hip/authored-v3/contact-sheet.png). **304×600 Pixel, 44.975 Bytes, vier unterschiedliche Posen / sieben GIF-Frames, 2,87 Sekunden.** Oben 38 Pixel Figurenhöhe bei 1× neben dem echten Laufzeitsprite; unten 4×-Detail. Zusammengesetzte Maßstabsprobe, keine Spielintegration.

Nach Ablehnung von Ilyra V4 wurde eine einzelne neue Mara-Idle-Probe beauftragt. Schwerpunkt ist die lesbare Arm-Silhouette: freie Hand an die Hüfte, Ellbogen nach außen, kleine Gewichtsverlagerung und ruhige Rückkehr. Die Kontur am Ellbogen verändert sich um mindestens zwei Kartenpixel; die gesamte Silhouette unterscheidet sich in der Hauptpose an 28 Pixeln. Das sind technische Größenbelege, keine automatische Bewertung der Animationsqualität.

Grundlage ist ausschließlich Maras tatsächlich verwendete Laufzeitquelle `experiments/idle-bastion/assets/runtime/mara-game.webp`, erste frontale Idle-Pose. Der eingebaute **Imagegen** erzeugte ein neues Posenblatt und eine gezielte Revision für deutlichere Körperhaltung; [Prompt](mara-hip/authored-v3/prompt.txt), [Revisionsprompt](mara-hip/authored-v3/prompt-revision.txt) und beide unveränderten Rohquellen unter `mara-hip/authored-v3/source/` bleiben erhalten. Es werden vier unterscheidbare Zeichnungen aus dem revidierten Blatt verwendet: Zellen 0, 6, 1, 4; zurück über dieselben Posen. Nahezu identische alternative Zeichnungen wurden verworfen, weil sie vor allem Details wechseln lassen.

Einheitlicher Maßstab 0,09, vermessene Fußanker, 32 gemeinsame Spritefarben ohne Dithering, binäres Alpha. Kopf/Gesicht, erhobenes Werkzeug und Stiefel stammen in allen Posen pixelgleich aus der neutralen Zeichnung. Direkt abgespielte Posen, keine berechnete Bildverformung, kein optischer Fluss, keine Überblendung und keine Weichzeichnung. Die Hauptpose steht 950 ms, der Grundstand insgesamt 1.300 ms über die Loopgrenze; die Übergänge dauern 130/180 ms. Das ist ein ruhiger, bewusst knapp gezeichneter Idle und keine flüssige 30-fps-Animation.

Reproduktion: `python artifacts/idle-bastion/previews/map-idle-trio/build_mara_authored.py`, anschließend `check_mara_authored.py` im selben Ordner. [Manifest](mara-hip/authored-v3/animation.json) · [Medienprüfung](mara-hip/authored-v3/checks.json). Tatsächliche Kartengröße, feste Bereiche, Alpha/Palette, sichtbare Konturänderung, freie Ränder, identische Rückkehr-/Loopbilder und exakte 4×-Pixelblöcke des dekodierten GIF geprüft. Sämtliche Ilyra-Dateien einschließlich akzeptierter Speeranimation, Mara Hair Adjust, frühere Mara-GIFs und Produktionsdateien gegenüber `d4aad72` unverändert. Kein Spielbuild/Spieltestlauf für dieses reine Vorschaupaket; keine Änderungen an Lauf-/Kampf-/Zauberanimationen, Gameplay oder Saves. Visuelle Nutzerfreigabe offen, kein Merge/Deployment.

Die [Browserprüfung](mara-hip/authored-v3/browser-checks.json) bestätigt Laden, native 304-Pixel-Breite ohne zusätzliche Verkleinerung, fehlenden horizontalen Überlauf, laufende Wiedergabe, Pause, Vor-/Rückschritt und Auswahl der Hauptpose. [Aufnahme](mara-hip/authored-v3/browser-frame-3.png). Desktop-In-App-Browser mit schmaler Vorschau, keine physische Handyprüfung.

## Ilyra Hip Shift · V4 · vom Nutzer abgelehnt · 26.10.2026

**Status:** Der Nutzer hat diese Fassung mit „gefällt mir nicht“ abgelehnt und stattdessen einen neuen Mara-Idle-Versuch beauftragt. V4 bleibt als unveränderte historische Vorschau erhalten; keine Integration oder weitere Ilyra-Bearbeitung.

**[Neue Handy-Vorschau](Ilyra-Hip-Shift-Handy-V4.gif)** · [ungeglättete Ansicht mit Pause/Einzelbildern](ilyra-hip-v4.html) · [fünf Posen nebeneinander](ilyra-hip/parts-v4/contact-sheet.png). 304×600 Pixel, 53.116 Bytes, fünf unterschiedliche 64×64-Posen / neun GIF-Frames, **2,74 Sekunden**. Oben 1× neben dem Laufzeitsprite, unten dieselben Pixel 4× vergrößert.

Die Darstellungsprobe wurde vom Nutzer als besser, aber nur etwa 6/10 bewertet. Daraufhin ausdrücklich beauftragt: ausschließlich Ilyras Hip Shift mit zusammenhängend bewegten Körperteilen und sauberen Übergangsposen neu aufbauen. Mara und die akzeptierte Speer-/Pole-Animation bleiben unverändert.

V4 zerlegt die vorhandene neutrale Zeichnung `ilyra-hip/keys/00.png` in elf Ebenen: feste Bereiche, Gewand, Kopf, Arme, Oberkörper, Hüfte sowie Ober-/Unterschenkel. Die Zeichnung stammt aus der V1-Vorschau auf Basis des echten Laufzeitatlas `experiments/idle-bastion/assets/ilyra/ilyra-atlas.png` und `experiments/idle-bastion/assets/ilyra/sources/stand-approved.png`; keine neue Bildgenerierung. Hüfte zwei Kartenpixel nach rechts und einen nach unten, Oberkörper/Kopf dagegen nach links. Zwei verbundene Beinsegmente führen die Knie bei festem Fußpunkt nach. Jede Ebene wird nur starr verschoben oder gedreht, genau einmal mit nächstem Quellpixel abgetastet. Überlappende Originalpixel an den Gelenken, eine verdeckte Gewandfläche in vorhandener Farbe und eine lokale Nahtkorrektur schließen aufgedeckte Lücken. Keine zeilenweise Verformung, Bildmischung, Weichzeichnung oder neue Zwischenfarben in den Spriteframes.

Fünf bewusst gesetzte Posen: Idle → Gewicht ansetzen → Hüfte verlagern → Schultern nachführen → Gegenpose. Danach derselbe Weg rückwärts. Die Gegenpose dauert 700 ms, die Übergänge jeweils 120–160 ms; die beiden identischen Idle-Endbilder ergeben über die Loopgrenze eine ruhige Pause von 1.200 ms. Die geringere Zahl klarer Posen ist Absicht. Rasterbedingte Ein-Pixel-Schritte bleiben möglich; **technische Schärfe ist keine visuelle Nutzerabnahme**. Nur frontaler Prototyp, noch kein integriertes Spielasset.

Reproduktion und begrenzte Medienprüfung:

```powershell
python artifacts/idle-bastion/previews/map-idle-trio/build_ilyra_parts.py
python artifacts/idle-bastion/previews/map-idle-trio/check_ilyra_parts.py
```

[Manifest](ilyra-hip/parts-v4/animation.json) · [Prüfergebnis](ilyra-hip/parts-v4/checks.json). Geprüft: neutrale Pose sichtbar identisch zur Quelle, ausschließlich Quellfarben/binäres Alpha, unveränderte Gesichtspixel, feste Füße/Speer, starre Teiltransformationen ohne Streckung, konstante Beinlängen, keine eingeschlossenen transparenten Löcher im Rumpf, identische Loop-Enden/Rückkehrposen, keine abgeschnittenen Pixel und exakte 4×-Pixelblöcke im dekodierten GIF. Alle bisherigen Mara-/Pole-/Spieldateien gegenüber `29d7d4c` unverändert. Nur Medien- und Vorschauseitenprüfung; keine neue Spieltestsuite oder Produktionsbuild erforderlich, da keine Laufzeitdatei geändert wurde. Visuelle Freigabe offen.

Die [Browserprüfung](ilyra-hip/parts-v4/browser-checks.json) bestätigt Laden, native 304-Pixel-Breite, `image-rendering:pixelated`, keinen horizontalen Überlauf sowie Vor/Zurück, Auswahl der Gegenpose, Abspielen und Pause. [Aufnahme der Gegenpose](ilyra-hip/parts-v4/browser-frame-4.png). Prüfung im Desktop-In-App-Browser mit fester schmaler Vorschau; kein Test auf physischer Smartphone-Hardware.

## Darstellungsprobe nach erneutem Kontur-Feedback · 26.10.2026

V3 wurde vom Nutzer weiterhin als verschwommen beziehungsweise glitchend an bewegten Konturen beanstandet. Die Prüfung auf scharfe Einzelpixel bestätigt keine sauber lesbare Bewegung. Die zeilenweise quantisierten Verschiebungen der V3 können Konturabschnitte zu unterschiedlichen Zeitpunkten springen lassen; dieser Bewegungsaspekt bleibt offen.

Zusätzlich direkt im geöffneten Nutzerbrowser gemessen: Das 390×680-GIF wurde mit `image-rendering:auto` auf 318,997×555,989 verkleinert. Die 4×-Detailansicht wurde dabei auf etwa 3,27 CSS-Pixel pro Sprite-Pixel umgerechnet. Diese zusätzliche Glättung muss getrennt von der Animation beurteilt werden.

**[Unveränderte V3-Bewegung in einer 304-Pixel-GIF-Probe](Ilyra-Hip-Shift-Pixelcheck.gif)** · [lokale Ansicht ohne Bildglättung, mit Pause/Einzelbildern](ilyra-hip-pixelcheck.html). Keine V4, keine neue Pose und keine behauptete Behebung aller Konturprobleme. Nur die Präsentation wurde schmaler aufgebaut; Quellframes und Timing bleiben gleich. Die lokale HTML-Ansicht verwendet feste Pixelgrößen, `image-rendering:pixelated` und ausgeschaltete Canvas-Bildglättung. Die unveränderte V3 darf dadurch nicht als visuell abgenommen gelten.

[Messwerte und tatsächlich geprüfte Bedienung](ilyra-hip/pixelcheck/browser-checks.json). GIF-Aufbereitung mit `build_ilyra_pixelcheck.py`; Manifest unter `ilyra-hip/pixelcheck/`. Im Browser wurden Laden, 304-Pixel-Darstellung, fehlender Überlauf, Einzelbildwechsel, Abspielen, Pause und Auswahl von Bild 8 geprüft. Die Bewegungsqualität bleibt zur Klärung offen. Kein Merge/Deployment und keine Änderung an Mara, Pole-Animation oder Spielassets.

## Ilyra Hip Shift · V3 · weiterhin visuell beanstandet

**[Ilyra-Hip-Shift-Handy-V3.gif](Ilyra-Hip-Shift-Handy-V3.gif)** · [eigene mobile Vorschauseite](ilyra-hip-v3.html). 390×680, 91.620 Bytes, 3,40 Sekunden, 15 exportierte GIF-Frames aus acht unterschiedlichen Pixelposen. Oben Kartenmaßstab neben dem originalen Laufzeitsprite, unten dieselben Pixel 4× vergrößert.

Nach ausdrücklicher Beschränkung auf Ilyra wurde ein neuer, einfacher Bewegungs-Rig aufgebaut. Er verwendet ausschließlich die vorhandene Ausgangszeichnung `ilyra-hip/keys/00.png`, ursprünglich abgeleitet aus dem Laufzeitatlas `experiments/idle-bastion/assets/ilyra/ilyra-atlas.png` und seiner freigegebenen Standreferenz. Keine neue Generierung und kein Wechsel zwischen unterschiedlich gezeichneten Figuren. Hüfte maximal drei Kartenpixel zur Seite, Kopf/Schulter bis einen Pixel dagegen; Knie gehen mit, Füße und Speer bleiben fest. Der Rückweg verwendet dieselben Posen in umgekehrter Reihenfolge.

Die Verschiebungen werden zuerst auf ganze Pixel gerundet und dann ohne Farbinterpolation abgetastet. Das verhindert zusätzlich, dass halbe Pixelkoordinaten beim Runden abwechselnde Bildspalten verdoppeln. Der Kopf bewegt sich als zusammenhängende Zeichnung; er wird nicht mehr als unbeweglicher Ausschnitt auf den Körper geklebt. Keine Überblendung, Weichzeichnung, optischer Fluss oder teiltransparenten Sprite-Kanten. Bewusst wenige klare Posen statt künstlich erhöhter Bildzahl. Die Bewegung ist eine neue kontrollierte Umsetzung der Hüftgeste, keine pixelgenaue Rekonstruktion aller alten Ganzkörperposen.

[Prüfung](ilyra-hip/rig-v3/checks.json): ausschließlich Originalfarben, Alpha nur 0/255, Gesicht beim Verschieben pixelgleich, exakte 4×-Pixelblöcke auch im decodierten GIF, feste Füße/Speer, identische Loop-Endpunkte und freie Ränder. [Mobile Browserprüfung](ilyra-hip/rig-v3/browser-checks.json): Wiedergabe, Breite und Download bei 320×568/390×844 bestanden. Kontaktbogen und mobile Aufnahmen geprüft; keine physische Handyprüfung. Schärfe ist technisch bestätigt, Natürlichkeit und gewünschte Wirkung bleiben zur visuellen Nutzerabnahme offen.

Reproduktion: `build_ilyra_rig.py`, `check_ilyra_rig.py` und `check_ilyra_rig.mjs` in diesem Ordner. Einzelbilder und Manifest unter `ilyra-hip/rig-v3/`. Mara, sämtliche früheren GIFs, die akzeptierte Speer-/Pole-Animation und alle Produktionsassets bleiben unverändert. Nur Vorschau; kein Merge, keine Integration, kein Deployment, kein erneuter Spielbuild/Testlauf.

## V2 · vom Nutzer wegen Unschärfe verworfen

Die folgende V2 ist historisch dokumentiert und **keine akzeptierte Lösung**. Das Mischen und Filtern der Bildfarben erzeugte in bewegten Bereichen einen Nebelschleier. Kleinere gemessene Bildsprünge waren dafür kein ausreichendes Qualitätskriterium.

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

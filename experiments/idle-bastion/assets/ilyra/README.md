# Ilyra — Lauf- und Zauberanimationen

**Ergänzung 31.10.2026:** Der Nutzer hat die vorhandene V3-Speer-Idle nun ausdrücklich
für die Karte freigegeben. Sie liegt getrennt in [idle-spear](idle-spear/README.md).
Der folgende Originalatlas für Stand/Laufen/Zauber bleibt unverändert; frühere
„noch keine Idle“-Angaben beschreiben den damaligen Stand.

32 Rahmen auf einem 512 × 256 PNG-Atlas, jeweils 64 × 64 Pixel mit Fußpunkt **(32, 56)**. Vier Richtungen: unten, rechts, oben, links. Die linke Ansicht spiegelt die rechte um die Rahmenmitte; dadurch wechselt die Speerhand. Diese Vereinfachung ist nur für die Figurendarstellung gedacht, nicht für die Berechnung von Treffern oder Zielen.

## Dateien und Verwendung

- `ilyra-atlas.png`: Laufzeitgrafik mit binärer Transparenz, ohne Glättung darstellen.
- `animations.json`: Richtungen, Bildnummern und echte Phasendauern. Jede Richtung besitzt Stand, vier Laufphasen und drei Zauberphasen.
- `packing.json`: Gemessene Quellbereiche, Bodenanker und Maßstab für jedes Bild; keine unabhängig gestreckten Einzelposen.
- `pack.ps1`: Reproduzierbare technische Aufbereitung unter Windows mit System.Drawing. Ausführen mit `powershell -File experiments/idle-bastion/assets/ilyra/pack.ps1` vom Repository-Stamm. Erzeugt Atlas und `bounds.json`, verweigert leere oder am Rand abgeschnittene Rahmen.
- `bounds.json`: Sichtbare Grenzen jedes Rahmens, rechts/unten exklusiv.
- `stand-approved-64.png` und `sources/stand-approved.png`: unveränderte freigegebene Standreferenz. Die Laufzeit-Standbilder stammen für einen ruhigeren Übergang aus dem jeweiligen Zauberausklang; die Referenz bleibt nachvollziehbar erhalten.
- `sources/walk.png`, `sources/cast.png`: unveränderte generierte Rohbilder. Ihre Anordnung ist nur näherungsweise regelmäßig; ausschließlich die vermessenen Bereiche aus `packing.json` ausschneiden.

Atlaszeilen: unten, rechts, oben, links. Spalten: Stand, Schritt 1–4, Vorbereitung, Auslösen, Ausklang. Laufzyklus 8 Bilder/s, 500 ms pro Durchlauf. Zauber: 243 ms Vorbereitung, 189 ms Auslösen, 270 ms Ausklang, danach Stand; **nicht** endlos wiederholen. Im Spiel startet der Flug nach 243 ms, trifft bei 810 ms und klingt bis 1.282,5 ms aus. Bewegungsgeschwindigkeit und tatsächliches Ziel kommen aus der Simulation, nicht aus dieser Vorschau. Noch keine Projektile oder Treffer in die Figur eingebrannt.

Aufbereitung: gemeinsamer Faktor 0,13 für Lauf-/Zauberquellen, Sample am Pixelzentrum, Alpha ab 200 deckend, darunter transparent. Kopf bis Boden etwa 37–39 Pixel, Speer ungefähr 45 Pixel. Fußpunkte je Pose vermessen; keine automatische Zentrierung anhand der gesamten Silhouette, weil der Speer sonst den Körper verschiebt.

## Herkunft und Prompts

Erzeugt mit dem **eingebauten Imagegen-Werkzeug**, keine CLI/API-Alternative. Die bestehende Mara dient nur als Maßstabs- und Stilreferenz. Ihre Originaldatei `public/assets/Hero Mara.png` und der Aufbereitungsvertrag `reference/src/style-assets.ts` wurden nicht verändert.

| Quelle | Vollständiger Prompt | Bildreferenzen |
| --- | --- | --- |
| Freigegebene Standpose | [stand.txt](prompts/stand.txt) | Zuvor freigegebenes Ilyra-Porträt und bestehende Mara; Bezug im ursprünglichen Prompt |
| Laufserie, erster Entwurf | [walk.txt](prompts/walk.txt) | Freigegebene Standpose und vergrößerte Original-Mara |
| Verwendete Laufserie | [walk-correction.txt](prompts/walk-correction.txt) | Erster Laufentwurf und freigegebene Standpose; engere Durchgangsposen statt nahezu identischer Beinstellungen |
| Zauberserie | [cast.txt](prompts/cast.txt) | Verwendete Laufserie und freigegebene Standpose |

Die drei Animationserzeugungen umfassen einen verworfenen ersten Laufentwurf, eine gezielte Laufkorrektur und das verwendete Zauberblatt. Die verworfene Grafik wird nicht ausgeliefert. Das neue Design bleibt eine erwachsene Ilyra mit weißem Haar, warmer Haut, weiß-blauer Kleidung, goldenen Akzenten, blauem Umhang und Kristallspeer.

## Vorschau und Einbindung

[Bewegte Vorschau auf GitHub Pages](https://emfau88.github.io/TD/idle-bastion/ilyra-check.html), lokal unter `/ilyra-check.html` mit `npm run idle:dev` oder nach `npm run idle:build` mit `npm run idle:preview`. Sie zeigt echte Spielgröße neben Mara und eine ganzzahlig vergrößerte Detailansicht; Richtung, Aktion, Pause und Einzelbilder lassen sich auswählen. Es werden keine Spielstände gelesen oder geschrieben.

Die Vorschau bleibt ein eigener Einstiegspunkt. Die Spielszene lädt denselben Atlas: `ilyraFrame` steuert Richtung/Laufen sowie die 0,243/0,189/0,270 Sekunden langen Zauberphasen anhand der Simulation. `IlyraView` zeichnet die gespeicherte Salve; Pause und Reload verwenden denselben Zeitstand. Prüfung und Nutzerabnahme stehen unter B15b in der [Roadmap](../../ROADMAP.md).

## Transparenzkorrektur vom 20.10.2026

Die Stand-/Ausklangpose zur Seite enthielt dunkle Brücken zwischen Körper und Speerschaft. `packing.json` enthält dafür eng begrenzte `clearRuns` (Zeile, erste/letzte Spalte, inklusive). Die Packung löscht ausschließlich geprüfte dunkle Hintergrundpixel, bevor sie die Gegenrichtung spiegelt; farbige Pixel an diesen Stellen lösen einen Fehler aus. Körperfarben, Waffenfarben, Rahmen und Fußpunkte bleiben unverändert. Laufposen und übrige Zauberphasen wurden auf hellem Grund mit angesehen; die Vorbereitung erhält ebenfalls eine kleine Lückenkorrektur. Originalquellen bleiben erhalten, `pack.ps1` reproduziert die Laufzeitgrafik.

Ein Reparaturversuch mit dem eingebauten Imagegen-Werkzeug veränderte zusätzliche Details und wurde **nicht als neue Spielfigur übernommen**. Der [vollständige Versuchsprompt](prompts/alpha-repair.txt) bleibt dokumentiert; die endgültige technische Alpha-Maske steht in `packing.json`, die Projektgrafik in `ilyra-atlas.png`. Keine neue Idle-Animation: Ilyra und Mara sind dafür separat in der Roadmap vorgemerkt.

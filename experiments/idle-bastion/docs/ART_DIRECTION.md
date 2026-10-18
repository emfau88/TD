# SPIRE: Idle Bastion – Grafik- und Assetvertrag

Stand: 17.10.2026. Verbindlich für den Slice; tatsächlicher Umsetzungsstand siehe [Roadmap](../ROADMAP.md).
Der Umfang und die Freischaltungen stehen in den übrigen Slice-Dokumenten. Dieses Dokument legt Maßstab, Quellen, Produktion und visuelle Prüfung fest.

## Referenzhierarchie

1. Die **vom Nutzer abgenommene Waldkarte** und [der bestehende Grafikvertrag](../../../reference/STYLE_GUIDE.md) bestimmen Perspektive, Maßstab, Materialdarstellung und Pixelstruktur.
2. Echte Spielansichten: [Waldübersicht](../../../artifacts/m2/overview.png), [Waldkampf](../../../artifacts/m2/combat.png), [Abnahmebericht](../../../artifacts/m2/REPORT.md).
3. Die Nutzermockups zeigen Stimmung, Siedlungsnähe und Informationshierarchie: [früher Ausbau](references/vision-einstieg.png), [spätere Vision](references/vision-ausbau.png). Auch das erste Bild zeigt bereits einen ausgebauten Zustand, nicht Sekunde null.
4. Ein neu erzeugtes Rohbild wird erst nach Aufbereitung und Prüfung im tatsächlichen Spielmaßstab zur Laufzeitgrafik.

Die Mockups enthalten andere Gebäude, größere beziehungsweise dichtere Vegetation und zusätzliche Systeme. Diese Unterschiede sind kein Auftrag, die vorhandene Welt umzuskalieren oder sämtliche dargestellten Inhalte zu bauen. Späherposten, Charakterlevel, Forschungskomplex und Turm-Lebensbalken gehören nicht zum Slice. Gegner greifen den Kern an; Türme erhalten keine scheinbaren Lebensbalken.

## Gemeinsamer Maßstab

Alle Maße unten sind Spieleinheiten bei 100 % Weltmaßstab. Eine Zelle bleibt **40 × 40**. Die Kamera skaliert die Welt proportional; einzelne Objekte werden nicht unabhängig vergrößert. Hochkant wird ein größerer Ausschnitt gezeigt und horizontal verschoben, damit Figuren und Türme lesbar bleiben. Die explizite Übersicht passt die gesamte Welt ein.

| Element | Vorhandene Quelle | Laufzeitmaß und Anker |
| --- | --- | --- |
| Gras und Weg | Foozle, 64 × 64 Teile | 40 × 40; Faktor 0,625; Ursprung links oben |
| Wasser | Originalteile 32 × 32 aus zehn Konstruktionsframes | 20 × 20 je Teil; zwei Teile pro Spielzelle; vorhandene Anschlüsse und Animation übernehmen |
| Bäume | Einzelzuschnitte 62 × 64 | Rahmen 49,6 × 51,2; Faktor 0,8; Mitte unten; vorhandene Platzierungsregel |
| Waldwächter | Basis 64 × 128, Waffe 96 × 96 | Faktor 0,63; sichtbare Basis Stufe I ungefähr 40 × 62; Originalmontage beibehalten |
| Wisp | 64 × 64 Frames | Faktor 0,9; sichtbare Silhouette ungefähr 23 × 30; Ursprung (0,5 / 51÷64) |
| Mara | Vorhandene vermessene Quelle, 64 × 64 Laufzeitframes | Maßstab 1; sichtbare Höhe etwa 38–42; Fußpunkt (32 / 56) |
| Rosenspiegel | `public/assets/Succubus Pixel v2.png` (vorhandener v3-Inhalt unter Kompatibilitätsnamen), reine Frame-Funktion aus `reference/src/succubus-art.ts` | 64 × 64 Frames; Faktor 1,15 als Boss, Fußpunkt (32 / 56). Vorhandenes Laufen und Tanzen; Herzfaden/Zielring als Canvas-Effekte; auf ausdrücklichen Nutzerwunsch zusätzlich 136 × 164 CSS-Pixel großes Tanzfenster mit dem Original-HD-Atlas |
| Andere Türme/Gegner | Vorhandene Atlanten und Metadaten | Bestehende Skalierung und Montage übernehmen; keine gemeinsame Größen-Normalisierung |

**Bildrahmen, sichtbare Silhouette und belegte Bodenfläche sind verschiedene Größen.** Die Außenabmessungen eines PNGs definieren weder die Kollisionsfläche noch die sichtbare Größe. Transparenter Rand zählt nicht zur Silhouette.

Leichte Draufsicht, Blickrichtung und Lichtführung entsprechen den Originaltürmen. Keine neue Isometrie. Große lesbare Farbflächen, klare Konturen und kleine Bodenschatten; keine weichen Renderkanten, fotorealistischen Materialien oder überfeinen Dachdetails. Gebäude stehen über ihrem Bodenanker, Figuren laufen auf der Bodenebene.

Farbanker aus dem bestehenden Gelände: Gras `#63ab3f`, helle Vegetation `#c8d45d`, dunkle Vegetation `#3b7d4f`, Erde `#ffae70`, Erdkontur `#bd6a62`, Wasser `#92e8c0`. Sie dienen dem Abgleich, nicht einer pauschalen Umfärbung vorhandener Assets. Die zusätzliche Premium-Überarbeitung verwendet dunkle Tinten-/Schieferflächen (#111c20 bis #1b292e), fein gefasstes Messing (#c5a366), warme Goldaktionen (#cfad6e) und helle Pergamentschrift. Grün bleibt der Landschaft und kleinen aktiven Kampfsignalen vorbehalten; keine Neonfarben. Der Kontrast zu den hellen Spielsprites und der Waldkarte bleibt deutlich.

## Karte, Kamera und Komposition

- Die bestehende klassische Karte bleibt unverändert; für Idle wird ein eigenes Startlayout gestaltet.
- Startgebiet: **28 × 16 Zellen / 1120 × 640**. Im Slice genau eine Erweiterung um **bis zu acht Spalten rechts**, insgesamt höchstens **36 × 16 / 1440 × 640**. Die östliche Lichtung verwendet vier dieser Spalten: **32 × 16 / 1280 × 640**, zwei Plätze in der ersten neuen Spalte.
- Das freigelegte Gebiet wird Teil derselben zusammenhängenden Welt. Die Kamera kann dorthin verschoben werden; die Objekte behalten ihren Maßstab. Kein automatisches Verkleinern der ganzen Welt beim Ausbau.
- Elf feste Turmplätze im Startgebiet, davon fünf zu Beginn verfügbar, einschließlich des belegten Startplatzes. Je drei weitere öffnen bei gemeisterter Welle 5 und 10. Zwei weitere Plätze liegen in der späteren Erweiterung; insgesamt dreizehn. Der Nutzerauftrag nach B10 ergänzt Nordbogen (11,4), Mittelpass (16,7) und Südbogen (23,9), ohne bestehende Plätze zu versetzen.
- Noch gesperrte Plätze bleiben zurückhaltend lesbar. Keine zehn blinkenden Bauaufforderungen im Einstieg.
- Am Desktop sind Startturm, erste Gegner, Mara, Kern, Werkstattstelle und erster vorgeschlagener Bauplatz im Startausschnitt gleichzeitig sichtbar. Hochkant führen die Dockkarten zum relevanten Ausschnitt; zusätzlich sind freie Bauplätze über große Schaltflächen wählbar.
- Die erste Abnahme prüft das einschließlich HUD bei **1366 × 768**. Eine Ansicht bei **1920 × 1080** ergänzt den Vergleich. UI-Höhe und Startkomposition werden zusammen festgelegt.
- Für die Lichtung werden vorhandene Gras-/Baum-/Fels-/Blumenframes verwendet. Keine neuen Gebäude- oder Bildassets; das kleine Dock-Waldsymbol folgt dem vorhandenen SVG-Pixelraster. Bestehende Baumvarianten und Positionen bleiben beim Öffnen erhalten.
- Die Erweiterung öffnet eine sichtbare Waldkante. Der bestehende Weg wird im Slice nicht neu geroutet; die neuen Plätze liegen vorzugsweise in den ersten ein bis zwei neuen Spalten und müssen taktisch relevante Schussfenster auf den letzten Wegabschnitt besitzen. Tiefer östlich liegende Plätze dürfen nicht durch künstlich erhöhte Reichweite gerettet werden.
- Der seitliche Ausbau ist auf dem Startausschnitt bereits als mögliche Lichtung erkennbar, ohne spielbare Fläche vorzutäuschen.
- Im Idle-Startlayout Kernposition und Gegnerpfadende ausdrücklich zusammenführen. Die klassische Kombination aus gezeichnetem Kern bei [27,8] und Pfadende [28,8] jenseits der Karte nicht blind übernehmen; nach Freilegung darf niemand sichtbar hinter dem Kern weiterlaufen.
- Werkstatt und Lager haben feste Grundstücke abseits des Gegnerwegs. Zugängliche Gehflächen verbinden sie mit den erreichbaren Turm-Nachbarfeldern.
- Ein Baum, Fels oder Gebäude darf keine scheinbar freie Bau- oder Gehfläche verdecken. Die Bodenbelegung folgt den tatsächlichen Objekten.

Ein kurzer Klick wählt aus; Ziehen ab sechs Bildschirmpixeln verschiebt die Karte und löst beim Loslassen keinen Bau aus. Nach bestätigtem Turmbau schließen Platzierung und Turmverwaltung; erneutes Antippen öffnet die Werte. Fehlerhafte oder nicht bezahlbare Käufe behalten ihren Hinweis. Übersicht und Zoom bleiben sichtbar. Der Kamerafokus auf einen Bauplatz folgt einer bewussten Auswahl im Dock; keine eigenständigen Schwenks während einer Platzierung.

### Oberfläche nach den Mockups

Die Welt ist die Hauptfläche. Oben stehen Gold, Kernleben und Welle in einer schmalen Leiste, unten Turm-/Siedlungskarten, Mara und Kampfsteuerung in einem kompakten Dock. Vorhandene Spielsprites bilden die Kartenillustrationen. Vier echte Imagegen-Assets bilden die Messingrahmen, eingelassenen Kartenflächen, goldenen Hauptaktionen und die Münze. Rahmen werden per CSS in neun Teilflächen skaliert, sodass ihre Ecken erhalten bleiben; keine eingebrannten Texte. Pixelify Sans wird lokal für Titel und Kennzahlen geladen, kleine Erklärtexte bleiben in gut lesbarer Systemschrift. Kontrollsymbole teilen ein kleines SVG-Pixelraster. [Originale, vollständige Prompts, Kodierung und Schriftlizenz](../assets/ui/README.md). Goldzufluss, Wellenrekord und Modus bilden eine kleine Statusgruppe; ein schmaler Zielstreifen führt zum nächsten Kauf. Das Buchsymbol öffnet die Chronik mit Ertragserklärung und Wellenhistorie.

Während Welle 15 ersetzt ein kompakter Bossrahmen den Zielstreifen: HP, Verführung mit Ziel und Restdauer, Frost-Unterbrechung und verbleibende Begleiter. Er verwendet dasselbe Messingrahmen-Asset; hochkant bleibt das 56-px-HUD und 96-px-Dock erhalten. Keine zusätzliche dauerhafte Leiste.

Turmwerte, Upgrades und Gebäudeforschung erscheinen erst nach Auswahl. Am Desktop steht das Fenster neben dem Objekt, hochkant als schließbare Karte über dem Dock. Speicherinformationen, Hilfe und Probenstart liegen im Menü. Bau-/Forschungsmeldungen sind kurz; normale Abschüsse erzeugen keine ständig wechselnde Textleiste. Die schmale Ansicht zeigt den Kampfzustand auf der Karte und ersetzt den breiten Auto-Kampf-Schalter durch Pause/Fortsetzen. Geräte-Schutzabstände und große Aktionsflächen berücksichtigen; echte Geräteprüfung gesondert ausweisen. Die Spielfläche rendert bei dichterem Display in doppelter interner Auflösung (höchstens Faktor 2), bei unveränderter CSS-Größe. Kamera und Eingaben verwenden dieselbe Umrechnung; Beschriftungen besitzen doppelte Texturauflösung, 11-px-Fettschrift und schmalere Kontur. Keine geglätteten Pixel-Sprites.

Die Zahlen sind die Ausgangsentscheidung für den Slice. Ergibt die erste maßstäbliche Ansichtsprüfung ein konkretes Platzproblem, zuerst UI, Positionen und Dekoration korrigieren. Eine notwendige Maßänderung mit Begründung in den Plan zurückschreiben; niemals still Gebäude oder Figuren strecken. Eine große Welt und zusätzliche Angriffsrouten bleiben außerhalb des Slice.

## Gebäude – kleiner verbindlicher Produktionsumfang

Das vorhandene Foozle-Builder-Pack enthält **Wisp, Turmbau und Turmeinsturz**, keine fertige Werkstatt und kein Lager. Turmbaueffekte dürfen nur verwendet werden, wenn ihre Geometrie zum Gebäude passt. Der vorhandene Effekt darf insbesondere keinen Wisp vor dessen Freischaltung sichtbar machen. Bei Bedarf genügt eine eigene kleine Bauabfolge aus vorhandener Mara-Aktion, wenigen Staubpartikeln und einem Zustandswechsel.

| Motiv | Benötigte Zustände | Grundstück | Vorläufiger Laufzeitrahmen / sichtbare Silhouette |
| --- | --- | --- | --- |
| Werkstatt | Beschädigt/unvollständig → Werkstatt I → kleiner sichtbarer Zusatz für II | 3 × 2 Zellen, einschließlich Vorplatz | Rahmen 128 × 128; Gebäude ungefähr 84–100 breit und 70–88 hoch |
| Vorratslager | Markiertes Grundstück → Lager I | 2 × 2 Zellen | Rahmen 96 × 96; Gebäude ungefähr 56–72 breit und 48–64 hoch |
| Kleine Requisiten | Höchstens wenige notwendige Kiste-/Holz-/Werkzeugdetails | Im jeweiligen Grundstück oder dokumentierte kleine Bodenbelegung | Aus bestehenden Quellen bevorzugt; keine separate Requisitenserie |

Diese Silhouettenmaße sind **Prüfwerte**, keine vom Generator erwartete Pixelpräzision. Im frühen Vergleich neben Waldwächter und Mara werden sie einmal verbindlich vermessen. Das Haus soll räumlich größer als eine Figur sein, ohne den Verteidigungsbereich zu dominieren.

- **Werkstatt I:** Kleines Holz-/Steinhaus, warmes Dach, gut lesbarer Werkbank- oder Werkzeughinweis, ein zurückhaltend warmer Arbeitsbereich. Kein monumentaler Schmiedekomplex.
- **Beschädigter Zustand:** Dieselbe Ausrichtung, Bodenposition und Grundsilhouette. Wenige fehlende Dach-/Wandteile vermitteln Reparaturbedarf; kein anderes Gebäude als Vorher-Bild.
- **Werkstatt II:** Wiedererkennbares Haus mit kleinem Anbau oder verbessertem Arbeitsplatz. Grundstück und Anker bleiben identisch; keine Verdopplung der Größe.
- **Lager I:** Kompakter Holzbau mit überdachten Vorräten. Klar vom Werkstattmotiv unterscheidbar. Für den Slice keine weiteren Lagerstufen-Grafiken produzieren.
- Der eigentliche blockierende Gebäudegrundriss und der begehbare Vorplatz werden getrennt gespeichert. Eine Grundstücksreservierung allein ist keine vollständige Wegfindungsmaske.
- Gemeinsamer Anker aller Zustände ist die dokumentierte Mitte der vorderen Gebäude-Bodenkante. Rahmeneinbau und Schatten müssen diesen Punkt erhalten. Die Rückwandhöhe beeinflusst die Bodenbelegung nicht.
- Füße, Mauern und Dachüberhang sind beim Sortieren nach Bodentiefe zu prüfen. Personen dürfen nicht über Dächer laufen oder hinter einer unsichtbaren Wand verschwinden.

## Produktion neuer Grafiken

1. Den tatsächlich benötigten Zustand und seinen Platz im Layout bestimmen. Vor der 90-Sekunden-Abnahme nur Werkstattzustände für den Einstieg und absolut notwendige kleine Ergänzungen herstellen.
2. Ein Referenzblatt aus echtem Wald-Screenshot, Originalturm, Mara und passenden Geländeausschnitten zusammenstellen. Diese Bilder bei einer Generierung **als Bildreferenzen übergeben**; ein Text wie „passend zu SPIRE“ genügt nicht. Die Mockups dürfen zusätzlich die Architekturidee erläutern, bestimmen aber nicht die Pixelgröße.
3. Zuerst **ein** Werkstattmotiv erstellen. Rohmaterial isoliert auf transparentem Hintergrund, keine komplette Szene und kein ungeprüfter Gesamtatlas. Grundriss, Perspektive und Anker für weitere Zustände beibehalten.
4. Quelldatei unverändert aufbewahren. Exakte sichtbare Grenzen und Bodenanker ermitteln, proportional ohne Glättung auf Spielgröße aufbereiten und in vereinbarte Rahmen packen. Keine unabhängig gestreckten Zustände.
5. In einer kleinen, separat aufrufbaren Spielszene neben Originalbaum, Waldwächter und Mara zeigen. Zusätzlich im echten Startlayout bei tatsächlicher Bildschirmgröße ansehen. Diese Eigenprüfung gehört zur Vorbereitung der 90-Sekunden-Abnahme.
6. Erst nach gelungenem Vergleich weitere wirklich benötigte Varianten produzieren. Lager und Werkstatt-II-Ergänzung gehören in die Phase nach der 90-Sekunden-Abnahme.
7. Rohquellen, verwendete Referenzen, vollständigen Prompt, Aufbereitung und Laufzeitfassung nachvollziehbar zuordnen. Fehlversuche sind kein Material, das aus Vollständigkeitsgründen ins Spiel muss.

Die Bildgenerierung liefert Rohmaterial; Zuschneiden, Skalierung, Atlas-Packung und Metadaten müssen reproduzierbar sein. Kein Schachbrett als Bildinhalt, keine Schattenfläche mit eingebranntem Waldhintergrund. Transparenz auf hellem und dunklem Untergrund prüfen. Bestehende Originaldateien bleiben unverändert; notwendige Bereinigungen erfolgen in abgeleiteten Fassungen.

### Briefing-Vorlage für das erste Werkstattmotiv

> Erstelle genau ein kleines repariertes Werkstattgebäude für die beigefügte SPIRE-Wald-Spielansicht. Übernimm Perspektive, Lichtführung, Pixelcluster und Materialkontraste der als Referenz beigefügten Originaltürme und Umgebung. Holz, wenig Stein, warmes zurückhaltendes Dach, ein lesbarer Werkzeug-/Werkbankhinweis; einfache große Formen. Ziel im Spiel ungefähr 84–100 Einheiten breit und 70–88 hoch, Grundstück 120 × 80 einschließlich Vorplatz. Die Maße werden anschließend kontrolliert aufbereitet. Vorderer Bodenanker mittig, keine zusätzlichen Figuren, Schrift, UI, Geländeplatte, Neonbeleuchtung oder aufwendige Dekoration. Einzelnes Objekt mit echter Transparenz und vollständigem Randabstand. Die Mockup-Werkstatt ist nur eine Formidee; maßgeblich sind die Original-SPIRE-Referenzen.

Das Briefing wird pro Zustand konkret angepasst. Keine starre Forderung nach einem vom Bildmodell exakt erzeugten Raster; tatsächliche Grenzen immer nachmessen.

## Metadaten und Quellen

Für jedes neue oder veränderte Asset erfassen:

- Zweck, Zustand, Dateiname, Rohquelle, zugehöriger Prompt und verwendete Referenzdateien.
- Exaktes Quellrechteck, einheitlicher Skalierungsfaktor, Laufzeitrahmen und sichtbare Grenzen.
- Bodenanker in Pixeln, Grundstück, tatsächliche blockierte Zellen und begehbarer Vorplatz.
- Gegebenenfalls Framefolge, Dauer, Richtung und zulässige Spiegelung; keine erfundenen Animationsphasen.
- Lizenz-/Herkunftsnachweis und Status: Rohmaterial, technisch geprüft, im Spiel eigengeprüft oder vom Nutzer abgenommen.

Die Builder-Pack-Readme nennt **Baldur / Foozle und CC0**. Vor tatsächlicher Assetübernahme auch die jeweiligen anderen Paket-Readmes zuordnen und erhalten; nicht aus einer einzelnen Lizenzdatei pauschal auf alle Materialien schließen. Generierte Ergänzungen als solche kennzeichnen. Vorhandene Mara-Frames weiterverwenden, keine neuen Helden und keine neue Geländesammlung erzeugen.

## Visuelle Abnahme ohne Zusatzschleifen

Die erste **verbindliche Nutzer-Zwischenabnahme ist der spielbare 90-Sekunden-Kreislauf**. Sie enthält die stilistisch passende Werkstatt, ihre Entstehung, das kompakte Startlayout und die Figuren im richtigen Maßstab. Die kleine Asset-Vergleichsszene ist ein internes Prüfmittel und bei Bedarf zusätzlicher Nachweis; sie erzeugt keine separate verpflichtende Freigabestufe.

Vor dieser Abnahme keine Produktion von Lager, Bossinszenierung oder Erweiterungsgrafik. Nach ihr innerhalb des freigegebenen Vertrags selbstständig weiterarbeiten. Änderungen, die die Vision wesentlich verlassen, werden begründet besprochen; normale Pixel- und Layoutkorrekturen benötigen keine neue Genehmigung.

Bei jeder betroffenen Ansicht gezielt prüfen:

- Silhouette bei echter Spielgröße lesbar; stimmige Größenrelationen zu Originalturm, Mara, Wisp und Baum.
- Keine abgeschnittenen Dachkanten, fremden Atlaspixel, Fransen oder schwebenden Bodenanker.
- Vorher/Nachher und Werkstatt II sind sofort erkennbar, ohne übertriebene Partikeleffekte.
- Wege, erreichbare Bauplätze, Gegner und Projektilrichtungen bleiben klar.
- Keine Mausbedienung unter UI-Overlays; Gold, Modus und nächstes Ziel bleiben lesbar.
- Erweiterung lässt sich bei identischem Weltmaßstab entdecken und wieder verlassen.

Als Nachweise echte Screenshots aus der laufenden Anwendung verwenden: Einstieg, Werkstatt, späterer Ausbau und geöffnete Lichtung. Konzeptbilder, erfolgreiche Builds und bestandene Tests ersetzen diese Sichtprüfung nicht. Technische Prüfung, eigene visuelle Prüfung und Nutzerabnahme werden getrennt protokolliert.

Mobile Ergänzung vom 18.10.2026: kompaktes HUD (56 px) und Dock (96 px), zweizeiliger Zielstreifen, Hinweise zunächst als aufklappbarer Tipp. Geräteabstände im normalen Browserfenster nicht zusätzlich reservieren. Vollbild erhält nur einen begrenzten Schutzabstand. Mobile Chronik über Gold-/Wellenanzeige; Vollbild direkt oben rechts. Desktop-Komposition unverändert.

### B08: vorhandene Originalgrafiken

Keine neuen generierten Bilder. Laufzeit und Dock verwenden dieselben Originale aus `public/assets/`, bereits im klassischen Spiel eingebunden; Quelle und Raster sind im dortigen `manifest.json` erhalten. Keine Originaldatei wird verändert.

| Grafik | Raster / tatsächlich verwendete Frames | Maßstab / Anker |
| --- | --- | --- |
| Wisp - Animations | 64×64; 9 Frames je Richtung; Bewegung Reihen 0–2, Arbeit Reihe 3 | 0,9; Fuß bei (32,51), seitlich spiegelbar |
| Tower 03 / 04 | 64×128; Stufen 0/1 | 0,63; wie vorhandener Waldwächter |
| Tower 03 Waffen I/II | 96×96; 8 Frames | 0,63; vorhandene Drehachse |
| Tower 04 Waffen I/II | 128×128; 17 Frames | 0,63; vorhandene Drehachse |
| Projektile 03 / 04 I | 10×10 / 8×8; je 6 Frames | 0,85 |
| Scorpion | 64×64; Lauf-Frames 24–31 abwärts, 32–39 aufwärts, 40–47 seitlich | 0,83; wie vorhandene Gegner |

Die vier Premium-UI-Materialien bleiben erhalten. Vier Turmkarten und zwei Begleiter teilen das Dock; mobil scrollen ausschließlich die Turmkarten horizontal. HUD 56 px und Dock 96 px bleiben bestehen. Keine weitere Asset-Produktion für spätere Gebäude.

### B09: Vorratslager I

Ein einzelnes Imagegen-Gebäude: kompakter offener Holzschuppen mit roten Ziegeln, Kisten und Säcken, kleiner als die Werkstatt. Laufzeitrahmen 96 × 96, Silhouette etwa 68 × 50, Fußanker (48,80), Weltanker (360,520). Herkunft, Original, vollständiger Prompt und reproduzierbare Pixelaufbereitung stehen im [Assetnachweis](../assets/warehouse/README.md). Vor dem Bau erscheint nach Freischaltung eine dezente Markierung; nach dem Bau verschwindet sie. Wisp läuft über vorhandene freie Zellen zwischen Werkstatt und Lager; sein Bonus hängt nicht von der Animation ab. Desktop und kompakte Hochkantansicht wurden mit echten Spielaufnahmen geprüft.

### B10: Tanzfenster und Verführung

Zusätzlich zum kleinen Körperatlas verwendet die Bossdarstellung den unveränderten `public/assets/Succubus Dance HD v1.png` aus dem Hauptspiel: 1024 × 128, acht 128er Frames, 190 ms je Frame. Das separate Fenster ist 136 × 164 CSS-Pixel groß; die Figur nutzt den Originalmaßstab 1,1 und Fußanker (64/112). Es bleibt unabhängig vom Kartenzoom lesbar, wird innerhalb der sichtbaren Karte platziert und hält Abstand zu Bossanzeige und Dock. Es zeigt Vorbereitung beziehungsweise Wirkung mit Restdauer und Ablaufbalken.

Herzfaden, fünf aufsteigende Herzen, pulsierender rosafarbener Turmglanz und leichtes Wackeln entsprechen der Inszenierung aus `reference/src/scene.ts`. Beide Tänze und sämtliche Effekte verwenden die gespeicherte Zauberphase samt Restdauer; Pause hält sie an. Unterbrechung, Zielverlust oder Ende entfernen das Fenster und setzen den Turm zurück. Kein neues Asset, keine Änderung an Bossbalance oder Spielstandschema. [Echte Spielaufnahmen und Prüfung](../../../artifacts/idle-bastion/acceptance/p4/B10_VISUALS.md).


### B12: Werkstatt-Anbau und Grafikstufe III

Der kleine überdachte Arbeitsplatz entsteht als eigene Phaser-Pixelgrafik in `src/workshop-annex.ts`: 32 × 39 Weltpixel, rote Ziegel, Holzpfosten, Amboss und warmes Lampenlicht. Das bestehende Werkstatt-Bitmap bleibt unverändert. Der Anbau sitzt rechts am Haus (Weltanker des Hauses weiterhin 180/480); Grundstück, Maßstab und Laufwege bleiben gleich. Sichtbarkeit folgt der gespeicherten Ausbaustufe, kurze Staubpartikel dem bestätigten Bauzeitpunkt. Herkunft: neu geschriebene Grafikprimitive, keine zusätzliche Bildgenerierung.

Level 7–20 verwenden die vorhandenen dritten Basisturmframes und unveränderten Original-Waffenatlanten `Tower 01/02/03/04 - Level 03 - Weapon.png`. Raster/Animation: Waldwächter 96×96 / 6 Frames; Frostkristall 128×128 / 10; Steinschleuder 96×96 / 8; Scharfschütze 128×128 / 17. Maßstab und Drehachse bleiben erhalten. Die grüngelbe dritte Froststufe stammt aus dem Originalatlas; der Frosttreffer bleibt als Effekt erkennbar. Keine vierte Grafikstufe für spätere Zahlenlevel.

Rosenspiegels zweite Begegnung nutzt dieselben Körper- und Tanzatlanten sowie Turmglanz, Herzen und Restdauer. Keine weitere Figur oder Bildserie. [Spielaufnahmen und gezielte Prüfung](../../../artifacts/idle-bastion/acceptance/p4/B12.md).

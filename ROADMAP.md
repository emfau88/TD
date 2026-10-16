# Spire – Roadmap für fünf zusammenhängende Spielkarten

Stand: 16. Oktober 2026  
Status: M0 abgeschlossen – Sicherung und separat spielbare Rekonstruktion der drei ursprünglichen Karten liegen vor. M1–M4 sind noch nicht umgesetzt oder abgenommen. Nachweise: [M0-Prüfbericht](artifacts/m0/REPORT.md).

## 1. Ziel und verbindlicher Umfang

Wir bauen auf dem ursprünglichen Tower-Defense-Spiel mit dem Foozle-Tileset auf. Das Ziel sind fünf optisch ausgearbeitete, vollständig spielbare Karten in einem gemeinsamen Spiel. Türme, Gegner, Begleiter, Bedienung und Grafikstil müssen zusammenpassen.

| Karte | Thema | Eigenständigkeit des Layouts |
| --- | --- | --- |
| Mooshain | Wald, Lichtungen, Teiche, kleine Ruinen | Übersichtlich lesbare Einstiegsroute mit mehreren sinnvollen Verteidigungsstellen |
| Laternenmoor | Wasser, bewachsene Inseln, Laternen, Holzstege | Getrennte Bauflächen und wenige wichtige Übergänge |
| Spiegelwinter | Schnee, Eis, Felsen, verschneite Vegetation | Zwei Anmarschwege und unterschiedliche Verteidigungspositionen |
| Windbruch | Schwebende Felsinseln, Klippen, Hängebrücken | Mehrere Plateaus mit begrenzten Bauflächen und klaren Flugrouten |
| Mondwarte | Sternenhimmel, Steinplattformen, Portale, Sternenarchitektur | Mehrere Zugänge zu einem gemeinsamen Verteidigungsziel |

Die Reihenfolge der Umsetzung ist Wald → Moor → Eis → Inseln → Mondwarte. Die erzählerische Reihenfolge kann später festgelegt werden.

**Jetzt im Umfang:** fünf Karten, gemeinsame Oberfläche, bewährte Spielmechanik, passende vorhandene Figuren und nötige Grafikergänzungen. Wisp und Mara bilden zunächst das steuerbare Duo. Runa und Ilyra folgen nur im ausdrücklich beauftragten Ausbauabschnitt.

**Später:** Kampagnenstory, neue Dialoge, zusätzliche Regionen, weitere Charaktere, umfangreiche neue Gegner- und Bossmechaniken. Vorhandene Storytexte bleiben als Entwurf erhalten. Sie werden in diesem Vorhaben nicht weiter ausgearbeitet.

Die Erstellung dieser Roadmap ist keine Freigabe zur sofortigen Umsetzung aller Phasen. Bei einem Umsetzungsauftrag wird der nächste vereinbarte Abschnitt bearbeitet. Innerhalb dieses Abschnitts werden gewöhnliche reversible Arbeiten selbstständig erledigt; die unten genannten visuellen Abnahmen bleiben echte Haltepunkte.

## 2. Ausgangslage und Wiederverwendung

Im Projekt vorhanden:

- Die Foozle-Originalpakete einschließlich Quellen, Türmen, Gegnern, Wisp und Gelände.
- Die Daten der drei ursprünglichen Karten: „Der alte Hain“, „Die Nebelbrücke“ und „Die letzte Lichtung“, IDs 0–2.
- Älterer Renderer-Code im bisherigen Projektchat. Die damalige Darstellung ist nicht allein durch Auswahl der alten Karten wiederhergestellt: Der aktuelle Renderer verwendet auch dort das neue Darstellungssystem.
- Neuere Spielsysteme für Begleiter, Wegfindung, Aufträge und Speicherung, die gezielt übernommen werden können.
- Neue Figurenentwürfe, Atlanten und fünf gespeicherte Spielansichten. Diese sind Prüfmaterial und kein Nachweis einer fertigen Grafikproduktion.

Beim Audit gab es im Projektordner kein Git-Repository. Eine vollständige, unveränderte alte Startversion ist daher zunächst zu suchen oder aus belegten Quellen zu rekonstruieren. Fehlende Teile und Abweichungen werden benannt; eine Rekonstruktion darf nicht als identischer historischer Stand ausgegeben werden.

| Bestand | Vorgehen |
| --- | --- |
| Originaltileset, Türme und ursprüngliche Gegner | Referenz und bevorzugte Grundlage; Originaldateien erhalten |
| Kampf, Wirtschaft, Speichern und Bedienung | Bestehende Funktionen erhalten und nach Änderungen gezielt prüfen |
| Begleitersteuerung und Wegfindung | Funktionsfähige Teile separat in die Referenzversion übernehmen |
| Neue Charakterdesigns | Identität erhalten; jeden benötigten Frame auf Eignung prüfen |
| Neue Geländeatlanten | Einzelteile prüfen; nicht pauschal als fertige Tilesets übernehmen |
| Kampagnengerüst und Story | Als Entwurf sichern, vorerst nicht ausbauen |

## 3. Meilensteine und Abnahmen

### M0 – Ausgangsversion sichern und Vergleich herstellen

- [x] Aktuellen Quellcode, Assets und Startversion sichern. Bestehende Browser-Spielstände durch getrennten Speicherschlüssel erhalten; kein Browserdaten-Export und keine Ersetzung des aktuellen Spiels.
- [x] Versionierung mit nachvollziehbaren Ständen einrichten; Originalpakete erhalten.
- [x] Ursprüngliche Darstellung der drei Waldkarten aus belegten Änderungen rekonstruieren.
- [x] Jede der drei Karten ansehen und mit einem Screenshot dokumentieren; Herkunft und Rekonstruktionsabweichungen vermerken.
- [x] Bauen, Aufwerten, Gegnerbewegung, Pause, Neustart und Speicherung von Ergebnissen/Einstellungen prüfen. Der ursprüngliche Stand hat keine Wiederherstellung einer laufenden Bauphase nach Neuladen.

**Ergebnis:** separat spielbare Vergleichsbasis und gesicherter neuer Stand. Noch keine neue Grafikproduktion.

**Nachweis vom 16.10.2026:** [Referenz starten und bauen](reference/README.md), [Prüfbericht mit drei Kartenansichten](artifacts/m0/REPORT.md). Sicherung: `backups/2026-10-16-before-m0/`; Git-Stände: `before-m0` und `m0-original-reference`. Die Rekonstruktion ist keine wiedergefundene historische Startdatei und noch keine Nutzerabnahme des künftigen Grafikstandards.

### M1 – Grafikstandard an einer kleinen Spielszene festlegen

- [ ] Originalboden, Wegkurve, Wasserufer, Baum, Turm, Gegner und Wisp gemeinsam in echter Spielgröße zeigen.
- [ ] Mara danebenstellen und Größe, Perspektive, Konturen und Detailgrad angleichen.
- [ ] Die technischen Asset-Vorgaben aus Abschnitt 4 mit konkreten Maßen ausfüllen.
- [ ] Einen repräsentativen Ausschnitt einschließlich Bewegung und Turmfeuer prüfen.
- [ ] Nutzer bestätigt den gemeinsamen Stil anhand dieser tatsächlichen Spielansicht.

**Ergebnis:** eine verbindliche Grafikreferenz und dokumentierte Größen. Konzeptbilder dienen als Themenreferenz; die freigegebene Spielansicht bestimmt die Produktionsqualität.

### M2 – Eine Waldkarte vollständig fertigstellen

- [ ] Eine ursprüngliche Karte als Grundlage auswählen; Änderungen am Layout begründen.
- [ ] Landschaft mit den Originalassets ausarbeiten, fehlende Teile gezielt ergänzen.
- [ ] Wisp und Mara mit Auswahl, Bewegung, Wegfindung und Aktion am Zielort sauber integrieren.
- [ ] HUD und Spielfeld gemeinsam prüfen; Platz für Türme, Figuren und Effekte sicherstellen.
- [ ] Vollständigen Kartenablauf, Verlust, Neustart und Bauphasen-Wiederherstellung prüfen.
- [ ] Aktuellen Browser- und Offline-Build visuell vergleichen und als Referenzversion sichern.
- [ ] Nutzer nimmt die Waldkarte im Spiel ab.

**Haltepunkt:** Vor dieser Abnahme keine vollständigen Grafikpakete für die übrigen vier Regionen produzieren. Offene grundlegende Grafikprobleme werden zuerst an der Waldkarte gelöst.

### M3 – Vier weitere Regionen einzeln umsetzen

Für jede Region wird derselbe Ablauf abgeschlossen:

1. **Layout:** Wege, Bauflächen, Zugänge und Ziel als einfaches spielbares Gelände entwerfen.
2. **Spielprüfung:** Erreichbarkeit, Weglängen, Turmpositionen und Flugrouten prüfen.
3. **Bedarfsliste:** Die für genau dieses Layout fehlenden Grafikteile auflisten.
4. **Grafikprobe:** Einen Ausschnitt mit Boden, Übergang, Dekoration, Turm und Figur produzieren und im Spiel prüfen.
5. **Visuelle Abnahme:** Nutzer bestätigt die neue Thematik im gemeinsamen Stil, bevor das regionale Paket vervollständigt wird.
6. **Ausarbeitung:** Nur benötigte Teile ergänzen, Karte gestalten und Wellen abstimmen.
7. **Fertigstellung:** Alle Kriterien aus Abschnitt 7 erfüllen; spielbaren Stand und Nachweise sichern.

| Region | Layout geprüft | Grafikprobe abgenommen | Karte fertig geprüft | Vom Nutzer abgenommen |
| --- | --- | --- | --- | --- |
| Laternenmoor | [ ] | [ ] | [ ] | [ ] |
| Spiegelwinter | [ ] | [ ] | [ ] | [ ] |
| Windbruch | [ ] | [ ] | [ ] | [ ] |
| Mondwarte | [ ] | [ ] | [ ] | [ ] |

### M4 – Die fünf Karten als gemeinsames Spiel prüfen

- [ ] Gemeinsame Kartenauswahl mit fünf direkt testbaren Karten; verständliche Reihenfolge und Schwierigkeitsangaben.
- [ ] Einheitliche Steuerung, Turmrollen, Figurenmaßstäbe, Anzeigen und Rückmeldungen auf allen Karten.
- [ ] Kartenwechsel, Speichern, Laden und bestehende Spielstände prüfen; stabile IDs nicht unnötig ändern.
- [ ] Alle Karten vollständig spielen und Schwierigkeit sowie Lesbarkeit unter Belastung beurteilen.
- [ ] Browser- und Offline-Version aus demselben geprüften Stand erstellen und testen.
- [ ] Nutzer nimmt das Paket aus fünf Karten ab. Erst danach wird die Storyplanung separat begonnen.

## 4. Verbindliche Vorgaben für Assets und Tilesets

### 4.1 Gemeinsame Bildsprache und Maße

Ausgangspunkt ist das stimmige Gesamtbild der ursprünglichen Karten. Verbesserungen werden gemeinsam in einer Spielszene beurteilt. Einzelne Grafiken dürfen nicht unabhängig vom restlichen Spiel auf einen anderen Stil umgestellt werden.

Der aktuelle Code verwendet **28 × 16 Zellen mit 40 Spieleinheiten**, also ein logisches Spielfeld von **1120 × 640**. Das ist die Spielgeometrie. Die Originalgrafiken haben unterschiedliche Quelldimensionen; der ursprüngliche Renderer nutzte beispielsweise 64 × 64 große Bodenausschnitte. **Spielzelle, Bildausschnitt und sichtbare Objektgröße sind verschiedene Angaben.**

Die Spielgeometrie bleibt zunächst erhalten. Die verbindliche Grafikauflösung wird in M1 anhand der Originalgrafiken und der Darstellung festgelegt. Es wird nicht pauschal jedes vorhandene Bild auf 40 × 40 oder jede Figur auf dieselbe Zellgröße umgerechnet.

Vor neuer Grafikproduktion müssen folgende Angaben konkret vorliegen:

| Vorgabe | Festzulegen bzw. zu dokumentieren |
| --- | --- |
| Referenz | Abgenommener Spielausschnitt mit Originalturm, Gegner und Figur |
| Bodenraster | Exportgröße eines Tiles in Pixeln und belegte Größe im Spiel |
| Objekte | Exportrahmen, sichtbare Größe, Fußpunkt und Bodenfläche je Objektklasse |
| Darstellung | Gemeinsame leichte Draufsicht; Höhe, Lichtseite, Konturen und Kontaktschatten passend zur Referenz |
| Farbe | Gemeinsame Kontrastregeln; eigene zusammenpassende Palette je Region |
| Skalierung | Dokumentierte Skalierung je Assetklasse, ohne unkontrolliertes Strecken; Pixelgrafiken ohne Glättung prüfen |
| Laufzeit | Tatsächliche Ausschnitte, Anker, Animationsreihenfolge und Zeiten in Metadaten |

### 4.2 Was ein vollständiges Gelände-Set enthalten muss

Ein Set ist vollständig, wenn sich die beauftragte Karte ohne sichtbare Ersatzlösungen daraus bauen lässt. Nicht jede Region benötigt jedes denkbare Teil; die Bedarfsliste folgt dem Layout.

| Bauteil | Anforderung |
| --- | --- |
| Innenflächen | Ruhige, wiederholbare Bodenflächen; bei sichtbaren Wiederholungen passende Varianten |
| Wege | Gerade Verläufe, Kurven und benötigte Kreuzungen; gleiche Breite und passende Anschlüsse |
| Übergänge | Benötigte Übergänge zwischen Gras, Erde, Schnee, Eis, Stein oder Holz |
| Außenkanten | Passende Kanten in allen verwendeten Richtungen |
| Ecken | Konvexe Außenecken und konkave Innenecken; keine Löcher an Anschlussstellen |
| Wasserufer | Zusammenhängende Uferkontur, passende Wasserfläche und gegebenenfalls Animation |
| Klippen | Oberkante, sichtbare Seitenwand, Ecken und Fußabschluss mit konsistenter Höhe |
| Brücken und Stege | Bodenbelag, Auflager/Anschlüsse, Seiten und gegebenenfalls Geländer |
| Dekoration | Freigestellte Objekte mit konsistentem Maßstab und verständlicher Bodenberührung |

Bei Boden, Übergängen und Dekoration gelten unterschiedliche Anforderungen:

- **Materialfläche:** enthält das Material. Eine Erdtextur für einen beliebig geführten Weg enthält keinen bereits eingezeichneten kurvigen Weg mit Gras- oder Schneerändern.
- **Übergangsteil:** enthält gezielt eine bestimmte Grenze, etwa Schnee zu Erde, einschließlich ihrer Anschlussregel.
- **Dekorationsobjekt:** besitzt echte Transparenz außerhalb des Objekts. Schatten und Bodenfläche passen zum vorgesehenen Standort.

Beispiel Eisregion: Schneegrund, Eisgrund, Wegmaterial und Schnee-Weg-Übergänge sind getrennte Aufgaben. Ein Bild eines Weges im Schnee ist kein beliebig wiederholbares Wegmaterial.

Beispiel Inselregion: Felsseite, Plateauoberkante und Brückenanschluss müssen konstruktiv zusammenpassen. Ein Klippenbild wird nicht beliebig über unterschiedlich hohe Seitenwände gestreckt.

### 4.3 Wie die Assets erstellt werden

1. **Vorhandene Teile prüfen:** Zuerst Originalassets oder geeignete neue Einzelteile wiederverwenden.
2. **Konkrete Spezifikation schreiben:** Zweck, Referenz, Maße, Palette, Anschlüsse, Transparenz und sichtbare Größe angeben.
3. **Kleine Probe erzeugen oder zeichnen:** Zunächst nur wenige repräsentative fehlende Teile. Keine vollständigen Themenpakete auf einmal.
4. **Aufbereiten:** Ränder, Farben, Pixeldichte, Freistellung, Nahtlosigkeit und Anschlüsse kontrollieren; nötigenfalls von Hand korrigieren oder neu zeichnen.
5. **Testfläche bauen:** Wiederholungen und Anschlüsse prüfen, danach im tatsächlichen Spiel mit Figuren und Türmen ansehen.
6. **Gezielt erweitern:** Erst nach bestandener Probe die übrigen benötigten Varianten erstellen.
7. **Packen und registrieren:** Geprüfte Einzelteile deterministisch in Atlanten packen und ihre tatsächlichen Koordinaten erfassen.

KI-Bildgenerierung kann Entwürfe und Rohmaterial liefern. Ein Prompt wie „premium pixel art“, „seamless“ oder „exact grid“ ist kein Qualitätsnachweis. Ein generierter Atlas darf erst verwendet werden, nachdem Raster, Inhalte und Transparenz tatsächlich kontrolliert wurden. Bei fehlerhaftem Raster werden die Teile sauber vereinzelt und neu gepackt.

**Für Atlasdateien gilt:**

- Keine eingebrannten Beschriftungen, Rasterlinien, Rahmen oder Schachbretthintergründe.
- Keine fremden Bildreste am Rand eines Frames; ausreichender Abstand zwischen Objekten.
- Spritekoordinaten und Abmessungen werden aus dem tatsächlichen Export übernommen. `Bildbreite / Spaltenzahl` mit Abrunden ersetzt keine Layoutprüfung.
- Technisches Padding oder extrudierte Randpixel sind bei Bedarf zulässig und werden in den Metadaten berücksichtigt.
- Transparente Objekte, Bodenflächen und Animationen dürfen getrennte Atlanten haben. Ein gemeinsamer großer Bogen ist keine Pflicht.
- Originalquellen, bearbeitete Quellen und freigegebene Laufzeitdateien bleiben unterscheidbar. Neue Kandidaten überschreiben keine abgenommenen Assets.

### 4.4 Pflichtprüfungen vor dem Einbau

- [ ] Wiederholbare Materialien als 3 × 3 Fläche prüfen: keine Nähte, auffälligen regelmäßigen Flecken oder Helligkeitssprünge.
- [ ] Alle verwendeten Kanten, Innen-/Außenecken, Wegkurven und Kreuzungen zusammensetzen.
- [ ] Diagonale oder schräge Verbindungen prüfen, wenn das Layout sie tatsächlich verwendet.
- [ ] Transparenz auf hellem und dunklem Hintergrund kontrollieren; keine Farbsäume oder Linienreste.
- [ ] Turm, Gegner, Figur und Dekoration in echter Spielgröße nebeneinander prüfen.
- [ ] Bewegung und Kamera-/Fensterskalierung prüfen: kein störendes Flimmern oder Wechsel der Schärfe.
- [ ] Sichtbare Geometrie stimmt mit begehbarer Fläche, Bauverboten und Hindernissen überein.

## 5. Figuren und Animationen

Die Designs von Mara, Runa und Ilyra können erhalten bleiben. Die Eignung der vorhandenen Spritesheets wird pro benötigtem Frame geprüft. Auch der neue Wisp wird mit Original-Wisp und den Türmen verglichen.

Für Wisp und Mara zuerst erforderlich:

- Stehen, Laufen und Interagieren/Fähigkeit in den tatsächlich benötigten Richtungen.
- Stabile Proportionen, Ausrüstung, Fußpunkte und sichtbare Größe über alle Frames.
- Erkennbare Laufschritte und zusammenhängender Bewegungsablauf; ähnliche Einzelposen allein ergeben noch keine gute Animation.
- Animation passend zur Simulation: Bewegung beim Laufen, Aktion nach Ankunft, Stillstand bei Pause.
- Klare Auswahlmarkierung und verständliche Rückmeldung bei unerreichbaren Zielen.

Seitenansichten dürfen nur gespiegelt werden, wenn das Design dies verträgt. Asymmetrische Kleidung, Werkzeuge oder Hände werden nicht unbesehen vertauscht. Gute Frames bleiben erhalten; fehlerhafte Frames werden gezielt korrigiert. Zusätzliche Jubel- oder Emotionsanimationen folgen erst nach den notwendigen Spielanimationen.

## 6. Kartenbau und Zusammenhang des Spiels

Jede Karte wird bewusst gestaltet. Die Karten sollen sich durch Gelände, Wegführung und Verteidigungsentscheidungen unterscheiden. Eine gemeinsame Vorlage wird nicht lediglich umgefärbt und als fertige neue Karte ausgegeben.

Gemeinsam bleiben: Türme und ihre Rollen, Gegnerdarstellung, Begleitersteuerung, Bauvorschau, Gold-/Lebensanzeigen, Eingaben, Rückmeldungen und Speicherverhalten. Neue regionale Mechaniken werden einzeln vorgeschlagen und geprüft; sie sind keine Voraussetzung für fünf überzeugende Grundkarten.

Die Umsetzung trennt logisch:

1. Hintergrund und entfernte Umgebung.
2. Spielbares Gelände, Wege und passende Übergänge.
3. Architektur, Hindernisse und Dekoration mit passender Tiefensortierung.
4. Türme, Figuren, Gegner und Effekte.
5. HUD und temporäre Anzeigen.

Darstellung und Spielregeln verwenden dieselbe Kartenbeschreibung. Sichtbare Brücken müssen begehbar sein, Abgründe gesperrt und Bauflächen nachvollziehbar. Dekoration darf Wege und Bauvorschauen nicht unverständlich verdecken. Ein neuer Editor oder eine neue Engine wird nicht allein für dieses Vorhaben eingeführt.

## 7. Wann eine Map fertig ist

Eine Map gilt erst als fertig, wenn alle folgenden Punkte erfüllt sind:

| Bereich | Abnahmekriterium |
| --- | --- |
| Gesamtbild | Einheitlicher Stil und Maßstab, nachvollziehbare Landschaft, saubere Übergänge |
| Materialqualität | Keine sichtbaren Atlaslinien, Zuschnittfehler, störenden Wiederholungen oder gestreckten Architekturdetails |
| Lesbarkeit | Wege, Gegner, Türme und Ziele auch bei dichter Welle und Effekten klar erkennbar |
| Geometrie | Gegner- und Begleiterwege, Bauflächen und sichtbares Gelände stimmen überein |
| Spielablauf | Vollständiger Sieg erreichbar; Niederlage, Neustart und Kartenwechsel funktionieren |
| Bedienung | Bauen, Aufwerten, Verkauf, Begleiterbefehle, Pause und 2× funktionieren konsistent |
| Speicherung | Bauphase laden und fortsetzen funktioniert; vorhandene Speicherstände werden berücksichtigt |
| Ausgabe | Browser- und Offline-Version enthalten dieselben freigegebenen Änderungen |
| Nachweis | Aktuelle Spielscreenshots, kurzer Prüfbericht, bekannte Restpunkte und Versionskennung liegen vor |

Mindestens dokumentieren: Gesamtkarte in Bauphase, Nahansicht kritischer Übergänge, laufender Kampf und Begleiteraktion. Screenshots nach relevanten Grafikänderungen erneuern. Eine alte Aufnahme belegt keine spätere Korrektur.

Vorhandene Logik- und Bedienungstests bleiben wichtig. Simulierte Zeichenaufrufe und erfolgreiche Builds belegen keine visuelle Qualität. Vollständige Spielabläufe werden mit angemessenen automatischen Prüfungen und tatsächlichen Browser-Spielprüfungen kombiniert.

Wenn die visuelle Prüfung technisch blockiert ist, lautet der Status „visuell ungeprüft“. Die Karte wird dann nicht als optisch fertig bezeichnet; für die Abnahme ist eine tatsächliche Spielprüfung nachzuholen.

## 8. Arbeitsregeln gegen erneute Fehlentwicklung

1. **Ein Abschnitt zur Zeit:** Aktuellen Meilenstein, Ergebnis und offene Fragen zu Beginn benennen. Keine eigenmächtige Ausweitung auf Story oder weitere Regionen.
2. **Referenz erhalten:** Abgenommene Stände und Originalassets bleiben wiederherstellbar.
3. **Grafik im Spiel beurteilen:** Keine Freigabe allein aufgrund eines Mockups, Einzelbilds oder erfolgreichen Builds.
4. **Ursache beheben:** Sichtbare Nähte, falsche Maßstäbe oder fehlende Übergänge nicht durch Dunkelfilter, größere Texturwiederholung oder mehr Dekoration verdecken.
5. **Generation begrenzen:** Vor einer Serie Bedarf und Testprobe festlegen. Nach zwei ungeeigneten Versuchen für denselben Baustein Ursache und Verfahren prüfen, statt dieselbe Aufforderung erneut zu variieren. Gute Bestandteile weiterverwenden.
6. **Fortschritt belegbar machen:** „Konzept“, „Rohgrafik“, „technisch geprüft“, „im Spiel geprüft“ und „vom Nutzer abgenommen“ sind unterschiedliche Zustände.
7. **Auslieferung mitprüfen:** Vor Übergabe Startdatei und Build aktualisieren und genau diese Version ansehen.
8. **Abnahmen konkret halten:** Dem Nutzer einen spielbaren Stand und die offenen Entscheidungen zeigen. Gewöhnliche Implementierungsschritte benötigen keine zusätzliche Bestätigung.

## 9. Status und nächster Auftrag

- [x] Roadmap mit Umfang, Asset-Vorgaben und Abnahmekriterien erstellt.
- [x] M0: gesicherte und dokumentierte Ausgangsversion.
- [ ] M1: gemeinsamer Grafikstandard im Spiel abgenommen.
- [ ] M2: Waldkarte mit Wisp und Mara vollständig abgenommen.
- [ ] M3: vier weitere Karten nacheinander fertiggestellt und abgenommen.
- [ ] M4: gemeinsames Paket aus fünf Karten abgenommen.

**Nächster sinnvoller Umsetzungsauftrag:** M1 – einen kleinen Spielausschnitt auf Basis der rekonstruierten Originalkarten mit Wisp, Mara, Turm und Gegner ausarbeiten. Maßstab und Anschlüsse dort konkret festlegen und die tatsächliche Spielansicht zur visuellen Abnahme vorlegen. Erst danach M2, die vollständige Waldkarte. Noch keine regionalen Grafikpakete erzeugen.

Bei späteren Arbeiten zuerst diesen Plan und den letzten belegten Stand lesen. Checklisten werden nur mit tatsächlichem Nachweis aktualisiert; Nutzerabnahmen werden nicht aus verstrichener Zeit oder fehlendem Widerspruch abgeleitet.

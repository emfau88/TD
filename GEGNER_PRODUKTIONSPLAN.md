# Spire – Produktionsplan für neue Gegner

Stand: 17. Oktober 2026. **Seitliche Stilprobe vom Nutzer abgenommen; vollständige Einheit anschließend umgesetzt.** Drei Ansichten, Bewegung, Heilung und Tod sind im Laternenmoor integriert: [Ergebnis und Aufbereitung](artifacts/enemies/lantern-jelly/v1/REPORT.md). Die finale Kampfbalance bleibt offen für Nutzerfeedback. Ergänzung zu [Umsetzungsplan P2](UMSETZUNGSPLAN.md#p2--eine-regionale-besonderheit-sauber-einführen) und zur [Grafikreferenz](reference/STYLE_GUIDE.md).

**Anschließender Einzelauftrag:** Die gewählte Succubus „Rosenspiegel“ ist mit begrenzter Turmverführung in Windbruch Welle 6 und 9 umgesetzt. Nach der vereinfachten zweiten Grafikfassung korrigiert die dritte Fassung den vertikalen Beinwechsel und ergänzt ein eigenes höher aufgelöstes Tanzsheet; Spielwerte und bisheriges Tanztempo bleiben erhalten. Die Nutzerabnahme dieser Korrektur steht aus. [Aktuelle Succubus-Produktion und Quellen](artifacts/enemies/succubus/production-v3/REPORT.md), [konkreter Grafikvertrag](reference/STYLE_GUIDE.md#ergänzung-vom-17102026--succubus-rosenspiegel-fassung-3). Die folgenden Abschnitte dokumentieren weiterhin den zuerst ausgeführten Laternenquallen-Plan; ihre Framezahlen gelten nicht für die Succubus.

## 1. Was wir übernehmen

Die alten Spezialgegner liefern Rollen und Designideen. Ihre hoch aufgelösten Bilder gelten als Entwürfe, nicht als fertige Spielsprites. Der erste neue Gegner wird die **Laternenqualle als schwebender Moorheiler**. Die Grundidee mit leuchtendem Körper und Laterne bleibt; Form und Details werden für den vorhandenen Pixelstil neu aufgebaut.

Beim geprüften Altbestand hat die Laternenqualle ungefähr 443 × 443 Pixel pro Bild, der Original-Blattkäfer einen 64 × 64 Rahmen. Das alte Quallenblatt enthält acht Posen; der alte Renderer verwendet für alle drei Richtungen dieselben zwei Bewegungsbilder. Eine vollständige Richtungsanimation ist damit nicht belegt. Reines Verkleinern würde die feinen Texturen und wechselnden Silhouetten nicht zuverlässig beheben.

| Kandidat | Wiederverwendbare Idee | Geplante Behandlung |
| --- | --- | --- |
| Laternenqualle / Lantern Jelly | Heilt nahe Gegner | Erste vollständig neu aufbereitete und animierte Einheit für das Moor |
| Wurzeltrommler / Root Herald | Beschleunigt eine Gruppe | Zurückgestellt; nur bei Bedarf, dann eigener Pixelentwurf und Bewegungszyklus |
| Frostwidder / Frost Ram | Robuster Gegner mit Turmstörung | Zurückgestellt; Störwirkung und Gegenstrategie zuerst klären |
| Sternenrichter | Schützt andere Gegner | Möglicher späterer Gegner der Mondwarte; eigener Aufwand, keine automatische Übernahme |

Die acht Originalgegner bleiben der Maßstab. Es werden nicht vier neue Grafikpakete gleichzeitig produziert.

## 2. Verbindlicher Entwurf der Laternenqualle

| Merkmal | Produktionsvorgabe |
| --- | --- |
| Silhouette | Einfache Glockenform, wenige breite Tentakel, kleine mittige Laterne; auch ohne Leuchteffekt als eigene Einheit erkennbar |
| Perspektive | Gleiche leichte Draufsicht wie Originalgegner; unten, oben und seitlich jeweils tatsächlich gezeichnet |
| Detailgrad | Große klare Farbflächen und Pixelgruppen; keine gemalten Stofftexturen, Metallgravuren oder vielen winzigen Lichtpunkten |
| Farbe | Gedämpftes Türkis, dunkle blaugrüne Kontur, warmes Laternenlicht; Startbudget etwa 10–14 Körperfarben einschließlich Schattierung |
| Licht und Kontur | Zur Originalreferenz passend; harte Pixelkanten im logischen Raster, wenige Helligkeitsstufen, keine weichen Außenfransen |
| Rahmen | 64 × 64 Pixel je Laufzeitframe, echte Transparenz; kein eingezeichnetes Schachbrett oder Schattenboden |
| Sichtbare Größe | Ausgangspunkt etwa 30 × 36 Quellpixel für den Körper; bei Maßstab 0,83 ungefähr 25 × 30 Spieleinheiten. Neben Originalfliegern im Spiel fein abstimmen |
| Anker | Einheitlicher Körperbezug bei (32/32); Weltposition und Bodenschatten getrennt. Kein Begleiter-Fußpunkt (32/56) für den schwebenden Gegner |
| Freiraum | Tentakel und Heilpose bleiben innerhalb des Rahmens mit mindestens zwei transparenten Randpixeln. Größere Heilwirkung wird separat dargestellt |

Diese Maße sind ein konkreter Produktionsstart. Änderungen nach der ersten Spielprobe werden einmal dokumentiert und gelten anschließend für alle Frames. Einzelposen werden nicht jeweils auf dieselbe Breite und Höhe gestreckt.

## 3. Benötigte Animationen

Die vollständige Einheit hat **48 Rahmen mit 45 unterschiedlichen Posen**. Drei Ruheframes verwenden die jeweils erste Bewegungsphase erneut; dafür werden keine zusätzlichen Bilder erzeugt. Links wird aus der Seitenansicht gespiegelt; die kleine mittige Laterne bleibt dabei erhalten.

| Zustand | Frames je Ansicht | Ansichten | Summe | Erste Zeitvorgabe |
| --- | --- | --- | --- | --- |
| Ruhe | 1 | unten, oben, seitlich | 3 | Feste Ruhepose; dezentes Schweben getrennt gesteuert |
| Bewegung | 6 | unten, oben, seitlich | 18 | 100 ms je Frame, geschlossener 600-ms-Zyklus |
| Heilimpuls | 4 | unten, oben, seitlich | 12 | 100 ms je Frame, einmalig; Wirkung beim dritten Frame |
| Tod | 5 | unten, oben, seitlich | 15 | 100 ms je Frame, einmalig; danach entfernen |

Der Bewegungszyklus zeigt ein Zusammenziehen, Ausstrecken und Nachschwingen der Tentakel. Anfang und Ende schließen aneinander an. Heilung zeigt eine kurze Körper-/Laternenreaktion. Beim Tod fällt die Form sichtbar zusammen und das Licht erlischt. Ein normaler Angriff ist für diese Rolle nicht erforderlich; eine eigene Trefferanimation ist zunächst ebenfalls nicht nötig.

Körper, Laterne und Tentakel behalten Volumen, Position und Farbgebung über den Zyklus. Ein dauerhaftes Hoch-und-runter-Schieben eines Einzelbilds ersetzt keine Körperanimation. Eine zusätzliche Schwebewegung darf den Körperzyklus nicht doppelt übertreiben.

## 4. Produktion in fünf konkreten Schritten

1. **Referenz festlegen:** Original-Blattkäfer und einen Originalflieger mit Bewegungsframes sowie einen aktuellen Moorausschnitt zusammenstellen. Die alte Qualle dient nur als Motivvorlage. Prompt und Zielmaße vor der Generation speichern.
2. **Eine Grundpose erstellen:** Zunächst eine vereinfachte seitliche Pose als echte kleine Pixelgrafik aufbereiten. Hohe Generatorauflösung ist Rohmaterial; Pixelgruppen, Palette und Kontur müssen im 64er Zielformat stimmen. Nicht versuchen, den alten Detailgrad durch Weichzeichnen oder Schärfefilter passend zu machen.
3. **Eine Bewegungsprobe bauen:** Sechs zusammengehörige Seitenframes aus demselben Entwurf entwickeln, kontrolliert nacharbeiten und in echter Spielgröße neben einem Originalflieger im Moor abspielen. Erst diese kleine animierte Probe visuell abnehmen lassen; bei Problemen diesen Entwurf korrigieren.
4. **Die Einheit vervollständigen:** Nach bestandener Probe die übrigen Richtungen sowie Heil- und Todeszustände produzieren. Kurze Sequenzen mit festem Charakterbezug anfordern; ein einziges großes generiertes Komplettsheet ist kein verlässlicher Export. Gute Frames erhalten, nur fehlerhafte Abschnitte korrigieren.
5. **Aufbereiten und integrieren:** Tatsächliche Ausschnitte vermessen, Konturen und Anker angleichen, Atlas deterministisch packen und Animationsmetadaten schreiben. Anschließend die Einheit mit ihrer echten Mechanik im Moor einsetzen.

Nach zwei ungeeigneten Versuchen für dieselbe Pose oder Sequenz wird das Verfahren angepasst: Silhouette vereinfachen, gute Ausgangspose bearbeiten oder gezielt Pixel korrigieren. Es folgt keine Serie nahezu gleicher Prompts auf Verdacht.

## 5. Dateien und technische Integration

- Rohquellen und vollständige Prompts versioniert unter `artifacts/enemies/lantern-jelly/v1/` erhalten. Geprüfter Laufzeitexport unter `public/assets/` mit neuer Versionskennung; vorhandene Originale nicht überschreiben.
- Körperatlas: **512 × 384 Pixel**, acht Spalten und sechs Reihen mit 64er Frames. Keine Atlasbeschriftungen oder Zwischenräume als Bildinhalt. Die Zuordnung der 48 Frames wird ausdrücklich gespeichert.
- Metadaten enthalten Zustand, Richtung, Framefolge, Dauer, Schleife, Bezugspunkt, Maßstab und Zeitpunkt des Heileffekts. Der bestehende Import darf zusätzliche Heil-Tags nicht mit den neun Original-Richtungstags verwechseln.
- Gezielt benötigte Änderungen an Gegnerdefinition, Simulation, Darstellung, Assetaufbereitung und Offline-Bundle vornehmen. Neue PNGs und Metadaten ausdrücklich in die Kopier- und Einbettungsliste von `scripts/reference.mjs` aufnehmen. Ausgangslage dieses Plans: Die damalige `reference/`-Version besaß noch keine Heilerfunktion. Die inzwischen umgesetzte begrenzte Pulsheilung ersetzt den ungeprüften Import der alten kontinuierlichen Heilung.
- Simulation und Animation verwenden dieselbe Spielzeit. Ein Aktionszustand mit zunächst 0,4 Sekunden Dauer steuert Heilpose und Puls bei 0,2 Sekunden. Zustandspriorität: Tod → Heilaktion → Bewegung → Ruhe. Menü und Pause halten beide an, 2× beschleunigt beide. Eine während des Heilimpulses laufende Bewegungsanimation darf die Heilpose nicht sofort überschreiben; nach dem Tod erfolgt kein Puls mehr.
- Die Qualle darf während des kurzen Impulses weiterschweben. Blickrichtung während dieser Pose festhalten; danach in die passende Bewegung zurückkehren. Kein zusätzliches Stehenbleiben als neue Wegregel nötig.
- Schatten, Flughöhe und Lebensbalken bleiben getrennte Darstellungsbestandteile. Die bisherigen festen Balken- und Schattenabstände am neuen Körpermaß überprüfen, statt sie in den Sprite einzumalen.

## 6. Erste spielbare Heilerfassung

Die folgenden Werte sind **Startwerte für einen gezielten Versuch**, keine abgeschlossene Balance:

| Regel | Erste Fassung |
| --- | --- |
| Einheit | Fliegend, verwundbar durch vorhandene Luftabwehr; 85 Leben, Tempo 43, keine Rüstung, 20 Gold, ein Lebenspunkt Schaden am Ziel |
| Reichweite | 100 Spieleinheiten um den Heiler; kurzer Effekt am Heiler und den tatsächlich geheilten Zielen |
| Heilung | Alle zwei Sekunden bis zu zwei verletzte Verbündete um je sechs Lebenspunkte heilen, höchstens bis zu deren Maximalleben |
| Zielwahl | Am stärksten verletzte geeignete Gegner im Radius zuerst; bei Gleichstand stabile Reihenfolge |
| Grenzen | Keine Selbstheilung, keine Heilung anderer Heiler oder Bosse. Ein Ziel erhält höchstens einen Heilimpuls innerhalb von zwei Sekunden, auch bei mehreren Heilern |
| Einführung | Im regionalen Moorplan erstmals in Welle 4 ein Heiler mit einer überschaubaren Gruppe. Weitere Einsätze erst nach dieser Probe, zunächst höchstens zwei gleichzeitig |
| Rückmeldung | Kurzer Heilimpuls und verständliche Einführung in der Wellenvorschau; kein dauerhaft großer Leuchtnebel |

Die Fähigkeit muss Zielpriorität interessant machen. Wenn sie nur Wellen verlängert, werden Heilmenge, Einsatzgruppe oder Frequenz reduziert. Bestehende Turmrollen müssen eine Gegenstrategie erlauben; ein neuer Begleiter wird dafür nicht vorausgesetzt.

## 7. Fertigkriterien und begrenzte Prüfung

- [x] Seitenprobe neben Originalgegner und Gelände bei 100/120 % geprüft und vom Nutzer abgenommen.
- [x] Drei Ansichten mit Bewegung, Heilung und Tod vorhanden; Rahmen technisch geprüft und Folgen in der Vorschau angesehen.
- [x] Heilpose an Simulationszeit gebunden; Tod, Pause und Tempo berücksichtigt. Tod vor Heilung durch gezielte Logikprüfung abgesichert.
- [x] Gezielt Heilgrenzen, Zielausschlüsse, mehrere Heiler und Atlasrahmen geprüft; keine komplette Kartentestserie.
- [x] Moor-Prüfwellen 4 und 7 vollständig im Browser angesehen; Heilimpulse und Lebenspunkte sichtbar bestätigt.
- [x] Aktuelle Spielansicht, interaktive Bewegungsvorschau, Builds und Roadmap aktualisiert; siehe Bericht.

**Ergebnis des ersten Produktionspakets:** eine stilistisch passende, vollständig animierte und spielerisch verständliche Laternenqualle. Ihr Verfahren diente auch der anschließend ausdrücklich beauftragten Succubus als Grundlage. Deren Korrektur zeigt zusätzlich: Eine kleinere Zahl klarer Posen und größere Farbflächen können die Lesbarkeit stärker verbessern als mehr Details. Die regionalen Wellen aus P1 bleiben der nächste allgemeine Umsetzungsschritt.

**Tatsächlicher Stand:** Auf „ja passt gut“ ist die Stilprobe abgenommen. Vier weitere Generationsaufträge lieferten Richtungen, Heilung, Tod und einen gezielt getrennten Frontzyklus, weil im ersten Richtungsblatt Fronttentakel aneinanderstießen. Nur dessen sechs Rückansichten werden verwendet. Die sechs abgenommenen Seitenframes bleiben bytegleich erhalten. Laufzeitatlas, explizite Animationen, begrenzte Heillogik, Welleneinsätze, Einführung und separate Kampfvorschau sind umgesetzt. P1 bleibt offen.

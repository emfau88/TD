# Spire – Umsetzungsplan für den nächsten Ausbau

Stand: 17. Oktober 2026. Status: **P2-Laternenqualle und eigens beauftragte Succubus umgesetzt; übriger Ausbau geplant.** Dieser Plan konkretisiert die [Roadmap](ROADMAP.md); deren Grafik- und Asset-Vorgaben bleiben verbindlich. Auf die nachfolgenden Einzelaufträge wurde der Gegnerausbau vorgezogen. Die Qualle ist im Moor in Welle 4, 7 und 9 enthalten; Rosenspiegel in Windbruch Welle 6 und 9. Bestehende Speicherformate bleiben erhalten. Nachweise: [Laternenqualle](artifacts/enemies/lantern-jelly/v1/REPORT.md), [Succubus und zweite Grafikfassung](artifacts/enemies/succubus/production-v2/REPORT.md). Die Nutzerabnahme der Succubus-Überarbeitung steht aus.

## Ziel und Ausgangspunkt

Aus dem vorhandenen Prototyp soll ein zusammenhängendes Tower-Defense-Spiel mit fünf eigenständigen Karten werden. Zuerst verbessern wir die spielerische Qualität der vier vorhandenen Karten. Zusätzlicher Inhalt folgt auf dieser Grundlage.

Vorhanden sind vier direkt auswählbare Karten, acht Türme, zehn Gegnertypen (acht Originalgegner, Laternenqualle und Succubus) sowie Wisp und Mara. Jede Karte hat zehn Wellen; der gemeinsame Plan wurde bisher nur um Moorheiler und Windbruch-Verführung ergänzt. Wald/Winter haben je 133 Gegner, Moor 138 und Windbruch 135. Runa und Ilyra besitzen im alten Projekt Figurenentwürfe und Fähigkeiten, aber noch keine fertig geprüfte Integration in das aktuelle Spiel. Vesper ist zunächst eine Storyfigur mit Porträt. Drei weitere alte Gegnerrollen sind spätere Kandidaten.

**Verbindlich:** zehn Wellen je Karte, frei zugängliche Karten zum Testen, bestehende Speicherstände berücksichtigen, PC-Steuerung und Zoom erhalten. Mobile bleibt zurückgestellt. Keine neue Engine, kein umfassender Umbau und keine Assetproduktion auf Vorrat.

## Reihenfolge

| Abschnitt | Konkretes Ergebnis | Voraussetzung |
| --- | --- | --- |
| P1 – Regionale Wellen | Vier unterschiedliche, verständliche Zehn-Wellen-Pläne | Bestehender Vier-Karten-Stand |
| P2 – Eine regionale Mechanik erproben | Laternenmoor mit einem klar lesbaren Spezialgegner | P1 als Vergleichsbasis |
| P3 – Begleiter erweitern | Erst Ilyra, danach Runa; zwei aus vier auswählen | Wellen und Grundschwierigkeit ausreichend stabil |
| P4 – Spielgefühl und Darstellung | Verständliches Kampfgeschehen, stimmige Animationen und Rückmeldungen | Neue Rollen stehen fest |
| P5 – Fünfte Karte | Mondwarte als ausgearbeitete Abschlusskarte | Vier Karten spielen sich überzeugend und passen optisch zusammen |
| P6 – Kleine Kampagne | Fünf verbundene Missionen mit kurzen Storymomenten | Fünf-Karten-Paket abgenommen |

P1 bis P4 bilden den empfohlenen nächsten Ausbau. P5 und P6 bleiben spätere Abschnitte. Innerhalb eines beauftragten Abschnitts werden gewöhnliche Umsetzungsschritte selbstständig erledigt; die vorhandenen visuellen Abnahmen beziehen sich auf konkrete spielbare Ergebnisse.

## P1 – Die vorhandenen Karten spielerisch unterscheiden

**Aufgaben**

- [ ] Wellenpläne nach stabiler Regions-ID auswählen; gemeinsame Regeln für zehn Wellen behalten. Die historische Originalreferenz bleibt unverändert.
- [ ] Pro Welle Gegnerarten, Anzahl, Reihenfolge, Spawnabstände und verfügbare Routen ausdrücklich festlegen. Nur tatsächlich benötigte Datenfelder ergänzen.
- [ ] Wellenvorschau mit den tatsächlichen Gegnergruppen und Routen verbinden. Neue Bedrohungen vor ihrem ersten Auftreten erklären.
- [ ] Anfangsgold, Belohnungen, Lebenspunkte und Spawnabstände zusammen abstimmen. Die bisherige Gesamtzahl von 133 Gegnern ist kein Sollwert.
- [ ] Welle 5 bleibt ein deutlicher Zwischenhöhepunkt, Welle 10 das Finale. Verstärkte vorhandene Gegner reichen zunächst; neue Bossgrafiken sind dafür nicht nötig.

| Karte | Geplanter Schwerpunkt | Beispiel für die Dramaturgie |
| --- | --- | --- |
| Der alte Hain | Verständlicher Einstieg und ausgewogene Verteidigung | Erst Bodenmassen, dann erste Flieger, später wenige gepanzerte Gegner; keine zusätzliche Sonderregel |
| Laternenmoor | Gegnergruppen an Übergängen aufhalten und Prioritäten setzen | Langsame robuste Gruppen wechseln mit schnelleren Durchbruchsgruppen; vorhandenen Heiler gezielt einsetzen |
| Spiegelwinter | Ressourcen zwischen zwei Zugängen verteilen | Zunächst einzelne Zugänge, später angekündigte Überschneidungen; keine unangekündigten Wegwechsel |
| Windbruch | Luftabwehr und Reichweite auf begrenzten Plateaus | Bodenwellen als Grundlage, steigender Fluganteil, gemischtes Finale; Flugbedrohungen vorab sichtbar |

**Fertig, wenn:** Die Karten erzeugen unterschiedliche Verteidigungsentscheidungen, zehn Wellen sind vollständig spielbar und Vorschau sowie tatsächliche Spawns stimmen überein. Jede Karte wird einmal gezielt mit einem plausiblen Turmaufbau gespielt. Modellprüfungen prüfen Regeln und Durchspielbarkeit; sie ersetzen kein Urteil über Spaß und Schwierigkeit. Auffällige Spitzen werden korrigiert, ohne ständig alle Karten erneut durchzutesten.

## P2 – Eine regionale Besonderheit sauber einführen

**Erster Kandidat: Laternenmoor mit einer neu aufgebauten Laternenqualle als Heiler.** Die alte Einheit liefert Motiv und Mechanikidee. Ihre hoch aufgelösten Bilder und kurzen Framefolgen gelten als Entwurf. Der [konkrete Gegner-Produktionsplan](GEGNER_PRODUKTIONSPLAN.md) legt Pixelmaßstab, 48 Körperframes, Produktionsfolge, technische Integration und erste Spielwerte fest.

**Umgesetzt nach Stilabnahme:** Drei Ansichten mit insgesamt 45 unterschiedlichen Posen in 48 Rahmen, Heilaktion und Tod sowie Einsätze in Moorwelle 4, 7 und 9. Die separate Vorschau bietet Zustands-/Richtungswahl und zwei Kampfwellen ohne Spielstandzugriff. Start über `GEGNERPROBE STARTEN.cmd` nach `npm run reference:enemy:build`. Heillogik, Rahmen und Speicherübernahme sind gezielt geprüft; die finale Nutzerbeurteilung der neuen Kampfsituationen bleibt möglich.

- [x] Heillogik passend zur aktuellen Simulation umsetzen; Originalvergleich bleibt ohne neue Gegner.
- [x] Heilradius, Takt, Menge, Ziele und Begrenzung mehrerer Heiler festlegen.
- [x] Eigene Silhouette, Heilpose, kurze Verbindungen und Zielringe; erste Einführung in Welle 4.
- [x] Heiler durch bestehende Luftabwehr angreifbar machen; Moor mit vorhandenem Budget gewinnbar.
- [x] Seitenprobe vom Nutzer abnehmen lassen und die benötigten Richtungen und Zustände vervollständigen.

**Fertig, wenn:** Spieler erkennen ohne Handbuch, wer heilt und wie sie reagieren können. Heilung kann keine endlose Welle erzeugen. Das Moor bleibt mit Wisp und Mara lösbar.

**Zusätzlich beauftragte Succubus – umgesetzt:** Rosenspiegel ist eine Bodeneinheit in Windbruch Welle 6 und 9. Sie hält für eine Verführung an: feste Reichweite 200, 0,8 Sekunden erkennbare Vorbereitung, danach 4,5 Sekunden mit 40 % geringerer Turmfeuerrate. Pinker Herzfaden, Herzsymbol und ein separates Tanzfenster zeigen Quelle und Ziel. Ausschalten, Verkauf des Turms, Reichweitenverlust und Wellenende beenden die Wirkung. Die Quelle hat elf Sekunden Abklingzeit; der betroffene Turm danach sechs Sekunden Schutz. Maras Verstärkung und die Schwächung werden gemeinsam berechnet (1,5 × 0,6 = 0,9).

Die zweite Grafikfassung reduziert auf zwölf Farben und vier Gehposen je Ansicht. Acht Tanzposen laufen langsamer mit 190 ms je Bild im vergrößerten Fenster (2,2-fach); die normale Spielfigur behält ihren Maßstab. Die kurze seitliche Folge wurde überarbeitet und bleibt ein begrenzter Animationszyklus. Die Nutzerbeurteilung dieser Korrektur steht aus. Eigene Zustands-/Richtungsprobe und echte kurze Kämpfe: `npm run reference:succubus:build`, dann `SUCCUBUS STARTEN.cmd`. [Grafikvertrag, Quellen und gezielte Prüfergebnisse](artifacts/enemies/succubus/production-v2/REPORT.md).

Root Herald (Tempo), Frost Ram (Turmstörung) und Sternenrichter (Schilde) bleiben zunächst als Rollen- und Designideen im Vorrat. Ihre alten Grafiken sind keine freigegebenen Laufzeitassets; eine spätere Nutzung erfordert denselben Stil- und Animationsaufbau. Pro Region höchstens eine zusätzliche Sondermechanik in diesem Ausbau. Es besteht keine Pflicht, alle alten Gegner oder Interaktionsstationen einzubauen. Weitere Kandidaten folgen nur, wenn eine konkrete spielerische Lücke bleibt.

## P3 – Vorhandene Charaktere nutzbar machen

### Zuerst Ilyra

- [ ] Vorhandenes Design erhalten; Stand-, Lauf- und Aktionsbilder einzeln vermessen. Breite Angriffsposen vollständig freistellen, statt ein rechnerisches Raster über das Rohbild zu legen.
- [ ] Maßstab und Fußpunkte neben Wisp, Mara, einem Turm und einem Gegner im Spiel angleichen.
- [ ] Sternensalve als kurze Flächenattacke mit Vorteil gegen Flieger integrieren. Schaden, Radius und Abklingzeit neu abstimmen; alte Zahlen sind nur Ausgangswerte.
- [ ] Zielbereich vor dem Befehl anzeigen. Die Fähigkeit wirkt nach Ankunft und sichtbarer Aktion, nicht schon beim Klick.
- [ ] Auswahl von genau zwei unterschiedlichen Begleitern vor einem neuen Kartenlauf ermöglichen. Auswahl und Zustand im Karten-Spielstand speichern; alte Spielstände behalten Wisp und Mara.

### Danach Runa

- [ ] Dieselbe Grafikaufbereitung wie bei Ilyra durchführen; besonders Ausrüstung, Handpositionen und Effektränder angleichen.
- [ ] Eigenständige Rolle prototypisieren: vorübergehender Rüstungsfluch auf Gegner in einem Zielbereich. Runa soll Wisp ergänzen und nicht nur einen zweiten Verlangsamungseffekt liefern.
- [ ] Wechselwirkung mit vorhandener Rüstung und Turmschaden eindeutig begrenzen. Ein nicht stapelbarer Effekt mit klarer Laufzeit ist die erste Variante.
- [ ] Wirkung sichtbar markieren und vor allem gegen gepanzerte Gruppen erproben. Falls der Unterschied kaum spürbar ist, die Fähigkeit korrigieren, bevor weitere Grafiken entstehen.

**Fertig, wenn:** Vier Begleiter haben erkennbare Rollen: Wisp kontrolliert, Mara verstärkt Türme, Ilyra liefert gezielten Schaden, Runa schwächt Rüstung. Alle sechs möglichen Zweierkombinationen lassen sich auswählen und speichern; neue Figuren folgen denselben Weg-, Pause- und Aktionsregeln wie die vorhandenen. Neue Fähigkeiten werden gezielt im Kampf geprüft, ohne jede Kombination auf jeder Karte vollständig durchzuspielen. Kein Level setzt einen bestimmten Begleiter voraus.

**Nicht vorgesehen:** Vesper als spielbarer Charakter, Ersatz des Original-Wisp oder zusätzliche Figurenpakete.

## P4 – Spielgefühl und Grafik gezielt verbessern

- [ ] Auswahl, Laufziel, ungültige Ziele, Fähigkeitsradius, laufende Wirkung und Abklingzeit eindeutig darstellen.
- [ ] Heilen, Rüstungsschwächung, Verstärkung und Schaden visuell unterscheidbar machen. Effekte dürfen Gegner, Wege und Bauflächen nicht verdecken.
- [ ] Vorhandene Geräusche prüfen; fehlende Rückmeldungen für Treffer, Fähigkeit, Wellenbeginn und Sieg gezielt ergänzen. Lautstärke und Wiederholungen bei vielen gleichzeitigen Angriffen begrenzen; Stummschaltung erhalten.
- [ ] Mara, Ilyra und Runa in echter Spielgröße auf ruckelnde Schritte, wechselnde Größe und verrutschende Füße prüfen. Nur benötigte Zwischenposen ergänzen. Mehr Frames allein sind kein Qualitätsnachweis.
- [ ] Konkretes optisches Nutzerfeedback zu Moor, Winter und Windbruch abarbeiten und Abnahmen dokumentieren.

**Assetverfahren für P2–P4:** Bedarf festhalten → passende vorhandene Frames auswählen oder Pixelentwurf neu aufbauen → eine kurze zusammenhängende Animation im Spiel beurteilen → benötigte Richtungen und Zustände vervollständigen → Freistellung und Bezugspunkt bereinigen → gemessene Ausschnitte packen → im Spiel prüfen. Rohquellen erhalten; neue Kandidaten getrennt versionieren. Für die alten Spezialgegner gilt ausdrücklich der [Gegner-Produktionsplan](GEGNER_PRODUKTIONSPLAN.md). Die [Grafikreferenz](reference/STYLE_GUIDE.md) und Abschnitt 4 der Roadmap bestimmen Maßstab und Exportregeln.

**Fertig, wenn:** Ein Spieler versteht die wichtigsten Kampfereignisse direkt im Spiel. Figuren bleiben bei Bewegung und Aktion stabil, Effekte bleiben auch in einer dichten Welle lesbar. Ein repräsentativer Kampf sowie Pause und 2× reichen als gezielte Sichtprüfung; weitere Prüfungen folgen nur bei konkreten Problemen.

## P5 – Mondwarte als fünfte Karte

- [ ] Eigenes spielbares Layout mit mehreren Zugängen und gemeinsamem Ziel entwerfen; zunächst vorhandene Platzhalter nutzen.
- [ ] Verteidigungsentscheidungen und Begleiterwege prüfen, bevor neue Grafik entsteht.
- [ ] Benötigte Sternenarchitektur, Böden, Übergänge und gegebenenfalls Portale genau spezifizieren. Eine kleine Probe mit bestehenden Türmen und Figuren im Spiel abnehmen lassen.
- [ ] Erst danach das benötigte Grafikpaket vervollständigen. Mondwarte soll nicht nur Windbruch anders einfärben.
- [ ] Einen eigenen Zehn-Wellen-Abschluss aus den bereits verständlichen Gegnerrollen gestalten. Sternenrichter nur übernehmen, wenn seine Schildmechanik hierfür einen klaren Nutzen hat.
- [ ] Karte frei auswählbar machen, Speicherung und Offline-Ausgabe ergänzen sowie aktuelle Screenshots dokumentieren.

**Fertig, wenn:** Die fünfte Karte erfüllt die Kartenkriterien der Roadmap und wirkt als Teil desselben Spiels. Spielbare Qualität und Nutzerabnahme gehen vor zusätzlicher Menge an Dekoration oder Mechaniken.

## P6 – Erst anschließend die Kampagne verbinden

Fünf Karten werden zu fünf kompakten Missionen verbunden. Aus dem alten Entwurf übernehmen wir die Figurenstimmen, kurze humorvolle Dialoge, das Spire-Netzwerk und Vespers nachvollziehbares Motiv. Das alte 18-Missionen-Gerüst wird nicht übernommen.

Geplant sind ein kurzer Einstieg, knappe Übergänge und ein Abschluss. Dialoge bleiben überspringbar. Die freie Kartenauswahl bleibt zum Testen erhalten. Konkrete Texte, Inszenierung und zusätzliche Storyassets werden erst in diesem Abschnitt ausgearbeitet.

## Gezielte Prüfung und Auslieferung je Abschnitt

1. Nur geänderte Regeln und konkrete Risiken automatisiert prüfen: etwa Wellenauswahl, Heilgrenzen, Fähigkeitseffekt oder Speicherübernahme.
2. Den geänderten Ablauf im Spiel ansehen. Neue Grafik immer in tatsächlicher Spielgröße und bei der betroffenen Animation prüfen.
3. Build und Offline-Ausgabe bei Änderungen am Spiel aktualisieren. Bestehende Nutzer-Spielstände für Prüfungen nicht zurücksetzen.
4. Roadmap mit tatsächlichem Ergebnis, offenen Punkten und Prüfbeleg aktualisieren. Screenshots erneuern, wenn sich die Darstellung wesentlich ändert.
5. Abgeschlossene Änderungen nachvollziehbar versionieren und im bereits beauftragten Repository veröffentlichen. Keine Dauer-Testschleifen nach bestandenen relevanten Prüfungen.

**Erstes Umsetzungspaket:** P1 – vier eigene Wellenpläne samt korrekter Vorschau und einer gezielten Spielprüfung je Karte. Dafür sind keine neuen Tilesets oder Charaktergrafiken erforderlich.

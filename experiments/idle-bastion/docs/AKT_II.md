# Akt II — Gestaltungs- und Technikentscheidungen

Stand: 20.10.2026. Ergänzung zum ursprünglichen Akt-I-Auftrag. B15a, F01, B17a und anschließend B15b einschließlich Tavernenübersicht aller Gefährten wurden ausdrücklich beauftragt; übrige Inhalte bleiben separat. Checklisten, Abhängigkeiten und Freigaben stehen ausschließlich in [ROADMAP.md](../ROADMAP.md). Dieser Text hält Entscheidungen und überprüfte Ausgangspunkte fest, keine zweite Fortschrittsliste.

**Planergänzung vom 21.10.2026:** [Taverneninteraktionen](TAVERNE_INTERAKTION.md) beschreiben die geplante frühere Taverne I nach Welle 12, den Ausbau auf II/Ilyra nach Boss 25 und das optionale soziale System. T02 setzt bereits den kostenlosen Bau nach Welle 12 und Ausbau II nach Boss 25 um; alte bezahlte Tavernen werden II. Die bisherigen Bauangaben unten sind historische B15-Entscheidungen. Das soziale System folgt separat. Checklisten/Freigaben ausschließlich in der Roadmap (T01–T07).

## Konkretisierung B16 vom 23.10.2026

Eigener Branch ab main, zunächst ohne Veröffentlichung: Turm 05 erhält 26 Schaden,
1,05 s Angriffsabstand, 144 Reichweite und getrennt 170 Gold Baupreis. Forschung
kostet einmalig 900 Gold nach gemeisterter 28, Frostfassung und Ilyras abgeschlossener
Einführung. Drei verschiedene Ziele, 80 Sprungreichweite und Schaden 100/65/42,25 %;
kein Flächentreffer oder Kontrollbonus. Bestehende Ausbaukurve ohne neue Levelgrenze.
Frost-/Sturmlicht-Icons liegen in der Werkstatt; Besitz und Nutzen sind antippbar.
Wirtschaft 25–70 wird nur untersucht. B20, Ostfront und allgemeine Upgradeoptik
bleiben außerhalb dieses Auftrags. Status und Freigabe ausschließlich in der Roadmap.

## Bestand statt unnötiger Neuproduktion

| Quelle | Tatsächlich vorhanden | Konsequenz |
| --- | --- | --- |
| [Klassische Turmdaten](../../../reference/src/data.ts), [Kampflogik](../../../reference/src/simulation.ts) | Sturmlicht (05, Kette), Schnellfeuer (06), Glutwerfer (07, Brand), Sonnenobelisk (08, Fläche/Durchschlag) | Rollen und Algorithmen als Vorlage; alte Preise/Schadenswerte nicht ungeprüft nach Idle übernehmen |
| [Assetmanifest](../../../public/assets/manifest.json) und `public/assets/Tower 05…08*.png` | Originalbasen, Ausbaustufen sowie zugehörige Projektile/Treffer; teilweise gemeinsam genutzte `Level X`-Grafiken | Zuerst Originalframes vermessen; kein Imagegen für bereits vorhandene Türme |
| [Idle-Turmatlas](../src/tower-atlas.ts), [Idle-Grafiken](../src/art.ts) | Spielbare Turmtypen 1–5 im B16-Branch; Turm-08-Grafiken dienen bereits dem Kern | Neue IDs/Animationen müssen wirklich integriert werden; Sonnenobelisk später deutlich vom Kern unterscheiden |
| [Ältere Figuren](../../../src/companions.ts), [ältere Simulation](../../../src/simulation.ts) | Ilyra: Sternensalve mit stärkerem Fliegerschaden; Runa: Nebelschleier/Verlangsamung | Aus dem älteren Kampagnenstand übernehmen, nicht fälschlich als fertige Idle-Funktion zählen |
| `public/assets/Hero Ilyra.png`, `public/assets/Hero Runa.png` | Rohbilder mit mehreren Richtungen/Posen | Ausschnitt, Fußpunkt, Skalierung und tatsächlich brauchbare Animationsphasen prüfen; noch kein fertiger Mara-kompatibler Atlas |
| [Idle-Kampf](../src/battle.ts), [Karte](../src/layout.ts) | Ein Kampfweg; Steinschleuder trifft derzeit auch Flieger; freie Wegstreifen bis drei Zellen Tiefe | Zweite Route braucht mehr als einen rechten Spawn. Bestehende Turmleistungen und freie Positionen erhalten |

Die erste Wahl sind **Sturmlicht und Glutwerfer**: Ketten und Brand erweitern die Kombinationen. Schnellfeuer überschneidet sich stärker mit Waldwächter/Mara; Sonnenobelisk überschneidet sich teilweise mit Flächenschaden und dem Erscheinungsbild des Kerns. Beide bleiben bewusst Reserve.

## Taverne und Figuren

Nach dem tatsächlich besiegten Boss von Welle 25 wird die Taverne im Siedlungsmenü angeboten, mit „Neu“-Markierung an Tab und Baukarte. Preis: 1.200 Gold, entsprechend der einmaligen Bossbelohnung. B15a liefert auf ausdrücklichen Nutzerwunsch nur das Gebäude: optionaler Treffpunkt, noch ohne Gäste oder Kampfbonus; der Kaufdialog sagt das offen. Ilyras erste Rekrutierung folgt mit B15b ohne zweite Goldzahlung für bestehende Tavernenbesitzer. Keine Zufallsauswahl, Seltenheiten, Ausrüstung oder Rekrutierungstimer. Die Taverne steht auf einem selbst gewählten gültigen Siedlungsplatz. Bei Platzmangel wird die Siedlung lokal erweitert; vorhandene Gebäude bleiben stehen, und die Ostfront ist keine Voraussetzung.

Ilyra ergänzt Mara durch direkten Flächenschaden, besonders gegen Flieger. Eine kurze Vorstellung und eine sichtbar ausgelöste Sternensalve erklären ihren Nutzen. Sie bewegt sich unabhängig von Türmen; Zielgebiet und Wirkungsradius müssen vom gewählten Standort aus verständlich sein. Manuelle Anwendung zuerst; eine ausdrücklich wählbare Automatik wirkt erst bei geeigneten Gegnern. Kein unbemerkter Zauber vor der Vorstellung oder im leeren Wellenzwischenraum.

Die Fähigkeit wächst mit nachvollziehbarem Verteidigungsfortschritt, ohne ein neues Heldenlevelsystem. B15b legt 28 s Abklingzeit, 210 px Reichweite, 72 px Radius und mindestens 70 Schaden bzw. 1,5 Sekunden ungebuffte DPS des stärksten Turms fest. Flieger erhalten 50 % mehr Schaden; die erste Anwendung ist manuell, geeignete Gegner aktivieren eine optional eingeschaltete Automatik. Farm-/Offline-Nachweise rechnen ohne die Salve; alte Kampagnen-Schadenszahlen sind kein Idle-Balanceziel. Temporäre Mara-Verstärkung darf Ilyra nicht zirkulär hochskalieren. Wisp bleibt Wirtschaftsfigur. Für Akt II reichen Mara und Ilyra als zwei Kampffiguren; Runa wäre später eine austauschbare Alternative, nicht automatisch eine dritte Pflichtfigur.

## Forschungsfreischaltungen und sichtbarer Besitz

Neue Türme werden in der vorhandenen Werkstatt bewusst für Gold erforscht. Fortschrittsbedingungen machen die Forschung verfügbar, sie schenken nicht automatisch den Turmtyp: Sturmlicht nach Ilyras Einführung ungefähr ab Welle 28, Glutwerfer ungefähr Welle 33–35. Preise mit dem normalen Einkommen abstimmen; Forschung und anschließender Turmbau sind getrennte, klar beschriftete Käufe.

In B16 erhalten erforschte Technologien kleine passende Icons mit Häkchen in der Werkstatt. Antippen zeigt Name und Wirkung; gesperrte Einträge sind gedimmt und nennen ihre Voraussetzung. Vorhandene Frost-/Turmforschung einbeziehen, B20 ergänzt Glutwerfer. Keine zusätzliche permanente HUD-Leiste. Diese Icons und Turmfreischaltungen sind vorgemerkt, nicht Teil der Tavernenimplementierung.

## Ergänzte Siedlungsplanung am Kern

Die Roadmap-Ergänzung vom 20.10.2026 zieht eine nützliche Basisfläche als B17a vor: frei platzierbare Werkstatt, Lager und Taverne südlich/südöstlich des unveränderten Kerns, zunächst ohne Ostangriff. Ein reservierter Ostkorridor samt drei Reihen Turmbaufläche je Seite verhindert spätere Konflikte mit Gebäuden. Bestehende Gebäudeplätze bleiben in Altsaves bis zum bewussten kostenlosen Umzug gültig; bestehender Lichtungsbesitz wird erhalten und später angerechnet. Auf ausdrücklichen Nutzerwunsch gibt es keine zusätzlichen Front-/Basis-Buttons: Mausziehen/Touch bleiben die Navigation, echte Bau-/Lernaktionen dürfen einmalig fokussieren. Der ursprüngliche große Ostkartenumfang unten wird als B17b weitergeführt. Verbindliche Reihenfolge, Checklisten und Umfang stehen ausschließlich in der Roadmap; B17b und die tatsächliche Ostfront bleiben separat.

## Große Osthälfte mit gemeinsamem Kern

Ausgangspunkt ist nun die 40×16-Siedlungskarte aus B17a; alte Spielstände können noch 28×16 bzw. 32×16 verwenden. Der geplante Gesamtumfang liegt ungefähr bei **56×16 Zellen** bei gleicher 40er Zellgröße. Der Kern bleibt an seiner bisherigen Position `(27, 6)`; rechts soll ähnlich viel sinnvoller Verteidigungsraum entstehen wie links. Das genaue Endmaß folgt aus einer Weg-/Bauflächenprobe, nicht aus dem Wunsch, möglichst viel Fläche hinzuzufügen.

Ein eigener Weg führt von rechts zum gemeinsamen Kern. Alte Koordinaten, Gebäude und auch in der bisherigen Lichtung gesetzte Türme bleiben gültig. Beide Wege brauchen gut kombinierbare Bauplätze bis drei Felder Tiefe, genügend Abstand zum oberen Kartenrand und mindestens zwei taktisch unterscheidbare Streckenabschnitte. Vorhandenes Gelände wiederverwenden; keine zweite Grafikwelt als Voraussetzung.

Wer die bisherige Lichtung für 900 Gold gekauft hat, behält Zugang und Gegenwert. Dieselbe Fläche wird nicht erneut verkauft. Für Spieler ohne Lichtung gibt es einen einmaligen Zugang; konkrete Kosten und eventuelle Voraussetzungen werden mit Taverne und Startverteidigung abgestimmt. Gebietsbesitz und Beginn der Angriffe sind getrennt: **erst vorbereiten, dann bewusst öffnen**. Bis zur Freigabe wird im Westen weitergespielt/gefarmt. Ein Update startet niemals ungefragt die Ostfront.

Die Kamera bleibt im normalen lesbaren Maßstab. Mausziehen und Touch erschließen West / Kern / Ost; die vorhandene Gesamtübersicht bleibt optional. Keine zusätzlichen Front-/Basis-Buttons. Eine kleine Anzeige zeigt aktive Fronten und tatsächliche Gefahr; essenzielle Informationen brauchen kein gekauftes Spähergebäude. Keine dauerhafte Seitenleiste, kein automatisches Hin- und Herspringen und kein Zwang, die ganze Karte ständig herauszuzoomen.

## Geplanter Spannungsbogen

Die Wellenbereiche sind Arbeitsziele für regulären Fortschritt, keine schon implementierten Freischaltungen. Neue Käufe nacheinander vorstellen und auf erreichbare Einnahmen abstimmen.

| Abschnitt | Neues Ziel | Belastung |
| --- | --- | --- |
| Nach Boss 25 | Taverne bauen, Ilyra kennenlernen | Bisherige Front bleibt vertraut |
| Etwa 26–28 | Sternensalve einsetzen, Sturmlicht erforschen | Bestehenden Leerenfalter ab 28 berücksichtigen |
| Etwa 29–32 | Ostseite vorbereiten und selbst eröffnen | Erst einzelne Ostangriffe, dann wechselnde Schwerpunkte |
| Etwa 33–35 | Glutwerfer, Frost-/Feuerkombination | Neue Zusammensetzung statt nur mehr Lebenspunkte |
| Etwa 36–39 | Zwei Fronten sinnvoll besetzen | Ausgewählte gleichzeitige Angriffe, gemeinsames Gegnerbudget |
| Welle 40 | Ein eigener, verständlicher Bossabschnitt | Vorgesehene neue Mechanik: zeitweiser Gruppenschutz; sichtbar angekündigt und auslaufend |

Ein Goldkonto, ein Kern, eine sichtbare Wellenzahl. Ostgegner bekommen andere Zusammensetzungen und Schwerpunkte, nicht pauschal mehr HP. Doppelangriffe bedeuten nicht doppeltes bisheriges Gegnerbudget. Für den neuen Boss zuerst vorhandene geeignete Grafik prüfen; neue Mechanik und Silhouette müssen zusammenpassen. Keine große Gegnerproduktion als Voraussetzung für diesen Akt.

**Veteranen:** Rekord, Besitz und alte Erfolge bleiben erhalten, auch oberhalb Welle 40. Erstmals angebotene neue Schritte werden nach bewusstem Einstieg gestaffelt; historische Wellenzahlen gelten nicht automatisch als Sieg über einen neuen Boss. B18/B19 legen die Zuordnung von Einführungsrezepten und Schwierigkeit zur bestehenden globalen Wellenzahl ausdrücklich fest. Keine zweite sichtbare Wellenzählung und kein Rücksetzen des Rekords.

## Technische Leitplanken

Ausgangspunkt vor B15a waren Snapshot 18, Layout 4 und Kampfregeln 10. B15a ergänzt Snapshot 19 mit optionalem Tavernenplatz und Besitz; Layout 4 und Kampfregeln 10 bleiben erhalten. Weitere Mechaniken benötigen passende Versionen und Migrationen. Idle hat derzeit einen gemeinsamen Weg und lokale Gegner-Wegstrecken. Pro Gegner/Spawn muss eine Route gespeichert werden; Zielpriorität richtet sich nach der tatsächlichen verbleibenden Strecke zum Kern. Die ältere klassische Simulation kann als Referenz dienen, wird aber nicht als ganzes zweites Kampfsystem importiert.

Aktive Ketten, Brände und Figurenfähigkeiten müssen bei Save/Reload, Turmverkauf und letzten Treffern korrekt bleiben. Pro Gegner genau eine Killbelohnung, pro Welle genau eine Abschlussbelohnung. Taverne/Rekrutierung und Frontzugang werden atomar gespeichert; alte laufende Westwellen werden nicht nachträglich um Ostspawns ergänzt.

Sicheres Farmen gilt nur für das tatsächlich nachgewiesene Wellenrezept und die passende Frontkonfiguration. Zeitweilige Mara-/Ilyra-Aktivfähigkeiten zählen nicht zur garantierten Offline-Basis. Eine ausdrücklich gewählte reine West-Farmwelle bleibt erlaubt; ihr Nachweis beweist keine gemischte Welle. Historisch verdiente Offline-Ansprüche bleiben auf ihrer ursprünglichen Basis erhalten. Boss 40 ist wie die bisherigen Bosse kein Farm-/Offline-Ziel. Die bisherigen Sonderfälle 15/25 und die Kandidatensuche bis 32 müssen gezielt erweitert werden, ohne unbegrenzte Simulationsarbeit beim Laden.

Die Prüfung bleibt auf geänderte Risiken begrenzt: ein geeigneter Modellverlauf, gezielte Save-/Belohnungsfälle und kurze echte Ansichten auf Desktop und normalem Hochkant. Kein umfangreicher Testlauf pro Checkbox. Offene B14-Speicherrisiken, die durch zwei Fronten betroffen sind, müssen vorher gelöst werden; der übrige B14-Status und G2 werden nicht durch kleine Akt-II-Proben ersetzt.

## Darstellung und Assetbedarf

[ART_DIRECTION.md](ART_DIRECTION.md) und die vorhandenen Spielgrafiken bleiben verbindliche Referenzen. Sturmlicht/Glutwerfer brauchen vorhandene Atlanten und passende Effekte, keine neu generierten Turmbilder. Ilyra braucht eine saubere Aufbereitung ihres Bestandsbildes. B15a nutzt je ein ausdrücklich benötigtes Imagegen-Gebäude für Taverne und Werkstatt II: transparente 128er Frames, Fußpunkt (64, 112), Stilreferenz Werkstatt I und tatsächliches Spiel. Werkstatt II ersetzt den gezeichneten Anbau vollständig. Namen für Werkstatt I/II, Lager I und Taverne werden im Spiel gerendert und erscheinen erst nach dem Aufbau. Frühere ausgeschöpfte Bildbudgets gelten nicht als Freigabe für weitere Serien.

Neue Gebäude nutzen freie Siedlungsplätze, die bestehende kurze Bauanimation und eine sofort sichtbare fertige Ansicht. Ankündigungen dürfen weder die Bauanimation noch Kämpfe verdecken. Drei Grafikstufen bedeuten keine Pflicht zu drei weiteren Bildgenerationen. Für Boss 40 erst den vorhandenen Gegnerbestand prüfen; falls er visuell nicht trägt, einen einzelnen konkreten Bedarf benennen statt vorsorglich neue Serien zu produzieren.

## Späterer Ideenraum

Runa, Schnellfeuer und Sonnenobelisk bleiben Kandidaten für einen späteren Ausbau. Ein Späherposten könnte echte Erkundungsentscheidungen tragen; grundlegende Gefahrhinweise gehören ins HUD. Neue Turmspezialisierungen zunächst in der Werkstatt unterbringen, bevor ein Runenatelier dieselbe Aufgabe dupliziert. Die standardisierte Gegnerproduktion bleibt als eigener Punkt B12d bestehen.

**Nutzeridee Kern/HQ:** Eine spätere Interaktion mit dem Kern könnte einen zentralen Befehl, eine Verteidigungsfähigkeit oder eine Ausbauwahl anbieten. Noch keine konkrete Funktion beschlossen; den frühen Einstieg damit nicht zusätzlich belasten.

**Nutzeridee Wachstube/Kaserne:** Gelegentlich verbündete Einheiten vom Kern oder Gebäude auf die Lane schicken. Echte Begegnungen brauchen Gegnerangriffe/Zielwahl, eigene Lebenspunkte und Animationen, Regeln für Blockieren, Tod und Weiterlaufen sowie Speicherung und Farmbewertung. Erst später einen kleinen Prototyp auf einer Route prüfen. Eine nur vorbeilaufende Darstellung mit Flächeneffekt wäre technisch einfacher, ist aber kein gleichwertiger Ersatz für tatsächliche Kämpfe. Diese Idee gehört nicht zum Umfang B15–B22.

## Konkretisierung B17a vom 20.10.2026

Neue Partien nutzen 40×16 Zellen mit freier Siedlung südöstlich des unveränderten Kerns. Ältere Karten wechseln erst mit dem freiwilligen, kostenlosen Umzug aller Gebäude in manueller Pause. Der alte Lichtungskauf bleibt als 900-Gold-Anrechnung für B19 erhalten. Eine neue Zahlung für die reine Basisfläche entfällt. Der Ostkorridor einschließlich drei möglicher Turmreihen je Seite bleibt von Gebäuden frei; B17b führt die große Erweiterung von hier aus weiter.

Die ursprünglich vorgesehenen Front-/Basis-Buttons entfallen auf ausdrücklichen Nutzerwunsch: Mausziehen und Touch reichen. Der bestehende Bau-/Tutorialfokus bleibt gezielt erhalten, ebenso der Hochkantmaßstab. Diese Entscheidung gilt auch als Ausgangspunkt für die spätere Ostfront; keine vorsorgliche weitere Navigationsleiste.

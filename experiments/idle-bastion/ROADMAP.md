# Roadmap und Arbeitschecklisten — SPIRE: Idle Bastion

Stand: 18.10.2026 · **B01–B07 sowie B07a/B07b einschließlich mobiler und Premium-Nachbesserung veröffentlicht. G1 freigegeben; B08–B12 und die zusätzliche Überarbeitung B12a veröffentlicht.**

Diese Datei ist das Arbeitsboard: Phasen geben die Reihenfolge vor, Arbeitspakete bündeln ein prüfbares Ergebnis, Checklisten machen die verbleibende Arbeit sichtbar. Die verbindlichen Spielregeln stehen im [Auftrag](README.md), technische Einzelheiten in [TECHNIK.md](docs/TECHNIK.md), Grafikregeln in [ART_DIRECTION.md](docs/ART_DIRECTION.md) und Prüfszenarien in [ABNAHME.md](docs/ABNAHME.md).

## Aktueller Stand

| Feld | Stand |
| --- | --- |
| Branch | `codex/idle-bastion-vertical-slice` |
| Ausgangscommit | `5667aaeda3140e2797532894c524a32eb10af1cc` |
| Ablage | `experiments/idle-bastion/` im eigenen Worktree |
| Autorisierter Umfang | B01–B07, UI-Überarbeitung B07a und Fortschritts-/HUD-Ergänzung B07b einschließlich funktionalem Hochkant, zusätzlicher Premium-Überarbeitung mit 3–4 Imagegen-Assets und Commit/Push/Pages beauftragt. Zusätzlich B08–B12 ausdrücklich beauftragt; zusätzlich B12a ausdrücklich beauftragt: Bauflächen, Figuren, Siedlung und Kampfdarstellung |
| Aktives Umsetzungspaket | Keines · B12a veröffentlicht; B13-Balance noch nicht begonnen |
| Nächster Schritt | B12a über den Playlink testen lassen; B13-Balance auf dieser Grundlage separat beauftragen |
| G1: 90-Sekunden-Zwischenabnahme | **Freigegeben am 18.10.2026; Wortlaut unten** |
| G2: vollständiger Slice | **Offen; keine Nutzerfreigabe vorhanden** |

Vorhandene klassische Spielfunktionen zählen nicht als fertige Idle-Funktionen. B01–B07 sind abgeschlossen und die Fassung ist auf GitHub Pages testbar. G1 ist freigegeben. B11 ist am 18.10.2026 ausdrücklich mit kompakten Tests und Commit/Push/Pages beauftragt. B12 wurde anschließend ausdrücklich mit denselben Vorgaben beauftragt. B13/B14 bleiben separat. Paketstatus und echte Freigaben werden ausschließlich hier geführt; Fachdateien beschreiben Regeln, keine konkurrierenden Fortschrittsstände.

## B12a — Freie Verteidigung und verständliche Begleiter

Am 18.10.2026 ausdrücklich beauftragt: beidseits des Gegnerwegs bis zu drei Felder tief bauen, Maras Fernzauber mit sinnvoller Automatik, Wisps Ankunft, optionale östliche Lichtung, eigene Gebäudepositionen und Bauanimationen, Frostatlas korrigieren und Projektile verbessern. B13/B14 bleiben separat.

- [x] Freie geeignete Rasterfelder ab Beginn, Hindernisse und Weg schützen; bestehende Türme erhalten.
- [x] Tatsächliche Reichweite/Vorschau, ausdrückliche Bestätigung, Rückkehr zur Karte und kompakte mobile Bedienung.
- [x] Mara unabhängig bewegen, Fernziel wählen, Auto/Manuell, Gegnerprüfung, Buffdauer und Cooldown sichtbar.
- [x] Wisp mit kurzer Ankunft und einmalig gespeicherter Begrüßung.
- [x] Gebäudepositionen in der Siedlung, Versetzen bei Pause; Werkbank statt halbfertiger Werkstatt, sichtbare Baufolge.
- [x] Lichtung optional; Werkstatt II davon entkoppelt. Späterer Herausforderungszugang vorgemerkt, kein vorgetäuschter Dungeon.
- [x] Frost-Einzelframes und Originalprojektil-/Treffervarianten aller Grafikstufen; kosmetische Effekte begrenzen.
- [x] Alte Spielstände und Offline-Belege erhalten; 54 gezielte Modell-/Speichertests und Produktionsbuild bestanden.
- [x] Desktop-/Hochkantprüfung abgeschlossen; [Nachweis und Spielaufnahmen](../../artifacts/idle-bastion/acceptance/p4/REDESIGN.md).
- [x] Codecommit `6dbdd63` gepusht; [Pages-Lauf 39164594184](https://github.com/emfau88/TD/actions/runs/39164594184) erfolgreich. Öffentlicher Playlink lädt `battle-LDNvrmBq.js`; mobile Probe ohne Seitenfehler/Überlauf bestätigt.

## Ergänzung nach B10 — Rosenspiegels Tanzdarstellung

Am 18.10.2026 ausdrücklich beauftragt: das größere Tanzfenster sowie Leuchten, Vibrieren und Herzen des verführten Turms wie im Hauptspiel übernehmen.

- [x] Vorhandenen HD-Tanzatlas mit acht Originalposen und 190 ms je Bild übernehmen.
- [x] Lesbares Fenster während Vorbereitung/Wirkung, mit Restdauer und unveränderter Größe beim Kartenzoom.
- [x] Pulsierende Turmfärbung, leichtes Wackeln, geschwungener Herzfaden und aufsteigende Herzen übernehmen.
- [x] Alle Effekte an die gespeicherte Zauberzeit binden; Pause und Frostunterbrechung im echten Kampf prüfen.
- [x] Desktop/Hochkant, TypeScript und Produktionsbuild prüfen; [Spielaufnahmen und Nachweis](../../artifacts/idle-bastion/acceptance/p4/B10_VISUALS.md) ablegen.
- [x] Codecommit `7a6e2d5` gepusht; [Pages-Lauf 39085400278](https://github.com/emfau88/TD/actions/runs/39085400278) erfolgreich. Öffentlicher Playlink lädt das neue Bundle `battle-SZ-ugDyt.js` und stellt die bestehende Probe ohne Konsolenfehler wieder her.

## Nachbesserung nach B10 — Baukomfort, Schärfe und Turmkombinationen

Am 18.10.2026 ausdrücklich beauftragt: rückwärts laufende Skorpione korrigieren, nach Turmbau zur Karte zurückkehren, mobile Unschärfe verbessern und dichter kombinierbare Bauplätze ergänzen. Die drei zusätzlichen Plätze ändern die ursprüngliche Anzahl auf elf im Startgebiet; die spätere östliche Erweiterung bleibt B11.

- [x] Skorpion-Seitengrafik passend zur Bewegungsrichtung spiegeln; vertikale Ansichten erhalten.
- [x] Nach bestätigtem Bau alle Turmtypen aus Platzierung/Verwaltung entlassen; erneutes Antippen öffnet die Verwaltung.
- [x] Auf dichten Displays höhere interne Zeichenauflösung und lesbarere Spielfeldtexte, bei unverändert kompaktem mobilem HUD/Dock.
- [x] Drei Plätze mit nachgewiesenen gemeinsamen Schussfenstern ergänzen; bisherige Türme und Gegnerroute erhalten.
- [x] Layoutmigration einschließlich Maras Laufweg und alter Offline-Ansprüche prüfen.
- [x] Abschließende Browseraufnahmen und Veröffentlichung: Codecommit `27f54b5`, [Pages-Lauf 39084247681](https://github.com/emfau88/TD/actions/runs/39084247681) erfolgreich. Öffentliche Hochkant-Probe lädt den neuen Build; Kauf am Nordbogen bestätigt, Platzierung und Verwaltung danach geschlossen. [Prüfbericht und Aufnahmen](../../artifacts/idle-bastion/acceptance/p4/USABILITY.md).

## Premium-Überarbeitung nach der mobilen Nachbesserung

Am 18.10.2026 ausdrücklich beauftragt: hochwertige, an den Mockups orientierte UI mit 3–4 passenden Imagegen-Assets. Die kompakte mobile Aufteilung bleibt erhalten. Keine Freigabe für B08 oder neue Figurenmechanik.

- [x] Vier passende Materialien/Symbole erzeugen, Originale und vollständige Prompts erhalten.
- [x] Echte Assets in HUD, Karten, Kontextfenster und Aktionen integrieren; einheitliche Symbole und lokale Pixelschrift.
- [x] 56-px-HUD / 96-px-Dock, eingeklappte Hinweise, Vollbild und erreichbare Chronik mobil erhalten.
- [x] Desktop und normale Hochkantansicht visuell prüfen, betroffene Bedienung und Build bestätigen. [Nachweis](../../artifacts/idle-bastion/acceptance/ui/PREMIUM.md).
- [x] Screenshots, README und nachvollziehbaren Asset-/Prüfnachweis ablegen.
- [x] Commit/Push und erfolgreiche Pages-Veröffentlichung: `b972548`, [Pages-Lauf 39076457593](https://github.com/emfau88/TD/actions/runs/39076457593) erfolgreich. Öffentlicher Playlink mit neuer Schrift, tatsächlich geladener Rahmen-WebP und laufendem Kampf geprüft.

## Mobile-Nachbesserung nach B07b

Am 18.10.2026 ausdrücklich beauftragt: mobile Spielfläche vergrößern, Vollbild erreichbar machen; keine Sonderfall-/Kleinstgeräteoptimierung. Kein Beginn von B08.

- [x] Mobiles HUD/Dock und Zielstreifen komprimieren, überzählige Geräteabstände entfernen.
- [x] Maras Hinweis zunächst einklappen; Hinweise, Chronik und Kernaktionen erreichbar halten.
- [x] Vollbild-Schalter und verständliche Nichtverfügbarkeitsmeldung ergänzen.
- [x] Build und normale Hochkantbedienung prüfen; Desktop-Layout abgrenzen. [Nachweis](../../artifacts/idle-bastion/acceptance/ui/MOBILE.md).
- [x] Commit/Push und öffentliche Testfassung bestätigen: `7b74a7b`, [Pages-Lauf 39073600914](https://github.com/emfau88/TD/actions/runs/39073600914) erfolgreich; mobile Statusleiste 56 px, Dock 96 px und eingeklappter Tipp öffentlich geprüft.

## So werden die Pakete bearbeitet

1. Das nächste freigegebene Paket wählen, Voraussetzungen prüfen und es hier auf „In Arbeit“ setzen. Pro zusammenhängendem Arbeitsstrang ein Hauptpaket bearbeiten; passende unabhängige Teilaufgaben dürfen parallel laufen.
2. Ein Paket liefert eine überschaubare prüfbare Fassung. Kein großer Änderungsblock für sämtliche Phasen und keine vorgezogenen Features hinter ausgeblendeten Buttons.
3. `[x]` bedeutet tatsächlich erledigt und überprüft. Code vorhanden, ein Platzhalter oder ein grüner Build allein genügt nicht. Offene Arbeit bleibt `[ ]`; Hindernisse werden konkret benannt.
4. Nach Abschluss Ergebnis, Prüfungen, Grenzen und Commit im Phasenbericht festhalten und hier verlinken. Geeignete lokale Commits halten Pakete nachvollziehbar; ein Paket darf mehrere kleine Commits benötigen.
5. Danach ohne neue Routinefreigabe zum nächsten zulässigen Paket weitergehen. **G1 ist der verbindliche Halt:** Erst die ausdrückliche Nutzerfreigabe erlaubt B08–B14.
6. Kein Push, Merge oder Deployment aus dieser Planung. Keine zusätzlichen Abnahmeschleifen für normale reversible Detailentscheidungen erfinden.

Die Zahl erledigter Kästchen ist keine belastbare Prozent- oder Zeitangabe. Abschluss zählt über das sichtbare Ergebnis und seine Prüfungen.

## Übersicht der Arbeitspakete

| Phase | Paket | Prüffähiges Ergebnis | Voraussetzung | Status / Nachweis |
| --- | --- | --- | --- | --- |
| P0 | Planung | Auftrag, Referenzen und Checklisten vorhanden | Planungsauftrag | Erledigt; ursprüngliche Unterlagen in `6ac8dea`, Checklisten in diesem Dokument |
| P1 | B01 · Eigenständiger Einstieg | Leere Idle-Anwendung separat start- und baubar, Kartenrahmen festgelegt | Umsetzungsauftrag | Erledigt · `b47294a` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b01--eigenständiger-einstieg-und-kartenrahmen) |
| P1 | B02 · Kampf und Gold | Automatische Wellen, bezahlbare Käufe, Kernreset | B01 | Erledigt · `d10cb04` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b02--automatischer-kampf-und-bauwirtschaft) |
| P1 | B03 · Spielstand | Laufenden Kampf samt Wirtschaft konsistent wiederherstellen | B02 | Erledigt · `40dc019` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b03--konsistenter-spielstand-während-des-kampfes) |
| P1 | B04 · Farmen und Abwesenheit | Tragfähige Rückfallwelle, korrekte Offline-Zeit, ein schreibender Tab | B03 | Erledigt · `25e9a5f` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b04--sicheres-farmen-abwesenheit-und-tab-eigentümerschaft) |
| P2 | B05 · Startlichtung und Mara | Echter Wald, sichtbare automatische Unterstützung und bedienbares HUD | B04; Layout aus B01 | Erledigt · `884f7c4` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b05--startlichtung-mara-und-kompakte-bedienung) |
| P2 | B06 · Werkstatt und Frost | Erstes sichtbares Gebäude mit neuer taktischer Möglichkeit | B05 | Erledigt · `8a0a276` · [Nachweis](../../artifacts/idle-bastion/acceptance/90s/REPORT.md#b06--werkstatt-und-echte-frosttechnik) |
| P2 | B07 · Einstieg und Nachweise | Regulär spielbarer 90-Sekunden-Kreislauf samt kurzer Technikfolge | B06 | Erledigt · `8a0a276` · [Browserzeiten und drei Spielweisen](../../artifacts/idle-bastion/acceptance/90s/REPORT.md) |
| P2 | B07a · Spieloberfläche | Große Karte, Dock, Kontextaktionen und funktionale Hochkantansicht | Zusätzlicher Nutzerauftrag vor B08 | Abgeschlossen und veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/ui/REPORT.md) |
| P2 | B07b · Orientierung und HUD | Goldzufluss, Wellenrekord, nächstes Ziel, Versuchshistorie und stimmige warme Oberflächen | Zusätzlicher ausdrücklicher Nutzerauftrag am 17.10.2026 | Abgeschlossen und veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/ui/PROGRESS.md) |
| Halt | G1 · Nutzerabnahme | Ausdrückliche Entscheidung zur vorgelegten Fassung | B01–B07 sowie B07a/B07b geprüft | **Freigegeben · 18.10.2026** |
| P3 | B08 · Wisp und Turmrollen | Zweite Figur, Wirtschaftseffekt und vier unterscheidbare Türme | G1 freigegeben | Abgeschlossen · [Nachweis](../../artifacts/idle-bastion/acceptance/p3/B08.md) |
| P3 | B09 · Lager und Rückkehr | Zweites Gebäude und befriedigender Wiedereinstieg | B08 | Abgeschlossen |
| P4 | B10 · Erste Bossherausforderung | Lesbarer Boss verlangt die verfügbaren Turmrollen | B09 | Abgeschlossen · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/B10.md) |
| P4 | B11 · Wachsende Karte | Echte seitliche Freischaltung mit zwei nützlichen Turmplätzen | B10 | Abgeschlossen · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/B11.md) |
| P4 | B12 · Ausbau und Fortsetzung | Werkstatt II, spätere Level und Fortschritt nach Minute 15 | B11 | Abgeschlossen; B13-Balance offen |
| Zusatz | B12a · Freie Verteidigung | Wegstreifen, Fernzauber, Einführung, Siedlungsbau und Originaleffekte | Zusätzlicher Nutzerauftrag | Veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/REDESIGN.md) |
| P5 | B13 · Gesamter Spielverlauf | Gemessene 15-Minuten-Sitzung und Rückkehr mit legalen Aktionen | B12 | Nicht begonnen |
| P5 | B14 · Stabilität und Lieferung | Geprüfte Builds, Regression, Laufzeit und ehrlicher Ergebnisbericht | B13 | Nicht begonnen |
| Ende | G2 · Gesamtabnahme | Vollständiger Slice bewertet | B14 | **Offen** |

## B07a — Karte im Mittelpunkt

Am 17.10.2026 zusätzlich vor B08 beauftragt, einschließlich Commit, Push und bestehendem Playlink. Die anschließende Ergänzung umfasst eine funktionale Hochkantansicht; eine vollständige Geräteoptimierung ist nicht verlangt. Keine Freigabe für B08 daraus ableiten.

- [x] Karte großflächig, ohne äußeren Seitenrahmen oder dauerhafte Verwaltungsleiste darstellen; schmale Statusleiste und kompaktes Dock nach den Mockups.
- [x] Vorhandene Spielgrafiken im Bau-/Begleiterdock verwenden; Details bei Auswahl eines Turms, Bauplatzes oder Gebäudes einblenden.
- [x] Alle bisherigen Käufe, Forschung, Mara-Zuweisung, Pause, Rückkehr und Speicher-Recovery erreichbar halten.
- [x] Hochkant: lesbarer Kartenausschnitt, Ziehen, Übersicht und große Bauplatz-Schaltflächen; kein notwendiges Scrollen der gesamten Webseite.
- [x] Desktop und Hochkant tatsächlich ansehen, betroffene Bedienabläufe und vorhandenen Spielstand prüfen; echte Touch-Geräteprüfung von einer schmalen Browseransicht unterscheiden.
- [x] Screenshots und kurze Prüfnotizen ablegen, README-Galerie erweitern.
- [x] Committen, pushen und Testfassung veröffentlichen; öffentliche Oberfläche bestätigen.

## Historische UX-Vormerkungen — inzwischen durch B12a beauftragt

Am 17.10.2026 zusätzlich besprochen und auf Nutzerwunsch vorgemerkt. Diese Punkte erweitern B07a nicht und umgehen weder G1 noch eine spätere ausdrückliche Beauftragung. Priorität: zuerst Orientierung und verständliche Handlungen, danach Änderung des Figurenverhaltens. Die folgende historische Liste wird durch das beauftragte Paket B12a oben konkretisiert; dessen Checkliste führt den aktuellen Stand.

- [ ] **Werkstatt verständlich machen:** Zustand, nächste mögliche Handlung, Goldpreis und Nutzen bereits am Gebäude bzw. an seiner Karte vermitteln. Vor Reparatur „Werkstatt reparieren · 400 Gold“, danach Frostforschung mit Preis/Voraussetzung. Kein erneutes dauerhaftes Bauplatzschild unter einem fertigen Gebäude.
- [ ] **Mara: Ziel und Standort trennen:** Fernunterstützung eines bewusst gewählten Turms als mögliche Neugestaltung prüfen. Automatische Aktivierung bevorzugen; kein obligatorisches regelmäßiges Spell-Klicken. Reichweite, Zielwechsel, Abklingzeit, Farmnachweis und Save-Verhalten vor Umsetzung festlegen.
- [ ] **Mara-Effekt sofort lesbar:** Aktivierungsimpuls zum Turm, eindeutiger Effekt am Turm, verbleibende Wirkungsdauer und anschließende Abklingzeit am Porträt. Aktiver Bonus darf nicht nur aus einem Detailtext erkennbar sein.
- [ ] **Freie Figurenbewegung prüfen:** Charaktere sollen sich von Turmpositionen lösen können. Sinnvolle Ziele/Interaktionen definieren; reine Dekoration und spielwirksame Bewegung unterscheiden. Noch keine neuen Gebäude oder Nebenaktivitäten daraus ableiten.

## B07b — Fortschrittsorientierung und hochwertige Oberflächen

Die folgenden Informationsideen wurden nach der Diskussion ausdrücklich zur Umsetzung einschließlich Commit/Push freigegeben. Kleine dauerhaft sichtbare Zusammenfassung, ergänzende Details auf Abruf; Karte bleibt Hauptfläche. Maras Fernzauber und freie Bewegung gehören nicht zu diesem Paket.

- [x] Laufenden ungefähren Goldzufluss klar von sicherer Farmbasis und tatsächlicher Offline-Rate unterscheiden. Geglättete aktive Messzeit und normale Kampfbelohnungen verwenden; Käufe, Verkäufe, einmalige Freischaltboni und Offline-Claims nicht als wiederholbares Einkommen behandeln. Start-/Pausenzustand ehrlich beschriften.
- [x] Aktuelle Welle, Vorstoß/Farmen, höchste **besiegte** Welle und nächstes konkretes Freischaltziel verständlich zusammenführen. „Erreicht“, „besiegt“ und „sicher farmbar“ nicht gleichsetzen; auf Hochkant darf der nächste Schritt nicht allein in einem ausgeblendeten Desktopblock stehen.
- [x] Abrufbare Fortschrittsansicht: Versuche/Siege/Niederlagen je Welle, Farmdurchläufe getrennt von Vorstößen. Künftige Zähler transaktional speichern; bei alten Saves fehlende Historie als unbekannt ausweisen, niemals aus dem Rekord erfinden. Reload zählt nicht als neuer Versuch.
- [x] Figuren über Porträts, Freischaltbedingungen und aktuellen Auftrag erklären; bei zwei Figuren keinen zusätzlichen permanenten Mengenzähler einführen. Mehr Informationen erst beim Öffnen der Figurenübersicht.
- [x] Nach einer Niederlage erklären, welche Welle gescheitert ist, wo nun gefarmt wird und was erhalten bleibt. Nächste sinnvolle Handlung anbieten, ohne ein garantiert erfolgreiches Upgrade vorzutäuschen.
- [x] HUD, Dock und Kontextfenster als zusammengehörige warme Material-/Farbwelt gestalten; klare Typografie und Kontraste auf Desktop/Hochkant. Höchstens zehn zusätzliche Bilder erlaubt, nur bei tatsächlichem Bedarf.
- [x] Statistikmigration, Zählung und Goldzufluss gezielt prüfen; reale Desktop-/Hochkantansichten und vorhandenen Spielstand kontrollieren. Screenshots, Bericht, Commit/Push und GitHub-Pages-Prüfung abschließen.

Veröffentlicht: Code `2c96642`, einschließlich B07a `d0566cf`. [Pages-Lauf 39072783215](https://github.com/emfau88/TD/actions/runs/39072783215) erfolgreich; öffentliche Chronik, laufender Goldzufluss und Wellenfortschritt im Browser bestätigt. 131 Tests und Produktionsbuild bestanden. G1 bleibt offen.

Vergleichsbeispiele für die Diskussion: [The Tower: umschaltbare Währung/Ertragsanzeige und Welleninformationen (Community-Wiki)](https://the-tower-idle-tower-defense.fandom.com/wiki/Gameplay); [Bloons TD 6: höchste Runden in separater Profilstatistik (Entwicklernotizen)](https://store.steampowered.com/news/posts/?appgroupname=Bloons+TD+6&appids=960090&enddate=1709170182&feed=steam_community_announcements). Das sind Anregungen für die Informationshierarchie, keine Übernahme ihres Umfangs oder ihrer Wirtschaft.

## Aufwand der verbleibenden Pakete

Grobe relative Einschätzung nach B07, keine Termin- oder Freigabezusage. „Mittel“ bedeutet ein begrenzter Ausbau vorhandener Systeme; „groß“ mehrere zusammenwirkende Änderungen oder voraussichtlich mehrere Abstimmungsrunden. Das technische Fundament ist vorhanden, die vollständige 15-Minuten-Balance noch nicht.

| Paket | Einschätzung | Hauptaufwand / Unsicherheit |
| --- | --- | --- |
| B08 | Groß | Wisp, zwei neue Turmrollen, zusätzliche Gegnerrollen und Bauplatzfreigaben wirken auf Wirtschaft, Save und Farmbasis zusammen. |
| B09 | Mittel | Ein Lagerasset und verständliche Rückkehrvorschau; die bestehende Offline-Abrechnung muss die Verbesserung korrekt ab Kauf berücksichtigen. |
| B10 | Mittel | Vorhandenen Boss und Anzeigen integrieren; Schwierigkeit und reguläre Wiederholungsversuche abstimmen. |
| B11 | Groß | Echte Kartenerweiterung mit Kamera, Grafik, Figurenzugängen und zwei tatsächlich nützlichen Schusspositionen. |
| B12 | Mittel | Werkstatt-II-Ergänzung, höhere Level und Wellenkurve; die vorhandenen Grafikstufen lassen sich weiterverwenden. |
| B13 | Groß / variabel | Alle Meilensteine müssen im tatsächlichen 15-Minuten-Verlauf zusammenpassen; Balancekorrekturen können mehrere betroffene Systeme berühren. |
| B14 | Mittel bis groß | Save-Export/Import, gezielte Speicher-/Offline-Regression, längerer Betrieb und reproduzierbare Lieferung; Aufwand hängt von den Befunden ab. |

Für B08–B12 möglichst pro Paket eine sichtbare spielbare Verbesserung liefern und betroffene Regeln gezielt prüfen. B13/B14 bündeln die notwendigen Gesamtdurchläufe; nicht nach jedem kleinen Grafikfix die komplette Matrix wiederholen. Der bestehende G1-Halt bleibt verbindlich.

## P0 — Planung: erledigte Grundlagen

- [x] Aktuellen Spielstrang unter `reference/src/` und abgenommene Waldkarte identifiziert; älteren Entwurf im Stammordner abgegrenzt.
- [x] Isolierten Branch und Worktree auf dokumentiertem Ausgangscommit angelegt.
- [x] [Auftrag](README.md), [Technik](docs/TECHNIK.md), [Grafikvertrag](docs/ART_DIRECTION.md), [Abnahmeplan](docs/ABNAHME.md) und [Arbeitsregeln](AGENTS.md) abgelegt.
- [x] Beide gelieferten Mockups unverändert und dauerhaft als Konzeptreferenzen gesichert.
- [x] Verbindliche 90-Sekunden-Zwischenabnahme sowie Arbeitspakete mit Abhängigkeiten und Abschlusskriterien definiert.

Vorbefund aus der vorangegangenen Analyse: 54 Root- und 58 Referenztests sowie beide TypeScript-Prüfungen bestanden. Das ist kein neuer Build-/Prüfnachweis dieser Planungsänderung. Die klassische Speicherung funktioniert nur in Bauphasen; es gibt drei grafische Turmstufen und keine fertigen Werkstatt-/Lagersprites im Builder-Pack.

## P1 — Kleine technische Grundlage

### B01 — Isolierter Einstieg und maßstäblicher Kartenrahmen

**Ergebnis:** Eine separat startbare und baubare Idle-Anwendung sowie ein geprüftes neutrales Startlayout. Keine fertige Spielprogression.

- [x] Branch, Arbeitsverzeichnis und Abhängigkeiten prüfen; im neuen Worktree fehlende ignorierte Dateien nicht als Quellverlust behandeln.
- [x] Eigenen Einstieg, Build, Konfiguration und Testaufruf einrichten. Geplant: `npm run idle:dev`, `idle:build`, `idle:test`; erst nach Einrichtung als ausführbar dokumentieren.
- [x] Übernommene Kampf-/Darstellungsmodule und Herkunft festhalten; klassische Spielregeln, Startdateien und Save-Keys schützen.
- [x] Instanzabhängige 40er-Zellen, 28×16-Startregion und späteres Flächenbudget bis 36×16 vorsehen. Keine globale Änderung alter Kartenkonstanten.
- [x] Neutrale Layoutprobe mit Kern/Pfadende, Werkstattgrundstück, vier aktiven Turmplätzen und Figurenzugängen bei 1366×768 und 1920×1080 ansehen.
- [x] Erste Gegner, Startturm, Mara-Position, Kern und Werkstattplatz ohne notwendiges Scrollen unterbringen; künftige östliche Turmplätze müssen den letzten Wegabschnitt erreichen können.

**Fertig, wenn:** Start und Build wirklich laufen, die Ausgangsgeometrie plausibel ist und keine Änderungen am klassischen Spiel erforderlich waren oder unbemerkt eingeflossen sind. Layoutprobe ist kein fertiger Screenshotnachweis des späteren Spiels.

### B02 — Automatischer Kampf und echte Bauwirtschaft

**Voraussetzung:** B01. **Ergebnis:** Ein legal spielbarer technischer Kampfkreislauf bei 1×.

- [x] Geschützten Waldwächter und reguläres Startgold anlegen; Startturm nicht verkauf-/verschiebbar machen.
- [x] Gegner, Zielwahl, Projektile, Schaden und 1×-Simulationsschritte aus bewährten Regeln übernehmen.
- [x] Wellen automatisch starten und fortsetzen; jeden neuen Versuch mit 20/20 Kernleben, frischer Gegnerwarteschlange und ohne alte Projektile beginnen.
- [x] Bauen, Level-1–3-Upgrades und zulässigen Verkauf aus dem echten Goldsaldo bezahlen; bestätigte Kills und Wellenabschlüsse genau einmal verbuchen.
- [x] Levelzahl und Grafikstufe trennen; Reichweiten-/Feuerratengrenzen und Preis-/Belohnungsdaten an zentraler Stelle festlegen.
- [x] Einstiegspfad und erste Welle so prüfen, dass allein der geschützte Startturm eine sichere Grundlage trägt; keine bloß behauptete Mindestrate einsetzen.

**Fertig, wenn:** Automatische Kämpfe Geld verdienen, reguläre Käufe den Kampf verändern, Wellen sauber wechseln und die reine Simulation ohne Phaser prüfbar bleibt. Niederlage ist ein definierter Zustand für B04, keine Löschung des Fortschritts.

### B03 — Konsistenter Spielstand während des Kampfes

**Voraussetzung:** B02. **Ergebnis:** Reload setzt Kampf, Geld und Käufe widerspruchsfrei fort.

- [x] Eigenen versionierten IndexedDB-Spielstand gemäß Technikvertrag anlegen; klassische Daten weder lesen noch ersetzen.
- [x] Türme, Gegner, Projektilwerte, Spawnfortschritt, IDs, Timer und Wirtschaft in einen serialisierbaren Zustand überführen.
- [x] Wirtschaftliche Änderungen atomar speichern und erst nach Commit bestätigen; asynchrone Schreibvorgänge in gültiger Reihenfolge abarbeiten.
- [x] Regelmäßige Kampfsnapshots ergänzen; noch unbestätigte reine Simulationsschritte dürfen bei hartem Abbruch begrenzt zurückspringen.
- [x] Reload nach Kill/Kauf, während einer Welle und vor Niederlage prüfen; bereits abgefeuerte Geschosse verkaufter Türme korrekt rekonstruieren.
- [x] Ungültige oder unbekannt neuere Saves schützen, bekannte Versionen kontrolliert behandeln; Schreibfehler verständlich anzeigen statt Speichern vorzutäuschen.

**Fertig, wenn:** Bestätigte Ressourcen und Käufe erhalten bleiben, keine Belohnung beim Restore erneut entsteht und deterministische Fortsetzung mit/ohne Reload übereinstimmt. Export/Import ist spätestens in B14 vollständig nachzuweisen.

### B04 — Sicheres Farmen, Offline-Zeit und Tab-Eigentümerschaft

**Voraussetzung:** B03. **Ergebnis:** Niederlage und Abwesenheit erzeugen einen verlässlichen, nachvollziehbaren Fortschritt.

- [x] Nach Niederlage auf eine gültige sichere Farmwelle wechseln; erneuten Vorstoß per Button am Wellenübergang beginnen und danach automatisch fortsetzen.
- [x] Farmnachweis nach realem autonomem Sieg durch zwei konservative Prüfläufe ohne Mara-Bonus bestätigen; Erstbesiegs-/Bossboni ausschließen und Zykluspausen einrechnen.
- [x] Relevante Änderungen entwerten Zertifikate; ohne Nachweis Welle 1 live spielen können und Offline-Rate zunächst null anzeigen.
- [x] Einen schreibenden Tab mit Eigentümerschaft und Writer-Epoche sichern; zweiter Tab, Leaseübernahme und später erwachender alter Tab dürfen kein Gold duplizieren oder neue Saves überschreiben.
- [x] Aktive Simulation, Hintergrundzeit, Suspend und ausdrückliche Pause eindeutig trennen. Pause bleibt gespeichert und erzeugt keine Offline-Produktion.
- [x] 60 % / 2 Stunden, unveränderlichen Abrechnungscursor und einmalige ausstehende Belohnung umsetzen; Reload, Doppelklick, negative Zeit und große Uhrsprünge prüfen.
- [x] Die P1-Fassung tatsächlich starten, Kampf/Farmen/Reload/Abwesenheit demonstrieren und verbleibende technische Grenzen dokumentieren.

**Fertig, wenn:** Keine Niederlagenschleife, kein doppelter Zeitraum und kein zweiter wirtschaftlich aktiver Tab entsteht. Der technische Kreislauf funktioniert; damit ist noch kein gutes Spielgefühl abgenommen.

## P2 — Der erste vollständige Spielkreislauf

### B05 — Startlichtung, Mara und kompakte Bedienung

**Voraussetzung:** B04; Layout aus B01. **Ergebnis:** Der Nutzer startet direkt in die echte Waldansicht und versteht die wichtigsten Eingriffe.

- [x] Eigene Waldvariante im Originalmaßstab zusammensetzen; Weg und Kern enden sichtbar konsistent, Gebäudegrundstück und Zugänge bleiben frei.
- [x] Mara von Anfang an darstellen und dem Startturm zuweisen; Anreise, Übertakten und automatische Wiederholung bei 8 Sekunden Wirkung / 30 Sekunden Cooldown ab Aktivierung integrieren.
- [x] Mara-Neuzuweisung, unzugängliche Ziele und Verkauf ihres Zielturms behandeln; Position, Weg, Wirkzeit und Cooldown durch Reload erhalten und die konservative Farmprüfung erneut prüfen.
- [x] Gold, sichere Farmbasis, Welle, Kernleben, Vorstoß/Farmen und ein nächstes Ziel anzeigen; keine volle spätere Menüleiste im Einstieg.
- [x] Turmbau, Auswahl, Upgrade, Verkauf und Pause verständlich bedienen; Kamerabewegung und Bauklick sauber trennen.
- [x] Alte dekorative Wisp-Baueffekte entfernen oder passend ersetzen, damit Wisp vor seiner Freischaltung nicht erscheint.
- [x] Startansicht und Bedienung in beiden Desktopauflösungen im Browser prüfen; alle Einstiegsziele ohne Kamerasuche erreichbar halten.

**Fertig, wenn:** Die Startansicht tatsächlich lebt, Mara ohne Dauerklicken unterstützt und der Spieler eine bezahlbare Aktion erkennt. Die ersten Käufe funktionieren mit echter Wirtschaft und Speicherung.

### B06 — Erste Werkstatt und sichtbar wirksame Technologie

**Voraussetzung:** B05. **Ergebnis:** Die Karte verändert sich durch ein Gebäude, das eine neue Kampfmöglichkeit eröffnet.

- [x] Grundstück, Silhouette, Anker, Referenzbilder und benötigte Zustände vor Assetproduktion nach Grafikvertrag festlegen.
- [x] Nur beschädigte Werkstatt und Werkstatt I produzieren/aufbereiten; Rohquelle, Prompt, Referenzen und technische Metadaten sichern.
- [x] Gebäude neben Originalturm, Baum und Mara bei echter Spielgröße prüfen; kurze Bauwirkung ohne fremden Stil und ohne vorzeitig auftauchenden Wisp integrieren.
- [x] Werkstatt gegen reguläres Gold bauen; Bauzustand, Grundstück und Freischaltungen korrekt speichern.
- [x] „Frostfassung“ gegen Gold kaufen: Frostkristall und Level 4–6 freischalten; Frostwirkung im tatsächlichen Kampf zeigen.
- [x] Baupreise, Erträge und Folgekäufe gemeinsam abstimmen: Werkstatt nach etwa 60–90 Sekunden, erste Technik samt nutzbarem Frostturm in kurzer Fortsetzung bis ungefähr 150 Sekunden erreichbar.

**Fertig, wenn:** Die Werkstatt sichtbar und stilistisch passend entsteht, eine erkennbare taktische Folge hat und nicht nur ein Menüeintrag bleibt. Lager, Werkstatt II und spätere Assets bleiben unproduziert.

### B07 — Live-Tutorial, Balance und Zwischenabnahme vorbereiten

**Voraussetzung:** B06. **Ergebnis:** Eine selbst startbare Fassung mit nachgewiesenem ersten Spielkreislauf.

- [x] Kurze Mara-Hinweise und ein aktuelles Ziel für Kampf, eigenen Turm, Upgrade, Werkstatt und Frostfassung an tatsächliche Ereignisse binden.
- [x] Skip, zustandsbezogenes Wiederanzeigen, bereits erledigte Schritte, alternative Turmplätze und Reload prüfen; keine zusätzlichen Ressourcen durch Tutorialwiederholung.
- [x] Einen echten frischen 1×-Durchlauf mit Zeitprotokoll spielen: erste Gegner/Schüsse, erstes Gold, eigener Turm bis 20 Sekunden, Upgrade und Werkstatt bei etwa 60–90 Sekunden.
- [x] Erste Technologie und Frostwirkung nur als kurze Fortsetzung bis etwa 120–150 Sekunden nachweisen; die Zielzeit nicht durch feste Geschenk-Timer erzwingen.
- [x] Drei Spielweisen prüfen: Tutorial folgen, anders investieren, drei Minuten zuschauen und dann weiterspielen. Unterschiedliches Tempo zulassen, Sackgassen beheben.
- [x] Speicherung/Farming mit dieser echten Anfangsverteidigung erneut gezielt prüfen, einschließlich Mara und Frost; nur betroffene Prüfungen wiederholen.
- [x] Startanleitung, konkrete Fassung, echte Screenshots, gemessene Zeiten und die drei wichtigsten Schwächen zur Nutzerprobe vorlegen.

**Fertig, wenn:** Die Fassung startbar ist, der Ablauf nachvollziehbar funktioniert und alle Nachweise samt Abweichungen vorliegen. Das Paket fertigzustellen ist noch keine Nutzerfreigabe.

## G1 — Verbindlicher Halt: 90-Sekunden-Zwischenabnahme

**Status: FREIGEGEBEN am 18.10.2026. Aktueller Auftrag: B08 mit möglichst kompakten Tests.**

- [x] B01–B07 nachgewiesen; keine wesentlichen offenen Speicher-/Farmfehler in der vorgelegten Fassung.
- [x] Startbare Probe, Commit, Screenshots, Zeitprotokoll und Ergebnisse der drei Spielweisen bereitgestellt.
- [x] Spielgefühl selbst kritisch beurteilt: verständliche Entscheidungen, spürbare Verbesserungen, wenig Leerlauf, Werkstatt als echter Fortschritt und stimmiger Maßstab.
- [x] Nutzer konnte die konkrete Fassung beurteilen; verlangte Änderungen innerhalb P2 umgesetzt und bei Bedarf erneut vorgelegt.
- [x] **Ausdrückliche Nutzerfreigabe erhalten und hier dokumentiert.** Dieses Kästchen darf nur aufgrund der tatsächlichen Nutzerentscheidung gesetzt werden.

| Freigabenachweis | Eintrag |
| --- | --- |
| Geprüfte Fassung / Commit | `8a0a276` · [Playlink](https://emfau88.github.io/TD/idle-bastion/) · [Bericht](../../artifacts/idle-bastion/acceptance/90s/REPORT.md) |
| Datum und Chatbezug | 18.10.2026 · ausdrückliches Go zum nächsten Bulk B08 nach Veröffentlichung des Premium-HUD |
| Wortlaut / Entscheidung | „Ok go, halte deine Tests so kompakt und klein wie möglich“ — Antwort auf den vorgeschlagenen B08-Durchlauf einschließlich G1-Freigabe. |
| Offene Auflagen | Kompakte, gezielte Prüfungen. B09 und folgende nicht Teil dieses Durchlaufs; keine Behauptung einer erneuten gemessenen Nutzerprobe. |

Historische Halteregel bis zur obigen G1-Freigabe: Während des Wartens nur P2 prüfen und korrigieren. Kein Wisp, Lager, Boss, Werkstatt II oder freischaltbare Erweiterung vorziehen und keine entsprechenden Assets auf Vorrat erzeugen. Zeitablauf, erfolgreiche Tests und allgemeine Entwicklungsautonomie ersetzen die Freigabe nicht.

## P3 — Frühe Siedlung und Rückkehr

### B08 — Wisp, weitere Turmrollen und Bauplätze

**Status: ABGESCHLOSSEN.** [Prüfung und echte Aufnahmen](../../artifacts/idle-bastion/acceptance/p3/B08.md).

**Voraussetzung:** G1 ausdrücklich freigegeben. **Ergebnis:** Zweite Figur und weitere Turmrollen verändern die Entscheidungen des Spielers.

- [x] Abgenommenen Einstieg beibehalten; relevante Balanceänderungen gegen seine gemessenen Zeiten prüfen.
- [x] Wisp nach Frostfassung und Welle 5 etwa bei Minute 2–4 freischalten; vorhandene Figur verwenden, keine Charakterlevel einführen.
- [x] 10 % Bonus auf wiederholbare Gegner-/Wellenbelohnungen korrekt und genau einmal vergeben; sichtbaren Auftrag ohne Sammelzwang darstellen.
- [x] Steinschleuder bei Wisp-Freischaltung und Scharfschütze nach Welle 10 anbieten; passende Gegnerrollen ohne unerwartete unlösbare Sperre einführen.
- [x] Je zwei weitere Startregion-Turmplätze nach Welle 5 und 10 öffnen und speichern.
- [x] Tutorial, Save und Farmzertifikate um die tatsächlichen Freischaltungen ergänzen; Wisps Bonus nicht ein zweites Mal auf Offline-Erträge anwenden.

**Fertig, wenn:** Vier unterscheidbare Turmrollen nutzbar sind und Wisps automatischer Nutzen sichtbar und messbar ist.

### B09 — Vorratslager und befriedigende Rückkehr

**Status: ABGESCHLOSSEN UND VERÖFFENTLICHT.** Nutzerauftrag: „Nächster Bulk“ nach veröffentlichtem B08. Ein benötigtes Lagerasset ist Teil dieses Pakets.

**Voraussetzung:** B08. **Ergebnis:** Ein zweites sichtbares Gebäude verbessert die nächste Spielsitzung.

- [x] Nur benötigtes Lagerasset nach Grafikvertrag produzieren, in Spielgröße neben der Werkstatt prüfen sowie Herkunft, Aufbereitung und Nutzung dokumentieren.
- [x] Lager nach Wisp und Welle 8 gegen Gold etwa bei Minute 4–6 bauen; Grundstück und Figurenwege freihalten.
- [x] Offline-Werte ab Kauf auf 65 % / 8 Stunden erhöhen; keine rückwirkende Verbesserung vergangener Abwesenheit.
- [x] Sichere Basis, Effizienz, Limit und Ein-Stunden-Beispiel verständlich anzeigen; Tutorialhinweis ohne lange Unterbrechung.
- [x] Kontrolliert nachgestellte Ein-Stunden-Abwesenheit mit regulär erspieltem Stand abrechnen und danach real weiterspielen; sinnvolle Käufe und erhaltene Fortschrittsbedingungen nachweisen.
- [x] Abwesenheit über acht Stunden, wiederholte Rückkehr vor Claim und Lagerwerte nach Reload prüfen; kein erneuertes Limit allein durch Öffnen des Dialogs.

**Veröffentlichung:** Codecommit `34382cc`, [Pages-Lauf 39080652213](https://github.com/emfau88/TD/actions/runs/39080652213) erfolgreich. Öffentlicher Playlink mit geladenem Lagerasset und erklärter Kaufsperre vor Wisp/Welle 8 geprüft.

**Nachweis:** [B09-Bericht mit echtem Kauf, Rückkehrprüfung und Desktop-/Hochkantaufnahmen](../../artifacts/idle-bastion/acceptance/p3/B09.md).

**Fertig, wenn:** Lager und Rückkehr einen verständlichen Vorteil bringen, ohne die Anfangsprogression oder die Abrechnungsregeln zu umgehen. Kein zusätzlicher verpflichtender Nutzerhaltepunkt.

## P4 — Boss, Kartenwachstum und weiterer Ausbau

### B10 — Erste Bossherausforderung

**Status: ABGESCHLOSSEN UND VERÖFFENTLICHT.** Am 18.10.2026 mit „Go b10“ beauftragt. Auf den anschließenden Nutzervorschlag hin ersetzt Succubus „Rosenspiegel“ die geplante Magmakrabbe: angekündigte Turmverführung, durch Frost unterbrechbar, plus kleine gepanzerte Begleitgruppe. Vorhandene Assets; keine zusätzliche Grafikproduktion.

**Voraussetzung:** B09. **Ergebnis:** Eine lesbare Herausforderung belohnt die verfügbaren Turmkombinationen.

- [x] Vorhandene Succubus „Rosenspiegel“ als Boss in Welle 15 samt kleiner Begleitgruppe konfigurieren; kein neues umfangreiches Grafikpaket erzeugen.
- [x] Bossankündigung, Lebensanzeige und nachvollziehbare Wirkung von Frost, Fläche und Rüstungsdurchdringung zeigen.
- [x] Zielbereich etwa Minute 7–10 mit legaler Verteidigung prüfen; bei Scheitern sichere Farmphase und bewussten neuen Vorstoß ermöglichen.
- [x] Erstbesiegung und spätere Wiederholungsbelohnungen sauber trennen; Bosswellen nicht als sichere Offline-Farmbasis verwenden.
- [x] Gespeicherter Bossfortschritt übersteht Reload; unterbrochener Kampf vergibt keinen vorzeitigen Sieg.

**Fertig, wenn:** Ein regulärer erster Bosssieg möglich, verständlich und als Meilenstein gespeichert ist.

[Gezielte Prüfung und echte Screenshots](../../artifacts/idle-bastion/acceptance/p4/B10.md). Umsetzung `c22494e`; [Pages-Lauf 39082715325](https://github.com/emfau88/TD/actions/runs/39082715325) erfolgreich. Öffentlicher Playlink mit Bundle `battle-DumR7ptg.js`, laufendem Kampf und Rosenspiegel-Abschnitt in der Chronik geprüft.

### B11 — Scrollbare Lichtung mit tatsächlichem Nutzen

**Voraussetzung:** B10; geometrische Vorbereitung aus B01. **Ergebnis:** Die bestehende Welt wird sichtbar größer und sinnvoll nutzbar.

- [x] Nach Boss 15 und Goldkauf eine östliche Lichtung öffnen, Ziel etwa Minute 8–11; maximal acht zusätzliche Spalten, keine neue Region.
- [x] Genau zwei neue Turmplätze nahe der westlichen Erweiterungskante anlegen; echte Schussfenster auf den vorhandenen letzten Wegabschnitt prüfen.
- [x] Gegnerpfad und Kern während Freischaltung nicht verschieben; keine zweite Angriffsfront oder hinter dem Kern weiterlaufenden Gegner erzeugen.
- [x] Waldkante sichtbar freilegen und Kameragrenzen erweitern, ohne sämtliche Objekte zu verkleinern; nur benötigte Dekoration ergänzen.
- [x] „Lichtung ansehen“ anbieten, keinen überraschenden Kamerasprung erzwingen; HUD und Rückkehr-zur-Verteidigung bleiben bedienbar.
- [x] Gesperrte Plätze vor Freischaltung zurückweisen; Freischaltung, Bauplätze, Figurenzugänge und Kameraverhalten nach Reload, im Kampf und bei beiden Viewports prüfen.

**Entscheidung und Nachweis:** Vier zusätzliche Spalten auf 32×16, einmalig 900 Gold nach echtem Boss-15-Sieg. Im legalen Modellablauf nach 9:42 Minuten geöffnet. [Gezielte Prüfung und Desktop-/Hochkantaufnahmen](../../artifacts/idle-bastion/acceptance/p4/B11.md).

**Fertig, wenn:** Der Nutzer tatsächlich in einen neuen Abschnitt scrollt und dessen Turmplätze taktisch helfen. Eine größere leere Karte oder Plätze außerhalb der Reichweite erfüllen das Paket nicht.

**Veröffentlichung:** Codecommit `cd71fba`, [Pages-Lauf 39142819226](https://github.com/emfau88/TD/actions/runs/39142819226) erfolgreich. Öffentlicher Playlink mit finalem Bundle, übernommenem Altstand und neuem Lichtungsmenü geprüft. B12 nicht begonnen.

### B12 — Werkstatt II und Fortschritt nach Minute 15

**Voraussetzung:** B11. **Ergebnis:** Sichtbarer weiterer Ausbau und ein erreichbares nächstes Ziel.

- [x] Werkstatt II nach Lichtung und Goldkauf etwa bei Minute 10–13 zugänglich machen; kleinen sichtbaren Anbau im bisherigen Maßstab ergänzen, Herkunft dokumentieren und Gebäudestufe nach Reload prüfen.
- [x] Level 7–20 freischalten; erste 15 Minuten auf ungefähr Level 1–10 ausrichten, spätere Level als normale Schadensupgrades ohne neue Fähigkeiten/Grafikstufen.
- [x] Zahlenlevel und vorhandene drei Grafikstufen korrekt zuordnen; Reichweite und Feuerrate innerhalb der festgelegten Grenzen halten.
- [x] Zweiten Boss um Welle 25 als nahes oder erreichtes Ziel bei etwa Minute 13–15 anbieten.
- [x] Weitere Wellen datengetrieben skalieren und Farmen stabil erhalten; Gegner-/Projektilmenge und Zahlenbereiche begrenzen.
- [x] Nächstes wirklich erreichbares Upgrade anzeigen; keine aktive Quest für ein nicht implementiertes Zukunftsgebäude ausgeben.

**Fertig, wenn:** Die Siedlung nochmals sichtbar wächst und nach Minute 15 ohne künstliches Ende sinnvoll weitergespielt werden kann.

**Nachweis:** [B12-Bericht und echte Spielaufnahmen](../../artifacts/idle-bastion/acceptance/p4/B12.md). Gezielter Modellverlauf mit verdientem Gold: Werkstatt II bei 13:01; nach 15 Minuten Rekord 20 und ein konkreter nächster Kauf. Welle 25 ist dabei als nächstes Bossziel sichtbar, nicht bereits besiegt. Gesamtabstimmung und vollständige 15-Minuten-Browserabnahme folgen in B13; keine G2-Abnahme behauptet.

**B12 veröffentlicht:** Codecommit `c40864c`, [Pages-Lauf 39147533177](https://github.com/emfau88/TD/actions/runs/39147533177) erfolgreich. Öffentliches Bundle `battle-CqIGhtYi.js`, übernommener Altstand und getrennte Bosschronik bestätigt.

## P5 — Gesamterlebnis, Stabilität und Lieferung

### B13 — Vollständiger legaler Verlauf und Balancekorrektur

**Voraussetzung:** B12. **Ergebnis:** Ein gemessener Spielverlauf statt lediglich vorhandener Einzelmechaniken.

- [ ] Einen echten 15-Minuten-Durchlauf im Browser mit frischem Save, regulären Aktionen und 1× durchführen; Ladezeit getrennt erfassen.
- [ ] Tatsächliche Zeiten für Werkstatt, Frostfassung, Wisp, Lager, Boss, Lichtung und Werkstatt II protokollieren und gegen den Auftrag prüfen; den abgenommenen Einstieg nach späteren Balanceänderungen gezielt erneut verifizieren.
- [ ] Fortschritt über die Sitzung verteilen; unnötige Wartezeiten, unklare Ziele und bedeutungslose Käufe beheben.
- [ ] Alternative Investitionen und anfängliches Zuschauen mit dem vollständigen System auf Sackgassen prüfen; die Varianten müssen nicht gleich schnell sein.
- [ ] Rückkehrsitzung aus regulärem Fortschritt weiterführen; simulierte Abwesenheit ausdrücklich kennzeichnen und echte nachfolgende Käufe zeigen.
- [ ] Drei wichtigste spielerische Schwächen benennen; nach Änderungen nur betroffene Prüfungen wiederholen, keinen simulierten Durchlauf als Echtzeitplaytest ausgeben.

**Fertig, wenn:** Der Verlauf nachgewiesen und verständlich ist, mehrere spürbare Erfolge bietet und wesentliche Balanceprobleme behoben oder ausdrücklich offengelegt sind. Fehlender Echtzeitdurchlauf bleibt ein offener Nachweis.

### B14 — Regression, Langzeitbetrieb und prüfbare Lieferung

**Voraussetzung:** B13. **Ergebnis:** Reproduzierbar startbarer, technisch geprüfter Slice mit ehrlichen Grenzen.

- [ ] Vollständige Speicher-/Offline-Matrix aus dem Abnahmeplan einschließlich zwei Tabs, Suspend, abgebrochener Claims und Speicherfehler abschließen.
- [ ] Validierten Save-Export/Import fertigstellen und prüfen; fremde/defekte Daten abweisen, gültigen Stand nicht ohne bewusste Bestätigung ersetzen.
- [ ] Bestehende Tests, TypeScript, Idle-Build und betroffene klassische Builds prüfen; heutige Waldversion zusätzlich im Browser öffnen. Historische JSDOM-Tests sind kein visueller Nachweis.
- [ ] Mindestens 30 Minuten ununterbrochenen Browserbetrieb plus längere beschleunigte Modellprüfung durchführen; Last, Browser, Gerät, Speicher sowie Objekt-/Eventgrenzen dokumentieren.
- [ ] Separaten Idle-Build und möglichst eigenständiges HTML tatsächlich öffnen; gültige Startbefehle sowie Origin-/Dateipfadgrenzen der Speicherung dokumentieren.
- [ ] Echte Screenshots aus erster Minute, Werkstatt, ungefähr Minute 15 und geöffneter Lichtung liefern; Grafikquellen und verwendete Assets nachvollziehbar zuordnen.
- [ ] Technischen Bericht, Testbericht und offene Punkte mit Status vollständig/teilweise/vorbereitet/nicht begonnen ablegen; keine ungefragte Vorschauveröffentlichung.

**Fertig, wenn:** Die Fassung reproduzierbar prüfbar ist, das klassische Spiel funktionsfähig bleibt und Leistungs-/Speichergrenzen mit tatsächlichen Ergebnissen beschrieben sind.

## G2 — Vollständigen Slice bewerten

**Status: OFFEN.**

- [ ] B08–B14 mit Nachweisen abgeschlossen; verbleibende Einschränkungen ausdrücklich genannt.
- [ ] Spielbarer Build, Zeitverlauf, Rückkehrnachweis, technische Berichte und echte Screenshots bereitgestellt.
- [ ] Kritische Bewertung beantwortet: neugieriger Einstieg, verständliche Entscheidungen, befriedigende Upgrades, Wartezeiten, Beitrag der Siedlung, Motivation nach 15 Minuten und drei größte Schwächen.
- [ ] Nutzerentscheidung zur konkreten Fassung dokumentiert; technische Prüfung und Nutzerabnahme getrennt ausgewiesen.

Die Gesamtabnahme erlaubt nicht automatisch zusätzliche Spielphasen, Kongregate-Anbindung, Veröffentlichung oder Merge nach `main`.

## Abschlussnachweis und Übergabe

Keine separate Datei pro Checkbox anlegen. Ein kurzer Bericht pro Phase genügt, mit Abschnitten für die Pakete. Empfohlene Ablage im Repository: `artifacts/idle-bastion/acceptance/`. Die Nutzerproben liegen unter `90s/REPORT.md` und `15min/REPORT.md`; diese Dateien erst bei tatsächlicher Umsetzung anlegen.

Für jedes abgeschlossene Paket im Bericht festhalten:

- Ergebnis und zugehöriger Commit; was jetzt wirklich funktioniert.
- Tatsächlich ausgeführte Prüfungen mit Ergebnis und gegebenenfalls Screenshot/Startbefehl.
- Offene Fehler, nicht geprüfte Annahmen und Änderungen an Balance-/Layoutwerten.
- Nächstes zulässiges Paket oder erforderliche Nutzerentscheidung.

**Nach Unterbrechung:** zuerst dieses Board und den letzten Bericht lesen. Aktuelles Paket, offene Checkboxen und Freigabestatus prüfen; bereits abgeschlossene Arbeit nicht erneut beginnen. Ein funktionierender Teil eines Pakets darf als Teilfortschritt gemeldet werden, ohne das Gesamtpaket fertigzusetzen.

## Entscheidungsprotokoll

| Datum | Entscheidung |
| --- | --- |
| 17.10.2026 | Überarbeiteten Markdown-Auftrag und Roadmap im neuen Branch angelegt; Spielimplementierung noch nicht beauftragt |
| 17.10.2026 | Kompakter Start, schrittweise wachsende scrollbare Karte und genau eine Erweiterung im Slice |
| 17.10.2026 | Verbindliche Nutzer-Zwischenabnahme nach den ersten 90 Sekunden; kurze Technologievorführung bis etwa 150 Sekunden gehört dazu |
| 17.10.2026 | Feste Turmplätze, manuelle Käufe/neuer Vorstoß, 1×, Kernreset, konservatives Farming und atomarer Kampfsave festgelegt |
| 17.10.2026 | Roadmap zu 14 prüfbaren Arbeitspaketen mit Checklisten und Abschlusskriterien ausgebaut; Funktionsumfang und Freigabegrenzen bleiben gleich |

| 17.10.2026 | B01 umgesetzt und geprüft; Nutzer beauftragt anschließend ausdrücklich B02 |


| 17.10.2026 | B02 umgesetzt und geprüft; Nutzer beauftragt anschließend ausdrücklich B03 |

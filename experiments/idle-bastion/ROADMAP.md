# Roadmap und Arbeitschecklisten — SPIRE: Idle Bastion

Stand: 17.10.2026 · **Planung fertig; Spielimplementierung noch nicht begonnen.**

Diese Datei ist das Arbeitsboard: Phasen geben die Reihenfolge vor, Arbeitspakete bündeln ein prüfbares Ergebnis, Checklisten machen die verbleibende Arbeit sichtbar. Die verbindlichen Spielregeln stehen im [Auftrag](README.md), technische Einzelheiten in [TECHNIK.md](docs/TECHNIK.md), Grafikregeln in [ART_DIRECTION.md](docs/ART_DIRECTION.md) und Prüfszenarien in [ABNAHME.md](docs/ABNAHME.md).

## Aktueller Stand

| Feld | Stand |
| --- | --- |
| Branch | `codex/idle-bastion-vertical-slice` |
| Ausgangscommit | `5667aaeda3140e2797532894c524a32eb10af1cc` |
| Ablage | `experiments/idle-bastion/` im eigenen Worktree |
| Autorisierter Umfang | Planungsunterlagen verbessern; keine Spielimplementierung oder Assetgenerierung |
| Aktives Umsetzungspaket | Keines |
| Nächster Schritt | B01, erst nach ausdrücklichem Umsetzungsauftrag |
| G1: 90-Sekunden-Zwischenabnahme | **Offen; keine Nutzerfreigabe vorhanden** |
| G2: vollständiger Slice | **Offen; keine Nutzerfreigabe vorhanden** |

Vorhandene klassische Spielfunktionen zählen nicht als fertige Idle-Funktionen. B01–B14 sind vollständig offen. Der Zustand der Pakete und tatsächliche Freigaben werden ausschließlich hier geführt; Fachdateien beschreiben Regeln, keine konkurrierenden Fortschrittsstände.

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
| P1 | B01 · Eigenständiger Einstieg | Leere Idle-Anwendung separat start- und baubar, Kartenrahmen festgelegt | Umsetzungsauftrag | Nicht begonnen |
| P1 | B02 · Kampf und Gold | Automatische Wellen, bezahlbare Käufe, Kernreset | B01 | Nicht begonnen |
| P1 | B03 · Spielstand | Laufenden Kampf samt Wirtschaft konsistent wiederherstellen | B02 | Nicht begonnen |
| P1 | B04 · Farmen und Abwesenheit | Tragfähige Rückfallwelle, korrekte Offline-Zeit, ein schreibender Tab | B03 | Nicht begonnen |
| P2 | B05 · Startlichtung und Mara | Echter Wald, sichtbare automatische Unterstützung und bedienbares HUD | B04; Layout aus B01 | Nicht begonnen |
| P2 | B06 · Werkstatt und Frost | Erstes sichtbares Gebäude mit neuer taktischer Möglichkeit | B05 | Nicht begonnen |
| P2 | B07 · Einstieg und Nachweise | Regulär spielbarer 90-Sekunden-Kreislauf samt kurzer Technikfolge | B06 | Nicht begonnen |
| Halt | G1 · Nutzerabnahme | Ausdrückliche Entscheidung zur vorgelegten Fassung | B01–B07 geprüft | **Offen** |
| P3 | B08 · Wisp und Turmrollen | Zweite Figur, Wirtschaftseffekt und vier unterscheidbare Türme | G1 freigegeben | Nicht begonnen |
| P3 | B09 · Lager und Rückkehr | Zweites Gebäude und befriedigender Wiedereinstieg | B08 | Nicht begonnen |
| P4 | B10 · Erste Bossherausforderung | Lesbarer Boss verlangt die verfügbaren Turmrollen | B09 | Nicht begonnen |
| P4 | B11 · Wachsende Karte | Echte seitliche Freischaltung mit zwei nützlichen Turmplätzen | B10 | Nicht begonnen |
| P4 | B12 · Ausbau und Fortsetzung | Werkstatt II, spätere Level und Fortschritt nach Minute 15 | B11 | Nicht begonnen |
| P5 | B13 · Gesamter Spielverlauf | Gemessene 15-Minuten-Sitzung und Rückkehr mit legalen Aktionen | B12 | Nicht begonnen |
| P5 | B14 · Stabilität und Lieferung | Geprüfte Builds, Regression, Laufzeit und ehrlicher Ergebnisbericht | B13 | Nicht begonnen |
| Ende | G2 · Gesamtabnahme | Vollständiger Slice bewertet | B14 | **Offen** |

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

- [ ] Branch, Arbeitsverzeichnis und Abhängigkeiten prüfen; im neuen Worktree fehlende ignorierte Dateien nicht als Quellverlust behandeln.
- [ ] Eigenen Einstieg, Build, Konfiguration und Testaufruf einrichten. Geplant: `npm run idle:dev`, `idle:build`, `idle:test`; erst nach Einrichtung als ausführbar dokumentieren.
- [ ] Übernommene Kampf-/Darstellungsmodule und Herkunft festhalten; klassische Spielregeln, Startdateien und Save-Keys schützen.
- [ ] Instanzabhängige 40er-Zellen, 28×16-Startregion und späteres Flächenbudget bis 36×16 vorsehen. Keine globale Änderung alter Kartenkonstanten.
- [ ] Neutrale Layoutprobe mit Kern/Pfadende, Werkstattgrundstück, vier aktiven Turmplätzen und Figurenzugängen bei 1366×768 und 1920×1080 ansehen.
- [ ] Erste Gegner, Startturm, Mara-Position, Kern und Werkstattplatz ohne notwendiges Scrollen unterbringen; künftige östliche Turmplätze müssen den letzten Wegabschnitt erreichen können.

**Fertig, wenn:** Start und Build wirklich laufen, die Ausgangsgeometrie plausibel ist und keine Änderungen am klassischen Spiel erforderlich waren oder unbemerkt eingeflossen sind. Layoutprobe ist kein fertiger Screenshotnachweis des späteren Spiels.

### B02 — Automatischer Kampf und echte Bauwirtschaft

**Voraussetzung:** B01. **Ergebnis:** Ein legal spielbarer technischer Kampfkreislauf bei 1×.

- [ ] Geschützten Waldwächter und reguläres Startgold anlegen; Startturm nicht verkauf-/verschiebbar machen.
- [ ] Gegner, Zielwahl, Projektile, Schaden und 1×-Simulationsschritte aus bewährten Regeln übernehmen.
- [ ] Wellen automatisch starten und fortsetzen; jeden neuen Versuch mit 20/20 Kernleben, frischer Gegnerwarteschlange und ohne alte Projektile beginnen.
- [ ] Bauen, Level-1–3-Upgrades und zulässigen Verkauf aus dem echten Goldsaldo bezahlen; bestätigte Kills und Wellenabschlüsse genau einmal verbuchen.
- [ ] Levelzahl und Grafikstufe trennen; Reichweiten-/Feuerratengrenzen und Preis-/Belohnungsdaten an zentraler Stelle festlegen.
- [ ] Einstiegspfad und erste Welle so prüfen, dass allein der geschützte Startturm eine sichere Grundlage trägt; keine bloß behauptete Mindestrate einsetzen.

**Fertig, wenn:** Automatische Kämpfe Geld verdienen, reguläre Käufe den Kampf verändern, Wellen sauber wechseln und die reine Simulation ohne Phaser prüfbar bleibt. Niederlage ist ein definierter Zustand für B04, keine Löschung des Fortschritts.

### B03 — Konsistenter Spielstand während des Kampfes

**Voraussetzung:** B02. **Ergebnis:** Reload setzt Kampf, Geld und Käufe widerspruchsfrei fort.

- [ ] Eigenen versionierten IndexedDB-Spielstand gemäß Technikvertrag anlegen; klassische Daten weder lesen noch ersetzen.
- [ ] Türme, Gegner, Projektilwerte, Spawnfortschritt, IDs, Timer und Wirtschaft in einen serialisierbaren Zustand überführen.
- [ ] Wirtschaftliche Änderungen atomar speichern und erst nach Commit bestätigen; asynchrone Schreibvorgänge in gültiger Reihenfolge abarbeiten.
- [ ] Regelmäßige Kampfsnapshots ergänzen; noch unbestätigte reine Simulationsschritte dürfen bei hartem Abbruch begrenzt zurückspringen.
- [ ] Reload nach Kill/Kauf, während einer Welle und vor Niederlage prüfen; bereits abgefeuerte Geschosse verkaufter Türme korrekt rekonstruieren.
- [ ] Ungültige oder unbekannt neuere Saves schützen, bekannte Versionen kontrolliert behandeln; Schreibfehler verständlich anzeigen statt Speichern vorzutäuschen.

**Fertig, wenn:** Bestätigte Ressourcen und Käufe erhalten bleiben, keine Belohnung beim Restore erneut entsteht und deterministische Fortsetzung mit/ohne Reload übereinstimmt. Export/Import ist spätestens in B14 vollständig nachzuweisen.

### B04 — Sicheres Farmen, Offline-Zeit und Tab-Eigentümerschaft

**Voraussetzung:** B03. **Ergebnis:** Niederlage und Abwesenheit erzeugen einen verlässlichen, nachvollziehbaren Fortschritt.

- [ ] Nach Niederlage auf eine gültige sichere Farmwelle wechseln; erneuten Vorstoß per Button am Wellenübergang beginnen und danach automatisch fortsetzen.
- [ ] Farmnachweis nach realem autonomem Sieg durch zwei konservative Prüfläufe ohne Mara-Bonus bestätigen; Erstbesiegs-/Bossboni ausschließen und Zykluspausen einrechnen.
- [ ] Relevante Änderungen entwerten Zertifikate; ohne Nachweis Welle 1 live spielen können und Offline-Rate zunächst null anzeigen.
- [ ] Einen schreibenden Tab mit Eigentümerschaft und Writer-Epoche sichern; zweiter Tab, Leaseübernahme und später erwachender alter Tab dürfen kein Gold duplizieren oder neue Saves überschreiben.
- [ ] Aktive Simulation, Hintergrundzeit, Suspend und ausdrückliche Pause eindeutig trennen. Pause bleibt gespeichert und erzeugt keine Offline-Produktion.
- [ ] 60 % / 2 Stunden, unveränderlichen Abrechnungscursor und einmalige ausstehende Belohnung umsetzen; Reload, Doppelklick, negative Zeit und große Uhrsprünge prüfen.
- [ ] Die P1-Fassung tatsächlich starten, Kampf/Farmen/Reload/Abwesenheit demonstrieren und verbleibende technische Grenzen dokumentieren.

**Fertig, wenn:** Keine Niederlagenschleife, kein doppelter Zeitraum und kein zweiter wirtschaftlich aktiver Tab entsteht. Der technische Kreislauf funktioniert; damit ist noch kein gutes Spielgefühl abgenommen.

## P2 — Der erste vollständige Spielkreislauf

### B05 — Startlichtung, Mara und kompakte Bedienung

**Voraussetzung:** B04; Layout aus B01. **Ergebnis:** Der Nutzer startet direkt in die echte Waldansicht und versteht die wichtigsten Eingriffe.

- [ ] Eigene Waldvariante im Originalmaßstab zusammensetzen; Weg und Kern enden sichtbar konsistent, Gebäudegrundstück und Zugänge bleiben frei.
- [ ] Mara von Anfang an darstellen und dem Startturm zuweisen; Anreise, Übertakten und automatische Wiederholung bei 8 Sekunden Wirkung / 30 Sekunden Cooldown ab Aktivierung integrieren.
- [ ] Mara-Neuzuweisung, unzugängliche Ziele und Verkauf ihres Zielturms behandeln; Position, Weg, Wirkzeit und Cooldown durch Reload erhalten und die konservative Farmprüfung erneut prüfen.
- [ ] Gold, sichere Farmbasis, Welle, Kernleben, Vorstoß/Farmen und ein nächstes Ziel anzeigen; keine volle spätere Menüleiste im Einstieg.
- [ ] Turmbau, Auswahl, Upgrade, Verkauf und Pause verständlich bedienen; Kamerabewegung und Bauklick sauber trennen.
- [ ] Alte dekorative Wisp-Baueffekte entfernen oder passend ersetzen, damit Wisp vor seiner Freischaltung nicht erscheint.
- [ ] Startansicht und Bedienung in beiden Desktopauflösungen im Browser prüfen; alle Einstiegsziele ohne Kamerasuche erreichbar halten.

**Fertig, wenn:** Die Startansicht tatsächlich lebt, Mara ohne Dauerklicken unterstützt und der Spieler eine bezahlbare Aktion erkennt. Die ersten Käufe funktionieren mit echter Wirtschaft und Speicherung.

### B06 — Erste Werkstatt und sichtbar wirksame Technologie

**Voraussetzung:** B05. **Ergebnis:** Die Karte verändert sich durch ein Gebäude, das eine neue Kampfmöglichkeit eröffnet.

- [ ] Grundstück, Silhouette, Anker, Referenzbilder und benötigte Zustände vor Assetproduktion nach Grafikvertrag festlegen.
- [ ] Nur beschädigte Werkstatt und Werkstatt I produzieren/aufbereiten; Rohquelle, Prompt, Referenzen und technische Metadaten sichern.
- [ ] Gebäude neben Originalturm, Baum und Mara bei echter Spielgröße prüfen; kurze Bauwirkung ohne fremden Stil und ohne vorzeitig auftauchenden Wisp integrieren.
- [ ] Werkstatt gegen reguläres Gold bauen; Bauzustand, Grundstück und Freischaltungen korrekt speichern.
- [ ] „Frostfassung“ gegen Gold kaufen: Frostkristall und Level 4–6 freischalten; Frostwirkung im tatsächlichen Kampf zeigen.
- [ ] Baupreise, Erträge und Folgekäufe gemeinsam abstimmen: Werkstatt nach etwa 60–90 Sekunden, erste Technik samt nutzbarem Frostturm in kurzer Fortsetzung bis ungefähr 150 Sekunden erreichbar.

**Fertig, wenn:** Die Werkstatt sichtbar und stilistisch passend entsteht, eine erkennbare taktische Folge hat und nicht nur ein Menüeintrag bleibt. Lager, Werkstatt II und spätere Assets bleiben unproduziert.

### B07 — Live-Tutorial, Balance und Zwischenabnahme vorbereiten

**Voraussetzung:** B06. **Ergebnis:** Eine selbst startbare Fassung mit nachgewiesenem ersten Spielkreislauf.

- [ ] Kurze Mara-Hinweise und ein aktuelles Ziel für Kampf, eigenen Turm, Upgrade, Werkstatt und Frostfassung an tatsächliche Ereignisse binden.
- [ ] Skip, zustandsbezogenes Wiederanzeigen, bereits erledigte Schritte, alternative Turmplätze und Reload prüfen; keine zusätzlichen Ressourcen durch Tutorialwiederholung.
- [ ] Einen echten frischen 1×-Durchlauf mit Zeitprotokoll spielen: erste Gegner/Schüsse, erstes Gold, eigener Turm bis 20 Sekunden, Upgrade und Werkstatt bei etwa 60–90 Sekunden.
- [ ] Erste Technologie und Frostwirkung nur als kurze Fortsetzung bis etwa 120–150 Sekunden nachweisen; die Zielzeit nicht durch feste Geschenk-Timer erzwingen.
- [ ] Drei Spielweisen prüfen: Tutorial folgen, anders investieren, drei Minuten zuschauen und dann weiterspielen. Unterschiedliches Tempo zulassen, Sackgassen beheben.
- [ ] Speicherung/Farming mit dieser echten Anfangsverteidigung erneut gezielt prüfen, einschließlich Mara und Frost; nur betroffene Prüfungen wiederholen.
- [ ] Startanleitung, konkrete Fassung, echte Screenshots, gemessene Zeiten und die drei wichtigsten Schwächen zur Nutzerprobe vorlegen.

**Fertig, wenn:** Die Fassung startbar ist, der Ablauf nachvollziehbar funktioniert und alle Nachweise samt Abweichungen vorliegen. Das Paket fertigzustellen ist noch keine Nutzerfreigabe.

## G1 — Verbindlicher Halt: 90-Sekunden-Zwischenabnahme

**Status: OFFEN. B08–B14 sind gesperrt, bis der Nutzer ausdrücklich freigibt.**

- [ ] B01–B07 nachgewiesen; keine wesentlichen offenen Speicher-/Farmfehler in der vorgelegten Fassung.
- [ ] Startbare Probe, Commit, Screenshots, Zeitprotokoll und Ergebnisse der drei Spielweisen bereitgestellt.
- [ ] Spielgefühl selbst kritisch beurteilt: verständliche Entscheidungen, spürbare Verbesserungen, wenig Leerlauf, Werkstatt als echter Fortschritt und stimmiger Maßstab.
- [ ] Nutzer konnte die konkrete Fassung beurteilen; verlangte Änderungen innerhalb P2 umgesetzt und bei Bedarf erneut vorgelegt.
- [ ] **Ausdrückliche Nutzerfreigabe erhalten und hier dokumentiert.** Dieses Kästchen darf nur aufgrund der tatsächlichen Nutzerentscheidung gesetzt werden.

| Freigabenachweis | Eintrag |
| --- | --- |
| Geprüfte Fassung / Commit | Noch nicht vorhanden |
| Datum und Chatbezug | Noch nicht vorhanden |
| Wortlaut / Entscheidung | Noch keine Entscheidung |
| Offene Auflagen | Noch nicht beurteilt |

Während des Wartens nur P2 prüfen und korrigieren. Kein Wisp, Lager, Boss, Werkstatt II oder freischaltbare Erweiterung vorziehen und keine entsprechenden Assets auf Vorrat erzeugen. Zeitablauf, erfolgreiche Tests und allgemeine Entwicklungsautonomie ersetzen die Freigabe nicht.

## P3 — Frühe Siedlung und Rückkehr

### B08 — Wisp, weitere Turmrollen und Bauplätze

**Voraussetzung:** G1 ausdrücklich freigegeben. **Ergebnis:** Zweite Figur und weitere Turmrollen verändern die Entscheidungen des Spielers.

- [ ] Abgenommenen Einstieg beibehalten; relevante Balanceänderungen gegen seine gemessenen Zeiten prüfen.
- [ ] Wisp nach Frostfassung und Welle 5 etwa bei Minute 2–4 freischalten; vorhandene Figur verwenden, keine Charakterlevel einführen.
- [ ] 10 % Bonus auf wiederholbare Gegner-/Wellenbelohnungen korrekt und genau einmal vergeben; sichtbaren Auftrag ohne Sammelzwang darstellen.
- [ ] Steinschleuder bei Wisp-Freischaltung und Scharfschütze nach Welle 10 anbieten; passende Gegnerrollen ohne unerwartete unlösbare Sperre einführen.
- [ ] Je zwei weitere Startregion-Turmplätze nach Welle 5 und 10 öffnen und speichern.
- [ ] Tutorial, Save und Farmzertifikate um die tatsächlichen Freischaltungen ergänzen; Wisps Bonus nicht ein zweites Mal auf Offline-Erträge anwenden.

**Fertig, wenn:** Vier unterscheidbare Turmrollen nutzbar sind und Wisps automatischer Nutzen sichtbar und messbar ist.

### B09 — Vorratslager und befriedigende Rückkehr

**Voraussetzung:** B08. **Ergebnis:** Ein zweites sichtbares Gebäude verbessert die nächste Spielsitzung.

- [ ] Nur benötigtes Lagerasset nach Grafikvertrag produzieren, in Spielgröße neben der Werkstatt prüfen sowie Herkunft, Aufbereitung und Nutzung dokumentieren.
- [ ] Lager nach Wisp und Welle 8 gegen Gold etwa bei Minute 4–6 bauen; Grundstück und Figurenwege freihalten.
- [ ] Offline-Werte ab Kauf auf 65 % / 8 Stunden erhöhen; keine rückwirkende Verbesserung vergangener Abwesenheit.
- [ ] Sichere Basis, Effizienz, Limit und Ein-Stunden-Beispiel verständlich anzeigen; Tutorialhinweis ohne lange Unterbrechung.
- [ ] Kontrolliert nachgestellte Ein-Stunden-Abwesenheit mit regulär erspieltem Stand abrechnen und danach real weiterspielen; sinnvolle Käufe und erhaltene Fortschrittsbedingungen nachweisen.
- [ ] Abwesenheit über acht Stunden, wiederholte Rückkehr vor Claim und Lagerwerte nach Reload prüfen; kein erneuertes Limit allein durch Öffnen des Dialogs.

**Fertig, wenn:** Lager und Rückkehr einen verständlichen Vorteil bringen, ohne die Anfangsprogression oder die Abrechnungsregeln zu umgehen. Kein zusätzlicher verpflichtender Nutzerhaltepunkt.

## P4 — Boss, Kartenwachstum und weiterer Ausbau

### B10 — Erste Bossherausforderung

**Voraussetzung:** B09. **Ergebnis:** Eine lesbare Herausforderung belohnt die verfügbaren Turmkombinationen.

- [ ] Vorhandene gepanzerte Magmakrabbe als Boss in Welle 15 samt kleiner Begleitgruppe konfigurieren; kein neues umfangreiches Grafikpaket erzeugen.
- [ ] Bossankündigung, Lebensanzeige und nachvollziehbare Wirkung von Frost, Fläche und Rüstungsdurchdringung zeigen.
- [ ] Zielbereich etwa Minute 7–10 mit legaler Verteidigung prüfen; bei Scheitern sichere Farmphase und bewussten neuen Vorstoß ermöglichen.
- [ ] Erstbesiegung und spätere Wiederholungsbelohnungen sauber trennen; Bosswellen nicht als sichere Offline-Farmbasis verwenden.
- [ ] Gespeicherter Bossfortschritt übersteht Reload; unterbrochener Kampf vergibt keinen vorzeitigen Sieg.

**Fertig, wenn:** Ein regulärer erster Bosssieg möglich, verständlich und als Meilenstein gespeichert ist.

### B11 — Scrollbare Lichtung mit tatsächlichem Nutzen

**Voraussetzung:** B10; geometrische Vorbereitung aus B01. **Ergebnis:** Die bestehende Welt wird sichtbar größer und sinnvoll nutzbar.

- [ ] Nach Boss 15 und Goldkauf eine östliche Lichtung öffnen, Ziel etwa Minute 8–11; maximal acht zusätzliche Spalten, keine neue Region.
- [ ] Genau zwei neue Turmplätze nahe der westlichen Erweiterungskante anlegen; echte Schussfenster auf den vorhandenen letzten Wegabschnitt prüfen.
- [ ] Gegnerpfad und Kern während Freischaltung nicht verschieben; keine zweite Angriffsfront oder hinter dem Kern weiterlaufenden Gegner erzeugen.
- [ ] Waldkante sichtbar freilegen und Kameragrenzen erweitern, ohne sämtliche Objekte zu verkleinern; nur benötigte Dekoration ergänzen.
- [ ] „Lichtung ansehen“ anbieten, keinen überraschenden Kamerasprung erzwingen; HUD und Rückkehr-zur-Verteidigung bleiben bedienbar.
- [ ] Gesperrte Plätze vor Freischaltung zurückweisen; Freischaltung, Bauplätze, Figurenzugänge und Kameraverhalten nach Reload, im Kampf und bei beiden Viewports prüfen.

**Fertig, wenn:** Der Nutzer tatsächlich in einen neuen Abschnitt scrollt und dessen Turmplätze taktisch helfen. Eine größere leere Karte oder Plätze außerhalb der Reichweite erfüllen das Paket nicht.

### B12 — Werkstatt II und Fortschritt nach Minute 15

**Voraussetzung:** B11. **Ergebnis:** Sichtbarer weiterer Ausbau und ein erreichbares nächstes Ziel.

- [ ] Werkstatt II nach Lichtung und Goldkauf etwa bei Minute 10–13 zugänglich machen; kleinen sichtbaren Anbau im bisherigen Maßstab ergänzen, Herkunft dokumentieren und Gebäudestufe nach Reload prüfen.
- [ ] Level 7–20 freischalten; erste 15 Minuten auf ungefähr Level 1–10 ausrichten, spätere Level als normale Schadensupgrades ohne neue Fähigkeiten/Grafikstufen.
- [ ] Zahlenlevel und vorhandene drei Grafikstufen korrekt zuordnen; Reichweite und Feuerrate innerhalb der festgelegten Grenzen halten.
- [ ] Zweiten Boss um Welle 25 als nahes oder erreichtes Ziel bei etwa Minute 13–15 anbieten.
- [ ] Weitere Wellen datengetrieben skalieren und Farmen stabil erhalten; Gegner-/Projektilmenge und Zahlenbereiche begrenzen.
- [ ] Nächstes wirklich erreichbares Upgrade anzeigen; keine aktive Quest für ein nicht implementiertes Zukunftsgebäude ausgeben.

**Fertig, wenn:** Die Siedlung nochmals sichtbar wächst und nach Minute 15 ohne künstliches Ende sinnvoll weitergespielt werden kann.

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

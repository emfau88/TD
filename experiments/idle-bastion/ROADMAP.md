# Roadmap — SPIRE: Idle Bastion

Stand: 17.10.2026 · Verbindlicher Status dieser Planung: **P0 abgeschlossen, Umsetzung noch nicht begonnen**.

## Arbeitsstand und Freigaben

| Feld | Stand |
| --- | --- |
| Branch | `codex/idle-bastion-vertical-slice` |
| Ausgangscommit | `5667aaeda3140e2797532894c524a32eb10af1cc` |
| Ablage | `experiments/idle-bastion/` im eigenen Worktree |
| Aktueller Auftrag | Überarbeitete Planung und Referenzen ablegen; keine Spielimplementierung oder Assetgenerierung |
| Nächster erlaubter Schritt | Erst nach ausdrücklichem Umsetzungsauftrag P1 beginnen |
| G1: erster 90-Sekunden-Kreislauf | **Offen; keine Nutzerfreigabe vorhanden** |
| G2: vollständiger Slice | **Offen; keine Nutzerfreigabe vorhanden** |

P0 dokumentiert Entscheidungen, keine Spielfunktionen. Noch nicht implementiert: sämtliche Idle-Funktionen einschließlich eigener Startbefehle, Speicherformat, Wirtschaft, Gebäude, Figurenaufträge und Kartenerweiterung. Vorhandene klassische Funktionen gelten nicht automatisch als abgeschlossene Idle-Arbeit.

Nach Umsetzungsbeginn wird innerhalb der jeweiligen freigegebenen Phase selbstständig gearbeitet. Eine ausdrückliche Freigabe von G1 erlaubt anschließend P3–P5; routinemäßige Korrekturen, Balancing und benötigte Assets brauchen keine Einzelgenehmigung. Kein Weiterarbeiten über ein offenes G1 hinweg.

## P0 — Verbindliche Planung und isolierter Ausgangspunkt

Status: **Abgeschlossen; reine Dokumentation.**

Ergebnisse:

- [Überarbeiteter Auftrag](README.md) mit Scope, Rollen, Fortschrittsfolge und vorläufigen Balancewerten.
- [Technische Regeln](docs/TECHNIK.md), [Grafik-/Kartenvertrag](docs/ART_DIRECTION.md), [Abnahmeplan](docs/ABNAHME.md).
- [Kurze Agentenregeln](AGENTS.md) mit Startgrenze und echtem Zwischenhalt.
- Beide gelieferten Mockups dauerhaft unter `docs/references/`; ausdrücklich Konzeptmaterial.
- Isolierter Branch/Worktree auf dokumentiertem Ausgangscommit.

Erkenntnisse der Vorprüfung: aktueller Spielstrang unter `reference/src/`; Wald visuell abgenommen; Kampf bereits ohne Phaser testbar; klassische Speicherung nur in Bauphasen; drei grafische Turmstufen; Builder-Pack ohne Werkstatt-/Lagersprites. 54 Root- und 58 Referenztests sowie beide TypeScript-Prüfungen bestanden in der vorausgehenden Analyse. Keine neuen Builds oder Spielprüfungen durch diese Dokumentation.

## P1 — Kleine technische Grundlage und maßstäblicher Startbereich

Status: **Noch nicht begonnen.** Voraussetzung: ausdrücklicher Umsetzungsauftrag.

Arbeit:

1. Worktree/Branch, vorhandene Änderungen und Abhängigkeiten prüfen. Eigenen Einstieg, Build und Tests unter dem Experiment einrichten. Geplante Befehlsnamen sind `npm run idle:dev`, `idle:build`, `idle:test`; erst nach tatsächlicher Einrichtung als nutzbar dokumentieren.
2. Kampf-/Renderingübernahme auf die erforderlichen Module begrenzen. Herkunft und unvermeidliche Änderungen notieren; klassische Dateien nicht beiläufig refaktorieren.
3. Eigenen Zustand, 1×-Simulation, automatische Wellen, Gold, geschützten Startturm, Kernreset, Farmmodus und manuellen Vorstoß aufbauen.
4. Atomare Wirtschaft und wiederherstellbaren Kampfsnapshot, Writer-Eigentümerschaft, Zeitgrenzen und grundlegende Offline-Abrechnung von Anfang an integrieren. Ohne diese Grundlage keine vermeintlich persistente Anfangsprogression vorführen.
5. In neutraler interner Layoutprobe Startregion, Werkstattgrundstück, 4 aktive Turmplätze, Figurenwege, HUD und Kameragrenzen festlegen. 1366×768 und 1920×1080 prüfen. Keine finalen Assets für die spätere Erweiterung erzeugen.
6. Schutz der Original-Save-Keys und des klassischen Spiels sowie reine Wirtschafts-/Kampffunktionen gezielt prüfen.

Abschlusskriterium: selbstständig startbare technische Fassung mit legaler Bauwirtschaft, funktionierendem Niederlage-/Farmkreislauf, konsistentem Reload und eindeutig getrennter aktiver/Offline-Zeit. Ein kurzer technischer Bericht nennt verbleibende Fehler. Noch keine Behauptung, dass der Einstieg Spaß macht.

## P2 — Erster 90-Sekunden-Kreislauf

Status: **Noch nicht begonnen.** Voraussetzung: P1 ausreichend stabil.

Arbeit:

- Direkter Start in die echte Waldvariante, Mara und geschützter Waldwächter sichtbar; Gegner und Gold praktisch sofort.
- Zweiter Waldwächter innerhalb von 20 Sekunden bezahlbar; erstes Upgrade etwa nach 30–60 Sekunden.
- Ereignisgesteuerte kurze Hinweise, eine aktuelle Aufgabe, alternative gültige Aktionen, Skip und zustandsbezogene Wiederholung; Reload setzt korrekt fort.
- Nur benötigte Werkstattgrafik produzieren: beschädigter Zustand, Werkstatt I und kurze Bauwirkung. Originalmaßstab neben Waldwächter, Baum und Mara überprüfen.
- Werkstatt auf 60–90 Sekunden bei normalem Tutorialverlauf abstimmen. Erste Technologie „Frostfassung“ und der dadurch freigeschaltete Frostkristall müssen einen sichtbaren Nutzen demonstrieren.
- Erste Technologie unmittelbar nach Bau zugänglich; kurze Fortsetzung bis ungefähr 120–150 Sekunden darf Technologiekauf und Frostwirkung zeigen. Kein automatisches Fertigstellen nach Stoppuhr.
- Drei Spielweisen prüfen: Tutorial folgen, anders investieren, zunächst zuschauen. Unterschiedliches Tempo ist erlaubt; dauerhafte Sackgassen sind es nicht.
- Speicher-/Farmtests mit dieser realen Verteidigung, geordnetem Tabwechsel und unterbrochener Welle durchführen.

In dieser Phase nicht ausarbeiten: Wisp, Lager, Werkstatt II, Bossinhalt, Lichtungsfreischaltung oder deren Assets. Generische IDs/Datenverträge für spätere Systeme sind zulässig. Keine versteckten fertigen späteren Systeme hinter deaktivierten UI-Buttons vorbereiten.

## G1 — Verbindliche Nutzer-Zwischenabnahme

Status: **OFFEN — hier muss die Umsetzung anhalten.**

Vorzulegen:

1. Tatsächlich startbare Fassung, eindeutig zugeordneter Commit und Startanleitung.
2. Reale Screenshots aus erster Minute und mit gebauter Werkstatt; bei Bedarf kurze Aufnahme, keine Konzeptbilder als Nachweis.
3. Zeitprotokoll: erste sichtbare Gegner/Schüsse, erster Abschuss/Gold, erster eigener Turm, Upgrade, Werkstatt und erste Technologie/Frostwirkung.
4. Ergebnisse der drei Spielweisen, grundlegenden Speicher-/Farmprüfungen und offenen Fehler.
5. Eigene kritische Bewertung: Ist der Ablauf verständlich? Sind Kauf und Werkstatt befriedigend? Gibt es Leerlauf? Passen Maßstab und Startansicht?

Der Nutzer bewertet den ersten spielbaren Kreislauf und gibt ihn ausdrücklich frei oder nennt Änderungen. Nur erteilte Freigabe mit Datum, Wortlaut/Chatbezug und geprüfter Fassung eintragen. „Tests bestanden“, eine vorgesehene spätere Aufgabe oder ausbleibende Antwort sind keine Freigabe.

Bei Änderungswünschen P2 korrigieren und erneut vorlegen. Während des Wartens keine P3-/P4-Arbeit und keine Assetgeneration dafür. Zulässig bleiben Analyse und Behebung von Fehlern der vorgelegten P2-Fassung.

## P3 — Wisp, Lager und befriedigende Rückkehr

Status: **Noch nicht begonnen.** Voraussetzung: G1 ausdrücklich freigegeben.

- Abgenommenen Einstieg erhalten; nötige spätere Balanceänderungen gegen G1-Zeiten prüfen.
- Wisp nach erster Technologie und Welle 5 in etwa 2–4 Minuten freischalten, 10-%-Wirtschaftsbeitrag verständlich zeigen. Vorhandene Figur verwenden.
- Steinschleuder und weitere Startregion-Plätze gemäß Auftrag freischalten; Scharfschütze ab Welle 10. Gegnerrollen rechtzeitig verständlich einführen.
- Lager I nach Wisp und Welle 8 auf ungefähr 4–6 Minuten abstimmen; sichtbar bauen, 65 % / 8 Stunden inklusive verständlicher Vorschau.
- Tutorial um Wisp und Lager erweitern; Offline-Bonus einmalig einsammeln, Speicherfehler/mehrere Tabs/Rückkehr korrekt behandeln.
- Legal gespielten Stand nach einer kontrolliert nachgestellten Stunde Abwesenheit weiterführen; Käufe müssen befriedigen und Freischaltbedingungen intakt bleiben.

Abschlusskriterium: beide Figuren und Gebäude greifen sichtbar in Kampf/Wirtschaft ein, Rückkehr funktioniert mit derselben tatsächlichen Farmbasis. Technischer Bericht und echte Spielansichten; kein zusätzlicher verpflichtender Zwischenhalt.

## P4 — Boss, sichtbares Kartenwachstum und Minute 15

Status: **Noch nicht begonnen.** Voraussetzung: P3 und G1.

- Ersten Boss in Welle 15 aus vorhandenen Gegnerassets gestalten; Panzerung und Begleitgruppe machen Frost, Fläche und Scharfschütze sinnvoll. Lesbare Bossanzeige, kein neues großes Animationspaket.
- Nach Sieg und Goldkauf eine östliche Lichtung öffnen: maximal 8 zusätzliche Spalten, 2 neue taktisch wertvolle Turmplätze, eigenständige Gebietsdaten und aktualisierte Kameragrenzen.
- Erweiterung öffnet Fläche, keine zweite Angriffsfront und keinen verschobenen Kern. Ihre Turmplätze müssen den bestehenden letzten Wegabschnitt erreichen und einen messbaren Nutzen besitzen. Dies in der Layoutprobe prüfen, nicht nur auf Screenshot behaupten.
- Kamera bewegt sich auf Spielerwunsch; bei Freischaltung markieren und „Lichtung ansehen“ anbieten, keinen überraschenden Kamerasprung erzwingen. Rückkehr-zur-Verteidigung bleibt erreichbar.
- Werkstatt II mit kleinem sichtbaren Anbau; höhere Turmlevel. Zweiten Boss um Welle 25 und ein erreichbares nächstes Upgrade als Ausblick gestalten.
- Nach dem gestalteten Abschnitt weitere normale Level und Wellen anbieten. Skalierung begrenzen, keine zusätzlichen Fähigkeiten, Gebäude oder Grafikevolutionen dafür erzeugen.

Abschlusskriterium: nach etwa 15 Minuten sichtbar gewachsene Siedlung und Verteidigung, echte Nutzung der scrollbaren Erweiterung, mindestens eine besiegte Bossherausforderung und ein sinnvoller nächster Fortschritt.

## P5 — Gesamtabnahme vorbereiten und Regression prüfen

Status: **Noch nicht begonnen.** Voraussetzung: P4.

- Einen echten Browserdurchlauf von 15 Minuten mit frischem Save, legalen Aktionen und 1× dokumentieren. Nicht durch Tests mit vorgespultem Gold ersetzen.
- Rückkehrsitzung, Offline-Matrix, Reload während der Welle, Doppelklick-Claim, zwei Tabs, Suspend und defekte/nicht verfügbare Speicherung prüfen.
- Originaltests/TypeScript und betroffene klassische Builds prüfen; aktuelle Waldversion zusätzlich im Browser starten. Historische DOM-Tests sind kein Nachweis der heutigen Wald-UI.
- Idle-Build und möglichst eigenständige HTML-Fassung tatsächlich öffnen; Unterschiede der Speicherung über Origins/Dateipfade erklären, Export/Import prüfen.
- Mindestens 30 Minuten ununterbrochenen Browserbetrieb und ergänzend längere beschleunigte Modellprüfung ausführen. Gegner-/Projektilgrenzen, Speicher und Eventverbrauch dokumentieren.
- Drei zentrale reale Screenshots plus Lichtungsansicht, technische Entscheidungen, tatsächliche Fortschrittszeiten und drei wichtigste verbleibende Schwächen liefern.

## G2 — Vollständiger Vertical Slice

Status: **OFFEN.**

Nachweise entsprechend [ABNAHME.md](docs/ABNAHME.md) vollständig vorlegen. Funktionen und Status unterscheiden: vollständig / teilweise implementiert / nur vorbereitet / nicht begonnen. Technisch geprüft und vom Nutzer abgenommen sind unterschiedliche Aussagen.

Die Abnahme umfasst Spielgefühl, erste 15 Minuten, Rückkehr, sichtbares Wachstum und technische Stabilität. Eine gehostete Veröffentlichung, Kongregate-Anbindung, Merge nach `main` oder weitere Spielphasen folgen nicht automatisch daraus.

## Änderungsdisziplin

- Kleine Balance-/Layoutkorrekturen innerhalb des Umfangs selbstständig vornehmen und ihre Auswirkung messen.
- Zuerst die bestehende Funktion verbessern, bevor neue Mechaniken ergänzt werden. Neue Features benötigen eine ausdrückliche Umfangsentscheidung.
- Bei grundlegenden Konflikten eine konkrete Alternative mit Auswirkungen auf Einstieg, Grafik und Aufwand vorbereiten und besprechen.
- Pro Phase einen knappen Ergebnisbericht unter `artifacts/idle-bastion/acceptance/` ablegen. Kein eigener Status in jeder Fachdatei, der der Roadmap widerspricht.
- Nach Unterbrechung zuerst diese Statusseite und den letzten Bericht lesen. Nicht erneut bei der ursprünglichen langen Wunschliste starten.

## Entscheidungsprotokoll

| Datum | Entscheidung |
| --- | --- |
| 17.10.2026 | Nutzer beauftragt überarbeiteten Markdown-Auftrag und Roadmap im neuen Branch; noch keine Spielimplementierung |
| 17.10.2026 | Schrittweise wachsende scrollbare Karte, kompakter Start ohne Scrollpflicht, eine Erweiterung im Slice |
| 17.10.2026 | Eigene verbindliche Nutzer-Zwischenabnahme der ersten 90 Sekunden; kurze Technikdemonstration bis ca. 150 Sekunden gehört dazu |
| 17.10.2026 | Offene Detailentscheidungen durch Planung festgelegt: feste Turmplätze, 1×, manuelle Käufe/Vorstoß, Kernreset, konservatives Farming, atomarer Kampfsave, begrenzte Gebäudeproduktion |

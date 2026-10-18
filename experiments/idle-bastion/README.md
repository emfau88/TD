# SPIRE: Idle Bastion — überarbeiteter Entwicklungsauftrag

Stand: 17.10.2026 · Umsetzungsstand und Freigaben: siehe [Roadmap](ROADMAP.md).

Dieses Dokument ersetzt für Idle Bastion den ursprünglichen langen Auftrag. Es bündelt die anschließend gemeinsam besprochenen Entscheidungen einschließlich der wachsenden, scrollbar erschlossenen Karte. Die bestehende klassische SPIRE-Roadmap wird dadurch nicht verändert. Eine spätere ausdrückliche Startaufforderung autorisiert die Umsetzung bis zur ersten Zwischenabnahme, nicht das Überspringen dieser Abnahme.

## Verbindliche Unterlagen

| Dokument | Zweck |
| --- | --- |
| [ROADMAP.md](ROADMAP.md) | 14 Arbeitspakete mit Checklisten, Abhängigkeiten, Abschlusskriterien und verbindlicher Zwischenabnahme |
| [docs/TECHNIK.md](docs/TECHNIK.md) | Kampf, Wirtschaft, Save, Offline-Zeit und Farmregeln |
| [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) | Karte, Kamera, Originalmaßstab und begrenzte Gebäudeproduktion |
| [docs/ABNAHME.md](docs/ABNAHME.md) | Messbare Prüfungen und ehrliche Ergebnisnachweise |
| [AGENTS.md](AGENTS.md) | Kurze Arbeitsregeln für spätere Bearbeiter |

Bei Konflikten gilt die jüngste ausdrückliche Nutzerentscheidung, danach dieser Auftrag, danach die zuständige Fachdatei. Der Status und echte Freigaben stehen ausschließlich in der Roadmap. Beispiele, Mockups und alte Planungsdokumente erweitern den Umfang nicht automatisch.

## Ziel und Spielgefühl

Ein eigenständig startbares Browser-Spiel mit Desktop als Hauptansicht und einer funktionalen Hochkantansicht: Eine kleine Fantasy-Siedlung wächst sichtbar, während ihre Türme automatisch Gegner besiegen. Der Spieler entscheidet über Bau, Upgrades, Forschung und Maras Auftrag. Offline erhält er einen konservativ berechneten Ertrag seiner nachweislich tragfähigen Verteidigung.

Der erste Vertical Slice bietet etwa 15 Minuten gestalteten Fortschritt und einen sinnvollen Wiedereinstieg nach einer Abwesenheit. Danach laufen skalierende Wellen und Turmverbesserungen weiter. Hunderte Stunden Endspielbalance sind kein Abnahmeversprechen.

Prioritäten: verständlicher Einstieg → korrekte Wirtschaft und Speicherung → früh sichtbare Werkstatt → abwechslungsreiche 15 Minuten und Rückkehr → stimmige Ausarbeitung. Die erste Werkstatt muss bereits bei der Zwischenabnahme im tatsächlichen SPIRE-Stil sichtbar sein; umfangreiches Polishing folgt später.

## Ausgangspunkt und Isolation

- Repository: `https://github.com/emfau88/TD`; Ausgangscommit `5667aaeda3140e2797532894c524a32eb10af1cc`.
- Entwicklungsbranch: `codex/idle-bastion-vertical-slice`, eigener angehängter Worktree. Alle Arbeiten erfolgen dort. Kein Merge nach `main`, kein Push oder Deployment aus dieser Planungsaufgabe.
- Aktueller spielbarer Strang: `reference/src/woodland-main.ts` und die zugehörigen Module. Das Stammverzeichnis `src/` ist der ältere Fünf-Karten-Entwurf. Grundlage ist die dokumentiert abgenommene Waldkarte.
- Neue Anwendung unter `experiments/idle-bastion/`, eigener Einstieg, eigene Konfiguration und Speicherung. Bestehende Karten, Speicherkennungen, Launcher und Spielregeln bleiben funktionsfähig.
- Phaser/TypeScript und geeignete vorhandene Kampf-, Gelände-, Animations- und Navigationslogik wiederverwenden. Kein Enginewechsel, kein vorsorglicher Umbau des Gesamtprojekts zu einer allgemeinen Engine.
- Bestehende Module nur direkt teilen, wenn sie keine veränderlichen globalen Spielregeln hineintragen. Eine kleine gezielte Übernahme mit Herkunftsnotiz ist zulässig; keine vollständige Duplizierung beider alten Anwendungen.

## Verbindlicher Slice-Umfang

| Bereich | Entscheidung |
| --- | --- |
| Welt | Eigene Waldkarte, 40er Zellen; Startbereich 28×16, östliche Lichtung um 4 Spalten auf 32×16; Obergrenze 36×16 im Slice |
| Kamera | Vorwiegend horizontales Verschieben; am Desktop alle Einstiegsziele gemeinsam sichtbar. Hochkant lesbarer Ausschnitt, Übersicht und direkter Kamerafokus über Bau-/Figurenkarten |
| Turmplätze | 13 fest gestaltete Plätze insgesamt: 11 im Startbereich, 2 in der Erweiterung. Zunächst 5 verfügbar, davon einer mit geschütztem Startturm belegt; je 3 weitere bei Welle 5 und 10. Drei ergänzte Plätze verbinden die Schussbereiche bestehender Türme |
| Türme | Waldwächter (Allrounder), Frostkristall (Verlangsamung), Steinschleuder (Fläche), Scharfschütze (Rüstung) |
| Turmlevel | Ziel der ersten 15 Minuten: Level 1–10; anschließend normale Schadensupgrades bis Level 20. Zahlenlevel getrennt von 3 vorhandenen Grafikstufen. Keine automatische Ausgabe von Gold für Upgrades |
| Gebäude | Werkstatt I, eine sichtbare Verbesserung zur Werkstatt II, Vorratslager I; feste Grundstücke, kurze Bauanimation, kein Ressourcen-Bauzeitspiel |
| Figuren | Mara sofort, Wisp später; keine Charakterlevel, Ausrüstung oder Beziehungswerte im Slice |
| Wellen | Automatischer Start und Fortsetzung, kurze feste Pause; Niederlage führt automatisch zum sicheren Farmen, erneuter Vorstoß zunächst manuell |
| Leben | Kern startet jeden Wellenversuch mit 20/20; Türme und Gebäude werden nicht beschädigt |
| Geschwindigkeit | 1×; Pause hält Simulation und Produktion an. Keine spielerseitige 2×-Option im Slice |
| Währung | Nur Gold. Keine zweite Bauressource, Prestige-Währung, Premiumwährung oder Beuteinventare |
| Speichern | Versionierter eigener Browser-Spielstand, transaktionale Wirtschaft, exakter kampffähiger Zustand; Export/Import als lokales Backup |
| Offline | Zunächst 60 % der sicheren Farmbasis, höchstens 2 Stunden; Vorratslager I erhöht auf 65 % und 8 Stunden. Keine Offline-Bosse/Freischaltungen |
| Oberfläche | Karte als Hauptfläche, schmale Statusleiste, kompaktes Dock für Türme/Siedlung und Figuren. Details und Forschung bei Auswahl; Goldzufluss, Wellenrekord und nächstes Ziel sichtbar; Farmbasis und Versuchshistorie in der Chronik. Keine dauerhafte Seitenleiste |

Die Kartenmaße sind ein konkreter Layout-Ausgangspunkt, kein Anlass, bestehende globale Konstanten zu verändern. Eine kleine Anpassung innerhalb des Slice-Flächenbudgets ist nach dokumentierter Ansicht-/Wegprüfung zulässig. Zusätzliche Regionen oder Angriffsfronten sind es nicht.

## Einstieg und Fortschritt

Zeiten sind Ziele für einen neuen Spielstand bei 1× und zügigen normalen Entscheidungen. Freischaltungen beruhen auf tatsächlich erfüllten Bedingungen, niemals auf abgelaufenen Tutorial-Zeitgebern. Alternative sinnvolle Käufe dürfen Ziele verzögern, aber keine Sackgasse erzeugen.

| Zeitfenster | Ereignis und nachvollziehbarer Nutzen |
| --- | --- |
| 0–10 s | Wald direkt öffnen, vorhandener Waldwächter kämpft, Mara sichtbar, erste Goldbelohnung. Geschützter Startturm sichert eine tragfähige Basis |
| spätestens 20 s | Spieler kann einen zweiten Waldwächter kaufen und platzieren; Startgold reicht dafür ohne Warten |
| 30–60 s | Erstes normales Turmupgrade; Schaden und Trefferwirkung sind nachvollziehbar. Mara weist auf die beschädigte Werkstatt hin |
| 60–90 s | Werkstatt I ist durch regulär verdientes Gold erreichbar und wird bei Befolgen des Hinweises sichtbar gebaut |
| nach Bau, spätestens etwa 120–150 s | Erste Technologie „Frostfassung“ kaufen: Frostkristall freigeschaltet, zugleich normale Turmlevel 4–6 zugänglich. Der neue Turm verlangsamt Gegner sichtbar |
| 2–4 min | Nach erster Technologie und gemeisterter Welle 5 Wisp kostenlos freischalten; zusätzlich Steinschleuder verfügbar |
| 4–6 min | Vorratslager I nach Wisp und Welle 8 baubar; Offline-Vorteil anhand konkreter Vorschau erklären. Scharfschütze ab gemeisterter Welle 10 verfügbar |
| 7–10 min | Erster Bosssieg als Ziel; die Begegnung kann früher beginnen. Welle 15: vorhandene Succubus „Rosenspiegel“ mit angekündigter Turmverführung, Frost-Unterbrechung und kleiner Begleitgruppe; lesbare Bossanzeige, kein neues Spritepaket |
| 8–11 min | Nach dem ersten echten Boss-15-Sieg kann die östliche Lichtung für 900 Gold erschlossen werden: echte Kamerabewegung in die neue Fläche und 2 taktisch nützliche Turmplätze |
| 10–13 min | Werkstatt II nach Lichtung und Goldkauf; sichtbares kleines Anbauteil, Turmlevel ab 7 freigeschaltet, bis Level 20; erste Ziele liegen bei 7–10 |
| 13–15 min | Verbesserte Verteidigung, zweiter Boss als nahes oder erreichtes Ziel (Welle 25), nächster sinnvoller Kauf erkennbar |
| danach | Wiederkehrende Herausforderungen, weitere normale Schadenslevel bis 20 und skalierende Wellen. Nächstes Ausbauziel bleibt erreichbar; keine unerfüllbaren aktiven Quests auf nicht implementierte Gebäude |

Die Wellen- und Preiskurve wird auf diese Fenster abgestimmt; bei einem Zielkonflikt zuerst Erträge, Kampfdauer und Kosten ändern. Kleine datenbezogene Anpassungen sind erlaubt und mit Vorher/Nachher-Zeiten zu dokumentieren. Reihenfolge, Charakterrollen und Freigabegrenzen bleiben verbindlich.

**Umgesetzte Einstiegspreise:** 75 Startgold plus kostenloser Startturm; Waldwächter 75, Frostkristall 110, erstes Upgrade 60, Werkstatt I 400, Frostfassung 60. Die Werkstatt-Hypothese 220 wurde nach Messung des gesamten Kaufablaufs auf 400 angehoben. Der tatsächliche 1×-Browserverlauf und die verschiedenen Spielweisen stehen im [90-Sekunden-Bericht](../../artifacts/idle-bastion/acceptance/90s/REPORT.md). Steinschleuder/Scharfschütze kosten 135/170 Gold, Lager I 650 und die östliche Lichtung 900. Im legalen Modellablauf war die Lichtung nach 9:42 Minuten bezahlbar; das ist keine garantierte Zeit für jede Spielweise. Werkstatt II: weiterhin 1.200 Gold als Hypothese. Rosenspiegel gewährt einmalig 750 Gold Erstprämie ohne Wisp-Bonus; spätere Ausbaupreise bleiben Hypothesen.

## Rollen und Entscheidungen

- **Mara:** Unterstützt standardmäßig den Startturm. Spieler kann ihr einen anderen erreichbaren Turm zuweisen. Nach Ankunft wirkt Übertakten automatisch: 8 Sekunden lang 50 % höhere Feuerrate, 30 Sekunden Abklingzeit ab Aktivierung; anschließend erneut bei gültigem Ziel und aktiver Welle. Kein ständiges Nachklicken, keine zusätzlichen manuell verpflichtenden Kampffähigkeiten.
- **Wisp:** 10 % Bonus auf wiederholbare Gegner- und Wellen-Goldbelohnungen, keine Erstbesiegungs-/Verkaufsboni. Sichtbare kurze Werkstatt-/Lagergänge erklären seine Rolle, sind aber keine einsammelpflichtigen Goldobjekte. Der Bonus geht nicht wegen einer dekorativen Laufanimation verloren.
- **Werkstatt:** Erste Forschung eröffnet mit Frost eine neue taktische Kombination und höhere Level; keine frühe verzweigte Spezialisierung, die den Scharfschützen überflüssig macht. Werkstatt II ist ein späterer sichtbarer Erfolg mit neuer Levelgrenze.
- **Lager:** Eine Vorschau zeigt sichere Basis, Effizienz, Zeitlimit und beispielsweise den Ertrag nach einer Stunde. Die Verbesserung wirkt ab Kauf, nicht rückwirkend auf bereits vergangene Abwesenheit.
- **Platzierung:** Verlangsamung, Mehrfachabdeckung und Flächenschaden müssen sich lohnen. Numerische Level dürfen nicht irgendwann die gesamte Karte abdecken.
- **Farming:** Kein Game-over und keine Löschung der Siedlung. Geschützter Startturm kann nicht verkauft/verschoben werden; andere Türme sind für 70 % ihrer Investition verkäuflich. Kein kostenloses Umplatzieren während einer Welle.
- **Fortschritt:** Erstbesiegungen und Freischaltungen sind einmalig; normale neue Farmdurchläufe dürfen erneut gewöhnliches Gold erzeugen. Ein wiederhergestellter alter Durchlauf darf dieselbe Belohnung nicht erneut vergeben.

## Tutorial und Rückkehr

Mara führt mit kurzen Kommentaren, einem aktuellen Ziel und dezenten Markierungen durch: Kampf → zweiter Turm → Upgrade → Werkstatt → Frostfassung → Wisp → Lager/Offline → Lichtung. Kampf läuft dabei weiter. Erledigte Schritte werden aus dem Zustand erkannt; eine alternative zulässige Turmposition oder ein früher erfüllter Schritt blockiert nichts.

Tutorial überspringen blendet Hilfen aus und verändert keine Freischaltbedingungen. „Hinweise erneut ansehen“ spielt die Erklärungen zustandsbezogen erneut ab, vergibt keine Ressourcen und setzt die Wirtschaft nicht zurück. Fortschritt, Hinweise und einmalige Belohnungen werden gespeichert.

Beim Wiedereinstieg erklärt „Willkommen zurück“ vergangene und angerechnete Zeit, Effizienz, Limit und Gold. „Belohnung einsammeln“ ist idempotent. Mehrere Tabs, Reload oder ein abgebrochener Claim erzeugen keine zusätzliche Gutschrift. Lokale Zeit ist nicht manipulationssicher; Schäden werden begrenzt statt Sicherheit vorzutäuschen.

## Visuelle Richtung und Umfangsgrenze

Die [echte abgenommene Waldansicht](../../artifacts/m2/overview.png) und der [vorhandene Grafikvertrag](../../reference/STYLE_GUIDE.md) bestimmen Stil und Maßstab. [Mockup 1](docs/references/vision-einstieg.png) zeigt einen bereits entwickelten frühen Zustand, [Mockup 2](docs/references/vision-ausbau.png) die spätere Vision. Beide sind Konzeptbilder, keine vorhandenen Assets oder Implementierungsnachweise.

Übernehmen: sichtbare Siedlung neben der Verteidigung, grüne Landschaft, warme Wege, warme dunkle Holz-/Bronzeoberfläche, Pergamentschrift und Goldakzente, ruhige Effekte. Gebäude und Figuren bleiben klein genug, damit Weg, Projektile und Gegner lesbar sind. Keine Turmlebensbalken, wenn Türme keinen Schaden nehmen.

Nicht im Slice: Späherposten als eigenes Gebäude, Gilde/Taverne, weitere Regionen/Wege, Charakterlevel, Fertigkeitsbäume, automatische Käufe, Prestige, Multiplayer, Accounts, Monetarisierung, vollständige Mobile-Optimierung, große Storybibliothek oder neue umfassende Gelände-/Gegnerpakete. Eine funktionale Hochkantdarstellung ist zusätzlich beauftragt; das ist keine Zusage einer umfassenden Geräteabnahme. Spätere Systeme erhalten stabile IDs und klare Datenbereiche, keine ungenutzte Implementierung auf Vorrat.

## Lieferumfang der späteren Umsetzung

Separat startbarer Build mit dokumentierten tatsächlichen Befehlen; möglichst zusätzlich ein eigenständiger HTML-Build ohne Entwicklungsumgebung. Eine gehostete Vorschau oder Kongregate-Veröffentlichung benötigt einen gesonderten Auftrag. Unterschiedliche Dateipfade/Origins teilen Browser-Spielstände nicht automatisch.

Dazu gehören reale Screenshots (erste Minute, Werkstatt, ungefähr Minute 15), Fortschrittszeiten, echte Browser- und Rückkehrtests, technische Entscheidungen sowie eine ehrliche Bewertung der drei größten Schwachstellen. Vollständig/teilweise implementiert, nur vorbereitet und nicht begonnen werden getrennt ausgewiesen. Technische Prüfergebnisse sind keine Nutzerabnahme.

## Lokale Probe starten

Im Wurzelverzeichnis des isolierten Worktrees `npm ci` ausführen, falls die Abhängigkeiten fehlen. `npm run idle:dev` startet die technische Kampfprobe auf `http://127.0.0.1:5190/`. `npm run idle:test` prüft Geometrie, Kampfsimulation, Wiederherstellung und Speichertransaktionen. `npm run idle:build` erzeugt `experiments/idle-bastion/dist/`; `npm run idle:preview` öffnet den Server auf Port 5191.

Die Startseite zeigt den kompletten ersten Kreislauf mit automatischem Kampf, Mara, Turmbau, Werkstatt und Frosttechnik. [Im Browser testen](https://emfau88.github.io/TD/idle-bastion/) · [Frische unabhängige Probe](https://emfau88.github.io/TD/idle-bastion/?fresh=1). Die gemessene Werkstattzeit beträgt 1:23, die erste Frostwirkung 2:04; [B07-Bericht und Screenshots](../../artifacts/idle-bastion/acceptance/90s/REPORT.md).

[Die Entwicklung in Spielaufnahmen](../../README.md#entwicklung-von-idle-bastion) zeigt den Weg vom neutralen Kartenrahmen bis zur großen Kartenansicht. Nach der Reparatur verschwinden die Bauplatzpfosten und die Platzbeschriftung der Werkstatt; das Gebäude selbst bleibt zur Auswahl anklickbar.

Die Karte füllt die Ansicht zwischen Statusleiste und Baudock. Eine Baukarte aktiviert die Platzierung, ein Klick auf Turm oder Gebäude öffnet dessen Aktionen. Hochkant lässt sich die Welt ziehen; große Bauplatz-Schaltflächen ergänzen die Auswahl direkt auf der Karte. „Übersicht“ zeigt den ganzen Hain, „+“ kehrt zum nahen Ausschnitt zurück. Menü, Pause, Forschung und Rückkehr sind auch in der schmalen Ansicht erreichbar. [UI-Nachweis und Grenzen](../../artifacts/idle-bastion/acceptance/ui/REPORT.md).

Käufe, Gold, laufender Kampf, Gebäude, Forschung, Hinweise und ausdrückliche Pause bleiben nach Reload erhalten. „Neu laden“ lädt denselben Stand; „Frische Probe“ öffnet eine getrennte neue Partie. Entwicklung (Port 5190), Produktionsvorschau (Port 5191) und GitHub Pages besitzen getrennte lokale Spielstände. Bei Speicherproblemen wird kein neuer Stand über bestehende Daten geschrieben; eine ausdrücklich gewählte temporäre Probe speichert nichts. Niederlagen führen ins sichere Farmen; ein neuer Vorstoß beginnt bewusst am Wellenübergang. Abwesenheit reserviert 60 % der beim Verlassen nachgewiesenen Rate für höchstens zwei Stunden. Pause produziert kein Gold. Genau ein Tab pro Partie darf den Stand fortschreiben. Nach sehr schnellem Reload kann die Freigabe der vorherigen Sitzung kurz dauern (Lease: fünf Sekunden). `/layout.html` enthält die neutrale B01-Layoutprobe, `/asset-check.html` den maßstäblichen Werkstattvergleich. Freigaben und der nächste Umsetzungsschritt stehen ausschließlich in der Roadmap.

Die Chronik (Buchsymbol oder Gold-/Wellenanzeige) erklärt laufenden Goldzufluss, sichere Farmbasis, Offline-Ertrag und Begleiter. Sie speichert neue Wellenversuche mit getrennten Vorstoß-/Farmstatistiken. Bei älteren Spielständen bleiben historische Versuche unbekannt; vorhandener Fortschritt bleibt erhalten. [B07b-Nachweis](../../artifacts/idle-bastion/acceptance/ui/PROGRESS.md).

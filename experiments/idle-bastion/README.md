# SPIRE: Idle Bastion — überarbeiteter Entwicklungsauftrag

**Siedlung am Kern:** Neue Partien erhalten eine 40×16-Karte mit Werkstatt, Lager und Taverne südöstlich des Kerns. Altsaves behalten ihre Plätze bis zum kostenlosen Umzug unter **Siedlung → Siedlung am Kern** bei manueller Pause. Mausziehen/Touch statt zusätzlicher Navigationsbuttons; die Ostfront folgt später. Die älteren Slice-Angaben unten bleiben als Entwicklungshistorie erhalten.

Stand: 21.10.2026 · Umsetzungsstand und Freigaben: siehe [Roadmap](ROADMAP.md).

Dieses Dokument ersetzt für Idle Bastion den ursprünglichen langen Auftrag. Es bündelt die anschließend gemeinsam besprochenen Entscheidungen einschließlich der wachsenden, scrollbar erschlossenen Karte. Die bestehende klassische SPIRE-Roadmap wird dadurch nicht verändert. Eine spätere ausdrückliche Startaufforderung autorisiert die Umsetzung bis zur ersten Zwischenabnahme, nicht das Überspringen dieser Abnahme.

[Mara: Idle und Schulterreaktion ausprobieren](https://emfau88.github.io/TD/idle-bastion/mara-check.html) · Separate T01-Probe ohne Spielstandzugriff; visuell freigegeben am 21.10.2026. [Atlas und Produktionshinweise](assets/mara-tavern/README.md).

**T04 visuell freigegeben:** Tavernenübersicht, große Mara-Ansicht, Sprechen/Berühren/Schenken und kompakter Kampfhinweis sind umgesetzt und am 21.10.2026 ausdrücklich zur Veröffentlichung freigegeben. [Aufnahmen und Prüfbericht](../../artifacts/idle-bastion/acceptance/t04/REPORT.md).

**T05:** Maras fünf Herzen schalten fünf persönliche, wieder abspielbare Momente frei. Begrüßung und Aktionsantworten passen zur jeweiligen Stufe; Freischaltungen bleiben aus den gespeicherten Punkten ableitbar. [Prüfbericht](../../artifacts/idle-bastion/acceptance/t05/REPORT.md).

## Geplanter Ausbau nach Akt I

Am 19.10.2026 wurde die Roadmap um [Akt II, B15–B22](ROADMAP.md) erweitert: Taverne mit Ilyra, die vorhandenen Türme Sturmlicht und Glutwerfer, eine große vorbereitbare Ostfront und gestalteter Fortschritt bis ungefähr Welle 40. [AKT_II.md](docs/AKT_II.md) hält Bestand, Spielregeln und technische Grenzen kompakt fest. Schnellfeuer, Sonnenobelisk, Runa sowie nutzbarer Kern/HQ und verbündete Einheiten stehen als spätere Ideen auf der Parkliste.

Anschließend wurde B15a ausdrücklich zur Umsetzung freigegeben: Taverne ohne Ilyra, ein neues Werkstatt-II-Asset und Gebäudebeschriftungen. Ursprünglich wurde die Taverne nach Boss 25 für 1.200 Gold gebaut. T02 ersetzt dies durch einen kostenlosen Taverne-I-Bausatz nach gemeisterter Welle 12 und den Ausbau auf II für 1.200 Gold nach tatsächlichem Boss-25-Sieg. Alte bezahlte Tavernen werden ohne weitere Kosten II. Im anschließend beauftragten B15b lernt man dort Ilyra kennen und rekrutiert sie kostenlos; Mara und Wisp bleiben in derselben Gefährtenübersicht sichtbar. Ilyra bewegt sich frei und wirkt eine gezielte Sternensalve mit Fliegerbonus. Erst selbst ausprobieren, anschließend optional die gegnerabhängige Automatik einschalten. Weitere Akt-II-Funktionen bleiben separat. Die folgenden ursprünglichen Umfangsgrenzen beschreiben Akt I und bleiben als Grundlage erhalten; geplante Erweiterungen sind ausdrücklich in Akt II abgegrenzt. B14/G2 und B12d bleiben getrennt offen. Die spätere ausdrückliche Autorisierung für Commit/Push auf dem Idle-Branch gilt weiterhin; historische Aussagen zur ersten Planungsaufgabe sind keine neue Veröffentlichungssperre.

Ilyras neue Animationen lassen sich separat in der [bewegten Vorschau](https://emfau88.github.io/TD/idle-bastion/ilyra-check.html) neben Mara ansehen. [Assetvertrag und Prompts](assets/ilyra/README.md); [B15b-Prüfbericht und Spielaufnahmen](../../artifacts/idle-bastion/acceptance/b15b/REPORT.md).

## Verbindliche Unterlagen

| Dokument | Zweck |
| --- | --- |
| [ROADMAP.md](ROADMAP.md) | B01–B14 samt Nachbesserungen sowie geplanter Akt II B15–B22; Checklisten, Abhängigkeiten, Abschlusskriterien und Abnahmen |
| [docs/AKT_II.md](docs/AKT_II.md) | Geplanter Ausbau: vorhandene Türme/Figuren, Taverne, Ostfront, Save-/Farmgrenzen und Zukunftsideen |
| [docs/TAVERNE_INTERAKTION.md](docs/TAVERNE_INTERAKTION.md) | Geplanter Tavernen-Ausbau T01–T07: frühere Freischaltung, Zuneigung/Geschenke, abgenommene Grafikprobe T01; Tavernenstufen T02 umgesetzt; soziales System T03–T07 folgt |
| [docs/TECHNIK.md](docs/TECHNIK.md) | Kampf, Wirtschaft, Save, Offline-Zeit und Farmregeln |
| [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) | Karte, Kamera, Originalmaßstab und begrenzte Gebäudeproduktion |
| [docs/ENEMIES.md](docs/ENEMIES.md) | Vorhandene Gegner, Einführung, Rollen, Originalatlanten und Speicherschutz |
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
| Turmplätze | Freie Rasterwahl bis zu drei Zellen vom Gegnerweg entfernt, auf beiden Seiten; während der ersten Lernschritte werden geeignete Kombinationsplätze geführt angeboten. Weg, Wasser, Bäume, Felsen und Siedlungsfläche bleiben frei von Türmen; geschützter Startturm wird beim ersten Einstieg selbst aus einem kostenlosen Bausatz platziert. Vorschau mit tatsächlicher Reichweite; ein Tipp auf ein gültiges Feld baut direkt |
| Türme | Waldwächter (Allrounder), Frostkristall (Verlangsamung), Steinschleuder (Fläche), Scharfschütze (Rüstung) |
| Turmlevel | Ziel der ersten 15 Minuten: Level 1–10; anschließend normale Schadensupgrades bis Level 20. Zahlenlevel getrennt von 3 vorhandenen Grafikstufen. Keine automatische Ausgabe von Gold für Upgrades |
| Gebäude | Werkstatt I, eine sichtbare Verbesserung zur Werkstatt II, Vorratslager I; frei wählbare Grundstücke innerhalb der Siedlungsfläche, Versetzen bei Pause, kurze Bauanimation, kein Ressourcen-Bauzeitspiel |
| Figuren | Mara sofort, Wisp später; keine Charakterlevel, Ausrüstung oder Beziehungswerte im Slice |
| Wellen | Erster Start ausdrücklich nach dem eigenen Turmbau; danach automatische Fortsetzung, während der Anleitung Wiederholung bis Welle 2 und gezielte Lernpausen; Niederlage führt automatisch zum sicheren Farmen, erneuter Vorstoß zunächst manuell |
| Leben | Kern startet jeden Wellenversuch mit 20/20; Türme und Gebäude werden nicht beschädigt |
| Geschwindigkeit | 1×; Pause hält Simulation und Produktion an. Keine spielerseitige 2×-Option im Slice |
| Währung | Nur Gold. Keine zweite Bauressource, Prestige-Währung, Premiumwährung oder Beuteinventare |
| Speichern | Versionierter eigener Browser-Spielstand, transaktionale Wirtschaft, exakter kampffähiger Zustand; Export/Import als lokales Backup |
| Offline | Zunächst 60 % der sicheren Farmbasis, höchstens 2 Stunden; Vorratslager I erhöht auf 65 % und 8 Stunden. Keine Offline-Bosse/Freischaltungen |
| Oberfläche | Karte als Hauptfläche, schmale Statusleiste, kompaktes Dock für Türme/Siedlung und Figuren. Details und Forschung bei Auswahl; Goldzufluss, Wellenrekord und nächstes Ziel sichtbar; Farmbasis und Versuchshistorie in der Chronik. Keine dauerhafte Seitenleiste |

Die Kartenmaße sind ein konkreter Layout-Ausgangspunkt, kein Anlass, bestehende globale Konstanten zu verändern. Eine kleine Anpassung innerhalb des Slice-Flächenbudgets ist nach dokumentierter Ansicht-/Wegprüfung zulässig. Zusätzliche Regionen oder Angriffsfronten sind es nicht.

## Einstieg und Fortschritt

Die Lernfolge hat ausdrückliche Lese-/Baupausen und führt durch die echten Menüpunkte. Dafür gilt keine starre 90-Sekunden-Grenze. Die aktuelle mobile Echtzeitprobe erreichte die erste Frost-Kombination nach 25,95 Sekunden Kampfzeit; Lesezeit, Menüklicks und Reload kommen hinzu. Die folgenden späteren Zeitfenster sind historische Richtwerte. Freischaltungen beruhen auf tatsächlichen Meilensteinen, niemals auf abgelaufenen Tutorial-Zeitgebern.

| Zeitfenster | Ereignis und nachvollziehbarer Nutzen |
| --- | --- |
| 0–10 s | Mara begrüßt auf ruhiger Karte. Kostenlosen Waldwächter selbst bauen, Reichweite prüfen und „Verteidigung starten“ wählen. Kein Zeitdruck; erst dann kommen Gegner |
| Nach dem ersten Käfer | Lernpause: Startturm antippen und genau einmal für 60 Gold auf Level 2 verbessern; erst mit Weiter geht es weiter |
| Danach | Erste Welle beenden. Mara stellt danach einen einmaligen kostenlosen Werkstatt-Bausatz bereit; keine zusätzliche Sparschleife |
| Nach Welle 1 | Lernpause: Siedlung → Werkstatt-Karte → freien Kartenplatz antippen. Aufbau sichtbar abwarten; erst danach die gebaute Werkstatt für Forschung öffnen |
| Anschließend | Je eine Lernpause bei bezahlbarer Frostforschung (60 Gold) und Frostbau (110 Gold). Echte Forschungsschaltfläche und überlappenden Frostplatz zeigen. Ersten Frosttreffer verstehen, dann freie Verteidigung |
| 2–4 min | Nach erster Technologie und gemeisterter Welle 5 Wisp kostenlos freischalten; zusätzlich Steinschleuder verfügbar |
| 4–6 min | Vorratslager I nach Wisp und Welle 8 baubar; Offline-Vorteil anhand konkreter Vorschau erklären. Scharfschütze ab gemeisterter Welle 10 verfügbar |
| 7–10 min | Erster Bosssieg als Ziel; die Begegnung kann früher beginnen. Welle 15: vorhandene Succubus „Rosenspiegel“ mit angekündigter Turmverführung, Frost-Verlangsamung ohne Zauberabbruch und kleiner Begleitgruppe; lesbare Bossanzeige, kein neues Spritepaket |
| 8–11 min | Nach dem ersten echten Boss-15-Sieg kann die östliche Lichtung für 900 Gold erschlossen werden: optionale zusätzliche Fläche; Werkstatt II setzt sie nicht voraus. Spätere Expeditionen sind vorgemerkt, noch nicht spielbar |
| 10–13 min | Werkstatt II nach Frostforschung und Goldkauf; sichtbares kleines Anbauteil, Turmlevel ab 7 freigeschaltet, bis Level 20; erste Ziele liegen bei 7–10 |
| 13–15 min | Verbesserte Verteidigung, zweiter Boss als nahes oder erreichtes Ziel (Welle 25), nächster sinnvoller Kauf erkennbar |
| danach | Wiederkehrende Herausforderungen, weitere normale Schadenslevel bis 20 und skalierende Wellen. Nächstes Ausbauziel bleibt erreichbar; keine unerfüllbaren aktiven Quests auf nicht implementierte Gebäude |

Die Wellen- und Preiskurve wird auf diese Fenster abgestimmt; bei einem Zielkonflikt zuerst Erträge, Kampfdauer und Kosten ändern. Kleine datenbezogene Anpassungen sind erlaubt und mit Vorher/Nachher-Zeiten zu dokumentieren. Reihenfolge, Charakterrollen und Freigabegrenzen bleiben verbindlich.

**Umgesetzte Einstiegspreise:** 75 Startgold plus kostenloser Startturm; Waldwächter 75, Frostkristall 110, erstes Upgrade 60, Frostfassung 60. Die angeleitete erste Werkstatt verwendet nach Level 2 und Welle 1 einen kostenlosen Bausatz. Außerhalb der Anleitung kostet Werkstatt I weiterhin 200 Gold. Bereits bezahlte Gebäude bleiben erhalten; keine rückwirkende Erstattung. [Aktueller Ablauf und Prüfung](../../artifacts/idle-bastion/acceptance/onboarding/menu-guide/REPORT.md). Ältere Berichte dokumentieren die damals geltenden Preise und Zeiten. Steinschleuder/Scharfschütze kosten 135/170 Gold, Lager I 650 und die östliche Lichtung 900. Im legalen Modellablauf war die Lichtung nach 9:42 Minuten bezahlbar; das ist keine garantierte Zeit für jede Spielweise. Werkstatt II: 1.200 Gold; B13 hat diesen Preis mit der neuen Ertragskurve geprüft. Rosenspiegel gewährt einmalig 750 Gold Erstprämie ohne Wisp-Bonus; die gemessenen Zeiten und Grenzen mit dem erweiterten Gegnerkader stehen im [B13-Bericht](../../artifacts/idle-bastion/acceptance/15min/REPORT.md).

## Rollen und Entscheidungen

- **Mara:** Unabhängiger Standort und Fernzauberziel, Zauberreichweite sechs Felder. Übertakten: 8 Sekunden lang 50 % höhere Feuerrate, 30 Sekunden Abklingzeit. Automatik wartet auf einen angreifbaren Gegner am Ziel; optional manuell auslösen. Bewegung oder Zielwechsel entfernt einen laufenden Buff nicht. Restdauer am Turm, Cooldown am Porträt. Farmnachweise bleiben konservativ ohne Mara-Bonus.
- **Wisp:** Kurze Ankunft und einmalig bestätigte persönliche Begrüßung. Sofort nach Freischaltung 10 % Bonus auf wiederholbare Gegner- und Wellen-Goldbelohnungen, keine Erstbesiegungs-/Verkaufsboni. Sichtbare kurze Werkstatt-/Lagergänge erklären seine Rolle, sind aber keine einsammelpflichtigen Goldobjekte. Der Bonus geht nicht wegen einer dekorativen Laufanimation verloren.
- **Werkstatt:** Erste Forschung eröffnet mit Frost eine neue taktische Kombination und höhere Level; keine frühe verzweigte Spezialisierung, die den Scharfschützen überflüssig macht. Werkstatt II ist ein späterer sichtbarer Erfolg mit neuer Levelgrenze.
- **Lager:** Eine Vorschau zeigt sichere Basis, Effizienz, Zeitlimit und beispielsweise den Ertrag nach einer Stunde. Die Verbesserung wirkt ab Kauf, nicht rückwirkend auf bereits vergangene Abwesenheit.
- **Platzierung:** Verlangsamung, Mehrfachabdeckung und Flächenschaden müssen sich lohnen. Numerische Level dürfen nicht irgendwann die gesamte Karte abdecken.
- **Farming:** Kein Game-over und keine Löschung der Siedlung. Geschützter Startturm kann vor dem ersten Kampf kostenlos versetzt, danach nicht verkauft/verschoben werden; andere Türme sind für 70 % ihrer Investition verkäuflich. Kein kostenloses Umplatzieren während einer Welle.
- **Fortschritt:** Erstbesiegungen und Freischaltungen sind einmalig; normale neue Farmdurchläufe dürfen erneut gewöhnliches Gold erzeugen. Ein wiederhergestellter alter Durchlauf darf dieselbe Belohnung nicht erneut vergeben.

## Tutorial und Rückkehr

Mara begrüßt neue Spieler auf ruhiger Karte: eigener kostenloser Turm → ausdrücklicher Verteidigungsstart → einmal Level 2 → erste Welle → kostenloser Werkstatt-Bausatz → Frostforschung → Frostturm → erster Frosttreffer. Jeder fällige Lernschritt pausiert den Kampf bis zur ausdrücklichen Fortsetzung. Ein einzelner Pfeil führt durch die echten Baukarten bzw. auf Turm/Gebäude und ihren Aktionsbutton; Hinweis-Kacheln enthalten keine Bauabkürzungen. Während des Sparens laufen frühe Übungswellen weiter; Mara unterstützt automatisch. Danach ist freies Bauen möglich: Wisp nach Welle 5 → Maras tatsächlich ausgelöstes Übertakten sichtbar beobachten → optional Steinschleuder → ab Welle 8 optional Lager/Offline. Wisp und der Beginn der Zauberdemonstration bekommen kurze, gespeicherte Lernpausen; andere Hinweise halten den Kampf nicht an. Pfeile führen zu den echten Porträts, Tabs und Baukarten. Lager und Steinschleuder lassen sich ausdrücklich auf später verschieben. Fortgeschrittene ältere Spielstände erhalten keine neue verpflichtende Einführung. [Anschlussführung und Prüfung](../../artifacts/idle-bastion/acceptance/onboarding/followup/REPORT.md). Erledigte Schritte werden aus dem Zustand erkannt; eine alternative zulässige Turmposition oder ein früher erfüllter Schritt blockiert nichts.

Tutorial überspringen beendet die Lernführung; ein noch nicht verbauter Werkstatt-Bausatz gehört zu dieser Führung. Im freien Spiel gelten die normalen 200 Gold. Bereits gebaute Gebäude bleiben erhalten. „Hinweise erneut ansehen“ spielt die Erklärungen zustandsbezogen erneut ab, vergibt keine Ressourcen und setzt die Wirtschaft nicht zurück. Fortschritt, Hinweise und einmalige Belohnungen werden gespeichert.

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

Die Startseite zeigt den kompletten ersten Kreislauf mit automatischem Kampf, Mara, Turmbau, Werkstatt und Frosttechnik. [Im Browser testen](https://emfau88.github.io/TD/idle-bastion/) · [Frische unabhängige Probe](https://emfau88.github.io/TD/idle-bastion/?fresh=1). Im historischen B07-Verlauf betrug die Werkstattzeit 1:23, die erste Frostwirkung 2:04; [B07-Bericht und Screenshots](../../artifacts/idle-bastion/acceptance/90s/REPORT.md).

[Die Entwicklung in Spielaufnahmen](../../README.md#entwicklung-von-idle-bastion) zeigt den Weg vom neutralen Kartenrahmen bis zur großen Kartenansicht. Vor dem Werkstattbau stehen nur Werkbank und Material bereit. Nach dem Bau verschwinden die Bauplatzpfosten und die Platzbeschriftung; das Gebäude selbst bleibt zur Auswahl anklickbar.

Die Karte füllt die Ansicht zwischen Statusleiste und Baudock. Eine Baukarte zeigt den bebaubaren Wegstreifen; Reichweitenvorschau prüfen und ein gültiges Feld zum direkten Bau antippen. Danach schließt die Auswahl. Ein Klick auf einen vorhandenen Turm oder ein Gebäude öffnet dessen Aktionen. Hochkant lässt sich die Welt ziehen; eine kompakte Platzierungshilfe ergänzt die Vorschau direkt auf der Karte. „Übersicht“ zeigt den ganzen Hain, „+“ kehrt zum nahen Ausschnitt zurück. Menü, Pause, Forschung und Rückkehr sind auch in der schmalen Ansicht erreichbar. [UI-Nachweis und Grenzen](../../artifacts/idle-bastion/acceptance/ui/REPORT.md).

Käufe, Gold, laufender Kampf, Gebäude, Forschung, Hinweise und ausdrückliche Pause bleiben nach Reload erhalten. „Neu laden“ lädt denselben Stand; „Frische Probe“ öffnet eine getrennte neue Partie. Entwicklung (Port 5190), Produktionsvorschau (Port 5191) und GitHub Pages besitzen getrennte lokale Spielstände. Bei Speicherproblemen wird kein neuer Stand über bestehende Daten geschrieben; eine ausdrücklich gewählte temporäre Probe speichert nichts. Niederlagen führen ins sichere Farmen; ein neuer Vorstoß beginnt bewusst am Wellenübergang. Abwesenheit reserviert 60 % der beim Verlassen nachgewiesenen Rate für höchstens zwei Stunden. Pause produziert kein Gold. Genau ein Tab pro Partie darf den Stand fortschreiben. Nach sehr schnellem Reload kann die Freigabe der vorherigen Sitzung kurz dauern (Lease: fünf Sekunden). `/layout.html` enthält die neutrale B01-Layoutprobe, `/asset-check.html` den maßstäblichen Werkstattvergleich. Freigaben und der nächste Umsetzungsschritt stehen ausschließlich in der Roadmap.

Die Chronik (Buchsymbol oder Gold-/Wellenanzeige) erklärt laufenden Goldzufluss, sichere Farmbasis, Offline-Ertrag und Begleiter. Sie speichert neue Wellenversuche mit getrennten Vorstoß-/Farmstatistiken. Bei älteren Spielständen bleiben historische Versuche unbekannt; vorhandener Fortschritt bleibt erhalten. [B07b-Nachweis](../../artifacts/idle-bastion/acceptance/ui/PROGRESS.md).

### Lesbare Hinweise und Figurenauftritte

Niederlagenhinweise lassen sich per × schließen und bleiben für diesen verlorenen Versuch auch nach Reload geschlossen; die Chronik behält das Ergebnis. Eine spätere Niederlage kann erneut informieren. Wisp läuft bei seiner ersten Ankunft vom eigenen Kern zur Siedlung, während seine Begrüßung den Kampf anhält. Die Kamera folgt ihm auf Hochkant; eigenes Verschieben beendet das Folgen.

Bei angeleiteten neuen Partien wartet Mara mit dem Zaubern bis zur Einführung nach Wisp. „Übertakten zeigen“ gibt den nächsten echten Zauber bei Gegnerkontakt frei; dann zeigt eine kleine schließbare Leiste die acht Sekunden Wirkung. Übersprungene Anleitung und Veteranen bleiben frei spielbar. Rosenspiegels Tanz wird von Frost nicht abgebrochen; das Tanzfenster ist um 15 % kleiner. Pfeile stehen an echten Bedienelementen mit freiem Rand oder weichen Erklärungstexten aus. [Prüfung und Ansichten](../../artifacts/idle-bastion/acceptance/onboarding/readability/REPORT.md).

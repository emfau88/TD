# Kleines Testpflege-Paket — 23.10.2026

Umfang: kritische Speicher-/Offline-Migrationen, Boss-/Belohnungs- und Kaufprüfungen,
dazu die drei zuvor fest deutsch erwarteten Texte. Lokaler Branch codex/test-refresh
auf Basis von main d61c56bdad432602f28c6af19cdc765045abede0.

## Ergebnis

| Prüfung | Ergebnis |
| --- | --- |
| Vollständiges npm test | 308 Tests: 291 bestanden, 17 bekannte zurückgestellte Fehlschläge |
| Übersprungen / TODO / abgebrochen | 0 / 0 / 0 |
| Beim Modulaufbau abgebrochene Testdateien | 0 |
| TypeScript --noEmit | bestanden |
| npm run build | bestanden |

Der vorherige vollständige Lauf hatte 302 gezählte Einträge, 264 bestandene und
38 Fehler, darunter die bereits beim Modulaufbau abgebrochene B10-Datei. Jetzt
laufen deren sechs Testfälle tatsächlich; die frühere Zeitvorgabe bleibt als
siebter, eigenständiger Balancebefund sichtbar. Daher sind die Gesamtzahlen nicht
als bloßes Umfärben gleich vieler Tests zu lesen.

Die bearbeiteten kritischen Prüfungen und alle drei bilingualen Prüfungen bestehen
im vollständigen Lauf. Es gab genau einen vollständigen Abschlusslauf nach den
gezielten Vorprüfungen. Gemessene Laufzeit 11,489 Sekunden gegenüber zuletzt
238,142 Sekunden. Feste historische Daten ersetzen lange Vorbereitungsläufe;
dies ist keine garantierte Maschinenbenchmark.

## Umgesetzt

- Historisch gültige Eingaben für alte Kampf-, Gebäude-, Figuren- und Sozialstände.
  Unveränderte Eingaben, jedes historische Feld und exakter heutiger Reload werden
  weiterhin geprüft. Aktive Geschosse und ein aktiver alter Bosszauber sind enthalten.
- Historische Offline-Grundlage samt ausstehendem Anspruch bleibt unverändert.
  Fehlende Bossnachweise erzeugen keine Bossprämien oder Geschenke. Alte bezahlte
  Tavernen bleiben II; frühere I-Besitzer werden nicht kostenlos aufgewertet.
- B10-Aufbau wird erst in den Tests benötigt und einmal wiederverwendet. Die alte
  Zeitvorgabe kann nicht mehr die ganze Testdatei stoppen. Der bezahlte Durchlauf,
  Bossprämien, Charm, Reload, Niederlage, Farmübergang und Wiederholung sind geprüft.
- Konsistenter Wisp-Zustand in der ausdrücklich künstlichen B12-Grenzfixture.
  Zweiter Boss: kontrollierte kleine Verteidigung auf tatsächlich baubaren
  Positionen statt blinder Bebauung sämtlicher Kandidaten. Die höhere Ausstattung
  isoliert Belohnungs-/Reloadregeln; sie ist keine neue Balancevorgabe.
- Werkstatt-II-Prüfung folgt der dokumentierten Frost-/Preisbedingung bei optionaler
  Lichtung. Fehlerhafter Schreibvorgang rollt zurück; bestätigter Kauf kostet exakt
  einmal 1.200 Gold und bleibt nach Reload erhalten.
- Drei Texte jeweils in Englisch und Deutsch geprüft, einschließlich Upgradeziel/
  Preis, gesperrter und rekrutierbarer Ilyra sowie Tutorialziel. Sprachwahl wird
  danach zurückgesetzt; Spielstand bleibt beim Rendern unverändert.

Produktionsquellen, Assets, Abhängigkeiten, Wellen, Gold, Preise, Turmwerte und
Save-/Regelversionen sind unverändert. Keine Skip-/Only-/TODO-Markierungen und
keine Änderung der Spielsimulation. Bestehende zwölf Testkorrekturen bleiben grün.
main und parallele Tavernenarbeiten wurden nicht verändert.

## Verbleibend — bewusst außerhalb dieses Pakets

Die folgenden Fehlschläge bleiben einzeln sichtbar: sieben alte Bauflächen-/
Layoutannahmen, sechs alte Mara-Erwartungen und vier historische Zeitziele.
Die letzten beiden Zeitziele wurden erst durch den zuvor blockierenden B10-Aufbau
wieder erreichbar; es handelt sich nicht um neue Gameplayänderungen.

| Datei / Testbeginn | Gruppe | Prüfung |
| --- | --- | --- |
| b08.test.ts:16 | old building/layout assumption | Wisp and pads unlock at permanent milestones, with no gift or repeated payment on reload |
| b08.test.ts:89 | historical timing target | regular opening still funds workshop and Frost before Wisp; four roles remain saveable into armored waves |
| b10.test.ts:63 | historical timing target | B11 earned boss follow-up opens the clearing within the 8â€“11 minute target and retains farming |
| b10.test.ts:81 | historical timing target | historical B10 timing target remains a separate balance finding |
| b11.test.ts:34 | old building/layout assumption | both new slots have useful level-one frost/damage overlap and accessible companion routes |
| b12.test.ts:111 | historical timing target | earned continuation opens Workshop II around minute 13 and keeps an affordable next goal after minute 15 |
| forest-world.test.ts:7 | old building/layout assumption | solid forest leaves the route, plots, every start pad and its approach accessible |
| layout.test.ts:11 | old building/layout assumption | start fixture has unique reservations, correct budget and an in-bounds road ending at the core |
| layout.test.ts:73 | old building/layout assumption | Mara has continuous legal footpaths to all active tower approaches and the workshop |
| layout.test.ts:92 | old building/layout assumption | unopened east cells reject walking and construction; expansion changes bounds but never routes enemies |
| mara.test.ts:22 | old Mara contract | Mara starts beside the protected tower; automatic effect lasts 8s and repeats at 30s from activation |
| mara.test.ts:41 | old Mara contract | overclock reduces the existing firing cooldown at 1.5× and does not reset a shot or alter damage |
| mara.test.ts:56 | old Mara contract | assignment walks at 80px/s on cardinal safe ground, preserves cooldown and gives no bonus before arrival |
| mara.test.ts:84 | old Mara contract | retargeting halfway through a segment rejoins a centre and selling the target falls back to the starter without cooldown reset |
| mara.test.ts:108 | old Mara contract | blocked targets stay understandable and harmless, and a changed blocked route reroutes around real obstacles |
| mara.test.ts:195 | old Mara contract | Mara snapshots reject invalid target IDs, obstacles, routes and timer payloads |
| usability.test.ts:50 | old building/layout assumption | all eleven unlocked slots can hold towers and round-trip without moving the original eight |

## Nachweise

- [Vollständiges Testprotokoll](full-suite.tap)
- [Buildprotokoll](production-build.txt)
- [Maschinenlesbares Ergebnis](verification-summary.json)
- [Historische Quellen und Fixture-Vertrag](../../../../../experiments/idle-bastion/tests/fixtures/LEGACY_MIGRATIONS.md)

Die Gesamtsuite bleibt wegen dieser 17 ausdrücklich zurückgestellten Prüfungen
rot. Dafür wurden keine Tests unterdrückt und keine Spielregeln angepasst.

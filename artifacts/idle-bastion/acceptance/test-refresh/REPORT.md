# Testpflege der zwölf bekannten Fehler — 23.10.2026

Basis: main d61c56bdad432602f28c6af19cdc765045abede0.
Umsetzung lokal auf codex/test-refresh im vorhandenen isolierten Arbeitsbereich.

## Ergebnis

- Alle zwölf beauftragten Prüfungen bestehen: 12/12, keine übersprungen.
- Vollständiges npm test: 302 vom Node-Runner gezählte Einträge,
  264 bestanden, 38 fehlgeschlagen, keine übersprungen/abgebrochenen Einträge
  in den Runner-Kategorien skipped/cancelled. Laufzeit 238,142 Sekunden.
- Die 38 Fehlschläge umfassen 37 einzelne Testfälle und einen Dateiabbruch:
  b10.test.ts scheitert schon beim Aufbau seines gemeinsamen Fortschrittsstands
  an der alten Vorgabe für einen Boss-Sieg nach 7–10 Minuten. Seine sechs
  deklarierten Testfälle werden daher nicht begonnen. Der vollständige Aufruf
  wurde ausgeführt; die gesamte Suite ist ausdrücklich noch nicht grün.
- Alle 38 Fehler stammen aus 15 Testdateien, deren Inhalte unverändert mit main
  übereinstimmen. Der Quellvergleich ist je Fehler in verification-summary.json
  hinterlegt. Diese Fälle waren in der vorherigen Teilmatrix nicht erfasst.
- TypeScript-Prüfung und npm run build bestanden.
- Produktionsquellen, Assets, Speicherformate, Abhängigkeiten und Spielregeln
  sind unverändert. Keine Tests übersprungen, keine Gameplaykorrekturen.

## Aktualisierte Prüfungen

| Prüfungen | Änderung / erhaltene Garantie |
| --- | --- |
| Grafikatlas | Vollständige PNG-Signatur für PNGs; Mara ausdrücklich als verlustfreies WebP mit vollständiger Containerlänge und identischen 1254×1254 Pixeln. Wisp ausdrücklich enthalten und vermessen. Frame-Maps und Maßstäbe bleiben geprüft. |
| Straßenkacheln | Alle bisherigen Kurven und Geraden auf tatsächlich belegten Zellen; aktuelle Karten 4/5 und historische Karte 3. |
| V1-Kampfstand | Unverändertes Originalformat statt umetikettiertem modernen Snapshot. Exakter ursprünglicher Verlauf über 80 Schritte, alle historischen Kampf-/Geldfelder und Ereignisse, kein erfundener Farmbeleg, Negativtest und Reload. |
| V20-Rekrutierung | Historisch gültige bezahlte Tavernen an beiden Standorten; sämtliche alten Felder erhalten, kostenlose einmalige Rekrutierung und exakter Reload. Bestehende aktuelle Prüfungen bleiben erhalten. |
| Aktuelle Salve | Tatsächliche Ziele kurz vor Einschlag einschließlich später gespawnter Gegner; exakte Kill-IDs, Killanzahl und Auszahlung bis zur kleinsten Währungseinheit. Save/Reload, Schadensfälschung und Schutz vor doppelten Belohnungen bleiben geprüft. |
| V21-Salve | Ursprüngliche Salven vor/nach dem Treffer ohne neues pace-Feld, jeweils mit ursprünglichem Endzustand und Ereignissen verglichen; kein verschobener oder wiederholter Treffer. |
| Echter V14-Veteran | Alle historischen Felder exakt erhalten; zusätzliche Migrationsfelder und Geschenkansprüche ausdrücklich geprüft. Originaler Offline-Anspruch bleibt unverändert gespeichert. |
| V15-Einstieg | Drei Originalstände für welcome/ready/done; keine erzwungenen neuen Lektionen, Gold/Türme erhalten, exakter aktueller Reload. |
| Tutorial-Speichern | Echte Hintergrundspeicherung mit genau einer wartenden Bauaktion. Mutation erst danach, zweiter Klick abgewiesen, kostenloser Turm nur einmal verbraucht und Datenbankstand geprüft. |
| Alte Speicherhülle | Originaler V1-Eingang; aktuelle Zielversion, historische Spielfelder, keine künstlichen Nachweise, lesende Migration und konkurrierender Revisionenschutz. |
| V2 mit Offline-Anspruch | Originaler V2-Kampfstand, aktuelle Zielversion und sämtliche alten Felder; historischer Anspruch und Rohsave bleiben identisch. |
| Rückkehr über Mara-Update | Historischer V2-Stand; exakt einmal 60 Gold, zweiter Anspruch abgewiesen, Fortsetzung und Reload ohne erneute Auszahlung. |

Historische Fixtures stammen aus den ursprünglichen Modellen; die Quellcommits und
Erzeugungsschritte stehen in
[LEGACY_MIGRATIONS.md](../../../../experiments/idle-bastion/tests/fixtures/LEGACY_MIGRATIONS.md).
Die beiden Veteranen sind absichtlich künstlich ausgestattete Unit-Teststände,
keine bezahlten Fortschrittsläufe. Kein heutiger Snapshot wird durch bloßes Ändern
seiner Versionsnummer als historische Eingabe ausgegeben.

Der Vergleichshelfer prüft jedes alte Feld und komplette Arrays exakt. Er lässt
keine alten Felder weg, ignoriert keine Versionswerte und verwendet keine
Zahlentoleranz. Gewollte Versions-/Layoutmigrationen stehen ausdrücklich am
Aufruf; neue Felder werden zusätzlich gegen ihre dokumentierten Vorgaben und
aktuelle Reload-Validierung geprüft.

## Verbleibende Fehler der vollständigen Suite

Die folgenden Befunde wurden hier protokolliert, nicht pauschal als harmlose
Altlasten eingestuft oder durch geänderte Erwartungen grün gemacht. Neben weiteren
alten Migrationsannahmen betreffen sie Karten-/Wegannahmen, frühere Balanceziele,
Mara-Verträge und fest deutsch erwartete Oberflächentexte. Ihre Einzelfallanalyse
ist eine separate Folgeaufgabe.

| Datei / Testbeginn | Fehlgeschlagene Prüfung |
| --- | --- |
| b08.test.ts:15 | Wisp and pads unlock at permanent milestones, with no gift or repeated payment on reload |
| b08.test.ts:59 | schema five midwave migration preserves combat and historical money, without certifying an old recipe |
| b08.test.ts:89 | regular opening still funds workshop and Frost before Wisp; four roles remain saveable into armored waves |
| b09.test.ts:32 | warehouse has real unlock and price gates; old saves retain combat and renew farm evidence |
| b10.test.ts:1 | experiments\\idle-bastion\\tests\\b10.test.ts |
| b11.test.ts:33 | both new slots have useful level-one frost/damage overlap and accessible companion routes |
| b11.test.ts:69 | schema-eight live save migrates closed without changing money, combat or boss progress |
| b12.test.ts:18 | Workshop II charges once after clearing and unlocks continuing level 7+ / three bounded art stages |
| b12.test.ts:42 | schema nine expanded live save migrates without changing combat, purchases or a historical wave-25 record |
| b12.test.ts:55 | second boss pays its own first reward once, survives reload, and never becomes an offline farm |
| b12.test.ts:77 | second boss defeat preserves expansion and requires an explicit new advance |
| b12.test.ts:86 | Workshop II persistent command rolls back on failure and survives a committed reload |
| b12.test.ts:101 | earned continuation opens Workshop II around minute 13 and keeps an affordable next goal after minute 15 |
| balance.test.ts:48 | workshop II objective and its action select the same useful area-damage investment |
| defense-redesign.test.ts:47 | schema 10 preserves money, old tower positions, ongoing combat and cooldown, without inventing farm proof |
| discovery.test.ts:51 | schema 16 veteran preserves all saved fields without a new compulsory lesson |
| discovery.test.ts:58 | dismissed defeat stays dismissed after reload; schema 17 migrates without losing gold |
| forest-world.test.ts:7 | solid forest leaves the route, plots, every start pad and its approach accessible |
| layout.test.ts:11 | start fixture has unique reservations, correct budget and an in-bounds road ending at the core |
| layout.test.ts:73 | Mara has continuous legal footpaths to all active tower approaches and the workshop |
| layout.test.ts:92 | unopened east cells reject walking and construction; expansion changes bounds but never routes enemies |
| mara.test.ts:21 | Mara starts beside the protected tower; automatic effect lasts 8s and repeats at 30s from activation |
| mara.test.ts:40 | overclock reduces the existing firing cooldown at 1.5× and does not reset a shot or alter damage |
| mara.test.ts:55 | assignment walks at 80px/s on cardinal safe ground, preserves cooldown and gives no bonus before arrival |
| mara.test.ts:83 | retargeting halfway through a segment rejoins a centre and selling the target falls back to the starter without cooldown reset |
| mara.test.ts:107 | blocked targets stay understandable and harmless, and a changed blocked route reroutes around real obstacles |
| mara.test.ts:164 | old rule snapshots migrate once, preserve money and combat payloads and require fresh live farm evidence |
| mara.test.ts:205 | Mara snapshots reject invalid target IDs, obstacles, routes and timer payloads |
| tavern-social.test.ts:20 | legacy migration grants only proven milestone gifts once and preserves all battle data |
| tavern-social.test.ts:151 | old envelopes retain their pending offline entitlement when social claims are migrated |
| tavern-social.test.ts:176 | schema 23 early level-I owners migrate without inventing boss victories or upgrading the building |
| tavern.test.ts:57 | old schema 18 preserves actors, free plots, coins and progress; invalid new ownership is rejected |
| tavern.test.ts:113 | schema 22 owners become II once; nonowners keep kit, old recruitment, gold and positions survive |
| tavern.test.ts:154 | companion UI explains locked Ilyra without an early recruitment offer |
| usability.test.ts:38 | layout-one live save migrates combat intact and reroutes Mara away from a newly reserved pad without resetting cooldown |
| usability.test.ts:53 | all eleven unlocked slots can hold towers and round-trip without moving the original eight |
| workshop.test.ts:68 | schema three preserves Mara and gold while migrating to damaged workshop and fresh live farm evidence |
| workshop.test.ts:94 | tutorial accepts early actions and alternative pads; replay/skip preserve economy and defense |

## Nachweise

- [Vollständiges TAP-Protokoll](full-suite.tap)
- [Die zwölf bearbeiteten Tests](twelve-tests.tap)
- [Zählwerte, Dateinamen und Vergleich mit main](verification-summary.json)

Unveränderte Quelldateien belegen die Abgrenzung zu dieser Testpflege. Die
vollständige unveränderte main-Suite wurde nicht noch einmal separat ausgeführt;
die vorherige kleine Matrix darf daher nicht als vollständige Baseline gelten.
main und parallele Tavernenarbeiten wurden nicht verändert.

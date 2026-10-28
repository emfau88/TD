# Test- und Fehler-Cleanup · 28.10.2026

**Abgeschlossen: 413/413 Tests bestanden, 0 Fehler, 0 übersprungen. Produktionsbuild erfolgreich.**

Ausgang: synchronisiertes `main`, `8b583984f3d2c9ab3a3b724ab5e646a817a2838a`. Erneuter vollständiger Lauf: **380/413 bestanden, 33 Fehler**, dieselben Fehler wie im Tavernen-Polish. Ergebnis: **A 27 / B 6 / C 0 / D 0**. Die Tabelle ordnet jeden ursprünglichen Fehler genau einer Hauptklasse zu; zusätzliche Fixture-Probleme sind vermerkt. Kein Test gelöscht, deaktiviert oder übersprungen.

- **A:** nachweislich überholte Erwartung. **B:** fehlerhafte Testdaten bzw. Testaufbau. **C:** aktueller Spielfehler. **D:** unklar/riskant.
- **Keine tatsächlichen Spielfehler im aktuellen Laufzeitcode gefunden oder behoben.** Änderungen ausschließlich an Tests, neuen historischen Fixtures und Nachweisen. Keine Änderung an Speicherung, Migrationen, Balance, Karte, UI, Assets oder Offlineformeln (2/8 Stunden).
- Beseitigt wurden falsche Fehlalarme und Lücken in den Regressionstests: echte alte Speicherformate statt Schema-Mischdaten, unabhängige Fortsetzungsorakel, strenge Manipulationsabwehr, manuelle Pause über Upgrade/Reload, korrekte Fernzauber- und Kaufprüfungen. Das ist eine Verbesserung der Absicherung, keine behauptete Reparatur bereits verlorener Spielerdaten.

## Alle 33 ursprünglichen Fehler

| Nr. | Ursprünglicher Test | Klasse | Beleg und Korrektur |
|---|---|---|---|
| 1 | `Wisp and pads unlock at permanent milestones, with no gift or repeated payment on reload` (b08.test.ts) | A | A (zusätzlich B): Turmtypen bleiben an Welle 5/10 gebunden, das freie Raster nicht. Künstlicher Wisp-Meilenstein braucht auch seinen gespeicherten Ankunftszeitpunkt. |
| 2 | `regular opening still funds workshop and Frost before Wisp; four roles remain saveable into armored waves` (b08.test.ts) | A | A (zusätzlich B): B13 erlaubt schnellere Käufe. Reihenfolge und 90/150/240-s-Obergrenzen bleiben geprüft. Mara wird per regulärem Laufbefehl vom vorgesehenen Frostplatz ferngehalten; alle vier Turmrollen bleiben verpflichtend. |
| 3 | `B11 earned boss follow-up opens the clearing within the 8–11 minute target and retains farming` (b10.test.ts) | A | A: B13 hebt die Mindestwartezeit auf; Bossfolge, exakt 900 Gold, Einmalkauf, Farmnachweis und 11-Minuten-Obergrenze bleiben geprüft. |
| 4 | `historical B10 timing target remains a separate balance finding` (b10.test.ts) | A | A: B13 erlaubt Boss unter sieben Minuten ausdrücklich; aktiver Bosskanal, echter Sieg und bisherige 10-Minuten-Obergrenze bleiben geprüft. |
| 5 | `both new slots have useful level-one frost/damage overlap and accessible companion routes` (b11.test.ts) | A | A: B11-Überlappungsanforderung gilt für die zwei benannten Ostplätze, nicht jeden später hinzugefügten freien Kandidaten. |
| 6 | `earned continuation opens Workshop II around minute 13 and keeps an affordable next goal after minute 15` (b12.test.ts) | A | A: B13 erlaubt frühe Werkstatt II. Reihenfolge, exakt 1.200 Gold, Grenze 795 s, 15-Minuten-Fortschritt und bezahlbares Folgeangebot bleiben geprüft. |
| 7 | `rules 3–15 match main for 910 encounters; current rules change only waves 10 and 20` (early-balance-release.test.ts) | A | Schema 32 statt fest verdrahtetem Schema 31; 910 historische Begegnungen bleiben exakt. |
| 8 | `real schema-30 fights resume with identical old movement, projectiles, timers and money until their boundary` (early-balance-release.test.ts) | A | vollständiger Kampfvergleich plus explizite soziale Schema-32-Migration. |
| 9 | `new wave 10/20 and both boss snapshots reload exactly; downgrade and forged old queues are rejected` (early-balance-release.test.ts) | A | eingefrorene Schema-31-Boss-/Wellenstände inklusive Migration vergleichen. |
| 10 | `solid forest leaves the route, plots, every start pad and its approach accessible` (forest-world.test.ts) | A | A: Wald schließt freie Kandidaten aus; benannte Plätze bleiben direkt erreichbar, übrige gültige Plätze haben erreichbare Fernzauberpositionen. |
| 11 | `schema 29 unfinished guidance gains eligibility; completed and paid saves retain prices` (frost-kit.test.ts) | B | synthetischer Schema-Mix durch echte Schema-29-Ausgaben des historischen Modells ersetzt; kostenlose/gekaufte Frosttürme und Mischformat-Ablehnung geprüft. |
| 12 | `start fixture has unique reservations, correct budget and an in-bounds road ending at the core` (layout.test.ts) | A | A: aktuelle freie Rastergeometrie statt 13 festen Plätzen; historische 13er-Karte zusätzlich explizit geprüft. |
| 13 | `Mara has continuous legal footpaths to all active tower approaches and the workshop` (layout.test.ts) | A | A: ein leerer Baukandidat blockiert keinen Weg; ein tatsächlich belegtes Feld schließt den vierten Ausgang. |
| 14 | `unopened east cells reject walking and construction; expansion changes bounds but never routes enemies` (layout.test.ts) | A | A: drei freie Wegreihen reichen bis Spalte 30; Grenzen, Bauverbot, Weg und Reichweite weiter geprüft. |
| 15 | `schema 26 live attempts retain exact queues, enemies, clocks and wallet, including waves after 40` (local-enemies.test.ts) | B | historische Schema-26-Ausgaben bei Welle 40/53/125 mit Originalmodell-Fortsetzungsorakel. |
| 16 | `schema 26 already permits paid levels above 20; rules 12/13 HP above the old global cap reload exactly` (local-enemies.test.ts) | B | originaler Schema-26-Schreiber erzeugt bezahltes Level 21 und hohe Gegner-HP; aktuelle Migration setzt exakt fort. |
| 17 | `ordinary earned opening and a saved walking segment restore without moving an unbuilt save` (mara-waiting.test.ts) | A | Upgrade setzt automatisch fort; Testtreiber führt nur eine Kaufaktion pro Lernstufe aus. Echter gehender Save bleibt exakt geprüft. |
| 18 | `Mara starts beside the protected tower; automatic effect lasts 8s and repeats at 30s from activation` (mara.test.ts) | A | Automatik wartet dokumentiert auf Gegner beim Ziel. Positiv- und Negativfall sowie exakt 8/30 Sekunden geprüft. |
| 19 | `overclock reduces the existing firing cooldown at 1.5× and does not reset a shot or alter damage` (mara.test.ts) | B | Die Startfixture enthält bereits ein Projektil. Neue Schüsse separat anhand UID prüfen, statt eine leere Schussliste vorauszusetzen; 1,5-facher Cooldown und Schaden weiter exakt. |
| 20 | `assignment walks at 80px/s on cardinal safe ground, preserves cooldown and gives no bonus before arrival` (mara.test.ts) | A | Fernbuff bleibt am alten Turm; Bewegung erfolgt unabhängig mit 80 px/s und legalen gespeicherten Kardinalsegmenten. |
| 21 | `retargeting halfway through a segment rejoins a centre and selling the target falls back to the starter without cooldown reset` (mara.test.ts) | A | Bewegungsziel getrennt von Zauberziel; Retargeting und Verkauf eines anderen Turms erhalten den alten Effekt/Cooldown. |
| 22 | `blocked targets stay understandable and harmless, and a changed blocked route reroutes around real obstacles` (mara.test.ts) | A | Neue Hindernisse stoppen den Lauf sicher; eine neue Anweisung sucht einen gültigen Fernzauberweg. Kein automatischer Nahkampf-Annäherungszwang. |
| 23 | `Mara snapshots reject invalid target IDs, obstacles, routes and timer payloads` (mara.test.ts) | A | Aktiver Fernbuff trotz Zielwechsel, Halt oder unerreichbarem Laufziel ist gültig. Positive Reloads explizit geprüft; illegale IDs, Geometrie, Effektzuordnung und Timer weiterhin abgelehnt. |
| 24 | `a genuine schema-27 wave 46 keeps its old tank-heavy queue and live values, then adopts rules 14` (merge-ready.test.ts) | A | Schema-27-Kampf bleibt exakt; nur dokumentierte Sozial-/Forschungsfelder migrieren. |
| 25 | `all starter locations survive the complete guided purchase sequence with real learning pauses` (onboarding.test.ts) | A | zwei explizite Fortsetzungen statt drei; Upgrade und Frostbau setzen automatisch fort. Alle Startplätze, Lernstopp und Kosten bleiben geprüft. |
| 26 | `real v14 veteran and its historical offline basis survive the schema-only migration` (onboarding.test.ts) | A | v14-Veteran behält sämtliche alten Felder und Offline-Basis; neue Sozialfelder explizit geprüft. |
| 27 | `learning pause survives return without idle income and stays distinct from manual pause` (onboarding.test.ts) | A | Upgrade beendet nur die Lernpause; manuelle Pause über Kauf/Reload sowie Abwesenheit ohne Ertrag zusätzlich geprüft. |
| 28 | `in-flight hops survive upgrade, sale and reload exactly; forged payloads and visited IDs are rejected` (stormlight.test.ts) | B | echtes Schema-29-Kettenprojektil nach Upgrade/Verkauf, Originalmodell-Fortsetzung und aktuelle Manipulationsabwehr. |
| 29 | `schema 28 live queues and wallets migrate unchanged without granting research or rewriting shots` (stormlight.test.ts) | A | Schema-28-Kampf bleibt exakt, keine Sturmforschung geschenkt. |
| 30 | `Ilyra can retain the fifth tower as a sold volley source without counting chain damage twice` (stormlight.test.ts) | B | echte Schema-29-Ilyra-Salve nach Turmverkauf mit Originalmodell-Fortsetzungsorakel. |
| 31 | `all eleven unlocked slots can hold towers and round-trip without moving the original eight` (usability.test.ts) | A | A (zusätzlich B): elf historische Anker auf echter migrierter Layout-1-Quelle prüfen; spätere Nordbogenversetzung separat durch map-camera abgesichert. |
| 32 | `a genuine v24 live queue, healed targets, timer, projectiles, wallet and actors survive exactly` (wave-rework.test.ts) | A | v24-Kampffelder unverändert, soziale Struktur explizit migriert. |
| 33 | `a genuine schema-25 active healer wave migrates intact, rejects corruption, then starts current rules` (wave-v2.test.ts) | A | v25-Kampffelder unverändert, soziale Struktur explizit migriert. |

## Speicherung und historische Quellen

Vorhandene echte historische Saves/Orakel (u. a. v14, v24, v25, v27, v28, v30, v31) unverändert erhalten. Vollständige Kampfzustände bleiben exakt verglichen; absichtliche Sozialmigration nach Schema 32 wird separat mit expliziten Erwartungen geprüft. Gold, Türme, bezahlte Stufen, Forschung, Queue, Gegner, Projektile, Figuren und Timer werden nicht pauschal aus Vergleichen ausgenommen. Bereits verdiente Beziehungspunkte und Freischaltungen sind zusätzlich durch die unveränderten Tavernen-Sozialtests abgedeckt.

Neue `cleanup-historical.json`: **künstliche Unit-Szenarien, echte historische Serialisierung**, keine behaupteten echten Spielerpartien. Originalcode `796f02e5fe49164c1edd7a17e12dcbeed4079001` (Schema 26) und `537b5e8c9cf09b696b41644da4c56dbc8633d720` (Schema 29), ohne Änderungen aus Git extrahiert. Reproduzierbarer Generator liegt daneben. Eingaben und Fortsetzungsorakel stammen vom damaligen Modell; aktuelle Migration wird nicht zur Erzeugung ihrer eigenen Erwartung aufgerufen.

Die alte Schema-26-Leselogik lehnte ihre eigenen hohen Gegner-HP ab. Dieser Fehler wurde **bereits vor diesem Auftrag** behoben (`5e24ddc`); die neuen Fixtures prüfen den historischen Schreiber und Simulator trotzdem unverändert. Kein neuer C-Fund. Mischformate, falsche HP/Queues, überhöhte Investitionen, falsche Projektil-/Salvenparameter und unzulässige IDs bleiben abgelehnt. Native Save-Transaktionen, Rollback, Einmal-Auszahlung historischer Offline-Ansprüche und 2/8-Stunden-Grenzen bestehen.

## Gruppen, Commits und Prüfungen

| Gruppe | Geänderte Tests | Prüfung | Commit / Push |
|---|---|---|---|
| 1 Historische Speicherung | early-balance-release, frost-kit, local-enemies, merge-ready, onboarding, stormlight, wave-rework, wave-v2; neuer Helper/Fixture/Generator | 43/43 + 103/103 Nachbarn + v14 1/1 | `66af7a19902839745e196ade79e129e84d4cc5d4` |
| 2 Lernpausen | onboarding, mara-waiting | 53/53 einschließlich Tutorial/Frost/Discovery/Heldensteuerung | `7c2e359b6b0e14f068b78d90dc134a2bff851745` |
| 3 Freies Raster | b08, b11, layout, forest-world, usability | 28/28 + Wisp 1/1; Kamera/Kernsiedlung enthalten | `a1874147d2f93e94fa4f5346628414bf568102b6` |
| 4 Mara | mara | 25/25, Typprüfung und Produktionsbuild | `1fea077946e205ab356052a09c5722906597cd48`, Typkorrektur `644f8bbf310b1cc7af78a5ba99b21f31e89af232` |
| 5 Historische Zeitziele | b08, b10, b12 | 47/47 einschließlich Boss, Ilyra, Kampf und Release-Balance | `645f6e6db9ce8aa18052d74fe4c5a2e47a9871da` |

Alle Gruppen direkt auf `main`, ohne Force-Push. Gruppe 4 hatte nach erfolgreichem Laufzeittest einen CI-Typfehler im **Testcode** (`never[]` nach Leerarray-Assertion). Gleichwertige Längenprüfung korrigiert; 25/25 wiederholt und vollständiger Build erfolgreich. Kein fehlerhafter Spielbuild veröffentlicht. Details: `group1-tests.log` bis `group5-tests.log`, `group1-neighbors.log`, `group4-build.log`.

Die aufgehobenen Mindestzeiten sind ausdrücklich durch [B13](../15min/REPORT.md) gedeckt: starke Platzierung darf früher gewinnen, keine künstlichen Zeitbarrieren. Reihenfolge, Kaufkosten und ursprüngliche Obergrenzen bleiben geprüft. Aktuell gemessen: Werkstatt 58,425 s, Frost 74,5 s, Wisp 78,925 s; Boss/Lichtung 354,35 s, Werkstatt II 410,95 s, Rekord 24 nach 15 Minuten. Mara läuft im B08-Treiber regulär zu einer freien Position, damit der Frostplatz verfügbar bleibt. Alle vier Rollen sind weiterhin zwingend geprüft. Fernzauber-/Rasterregeln: [freigegebener B12a-Stand](../p4/REDESIGN.md).

## Abschluss und Release-Einschätzung

- `npm test`: **413/413**, 0 Fehler, 0 übersprungen (`final-tests.log`). Alle 413 Tests erhalten; einzelne Titel präzisiert. Keine neuen Fehler (`final-test-comparison.json`).
- `npm run build`: **erfolgreich**, einschließlich TypeScript über Spiel und Tests (`final-build.log`).
- Kein Laufzeitcode geändert; daher keine zusätzlichen Browser-Smokes oder Screenshots für diesen Test-Cleanup, kein neuer Kongregate-Export, kein Upload/Submit. Der bestehende geprüfte Export auf Spielcode `36c2ff8` bleibt durch diesen Auftrag unverändert.
- **Kein offener technischer Blocker aus den 33 Fehlern. Bereit für die finale Kongregate-Abnahme.** Die komplette abschließende Browser-/Kongregate-Hostabnahme aus dem [Polish-Plan](../tavern-release-polish/PLAN.md) bleibt offen: dort waren Eingabe-Timeouts der Prüfungsumgebung dokumentiert. Keine uneingeschränkte Veröffentlichungsfreigabe daraus ableiten; dieser Cleanup ersetzt weder diesen Ablauf noch die visuelle Nutzerabnahme.

Finaler geprüfter Teststand: `645f6e6db9ce8aa18052d74fe4c5a2e47a9871da`, auf `origin/main`. [Pages-Deployment 40742721094](https://github.com/emfau88/TD/actions/runs/40742721094) **erfolgreich**, einschließlich Produktionsbuild, Upload und Veröffentlichung (28.10.2026, 18:12 UTC). Maschinenlesbarer Nachweis: `deployment.json`. Nachfolgender Dokumentationscommit ergänzt ausschließlich SHA/Deploymentnachweise.

Weitere erfolgreiche Gruppen-Deployments: [Gruppe 1](https://github.com/emfau88/TD/actions/runs/40739888313), [Gruppe 2](https://github.com/emfau88/TD/actions/runs/40740202806), [Gruppe 3](https://github.com/emfau88/TD/actions/runs/40740957652), [Gruppe 4 nach Typkorrektur](https://github.com/emfau88/TD/actions/runs/40741904580). Der [vorherige CI-Typfehler](https://github.com/emfau88/TD/actions/runs/40741353541) bleibt transparent dokumentiert. Git-Vergleich bestätigt unveränderte Spielquellen, Assets, öffentliche Dateien, Laufzeitskripte, Abhängigkeiten und Workflows gegenüber dem Ausgangscommit.

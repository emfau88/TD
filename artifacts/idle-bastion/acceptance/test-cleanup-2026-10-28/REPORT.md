# Test-Cleanup 28.10.2026

Ausgang: `8b583984f3d2c9ab3a3b724ab5e646a817a2838a`, synchronisiertes `main`. Vollsuite: **413 Tests / 380 bestanden / 33 fehlgeschlagen / 0 übersprungen**. Die 33 Namen stimmen mit dem Tavernen-Polish überein.

Status: IN ARBEIT. Priorität: echte historische Speicherformate, danach Layout/Figuren/Tutorial und historische Balance-Erwartungen. Keine Laufzeitänderungen bisher.

| Nr. | Ursprünglicher Test | Klasse | Befund / Nachweis |
|---|---|---|---|
| 1 | Wisp and pads unlock at permanent milestones, with no gift or repeated payment on reload | offen | Prüfung läuft |
| 2 | regular opening still funds workshop and Frost before Wisp; four roles remain saveable into armored waves | offen | Prüfung läuft |
| 3 | B11 earned boss follow-up opens the clearing within the 8â€“11 minute target and retains farming | offen | Prüfung läuft |
| 4 | historical B10 timing target remains a separate balance finding | offen | Prüfung läuft |
| 5 | both new slots have useful level-one frost/damage overlap and accessible companion routes | offen | Prüfung läuft |
| 6 | earned continuation opens Workshop II around minute 13 and keeps an affordable next goal after minute 15 | offen | Prüfung läuft |
| 7 | rules 3–15 match main for 910 encounters; current rules change only waves 10 and 20 | A | Schema 32 statt fest verdrahtetem Schema 31; 910 historische Begegnungen bleiben exakt. |
| 8 | real schema-30 fights resume with identical old movement, projectiles, timers and money until their boundary | A | vollständiger Kampfvergleich plus explizite soziale Schema-32-Migration. |
| 9 | new wave 10/20 and both boss snapshots reload exactly; downgrade and forged old queues are rejected | A | eingefrorene Schema-31-Boss-/Wellenstände inklusive Migration vergleichen. |
| 10 | solid forest leaves the route, plots, every start pad and its approach accessible | offen | Prüfung läuft |
| 11 | schema 29 unfinished guidance gains eligibility; completed and paid saves retain prices | B | synthetischer Schema-Mix durch echte Schema-29-Ausgaben des historischen Modells ersetzt; kostenlose/gekaufte Frosttürme und Mischformat-Ablehnung geprüft. |
| 12 | start fixture has unique reservations, correct budget and an in-bounds road ending at the core | offen | Prüfung läuft |
| 13 | Mara has continuous legal footpaths to all active tower approaches and the workshop | offen | Prüfung läuft |
| 14 | unopened east cells reject walking and construction; expansion changes bounds but never routes enemies | offen | Prüfung läuft |
| 15 | schema 26 live attempts retain exact queues, enemies, clocks and wallet, including waves after 40 | B | historische Schema-26-Ausgaben bei Welle 40/53/125 mit Originalmodell-Fortsetzungsorakel. |
| 16 | schema 26 already permits paid levels above 20; rules 12/13 HP above the old global cap reload exactly | B | originaler Schema-26-Schreiber erzeugt bezahltes Level 21 und hohe Gegner-HP; aktuelle Migration setzt exakt fort. |
| 17 | ordinary earned opening and a saved walking segment restore without moving an unbuilt save | A | Upgrade setzt automatisch fort; Testtreiber führt nur eine Kaufaktion pro Lernstufe aus. Echter gehender Save bleibt exakt geprüft. |
| 18 | Mara starts beside the protected tower; automatic effect lasts 8s and repeats at 30s from activation | offen | Prüfung läuft |
| 19 | overclock reduces the existing firing cooldown at 1.5× and does not reset a shot or alter damage | offen | Prüfung läuft |
| 20 | assignment walks at 80px/s on cardinal safe ground, preserves cooldown and gives no bonus before arrival | offen | Prüfung läuft |
| 21 | retargeting halfway through a segment rejoins a centre and selling the target falls back to the starter without cooldown reset | offen | Prüfung läuft |
| 22 | blocked targets stay understandable and harmless, and a changed blocked route reroutes around real obstacles | offen | Prüfung läuft |
| 23 | Mara snapshots reject invalid target IDs, obstacles, routes and timer payloads | offen | Prüfung läuft |
| 24 | a genuine schema-27 wave 46 keeps its old tank-heavy queue and live values, then adopts rules 14 | A | Schema-27-Kampf bleibt exakt; nur dokumentierte Sozial-/Forschungsfelder migrieren. |
| 25 | all starter locations survive the complete guided purchase sequence with real learning pauses | A | zwei explizite Fortsetzungen statt drei; Upgrade und Frostbau setzen automatisch fort. Alle Startplätze, Lernstopp und Kosten bleiben geprüft. |
| 26 | real v14 veteran and its historical offline basis survive the schema-only migration | A | v14-Veteran behält sämtliche alten Felder und Offline-Basis; neue Sozialfelder explizit geprüft. |
| 27 | learning pause survives return without idle income and stays distinct from manual pause | A | Upgrade beendet nur die Lernpause; manuelle Pause über Kauf/Reload sowie Abwesenheit ohne Ertrag zusätzlich geprüft. |
| 28 | in-flight hops survive upgrade, sale and reload exactly; forged payloads and visited IDs are rejected | B | echtes Schema-29-Kettenprojektil nach Upgrade/Verkauf, Originalmodell-Fortsetzung und aktuelle Manipulationsabwehr. |
| 29 | schema 28 live queues and wallets migrate unchanged without granting research or rewriting shots | A | Schema-28-Kampf bleibt exakt, keine Sturmforschung geschenkt. |
| 30 | Ilyra can retain the fifth tower as a sold volley source without counting chain damage twice | B | echte Schema-29-Ilyra-Salve nach Turmverkauf mit Originalmodell-Fortsetzungsorakel. |
| 31 | all eleven unlocked slots can hold towers and round-trip without moving the original eight | offen | Prüfung läuft |
| 32 | a genuine v24 live queue, healed targets, timer, projectiles, wallet and actors survive exactly | A | v24-Kampffelder unverändert, soziale Struktur explizit migriert. |
| 33 | a genuine schema-25 active healer wave migrates intact, rejects corruption, then starts current rules | A | v25-Kampffelder unverändert, soziale Struktur explizit migriert. |

## Gruppe 1 – Historische Speicherung (geprüft)

43/43 betroffene Tests, 103/103 Nachbartests (Save-Store, Session, Offline, Beziehungen), v14-Einzelprüfung 1/1. Keine Laufzeitänderungen. Unveränderte historische Quellen: `796f02e5fe49164c1edd7a17e12dcbeed4079001` (Schema 26) und `537b5e8c9cf09b696b41644da4c56dbc8633d720` (Schema 29). Generator und eingefrorene Vorher-/Nachherdaten unter `tests/fixtures/`. Die alte Schema-26-Leselogik lehnte ihre eigenen hohen HP ab; dieser historische Fehler wurde bereits in `5e24ddc` behoben und ist **kein neuer Fund im aktuellen Laufzeitcode**. Das neue Orakel stammt trotzdem unverändert aus dem damaligen Schreiber und Simulator.

Commit Gruppe 1: `66af7a19902839745e196ade79e129e84d4cc5d4`, nach `origin/main` gepusht.

## Gruppe 2 – Tutorial und Lernpause (geprüft)

53/53 inklusive sämtlicher Tutorial-, Discovery-, Heldensteuerungs- und Frostkit-Nachbartests. Bestehender 14-Schritte-Ablauf, unveränderte Laufzeit/UI. Grundlage: freigegebene automatische Fortsetzung nach Upgrade (`a85870f`, vorhandene `tutorial-progress.test.ts`). Commit-SHA folgt im nächsten Eintrag.

# Progressionswirtschaft: Umsetzung und Prüfung · 02.11.2026

Die beschlossene Trennung ist lokal umgesetzt: **10 % Gold für bereits geschaffte Wellen, neue Offline-Abreisen mit 24 % / 26 % der geprüften Farmrate, weiterhin höchstens 2 / 8 Stunden.** Neue Wellen, Erst-Bossprämien, Gegner und Türme behalten ihre bisherigen Werte. Die integrierte Wirtschaft reproduziert den vorab geprüften Kandidaten exakt.

Basis: `main` / `80a5a1dc73d4ef74a4669b2ffef51d776225ef9d`. Umsetzung im separaten, abgelösten Arbeitsverzeichnis `C:/Users/madde/Documents/TowerDefense/.worktrees/progression-economy`. Der ursprünglich geöffnete ältere Arbeitsstand samt vorhandenen Änderungen wurde erhalten. Kein neuer Branch, kein Commit, kein Push, keine Veröffentlichung.

## Was sich im Spiel ändert

- **Bekannte Wellen geben 10 % ihres gewöhnlichen Goldes.** Das gilt für Gegner und Wellenabschluss, auch bei wiederholten Bossangriffen oder einem Moduswechsel. Die Anleitung bleibt ausgenommen.
- **Noch nicht geschaffte Wellen zahlen voll**, auch wenn ein Vorstoß erneut scheitert. Die einmaligen Bossprämien von 750 / 1.200 Gold bleiben erhalten.
- **Offline werden 24 % ohne Lager / 26 % mit Lager ausgezahlt.** Der Farmnachweis enthält bereits den Wiederholungsfaktor. Keine doppelte Kürzung: Bei identischer Verteidigung entspricht der neue Offlinebetrag 4 % der früheren Auszahlung. Die Zeitgrenzen bleiben 2 / 8 Stunden; 24 Stunden zahlen mit Lager genauso viel wie acht.
- **Vorhandenes Gold, Türme, Forschung und Rekorde bleiben erhalten.** Eine alte laufende Welle behält ihre Belohnung bis zum Wellenwechsel. Bereits gespeicherte Offlinegrundlagen und offene Belege werden mit ihren damaligen 60 / 65 % ausgezahlt, genau einmal. Dadurch kann die erste Rückkehr nach dem Update bewusst noch einen großen Altbetrag enthalten.
- Lager, Rückkehranzeige, Chronik und Hinweise erklären die zutreffenden Werte auf Deutsch und Englisch. Alte Rückkehrbelege zeigen ihren damaligen Ertrag; neue Vorschauen verwenden die neue Rate.

Es gibt weiterhin keine Offline-Kampfsimulation: Abwesenheit bezahlt die nachgewiesene Farmrate, verändert aber weder Welle noch Kampfzustand. Niederlage, Farmwahl und bewusster neuer Vorstoß bleiben im bestehenden System.

## Gemessene Wirkung

Die drei vorhandenen Kauf-/Platzierungsregeln wurden unverändert mit dem tatsächlichen neuen Spielcode ausgeführt, ohne Prozessadapter. Es handelt sich um plausible feste Strategien, nicht um beobachtete menschliche Nutzer. Käufe verwenden echte Kosten und tatsächlich verdientes Geld; Ilyra und Sturmlicht werden in den entsprechenden Profilen regulär erworben.

Neue 24-h-Abreise mit Lager, anschließend vorhandenes und erhaltenes Geld nach der jeweiligen Kaufregel ausgeben und 30 Minuten weiterspielen:

| Spielweise / Ausgangswelle | Offline-Gold | Welle bei Rückkehr | Erster deutlicher Druck¹ | Erste Niederlage | Höchste geschaffte Welle nach 30 min |
|---|---:|---:|---|---:|---:|
| Gemütlich / 20 | 24.886 | 20 | W40 nach 10,4 min | 44 | 43 |
| Gemischt / 20 | 31.961 | 20 | W40 nach 8,8 min | 44 | 45 |
| Taktisch / 20 | 32.737 | 20 | W40 nach 8,5 min | 46 | 45 |
| Gemütlich / 30 | 37.740 | 30 | W40 nach 5,2 min | 46 | 45 |
| Gemischt / 30 | 42.123 | 30 | W40 nach 4,8 min | 46 | 45 |
| Taktisch / 30 | 47.358 | 30 | W44 nach 6,6 min | 46 | 45 |

¹ Vergleichsindikator: erstmals mindestens fünf verlorene Kernleben. Kein vollständiges Maß für subjektive Spannung. Die Zeiten enthalten laufende Käufe, aber keine menschlichen Denk-/Lesepausen. Der Tabellenfortschritt umfasst auch vorhandene Stärke und während des Spielens neu verdientes Gold; er ist nicht ausschließlich durch Offline-Gold gekauft.

Über diese sechs Ausgangslagen liegen die Auszahlungen nach **30 Minuten bei 1.555–2.960 Gold**, nach **zwei Stunden bei 6.222–11.839 Gold** und nach **acht bzw. 24 Stunden bei 24.886–47.358 Gold**. Alle 24 Vergleiche wurden tatsächlich abgerechnet. Genaue Beträge samt Nachweisen stehen in [integration-scenarios.json](integration-scenarios.json).

Beim frischen Einstieg erreichen die drei Profile nach etwa 30 Minuten W35 / W39 / W39. Erster deutlicher Druck entsteht nach 4,1 / 13,5 / 15,0 Minuten; die erste Niederlage bei W15 / W40 / W40. Gemischt und taktisch wurden bis 60 Minuten fortgesetzt und erreichen W41 / W43. Der gemischte Aufbau mit gezielter Reaktion auf Niederlagen wurde ebenfalls über 60 Minuten nachgeprüft. Niederlagen und längere Farmphasen bestehen ausdrücklich weiter.

**Kein übergroßer Vorteil durch dauerndes Neuversuchen in den geprüften Zuständen:** Zehn Minuten ohne weitere Käufe bringen beim sicheren Farmen 752 / 4.116 / 4.525 Gold, mit sofortigen Wiederholungsangriffen 593 / 3.828 / 4.692 Gold. Größter beobachteter Vorteil: rund 3,7 %. Das ist ein begrenzter Vergleich dreier Verteidigungen, keine allgemeine Obergrenze für jede mögliche Strategie. [Genaue Erholungs-/Wiederholungsdaten](integration-recovery.json).

**Alle 16 integrierten Läufe stimmen mit der Vorab-Hypothese überein:** drei Frischläufe, sechs W20-/W30-Rückkehrläufe, sechs Farm-/Angriffskontrollen und ein adaptiver Frischlauf. Verglichen wurden vollständige Zusammenfassungen und bei den neun Hauptfällen jede einzelne Kaufentscheidung einschließlich Zeitpunkt, Preis, Gold und Turmzustand. Nur nicht gespeicherte `undefined`-Felder wurden vor dem JSON-Vergleich entfernt. Keine nachträgliche Anpassung der Erwartungswerte an abweichende Spielresultate.

## Technische Nachweise

| Prüfung | Ergebnis / Nachweis |
|---|---|
| Gesamte bestehende Tests einschließlich sieben neuer Wirtschaftsregressionen | **460 / 460 bestanden**, [Protokoll](tests-final.txt) |
| Abschließende Sprachprüfung nach den letzten Textänderungen | **5 / 5 bestanden**, [Protokoll](i18n-final.txt) |
| Produktionsbuild einschließlich TypeScript und Pages-Paketierung | Bestanden, [Protokoll](build.txt) |
| Hypothese gegen integriertes Spiel | 16 Läufe exakt reproduziert, [Hauptfälle](scenarios.txt), [Erholung](recovery.txt) |
| Speicher-/Offline-Regressionsfälle | Alte aktive Abreisegrundlage und offener Beleg; 60/65 %, beide Caps; Reload, doppelte Claims, Bruchteile; neue Basis nach Fortsetzung; mehrfache Tab-/Schreibbesitzprüfungen in der Gesamtsuite |
| Produktionsbrowser | Rückkehr auf 1440 px / DE und 390 px / EN bestanden: echte IndexedDB, aktueller 26-%- und historischer 65-%-Anspruch, Reload vor/nach Claim, exakte einmalige Gutschrift, Pause, neue Lager-/Chroniktexte und Fortsetzung. [Messdaten](browser.json), [Desktopprotokoll](browser.txt), [Mobilprotokoll](browser-mobile.txt) |
| Frischer mobiler Einstieg | Bei 390 px / EN Startturm über echte Touch-Bedienung gebaut, Upgrade gekauft und Welle 1 abgeschlossen. Gespeichert: Rekord 1, Turmlevel 2, exakt 85 Gold = 75 Startgold + 70 Wellenbelohnung − 60 Upgrade. [Protokoll](browser-fresh.txt), [Screenshot](fresh-390.png) |

Die neuen Regressionen prüfen zudem unveränderte Gegnerarten, Mengen, Basisbelohnungen und HP für W1–40 sowie W50/75/100. Turmwerte und Preise wurden nicht geändert. Ein unabhängig mit dem unveränderten alten Hauptspiel erzeugter Schema-32-Spielstand wird vollständig verglichen: Vier Sekunden laufender Kampf und 29,7 Gold bleiben exakt erhalten; erst der nächste Versuch nutzt Regel 17. Der neue Farmnachweis ergibt dieselbe Welle und Dauer, aber genau ein Zehntel des alten Goldes.

Die Produktionsbrowserprüfung nutzt ausschließlich eigene Probe-Spielstände auf einem lokalen Test-Origin. Keine bestehenden Spielerstände werden installiert oder verändert. Der anfängliche lokale Netzwerkzugriff und eine künstlich eingefrorene Testuhr mussten im Testaufbau korrigiert werden; mobile Chronikbedienung erfolgt über die Goldanzeige, und eine pausierte Rückkehr darf den bestehenden Null-Gold-Dialog anzeigen. Dafür wurden keine Spielmechaniken geändert. Screenshots: [neuer Anspruch](return-current-1440.png), [alter Anspruch mobil](return-legacy-390.png), [Chronik](journal-current-1440.png), [Lager mobil](warehouse-legacy-390.png).

## Umsetzungspunkte

- [balance.ts](../../../../experiments/idle-bastion/src/balance.ts): gemeinsame Ertragsfunktion in Tausendstel Gold.
- [battle.ts](../../../../experiments/idle-bastion/src/battle.ts): Regel 17 / Schema 33, Erkennung bekannter Wellen, Erhalt alter laufender Rezepte.
- [farming.ts](../../../../experiments/idle-bastion/src/farming.ts): echte Zwei-Durchlauf-Prüfung nutzt dieselbe Gutschrift; konservative obere Grenze für die Einstiegswelle angepasst.
- [offline.ts](../../../../experiments/idle-bastion/src/offline.ts): neue Effizienzen, unveränderte Caps, alte Verträge und historische Defaultmigration erhalten.
- [progression-economy.test.ts](../../../../experiments/idle-bastion/tests/progression-economy.test.ts): kompakte zusätzliche Regressionen mit [echtem Altstand](../../../../experiments/idle-bastion/tests/fixtures/progression-economy-v16.json).

## Reproduktion und Grenze

Im neuen Arbeitsverzeichnis:

```powershell
npm test
npm run build
node --import tsx artifacts/idle-bastion/acceptance/progression-economy-2026-11-02/verify-scenarios.ts ../../artifacts/progression-playstyles-2026-11-02
node --import tsx artifacts/idle-bastion/acceptance/progression-economy-2026-11-02/verify-recovery.ts ../../artifacts/progression-playstyles-2026-11-02
```

Das letzte Argument verweist auf die bereits vorhandenen Ergebnisse der Vorab-Analyse. Der wiederverwendete [Simulationshelfer](simulate.ts) importiert direkt den aktuellen Spielcode. Der [Browserhelfer](check-browser.ts) verwendet die vorhandene lokale Playwright-Laufzeit und einen Produktionsserver auf Port 5268.

**Bewertung:** Der gewählte Eingriff wirkt wie geplant. Die große wiederholbare Goldflut wird deutlich begrenzt, während Rückkehrbelohnung, neue Kaufmöglichkeiten und echte Niederlagen erhalten bleiben. Nach W20 bleiben bis zu 19 neue Wellen vor dem nächsten deutlichen Druck; sie dauern hier rund 8–10 Minuten. Es wurde bewusst keine zusätzliche Schwierigkeitserhöhung vorgenommen. Ein kurzer menschlicher Spieltest muss noch beurteilen, ob sich diese Überlegenheit und die späteren Farmphasen angenehm anfühlen. Die technischen Nachweise ersetzen keine solche Nutzerabnahme und belegen keine perfekte Endlosbalance.

# Herz 2 → 3: kompakte Messung mit echter Kampfsimulation

07.11.2026 · isolierter Arbeitsstand `codex/tavern-comfy-integration` · Kampfschema 38 / Regeln 21 · Schrittweite 0,025 Sekunden.

**Die drei geprüften, automatisch zertifizierten Farmrouten benötigen rund 10 bis 11,6 Minuten simulierte aktive Kampfzeit für 30 Siege. Beide bereits auf Herz 2 stehenden Figuren erreichen das Siegeziel parallel in derselben Zeit. Eine harte Mindestdauer von fünf Minuten existiert trotzdem nicht: Der zusätzlich geprüfte Einstiegwellen-Randfall mit überlegener Verteidigung benötigt nur 4:41 Minuten.** Das sind Simulationszeiten bei 1× einschließlich der normalen Wellenpausen; menschliche Lese- und Bedienzeit wurde nicht gemessen.

## Ergebnisse

| Verteidigung | Automatisch gewählte Farmwelle | Nur Mara betreut | Beide betreut | Begegnung bei 10 / 20 Siegen |
| --- | --- | --- | --- | --- |
| Schwächerer Vergleichsstand nach Welle 28 | 23 | 696,525 s · 11:36,5 | 696,525 s · 11:36,5 | 231,300 / 463,525 s |
| Mittlerer Vergleichsstand nach Welle 40 | 23 | 602,250 s · 10:02,3 | 602,250 s · 10:02,3 | 200,675 / 401,650 s |
| Überlegener Vergleichsstand nach Welle 70 | 48 | 622,250 s · 10:22,3 | 622,250 s · 10:22,3 | 207,875 / 414,450 s |

Je Lauf: 30 tatsächlich abgeschlossene normale Livewellen, 30 unterschiedliche Versuch-IDs, null Niederlagen, null durchgelassene Gegner. Genau 60 Sekunden entfallen auf 30 normale Pausen von je zwei Sekunden. Die übrige Zeit läuft im aktiven Wellenzustand. Keine zusätzlichen Käufe, Upgrades oder manuellen Kampfzauber während der Messung. Maras gespeicherte Automatik ist aktiv, Ilyras Automatik bleibt wie in den Vorlagen aus.

Der stärkere Stand ist auf seiner automatisch gewählten **höheren** Farmwelle nicht der schnellste. Die Farmsuche optimiert sichere Goldproduktion, nicht die Anzahl persönlicher Siege pro Minute. Die Tabelle ist deshalb ein Vergleich konkreter erreichter Verteidigungsstände mit der regulären Farmwahl, kein isolierter DPS-Benchmark und keine repräsentative Spielerstatistik.

Zusätzlicher Randfall: Derselbe überlegene Stand wurde über die vorhandene Modellfunktion `setFarmWave(1)` auf der Einstiegwelle gehalten. 30 echte Siege benötigten **281,250 s = 4:41,3**, davon 60 s Pausen. Die normale Zertifizierung hätte für diesen Stand Welle 48 gewählt. Dieser ausdrücklich gesetzte Wiederholungs-/Erholungsfall belegt die fehlende technische Fünf-Minuten-Untergrenze; er ist **kein Nachweis einer üblichen Auswahl im heutigen Spielmenü** und keine gemessene normale UI-Route.

## Ausgangszustand und Besuche

Die Kampfvorlagen sind die vorhandenen bezahlten B16-Prüfsaves `control-wave28-earned.json`, `control-wave40-earned.json` und `one-storm-wave70-earned.json`. Ihre ursprünglichen Ressourcen, Positionen, Türme und Freischaltungen werden mit der aktuellen Produktionsmigration geladen. Die historischen Aufbauten wurden nicht erneut von einer frischen Partie unter Regeln 21 erspielt. Alle neu gemessenen Versuche verwenden Regeln 21. Eingangsdateien und relevante Quellstände sind in [results.json](results.json) per SHA-256 dokumentiert.

Turmliste in fester Reihenfolge: `tower-start`, `tower-03`, `tower-02`, `tower-09`, `cell-14-7`, `cell-24-7`.

| Stand | Typen | Level |
| --- | --- | --- |
| Schwächer | Waldwächter, Waldwächter, Frost, Steinschleuder, Scharfschütze, Steinschleuder | 9, 8, 2, 7, 5, 6 |
| Mittel | Waldwächter, Waldwächter, Frost, Steinschleuder, Scharfschütze, Steinschleuder | 12, 12, 2, 12, 9, 11 |
| Überlegen | Waldwächter, Waldwächter, Frost, Steinschleuder, Scharfschütze, Sturmlicht | 24, 24, 2, 24, 22, 23 |

Nur die Beziehungen werden für die Fragestellung zurückgesetzt: aktuelles `createSocial()`, reguläre einmalige Meilensteingeschenke, dann je Figur drei Gespräche und ein normales Geschenk. So entstehen **35 Punkte je Figur, null persönliche Siege, verbrauchte Gesprächsreserve, drei Berührungen Reserve und insgesamt zwei übrige normale Geschenke**. Diese acht vorbereitenden Aktionen liegen vor dem Messbeginn. Ein validierter Snapshot-Roundtrip bestätigt den gültigen Zustand; Start- und Enddateien der sieben Läufe liegen hier neben dem Bericht.

Für die betreute Figur werden am Anfang drei Haarberührungen und ein normales Geschenk ausgeführt: **35 → 39 → 43 → 47 → 58**. Bei zehn und zwanzig tatsächlichen Siegen werden die jeweiligen neuen Begegnungen begonnen, eine Antwort gewählt und abgeschlossen. Diese Statuskommandos geben keine Punkte oder Geschenke. Nach dem dreißigsten Sieg steht die Beziehung weiterhin bei 58; erst das **bewusst ausgeführte persönliche Geschenk** bringt sie auf 70 / Herz 3. Die gewöhnliche Geschenkzahl sinkt dabei nicht.

Bei einer Favoritin erreicht Mara 70 und Ilyra bleibt bei 35; Ilyras persönlicher Siegezähler steht ebenfalls auf 30, ihre fehlende Zuneigung ersetzt das aber nicht. Bei paralleler Betreuung erreichen beide 70 nach denselben 30 Kämpfen. Voraussetzung dieses Vergleichs ist, dass **beide schon zu Messbeginn Herz 2 hatten**. Für eine erst später auf Herz 2 gebrachte Figur wird kein zurückliegender Fortschritt erfunden.

Die Besuche sind sofortige Aufrufe der Produktionsmodell-Kommandos, keine echte UI-Bedienmessung: je betreuter Figur vier frühe Zuneigungsaktionen, sechs Begegnungsstatus-Kommandos und die abschließende persönliche Übergabe. Währenddessen wird die Kampfuhr nicht weitergeschaltet. Tatsächliches Lesen, Überlegen, Auswählen, Animationsanschauen und Speichern benötigt zusätzliche, hier **nicht gemessene** Zeit. Daraus wird weder eine garantierte Zahl an Sitzungen noch eine Gesamtspielzeit abgeleitet.

## Gate und Geschenke separat geprüft

- Bei null und bei 29 echten Siegen wurden Kopien des aktuellen Zustands mit vollem gewöhnlichem Vorrat von 20 Geschenken geprüft. Normale Geschenke bleiben bei 58 gesperrt (`personal-needed`), persönliche Geschenke vor dem dreißigsten Sieg ebenfalls (`gift-progress`). Beide Versuche verändern den Zustand nicht.
- Nach 30 echten Siegen ist die persönliche Übergabe erlaubt; der Kampf allein vergibt die letzten zwölf Punkte nicht.
- Ohne normales Geschenk nach Herz 2 funktioniert **35 → drei Berührungen → 47; nach drei echten Siegen → Gespräch → 55; Berührung → 58**. Im mittleren Stand dauerte das 60,225 Kampfsekunden. Vorrat weiterhin zwei; 27 weitere Siege bleiben nötig. Die Zuneigung und der Siegezähler sind damit voneinander getrennt.
- In den gemessenen 30 Siegen entstehen drei normale Geschenke, je eines nach zehn Siegen. Aus dem Startvorrat zwei werden nach der frühen normalen Übergabe und den Drops vier bei einer betreuten Figur beziehungsweise drei bei beiden. Die persönlichen Übergaben verbrauchen davon nichts. Das zeigt diese konkrete Strecke; es ist kein vollständiger Vorrats-/Economy-Sweep.
- Ein tatsächlich gewonnener Boss-15-Kampf (9,725 s) gibt keinen persönlichen Sieg. Eine tatsächlich verlorene Welle 29 (38,250 s; dazu wurden auf einer separaten Kopie die fünf verkäuflichen Türme verkauft) ebenfalls nicht. Eine separate Offline-Goldgutschrift von 12.345 Gold ändert die Beziehung nicht. Diese drei Prüfungen liegen außerhalb der Zeittabelle.

## Folgerung und Grenzen

Für die geprüften regulären Farmfälle ist der bestehende Dreißig-Siege-Schritt bereits deutlich länger als fünf Minuten. Höhere Zahlen sind daraus nicht begründet. Die neuen Begegnungen liegen hier ungefähr nach 3:20–3:51 und 6:42–7:44 Kampfminuten und geben dem Weg inhaltliche Zwischenpunkte. Ob das interessant genug ist und der Spieler die Hinweise versteht, muss die menschliche Probe klären.

Die Messung belegt ausdrücklich keine harte Mindestzeit, keine mobile Hardwareperformance und kein verlässliches Rückkehrverhalten. Andere Türme, Positionen, Farmziele, Niederlagen, Käufe und manuelle Zauber können Zeiten verändern. Für zwei Figuren wächst hier vor allem der Gesprächs-/Besuchsaufwand; die dreißig Siege werden nicht doppelt verlangt. Ob der gemeinsame gewöhnliche Vorrat subjektiv zu großzügig wirkt, ist damit nicht abschließend bewertet. Keine Balanceänderung vorgenommen.

## Reproduktion und Belege

```powershell
node C:/Users/madde/Documents/TowerDefense/node_modules/tsx/dist/cli.mjs C:/Users/madde/Documents/TowerDefense/artifacts/idle-bastion/tavern-implementation-2026-11-07/bulk4-timing/measure.ts C:/Users/madde/Documents/TowerDefense/.worktrees/tavern-comfy-integration
```

[Messskript](measure.ts) · [vollständige Ergebnisse, Versuche, Aktionen, Quellhashes und Ausschlussprüfungen](results.json). Alle eingebauten Assertions bestanden; die Messläufe benötigten rund 6,7 Sekunden Ausführungszeit des Skripts, die ausdrücklich **keine Spielerzeit** ist. Die Spielquellen wurden während des Laufs per Hash auf Veränderungen geprüft. Keine Datenbank geöffnet, keinen aktiven Nutzerspielstand gelesen oder geschrieben, keine bestehenden Quellen oder Statuspläne verändert. Keine Aussage über eine Volltestsuite.

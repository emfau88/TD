# SPIRE · Wave-Rework 2.0 / Balancing

Stand: 23.10.2026 · Branch `codex/wave-rework` · Draft-PR #1 · Ausgangspunkt `0787026`, main `76c114e`. Kein Merge, keine Pages-Veröffentlichung. W01-Nachweise bleiben unverändert als Vergleich erhalten.

## Ergebnis und Umfang

Mehr sichtbare Gegner bei gleichem Kader und vier Familien. Die HP-Grundkurve und Werte aller Gegner bis 40 bleiben identisch. Die höhere Belastung entsteht aus Menge, Mischung, Tempo und bereits vorhandener begrenzter Heilung. Keine neuen Gegner, Grafiken, Fronten oder Kampfmechaniken. Welle 40 bleibt Elite-Zwischenziel; nach ihr laufen Rezepte und Upgrades weiter.

| Welle | main / Regeln 10 | Erstes Rework / 11 | W02 / 12 |
| --- | ---: | ---: | ---: |
| 1 | 6 | 6 | 6 |
| 5 | 10 | 10 | 10 |
| 11 | 16 | 12 | 14 |
| 15 | 9 | 9 | 9 |
| 21 | 26 | 12 | 23 |
| 25 | 13 | 13 | 13 |
| 26 | 28 | 24 | 28 |
| 29 | 28 | 10 | 23 |
| 30 | 28 | 16 | 22 |
| 32 | 28 | 10 | 23 |
| 36 | 28 | 12 | 24 |
| 40 | 28 | 16 | 26 |

Fortgeschrittene Familien: Schwarm 28, Ansturm 27–28, Panzer 21–22, Unterstützung 23–24. Frühe Wellen wachsen in diese Größen. Höchstens drei Arten, insgesamt zwei Heiler und 28 Gegner pro Welle. Neue Arten behalten Einführungen und frühe Wiederholung. Goblin 19, Knochenwächter 26, Kultist 32; Vorschau und 22.477 Bytes zusätzliche Originalgrafiken unverändert.

## Spawnrhythmus und Belastung

- Schwarm: vier/fünf Gegner, 0,26 s innerhalb der Gruppe, 1,15 s Pause.
- Ansturm: drei/vier Gegner, 0,30 / 1,25 s; später häufiger schnelle Wespen statt sehr leichter Heuschrecken.
- Panzer: Dreiergruppen, 0,60 / 1,30 s, ungefähr 30–40 % gepanzerte Einheiten plus leichte Begleitung.
- Unterstützung: Vierergruppen, 0,38 / 1,35 s, höchstens zwei Heiler. Schwere Einzeltypen erhalten leichte Begleitung statt fast ausschließlich schwerer Masse.
- Elite 40: 26 Gegner in Vierergruppen, 0,42 / 1,25 s. Keine zusätzliche HP-Sonderprämie oder Bossfähigkeit.

Die eigentliche Spawnfolge dauert beispielsweise 13,36 s bei 29/32, 17,65 s bei 30 und 15,63 s bei 40. Dazu kommen Kampfweg/Schusszeit und unverändert 2 s Wellenpause. 1–5 und Bosse 15/25 behalten ihre ursprünglichen Werte, Rezepte, Spawnzeiten und Erstprämien.

Rüstungsbereinigtes HP-Volumen 29→30: main +140 %, W01 +12 %, W02 **+53 %**. W02 beseitigt den alten Extremfall, glättet bewusst nicht jede Familie auf identische Last. Rüstung, Tempo, Frost und Flächenwirkung verhindern, diesen Einzelwert als vollständige Schwierigkeit zu lesen. Insbesondere 32/36/40 bleiben belastende Gruppen und müssen subjektiv bewertet werden.

## Goldwirtschaft und Farmen

Mehr Kill-Gold ersetzt Abschlussgold innerhalb des bisherigen Begegnungsbudgets. Ab 21 läuft die gemeinsame Belohnung bis 25 auf Faktor 0,96; Boss 25 ist ausgenommen. Kein zusätzlicher Wisp-Bonus und keine Änderung an Offline-Effizienz oder Zeitlimit.

Beispiel 40: W01 **2.084 → W02 2.001 Gold**, jeweils Kill- und Abschlussgold vor Wisp; main 1.556. Die Prämie pro Welle sinkt nur knapp 4 %, während mehr Gegner längere oder anspruchsvollere Kämpfe erzeugen.

Für **33 identische Aufstellungen/Wellen, die unter 11 und 12 beide verlustfrei siegen**, sinkt die mittlere Rate von **3.886 auf 3.468 G/min (−10,8 %)**. Der Mittelwert der individuellen Quotienten entspricht −10,2 %. Damit trifft die effektive Farmstraffung ungefähr die vorgeschlagene Größenordnung, ohne pauschal 15 % von allen Belohnungen abzuziehen.

Auf den 50 Paaren, die in allen drei Versionen gewinnen, beträgt die Rate hingegen 2.587 / 3.506 / 2.840 G/min: W02 liegt rund 19 % unter W01. Dort sind auch verlustbehaftete Kämpfe enthalten. Schwache Aufstellungen verlieren damit wirtschaftlich mehr als sichere Farmaufstellungen; diese Unterscheidung darf nicht unterschlagen werden.

Die drei bezahlten Läufe bevorzugen zuletzt eine **neu nachgewiesene Welle 29** mit rund 4.701–4.909 G/min. Eine jüngere, schwierigere Welle muss kein besserer Farmplatz sein. Diese effiziente ältere Welle ist ein nützlicher Rückfallpunkt, aber auch eine verbleibende Balancefrage. Neue Zertifikate werden mit denselben zwei konservativen verlustfreien Wiederholungen ohne aktive Heldenfähigkeiten berechnet. Historische Offline-Abreisen und ausstehende Ansprüche behalten ihre ursprünglichen Raten und werden genau einmal bezahlt.

## Drei vollständige Progressionssimulationen

Reale Preise/Freischaltungen, kostenloser regulärer Startturm und 75 Startgold, keine zusätzlichen Ressourcen, kein Offline-Einkommen. Wisp wird regulär begrüßt, Mara normal verwendet, Ilyra ist nicht erforderlich. Käufe frühestens alle zwei Modellsekunden. Nach einer Niederlage farmt die Strategie bis zu mindestens 20 % mehr gewichtetem ungebufftem Turm-DPS, bevor sie erneut vorstößt. Gewichtung: Fläche ×2, Frost ×0,5, übrige ×1. Dies ist ausschließlich eine dokumentierte Teststrategie, keine neue Spielmechanik oder Erfolgs-Garantie. Lesepausen und menschliche Reaktionszeit fehlen.

| Strategie | Bis 40 | Niederlagen | Reine Farmzeit | Turmlevel in Baufolge |
| --- | ---: | ---: | ---: | --- |
| balanced | 30:33 | 3 | 6:53 | 14, 13, 3, 11, 11 |
| archers | 28:43 | 3 | 7:00 | 13, 13, 13, 3, 10, 10 |
| area | 26:11 | 2 | 4:56 | 11, 11, 3, 11, 11, 10 |

Balanced: zwei Wächter, Frost, Schleuder, Scharfschütze. Archers: drei Wächter plus die übrigen Rollen. Area: zwei Wächter, Frost, zwei Schleudern, Scharfschütze. Das ist weiterhin entspanntes automatisches Kämpfen mit einzelnen Investitions-/Vorstoßentscheidungen, aber kein kostenloser Durchmarsch mit Level 10.

Die Niederlagen liegen bei 36 und/oder 40. Mit der aggressiven alten Teststrategie „nach jedem Kauf sofort wieder vorstoßen“ entstehen **8–15 Niederlagen und 29:44–38:24 Minuten**. Diese ungünstige Variante wird in `aggressive-retries.json` separat erhalten. Bewusstes Farmen reduziert verlorene Kampfzeit. Die Kurve erzwingt weiterhin keine einzelne Turmzusammenstellung; Fläche ist bei höherer Dichte deutlich wertvoller.

## Identische Vergleichskämpfe

**270 Kämpfe**: dieselben sechs im ersten Rework bezahlten Verteidigungen (drei Strategien, nach 25/nach 40), je 15 Wellen 26–40 und drei Regelversionen. Keine Heldenboni, gleiche Positionen/Level/Preise, volle Start-Cooldowns. Es wurden keine für W02 stärkeren Aufstellungen in den Versionsvergleich eingeschleust.

| Regeln | Siege | Ohne Kernschaden | Entkommene Gegner | Verlorene Kernleben |
| --- | ---: | ---: | ---: | ---: |
| 10 | 57/90 | 36/90 | 700 | 876 |
| 11 | 81/90 | 45/90 | 462 | 576 |
| 12 | 63/90 | 33/90 | 787 | 892 |

W02 verursacht mehr Durchbrüche und etwas häufiger Kernschaden als main, bei weniger kompletten Zusammenbrüchen. Es ist gegenüber main **nicht in jeder Situation schwerer**; manche alten Extremmischungen wurden sinnvoll geglättet. Gegenüber W01 ist die Mehrbelastung klar. Eine universelle Schwierigkeit allein aus der Siegquote zu behaupten wäre falsch.

Auf den **26 in allen Versionen verlustfreien Vergleichen** steigen mittlere Gegnerdichte von 5,34 (W01) auf 7,18 und mittlere Spitzen von 9,73 auf 13,81; Wellen inklusive Pause von 24,91 auf 27,05 s. Main: 6,81 / 12,46 / 32,98 s. Das neue Spiel ist sichtbar dichter, ohne seine normale Welle auf Minutendauer zu verlängern.

Weitere **180 gezielte Vergleiche** entfernen Frost, Schleuder oder Scharfschütze aus denselben späten Aufstellungen (drei Stände × fünf Wellen × vier Varianten × drei Regeln). W02, jeweils 15 Fälle: vollständig 12 Siege / 9 sicher; ohne Frost 11 / 7; ohne Schleuder 8 / 3; ohne Scharfschütze 9 / 6. Flächenschaden profitiert stark, Frost und Durchdringung bleiben nützlich. Das sind Ablationen mit geringerem Gesamteinsatz, kein budgetgleicher Beweis gleicher Turmeffizienz.

## Endlos-Grundlage und verbleibende Grenzen

Level 20 war eine tatsächliche Kaufsperre, Stat-Cap und Preis-Cap. Diese Sperren sind aufgehoben, einschließlich gespeicherter Geschosse und Ilyras bisher ebenfalls auf 20 begrenztem Quelllevel. Nach Werkstatt II steigen Schaden und Preise weiter um 30 % / 32 %. Grafik bleibt Stufe III, Reichweite und Feuerrate bleiben sinnvoll begrenzt. Kein neuer fester Maximallevel.

Neue Regeln entfernen außerdem das HP-Plateau ab ungefähr Welle 93. Alte laufende Regeln bleiben bei ihrer damaligen HP-Grenze. Rein gegen Maschinenüberlauf existiert weiterhin eine endliche Number-Grenze; sichere ganzzahlige Geldtransaktionen und Investitionssummen werden strikt geprüft.

Die folgende Rechnung hält lediglich die ungefähre Schadensrelation eines Level-12-Wächters bei 40 aufrecht. Sie ist **keine simulierte Zielverteidigung** und keine Endgame-Balance:

| Welle | HP-Multiplikator | Illustratives Wächterlevel | Preis nächstes Upgrade | Neues Gesamtgold/Welle vor Wisp |
| --- | ---: | ---: | ---: | ---: |
| 40 | 169.6 | 12 | 3,471 | 2001 |
| 50 | 575.6 | 17 | 13,912 | 1878 |
| 75 | 12221.3 | 29 | 389,287 | 1884 |
| 100 | 259465.5 | 40 | 8,252,451 | 2084 |

Rezepte bis 250 wurden vorwärts/rückwärts auf Reproduzierbarkeit, gültige Arten, Gruppengröße und Heilergrenze geprüft; vier Familien laufen nach 40 weiter. Strukturelle echte Modellstarts und Snapshot-Fortsetzung bei 50/75/100 sind geprüft, ein bezahltes Durchspielen dieser Wellen ist **nicht** erfolgt.

**Offene Langzeitwirtschaft:** Der Belohnungsfaktor bleibt bei 4 gedeckelt und Begegnungsbudgets wachsen später kaum. Exponentielle Preise bei nahezu flachem Gold verlängern Farmzeiten stark. Jede dieser endlichen frühen/späten Wellen ist mathematisch weiter finanzierbar, aber das ergibt noch keine motivierende unbegrenzte Progression. Später separat: gemeinsame Gold-/Kosten-/Schadenskurve jenseits 40 und eine größere Zahlenrepräsentation. Wallet/Investitionen bleiben auf `Number.MAX_SAFE_INTEGER`, Offline-Abrechnungen zusätzlich auf sichere Tausendstel beschränkt. Bei extrem hohen Levels entstehen damit technische Grenzen; keine Behauptung unendlicher Präzision.

## Speicher, technische Tests und Browser

Schema 26 / Regeln 12. Regeln 11 bleiben in einem eingefrorenen Modul verfügbar, 3–10 unverändert. Versionierte alte Spawnlisten, HP, Heilzeiten, Geschosse und Belohnungen laufen bis zum Ende des Versuchs weiter. Validierte alte Sieglisten bleiben Kandidaten; die alte Rate ist ungültig, eine neue Rate entsteht nur aus dem bestehenden Prüfverfahren mit zwei sicheren aktuellen Durchläufen. Das verhindert einen unnötigen Rückfall hochrangiger Altsaves auf Farmwelle 1. Historische Offline-Ansprüche bleiben getrennt eingefroren.

- **13/13** W01-/W02-Prüfungen bestanden, darunter alle alten Rezepte, laufende Schemas 24/25, gemeinsame Heil-Lockouts, native IndexedDB/Session-Claims, Weiterbetrieb/Save bei 50/75/100, Level 21 inklusive Geschoss und Ilyra-Salve sowie Korruptions-/Zahlengrenzen.
- Breiter relevanter Vergleich: **87/94**, gegenüber **80/88** auf unverändertem `0787026`. Sechs zusätzliche Tests und eine korrigierte alte HP-Testfixture; alle sieben verbleibenden Fehler gehören zu den acht zuvor fehlgeschlagenen Fällen. Die alte HP-Fixture verwendete bei Welle 49 noch die vor B13 gültige 16-%-Kurve; sie prüft nun die echte versionierte Kurve, alle Speicher-/Historienassertionen bleiben erhalten.
- Sieben bekannte rote Fälle: v1-Migrationsfixture in `farming.test.ts`; drei Legacy-/Einführungsfälle in `onboarding.test.ts`; drei alte Speicher-/Session-Fixtures in `save-store.test.ts`. Vollständige Bezeichnungen und Fehler in `baseline-tests.txt` / `focused-tests.txt`. Die Gesamtmatrix ist **nicht grün**.
- Vier zusätzliche ausgewählte Ausbau-/Layouttests: **2/4**, Ausgangsstand **1/4**. Veraltete B12-Prerequisite und Schema-10-Vergleich in `defense-redesign` bleiben rot. Die frühere Testannahme, jede gelistete Padposition könne bebaut werden, wurde im späten Ausbaucheck durch eine konkrete gültige Vier-Turm-Verteidigung ersetzt; echte Kauf-, Folgeupgrade- und Zahlengrenzassertionen bleiben. Ein separater vollständiger alter B12-Lauf erreichte bereits unverändert ein 30-s-Zeitlimit; keine gesamte Testsuite als bestanden ausgeben.
- TypeScript und Produktions-/Pages-Build erfolgreich. Preview und tatsächliches Phaser-Spiel bei 1600×1000 / 390×844 geprüft. Vier Bewegungsrichtungen, Heilpose, Frame-Step, 1×/2×, Pause und Reload funktionieren; keine Seiten-/HTTP-Fehler.
- Dichte Ansicht stammt aus einem wirklich bezahlten Wave-40-Versuch: **21 lebende Gegner plus zwei noch in der Queue**, insgesamt Rezept 26. Keine vergrößerten Bilder oder erfundene Kampfszene. Das mobile Bild zeigt den üblichen scrollbaren Ausschnitt. Pausierter Reload erhält Gold, Versuch und Queue exakt, Schema 26/Regeln 12. Desktop-Sprites sind getrennt lesbar, mobil entsteht im sichtbaren Abschnitt keine dauerhafte Spriteüberlagerung. Kein Hardware-Smartphone-/Thermal-/FPS-Nachweis.

[Desktop Welle 40](game-wave40-desktop.png) · [Mobil Welle 40](game-wave40-mobile.png) · [Gegnervergleich Desktop](enemy-preview-desktop.png) · [Mobil](enemy-preview-mobile.png) · [Browserdaten](browser-results.json)

## Nachweise und Reproduktion

`balance-results.json` enthält Rezepte 1–100, drei bezahlte Läufe und alle 450 Vergleiche. `summary.json` enthält gepaarte Auswertungen, Dichte, Durchbrüche und Skalierungsrechnung. `played-*.json` enthalten Käufe, Niederlagen und Farmphasen. Die sechs eingefrorenen Vergleichsverteidigungen stammen aus einem erneuten Lauf des unveränderten W01-Helfers bei `0787026`; `baseline-capture.txt` und `baseline-v11/` dokumentieren diese Grundlage. Der alte W01-Bericht enthält weiterhin seine damaligen Rohdaten.

- `node --import tsx experiments/idle-bastion/tests/helpers/measure-wave-v2.ts`
- `node --import tsx --test experiments/idle-bastion/tests/wave-v2.test.ts experiments/idle-bastion/tests/wave-rework.test.ts`
- `npm run build`
- Browserhelfer `tests/browser/wave-rework.ts`, mit `SPIRE_ARTIFACTS=artifacts/idle-bastion/acceptance/wave-rework-v2`, `SPIRE_DENSITY_ONLY=1`, `SPIRE_TEST_URL=http://127.0.0.1:5195` und vorhandenem Playwright/Chrome. Isolierte Kontexte und Probe-DBs, kein Zugriff auf den Nutzerspielstand.

Visuelle Nutzerfreigabe und ungeskriptete Langzeitbewertung bleiben offen. Besonders beobachten: Farmplatz 29, Einfluss der Schleuder, Belastung bei 36/40 und Kaufentscheidungen nach einem Offline-Rückkehrbeleg.

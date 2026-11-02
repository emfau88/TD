# W26–50 · Vergleich und Entscheidungsgrundlage

**02.11.2026 · Schritte 1–5 abgeschlossen. Schritt 6 bleibt gemeinsam zu entscheiden.**

Der Gold-/Textstand ist als [`d412048`](https://github.com/emfau88/TD/commit/d4120482796fa1bc20d653b148ffc3873a610036) auf Main und veröffentlicht. **460/460 Tests**, Produktionsbuild und die Prüfung der öffentlichen Desktop-/Mobilfassung einschließlich Alt-/Neuanspruch, genau einmaliger Auszahlung, Reload, Fortsetzung und frischem Einstieg bestanden. [Pages-Lauf](https://github.com/emfau88/TD/actions/runs/41473447230), [Release-Nachweis](../idle-bastion/acceptance/progression-economy-2026-11-02/MAIN_INTEGRATION.md).

**Kein Wellenkandidat wurde in das Spiel übernommen.** Die nachfolgenden Varianten liefen nur als lokale Kopien des Kampfcodes. Empfehlung für die gemeinsame Entscheidung: **B ist die bessere Grundlage; A würde ich nicht übernehmen. B ist noch keine uneingeschränkt empfohlene Endfassung.**

## Vorgehen und festgehaltene Kriterien

Vor den Kandidatenläufen wurden [Versuchsplan und Kriterien](PLAN_PRE_RUN.md) festgehalten und per [Prüfsumme](frozen.json) eingefroren. Gewünscht: identischer Einstieg bis einschließlich Boss 25, früherer und gleichmäßigerer Druck danach, weiter nützliche Ausbauentscheidungen, keine unnötig langen Erholungsphasen und keine neue Goldquelle. 3–6 Minuten bis zu deutlichem Druck nach der ersten Rückkehr waren ein weicher Vergleichsbereich, keine starre Verlustfrist.

Wegen der zunächst nur bis W40–46 reichenden Rückkehrläufe wurden anschließend für alle drei Stände identische weitere Tageszyklen ergänzt. [Begründete Ergänzung](PLAN.md). **Kein Kandidatenparameter wurde nach Betrachtung seiner Ergebnisse verändert.**

| Stand | Isolierte Änderung |
|---|---|
| Kontrolle | Veröffentlichter Stand `d412048`, unverändert |
| A | Zusätzlicher HP-Faktor ab W26: +6 Prozentpunkte je Welle bis +60 % bei W35, danach konstant. Bestehende HP-Grundkurve, Gegnermischungen und Spawnzeiten bleiben erhalten. |
| B | Dieselbe zusätzliche Rampe auf eine geglättete nominale Begegnungsanforderung. Bestehender Diagnosewert berücksichtigt HP, Rüstung, Tempo und Heiler. Dazu höchstens 2–4 vorhandene Begleiter je Welle anders gewichtet; keine neuen Arten, Heiler, Spawnzeiten oder zusätzlichen Gegner. |

Der Diagnosewert ist **kein universeller Schwierigkeitsmesser**. Frost, Flächenschaden, Rüstungsdurchdringung, Heilung und Positionierung wirken im echten Kampf unterschiedlich. Deshalb entscheiden die folgenden echten Kampfläufe mit, nicht allein eine glatte Zahlenkurve.

Gemütlich/gemischt/taktisch verwenden dieselben bereits geprüften festen Kauf- und Platzierungsregeln, echte Preise und regulär erworbene Helden. Die W20-/W30-Abreisen wurden **unter jedem Kandidaten neu erspielt**. Zusätzlich wurden sechs Rückkehrfälle mit identischen W30-Verteidigungen der Kontrolle verglichen.

**Prüfumfang:** 9 frische 60-Minuten-Läufe mit 30-Minuten-Auswertung, 18 Rückkehrläufe, 6 Vergleiche identischer W30-Verteidigungen, 6 Farm-/Fehlversuchskontrollen, 3 Läufe mit gezielter Aufbauanpassung und 9 zusätzliche Tageszyklen: **51 Läufe**. Dazu **72 Auszahlungen** für 0,5/2/8/24 Stunden. Jeder Endzustand lässt sich exakt wiederherstellen; die Geldbilanz wird im Lauf geprüft. **W1–25 einschließlich Käufen, Einzelkämpfen und kompletten erspielten Zuständen sind identisch. Alle Wellen 26–50 wurden in jedem Stand tatsächlich gespielt.** [Prüfergebnis](checks.txt), [Messdaten](results.json).

## Aktives Spielen: früherer Druck, aber unterschiedliche Erholung

Die Reihenfolge innerhalb einer Tabellenzelle lautet immer **gemütlich / gemischt / taktisch**.

| Kennzahl | Kontrolle | A | B |
|---|---|---|---|
| Erste Welle ab W26 mit mindestens 5 verlorenen Leben | 32 / 32 / 36 | 27 / 28 / 32 | 26 / 29 / 31 |
| Erste Niederlage ab W26 | 36 / 40 / 40 | 32 / 32 / 32 | 34 / 35 / 35 |
| Höchste geschaffte Welle nach 30 min | 35 / 39 / 39 | 31 / 35 / 35 | 33 / 34 / 35 |
| Höchste geschaffte Welle nach 60 min | 39 / 41 / 43 | 35 / 35 / 35 | 34 / 35 / 39 |
| Längster Abschnitt ohne neue Bestwelle innerhalb der Stunde | 19,2 / 39,5 / 27,5 min | 21,6 / 38,2 / 40,4 min | 16,7 / 24,4 / 14,7 min |

Weniger geschaffte Wellen sind hier nicht automatisch schlecht: Frühere Herausforderungen wurden ausdrücklich gewünscht. Entscheidend ist, was nach dem Scheitern passiert.

**A verschiebt starke Grenzen nach vorne.** Alle drei Profile enden nach einer Stunde bei W35. Der taktische Aufbau schafft nach ungefähr Minute 20 keine weitere neue Welle. Der gemischte Aufbau bleibt trotz zusätzlicher Reaktion auf die Niederlage ebenfalls bei W35.

**B verteilt Fortschritt besser.** Der taktische Aufbau überwindet nacheinander W35, W37 und W39 nach etwa 14, 13 und 10 Minuten Erholung. Der gemischte Aufbau verbessert sich mit der vorhandenen einfachen Anpassung – zusätzliche Frostzone, später weiterer Schadenturm – von W35 auf **W39** nach einer Stunde. Bei der Kontrolle verbessert dieselbe Anpassung W41 auf W43; bei A bleibt es W35.

B ist nicht für alle gleich angenehm: Der gemütliche Aufbau verliert bereits in W26 mindestens fünf Leben und erreicht nach einer Stunde erst W34. Das ist keine sofortige Niederlage nach Boss 25, aber ein Punkt für den späteren menschlichen Spieltest. Es gibt keine Garantie, dass jeder Aufbau jede Stunde mehrere neue Rekorde erreichen muss.

## Rückkehr: W30 klar verbessert, W20 nur teilweise

Nach 24 Stunden Abwesenheit, Goldausgabe und weiteren regelmäßigen Käufen:

| Kennzahl über drei Spielweisen | Kontrolle | A | B |
|---|---:|---:|---:|
| W20-Abreise: Zeit bis mindestens 5 verlorene Leben | 8,5–10,2 min | 6,8–8,5 min | 7,4–8,6 min |
| W20-Abreise: erste Welle mit Lebensverlust | 39 / 40 / 40 | 32 / 32 / 36 | 34 / 35 / 37 |
| W20-Abreise: längste schadensfreie Folge neuer Wellen | 18–19 | 11–15 | 13–16 |
| W30-Abreise: Zeit bis mindestens 5 verlorene Leben | 4,8–6,6 min | 3,2–5,5 min | 3,0–4,4 min |
| W30-Abreise: Offline-Gold | 35.387–47.358 | 35.387–41.988 | 36.288–41.333 |

Bei W20 sind alle Ausgangszustände und Auszahlungen identisch: **24.814–32.737 Gold**. Unterschiede entstehen erst im anschließenden Kampf. Bei W30 verändern härtere Wellen bereits die erspielte Verteidigung und ihren sicheren Nachweis; deshalb ändern sich die Auszahlungen trotz unveränderter Offline-Regeln. Die identischen W30-Vergleichsverteidigungen bestätigen die Richtung: B erzeugt Druck nach etwa 2,9–4,4 Minuten.

Bei der W20-Rückkehr gehören etwa 1,9–2,6 Minuten zu den bewusst unveränderten W21–25. Ab dem erneuten Sieg über Boss 25 dauert es mit B noch etwa **5,5–6,7 Minuten** bis zum genannten Druckindikator, mit der Kontrolle 6,6–7,6 Minuten. Für den taktischen Rückkehrer verbessert sich diese Zeit praktisch nicht; erste kleinere Verluste treten allerdings schon bei W37 statt W40 auf.

**B macht diesen Abschnitt weniger makellos, beseitigt die große Reserve aber nicht vollständig.** Eine glatte Grundkurve allein kann einen großen Stärkevorsprung nicht aufheben, ohne zugleich den normalen aktiven Aufbau stärker zu belasten.

Die heutigen Kontrollwerte stammen aus neu erspielten Zuständen unter der veröffentlichten Goldwirtschaft. Kleine Abweichungen gegenüber früheren Tabellen sind daher nachvollziehbar: Jene Rückkehrfälle verwendeten teilweise noch vor der Goldkorrektur erspielte Ausgangsverteidigungen. Die frischen 30-Minuten-Kontrollläufe und ihre Kaufentscheidungen reproduzieren die früheren integrierten Läufe exakt.

## Nebenwirkung: häufiges Neuversuchen wird lukrativer

Je zehn Minuten ohne weitere Käufe, gemischter Aufbau an seiner ersten Niederlage ab W26:

| Stand / gescheiterte Welle | Sicheres Farmen | Sofortige neue Vorstöße | Unterschied |
|---|---:|---:|---:|
| Kontrolle / W40 | 4.116 Gold | 3.828 Gold | −7 % |
| A / W32 | 3.081 Gold | 4.338 Gold | **+41 %** |
| B / W35 | 3.081 Gold | 3.747 Gold | **+22 %** |

Ursache: Noch nicht geschaffte Wellen zahlen weiterhin volle Killbelohnungen, bekannte Farmwellen 10 %. Die neuen Schwierigkeiten verändern, wie viele Gegner vor einer Niederlage fallen und welche Welle sicher gefarmt werden kann. Das ist **ein konkreter Vergleich pro Stand, keine allgemeine Grenze für alle Aufbauten**. Es ist auch kein Reload-Fehler.

Für ein entspanntes Idle-Spiel ist der zusätzliche Anreiz zu häufigen Angriffen ein relevanter Nachteil, besonders bei A. Er rechtfertigt eine gezielte Folgeprüfung am gewählten Kandidaten, nicht automatisch eine erneute pauschale Kürzung des Goldes.

## Oberer Bereich und mehrere Tage

Taktisches Profil, Start mit der W30-Abreise, danach je 24 Stunden Abwesenheit und 30 Minuten Spiel:

| Höchste geschaffte Welle | Tag 1 | Tag 2 | Tag 3 | Tag 4 |
|---|---:|---:|---:|---:|
| Kontrolle | 45 | 52 | 55 | 60 |
| A | 43 | 49 | 52 | 52 |
| B | 44 | 49 | 52 | 53 |

Damit sind W46–50 in jedem Stand mit tatsächlich verdientem Ausbau abgedeckt. Beide Kandidaten lassen langfristigen Fortschritt zu. Ein Tag ohne neuen Rekord bei A ist für sich kein Fehler; die andere aktive Erholungsprobe spricht aber ebenfalls gegen diese Variante. Vier Tage eines taktischen Profils sind kein vollständiger Langzeitaudit.

Nominaler Druck zwischen benachbarten Wellen 26–50: Kontrolle/A schwanken ungefähr zwischen **−35 % und +114 %**, B steigt je nach Rampenabschnitt **13–19 %**. Das bestätigt die mathematische Glättung, garantiert jedoch keine für jeden Aufbau streng ansteigende tatsächliche Schwierigkeit. Alle Varianten behalten zwei bis drei Arten je Welle, ursprüngliche Heilerzahlen, Einführungen, Spawnzeiten und Gegneranzahl. B verschiebt Anteile, schafft keine völlig neue Gegnerabwechslung. Das gesamte Basisgold je Begegnung bleibt gleich; nach der bestehenden Einzelrundung weicht B höchstens **0,184 %** ab. [Rezeptvergleich](recipes.json), [Prüfung](recipe-check.txt).

## Entscheidungsvorlage für Schritt 6

| Option | Vorteil | Nachteil | Einschätzung |
|---|---|---|---|
| A unverändert übernehmen | Einfach, weniger schadensfreie Rückkehrwellen | Harte Sprünge bleiben; lange aktive Grenze bei W36; +41 % für häufige Fehlversuche | **Nicht empfohlen** |
| B unverändert übernehmen | Früherer, gleichmäßigerer aktiver Druck; gezielter Ausbau hilft; bessere W30-Rückkehr | Taktische W20-Rückkehr bleibt lange überlegen; +22 % in der Fehlversuchsprobe; subjektives Spielgefühl offen | **Vertretbare Diskussionsoption, keine pauschale Freigabe** |
| B als Grundlage gezielt nachschärfen | Erhält die nachgewiesenen Vorteile und konzentriert weitere Arbeit auf zwei konkrete Restpunkte | Eine kleine weitere Vergleichsrunde und danach Spieltest nötig | **Meine Empfehlung für die gemeinsame Entscheidung** |

Für den Nachschliff wären ausschließlich die Reserve des starken Rückkehrers im Bereich W30–38 und das Verhältnis zwischen sicherem Farmen und wiederholtem Scheitern zu untersuchen. Nicht alle Gegner erneut hochsetzen und nicht gleichzeitig Turmpreise, Goldtarife oder W1–25 verändern. Ob eine kleine Anpassung der Gruppen/Kurve ausreicht oder der Mehrertrag aktiver Angriffe bewusst akzeptiert wird, bleibt Teil der Entscheidung. Eine ungeprüfte weitere Prozentkombination wird hier nicht als Lösung ausgegeben.

**Keine Kandidatenauswahl, keine Integration und keine visuelle Freigabe vorweggenommen.** Eine spätere Übernahme braucht eine eigene Regelversion mit Bestandsschutz für laufende Wellen und alte Offline-Ansprüche. Die isolierten Kopien verwenden zur Simulation Regeln 17 und sind nicht als migrationsfertige Produktionsänderung gedacht.

## Reproduktion und Grenzen

Im Arbeitsverzeichnis mit unveränderten Spielquellen von `d412048` (spätere reine Dokumentationscommits sind zulässig), vorhandenen Node-/Python-Abhängigkeiten und noch nicht erzeugten Variantenverzeichnissen:

```powershell
python artifacts/waves-26-50-study-2026-11-02/prepare.py
node --import tsx artifacts/waves-26-50-study-2026-11-02/validate-recipes.ts
foreach ($studyVariant in 'control','A','B') {
  node --import tsx artifacts/waves-26-50-study-2026-11-02/run-suite.ts $studyVariant core
}
foreach ($studyVariant in 'control','A','B') {
  node --import tsx artifacts/waves-26-50-study-2026-11-02/run-suite.ts $studyVariant followup
  node --import tsx artifacts/waves-26-50-study-2026-11-02/run-suite.ts $studyVariant days
}
node --import tsx artifacts/waves-26-50-study-2026-11-02/review-results.ts
```

Rohläufe und die isolierten Enginekopien bleiben lokal unter `control/`, `A/`, `B/`; sie werden vom Helfer reproduziert und nicht in das Spielpaket eingebunden. 111 Hauptspiel-Quelldateien sowie alle eingefrorenen Kandidaten und Kaufcontroller wurden nach den Läufen erneut per Prüfsumme abgeglichen. Die vollständigen Reihen/Käufe der Kontrollfälle wurden hier zusätzlich mit vorhandenen früheren Rohdaten verglichen; ohne diese optionalen Altdateien prüft der Helfer die veröffentlichten Kontrollkennzahlen.

Menschliche Denk-/Lesepausen fehlen. Feste Kaufregeln ersetzen keine Nutzerstudie oder optimalen Aufbau. Fehlende neue Rekorde am Ende eines Laufs sind rechtszensierte Beobachtungen, keine nachgewiesene unendliche Sackgasse. Die späteren Tageszyklen dienen der Bereichsabdeckung, nicht einer vollständigen Balance aller Wellen über 50. Eine Zeilenendenkorrektur im Plan-Prüfartefakt war nötig; Kampfdaten, Kandidatenparameter und Ergebnisse wurden dabei nicht geändert.

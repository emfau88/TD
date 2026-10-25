# SPIRE · Early Balance Release Pass

**25.10.2026 · Empfehlung: nur Welle 10 und 20 übernehmen.** Auf dem isolierten Branch
`codex/early-balance-release`, aus [main/c9a722c](https://github.com/emfau88/TD/commit/c9a722c2d644a28885369a298a88fce410229510).
Kein Merge, kein Deployment. Der [vorherige Audit](https://github.com/emfau88/TD/blob/cde42e63f1b6b23784ae981d553517494d223c1c/artifacts/idle-bastion/acceptance/early-balance-audit/REPORT.md)
wurde gelesen; sein kostenpflichtiger Tutorial-Frost ist inzwischen überholt.

## Entscheidung

| Hypothese | Ergebnis und Entscheidung |
|---|---|
| **W10: 15 → 22 Gegner** | **Übernehmen.** Sieben Heuschrecken zusätzlich, vier Gruppen 6/6/5/5, Abstände 0,30/1,05 s. Spawnfenster 8,70 statt 8,69 s. Abschlussgold 20; voller Ertrag mit Wisp 235,4 statt 225,5. Ohne weiteren Ausbau W2/F1 steigt Kernschaden **9 → 17**, alle ausbauenden Profile gewinnen W10 ohne Schaden. Maximaler möglicher Kernschaden steigt 15 → 22: Sieg ist nicht mehr allein durch die Gegnerzahl garantiert. Der gemessene Minimalbau überlebt trotzdem bis W12. |
| **Boss 15: Kanaltempo 35 %** | **Ablehnen.** Isoliert A vier statt drei Niederlagen, B eine statt keiner; schlechtere B-Platzierung zwei neue Niederlagen. B verliert nach 69,625 s statt in 55,225 s zu gewinnen; ein Kanal bricht durch Reichweitenverlust ab. C gewinnt weiterhin. Mit W10 kombiniert bleibt B's neue Niederlage bestehen. HP, Vorbereitung, Kanaldauer und Boss 25 waren in der Probe unverändert. Für diesen Release ist der zusätzliche Verlustdruck zu hoch. |
| **Goldfaktoren W16–19: 1,60/1,80/2,00/2,20** | **Ablehnen.** Bei vier vollständigen Siegen exakt **379,5 Gold weniger** mit Wisp nach Einzelrundung. B's Zeit und Kernschaden bleiben isoliert und mit W10/W20 gleich. C verschiebt einen teuren Ausbau; kein überzeugender Spannungsgewinn. Gleichzeitig sinkt die Vergütung dieser Farmwellen. Faktoren 2,00/2,12/2,24/2,36 bleiben. |
| **W20: drei Blattkäfer → Panzerflieger** | **Übernehmen.** 25 Gegner, unveränderte Spawnzeiten; Blattkäfer an drei verteilten Positionen ersetzen. Abschlussgold um 30 Basisgold vermindert; voller Wisp-Ertrag **914,1 statt 913,0**. B verliert 2 statt 0 Kernleben, schlechte B-Platzierung 11 statt 6. B ohne weiteren Ausbau nach Boss 15 verliert 12 statt 7. Keine zusätzlichen Niederlagen; früheres Signal vor W21. Vier bekannte Arten in dieser einen Mischung, keine neue Art. |

Boss 15 und 25, Wellen 1–5, alle Turmpreise/-werte, Frost-Bausatz, Mara/Ilyra,
Forschung, Erstprämien und Offlineformeln bleiben unverändert.

## Methode und Grenzen

**74 deterministische Verläufe:** acht Profile auf acht Versuchskonfigurationen,
acht erneute Läufe der ausgewählten Produktionsfassung und zwei direkte
Wiederanlaufkontrollen. Echte `IdleBattle` mit 25-ms-Schritten, Reichweiten,
Projektilen, Rüstung, Heilung und automatischer Mara. Jede Partie beginnt mit
`newGame()`, 75 Gold, selbst gebautem Gratis-Startturm (10,5), regulären
Tutorialkäufen und kostenlosem Frost (8,5). Pflichtausgaben: **120 Gold**
(Upgrade 60 + Forschung 60); kein Tutorial-Farmdurchlauf mehr.

Jeder Tick prüft die exakte Geldbilanz einschließlich Tausendstel:
`75 + verdient − ausgegeben = Wallet`. Keine Goldzuschüsse, Offlinegutschriften,
künstlichen Freischaltungen oder Endspielstarts. Farmproben verwenden echte
Live-Clears und zwei verlustfreie Durchläufe ohne aktive Heldenboni; ihre Gewinne
gehen niemals an den Hauptlauf. Wiederaufbau und Vorstoß erfolgen über echte Methoden.

Die alten Audit-Treiber wurden dort nicht archiviert. Deshalb sind die Profile
**vergleichbar, aber keine behauptete identische Wiederholung** ihrer Kaufalgorithmen.
Hier sind Treiber, jede Kaufentscheidung, Wellenstart/-ende, Gold und Ausbau archiviert.
Zeiten sind simulierte **1×-Spielzeit**, einschließlich Pausen, Niederlagen und
Farmrunden; ohne menschliche Lese-/Menüzeit. Keine Nutzerstatistik, kein globales
Optimum und keine neue Browser-/visuelle Nutzerabnahme.

| Profil | Festgelegtes Verhalten |
|---|---|
| **A · Anfänger** | Ein Kauf je 20 s; W3/F2, zweiter W auf (17,9) bis L3, Lager vor weiterer Kampfkraft. Nach Niederlagen Levelziele 4/5/6; nach dritter Niederlage S auf (14,8). Nach Boss 15 L6, ab 20 W9/S6 und Werkstatt II. Wiederanlauf nach bezahltem Ausbau und mindestens einer abgeschlossenen Farmrunde. |
| **B · Durchschnitt** | Ein Kauf je 10 s; St (9,7), S (14,5), W4/F2/St3/S3 vor Boss 15; Lager früh, Werkstatt II ab gemeisterter 18. Ab 20 Ziel L5, bei mindestens fünf verlorenen Kernleben weitere Ziele bis L7. Reagiert auch nach Niederlagen mit Ausbau. |
| **C · Erfahren** | Ein Kauf je 5 s; St (11,5), S (14,5), Upgrades nach zusätzlicher Einzelziel-DPS/Gold bei 200 Gold Reserve; L4 vor 15, L6 danach, L8 ab 20. Zweiter F1 (14,7), Werkstatt II vor Lager, Mara auf stärkstes Einzelziel. |

Zusatzprofile: nur Tutorialausbau W2/F1; B ohne Mara; B ohne Käufe nach Boss 15;
C mit 20-s-Kaufintervall; B mit schlechterem St-Standort (17,9).
Die direkte A-Kontrolle kauft nach einer Niederlage sofort das nächste reguläre
Upgrade und fordert den Vorstoß ohne vorgeschriebene Farmrunde an.

## Vorher → Nachher

Beide Bosse werden in allen drei Hauptprofilen besiegt. A's drei Niederlagen liegen
jeweils ausschließlich bei Boss 15; B/C gewinnen sämtliche 25 Wellen im ersten Versuch.

| Profil | Niederlagen | Boss 15 besiegt | Boss 25 besiegt | Tatsächliche Farmrunden | Gold nach 15 / 25 |
|---|---:|---:|---:|---:|---:|
| A | 3 → 3 | 12:35,1 → 12:56,3 | 18:54,6 → 19:15,5 | 5 → 6 | 1.756 / 2.747,4 → 1.874,8 / 2.867,3 |
| B | 0 → 0 | 4:52,7 → 4:50,7 | 10:41,6 → 10:54,9 | 0 → 0 | 1.733,8 / 2.484,6 → 1.743,7 / 2.474,7 |
| C | 0 → 0 | 4:44,0 → 4:42,7 | 9:26,4 → 9:32,4 | 0 → 0 | 1.756,8 / 2.028,4 → 1.766,7 / 2.039,4 |

**Kein zusätzlicher Geldfarmzwang:** A's langsame Reaktionsregel verursacht 78,0 →
89,0 s Farmzeit inklusive Übergangspausen. Die verlorene Bosskampfzeit bleibt exakt
271,575 s. Die direkte Wiederanlaufkontrolle erreicht Boss 25 mit **0 → 0 Farmrunden**,
weiterhin 3 → 3 Niederlagen und 18:00,6 → 18:01,3 Gesamtzeit. Das erste Gegenupgrade
ist bereits nach der Niederlage bezahlbar. B/C sowie alle übrigen weiter ausbauenden
Kontrollprofile brauchen ebenfalls keine Farmrunde.

Kernschaden erfolgreicher Versuche (jede Welle startet mit 20 Leben):

| Profil | W10 | W12 | W13 | W14 | W15 | W20 | W21 | W24 | W25 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A | 0→0 | 4→5 | 10→10 | 7→7 | 0→0 | 0→0 | 4→4 | 0→0 | 0→0 |
| B | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→2 | 7→6 | 5→5 | 0→0 |
| C | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 | 0→0 |
| Nur W2/F1 | 9→17 | 16→16 | Niederlage→Niederlage | – | – | – | – | – | – |

Wellen 1–5 sind in den gepaarten Haupt- und Kontrollläufen **vollständig identisch**.
Ausbau und kumulative Ausgaben beim jeweiligen Boss-Sieg sind ebenfalls vor/nach gleich:

| Profil | Ausbau bei 15 / Ausgaben | Ausbau bei 25 / Ausgaben |
|---|---|---|
| A | W5, F2, W5, S4 / 2.925 | W9, F2, W9, S6 / 12.477 |
| B | W4, F2, St3, S3 / 1.900 | W7, F2, St7, S7 / 11.422 |
| C | W4, F1, St4, S4 / 1.877 | W8, F1, St7, S7, F1 / 12.338 |

W = Waldwächter, F = Frost, St = Steinschleuder, S = Scharfschütze.
Wallet nach 5/10/15/20/25, Ausbau beim Eintritt, sämtliche Käufe und Ergebnisse
stehen je Profil in den [Basisdaten](baseline/runs.json) und [Release-Daten](selected/runs.json).

## Einzel- und Kombinationsvergleich

| Konfiguration | Niederlagen A/B/C | B: Boss 15 / 25 | B: Kernschaden W20 |
|---|---:|---:|---:|
| [Basis](baseline/runs.json) | 3/0/0 | 4:52,7 / 10:41,6 | 0 |
| [Nur W10](w10/runs.json) | 3/0/0 | 4:50,7 / 10:40,2 | 0 |
| [Nur Boss-Tempo](boss15/runs.json) | 4/1/0 | 6:25,4 / 11:41,1 | 0 |
| [W10 + Boss-Tempo](w10-boss15/runs.json) | 3/1/0 | 6:09,0 / 11:25,6 | 0 |
| [Nur Gold](economy/runs.json) | 3/0/0 | 4:52,7 / 10:41,6 | 0 |
| [Nur W20](w20/runs.json) | 3/0/0 | 4:52,7 / 10:58,5 | 2 |
| [W10 + W20 · gewählt](w10-w20/runs.json) | 3/0/0 | 4:50,7 / 10:54,9 | 2 |
| [W10 + W20 + Gold](w10-economy-w20/runs.json) | 3/0/0 | 4:50,7 / 10:54,9 | 2 |

**Verbleibender Nachteil:** Die neu zertifizierte Farmrate der fertigen B-Verteidigung
sinkt von W20 / 2.860,6 auf W24 / 2.548,6 Gold/min (**−10,9 %**). A bleibt bei
2.230,0; C wechselt von W19 / 2.727,6 auf W20 / 2.621,1 (**−3,9 %**).
Das sind Ergebnisse der bestehenden begrenzten Kandidatensuche, keine global
optimierten Farmraten. Die Änderung ist für den ersten Durchlauf vertretbar,
weil keine zusätzliche Geldvorbereitung erforderlich wird; sie ist kein kostenloser
Schwierigkeitsgewinn für spätere Offlineproduktion.

## Kompatibilität und technische Abnahme

- **Schema 31 / Kampfregeln 16.** Schema 29 erhält zunächst nur den fehlenden Frostmarker;
  29/30 werden vollständig unter Regeln 15 validiert. Erst danach steigt die globale
  Version. Laufende `waveRecipeVersion`, Gegner, Queue, Geschosse, Timer, Geld,
  Gratis-Frost-Verbrauch und Live-Clear-Kandidaten bleiben erhalten.
- Alte W10/W20 und aktive Kanäle beider Bosse enden exakt wie in der aufgenommenen
  Main-Engine. Erst der nächste Versuch startet mit 16. **910 historische Begegnungen**
  (Regeln 3–15, W1–70) bleiben identisch; aktuelle W1–250 ändern nur W10/W20.
- Alte Zertifikate bleiben gültige **historische Abreisegrundlagen**, werden aber
  nicht ungeprüft zu aktuellen Raten. Neue Zertifizierung braucht zwei verlustfreie
  Kämpfe unter 16. Native IndexedDB-Migration, unveränderte reservierte Auszahlung,
  Wiederöffnung und Schutz gegen doppelte Claims geprüft.
- **95/95 gezielte Regressionen**, sechs neue Release-Tests. Vollsuite:
  **Basis 345/362, Ergebnis 351/368**, exakt dieselben **17 Altfehler**, keine neuen
  Fehler oder Skips. Historische Testfixtures ausdrücklich auf Regeln 15 eingefroren;
  Versionsgrenzen aktualisiert; die Vier-Arten-Ausnahme gilt ausschließlich für W20.
- **`npm run build` bestanden** (TypeScript, Vite, normales Pages-Paket).
  Kein Main-Push, Merge, automatischer Merge oder Veröffentlichungsworkflow gestartet.
  Technische Prüfung ersetzt keine visuelle Nutzerfreigabe.

[Prüfvergleich](checks.json) · [Basisprotokoll](baseline-tests.txt) ·
[Abschlussprotokoll](final-tests.txt) · [Gezielte Tests](targeted-tests.txt) ·
[Build](build.txt) · [Historische Referenzkämpfe](baseline/legacy-fixtures.json).

## Reproduktion

Vom Repository-Wurzelverzeichnis nach `npm ci` (Python ≥3.12, Node 22):

```text
python experiments/idle-bastion/scripts/early-balance-release.py baseline w10 boss15 w10-boss15 economy w20 w10-w20 w10-economy-w20
node node_modules/tsx/dist/cli.mjs experiments/idle-bastion/tests/helpers/measure-early-balance.ts artifacts/idle-bastion/acceptance/early-balance-release/selected
npm test
npm run build
```

Für die zwei zusätzlichen direkten A-Wiederanläufe vor den ersten beiden Befehlen
die Umgebungsvariable `SPIRE_BALANCE_PROFILES=A-direct-retry` setzen und den
Python-Aufruf auf `baseline` beschränken; danach die Variable wieder entfernen.
Der [Experimenttreiber](../../../../experiments/idle-bastion/scripts/early-balance-release.py)
extrahiert ausschließlich die festgehaltenen Main-Quellen in ignorierte
`qa/early-balance-release/`-Kopien und ändert dort nur die jeweilige Hypothese.
Der [Spielläufer](../../../../experiments/idle-bastion/tests/helpers/measure-early-balance.ts)
verwendet dieselben Kaufregeln für alle Varianten. Versuchsdaten und ausgewählte
Produktionsfassung stimmen für alle acht Hauptprofile in Käufen und Wellenverläufen
exakt überein. [Metadaten](experiment.json).

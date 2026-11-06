# Obsidianwurm: Einbau und Prüfung

06.11.2026 · Ausgangsstand `c000122` / Regeln 19. Spielcode `81c5185` auf Main/Pages,
Regeln 20 / Schema 36. [Erfolgreiche öffentliche Prüfung](PUBLIC_VERIFICATION.md).

## Ergebnis und Umfang

**W36: kurzer Mini-Boss mit 15 Körpersegmenten. W45: langer Boss mit 30.**
Jeweils ausschließlich der Wurm, ohne Begleiter. Alle sichtbaren Teile gehören
zu einem Gegner mit einer Lebensleiste. Flächenschaden trifft einmal, Kettenblitze
vervielfachen den Schaden nicht. Hintere Segmente verschwinden mit sinkenden HP;
sie geben kein Gold. Erreicht der Kopf den Kern, scheitert die Welle.

Aktuelle HP einschließlich Wellenwachstum: **52.003 / 156.219**, jeweils Tempo 42
und 10 % Rüstung. Der lange Boss wurde nach Vergleich von 700/600/550/500 Basis-HP
auf 500 gesetzt: Die 550er-Variante benötigte im flächenlastigen Rückkehrprofil
noch 28,4 Minuten bis zum Sieg; die gewählte Variante 6,4 Minuten.
Das ist eine lokale Kalibrierung dieser Begegnung, kein allgemeines Rebalancing.

Alle übrigen Wellenrezepte 1–250 sind gegen Regeln 19 gleichheitsgeprüft.
Turmwerte, Preise, Heldenwerte und allgemeine Goldquoten bleiben erhalten.
Die bisherigen Basisgoldbudgets von W36/W45 bleiben 448/431. Durch vorhandene
Rundung pro Einzelvergütung ergeben sich mit Wisp 1.892 statt 1.889,8 Gold und
1.820,5 statt 1.826 Gold. Keine Erstprämie und kein Farmnachweis für neue Wurmwellen.

## Reproduzierbare Balance

`simulate.ts` übernimmt die vorhandenen Controller aus dem Glutwerfer-Audit:
gemütlich (Kauf alle 20 s, spätere Wiederholungen), gemischt (10 s, beide Helden)
und aktiv/flächenlastig (5 s, zwei Käufe, DPS/Kosten-Auswahl mit Flächengewichtung).
Unterschiedliche Bauplätze, Reihenfolgen und Forschungen sind festgelegt.
Kein geschenktes Gold, keine kostenfreie Umplatzierung; Kaufledger und Saves
werden geprüft. „Aktiv“ bedeutet keine mathematisch optimale Bossstrategie.

Je Profil 60 Minuten Frischstart; Rückkehrfälle ab tatsächlich erspielten W30,
W35 und W44, jeweils 24 Stunden Abwesenheit und 30 Minuten Anschluss. Vorhandene
Farmzertifizierung und Offlineabrechnung werden direkt verwendet; **24 h = 8 h
Vergütung mit gebautem Lager** wird geprüft. Bei Rückkehr kauft das Profil so viel
wie seine Kaufregeln und bezahlbaren Upgrades erlauben, danach laufend weiter.
W44-Ausgangslagen können mehrere frühere Idlezyklen enthalten, nicht einen neuen
Spieler nach einem einzigen Tag. Vollständige Zustände/Käufe stehen in `selected/`.

| Profil | Rekord nach 60 min, vorher → jetzt | Offlinegold ab W30 | Rekord 30 min nach Rückkehr, vorher → jetzt | Erste Niederlage nach Rückkehr |
| --- | --- | ---: | --- | --- |
| Gemütlich | 34 → 34 | 36.288 | 40 → 40 | W41, 7,4 min |
| Gemischt | 35 → 35 | 38.604 | 43 → 43 | W41, 6,7 min |
| Aktiv / Fläche | 36 → 36 | 41.333 | 44 → 44 | W45, 10,0 min |

Der Mini-Boss ist ohne Pause eine echte Hürde: Das gemischte Profil scheitert
innerhalb der Stunde fünfmal; es scheiterte auch vorher an der alten W36. Das aktive
Profil gewinnt jetzt nach drei Niederlagen bei Minute 41,2 (vorher vier, Minute 44,5).
Nach W30 plus Tagespause wird der Mini-Boss in 21–28 Kampfsekunden besiegt.
Das ist gewollte Rückkehrüberlegenheit; die folgenden Wellen stoppen den Fortschritt
wieder. Bereits bestehende 10–14 weitere geschaffte Wellen nach W30 werden durch
dieses Paket nicht generell beseitigt, aber auch nicht vergrößert.

| Spätere Abreise nach W44, dann 24 h Pause | Offlinegold | Ergebnis beim langen Boss | Rekord nach 30 min / weitere Grenze |
| --- | ---: | --- | --- |
| Gemütlich | 60.803 | Direkt, 31,5 s Kampf | W46; erste Niederlage W47 nach 2,2 min |
| Gemischt | 58.234 | Direkt, 23,0 s Kampf | W48; erste Niederlage W49 nach 3,6 min |
| Aktiv / Fläche | 58.524 | Zwei Fehlversuche, Sieg nach 6,4 min; 38,2 s letzter Kampf | W49; anschließend Niederlage an W50 |

Im eingefrorenen W44-Aufbau ohne neue Pause verliert das gemütliche Profil knapp
(2,3 % Boss-HP übrig), das flächenlastige mit 25,7 %; das gemischte gewinnt in
33,7 s. Quelle: `hp-candidates.json`, 500er-Probe. Die längere Körperreichweite
hilft verteilten Türmen; reine Fläche vervielfacht den Schaden bewusst nicht.

**Bewertung:** Sinnvolle besondere Begegnungen, kein neuer Goldgenerator. Niederlagen
und späterer Durchbruch sind vorhanden, ohne die bisherige frühe Reichweite zu
verschieben. Der Mini-Boss muss nach einer großen Sparpause nicht jeden Spieler
erneut stoppen. Drei deterministische Spielweisen sind eine belastbare Stichprobe,
keine Garantie für sämtliche Platzierungen. Die ersetzte W36 enthielt zwei Quallen;
deren Wiederkehr verschiebt sich dadurch von W36 auf W46. Andere Heilerwellen
bleiben erhalten; kein zusätzlicher Umbau außerhalb des Auftrags.

## Technik und Überlagerungen

- In sämtlichen Wurmversuchen höchstens eine aktive Gegnerentität; keine Mischung
  mit anderen Creeps. Körperteile treten nacheinander ein, statt am Eingang zu stapeln.
- Voller 30-Segment-Körper entlang aller unterstützten Weglayouts 3/4/5 in
  Vier-Einheiten-Schritten geprüft: keine Kreuzung nicht benachbarter Teile.
  Der enge Anschluss benachbarter Segmente ist beabsichtigt. Eigene Bodentiefe
  jedes Teils erhält die Reihenfolge gegenüber Bäumen und Türmen.
- Reichweite am Körper für alle sechs Türme, Frost/Brand, Mara und Ilyra geprüft;
  Flächenschaden/Kettenblitz/Killgold genau einmal. Rundungsfehler bei vollen HP
  korrigiert: maximal 15/30 Körpersegmente plus Kopf/Schwanz.
- Alte laufende Rezepte behalten ihre bisherigen Gegner und HP. Migration entfernt
  nur W36/W45 aus zukünftigen Farmkandidaten. Historische Abreisebelege bleiben gültig.
  Zusätzlicher echter Sessiontest: 24 h Abwesenheit mitten in beiden Wurmwellen,
  identische Position/HP bei Rückkehr, normale Farmvergütung genau einmal.
- 490/490 vollständige Tests einschließlich ergänztem Sessiontest und erweiterten
  historischen Offlinefällen bestanden. TypeScript und Produktionsbuild erfolgreich.
- Sechs Browserfälle: beide Begegnungen bei 1440×900 DE, 844×390 EN und 390×844 DE.
  Bewegung, Pause, exakter Reload, Übersicht, keine HTTP-/JS-Fehler und kein
  horizontaler Überlauf. Bossanzeige im flachen Querformat rechts. Screenshots
  und `browser/results.json`; keine physische Handy- oder FPS-Messung behauptet.
  Alle sechs Fälle anschließend auch gegen den fertigen Produktionsbuild bestanden:
  `browser-production/results.json` und die dortigen Aufnahmen. Der erste Zugriff
  war durch die lokale Netzwerk-Sandbox blockiert; mit lokal erreichbarem
  Vorschau-Server erfolgreich, keine dafür nötige Änderung am Spiel.

## Wiederholen

Im Repository mit vorhandenen Abhängigkeiten:

```powershell
node --import tsx --test experiments/idle-bastion/tests/*.test.ts
node --import tsx artifacts/obsidian-worm-2026-11-06/measure.ts repeat
node --import tsx artifacts/obsidian-worm-2026-11-06/facts.ts
node artifacts/obsidian-worm-2026-11-06/summarize.mjs
npm run build
```

`baseline/` wurde vor dem Einbau mit der Engine des Ausgangscommits gemessen.
`candidate-2/` = 700, `final/` = 550, `selected/` = gewählte 500 Basis-HP beim
langen Boss. Der Name `final/` bezeichnet ausdrücklich eine verworfene Probe.
`browser.ts` verwendet die vorhandene lokale Chrome-/Playwright-Installation und
standardmäßig einen laufenden Spielserver auf Port 5210. Für den Produktionslauf:
`node --import tsx artifacts/obsidian-worm-2026-11-06/browser.ts http://127.0.0.1:5212 artifacts/obsidian-worm-2026-11-06/browser-production`.
Isolierte `probe`-Speicherstände schützen
den Hauptsave. Neue Grafikdatei im Spiel: ein geteilter 4,4-KB-Atlas, keine neuen Pakete.

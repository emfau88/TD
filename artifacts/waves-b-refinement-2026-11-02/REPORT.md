# Towers & Tantrums · begrenzter B-Nachschliff

02.11.2026 · Ausgangspunkt `507627d` / unveränderte Spielquellen `d412048`.
Status und Freigaben führt ausschließlich die Roadmap.

## Ergebnis und Entscheidung

**B mit der engen Ergänzung B3 ist eine belegte Verbesserung gegenüber dem
veröffentlichten Stand und ein kleiner Fortschritt gegenüber B.** Früherer aktiver
Druck bleibt erhalten, der starke W20-Rückkehrer wird etwa 74 Sekunden früher
deutlich gefordert, und das Wiederangreifen wird in den geprüften Situationen
nicht zusätzlich attraktiver. Der erste Entwurf B2 wurde verworfen.

Es ist keine perfekte oder für jeden Aufbau streng monotone Schwierigkeit.
Mehrere Minuten Überlegenheit nach einer Pause bleiben gewollt. Der feste mittlere
Aufbau hat noch längere Farmphasen; sinnvolle zusätzliche Türme helfen deutlich.
Eine menschliche Spielgefühl-Abnahme steht aus. Die vom Nutzer verlangte Bedingung
für Commit/Push ist nach den folgenden Messungen erfüllt; weitere Inhalte bleiben
Analyse. Kein vollständiges Rebalancing und kein neuer Wirtschaftsmechanismus.

## Tatsächliche Änderung

- Regeln 18 / Schema 34. W1–25 vollständig erhalten.
- B glättet den diagnostischen Gruppendruck anhand HP, Rüstung, Tempo und
  Heilergewicht; feste Referenz aus W26–30, zusätzliche endliche Rampe bis W35.
  Der nominale Druck steigt in W26–50 um 13–19,4 % je Welle, vorher −35 bis +114 %.
  Das ist **kein** universeller Prozentsatz für einzelne Gegner-HP oder reale Gefahr.
- Kleine bereits gemessene B-Anteilsänderungen W26–50 bleiben. B3 ergänzt nur
  W35/38 um je zwei bekannte Leerenfalter statt leichter Begleiter. Bis zu drei
  Typen, unveränderte Gegnerzahl, Spawnzeiten, Heiler und Einführungen.
- Das Basisgold bei vollständigem Sieg bleibt gleich, indem höhere Killwerte
  von der Abschlussprämie abgezogen werden. Rundungsabweichung höchstens 0,184 %.
- Ab W51 bleiben die Gruppen unverändert; dieselbe normalisierte Grundkurve
  läuft weiter, damit bei W51 kein Rücksprung entsteht. Keine neue Endlos-Rampe.
- Türme, Preise, Gegnergrundwerte, Offline-Quoten/-Caps, 10-%-Wiederholungsregel,
  Heldenfähigkeiten und 20 Leben je Versuch bleiben unverändert.

Implementierung: `src/wave-recipes.ts`, historisches Gegenstück
`src/wave-recipes-v17.ts`, `src/balance.ts`; Versionswechsel in `src/battle.ts`
und Zulassung der neuen Belegversion in `src/offline.ts`. 107 andere bisherige
TS-Laufzeitdateien sind per SHA-256 unverändert. Keine UI-/Assetänderung.

## Vergleich: aktive Spieler

Reihenfolge in den Zellen: gemütlich / gemischt / taktisch. Gleiche Kaufregeln,
Positionen und Reaktionsintervalle, ausschließlich verdiente Ressourcen.
„Druck“ = mindestens fünf verlorene Kernleben in einer Welle.

| Kennzahl | Bisher veröffentlicht | B | Endgültig B3 |
|---|---|---|---|
| Erster Druck nach W25 | 32 / 32 / 36 | 26 / 29 / 31 | 26 / 29 / 31 |
| Erste Niederlage nach W25 | 36 / 40 / 40 | 34 / 35 / 35 | 34 / 35 / 35 |
| Bestwelle nach 30 min | 35 / 39 / 39 | 33 / 34 / 35 | 33 / 34 / 35 |
| Bestwelle nach 60 min | 39 / 41 / 43 | 34 / 35 / 39 | 35 / 35 / 39 |
| Längste Zeit ohne Rekord innerhalb 60 min | 19,2 / 39,5 / 27,5 min | 16,7 / 24,4 / 14,7 min | 15,6 / 24,0 / 11,7 min |

Weniger erreichte Wellen sind hier beabsichtigter früherer Widerstand, nicht
automatisch schlechtere Progression. Der mittlere Aufbau erreicht mit einer
zusätzlichen Frostzone und weiterem Flächenschaden W39 statt W35 in 60 min.
Dieser Anpassungslauf bleibt bei B und B3 auf W39; seine längste Pause steigt
leicht von 13,6 auf 14,2 min. B3 ist also nicht in jedem Einzelwert besser.

## Rückkehr und mehrere Tage

Alle Rückkehrläufe investieren das verfügbare Gold mit demselben Profil und
kaufen anschließend weiter. Zeiten ohne menschliche Denk-/Lesepausen.

| Szenario | Bisher veröffentlicht | B | B3 |
|---|---|---|---|
| W20 → 24 h: Offline-Gold | 24.814–32.737 | identisch | identisch |
| W20 → 24 h: Zeit bis Druck | 8,5–10,2 min | 7,4–8,6 min | 7,3–8,3 min |
| Davon taktisches Profil | W40 nach 8:32 | W39 nach 8:35 | **W37 nach 7:21** |
| Taktisch: erster kleiner Lebensverlust | W40 | W37 | W36 |
| W20: längste schadensfreie Folge neuer Wellen | 18–19 | 13–16 | 13–15 |
| W30 → 24 h: Offline-Gold | 35.387–47.358 | 36.288–41.333 | 36.288–41.333 |
| W30 → 24 h: Zeit bis Druck | 4,8–6,6 min | 3,0–4,4 min | 3,5–4,4 min |
| Taktisch: Bestwelle Tag 1 / 2 / 3 / 4 | 45 / 52 / 55 / 60 | 44 / 49 / 52 / 53 | 44 / 49 / 52 / 54 |

Beim gemütlichen W30-Rückkehrer kommt Druck mit B3 etwa 41 Sekunden später als
mit B, bei den anderen beiden fast gleich. Gegenüber dem veröffentlichten Stand
werden alle drei früher gefordert. Auch B3 beseitigt nicht jede komfortable
Rückkehrphase. Eine frühe Zwangsniederlage wäre kein sinnvolles Idle-Ziel.

## Scheitern gegenüber sicherem Farmen

Je zehn Minuten am ersten Scheitern nach W25, ohne weitere Käufe. Sofortige
neue Angriffe im vorhandenen Pausenfenster gegen ausschließlich sicheres Farmen.
Die Zustände sind pro Variante tatsächlich erspielt; kein universeller Vorteil.

| Profil | Bisher veröffentlicht | B | Verworfener B2 | B3 |
|---|---:|---:|---:|---:|
| Gemütlich | +59,3 % | +19,4 % | +49,9 % | +19,4 % |
| Gemischt | −7,0 % | +21,6 % | +52,7 % | +19,9 % |
| Taktisch | +3,7 % | +17,9 % | +37,2 % | +2,9 % |

B2 ergänzte auch W31/34 und verschob unter anderem das erste mittlere Scheitern
auf W34. B3 streicht diese beiden Änderungen. Der kleine Eingriff erreicht das
Rückkehrziel weiterhin und vermeidet diesen Nachteil. **Keine zusätzliche
Goldkürzung:** Die verbleibenden Unterschiede rechtfertigen in diesem Paket
keinen neuen Mechanismus. Voll bezahlte Abschüsse auf noch ungeschafften Wellen
bleiben eine vorhandene wirtschaftliche Eigenschaft.

## Bestandsschutz und Prüfungen

- 38 isolierte B2-/B3-Läufe, acht ergänzende alte Wiederholungsproben und 19
  endgültige Integrationsläufe. Alle 19 reproduzieren B3 exakt: Kampfreihen,
  Käufe, Geld, Endzustände und Rückkehrbeträge; nur Versionsmetadaten unterscheiden
  sich. W26–50 tatsächlich gespielt, 250 Rezepte identisch zum ausgewählten Modell.
- Alle drei Einstiege bis W25 einschließlich Käufen und kompletten Zuständen
  bleiben gleich. Alle finalen integrierten Zustände überstehen exakten Reload.
- 15 tatsächliche alte Zustände aus Kontrolle: W20/W30, 60-min-Aktivspiel und
  beide Rückkehrläufe. Neue Farmbasis bleibt in 13 Fällen auf derselben Welle,
  in zwei Fällen W29 → W28. Neue Goldrate 81,3–102,5 % des alten Werts;
  kein Fall fällt auf W1. Alte bereits eingefrorene Ansprüche werden nicht gekürzt.
- Zwei viel ältere künstlich ungünstige Fixtures mit fehlender brauchbarer
  Farmvorauswahl landen hingegen sicher bei W1. Die bestehende Suche prüft nur
  vier Kandidaten, nicht jede früher geschaffte Welle. Diese Grenze wird offen
  dokumentiert; kein zusätzlicher Umbau der Farmsuche. Eine niedrigere Auswahl
  muss außerdem nicht unsicher sein: W23 kann wirtschaftlich besser sein als W31.
- Alter laufender W31-Kampf aus Regel 17: Queue, Gegner-HP, Geschosse, Geld und
  Fortsetzung exakt erhalten. Neue Rezepte erst am nächsten Versuch. Gefälschte
  alte Werte und zukünftige Formate bleiben abgewiesen.
- Desktop DE / 1440 und Mobil EN / 390: neue W35 und alte W31, genaue 24-h-Claims,
  Reload vor/nach Claim, Pause und fortlaufender Kampf geprüft; keine Konsolen-
  oder Assetfehler. [Browserdaten](browser/results.json).
- Vollständiger Stand vor Heldenzusatz: 464/464 Tests. Zwei gezielte Automatik-
  Regressionstests ergänzt; abschließend **466/466 vollständige Tests** und
  Produktionsbuild bestanden. [Testprotokoll](tests-release.txt),
  [Build](build-final.txt), [gezielte Heldenprüfung](heroes.txt).

Ältere Testannahmen über Versionsnummern und sichere/lohnende Farmwellen wurden
auf die neue Kurve angepasst; historische Kampf-/Goldvergleiche bleiben strikt.
Keine Tests wurden übersprungen. Fehlversuche beim lokalen Browserzugang und
eine zu strenge Prüfung der weiterlaufenden Abwesenheitsanzeige waren Testaufbau-
Probleme; sie erforderten keine Änderung am Spiel.

## Zusatzfragen: Leben und Automatiken

`startAttempt()` setzt pro Welle auf 20 Leben; nach einer Niederlage ebenso.
Dadurch kann eine Verteidigung eine Welle mit Schäden schaffen und die nächste
unbelastet versuchen. Dauerhafter Schaden würde mehrere kleine Fehler aufaddieren
und braucht ein durchdachtes Erholungssystem. Nur als spätere Designfrage vermerkt.

Mara: `tick()` liefert nur lebende Gegner innerhalb der tatsächlichen Turmreichweite
an `stepMara()`. Automatik benötigt außerdem aktive Welle, verfügbaren Cooldown,
Mara in Zauberreichweite und einen nicht verführten Zielturm. Ilyra:
`setIlyraAuto()` wird nach ihrer Einführung angeboten; `stepIlyra()` wählt
lebende erreichbare Gruppen, einen Flieger oder Boss. `canCastIlyra()` prüft
nochmals Gegner im Einschlagsradius. Keine automatische Aktivierung ins Leere.
Die Flugzeit kann erlauben, dass Gegner den Zielkreis vor dem Einschlag verlassen.
Kein Fähigkeitsfix notwendig, keine Laufzeitänderung an diesen Funktionen.

## Veröffentlichung und öffentlicher Browsernachweis

Spieländerung als [`4836c8a`](https://github.com/emfau88/TD/commit/4836c8a53aa97aca16ccdedc8255bd7131d3ac10)
auf `main` übertragen und gepusht, ohne neuen Branch oder Force-Push.
[Pages-Lauf 41487335069](https://github.com/emfau88/TD/actions/runs/41487335069)
ist erfolgreich. Anschließend dieselben beiden Browserfälle auf
<https://emfau88.github.io/TD/> mit getrennten Testspielständen geprüft:

- Desktop DE: neue W35, Rezept 18, genau 38.603,797 Gold aus dem gespeicherten
  24-h-Testanspruch. Beide Helden-Automatikschalter aus/ein sowie Speicherung
  und Reload bestätigt.
- Mobil EN / 390 px: laufende alte W31 mit Rezept 17 bleibt auch unter Regeln 18
  erhalten, genau 42.123,095 Gold aus dem alten Testanspruch.
- Beide Fälle: kein doppelter Claim nach Reload, mindestens fünf Sekunden
  echter Kampf, Pause und exakte Wiederherstellung; keine Konsolen-/Assetfehler.
  [Öffentliche Prüfwerte](public-browser/results.json), [Protokoll](public-browser.txt).

Reproduktionsaufruf nach Vorbereitung der lokalen Integrationsdaten:
`node --import tsx artifacts/waves-b-refinement-2026-11-02/browser.ts https://emfau88.github.io/TD artifacts/waves-b-refinement-2026-11-02/public-browser`

## Reproduktion und Grenzen

`prepare.py B2` / `prepare.py B3` bauen aus der unveränderten B-Engine des
vorigen Audits; `run.ts screen|followup|days B3` verwendet dessen unveränderte
Kaufcontroller. Die früheren Control-/B-Kopien und Rohläufe sind Voraussetzung;
auf einem frischen Checkout zuerst den vorigen Audit in einem getrennten
Checkout von `507627d` reproduzieren. Gemessene Läufe werden nicht überschrieben.
Die Integration verwendet dieselben Controller mit Import auf die aktuellen
Spielquellen. `review.ts` kontrolliert Rezepte, Ergebnisse, Quellhashes und
Migrationen; [vollständige Kennzahlen](results.json), [Prüfausgabe](review.txt),
[vorab festgelegte Methode und einzige Eingrenzung](METHOD.md).

`npm test` und `npm run build` prüfen den aktuellen Repository-Stand unabhängig
von den ignorierten Simulationskopien. Feste Kaufregeln sind keine menschliche
Nutzerstudie; vier Tage eines taktischen Profils keine unbegrenzte Langzeitbalance.
Kein Anspruch, dass jede Welle für jede Verteidigung schwerer wirkt.

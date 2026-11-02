# Glutwerfer und dezenter Forschungshinweis

02.11.2026 · Ausgangspunkt Main `f948a4e` · Towers & Tantrums.

Der Glutwerfer ist eine optionale Bodenwaffe mit eigenem Feuerball, Einschlag
und drei vorhandenen Grafikstufen. Die Forschung kostet **5.000 Gold** nach
gemeisterter W34, Frostfassung und Werkstatt II; jeder Turmbau separat **220 Gold**.
Keine weitere Ilyra-/Sturmlichtpflicht. Das ist bewusst ein teures Sparziel,
kein als universell überlegen nachgewiesener Kauf.

## Verhalten

- Basis: 22 Trefferschaden, 16 Brand/s für 3 s, Bodenradius 30, Reichweite 125,
  Schussabstand 0,95 s. Bestehende Level-/Kostenkurve. Rüstung wirkt auf beides.
- Je Gegner wirkt nur der stärkste Brand. Gleiche/stärkere Treffer erneuern ihn;
  schwächere verlängern ihn nicht. Schuss-/Brandlevel bleiben nach Upgrade/Verkauf
  erhalten; letzte Treffer zahlen genau einmal. Flieger werden nicht getroffen.
- Mara aktiviert ihren automatischen Overclock beim Glutwerfer nur für lebende
  Bodengegner in Reichweite. Ilyras bestehende Skalierung nutzt dessen direkten
  DPS, ohne Brand oder Fläche zusätzlich zu multiplizieren.
- Vorhandenes kleines **Neu/New** an Siedlung, Werkstatt und Turmeintrag, sobald
  die Forschung verfügbar ist, auch bei zu wenig Gold. Bewusstes Ansehen der
  verfügbaren Forschung speichert „gesehen“. Fehlbetrag steht im Werkstattmenü.
  Kein neues Hinweisfenster, keine zusätzliche HUD-Kachel.
- Schema 35 / Regeln 19: alte Kämpfe, Konten, Rezepte und Abreiseansprüche bleiben
  erhalten. Neue Farmnachweise berücksichtigen den echten Brandkampf. Die
  Gesehen-Markierung verändert die Farmgrundlage nicht.

Originalgrafiken aus Foozle Tower Pack 4, vorhandene CC0-Quelle:
[mitgeliefertes Readme](../../Foozle_2DS0020_Spire_TowerPack_4/Foozle_2DS0020_Spire_TowerPack_4/Readme.txt).
Keine neu generierten Grafiken und keine neuen hohen Evolutionsstufen.

## Gemessener Preis und Nutzen

Drei bestehende Kaufcontroller, echte 25-ms-Simulation, bezahlte Türme/Upgrades,
korrekte Geldbilanz. Kontrollen ohne Glutwerfer reproduzieren sämtliche Käufe
und Wellenergebnisse der bisherigen B3-Läufe exakt. Keine geschenkten Ressourcen.
Rückkehr jeweils von derselben tatsächlich erspielten W34-Verteidigung: 24 h
Abwesenheit, tatsächlicher 8-h-Cap, dann 30 Minuten Spiel einschließlich Ausgaben.
„Druck“ bedeutet mindestens fünf verlorene Kernleben in einer Welle.

| Spielweise | Rekord nach 60 min ohne / mit frühem Sparen | Sparzeit ab W34 | 24-h-Gold | Rekord 30 min nach Rückkehr ohne / mit Glut |
|---|---:|---:|---:|---:|
| Entspannt, einfache Aufstellung | 35 / 34 | 13,5 min | 37.053,754 | 42 / 40 |
| Gemischt, neben erstem Frost | 35 / 35 | 13,2 min | 38.603,797 | 43 / 42 |
| Taktisch, neben zweitem Frost | 39 / 36 | 10,9 min | 46.182,668 | 44 / 44 |

Nach Rückkehr entsteht mit Glut wieder Druck nach **82 / 110 / 164 Sekunden**
(ohne: 85 / 81 / 159 s). Die erste Niederlage liegt bei W40 / W41 / W45
(ohne: W43 / W41 / W44). Zwei taktisch platzierte Glutwerfer erreichen ebenfalls
Rekord 44, ersten Druck nach 179 s und erste Niederlage bei W45. Kein 10–20 Wellen
langer zusätzlicher Freilauf; höchstens vier völlig schadensfreie neue Wellen
am Stück im taktischen Rückkehrlauf, genau wie ohne den Turm.

**Kritische Einordnung:** Der Preis und die Bodenbeschränkung sind spürbar.
Die Sparzeit oben bezahlt nur die Forschung. Mit Bau und allen Upgrades bis Level 6 sind es insgesamt 8.545 Gold, bis Level 7 10.470 Gold.
Sofortiges Sparen bremst den aktiven Rekord; ein mittelmäßig platzierter Glutwerfer
kann schlechter sein als weitere vorhandene Upgrades. Neben Frost ist er eine
nutzbare Ergänzung: der taktische Rückkehrlauf scheitert erstmals eine Welle
später, erreicht nach 30 min aber denselben Rekord. Kein Beleg für pauschal
besseren Fortschritt. Im gemischten Aufbau steigt die geprüfte Farmrate nach
60 min von 334 auf 388 G/min; im taktischen fällt sie von 426 auf 417. Auch
Farming wird also nicht automatisch besser. **5.000 Gold liegt bewusst am hohen
Ende; einen günstigen Pflichtkauf oder dauernde Überlegenheit wollten wir vermeiden.**
Die Anzeige empfiehlt keinen sofortigen Kauf. Menschliches Spielgefühl bleibt
zu prüfen; feste Controller beweisen weder die optimale Aufstellung noch ein
globales Preisoptimum oder die gesamte Langzeitbalance.

Erster Kandidat (18 Treffer / 12 Brand / 1,1 s) war im Verhältnis zum Preis zu
schwach. Zweiter Kandidat behält Kosten/Radius/Reichweite bei und erhöht nur
diesen Turm. Zusätzlich Aufstellung und vorsichtigere Bewertung des kleinen
Brandradius im taktischen Kaufcontroller geprüft. Die ungünstigen Ergebnisse
sind erhalten, nicht aus der Auswertung entfernt. [Methode](METHOD.md),
[finale Kennzahlen](results.json), [erster Kandidat](candidate-1/results.json),
[zweiter Kandidat mit ursprünglichen Aufstellungen](candidate-2/results.json).

## Prüfungen und Reproduktion

Öffentlicher Nachweis: Glutpaket `de9576c`, anschließende kleine Menüauswahlkorrektur
`dd784fd`. [Pages-Lauf 41497308566](https://github.com/emfau88/TD/actions/runs/41497308566)
erfolgreich. Zwölf öffentliche Browserfälle auf Desktop/Deutsch und Mobil/Englisch
bestanden, einschließlich echtem Main-Altsave mit Schema 34, expliziter Sturmlichtwahl
bei ungelesener Glutforschung, einmaliger 5.220-Gold-Zahlung, Brand und Reload.
[Öffentliche Prüfwerte](public-browser/results.json), [Protokoll](browser-public.txt).
Der anfängliche automatische Wechsel zur Glutforschung überschreibt keine bewusst
gewählte andere Technologie mehr; zusätzlicher Produktionsbuild und gezielte
Desktop-/Mobilprüfung bestanden. Kein Kampf-/Preisnachschliff nach den Messungen.

**476/476 Tests**, Produktionsbuild, zehn neue gezielte Prüfungen für Forschung,
Gold/Savefehler, Neu/Gesehen, Bodenfilter/Rüstung, Brandüberlagerung, Killzahlung,
Verkauf/Reload, Mara, Ilyra, Farmnachweis und Originalgrafiken bestanden.
W1–250 behalten identische Rezepte und Gegnerzahlen. Kein Überspringen alter Tests;
bestehende Erwartungen lediglich um Migration und neue gültige Versionsnummern ergänzt.

Lokaler Desktop 1440 px / Deutsch und Mobil 390 px / Englisch: Sperren, Neu trotz
Geldmangel, Gesehen über Reload, echte Forschung und Bau mit exakt 5.220 Gold,
alle drei Originalstufen, laufender Brandkampf und exakter pausierter Reload;
keine JS-/Assetfehler. [Browserwerte](browser/results.json),
[kleiner Hinweis](browser/new-390.png), [Werkstatt mobil](browser/saving-390.png),
[Kampf](browser/combat-l7-1440.png).

Rohdaten aller drei Durchgänge und die alten Main-Kontrollen liegen komprimiert
in `evidence.json.gz` (JSON: `baseline`, `candidates.initial/values/final`).
Die finale Tabelle umfasst 13 Fälle: zehn neu ausgeführte Läufe und drei
identische wiederverwendete Rückkehrkontrollen. Insgesamt 33 neu ausgeführte
Läufe über die drei Durchgänge; keine riesige neue Infrastruktur.

Aus Repository-Wurzel, mit installierten Abhängigkeiten:

```sh
node --import tsx artifacts/glutwerfer-2026-11-02/run.ts artifacts/glutwerfer-2026-11-02/.repro
npm test
npm run build
```

Das Ergebnisverzeichnis muss neu sein; historische Messungen werden nicht
überschrieben. `browser.ts URL AUSGABEORDNER` prüft eine laufende gebaute Seite
in isolierten Probe-Saves (lokaler Playwright-/Chrome-Pfad im Script).

Wellen, Gegnerwerte, alte Türme/Preise, Offline-/Wiederholungstarife, Kernleben,
Gebäude und weitere Reserveinhalte wurden nicht geändert. Veröffentlichung und
offene menschliche Abnahme stehen ausschließlich in der Roadmap.

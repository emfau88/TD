# B16 · Sturmlicht und kleiner Wirtschaftsaudit

23.10.2026 · `codex/stormlight-b16`, eigener Worktree ab aktuellem main
`6307fb3621d8a56c1a4ae83f01fefafcf369e598`. Kein Merge, keine Pages-Veröffentlichung.
Parallele Tavernenanimationen und das separate Waldwächter-Experiment bleiben unberührt.

## Tatsächlich implementiert

Sturmlicht verwendet die vorhandenen Tower-05-Grafiken: drei Basen, drei Waffen-
und drei Projektil-/Trefferstufen. Originalrechtecke und logische Framezuordnung
aus dem vorhandenen Manifest; acht Idle- und 29 Angriffsframes je Waffenstufe.
Nearest Neighbor und derselbe Bodenanker wie beim Waldwächter. Keine neuen Turmbilder
oder Änderungen an der Ausbauoptik anderer Türme.

| Wert | Finale Implementierung |
| --- | --- |
| Forschungsfreigabe | Frostfassung, gemeisterte Welle 28, abgeschlossene Ilyra-Einführung |
| Forschung | einmalig 900 Gold in der Werkstatt |
| Separater Turmbau | 170 Gold |
| Grundschaden / Angriffsabstand / Reichweite | 26 / 1,05 s / 144 |
| Kette | höchstens drei verschiedene lebende Gegner |
| Sprung | höchstens 80 Weltpixel; nächster geeigneter Gegner, stabile UID-Sortierung bei Gleichstand |
| Schaden | 100 %, 65 %, 42,25 %; normale Rüstung auf jedem Ziel |
| Ausbau | vorhandene Skalierung und drei Grafikstufen bei 1–3 / 4–6 / 7+; keine neue Levelobergrenze |

Ein Schuss bleibt eine gespeicherte Entität über seine Sprünge. Bereits getroffene
IDs, Abschusslevel und Grundschaden bleiben erhalten. Verkauf oder Aufwertung
ändert den ausgelösten Schuss nicht; stirbt das aktuelle Ziel vorher, endet der
Schuss wie beim bestehenden Homing-System. Kein mehrfaches Treffen desselben Ziels,
keine Bossunterbrechung und kein unbegrenzter Flächenschaden.

Mara beschleunigt dieselbe Feuerratenlogik wie bei anderen Türmen. Kills und Gold
laufen über dieselbe zentrale Abrechnung. Ilyras gespeicherte Schadensquelle kennt
nun auch Turm-ID 5 und verwendet dessen einzelne ungebuffte DPS; Kettensummen werden
nicht nochmals in ihre Salve multipliziert. Forschung, Bau, Upgrade und Verkauf
verwenden die bestehende transaktionale Speicherung.

Die Werkstatt zeigt antippbare Frost-/Sturmlicht-Icons mit Erforschbar/Gesperrt/
Erforscht, Voraussetzungen und Nutzen. Forschung und Bau sind getrennte Aktionen.
Der fünfte Baukatalogeintrag nutzt dieselbe scrollbare Leiste, ohne zusätzliche HUD-Zeile.

## Rolle und gezielte Abstimmung

Die erste Parametrierung war bei gleichem Goldinvestment zu schwach. Nur der neue
Turm wurde daraufhin auf die obigen finalen Werte abgestimmt; bestehende vier
Türme, Preise, Gegner und Wellen bleiben unverändert.

**27 Vergleichskämpfe** vergleichen Waldwächter, Steinschleuder und Sturmlicht an
demselben zusätzlichen Bauplatz. Verwendet werden zwei tatsächlich bezahlte
Verteidigungsstände aus dem Audit (Rekord 40/60); der zusätzliche Turm erhält pro
Typ höchstens dasselbe Investitionsbudget. Frühere billigere Typen dürfen dafür
mehr Level kaufen. Heldenboni sind in diesen Rollenvergleichen abgeschaltet.
Die Schadenssummen sind das Trefferpotenzial nach Rüstung einschließlich Overkill;
für die Wirkung werden zusätzlich Durchbrüche und Kampfdauer erfasst.

Sturmlicht bleibt in allen gemessenen Ketten bei höchstens drei Zielen. Auf 54
erzielt der zusätzliche Turm mit gleichem Budget etwa 139.315 statt 97.852
rüstungsbereinigten Trefferschaden der Steinschleuder, mit zehn statt zwölf verlorenen
Kernleben. Auf Schwarm 60 sind es etwa 193.935 statt 176.134 Schaden, bei gleichen
13 verlorenen Leben. Auf 70 liegt die Steinschleuder mit 232.398 über Sturmlichts
210.494; beide Aufstellungen sind dort ohne weitere Upgrades zu schwach.

Damit gibt es einen Nutzen für verteilte kleine Gruppen und Flieger, ohne die
unbegrenzte Zielanzahl echter Flächentreffer zu übernehmen. Dichte Gruppen allein
erhöhen die Kette nie über drei Ziele. Der frühe Zusatzplatz nahe dem Kern wird bei
bereits abgefangenen Gegnern teils kaum benötigt; Nulltrefferfälle sind in den
Rohdaten sichtbar. Das ist kein universeller Optimalitätsvergleich aller Platzierungen.
[Alle Kämpfe und Methodikwerte](role-comparisons.json).

## Speicher, Farmen und Bestandsschutz

Schema **29 / Kampfregeln 15**. Schema 28 wird zuerst unter Regeln 14 validiert,
danach um die nicht gekaufte Forschung `stormResearched=false` ergänzt. Alte
laufende Wellen behalten ihre Rezeptversion, Queues, Gegner, Heilung, Geschosse,
Wallet und Uhren. Regeln 15 erzeugen bis 250 dieselben Wellen wie 14, einschließlich
Tutorial und Bossen. Neue Ketten-Ziellisten werden tief kopiert und streng geprüft.

Neue sichere Farmraten werden unter aktuellen Regeln frisch aus zwei ganzen
verlustfreien Durchläufen ohne aktive Heldenfähigkeiten ermittelt. Forschungsbesitz
gehört zum Fingerabdruck. Historische Offline-Ansprüche bis Regeln 14 behalten
ihre Grundlage und einmalige Auszahlung. Auswahlalgorithmus, Offline-Quoten,
Goldfaktoren und allgemeine Upgradeformeln werden nicht verändert.

## Prüfung und Ansichten

- **9/9 neue B16-Tests bestanden:** Forschung und getrennte Zahlung, Level über 20,
  drei verschiedene Ziele/Reichweite/Abfall/Rüstung, Mara, Verkauf/Upgrade während
  einer Kette, exakter Reload und Ablehnung manipulierter Daten, alte laufende
  Kämpfe, Farmnachweis/Einmalanspruch, atomarer Fehlerschreibfall, Originalgrafiken,
  Ilyras verkaufte Turm-05-Schadensquelle. [Ausgabe](stormlight-tests.txt).
- Relevante erweiterte Matrix: **135/147 bestanden**, zwölf vorbestehende Fehler.
  Die bisherigen neun bleiben getrennt aufgeführt. Die zusätzlich einbezogene
  Ilyra-Datei hat drei Fehler bereits auf unverändertem main; separat reproduziert.
  Kein neuer fehlgeschlagener Testname, keine abgeschwächte Speicherprüfung.
  [Fehlerliste/Baseline](KNOWN-TEST-FAILURES.md), [Gesamtausgabe](focused-tests.txt).
- **TypeScript und Produktionsbuild erfolgreich.** [Buildausgabe](build.txt).
- Acht echte Chrome-/Phaser-Proben: Desktop 1600×1000 und Mobil-Viewport 390×844,
  drei Stufen, vollständiger Forschungs-/Baukauf mit exakter 900+170-Gold-Abrechnung,
  aktivierbare Baukarte ohne doppelten Klickhandler, laufender Kampf,
  dichter Welle-40-Stand mit 16 lebenden Gegnern und acht exakte pausierte Reloads.
  Kein horizontaler Überlauf oder JavaScript-/HTTP-Ladefehler.
  [Browserprotokoll](browser-results.json).
- Vier zusätzliche Produktionsproben für Forschung/dichte Welle auf beiden
  Viewports; ebenfalls erfolgreiche Abrechnung und Reloads, keine Ladefehler.
  [Produktionsprotokoll](production-browser-results.json).

[Stufe I](stage1-desktop.png) · [Stufe II](stage2-desktop.png) ·
[Stufe III](stage3-desktop.png) · [Forschung Desktop](research-desktop.png) ·
[Forschung mobil](research-mobile.png) · [dichte Welle Desktop](dense-desktop.png) ·
[dichte Welle mobil](dense-mobile.png).

Die zehn bereits vorhandenen PNGs umfassen **43.431 Bytes**; sie werden unverändert
verwendet. Originalatlanten benötigen zusammen ca. **7,63 MiB** dekodiert. Effekte
sind auf 96 Trefferbilder und 48 kurze Kettenlinien begrenzt; bestehender Gegner-
und Geschossdeckel bleibt. Mobilprüfung ist eine Browseremulation auf dem Rechner,
kein Leistungsversprechen für schwache Smartphone-Hardware.

## Direkt selbst ansehen

[Lokaler Sturmlicht-Teststarter](http://127.0.0.1:5198/stormlight-check.html) öffnet
wahlweise die drei Stufen oder die Werkstatt vor der Forschung im echten Spiel.
Jeder Aufruf erstellt eine separate pausierte Probe mit neuer Datenbankkennung.
Der normale Spielstand wird nicht gelesen oder überschrieben. Der Turm steht in
der letzten Kurve vor dem Kern; mit Übersicht lässt sich dieser Bereich erreichen.
Zum Pausieren das geöffnete Werkstattfenster zuerst schließen.

Der Starter ist ausschließlich lokal und kein Vite-Produktions-Einstieg. Seine
vier Testdateien liegen ignoriert unter `.local-assets/`; vollständige Saves werden
nicht in Laufzeitquellen importiert. Nach einem frischen Checkout einmal kopieren:

```powershell
New-Item -ItemType Directory -Force experiments/idle-bastion/.local-assets
1..3 | ForEach-Object { Copy-Item "artifacts/idle-bastion/acceptance/b16/economy/one-storm-stage$_.json" "experiments/idle-bastion/.local-assets/stormlight-stage$_.json" }
Copy-Item artifacts/idle-bastion/acceptance/b16/economy/research-before.json experiments/idle-bastion/.local-assets/stormlight-research.json
npm run idle:dev -- --port 5198
```

## Wirtschaftsaudit

Siehe [separaten kompakten Audit](ECONOMY.md). Drei regulär bezahlte Fortsetzungen
von 25 bis 70, sichere Farmraten, Preise/Wartezeiten und genau zwei Vorschläge.
Es wurde **keine allgemeine Wirtschaftsänderung implementiert**.

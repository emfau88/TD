# A2 · Direkte Figurensteuerung und Ilyra-Einführung

Arbeitsbranch: **`codex/frost-kit-hero-controls`**, Basis `main` / `537b5e8`. Der kostenlose Tutorial-Frost ist bereits als eigenes Paket in **`dc39b9e`** committed ([Frost-Bericht](../frost-kit/REPORT.md)). A2 folgt separat. **Kein Merge nach main.**

## Bedienung

| Aktion | Ergebnis |
|---|---|
| Mara/Ilyra auf der Karte antippen | Auswahlring und kleine Bedienleiste; kein Menü und kein Kamerasprung |
| Freien Boden antippen | Gewählte Figur läuft; Auswahl bleibt, nächstes Ziel ersetzt den Weg |
| Dieselbe Figur erneut antippen | Bisheriges Menü ohne zusätzlichen Kamerasprung |
| Andere Figur antippen | Auswahl wechselt direkt |
| Porträt im Dock | Öffnet weiterhin direkt das bisherige Menü |
| Desktop-Rechtsklick auf freien Boden | Laufbefehl; Browsermenü nur am bedienbaren Spiel-Canvas bei Figurenwahl unterdrückt |
| Ziehen / × / Esc | Kamera verschieben / Auswahl beenden / Auswahl beenden |
| Turm oder Gebäude auswählen | Bestehende Objektaktion; kein versehentlicher Laufbefehl |
| Manueller Pausenmodus | Wegplanung für beide Figuren möglich; Laufen erst nach Fortsetzen |

Baumodus, Gebäudeplatzierung und ausdrückliches Salven-Zielen haben Vorrang. Lernpausen, Dialoge, Laden, Rückkehr und Sessionfehler sperren Bewegungsbefehle. Ein Moduswechsel verwirft wartende Pointer und prüft verzögert ausgeführte Befehle erneut.

Maras Standort bleibt von ihrer Turmzuweisung getrennt. Außerhalb der 240-Pixel-Zauberreichweite erscheint ein Hinweis; laufender Buff, Abklingzeit und Automatik werden durch Laufbefehle nicht geändert. Ilyra lässt sich während einer laufenden Salve nicht bewegen.

## Ilyras Einführung

Die Rekrutierung wählt Ilyra und zeigt ein **erreichbares freies Feld am tatsächlich verteidigten Gegnerweg**. Empfehlung, markierter Wegabschnitt und Reichweitenkreis verwenden die vorhandenen 210 Pixel. Besetzte Turmfelder, Gebäude und Waldhindernisse werden über den vorhandenen Pathfinder berücksichtigt; die Empfehlung ist keine Zwangsposition.

Nach bewusstem Zielklick zeigt die Leiste den Laufstatus. „Sternensalve zielen“ wird erst bei tatsächlicher Ankunft, Bereitschaft und erreichbaren Gegnern bedienbar. Danach folgt ein ausdrücklicher Zielklick. Keine automatische erste Salve, kein Menüwechsel nötig. Ohne Gegner wird gewartet; bei ungeeigneter Position kann der Spieler ein neues Ziel setzen. Reload während des Laufens erhält Weg und Einführungsfortschritt; nach dem Rückkehrdialog erscheint die Bedienhilfe wieder.

## Nachweise

- **Modell/Session:** 51/51 gezielte Tests erfolgreich (A2, Ilyra, Taverne, Session, Q4, Sprache). Erreichbare Empfehlungen ohne Zustandsänderung, Wegersatz, Pause/Fortsetzen, Reload, unveränderte Mara-Zuweisung und Salvensperre geprüft.
- **Gesamtsuite:** **334/351** bestanden, exakt die **17 bereits dokumentierten Altfehler**, keine neuen. [Testergebnisse und Fehlernamen](test-results.json).
- **Echter Browser:** Chrome Desktop **1280×800 / Deutsch** und emuliertes Smartphone **390×844 / Touch / Englisch**. Auswahl/erneutes Antippen, zwei Laufziele, Rechtsklick am Desktop, ungültiger Weg, Drag, HUD-Menüs, Wechsel der Figur, Turmauswahl, Baumodus, Dialog, Esc und Salvensperre bestanden. Keine JavaScript-Fehler und kein horizontaler Überlauf. [Browserprüfungen](browser.json).
- **Ilyra vollständig:** vorhandener verdienter Welle-40-Prüfstand, regulärer Bau und Ausbau der Taverne (1.200 Gold; Rest 620), anschließend Rekrutierung über die echte Tavernenoberfläche. Bewegung, Reload unterwegs, tatsächliche Ankunft und erste manuelle Salve bestanden. Das ist eine Bedienprüfung mit vorhandenem Fortschritt, kein neuer Balance-Durchlauf bis Welle 40.
- **Verzögerte Eingaben:** zusätzlich bewusst verzögerter Befehlsaufruf und zurückgehaltener Pointer auf Desktop/Touch. Wechsel zum Baumodus verwirft beide ohne Wegänderung. Diese Verzögerung wird im Browser-Test künstlich gesetzt, nicht als Messung einer bestimmten IndexedDB-Latenz ausgegeben. [Prüfwerte](input-races.json).
- **Regression:** vollständiger realer Desktop-Ablauf Q4 → Startturm → Upgrade → Werkstatt → Forschung → Gratis-Frost, einschließlich alter Vorbereitungsstände und Reloads, erfolgreich. [Tutorial](tutorial-regression.json).
- **Produktion:** TypeScript-, Vite- und Pages-Build erfolgreich. Zusätzlich unveränderter Q4-Einstieg im Produktionsbuild auf 390×844 und 320×568, Sprachwechsel, Intro-Skip, gespeicherter Bauanschluss und Ressourcenprüfung erfolgreich. [Produktionsprobe](production.json).

### Echte Spielaufnahmen

| Desktop | Hochkant |
|---|---|
| [Mara ausgewählt](screenshots/desktop-de-mara-selection.png) | [Mara ausgewählt](screenshots/mobile-en-mara-selection.png) |
| [Ilyra: Standort](screenshots/desktop-de-ilyra-position.png) | [Ilyra: Standort](screenshots/mobile-en-ilyra-position.png) |
| [Ilyra: angekommen und bereit](screenshots/desktop-de-ilyra-ready.png) | [Ilyra: angekommen und bereit](screenshots/mobile-en-ilyra-ready.png) |
| [Erste Salve](screenshots/desktop-de-ilyra-first-volley.png) | [Erste Salve](screenshots/mobile-en-ilyra-first-volley.png) |

Alle Browserläufe verwenden getrennte Probe-Slots. Nutzer-Spielstände wurden nicht verändert. A2 verändert keine Geschwindigkeiten, Reichweiten, Schadenswerte, Abklingzeiten, Freischaltungen oder Q4-Inhalte; vorhandene Bewegungs-/Zaubermodelle bleiben erhalten. Es benötigt keine zusätzlichen Savefelder gegenüber Frost-Schema 30.

**Grenzen:** Touch wurde in Chrome emuliert, nicht auf einem physischen Smartphone geprüft. Technische und visuelle Eigenprüfung ersetzen keine Nutzerfreigabe. Die 17 vorhandenen Altfehler bleiben offen und sind kein Bestandteil dieser beiden Pakete.

## Ergänzung: direkte Testeinstiege in der README

`feature-check.html` stellt drei Szenarien bereit. Frost wird über das reale Tutorial
bis zum kostenlosen Bau vorbereitet (25 Gold, Forschung bezahlt). Die beiden
Figurenproben verwenden den aufgezeichneten verdienten Welle-40-Stand aus W02:
Taverne bauen, 1.200 Gold für Stufe II bezahlen, Ilyra rekrutieren (620 Gold Rest).
Die Steuerungsprobe führt außerdem ihre tatsächliche Bewegung und erste Salve aus;
beim bereitgestellten Kampfmoment sind 1.007 Gold vorhanden. Keine Kampfwerte werden
für die Probe verändert.

- **Prüfung:** fünf neue Modell-/Speichertests bestanden; zusammen mit Figurensteuerung
  und Sprache **13/13** gezielte Prüfungen erfolgreich. Produktionsbuild erfolgreich.
  Alle drei Einstiege im gebündelten Build unter `/TD/previews/frost-hero/` geprüft:
  Chrome 1280×800/Deutsch und 390×844/Touch/Englisch, ohne JavaScript-/Ressourcenfehler
  oder horizontalen Überlauf. Testauswahl und Spielansichten visuell geprüft.
- **Speicher:** jeder Start erhält einen neuen UUID-Probe-Slot; gespeicherte Testadresse
  kann fortgesetzt werden. Ein Hauptspielstand-Sentinel blieb bei allen Einstiegen
  und beim Aufruf ohne Testparameter unverändert. Fehlender Website-Speicher führt
  zu einer verständlichen Meldung und erneut bedienbaren Startbuttons, ohne Rückfall
  auf das Hauptspiel. `VITE_FEATURE_PREVIEW=1` isoliert auch den Standardspeicher der
  Vorschau; reguläre Builds behalten ihren bestehenden Speicher.
- **Veröffentlichung:** der manuelle Branch-Workflow ergänzt nur
  `previews/frost-hero/` im letzten erfolgreichen Main-Pages-Artefakt. Aktueller Main-SHA
  muss zum Artefakt passen und wird vor Veröffentlichung erneut geprüft.
  Lokal mit dem echten Artefakt aus Lauf `40138921675` geprüft: alle **401 bestehenden
  Dateien bytegenau erhalten**. Keine Main-Übernahme; ein späteres Main-Deployment
  kann die temporäre Vorschau entfernen.
- **Öffentlich bestätigt:** Nutzer hat die Erweiterung der Pages-Freigabe um genau
  `codex/frost-kit-hero-controls` ausdrücklich genehmigt. [Workflow 40142615154](https://github.com/emfau88/TD/actions/runs/40142615154)
  hat Commit `9b745c9c39ac8b6b32453f1735ab921a310d7773` erfolgreich unter
  [Testauswahl](https://emfau88.github.io/TD/previews/frost-hero/feature-check.html)
  veröffentlicht. Alle sechs Desktop-/Mobil-Einstiege und die Speicherfehlerprüfung
  auf der öffentlichen URL erneut bestanden. Die Hashprüfung im Deployment bestätigt
  401 unveränderte Main-Dateien; die öffentliche Hauptseite war vor und nach der
  Veröffentlichung bytegleich (SHA-256 `140ab09a52dbf7d9dd23620778fd300c75405b5c9f273a748f768ea05be501ec`).
  Main bleibt `537b5e8c9cf09b696b41644da4c56dbc8633d720`; kein Merge.

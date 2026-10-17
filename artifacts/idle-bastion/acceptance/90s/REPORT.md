# P2 — Erste spielbare Fassung und G1-Probe

Stand: 17.10.2026 · Branch `codex/idle-bastion-vertical-slice` · G1 bleibt **offen**. B06 ist implementiert; die letzten B07-Varianten und das Hosting werden in dieser Fassung noch abschließend geprüft.

## Selbst ausprobieren

[Spiel starten](https://emfau88.github.io/TD/idle-bastion/) · [Neue unabhängige Probe](https://emfau88.github.io/TD/idle-bastion/?fresh=1)

Die Veröffentlichung erfolgt per GitHub Pages aus dem Testbranch. Die bestehende Anwendung wird dabei ebenfalls gebaut und bleibt am Seitenanfang erreichbar. Kein Merge nach `main`. Die GitHub-Seite war vor dieser Veröffentlichung nicht erreichbar (HTTP 404).

Im Spiel: automatischen Kampf beobachten, Waldwächter an der ausgewählten Nordostkurve bauen, einmal verbessern, unter Siedlung die Werkstatt reparieren und Frostfassung erforschen. „Frostkristall platzieren“ wählt einen freien Platz; empfohlen ist die Nordwestkurve. Alle Schritte verwenden reguläres Gold und bleiben frei entscheidbar. Werkstatt 400, Forschung 60, Frostturm 110 Gold. Weitere Upgrades bis Level 6 sind anschließend möglich.

Lokal: `npm run idle:build`, dann `npm run idle:preview` und `http://127.0.0.1:5191/`. Entwicklung: `npm run idle:dev`. Frische Proben nutzen getrennte Datenbanken; vorhandene Hauptstände werden bewahrt. Ein Reload setzt die Partie nicht zurück. Browser-/Originwechsel teilen ihre Spielstände nicht.

## B06 — Werkstatt und echte Frosttechnik

Werkstatt I ist als repariertes Gebäude auf der Karte sichtbar. Davor steht derselbe Bau mit beschädigtem Dach, dunklem Fenster und schiefem Werkzeugschild. Die Forschung erschließt einen echten zweiten Turmtyp sowie Level 4–6. Frost trifft mit eigenem Originalprojektil, verursacht Schaden und reduziert Bewegung für zwei Sekunden um 45 %; Treffer erneuern dieselbe Wirkung, stapeln sie nicht unbeschränkt. Betroffene Käfer sind blau markiert.

Kampfsnapshot 4 / Regeln 3 speichern Gebäudekauf, Technologie, Turmtyp, abgefeuerte Frostwirkung, Verlangsamungsrest und Tutorialzustand. Alte Schemas 1–3 werden validiert migriert. Mara und bestätigtes Geld bleiben erhalten; neue Farmnachweise werden konservativ ohne Mara erstellt. Historische Offline-Ansprüche behalten ihre damalige Basis. Der Farmtest wurde auch mit gebauter Werkstatt und Frost tatsächlich ausgeführt.

Genau zwei Imagegen-Bilder wurden erzeugt. [Quellen, vollständige Prompts, Referenzen und Aufbereitung](../../../../experiments/idle-bastion/docs/B06_ASSETS.md). [Maßstabprobe mit Originalobjekten](https://emfau88.github.io/TD/idle-bastion/asset-check.html). Grafikabnahme durch den Nutzer steht aus.

## B07 — Tatsächlicher Browserdurchlauf bei 1×

Codex In-app Browser, frischer eigener Spielstand `b07-final-1`, reguläre Startwerte, keine Zeitbeschleunigung, keine Konsolen-Gutschriften. Zeitangaben stammen aus der laufenden Spielanzeige; Wall-Clock-Zeiten sind zusätzlich in [browser-timing.json](browser-timing.json) enthalten. Die rund eine Sekunde Differenz umfasst Laden und UI-/Schreibbestätigung. Während des ersten Durchlaufs bis zum Frosttreffer wurde weder pausiert noch neu geladen.

| Tatsächliche Spielzeit | Aktion / Ergebnis | Gold nach Beobachtung bzw. Kauf |
| --- | --- | --- |
| 0:02 | Erste Goldgutschrift beobachtet | 83 |
| 0:03 | Eigener Waldwächter, Nordostkurve | 8 |
| 0:39 | Erstes Upgrade, Level 2 | 180 |
| 1:23 | Werkstatt regulär repariert | 8 |
| 1:41 | Frostfassung erforscht | 2 |
| 2:04 | Frostkristall an der Nordwestkurve gebaut und erste reale Verlangsamung beobachtet | 10 |

Das erste Upgrade war bereits früher bezahlbar; die tatsächliche Kaufentscheidung lag bei Sekunde 39. Die Werkstatt ist kein zeitgesteuertes Geschenk. Ihre ursprüngliche Preis-Hypothese 220 wurde auf 400 korrigiert, um den gesamten Kaufablauf zusammen mit Gegnergold und Folgekosten abzustimmen. Die Technologievorführung liegt innerhalb der vorgesehenen kurzen Fortsetzung bis ungefähr 150 Sekunden.

[Erste Minute](first-minute-1366x768.jpg) · [Werkstattbau](workshop-1366x768.jpg) · [Erster Frosttreffer](frost-1366x768.jpg) · [Erhaltener Stand nach Reload](reload-1366x768.jpg) · [Große Ansicht](workshop-1920x1080.jpg) · [Tatsächlicher Kamera-Drag](camera-drag-1920x1080.jpg)

## Spielweisen und zusätzliche Prüfung

Der vollständige Tutorialverlauf wurde im Browser bei 1× nachgewiesen. Die zwei zusätzlichen Browservarianten werden noch ergänzt. Ergänzend enthält [model-comparison.json](model-comparison.json) drei deterministische, legale Modellläufe: Tutorial, zusätzliche Turmausgabe an anderem Platz und drei Minuten ohne Käufe. Alle drei gelangen mit gültigem Speicherstand zur Frostwirkung. Der Modellvergleich ist ausdrücklich kein Echtzeit-Playtest. Reproduzierbar mit `node --import tsx scripts/idle-opening.ts`.

Hinweise folgen tatsächlichen Käufen und Treffern. Alternative Plätze zählen ebenso; bereits erledigte Aktionen und verkaufte ehemalige Türme setzen die Aufgaben nicht zurück. Überspringen bleibt gespeichert. Wiederanzeigen ändert weder Geld noch Kampf oder Freischaltungen. Im Browser blieb nach Wiederanzeigen derselbe Goldsaldo von 10 erhalten.

Nach Pause und Reload: 10 Gold, Welle 7, Spielzeit 2:04, Mara mit vier Sekunden verbleibendem Übertakten unverändert. Der wiederhergestellte Canvas-Ausschnitt war bytegleich. Werkstatt und Frost blieben gebaut bzw. erforscht. Der Rückkehrbeleg respektierte die gespeicherte Pause. Details: [browser-verification.json](browser-verification.json).

Die echte Browseransicht wurde bei angeforderten 1366×768 (gemeldet 1367×768 durch Rundung) und 1920×1080 angesehen, jeweils ohne horizontalen Überlauf. Kamerazoom, tatsächlicher Links-Drag im vergrößerten Ausschnitt und Rückkehrbutton wurden bedient. Der Drag verschob sichtbar die Welt, bewahrte Gold, Spielzeit und Auswahl und kaufte keinen Turm. Der zusätzliche mittlere-Maus-Drag wurde nicht gesondert nachgestellt. Die unzureichenden früheren B05-Prüfaussagen sind im [P1-Bericht](../p1/REPORT.md#b05--startlichtung-mara-und-kompakte-bedienung) ausdrücklich korrigiert.

## Technische Checks

- `npm run idle:test`: 123/123 bestanden, einschließlich sechs neuer Werkstatt-, Frost-, Save- und Tutorialprüfungen.
- `npm run idle:build`: TypeScript und statischer Produktionsbuild erfolgreich.
- `npm run build`: bisherige Anwendung und vorhandener Offline-Packager erfolgreich; bestehende Chunkgrößenwarnung, kein Buildfehler.
- Keine erfassten Browserwarnungen oder Fehler in der geprüften P2-Fassung.

Keine erneute vollständige Langzeit-, klassische Referenz- oder Offline-Matrix durchgeführt. Diese gehört zu späteren Paketen; B07 prüft die betroffenen Speicher-/Farmfälle und die reale Anfangsverteidigung.

## Drei wichtigste Grenzen für die Nutzerprobe

1. Die kleine Desktop-Seitenleiste ist beim Turmverwalten dicht; einzelne Hinweise oder Mara-Details können Scrollen benötigen. Kampf, Karte und Kontextreiter bleiben sichtbar.
2. Der erste Kauf lässt bewusst mehrere Platzierungen zu. Ein Frostturm weit hinter einer starken vorderen Verteidigung kann später zum ersten Treffer kommen; das Tutorial empfiehlt deshalb die freie Nordwestkurve.
3. Dies ist der erste Kreislauf, noch kein gestalteter 15-Minuten-Verlauf. Wisp, Lager, Boss, Gebietsfreischaltung und Werkstatt II fehlen absichtlich bis G1. Langzeitbalance und zusätzliche Politur sind nicht abgenommen.

**Nächster Schritt nach fertiger Testveröffentlichung: Nutzer spielt diese Fassung und entscheidet ausdrücklich über G1. B08 bleibt gesperrt.**

# Spire – vier Regionen

Stand: 17.10.2026. Das aktuelle Spiel baut auf der bestätigten Originalgrafik und der abgenommenen Waldkarte auf. **Der alte Hain, Laternenmoor, Spiegelwinter und Windbruch** sind ohne Freischaltung sofort spielbar. Jede Karte enthält acht Türme, Wisp und Mara sowie 10 Wellen. Die drei neuen Regionen sind umgesetzt und gezielt geprüft; ihre visuelle Nutzerabnahme steht aus. Mobile Optimierung ist zurückgestellt.

## Starten

Im übergeordneten Projektordner einmal `npm ci` und `npm run reference:regions:build` ausführen. Anschließend `REGIONEN STARTEN.cmd` doppelklicken. Die erzeugte Einzeldatei enthält Code und Grafiken; zum Spielen wird kein Server benötigt.

Der Launcher öffnet weiterhin `reference/Spire-Wald.html`, damit die bisherige lokale Speicheradresse erhalten bleibt. `Spire-Regionen.html` enthält denselben Vier-Karten-Stand; `WALDKARTE STARTEN.cmd` funktioniert ebenfalls weiter. Browser können Spielstände für verschiedene lokale Dateipfade getrennt behandeln.

Entwicklung: `npm run reference:dev`, dann `http://127.0.0.1:5180/woodland.html` öffnen. Der normale Einstieg `/` bleibt die Vergleichsversion der drei Originalkarten.

## Erste Gegner-Grafikprobe

Die Laternenqualle ist nach Abnahme ihrer Seitenprobe mit drei Ansichten, Bewegung, Heilaktion und Tod im Moor integriert. Eine separate Vorschau zeigt alle Zustände neben Originalfliegern und bietet zwei Kampfwellen ohne Spielstandzugriff: `npm run reference:enemy:build`, danach `GEGNERPROBE STARTEN.cmd`. Entwicklung: `/enemy-preview.html`. Pause, 1×/2×, Einzelbilder und 100/120-%-Zoom stehen bereit. [Ergebnis und Prompts](../artifacts/enemies/lantern-jelly/v1/REPORT.md).

## Succubus-Vorschau

Rosenspiegel ist als Bodengegner in Windbruch integriert. Die aktuelle dritte Grafikfassung korrigiert den Schrittwechsel beim Hoch-/Runterlaufen und ergänzt ein eigenes höher aufgelöstes Tanzsheet; ihre Nutzerabnahme steht aus. `npm run reference:succubus:build`, danach `SUCCUBUS STARTEN.cmd` oder `reference/Spire-Succubus.html` öffnen. Entwicklung: `/succubus-preview.html`. Zustands- und Richtungswahl, Pause, 1×/2×, Einzelbilder und 100/120-%-Zoom stehen bereit. Die Tanzprobe zeigt das separate 128er Sheet zum Betrachter; das größere Fenster im Kampf verwendet dieselben feineren Posen. Die Kampffläche bietet einen kurzen echten Kampf, automatische Pause beim ersten Verführungseffekt, Gegenwehr, Turmverkauf und Windbruch-Prüfwellen 6/9. Die Vorschau greift nicht auf Nutzer-Spielstände zu. [Aktuelles Ergebnis, Quellen und Grenzen](../artifacts/enemies/succubus/production-v3/REPORT.md).

## Bedienung und Speicherung

- „Karten“ öffnet die freie Auswahl aller vier Regionen. Jede behält ihren eigenen Fortschritt und ihre letzte Bauphase.
- Mausrad über der Karte: 100–120 % Zoom in 5-%-Schritten. Mit gedrückter mittlerer Maustaste die vergrößerte Karte verschieben. Klick auf die Prozentanzeige setzt den Zoom zurück.
- 1–8: Turm wählen, freie Fläche anklicken: bauen. Turmklick öffnet Aufwertung, Zielpriorität und Verkauf; U wertet auf.
- Q/E: Wisp/Mara wählen, Boden anklicken: bewegen. Brücken verbinden die Inseln; Wasser, Eisflächen, Abgründe und große Dekoration sind gesperrt.
- Während einer Welle M drücken, dann mit Wisp einen Ort oder mit Mara einen Turm auswählen. Die Fähigkeit wirkt nach der Ankunft.
- Wisp verlangsamt nahe Bodengegner für 5 Sekunden um 45 %, mit 22 Sekunden Abklingzeit. Mara erhöht die Feuerrate eines Turms für 8 Sekunden um 50 %, mit 30 Sekunden Abklingzeit.
- N: Welle starten, F: 1×/2×, Leertaste: Pause, Esc: Auswahl lösen.

Speicherkennung bleibt `spire-woodland-v1`. Bestehende Waldstände werden in die getrennten Kartenplätze übernommen. Nach Neuladen „Gespeicherte Bauphase laden“ wählen. Unterbrochene Wellen beginnen erneut mit der letzten Bauphase; abgeschlossene Spiele behalten ihr Ergebnis. Entwicklungsserver und lokale HTML-Datei haben unterschiedliche Browser-Speicherbereiche.

Die Fassung hat **10 Wellen mit 133 Gegnern auf Wald-/Winterkarte, 138 im Moor und 135 in Windbruch**, einschließlich zweier verstärkter Bossvarianten in Welle 5 und 10. Alle acht Originalgegner kommen vor: Blattkäfer, Feuerkäfer, Skorpion, Magmakrabbe, Flugheuschrecke, Feuerwespe, Panzerflieger und Leerenfalter. Die letzten vier sind Fluggegner. Hinzu kommt die Laternenqualle als fliegender Moorheiler in Welle 4 (eine), 7 und 9 (je zwei). Alle zwei Sekunden heilt sie bis zu zwei verletzte Nachbarn um sechs Lebenspunkte im Radius 100; Heiler und Bosse sind ausgeschlossen, die Wirkung mehrerer Heiler stapelt nicht.

Rosenspiegel ergänzt Windbruch um je eine Bodeneinheit in Welle 6 und 9: 140 Leben, Tempo 42, 10 % Rüstung, 30 Gold, zwei Lebenspunkte Schaden am Ziel. Innerhalb von 200 Spieleinheiten hält sie an und bereitet 0,8 Sekunden lang eine Verführung vor. Danach feuert ein Turm 4,5 Sekunden lang 40 % langsamer. Herzfaden, Herzsymbol und vergrößertes Tanzfenster machen den Effekt sichtbar. Ausschalten der Succubus, Turmverkauf, Reichweitenverlust und Wellenende lösen ihn. Elf Sekunden Quellen-Abklingzeit und sechs Sekunden Turmschutz nach Ende verhindern Dauerverführung; parallele Verführung desselben Turms ist ausgeschlossen. Maras 50-%-Verstärkung und die Schwächung ergeben gemeinsam 90 % der normalen Feuerrate.

Damit sind zehn Gegnertypen aktiv. Ältere Bauphasen ab zehn bereits abgeschlossenen Wellen behalten Türme, Gold und Begleiter und setzen vor dem neuen Finale an; Sterne bleiben erhalten. Die historische Originalvergleichsversion behält ihre damaligen acht Gegnertypen und 20 Wellen.

## Build und gezielte Prüfung

Alle Befehle im übergeordneten Projektordner ausführen:

```text
npm run reference:regions:build
node node_modules/tsx/dist/cli.mjs --test reference/tests/region-waves.test.ts reference/tests/new-regions.test.ts reference/tests/marsh.test.ts reference/tests/woodland.test.ts reference/tests/atlas.test.mjs
```

Der Build prüft TypeScript, baut `reference/woodland-dist/` und die beiden identischen Einzeldateien. Originalgrafiken werden bytegenau mit den Foozle-Paketen verglichen; neue Laufzeitatlanten werden deterministisch aus den erhaltenen Rohdateien aufgebaut. Die erzeugten HTML-Ausgaben und Asset-Kopien werden nicht doppelt versioniert. `npm run reference:test` führt bei Bedarf die gesamte Referenzprüfung aus.

Die Succubus-Mechanik wurde in Fassung 2 mit 17 Logik-/Speicher-/Durchspielprüfungen abgesichert. Die aktuelle Änderung betrifft Grafik und Darstellung; dafür werden zwei Atlasprüfungen, TypeScript, beide Build-Pakete und die betroffenen Browseransichten gezielt geprüft. Die Regionen- und Succubus-Ausgaben enthalten nun 94 Spielgrafiken und sieben UI-Bilder. Die unveränderten Spielregeln werden nicht erneut vollständig durchgetestet. Eine technische Prüfung ersetzt keine visuelle Nutzerabnahme; tatsächliche Ergebnisse stehen im jeweiligen Produktionsbericht.

Nachweise: [Wald](../artifacts/m2/REPORT.md), [Moor](../artifacts/m3/REPORT.md), [Winter](../artifacts/m3-winter/REPORT.md), [Windbruch](../artifacts/m3-wind/REPORT.md). [Grafikvertrag](STYLE_GUIDE.md), [Roadmap](../ROADMAP.md).

## Erhaltene Vergleichsstände

- **M0:** rekonstruierter Quellstand vom 14.10.2026 mit drei Originalkarten, keine wiedergefundene historische Programmdatei. `npm run reference:build`, danach `ORIGINAL SPIEL STARTEN.cmd`. [Herkunft und Grenzen](../artifacts/m0/REPORT.md), [Baum-/Wasserkorrektur](../artifacts/terrain-fix/REPORT.md).
- **M1:** abgenommene Grafikprobe mit Originalgelände, Wisp, Mara und Turmkampf. `npm run reference:style:build`, danach `GRAFIKPROBE STARTEN.cmd`. [Prüfbericht](../artifacts/m1/REPORT.md).
- **M2:** vom Nutzer abgenommene Waldkarte, Git-Tag `m2-woodland-playable`. [Prüfbericht](../artifacts/m2/REPORT.md).

Der ältere Fünf-Karten-Entwurf im übergeordneten `src/` und seine Story bleiben erhalten. Das aktuelle Spiel wird in `reference/src/` weiterentwickelt. Mondwarte und Storyausarbeitung sind noch nicht Bestandteil dieses neuen Stands.

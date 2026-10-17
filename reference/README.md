# Spire – vier Regionen

Stand: 16.10.2026. Das aktuelle Spiel baut auf der bestätigten Originalgrafik und der abgenommenen Waldkarte auf. **Der alte Hain, Laternenmoor, Spiegelwinter und Windbruch** sind ohne Freischaltung sofort spielbar. Jede Karte enthält acht Türme, Wisp und Mara sowie 10 Wellen. Die drei neuen Regionen sind umgesetzt und gezielt geprüft; ihre visuelle Nutzerabnahme steht aus. Mobile Optimierung ist zurückgestellt.

## Starten

Im übergeordneten Projektordner einmal `npm ci` und `npm run reference:regions:build` ausführen. Anschließend `REGIONEN STARTEN.cmd` doppelklicken. Die erzeugte Einzeldatei enthält Code und Grafiken; zum Spielen wird kein Server benötigt.

Der Launcher öffnet weiterhin `reference/Spire-Wald.html`, damit die bisherige lokale Speicheradresse erhalten bleibt. `Spire-Regionen.html` enthält denselben Vier-Karten-Stand; `WALDKARTE STARTEN.cmd` funktioniert ebenfalls weiter. Browser können Spielstände für verschiedene lokale Dateipfade getrennt behandeln.

Entwicklung: `npm run reference:dev`, dann `http://127.0.0.1:5180/woodland.html` öffnen. Der normale Einstieg `/` bleibt die Vergleichsversion der drei Originalkarten.

## Erste Gegner-Grafikprobe

Die neue Laternenqualle ist als separate animierte Seitenprobe im echten Moor verfügbar, mit Originalfliegern zum Vergleich. Im Projektordner `npm run reference:enemy:build` ausführen, danach `GEGNERPROBE STARTEN.cmd` öffnen. Entwicklung: `/enemy-preview.html`. Pause, 1×/2×, Einzelbilder und 100/120-%-Zoom stehen bereit. Diese Probe verändert keine Spielstände; Heilmechanik und weitere Animationen sind noch nicht integriert. [Ergebnis, Prompt und offene Schritte](../artifacts/enemies/lantern-jelly/v1/REPORT.md).

## Bedienung und Speicherung

- „Karten“ öffnet die freie Auswahl aller vier Regionen. Jede behält ihren eigenen Fortschritt und ihre letzte Bauphase.
- Mausrad über der Karte: 100–120 % Zoom in 5-%-Schritten. Mit gedrückter mittlerer Maustaste die vergrößerte Karte verschieben. Klick auf die Prozentanzeige setzt den Zoom zurück.
- 1–8: Turm wählen, freie Fläche anklicken: bauen. Turmklick öffnet Aufwertung, Zielpriorität und Verkauf; U wertet auf.
- Q/E: Wisp/Mara wählen, Boden anklicken: bewegen. Brücken verbinden die Inseln; Wasser, Eisflächen, Abgründe und große Dekoration sind gesperrt.
- Während einer Welle M drücken, dann mit Wisp einen Ort oder mit Mara einen Turm auswählen. Die Fähigkeit wirkt nach der Ankunft.
- Wisp verlangsamt nahe Bodengegner für 5 Sekunden um 45 %, mit 22 Sekunden Abklingzeit. Mara erhöht die Feuerrate eines Turms für 8 Sekunden um 50 %, mit 30 Sekunden Abklingzeit.
- N: Welle starten, F: 1×/2×, Leertaste: Pause, Esc: Auswahl lösen.

Speicherkennung bleibt `spire-woodland-v1`. Bestehende Waldstände werden in die getrennten Kartenplätze übernommen. Nach Neuladen „Gespeicherte Bauphase laden“ wählen. Unterbrochene Wellen beginnen erneut mit der letzten Bauphase; abgeschlossene Spiele behalten ihr Ergebnis. Entwicklungsserver und lokale HTML-Datei haben unterschiedliche Browser-Speicherbereiche.

Die neue Fassung hat **10 Wellen mit insgesamt 133 Gegnern je Karte**, einschließlich zweier verstärkter Bossvarianten in Welle 5 und 10. Alle acht Gegnertypen kommen vor: Blattkäfer, Feuerkäfer, Skorpion, Magmakrabbe, Flugheuschrecke, Feuerwespe, Panzerflieger und Leerenfalter. Die letzten vier sind Fluggegner. Ältere Bauphasen ab zehn bereits abgeschlossenen Wellen behalten Türme, Gold und Begleiter und setzen vor dem neuen Finale an; Sterne bleiben erhalten. Die historische Originalvergleichsversion behält ihre damaligen 20 Wellen.

## Build und gezielte Prüfung

Alle Befehle im übergeordneten Projektordner ausführen:

```text
npm run reference:regions:build
node node_modules/tsx/dist/cli.mjs --test reference/tests/region-waves.test.ts reference/tests/new-regions.test.ts reference/tests/marsh.test.ts reference/tests/woodland.test.ts reference/tests/atlas.test.mjs
```

Der Build prüft TypeScript, baut `reference/woodland-dist/` und die beiden identischen Einzeldateien. Originalgrafiken werden bytegenau mit den Foozle-Paketen verglichen; neue Laufzeitatlanten werden deterministisch aus den erhaltenen Rohdateien aufgebaut. Die erzeugten HTML-Ausgaben und Asset-Kopien werden nicht doppelt versioniert. `npm run reference:test` führt bei Bedarf die gesamte Referenzprüfung aus.

Nachweise: [Wald](../artifacts/m2/REPORT.md), [Moor](../artifacts/m3/REPORT.md), [Winter](../artifacts/m3-winter/REPORT.md), [Windbruch](../artifacts/m3-wind/REPORT.md). [Grafikvertrag](STYLE_GUIDE.md), [Roadmap](../ROADMAP.md).

## Erhaltene Vergleichsstände

- **M0:** rekonstruierter Quellstand vom 14.10.2026 mit drei Originalkarten, keine wiedergefundene historische Programmdatei. `npm run reference:build`, danach `ORIGINAL SPIEL STARTEN.cmd`. [Herkunft und Grenzen](../artifacts/m0/REPORT.md), [Baum-/Wasserkorrektur](../artifacts/terrain-fix/REPORT.md).
- **M1:** abgenommene Grafikprobe mit Originalgelände, Wisp, Mara und Turmkampf. `npm run reference:style:build`, danach `GRAFIKPROBE STARTEN.cmd`. [Prüfbericht](../artifacts/m1/REPORT.md).
- **M2:** vom Nutzer abgenommene Waldkarte, Git-Tag `m2-woodland-playable`. [Prüfbericht](../artifacts/m2/REPORT.md).

Der ältere Fünf-Karten-Entwurf im übergeordneten `src/` und seine Story bleiben erhalten. Das aktuelle Spiel wird in `reference/src/` weiterentwickelt. Mondwarte und Storyausarbeitung sind noch nicht Bestandteil dieses neuen Stands.

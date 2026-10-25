# SPIRE · Veröffentlichung des Early Balance Release

25.10.2026: Der Nutzer hat Merge, Push und Pages-Veröffentlichung ausdrücklich beauftragt. Der geprüfte Commit [d84a345](https://github.com/emfau88/TD/commit/d84a34504535b49f5127f0eb0090a65fdda58db6) wurde per Fast-forward von `c9a722c` nach `main` übernommen. Keine Konflikte und keine weiteren Spiel- oder Balanceänderungen. Der anschließende Nachweis-Commit ergänzt ausschließlich diesen Bericht, Prüfdaten und Roadmap. Archivierte Textprotokolle sind auf UTF-8/LF und entfernte Leerzeichen am Zeilenende normalisiert; Ergebnisse unverändert.

[Main-Deployment 40211593873](https://github.com/emfau88/TD/actions/runs/40211593873): **erfolgreich**. [Öffentliches Spiel](https://emfau88.github.io/TD/).

| Prüfung | Ergebnis |
|---|---|
| Welle 10 | 22 Gegner, sieben zusätzliche Heuschrecken, Gruppen 6/6/5/5; durch die erneut bestandenen Release-Regressionen bestätigt. Aktueller W10-Snapshot lädt öffentlich mit Regeln 16 und bleibt beim Reload exakt erhalten. |
| Welle 20 | Genau drei Blattkäfer durch Panzerflieger ersetzt, weiterhin 25 Gegner und unveränderte Spawnzeiten, Abschlussgold um 30 Basisgold kompensiert. Regression und öffentlicher W20-Save-/Reload bestanden. |
| Alte laufende Kämpfe | Echte Schema-30-W10-/W20-Stände migrieren zu Schema 31 / Regeln 16; laufender Versuch behält Wellenregeln 15. Gold, Ausbau, Gegner, Warteschlange und Kampfzustand bleiben beim Laden und Reload gleich. |
| Neue Spielstände | Neue Partie bei 1280×800 und 390×844, Intro übersprungen, Bauzustand gespeichert und exakt wieder geladen. Vier zusätzliche W10-/W20-Proben mit alten/neuen Regeln. |
| Offline-Fortschritt | Zwei kontrollierte neunstündige Abwesenheiten mit real verdienten alten/aktuellen Farmnachweisen; jeweils unveränderte achtstündige Lagergrenze. Historisch 892.499,216 Gold, aktuell 795.154,285 Gold exakt einmal gutgeschrieben. Danach aktiver Nachweis Regeln 16; Pause/Reload zahlt keinen Betrag doppelt aus. Ausschließlich isolierte Browserprofile, keine echten Nutzerspielstände verändert. |
| Vollsuite | **351/368 bestanden, 17 bekannte Fehler, keine neuen, keine Skips.** Fehlernamen mit der archivierten Main-Basis verglichen; dabei nur die frühere doppelte Windows-Zeichenkodierung zweier Namen dekodiert. Alle sechs Release-Regressionen enthalten. |
| Produktionsbuild | `npm run build` lokal und im Pages-Workflow erfolgreich. Alle **20 öffentlich geladenen JS-/CSS-Dateien bytegleich** mit dem heruntergeladenen Artefakt des erfolgreichen Main-Workflows. |
| Öffentlicher Einstieg | Spielgrafik, Intro, Bedienung, Speichern und Reload funktionieren. Keine JavaScript-Ausnahmen oder HTTP-Fehler bei Spielressourcen. |

Die strikte Konsolenprüfung des ersten Gesamtlaufs schlug ausschließlich wegen Chromes automatischer Anfrage nach `https://emfau88.github.io/favicon.ico` mit HTTP 404 an. Alle fachlichen Browserassertionen davor waren bestanden. Eine separate Wiederholung identifizierte genau diese URL außerhalb von `/TD/` und bestätigte den fehlerfreien Spieleinstieg/Reload. Die Meldung wurde nicht als Spielfehler verschwiegen und nicht durch eine zusätzliche Änderung im Release behoben. Desktop-Chrome mit mobiler Emulation; keine physische Smartphone-Prüfung oder zusätzliche visuelle Nutzerabnahme.

Nachweise: [Regressionen](main-release/regressions.json), [vollständiger Testlauf](main-release/tests.txt), [Build](main-release/build.txt), [Browser-Gesamtlauf einschließlich Favicon-Prüfschranke](main-release/live-checks.json), [gezielte Live-Wiederholung mit Fehler-URL](main-release/smoke.json), [CI-/Live-Dateihashes](main-release/integrity.json), [Hochkanteinstieg](main-release/live-fresh-390.png), [Welle 20 nach Reload](main-release/live-wave20-reload-390.png).

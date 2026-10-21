# T03 — Zuneigung, Geschenke und Balancebasis

21.10.2026 · ausdrücklich nach T02 beauftragt · `codex/idle-bastion-vertical-slice`.

Reines Daten-/Regelpaket, keine T04-Oberfläche. Snapshot 24 erhält bisherige Partie/Offline-Ansprüche und ergänzt soziale Punkte, gemeinsame Geschenke, Meilensteinansprüche und gespeicherte Belohnungsbudgets. Kein Einfluss auf Schaden, Farmnachweise oder Offline-Erträge. Mara-Assets unverändert.

Erste Balance: Herzen bei 10/35/70/110/160; je 20 Minuten laufendem Spiel je Figur 2×8 Gesprächs-, 3×4 Berührungs- und höchstens 2×12 Geschenkpunkte. Ein Geschenk je zehn gewonnene normale Live-Wellen, maximal zwei je Abschnitt, Vorrat maximal 20. Je ein einmaliges Start-/Boss-15-/Boss-25-Geschenk, belegte Veteranenansprüche eingeschlossen. Pause/Abwesenheit/Uhrzeit/Reload erzeugen keine neuen Budgets. Vier Abschnitte mit je einem Geschenk ergeben rechnerisch 160 Punkte; ohne Geschenke sechs. Die vollständige Erlebnisbalance bleibt T04/T05 vorbehalten.

Gezielte Prüfungen: `tavern-social.test.ts` und `tavern.test.ts` (19 Tests) grün; bestehende Ilyra-/Siedlungsprüfungen (12 Tests) ebenfalls grün. Migration alter Saves mit/ohne Taverne und Ilyra sowie früher Stufe I; Gold/Kampfdaten/Offline-Ansprüche erhalten. Einmalansprüche, Aktionsgrenzen, gemeinsame Geschenke, Wiederholungsversuche, Lagerlimit, zwei parallele Figuren, Uhrsprünge, Reload, Pausen, Farmprobe, ungültige Saves, doppelte Klicks und atomare Rücknahme bei Speicherfehlern geprüft. Künstliche Grenzfixtures ausdrücklich keine vollständigen manuell gespielten Kampagnen.

TypeScript und Produktionsbuild bestanden. Lokaler Browser startet nach Reload mit ruhiger Mara-Einführung; keine erfassten Browserfehler. Keine neuen visuellen Assets, keine echte Mobilgeräteprüfung. Soziale Interaktion bleibt bis T04 ohne bedienbare Oberfläche; Testaufrufe erfolgen ausschließlich im Modell, kein öffentlicher Test-/Cheat-Einstieg hinzugefügt.

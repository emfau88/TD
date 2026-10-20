# B17a – Siedlung am Kern

20.10.2026 · `codex/idle-bastion-vertical-slice`

Neue Partien starten mit 40×16 Zellen und freier Siedlungszone südöstlich des Kerns. Westweg/Kern bleiben gleich. Bestehende Partien bleiben bis zum bewusst gewählten kostenlosen Umzug auf ihrer alten Karte. Gebäudelevel, Gold, laufende Gegner, Projektile und Türme bleiben erhalten. Der alte Lichtungskauf bleibt als 900-Gold-Anrechnung für den späteren Ostzugang gespeichert. Keine Ostgegner oder Ilyra-Rekrutierung in diesem Paket.

Auf ausdrücklichen Nutzerwunsch keine Front-/Basis-Buttons. Mausziehen/Touch und die bestehende Übersicht reichen; reale Bau-/Lernaktionen fokussieren einmalig ihren Zielort. Gebäudevorplätze bleiben frei, die kurze Bauanimation bleibt sichtbar. Ein schmaler Fußweg verbindet den Kern mit den Höfen.

## Kompakte Prüfung

- `npm run idle:build`: TypeScript und Produktionsbuild erfolgreich.
- `core-settlement.test.ts`: fünf gezielte Fälle erfolgreich – neue Geometrie/Einführungszustand, veröffentlichter Altstand und Eigentumserhalt, sämtliche vorher freien Turmplätze, Pause/atomare Speicherung/Rollback/Reload, erlaubte und ungültige Gebäudeplätze. Farmnachweis für die unveränderte Westverteidigung funktioniert auch mit Layout 5.
- Vier bestehende Fälle erfolgreich: Vorbereitung und Speichern, kompletter angeleiteter Kaufablauf über alle angebotenen Startpositionen, Ablehnung beschädigter/neuerer Saves und Migration aus Schema 18. Eine zunächst zu strenge neue Zugangsprüfung wurde auf Layout 5 beschränkt, damit die alten gültigen Tavernenplätze unverändert versetzbar bleiben. Keine vollständige Testsuite.
- Browser: echte Menü-/Kartenklicks durch Startturm, Upgrade, Werkstatt am Kern, Forschung und Frostbau; 20/20 Leben. Kampfzeit zwischen Lernschritten für diese Funktionsprobe gezielt vorgespult, kein neuer Nachweis des echten 90-Sekunden-Tempos.
- Veteran: veröffentlichter B15-Prüfstand, für diesen Fall um Taverne, einen östlichen Turm und Testgold ergänzt. Umzug über die echte Oberfläche bei Pause; Gold/Besitz/alle sechs Türme/Gegner/Projektile unverändert, anschließend Neuladen erfolgreich. Kein Beleg für regulär erspieltes Endspieltempo.
- Desktop 1440×900 und Hochkant 430×932 bei DPR 2. Echte Mausbewegung mit gedrückter Taste sowie Touch-Ereignisse verschieben die Kamera; keine Navigationsbuttons und kein horizontales Seitenüberlaufen. Keine JavaScriptfehler. [Messdaten](browser.json).
- Die erste Sichtprüfung zeigte einen zu schwach dargestellten Fußweg. Richtigen Bodenausschnitt verwendet und Verbindungen korrigiert; die Aufnahmen zeigen den korrigierten Stand.

## Spielansichten

![Siedlung am Kern](core-settlement-desktop.png)

![Werkstattaufbau während der Lernpause](workshop-building-desktop.png)

![Hochkant](core-settlement-mobile.png)

[Platzierung im Einstieg](workshop-placement-desktop.png) · [Unveränderte Westfront nach Mausziehen](west-front-desktop.png)

## Grenzen und nächster Schritt

Browseremulation ersetzt keinen echten Smartphone-Test. Die freie Siedlung ist bebaubar; die zweite Front, Ilyras Gameplay und weitere Gebäude bleiben separat. Der vollständige Ostzugang muss die gespeicherte 900-Gold-Anrechnung in B19 verwenden. Neue Grafikassets waren nicht nötig.

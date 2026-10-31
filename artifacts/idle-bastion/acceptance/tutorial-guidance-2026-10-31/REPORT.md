# Tutorial-Hinweise · 31.10.2026

Ausgangsstand: `main` **2531b46d8ab3e34c4b57349815f5f2d4d1d73b66**. Nutzer hat die vorgeschlagenen Korrekturen freigegeben. Ein abgegrenztes UI-Paket; kein Kongregate-Export.

## Ergebnis

- HQ- und Spawn-Pfeil pulsieren sanft im Zwei-Sekunden-Takt (3 % Größenänderung, 2 Pixel Bewegung). Gleichzeitig zeigt der einwärts kommende, danach pulsierende Rahmen die tatsächliche Weiter-/Verstanden-Aktion. Keine kreisförmigen Pointer-Halos. `prefers-reduced-motion` deaktiviert die CSS-Bewegungen.
- Klare Reihenfolge: Einführung → **Deinen Turm auswählen / Choose your tower** → hervorgehobener Startturm → Geistgrafik, Pfeil und quadratisches empfohlenes Baufeld. Kein vorzeitiger Bauhinweis, der während der Auswahl verschwindet.
- Geführte Starter-/Frostplatzierung ohne zusätzliche Reichweitenkreise oder kleine Bodenellipsen. Normale Turm-Reichweiten bleiben erhalten. Gebäudebau verwendet seinen bestehenden rechteckigen Grundriss, ohne zweiten kleinen Marker.
- Ein bewusster **Welle 1 starten / Start wave 1**-Klick bleibt erhalten, einschließlich kostenloser Umpositionierung davor. Verständlicher Hinweis auf anschließend automatische Kämpfe.
- **Werkstatt öffnen / Open Workshop** öffnet nach dem gespeicherten Lernübergang das tatsächliche Werkstattmenü. Frost ist vorausgewählt; bestehende Forschungsicons und Details werden angezeigt. Die Forschung wird weiterhin separat bestätigt und kostet unverändert 60 Gold. Das spätere Sturmlicht bleibt sichtbar gesperrt.
- Bestehende kompakte, unten angeordnete Tutorialkarten und durchgehender 14-Schritte-Zähler bleiben erhalten. Keine Änderungen an Kampfmodell, Preisen, Offline-Abrechnung, Saveformat, Turmassets oder Charakteranimationen.

## Prüfungen

- Gezielte Suite: **51/51 bestanden** (Intro, Hinweise, Kamera, Lernpausen, Platzierung, kostenloser Frostbau, historische Vorbereitungsspielstände).
- Vollsuite: **443/443 bestanden**, 0 übersprungen; Ausgangssuite 439, vier zusätzliche Regressionstests. [Testprotokoll](tests.log).
- TypeScript und Produktionsbuild erfolgreich. [Buildprotokoll](build.log). Die lokale Fixture ist kein Produktions-Build-Einstieg.
- Echter Browser: Desktop 1280 × 720, 390 × 844 und 320 × 568; EN und DE. Intro bis Turmauswahl, kein vorzeitiger Standortpfeil, Starter-/Frostempfehlung ohne Zusatzkreise, sichtbare CSS-Pulsanimationen und Aktionsrahmen geprüft.
- Echter Werkstattübergang über den normalen Tutorialbutton geprüft: Schritt 7 → 8, reale Forschungsübersicht, Frost vorausgewählt. Forschung: **85 → 25 Gold**, Freischaltung bleibt nach Reload erhalten; danach Schritt 9 und erster Frost kostenlos. Keine zweite Abbuchung.
- Über einen separat gespeicherten, mit realen Modellaktionen erzeugten Ready-Prüfstand: **Start wave 1** startet Welle 1; nach erstem Abschuss Lernpause, reales Upgrade für 60 Gold, automatischer Weiterlauf zu Schritt 7. Keine zusätzlichen Bestätigungen eingeführt.
- Teststände sind eigene lokale Probe-Slots. Der bereits geöffnete Nutzer-Spielstand wurde nicht verändert.

## Browsergrenzen / Restbefund

Die Browsersteuerung konnte Karten-Koordinatenklicks zweimal nicht zustellen (CDP-Timeout). Deshalb ist kein vollständig manuell durchgeklickter Bauablauf vom leeren Spiel bis Frost als bestanden ausgewiesen. Für Werkstatt/Ready wurden nur lokale, valide Probe-Spielstände aus den echten Modellaktionen erzeugt; anschließende Menüaktionen, Kämpfe, Forschung und Reload liefen in der echten Spieloberfläche. Die eigentlichen Bauaktionen und historischen Saves sind durch die bestehenden Modell-/Sessiontests abgedeckt.

Ein lokaler Start wurde einmal unterbrochen; „Try again“ lud denselben gespeicherten Stand erfolgreich. Danach liefen die untersuchten Reloads ohne Fehler. Keine Warnungen/Fehler in den erfolgreichen Browser-Smokes. Reduced Motion ist im Code berücksichtigt, aber keine Änderung der Betriebssystempräferenz für diese Abnahme vorgenommen.

## Screenshots

| Ansicht | Vorher | Nachher |
|---|---|---|
| Desktop-Intro | [Vorher](tutorial-before-desktop.png) | [Nachher](tutorial-after-desktop.png) |
| Platzierung | — | [Desktop, ohne Zusatzkreise](tutorial-placement-desktop.png) |
| Werkstatt | — | [Desktop](tutorial-workshop-desktop.png) · [390 px](tutorial-workshop-390.png) · [320 px](tutorial-workshop-320.png) |
| Mobile | — | [DE-Intro 390](tutorial-intro-de-390.png) · [Welle 1 starten 320](tutorial-start-320.png) · [Frostempfehlung 320](tutorial-frost-320.png) |

Statische Screenshots dokumentieren die Geometrie; die Bewegung wurde zusätzlich über die aktiven CSS-Animationen kontrolliert.

## Dateien und Veröffentlichung

Laufzeit: `lesson-pointer.ts`, `premium.css`, `battle-scene.ts`, `main.ts`, `mara-intro.ts`, `onboarding-ui.ts`, `tutorial-guide.ts`, `locales/en.ts`. Tests: `lesson-pointer.test.ts`, Ergänzung `tutorial-camera.test.ts`, lokale `tests/browser/tutorial-guidance.html/ts`. Roadmap und dieser Bericht.

Implementierung und Nachweise: **5bfabe44389a370776d10275d9a740c68d7fcc04**, direkt auf `main` gepusht. [Pages-Lauf 41206497137](https://github.com/emfau88/TD/actions/runs/41206497137) erfolgreich (inklusive CI-Produktionsbuild). Öffentliche Seite im Browser geprüft: beide Pulsanimationen aktiv, kein Halo, „Choose your tower“ und kein vorzeitiger Kartenpfeil; keine Browserfehler. [Öffentlicher Screenshot](tutorial-live-choice.png). Dieser Nachtrag enthält ausschließlich Dokumentation.

Der Intro-Reload wurde zusätzlich auf DE/390 geprüft: Schritt 2 bleibt erhalten, „Verstanden“ pulsiert, danach erscheint „Deinen Turm auswählen“.

Bewertung: Der Einstieg verwendet nun eine verständliche visuelle Sprache: Informationspfeil für Orte, pulsierender Rahmen für den nächsten Klick, genau ein quadratischer Bauhinweis. Der reale Werkstattweg vermittelt, wo Forschung später stattfindet. Auf 320 px beansprucht die geöffnete Werkstatt viel Fläche, bleibt in der Lernpause aber vollständig bedienbar. Kein technischer Blocker in den geprüften Änderungen; die benannte Einschränkung beim automatisierten Kartenklick bleibt transparent.

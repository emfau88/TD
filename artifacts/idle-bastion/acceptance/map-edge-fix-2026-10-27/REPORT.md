# Kartenrand-Fix · 27.10.2026

Die Kamera endet nach dem Intro sowie beim Verschieben und Zoomen an der tatsächlichen Karte. Passt die gesamte Karte in die Ansicht, wird der Kameraausschnitt auf ihre sichtbare Größe begrenzt und im verfügbaren Bereich zentriert. Übrige Bildschirmfläche verwendet den dunklen UI-Hintergrund statt des bisherigen grünen Rendererhintergrunds. Die Übersicht zeigt weiterhin die vollständige Karte.

Geändert wurden die Kameragrenzen, die Anpassung des Kameraausschnitts und der Zoomausgleich in `battle-scene.ts` sowie die Hintergrundfarbe in `main.ts`. Karteninhalt, Kampf, Tavernenregeln und Speicherformat bleiben unverändert. Der bestehende eigene Intro-Kamerapfad bleibt erhalten.

## Tatsächliche Prüfung

- 19/19 gezielte Tests bestanden: `tutorial-camera.test.ts`, `mara-intro.test.ts`, `tutorial-progress.test.ts`. Zwei neue Regressionen prüfen echte Kartengrenzen/Übersicht auf mehreren Bildschirmformaten und wiederholten Zoom ohne anwachsenden Außenrand.
- `npm run build` einschließlich TypeScript und Pages-Paket erfolgreich abgeschlossen; [Buildausgabe](build.log). Der anschließende Python-Konsolenausdruck scheiterte an der Windows-Zeichenkodierung, nachdem Build und Paketierung bereits fertig waren; die vollständige Ausgabe wurde zuvor gespeichert.
- Echter Chrome bei 1440×900, 390×900 und 320×900: Intro, Intro-Ende, Verschieben bis zu allen vier Rändern, Zoom, Übersicht und Verschieben in der Übersicht. Hochkant zusätzlich native Touch-Ereignisse und Wechsel ins Querformat/zurück.
- 94 Messungen des tatsächlichen Phaser-`worldView` blieben innerhalb der Kartengrenzen; keine Seitenfehler. [Messdaten](browser-results.json), [ausgeführtes Prüfskript](check-camera.mjs). Ein ausschließlich im lokalen Test umgeschriebener Devserver-Response macht die Scene für Messungen lesbar; kein Debugzugriff im Spielcode.
- Das unveränderte Produktionspaket separat bei 1440×900 und 390×900 geladen, Intro durchlaufen, zum linken Rand verschoben (Hochkant per Touch) und Übersicht geöffnet. Keine Seitenfehler. [Ergebnis](production-results.json), [Prüfskript](check-production.mjs).
- Screenshots visuell kontrolliert: linker Weg beginnt direkt am Kartenabschluss; kein zusätzlicher grüner Außenstreifen nach dem Intro oder nach dem Ziehen. Die freie Fläche bei vollständiger Übersicht ist dunkel.
- Beim ersten Devserver-Versuch blieb der Startbildschirm hängen; der Wiederholungslauf und der separate Produktionslauf gelangen vollständig. Daraus wird kein bestätigter Spielfehler abgeleitet.

## Screenshots des Produktionspakets

[Desktop, linker Spawn im Detail](production-spawn-left-1440-detail.png) · [Desktop vollständig](production-spawn-left-1440.png) · [Hochkant nach Verschieben](production-spawn-left-390.png) · [Hochkant direkt nach dem Intro](production-after-intro-390.png) · [Hochkantübersicht](production-overview-390.png).

Dies ist eine technische und visuelle Eigenprüfung. Eine subjektive Nutzerabnahme wird damit nicht behauptet. Aktueller Aufgaben- und Veröffentlichungsstatus steht ausschließlich in der [Roadmap](../../../../experiments/idle-bastion/ROADMAP.md).

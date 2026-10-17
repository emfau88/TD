# P1 — Technische Grundlage: Nachweise

Stand: 17.10.2026 · Branch `codex/idle-bastion-vertical-slice`

Dieser Bericht dokumentiert tatsächlich ausgeführte Arbeit. Der verbindliche Paketstatus steht in der [Roadmap](../../../../experiments/idle-bastion/ROADMAP.md).

## B01 — Eigenständiger Einstieg und Kartenrahmen

Geprüfter Implementierungscommit: `b47294a`. Ausgangspunkt: `8ba6e8e`, ursprüngliche Spielbasis `5667aae`.

### Ergebnis und Start

Die eigenständige Anwendung unter `experiments/idle-bastion/` zeigt eine neutrale, bedienbare Layoutprobe. Startregion, durchgehender Gegnerweg, exaktes Pfadende am Kern, vier anfänglich verfügbare Turmplätze, weitere reservierte Plätze sowie Werkstatt-/Lagergrundstücke sind geometrisch definiert. Mara und der Gegneranmarsch sind Positionsmarkierungen, noch keine spielenden Figuren.

Befehle im Repository-Wurzelverzeichnis dieses Worktrees:

```text
npm ci
npm run idle:dev
npm run idle:test
npm run idle:build
npm run idle:preview
```

Entwicklung: `http://127.0.0.1:5190/`. Produktionsvorschau nach Build: `http://127.0.0.1:5191/`. Ausgabe: `experiments/idle-bastion/dist/`. Das ist ein servergestützter statischer Build, noch keine einzelne Offline-HTML-Datei.

„Erweiterung prüfen“ verschiebt nur die Kamera in die schattierte Planungsfläche. Keine Gebietsfreischaltung wird ausgeführt. Raster/Reichweiten und das Anklicken eines Grundstücks dienen der Prüfung dieser Geometrie.

### Architektur und Herkunft

| Bestandteil | Herkunft / Entscheidung |
| --- | --- |
| Laufzeit | Vorhandenes Phaser/TypeScript/Vite, Abhängigkeiten unverändert aus dem Lockfile; Installation im neuen Worktree aus lokalem Cache |
| Phaser-Einstellungen | Bestehendes Muster: Pixelart, keine Glättung, Audio aus, proportionaler FIT-Canvas |
| Maßstab | 40er Zellen aus der bestehenden SPIRE-Geometrie; instanzabhängige Grenzen statt Änderung globaler alter Kartenkonstanten |
| Startkarte | Eigene neutrale Geometrie; 28×16, maximales Planungsbudget 36×16; Pfadende und Kern beide bei Zelle (27,6) |
| Plätze | Acht Plätze im Startgebiet, vier anfänglich vorgesehen; zwei geplante östliche Plätze erreichen geometrisch den vorhandenen Weg bei 126 Einheiten |
| Grundstücke | Werkstatt 3×2 und Lager 2×2; blockierender Gebäudekörper und begehbarer Vorplatz getrennt |
| Navigation | Kleine reine kardinale Wegsuche für die Layoutprüfung; Zugänge zu Mara, Turmplätzen und Vorplätzen nachgewiesen |
| Isolation | Eigene Vite-/TypeScript-Konfiguration, eigener Buildordner; `publicDir: false` verhindert Kopieren aller klassischen Assets |
| Wiederverwendung | Keine alte Kampfszene geerbt: Sie lädt bereits Kampf, alle Assets und feste Weltmaße. Kampfübernahme folgt B02; Grafikübernahme folgt B05 |

### Ausgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| `npm run idle:test` | 8/8 bestanden: Grenzen, Pfad, Platz-/Grundstücksüberschneidungen, Vorplätze, Figurenzugänge, gesperrte Ostfläche, geometrische Reichweite, getrennte unveränderliche Instanzen |
| `npm run idle:build` | TypeScript erfolgreich, Vite-Produktionsbuild erfolgreich; etwa 1,40 MB JavaScript / 377 KB gzip durch Phaser |
| `npm test` | 54/54 bestehende Root-Tests bestanden |
| `node node_modules/typescript/bin/tsc --noEmit` | Erfolgreich |
| `node node_modules/typescript/bin/tsc --project reference/tsconfig.json --noEmit` | Erfolgreich |
| Browser, Entwicklung | Codex In-app Browser; Ansichten bei angeforderten 1366×768 und 1920×1080 geprüft. Kleine Ansicht meldet durch Browserrundung 1367 CSS-Pixel Breite; kein horizontaler Überlauf |
| Browser, Produktionsbuild | `http://127.0.0.1:5191/` bei 1920×1080 tatsächlich geöffnet; Canvas und Bedienoberfläche sichtbar, keine Warnungen/Fehler in den erfassten Browserlogs |
| Bedienung | Grundstücksauswahl zeigt Werkstattbeschreibung; Planungsansicht, Rückkehr, Raster- und Reichweitenschalter geprüft |

Nicht ausgeführt: neue klassische Builds und vollständiger Referenztestlauf; klassischer Spielcode wurde nicht verändert. Der vorbereitende Referenz-Wrapper wurde nicht aufgerufen und erzeugte keine Assetänderungen. Die neue neutrale Probe benötigt keine Browser-Spielstände und verwendet keine klassischen Speicherkennungen.

### Reale Browseransichten

[Startansicht, kleine Desktopgröße](b01-start-1366x768.jpg) · [östliche Planungsfläche mit Reichweiten](b01-plan-1920x1080.jpg) · [tatsächlich geöffneter Produktionsbuild](b01-build-1920x1080.jpg)

### Grenzen und nächster Schritt

- Dies ist ein Layoutnachweis, keine Grafik- oder Spielgefühlabnahme. Marker ersetzen aktuell Sprites und Gebäude.
- Die Reichweitenprüfung beweist eine geometrische Überschneidung; tatsächlicher taktischer Nutzen und Balance werden mit dem Kampf und später in B11 überprüft.
- Die mittlere Maustastenbewegung ist vorgesehen; separat automatisiert wurden die Ansichtsbuttons und Schalter, kein vollständiger Drag-Durchlauf.
- Kampf, Gold, Speichern und Offline-Ertrag sind hier noch nicht implementiert. G1 bleibt offen.
- Nächster Schritt: B02 — automatischer Kampf und echte Bauwirtschaft. Der Nutzer hat anschließend ausdrücklich „danach B02“ beauftragt.

## B02 — Automatischer Kampf und Bauwirtschaft

Geprüfter Implementierungscommit: `d10cb04`. B01 bleibt als eigene Ansicht unter `/layout.html` erhalten; die Startseite öffnet jetzt die Kampfprobe.

### Ergebnis

- Phaser-freie Kampfsimulation mit selbstständig startenden Wellen und zwei Sekunden Zwischenpause.
- Vier anfänglich verfügbare feste Turmplätze; kostenloser geschützter Waldwächter und 75 Startgold.
- Waldwächter bauen für 75 Gold, Aufwerten für 60/94 Gold bis Level 3 und Verkauf für gerundet 70 % der tatsächlichen Investition.
- Zahlenlevel und Grafikstufe getrennt; Level 1–3 verwenden dieselbe vorbereitete Grafikstufe I. Reichweite und Feuerrate bleiben begrenzt.
- Jeder neue Versuch startet mit 20/20 Leben sowie frischer Gegner-/Projektilwarteschlange. Niederlage bewahrt Gold und Türme und bleibt als definierter Zustand stehen; automatisches Farmen ist erst B04.
- Kleine neutrale Käfer-, Turm- und Projektilmarker statt neuer Grafikproduktion. Mara und Gebäude sind weiterhin nur Layoutmarkierungen.

Die Regeln für Zielauswahl, Bewegung, Projektile, Treffer und Kaufwirtschaft wurden gezielt aus `reference/src/simulation.ts` / `data.ts` übernommen. Die neue Anwendung importiert keine veränderlichen klassischen Spielregeln. Ihre eigene Einstiegswelle nutzt sechs Blattkäfer mit 24 HP, Tempo 45, acht Gold und 1,2 Sekunden Abstand; dies sind vorläufige B02-Werte und noch keine abgestimmte 90-Sekunden-Progression.

### Ausgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| `npm run idle:test` | 22/22 bestanden: 14 neue Kampftests und acht Layouttests |
| Geschützter Startturm allein | Modellprüfung mit voller anfänglicher Abklingzeit: erster Abschuss bei 2,8 s, Welle 1 fertig bei 8,8 s, 20/20 Leben, 145 Gold = 75 + 6×8 + 22 |
| Deterministische Zeitschritte | Große, normale und anteilige Schritte ergeben denselben vollständigen Kampf-/Wirtschaftszustand |
| Projektil-/Belohnungsfälle | Verbesserter oder verkaufter Ursprung verändert bereits abgefeuerte Geschosse nicht; gleichzeitige tödliche Treffer vergüten nur einen Kill |
| Wellen-/Verlustfälle | Entkommene Gegner bringen kein Gold; Lebensreset, monotone IDs und Erhalt von Geld/Türmen bei Niederlage geprüft |
| `npm run idle:build` | TypeScript und Produktionsbuild mit getrenntem Kampf-/Layout-Einstieg erfolgreich |
| Echter Browser, 1920×1080 | Produktionsbuild, automatischer Wellenstart, Kauf, Pause/Fortsetzen, Aufwertung und Verkauf geprüft; keine erfassten Warnungen oder Fehler |
| Echter Browser, kleine Desktopgröße | Angeforderte 1366×768; erste reale Killgutschrift abgewartet, Turm regulär gekauft, Pause geprüft; Kampf und Kaufbuttons sichtbar, Detailleiste bei Bedarf scrollbar |

Konkrete Browsertransaktionen: Bei 78 Gold kostet das erste Upgrade 60 und lässt 18 übrig. Verkauf des gekauften und einmal verbesserten Turms erstattet 95 und führt zu 113 Gold. Während Pause blieben Gold und Welle unverändert. Der geschützte Startturm besitzt keinen ausführbaren Verkaufsbutton. Keine Ressourcen wurden per Konsole oder Debugfunktion zugeschrieben.

Die Modellzeiten sind ausdrücklich kein vollständiger Echtzeit-Playtest des späteren Tutorials. Ein Wiederholungsdurchlauf bis Minute 15, Farming und Offline-Ertrag sind hier nicht behauptet. B03 ergänzt die noch fehlende Speicherung.

[Realer Kampf mit gekauftem Turm](b02-combat-1366x768.jpg) · [bezahltes Upgrade im Browser](b02-upgrade-1920x1080.jpg)

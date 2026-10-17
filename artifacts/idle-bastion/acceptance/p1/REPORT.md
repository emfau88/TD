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

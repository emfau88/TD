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
## B03 — Konsistenter Spielstand während des Kampfes

Geprüfter Implementierungscommit: `40dc019`.

### Ergebnis

Der eigene IndexedDB-Namensraum `spire-idle-bastion` enthält einen versionierten vollständigen Kampfstand samt Gold, Türmen, Gegnern, Projektilwerten, Spawnfortschritt, IDs, Timern und ausdrücklicher Pause. Klassische Spielstände werden weder gelesen noch verändert. Die erste persistente Idle-Fassung verwendet Schema-, Regel- und Layoutversion 1; ein älteres veröffentlichtes Idle-Schema zum Migrieren existiert noch nicht.

Käufe, Verkauf, Goldbelohnungen, Wellenwechsel und Lebensänderungen werden als vollständiger Zustand atomar geschrieben. Oberfläche und Kampf bestätigen die Änderung erst nach Abschluss der Transaktion. Ein zweiter Klick während des Schreibens wird abgewiesen. Bei Schreibfehlern wird auf den letzten bestätigten Zustand zurückgesetzt und die Probe angehalten; sie behauptet kein erfolgreiches Speichern.

Reine Kampfschritte erhalten zusätzlich ungefähr jede Simulationssekunde einen Checkpoint sowie beim geordneten Hintergrundwechsel. Ein harter Prozessabbruch kann noch nicht bestätigte Bewegung und Timer seit dem letzten Checkpoint verwerfen; bestätigtes Gold und Käufe werden dadurch nicht doppelt vergeben oder zurückgenommen. Das ist keine Garantie für einen gerade noch laufenden Schreibvorgang.

Der letzte gültige Vorgängerstand bleibt als Backup erhalten. Ein beschädigter Hauptstand mit bekanntem Schema bietet ausdrückliche Wiederherstellung an und bewahrt seinen Rohstand. Unbekannt neuere Versionen werden geschützt. Bei grundsätzlich fehlendem Speicher ist nur eine ausdrücklich gewählte, klar bezeichnete temporäre Probe möglich. „Neu laden“ setzt den Spielstand nicht zurück.

### Ausgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| `npm run idle:test` | 55/55 bestanden: 10 neue Codec-, 11 Session- und 12 IndexedDB-Tests zusätzlich zu den 22 B01/B02-Tests |
| Kampf-Roundtrip | JSON-Restore mit fliegenden Projektilen, Teilzeitschritten, Wegknicken, Wellenpause, Niederlage und verkauftem Projektilursprung; weitere deterministische Fortsetzung stimmt überein |
| Belohnungsgrenzen | Restore direkt vor tödlichem Treffer sowie nach Kill/Wellenabschluss vergibt keine bereits bestätigte Belohnung erneut |
| Speichertransaktionen | Mit `fake-indexeddb`: konkurrierende Revisionen haben genau einen Gewinner; Abbruch nach erfolgreichem `put` bleibt unbestätigt und verändert den Vorgänger nicht |
| Fehlerfälle | Ungültige Zustände, unbekannte neuere Versionen, beschädigter Hauptstand/Backup, verweigerte Wiederherstellung, blockiertes Öffnen und fehlender Speicher geprüft; kein stilles Überschreiben |
| Session | Bestätigung nach Commit, abgewiesener Doppelklick, vollständiger Rollback, geordnete Schreibreihenfolge, Checkpoints und gespeicherte Pause geprüft |
| Echter Browser, Produktionsbuild | Erste Killgutschrift regulär abgewartet, zweiten Turm gekauft, mitten in Welle 1 pausiert und neu geladen: 8 Gold, 20/20 Leben, gekaufter Level-1-Turm und Revision 7 unverändert; Canvas-Ausschnitte vor/nach Reload bytegleich |
| Echter Browser, Upgrade | Fortgesetzt, echtes Gold verdient, Upgrade für 60 Gold gekauft und pausiert. Nach Reload unverändert: Level 2, 10 Gold, Welle 1 und Revision 19 |
| Browserlogs | Keine erfassten Warnungen oder Fehler im geprüften Produktionsdurchlauf |
| `npm run idle:build` | Eigene TypeScript-Prüfung und Produktionsbuild erfolgreich |
| Bestehende Anwendung | 54/54 Root-Tests sowie Root- und Referenz-TypeScript-Prüfungen erfolgreich; kein klassischer Spielcode geändert |

Fehler- und Beschädigungsfälle wurden automatisiert gegen das IndexedDB-Verhalten geprüft; im Browser wurde keine künstliche Speicherbeschädigung oder Betriebssystem-Abschaltung erzwungen. Ein vollständiger klassischer Referenztestlauf und neue klassische Asset-Builds wurden in B03 nicht ausgeführt.

[Mitten in der Welle vor Reload](b03-before-reload-1366x768.jpg) · [derselbe Kampf nach Reload](b03-after-reload-1366x768.jpg) · [erhaltenes Upgrade nach Reload](b03-upgrade-reload-1366x768.jpg)

### Grenzen und nächster Schritt

B03 ist die technische Persistenzgrundlage. Offline-Ertrag, sichere Farmwelle und exklusive Tab-Eigentümerschaft mit Writer-Epoche gehören zu B04; eine Revisionsprüfung ersetzt diese Eigentümerschaft nicht. Hintergrundzeit wird derzeit nicht als Kampf oder Goldgewinn nachgeholt. Export/Import folgt spätestens B14. Die Darstellung verwendet weiterhin neutrale Marker; Wald und Mara folgen B05. Die verbindliche Nutzerabnahme G1 bleibt offen.
## B04 — Sicheres Farmen, Abwesenheit und Tab-Eigentümerschaft

Geprüfter Implementierungscommit: `25e9a5f`.

### Ergebnis

Nach einer Niederlage bleibt die Wirtschaft erhalten. Die Verteidigung wechselt zu einer nachgewiesenen Farmwelle oder spielt mangels Nachweis Welle 1 live. Jeder Versuch beginnt mit 20/20 Kernleben, leerer Gegner-/Projektilmenge und frischer Warteschlange. „Erneut vorstoßen“ wird am Wellenübergang ausgeführt und startet die erste noch nicht geschaffte Welle. Danach läuft der Vorstoß automatisch; eine Niederlage löst keinen sofortigen erneuten Vorstoß aus.

Die sichere Rate stammt aus zwei vollständigen konservativen Prüfläufen einer tatsächlich live geschafften normalen Welle. Beide starten mit ungünstigen normalen Turm-Cooldowns und schließen ihre Wellenpause ein; schon ein entkommener Gegner verwirft den Nachweis. Die begrenzte Prüfung verändert weder Live-Gold noch Statistik oder UI-Ereignisse. Maximal drei Kandidaten werden geprüft; ein weiterhin gültiger älterer Nachweis bleibt erhalten. Bau, Upgrade und schädlicher Verkauf ändern den Fingerabdruck und veranlassen neue Prüfung. Reservierte Bosswellen zählen nicht als Farmbasis.

Offline-Abrechnung verwendet die beim Verlassen gültige Basis, 60 % Effizienz und zwei Stunden Limit. Fensterherkunft, Zeitcursor, verbrauchte Limitdauer, eindeutige ausstehende Belohnung und exakter rationaler Rundungsrest bleiben gespeichert. Der Saldo besitzt zusätzlich gespeicherte Goldtausendstel. Reload und Claim allein starten kein neues Limit; erst die tatsächliche aktive Fortsetzung beendet das Fenster. Explizite Pause produziert kein Gold. Im ausdrücklich temporären Modus werden große Frame-Lücken verworfen, ohne Offline-Ertrag zu versprechen.

Ein persistenter Writer-Datensatz mit monotoner Epoche schützt alle wirtschaftlichen Writes innerhalb derselben IndexedDB-Transaktion. Die fünf Sekunden gültige Lease wird regelmäßig erneuert. Web Locks dienen als kurzer Übernahme-Zugriff und verhindern keine gültige Übernahme einer abgelaufenen Lease. Ein versteckter Tab speichert die gemeinsame aktive/abwesende Grenze und gibt die Kontrolle ab. Ein alter wieder erwachter Writer kann keine neueren Ergebnisse überschreiben. Schnelle Reloads warten begrenzt auf eine noch auslaufende vorherige Lease.

### Ausgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| `npm run idle:test` | 97/97 bestanden: acht Layout-, 35 Kampf/Codec/Farm-, 21 Session- und 33 Store/Offline-Tests |
| Unveränderter Startturm | Erster Live-Abschluss bei 8,8 s; konservativer Nachweis: 140 Gold über 21.100 ms für zwei Zyklen inklusive Pausen, entsprechend 398,1 G/min |
| Natürlicher Rückfall im Modell | Ohne Käufe erste Niederlage in Welle 15 nach 662,2 s, höchste geschaffte Welle 14. Anschließend frischer Farmversuch mit 20/20 Leben, Wiederholung ohne automatischen Vorstoß; vorgemerkter Vorstoß erst am Übergang |
| Schädlicher Verkauf | Nachweis für ausgebaute Welle 8 wird unmittelbar ungültig; tatsächlicher neuer Nachweis fällt auf die tragfähige Welle 1 zurück |
| Offline-Zeitfälle | 30 s, 10 min, 1 h und 3 h bei 60 % und Zwei-Stunden-Limit; keine Limitverlängerung durch Claim, erneutes Schließen oder mehrfaches Öffnen |
| Uhr/Rundung | Rückwärtsuhr senkt den Cursor nicht, Vorwärtssprung bleibt begrenzt, kleine Teilbeträge und wechselnde Raten bewahren exakten gespeicherten Rest |
| Eigentümerschaft | Konkurrierende Akquisition, Erneuerung, Freigabe, Übernahme nach Ablauf, alter Writer nach Übernahme, gespeicherte Epoche und geschützte Recovery geprüft |
| Bestehende Daten | Envelope 1/Kampf 1 werden kontrolliert migriert; neuere unbekannte Formate bleiben geschützt. Die frühe B04-Fassung ohne explizite Policy-Felder wird mit ihren bekannten 60 % / 2 h gelesen, ohne Fenster oder Belohnung zu verwerfen |
| Echter Browser | Laufender Kampf und sichere Rate; zweiter Tab blieb ohne eigene Simulation und zeigte „Spiel bereits in einem anderen Tab aktiv“ |
| Echter Browser, Rückkehr | Bei 495 vorhandenem Gold zunächst Anzeige von 646,027 ausstehenden Gold nach rund 162 s angezeigter Abwesenheit. Reload vor dem Claim behielt den Saldo; nur neu hinzugekommene Abwesenheit erhöhte den ausstehenden Betrag |
| Echter Browser, Claim/Pause | Nach Einsammeln einschließlich hinzugekommener Dialogzeit und anschließendem Pausieren: 1.463,078 Gold. Erneuter Reload erhält exakt 1.463,078; Rückkehrbeleg zeigt aktive Pause und +0 Gold |
| Echter Browser, schnelle Reloads | Kontrolliertes Neuladen und harte Reloads geprüft; eine noch lebende alte Lease wird begrenzt abgewartet |
| Desktopansichten | Angeforderte 1366×768 und 1920×1080 ohne horizontalen Überlauf; kleine Breite meldet browserbedingt 1367 CSS-Pixel |
| `npm run idle:build` | TypeScript und Produktionsbuild erfolgreich; keine erfassten Browserwarnungen/-fehler im abschließenden Durchlauf |

Der elfminütige natürliche Rückfall wurde deterministisch automatisiert geprüft; ein zusätzlicher durchgehender elfminütiger Browserlauf wurde nicht behauptet. Große Uhrsprünge, Betriebssystem-Suspend und Lease-Übernahme eines eingefrorenen alten Tabs wurden mit kontrollierten Uhren und IndexedDB-Tests geprüft, nicht durch reale Systemuhränderungen. Das ist weiterhin eine neutrale technische P1-Fassung, keine Wald-/Grafik- oder G1-Spielgefühlabnahme.

[Zweiter Tab bleibt inaktiv](b04-second-tab.jpg) · [echter Rückkehrbeleg](b04-offline-return.jpg) · [Pause und unveränderter Saldo nach Reload](b04-paused-reload-1366x768.jpg) · [kleine Desktopansicht](b04-ready-1366x768.jpg) · [große Desktopansicht](b04-ready-1920x1080.jpg)

### Halt vor B05

B01–B04 sind abgeschlossen. Der Nutzer hat zuletzt ausdrücklich „warte vor beginn mit b05“ angeordnet. Deshalb beginnt B05 noch nicht. Bisher wurden dafür lediglich Originalassets und vorhandene Navigations-/Renderingmodule gelesen; es gibt keine B05-Codeänderungen und keine Assetproduktion. Der spätere G1-Halt nach B07 bleibt zusätzlich bestehen.

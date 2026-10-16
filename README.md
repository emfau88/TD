# Spire — Herz aus Splittern

Der Plan für die Überarbeitung auf Basis der ursprünglichen Karten steht in [ROADMAP.md](ROADMAP.md): fünf zusammenhängende Spielkarten, verbindliche Asset-Vorgaben und schrittweise Abnahmen. **M0 ist abgeschlossen:** Die drei ursprünglichen Karten sind separat unter [reference/](reference/README.md) rekonstruiert. Zum Spielen `ORIGINAL SPIEL STARTEN.cmd` öffnen; [Prüfbericht und Screenshots](artifacts/m0/REPORT.md) dokumentieren Herkunft und Grenzen. **Die M1-Grafikprobe ist bereit zur Stilabnahme:** `GRAFIKPROBE STARTEN.cmd` zeigt Originalgelände, Wisp, Mara und Turmkampf; [Grafikvorgaben](reference/STYLE_GUIDE.md) und [Prüfbericht](artifacts/m1/REPORT.md) halten Maße und Grenzen fest. Die folgende Dokumentation beschreibt weiterhin den erhaltenen neueren Stand mit fünf Karten.

Ein lokales Tower-Defense-Spiel mit fünf eigenständigen Spielkarten und vier steuerbaren Begleitern. Die größere Kampagne „Herz aus Splittern“ ist als separat gekennzeichneter Entwurf erhalten. Ihre Geschichte verbindet Wisp, Mara, Runa, Ilyra und die Astronomin Vesper.

## Spielen

- `SPIEL STARTEN.cmd` oder `Spire.html` öffnen. Die erzeugte Einzeldatei enthält Spielcode und Grafiken und benötigt keinen Server.
- Lokaler Test: `npm run preview` und die ausgegebene Adresse öffnen, standardmäßig `http://127.0.0.1:5175/`.
- Entwicklung: `npm ci`, danach `npm run dev`.
- `npm run build` aktualisiert `dist/` und die Offline-Datei `Spire.html`.

Das Hauptmenü öffnet „Karten testen“. Direkt auswählbar sind **Mooshain, Laternenmoor, Windbruch, Spiegelwinter und Mondwarte**. Jede Karte hat zehn Wellen und verlangt zusätzlich die Aktivierung des markierten Kerns durch einen Begleiter. Alle fünf Karten sind ohne Freischaltungen zugänglich. Ein Kartensieg führt zur Auswahl der nächsten Karte, ohne Kampagnenfortschritt zu vergeben.

Unter „Kampagne · Entwurf“ bleiben die geplante Folge aus 18 Missionen in sechs Regionen und die vorhandenen Geschichten einsehbar. Diese Ansicht startet keine zusätzlichen Missionen und wird nicht als fertige Kampagne ausgewiesen. Auch die ursprünglichen Karten- und Fortschrittsdaten bleiben im Projekt erhalten. Türme haben drei Ausbaustufen; ihr Verkauf erstattet 70 % der investierten Kosten. Drei Sterne erfordern mindestens 18 verbleibende Spire-Leben, zwei Sterne mindestens zehn.

## Begleiter und Steuerung

Pro Karte reisen genau zwei Begleiter mit. **Wisp, Mara, Runa und Ilyra sind für alle fünf Karten sofort verfügbar.** Die Auswahl erfolgt vor dem Start. Um eine Figur zu ersetzen, zuerst eine gewählte Figur abwählen und danach ihre Nachfolgerin wählen.

| Eingabe | Aktion |
| --- | --- |
| Porträt oder Q / E | Ersten bzw. zweiten Begleiter auswählen |
| Boden anklicken | Ausgewählte Figur über begehbare Flächen zum Ziel bewegen |
| Kiste / Rune anklicken | Zum Objekt laufen und vor Ort sammeln / aktivieren |
| M oder Fähigkeit-Button | Fähigkeit vorbereiten; gegebenenfalls danach einen Zielort anklicken |
| Mit Mara einen Turm anklicken | Zum Turm laufen und ihn während einer Welle übertakten |
| 1–8 | Turmtyp auswählen; anschließend auf einen freien Bauplatz klicken |
| Gebauten Turm anklicken | Aufwertung, Zielpriorität und Verkauf anzeigen; bei ausgewählter Figur zuerst Escape |
| Escape | Bau- oder Figurenauswahl und Fähigkeitszielmodus aufheben |
| Leertaste | Pause / Fortsetzen |
| N | Nächste Welle starten |
| U | Ausgewählten Turm aufwerten |
| F | Zwischen 1× und 2× wechseln |

Das Spielfeld nutzt die verfügbare Fensterfläche mit einer schmalen HUD-Leiste oben und einem kompakten Dock unten. Gold, Leben und aktuelle Welle bleiben im HUD sichtbar. Das Dock enthält die zwei Begleiter, ihre Fähigkeit, die acht Turmtypen samt Preisen und den Wellenstart. Turmnamen und Rollen erscheinen beim Darüberfahren oder beim Tastaturfokus. „Aufträge & Route“ links oben lässt sich aufklappen; Turmdetails erscheinen nur bei ausgewähltem Turm als schwebendes Fenster rechts. Über den Vollbildknopf im HUD kann der Browser nach einem bewussten Klick in den Vollbildmodus wechseln, sofern er dies unterstützt.

Die Begleiterleiste zeigt Auswahl, Auftrag und Abklingzeit. Figuren können auch in der Bauphase bewegt werden und Vorräte oder Runen bearbeiten. Kampffähigkeiten funktionieren während aktiver Wellen. Ein Auftrag wirkt erst nach dem Weg zum Ziel und der dortigen Aktionsanimation. Unerreichbare Ziele werden abgelehnt. Pause und Kartenmenü halten Bewegung und Fähigkeiten an; 2× beschleunigt die gesamte Simulation.

- **Wisp — Panikmanöver:** Läuft zum gewählten Ort und lenkt nahe Bodengegner ab; sie werden fünf Sekunden lang verlangsamt. Er bearbeitet Kisten und Runen schneller und erhält aus Kisten einen Goldbonus.
- **Mara — Übertakten:** Läuft zu einem gebauten Turm. Nach Ankunft feuert dieser acht Sekunden lang 50 % schneller. Ab dann läuft die 30-sekündige Abklingzeit.
- **Runa — Nebelschleier:** Verlangsamt nahe Gegner am Zielort sechs Sekunden lang. 25 Sekunden Abklingzeit.
- **Ilyra — Sternensalve:** Trifft nahe Gegner am Zielort; Fluggegner nehmen doppelten Schaden. 28 Sekunden Abklingzeit.

## Storyvision, Entwurf und Kartenregeln

Die Storyvision: Vesper hat das Spire-Netz getrennt, um einen Sternensturm von den Dörfern fernzuhalten. Das Team repariert seine sechs Kerne und entdeckt einen Weg, den Sturm in der Mondwarte abzuleiten. Die vorbereiteten 18 Missionsbriefings und Abschlüsse sowie sechs Lagerfeuergespräche erzählen diesen Bogen. Sie sind ein narrativer Entwurf, keine abgenommene vollständige Kampagne. Bestehende Dialogtexte bleiben unverändert und sind optional aufklappbar; situative Sprechblasen lassen sich im Menü abschalten. Vesper ist eine Storyfigur, keine fünfte steuerbare Begleiterin.

Die Karten kombinieren regionales Gelände, verschiedene Wegverläufe, angekündigte Routenwechsel, Flugrouten und Aufgaben für die Begleiter. Auf Insel- und Plattformkarten stimmen begehbare Flächen und Bauflächen mit dem Gelände überein. Die Mondwarte besitzt schwebende Steininseln und Portalzugänge; in ihrem Finale öffnen sich zuerst die Nord-, dann die Südportale, anschließend alle Portale.

Im Mooshain, Laternenmoor und Spiegelwinter gibt es zusätzlich eine wiederholt bedienbare Station. Schicke während einer Welle einen Begleiter dorthin: Im Wald verlangsamt sie nahe Bodengegner, im Moor unterdrückt sie Gegnerheilung und im Eis stoppt sie vorübergehend die Turmstörung durch Frostwidder. Nach der Aktion benötigt die Station 30 Sekunden zum erneuten Aufladen. Die Auftragsliste zeigt Wirkung und Abklingzeit. Windbruch verändert seine Flugrouten, die Mondwarte ihre Portalzuflüsse. Glutgarten samt seiner Verstärkerstation gehört weiterhin zum Kampagnengerüst und ist keine der fünf auswählbaren Spielkarten.

Zusätzliche Gegner bringen eigene Prioritäten: Sternenrichter schützen bis zu zwei nahe Gegner mit Schilden, Laternenquallen heilen Verbündete, Wurzeltrommler beschleunigen nahe Schwärme und Frostwidder stören nahe Türme. Ihre Effekte und die angekündigten Wellenkombinationen ergänzen die ursprünglichen Boden- und Fluggegner.

## Speichern und Fortsetzen

Der Browser speichert Kartensiege, Sterne, beste Wellen, gewählte Begleiter und Audio-/Dialogeinstellungen. Die aktuellen Kartenergebnisse liegen getrennt von alten Kampagnenwerten und schalten keine Kampagnenmissionen frei. Zusätzlich wird die aktuelle **Bauphase** mit Karte, Türmen, Gold, Leben, Begleiterpositionen und erfüllten Aufgaben gespeichert. Im Menü lässt sie sich über „Gespeicherte Karte laden“ wiederherstellen. Ein Moduskennzeichen verhindert eine Vermischung mit älteren Kampagnen-Zwischenständen; Zwischenstände außerhalb der fünf ausgewählten Karten werden nicht zum Laden angeboten.

Wird eine laufende Welle durch Schließen oder Neuladen unterbrochen, wird beim Fortsetzen die vorherige Bauphase geladen. Bewegungsaufträge werden dabei nicht fortgeführt; die Figuren stehen an den gespeicherten Positionen und warten auf neue Befehle. Siege und Niederlagen entfernen den zugehörigen Zwischenstand. „Laufendes Spiel fortsetzen“ kehrt innerhalb derselben geöffneten Seite exakt zum angehaltenen Spiel zurück.

Alte Speicherstände der ersten drei Waldkarten bleiben lesbar. Ein früherer Mondwarte-Sieg allein schaltet nicht die ganze neue Kampagne frei. Die Offline-Datei und die Server-Version können getrennte Browser-Speicher verwenden. Das Löschen der Browserdaten entfernt lokale Spielstände.

## Prüfung und Build

```text
npm test
npm run test:ui
npm run test:scene
npm run balance:sim
npm run build
npm run test:package
```

Die Simulationstests prüfen Kampf, Bauwirtschaft, Richtungswechsel, Begleiterwege, Aktionen erst nach Ankunft, Missionsziele und die Wiederherstellung einer Bauphase. Die Balanceprüfung der fünf kuratierten Karten verwendet eine reproduzierbare legale Bau- und Aufwertungsstrategie einschließlich realer Geländehindernisse.

Die UI-Prüfung nutzt eine simulierte DOM-Umgebung mit der echten Spielsimulation. Sie prüft die fünf direkten Kartenstarts, die getrennte Entwurfsansicht, freie Teamauswahl, Q/E-Steuerung, Fähigkeitsaufträge, Bauverwaltung, Pause, Ergebnis und Speichern/Laden ohne Kampagnenfreischaltung. Die Szenenprüfung führt die echte Szenenklasse mit einer simulierten Zeichen-API aus. Beide ersetzen keine visuelle Browserprüfung von Grafik, Animationen oder Layout.

## Projektstruktur und Grafik

- `src/data.ts`: Karten, Kampagnenreihenfolge, Türme, Gegner und Wellen.
- `src/simulation.ts`: Kampf, Wirtschaft, Missionsziele und speicherbare Bauphasen.
- `src/companions.ts`: Begleiter, Wegfindung und Aufträge.
- `src/scene.ts`, `src/campaign-world.ts`: Phaser-Darstellung, Landschaft, Eingabe und Animationen.
- `src/main.ts`, `src/campaign-ui.css`: Kampagnenmenü, Teamleiste und Spieloberfläche.
- `src/story.ts`: Missionsbriefings, Abschlüsse, Lagerfeuergespräche und Freischaltungen.
- `src/assets.ts`: Gemeinsames Laden für Server und Offline-Datei.
- `scripts/package-offline.mjs`: Einbettung der Spiel- und UI-Grafiken in `Spire.html`.

Die Originalordner der Foozle-Pakete bleiben erhalten. Die jeweiligen `Readme.txt` nennen CC0; die mitgelieferte Pixelgrafik stammt von Foozle und Baldur. Zusätzliche Konzept- und Spielgrafiken wurden mit dem eingebauten Imagegen-Werkzeug erzeugt. Referenzen und Prompts liegen im Ordner `concepts/`; die Runtime-Grafiken unter `public/assets/`, UI-Grafiken unter `public/ui/`. Die vier neuen Figuren verwenden eigene Atlanten mit einheitlichen Animationszellen. Umgebungsbauteile und Props werden in den regionalen Karten zusammengesetzt.

Soundeffekte werden lokal erzeugt. Es werden keine externen Schrift- oder Sounddateien benötigt. Node.js 22 oder neuer wird für die Entwicklungswerkzeuge verwendet.

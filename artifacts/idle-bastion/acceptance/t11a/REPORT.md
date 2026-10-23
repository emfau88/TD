# T11a/T11b · lokale Idle-Vergleichsprobe

21.10.2026 · Branch `codex/tavern-idle-smoothing` · Basis `ee1fd97` auf `main`.

Der Nutzer hat den anfänglichen Mara-Haltepunkt während der Arbeit erweitert: beide bestehenden Idles einschließlich lesbarerem Ilyra-Gesicht vorführen, dann **vor Commit/Push** gemeinsam freigeben lassen. Keine zweite Idle-Variante und kein Deployment. Der vorher vorhandene unversionierte Ordner `.codex-remote-attachments/` blieb unangetastet.

## Befund

| Figur | Alter Ablauf in ms, Bildnummern ab 0 | Sichtbares Problem |
| --- | --- | --- |
| Mara | 0:1700, 1:900, 0:800, 2:100, 3:140, 0:1000 | Ein harter Schritt in die größere Atempose und zurück; Kopf/Haarumriss und Schulter-/Oberkörperzeichnung ändern sich gleichzeitig. Bild 2 ist bereits geschlossen, Bild 3 wieder offen mit abweichender Pose. |
| Ilyra | 0:1800, 1:520, 0:1100, 2:100, 3:120, 2:90, 0:900 | Kurzer direkter Atemwechsel; Bild 2 schließt zunächst nur ein Auge. Nase/Mund besitzen bei tatsächlicher Anzeige zu wenig Kontrast. |

Beide verwenden vier verschiedene Bilder. Die eigentliche Schleifennaht ist kein neuer Posensprung: letzter und erster Eintrag verwenden bereits Bild 0. Der bestehende Renderer registriert am Gürtel und zeichnet Ilyras Speer aus Bild 0 separat; diese Technik ist beizubehalten. Das kurze Zurücksetzen der Laufzeit im alten Renderer erklärt nicht die großen gezeichneten Sprünge.

## Kandidaten

Mara: zwei gezielte kleinere Atemzeichnungen, vorhandene Ruhe und geschlossener Blinkframe. Die bisher große Atempose und die unpassende offene Blinkpose entfallen; insgesamt weiterhin vier verschiedene Zeichnungen. 4,64-s-Loop mit 240/400/260-ms-Atemschritten. Die ursprüngliche Ruhe bleibt pixelidentisch als Anschluss an die vorhandenen Reaktionen.

Ilyra: fünf ausgewählte Bewegungsbilder, 4,63-s-Loop mit 230/340/260-ms-Atemschritten und beidseitigem 80/100/80-ms-Lidschlag. Kleine identische generierte Nase-/Munddetails wurden in die Bewegungsbilder gepackt. Der originale Speer bleibt separat und unbewegt. Ihre bestehenden Reaktionen behalten ihre bisherige Gesichtszeichnung; der sichtbare Anschluss an die neue Idle ist Teil der Nutzerbewertung.

Quelle/Prompt/Aufbereitung: [Mara](../../../../experiments/idle-bastion/assets/mara-tavern/idle-study/README.md), [Ilyra](../../../../experiments/idle-bastion/assets/ilyra-tavern/idle-study/README.md). Keine globale Bildpulsierung, kein zeitabhängiges Verschieben/Verformen und keine Crossfades. Imagegen liefert die Bewegungszeichnungen; das Packskript registriert, schneidet zu und kodiert verlustfrei. Kein Eingriff in Kampf, Punkte, Freischaltungen oder Saves.

## Lokale Vorschau

- [Mara](http://127.0.0.1:5218/idle-review.html?hero=mara)
- [Ilyra](http://127.0.0.1:5218/idle-review.html?hero=ilyra)

Gleich große Vorher-/Nachher-Flächen, gemeinsamer Start, halbes Tempo, Pause/Zeitleiste, Einzelbilder, heller/dunkler Hintergrund und Vergleich aller drei vorhandenen Reaktionen. Nur gewählte Figur wird geladen, Reaktionen erst beim Anfordern. Kein Speicheradapter oder Kampfmodul. Die Seite ist kein Eintrag im Produktionsbuild. Vite läuft lokal auf Port 5218; bei späterem Neustart `npx vite --config experiments/idle-bastion/vite.config.ts --port 5218`.

## Tatsächliche Prüfung

- `python experiments/idle-bastion/scripts/pack-idle-study.py`: PNG/WebP vollständig RGBA-identisch, Mara 538.046 Bytes, Ilyra 585.988 Bytes. Quellen und bisherige Runtime-Dateien unverändert.
- `node experiments/idle-bastion/scripts/check-idle-review.mjs`: Framegrenzen, geschlossene Loop-Naht, Pause/versteckter Tab, nur gewählte Idle-Bilder, Nachladen und Mehrfachklicks, alle sechs Reaktionen/Rückkehr, verspätete Antwort nach Figurenwechsel, Einzelbilder und verbotener Savezugriff bestanden.
- `npx tsc --project experiments/idle-bastion/tsconfig.json --noEmit`: erfolgreich.
- Separater Vite-Produktionsbuild nur für `idle-review.html` in temporäres Verzeichnis: erfolgreich (18 Module), alle Referenzen auflösbar. Kein Deployment und kein normaler Game-Build verändert.
- Browser: Desktopvergleich, Ilyra-Schulter und Mara-Haarreaktion; Hochkant mit angefragten 390×844, gemessener CSS-Breite 391 ohne horizontalen Überlauf. Figurenflächen proportional, Bedienelemente erreichbar. Ilyra auf hellem Grund mit transparentem Speerzwischenraum geprüft. Keine Browserwarnungen/-fehler im Prüfzeitraum. Desktop-Emulation, kein physischer Smartphone-Test.

![Mara Desktop](mara-desktop.png)
![Ilyra Desktop](ilyra-desktop.png)

Weitere Aufnahmen: [Mara hochkant](mara-mobile.png), [Ilyra hochkant](ilyra-mobile.png).

Technisch geprüfte **Entwürfe**, keine behauptete Nutzerabnahme. Originalproduktion ist unverändert. Vor Commit/Push und Einbau in die Spiel-Taverne ist die ausdrücklich gewünschte gemeinsame visuelle Freigabe offen; zweite Varianten folgen danach in den vereinbarten Einzelpaketen.
# Rückmeldung zur laufenden Revision 2

21.10.2026: Nutzer findet Maras überarbeitete Haare gut, beanstandet Brustversatz um 0,76 s sowie wandernde Augen. R2 ist ein unfertiger lokaler Arbeitsstand. Weitere Imagegen-Aufrufe wurden für die gewünschte Methoden-/Kostenklärung eingestellt. Trotz gemeinsamer statischer Bereiche bleiben die lokal montierten generierten Atem-/Augenzeichnungen untereinander zu inkonsistent. Keine visuelle Freigabe, keine Integration, kein Commit/Push. Status und empfohlener nächster Schritt stehen ausschließlich in der Roadmap. Nachfolgender Bericht und dessen Screenshots dokumentieren die zuvor vorgelegte erste Probe.


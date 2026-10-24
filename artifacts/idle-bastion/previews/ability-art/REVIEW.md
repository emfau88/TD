# SPIRE · Grafikprobe für Zauber und Markierungen

25.10.2026 · **Entwurf zur visuellen Nutzerabnahme, keine Gameplay-Integration.**

[Mobile Galerie mit Videos](https://emfau88.github.io/TD/previews/frost-hero/art-review/)

## Enthalten

- Acht originale, transparente Imagegen-Assets in `assets/`: zwei runde Zaubersymbole,
  zwei Bodensiegel, eine Zielmarke, Maras Lichtkeim, Sternprojektil und Sterneinschlag.
  Vollständige Prompts und Werkzeugangabe: [PROMPTS.md](PROMPTS.md).
- Sieben tatsächliche Browser-Screenshots aus der lokalen Spielszene in `screenshots/`.
  Desktop 1280×800, Hochkant 390×844. Kein nachträglich KI-generiertes Spielbild.
- Drei MP4-Clips in `videos/`: Mara und Sternensalve je 10 Sekunden, Cooldown 16 Sekunden.
  Browseraufnahmen, für mobile Wiedergabe nach H.264/yuv420p mit Faststart gepackt;
  ohne Ton und ohne Ladebildschirm. Die drei Originalclips zusammen unter 3 MB.
  Zusätzlich zwei vergrößerte Ausschnitte (640×540) für die Handy-Abnahme;
  die vollständigen Spielansichten bleiben direkt darunter verlinkt.

## Animation und Darstellung

Die Projektile bewegen sich auf gekrümmten Bahnen. Ihre Größe/Helligkeit pulsiert,
die Schweife ändern sich und lösen sich in abklingende Lichtpunkte auf. Ilyras drei
Sterne fliegen leicht versetzt. Der Einschlag entfaltet sich als wachsender Sternimpuls
mit auseinanderlaufenden und verblassenden Splittern. Maras Effekt umfasst Ankunft,
ein Blatt-Siegel am Turm, warmen Waffenschimmer und wenige aufsteigende Funken.

Die Grafiken sind Raster-Originale; Bewegung, Pulse, Ausdehnung und Alpha-Verläufe
werden zur Laufzeit animiert. Es wurden keine neuen Charakter-Spritesheets erzeugt.
Vorhandene Figurenposen bleiben erhalten. Die Vorschau registriert die transparenten
Ränder nur im Arbeitsspeicher; die erzeugten Originale bleiben unverändert.

Der runde Button zeigt einen radialen Schatten und eine lesbare Sekundenzahl.
Beim Abschluss ist das ganze Symbol sichtbar. Eine separate kleine Kennzeichnung
zeigt Automatik an/aus. Bodensiegel liegen unter Figuren und Türmen. Die Wegpunkte
folgen einem mit dem vorhandenen Pathfinder ermittelten Weg.

## Grenzen und Abgrenzung

Die Vorschau benutzt eine Kopie des vorhandenen verdienten Welle-40-Prüfstands.
Figurenpositionen, Effektzeitpunkte und UI-Zustände werden für vergleichbare Bilder
gestellt. Die Umgebung bleibt stehen; die Effektloops werden zur Anschauung häufiger
wiederholt. Das sind keine Gameplay- oder Balance-Messungen und keine verkürzten
Spiel-Abklingzeiten. Die native Spielwelt, Gebäude, Gegner und Figuren werden vom
vorhandenen Phaser-Renderer gezeichnet.

Die lokale Probe verwendet ausschließlich einen neuen `art-…`-Speicherplatz und eine
flüchtige Darstellungskopie. Ihre Dateien werden vom Spielbuild nicht importiert.
Der frühere lokale Entwurf für den rechteckigen Cooldown-Button wird nicht mit
veröffentlicht. Main und die spielbare Branch-Testversion erhalten keine neuen Effekte.

## Nachweise

- Transparenz aller acht Originale geprüft: zwischen 38,9 % und 92,4 % vollständig
  transparente Pixel. Kein aufgemalter schwarzer oder Schachbrett-Hintergrund.
- Alle sieben Aufnahmezustände ohne JavaScript-Fehler und ohne horizontalen Überlauf.
  [Browserprüfwerte](checks.json). Alle drei Clip-Aufnahmen ebenfalls ohne JavaScript-Fehler.
- Lokale Galerie bei 320, 390 und 1280 Pixel Breite ohne Überlauf, alle Bilder geladen
  und alle drei Videoelemente tatsächlich abgespielt, ohne JS-/Ressourcenfehler.
  Veröffentlichte Galerie und MP4-Wiedergabe werden nach dem Upload gesondert geprüft.
- Physisches Smartphone und endgültige Nutzerfreigabe stehen aus; Hochkantprüfung
  erfolgt in Chrome mit 390×844, die Galerie zusätzlich bei 320 Pixel Breite.

Der Prototyp liegt zum Nachvollziehen in `prototype/`. Für eine lokale Wiederholung
diesen Ordner nach `experiments/idle-bastion/.local-assets/ability-art-review/` kopieren
und die enthaltene `index.html` über den vorhandenen Vite-Devserver öffnen. Er ist
eine isolierte Gestaltungsprobe und ausdrücklich kein freigegebenes Featurepaket.

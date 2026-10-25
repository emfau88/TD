# SPIRE · Grafikprobe für Zauber und Markierungen

25.10.2026 · **V2 nach Nutzerfeedback. Entwurf zur visuellen Nutzerabnahme, keine Gameplay-Integration.**

[Mobile Galerie mit Videos](https://emfau88.github.io/TD/previews/frost-hero/art-review/?v=2)

## V2: Änderungen nach Feedback

- Figurenringe von 58×24 auf **38×20 Spieleinheiten** verkleinert, entsprechend der
  bisherigen Auswahlellipse. Die originalen Imagegen-Ornamente bleiben erhalten;
  eine additive Lichtschicht und ein kleiner Bodenschimmer verstärken das Leuchten.
- Mara sendet während der vorhandenen **acht Sekunden Buffdauer jede Sekunde einen
  Lichtimpuls** zum Turm. Acht Impulse, je 0,55 Sekunden Flugzeit; der letzte kommt
  vor Buffende an. Turmsiegel und Waffenschimmer bleiben durchgehend sichtbar und
  enden mit dem Buff. Keine zusätzlichen Anwendungen oder Verlängerungen.
- Ilyras Schaden ist bereits AoE: alle lebenden Gegner im **Radius 72** werden einmal
  getroffen. Die Vorschau zeigt diesen tatsächlichen Kreis statt einer flachen Ellipse.
  **Neun Sterne** verteilen sich auf Mitte und acht Außenpunkte bei 72 % des Radius.
  Sie erreichen ihre Ziele gemeinsam nach **0,81 Sekunden** (Modell: 0,6 × Tempo 1,35).
  Flächenimpuls und kleine Funken an jedem Gegner im Kreis verdeutlichen den gemeinsamen
  Treffer. Die neun Schmuckprojektile ändern weder Zielprüfung noch Schaden.
- Der positiv bewertete radiale Cooldown bleibt unverändert. V2-Dateien tragen
  `-v2` im Namen; die ersten Aufnahmen und alle Originalgrafiken bleiben erhalten.

## Enthalten

- Acht originale, transparente Imagegen-Assets in `assets/`: zwei runde Zaubersymbole,
  zwei Bodensiegel, eine Zielmarke, Maras Lichtkeim, Sternprojektil und Sterneinschlag.
  Vollständige Prompts und Werkzeugangabe: [PROMPTS.md](PROMPTS.md).
- Je sieben tatsächliche Browser-Screenshots aus der lokalen Spielszene in `screenshots/`.
  Desktop 1280×800, Hochkant 390×844. Kein nachträglich KI-generiertes Spielbild.
- Je drei MP4-Clips in `videos/`: Mara und Sternensalve je 10 Sekunden, Cooldown 16 Sekunden.
  Browseraufnahmen, für mobile Wiedergabe nach H.264/yuv420p mit Faststart gepackt;
  ohne Ton und ohne Ladebildschirm.
  Zusätzlich zwei vergrößerte Ausschnitte (640×540) für die Handy-Abnahme;
  die vollständigen Spielansichten bleiben direkt darunter verlinkt.

## Animation und Darstellung

Die Projektile bewegen sich auf gekrümmten Bahnen. Ihre Größe/Helligkeit pulsiert,
die Schweife ändern sich und lösen sich in abklingende Lichtpunkte auf. Ilyras neun
Sterne starten leicht versetzt und kommen gleichzeitig an. Der Einschlag entfaltet
sich über die markierte Fläche und klingt mit Sternsplittern ab. Maras wiederkehrende
Impulse beleben das Blatt-Siegel am Turm; warmer Waffenschimmer und wenige aufsteigende
Funken verbinden die einzelnen Ankünfte.

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

- **V2:** Alle sieben Aufnahmezustände ohne JavaScript-Fehler und horizontalen Überlauf.
  Radius 72, neun Ziele innerhalb der Fläche, gemeinsamer Trefferzeitpunkt und die
  übernommene Buffdauer in den [Aufnahmewerten](checks-v2.json) festgehalten.
  Drei erneute Browseraufnahmen ohne JavaScript-Fehler. Screenshots visuell geprüft;
  subjektive Nutzerabnahme weiterhin offen.
- **V2 veröffentlicht:** [Pages-Lauf 40145778412](https://github.com/emfau88/TD/actions/runs/40145778412)
  erfolgreich, Medienstand `f57f3eebfd915198e1bbb04e1c09f2144d467ace`. Öffentliche
  Galerie bei 320/390/1280 Pixeln ohne Überlauf; alle Bilder geladen und drei
  Videoansichten abgespielt, keine JS-/Ressourcenfehler. [Öffentliche V2-Prüfwerte](gallery-checks-v2.json).
  Main weiterhin `537b5e8c9cf09b696b41644da4c56dbc8633d720`; öffentliche Hauptseite
  erneut bytegleich mit dem ursprünglichen Main-Artefakt. Ausschließlich Medien,
  Darstellungsprototyp und Dokumentation committed; keine Gameplay-Dateien integriert.

- Transparenz aller acht Originale geprüft: zwischen 38,9 % und 92,4 % vollständig
  transparente Pixel. Kein aufgemalter schwarzer oder Schachbrett-Hintergrund.
- **V1:** Alle sieben Aufnahmezustände ohne JavaScript-Fehler und ohne horizontalen Überlauf.
  [Browserprüfwerte](checks.json). Alle drei Clip-Aufnahmen ebenfalls ohne JavaScript-Fehler.
- Lokale Galerie bei 320, 390 und 1280 Pixel Breite ohne Überlauf, alle Bilder geladen
  und alle drei Videoelemente tatsächlich abgespielt, ohne JS-/Ressourcenfehler.
  Die öffentliche Galerie wurde nach [Veröffentlichung 40144810616](https://github.com/emfau88/TD/actions/runs/40144810616)
  erneut bei 320/390/1280 Pixeln geprüft: alle Bilder geladen, alle drei Videoansichten
  (390×844 und zweimal 640×540) tatsächlich abgespielt, keine JS-/Ressourcenfehler.
  [Öffentliche Prüfwerte](gallery-checks.json). Medienstand: `a0ea34f8636de1016d20276fbc5edc04d89ad555`.
- Deployment erhält alle 401 Dateien des Main-Artefakts bytegenau; zusätzlich die
  öffentliche Hauptseite nach Veröffentlichung gegen den vorherigen Stand verglichen.
  Main bleibt `537b5e8c9cf09b696b41644da4c56dbc8633d720`.
- Physisches Smartphone und endgültige Nutzerfreigabe stehen aus; Hochkantprüfung
  erfolgt in Chrome mit 390×844, die Galerie zusätzlich bei 320 Pixel Breite.

Der Prototyp liegt zum Nachvollziehen in `prototype/`. Für eine lokale Wiederholung
diesen Ordner nach `experiments/idle-bastion/.local-assets/ability-art-review/` kopieren
und die enthaltene `index.html` über den vorhandenen Vite-Devserver öffnen. Er ist
eine isolierte Gestaltungsprobe und ausdrücklich kein freigegebenes Featurepaket.

# Succubus · Verbindungslinie und Bodenkontakt

26.10.2026 · ausdrücklich beauftragt: sichtbare Bogenlinie entfernen, bestehende
Herzbahn und Turmwirkung erhalten; zu weit von den Füßen entfernten Schatten korrigieren.

- Ausschließlich die durchgezogene/gestrichelte Verbindungslinie aus `BossCharmView`
  entfernt. Drei fliegende Herzen, identische Kurve, Geschwindigkeit und Phasen.
  Alle aufsteigenden Herzen, Glühen, Pulsieren und Umriss am Ziel unverändert;
  Quellblöcke gegen Ausgangscommit bytegleich geprüft.
- Die 36 geprüften Lauf-/Tanzframes aller drei Richtungen enden bei y=56. Der
  vorhandene Bildanker liegt bereits bei 56/64, Skalierung 1,15. Allgemeiner
  Gegnerschatten lag dennoch bei Welt-y+9: nur für Rosenspiegel auf Welt-y gesetzt.
  Zugehörigen Bodenring von y+3 auf denselben Fußanker gesetzt. Alle anderen
  Gegnerschatten, Bildpositionen und die große Tanzdarstellung unverändert.
- Kein neues Grafikasset, keine Kampf-/Save-/Zeitänderung.

## Prüfung

- TypeScript, Vite und Pages-Build bestanden. Zwölf bestehende Audio-/Sprachtests
  ebenfalls bestanden, nachdem fünf im vorigen Audio-Commit beschädigte UTF-8-
  Meldungstexte separat wiederhergestellt wurden. Keine Audiofunktion geändert.
- Vier echte Spielszenen: vorher/nachher bei 1280 und 390 px, derselbe native
  pausierte Boss-15-Spielstand. Schattenabstand 9 → 0, übrige Gegner weiterhin 9,
  gleiche Tanzframes und Zauberzustände. Keine Browserfehler.
- Für die Vergleichsaufnahmen Begleitgegner ausschließlich über ihre Sichtbarkeit
  ausgeblendet, damit die Füße erkennbar sind. Kampfzustand unverändert; für die
  Videos läuft nur die Darstellungsuhr durch Windup/Channel.
- Sichtprüfung der Desktop-/Hochkantaufnahmen: Linie entfällt, Herzen vorhanden,
  Fußkontakt hergestellt, Turmwirkung erhalten. Dies ist Eigenprüfung, keine
  behauptete zusätzliche Nutzerabnahme.
- Frische Browserpartie zur Musikfrage nur beobachtet: vor erster Geste kein
  Musikplayer, unmittelbar danach Exploration mit unverändertem 16-%-Regler.
  Musikstandard/-start und Maras Einführung/Bedienung wurden nicht verändert.

[Messdaten](browser-results.json) · [Vorher/Nachher](preview/index.html).
`check-browser.mjs` reproduziert native Bilder und Rohvideos. Die kurzen Effektclips
sind jeweils die letzten 5,7 Sekunden, ohne Audio verlustfrei als VP9 umgepackt.

## Nachbesserung: Herzen vollständig ankommen lassen

26.10.2026: Auf Nutzerwunsch den regulären Zauberabschluss bereinigt, ohne neue
Videos zu erstellen. Herzen starten nur, wenn die verbleibende Zauberzeit für
die ganze Flugstrecke reicht. Bereits fliegende Herzen erreichen weiterhin ihr
Ziel mit derselben Geschwindigkeit und blenden auf den letzten 10 % der Bahn
weich aus (rund 0,14 s). Am Turm bleiben sämtliche bestehenden Effekte unverändert.
Die Darstellung verwendet weiterhin ausschließlich die gespeicherte Zauberzeit;
kein zusätzlicher Timer, keine verlängerte Spielwirkung oder Saveänderung.

- TypeScript, Vite und Pages-Build bestanden.
- Echte Phaser-Darstellung mit nativem Boss-15-Probespielstand bei 1280/390 px
  ohne Aufzeichnung geprüft. 361 Zeitpunkte pro Ansicht in den letzten 1,5 s:
  Herzen nehmen nur noch 3 → 2 → 1 → 0 ab; jedes erreicht zuvor eine Alpha unter
  0,024 am Ziel. Letztes Herz endet rund 0,06 s vor Zauberende.
- Wiederholtes Zeichnen bei identischer pausierter Zeit liefert dieselben Herzen;
  nach Zauberende keine Herzen und kein Tanzpanel. Keine Browserfehler.
- Quellblock der aufsteigenden Zielherzen und des Turmglühens gegen vorherigen
  Commit bytegleich geprüft. [Messdaten](heart-finish-results.json).
- Bestehende Vergleichsvideos dokumentieren den vorherigen Stand, nicht diese
  Nachbesserung. Maras frühes Menü/Bewegung und Musik funktional unverändert.

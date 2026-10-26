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

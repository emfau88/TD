# Mara vor ihrer Zaubereinführung

26.10.2026 · Nutzer hat Bewegung, kurze Sprachantwort und kompakte frühe
Infokarte samt Commit/Push auf Main freigegeben.

- Nach Start der Verteidigung gelegentlich ein Feld neben den Ausgangspunkt
  gehen, zurückkehren und mit langen Standphasen die Blickrichtung wechseln.
  Vorhandene Navigation berücksichtigt Hindernisse und Turmreichweite; keine
  großen Umwege. Vor dem ersten Turmbau bleibt der bestehende Save exakt gültig,
  die Figur schaut in der Darstellung bereits nach vorne.
- Wisps Begrüßung beendet einen noch laufenden Warteweg. Während der wirklichen
  Zaubervorführung bleibt Mara stehen; nach Ablauf der ersten Wirkung sind freie
  Steuerung und vollständiges Menü verfügbar. Das folgende Erklärungskärtchen
  blockiert die nun angekündigten Befehle nicht mehr.
- Früher Karten-/Porträtklick: kurze Information mit konkreter Voraussetzung und
  vorhandene Auswahlstimme. Kein Bewegungsmodus, keine inaktiven Befehlsknöpfe.
  Während einer manuellen Vorführung bleibt der benötigte Cast erreichbar.
  Ausführliche Erklärung ist später aufklappbar. Stimmenpegel/Cooldown unverändert;
  kein Ton durch automatische Wartebewegung.

## Prüfung

- 24/24 Tests: drei neue Bewegungs-/Reload-/Freischaltungsfälle sowie vorhandene
  Discovery-, Heldensteuerungs-, Intro- und Sprachtests. Keine Vollsuite behauptet.
- TypeScript, Vite und Pages-Build bestanden.
- Acht echte Browserfälle, 1280 px/Deutsch und 390 px/Englisch: ungebauter Start,
  gespeicherter Laufabschnitt, manuelle Zaubereinführung, kurz vor Ablauf der
  ersten echten Wirkung. Separate native Probe-Spielstände; Hauptsave unberührt.
- Infokarte 106–124 px hoch, manuelle Einführung 196–227 px. Tatsächliche
  Audiowiedergabe und Cooldown, Karten-Hitbox nach Reload, Wechsel zum vollständigen
  Menü, aufklappbare Details und wirklicher Bewegungsbefehl erfolgreich.
  Keine Browserfehler. Mobile Pause über normales Schließen der Karte erreichbar.
- Eigene Sichtprüfung der Desktop-/Mobilansichten; keine behauptete Nutzerabnahme,
  keine neue Videoaufnahme. [Browserdaten](browser-results.json).

`node --import tsx artifacts/idle-bastion/acceptance/mara-early/check-browser.mjs`
reproduziert die Browserprüfung mit dem bestehenden lokalen Devserver auf 5235.

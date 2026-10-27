# Kompakte Tutorialführung und Pauseknopf — 28.10.2026

## Ergebnis

Eine gemeinsame Kachel zeigt den Tutorialzähler, die gerade relevante Erklärung
und während Wartewellen das nächste Wellenziel. Frosthinweise und vorhandene
Aktionsbuttons bleiben erhalten. Menüs und Platzierung zeigen den Zähler direkt
im jeweiligen Bedienbereich. Die optionale Werkstatt-II-Empfehlung erscheint erst
nach dem Tutorial. Kampf, Belohnungen und Speicherformat bleiben unverändert.

Der vorhandene Pauseknopf steht oben neben Wellen-/Ansichtssteuerung. Sein
SVG-Symbol ist zentriert und wechselt bei Pause zum Startsymbol. Die mobile
Position wurde anhand der Spielaufnahme vom Nutzer freigegeben; Commit/Push
wurden anschließend ausdrücklich beauftragt.

## Prüfung

- 27/27 gezielte Tests: gemeinsame Sichtbarkeit/Prioritäten, echte Buttonlistener,
  Wisp-Übergang mit Speichern/Restore, Kontext/Platzierung, Dialoge und Tutorialende,
  bestehende Schrittzählung, Entdeckungen, Kurzempfehlungen und Übersetzungen.
- Produktionsbuild einschließlich TypeScript erfolgreich.
- 33 Browserfälle im Entwicklungsbuild: elf vorhandene Tutorialzustände jeweils
  bei 390 × 844 (EN), 320 × 568 (DE) und 1440 × 900 (EN). Keine konkurrierenden
  Hinweiskacheln, kein horizontaler Überlauf und keine JavaScript-Seitenfehler.
  Zusätzliche echte Aktionen: Wisp begrüßen, Steinschleuder überspringen,
  Pause/Fortsetzen, Turmmenü öffnen/schließen und Speicherfortsetzung.
- Unverändertes Produktionsbundle: echter Start mit ersten drei Mara-Szenen,
  Turmbau und erstem Upgrade bei 390 und 320 px; danach Pause/Fortsetzen.
  Sieben weitere Situationen: Wisp-Warteziel am Desktop und im Querformat,
  Lager-Warteziel bei 320 px, Wisp/Mara-Übergang bei 390 px, Steinschleuder
  und Lager bei 320 px sowie tatsächlicher Frostbau bei 390 px. Erfolgreicher
  Tutorialabschluss blendet die normale Werkstatt-II-Empfehlung wieder ein.
  Pause/Fortsetzen und Reload erhalten den Tutorialfortschritt.
- Elf abschließende Produktionsmessungen: keine überlappenden Hinweisflächen,
  kein horizontaler Überlauf, Symbole geometrisch zentriert, Kartensteuerung
  frei und keine JavaScript-Seitenfehler. Größte gemessene Kachel 174 px hoch;
  Lager-Warteziel bei 320 px nur 123 px hoch.

Die Browserprüfungen verwenden Chrome mit mobilen Viewports und Touchereignissen,
keine physischen Mobilgeräte. Vorbereitete spätere Spielstände entstehen mit der
echten Spielsimulation; separate Probe-Speicher schützen den Hauptspielstand.
Der Entwicklungscheck exponiert nur im Test Sessionzugriff; der Produktionscheck
verändert keinen Anwendungscode. Der Prüfablauf wartet auf asynchron bestätigte
Intro- und Pausenzustände, statt unmittelbar nach dem Klick zu messen.

## Nachweise

- [Gezielte Tests](tests.txt), [Build](build.txt)
- [Entwicklungs-Browserdaten](browser-results.json), [Produktionsdaten](production-results.json)
- [Echter mobiler Einstieg](production-fresh-build-390.png)
- [320 px: Ziel während der Wartewellen](production-wait-warehouse-320.png)
- [Desktop: Frosthinweis und Wellenziel](production-wait-wisp-1440.png)
- [Querformat: Kopfzeile und kompakte Anleitung](production-wait-wisp-844.png)
- [320 px: optionale Steinschleuder](production-cannon-320.png)

Produktionsbilder sind der abschließende Stand. Die unpräfigierten Bilder
stammen aus der vorangegangenen Entwicklungsprüfung, vor der letzten Kürzung
des Textes zur Lager-Wartephase.

## Veröffentlichung

Commit/Push und Pages-Prüfung stehen noch aus.

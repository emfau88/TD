# Ladebild ohne schwarzen Bildkasten · 27.10.2026

Die bestehende Lagerfeuerszene wurde mit dem eingebauten ImageGen auf echten transparenten Hintergrund freigestellt. Figuren und Motive bleiben erhalten; das generative Ergebnis ist keine Zusage pixelidentischer Bilddaten. PNG-Original und vollständiger Prompt liegen unter [loading-art](../../loading-art/2026-10-27/PROMPT-CUTOUT.md).

Die Oberfläche verwendet einen gemeinsamen dunklen Petrolhintergrund mit dezentem warmem Licht, einen feinen Außenrahmen und mehr Freiraum. Desktop/Querformat stellen Bild und Text nebeneinander; Hochkant stapelt sie. Der Titel bleibt zweizeilig, der Untertitel bricht nur zwischen vollständigen Sätzen um.

## Prüfung

- Bestehende Ladebildtests: **7/7 bestanden**; Produktionsbuild einschließlich TypeScript erfolgreich.
- Produktionsbuild in Chrome: 1440×900, 1280×720, 390×844, 320×568 und 844×390 auf Englisch; 390/320 zusätzlich auf Deutsch. Alle Titel-/Untertitelzeilen ohne Überlauf, Bedienbereich innerhalb der Höhe. Bilder visuell geprüft.
- Transparenter PNG-Export mit Alpha 0–254 und sechs transparenten Randproben; beide WebP-Ausgaben RGBA mit Alpha 0–255. Laufzeitgrafiken 126.912 / 261.468 Bytes für 720 / 1200 px. Der frühere schwarze CSS-Bildhintergrund ist ebenfalls entfernt.
- Verzögerte Musik hält das Spiel bis zur Abspielbereitschaft zurück. Nach erster Berührung beginnt die Musik. Alle drei Sprüche erfasst; Stummstart, echter Musikfehler und 25-Sekunden-Timeout einschließlich Fortsetzen ohne Musik erfolgreich. Keine JavaScript-Seitenfehler.
- README zeigt die aktuelle Hochkantaufnahme. Die Aufnahme wurde durch verzögerte Musikanforderung festgehalten; im Spiel gibt es keine zusätzliche künstliche Mindestladezeit.

[Browser-Messungen](browser-results.json) · [Prüfskript](check-browser.mjs) · [Testausgabe](tests.txt) · [Buildausgabe](build.txt)

## Ansichten

![Desktop](loading-1440.png)

![Hochkant](loading-390.png)

[320 px Deutsch](loading-320-de.png) · [Querformat](loading-844.png) · [Musikfehler mit bedienbaren Buttons](loading-error-320.png)

Browseremulation ersetzt keine physische Smartphone-Abnahme. Die subjektive Bewertung durch den Nutzer bleibt offen. Veröffentlichung und Live-Nachweis werden nach Pages ergänzt.

# T11 · feste Ruhebilder

21.10.2026. Auf ausdrücklichen Folgeauftrag je ein einzelnes Ruhebild aus den bereits verbesserten Zeichnungen gesichert. Ilyra anschließend ausdrücklich ohne Speer. Keine neue Bildgenerierung; keine neue Animation, Installation, Spielintegration oder Veröffentlichung. Paketstatus ausschließlich in der Roadmap.

## Ergebnis

- Mara: erste Zelle der R2-Probe, verbesserte dunkle Haarkontur und offene Augen. Keine der beanstandeten Atem-/Blinkmontagen enthalten.
- Ilyra: erste Zelle der R1-Probe, vorhandene Nase-/Mundkorrektur und offene Augen. Das separat gezeichnete Original-Speerbild wird auf Nutzerwunsch nicht hinzugefügt.
- Jeweils 384×512 RGBA, `body.png`, `rest.png`, verlustfreies `rest.webp`, Quellen-/Pixelhashes und erhaltene Körperanker in `rest.json`. Ordner: `experiments/idle-bastion/assets/mara-tavern/rest-reference/` und `experiments/idle-bastion/assets/ilyra-tavern/rest-reference/`.
- Diese Referenzen werden durch das bisherige Animations-Packskript nicht neu erzeugt oder überschrieben.
- Lokale gemeinsame Ansicht: http://127.0.0.1:5218/rest-review.html. Ilyra in der Ansicht mit bisherigem Faktor 1,1; nach Wegfall des Speers nur in der Präsentation horizontal zentriert. Quelldatei/Körperanker erhalten.

## Kurze Prüfung

Beide Körperbilder bytegenau gegen die RGBA-Pixel der jeweiligen ersten Quellzelle geprüft. PNG und dekodiertes WebP vollständig identisch. Mara-WebP 132.580 Bytes, Ilyra-WebP ohne Speer 116.004 Bytes. Beide Bilder im Browser geladen, natürliche Größe jeweils 384×512. Statische Seite ohne Abspielsteuerung oder Spielstandzugriff.

Desktopansicht mit hellem Hintergrund: beide Figuren, Haare, Hände, Gesicht und Transparenz sichtbar. Hochkant angefordert 390×844, gemessene Inhalts-/Viewportbreite jeweils 391 px, kein horizontaler Überlauf; Karten untereinander. Keine Produktionsbuild-/Gameplaytests für diese isolierte statische Bildprobe nötig. Bestehende fremde Audioänderungen und deren Staging erhalten.

![Gemeinsame Ruhebilder](desktop.png)

[Hochkantaufnahme](mobile.png)

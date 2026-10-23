# Neue Tavernenfiguren im echten Spielrahmen

Lokale Abnahme mit derselben `TavernUI`, deren CSS und bestehenden Herz-/Aktionsregeln. Eigener temporärer `BattleSession`, ohne persistierenden Store und ohne Zugriff auf bestehende Spielstände. Die neue Darstellung wird über eine optionale Präsentationsschnittstelle eingesetzt; normaler Spieleinstieg und alte Darstellung sind erhalten. Auftrag und Abnahme stehen ausschließlich in der zentralen Roadmap.

## Öffnen

`node node_modules/vite/bin/vite.js --config experiments/idle-bastion/vite.config.ts --port 5224`

- [Mara](http://127.0.0.1:5224/tavern-rig-check.html?hero=mara)
- [Ilyra](http://127.0.0.1:5224/tavern-rig-check.html?hero=ilyra)
- [Originalexport zum Vergleich](http://127.0.0.1:5224/tavern-rig-check.html?hero=mara&quality=source) – nur lokal im Dev-Modus, benötigt die erhaltenen Originalatlanten.

Zurück-Pfeil: Figur wechseln. Nach Schließen der Taverne lässt sich die Test-Herzstufe wählen. Sprechen/Haare zeigen die Kopfreaktion, Hand/Schulter die Berührung, Schenken ab Herz 2 die Freude. „Zusammen lachen“ zeigt Kichern, „Ein Kompliment machen“ die Hüftpose. Mara hat zusätzlich „Ein wenig necken“. Die zusätzliche Idle läuft nach drei normalen Loops. Gestenbuttons können eine Folgegeste vormerken; reguläre Spielaktionen behalten ihre bestehende Transaktionssperre während Reaktionen.

Ilyras Hüftpose verwendet die akzeptierte separate Zeichnung einschließlich der korrigierten Hand. Der Wechsel erfolgt sichtbar am Ruhepunkt, ohne den abgelehnten Armübergang. Ein nahtloser perspektivischer Armübergang wird nicht behauptet oder neu produziert.

## Platzierung

Fester Ausschnitt 480 × 700, identische Position und gleichmäßige Skalierung innerhalb jeder Figurenfamilie. Die drei nativ größeren Zusatzposen sind auf genau ihre zuvor in der Probe verwendete Darstellung abgeleitet. Keine Änderungen an Körperteilen, Rig, Anatomie oder Bewegungsframes.

Auf Nutzerwunsch Mara 48 und Ilyra 30 Darstellungspixel höher; Vordergrundrahmen 16 CSS-Pixel am Desktop, 10 im Hochkantlayout. Hände und mehr vom Schenkelzwischenraum sichtbar. In sämtlichen 1.848 Frames liegen die gemessenen Beinenden an zwei inneren Schenkelquerschnitten mindestens 9 Pixel bei Mara und 10 Pixel bei Ilyra unter dem Canvas; zusätzlich verdeckt der Rahmen. Kleinster oberer Abstand 17 Pixel bei Mara, 3,75 Pixel in Ilyras separater Hüftpose. `crop-check.json` dokumentiert diese Querschnittsmessung; sie ersetzt keine visuelle Konturprüfung.

## Kompression

Alle Angaben dezimale MB, ohne Originalprojekte/Caches/alte Vergleiche.

| Auswahl | Bisherige Exporte | Kompakte Atlanten |
| --- | ---: | ---: |
| Zwölf Clips im Herz-2-Paket | 316,36 MB | Einzelwerte in `runtime-size-report.json` |
| Alle 15 Bewegungen einschließlich Necken und beider Hüftposen | 532,35 MB | **114,55 MB** |

**78,5 % Ersparnis**: WebP Qualität 90, alle 30 fps und Clipdauern erhalten, verdeckte untere Bildbereiche ausgespart, höher aufgelöste Extras auf dieselbe Spielansicht normalisiert. Alpha in allen kompakten Atlanten pixelgenau zur vorbereiteten Darstellung; RGB bewusst verlustbehaftet. Alle Ausgangsquellen und lokalen Altstände erhalten.

Zwei Atlasproben: WebP 90 sparte etwa 75 %, WebP 95 etwa 67 %. AVIF 90 war bei den getesteten Einstellungen größer; daraus folgt kein allgemeiner Codec-Vergleich. Verlustfreies animiertes WebP sparte an Maras vollständiger Idle nur 4,3 %. Nutzer akzeptierte praktisch unsichtbare verlustbehaftete Kompression und beauftragte die Durchführung. Daten: `sizes.json`, `lossy-samples.json`, `compression-sample.json`, `runtime-size-report.json`. Sichtbare Abnahme bleibt beim Nutzer.

Standardmäßig werden die kompakten Dateien unter `experiments/idle-bastion/assets/tavern-rig/` verwendet. Kein LFS für diese Runtime-Dateien. Der optionale lokale Originalvergleich wird im Produktionsbuild entfernt. Start lädt ausgewählte Idle und nächste Atlas-Seite; Reaktionen nur bedarfsgesteuert. Höchstens acht aktive Bildreferenzen im Player, pausierte Wiedergabe bei verborgenem Dokument. Browserinterne Caches sind davon unabhängig.

## Kompakte Prüfungen und Grenzen

- TypeScript und separater Vite-Produktionsbuild der Prüfseite erfolgreich; normale Build-Einstiege unverändert.
- Zwei vorhandene Tavernen-Transaktionstests bestanden (Pausen-/Geschenk-/Speicherverhalten).
- 1.848 Frames mit identischen Framezahlen/-raten; Quellatlanten vor/nach Verarbeitung per SHA-256 unverändert; Alpha in jeder Seite exakt. Vollständige Hashliste lokal unter `qa/`.
- Browser: beide Figuren, Kopf-/Berührungsreaktion, laufende Ilyra-Hüftpose und Rückkehr zur Idle, Desktop sowie 390 × 844. Kompakte Fassung im Spielmaßstab betrachtet. Keine manuelle Einzelbildabnahme aller Frames behauptet.
- Screenshots, große Codecproben, temporärer Build und Hashdetails bleiben unter ignoriertem `qa/`. Keine zusätzlichen PNG-Sequenzen versioniert.

Der normale Spieleinstieg wird vor weiterer Freigabe nicht automatisch umgestellt. Kein Merge nach main. Vor Übernahme müssen die UI-Änderungen mit dem inzwischen fortgeschrittenen Hauptstand und dessen englischen Texten zusammengeführt und die Darstellung freigegeben werden.

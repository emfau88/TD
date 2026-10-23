# Mara · T11 bestehende Idle · lokale Vergleichsprobe

**Aktuell in der Vorschau: experimentelle Revision 2, noch mit sichtbaren Mängeln.** Der Nutzer findet die Haarkontur gut, hat aber Brustversatz um 0,76 s und wandernde Augen beanstandet. Diese Animation ist kein freigabefähiges Ergebnis. Paketstatus/Methodenklärung ausschließlich in der Roadmap.

R2-Quellen: `source-outline-r2.png` (`exec-fdc30a89-8e71-450c-9aef-29522173d3bd.png`) und `source-motion-r2.png` (`exec-715fa841-e1a4-4718-a66e-bdc7ec765acd.png`), eingebautes Imagegen, Prompts in PROMPTS.md. Sechs Zellen; gemeinsame Ruhezeichnung mit lokal ausgewählten gezeichneten Atem-/Augenbereichen. Die Montage hält den äußeren Umriss und die Hände fest, korrigiert aber die inkonsistenten Proportionen/Positionen innerhalb der generierten Bereiche nicht ausreichend. Keine weitere Generierung nach diesem Nutzerfeedback.

`candidate.*` und das Packskript enthalten R2; die zuvor gezeigten Dateien sind unverändert in `revision-1/` gesichert. Die nachfolgende Beschreibung dokumentiert **Revision 1**, nicht den aktuellen Kandidaten.

21.10.2026. Ausgangspunkt `ee1fd97`. Nur `idle-review.html` verwendet diese Kandidaten. Originalatlas, Runtime-Dateien und Tavernenrenderer bleiben bis zur Nutzerfreigabe unverändert.

Verbindliche Referenz: freigegebener `../mara-atlas.png`, am Gürtel wie im Renderer registriert. `reference-registered.png` enthält die vier vorhandenen Idle-Zeichnungen in 384×512-Zellen, `reference-rest.png` die erste davon. Kein neuer Charakterentwurf.

Eingebautes Imagegen, exakte Texte in [PROMPTS.md](PROMPTS.md):

- `source-inbetweens.png` (`exec-fe932da5-3166-4e55-a793-3e9b80f53964.png`): erster Versuch, wegen zu stark verändertem Haarumriss/Zeichenstil verworfen, nicht im Kandidaten verwendet.
- `source-local-motion.png` (`exec-48fe1271-c881-4a01-be03-8bc60dd2a851.png`): ausgewählte zwei Atemzeichnungen. Dritte Blinkzeichnung verworfen, weil sie zusätzliche Gesichts-/Körperänderungen einführt.

Der Kandidat enthält vier unterschiedliche Bilder: unveränderte Originalruhe, zwei neue kleinere Atemposen und das vorhandene geschlossene Blinkbild. Die harte alte Atem-Endpose und die abweichende offene Blinkpose entfallen. Die neue Zwischenpose wird beim Ausatmen rückwärts durchlaufen. Keine Prozentvorgabe für die Bildzahl, keine Bildverformung, Überblendung oder globale Pulsbewegung.

Zeitfolge in Millisekunden: Ruhe 1300 → Zwischenpose 240 → kleine Einatmung 400 → Zwischenpose 260 → Ruhe 1000 → geschlossen 100 → Ruhe 1340. **4640 ms**, wie bisher. Der originale Lidschlag bleibt bewusst kurz; keine schlechter passende Halbblinkzeichnung eingefügt.

Reproduktion: `python experiments/idle-bastion/scripts/pack-idle-study.py`. Gleiche feste Nearest-Neighbour-Aufbereitung pro neuer Quelle, Gürtelanker (192/360), keine zeitabhängige Skalierung. Kandidat 1536×512, vier Zellen. Untere Schnittkante bei y478 entfernt nur abweichende Exportenden; Originalruhe vollständig erhalten. `candidate.png`, `candidate.webp` und `candidate.json` sind lokal gespeichert; WebP wird nach dem Speichern vollständig gegen PNG-RGBA geprüft (538.046 Bytes).

Die Bildtreue der neuen Zeichnungen und der subjektive Bewegungsfluss sind Gegenstand der visuellen Freigabe. Bestehende Schulter-/Hand-/Haarreaktionen werden in der Probe unverändert aus den alten Quellen geladen. Keine zweite Idle-Variante produziert. Paketstatus ausschließlich in der [Roadmap](../../../ROADMAP.md).

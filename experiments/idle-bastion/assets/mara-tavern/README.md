# Mara — T01 Tavernenprobe

[Interaktive Vorschau](https://emfau88.github.io/TD/idle-bastion/mara-check.html) · [PNG-Atlas](mara-atlas.png) · [Frame-Metadaten](mara-atlas.json) · [Exakte Prompts](PROMPTS.md)

Stand 21.10.2026. Technische Vorschau, visuelle Nutzerabnahme offen. Kein Ersatz der Kartenfigur und keine Tavernen-/Save-Integration.

Originalreferenz: `public/assets/Hero Mara.png`. Tavernen-Berührungsmockup nur für Ausschnitt/Präsentationsqualität; keine Schutzbrille übernommen. Erwachsene Mara mit rotem Zopf, grünen Augen, türkisfarbenem Umhang/Schal und burgunderfarbener Lederkleidung.

Grundfassung erstellt mit dem eingebauten Imagegen-Werkzeug in zwei Aufrufen. Zweiter Aufruf korrigiert den Armwechsel in Frame 6. Das ursprüngliche ausgewählte PNG blieb zunächst pixelweise unverändert; keine nachträgliche Bildverformung, kein Rig, keine Überblendung als Bewegungsersatz. 1254 × 1254 RGBA, 4 Spalten × 3 Reihen, vier Idle-Zeichnungen und acht Zeichnungen einer Schulterreaktion. Ein Atlas benötigt rund 6 MiB dekodierte RGBA-Pixel; PNG der Grundfassung ungefähr 2,1 MiB; die Haarkorrektur kann wegen verlustfreier Speicherung größer ausfallen.

Die JSON-Datei enthält ganzzahlige Ausschnitte (abwechselnd 314/313 Pixel breit, 418 hoch), feste Registrierpunkte am Gürtel und Framezeiten in Millisekunden. Canvas 384 × 512; Rendering mit unveränderter Framegröße und `imageSmoothingEnabled=false`. Die Registrierpunkte gleichen den Exportversatz aus, sie erzeugen keine Animation. Pose und Armbewegung stammen aus den unterschiedlichen Zeichnungen. Idle 4,64 s; Reaktion 1,94 s. Die Probe endet wieder in der Ausgangspose. Der tatsächliche Bildausschnitt reicht bis zu den Oberschenkeln; das ist in der visuellen Abnahme gegen den gewünschten größeren Kopf-bis-Knie-Ausschnitt zu bewerten.

`mara-check.html` importiert nur die eigene Darstellung und diesen Atlas; keine Kampf-, Save- oder Gefährtenmodule. Auswahl per Schulterbutton oder Aktionsbutton. Mehrfachklick während der Reaktion ist gesperrt, Pause und Einzelbildregler erlauben Prüfung. Ein versteckter Tab stoppt den Animationsloop. Atlaslink öffnet die Originaldatei; Frame-Daten sind herunterladbar.

Kompakte Prüfung: `node scripts/check-mara-preview.mjs`, danach `npm run idle:build`. Der isolierte Steuerungstest prüft Idle, vollständige Reaktion, Mehrfachklick, Pause/Einzelbild, Wiederaufnahme und Tab-Lebenszyklus; Spielstandzugriffe lösen im Test Fehler aus. Visuelle Prüfung separat dokumentieren. Körper-/Kleidungsdetails und Bewegungskontinuität bleiben Gegenstand der Nutzerabnahme; weitere Frames/Reaktionen erst nach Freigabe.

## Gezielte Haarkorrektur vom 21.10.2026

Nutzerfeedback: übrige Darstellung gefällt, ausschließlich glitschende Haarbereiche nachbessern. Ein weiterer Imagegen-Aufruf beruhigt die Haarzeichnung. Da dessen Gesamtbild auch andere Details veränderte, wird es nicht vollständig übernommen. `apply-hair-pass.cjs` übernimmt nur ausgewählte kupferrote Haarpixel aus `sources/hair-pass.png`; `sources/hair-selection.png` dokumentiert die Auswahl. Nach innen auslaufende Gewichtung vermeidet harte Schnittkanten, außerhalb der Maske bleibt der Originalatlas aus Commit `8481d5b` bytegenau erhalten. Gesicht, Hautbereiche und gekreuzter Arm werden zusätzlich ausgespart. Keine Verschiebung, Verformung oder neue Animation.

45.836 geänderte Pixel innerhalb der Auswahl, null geänderte Pixel außerhalb. Unabhängiger dekodierter Vergleich bestanden. Frame-Metadaten, Timing, UI und Laufzeitcode unverändert. Steuerungsprüfung und Idle-Build bestanden; weitere visuelle Abnahme bleibt beim Nutzer. Die Referenzfassung ist weiterhin in Git verfügbar.

Reproduktion: Sharp als Assetwerkzeug verfügbar machen und im Repo `node experiments/idle-bastion/assets/mara-tavern/apply-hair-pass.cjs` ausführen. Kein zusätzliches Paket im Spiel/Build benötigt.

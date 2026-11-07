# Ilyra am Fenster · fünf Proben · 07.11.2026

**Aktueller Stand:** IF01 (korrigierte v2), IF02, IF03, IF04 und IF05 ausdrücklich freigegeben und auf anschließenden Nutzerauftrag integriert. Nach IF05 Renderstopp; IF06 nur vorbereitet mit gesperrter Autorisierung, kein Job gestartet. [Integrationsnachweis](../ilyra-window-integration-2026-11-07/REPORT.md). [Alle Szenen isoliert testen](../tavern-scene-preview-2026-11-07/README.md).

Alle fünf Clips auf Nutzerauftrag **nacheinander** erstellt, jeweils nach Abschluss und Bildprüfung des vorherigen Clips. Die folgende Beschreibung dokumentiert die ursprüngliche Clipproduktion vor der beauftragten Integration. IF06/IF07, Herz 5 und weitere Szenen nicht gestartet.

| Clip | Inhalt | Dauer | Status |
| --- | --- | ---: | --- |
| IF01 | Ruhige Grundpose, dezentes Blinzeln | 3,75 s | v2 korrigiert, freigegeben |
| IF02 | Aufmerksam zuhören, kleine Kopfneigung und warmes Blinzeln | 2,33 s | native Fassung, freigegeben |
| IF03 | Sanfte Reaktion auf Haarkontakt, ohne sichtbare fremde Hand | 2,33 s | native Fassung, freigegeben |
| IF04 | Schulterreaktion, eigene Hand an der Hüfte, leichte seitliche Gewichtsverlagerung | 3,04 s | native Fassung, freigegeben |
| IF05 | Eigene Hand sanft wenden/anheben, Blick zur Hand und zurück | 3,04 s | native Fassung, freigegeben |

Gemeinsame neue Fensterreferenz aus der bisherigen erwachsenen Ilyra und dem tatsächlichen Tavernenbild, erstellt mit dem eingebauten image_gen-Werkzeug. [Bildprompt und Herkunft](reference-generation.md), [Referenz](reference.png). Gleiches Bild als erstes und letztes Frame aller drei lokalen ComfyUI-Jobs. Gleiche Kleidung, Frisur und Fensterposition; beide eigenen Hände vollständig sichtbar.

H3 W4A8, ClipProj, quantisierter Textencoder und Video-VAE, automatische Auslagerung; die Modell-/Sampler-/Decoderknoten entsprechen dem bewährten MC04-Workflow und damit der ursprünglichen Mara-Serie. 20 Schritte, 480 × 704, native 24 FPS, stumm, keine Bewegungsinterpolation oder Beschleunigung. IF01: 90 Frames; IF02/IF03: jeweils 56 Frames. Beide Workflows/Referenzbindungen vor dem Start geprüft. Native Jobs nur einzeln, kein paralleles Rendering.

Alle 202 nativen Frames, Hände in jedem Frame sowie vergrößerte Gesichtskontaktbögen kontrolliert. Keine beobachtete fremde Hand, neue Kleidung oder auffällige Halsverkürzung. Anfangs-/Endposen gemeinsam verglichen. Keine absolute Fehlergarantie; die ästhetische Freigabe bleibt beim Nutzer.

**IF01-Korrektur:** Der erste Render zeigte ein unerwünschtes Anheben/Krümmen der Finger auf der Fensterbank. Statt einer erneuten KI-Berechnung wurde die bereits bei I01 v2 akzeptierte lokale Videostabilisierung wiederverwendet: Gesicht und Blinzeln oberhalb Zeile249 unverändert, weicher Übergang bis280, Körper/Umhang/Hände darunter im Ruhebild gehalten. Im verlustfreien Zwischenmaster pixelgenau geprüft. 90 Frames und 3,75s bleiben erhalten; Ausgabe H.264 CRF16. Der ursprüngliche Render bleibt unter `IF01/original-v1` erhalten. IF02/IF03 wurden nicht nachträglich verändert.

Die Produktionsskripte sind Herkunftsnachweise; ihre ursprüngliche lokale Arbeitsbasis bleibt `artifacts/idle-bastion/tavern-comfy-series-2026-11-06/ilyra-window`. Nur dort über den geprüften Einzelläufer starten; bestehende Jobs werden gegen versehentliches Überschreiben geschützt. Zur erneuten Nutzung eines Workflows die gemeinsame Referenz unter dem darin angegebenen Eingabedateinamen laden.

## Zweite Lieferung: IF04 und IF05

Beide mit derselben Referenz und den bewährten Modell-/Sampler-/Decoderknoten. Je73 Frames, 480×704, native24FPS, stumm. IF04:228,1s Renderzeit /715.942Byte; IF05:252,1s /695.947Byte. Alle146 Frames, Hände und vergrößerte Gesichter kontrolliert; keine beobachtete fremde Hand, einzelne zuckende Finger, auffällige Halsverkürzung oder Kleidungswechsel. Beide unverändert übernommen; IF05 wurde anschließend ausdrücklich freigegeben. IF06 ist unter `prepared-only` nachvollziehbar abgelegt; `authorized:false`, kein Render. Die Angaben zur ersten Lieferung oben bleiben als Herkunftsnachweis erhalten.

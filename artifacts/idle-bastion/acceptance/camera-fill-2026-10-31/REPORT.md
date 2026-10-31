# Kamerafläche ohne dunkle Streifen · 31.10.2026

Ausgangsstand: `f3ce55510872e637c532e6ff8e1a6b32850187b7` (Main). Ursache war die Viewport-Verkleinerung aus `e2a1575`: Im geführten Hochkantfokus war die Karte kürzer als die verfügbare Bildschirmfläche. Die Tutorialkarte lag dadurch optisch auf einem dunklen Balken.

Der Viewport bleibt jetzt vollständig geöffnet. Wenn eine Achse die gesamte Karte zeigt, wird ausschließlich der notwendige Rand ergänzt und die Karte darin zentriert; es entsteht kein zusätzlicher Verschiebespielraum. Eine kleine 160×160-Textur aus bestehenden Gras-/Baumgrafiken füllt die Randflächen als Waldkulisse. Vier statische Flächen, keine neuen Assets, Akteure oder Animationen. Das Kartenmodell einschließlich Bauflächen und Navigation, Turmmaßstab, Kampf, Speicherung und Offline-Regeln bleibt unverändert. Die frühere Kontrolle auf beschnittene Viewports wurde durch genaue Vollflächen-/Randgrenzenprüfungen ersetzt; übrige Kamera-/Legacy-Fälle bleiben bestehen.

## Tatsächliche Prüfung

- 23/23 Kamera-/Intro-/Tutorialfortschrittstests bestanden. Enthält gemessene HUD-/Dock-Abstände bei Pixeldichte 1/2, minimale Randgrenzen, Zoom ohne Randwachstum, gespeicherte Turmpositionen und unverändertes Kartenmodell.
- 10/10 Wald-/Layouttests bestanden. Produktionsbuild einschließlich TypeScript erfolgreich.
- Reale Oberfläche bei 390×844, 360×800 und 1280×720 visuell geprüft. Ein ergänzender 320×568-Screenshot wurde vor der Nutzerpräzisierung aufgenommen; keine Sonderoptimierung dafür vorgenommen.
- Von einem validen lokalen Schritt-5-Prüfstand aus Welle 1 tatsächlich gestartet, ersten Abschuss abgewartet, Turm für 60 Gold aufgewertet und Schritt 7 erreicht. Tutorialkarte liegt über Landschaft, Spawn und Turm bleiben im bisherigen Maßstab sichtbar.
- Übersicht und Zoom bedient, Reload erhält Schritt 7, Turmlevel 2, 85 Gold und 20 Kernleben. Keine Browserfehler oder Warnungen protokolliert.
- Kameraschwenken/Begrenzung durch bestehende Scene-Tests geprüft; kein neuer vollständiger manueller Durchlauf aller 14 Schritte behauptet. Die lokalen Tutorial-Galeriehelfer bleiben außerhalb dieses Fix-Commits.

## Bildvergleich

Der Vorher-Screenshot stammt aus der unmittelbar vorausgehenden Sichtprüfung desselben Main-Ausgangsstands, Schritt 7. Der Nachher-Screenshot zeigt denselben Schritt nach tatsächlich durchgeführtem Wellenstart/Upgrade.

| Vorher · 390×844 | Nachher · 390×844 |
| --- | --- |
| ![Dunkle Streifen](before-390.png) | ![Durchgehende Waldlandschaft](after-390.png) |

[360×800](after-360.png) · [Desktop](after-desktop.png) · [Übersicht](overview-desktop.png) · [Reload](reload-390.png)

## Veröffentlichung und Kongregate-Export

- Fix-Commit `b179d0fae364372471ba0d7da52615510aa8f487` auf Main gepusht. [Pages 41209098059](https://github.com/emfau88/TD/actions/runs/41209098059) erfolgreich. Bestehende separate Turm-Testseite über [Preview-Lauf 41209588356](https://github.com/emfau88/TD/actions/runs/41209588356) wieder mit erhaltenem Main-Artefakt veröffentlicht.
- Nutzer hat anschließend einen neuen Kongregate-Build ausdrücklich beauftragt. TypeScript und eigenständiger Produktionsbuild bestanden; bekannte Chunk-Größenwarnung, kein Buildfehler.
- Lieferordner: `C:/Users/madde/Documents/Towers-and-Tantrums-Kongregate-2026-10-31-b179d0f`. Für getrennten Upload: `01-game/separate-upload/index.html` und `01-game/separate-upload/additional-files.zip`. Alternative vollständige ZIP: `01-game/Towers-and-Tantrums.zip`.
- 381 Dateien, 85.915.689 Byte entpackt. Vollständiges ZIP 77.953.056 Byte, SHA-256 `8827cceb331879e240be51725bf3097df146b6899a962adfb741ba17588c9d40`; Zusatz-ZIP 77.982.576 Byte, SHA-256 `b95170157d6e5a0af9cc35c8ec0e171a30d0f5c31bdaa5f8f8db47d1dc061016`. Beide Varianten CRC-geprüft und alle Inhalte bytegleich verglichen. Vollarchiv außerdem gegen alle ursprünglichen Build-Dateien geprüft; nach Entpacken alle 381 Manifest-Hashes erneut bestätigt. Keine Galerie-/Test-HTML-Dateien im Export, Einstiegspfade relativ.
- Die Paketierung wurde zwischenzeitlich durch ein volles Laufwerk C: unterbrochen. Nur unvollständige neue Archive und neu erzeugte, reproduzierbare Build-Ausgaben wurden entfernt. Nach Wiederaufnahme sind beide endgültigen Archive vollständig geprüft. Der Nutzer hat anschließend ausreichend Speicher freigegeben; der vorherige Export-Browserblocker ist damit behoben.
- Tatsächlicher Browsercheck der entpackten Fassung unter `/games/towers/`, eingebettet von `127.0.0.1` in ein `localhost`-iframe: 1000×650 und 390×844. Englischer Frischstart, Tutorialbuttons 1→2→3→4, Turmauswahl und Platzierungsanzeige, Reload erhält Schritt 2/75 Gold/20 Kernleben. Keine Browserfehler/-warnungen; die ersten 197 protokollierten HTTP-Anfragen ohne Fehlerstatus. Keine Speichersperre nach Freigabe des Datenträgers.
- Grenze der Exportprobe: Der Canvas-Bauklick wurde im iframe wegen nicht sicher auflösbarer Koordinaten abgelehnt; beim direkten Spielaufruf lief die Browser-Fokussteuerung in einen Timeout. Daher kein neuer vollständiger Kampf-/14-Schritte-Durchlauf des ZIP behauptet. Tatsächlicher Wellenstart/Upgrade und Kampf-Reload des identischen Spielcodes wurden oben lokal geprüft. Reale Kongregate-Preview und Plattformabnahme bleiben außerhalb dieses lokalen Checks.

[Export Desktop nach Reload](export-desktop.png) · [Export Smartphone](export-390.png) · [Export Bauempfehlung](export-placement-390.png). Zusätzliche Prüfdateien und die entpackte Fassung liegen lokal unter `04-browser-check/`; die Upload-Dateien bleiben unverändert. Keine Kongregate-Einreichung.

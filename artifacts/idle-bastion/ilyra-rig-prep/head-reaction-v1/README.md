# Ilyra – Kopfreaktion und Armvergleich

Separates Experiment vom 23.10.2026. Hauptspiel und freigegebene Basis-Idle unverändert; kein Commit oder Push. Visuelle Freigabe offen. Nutzer empfindet die Arme weiterhin als lang; Proportionen deshalb noch nicht als endgültig abgenommen behandeln.

## Ergebnis

`preview/index.html` zeigt eine 2,8-sekündige Kopfreaktion mit folgendem Oberkörper, vorhandenem Blinzeln, verzögerten Haaren und dezenter Brustfeder. Danach läuft die sechssekündige Idle. Auswahl zwischen ursprünglicher Armlänge und korrigierter Variante, Standvergleich, Einzelbildregler und Zoom. URL bei lokalem Server auf Port 5221: `/head-reaction-v1/preview/index.html`. Die ältere Spielseite `idle-review.html` enthält diese Änderungen nicht.

Oberarmknochen sind entlang ihrer Längsachse auf 0,90 skaliert; die Unterarme erben die Kürzung. Handknochen kompensieren die Skalierung. Gemessene linke Ober-/Unterarmlängen: 241,23/211,24 → 217,11/190,55 Bildpixel. Handgelenke liegen 44,25 Pixel höher. Die Handlänge bleibt annähernd erhalten (137,00 → 137,61 Pixel). Diese Werte dokumentieren den Eingriff, sie sind kein Nachweis perfekter menschlicher Anatomie. Hände/Handschuhe und stilisierte Körperproportionen beeinflussen den Eindruck weiterhin. Die frühere Fünf-Prozent-Probe bleibt unter `preview/shorter-arms/` erhalten.

## Editierbare Quellen

Eigenständiges Unity-Projekt `unity/`, 28 Knochen und vorhandene Grafikquellen. `Assets/Editor/BuildIlyraHead.cs` erstellt Clips und Controller; `BuildIlyraBalancedArms.cs` erstellt die korrigierte Variante. Szene `Assets/IlyraHeadBalancedArms.unity`, Prefab `Assets/IlyraBalancedArms.prefab`. Ungekürzte Szene `Assets/IlyraHeadReaction.unity`. Transparente Unity-Einzelbilder unter `preview/frames/` und `preview/balanced-arms/frames/`, korrigierte Idle unter `preview/balanced-arms/idle/frames/`.

Animator-Trigger `HeadReaction` startet am Idle-Ende und kehrt zur Idle zurück. Die Vorschau startet auf Knopfdruck in der gemeinsamen Ruhepose. Beliebige Übergänge mitten aus einer laufenden Pose sind noch nicht implementiert. Neue Gesichtszeichnungen wurden nicht erstellt.

## Prüfung und Grenzen

`preview/checks.json`: ursprüngliche Reaktion 85 Zustände, korrigierte Reaktion 86 Zustände, korrigierte Idle 182 Zustände; insgesamt keine invertierten Mesh-Dreiecke. Loop-Endpunkte jedes Clips exakt gleich. Sichtbares RGBA der verlustfreien WebP-Atlanten mit PNG-Quellen verglichen. Freigegebene Idle anhand `baseline-hashes.json` unverändert.

Reaktion → korrigierte Idle ist wegen Unity-Fließkommarundung nicht pixelidentisch: maximal 0,000367 Pixel Gelenkabweichung, Alphaabweichung 1/255, zusammengesetzte Farbabweichung unter 3/255 an 195 Randpixeln. Keine nachträgliche Bildkorrektur. Brustfeder maximal zusätzlich 0,49/0,21 Pixel; Hauptbewegung kommt aus dem Oberkörper.

Desktop und Hochkant (390 × 844), Variantenwechsel, Armvergleich, Abspielen und Rückkehr zur Idle geprüft; Browserkonsole ohne Fehler/Warnungen. Zwischenposen und Gelenkdetails visuell kontrolliert. Nachweise: `preview/browser-comparison.png`, `preview/browser-mobile.png`, `preview/poses.jpg`, `preview/joint-details.jpg`. Unity-Exportprozesse endeten mit Code 0; Editorlogs enthalten jedoch bekannte Search-/Paket-Testdateifehler und sind nicht vollständig fehlerfrei.

Alle drei Atlasgruppen zusammen etwa 134,8 MiB: hochauflösende Vergleichsexporte, noch kein Produktionsbudget. Browser lädt bedarfsweise, nicht sämtliche Atlanten beim Start. `pack.py --verify-existing` prüft die vorhandene Packung. `preview/Ilyra-Kopfreaktion.gif` ist eine verkleinerte Präsentationskopie; originale Transparenz und Bildqualität liegen in PNG/WebP vor.

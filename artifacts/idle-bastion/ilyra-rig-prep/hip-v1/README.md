# Ilyra – Hände an die Hüfte, drei Bewegungsproben

23.10.2026. Beauftragt nach der zweiten Idle, erweitert um die Gegenseite und beide Hände. Separate Probe, keine Spielintegration, kein Commit/Push. Visuelle Abnahme offen.

## Ergebnis und Grenzen

Drei fünfsekündige Bewegungen: Hand links im Bild, Hand rechts im Bild, beide Hände. Einseitige Varianten haben eine kleine Gewichtsverlagerung und Kopfneigung; die beidseitige ist mittiger und die Arme setzen leicht versetzt ein. Alle kehren zur gleichen Ruhepose zurück. Bestehende Armproportionen und Zeichnungen bleiben die Grundlage.

Die neue weiße Handschuhzeichnung ist ein gezieltes Imagegen-Ergebnis; die Gegenseite verwendet eine Spiegelung. Vollständiger Prompt und Werkzeugangabe in `HAND_PROMPT.txt`, unveränderte Quelle `hand-source.png`. Im Rig bleibt die ursprüngliche Ruhehand erhalten. Bei 0,8 Sekunden wird auf die Kontaktzeichnung gewechselt, bei 3,7 Sekunden zurück. Kein Alpha-Überblenden. Handfläche und Handgelenk wurden im Figurenmaßstab mit der anderen Hand verglichen; der sichtbare Handwechsel kann noch auffallen. Dies ist kein vollständiges Fingerrig und keine stufenlose Handdrehung.

Die Haltung ist **eine locker anliegende Hand an der Hüfte**, noch kein überzeugendes kräftiges Abstützen mit um die Hüfte greifenden Fingern. Die neue Zeichnung bleibt dafür zu flach. Deshalb diese Fassung als Bewegungs-/Anschlussprobe zur Abnahme zeigen, nicht als vollständig gelöstes anatomisches Greifen bezeichnen. Keine zusätzliche Handgrafikserie auf Vorrat.

## Handanschluss und Mesh

Die neuen Handrenderer hängen an `HandImageLeft` bzw. `HandImageRight` (Knochen 6/9). Ihr Ansatz liegt unter dem goldenen Manschettenende, Finger und Handfläche vor den Rockbahnen. Sortierung: Rockbahnen 5/6, zentrale Stoffbahn 7, zusätzliche Hände 7 (danach gezeichnet), Torso/Arme/Manschetten 8. Die unbenutzte Handgelenkverlängerung wird durch Sprite-Geometrie begrenzt; das PNG bleibt unverändert. In der Kontaktphase blendet eine separate Torso-Meshvariante die ursprüngliche Hand aus, ohne Doppelkontur.

Die größere Armbeugung deckte zwei Ursachen auf: zusammenhängende Dreiecke über der Arm-/Rumpfgrenze zogen Gürtel und Brustkleidung mit; Manschettenvertexgewichte gingen vor dem tatsächlichen Handgelenk zu stark auf den Handknochen über. Eigene Torso-Spritekopien behalten die Bitmap unverändert, teilen die Geometrie an den Armkonturen, behalten gemeinsame Gewichtung am Schulteransatz und ordnen die Manschette bis zum Gelenk dem Unterarm zu. Vertex-Deduplizierung hält die Geometrie kompakt. Die bestehenden Torso-Sprites, Szenen und Clips wurden nicht ersetzt.

Die 240-Hz-Brustfeder bleibt beschleunigungsabhängig. Zusätzlicher Federweg hier nur rund 0,05–0,07 Pixel; sichtbare Mitbewegung kommt hauptsächlich aus dem Brustkorb. Kein künstlicher Wackelimpuls. Minimum-Dreiecksflächen sind rechts/bei beiden sehr klein; die Prüfergebnisse gelten für diese Clips und sind keine Garantie für beliebig größere Armwinkel.

## Quellen und Wiedergabe

- Eigenes Unity-Projekt: `unity/`, Unity 6000.4.0f1.
- Szenen/Prefabs `Assets/IlyraHipLeft`, `IlyraHipRight`, `IlyraHipBoth`.
- Körper- und Federclips sowie Controller unter `Assets/Clips/IlyraHip*`; Trigger `Hip`.
- Builder `Assets/Editor/BuildIlyraHip.cs`, Mesh-/Handvorbereitung `IlyraHipHands.cs`.
- Reproduzierbarer Export mit `-batchmode -projectPath <hip-v1/unity> -executeMethod BuildIlyraHip.Run -hip-side left|right|both|idle -spire-export -logFile <absoluter Logpfad>`.
- PNG-Sequenzen unter `preview/{left,right,both,idle}/frames/`, verlustfreie WebP-Atlanten unter `preview/`.
- Packung: `python pack.py`; tatsächliches HTML-Abspielskript prüfen: `node verify-preview.mjs`.
- Browser: http://127.0.0.1:5221/hip-v1/preview/index.html
- Gemeinsames GIF `preview/Ilyra-Huefte-Vergleich.gif`, Einzel-GIFs `Ilyra-Huefte-left.gif`, `-right.gif`, `-both.gif`.

Frühe Kontaktstudien bleiben im bisherigen Projekt `../head-reaction-v1/unity/` erhalten. Maßgeblich für dieses Ergebnis ist ausschließlich `hip-v1/unity/`. Der Wechsel zur eigenen Projektkopie war nötig, weil eine lokale Bee-Builddatei gesperrt blieb. Beim versuchten Cache-Umbenennen verschobene Cachedateien wurden zurückkopiert; alle zuvor erfassten Assets und Vorschauen sind per SHA-256 unverändert. Frühere gescheiterte Studien sind keine gültigen finalen Testergebnisse.

Die neue Idle nutzt dieselben Meshgewichte für eine passende Rückkehr. Die Prüfseite startet eine ausgewählte Geste aus der Ruhepose und spielt danach Idle. Ein manueller Start mitten in einer Idle springt zum gemeinsamen Start; freie Übergänge aus beliebigen Zwischenposen bleiben Integrationsarbeit. Bedarfsladen mit maximal vier Atlas-Einträgen im Cache, zunächst drei Atlanten angefordert, keine vollständige Vorladung. Die ungekürzten hochauflösenden Prüfexporte sind noch kein Produktionsbudget.

## Prüfung

- left: 152 exportierte Zustände, 1,468,075 Dreiecksprüfungen, keine Faltungen, Start/Ende pixelidentisch und sichtbares RGBA der Atlanten verlustfrei.
- right: 152 exportierte Zustände, 1,467,118 Dreiecksprüfungen, keine Faltungen, Start/Ende pixelidentisch und sichtbares RGBA der Atlanten verlustfrei.
- both: 152 exportierte Zustände, 1,450,153 Dreiecksprüfungen, keine Faltungen, Start/Ende pixelidentisch und sichtbares RGBA der Atlanten verlustfrei.
- idle: 182 exportierte Zustände, 1,778,140 Dreiecksprüfungen, keine Faltungen, Start/Ende pixelidentisch und sichtbares RGBA der Atlanten verlustfrei.

Rückkehr zur passenden Idle: maximal 1/255 Alpha- und 2,27/255 zusammengesetzte Farbabweichung durch numerische Unity-Rundung. Atlanten insgesamt 349,090,678 Byte. Vorherige erfasste Dateien unverändert. Vier finale Unity-Läufe Exit 0; bekannte Editor-/Package-Meldungen bleiben in den Logs sichtbar. Detailnachweise: `preview/checks.json`, `*/validation.json`, `*/spring-validation.json`.

Tatsächliches Abspielskript in Node mit virtueller Uhr geprüft: alle drei Gesten enden nach fünf Sekunden in Idle, Einzelbildregler/Ruhepose und begrenzter Cache funktionieren. Dies allein ersetzt keinen Browsertest. Nach Neustart des lokalen Servers HTML und Manifest HTTP 200; anschließend Browseransicht erfolgreich geöffnet, Poseauswahl/Regler und 390×844 geprüft, keine Browserfehler gemeldet. Desktop- und Hochkantaufnahmen unter `preview/browser-desktop.png` und `browser-portrait.png`. Kontakt-, Zwischen- und Handwechselbilder zusätzlich direkt aus Unity geprüft. `git diff --check` bestanden. Visuelle Nutzerfreigabe weiterhin offen.

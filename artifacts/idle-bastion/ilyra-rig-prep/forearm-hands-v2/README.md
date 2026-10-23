# Ilyra – gezielte Unterarm- und Handkorrektur

Separates Experiment vom 23.10.2026 auf ausdrücklichen Nutzerauftrag. Ausgangspunkt ist die bereits um etwa zehn Prozent verkürzte Variante `head-reaction-v1/preview/balanced-arms/`, nicht die ursprüngliche Figur mit langen Armen. Vorherige Dateien bleiben erhalten. Kein Commit, Push oder Eingriff ins Hauptspiel. Proportionen anschließend vom Nutzer mit „So ist es gut“ visuell freigegeben.

## Anpassung

Oberarmknochen und Ellenbogenanker unverändert. Die Unterarmknochen erhalten zusätzlich 0,92 Längsskalierung bei gleicher Breite. Hände erhalten gegenüber dem letzten Stand etwa 0,90 Länge und 0,95 Breite; die geerbte Unterarmskalierung wird am Handknochen kompensiert. Kontinuierliche Mesh-Gewichte verbinden Ellenbogen, Handschuh und Handgelenk. Keine zerschnittenen Bildteile, keine neue Grafik, keine Veränderung von Kopf, Oberkörper oder Animationskurven. Nichtuniforme Skalierung und leicht unterschiedliche Knochenachsen bedeuten kleine Abweichungen der tatsächlichen Maße von den nominalen Faktoren; gemessene Werte stehen in `preview/checks.json`.

Zusätzliche editierbare Szene und Prefab im bestehenden Experimentprojekt:

- `../head-reaction-v1/unity/Assets/IlyraForearmsHands.unity`
- `../head-reaction-v1/unity/Assets/IlyraForearmsHands.prefab`
- Reproduzierbarer Aufbau: `../head-reaction-v1/unity/Assets/Editor/BuildIlyraForearmsHands.cs`, Methoden `Run` und `ExportIdle`.

Die vorherigen Szenen/Prefabs und die freigegebene Idle werden nicht überschrieben. Die neue Variante benutzt dieselben Clips und dieselbe Kamera. Deshalb können die Posen synchron verglichen werden.

## Vorschau und Export

`http://127.0.0.1:5221/forearm-hands-v2/preview/index.html`: links die vorige Zehn-Prozent-Fassung, rechts die neue Anpassung. Kopfreaktion und Idle separat auswählbar; gemeinsames Abspielen, Pause, Einzelbilder und Armvergrößerung. Die neue Seite ersetzt die alten Vorschauen nicht.

Transparente PNGs unter `preview/head/frames/` und `preview/idle/frames/`. Verlustfreie WebP-Atlanten werden durch `pack.py` erstellt und gegen sichtbares RGBA der PNG-Quellen geprüft. Die vorherigen Atlanten werden per relativer URL wiederverwendet, nicht dupliziert. Nur aktuelle und nächste Atlasbilder werden geladen. GIF und JPEG dienen als verkleinerte Vergleichskopien, nicht als Spielquellen.

## Prüfungen

Unity exportiert Kopfreaktion und Idle mit Prüfung aller Zwischenzustände auf invertierte Dreiecke. `preview/checks.json` dokumentiert Mesh-Prüfung, Loop-Endpunkte, Gelenkmaße, Rundungsabweichung beim Übergang und Hashvergleich der bisherigen Quellen/Vorschau. `baseline-hashes.json` wurde vor der Änderung angelegt; hinzugefügte Dateien sind dabei erlaubt, Änderungen an den erfassten Dateien nicht.

Ergebnis: 86 Kopfreaktions- und 182 Idle-Zustände ohne Faltungen, alle Loop-Endpunkte exakt, beide Atlasgruppen verlustfrei. Ellenbogenposition exakt erhalten. Linker Unterarm 190,55 → 175,30 Pixel, Handknochen 137,61 → 123,90 Pixel; Handgelenk 15,24 Pixel höher. Alle zuvor erfassten Dateien unverändert. Beim Reaktion-/Idle-Ruheübergang wie zuvor minimale Unity-Rundungsabweichungen: Alpha maximal 1/255, zusammengesetzte Farbe maximal 2,27/255. Beide Unity-Prozesse Exit 0.

Browserprüfung: synchrones Abspielen, Idle-Auswahl, Einzelbild bei 1,00 s, Zoom und 390×844-Hochkant; keine Konsolenfehler nach vollständiger Packung. Mobile Beschriftungshöhen angeglichen, damit Figuren auf gleicher Höhe verglichen werden. Screenshots `preview/browser-comparison.png`, `preview/browser-detail.png`, `preview/browser-mobile.png`; Zwischenbilder im Gelenkbereich zusätzlich in `preview/joint-details.jpg`. `git diff --check` bestanden.

Die Anatomie bleibt eine stilisierte 2D-Darstellung und bedarf der visuellen Nutzerabnahme. Bestehende Grenzen des Rigs und der Kopfreaktion gelten weiter: keine beliebigen perspektivischen Drehungen, kein fertig integrierter Übergang aus jeder beliebigen Idle-Phase. Die hochauflösenden Prüfatlanten sind noch keine für das Hauptspiel fertig budgetierten Laufzeitassets.

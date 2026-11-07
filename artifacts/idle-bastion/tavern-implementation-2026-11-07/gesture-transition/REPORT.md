# Dunkles Cliprechteck bei Komplimenten behoben

Der native Player verdunkelte beim Wechsel nach oder von `hip` (Kompliment) die gesamte 480×700-Clipfläche für bis zu 240 ms. Die seitlichen Hintergrundflächen blieben sichtbar. Das erzeugte das vom Nutzer beschriebene dunkle Rechteck, auch beim direkt anschließenden Lachen. Mara und Ilyra waren betroffen; Lachen direkt aus Idle und Berührungen zeigten den Fehler nicht.

Die Sonderbehandlung ist entfernt. Jetzt verwenden auch diese Wechsel die vorhandene 120-ms-Bildüberblendung. Originalclips, Bildausschnitt, Cache, Lade-/Fehlerbehandlung und Reaktionsstimmen bleiben erhalten. Reduzierte Bewegung überspringt die Überblendung weiterhin.

## Prüfung

- `check-transition.mjs`: echte Videos und Canvas, zehn Übergänge bei beiden Figuren. Vorher bis 100 % fast uniforme dunkle Fläche bei vollständig geladenen, nicht suchenden Videos. Nachher 177 abgetastete Frames ohne dunkle Vollfläche oder transparenten Leerframe; höchstens 7,54 % natürliche dunkle Hintergrundpixel. Zwölf dekodierte Original-Startbilder separat sauber. Ergebnisse in `before/results.json` und `after/results.json`.
- `check-public-transitions.mjs`: echter Main über den Teststarter, beide Figuren auf 390×844 im Touchmodus. Sechs Fälle einschließlich Kompliment bis zur Rückkehr nach Idle und Unterbrechen durch Lachen, 823 lokal abgetastete Frames ohne dunkles Rechteck; Canvasgeometrie unverändert. Ergebnis in `main-local/results.json`.
- Dieselben sechs Fälle auf der tatsächlich veröffentlichten Version `46ee4286` erneut grün: 921 Frames, höchstens 7,47 % natürliche dunkle Hintergrundpixel, keine dunkle Vollfläche oder Leerframes. Ergebnis in `public/results.json`. Die öffentliche Prüfung wartet auch bei langsamem Download auf den tatsächlichen Reaktionsbeginn und erfasst dann den vollständigen Prüfzeitraum.
- Produktionsbuild mit beiden Tavernen-Vorschauflags bestanden: `../mobile-fix-build.log`. Die frühere vollständige Suite mit 531 Tests wurde für diesen begrenzten Darstellungsfix nicht erneut ausgeführt.

Browserprüfung mit Chrome und Softwaregrafik; sie ersetzt keine Sichtabnahme auf dem tatsächlichen Handy. Repräsentative Vorher-/Nachher-Spitzenbilder liegen bei. Es wurden keine Videos neu erzeugt.

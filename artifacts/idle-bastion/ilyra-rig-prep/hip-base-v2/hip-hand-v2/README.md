# Ilyra – größere Hand in der bestehenden Hüftanimation

Separate Korrektur ausschließlich der Hand an der Hüfte in `blink-v1`. Der Arm bleibt in seiner gezeichneten Hüftpose. Die Übergangsanimation zur Ruhehaltung wird weder verwendet noch geändert. Aufgabenstatus und visuelle Freigabe stehen ausschließlich in der zentralen Roadmap.

## Quelle und reproduzierbare Änderung

Eine gezielte Bearbeitung mit dem eingebauten Imagegen-Werkzeug liegt unter `source/hand-size-generated.png`; der vollständige Prompt steht in `source/PROMPT.txt`. Ziel war eine längere und etwas breitere Hand bei festem Handgelenkanschluss, gleicher Haltung und identischer Handschuhgestaltung. Original und generiertes Ergebnis haben 971 × 1619 Pixel; keine Bildskalierung oder Neuregistrierung der Figur.

`prepare.py` wählt ausschließlich die zusammenhängenden weißen Handflächen aus alter und neuer Zeichnung einschließlich ihrer Konturen aus. Nur innerhalb dieser eng begrenzten Auswahl werden die Pixel der gezielten Bearbeitung übernommen; Kopf, Körper, Arm und andere Hand bleiben aus der unveränderten Originalgrafik. Die weiße Handschuhfläche wächst in der Zeichnung von 10.943 auf 13.226 Pixel (rund 21 % Fläche; keine Behauptung von 21 % Längenzuwachs). Alle geänderten Quellpixel liegen innerhalb x232–423, y927–1070. `selection-mask.png`, `hand-detail.png` und `source-checks.json` dokumentieren Auswahl und Größenvergleich.

Die Unity-Szene unter `../../hip-v1/unity/Assets/HipHandSizeV2/` verwendet eine Kopie der ursprünglichen Sprite-Geometrie und Bone Weights mit der lokal korrigierten Textur. Alle Knochen und der Original-Animationsclip samt Blinzeln bleiben unverändert. Der Handknochen wird nicht skaliert, weil dessen alte Gewichte auch Gürtelpixel beeinflussen. Der Texturwechsel vermeidet diese Nebenwirkung. Aufbau und Export erfolgen mit `BuildIlyraHipHandSize.Run` in der vorhandenen Unity-Version 6000.4.0f1 und `-spire-export`.

`pack.py` vergleicht exportierte PNGs und Gelenkzustände mit `blink-v1` und packt verlustfreie Atlanten. `preview/index.html` zeigt den synchronen Vergleich bei 30 fps mit Pause, Zeitregler und Handvergrößerung. Nutzer ist inzwischen am PC und verzichtet auf die ursprünglich angefragte GIF-Ausgabe; die Browseransicht ist das Abnahmeformat. Transparente PNGs und WebP-Atlanten bleiben verlustfrei.

`preserved-hashes.json` enthält die vorher erfassten Prüfsummen der alten Grafik, Szene, Animation und GIFs einschließlich des zurückgestellten Armübergangs. Die früheren Dateien bleiben erhalten. Keine Spielintegration und kein Commit/Push.

## Prüfergebnis

`preview/checks.json`: 182 exportierte Zustände, 2.264.808 Dreiecksprüfungen ohne Faltungen, kleinste relative Dreiecksfläche 0,70466. Die Gelenkzustände stimmen exakt mit der bisherigen Hüftanimation überein. Sämtliche Pixeländerungen der 181 regulären Vergleichsbilder liegen innerhalb x171–347, y733–849 im 768 × 1280 großen Export; außerhalb dieses Handbereichs sind die Bilder pixelidentisch. Frame 0 und 180 stimmen exakt überein. Alle 23 WebP-Atlanten wurden verlustfrei gegen die PNGs verglichen. Acht gespeicherte Original-Prüfsummen nach dem Export unverändert.

Native PNGs bei 0, 2,33 und 4,5 Sekunden auf Kontur, Manschette und Gürtelüberdeckung geprüft. Browservergleich mit Pause, Einzelbildregler, Handvergrößerung und synchroner Wiedergabe geprüft; keine Browserwarnungen oder Fehler. Belege: `preview/browser-comparison.png` und `preview/browser-hand-detail.png`. Der bekannte Unity-SearchDatabase-Indexfehler wurde erneut geloggt; der separate Export endete erfolgreich mit 182 Bildern und ohne Mesh-Faltungen. Visuelle Nutzerabnahme bleibt erforderlich.

[Vorher/Nachher im lokalen Browser](http://127.0.0.1:5221/hip-base-v2/hip-hand-v2/preview/index.html)

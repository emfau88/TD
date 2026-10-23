# Ursachenbefund Versuch 1

Die beobachteten Risse sind reale transparente Lücken zwischen ausgeschnittenen Grafikebenen. Sie sind bereits in den Unity-PNGs vorhanden, vor WebP und Browserdarstellung. Am stärksten treten sie entlang der vorher gewählten diagonalen Schnittgrenzen an Ärmeln, Haaren, Schulter und Tasche auf.

Konkreter Fehler in `prepare-layers.py`: Die Unterlappung wurde nur dort erzeugt, wo `source[:,:,3] == 255`. Die Innenflächen des Ausgangsbilds haben jedoch überwiegend Alpha 253. Beispielsweise besitzt die Torso-Ebene 19.384 Pixel mit Alpha 253, aber nur 16 mit Alpha 255. Damit blieb die vermeintlich vorhandene Überlappung praktisch aus. Unterschiedlich gebundene Ebenen öffnen bei Bewegung diese Grenzen.

Scan aller 193 Originalbilder mit Referenz-Innenmaske (Alpha >240, um vier Ausgabepixel erodiert) findet bis zu 617 Pixel mit Alpha <128. Der Befund ist in `actual-gaps.png` magenta markiert. Eine erste Messung mit Alpha ==255 war ungeeignet; diese wurde ausdrücklich korrigiert.

Kontrollversuch in einer Kopie: identische Szene, Knochen, Meshes, Gewichte, Clip, Filter und Export. Ausschließlich die Überlappung auf Alpha >240 und vier Quellpixel geändert. In den vollständig aktualisierten Posen bei 0, 1 und 2 Sekunden sinkt die Zahl der inneren Lücken auf 0. Das ist Ursachenisolierung, keine Übernahme dieser alten Grafik als neue Vorlage.

Weitere Beobachtungen: Ein einzelnes `yield return null` genügt im verwendeten Exportpfad nicht zuverlässig für vollständig aktualisierte SpriteSkins. Schnell nacheinander getrennt gerenderte Posen zeigten zunächst den vorherigen Deformationsstand. Der Diagnoseexport wartet daher mehrere Updates. Rückschreiben nach Alpha-Entkopplung war im A/B-Test nicht ursächlich: rohe Renderwerte identisch mit/ohne diesen Schritt. Die Behauptung eines grundsätzlichen Triangulierungsfehlers ist durch die Beobachtungen nicht gestützt.

Folgerungen für Versuch 2: vollständige verdeckte Bauteile; bewusst großzügige anatomische Überlappungen; klare Gelenkzuständigkeiten; Innenalpha technisch normalisieren; unveränderte gemeinsame Gesichtsbasis; Posen erst nach abgeschlossener Deformation exportieren und alle Zwischenbilder prüfen. Der Kontrollversuch beweist nur die Ursache der Risse, nicht die Qualität des späteren neuen Rigs.

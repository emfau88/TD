# Ilyra – Mini-Hüpfer V2

Separate Nachbesserung auf Nutzerwunsch: Die Brustfeder in V1 war vorhanden, in Vorschaugröße aber zu schwach. Körperclip und sämtliche 26 übrigen Gelenke bleiben über alle 98 Prüfzustände exakt gleich. Alte Quellen/Exporte bleiben erhalten; baseline-hashes.json und pack.py prüfen den Bestand.

Nur die vorhandene beschleunigungsabhängige Brustfeder geändert: Frequenz weiter 2,25 Hz; Dämpfung 0,38 → 0,25, Trägheit 0,85 → 1,9, Sicherheitsgrenze 8 → 22 px. Maximaler Federausschlag nun 16,66/16,59 statt 5,97/6,09 px. Kein Anschlag erreicht. Das ist der Ausschlag der Hilfsknochen; sichtbare Haut/Kleidung folgen anteilig gemäß bestehenden Gewichten. Restbewegung vor der Abschlusskorrektur unter 0,01 px. Keine neue Armbeugung oder Änderung am Hüpfer.

Quelle: ../hip-v1/unity/Assets/Editor/BuildIlyraMiniHopV2.cs. Eigene Szene/Prefab IlyraMiniHopV2, eigene Clips/Controller unter Assets/Clips. Export: transparente PNGs in preview/frames, 30 fps, 96 abgespielte Frames/3,2 s; 98 exportierte Prüfzustände. Verlustfreie WebP-Atlanten; GIF allein und synchroner GIF-Vergleich. preview/comparison.html zeigt V1/V2 nebeneinander, index.html den Einzelclip mit Idle-Rückkehr. Vergleich benötigt ../mini-hop-v1, Einzelvorschau referenziert die bestehende Idle aus ../hip-v1.

Prüfung: 957.460 Dreiecksprüfungen ohne Faltungen, kleinster Flächenquotient 0,66895. Start-/Endbild pixelidentisch; Anschluss an Idle maximal 1/255 Alpha bzw. 2,263/255 Composite. Sichtbarer RGBA-Roundtrip verlustfrei, alte Quelldateien per Hash unverändert. Zwischenbilder um Absprung/Landung/Nachschwingen visuell kontrolliert. Desktop-/Hochkant-Vergleich, synchroner Zeitregler, Pause und Neustart geprüft. Beim Ersttest negative Startzeit im Vergleich erkannt und auf null begrenzt; keine fehlerhafte Atlasadresse mehr nach Korrektur. Screenshots und Messwerte in preview/.

Grenzen: lokales Experiment, ca. 45,4 MB neue Atlanten; noch keine Auslieferungsoptimierung. Ausschnitt endet an den Oberschenkeln, keine Knie-/Fußanimation. Stärkere Nachbewegung zur visuellen Nutzerabnahme. Hauptspiel unverändert, kein Commit/Push.

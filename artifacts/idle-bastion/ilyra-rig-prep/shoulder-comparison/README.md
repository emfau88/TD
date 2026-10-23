# Kleine Schulter-/Oberarmkorrektur

Auf Nutzerfreigabe vom 23.10.2026 nur Schultern etwas schmaler, Oberarme geringfügig schlanker und Muskelschattierung weicher. Bisherige Quellen, PSB, Rig und Vorschau unverändert erhalten.

`torso-source.png` ist die gezielte lokale Imagegen-Bearbeitung des bisherigen Torsoassets; vollständiger Prompt in `PROMPT.txt`. `assemble.py` übernimmt nur die beiden Schulter-/Oberarmbereiche aus dieser Zeichnung. Der restliche Torso wird aus der bisherigen Quelle beibehalten. Die Auswahlgrenze verläuft innerhalb der statischen Haut-/Armfläche und wird weich angeschlossen; keine Animation, kein Verformen der alten Silhouette und kein Kaschieren gerenderter Risse. Die neue Anatomie wurde von Imagegen gezeichnet.

`torso-selected.png` ist die daraus zusammengesetzte Quelle, `layers/` enthält die 13 registrierten Ebenen, `Ilyra.psb` die mehrschichtige neue Grafik. Exakt gleiche Registrierung wie zuvor. `before.png`, `after.png` und `comparison.png` zeigen den Vergleich. Öffnen über `http://127.0.0.1:5221/shoulder-comparison/index.html`.

Prüfung: Originaldateien per SHA-256 unverändert; zwölf andere Ebenen exakt unverändert; die unveränderten Bereiche der Torsoquelle pixelidentisch. Änderungen der montierten Figur liegen ausschließlich innerhalb x=98–659 / y=491–805 (768 × 1280). Ruhefigur und vergrößerter Schultervergleich visuell kontrolliert. `checks.json` enthält die tatsächlichen Ergebnisse und Hashes.

Dies ist zunächst der Grafikvergleich. Das bestehende Unity-Rig und dessen früherer Gelenktest wurden nicht verändert oder als Prüfung dieser neuen Grafik ausgegeben. Noch keine visuelle Nutzerfreigabe der Korrektur ableiten; Auftragsstatus ausschließlich in der Spiel-Roadmap.


## Übernahme in ein separates Rig · 23.10.2026

Die Nutzerantwort „Ok“ nach der Bewertung autorisiert die vorgeschlagene Übernahme samt gleicher Gelenkprobe. `unity/` enthält die unabhängige Projektkopie inklusive riggbarer PSB-Metadaten, Szene und Prefab. Nur die geänderte Grafik wurde ersetzt; Knochen, Gewichtsfunktion und Testcode sind identisch. Originalprojekt und alte Vorschau wurden vorab gehasht und anschließend unverändert bestätigt (97 Dateien).

`preview/index.html` zeigt beide Varianten synchron, mit Schulterzoom, Pausieren/Positionsregler, Einzelansicht und GIF-Download. Lokal: http://127.0.0.1:5221/shoulder-comparison/preview/index.html . PNGs unter `preview/joint-test/`; `preview/Ilyra-Schultervergleich.gif` ist der kompakte Versandvergleich. Das ursprüngliche ZIP enthält weiterhin den alten Stand.

Prüfung: 25 Zustände, 186.350 Dreiecksprüfungen, 0 Faltungen; kleinstes Flächenverhältnis 0,560558 am Umhang. Weniger Dreiecke als zuvor durch die schmalere sichtbare Silhouette und das Entfernen leerer Meshzellen beim Import. Identische Joint-Positionen, identische Ruhe-Endpunkte; Alpha im Unity-Ruhebild exakt wie die Montage, mittlere RGB-Abweichung 0,06681/255 durch Render-/Alpha-Rundung. Nachweise: `preview/validation.json`, `preview/rig-checks.json`, `preview/shoulder-extremes.jpg`.

Sichtprüfung an Posen 0/3/6/15/18, beide Schultern vergrößert: keine neu sichtbaren Risse oder abgesetzten Schulterkappen. Kurze Browserprobe mit Abspielen/Pause, Position 6 und Zoom, Desktop und 390×844; keine Warnungen/Fehler in der Browserkonsole. Keine Prüfung großer neuer Armgesten und keine Behauptung fertiger Idle oder Physik.

Unity beendete Import und Export erfolgreich mit Exit 0 (`ILYRA_RIG_READY`, `ILYRA_JOINT_TEST_DONE`). Im Log stehen beim Erstimport zwei DirectoryNotFoundException-Meldungen zu einer Collections-Test-DLL und die bereits bekannte ArgumentOutOfRangeException aus UnityEditor.Search. Sie verhinderten die Szene/Prefab-Erstellung, Skinning-Prüfung und den vollständigen Export nicht; das Editorlog ist daher nicht fehlerfrei. Keine neuen Kunstgenerierungen, keine Änderung am Hauptspiel oder Originalrig.

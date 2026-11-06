# Vorbereitung: tiefe Kopfstütze

Der vorbereitete Abschnitt verwendet die vorhandene dritte Zeichnung und deren eigenes Ellbogen-Rig. Kopf, Hand und stützender Unterarm werden gemeinsam um den Ellbogenkontakt geführt; die freie Hand gleitet entsprechend der kleinen Körperdrehung auf dem Tresen. Bestehende Zeichnungen, Posen-Rigs und V2 der ersten Reaktion werden nicht geändert.

Bearbeitbare Quellen im bestehenden Projekt `../rig-v1/unity/`:

- `Assets/Editor/BuildCounterSupport.cs`
- `Assets/CounterSupportMotion.cs`
- `Assets/CounterSupportExport.cs`
- `Assets/Reactions/support-settle-v1/`: Szene, Prefab und `SupportSettle.anim`.

Erste native Probe: 145 Zustände über 4,8 Sekunden ohne Faltungen; maximale Kontaktabweichung 0,000602 Quellpixel. `audit.json` enthält Matrizen und Messwerte; `exports/` enthält vorerst neun ausgewählte Ansichtsbilder. Die Prüfung enthält noch keine vollständige GIF-/Browserauslieferung oder abschließende Formprüfung. Die technische Faltungsprüfung ist keine visuelle Abnahme.

Dieser Abschnitt beginnt und endet in der bereits abgestützten Pose. Er ist ausdrücklich **noch kein Übergang aus der normalen Grundpose**. Die Startpose wurde beim Nutzer erfragt; verbindlicher Arbeitsstand und weitere Freigaben ausschließlich in der zentralen Roadmap.

Reproduktion mit Unity 6000.4.0f1 im bestehenden Projekt: `-batchmode -executeMethod BuildCounterSupport.Run -counter-export -touch-probe -touch-rebuild`. Der Rebuild betrifft ausschließlich den neuen eigenen Ordner `Assets/Reactions/support-settle-v1`.

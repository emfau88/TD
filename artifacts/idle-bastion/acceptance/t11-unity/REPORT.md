# T11u · kleine Unity-Stoffprobe

21.10.2026 · Unity 6000.4.0f1 · getrennt vom HTML-Spiel.

Das vorhandene Mara-Ruhebild wurde unverändert in ein kleines Unity-Projekt übernommen. Ein SkinnedMeshRenderer mit festem Körperknochen und zwei Stoffknochen bewegt nur die freien Umhangränder. Keine neue Bildgenerierung für diese Probe. Unity rendert 96 Samples über vier Sekunden plus den identischen Endpunkt, transparent in 768 × 1024 bei 384 × 512 Anzeige. Der Renderer verwendet Punktfilter und kein Antialiasing.

Unity-Export beendet mit Code 0. Die Ruhepose ist RGBA-identisch zur zweifach per Nearest Neighbor vergrößerten Quelle; Anfang und Ende stimmen überein. Kopf/Haare/Brust/beide Hände/Zopf/Gürtel zeigen in den festgelegten Prüfrechtecken keine Pixeländerung. Verlustfreier WebP-Rückvergleich und vier Sekunden Gesamtdauer bestätigt. Details: [validation.json](validation.json).

Separate Browserseite `unity-review.html` bei laufendem lokalen Vite auf Port 5218: beide Bilder geladen, Desktop und schmale Ansicht ohne horizontalen Überlauf, Start/Stopp mit Rückkehr zur Ruhepose, halbes Tempo und Stoffvergrößerung geprüft. [Hochkantbild](mobile.png). Kein physischer Mobilgerätetest. Animiertes WebP nur als Review-Container; die Einzelbilder können später in SPIREs vorhandenen Atlas-Aufbau übernommen werden. Die Vorschau ist noch nicht auf Laufzeitgröße optimiert.

Die vom Nutzer ergänzte [Unity-Anleitung](https://learn.unity.com/article/how-to-animate-2d-characters) beschreibt denselben Grundmechanismus und einen umfangreicheren 2D-Skinning-/Ebenenworkflow. Diese Probe verwendet Unitys allgemeines Mesh-Skinning, noch keine getrennte vollständige Figur und keinen 2D-Skinning-Editor. Sie belegt Export und begrenzte Stoffbewegung, nicht die Qualität vollständiger Atmung/Kopfbewegung.

Nutzer hat anschließend ausdrücklich ein besser vorbereitetes Ausgangsbild und eine komplette Mara-Idle beauftragt. Status dieser Weiterarbeit ausschließlich in der Roadmap. Keine Spielintegration, kein eigener Commit/Push. Bestehende und fremde Änderungen erhalten.

# Kleine Mara-Probe in Unity

Separates Experiment vom 21.10.2026. Projekt für den installierten Editor **6000.4.0f1**.

Die feste Mara-Grafik liegt als unveränderte Kopie in `Assets/Mara.png`. Ein Unity-`SkinnedMeshRenderer` verbindet ein flaches Mesh mit drei Knochen: feste Figur und zwei bewegliche Umhangränder. Nur diese Stoffbereiche bewegen sich leicht. Kein neues Bild, keine Brust-/Gesichtsverformung und kein Blinzeln. Das ist ein begrenzter Methodentest, keine fertige Charakter-Idle.

## Ansehen und verändern

Dieses Verzeichnis über Unity Hub als vorhandenes Projekt öffnen, dann `Assets/MaraProbe.unity` öffnen und Play drücken. Am Objekt „Mara — small cloth rig“ lässt sich im `MaraClothProbe`-Component die Stärke einstellen. Die beiden Stoffknochen stehen in der Hierarchie. `SPIRE Probe → Rebuild scene and export 4-second loop` baut die Ausgangsprobe neu und exportiert sie; dabei werden manuelle Änderungen an der Probenszene ersetzt.

Die Probe nutzt Unitys grundlegendes Mesh-Skinning. Sie enthält noch kein im 2D-Skinning-Editor bearbeitetes Sprite-Rig und keine in Ebenen getrennte Figur. Für größere Körper- und Kopfbewegungen wäre eine saubere Aufteilung mit ergänzten verdeckten Bildteilen erforderlich. Die vom Nutzer verlinkte [Unity-Anleitung](https://learn.unity.com/article/how-to-animate-2d-characters) beschreibt diesen weiterführenden 2D-Workflow sowie Sprite Swap für Gesichtsausdrücke.

## Export in das vorhandene HTML-Spiel

`BuildProbe.Run` erzeugt in `Export/` transparente PNG-Bilder: 96 zeitliche Samples bei 24 Bildern/s, vier Sekunden, plus ein Endbild für die Nahtprüfung. Gerendert wird mit Punktfilter ohne Antialiasing bei 768 × 1024, angezeigt bei 384 × 512. Dadurch sind halbe Quellpixel als Bewegungsabstände möglich, ohne weichgezeichnete Texturen. Die Ruhepose entspricht der mit Nearest Neighbor verdoppelten Quelle pixelgenau.

`python pack-preview.py` prüft feste Bildbereiche und Loop-Naht und packt die PNGs verlustfrei für die separate Browser-Vorschau. Das animierte WebP ist hier nur eine einfache Review-Datei. Für SPIRE würden ausgewählte exportierte PNGs stattdessen in den vorhandenen Atlas-/Metadatenaufbau gepackt und von der bestehenden Tavernensteuerung bedarfsgesteuert geladen. Dafür ist weder ein Unity-WebGL-Build noch Unity beim Spieler notwendig.

Vorschau bei laufendem Projekt-Vite: [unity-review.html](http://127.0.0.1:5218/unity-review.html). Nachweis: [T11u-Bericht](../acceptance/t11-unity/REPORT.md). Status und offene visuelle Freigabe stehen ausschließlich in der [Roadmap](../../../experiments/idle-bastion/ROADMAP.md).

`Library`, `Temp`, `Logs`, `UserSettings` und die reproduzierbaren PNG-Rohframes in `Export` sind lokal ignoriert. Kein zusätzliches Plugin, kein Asset-Store-Paket und keine Bildgenerierung erforderlich.

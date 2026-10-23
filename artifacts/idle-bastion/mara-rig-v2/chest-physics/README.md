# Separate Federphysik-Probe

Neue Geste: Aufrichten, locker abfedern, zur Ruhe kommen (4,2 Sekunden). Die Vergleichsseite zeigt dieselbe Körper-/Gesichtsanimation links ohne und rechts mit sekundärer Brustbewegung. Die existierenden Vorschauen und Spielassets bleiben erhalten.

## Bearbeitbare Quellen

- Unity-Szene: `../unity/Assets/ChestPhysics/ChestPhysicsTuned.unity` (baked Exportvergleich).
- Wiederverwendbares Prefab: `../unity/Assets/ChestPhysics/MaraPhysicsTuned.prefab`. Enthält 24 Knochen, den kontinuierlichen Torso und `MaraChestSpring` mit aktivierter Live-Simulation. Der Animator spielt die neue Körpergeste ohne vorgebackene Federkurven; `LateUpdate` ergänzt die Physik.
- Solver: `../unity/Assets/MaraChestSpring.cs`. Getrennte Federzustände links/rechts, angetrieben durch die Beschleunigung ihrer Anker am Brustkorb. Parameter: Frequenz 2,15 Hz, Dämpfungsverhältnis 0,24, Trägheit 1,15; rechte Seite 3,5 % höhere Frequenz. Grenze 10 Quellpixel; die aktuelle Geste erreicht ca. 8 Pixel und trifft die Begrenzung nicht.
- Builder und Bake: `../unity/Assets/Editor/BuildChestPhysics.cs`. Der Export integriert mit 240 Hz und speichert bearbeitbare Transformkurven. `Tune` dokumentiert die finale gezielte Abstimmung nach der zu schwachen ersten Probe.
- Separate Torso-Kopie: `../unity/Assets/ChestPhysics/TorsoSpring.png` samt Importmetadaten. Originalpixel unverändert, dichteres gemeinsames Mesh, weich auslaufende Gewichte; zentrale Schnürung, Hals, Schultern und Gesicht ohne Federgewichte. Keine getrennten Brust-PNGs und keine Bildüberblendungen.
- Clips: `SpringPoseWithoutPhysicsTuned.anim` und `SpringPoseWithPhysicsTuned.anim` im selben Unity-Ordner. Live-Simulation und vorgebackene Federkurven nicht gleichzeitig aktivieren.

## HTML-Export

Transparente Unity-Einzelbilder: `../unity/Export/ChestPhysics/SpringPose*PhysicsTuned/`. `pack-physics.py` erstellt verlustfreie native Atlanten und prüft Bildunterschiede. HTML benötigt keine Unity-Laufzeit. Die Browserprobe wiederholt den Clip nur zur Abnahme; sie führt keine neue Spielregel ein.

`spring-validation.json` enthält tatsächliche Federwerte und Restbewegung, `mesh-audit.json` die vollständige Meshprüfung und `validation.json` Bild-/Bestandsschutzprüfungen. Die bestehende PSB und das ursprüngliche Prefab sind nicht ersetzt. Das Rig ergänzt eine kontrollierte 2D-Federbewegung; es ist keine volumetrische 3D-Körper- oder Stoffsimulation.

# Mara · aktueller Idle-Versuch

Unity **6000.4.0f1**. Diesen Ordner als vorhandenes Projekt in Unity Hub öffnen, `Assets/MaraIdle.unity` öffnen und Play drücken. `Assets/MaraIdle.anim` enthält die bearbeitbaren Bewegungs- und Blinkkurven. Die Szene verwendet Unitys 2D Animation/SpriteSkin, keine Unity-Laufzeit im HTML-Spiel.

`Assets/Art/MaraLayers.psb` enthält elf Bildlagen. Die einzelnen PNG-Lagen einschließlich offener/halber/geschlossener Augen stehen daneben; ihre Rig-Daten sind im Sprite Editor/Skinning Editor bearbeitbar. Die PSB ist die Bildquelle, während die Szene die vorbereiteten PNG-Lagen riggt. Es ist noch keine universelle Reaktionsfigur mit vollständig getrennten Armen oder Mundvarianten.

Menü `SPIRE → Mara → Rebuild full idle and export` baut die Probenszene neu auf und ersetzt dabei manuelle Szenen-/Clipänderungen. Der automatische Export wird im Batchlauf durch `-executeMethod BuildMaraIdle.Run -spire-export` ausgelöst. Die reproduzierbaren PNGs landen im ignorierten Ordner `Export/`; `python pack-preview.py` erstellt daraus die separate [Browservorschau](http://127.0.0.1:5218/unity-idle-review.html).

Die achtsekündige Animation ist ein vorgelegter Arbeitsstand, keine visuell freigegebene Spielgrafik. Der Nutzer beanstandete die Weiterverwendung des alten Bildes statt einer neuen optimalen Rig-Pose und verlangt zunächst diesen Stand ohne weitere Nachkorrekturen. [Nachweis](../acceptance/t11-unity-idle/REPORT.md), [Bildquellen und Prompts](../../../experiments/idle-bastion/assets/mara-tavern/unity-idle/PROMPTS.md). Kein eigener Commit/Push.

# Mara – gemeinsame Proportionsprüfung M01–M08

Separates Experiment vom 23.10.2026. Die freigegebene M01-Arm-/Handform wird auf die vorhandenen Bewegungen übertragen. Die ursprünglichen Clips, Grafiken, Rigs und Vergleichsexporte bleiben erhalten. M01/M02/M03/M04/M06/M07 wurden einzeln abgenommen; M05/Kichern und M08/Hüfte hat der Nutzer anschließend vorab freigegeben. Commit und Push auf dem Animationsbranch sowie die Aktualisierung des separaten Testpakets sind beauftragt. Das Hauptspiel bleibt unverändert.

[Vergleich öffnen](http://127.0.0.1:5223/reactions-v1/preview/)

Links steht jeweils die bisherige Fassung, rechts dieselbe Bewegung mit den neuen Proportionen. Beide Seiten laufen synchron. Der Regler, halbes Tempo und die Armvergrößerung helfen bei der Prüfung. „Mit Idle-Rückkehr“ ergänzt die Basis-Idle. M01 verwendet direkt die vorhandenen freigegebenen Vergleichsdateien, ohne eine weitere Exportkopie.

| ID | Bewegung | Schlüssel / bisherige Clipquelle | Neue Szene / Prefab unter `../idle-rig/unity/Assets/` |
| --- | --- | --- | --- |
| M01 | Basis-Idle, 5 s | `idle` / `Clips/IdleOrganic.anim` | bestehend: `ProportionsNative/` |
| M02 | Kopfreaktion, 2 s | `head` / `Clips/HeadReactionOrganic.anim` | `ProportionReactions/` |
| M03 | Berührungsreaktion, 2,8 s | `touch` / `Clips/TouchReactionOrganic.anim` | `ProportionReactions/` |
| M04 | Blickkontakt, 3,8 s | `glance` / `Clips/IdleBlickkontakt.anim` | `ProportionExtras/glance/` |
| M07 | Necken, 3,4 s | `tease` / `Clips/ReactionNeckenBody.anim` | `ProportionExtras/tease/` |
| M06 | Aufrichten und Abfedern, 4,2 s | `joy` / `ChestPhysics/SpringPoseWithPhysicsTuned.anim` | `ProportionExtras/joy/` |
| M08 | Hand an die Hüfte, 5 s | `hip` / `PhysicsGestures/HandOnHipPhysics.anim` | `ProportionExtras/hip/` |
| M05 | Kichern, 5,4 s | `giggle` / `PhysicsGestures/GigglePhysics.anim` | `ProportionExtras/giggle/` |

## Übertragung

- M02/M03/M04/M07 verwenden die fünf bereits freigegebenen nativen Sprite-Meshes aus `ProportionsNative/`.
- M05/M06/M08 behalten das feinere Physik-Torso-Mesh mit seinen 24 Knochen, UVs, Gewichten, Dreiecken und Bind-Posen. `BuildProportionExtra.PhysicsTorso` überträgt die freigegebene M01-Geometrie anhand identischer Ausgangsvertices und ihrer Kantenmittelpunkte. Dadurch bleibt die zusätzliche Federgewichtung erhalten. Ergebnis: `ProportionExtras/TorsoSpringProportions.asset`.
- Unterarme und Hände verwenden auch dort die vier freigegebenen M01-Sprites. Halsgrafik und übrige Ebenen bleiben die jeweiligen Originale. Die bereits gebackene Physik wird nicht nochmals simuliert.
- Es wurden keine Charakterbilder generiert und keine Bewegungskurven, Zeiten oder Layer-Reihenfolgen angepasst. Bestehende Grenzen wie einfache Fingerzeichnung und begrenztes Greifen bleiben bestehen.

## Kleiner Prüfrahmen

`validation.json` enthält M02/M03; `validation-{Schlüssel}.json` jeweils die ergänzte Bewegung. Geprüft werden die unveränderte Bewegung vor/nach der Übertragung, Übereinstimmung mit dem alten Export, Anfang/Ende zur M01-Ruhepose, Mesh-Faltungen, Deckung an Schulter/Ellbogen/Handgelenk und verlustfreie Atlasableitung. `preserved-hashes.json` hält die zuvor bestehenden 366 Quelldateien und M01-Vorschau fest. Die Browserprüfung beschränkt sich auf die gemeinsame Vorschau, Zwischenposen und eine kurze Hochkantansicht. Keine Tests des unberührten Hauptspiels.

Die Prüfung ersetzt keine Nutzerfreigabe. Nach der erteilten Freigabe werden die sechs im Herz-2-Testpaket vorhandenen Mara-Rollen auf die korrigierten Fassungen umgestellt. M07/Necken und M08/Hüfte bleiben zusätzliche freigegebene Kandidaten in dieser Übersicht. Keine automatische Hauptspielintegration.

### Ergebnis

Alle sieben Übertragungen abgeschlossen: 1.610 gerenderte Vorher-/Nachher-Zustände, keine Mesh-Faltung; identische Knochenbewegung und unveränderte Gesichtspixel. Alle bisherigen Vergleichsrenders stimmen pixelgenau mit den ursprünglichen Exporten überein. An den geprüften Schulter-, Ellbogen- und Handgelenkanschlüssen bleibt die Deckung vollständig. Alle 366 zuvor erfassten Originaldateien sind hashidentisch.

Anfang und Ende jedes Clips sind pixelidentisch. M02/M03/M04/M07 schließen auch pixelgenau an M01 an. Bei den drei feineren Physik-Meshes bleiben gegenüber M01 minimale Rasterrundungen an 790 von 786.432 Pixeln: auf dunklem Hintergrund höchstens 2/255 sichtbare Kanalstufen, auf hellem Hintergrund an einem Pixel 3/255. Keine Änderung von Position oder Kontur; nicht durch Retusche oder Zusatzframes verdeckt.

Alle Atlanten haben den verlustfreien RGBA-Rücklesetest bestanden. Kurze Browserprüfung mit Zwischenpose, Armvergrößerung und Hochkantansicht; kein Hauptspieltest. Unity protokollierte den bereits bestehenden SearchDatabase-Indexfehler beim Start, führte aber jeden Export vollständig mit `folds=0` und Exitcode 0 aus.

## Reproduzieren

Unity 6000.4.0f1, Projekt `../idle-rig/unity/`. `Assets/Editor/BuildProportionReactions.cs`, `BuildProportionExtra.cs` und `Assets/ProportionReactionExport.cs` enthalten Aufbau und Export. Bereits gespeicherte Quellen erneut exportieren:

```powershell
# Aus dem Repository, Unity.exe über seinen installierten absoluten Pfad aufrufen:
Unity.exe -batchmode -projectPath "<absoluter Pfad>/idle-rig/unity" -executeMethod BuildProportionReactions.ExportSaved -spire-export -logFile "<Logpfad>"
Unity.exe -batchmode -projectPath "<absoluter Pfad>/idle-rig/unity" -executeMethod BuildProportionExtra.ExportSaved -spire-clip glance -spire-export -logFile "<Logpfad>"
```

Für die Extras nacheinander `glance`, `tease`, `joy`, `hip`, `giggle` verwenden. Unity beendet sich nach dem Export selbst. `BuildProportionExtra.Run` ist nur für den erstmaligen Aufbau vorgesehen und überschreibt keine vorhandene neue Szene.

Danach `python pack.py` für M01–M03 und anschließend `python pack-extra.py <Schlüssel>` für jedes Extra ausführen. `pack.py` initialisiert das Manifest neu; beim Wiederherstellen daher zuerst dieses Script und danach die Extras verwenden. Vorhandene Einzelbilder liegen unter `export/{Schlüssel}/{before,after}/`, inklusive Endpose; die lokale Vorschau enthält verlustfreie WebP-Atlanten mit 30 fps und 768 × 1024 Pixeln pro Bild. Diese reproduzierbaren Medien bleiben durch die lokale `.gitignore` aus Git ausgeschlossen. Eine spätere Produktionsoptimierung ist ein eigener Schritt.

Port 5223 liefert den übergeordneten Ordner `mara-proportions-v1/` aus. Kein Unity-Player wird im Browser benötigt.

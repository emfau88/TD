# Ilyra I03 – lokale Ellbogenkorrektur

26.10.2026. Der Nutzer hat den störenden Wulst ausdrücklich in der tatsächlich eingebundenen Berührungsreaktion I03 identifiziert und dessen Korrektur beauftragt. Die sichtbare Außenkontur am bildlinken Ellbogen wurde zunächst als isolierter, editierbarer Unity-Kandidat korrigiert. Abnahmestatus ausschließlich in der zentralen [Roadmap](../../../../experiments/idle-bastion/ROADMAP.md).

## Korrektur und Quellen

Ausgangsbasis ist der gemeinsame Ilyra-Export unter `../../tavern-hearts-0-2/` und dessen Szene `unity/Assets/TavernTest.unity`. Das ist die Quelle des heutigen I03; die abgelehnte frühere 90°-Armbeuge-Probe wird nicht verwendet. 160 ursprüngliche Projektdateien sind in `source-hashes.json` festgehalten.

Die Außenkontur um den Ellbogen wurde beim Beugen zu rund und breit. Zwei zusätzliche, lokal wirkende Korrekturknochen verteilen eine kleine Einwärtsbewegung auf 109 von 2.340 Vertices der Torso-/Arm-Ebene. Sie hängen an den bestehenden Oberarm-/Unterarmknochen, übernehmen deren Bind-Posen und erhalten ausschließlich einen vom tatsächlichen Beugewinkel abhängigen Positionsversatz. Maximaler Steuerwert 11 Quellpixel; über Höhe und Breite weich auf null ausgeblendet. Keine globale Armskalierung. Textur, UVs, ursprüngliche Bones und sämtliche ursprünglichen Animationskurven bleiben erhalten. Bei der Ruhepose ist der Zusatzversatz null.

`BuildIlyraTouchElbow.cs` enthält den vollständigen Aufbau. Das lokale Unity-Projekt liegt unter `unity/`, native neue Szene, Prefab, Sprite und Clip unter `unity/Assets/ElbowCorrection/`. Große kopierte Projekt-/Exportdateien sind lokal erhalten und ignoriert; der Builder und die unveränderten ursprünglichen Quellen erlauben die Reproduktion.

## Reproduktion

1. Falls `unity/` noch nicht existiert: `python prepare_unity.py`. Prüft die 160 Originaldateien und verweigert Überschreiben eines bestehenden Projekts.
2. Unity 6000.4.0f1 mit `-batchmode -projectPath <dieser Ordner>/unity -executeMethod BuildIlyraTouchElbow.Run -spire-export -logFile <dieser Ordner>/unity-export.log` starten. Benötigt die vorhandene Unity-Lizenz und Paketumgebung. Der Builder wird einmal auf dem vorbereiteten Projekt ausgeführt.
3. `python pack_review.py` erzeugt die Spielfassung, verlustfreie vorbereitete Quellen unter `preview/lossless/` und prüft Originaldateien, Gelenke und Bildänderungen. Die Vorher-Atlanten werden reproduzierbar aus Git-Commit `1ce4e476f2d290a681fae6e16887eedd27d984d5` gelesen.
4. `python -m http.server 5234 --bind 127.0.0.1 --directory preview`.

[Synchroner Vergleich](http://127.0.0.1:5234/): startet pausiert bei Bild 28 (0,90 s), mit Einzelbildregler, 0,25×/0,5×/1× und Armvergrößerung/Ganzfigur. Links bytegenaue Kopien der bisherigen Runtime-Atlanten; rechts neu gepackte native Unity-Ausgabe mit derselben WebP-Qualität 30, Auflösung und Platzierung. Die Ansicht ist unabhängig vom Spielstand.

## Tatsächliche Prüfung

- 98 native Exportzustände; Runtime unverändert 96 Frames, 30 fps, 3,2 s.
- 957.460 Dreiecksprüfungen, null Faltungen; kleinste relative Fläche 0,5102.
- Alle ursprünglichen 28 Gelenke über sämtliche exportierten Zustände exakt identisch (Positions- und Endpunktdelta 0).
- Native Ruhe-/Endbilder exakt identisch zum bisherigen Export; keine Pixeländerung außerhalb des betroffenen Ellbogen-/oberen Unterarmbereichs. Alle 160 Quelldateien unverändert.
- Zwölf neue Runtime-Atlanten, 2.523.804 Byte; Alpha zur vorbereiteten Ausgabe exakt. Quantisierte RGB-Farben können durch die erneute WebP-Packung auch außerhalb der geometrischen Änderung geringfügig abweichen.
- Der bekannte Unity-Editorfehler in `UnityEditor.Search.SearchDatabase` trat im Log auf; der eigentliche Export wurde mit 98 Zuständen und null Mesh-Faltungen abgeschlossen. Keine Behauptung eines fehlerfreien gesamten Editorlogs.
- Native Spitzenpose und Browservergleich im Detail/Ganzkörper angesehen. Browserprüfung und ihre tatsächlichen Ergebnisse stehen in `preview/browser-checks.json`; Screenshots lokal unter `preview/`.

## Übernahme ins Hauptspiel

Nach ausdrücklicher visueller Nutzerfreigabe wurden die zwölf freigegebenen I03-Atlanten bytegenau übernommen; neun davon unterscheiden sich vom früheren Stand. I07 und sämtliche anderen Animationen bleiben bytegenau unverändert. Manifestgröße aktualisiert: 2.523.804 Byte, 2.104 Byte kleiner als vorher. `integration.json` dokumentiert die Übernahme.

Der reguläre Produktionspacker verwendet für I03 jetzt die neuen verlustfreien vorbereiteten Quellen. `production-repack.json` bestätigt bytegenaue Reproduktion sämtlicher freigegebener Runtime-Dateien. Auf einem frischen Checkout zuerst die Unity-Quellen und `pack_review.py` ausführen; es wird nicht auf die frühere I03 zurückgefallen. Technischer Produktions-/Pages-Build erfolgreich. Die gezielte Prüfung im echten Spiel ist in `in-game-checks.json` dokumentiert; die anfängliche Browserprobe wurde um das reguläre Schließen des Rückkehrdialogs ergänzt.

Veröffentlichungsstatus und Nutzerfreigabe stehen in der zentralen Roadmap.

# Mara: Proportionen im bestehenden Idle-Rig

Separate Unity-Projektkopie. Der freigegebene Zeichnungsstand `../after-forearms-v2.png` dient als Proportionsreferenz. Übertragen werden die Maße und Konturen auf die vorhandenen fünf Arm-/Handmeshes; die generierte Gesamtzeichnung ersetzt nicht die bisherigen Gesicht-/Kleidungs-/Haarebenen.

## Bearbeitbare Quellen

- Projekt: `unity/`, Unity 6000.4.0f1, 2D Animation 14.0.3.
- Finale Szene: `unity/Assets/ProportionsNative/MaraIdleComparison.unity`.
- Finales Prefab: `unity/Assets/ProportionsNative/MaraProportions.prefab`.
- Fünf angepasste native Sprite-Meshes unter `unity/Assets/ProportionsNative/`: Torso einschließlich Oberarmen, ForearmL/R und HandL/R.
- Mesh-Aufbau und Maße: `unity/Assets/Editor/BuildProportionIdle.cs`.
- Bestehender, unveränderter Bewegungsclip: `unity/Assets/Clips/IdleOrganic.anim`. Der neue Controller spielt ihn in Szene/Prefab ab.
- Export und Prüfung: `unity/Assets/ProportionIdleExport.cs`, `pack.py`.

Die ursprünglichen Texturen, UVs, Knochen, Bindeposen, Gewichte und Dreiecksverbindungen bleiben erhalten. Die Mesh-Grundform wird einmalig angepasst. Die Oberarme werden quer zu ihrer Achse im mittleren Bereich maximal 12 % schmaler, mit weichem Auslauf zu Schulter/Ellenbogen. Die Unterarme wachsen im mittleren Bereich maximal 8 % in der Breite; zum gemeinsamen Handschuhanschluss geht die Breite auf 22 % über. Die Hände werden etwa 22 % breiter und unterhalb des Handgelenks maximal 20 % länger. Das sind lokale Mesh-Parameter, keine Behauptung pixelgenauer Übereinstimmung mit dem generierten Referenzbild. Die Gelenkpositionen bleiben erhalten. Hand und Unterarm verwenden dieselbe Abbildung im Überlappungsbereich.

Native Sprite-Daten werden getrennt gespeichert, weil Kopien importierter Sprites ihren Importbezug behalten und beim Neuladen wieder die Ausgangsgeometrie verwenden können. `Assets/Proportions/` und frühe Build-Logs dokumentieren einen verworfenen technischen Zwischenversuch; maßgeblich ist ausschließlich `ProportionsNative/`.

## Export und Vergleich

`export/before/` und `export/after/` enthalten je 151 transparente PNGs bei 768 × 1024 und 30 fps, einschließlich des exakten Endframes nach 5 s. `preview/` verwendet jeweils 150 Frames für den Loop in verlustfreien WebP-Atlanten. Beide Seiten teilen denselben Zeitgeber, dieselbe Kamera und denselben Bildanker; Pause, gemeinsamer Regler, Neustart, halbes Tempo und helle/dunkle Ansicht sind verfügbar. Es werden nur benötigte aktuelle/nächste Atlanten geladen.

Start über den bereits laufenden Server: http://127.0.0.1:5223/idle-rig/preview/ . Ohne Server: `python -m http.server 5223 --bind 127.0.0.1 --directory artifacts/idle-bastion/mara-proportions-v1`.

`validation.json`, `mesh-audit.json`, `joint-coverage.json` und `source-hashes.json` enthalten die tatsächlichen Bild-, Mesh-, Anschluss- und Erhaltungsprüfungen. Nur diese Idle wurde für die korrigierte Grundform geprüft; die übrigen Gesten brauchen nach visueller Freigabe eine gesonderte Prüfung. Es ist keine neue Gesamt-PSB erzeugt worden. Die native Unity-Szene mit Einzelteilen bleibt wiederverwendbar.

Verwendeter Unity-Zugriff: [SpriteDataAccessExtensions.SetVertexAttribute](https://docs.unity.cn/2023.2/Documentation/ScriptReference/U2D.SpriteDataAccessExtensions.SetVertexAttribute.html). Es werden nur Positionsdaten verändert; die Bildtexturen bleiben unangetastet.

## Gemessene Prüfung

- 110 ursprüngliche Quelldateien unverändert; sämtliche Vorher-Frames identisch zum bisherigen Idle-Export.
- 302 geprüfte Posen und 564.136 Dreiecke ohne Faltungen. Knochenbewegungen vor/nach identisch.
- 604 lokale Deckungsprüfungen um Ellbogen und Handgelenke: niedrigstes Alpha 255. Das prüft diese Anschlüsse, nicht jede Kontur der Figur.
- Beide Loop-Endpunkte exakt identisch; Kopfbereich in sämtlichen 151 Frames unverändert.
- Torsozentrum nicht vollständig pixelidentisch: größter mittlerer Kanalunterschied 0,01064/255, größter einzelner Kanalunterschied 24/255. Die zugrunde liegenden Texturen bleiben unverändert.
- 86.498.104 Bytes für beide nativen Vergleichs-Atlasreihen; verlustfreier RGBA-Roundtrip bestätigt. Dies ist ein Vergleichsexport, noch keine Größenoptimierung für das Hauptspiel.
- Desktop-Vergleich, Zwischenposen und Blinkphase kontrolliert. Keine neue Hochkantprüfung dieses Idle-Vergleichs.

Für weitere Clips muss die gleiche Mesh-Abbildung auf deren jeweilige Rig-Version angewandt werden. Insbesondere Physikvarianten haben eigene Torso-Gewichte; diese dürfen nicht durch den einfachen Idle-Torso ersetzt werden.

Aktueller Arbeitsstand und Freigaben ausschließlich in der zentralen ROADMAP.md. Hauptspiel, vorherige Rigs und Tavernenpaket unverändert; kein Commit/Push.

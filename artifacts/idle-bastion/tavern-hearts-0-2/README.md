# Tavernen-Testpaket · Mara und Ilyra · Herzen 0–2

Separate lokale Vorschau vom 23.10.2026. Status und Nutzerabnahme stehen ausschließlich in der [zentralen Roadmap](../../../experiments/idle-bastion/ROADMAP.md). Hauptspiel, frühere Vorschauen und Originaldateien werden nicht verändert. Keine Spielimporte, Unity-Laufzeit, Speicherzugriffe, Punktevergabe oder Geschenktransaktionen. Die Herzstufe wird bewusst im Test gewählt; nur Figur und Teststufe stehen in der URL.

## Starten und ausprobieren

`python -m http.server 5222 --bind 127.0.0.1 --directory artifacts/idle-bastion/tavern-hearts-0-2`

[Lokale Vorschau](http://127.0.0.1:5222/) öffnen. Oben Mara/Ilyra und Herzstufe 0, 1 oder 2 wählen. Sprechen, Schenken und Berühren auslösen. Im Berührungsmodus sind Haare, Schulter und Hand sowohl an der Figur als auch über beschriftete Buttons erreichbar. Persönliche Momente enthalten je drei manuell weitergeschaltete Abschnitte. Pause hält die Animation an.

| Anlass | Herz 0–1 | Herz 2 |
| --- | --- | --- |
| Ruhe | Basis-Idle | Nach drei Basis-Loops einmal zusätzliche Idle |
| Sprechen / Haare | Kopfreaktion | Kopfreaktion |
| Hand / Schulter | Berührungsreaktion | Berührungsreaktion |
| Schenken | Berührungsreaktion | Abwechselnd freudige Reaktion und Berührungsreaktion |
| Scherzen | Noch nicht verfügbar | Kichern |
| Persönliche Geschichte | Erster Moment ab Herz 1 | Beide Momente wiederholbar |

Unter „Animationen & Zuordnung“ lässt sich die zusätzliche Idle ab Herz 2 auch bewusst anfordern. Reaktionen starten nur an exportierten Ruheframes. Aus der Basis-Idle führt ein kurzer Rücklauf durch vorhandene Bilder zur nächstgelegenen neutralen Position (höchstens acht Schritte bei 30 fps, ohne Ladezeit maximal 0,3 s bis Clipbeginn). Eine bereits laufende Reaktion läuft zu Ende. Eine weitere Auswahl wird vorgemerkt und schließt direkt an; weitere Klicks ersetzen diese eine Vormerkung. „Vorgemerkte Aktion verwerfen“ löscht sie. Es entsteht keine unbegrenzte Warteschlange. Beim erstmaligen Abruf kann zusätzliche Ladezeit entstehen; diese wird angezeigt. Es gibt keine Überblendungen, Bildverzerrungen oder neu erfundenen Armübergänge.

## Vorhandene Animationen

| Rolle | Mara | Ilyra |
| --- | --- | --- |
| Basis | IdleOrganic, 5 s | IlyraIdle, 6 s |
| Kopf | HeadReactionOrganic, 2 s | IlyraHeadReaction, 2,8 s |
| Berührung | TouchReactionOrganic, 2,8 s | IlyraTouchReaction, 3,2 s |
| Zusätzliche Idle | IdleBlickkontakt, 3,8 s | IlyraIdleVariant, 4,8 s |
| Freude | SpringPoseWithPhysicsTuned, 4,2 s | IlyraMiniHopV3, 3,2 s |
| Kichern | GigglePhysics, 5,4 s | IlyraGiggle, 4 s |

**Aktualisierung 23.10.2026:** Die sechs verwendeten Mara-Rollen verwenden jetzt die freigegebenen M01/M02/M03/M04/M06/M05-Proportionen aus `mara-proportions-v1/reactions-v1/preview/`. M07/Necken und M08/Hüfte bleiben freigegebene zusätzliche Kandidaten in der gemeinsamen Vergleichsübersicht. Bewegung und Bedienzuordnung sind unverändert. Die alten Paketquellen und das alte Manifest stehen unter `proportions-before/`, sämtliche alten Atlanten bleiben unter `assets/mara/`; neue Atlanten liegen separat unter `assets/mara-proportions-v1/`. Ilyras Manifest und Assets bleiben unverändert.

Mara wird aus vorhandenen verlustfreien Prüfatlanten übernommen. Quellen sind in `pack.py` und `manifest.json` angegeben. Die neue Ilyra-Hüftzeichnung, abgelehnte Armbeugen/Übergänge und Maras Vorbeuge sind nicht enthalten.

Ilyras ältere Kopf-/Berührungs-/Idle-2-Exporte hatten verschiedene Torso-/Fingergewichte. Deshalb kopiert `prepare_unity.py` den bestehenden korrigierten Rigstand aus `ilyra-rig-prep/hip-v1/unity`, einschließlich Grafik-Metadaten, Szenenbasis und unveränderten Clips. `ExportTavern.cs` spielt die sechs vorhandenen Clips auf demselben Giggle-Rig ab. Es entstehen keine neuen Gesten; physikalische Bewegungen bleiben in den bestehenden Animationskurven enthalten. Originalprojekt und frühere Exporte bleiben erhalten. Die neue Szene liegt unter `unity/Assets/TavernTest.unity`, PNGs und Gelenk-/Meshnachweise unter `unity-export/`.

## Wiedergabe und Größe

- 30 fps, feste Darstellung 480 × 800, einheitliche Skalierung/Position pro Figur. Keine individuelle Größenanpassung einzelner Clips.
- Masterbilder bleiben erhalten. Darstellungsableitung einmal mit Lanczos verkleinert; anschließende WebP-Packung pixelverlustfrei geprüft. „Verlustfrei“ bezieht sich auf diese Packung, nicht auf die Auflösungsreduktion.
- Acht Frames pro Atlas, höchstens 1920 × 1600. Start lädt ausschließlich die ausgewählte Idle; danach jeweils aktuelle/nächste Seite und bei Bedarf den angeforderten Clip. Für den kurzen Idle-Rücklauf werden nur dessen tatsächlich benötigte Seiten zusätzlich geladen und bis zur Verwendung im Cache geschützt. Begrenzter Bildcache, pausierter Zeitlauf bei verborgenem Dokument.
- Die zwölf lokalen Prüfreihen umfassen **316.362.726 Byte, 1.416 Frames**. Das ist trotz reduzierter Auflösung noch ein großes Vorschaupaket. Für eine spätere Veröffentlichung braucht es eine weitere Größen-/Ladebudget-Entscheidung; dieses Paket ist kein unveränderter Produktionsimport. Es wird nicht vollständig beim Öffnen geladen.
- Texte der ersten drei Stufen und ersten zwei Momente stammen aus den vorhandenen `tavern-*-content.ts`. Zwei Speerbezüge für die speerlose Ilyra angepasst; je eine kurze Scherzantwort ergänzt. Die Originaltexte bleiben unverändert.

## Reproduktion und Nachweise

1. `python artifacts/idle-bastion/tavern-hearts-0-2/prepare_unity.py` erstellt die isolierte Kopie einmalig und verweigert Überschreiben.
2. `ExportTavern.cs` nach `unity/Assets/Editor/` kopieren. Unity 6000.4.0f1 mit `-batchmode -projectPath <absolutes unity-Verzeichnis> -executeMethod ExportTavern.Run -spire-export -logFile <absoluter Logpfad>` starten.
3. Zuerst die korrigierten Mara-Vergleichsquellen nach `mara-proportions-v1/reactions-v1/README.md` exportieren. Dann `python artifacts/idle-bastion/tavern-hearts-0-2/pack.py` und `node artifacts/idle-bastion/tavern-hearts-0-2/content.mjs`.
4. `python artifacts/idle-bastion/tavern-hearts-0-2/verify.py` und `node --test artifacts/idle-bastion/tavern-hearts-0-2/playback.test.mjs`.

`qa/verification.json`: 304 vorherige Quelldateien per SHA-256 unverändert; 732 neu ausgegebene Unity-Zustände, 7.151.640 Dreiecksprüfungen ohne Faltungen. Anfang/Ende jedes Clips exakt identisch. Mara auch clipübergreifend exakt. Bei Ilyra bleiben 105 Pixel minimale Rasterrundung zwischen Basis und Reaktionen (mittlere Kanalabweichung 0,00011, maximal RGB 5/255, Alpha 1/255); keine wechselnde Kontur oder Proportion. Diese Restabweichung wurde nicht durch Retusche verdeckt.

Zwölf aktuelle Abspieltests prüfen alle 330 Idle-Einstiegspositionen (maximal 0,3 s Steuerungszeit bei geladenen Bildern), neutralen Anschluss, ersetzbare Folgeaktion, direkte Wiederholung desselben Clips, verzögerte Bilder, Abbrechen, Herzgrenzen, Abstand der Zusatz-Idle und Vorrang einer Nutzeraktion. Browser-Nachprüfung der Bedienkorrektur: Mara/Ilyra-Berührung, schnelle Auswahlfolge, direkte Folgeaktion, Vormerkung verwerfen, Pause, Figur-/Herzwechsel, persönliche Momentabschnitte 1→2 und schmale Ansicht 390 × 844. JavaScript-Syntaxprüfung bestanden. Browserprüfung auf Desktop und 390 × 844 umfasst Figuren-/Herzwechsel, Gespräch, Geschenk, Kichern, Hand-Hotspot, persönliche Momentfolge und erreichbare mobile Bedienelemente. Ein durch fokussierte Hotspots scrollbar gewordener Bildrahmen wurde mit `overflow: clip` korrigiert. Screenshots und Kontakttafel liegen unter `qa/`.

Die gemeinsame Probe erlaubt die visuelle Beurteilung der Zuordnung. Sie ersetzt keine Nutzerfreigabe und keine spätere Prüfung im tatsächlichen Spiel.

Die vorherigen Bedienquellen sind unverändert unter `input-v1/` als Quellensicherung abgelegt (kein eigenständig startbares Unterverzeichnis). Grafiken, Animationsclips, Atlanten und das Hauptspiel wurden für die Bedienkorrektur nicht geändert. Die kurze Rückführung beschleunigt vorhandene Idle-Bewegung; sie ist kein neu gerenderter Rig-Übergang. Die visuelle Wirkung bleibt Gegenstand der Nutzerabnahme.

Die gezielte Mara-Aktualisierung erfolgt mit `python artifacts/idle-bastion/tavern-hearts-0-2/pack.py --mara-current`: übernimmt nur die sechs Mara-Clips, belässt Ilyras Manifest unverändert und schreibt neue Atlaspfade. `qa/mara-proportions.json` dokumentiert Pfade und Erhalt der alten Atlanten; `qa/source-hashes-mara-current.json` hält die neuen Quellen fest. Der frühere vollständige Prüfbericht bleibt historisch erhalten.

# Tavernenanimationen – verwendbarer Bestand für Mara und Ilyra

**Sicherungshinweis (23.10.2026):** Die hier genannten PNGs/Atlanten und Vergleichsmedien sind lokal vorhanden. Die neue GitHub-Sicherung enthält deren vollständige bearbeitbare Quellen, Steuerung und Re-Exportverfahren; große reproduzierbare Medienkopien bleiben lokal. [Umfang und Wiederherstellung](../../artifacts/idle-bastion/TAVERN_BACKUP_CURRENT.md).

Stand: **23.10.2026**, geprüft im lokalen Worktree `C:/Users/madde/Documents/TowerDefense`, Branch `codex/tavern-idle-smoothing`, letzter Commit `f9c4fc3`. Auch die noch nicht committeten Dateien sind berücksichtigt.

Diese Datei ist eine Bestandsaufnahme mit Integrationsvorschlag, kein Produktionsauftrag. Sie konzentriert sich auf brauchbare Fassungen und den tatsächlich eingebundenen Spielbestand. Abgelehnte Versuche und überholte Vergleichsversionen werden auf Nutzerwunsch nicht einzeln aufgeführt; ihre Dateien bleiben vollständig erhalten. Die fortlaufende Aufgabenplanung bleibt in der [ROADMAP.md](ROADMAP.md).

## Das Wichtigste

- **Mara:** Eine Basis-Idle mit den neuen Arm-/Handproportionen ist visuell freigegeben. Sieben weitere vorhandene Bewegungen können als Grundlage dienen, benötigen aber noch diese Anpassung. Nicht alle sieben werden für den ersten Ausbau benötigt.
- **Ilyra:** Sechs Bewegungen auf der normalen Ruhegrundlage liegen gemeinsam im Herz-2-Testpaket vor. Die freigegebenen kürzeren Arm-/Handproportionen sind berücksichtigt. Zusätzlich gibt es eine separat freigegebene Hüftanimation mit vergrößerter Hand; deren Wechsel zur normalen Ruhepose ist noch nicht verwendbar.
- **Im Hauptspiel:** Weiterhin die bisherigen Idle-, Hand-, Haar- und Schulteranimationen – vier Arten je Figur. Keiner der neuen Unity-Clips ist im Hauptspiel integriert.
- **Empfohlenes erstes Paket:** Fünf Rollen je Figur: Basis-Idle, Kopfreaktion, Berührungsreaktion, gelegentliche zweite Idle und Kichern. Das sind zehn ausgewählte Clips. Freude/Geschenk kann zunächst die vorhandene Berührungsreaktion verwenden.

„Brauchbar“ bedeutet hier: eine sinnvolle vorhandene Grundlage, kein Versprechen sofortiger Produktionsreife. Insbesondere fehlende Nutzerfreigabe, Proportionsübertragung und Exportbudget sind unten ausdrücklich ausgewiesen.

## Status und Leseschlüssel

| Status | Bedeutung |
| --- | --- |
| **integriert** | Im aktuellen Spielcode tatsächlich angebunden. |
| **freigegeben** | Die ausdrücklich benannte sichtbare Fassung wurde vom Nutzer akzeptiert; Integration ist damit nicht automatisch beauftragt. |
| **Nachbesserung** | Brauchbarer Bewegungsablauf, aber eine konkrete Korrektur oder Angleichung fehlt. |
| **Experiment** | Vorhandener, abspielbarer Kandidat; eine eindeutige abschließende visuelle Freigabe ist nicht belegt. |

Ältere README-Dateien enthalten teilweise noch „Abnahme offen“. Für diese Übersicht wurden die späteren Nutzerentscheidungen und Roadmap-Einträge mit berücksichtigt. Eine technische Prüfung oder ein Sicherungscommit gilt nicht als visuelle Freigabe. Die Kategorie „verworfen“ wird hier nicht als eigene Liste geführt.

### Quellenkürzel

Alle nachfolgenden Dateiangaben mit Kürzel sind relativ zu diesen tatsächlichen Ordnern. So bleiben Rig, Grafik und Export eindeutig zugeordnet.

| Kürzel | Ordner |
| --- | --- |
| **G** | [Spielcode und Spielassets](.) – `experiments/idle-bastion/` |
| **M** | [Mara-Rig V2 und Bewegungen](../../artifacts/idle-bastion/mara-rig-v2/) |
| **MP** | [Mara mit neuen Proportionen](../../artifacts/idle-bastion/mara-proportions-v1/idle-rig/) |
| **I** | [Ilyra-Rigs und Bewegungen](../../artifacts/idle-bastion/ilyra-rig-prep/) |
| **T** | [Separates Herz-0–2-Testpaket](../../artifacts/idle-bastion/tavern-hearts-0-2/) |

PNG-Zahlen unten zählen die vorhandenen nativen Exportbilder einschließlich zusätzlicher End-/Prüfzustände. Sie sind nicht immer identisch mit der Anzahl abgespielter Frames. GIF/MP4 sind Ansichtsformate; PNG und verlustfreie WebP-Atlanten sind die Bildquellen für eine spätere Integration.

## 1. Rig- und Grafikgrundlagen

| Grundlage | Tatsächliche Quellen | Eignung und Grenzen |
| --- | --- | --- |
| **Mara M2** – neue Figur mit korrigiertem Schulter-/Umhangaufbau | `M/unity/Assets/MaraV2.prefab`, `Assets/MaraV2.unity`, `Assets/Art/Mara.psb`, einzelne PNGs samt `.meta`; Grafikrevision unter `M/art/shoulder-revision/` | 21 sichtbare Ebenen, 22 Knochen. Zusammenhängender Torso mit Schultern/Oberarmen; Unterarme/Hände separat. Gute Bewegungsgrundlage, aber bisherige Arm-/Handproportionen. |
| **Mara M2-P** – freigegebene neue Proportionen | `MP/unity/Assets/ProportionsNative/MaraProportions.prefab`, `MaraIdleComparison.unity` und fünf native Sprite-Assets im selben Ordner | Oberarme schlanker, Unterarme moderat kräftiger, Hände größer. Originaltexturen, UVs, Knochen, Gewichte und Idle-Kurven erhalten. Bisher ausschließlich mit der Basis-Idle geprüft. Die kopierte PSB allein enthält diese neue Mesh-Grundform nicht; finale Sprite-Assets und Szene mitnehmen. |
| **Mara M2-F** – Physikvariante | `M/unity/Assets/ChestPhysics/MaraPhysicsTuned.prefab`, `TorsoSpring.png` samt `.meta`, `Assets/MaraChestSpring.cs`; für Gesten zusätzlich `Assets/PhysicsGestures/HeadNeck.png` samt `.meta` | 24 Knochen einschließlich zweier Federknochen, kontinuierliches Torso-Mesh. Eigene Gewichte: bei der Proportionskorrektur erhalten, nicht durch den einfachen Idle-Torso ersetzen. Gebackene Physik ist im Export; sie darf nicht zusätzlich ein zweites Mal simuliert werden. |
| **Ilyra I-N** – normale Ruhegrundlage mit akzeptierten Proportionen | `I/shoulder-comparison/` als Grafikbasis; `I/head-reaction-v1/unity/Assets/IlyraForearmsHands.prefab`; folgende Korrekturen in `TorsoTouchWeights.png` bzw. `I/hip-v1/unity/Assets/Art/TorsoHip0.png` samt `.meta` | 13 Grundebenen, PSB, 28 Knochen mit separaten Handgelenken und Oberschenkeln. Schulterform und Unterarm-/Handverkürzung akzeptiert. Gesicht mit offenen/halben/geschlossenen Lidern. Die späteren Gewichte verbessern Finger- und Manschettenbindung. |
| **Ilyra I-N/T** – vereinheitlichter Export der normalen Basis | `T/unity/Assets/IlyraGiggle.unity`, `Assets/TavernTest.unity`, `Assets/Art/`, `Assets/Clips/`; Aufbau in `T/ExportTavern.cs` | Alle sechs vorhandenen Clips wurden auf demselben korrigierten Rig gerendert. Für die gemeinsame Vorschau gegenüber gemischten älteren Exportständen bevorzugen. Keine neue Bewegung und keine neue Grafik. |
| **Ilyra I-H** – separat gezeichnete Hüftgrundpose | `I/hip-base-v2/preview/ilyra-hand-on-hip.png`; finale lokale Handkorrektur in `I/hip-v1/unity/Assets/HipHandSizeV2/IlyraHipHandSize.png`, Szene/Prefab `IlyraHandOnHipHandSize`; Lidquellen unter `Assets/HipBaseBlink/` | Kontinuierlicher SpriteSkin mit 16 Knochen, kleine Bewegungen innerhalb der gezeichneten Kontaktpose. Keine vollständige neue Ebenen-PSB, keine frei beweglichen Finger und kein akzeptierter Übergang zur normalen Ruhegrundlage. Eigenständiges Grafikmodell mit Detailabweichungen zur normalen Figur. |

Unity-Projekte verwenden laut vorhandenen Projektdateien Unity **6000.4.0f1**; die neueren 2D-Rigs verwenden 2D Animation **14.0.3**. Die editierbare Grundlage besteht aus Grafik **plus Importmetadaten/Geometrie, Prefab, Szene und Clips**. Eine PSB oder ein PNG allein ist kein vollständiges Rig.

## 2. Mara – brauchbare Bewegungen

Alle acht folgenden Bewegungen sind **noch nicht im Hauptspiel**. „Im Testpaket“ bezeichnet ausschließlich die separate Vorschau auf Port 5222. Dort verwendet Mara bisher durchgehend die alten Arm-/Handproportionen – auch die neue Basis-Idle ist dort noch nicht übernommen.

| ID / Bewegung | Status, Rig und Grafik | Vorhandene Dateien und Vorschau | Bekannte Grenzen / fehlende Arbeiten | Vorgesehener Einsatz |
| --- | --- | --- | --- | --- |
| **M01 – Basis-Idle**, 5 s, Atmung/Blinzeln | **freigegeben**, M2-P; Nutzer: „ja sieht viel besser aus so“ | `MP/unity/Assets/Clips/IdleOrganic.anim`; finale Szene unter `ProportionsNative/`; 151 PNGs `MP/export/after/`, WebP/Manifest unter `MP/preview/`. [Aktueller Vergleich](http://127.0.0.1:5223/idle-rig/preview/) | Keine aktuell beanstandete Arm-/Handform. Neue Hochkantprüfung und Produktionsableitung fehlen. Alte Proportionen bleiben unter `MP/export/before/` erhalten. Übergänge zu den noch alten Reaktionsproportionen nicht mischen. | Grundanimation ab Herz 0. Alte Fassung bereits im Testpaket. |
| **M02 – Kopfreaktion**, 2 s | **Nachbesserung**, M2; organischerer Ablauf vom Nutzer akzeptiert | `M/unity/Assets/Clips/HeadReactionOrganic.anim`, Szene `HeadOrganicComparison.unity`; 61 PNGs `M/unity/Export/HeadComparison/HeadReactionOrganic/`; WebP/GIF unter `M/head-comparison/`. [Vergleich, rechts neu](http://127.0.0.1:5220/head-comparison/index.html) | **Neue Arm-/Handproportionen fehlen.** Nach Übertragung Schulter-/Armfolge, Haare und Ruheanschluss zu M01 prüfen. | Sprechen und Haare ab Herz 0; im Testpaket. |
| **M03 – Berührungsreaktion**, 2,8 s | **Nachbesserung**, M2; organischer Bewegungsstand als brauchbare Grundlage akzeptiert | `M/unity/Assets/Clips/TouchReactionOrganic.anim`, Szene `BodyOrganicComparison.unity`; 85 PNGs `M/unity/Export/BodyComparison/TouchReactionOrganic/`; WebP/GIF unter `M/body-comparison/`. [Vergleich, „Berührung“ wählen](http://127.0.0.1:5220/body-comparison/index.html) | **Neue Arm-/Handproportionen fehlen.** Größere Hand und kräftigerer Unterarm müssen gerade während der Bewegung am Gürtel und am Handgelenk geprüft werden. Keine eigene Fingerartikulation. | Hand/Schulter und zunächst Geschenk ab Herz 0; im Testpaket. |
| **M04 – Blickkontakt / zweite Idle**, 3,8 s | **Nachbesserung**, M2; Zusatzgeste vorhanden, abschließende Einzelabnahme nicht eindeutig dokumentiert | `M/unity/Assets/Clips/IdleBlickkontakt.anim`, Szene `GestureStudy.unity`; 115 PNGs `M/unity/Export/GestureStudy/IdleBlickkontakt/`; WebP/GIF unter `M/gesture-study/`. [Vorschau, „Blickkontakt“](http://127.0.0.1:5220/gesture-study/index.html) | **Neue Arm-/Handproportionen fehlen.** Anschließend vollständigen Clip visuell abnehmen und Ruheanschluss prüfen. | Gelegentlich zwischen normalen Idles, Vorschlag ab Herz 2; im Testpaket. |
| **M05 – Kichern**, 5,4 s | **Nachbesserung**, M2-F; Nutzer wollte diese Geste bei der Vorbeugekorrektur ausdrücklich behalten | `M/unity/Assets/PhysicsGestures/GiggleBody.anim` und `GigglePhysics.anim`, Szene `PhysicsGestures.unity`; 163 PNGs `M/unity/Export/PhysicsGestures/GigglePhysics/`; WebP/GIF unter `M/physics-gestures/`. [Kichern](http://127.0.0.1:5220/physics-gestures/index.html?clip=giggle) | **Neue Arm-/Handproportionen fehlen.** Eigene Torso-/Federgewichte erhalten; drei Körperimpulse und alle Gelenkanschlüsse erneut ansehen. Stumm, keine neue Audioaufnahme. | Scherzen/vertraute Gesprächsantwort ab Herz 2; im Testpaket. |
| **M06 – Freudiges Aufrichten und Abfedern**, 4,2 s | **Nachbesserung**, M2-F; Physikprobe vom Nutzer positiv bestätigt | `M/unity/Assets/ChestPhysics/SpringPoseWithPhysicsTuned.anim`, Szene `ChestPhysicsTuned.unity`; 127 PNGs im gleichnamigen Unterordner von `M/unity/Export/ChestPhysics/`; WebP/Vergleichs-GIF unter `M/chest-physics/`. [Mit/ohne Physik, rechts mit](http://127.0.0.1:5220/chest-physics/index.html) | **Neue Arm-/Handproportionen fehlen.** Gewichtung und Nachbewegung beim Übertragen erhalten. Für den ersten kleinen Umfang optional. | Freudige Geschenkantwort ab Herz 2; bereits im Testpaket. |
| **M07 – Necken mit Körperbewegung**, 3,4 s | **Nachbesserung**, M2; Nutzer: etwas besser, aber kein großer Unterschied | `M/unity/Assets/Clips/ReactionNeckenBody.anim`, Szene `NeckenBodyStudy.unity`; 103 PNGs `M/unity/Export/NeckenBody/ReactionNeckenBody/`; WebP/Vergleichs-GIF unter `M/necken-body/`. [Aktueller Vergleich, rechts](http://127.0.0.1:5220/necken-body/index.html) | **Neue Arm-/Handproportionen fehlen.** Abschließende Freigabe nicht belegt; Handgeste bleibt begrenzt. Keine separate Brustfeder in diesem Clip, Brust folgt dem Brustkorb. | Reserve für vertrauteres Necken, frühestens Herz 2; nicht im Testpaket, nicht für das erste Paket nötig. |
| **M08 – Hand an die Hüfte**, 5 s | **Nachbesserung**, M2-F; Nutzer wollte diese Geste erhalten | `M/unity/Assets/PhysicsGestures/HandOnHipBody.anim` und `HandOnHipPhysics.anim`, Szene `PhysicsGestures.unity`; 151 PNGs `M/unity/Export/PhysicsGestures/HandOnHipPhysics/`; WebP/GIF unter `M/physics-gestures/`. [Hüftgeste](http://127.0.0.1:5220/physics-gestures/index.html?clip=hip) | **Neue Arm-/Handproportionen fehlen.** Vorhandene Fingerzeichnung; anliegende Hand, kein ausgearbeitetes Greifen. Mit größerer Hand Hüftkontakt, Gürtelüberdeckung und Ellbogen erneut abnehmen. | Reserve für selbstbewusste Gesprächsreaktion ab Herz 2; nicht im Testpaket, nicht für das erste Paket nötig. |

### Mara: Was die Arm-/Handkorrektur konkret betrifft

| Priorität | Clips | Arbeit |
| --- | --- | --- |
| Erledigt | **M01 Basis-Idle** | Neue Proportionen ins separate Rig übertragen, neu exportiert, visuell freigegeben. |
| Zuerst | **M02 Kopf, M03 Berührung** | Dieselbe Mesh-Abbildung auf passende Rig-Kopien übertragen, bestehende Bewegung erhalten, Zwischenzustände und gemeinsamen Ruheanschluss prüfen. |
| Danach für das Kernpaket | **M04 Blickkontakt, M05 Kichern** | Gleiche Proportionen; bei Kichern zusätzlich spezifische Federgewichte erhalten. |
| Später bei Bedarf | **M06 Freude, M07 Necken, M08 Hüfte** | Nur bei Auswahl für die Integration anpassen. Kein Anlass, alle drei vorsorglich umzubauen. |

Die Kopie unter `MP/unity/Assets/Clips/` enthält auch andere Animationsdateien. **Ihre bloße Anwesenheit bedeutet nicht, dass diese Clips schon mit den neuen Proportionen exportiert oder geprüft sind.** Bisher existiert dort nur der neue Idle-Export.

## 3. Ilyra – brauchbare Bewegungen

Alle sieben folgenden Bewegungen sind **noch nicht im Hauptspiel**. Für I01–I06 ist der gemeinsame Export **I-N/T** die passende Vergleichsbasis; er vermeidet das Mischen älterer Finger-/Torsogewichte. Die separaten ursprünglichen Vorschauen bleiben als Quellen erhalten.

| ID / Bewegung | Status, Rig und Grafik | Vorhandene Dateien und Vorschau | Bekannte Grenzen / fehlende Arbeiten | Vorgesehener Einsatz |
| --- | --- | --- | --- | --- |
| **I01 – Basis-Idle**, 6 s, Atmung/Blinzeln | **freigegeben** bezüglich Bewegung und korrigierter Arm-/Handproportionen; I-N. Der spätere gemeinsame Export I-N/T braucht noch Paketabnahme. | `I/head-reaction-v1/unity/Assets/IlyraForearmsHands.unity`, Clip `Assets/Clips/IlyraIdle.anim`; 182 PNGs `I/forearm-hands-v2/preview/idle/frames/`. Gemeinsamer Export: 182 PNGs `T/unity-export/idle/frames/`. [Testpaket Ilyra](http://127.0.0.1:5222/?hero=ilyra&hearts=0) / [Proportionsvergleich, „Idle“ wählen](http://127.0.0.1:5221/forearm-hands-v2/preview/index.html) | Kein neuer Anatomiefehler für diese ruhige Bewegung belegt. Nicht mit früheren langen Armen oder anderen Fingergewichten mischen. Produktionsbudget und Paketabnahme fehlen. | Grundanimation ab Herz 0; im Testpaket. |
| **I02 – Kopfreaktion**, 2,8 s | **Experiment**, I-N bzw. I-N/T; Proportionen im Vergleich akzeptiert, keine eindeutig separate finale Freigabe des Gesamtclips | `I/head-reaction-v1/unity/Assets/Clips/IlyraHeadReaction.anim` plus `IlyraHeadBody.anim`; 86 PNGs `I/forearm-hands-v2/preview/head/frames/`, ebenso 86 im gemeinsamen Export `T/unity-export/head/frames/`. [Einzelvergleich](http://127.0.0.1:5221/forearm-hands-v2/preview/index.html) | Dezente Brustnachbewegung, keine neue Mundzeichnung. Gemeinsame Fassung mit I01 abnehmen; kein neues Rig erforderlich. | Sprechen und Haare ab Herz 0; im Testpaket. |
| **I03 – Berührungsreaktion**, 3,2 s | **Nachbesserung**, I-N mit korrigierten Fingergewichten bzw. I-N/T | `I/head-reaction-v1/unity/Assets/IlyraTouchReaction.prefab`; Clips `Assets/Clips/IlyraTouchBody.anim`, `IlyraTouchReaction.anim`; je 98 PNGs unter `I/touch-v1/preview/frames/` und `T/unity-export/touch/frames/`; WebP/GIF vorhanden. [Einzelvorschau](http://127.0.0.1:5221/touch-v1/preview/index.html) | Nutzer nahm die Reaktion im Testpaket kaum wahr. Die Startverzögerung wurde separat korrigiert; die tatsächliche Hand-/Körperbewegung ist weiterhin klein. Zuerst mit der korrigierten Bedienung beurteilen, dann nur falls nötig etwas deutlicher machen – ohne starke neue Ellbogenbeuge. | Hand/Schulter und zunächst Geschenk ab Herz 0; im Testpaket. |
| **I04 – Gewichtswechsel / zweite Idle**, 4,8 s | **Experiment**, I-N mit Touch-Gewichten bzw. I-N/T | `I/head-reaction-v1/unity/Assets/IlyraIdleVariant.unity`; Clips `Assets/Clips/IlyraIdleVariantBody.anim`, `IlyraIdleVariant.anim`; je 146 PNGs unter `I/idle-v2/preview/frames/` und `T/unity-export/variant/frames/`; WebP/GIF vorhanden. [Einzelvorschau](http://127.0.0.1:5221/idle-v2/preview/index.html) | Keine zusätzliche neue Grafik erforderlich. Kleiner Hüft-/Oberschenkelwechsel und Blickkontakt, geringe Federbewegung. Abschließende Einzel-/Paketfreigabe fehlt. | Gelegentlich zwischen normalen Idles, Vorschlag ab Herz 2; im Testpaket. |
| **I05 – Kichern**, 4 s | **Experiment**, I-N mit `TorsoHip0` bzw. I-N/T | `I/hip-v1/unity/Assets/IlyraGiggle.unity` und `.prefab`; Clips `Assets/Clips/IlyraGiggleBody.anim`, `IlyraGiggle.anim`; je 122 PNGs unter `I/giggle-v1/preview/frames/` und `T/unity-export/giggle/frames/`; WebP/GIF vorhanden. [Einzelvorschau](http://127.0.0.1:5221/giggle-v1/preview/index.html) | Keine starke Armbeuge; nutzt akzeptierte Proportionen. Vorhandenes geschlossenes Lächeln und Lider, kein neuer Lachmund, kein Audio. Abschließende visuelle Freigabe fehlt. | Scherzen/vertraute Gesprächsantwort ab Herz 2; im Testpaket. |
| **I06 – Mini-Hüpfer mit Nachbewegung V3**, 3,2 s | **Experiment**, I-N bzw. I-N/T; neueste gewünschte Stärke, keine ausdrückliche finale visuelle Freigabe aus dem Sicherungsauftrag ableiten | `I/hip-v1/unity/Assets/IlyraMiniHopV3.unity` und `.prefab`; Clips `Assets/Clips/IlyraMiniHopV3Body.anim`, `IlyraMiniHopV3.anim`; je 98 PNGs unter `I/mini-hop-v3/preview/frames/` und `T/unity-export/joy/frames/`; WebP/GIF vorhanden. [Aktuelle Einzelvorschau](http://127.0.0.1:5221/mini-hop-v3/preview/index.html) | Arme bleiben fast in Ruhe; Ausschnitt endet an Oberschenkeln, keine sichtbaren Knie/Füße. Starke Federwirkung bewusst vom Nutzer angefragt; Intensität für normale Geschenkreaktionen noch abnehmen. | Optional seltene Freude-/Geschenkreaktion ab Herz 2; im Testpaket, für das kleine Kernpaket nicht erforderlich. |
| **I07 – Hüft-Idle mit Blinzeln und korrigierter Hand**, 6 s | **freigegeben**, I-H; Nutzer: „ja sieht gut aus“ nach gezielter Handkorrektur | Finale Szene/Prefab `I/hip-v1/unity/Assets/HipHandSizeV2/IlyraHandOnHipHandSize`; Bewegung aus `Assets/HipBaseBlink/IlyraHandOnHipBlink.anim`; 182 PNGs `I/hip-base-v2/hip-hand-v2/preview/frames/`, 23 WebP-Atlanten. [Aktueller Handvergleich](http://127.0.0.1:5221/hip-base-v2/hip-hand-v2/preview/index.html) | Innerhalb dieser Pose brauchbar. **Kein freigegebener nahtloser Wechsel aus der normalen Ruhepose.** Eigene Grafikdetails und Handkontaktbindung; Hand kann nicht beliebig gelöst werden. Die letzte Korrektur wurde auf Nutzerwunsch ohne neues GIF geliefert. | Spätere separate Gesprächshaltung, z. B. ab Herz 2/3. Nicht im Testpaket und zunächst nicht im Kernpaket. |

## 4. Bereits vorhandene Spielanimationen

Diese kleine Tabelle dokumentiert den funktionierenden bisherigen Spielbestand und die Rückfallmöglichkeit. Sie ist keine Empfehlung, die alten Vier-Bilder-Idles als neues Qualitätsziel zu verwenden. Die Quellen wurden mit `main` verglichen: Tavernenrenderer, Inhalte, relevante Metadaten und Runtime-Assets sind im geprüften Bereich gleich. Lokaler `main` und zuletzt bekannter `origin/main`: `d61c56b`; kein Remote-Refresh oder Veröffentlichungsabgleich in diesem Inventarauftrag.

Alle folgenden Animationen sind **integriert**, ohne Unity-Rig, auf Basis der ursprünglichen gezeichneten Pixelart-Atlanten. Gemeinsame Steuerung: [src/tavern-animation.ts](src/tavern-animation.ts). Vorschauen: [Mara](http://127.0.0.1:5218/tavern-check.html?hero=mara) / [Ilyra](http://127.0.0.1:5218/tavern-check.html?hero=ilyra), derzeit mit gestopptem Server auf Port 5218.

| Charakter / Bewegung | Tatsächliche Grafik- und Metadatendateien unter G | Dauer / Verwendung | Einschränkung und Übergang zum neuen Paket |
| --- | --- | --- | --- |
| Mara – Idle | `assets/runtime/mara-idle.webp`; `assets/mara-tavern/mara-atlas.json` → `idle`; PNG-Quelle `assets/mara-tavern/mara-atlas.png` | 4,64 s, vier verschiedene Zeichnungen; ab Herz 0 | Ruckelige Atem-/Blinkwechsel waren Ausgangspunkt des neuen Rigs. Später bewusst durch M01 ersetzen; bis dahin erhalten. |
| Mara – Schulter | `assets/runtime/mara-shoulder.webp`; dieselbe JSON → `touch` | 1,94 s; Berührung und persönliche Momente | Gezeichnete Einzelbilder mit altem Figurendesign. Bei Umstellung Rollenabbildung zu M03 prüfen, keinen sichtbaren Grafikwechsel mitten in einer Reaktion. |
| Mara – Hand | `assets/runtime/mara-reactions.webp`; `assets/tavern-ui/mara-reactions.json` → `hand`; PNG im selben Quellordner | 1,97 s; Berührung und persönliche Momente | Bestehende eigene Geste. M03 wäre ein gemeinsamer Ersatz für Hand/Schulter, keine neue separate Handgeste. |
| Mara – Haare | dieselben Reaktionsdateien → `hair` | 1,97 s; Berührung und persönliche Momente | Bisher konkrete Haargeste. M02 bietet zunächst eine passende Kopfreaktion, kein neues Strähne-hinter-das-Ohr-Zeichnen. |
| Ilyra – Idle | `assets/runtime/ilyra-idle.webp`; `assets/ilyra-tavern/ilyra-atlas.json` → `idle`; PNG-Quelle `assets/ilyra-tavern/ilyra-atlas.png` | 4,63 s, vier verschiedene Zeichnungen; ab Herz 0 | Ruckelige Wechsel, schwach lesbare Nase/Mund. Alter Renderer zeichnet außerdem den abgestellten Speer separat; neue Ilyra ist bewusst ohne Speer. |
| Ilyra – Schulter | `assets/runtime/ilyra-shoulder.webp`; dieselbe JSON → `touch` | 2,27 s; Berührung und persönliche Momente | Alter Grafik-/Gesichtsstand. Später I03 zuordnen und Speer-/Ankerbehandlung der alten Darstellung ausdrücklich entfernen bzw. passend ersetzen. |
| Ilyra – Hand | `assets/runtime/ilyra-reactions.webp`; `assets/ilyra-tavern/ilyra-reactions.json` → `hand`; PNG im selben Quellordner | 1,51 s; Berührung und persönliche Momente | Bisher eigene Handgeste; I03 ist zunächst eine gemeinsame Hand-/Schulterantwort. |
| Ilyra – Haare | dieselben Reaktionsdateien → `hair` | 1,83 s; Berührung und persönliche Momente | Bisher eigene Haargeste; I02 wäre zunächst die Kopfreaktion als Antwort. Alte und neue Grafik nicht unkontrolliert mischen. |

Hand, Haare und Schulter sind im aktuellen Code bereits ab Herz 0 zugänglich. Die fünf persönlichen Herzmomente je Figur verwenden diese vorhandenen Reaktionen erneut; es existieren dafür keine zusätzlichen fünf eigenständigen Animationsclips. Kampf-, Lauf- und Zauberanimationen gehören nicht zu diesem Taverneninventar und bleiben unberührt.

## 5. Was das separate Herz-2-Paket tatsächlich enthält

[Browser: Mara](http://127.0.0.1:5222/?hero=mara&hearts=2) · [Browser: Ilyra](http://127.0.0.1:5222/?hero=ilyra&hearts=2) · [Quellen/Bedienung](../../artifacts/idle-bastion/tavern-hearts-0-2/README.md)

| Rolle | Mara | Ilyra |
| --- | --- | --- |
| `idle` | M01 als **alte** Proportionsfassung | I01, gemeinsames Rig |
| `head` | M02, alte Proportionen | I02, gemeinsames Rig |
| `touch` | M03, alte Proportionen | I03, gemeinsames Rig |
| `variant` | M04, alte Proportionen | I04, gemeinsames Rig |
| `joy` | M06, alte Proportionen | I06 V3, gemeinsames Rig |
| `giggle` | M05, alte Proportionen | I05, gemeinsames Rig |

Dateien: `T/manifest.json`, `assets/{mara,ilyra}/{idle,head,touch,variant,joy,giggle}/`, `app.js`, `playback.js`, `content.json`. Ilyras gemeinsame PNGs liegen unter `T/unity-export/{Rolle}/frames/`. Die `source`-Einträge im Manifest nennen die historischen Clipvorlagen; `pack.py` verwendet für Ilyra tatsächlich die neu vereinheitlichten PNGs, sobald vorhanden. Diese Dateien sind lokal vorhanden.

Das Testpaket ist **Experiment**, keine Spielintegration und keine abschließende Gesamtfreigabe. Es hat keinen Spielstandzugriff und vergibt keine Punkte/Geschenke. Die erste verzögerte Bedienfassung wurde bereits separat verbessert: kurzer Rücklauf zur Ruhe statt Warten auf den ganzen Idle-Loop, eine ersetzbare Folgeaktion statt blockierter weiterer Eingaben. Die alte Bedienquelle ist erhalten. Ob Ilyras kleine Berührungsreaktion ausreichend sichtbar ist, bleibt zusätzlich zur Bedienung zu beurteilen.

**Größe:** 1.416 abgespielte Frames, 480 × 800, 30 fps, insgesamt **313.985.412 Byte** für zwölf Atlasreihen. Die Packung ist verlustfrei nach einmaliger Auflösungsanpassung; die Verkleinerung selbst ist keine verlustfreie Operation. Bedarfsgesteuertes Laden und begrenzter Cache sind vorhanden. Diese rund 314 MB sind kein fertiges Auslieferungsbudget und sollen nicht unverändert komplett ins Spiel übernommen werden.

## 6. Kleines Zielpaket bis Herz 2

Die folgende Zuordnung ist ein **Vorschlag**, keine Änderung der bestehenden Zuneigungsregeln oder Inhalte. Neue Animationen müssen dafür zunächst nicht produziert werden.

| Benötigte Rolle | Mara | Ilyra | Auslöser / Herzstufe | Was noch fehlt |
| --- | --- | --- | --- | --- |
| **Basis-Idle** | M01, neue Proportionen | I01, gemeinsamer Export | Ab 0, normale Ruhe | Mara ins separate Paket übernehmen; Darstellungsmaßstab und Laufzeitbudget festlegen. |
| **Kopfreaktion** | M02 | I02 | Ab 0, Sprechen/Haare | Mara-Proportionen; beide mit direkter Bedienung und Idle-Anschluss abnehmen. |
| **Berührungsreaktion** | M03 | I03 | Ab 0, Hand/Schulter; zunächst auch Geschenk | Mara-Proportionen; bei Ilyra Sichtbarkeit nach Bedienkorrektur beurteilen und gegebenenfalls gezielt nachbessern. |
| **Gelegentliche zweite Idle** | M04 Blickkontakt | I04 Gewichtswechsel | Ab 2, zwischen mehreren normalen Loops | Mara-Proportionen; Einzelabnahme und ruhiger Wechsel. Keine ständige Wiederholung. |
| **Vertrautes Kichern** | M05 | I05 | Ab 2, Scherzen/passende Gesprächsantwort | Mara-Proportionen samt Physik; beide vollständig visuell abnehmen. Audio ist keine Voraussetzung. |
| **Erste zwei persönliche Momente** | Vorhandene Texte + Kopf/Berührung | Vorhandene Texte + Kopf/Berührung | Herz 1 und 2 | Rollen zuordnen; es werden dafür keine neuen Animationsclips benötigt. |
| Optional später: besondere Geschenkfreude | M06 | I06 | Ab 2, selten | Zusätzlicher Umfang und Datenmenge; erst nach Kernpaket. |
| Optional später: besondere Gesprächshaltung | M07/M08 | I07 | Frühestens 2, genaue Stufe offen | Separat auswählen. I07 braucht für einen nahtlosen Posewechsel erst eine akzeptierte Übergangslösung. |

Damit sind **zehn Clips für das erste Kernpaket** vorgesehen. Die zwei Freude-Clips aus der jetzigen Zwölf-Clip-Probe sind optional. Neue Kussgesten, Hände-hinter-dem-Rücken-Posen oder weitere Ansichten sind für diesen Schritt nicht erforderlich und werden nicht automatisch produziert.

### Realistischer Integrationsplan – erst nach Freigabe

1. **Mara zuerst angleichen:** Nur M02/M03 an die freigegebene M01-Grundform anpassen und gemeinsam zeigen. Danach M04/M05. Die übrigen drei Mara-Kandidaten bleiben vorerst unverändert.
2. **Kernpaket separat abnehmen:** I01–I05 auf dem bereits vereinheitlichten Rig verwenden. I03 mit der korrigierten Bedienung beurteilen. Gesichter, Handgelenke, Ellbogen, Schulter-/Gürtelüberdeckung, Physik und mehrere Zwischenzustände prüfen; Desktop und Hochkant. Keine breite Rig-Neuentwicklung.
3. **Produktionsableitung festlegen:** Einheitlicher Körperanker je Figur, gemeinsame Ruhepose, transparenter PNG-Master, angemessene Zielauflösung, verlustfreie Atlaspackung. Größe pro Clip messen; Frames nur nach visueller Prüfung reduzieren. Start lädt nur ausgewählte Figur/Idle, Reaktionen gezielt nachladen. Keine Unity-Laufzeit im Browser.
4. **Spielintegration separat beauftragen:** Die ausgewählten Rollen an die bestehenden Aktionen anschließen; alte Assets erhalten. Freischaltungen, Punkte, Geschenke, Kämpfe und Speicherkennungen unverändert lassen. Bestehende Herzmomente 3–5 bleiben zugänglich und erhalten passende Kopf-/Berührungsantworten; sie dürfen durch den Ausbau bis Herz 2 nicht verschwinden. Speer, Figurenanker und Porträts passend zur neuen Darstellung behandeln.
5. **Kompakt prüfen, dann Entscheidung:** Folgeeingaben, Erstladen, Rückkehr zur Idle, Tabwechsel, vorhandene Spielstände und Herzmomente prüfen. Danach visuelle Nutzerfreigabe; Commit/Push/Merge nur mit dem entsprechenden Auftrag. Dieses Inventar erteilt dafür keine Freigabe.

## 7. Prüfstand und Vorschauen

Für dieses Inventar wurden die tatsächlichen lokalen Dateien gelesen: Spielrenderer/Metadaten, Unity-Szenen und Builder, Clips, Grafik-/Importdateien, Exportordner, Manifeste, Prüfberichte und spätere Nutzerfreigaben. PNG-Sequenzen wurden gezählt und **955 Atlasreferenzen** aus den untersuchten Manifesten auf vorhandene Dateien geprüft; keine davon fehlte. Das zählt Referenzen einschließlich Wiederverwendung, nicht 955 einzigartige Atlanten. Es fand keine neue Unity-Ausgabe, keine Grafikänderung und keine vollständige neue Sichtprüfung jedes Clips statt. Frühere technische Prüfzahlen werden nicht als neue Tests ausgegeben.

- **Port 5221, Ilyra:** geprüfte HTML-Vorschauen erreichbar (HTTP 200).
- **Port 5222, gemeinsames Testpaket:** erreichbar (HTTP 200).
- **Port 5223, Mara-Proportionen/Idle:** erreichbar (HTTP 200).
- **Port 5218, ursprüngliche Spiel-/Studienvorschauen:** Server beim Inventarcheck nicht erreichbar; Quelldateien vorhanden.
- **Port 5220, Mara-Einzelvorschauen:** Server beim Inventarcheck nicht erreichbar; HTML, Manifeste, PNGs und Atlasdateien vorhanden. Die entsprechenden Links sind nach Start des vorhandenen Servers nutzbar. HTTP-Erreichbarkeit allein ist keine visuelle Abnahme.

Bei Bedarf können die vorhandenen Vorschauen aus dem Repository-Wurzelordner gestartet werden; **in diesem Inventarauftrag wurden keine Server gestartet**:

```powershell
# Mara-Einzelvorschauen, Port 5220
python -m http.server 5220 --bind 127.0.0.1 --directory artifacts/idle-bastion/mara-rig-v2

# Ursprüngliche Spiel-/Review-Seiten, Port 5218
npm run idle:dev -- --host 127.0.0.1 --port 5218
```

Wichtige technische Grenzen für die spätere Auswahl: gemeinsame neutrale Posen sind vorhanden, freie Übergänge aus beliebigen Bewegungsphasen dagegen nicht universell gelöst; ein faltungsfreies Mesh beweist keine korrekte Anatomie. Die neue Mara-Idle ist visuell freigegeben, aber ihr Hochkantvergleich wurde noch nicht neu durchgeführt. Die akzeptierte Ilyra-Hüftpose bleibt eine separate Grundhaltung. Diese Grenzen begründen die kleine Auswahl oben.

**Änderungsumfang dieses Auftrags:** ausschließlich dieses Inventar und ein Verweis in der zentralen Roadmap. Keine Animation, Grafik, Rig-Datei, Vorschau, Spielregel oder Spielstand geändert; keine Dateien verworfen, kein Commit/Push und kein Merge nach `main`.

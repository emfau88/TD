# Drei Creeps – animierte Größen- und Stilvorschau

Die Vorschau wurde anschließend vom Nutzer freigegeben. Der gesondert beauftragte
Spieleinbau ist unter [Prüfbericht](../../artifacts/creep-trio-2026-11-06/REPORT.md)
dokumentiert; diese Vorschauseite bleibt eigenständig und greift auf keine Saves zu.

Lokale Bewegungsprobe vom 06.11.2026 nach positiver Nutzerbewertung der drei
Standbilder. Keine Spielintegration, Kampfwerte, Wellenänderungen, Freischaltungen
oder Speicherzugriffe. Die Animation selbst wartet auf die Nutzerbewertung.

Start: `node prototypes/creep-trio-v1/serve.mjs`, dann http://127.0.0.1:5213/?v=2.
Standard: kleine Animationen von vorn. „Auf dem Weg“ zeigt seitliche Bewegung;
„4×-Ansicht“ vergrößert dieselben Bilder. Pause und halbes Tempo sind optional.
Bei reduzierter Bewegung startet die Vorschau pausiert, manuell abspielbar.

| Motiv | Bewegungsbilder | Ungefährer sichtbarer Umfang bei Kamera 1×, Frontansicht |
| --- | --- | --- |
| Kobaltschleim | 6 neue ImageGen-Posen, Stauchen/Dehnen und kleine Sprunghöhe | 25–32 × 17–25 px |
| Flammengeist | 8 originale Frakassets-Idle-Bilder, Flackern/Schweben | 22–23 × 19–22 px |
| Schwebendes Auge | 8 originale Frakassets-Idle-Bilder, Körper/Tentakel | 16–17 × 22–26 px |
| Blattkäfer | Original-Standpose als Größenreferenz | 35 × 16 px |

0,83 Sprite-Skalierung, 40er Wegkacheln. Gerätezoom und Spielkamera können die
Bildschirmgröße verändern; die Browservorschau verwendet CSS-Pixel. Die GIF-
Darstellung im Chat kann zusätzlich skaliert werden.

Flammengeist/Auge zeigen in der Wegansicht ihre Original-East-Bilder, ebenfalls
je acht Frames. Eine eigene Walk-Sequenz enthält das Paket nicht; seine Idle-
Animation eignet sich zum Schweben. Das demonstrative Tempo von 30 Pixeln/s ist
kein Balancevorschlag. Die Pupille des Auges ist von der Seite deutlich weniger
lesbar als von vorn. Der Schleim hat erst diese eine Blickrichtung. Kampf-/Treffer-
animationen, Kurven und Verhalten mit mehreren Gegnern sind nicht Teil der Probe.

`prepare.mjs` erhält den statischen Export. `prepare-animation.mjs` exportiert
die Animationsatlanten reproduzierbar aus den unveränderten Quellen. Keine
neuen Posen per Canvas/Code gezeichnet; der Renderer spielt die Bildfolgen ab.
[ImageGen-Prompt, Quellen und Exportverfahren](PROMPTS.md).
Flammengeist/Auge: Frakassets, [Originalquelle](https://frakassets.itch.io/free-monster-pack),
[CC BY 4.0](sources/LICENSE-Frakassets.txt). Vorhandene Wege, Käfer und Schrift
behalten ihre [Lizenzhinweise](../../experiments/idle-bastion/docs/SOURCES_AND_LICENSES.txt).

`node prototypes/creep-trio-v1/check.mjs`: fünf Browserfälle, Desktop 1032×660,
Touch 844×390 und 390×844, zusätzlich DPR 3 und reduzierte Bewegung. Alle
6/8/8 Frontbilder tatsächlich beobachtet, Wegbewegung, eingefrorene Pixel bei
Pause, Fortsetzen, halbes Tempo, Detailansicht und Rotation geprüft. Kein
horizontaler Überlauf, keine HTTP-/Browserfehler, kein LocalStorage/IndexedDB.
Das ist Browseremulation, keine physische Handyabnahme oder Gameplayprüfung.
[Messdaten](checks/animation/results.json), [Detailansicht](checks/animation/detail.png),
[GIF](checks/animation/creep-trio.gif), [Video](checks/animation/creep-trio.webm).

# Drei zusätzliche Foozle-Gegner

Beschafft am 22./23.10.2026 von den offiziellen kostenlosen itch.io-Downloads:

| SPIRE | Originalpaket | Quelle | Originalarchiv |
| --- | --- | --- | --- |
| Waldgoblin | Lucifer Goblin Berserker 1.0 | https://foozlecc.itch.io/lucifer-goblin-berserker-enemy | `sources/goblin.zip` |
| Knochenwächter | Lucifer Skeleton Grunt 1.0 | https://foozlecc.itch.io/lucifer-skeleton-grunt-enemy | `sources/skeleton.zip` |
| Waldkultist | Lucifer Cultist 1.0 | https://foozlecc.itch.io/lucifer-cultist-enemy | `sources/cultist.zip` |

Alle drei tatsächlich heruntergeladenen Original-Readmes nennen **Creative Commons Zero / CC0**, freie Bearbeitung und kommerzielle Nutzung. Die Readmes liegen unverändert als `*-LICENSE.txt` bei; die ZIPs bewahren PNGs und Aseprite-Quellen. Urheberangabe der ursprünglichen Readmes: Baldur; aktueller Anbieter führt denselben Zeichner als David / chroma_dave. Vertrieb: Foozle. CC0 erlaubt auch die Weitergabe im öffentlichen Quellrepository: https://creativecommons.org/publicdomain/zero/1.0/. Es gibt keine zusätzliche Weiterverbreitungssperre in diesen Readmes.

## Reproduzierbarer Import

`python experiments/idle-bastion/scripts/pack-lucifer.py`

Der Packer liest ausschließlich die Original-ZIPs. Die 48×48-PNG-Frames werden **pixelgleich** bei `(8,0)` in transparente 64×64-Zellen gepackt. Keine Skalierung der Quelldatei, Farbänderung, Alpha-Filterung, neue Zeichnung oder Interpolation. Die Bewegungszeiten stammen aus den jeweils zugehörigen Aseprite-Dateien. Unten, oben, rechts und links sind tatsächliche Originalansichten; Waffen und Hände werden nicht gespiegelt.

Waldgoblin und Knochenwächter benötigen jeweils 24 Laufbilder, der Kultist 32 Laufbilder plus 16 ausgewählte Aktionsbilder für die vorhandene 0,4-s-Heilaktion. Diese stammen aus den ersten vier Bildern der originalen Attack01-Sequenzen. Es entsteht keine neue Angriffsmechanik. Keine zusätzlichen Todesanimationen oder Sprungeffekte im Spiel.

`animations.json`/`src/lucifer-frames.ts` enthalten die eindeutigen Clip-Maps; `provenance.json` dokumentiert Originaldateien, ausgewählte Frames und SHA-256 der Archive. Im Spiel: Maßstab 0,83, Ursprung der Zelle in der Mitte; sichtbare Füße ungefähr bei y=41, somit etwa 7,5 Weltpixel unter der Wegposition, passend zum getrennten Bodenschatten bei +9. Keine unabhängige Verschiebung einzelner Posen.

Die drei Laufzeit-PNGs benötigen zusammen **22.477 Bytes** (7.235 / 7.060 / 8.182). ZIPs, Lizenzen und Quelldaten werden vom Vite-Spielbuild nicht als zusätzliche Browserdownloads eingebunden.

Vor Integration der weiteren Figuren wurde der Goblin neben Blattkäfer und Skorpion verglichen. Anschließend alle Ansichten, echte Kurven und Heilpose in der separaten `enemy-check.html` sowie im tatsächlichen Kampf prüfen. Technische Prüfung und eigene Sichtprüfung sind keine visuelle Nutzerfreigabe.

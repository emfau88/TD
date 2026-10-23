# E01 · Lokale Gegnerpakete auswerten und integrieren

Stand 23.10.2026 · eigener Branch `codex/local-enemy-assets`, Ausgangspunkt
`codex/wave-rework` / `796f02e`. `main`, der Wave-Rework-Branch und Draft-PR #1
bleiben unverändert. Keine neuen Downloads, KI-Grafiken oder Originalarchive im Git.

## Ergebnis

Vier neue Arten erweitern den Kader von zwölf auf **sechzehn normale Gegner**.
Die zwei Waldkreaturen, ein Flieger und ein ungewöhnlicher Panzer stammen aus dem
lokalen Frakassets-Paket. Die ersten **40 Wellen bleiben vollständig gleich**:
Zusammensetzung, Mengen, Spawnzeiten, HP und Kill-/Abschlussbelohnungen. Neue Arten
beginnen nach dem bisherigen Zwischenziel, ohne den abgestimmten Einstieg zu füllen.

[Bewegter gemeinsamer Vergleich](http://127.0.0.1:5196/enemy-lab.html): SPIRE-Bestand,
fünf Shroom-Men-Figuren und alle zehn Frakassets-Kandidaten. Richtung, Animation,
Auflösung, Kontur, Original-/Spielmaßstab, Pause und Einzelbild sind wählbar.
Die Vorschau greift auf keinen Spielstand zu. Die bisherige `enemy-check.html`
bleibt verfügbar und verlinkt den neuen Vergleich.

## Tatsächlicher lokaler Bestand und Lizenzen

Alle neun ZIPs sind vollständig und CRC-geprüft. Archivnamen, Bytes und SHA-256
stehen in [sources.json](../../../../experiments/idle-bastion/assets/local-monsters/sources.json).
Es wurden ausschließlich die vorhandenen Dateien aus dem Windows-Downloadordner gelesen.

| Paket | Befund / Nutzungsentscheidung |
| --- | --- |
| [Shroom Men · The Game Smith](https://not-a-kappa-games.itch.io/shroom-men) | Kommerzielle Spielnutzung/Bearbeitung erlaubt; eigenständige Weitergabe eingeschränkt. Frei zugängliche Quellsprites im öffentlichen Repository sind nicht ausdrücklich geklärt. Ausschließlich lokale Vergleichsdateien, keine öffentliche Integration. |
| [Free Monster Pack · Frakassets](https://frakassets.itch.io/free-monster-pack) | Tatsächlicher Archiv-Lizenztext und Quellseite bestätigen **CC BY 4.0**. Kommerziell und öffentlich weiterverwendbar mit Namensnennung, Quelle, [Lizenzlink](https://creativecommons.org/licenses/by/4.0/) und Änderungsvermerk. Im Spielmenü erreichbare Credits plus Asset-README enthalten dies. |
| Foozle Skeleton Grunt | Lokales ZIP ist byteidentisch mit `assets/lucifer/sources/skeleton.zip`, SHA-256 `ac0541d55feccb1a44b44ad929e6273e4a0d7fcfe08164910c203c2a7ac29481`. CC0, keine zweite Integration/Kopie. |
| Foozle Legend EnemyPack 1 | Lokales Readme: Foozle / Atari Boy, CC0. Drow mit drei echten Laufrichtungen; Spinne nur ein Walk-Tag ohne verschiedene Blickrichtungen. Reservepaket, keine zusätzlichen Produktionsgrafiken daraus. |

Die rechtliche Zurückhaltung bei Shroom Men betrifft die öffentliche Asset-Weitergabe,
nicht die grundsätzlich erlaubte Spielnutzung. Eine ausdrückliche Erlaubnis des
Urhebers würde eine spätere öffentliche Integration ermöglichen. Die Original-ZIPs,
96 PNGs, Sporen und privaten Vergleichsaufnahmen werden weder committet noch gebaut.
`.local-assets/` ist in Git ignoriert. Der Produktionsbuild wurde zusätzlich anhand
der tatsächlichen Bildbytes auf versehentlich enthaltene Shroom-Dateien geprüft.

## Alle fünf Shroom-Men-Figuren

| Grundfigur | Tatsächliche Paletten | Gut unterscheidbare Vergleichsauswahl |
| --- | ---: | --- |
| Dotcap | 15 | dottedlime (grün), ladybird (rot), dalmatian (hell), chocolatechip (braun) |
| Gillcap | 15 | redherring, bluegill, ghostcarp, firefish |
| Mushman Flat | 22 | greenaroundthegills, redberet, blancslate, blueberryberet |
| Mushman Pointy | 22 | olivemylife (grün), berrybadidea (rosa), mossappeal (hell/grün), creamofthecrop (orange) |
| Skullshroom | 22 | deathcap (orange/rot), decomposting (grün), badtothebone (weiß), deadlynightcap (dunkel) |

**96 eindeutige Farbvarianten**, keine 155: Das Flat-Archiv enthält außerdem
59 byteidentische Dateien anderer Figuren. Diese Duplikate werden erkannt.
Die fünf empfohlenen Palettengruppen stehen jeweils zuerst im Dropdown; alle
anderen Originalfarben sind ebenfalls auswählbar. Helle, rote und grüne Kappen
bleiben auch im kleinen Maßstab unterscheidbar. Ähnliche Braun-/Violetttöne eignen
sich eher als kosmetische Auswahl als zur Kennzeichnung anderer Kampfwerte.

Die PNGs sind 320×768: fünf 64×32-Zellen je Zeile, vier Richtungen je Block.
**Walk, Run, Damaged und Hide enthalten tatsächlich vier sichtbare Bilder**, der
fünfte Bereich ist leer. Attack enthält fünf. Ein zusätzlicher Vierzeilenblock
ist vollständig transparent. Alle 96 Paletten wurden gegen diese Zuordnung geprüft;
blindes Abspielen von fünf Laufbildern hätte periodisches Verschwinden erzeugt.
Die Richtungen werden aus den tatsächlichen Ansichten verwendet, keine erfundenen
Frames. Die privaten Vorschauzeiten sind mangels Timing-Metadaten gewählt
(Walk 120 ms, Run 85 ms), nicht als Originaltimings ausgegeben.

Fünf Figuren teilen fünf Clipsätze, Farbwahl wechselt lediglich die Texturquelle.
Es gibt keine 96 Gegnerdefinitionen. Lokal entspricht Skalierung 1,35 einer kleinen,
lesbaren Waldkreatur; ihre gröberen Pixel bleiben gegenüber Foozle erkennbar.
ShroomShadows wird nicht verwendet. Die 13 Sporeburst-Paletten besitzen vier
64er Effektbilder; ohne passenden bestehenden Kampfzweck bleiben sie unintegriert.

## Frakassets: zehn Kandidaten, Original-JSON statt Rasterraten

| Kreatur | Bewegungsangebot / Einschätzung | Ergebnis |
| --- | --- | --- |
| Pilzmonster | Walk, 8 Bilder je vier Ansichten; klare Kappe und kleine Waldsilhouette | **Moospilz** |
| Fuzzy Spider | Walk, 8 × 4; breite Beine und erkennbare Bewegung | **Waldspinne** |
| Horned Bat | Idle/Flügelschlag, 6 × 4; nachvollziehbare Flugbewegung | **Hornfledermaus** |
| Bomb Walker | Walk, 8 × 4; Zündschnur und ungewöhnlicher schwarzer Körper | **Zunderläufer** |
| Dragon Whelp | Idle/Flügelschlag, 6 × 4; nutzbar, größere Flügelsilhouette | Reserve |
| Floating Eye | Idle, 8 × 4; grundsätzlich nutzbarer Flieger | Reserve |
| Flame Wisp | Idle, 8 × 4; nutzbar, thematisch näher an vorhandenem Wisp | Reserve |
| Biter Plant | Idle/Attack/Hurt, keine Laufanimation | Für diese laufenden Wellen nicht gewählt |
| Cobra | Idle/Attack/Hurt, keine Laufanimation | Für diese laufenden Wellen nicht gewählt |
| Sandworm | Idle/Attack/Hurt, keine Laufanimation | Für diese laufenden Wellen nicht gewählt |

Top-down **16/32/48/64**, mit/ohne Kontur, wurden im bewegten Direktvergleich
geprüft. 32 wirkt neben den vorhandenen Gegnern meist zu klein; 64 macht insbesondere
Spinne und Flügel unnötig dominant. **48 mit Kontur** liefert den besten Kompromiss.
Keine Side-view-Grafik, Normalmap oder ungeprüftes Idle als Bodenlauf.

Die Pixor-JSON liefert echte Quellrechtecke, Animationsnamen, South/East/North/West,
Pivot und 83/84-ms-Dauern. Alle ausgewählten Originalframes sind nach Lit-/Shine-
Zusammenführung pixelgenau erhalten; Nearest Neighbor, feste Skalierung 0,83 und
fester Bodenpivot (32,43) im vorhandenen 64er Atlasformat. Der Originalschatten
bestätigt den Pivot als Mittelpunkt des projizierten Bodenkontakts. Daher keine
wandernden Zentrierungen nach Körper-Boundingbox und keine doppelte Schattenebene.

| Figur | Sichtbarer Körper vor Kamerazoom, ungefähr | Laufzeit-PNG |
| --- | --- | ---: |
| Moospilz | 13–17 × 16–19 Weltpixel | 19.195 B inklusive zweiter Palette |
| Waldspinne | 24–31 × 20–27 | 14.561 B |
| Hornfledermaus | 12–37 × 13–27, einschließlich Flügelausschlag | 10.269 B |
| Zunderläufer | 13–14 × 16–22 | 8.744 B |

Zusammen **52.769 B / 51,5 KiB**, vier Texturen, ca. **2,5 MiB** dekodiert.
Quell-JSON-Auszüge und Lizenznachweise sind dokumentiert, werden aber nicht als
weitere Spieldownloads angefordert. Ganze Archive, alle Auflösungen, Normalmaps,
Shine-Einzelblätter und ungenutzte Angriffs-/Hurt-Animationen bleiben außerhalb des Builds.

## Integration und wiederkehrende Wellen

| Ab Welle | Gegner | Bestehende Rolle / Werte vor HP-Skalierung |
| --- | --- | --- |
| 42 | Moospilz | Normaler Waldläufer: 28 HP, Tempo 43, 9 Gold, ein Kernschaden |
| 46 | Waldspinne | Flinker Bodenläufer: 30 HP, Tempo 64, 12 Gold, ein Kernschaden |
| 50 | Hornfledermaus | Schneller Flieger: 24 HP, Tempo 74, 12 Gold, ein Kernschaden |
| 54 | Zunderläufer | Langsamer Panzer: 60 HP, Tempo 36, 25 % Rüstung, 18 Gold, zwei Kernschaden |

Je zwei Exemplare zur Einführung und zwei in der nächsten Welle. Danach erscheinen
sie familienabhängig zwischen bekannten Arten: beispielsweise Moospilz/Feuerkäfer
im Schwarm, Goblin/Spinne im Ansturm, Zunderläufer/Goblin als Panzergruppe sowie
Qualle/Skorpion/Moospilz in Unterstützungsgruppen. Höchstens drei Arten, 28 Gegner
und zwei Heiler. Alle sechzehn normalen Arten kommen in den geprüften späten
51-Wellen-Fenstern regelmäßig wieder; deterministisch auch bei direktem Farmaufruf.

Vier Familien und vorhandene Gruppenpausen bleiben bestehen. Die Folge der
Familien bleibt unregelmäßig; die Mischung wechselt mit dem Vorkommen der Familie,
ohne wachsenden Verlaufszustand. Keine neue Director-Architektur oder Ostfront.
Einführungshinweise und Chronik kennen die neuen Arten; die Chronik wählt den
nächsten neuen Gegner nun chronologisch statt nach der Reihenfolge im Objekt.

Moospilz besitzt eine rote und eine grüne kosmetische Kappe: **eine** Definition,
ein Satz Clips, gleiche Werte; stabile Auswahl aus der bereits gespeicherten UID.
So zeigt die Pipeline Palettenwiederverwendung mit veröffentlichbarem CC-BY-Material.
Neue Elitewerte oder Explosionsmechaniken wurden nicht ergänzt. Zunderläufers
Rüstung/Kernschaden verwenden dieselben Mechaniken wie die bestehenden Panzer.

HP-Kurve, Turmwerte, Upgradepreise, Goldfaktoren und Offline-Quoten bleiben gleich.
Das gesamte Kill-/Abschlussbudget jeder Welle entspricht W02, automatisiert bis
250 geprüft. Andere Kampfzeiten können die Goldrate nach 40 dennoch verändern;
eine neue langfristige Wirtschaftsabstimmung ist nicht Teil dieses Pakets.

## Saves, Farmen und Prüfungen

Schema **27 / Regeln 13**. Neue Versuche verwenden die erweiterten Rezepte;
alte laufende Versuche behalten ihre ursprüngliche Regelversion. Regeln 12 sind
auch nach 40 eingefroren. Wallet, Spawnliste, Heilertimer, Geschosse und Kampfwerte werden beim Laden nicht umgerechnet. Die neue Farbe benötigt kein Savefeld.
Historische Farmraten laufen aus, validierte Freischaltkandidaten bleiben erhalten;
neue sichere Raten benötigen wieder zwei vollständige Durchläufe ohne Gefährtenbonus.
Historische Offline-Ansprüche bleiben bei ihrer ursprünglichen Basis und einmalig zahlbar.

Beim Erweitern der Migration wurde berücksichtigt, dass Schema 26 bereits Level
über 20 unterstützt: Das bleibt auch als historisches Format gültig. Zusätzlich
korrigiert: Ein alter globaler HP-Deckel in der Save-Prüfung konnte bei hohen Wellen
gültige HP der bereits in W02 entgrenzten Kurve abweisen. Ab Regeln 12 gilt die
exakte berechnete HP-Prüfung mit endlichen Zahlen; manipulierte HP werden weiterhin
abgewiesen. Beide Fälle sind einschließlich Welle 125 getestet.

- **20/20 Wave-/Asset-/Migrationsprüfungen bestanden**, davon sieben neue E01-Tests.
  Originalrezepte 12 gegen den vorhandenen 100-Wellen-Messstand, neue Rezepte bis
  250 vorwärts/rückwärts, frühe Wiederholung, Kaderabdeckung, Heiler-/Mengengrenzen,
  Originaltimings, vier echte Ansichten, Palette, Live-Save/Reload aller neuen Arten,
  Farm-Neunachweise und alte/neue einmalige Offline-Ansprüche.
- Größere relevante Matrix: **117/126 bestanden, neun bekannte Fehler**.
  Derselbe unveränderte Ausgangsbranch: **110/119 bestanden, dieselben neun Fehler**.
  Kein neu fehlgeschlagener Test. Veraltete erwartete Kaderzahlen und die Ablehnung
  der jetzt aktuellen Regelnummer wurden fortgeschrieben; Zukunftsformate,
  manipulierte Werte und Historien werden weiterhin streng abgelehnt.
- Die neun Baselinefehler betreffen zwei alte Grafik-/Wegfixtures, ein konstruiertes
  v1-Farmfixture, drei alte Onboarding-Fälle und drei alte Save-Store-Fixtures.
  Namen und vollständige Ausgaben: [Zusammenfassung](verification-summary.json),
  [Ausgangsstand](baseline-tests.txt), [aktuelle Matrix](focused-tests.txt).
- TypeScript und **`npm run build` bestanden**. Buildprüfung: vier neue Texturen mit
  zusammen 52.769 Bytes, keine privaten Shroom-PNGs, ZIPs oder Aseprite-Dateien.
  Credits-Seite im Produktionsbuild vorhanden. Die Produktionsvorschau zeigt die vier neuen Arten, fordert keine privaten Galeriedaten an und bietet funktionierende Einzelbildschaltung; Credits sind aus dem Spielmenü erreichbar. [Buildausgabe](build.txt), [Produktions-Browserprobe](production-browser.json).
- Echte Chrome-/Phaser-Proben: Desktop 1600×1000 und Mobil-Viewport 390×844;
  alle vier neuen Figuren auf dem Spielweg, eine späte Welle mit **22 lebenden
  Gegnern**, Animation/Bewegung, Pause, UI-Panning und exakter pausierter Reload.
  Kein JavaScript- oder HTTP-Ladefehler. [Browserprotokoll](browser-results.json).
- Die lokale Galerie bietet nachweislich 15+15+22+22+22 Paletten, alle Richtungen,
  vier Frak-Auflösungen sowie Pause/Einzelbild; kein horizontales Überlaufen auf
  dem geprüften Mobil-Viewport. Private Shroom-Vergleichsaufnahmen bleiben lokal.

### Tatsächlich bezahlte Fortsetzung

Vom vorhandenen, regulär erspielten W02-Welle-40-Save bis **Welle 56**:
**99:34 zusätzliche Modellminuten**, sechs Niederlagen, **24 bezahlte Upgrades**,
Turmlevel am Ende bis 19, Farmwelle 43. Kein geschenktes Gold, keine geschenkten
Level oder Freischaltungen. Alle sechzehn normalen Arten wurden gesehen.
Die echten Spielaufnahmen verwenden gespeicherte Zustände dieser Fortsetzung.
[Messlauf/Käufe/Niederlagen](paid-continuation.json), reproduzierbar mit
`tsx experiments/idle-bastion/tests/helpers/measure-local-enemies.ts`.

Das zeigt funktionierenden Anschluss mit Farm-/Ausbauphasen; es ist keine allgemeine
Endgame-Balancefreigabe. Insbesondere nach 40 bleiben die zuvor dokumentierten
Gold-/Kostenkurven und begrenzten Farmkandidaten gesondert zu bewerten. Die vorliegende
Erweiterung ändert diese Wirtschaft nicht.

## Sichtprüfung und verbleibende Grenzen

[Moospilz im echten Spiel](game-intro42-desktop.png) ·
[Waldspinne](game-intro46-desktop.png) ·
[Hornfledermaus](game-intro50-desktop.png) ·
[Zunderläufer](game-intro54-desktop.png) ·
[dichte Welle 54, Desktop](game-wave54-desktop.png) ·
[dichte Welle 54, Mobil](game-wave54-mobile.png) ·
[Zunderläufer auf Mobil](game-intro54-mobile.png) ·
[gemeinsame Vorschau](new-enemies-desktop.png).

Frakassets ist eine andere zeichnerische Handschrift als Foozle; Kontur, Perspektive,
48er Größe und feste Anker fügen sich im Vergleich sinnvoll ein. Die endgültige
subjektive Stilbewertung bleibt beim Nutzer. Die beiden violetten Arten unterscheiden
sich durch Beine beziehungsweise Flügel und die vorhandene Flughöhe. Moospilz und
Zunderläufer sind bewusst kleine Körper, keine groß skalierten Panzerkolosse.

Der Mobiltest ist eine echte Browserprobe mit Touch-/Hochkantemulation auf dem
Entwicklungsrechner, kein Leistungstest auf schwacher Smartphone-Hardware.
Gemessene rAF-Abstände sind im Browserprotokoll enthalten; daraus wird keine
Geräte-FPS-Garantie abgeleitet. Vier kleine zusätzliche Texturen und der unveränderte
Gegnerdeckel begrenzen das zusätzliche Renderbudget.

Für eine öffentliche Shroom-Men-Integration fehlt weiterhin die eindeutige
Weitergabeerlaubnis. Bis dahin ist die lokale Vergleichsprobe vollständig nutzbar.

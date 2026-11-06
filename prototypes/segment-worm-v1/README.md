# Obsidianwurm – separate Bewegungsstudie

Stand 06.11.2026. Entwurf auf Nutzerwunsch: deutlich länger als der erste Vorschlag, kein Naturthema. Diese Vorschau bleibt eigenständig und greift nicht auf Spielstände zu. Nach anschließender ausdrücklicher Beauftragung wird derselbe Atlas auch für Mini-Boss W36 und Boss W45 verwendet; [gesonderte Spielintegration und Messungen](../../artifacts/obsidian-worm-2026-11-06/REPORT.md).

## Ansehen
`node prototypes/segment-worm-v1/serve.mjs` starten, dann http://127.0.0.1:5208/ öffnen.

- 30 Körpersegmente plus Kopf und Schwanz; circa 430 Spieleinheiten beziehungsweise elf 40er-Kacheln lang.
- Größe der Einzelteile passend zu den kleinen Originalgegnern. Maßstab 0,83; Körperabstand 13,5 Spieleinheiten.
- Nach Nutzerfeedback: Kopfanschluss von 16 auf 12,5 Spieleinheiten verkürzt, auch im statischen Größenvergleich. Körperabstände und Grafiken unverändert.
- Gemeinsame Wegspur, Ansichten rechts/unten/oben, seitlich gespiegelt; zwei wechselnde Beinposen. Dies ist noch kein vollständig ausgearbeiteter Animationssatz.
- HP-Regler zeigt ausschließlich den Entwurf: 100 % = 30, 50 % = 15, 20 % = 6 Körpersegmente. Verlust am hinteren Ende.
- Original-Blattkäfer und -Skorpion zum Größenvergleich. 2×-Ansicht ist nur eine Lupe.

## Prüfung
`node prototypes/segment-worm-v1/check.mjs`: Chrome, 1440×900, Touch 844×390 und 390×844. Geprüft: Bewegung, zusammenhängende Segmentabstände um Kurven, HP-Verlust/Reset, Pause, Zoom, reduzierte Bewegung, kein horizontaler Seitenüberlauf, keine Browser-/HTTP-Fehler und keine angelegten LocalStorage-/IndexedDB-Daten. Ergebnisse und Screenshots in [checks](checks/).

Nach der Kopfkorrektur dieselben Prüfungen erneut bestanden. Zusätzlich ein vollständiger Wegumlauf mit Messung des Kopfanschlusses und Nahaufnahmen in acht Blickwinkeln, einschließlich Kurven. Die acht Blickwinkel entstehen aus den drei vorhandenen Spriteansichten mit Drehung/Spiegelung, nicht aus neuen Grafiken.

Emulierte Viewports ersetzen keine physische Handyprüfung. Diese Studie misst weder Spielbalance noch Leistung mit mehreren Würmern. Ihr HP-Regler und die geschlossene Vorschau-Strecke sind nicht mit dem Kampf verbunden; Prüfungen der anschließenden Hauptspielintegration stehen im oben verlinkten Bericht.

## Kleine wiederverwendbare Arbeitsweise
1. Originalgegner unverändert als Größen-/Stilreferenz extrahieren.
2. Wiederverwendbare Teile mit festen Zellen und wenigen Richtungen generieren.
3. Einheitlich auf native Pixelgröße exportieren; transparente Ränder prüfen.
4. Bewegung und Lesbarkeit in Spielgröße prüfen, bevor Kampfregeln integriert werden.

Der native Atlas enthält zwölf Teile in 128×96 Pixeln und benötigt etwa 4,4 KB. Die großen Quelldateien werden in der Vorschau nicht geladen. Rendering höchstens ungefähr 30 Bilder pro Sekunde; bei Pause/verstecktem Tab keine laufenden Neuzeichnungen.

## Herkunft
[Originalprompts und Generierung](PROMPTS.md). Generierte Quellen bleiben unter `sources/` unverändert erhalten.

Leafbug, Scorpion, Gelände und Baum sind Kopien/Ausschnitte vorhandener Spielassets, keine neu erzeugten oder hier neu lizenzierten Assets; maßgeblich bleiben [Quellen und Lizenzen des Spiels](../../experiments/idle-bastion/docs/SOURCES_AND_LICENSES.txt). Pixelify Sans stammt aus dem vorhandenen Spiel; [OFL](assets/OFL.txt).

Hilfsskripte verwenden die bereits vorhandenen lokalen Sharp-/Playwright-Installationen. Kein neues npm-Paket, keine Änderung an Spielmechaniken oder Build-Konfiguration.


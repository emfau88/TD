# Vorhandener Speer-Tanz · Spielintegration 31.10.2026

Der Nutzer hat die erstmalige Integration dieser bereits vorhandenen **V3** ausdrücklich
bestätigt. Quelle: `artifacts/idle-bastion/previews/ilyra-map-idle/v3` im Zweig
`codex/map-idle-trio-preview`, ursprünglicher V3-Commit `ed6a4e3`.
Die später verworfene andere Hüft-Idle ist nicht enthalten.

`atlas.png`: 33 freigegebene 64×64-Bilder in acht Spalten, 512×320, 76.635 Bytes;
655.360 Bytes rohe RGBA-Pixel. Alle Frames pixelgleich aus V3 übernommen, einschließlich
Transparenz, Fußpunkt (32,56) und 3.920 ms Bildfolge. Kein Resize, Filter, Spiegeln
oder Nachzeichnen. Original-Lauf-/Zauberatlas unverändert.

`clip.json` enthält Zeitfolge, RGBA-SHA256 je Quellframe und Atlas-SHA256.
`python pack.py <Pfad-zur-V3>` reproduziert die Packung mit Pillow und prüft alle
33 entpackten Rahmen bytegleich gegen ihre dekodierten Quellen.

Die reine Darstellungssteuerung `src/ilyra-idle.ts` wartet acht Sekunden nach
Stillstand bzw. Ende der Salve. Die nächste Aufführung beginnt frühestens 24 Sekunden
nach Beginn der vorherigen. Ein kurzer optischer Richtungswechsel verwendet die
vorhandenen Standbilder. Gespeicherte Blickrichtung und Koordinaten ändern sich nicht.
Bewegung/Salve unterbrechen sofort; Pausen folgen unveränderter Kampfzeit. Reload
beginnt mit einer frischen Wartezeit. Während der Einführung und bei
`prefers-reduced-motion: reduce` bleibt die bisherige Darstellung erhalten.

Kein zusätzliches Audio, keine Änderung der Fähigkeit, kein neues Savefeld.

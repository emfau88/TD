# Freigegebene Tavernen-Videos

17 ausdrücklich freigegebene Animationen vom 06./07.11.2026 aus der lokalen
Produktionsserie. 16 Laufzeitdateien sind unverändert; I07 verwendet seit dem
07.11.2026 eine Größenkorrektur der vorhandenen Figur vor festem Hintergrund. `provenance.json` dokumentiert Clipnummer,
ausgewählte Revision, Bytezahl und SHA-256. Verworfene Versuche gehören nicht
zu diesem Paket. Die ursprünglichen Master umfassten 12.397.032 Byte MP4,
zuzüglich Manifest und zwei aus
dem jeweiligen ersten Videobild abgeleiteter verlustfreier WebP-Standbilder.

- H.264, 480 × 704, 24 FPS, keine Tonspur. Native Laufzeiten beibehalten.
- Der Hintergrund ist bereits enthalten. Die Darstellung entnimmt `[0,2,480,700]`
  und behält damit die bisherigen logischen Figuren- und Berührungskoordinaten.
- `idle`, `head`, `touch`, `variant`, `giggle`, `joy`, `hip` sowie eigenständige
  Handreaktionen `hand` (M09 v3 / I08); bei Mara zusätzlich `tease`.
  Aufrufregeln bleiben im Social-/UI-System. Das Manifest erteilt keine
  Herzfreigaben, verbraucht keine Geschenke und löst keine Stimmen aus.
- Ruhige Wiedergabe und verzögerte Variante nach etwa 15 s Mara / 18 s Ilyra.
- Stimmen, Musik und Geschenk-/Herzklänge bleiben unabhängig im bestehenden
  Audiosystem. Ein kürzeres Video schneidet eine laufende Stimme nicht ab.
- Alte Darstellungsdateien und der damalige Code sind unter
  `archive/tavern-animations/pre-comfy-2026-11-06/` wiederverwendbar gesichert.

Die I07-Korrektur skaliert nur die Figur auf 90 %, um den Größensprung bei
Komplimenten zu beheben. Bewegung, 107 Frames und 24 FPS bleiben erhalten.
Der freigegebene Originalmaster liegt verlustfrei unter
`artifacts/idle-bastion/tavern-targets-2026-11-07/I07-approved-original.mp4`;
`provenance.json` hält Original und abgeleitete Laufzeitdatei auseinander.
Die Größenkorrektur ist noch nicht ausdrücklich vom Nutzer visuell abgenommen.

Vorhandene Prompts,
Workflows, frühere Fassungen und Vergleiche bleiben unter
`artifacts/idle-bastion/tavern-comfy-series-2026-11-06/` im ursprünglichen
Arbeitsverzeichnis erhalten.

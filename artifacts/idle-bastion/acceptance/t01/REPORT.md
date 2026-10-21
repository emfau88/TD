# T01 — Mara Animationsprobe

Stand: 21.10.2026. Ausschließlich separate Vorschau; visuelle Nutzerabnahme offen.

Geliefert: ein transparenter, mit Imagegen erzeugter Atlas mit zwölf echten Zeichnungen, vier für Idle/Blinzeln und acht für eine Schulterreaktion. Eine gezielte Generierung korrigierte den zunächst wechselnden Arm. Rendering registriert die Frames am Gürtel, ohne die Bilder zu verformen. Metadaten und exakte Prompts liegen bei den Assets.

Prüfungen vor Veröffentlichung:
- `node scripts/check-mara-preview.mjs` bestanden: Idle-Frames, Reaktion mit Rückkehr, Mehrfachklickschutz, Pause/Einzelbild/Weiter, versteckter Tab, Atlasgrenzen und kein Spielstandzugriff.
- `npm run idle:build` einschließlich TypeScript bestanden.
- `git diff --check` bestanden.
- Lokale Browserprüfung durch `ERR_BLOCKED_BY_CLIENT` für 127.0.0.1 und localhost verhindert. Desktop-/Hochkantprüfung wird nach Veröffentlichung über Pages durchgeführt; noch nicht als bestanden verbucht.

Keine Änderung an Kampf, Rekrutierung, Tavernenpreisen, Save-Migrationen oder Karten-Idle-Animationen. T02–T07 nicht begonnen. Keine vollständige Kampf-/Balancetestserie nötig. Bildausschnitt bis Oberschenkel und verbleibende zeichnerische Unterschiede sind in der visuellen Abnahme zu bewerten; dies ist kein Nachweis für eine fertig abgenommene Produktionspipeline.

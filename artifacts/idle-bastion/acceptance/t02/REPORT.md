# T02 — Tavernenstufen und Bestandsschutz

21.10.2026 · Branch `codex/idle-bastion-vertical-slice`.

Nach gemeisterter Welle 12: freiwilliger kostenloser Bausatz ohne Lernpause. Taverne II kostet nach tatsächlichem Boss-25-Sieg 1.200 Gold; erst dann ist Ilyras kostenlose Rekrutierung verfügbar. Bestehende bezahlte Tavernen migrieren automatisch zu II. Gebäudegrundstück, Kampf, Gold und Figuren bleiben erhalten. Stufe und Voraussetzungen erscheinen im Menü und Gebäudenamen. Soziale Interaktionen sind noch nicht integriert.

Gezielte Prüfung: 21 unterschiedliche Tests aus `tavern.test.ts`, `ilyra.test.ts`, `core-settlement.test.ts` bestanden (20 im gemeinsamen Lauf, zusätzlicher UI-Test im Tavernen-Nachlauf). Abgedeckt: Welle-12-Grenze, kostenloser Bau mit 0 Gold, reale Bossbedingung, fehlendes Gold, doppelte Aktionen, Save-22-Migration mit/ohne Taverne/Ilyra, Reload, Rücknahme bei Schreibfehlern, Rekrutierung/Kampfeinführung und Umzug. Gefährten-UI zusätzlich mit jsdom geprüft. TypeScript und Produktionsbuild bestanden.

Lokaler Browserstart unter `?probe=t02` überprüft; keine echte Mobilgeräteprüfung oder vollständiger neuer Durchlauf bis Welle 25. Grenzfälle nutzen ausdrücklich künstliche Modellfixtures. Keine Änderungen an Kampfwerten, Bossprämien, Offline-Regeln oder klassischen Spielständen.

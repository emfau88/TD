# SPIRE · aktuelles Hauptspiel

- Nutzer hat am 21.10.2026 die Übernahme des Idle-Bastion-Stands nach `main` ausdrücklich beauftragt. `main` ist künftig der veröffentlichte Hauptstand; neue Arbeitsbranches verwenden `codex/`.
- Aktueller Spielcode bleibt zur Vermeidung unnötiger Pfad-/Assetmigrationen unter `experiments/idle-bastion/`. Vor Änderungen dortige `README.md`, `ROADMAP.md`, passende Fachdateien und `AGENTS.md` lesen. Die fortlaufende Roadmap ist die einzige aktuelle Aufgabenliste.
- `npm run dev`, `npm run build`, `npm run preview` und `npm test` betreffen das aktuelle Spiel. `classic:*` und `reference:*` sind historische Werkzeuge; alte Quellen/Assets nicht pauschal löschen, teilweise werden sie weiter verwendet.
- `npm run build` erzeugt die Pages-Seite in `dist/`: aktuelles Spiel im Wurzelpfad, alte `/idle-bastion/`-URLs leiten mit Query/Hash weiter. Speicherkennungen beibehalten. Hauptspiel wird nur von `main` veröffentlicht.
- Klassischer Altstand ist über Tag `archive/classic-td-2026-10-21` erhalten. Kein Force-Push, keine Umschreibung der Git-Historie oder unaufgeforderte Löschung historischer Quellen.
- Tests kompakt auf betroffene Risiken beschränken; tatsächliche Ergebnisse dokumentieren. Eine grüne technische Prüfung ersetzt keine ausstehende visuelle Nutzerfreigabe.

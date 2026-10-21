# Übernahme als SPIRE-Hauptspiel

21.10.2026 · Ausdrücklich durch Nutzer beauftragt: „danach dann die übernahme nach main machen“.

Der bisherige klassische main-Stand `5667aaeda3140e2797532894c524a32eb10af1cc` wurde als annotierter Tag `archive/classic-td-2026-10-21` gesichert und gepusht. Keine historischen Commits werden überschrieben. main enthält keine eigenen zusätzlichen Commits gegenüber der bisherigen Idle-Entwicklung und kann per Fast-forward übernommen werden.

Aktueller Code bleibt unter `experiments/idle-bastion/`; keine Massenverschiebung oder Löschung gemeinsam verwendeter Originalassets. Standardbefehle dev/build/preview/test betreffen das aktuelle Spiel. Historische Werkzeuge bleiben ausdrücklich als classic:* bzw. reference:* benannt. Der Pages-Workflow veröffentlicht künftig ausschließlich main und nur den aktuellen Build.

`npm run build` bestanden: TypeScript, Vite und abgesicherte Verpackung nach dist. Gesamte Veröffentlichung einschließlich sechs kleinen Weiterleitungsseiten: **12.775.033 Bytes**. Der frühere zusätzliche klassische Build wird nicht mehr mit ausgeliefert. Alte `/TD/idle-bastion/`-Spiel-/Vorschaulinks werden auf die Hauptadresse bzw. entsprechende Vorschauseite weitergeleitet; Suchparameter und Hash bleiben erhalten. Gleiche Origin und unveränderte IDB-/Speicherkennungen, keine Save-Migration oder Löschung nötig.

Prüfung: alle sechs generierten Weiterleitungsskripte mit echten URL-Parametern/Hash ausgeführt und Zielpfade geprüft. Browser gegen Produktionsbuild: alter Tavernenlink wird zu `/tavern-check.html?hero=ilyra#heart` und zeigt rekrutierte Ilyra; alter Spielpfad wird zur Hauptseite mit unverändertem isoliertem probe-Parameter. Kein normaler Nutzersave verändert. Keine erneute komplette Spieltestserie; die unmittelbar vorherigen 27 Speicher-/Interaktionstests gelten unverändert.

Hauptspiel: https://emfau88.github.io/TD/
Archiv: https://github.com/emfau88/TD/tree/archive/classic-td-2026-10-21
Veröffentlicht als `f9c1d30`, [Pages-Lauf 39641086379 erfolgreich](https://github.com/emfau88/TD/actions/runs/39641086379). Öffentliche Hauptseite antwortet mit HTTP 200 und aktuellem Spieleinstieg. Im Browser leitet der alte Tavernenlink auf `/TD/tavern-check.html?hero=ilyra&v=f9c1d30` weiter; Übersicht mit Ilyra lädt. Lokaler main-Checkout ebenfalls per Fast-forward aktualisiert; vorhandene ungetrackte Benutzeranhänge unverändert.

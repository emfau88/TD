# Autosave-Flackern korrigiert

21.10.2026 · Nach ursprünglicher Diagnose ausdrücklich mit „dann fixe das mit dem flackern“ beauftragt. Bildoptimierung bleibt eigener Commit `c225b30`.

`BattleSession.inputBusy` unterscheidet Benutzeraktionen/Übergänge von technischen Hintergrundschreibvorgängen (`busy`). Tavernenbuttons und Hauptspielaktionen verwenden die fachliche Eingabesperre. Ein einzelner während Autosave eingehender Befehl reserviert den Eingabeplatz, wartet auf Schreibabschluss und validiert dann den aktuellen Zustand. Weitere gleichzeitige Befehle werden abgewiesen. Pause und Offline-Claim/Fortsetzung verwenden dieselbe Reservierung; Fehler, Rollback und Schreibrechte bleiben erhalten. Autosave-Intervall nicht verändert.

Kompakte Prüfung:

- 27/27 Tests in `battle-session.test.ts` und `tavern-interactions.test.ts`: bestehende Kauf-/Speicher-/Offline-/Tab-Sicherungen plus vier gezielte Fälle für Kauf, Schreibfehler, Pause und Geschenk während gehaltenem Hintergrundcheckpoint.
- `check-tavern-loading.mjs` prüft zusätzlich die echte Tavernen-DOM-Logik: Sprechen und freigeschaltetes Herz bleiben vor/während/nach Checkpoint aktiv; gesperrtes Herz bleibt deaktiviert. Die ursprüngliche Diagnose wurde zur Regression mit Assertions erweitert.
- `npm run idle:build` bestanden. Kurzer Browserdurchlauf im isolierten T07-Save: Pause verlassen, tatsächliche laufende Farmwelle, Taverne/Ilyra mit vorhandenem Herz öffnen; Herz und Aktionen verfügbar. Kein neuer/normaler Nutzerspielstand verändert.

Die gewollte Sperre während einer Berührungsreaktion bzw. einer echten noch nicht abgeschlossenen Benutzertransaktion bleibt bestehen. Keine Animations-, Wirtschafts- oder Saveformatänderung.

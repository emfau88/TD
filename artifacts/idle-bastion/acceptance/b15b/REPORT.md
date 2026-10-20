# B15b — Ilyra und Tavernenübersicht

20.10.2026 · Branch `codex/idle-bastion-vertical-slice`.

## Ergebnis

- Gebaute Taverne nach Boss 25: Ilyra bewusst kennenlernen und kostenlos rekrutieren. Alte Besitzer zahlen nicht erneut. „Neu“ an Siedlung/Tavernenkarte bleibt bis zur Rekrutierung sichtbar.
- Taverne zeigt Mara, Wisp und Ilyra mit Rolle/Status; Einträge öffnen ihre vorhandenen Befehle. Chronik zählt alle rekrutierten Begleiter.
- Ilyra erscheint am tatsächlichen Taverneneingang; Menü schließt. Erster Standort und erste Salve werden über reale Buttons erklärt. Freie Bewegung, keine Turmbindung und keine neue automatische Lernpause.
- 210 px Reichweite, 72 px Radius, 28 s Abklingzeit. Mindestens 70 Schaden oder 1,5 Sekunden ungebuffte DPS des stärksten Turms; Flieger ×1,5, normale Rüstung. Sichtbares Zielgebiet, drei fliegende Sterne, Einschlag. Freigegebener Atlas mit tatsächlicher Bewegungs-/Zauberzeit synchronisiert.
- Erste Salve manuell; danach optionale Automatik bei Gruppen, Fliegern oder Bossen. Abklingzeit am Porträt und im Charaktermenü.
- Schema 21 migriert Altsaves mit `ilyra: null`. Rekrutierung, Bewegung und laufende Treffer werden gespeichert; keine automatische Rekrutierung. Farm-/Offline-Berechnung bleibt ohne Sternensalve, bestehende Ansprüche erhalten.

## Kompakte Prüfung

Sechs neue Fälle in `experiments/idle-bastion/tests/ilyra.test.ts` bestanden: Freischaltung/Migration einschließlich Kernkarte, Bewegung, gespeicherter Flug und einmalige Killbelohnung, Fliegerbonus/Skalierung/leere Wellen, Rollback bei Schreibfehler sowie unveränderte Farmbasis mit ausstehender Salve.

Vier vorhandene Fälle bestanden: JSON-Rundlauf des Kampfes, Ablehnung ungültiger/neuer Speicherformate, Erhalt eines veröffentlichten Saves beim Siedlungsumzug sowie dessen Pause-/Rollback-Transaktion. Auswahl mittels `--test-name-pattern="JSON round trip|invalid resources|published save retains|session requires pause"` in `battle-save.test.ts` und `core-settlement.test.ts`.

`npm run idle:build` erfolgreich. Der letzte Durchlauf enthält den Gefährtenhinweis und Ilyras Abklingzeitanzeige; danach nur Leerzeilennormalisierung in `main.ts` und Dokumentation.

Browser: Desktop 1440 × 900 sowie Hochkant 430 × 932 bei DPR 2. Echte Klick-/Touchfolge Taverne → Ilyra → kostenlos kennenlernen → Standort → Sternensalve. Rekrutierung ohne Goldabzug, keine Automatik vor der ersten Anwendung, echte Bewegung, Menü nach Auswahl geschlossen, Reload während des Flugs mit identischem Zustand, danach Automatik schaltbar. Frischer Einstieg ohne Turm/Ilyra lädt ebenfalls. Keine JavaScriptfehler oder horizontales Überlaufen. Details: [browser.json](browser.json).

Vorbereitete isolierte Teststände: Boss-25-Besitz und Farmwelle 6, nicht erspielter Kampagnenfortschritt. Wartezeit für den restlichen Fußweg wurde nach sichtbarer Bewegung im Prüfstand übersprungen. Kein physischer Gerätetest, keine vollständige Balanceabnahme oder behauptete Nutzerabnahme.

## Ansichten

![Tavernenübersicht](desktop-tavern.png)
![Gezielte Sternensalve](desktop-volley.png)

<img src="mobile-tavern.png" alt="Taverne in Hochkant" width="280"> <img src="mobile-volley.png" alt="Salve bei freier mobiler Kampfansicht" width="280">

Die Salve ist für die Aufnahmen in ihrer echten Flugphase pausiert. Der Spielstand wird nicht in den normalen Spielslot des Nutzers übernommen.

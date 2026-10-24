# Kostenloser Tutorial-Frost

Basis: `main` / `537b5e8c9cf09b696b41644da4c56dbc8633d720`. Arbeitsbranch: `codex/frost-kit-hero-controls`. Paket 1 vor Figurensteuerung; kein Merge nach main.

## Verhalten

- Nach der weiterhin **60 Gold** teuren Forschung steht genau ein kostenloser Frostbausatz bereit. Die Q3-Empfehlung bleibt bei **(8,5)** zum tatsächlichen Startturm **(10,5)**.
- Der Bau verbraucht den Bausatz und beendet die Anleitung in einer gespeicherten Transaktion. Weitere Frosttürme kosten **110 Gold**. Kein Goldgeschenk, keine rückwirkende Erstattung.
- Der kostenlose Grundturm bringt beim Verkauf **0 Gold**, ein bezahltes erstes Upgrade für 60 Gold **42 Gold** zurück. Verkauf, Reload und erneutes Einblenden der Hinweise erneuern den Bausatz nicht. Überspringen beendet die ungenutzte Berechtigung.
- Schema **30**, Kampfregeln weiterhin **15**. Alte Stände bekommen ausschließlich den fehlenden Null-Marker. Aktive Sturmlichtketten, Ilyra-Salven mit Quelle 5 und reservierte Offline-Belohnungen bleiben erhalten.

## Prüfung

**Modell:** tatsächlich verdiente Einführung, ohne Goldkorrektur: Frostphase nach Welle 1 mit **25 Gold**, sofort baubar; vorher waren weitere Übungswellen zum Ansparen der 110 Gold nötig. Die frühere Verfügbarkeit ist die ausdrücklich gewünschte Änderung an der Einstiegswirtschaft.

**Technik:** 44/44 gezielte Prüfungen erfolgreich, einschließlich Reload vor/nach Bau, Verkauf/Neukauf, Upgrade/Verkauf, Doppelklick, Transaktionsfehler, Schema-29-Kompatibilität und einmaliger Offline-Auszahlung. Gesamtsuite **331/348**, exakt die **17 dokumentierten Altfehler**, keine neuen. Produktions-/Pages-Build erfolgreich. Details: [Testergebnisse](test-results.json).

**Echter Browser:** Desktop 1280×800 auf Deutsch und emuliertes Smartphone 390×844 mit Touch auf Englisch. Q4-Einstieg, tatsächliche Bau-/Forschungsklicks, Reload vor und nach Frostbau. Beide Türme sichtbar; der Frostbau kostet nachweislich 0 Gold, Restgold **25**, Kern **20/20**. Kampfzeit bis zum gesetzten Frost etwa **12,2 Sekunden**, zusätzlich reale Lese-/Menü-/Ladezeit. Ältere Bau-/Bereit-Stände behalten ihre Position. [Messwerte](browser.json) · [Desktop](screenshots/desktop-de-free-frost-kit.png) · [Hochkant](screenshots/mobile-en-free-frost-kit.png).

Die Browserprüfung verwendet getrennte Probe-Slots und keine veränderten Nutzer-Spielstände. Native Smartphone-Hardware und subjektive Nutzerfreigabe sind damit nicht ersetzt. Der vorhandene Rückkehrdialog muss nach Reload ausdrücklich geschlossen werden; ein erster Testlauf übersah diesen Schritt nach dem Abschluss-Reload, der Testablauf wurde korrigiert.

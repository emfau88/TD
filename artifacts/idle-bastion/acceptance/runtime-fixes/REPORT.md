# Frosttext, Echtzeit und Tavernenbedienung

26.10.2026 · Direkter Main-Auftrag mit ausdrücklichem Commit/Push · Basis `f5b4a6f`.

Die Bosschronik beschreibt Frost jetzt in beiden Sprachen korrekt als Verlangsamung
ohne Zauberunterbrechung. Die Kampfmechanik bleibt unverändert.

Phaser reicht ungeglättete Framezeit weiter. Die Session verarbeitet alle aktiven
Sekunden einschließlich langsamer Frames und während Speicherungen eingetroffener
Zeit in höchstens 250-ms-Portionen. Jede erforderliche Speicherung bleibt eine
Transaktionsgrenze. Bereits angenommene Zeit geht bei Flush, Pause, Verbergen oder
Schließen nicht verloren. Größere echte Framelücken verwenden weiter den bestehenden
Offlineweg; aufgelaufene Live-Zeit wird dabei nicht in Offlinezeit umgedeutet.
Saveformate, Kampfregeln, Farmnachweise, Offlineformeln und Zuneigungsbudgets bleiben
gleich. Ein Fehler setzt auf den bestätigten Zustand zurück.

Tavernenaktionen und Herzmomente bleiben während Reaktionen bedienbar. Der Rig-Player
ersetzt eine laufende Reaktion, sobald die neue geladen ist, mit 160 ms Überblendung.
Eine neuere Anforderung ersetzt auch eine noch wartende Animation. Speichertransaktionen,
Sessionfehler und initiales Laden bleiben echte Sperrgründe. Animationen vergeben
keine Punkte und verbrauchen keine Geschenke. Der historische Atlasplayer akzeptiert
ebenfalls Folgeaktionen; er bleibt in den separaten alten Vorschauen erhalten.

## Gezielte Regressionen

Alle **71 Tests bestanden**, keine Skips. Der bisherige Test, der absichtlichen
Zeitverlust während eines Saves erwartete, prüft jetzt den vollständigen Erhalt.
Vier neue Tests decken FPS-Gleichheit, Abschlussgrenzen, anschließende echte Abwesenheit
und Fehler-Rollback mit wartender Zeit ab.

| Datei | Bestanden |
| --- | ---: |
| battle-session.test.ts | 31 |
| offline.test.ts | 13 |
| offline-welcome.test.ts | 5 |
| tavern-interactions.test.ts | 2 |
| tavern-social.test.ts | 10 |
| tavern-atlas-cache.test.ts | 5 |
| i18n.test.ts | 5 |

Modellprüfung: 60, 10 und 2 FPS erzeugen nach zehn Sekunden denselben vollständigen
Kampf-Snapshot und 400 zusätzliche soziale Schritte. Zehn während eines Saves
angesammelte Sekunden werden vollständig nachgeholt, ohne Offlineanspruch. Native
IndexedDB-Fortsetzung, historische Offlineansprüche, Schreibfehler und Doppelklickschutz
sind Bestandteil dieser gezielten Matrix. Keine Gesamtsuite ausgeführt.

`npm run build` einschließlich TypeScript und Pages-Verpackung erfolgreich;
[Buildprotokoll](build.txt). `git diff --check` erfolgreich.

## Tatsächlicher Browserablauf

[Reproduzierbares Skript](../../../../experiments/idle-bastion/tests/browser/runtime-fixes.mjs)
gegen den lokalen Main-Entwicklungsserver; echter Spieleinstieg und native IndexedDB,
jeweils neue isolierte Probe-Spielstände. Keine echten Nutzersaves verwendet.

| Prüfung | Desktop, Mara / DE | Hochkant, Ilyra / EN |
| --- | --- | --- |
| Größe | 1280 × 844 | 390 × 844, Touch-Emulation |
| Automatische Variante durch Sprechen unterbrechen | 155 ms | 119 ms |
| Manuelle Reaktion durch Berührung ersetzen | bestanden | bestanden |
| Geschenk-Doppelklick | genau ein Geschenk / +12 Punkte | genau ein Geschenk / +12 Punkte |
| Herzmoment während Reaktion öffnen und weiterschalten | bestanden | bestanden |
| Reload: getrennte Zuneigung und Geschenkbestand exakt | bestanden | bestanden |
| Korrigierter Boss-/Frosttext | Deutsch geprüft | Englisch geprüft |
| Browserfehler | keine | keine |

Zusätzlich tatsächliche RAF-Aufrufe um 480 ms verzögert, ohne ihre Zeitstempel zu
ändern: **10,05 s Echtzeit / 9,95 s Kampfzeit**, kein falscher Rückkehrdialog.
Die kleine Differenz liegt innerhalb eines Frameintervalls an Start/Pause.
[Messdaten](browser.json) · [Desktop](mara-1280.png) · [Hochkant](ilyra-390.png).
Beide Ansichten visuell angesehen; keine physische Smartphone-Prüfung oder neue
subjektive Nutzerabnahme behauptet.

Die Browser-Testautomation wurde zunächst an zwei UI-Selektoren korrigiert:
eindeutiger Tavernen-Schließen-Knopf sowie der im Hochkant sichtbare Wellen-/Chronikknopf.
Das waren Testauswahlfehler; die obige Tabelle beschreibt die abgeschlossenen Läufe.

Die Veröffentlichung erfolgt über den bestehenden [Main-Pages-Workflow](https://github.com/emfau88/TD/actions/workflows/idle-bastion-pages.yml)
nach dem ausdrücklich beauftragten Push. Offline-Auffüllung, neue Zielauswahl,
Niederlagendiagnose und weitere Begrüßungen gehören nicht zu diesem Paket.

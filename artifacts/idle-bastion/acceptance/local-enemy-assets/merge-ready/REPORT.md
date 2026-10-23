# E01 · Abschluss vor Merge

23.10.2026 · bestehender Branch `codex/local-enemy-assets`, Draft-PR #2 gegen
`codex/wave-rework`. Nur die beauftragte Bereinigung und zwei belegte Auffälligkeiten;
keine neue allgemeine Balancerunde. `main` und Draft-PR #1 werden nicht verändert.

## Bereinigung und Erhalt

Shroom Men samt fünf Figuren, 96 Farbvarianten, privaten Clips/Palettenmenüs,
Sporen-/Schattenfunktionen und Quellreferenzen aus Vorschau, Import und aktueller
Dokumentation entfernt. 122 erzeugte lokale Vergleichsdateien gelöscht. Die
Originaldownloads wurden nicht verändert: zehn Dateien per SHA-256 vor/nach geprüft.
Historische Git-Commits werden nicht umgeschrieben.

Alle **vier Frakassets-Arten einschließlich roter/grüner Moospilzkappe bleiben
bytegenau erhalten**: Werte, Einführungswellen 42/46/50/54, Animationen, Anker und
51,5 KiB PNG. [Hash-/Downloadnachweis](asset-preservation.json).

Der Import benötigt jetzt nur `free_monster_pack_frakassets.zip`.
`--runtime` regeneriert ausschließlich vier Laufzeitatlanten, Frame-/Lizenznachweise;
`--gallery` optional die zehn Frakassets-Vergleiche. Tatsächlicher Laufzeitimport
mit einem Eingabeordner, der **ausschließlich dieses eine ZIP** enthielt, erfolgreich:
[Importausgabe](import-runtime.txt). Keine Downloads oder Python für den normalen Build.

## Welle 46: versehentlich verlorene leichte Begleitung

Die Unterstützungsmischung war ursprünglich Qualle/Skorpion/Moospilz. Die Einführung
der Spinne kürzte die Liste auf ihre ersten zwei Arten und entfernte damit den
leichten Begleiter. Die anschließende Mengenverteilung füllte fast alles mit Panzern.
Der neue leichte Gegner übernimmt nun diesen Begleiterplatz.

| Welle 46 | Regeln 13 | Regeln 14 |
| --- | ---: | ---: |
| Panzerskorpion | 20 | 7 |
| Waldspinne | 2 | 15 |
| Laternenqualle | 2 | 2 |
| Gesamt | 24 | 24 |
| Rüstungsbereinigtes HP-Volumen, ohne Heilung | 689.936 | 410.379 |
| Kill- und Abschlussbudget vor globalem Goldfaktor | 470 | 470 |

Spawnzeiten, HP-Kurve und Einzelwerte bleiben gleich. Das rüstungsbereinigte Volumen
sinkt um etwa 40,5 %. Der reine Volumensprung von 45 auf 46 sinkt von +268 % auf
+119 %; Tempo, Turmrollen und Heilung machen dies nicht zu einem exakten
Schwierigkeitsfaktor. Alle anderen verglichenen Rezepte bis 250 sind unverändert,
einschließlich des Einstiegs 1–40 und der Boss-Meilensteine.

Zwölf gezielte Vergleichskämpfe: zwei regulär bezahlte Verteidigungen × Wellen
45/46/47 × alte/neue Regeln. Der schwächere Stand verliert 46 weiterhin; auch die
Verteidigung direkt vor 46 benötigt einen Ausbau. Dort verzögert sich die Niederlage
von 47,175 auf 52,5 Sekunden und mehr Gegner fallen. Das ist eine Korrektur des
belegten Rezeptfehlers, keine Zusage verlustfreier Progression.
[Rezepte und Kämpfe](focused-comparisons.json).

## Farmen: fehlendes Zertifikat überging gespeicherte Auswahl

Der Fortsetzungsmesslauf lädt einen Roh-Kampfsnapshot ohne Abreisezertifikat.
Die alte Suche berücksichtigte die höchste Welle, ihren Vorgänger und Welle 1,
überging aber die im Save ausgewählte Farmwelle 29. Mit dieser Verteidigung sind
39 und 40 nicht verlustfrei nachweisbar: Rückfall auf 1 trotz brauchbarer Wahl 29.
Mit vorhandenem historischem Zertifikat fand die alte Suche bereits 29.
Ein normaler Session-Reload übergibt üblicherweise dieses Zertifikat; der Fehler
betrifft insbesondere Rohsave-Fortsetzungen und Rückkehr ohne gültigen Nachweis.
[Ursachenmessung vor Änderung](baseline-diagnosis.json).

Jetzt wird die gespeicherte Auswahl als **Kandidat frisch geprüft**. Fehlt ein
gültiger Nachweis, kann ein weiterer jüngerer Live-Clear einen freien Prüfplatz
nutzen: im gleichen Save mit Farmwahl 1 wird dadurch 38 statt 1 nachgewiesen.
Bei weiterhin gültigem Nachweis bleibt die bisherige Suchstrategie erhalten.
Höchstens vier Kandidaten; Welle 1 bleibt als Rückfall reserviert. Nur bereits
validierte Live-Clears, zwei komplette Durchläufe ohne Kernschaden und ohne
Gefährtenbonus. Kein Gratisgold, kein Überschreiben der Live-Ereignisse.
Manipulierte/nie geschaffte Kandidaten und nachteilige Verkäufe bleiben abgesichert.

| Gleiche Kauf-/Fortsetzungsstrategie bis Rekord 56 | Vorher | Jetzt |
| --- | ---: | ---: |
| Zusätzliche Modellzeit ab 40 | 99:34 | 68:16 |
| Bezahlte Upgrades | 24 | 24 |
| Niederlagen gesamt | 6 | 6 |
| Niederlagen auf 46 | 3 | 1 |
| Farmdurchläufe auf 1 | 157 | 0 |

Jetzt 171 Farmdurchläufe auf 29; diese ist der beste nachgewiesene Kandidat dieser
begrenzten Suche, nicht als global optimales Farmziel behauptet. Sechs Niederlagen
liegen nun auf 44, 46, 50, zweimal 53 und 54. Finale Turmlevel bis 19. Kein neues
Goldbalancing: Belohnungen, Multiplikatoren, Upgradepreise und Offline-Quoten gleich.
Kürzere sichere Kampfzeiten können die reale Goldrate selbstverständlich verändern.
[Bezahlter Messlauf mit Käufen, Auswahl und Clears](paid-continuation.json).

## Versionierung, Regressionen und Produktionsprüfung

**Schema 28 / Regeln 14**. Unveränderte Regeln 13 sind als eigene Datei eingefroren,
einschließlich der alten Welle 46. Schema 27 wird zuerst unter seinen alten Regeln
validiert, dann ohne Änderung an Queue, Gegnern, Timer, Geschossen, Heilung oder
Wallet migriert. Erst ein neuer Versuch übernimmt 14. Aktuelle Farmnachweise
werden neu erworben; bereits verdiente Offline-Ansprüche bis Regeln 13 behalten
ihre ursprüngliche Grundlage und sind weiterhin genau einmal zahlbar.

- **25/25** gezielte Wave-/Asset-/Save-Prüfungen erfolgreich, inklusive fünf neuer
  Merge-Regressionen. Keine bestehende Fehlerprüfung abgeschwächt.
- **122/131** in derselben größeren relevanten Matrix: exakt die **neun bekannten
  Fehler**, keine neuen. [Getrennte Fehlerliste](KNOWN-TEST-FAILURES.md),
  [vollständiger aktueller Testlauf](focused-tests.txt).
- Tatsächlich gespeicherter v27-Kampf auf 46: alte panzerlastige Queue bleibt exakt,
  beide Klone laufen deterministisch weiter, nächste Welle übernimmt 14. Manipulierte
  Queue und falsche HP werden abgewiesen. Native Save-/Reload-Probe mit historischem
  Offline-Anspruch: exakt 180.450 Tausendstelgold einmal, erneute Auszahlung abgewiesen.
- **TypeScript und `npm run build` erfolgreich**. Keine ZIPs, Aseprite-Quellen oder
  lokale Vergleichsordner im Build. Vier unveränderte Produktions-PNGs.
  [Buildausgabe](build.txt), [Prüfzusammenfassung](verification-summary.json).
- Chrome/Phaser: Desktop 1600×1000 und Touch-/Mobil-Viewport 390×844, alle vier Arten,
  vier Richtungen, beide Moospilzfarben, Pause/Einzelbild, keine horizontalen Überläufe.
  Acht aktuelle/historische Kampfproben mit exaktem pausiertem Reload; dichte Welle 54
  mit 22 lebenden Gegnern. Keine JavaScript-/HTTP-Ladefehler.
  [Browserprotokoll](browser-results.json).
- Separate **Produktionsvorschau** ohne lokale Galerie: vier neue Arten, funktionierender
  Animationsstart, Einzelbild und Credits aus dem Spielmenü; keine privaten Requests.
  Ein dabei gefundener negativer erster Animations-Zeitabstand wurde auf null begrenzt.
  [Produktionsprotokoll](production-browser.json).

Reproduzieren: `tests/merge-ready.test.ts` mit dem vorhandenen TSX-Testlauf,
`tests/helpers/check-enemy-merge.ts` für die zwölf Kämpfe und
`tests/helpers/measure-local-enemies.ts` für die bezahlte Fortsetzung.
`SPIRE_ASSET_OUTPUT=artifacts/idle-bastion/acceptance/local-enemy-assets/merge-ready`
wählt dieses Ergebnisverzeichnis. Browserproben: `tests/browser/local-enemies.ts`
und `tests/browser/enemy-preview-production.mjs`, mit Playwright-Modul und
`SPIRE_TEST_URL` auf den jeweiligen lokalen Server.

## Ansichten und verbleibende Grenzen

[Bewegte Vorschau](http://127.0.0.1:5196/enemy-lab.html) ·
[Desktopvergleich](new-enemies-desktop.png) · [Mobilvergleich](new-enemies-mobile.png) ·
[Welle 46 aktuell](game-intro46-desktop.png) ·
[alter v27-Kampf erhalten](game-historical46-desktop.png) ·
[Welle 54 Desktop](game-wave54-desktop.png) · [Welle 54 mobil](game-wave54-mobile.png).

Die beiden gezielten Korrekturen beseitigen belegte Ursachen. Welle 46 bleibt eine
starke Unterstützungsgruppe und kann Farm-/Ausbauphasen verlangen. Die Farmsuche ist
absichtlich begrenzt statt einer vollständigen Optimierung aller historischen Wellen.
Kein vollständiger Endgame-Balancetest; langfristige Kosten-/Goldkurven bleiben der
bereits dokumentierte W02-Punkt. Mobilprüfung auf dem Entwicklungsrechner ersetzt
keine Messung auf schwacher Smartphone-Hardware. Subjektive Stilfreigabe bleibt offen.

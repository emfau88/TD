# Q4 · Mara-Einführung — Umsetzung und Abnahme

Stand: 25.10.2026. Arbeitsbranch: `codex/q4-mara-introduction`. Basis: `main` / `be155d868217fcaea150a7436047597757a54641` (A1 sowie Q1–Q3 enthalten).

**Die Umsetzung ist geprüft. Der Nutzer hat den direkten Merge am 25.10.2026 ausdrücklich freigegeben („ja dann merge einfach direkt mit“). Implementierungscommit und main-Übernahme: `56c59d3581378b8a48ed08aebfeb59b7586ec0ce`. Pages-Veröffentlichung und öffentliche Desktop-/Mobilprobe erfolgreich, siehe Abschluss.**

## Umsetzung

- Drei kompakte, manuell weiterschaltbare Szenen innerhalb der vorhandenen `welcome`-Phase. Die zuletzt freigegebenen DE-/EN-Dialoge sind unverändert übernommen. Keine Timer für das Lesen, keine Schreibmaschinenanimation, keine doppelte Begrüßung.
- Bestehende Onboarding-Karte erweitert: sichtbare Mara, Gold-/Waldgrün-Gestaltung, unmittelbar lesbarer Text, mindestens 44 px hohe Hauptbuttons. Desktop 1280 × 800, Hochkant 390 × 844 bei DPR 2, kleine Ansicht 320 × 568 sowie Querformat 844 × 390 geprüft. Sprache und Audio bleiben über das Menü erreichbar.
- Drei konsistente WebP-Porträts aus derselben bestehenden Mara-Referenz. Nach Nutzerhinweis Schalverlauf korrigiert und den nach oben ragenden goldenen Strich entfernt; beide weiteren Mimikvarianten aus dem korrigierten Master erstellt. **80.672 Bytes insgesamt**, 272 × 320 px, Alpha. [Quellen, Prompts und Exporte](../../q4-mara-portraits/README.md).
- Eine abbrechbare Kamerafahrt von 1,2 Sekunden mit sanftem Start/Ende, danach gleicher Eingangsbereich für Szene 3. Kartenziele aus `layout.core`, `layout.road` und `recommendedStarterPad`; Q3-Waldwächter (10,5), Frost (8,5) unverändert. Tatsächliche Dialoggröße, Orientierung und Pixeldichte berücksichtigt. Reduzierte Bewegung: direkte Positionierung, statische Marker.
- Goldring am Kern, Richtung am Eingang, wenige bewegte Wegpunkte, Goldring am Bauplatz. Intro und bestehende Lernpfeile sind gegenseitig ausgeschlossen. Der grüne Außenrand der ersten Fassung ist korrigiert: Der sichtbare Ausschnitt bleibt innerhalb der Karte.
- Auf ausdrücklichen Nutzerwunsch Lebensanzeige bei schmalen mobilen Ansichten direkt **unter dem Kern** verankert. Sie wandert mit der Karte und verschwindet mit dem Kern aus dem Ausschnitt; konstante lesbare Schriftgröße. Vorher war sie bereits in main bei `Header + 52 px` fest auf dem Bildschirm. Desktop-HUD und Lebensregeln bleiben unverändert; der DOM-Wert bleibt für assistive Technik erhalten.
- Abschluss und „Intro überspringen“ speichern regulär `welcome → build`; weder automatischer Turmbau noch `skipLessons()`. Bestehender Baukatalog, kostenloser Waldwächter und anschließende Lektionen bleiben erhalten. Ready-/Kampftext von Wiederholungen und der zu frühen Magiezusage bereinigt.
- Introfortschritt als optionale UI-Präferenz pro Spielslot (`spire-ui-intro-v1:<slot>`). `BattleSession.origin` unterscheidet neue, geladene und wiederhergestellte Partien ausschließlich zur Laufzeit. **Kein Kampfschema-/Speicherformatwechsel.** Alte Saves ohne Q4-Status bekommen kein neues Intro. Fehlerhafte Präferenzen und Backup-Recovery aktivieren es nicht. Bei blockiertem UI-Speicher funktioniert die aktuelle Sitzung; nach Reload greift die sichere bestehende Begrüßung.
- Optionale Porträts werden nur bei berechtigtem Intro parallel zum normalen Start geladen, mit begrenzter Dekodierzeit. Bei Fehlern vorhandenes Tavernenporträt, danach vorhandene Mara-Canvas-Darstellung. Kein Animationsatlas zusätzlich beim Start. Fortgeschrittene Saves laden keine Q4-Porträts.
- **Unverändert:** Kampf, Wirtschaft, Preise, Freischaltungen, Zuneigung, Offline-Berechnung/-Auszahlung, Tavernenanimationen, Mara-Steuerung. Der Offline-Kommentar bleibt ein eigenes Folgepaket.

## Tests und Nachweise

| Prüfung | Ergebnis |
| --- | --- |
| Produktionsbuild `npm run build` | PASS — [Ausgabe](build-output.txt) |
| Gesamtsuite `npm test` | **326/343 bestanden**, exakt dieselben **17 Altfehler**, keine neuen Fehler, keine Skips — [Einzelliste/Vergleich](test-results.json) |
| Neue Introtests | **7/7**: Szenenfortschritt, Slottrennung, Altstände, Recovery-/Präferenzregeln, Speicherung, Fehlversuch und Übersetzungen |
| Abschließende Session-/Introtests | **32/32**, einschließlich tatsächlicher Recovery-Provenienz, Eigentümerschaft/Transaktionen und Speicherfehler |
| Bestehende Eingabeprüfung | PASS: Kauf-Taps, Hintergrund-Tap, Moduswechsel, Auswahl und reduzierte Bewegung |
| Echte Szenen und Save/Reload | Alle drei Szenen, Desktop/Hochkant, DE/EN; jede Szene und gespeichertes `build` neu geladen — [Daten](scenes.json) |
| Finale Darstellung | 12 Szenenaufnahmen, mobiler Kern-Lebenswert an echter Weltposition, auf Desktop reguläres HUD — [Daten](visual-checks.json) |
| Bedien-/Fehlerfälle | Skip aus jeder Szene, schneller Szenenwechsel mitten in Fahrt, Sprache, Drehung, 320 px, Tastatur, reduzierte Bewegung, neue/alle Porträts blockiert, UI-Speicher blockiert — [Daten](behavior.json) |
| Alte Saves | `welcome`, `build`, `ready`, `combat`, `done`: keine neue Einführung; vorhandene Türme/Budgets erhalten |
| Vollständiges echtes Tutorial | Desktop/Maus und Hochkant/Touch: Intro → Waldwächter → Reload → Kampf → Upgrade → kostenlose Werkstatt → Forschung → Frost. Beide Q3-Positionen, 20 Leben und Zugänglichkeit erhalten — [Daten](tutorial.json) |
| Produktionsseite | Neuer Slot, warmer Cache, gespeichertes `build`, 320-px-Menü/Sprachwechsel, keine Browserfehler — [Daten](production.json) |

Die 17 bekannten Altfehler betreffen bestehende Balance-Zeitziele, ältere Layout-/Navigationsannahmen und Mara-Fixtures. Sie werden durch Q4 nicht behoben und nicht als neue Q4-Probleme ausgewiesen. Die Suite enthält die bestehenden Offline-/Save-Regressionsprüfungen. Desktop und Mobil wurden in Chrome mit echter Phaser-Darstellung geprüft; Mobilformate sind Browseremulation, kein separater Test auf einem physischen iPhone/Safari.

## Ladeumfang

Lokaler Produktionsbuild, Chrome, frischer Spielslot, keine Netzwerkdrosselung und keine Request-Interception; Ressourcenwerte aus Browser Resource Timing. Einzelmessungen sind keine Aussage über Mobilfunk-/Internet-Ladezeiten.

| Messung | Bis bedienbar | Übertragene Ressourcen gesamt | Q4-Porträts |
| --- | ---: | ---: | ---: |
| Leerer Browsercache | 2.05 s | 2,904,374 Bytes | 81,572 Bytes inkl. Header-Schätzung |
| Warmer Browsercache, neuer Slot | 1.44 s | 24,300 Bytes | 1,200 Bytes Header-Schätzung; Bildkörper aus Cache |
| Vorhandener Build-Spielstand | Reguläres Fortsetzen | Bestehende Startressourcen | **0 Q4-Porträtrequests** |

Die lokale Preview revalidiert Cacheeinträge; deshalb sind warme Transfers nicht exakt null. Die drei tatsächlichen Bilddateien umfassen 80.672 Bytes. Kein vollständiger Tavernenanimationsatlas wurde angefordert; vorhandene kleine Kartenfiguren-/UI-Ressourcen sind unverändert. [Kalte Ressourcen](cold-resources.json), [warme Ressourcen](warm-resources.json).

## Echte Screenshots und Aufnahme

| Szene | Desktop DE | Hochkant DE | Desktop EN | Hochkant EN |
| --- | --- | --- | --- | --- |
| 1 · Kern/Willkommen | [Bild](screenshots/desktop-de-scene-1.png) | [Bild](screenshots/mobile-de-scene-1.png) | [Bild](screenshots/desktop-en-scene-1.png) | [Bild](screenshots/mobile-en-scene-1.png) |
| 2 · Eingang/Weg | [Bild](screenshots/desktop-de-scene-2.png) | [Bild](screenshots/mobile-de-scene-2.png) | [Bild](screenshots/desktop-en-scene-2.png) | [Bild](screenshots/mobile-en-scene-2.png) |
| 3 · Erster Turm | [Bild](screenshots/desktop-de-scene-3.png) | [Bild](screenshots/mobile-de-scene-3.png) | [Bild](screenshots/desktop-en-scene-3.png) | [Bild](screenshots/mobile-en-scene-3.png) |

[Übergang zum Bau Desktop](screenshots/desktop-de-build.png) · [Übergang zum Bau Hochkant](screenshots/mobile-de-build.png) · [320 px / Englisch](screenshots/small-en-scene-3.png) · [Kamerafahrt aus dem Produktionsbuild, MP4](camera-mobile.mp4).

## Geänderte Dateien

- Präsentation/Anschluss: `src/main.ts`, `src/onboarding-ui.ts`, `index.html`, neu `src/mara-intro.ts`, `src/mara-intro.css`, `src/intro-portraits.ts`.
- Kamera/Markierungen und mobile Kernleben: `src/battle-scene.ts`, `src/progress.css`.
- Ausschließlich Laufzeit-Provenienz: `src/battle-session.ts`; Dialogübersetzungen: `src/locales/en.ts`.
- Porträts: `assets/intro/mara/{welcome,focused,mischievous}.webp`; Quellen/Prompts unter `artifacts/idle-bastion/q4-mara-portraits/`.
- Tests: neu `tests/mara-intro.test.ts`; Recovery-Nachweis in `tests/battle-session.test.ts`; Q4-Anschluss im vorhandenen `scripts/check-q3-tutorial.mjs`; neue `scripts/check-q4-intro.mjs`, `check-q4-behavior.mjs`, `check-q4-production.mjs`.
- Dokumentation: `ROADMAP.md`, `docs/Q4_MARA_EINFUEHRUNG_PLAN.md`, dieses Nachweispaket; `.gitignore` ergänzt für temporäre Q4-Prüfdaten.

Alle `src/`, `assets/`, `tests/` und `scripts/`-Angaben beziehen sich auf `experiments/idle-bastion/`.

## Merge-Einschätzung und Abschluss

**Empfehlung: mergen.** Die Änderungen sind klar begrenzt, die echten Abläufe und der Produktionsbuild bestehen, Speicher-/Offline-Regeln wurden nicht verändert, und gegenüber main gibt es keine zusätzlichen Regressionstestfehler. Die gemeldeten visuellen Korrekturen sind umgesetzt. Die bekannte rote Gesamtsuite bleibt separat dokumentiert; sie ist kein durch Q4 entstandener Blocker.

Der Nutzer hat den direkten Merge nach dieser Einschätzung ausdrücklich freigegeben. Die ursprünglich vorgesehene weitere Zwischen-/Merge-Abnahme ist dadurch aufgehoben. Implementierungscommit: `56c59d3581378b8a48ed08aebfeb59b7586ec0ce`, gepusht auf `codex/q4-mara-introduction` und per Fast-forward auf main übernommen. GitHub-Pages-Lauf [40138526811](https://github.com/emfau88/TD/actions/runs/40138526811) **erfolgreich**. Die öffentliche Seite wurde mit einem separaten Testspielstand auf Desktop/Englisch und Hochkant/Deutsch geprüft: alle drei Szenen, Bilder, Übergang zum Bau, Skip/Reload, warmer Cache und Sprachwechsel auf 320 px bestanden; keine Browserfehler. [Live-Desktop](public-desktop.json), [Live-Mobil](public-mobile.json).

[Veröffentlichtes Spiel](https://emfau88.github.io/TD/) · [Einführung in separatem Testspielstand öffnen](https://emfau88.github.io/TD/?fresh=1). Alle beauftragten Q4-Bulks sind erledigt; Offline-Mara bleibt ein separates Folgepaket.

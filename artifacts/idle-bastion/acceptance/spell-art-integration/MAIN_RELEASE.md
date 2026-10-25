# Main-Übernahme und öffentliche Nachprüfung

25.10.2026 · Nutzerfreigabe: **„Ok go“**, nach dem Integrations- und Merge-Prüfbericht.

Der geprüfte Stand `dbe3f3e89e702421abfc4ff1fa1b01d82ebfacae` wurde ohne Konflikte
von `codex/frost-kit-hero-controls` nach `main` übernommen. Keine zusätzliche
Spieländerung beim Merge. Der reguläre [Main-Deploy 40150021798](https://github.com/emfau88/TD/actions/runs/40150021798)
war erfolgreich; der separate Vorschau-Job wurde dabei nicht ausgeführt.

[Hauptspiel öffnen](https://emfau88.github.io/TD/) ·
[Updates direkt testen](https://emfau88.github.io/TD/feature-check.html) ·
[Galerie](https://emfau88.github.io/TD/art-review/?v=3).

## Nach Veröffentlichung tatsächlich geprüft

Alle Browserläufe nutzten neue isolierte Chrome-Profile, keine persönlichen Spielstände.

| Prüfung | Ergebnis |
| --- | --- |
| Öffentliche Hauptseite gegen passendes GitHub-Artefakt | Bytegleich mit dem erfolgreichen Main-Build |
| Neuer Q4-Einstieg, Überspringen und Reload | 1280×800, 390×844 und 320×568 bestanden |
| Bestehender Version-29-Main-Spielstand | Desktop und Touch: Übernahme zu Version 30, Gold/Türme und gespeicherte Pause erhalten, Reload erfolgreich |
| Normaler Speicher | Weiterhin `spire-idle-bastion`; kein Vorschau-Standardspeicher |
| Kostenloser Frost-Teststarter | Eigener Probe-Slot mit 25 Gold und verfügbarer Tutorial-Frostphase; Hauptspielstand unverändert |
| Figuren- und Ilyra-Teststarter | Desktop/Touch: Figurenmenü, runde Zauberaktion bzw. Ilyras Standortempfehlung sichtbar, neue Zaubergrafiken geladen, eigene Probe-Slots |
| Bisherige Test-/Galerielinks | Weiterleitung auf Hauptadressen mit Parametern und Hash; Galeriebilder geladen und Video abgespielt |
| Browser-/Ressourcenfehler, horizontaler Überlauf | Keine in den geprüften Abläufen |

[Produktionsbrowser-Daten](main-production-browser.json) ·
[Build-, Link- und Grafikprüfung](main-links-browser.json).

Die lokale Windows-HTML-Datei hatte einen anderen Hash als das GitHub-Linux-Paket
(Zeilenenden und Bundle-Verweise). Die Auslieferungsprüfung verwendet deshalb das
exakte Artefakt des erfolgreichen Main-Laufs. Die öffentliche Hauptseite hat dort
SHA-256 `826f6df010b6106638752e687698102869317328c4289442b0f2538184d354c2`.

Die unveränderte Testsuite wurde vor der Übernahme geprüft: **345/362 bestanden,
dieselben 17 Altfehler wie auf dem vorherigen Main**. Sie wurde für diesen reinen
Merge nicht unnötig wiederholt. Physische iPhones/Android-Geräte und langfristige
Geräteleistung wurden nicht geprüft. Der [Integrationsbericht](REPORT.md) dokumentiert
die übrigen Prüfungen sowie die Version-30-Grenze bei einem eventuellen Code-Rollback.

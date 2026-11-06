# Öffentliche Prüfung: drei Creeps

06.11.2026 · Spielcommit `963170ac3d828e31941e7c6eb3d04c25b0e8c34d`.
Normaler Fast-forward-Push von `57555d3` auf Main, kein Force-Push.
[Pages-Lauf 42273172617](https://github.com/emfau88/TD/actions/runs/42273172617)
erfolgreich; geprüft unter https://emfau88.github.io/TD/.

- Kobaltschleim W3, Flammengeist W7, schwebendes Auge W12 jeweils bei
  1440×900 (DE), 844×390 (EN, Touch) und 390×844 (DE, Touch).
- Neun Fälle bestanden: tatsächliche neue Gegner, Bewegung, Pause und exakte
  Wiederherstellung des pausierten Kampfzustands nach Reload.
- Keine HTTP-/JavaScriptfehler und kein horizontaler Dokumentüberlauf.
- Isolierte `probe`-Teststände in frischen Browserkontexten; keine Änderung
  eines menschlichen Spielstands. Die manuell vorbereiteten Einführungswellen
  dienen der Darstellungs-/Speicherprüfung, nicht der Balancesimulation.
- [Messdaten](browser-public/results.json), Vorher-/Bewegungsaufnahmen im selben
  Verzeichnis. Desktopaufnahme W12 zusätzlich visuell geprüft.

Wiederholung mit dem bereits vorhandenen Browserprüfskript:

```powershell
node --import tsx artifacts/creep-trio-2026-11-06/browser.ts https://emfau88.github.io/TD artifacts/creep-trio-2026-11-06/browser-public
```

Allgemeine Gegnerüberdeckung und mögliche Sortierung nach Geschwindigkeit
wurden nur beraten, nicht geändert. Physische Handyabnahme nicht behauptet.
Die braunen Feuerkäfer behalten ihre bisherige Grafik und Skalierung (0,83);
deren Definition ist seit `592b42a` vom 18.10.2026 unverändert.

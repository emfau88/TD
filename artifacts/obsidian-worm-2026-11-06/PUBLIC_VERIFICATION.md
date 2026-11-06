# Öffentliche Prüfung des Obsidianwurms

06.11.2026. Auf ausdrücklichen Nutzerauftrag veröffentlicht; keine weiteren
Gameplayänderungen nach der lokalen Freigabe.

- Spielcommit: `81c5185d9b10333abd0b521ba56f392c8e6587ec`, normaler Fast-forward von `c000122` auf `main`.
- [Pages-Lauf 42247043422](https://github.com/emfau88/TD/actions/runs/42247043422): Build und Veröffentlichung erfolgreich.
- Öffentlich geprüfte URL: https://emfau88.github.io/TD/
- Vor Veröffentlichung: 490/490 Tests und Produktionsbuild erfolgreich.

| Format | Sprache | W36 | W45 |
| --- | --- | --- | --- |
| Desktop 1440×900 | Deutsch | bestanden | bestanden |
| Touch quer 844×390 | Englisch | bestanden | bestanden |
| Touch hoch 390×844 | Deutsch | bestanden | bestanden |

Jeder Fall startet einen aus der tatsächlichen Balance-Simulation gewonnenen
Spielstand in einer getrennten Probe-Datenbank. Geprüft: öffentlicher Spielstart,
richtiger Wurmname und Lebensbalken, genau ein Gegner, Körperbewegung, Pause,
Kameraübersicht und exakt erhaltener pausierter Kampf nach Reload. Keine
HTTP-/JavaScriptfehler und kein horizontaler Seitenüberlauf. Keine Änderung am
Hauptsave und keine Aussage über eine physische Handyabnahme.

[Messdaten](browser-public/results.json) und Bildschirmaufnahmen im selben Ordner.
Der nachfolgende Nachweiscommit enthält ausschließlich diesen Bericht, Roadmap-
Status und öffentliche Prüfbilder; der bereits live geprüfte Spielcode bleibt gleich.

Wiederholung mit vorhandener lokaler Chrome-/Playwright-Installation:

```powershell
node --import tsx artifacts/obsidian-worm-2026-11-06/browser.ts https://emfau88.github.io/TD artifacts/obsidian-worm-2026-11-06/browser-public
```

# README-Starts: erster Boss und Ilyra

Beauftragt am 02.11.2026. Der vorhandene `feature-check.html`-Starter bietet nun
`?scenario=boss` und `?scenario=ilyra-unlock`; beide stehen oben in der Haupt-README.
Keine Änderung an normalem Einstieg, Freischaltregeln, Kampfwerten oder Saveformat.

- **Boss:** unverändert restaurierter erspielter `entry15` aus
  `early-balance-release/selected/B-snapshots.json`, vor dem ersten Spawn.
  Welle 15, Rekord 14, kein Bossnachweis, 766 Gold und vorhandene Verteidigung.
- **Ilyra:** `clear25` derselben Quelle, mit vorhandenem Bossnachweis. Taverne I
  und II werden durch normale Befehle gebaut/bezahlt; 2.474 − 1.200 = 1.274 Gold.
  Ilyra bleibt unrekrutiert. Über Siedlung → Taverne → Ilyra kennenlernen lässt
  sich ihre reguläre Einführung beginnen.
- Beide Szenarien starten pausiert. Jeder Aufruf erhält einen frischen
  `review-…`-UUID-Spielstand im bestehenden Probe-Namensraum. Die erzeugte
  Spieladresse lässt sich zum Fortsetzen speichern. Die ursprünglichen
  Frost-/Figurenstarts bleiben erhalten.

8/8 gezielte Tests bestanden: echte Befehle, historische Migration/Save-Roundtrip,
unpassende Ausgangsstände, Wiederholungsaufrufe, Pause und unveränderter Hauptsave.
TypeScript und Produktionsbuild bestanden. Die erste Buildprüfung fand nur eine
TypeScript-Verengung in der neuen Testassertion; diese wurde korrigiert.

Sechs echte Produktionsbrowser-Läufe auf Desktop 1440×900 EN und Touch-Querformat
844×390 DE: Boss, Ilyra-Rekrutierung mit Reload und erneuter Bossstart. Jede Probe
prüft den unveränderten Hauptsave des isolierten Browserkontexts, neue Probe-ID,
anfängliche Pause und tatsächlichen Kampffortgang bzw. dauerhafte Rekrutierung.
Keine HTTP-/JavaScriptfehler. [Lokale Ergebnisse](local/results.json).
Codecommit `d4e70b9` auf Main veröffentlicht; [Pages 41521130051](https://github.com/emfau88/TD/actions/runs/41521130051)
erfolgreich. Dieselben sechs Abläufe anschließend auf der öffentlichen Seite
erneut bestanden, einschließlich Rekrutierung, Reload und Hauptsave-Schutz.
[Öffentliche Ergebnisse](public/results.json).
Die historischen Stände sind Bedienproben; daraus wird keine neue Balanceaussage
abgeleitet. Keine persönlichen Browserprofile oder Spielstände verwendet.

Reproduktion gegen einen frischen Produktionsbuild und lokalen Previewserver:

```powershell
npx tsx artifacts/idle-bastion/acceptance/readme-starts-2026-11-02/browser.ts http://127.0.0.1:5199
```

Das Skript nutzt die vorhandene Codex-Playwright-Installation und Chrome; die beiden
lokalen Werkzeugpfade gegebenenfalls anpassen. Keine neue Testabhängigkeit.

# Ladetitel zentrieren · 13.11.2026

Der Nutzer meldete einen nach links versetzten Titel in der Kongregate-Preview
und beauftragte die Zentrierung. Die vorherige lesende Browserprüfung bestätigte
am tatsächlichen Ladetitel `display:flex`, `gap:12px`, `justify-content:normal`;
der Elternrahmen hatte bereits `text-align:center`.

Die globale Überschriftenregel in `src/premium.css:28` wirkte auf den Ladetitel.
`#boot-screen h1` legt nun selbst `display:block` und `text-align:center` fest.
Die vorhandenen Titelspannen bleiben auf Desktop inline und in Hochkant als
zwei Blockzeilen angeordnet. Keine Änderungen an Text, Grafiken, Spielregeln,
Spielständen oder Bestenlisten.

## Prüfung

- `npm run build:kongregate` erfolgreich: TypeScript und Vite-Produktionsbuild,
  384 Module; bestehende Warnung zum großen Haupt-JavaScript-Chunk bleibt.
- Diff auf die zwei genannten CSS-Deklarationen beschränkt.
- Keine neue Browser-Sichtabnahme: `127.0.0.1:5294` und `localhost:5294` waren
  für den Browser nicht erreichbar. Die direkte lokale HTML-Datei wurde von
  der Browser-URL-Richtlinie abgelehnt (nur HTTP/HTTPS erlaubt). Keine Umgehung.
  Temporäre lokale Prüfhilfen wurden anschließend entfernt.
- Die Zentrierung ist anhand der bestätigten Ursache korrigiert; tatsächliche
  Bildschirmaufnahmen der neuen Fassung und menschliche Abnahme stehen aus.

## Lieferung und Portal

Neues Paket:
`C:/Users/madde/Documents/TowerDefense/Upload-Paket-Kongregate-2026-11-13-Titel-Zentriert`

Für das bestehende Formular gehören die neue `01-game/separate-upload/index.html`
und die neue `01-game/separate-upload/additional-files.zip` zusammen. Das bisherige
V2-Icon wird unverändert mitgeliefert. Nicht mit Dateien des vorherigen Pakets mischen.

Die neue Fassung wurde in diesem Korrekturschritt **nicht hochgeladen oder
veröffentlicht**. Der zuvor bestätigte Kongregate-Status Ready to Publish bezieht
sich auf die Fassung vor dieser CSS-Korrektur. Publish bleibt beim Nutzer.

Git-Sicherung auf `codex/kongregate-leaderboards`; kein Merge nach `main` und kein
Pages-Deploy. Der Paketmanifest dokumentiert Ausgangscommit, Dateien und Hashes.

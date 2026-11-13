# Kongregate-Bestenlisten · 13.11.2026

Lokaler Einbau auf Grundlage von GitHub `main` bei
`08ad32fb22de6a8d634a26d53e54c57594b6a5d6`, Arbeitsbranch
`codex/kongregate-leaderboards`. Der Nutzer hat nach Lieferung des lokalen Pakets
ausdrücklich den Preview-Upload mit neuem Icon und Commit/Push beauftragt.
Kongregate-Publish bleibt ausschließlich dem Nutzer vorbehalten. Der ältere
Hauptordner-Checkout wurde nicht verändert; Git-Sicherung auf dem Arbeitsbranch.

## Umsetzung

- `Highest Wave`: höchste vollständig besiegte Welle.
- `Best Gold per Minute`: dauerhafter Rekord der konservativ bestätigten Farmrate,
  abgerundete ganze Gold/Minute, ohne temporäre Heldenfähigkeiten.
- `Enemies Defeated`: tatsächliche Gegnerzahl des regulären gespeicherten Spiels.
- Alle Werte kommen aus der erfolgreich gespeicherten Session; abgelehnte
  Speicherungen gelangen nicht in die Übermittlung. Ein optionales Save-Feld
  erhält den Farmrekord. Keine Änderung an Kampfregeln oder Speichernamen.
- Nur der Kongregate-Build bindet die optionale API an. Normale GitHub-Version,
  Probe-/Fresh-Routen, Feature-Vorschauen und temporäre Partien melden nichts.
- API-Ausfälle blockieren das Spiel nicht. Anmeldung, Wiederverbindung und
  periodische Wiederholung melden absolute Werte; Max verhindert Doppelzählung.

Die drei Portaldefinitionen wurden vor der anschließenden Klarstellung des Nutzers
angelegt: IDs 144398, 144399 und 144400. Alle **Max**, sichtbar in Bestenlisten,
**Server API only** aus. [Portalnachweis](portal-statistics.png).
Titel, Beschreibung, Anleitung, Kategorie und Screenshots wurden vor dem Upload
in `portal-metadata-before.json` erfasst. Die alte Preview zeigte einen aktivierten
Publish-Button (`portal-status-before.json`, `portal-before-upload.png`). Das neue
Icon wurde mit Erfolgsmeldung gespeichert (`portal-icon-updated.png`). Nach
ausdrücklicher Bestätigung des Nutzers wurden die vier Lizenz-/Zusicherungsfelder
gesetzt und Upload ausgelöst. Der Endzustand ist inzwischen bestätigt: vollständig
hochgeladen, **Ready to Publish**, nicht veröffentlicht.

## Tatsächlicher Portalabschluss

- Zwischenzeitlich zeigte das Portal `Uploading`, ein leeres Uploadformular und
  keine erreichbare Preview. Nach dem zweiten Uploadversuch wurde auf Nutzerwunsch
  angehalten. Beim ausdrücklich beauftragten Wiederaufnehmen war die neue Preview
  wieder vorhanden. Aus diesem Zwischenzustand lässt sich kein dauerhafter Verlust
  der Freigabe ableiten; der genaue interne Plattformablauf ist nicht bekannt.
- Portaldateiliste anschließend vollständig: alle **200 Manifestdateien** plus
  **LICENSES.txt**; außerdem listet Kongregate das hochgeladene ZIP selbst.
  [Dateinamenvergleich](portal-files-observed.json). Das ist ein Abgleich der
  angezeigten Dateinamen, keine Remote-Prüfsummenmessung.
- `index.html` wird mit **64,5 KB** angezeigt. Das tatsächlich gestartete Spiel
  verwendet `assets/index-Bccx9Q-0.js`, passend zum geprüften Paket, und lädt das
  Kongregate-SDK. Die Ladeansicht endet; Maras Anleitung `Welcome to the Old Grove`
  mit `Continue`/`Skip intro` ist verfügbar. Keine künstlichen Spielwerte erzeugt.
- Ein Konsolenfehler stammt aus Kongregates `sitewide_async_javascripts`:
  `Cannot read properties of null (reading 'innerHTML')`. Der Spielstart gelingt
  dennoch; kein beobachteter Fehler aus dem Spielcode. Keine vollständige
  Live-Bestenlistenabnahme daraus ableiten.
- Sämtliche erfassten Metadatenfelder und die drei Screenshot-URLs sind exakt
  unverändert: [Vergleich](portal-metadata-comparison.json),
  [Nachher](portal-metadata-after.json). Neues Icon separat erfolgreich gespeichert.
- Entwicklerportal zeigt **Ready to Publish**, die Preview einen aktivierten
  **Publish**-Button. [Statusnachweis](portal-status-after.png). Publish, Delete
  current preview version und Submit for Review wurden nicht betätigt.
- Spielcode und Icon: GitHub-Commit `a078f293f3aab91420a6f9428f792890dfb9678a`
  auf `codex/kongregate-leaderboards`; GitHub-API bestätigt den Commit. `main`
  unverändert bei `08ad32fb`; kein Pages-Deploy ausgelöst.

## Tatsächlich geprüft

- **79/79 Tests bestanden**: `kongregate.test.ts`, `battle-session.test.ts`,
  `save-store.test.ts`, `farming.test.ts` über `tsx --test --test-reporter=spec`.
  Enthält Transaktionsfehler, Save-Erhalt, schwächere Verteidigung/Reload,
  Offline-Gold ohne neue Kills, Probe-Ausschluss, Gast/Login, API-Fehler,
  Wiederholungen und einmalige SDK-Initialisierung.
- TypeScript `tsc --project experiments/idle-bastion/tsconfig.json --noEmit`
  und Vite-Build mit `vite.kongregate.config.ts` bestanden. Bestehender Hinweis
  auf großen Haupt-JavaScript-Chunk; kein Buildfehler.
- [Browserprüfung](check-browser.mjs) gegen unveränderte Produktionsdateien in
  einem isolierten Chrome, iframe mit unterschiedlichen lokalen Origins und
  verschachteltem Spielpfad. Antworten aus lokalen Dateien und simuliertem SDK;
  kein Testwert wurde an Kongregate gesendet.
- Regulärer angeleiteter Einstieg: Turm bauen, Kampf beginnen, Upgrade und
  erste Welle tatsächlich abschließen. Gemeldet: **Welle 1, 29 Gold/Minute,
  6 Gegner**. Reload meldet genau dieselben gespeicherten Werte erneut.
- Blockierte API: Spiel und Anleitung starten. `?probe=leaderboards-qa`:
  Spiel startet ohne SDK-Anfrage. Keine Browser-JavaScript-Fehler.
  [Messwerte](browser-results.json), [Spielansicht](local-game.png).
- Beide ZIPs vollständig auf CRC geprüft, alle 201 Dateien anhand des Manifests
  geprüft; separate HTML-/ZIP-Kombination entspricht dem vollständigen ZIP.
  Lizenzen enthalten, keine Testseiten, Quellen oder Spielstände im Build.
  [Paketprüfung](package-results.json).

## Lokale Lieferung

`C:/Users/madde/Documents/TowerDefense/Upload-Paket-Kongregate-2026-11-13`

Für das tatsächlich geöffnete Formular zusammen verwenden:

- `01-game/separate-upload/index.html` — 66.035 Bytes.
- `01-game/separate-upload/additional-files.zip` — 55.227.488 Bytes.

Alternativ vollständiges ZIP: `01-game/Towers-and-Tantrums.zip` (55.260.387 Bytes).
`LIESMICH.txt`, Statistikdefinitionen und `BUILD-MANIFEST.json` liegen bei.
GitHub `main` enthält diese Ergänzung noch nicht. Commit/Push betrifft den
Arbeitsbranch `codex/kongregate-leaderboards` und löst keinen Pages-Deploy aus.

## Offene Abnahme

Der Spielstart der echten Kongregate-Preview ist geprüft. Die tatsächliche Annahme
positiver Rekordwerte durch den Statistikserver und die sichtbaren Bestenlisten
sind noch nicht geprüft. Client-Statistiken
sind nicht vollständig gegen manipulierte lokale Saves geschützt. Kein Cloudsave.

Offizielle API-Verträge:
[JavaScript](https://docs.kongregate.com/docs/javascript-api),
[Statistiken](https://docs.kongregate.com/docs/concepts-statistics),
[Submit](https://docs.kongregate.com/reference/client-api-stats-submit).

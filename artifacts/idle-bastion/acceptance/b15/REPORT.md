# B15a — Taverne, Werkstatt II und Gebäudenamen

Stand: 19.10.2026. Nutzerauftrag: zuerst nur die Taverne, ohne Ilyra; zusätzlich echtes Werkstatt-II-Bild und Namen an den Gebäuden. Freischaltungen und Forschungsicons in der Roadmap ergänzt, keine vorgezogene Türme-/Figurenimplementierung.

## Ergebnis

- Taverne nach tatsächlich gewonnenem Boss 25, Preis 1.200 Gold. „Neu“ an Siedlung und Baukarte; optionaler Treffpunkt, offen als noch ohne Rekrutierung/Kampfbonus beschrieben.
- Freier gültiger Siedlungsplatz, direkter Bau mit einem Kartenklick, sichtbarer Staub/Aufbau und gespeicherter Besitz. Versetzen bei Pause. Alle bisherigen legalen Gebäudeanordnungen lassen einen Standort zu; eine zusätzliche südliche Hofreihe gilt nur für die Taverne.
- Eigenes Bild für Werkstatt II ersetzt den gezeichneten Anbau. Gebäudenamen erscheinen unter fertiger Werkstatt I/II, Lager I und Taverne. Keine leeren Platzhalter.
- Snapshot 19 übernimmt alte Stände; bestehendes Gold, Figuren und frei platzierte Gebäude bleiben erhalten. Ilyra ist separat B15b, erste spätere Rekrutierung ohne weiteren Goldkauf für Tavernenbesitzer.

## Kompakte Prüfung

Fünf gezielte Modell-/Speicherprüfungen in `tavern.test.ts` bestanden: tatsächliche Freischaltung und Kaufgrenzen; Schema-18-Migration und ungültiger Besitz; alle bisherigen legalen Gebäudeanordnungen; atomarer Kauf samt absichtlich fehlgeschlagener IndexedDB-Transaktion und Reload; Farmnachweis mit gebauter Taverne.

Vier vorhandene Regressionen geprüft: JSON-Speicherrundlauf, ungültige Ressourcen/neueres Schema, begehbare Gebäudehöfe, unmittelbare Speicherung von Bau/Versetzen/Verkauf. Die letzte Prüfung setzte bislang einen automatisch gesetzten Startturm voraus; ihre Fixture wurde auf einen ausdrücklich vorbereiteten Spielstand umgestellt und danach erfolgreich geprüft. Keine vollständige Testsuite oder erneute G2-Abnahme.

Produktionsbuild (`npm run idle:build`) einschließlich TypeScript erfolgreich. Desktop 1440 × 960/DPR 1 und Hochkant 430 × 932/DPR 2: echte Menüfolge, freier Kartenklick ohne zweite Bestätigung, sichtbarer Bau, korrekter Besitz nach Reload, keine JavaScript-Fehler. [Browserprotokoll](browser.json). Browser-Hochkant ist kein physischer Gerätetest.

Die Browserprobe beginnt mit einem über reguläre Modellkommandos erzeugten [Stand](fixture.json): guided-Verlauf, 1.000 simulierte Sekunden, Welle 32, Rekord 31, Boss 25 besiegt und 1.320 Gold vor dem Kauf. Das ist keine Behauptung von 16:40 Minuten durchgehendem Echtzeit-Browserspiel. Wisps dort noch offener Hinweis wurde für die Aufnahmen regulär bestätigt. Isolierte Probe-Datenbanken, keine Veränderung des echten Nutzerstandes.

## Aktuelle Aufnahmen

![Siedlung mit Taverne, Werkstatt II und Lager](desktop-built.png)

![Direkter Bau und sichtbare Konstruktion](desktop-construction.png)

<img src="mobile-built.png" alt="Gebäude in Hochkant" width="300"> <img src="mobile-offer.png" alt="Tavernenangebot in Hochkant" width="300">

## Assetherkunft

Zwei Imagegen-Generierungen: [Taverne samt vollständigem Prompt und Original](../../../../experiments/idle-bastion/assets/tavern/README.md), [Werkstatt II samt vollständigem Prompt und Original](../../../../experiments/idle-bastion/assets/workshop-ii/README.md). Technische Alpha-/Pixelaufbereitung reproduzierbar, Originale unverändert erhalten. Beide im tatsächlichen Spielmaßstab auf den obigen Ansichten geprüft.

## Veröffentlichung

Codecommit `d9f83d1fd41c3676c73f644e5356667f064f7269` auf `codex/idle-bastion-vertical-slice` gepusht. [GitHub-Pages-Lauf 39306506798](https://github.com/emfau88/TD/actions/runs/39306506798) erfolgreich. Am 19.10.2026 um 18:56 UTC stimmen die öffentlich ausgelieferten JS-/CSS-Dateien sowie Taverne und Werkstatt II bytegenau mit dem geprüften Produktionsbuild überein; [Dateien, Größen und SHA-256](public.json). [Öffentlich spielen](https://emfau88.github.io/TD/idle-bastion/).

# Tavernen-Preview: Packprüfung auf echten Pages-Artefakten

07.11.2026 · **bestanden**, einschließlich erneutem Packlauf nach der finalen Preview-Namespace-Härtung. Kein Deploy, Push, Commit oder Branchpolicy-Write in diesem Auftrag.

## Tatsächliche Eingaben

- Aktueller Remote-Main: `daf39fb7b13a05a78530b503fa45074b5f65c9de`.
- Erfolgreicher Main-Build und tatsächlich zuletzt erfolgreich veröffentlichtes Pages-Deployment verwenden beide [Run 42281846927](https://github.com/emfau88/TD/actions/runs/42281846927), Deployment-ID `7609204820`.
- Das echte `github-pages`-Artefakt wurde über `gh run download` einmal heruntergeladen und für beide Rollen getrennt entpackt. Artefakt-ID `13535457483`, API-Größe 103.515.687 Byte; entpacktes `artifact.tar` 113.346.560 Byte, SHA-256 `cc0e4313d6d7a625b645f5e56f6590f83b1b4a3cf64d6c1ede64c0dff6f4cb59`.
- Der Feature-Build stammt aus dem tatsächlichen `dist/` des isolierten Worktrees und enthält `tavern-test.html`, `tavern-counter-check.html` und die vier MC01-/MC02-/MC03-/MC05-MP4s. Die neue Kennung `spire-tavern-preview-v1` ist im finalen Build vorhanden. Dieser Test beurteilt die Verpackung; Browser-/Spielprüfung erfolgt separat durch Root.

Das lokale `HEAD` `eaf70419b3831807d4e4bdd242ac69f214c551bf` wurde nur als SHA-Testargument des Packagers verwendet. Das ist kein Nachweis eines bereits sauber committed oder veröffentlichten Feature-Builds; CI setzt später den tatsächlich gepushten `GITHUB_SHA` ein.

## Größen und Byteerhalt

| Baum | Dateien | Byte |
| --- | ---: | ---: |
| Tatsächlich veröffentlichter Main / geschützte Basis | 721 | 112.773.095 |
| Bereits vorhandene andere Previewdateien, Teil dieser Basis | 2 | 1.010 |
| Neu gepacktes `previews/tavern/`, einschließlich Provenienzdatei | 525 | 80.313.049 |
| Vollständige kombinierte Site | 1.246 | 193.086.144 |

Die 721 Basisdateien sind nach dem Packen **alle bytegleich**. Der kanonische SHA-256 des vollständigen ursprünglichen Dateimanifests bleibt `90bce6412744b3417c995150d5be4dab93570dcacd1dc389af8c9f39a91fba57`.

Die tatsächliche Veröffentlichung enthält momentan diese zwei anderen Previewdateien; beide bleiben mit ihrem ursprünglichen SHA erhalten:

- `previews/frost-hero/feature-check.html`: 509 Byte, SHA-256 `4af2b04638bbbf3ad23da4ef536342f185f2abcd807775b71e90c71c844f3fc7`.
- `previews/frost-hero/art-review/index.html`: 501 Byte, SHA-256 `83986b3f3304343253b95cbdde15da21fd7a3aaad54fcf06546ef800772f034e`.

Andere historische Previewpfade werden nicht als vorhanden erfunden. Eine frühere Turmvorschau fehlt bereits in dieser tatsächlich veröffentlichten Basis; der neue Packlauf entfernt keine solche Datei. Der separate synthetische Packtest hatte zusätzlich den Erhalt einer vorhandenen Tower-Preview geprüft.

Außerhalb von `previews/tavern/` gibt es keine neue, geänderte oder entfernte Datei. Die echte Branch-`dist/`-Eingabe ist nach dem Vorgang ebenfalls per vollständigem Dateimanifest unverändert. Main wurde nach dem letzten Packlauf erneut über GitHub abgefragt und blieb auf derselben SHA.

Die kombinierte Site ist rund **193,1 MB** groß. Die größte Einzeldatei ist das bestehende `assets/exploration-CiwinCny.mp3` mit 9.446.112 Byte. Gegenüber der dokumentierten maximalen veröffentlichten Pages-Sitegröße von 1 GB besteht hier kein numerisches Größenproblem; Deployment wurde damit nicht vorweggenommen. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Belege und verbleibender Veröffentlichungsschritt

[results.json](results.json) dokumentiert beide realen Artefaktrollen, Größen, Quell-IDs, Checks und den finalen Packbefehl. [main-files.json](main-files.json), [published-before-files.json](published-before-files.json), [branch-dist-files.json](branch-dist-files.json) und [combined-files.json](combined-files.json) halten jede Datei mit Größe/SHA fest. [package.log](package.log) enthält die Packagerausgabe. Der erste Lauf vor der zusätzlichen Namespace-Härtung bleibt separat als `pre-hardening-*` erhalten; der maßgebliche aktuelle Lauf trägt `phase: final-preview-build`.

Das heruntergeladene Main-Artefakt war gültig und nicht abgelaufen. Die API nennt als Ablauf **07.11.2026, 19:42:16 UTC**. Eine spätere Wiederholung nach dessen Ablauf benötigt wieder eine verfügbare, passende Main-Basis; die Pipeline soll dann fehlschlagen statt andere veröffentlichte Vorschauen zu verwerfen. Zum Prüfzeitpunkt fehlt kein benötigtes Artefakt.

Der geplante Veröffentlichungspfad bleibt `/previews/tavern/tavern-test.html`, daneben `/previews/tavern/tavern-counter-check.html`. Branchpolicy, Commit/Push, Workflow-Dispatch und tatsächliche Onlineprüfung führt Root gesondert durch. Alle hier erzeugten Dateien liegen ausschließlich im eigenen `preview-pack-test/`-Belegordner.

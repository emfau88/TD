# Tavernen-Darstellung vor den ComfyUI-Videos

Gesichert am 07.11.2026 aus Main `daf39fb7b13a05a78530b503fa45074b5f65c9de`.

`files/` enthält 253 unveränderte Dateien: sämtliche alten Tavernen-Rig-Atlanten,
Manifest und Porträts sowie Player, Layout, Preview, Zuordnung und Packskript.
`inventory.json` nennt Originalpfad, Größe und SHA-256 jeder Datei. Insgesamt
49.038.130 Byte einschließlich Code/Metadaten. Die Originaldateien und älteren
Zeichnungen/Rigs wurden nicht gelöscht. Dieses Verzeichnis liegt außerhalb der
Vite-Asset-Globs und wird nicht automatisch als Spielinhalt geladen.

Die Wiederherstellung wurde in ein separates temporäres Verzeichnis ausgeführt
und für jede Datei mit ihrem SHA-256 verglichen. Wiederholbare Prüfung ab Repo:

```powershell
python experiments/idle-bastion/scripts/prepare-tavern-video.py --verify-archive
```

Für eine spätere Wiederverwendung die benötigten Dateien aus `files/` an ihren
in `inventory.json` angegebenen Pfad kopieren. Der alte Atlasplayer bleibt auch
im Quellbaum für die historische `tavern-rig-check.html` erhalten. Die Hauptansicht
kann wieder eine Atlas-Präsentation erhalten, ohne die Spielstandversion oder
die Zuneigungsregeln zurückzusetzen. Kein vollständiges altes Spiel-Binary über
neuere Spielstände installieren.

Die Sicherung ist eingefroren. Nach Änderungen am aktuellen Renderer nur
`--verify-archive` ausführen; das Vorbereitungswerkzeug verweigert das Ersetzen
abweichender archivierter Dateien.

# Tavernen-Quellensicherung – 23.10.2026

Reduzierte Sicherung auf `codex/tavern-idle-smoothing`, aufbauend auf dem bereits veröffentlichten `f9c4fc3`. Der bisherige, nie erfolgreich gepushte Entwurf `ab9e5cf` wird mit ausdrücklicher Nutzerfreigabe ersetzt. Veröffentlichte Commits bleiben unverändert. Keine Spielintegration und kein Merge nach main.

## Vollständig erhaltene Quellen

- `experiments/idle-bastion/ANIMATIONS_INVENTAR.md` und aktuelle Roadmap.
- Mara: Original-Grafikvorlagen und Prompts; vollständiges finales Unity-Projekt `mara-proportions-v1/idle-rig/unity` mit PSB, Grafikebenen, Importmetadaten, nativen Sprite-Meshes, unveränderten Clips, Szene, Prefab, Controller und Exportcode. Maßgeblich ist `Assets/ProportionsNative/`.
- Ilyra: Kichern sowie akzeptierte Hüftgrundpose, Bewegung, Blinzeln und größere Hüfthand. Originalzeichnungen/Prompts und Unity-Dateien unter `ilyra-rig-prep/hip-v1/unity/Assets/{Clips,HipBaseV2,HipBaseBlink,HipHandSizeV2}` samt Buildern, Szenen, Prefabs und Importmetadaten.
- Herz-0–2-Testpaket: isoliertes Unity-Projekt, sechs vereinheitlichte Ilyra-Clips, Bedienung, HTML, Manifeste, Exportscripte, Zuordnungen und Tests.
- Bestehende JSON-Prüfberichte, Bewegungs-/Mesh-Messungen und Quellprüfsummen bleiben erhalten. Auch die großen bearbeitbaren YAML-Animationsclips bleiben unverändert in Git.

Grafiken/PSB-Dateien in den neuen Quellprojekten verwenden Git LFS. Bereits gespeicherte identische LFS-Objekte werden an mehreren Projektpfaden wiederverwendet; es entstehen dadurch keine doppelten Uploads. Kein neues Spielasset und keine neue LFS-Regel für über GitHub Pages ausgelieferte Produktionsassets.

## Nur lokal gespeicherte Ableitungen

Die lokale Dateistruktur und alle funktionierenden Vergleichsseiten bleiben vollständig erhalten. Aus der neuen Git-Auswahl entfernt werden lediglich 144 reproduzierbare Medienkopien: 441,8 MB WebP-Atlanten, 24,9 MB GIF/Video und 9,0 MB Prüfbilder. Keine davon war im veröffentlichten Vorgängercommit enthalten. Neue PNG-Einzelbildreihen, GIF-Zwischenbilder und die 314-MB-Atlanten des Herz-2-Testpakets waren bereits ausgeschlossen. Unity-Caches, verworfene Übergangsversuche und fremde Audioarbeiten bleiben lokal.

Nach einem frischen Checkout enthalten die neuen Vorschauseiten daher zunächst nur ihre Steuerung/Manifeste. Die Medien werden bei Bedarf aus den gesicherten Quellen neu exportiert. Dies ist eine Quellensicherung, kein fertiges Web-Produktionspaket. Ältere READMEs beschreiben den vollständigen lokalen Arbeitsstand; für den Sicherungsumfang gilt dieses Dokument.

## Wiederherstellung

1. Branch auschecken und `git lfs pull` ausführen. Unity 6000.4.0f1 verwenden; `Assets`, `.meta`, `Packages` und `ProjectSettings` sind enthalten. Caches werden neu erzeugt.
2. Mara M01: Unity mit `-batchmode -projectPath <idle-rig/unity> -executeMethod BackupIdleExport.Run -spire-export -logFile <Logpfad>` starten. Der Helfer öffnet die gespeicherte finale Szene und exportiert beide Versionen, ohne Sprite-Assets neu aufzubauen. Danach `python artifacts/idle-bastion/mara-proportions-v1/idle-rig/pack.py`.
3. Ilyras gespeicherte Szenen können mit dem vorhandenen `IlyraHeadExport` erneut ausgegeben werden: Unity mit `-projectPath <hip-v1/unity> -spire-export` öffnen, die gewünschte Szene laden und Play drücken. Der Exporter nutzt die gespeicherte Kamera, den Clip und `outputBase` und beendet den Editor nach Abschluss. Szenen: `Assets/IlyraGiggle.unity`, `Assets/HipBaseV2/IlyraHandOnHip.unity`, `Assets/HipBaseBlink/IlyraHandOnHipBlink.unity`, `Assets/HipHandSizeV2/IlyraHandOnHipHandSize.unity`. Für den vollständigen Hüftvergleich zuerst Motion, dann Blink, dann Hand exportieren und die jeweiligen `pack.py` in derselben Reihenfolge ausführen. Die ursprünglichen Builder bleiben für die Bearbeitung erhalten; zum reinen Re-Export muss das Rig nicht neu aufgebaut werden.
4. Herz-2-Testpaket: `-batchmode -projectPath <tavern-hearts-0-2/unity> -executeMethod ExportTavern.Run -spire-export -logFile <Logpfad>`; danach dessen `pack.py` und `verify.py`. `prepare_unity.py` nicht über das bereits vorhandene Projekt laufen lassen. Mara verwendet die zuvor veröffentlichten Einzelvorschauen, Ilyra die neu ausgegebenen PNGs. Mit `node --test artifacts/idle-bastion/tavern-hearts-0-2/playback.test.mjs` die Bedienlogik prüfen.
5. Die vorhandenen HTML-Seiten über einen lokalen HTTP-Server öffnen. Ihre relativen Ordnerbezüge erhalten.

## Zusätzliche lokale Sicherung vor der Bereinigung

- Branch `codex/tavern-backup-ab9e5cf` zeigt unverändert auf den ursprünglichen Commit.
- `backups/tavern-ab9e5cf-20261023/unpublished-commit.bundle` enthält den Git-Delta-Verlauf; Voraussetzung ist der unveränderte veröffentlichte Commit `f9c4fc3`.
- `backups/tavern-ab9e5cf-20261023/working-files-full-quality.zip` enthält die vollständigen 583 ausgewählten Arbeitsdateien einschließlich echter LFS-Bildinhalte, nicht nur Pointer. ZIP und sämtliche SHA-256-Werte wurden geprüft; `verification.json` dokumentiert sie.
- `tavern-backup-current.json` bleibt als eingefrorene Auswahl/Hashliste des alten Entwurfs erhalten. Die aktuelle Auswahl und Größen stehen in `tavern-backup-reduced.json`; ursprüngliche Größen in `tavern-backup-size-audit.json`.

[Größenübersicht](TAVERN_BACKUP_GROESSEN.md). An Rigs, Grafiken, Clips, main oder englischer Übersetzung wurde bei der Reduzierung nichts geändert. Mara M02/M03 bleibt zurückgestellt; keine neue Animationsproduktion begonnen.

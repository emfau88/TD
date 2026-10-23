# Tavernenanimationen – Branch-Sicherung

Am 23.10.2026 ausdrücklich vom Nutzer beauftragt. Branch: codex/tavern-idle-smoothing; Basis 76c114e. Kein Merge/Push nach main und keine Spielintegration. Die Sicherung ist keine visuelle Freigabe der enthaltenen Studien. Status und verworfene/pausierte Ansätze siehe zentrale ROADMAP.md.

Enthalten: Mara-/Ilyra-Grafikstudien, Ruhevorlagen, PSB-Ebenen, Unity-Assets samt Metadaten, Scripts, Szenen/Prefabs, Animationsclips, Package- und Projekteinstellungen, Render-/Packskripte, transparente Einzelbilder, verlustfreie Atlanten, GIF-/Videovorschauen, HTML-Vergleiche und Prüfberichte. Umfang der Verzeichnisse in tavern-backup-scopes.json. Zusätzlich die getrennten Review-Seiten und deren TypeScript/CSS/Skripte unter experiments/idle-bastion. Frühere Varianten bleiben erhalten, einschließlich anatomisch abgelehnter Armproben.

Nicht enthalten: wiederaufbaubare Unity-Library/Temp/Logs/UserSettings/obj und IDE-Projektdateien; schon vorher ignorierte Unity-Export-Zwischenordner sowie lokale Serverlogs bleiben unverändert auf dem Rechner. Keine dieser Dateien wurde gelöscht. Fremde Audio-Proben und .codex-remote-attachments sind nicht Teil der Animationssicherung.

Große Binärdateien liegen in Git LFS. Für vollständige Wiederherstellung Git LFS installieren, den Branch klonen/auschecken und `git lfs pull` ausführen. Die GitHub-Quell-ZIP allein enthält gegebenenfalls nur LFS-Zeiger. Unity-Projekte mit der in ProjectSettings/ProjectVersion.txt angegebenen Editorversion öffnen; Packages werden anhand der Manifeste wiederhergestellt. Die Arbeitsprojekte für die jüngsten Ilyra-Proben liegen in ilyra-rig-prep/hip-v1/unity.

Lokale Vorschau: aus dem Repository-Wurzelverzeichnis `python -m http.server 5221 --bind 127.0.0.1 --directory artifacts/idle-bastion/ilyra-rig-prep`. Danach /mini-hop-v3/preview/comparison.html öffnen. Die Verzeichnisstruktur erhalten, da ältere Idle-Atlanten relativ referenziert werden. Mara entsprechend mit mara-rig-v2 als Serverwurzel öffnen. Neueste Physikprobe: mini-hop-v3/README.md; zwei Vorgänger separat erhalten.

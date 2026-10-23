# Größe der Tavernen-Quellensicherung

Geprüft am 23.10.2026. MB sind dezimale Millionen Bytes. Die entpackten Dateien eines Commits sind nicht gleichbedeutend mit der neu übertragenen Datenmenge.

| Inhalt des unveröffentlichten Entwurfs `ab9e5cf` | Größe | Entscheidung |
| --- | ---: | --- |
| Unity-Quellen: Rig, PSB/Grafikebenen, Szenen, Prefabs, Clips, Importdaten, Projekteinstellungen | 279,4 MB | Vollständig und unverändert sichern |
| Grafikvorlagen außerhalb Unity | 9,1 MB | Originalqualität sichern |
| Reproduzierbare WebP-Atlanten | 441,8 MB | Nur lokal, aus Quellen neu erzeugbar |
| GIF-/Videokopien | 24,9 MB | Nur lokal |
| Dokumentation, HTML/Scripte, Manifeste, Prüfnachweise | 14,2 MB | Texte/Messungen behalten, 9,0 MB Prüfbilder nur lokal |
| **Gesamt vorher** | **769,4 MB** | |
| **Quellen und verbleibende Unterlagen** | **ca. 293,9 MB** | Entpackte Größe einschließlich dieser Auditdateien |

Die 441,8 MB Atlanten verteilen sich auf Ilyras ursprüngliche Hüftbewegung (134,5 MB), deren korrigierte Handfassung (134,4 MB), ergänzende Blinkatlanten (24,1 MB), Kichern (62,2 MB) und Maras M01-Vergleich (86,5 MB). Es werden 144 neu hinzugekommene Medienkopien mit zusammen **475,7 MB** aus der Git-Auswahl genommen. Keine lokale Datei wird gelöscht. Weitere ca. 1,94 GB PNG-/GIF-Zwischenreihen und Herz-2-Testexporte waren schon vorher ausgeschlossen; Unity-Caches ebenfalls.

## Was tatsächlich neu hochgeladen wird

Der Entwurf hätte **482,9 MB neue eindeutige LFS-Inhalte** benötigt. Nach der Reduzierung bleiben davon nur **9,84 MB notwendige Quellen**. Bereits vorhandene gleiche Texturen/PSB-Dateien verwenden denselben Git-LFS-Inhalt, auch wenn mehrere Unity-Projekte sie unter eigenen Pfaden benötigen.

Der übrige neue Git-Inhalt ist überwiegend stark komprimierbarer Text. Das lokale Sicherungsbundle des bisherigen Commits ist nur **4,52 MB** groß, obwohl die entpackten Clips und Rig-Daten viel größer sind. Zusammen ergibt sich eine erwartete neue Übertragung von ungefähr **14–15 MB**, zuzüglich kleiner Protokollanteile. **Push bestätigt:** Commit `785ea45f54e763bcb8a921716cfa18ee0443e8de` liegt auf GitHub auf `codex/tavern-idle-smoothing`; alle 9 neuen LFS-Objekte (9.840.838 Bytes) wurden übertragen. Das reduzierte Git-Bundle umfasst 4.485.244 Bytes, zusammen also rund **14,3 MB** neue Sicherungsdaten. Dies ist keine Aussage über die Größe eines vollständigen erstmaligen Repository-Downloads.

Die beiden jeweils ca. 32 MB großen `.anim`-Clips sind bearbeitbare YAML-Quellen. Sie bleiben erhalten und werden von Git komprimiert. Sie werden nicht als verlustbehaftete Vorschau behandelt.

## Qualität und Sicherheit

- Keine Auflösung, Bildrate, Grafikqualität, Meshes oder Bewegungskurven verändert. Alle 350 ausgewählten Unity-/Bildquelldateien stimmen per SHA-256 mit dem gesicherten Ausgangsstand überein.
- Ein Test mit animiertem verlustfreiem WebP bei unveränderter Mara-Auflösung und 30 fps ergab 53,46 MB und damit keinen Vorteil gegenüber der vorhandenen Atlasreihe. Der Test bleibt ausschließlich lokal im Backupordner. Nach Nutzerpräzisierung keine weiteren Kompressionsversuche; die kleine Quellensicherung genügt.
- Originalcommit zusätzlich unter `codex/tavern-backup-ab9e5cf`, als geprüftes Git-Bundle und mit echten Bildinhalten im geprüften lokalen ZIP erhalten. Nur der nachweislich unveröffentlichte Commit wird ersetzt; keine veröffentlichte Historie und kein main-Ref wird verändert. Normaler Fast-forward-Push auf den Tavernenbranch, kein Force-Push.
- Neue LFS-Nutzung ausschließlich für notwendige Bild-/PSB-Quellen der Experimente. Keine neue LFS-Datei für direkt über GitHub Pages ausgelieferte Spielassets.
- Die lokalen Vorschauen funktionieren mit ihren unveränderten Medien weiter. Ein frischer Checkout erzeugt die ausgelassenen Medien bei Bedarf erneut; HTML, Manifeste und Exportcode bleiben erhalten.

[Sicherungsumfang und Wiederherstellung](TAVERN_BACKUP_CURRENT.md) · [ursprüngliche Größenmessung](tavern-backup-size-audit.json) · [aktuelle Auswahl und Erhaltungsnachweise](tavern-backup-reduced.json).

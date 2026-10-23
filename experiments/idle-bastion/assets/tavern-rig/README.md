# Neue Tavernenfiguren – kompakte Prüffassung

15 vorhandene Animationen: Mara M01–M08 und sieben Ilyra-Bewegungen einschließlich der separat freigegebenen Hüftpose. Keine neuen Bewegungen oder Grafikvorlagen. Abnahmen und Integrationsauftrag werden in der zentralen `ROADMAP.md` geführt.

- 1.848 Frames, unverändert 30 fps und ursprüngliche Clipdauer.
- Einheitlicher Ausschnitt 480 × 700, acht Frames je Atlas (1920 × 1400).
- WebP RGB verlustbehaftet, Qualität 90, Methode 5; Alpha pixelgenau unverändert gegenüber der vorbereiteten Darstellung.
- Animationsatlanten: **114.554.104 Byte** statt 532.347.634 Byte der ausgewählten Ausgangsexporte (**78,5 % weniger**). Hinzu kommen Manifest und zwei kleine Übersichtsporträts.
- Die Ersparnis umfasst Kompression, den im Rahmen verdeckten unteren Bildbereich und die Anpassung der drei höher aufgelösten Zusatzposen auf dieselbe Spielauflösung. Sie ist keine reine Codec-Ersparnis bei identischer Auflösung aller Quellen.
- Jede Pose behält ihren zeitlichen Ablauf und Körperanker. Mara sitzt 48 Bildpixel, Ilyra 30 Bildpixel höher als in der ersten Integrationsprobe. Für beide bleibt eine kleine Reserve unter dem Ausschnitt plus Vordergrundrahmen.
- Originalgrafiken, Unity-Projekte, Clips und ältere Exporte sind erhalten. Diese Dateien sind Ableitungen, keine neuen Master.
- Normale Git-Dateien: keine Git-LFS-Zeiger für direkt ausgelieferte Bilder.

Erzeugen: `python experiments/idle-bastion/scripts/pack-tavern-rig.py`, danach bei Bedarf `python artifacts/idle-bastion/tavern-integration-v1/prepare-portraits.py`. Benötigt die lokal erhaltenen bzw. aus den gesicherten Unity-Quellen reproduzierten Prüfatlanten. Quellenzuordnung ist im Exportskript vollständig angegeben; vorhandene Quellen werden nicht überschrieben.

Die lokale Abnahme verwendet `tavern-rig-check.html` mit der echten `TavernUI` und einem temporären `BattleSession` ohne persistierenden Store. Die reguläre Spiel-Einstiegsdatei verwendet bis zur weiteren Integrationsfreigabe weiterhin die bisherigen Animationen. Das neue Paket wird dort nicht vorab geladen.

Details und Messwerte: `artifacts/idle-bastion/tavern-integration-v1/README.md` und `runtime-size-report.json`.

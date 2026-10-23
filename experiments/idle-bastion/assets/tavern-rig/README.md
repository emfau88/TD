# Neue Tavernenfiguren – kompakte Prüffassung

15 vorhandene Animationen: Mara M01–M08 und sieben Ilyra-Bewegungen einschließlich der separat freigegebenen Hüftpose. Keine neuen Bewegungen oder Grafikvorlagen. Abnahmen und Integrationsauftrag werden in der zentralen `ROADMAP.md` geführt.

- 1.848 Frames, unverändert 30 fps und ursprüngliche Clipdauer.
- Einheitlicher Ausschnitt 480 × 700, acht Frames je Atlas (1920 × 1400).
- WebP RGB verlustbehaftet, Qualität 30, Methode 5; Alpha pixelgenau unverändert gegenüber der vorbereiteten Darstellung.
- Animationsatlanten: **48.631.068 Byte** (Mara 23.736.076, Ilyra 24.894.992). Zuvor Qualität 90: 114.554.104 Byte; Qualität 60: 64.260.840 Byte. Gegenüber Qualität 60 nochmals **24,32 % weniger**. Hinzu kommen Manifest und zwei kleine Übersichtsporträts.
- Die Ersparnis umfasst Kompression, den im Rahmen verdeckten unteren Bildbereich und die Anpassung der drei höher aufgelösten Zusatzposen auf dieselbe Spielauflösung. Sie ist keine reine Codec-Ersparnis bei identischer Auflösung aller Quellen.
- Jede Pose behält ihren zeitlichen Ablauf und Körperanker. Mara sitzt 48 Bildpixel, Ilyra 30 Bildpixel höher als in der ersten Integrationsprobe. Für beide bleibt eine kleine Reserve unter dem Ausschnitt plus Vordergrundrahmen.
- Originalgrafiken, Unity-Projekte, Clips und ältere Exporte sind erhalten. Diese Dateien sind Ableitungen, keine neuen Master.
- Normale Git-Dateien: keine Git-LFS-Zeiger für direkt ausgelieferte Bilder.

Erzeugen: `python experiments/idle-bastion/scripts/pack-tavern-rig.py`, danach bei Bedarf `python artifacts/idle-bastion/tavern-integration-v1/prepare-portraits.py`. Benötigt die lokal erhaltenen bzw. aus den gesicherten Unity-Quellen reproduzierten Prüfatlanten. Quellenzuordnung ist im Exportskript vollständig angegeben; vorhandene Quellen werden nicht überschrieben.

Die lokale Abnahme verwendet `tavern-rig-check.html` mit der echten `TavernUI` und einem temporären `BattleSession` ohne persistierenden Store. Nach ausdrücklicher Integrationsfreigabe verwendet auch `src/main.ts` diese Präsentation. Bildatlanten werden erst bei Bedarf geladen. Der bisherige Renderer und sämtliche alten Assets bleiben für historische Vorschauen erhalten; das Hauptspiel verwendet sie nicht mehr als Tavernenfiguren.

Details und Messwerte: `artifacts/idle-bastion/tavern-integration-v1/README.md` und `runtime-size-report.json`.

Die Qualität-30-Fassung wurde nach einem Vergleich der Stufen 60/30/10 ausdrücklich gewählt. Alle ursprünglichen Exporte und die lokalen Qualität-90/60-Kopien bleiben erhalten. Reproduktion anderer Qualitätsstufen über `--quality`, separater Ausgabeordner über `--output` und Bericht über `--report`.

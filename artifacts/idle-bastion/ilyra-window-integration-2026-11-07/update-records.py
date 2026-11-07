"""Reconcile the approved, integrated IF01–IF05 delivery in the existing docs."""
from pathlib import Path
import json,shutil
HERE=Path(__file__).resolve().parent;WT=HERE.parents[2];ROOT=Path('C:/Users/madde/Documents/TowerDefense')
current='''**Taverne · 07.11.2026 — IF01–IF05 freigegeben und integriert; gemeinsame Main-Übernahme beauftragt.**

- [x] IF05 ausdrücklich freigegeben. Alle fünf nativen Fensterclips unverändert eingebunden, einschließlich ruhiger IF01-v2; keine weiteren Renderings.
- [x] Ilyra für bereits verdientes Herz 4/5 über Sprechen → Zum Fenster, eigene Ruhe/Gespräch/Haare/Schulter/Hand, passende Herzen und bestehender Stimmenpool. IF06/IF07 fehlen: Lachen/Annäherung am Fenster ausgeblendet, am bisherigen Platz erhalten. Die aktuelle Einbauanweisung ersetzt das frühere Warten auf alle sieben Clips.
- [x] 32/32 gezielte Tests, TypeScript/Produktionsbuild, beide Figuren auf Desktop/Handy in DE/EN, 18.316 Anzeigeframes ohne beobachtete schwarze Ränder oder Größenwechsel; Rückblicke/Rückkehr/Reload, Ladefehler/Wiederholung, Stimmen und Abbruch geprüft. [Nachweise](../../artifacts/idle-bastion/ilyra-window-integration-2026-11-07/REPORT.md).
- [x] Aktuellen Main abgeglichen/übernommen: Frost-/Scharfschützenkorrekturen bereits enthalten. Gesamter offener Tavernen-Laufzeitstand einschließlich Mara MC01–MC07 wird gemeinsam übernommen; historische Rig-Archivbranches bleiben erhalten.
- [ ] Gemeinsamen Stand nach Main pushen und öffentlichen Deploy prüfen.

'''
for repo in [WT,ROOT]:
    p=repo/'experiments/idle-bastion/ROADMAP.md';s=p.read_text(encoding='utf-8');s=s.replace('\n\n','\n\n'+current,1)
    s=s.replace('IF01–IF04 freigegeben / IF05 zur Abnahme / Renderstopp.','IF01–IF05 freigegeben und integriert / Renderstopp.')
    s=s.replace('Nutzerfreigabe offen. Renderstopp umgesetzt; IF06 nur vorbereitet, Start ausdrücklich gesperrt. Kein Ilyra-Spieleinbau.','Vom Nutzer freigegeben und anschließend integriert. Renderstopp umgesetzt; IF06 nur vorbereitet, Start ausdrücklich gesperrt.')
    p.write_text(s,encoding='utf-8')
    p=repo/'experiments/idle-bastion/docs/TAVERNE_AUSBAUPLAN_2026-11-06.md';s=p.read_text(encoding='utf-8')
    s=s.replace('IF05/Hand(3,04s) ist ebenfalls fertig/geprüft, Nutzerfreigabe offen.','IF05/Hand(3,04s) ist ebenfalls geprüft und ausdrücklich freigegeben.')
    s=s.replace('Keine Ilyra-Spielintegration.','IF01–IF05 auf ausdrücklichen Nutzerauftrag als Fenster-Basisset integriert; fehlende IF06/IF07-Aktionen am Fenster ausgeblendet, am bisherigen Platz erhalten. Gemeinsame Main-Übernahme beauftragt.')
    s=s.replace('Bulk 6 besitzt fünf isolierte Ilyra-Proben IF01–IF05; IF01–IF04 freigegeben, IF05 zur Abnahme.','Bulk 6 besitzt fünf freigegebene und integrierte Ilyra-Clips IF01–IF05; Lachen/Annäherung am Fenster bleiben offen.')
    s=s.replace('gemeinsame Fensterreferenz und IF01–IF04 ausdrücklich freigegeben; IF05 fertig zur Abnahme. Renderstopp auf Nutzerwunsch; IF06 nicht starten. Kein Spieleinbau.','gemeinsame Fensterreferenz und IF01–IF05 ausdrücklich freigegeben und integriert. Renderstopp auf Nutzerwunsch; IF06 nicht starten.')
    s=s.replace('freigegeben, nicht eingebaut','freigegeben, eingebaut').replace('IF05 · Hand · fertig, Freigabe offen','IF05 · Hand · freigegeben, eingebaut')
    s=s.replace('**Aktueller Teilauftrag erledigt:** Mara MC01–MC07 freigegeben und ortstreu integriert; anschließend IF01–IF03 einzeln nacheinander erstellt und geprüft. **Nächster offener Schritt:** Nutzerfreigabe der drei Ilyra-Proben. IF04–IF07, neue Herz-4-Fortschrittsstrecke und Herz 5 bleiben zurückgestellt; keine automatische weitere Produktion.','**Aktueller Teilauftrag erledigt:** Mara MC01–MC07 und Ilyra IF01–IF05 freigegeben und ortstreu integriert. Beide neuen Orte sind für früher verdiente vier/fünf Herzen erreichbar. Neue Herz-4-Fortschrittsstrecke, IF06/IF07 und Herz 5 bleiben zurückgestellt; keine automatische weitere Produktion.')
    s=s.replace('Abhängig von der vollständigen Mara-Probe. Gemeinsame Herz-4-Veröffentlichung erst mit beiden vollständigen Sets.','Abhängig von der vollständigen Mara-Probe. Neuere Nutzeranweisung vom07.11.: vorhandenes Fenster-Basisset IF01–IF05 jetzt einbauen und gemeinsam mit Mara nach Main übernehmen. Das vollständige Herz-4-Ausbaupaket samt IF06/IF07 und neuem Fortschritt bleibt offen.')
    s=s.replace('IF05/Hand fertiggestellt/geprüft und in isolierter Testansicht bereitgestellt; 3,04s. Nutzerfreigabe offen. Neueste Nutzeranweisung umgesetzt: danach stoppen. IF06 bleibt nur vorbereitet; kein Renderstart. IF07 und spätere Etappen bleiben zurückgestellt. Keine Fenster-Integration.','IF05/Hand (3,04s) fertig/geprüft und ausdrücklich freigegeben. IF01–IF05 anschließend auf Nutzerauftrag im Fensterort integriert; kein weiterer Renderstart. IF06/IF07 und spätere Etappen bleiben zurückgestellt.')
    s=s.replace('- [ ] Alte Herz-4-/5-Saves erhalten den nun verfügbaren Ort ohne erneuten Grind. Früher ungesehene neue Inhalte optional anbieten; keine bereits verdienten Punkte abziehen.','- [x] Alte Herz-4-/5-Saves erhalten beide vorhandenen Orte ohne erneuten Grind; Punkte bleiben erhalten. Neue Einladungsbegegnungen folgen erst mit der offenen Fortschrittsstrecke.')
    s=s.replace('- [ ] Beide Szenen samt aller Aktionen in echter Oberfläche prüfen; fehlende Downloads dürfen kein gemischtes Szenenset erzeugen.','- [x] Beide Szenen samt tatsächlich vorhandener Aktionen in echter Oberfläche geprüft; fehlende Downloads erhalten den alten Ort. Nicht produzierte IF06/IF07-Gesten bleiben am Fenster verborgen.')
    s=s.replace('IF01–IF04 sind erstellt/geprüft und freigegeben, IF05 fertig zur Abnahme; ab IF06 gilt Renderstopp. Fenster-Integration und spätere Etappen bleiben Zukunft.','IF01–IF05 sind erstellt/geprüft, freigegeben und eingebaut; ab IF06 gilt Renderstopp. Neue Fortschrittsstrecken und spätere Etappen bleiben Zukunft.')
    p.write_text(s,encoding='utf-8')
    p=repo/'README.md';s=p.read_text(encoding='utf-8')
    s=s.replace('IF01–IF04 freigegeben, IF05 zur Abnahme; Ilyra weiterhin nicht im Spiel.','IF01–IF05 freigegeben und als Fensterort integriert. [Ilyra: Einbau und Desktop-/Handyprüfung](artifacts/idle-bastion/ilyra-window-integration-2026-11-07/REPORT.md).')
    s=s.replace('Alle sieben Mara-Tresenclips sind freigegeben und als zusammengehörige Szene eingebunden.','Alle sieben Mara-Tresenclips und fünf Ilyra-Fensterclips sind freigegeben und als zusammengehörige Orte eingebunden.')
    s=s.replace('„Früher verdiente 4 Herzen“ und Mara wählen, dann **Sprechen → Zum Tresen**.','„Früher verdiente 4 Herzen“ und Mara oder Ilyra wählen, dann **Sprechen → Zum Tresen / Zum Fenster**.')
    s=s.replace('Dieser neue Stand ist noch nicht auf Main veröffentlicht; der neue Fortschritt von Herz 3 auf 4 bleibt offen.','Die gemeinsame Main-Übernahme ist beauftragt; der neue Fortschritt von Herz 3 auf 4 bleibt offen. Veröffentlichung siehe Roadmap.')
    p.write_text(s,encoding='utf-8')
report=WT/'artifacts/idle-bastion/ilyra-window-probes-2026-11-07/REPORT.md';s=report.read_text(encoding='utf-8')
s=s.replace('**Aktueller Stand:** IF01 (korrigierte v2), IF02, IF03 und IF04 ausdrücklich freigegeben. IF05 fertig zur Abnahme.','**Aktueller Stand:** IF01 (korrigierte v2), IF02, IF03, IF04 und IF05 ausdrücklich freigegeben und auf anschließenden Nutzerauftrag integriert.')
s=s.replace('Kein Ilyra-Spieleinbau.','[Integrationsnachweis](../ilyra-window-integration-2026-11-07/REPORT.md).')
s=s.replace('Keine Integration ins Spiel.','Die folgende Beschreibung dokumentiert die ursprüngliche Clipproduktion vor der beauftragten Integration.')
s=s.replace('native Fassung, Freigabe offen','native Fassung, freigegeben').replace('IF05 bleibt eine Sichtprobe zur Nutzerfreigabe.','IF05 wurde anschließend ausdrücklich freigegeben.')
report.write_text(s,encoding='utf-8')
preview=WT/'artifacts/idle-bastion/tavern-scene-preview-2026-11-07'
for name in ['source.html','README.md','build.py']:
    p=preview/name;s=p.read_text(encoding='utf-8')
    s=s.replace('IF01–IF04 sind freigegeben; IF05 steht zur Beurteilung. Ilyras Fensterszene ist noch nicht ins Spiel eingebaut.','IF01–IF05 sind freigegeben und im Spiel integriert.')
    s=s.replace('IF01–IF04 und alle Mara-Clips freigegeben; IF05 zur Beurteilung.','IF01–IF05 und alle Mara-Clips freigegeben und im Spiel integriert.')
    s=s.replace('Ilyras Fensterset ist weiterhin nicht ins Spiel eingebaut.','[Ilyras Fensterset ist jetzt ebenfalls integriert und geprüft](../ilyra-window-integration-2026-11-07/REPORT.md).')
    s=s.replace('Die isolierte Vorschau ist kein Nachweis für Ilyras noch ausstehende Spielintegration.','Die tatsächliche Spielintegration wurde separat geprüft; diese Seite bleibt eine stumme Sichtprobe.')
    s=s.replace('IF05: Handreaktion, noch zur Freigabe.','IF05: freigegebene Handreaktion.').replace("glob('*_ComfyUI.mp4')),i<5)","glob('*_ComfyUI.mp4')),True)")
    p.write_text(s,encoding='utf-8')
print('Approval, scope, checklist and preview records updated.')

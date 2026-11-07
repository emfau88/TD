"""Record the verified release and mirror task documents to the user's older checkout."""
from pathlib import Path
import json,shutil
HERE=Path(__file__).resolve().parent;WT=HERE.parents[2];ROOT=Path('C:/Users/madde/Documents/TowerDefense')
deploy=json.loads((HERE/'deploy.json').read_text(encoding='utf-8-sig'))
public=json.loads((HERE/'public/results.json').read_text(encoding='utf-8'))
assert deploy['conclusion']=='success' and deploy['headSha'].startswith('6a2e9fc5') and public['passed']
url=deploy['url'];frames=sum(r['frames'] for r in public['results'])
statement=f'Code `6a2e9fc5` gemeinsam auf Main/Arbeitsbranch gepusht; [GitHub Pages {deploy["databaseId"]}]({url}) erfolgreich. Öffentliche Spielseite anschließend mit beiden Figuren bei1280/390px inDE/EN geprüft: {frames:,} Anzeigeframes, vorhandene Reaktionen, Rückblicke/Rückkehr und Reload ohne beobachtete schwarze Rahmen, Größenwechsel oder Browser-/HTTP-Fehler. [Öffentliche Messungen](public/results.json).'
p=HERE/'REPORT.md';s=p.read_text(encoding='utf-8').replace('Main-Push und öffentlicher Deploy: Nachweis wird nach Abschluss ergänzt.',statement);p.write_text(s,encoding='utf-8')
for repo in [WT,ROOT]:
    p=repo/'experiments/idle-bastion/ROADMAP.md';s=p.read_text(encoding='utf-8')
    s=s.replace('IF01–IF05 freigegeben und integriert; gemeinsame Main-Übernahme beauftragt.','IF01–IF05 freigegeben und integriert; gemeinsamer Tavernenstand auf Main veröffentlicht.')
    s=s.replace('- [ ] Gemeinsamen Stand nach Main pushen und öffentlichen Deploy prüfen.',f'- [x] Gemeinsamer Stand `6a2e9fc5` auf Main und Arbeitsbranch gepusht; [Pages {deploy["databaseId"]}]({url}) erfolgreich. Öffentliche DE/EN-Spielprobe mit beiden Figuren auf Desktop/Handy, lokalen Reaktionen, Rückblicken und Reload bestanden. Code enthält auch alle bereits veröffentlichten Turmkorrekturen.')
    p.write_text(s,encoding='utf-8')
    p=repo/'experiments/idle-bastion/docs/TAVERNE_AUSBAUPLAN_2026-11-06.md';s=p.read_text(encoding='utf-8')
    s=s.replace('Gemeinsame Main-Übernahme beauftragt.',f'Gemeinsam mit Mara als `6a2e9fc5` nach Main übernommen; [Pages]({url}) und öffentliche Desktop-/Handyprobe erfolgreich.')
    marker='## Aktueller Umsetzungsstand · 07.11.2026\n\n'
    s=s.replace(marker,marker+f'- [x] **Mara MC01–MC07 und Ilyra IF01–IF05 gemeinsam auf Main veröffentlicht.** Code `6a2e9fc5`, [Pages]({url}) erfolgreich; beide Orte öffentlich auf Desktop/Handy geprüft. Lachen/Annäherung fehlen nur am Fenster, neue Herz-4-/5-Fortschrittsstrecken bleiben offen. Weitere Renderings gestoppt. [Nachweis](../../../artifacts/idle-bastion/ilyra-window-integration-2026-11-07/REPORT.md).\n\n',1)
    s=s.replace('auf dem neuen Arbeitsbranch als vollständige Tresenszene geprüft','auf Main als vollständige Tresenszene veröffentlicht und geprüft')
    p.write_text(s,encoding='utf-8')
    p=repo/'README.md';s=p.read_text(encoding='utf-8')
    s=s.replace('**Neuer Arbeitsstand `codex/tavern-counter-completion`:**','**Auf Main veröffentlicht (`6a2e9fc5`):**')
    s=s.replace('Die gemeinsame Main-Übernahme ist beauftragt; der neue Fortschritt von Herz 3 auf 4 bleibt offen. Veröffentlichung siehe Roadmap.',f'[Pages-Deploy]({url}) und öffentliche Desktop-/Handyprobe erfolgreich. Der neue Fortschritt von Herz 3 auf 4 bleibt offen; die Orte sind für bereits verdiente vier/fünf Herzen erreichbar.')
    p.write_text(s,encoding='utf-8')
for folder in ['ilyra-window-integration-2026-11-07','tavern-scene-preview-2026-11-07']:
    shutil.copytree(WT/'artifacts/idle-bastion'/folder,ROOT/'artifacts/idle-bastion'/folder,dirs_exist_ok=True)
for i in range(1,6):
    relative=Path(f'artifacts/idle-bastion/ilyra-window-probes-2026-11-07/IF{i:02}/verification.json');shutil.copy2(WT/relative,ROOT/relative)
print(f'Release and public verification recorded ({frames} sampled frames).')

import { discoveryStep, updateDiscoveryUI } from './discovery-ui';
import { LessonPointer } from './lesson-pointer';
import { updateOnboarding } from './onboarding-ui';
import { introducedEnemy } from './enemy-roster';
import { MARA } from './mara';
import { syncIlyraUI } from './ilyra-ui';
import type { BuildingId, GridCell } from './layout';
import Phaser from 'phaser';
import { bossEncounter } from './boss';
import './battle.css';
import './progress.css';
import './premium.css';
import { mountUIIcons } from './ui-icons';
import { SETTLEMENT, towerDefinition, type TowerId, stats, upgradeCost, sellValue, type IdleBattle } from './battle';
import { BattleScene } from './battle-scene';
import { nextObjective, tutorialHint, tutorialStep } from './hud';
import { BattleSession, SessionLoadError, SessionOwnershipError } from './battle-session';
import { openBattleStore, type BattleSaveStore } from './save-store';
import { offlinePolicy, WAREHOUSE_OFFLINE } from './offline';
import { farmRewardGold } from './farming';
import { ART } from './art';
import { drawDockArt } from './dock-art';
import { createProgressUI, recommendedUpgrade } from './progress-ui';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing battle element: ${id}`);
  return value as T;
};
mountUIIcons();
const lessonPointer = new LessonPointer();
let focusedLesson = "";
let workshopRevealUntil = 0;
let focusedDiscovery = '';
const lifetime = new AbortController();
const currency = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const preciseCurrency = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 });
const rateFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
const build = element<HTMLButtonElement>('build');
const upgrade = element<HTMLButtonElement>('upgrade');
const sell = element<HTMLButtonElement>('sell');
const pause = element<HTMLButtonElement>('pause');
const advance = element<HTMLButtonElement>('advance');
const claim = element<HTMLButtonElement>('claim-offline');
const recover = element<HTMLButtonElement>('recover-save');
const assignMara = element<HTMLButtonElement>('assign-mara');
const buildFrost = element<HTMLButtonElement>('build-frost');
const buildWarehouse = element<HTMLButtonElement>('build-warehouse');
const buildWorkshop = element<HTMLButtonElement>('build-workshop');
const researchFrost = element<HTMLButtonElement>('research-frost');
const padChoice = element<HTMLSelectElement>('pad-choice');
const entryURL = new URL(location.href);
if (entryURL.searchParams.has('fresh')) {
  entryURL.searchParams.delete('fresh'); entryURL.searchParams.set('probe', crypto.randomUUID());
  history.replaceState(null, '', entryURL);
}
const probeSlot = entryURL.searchParams.get('probe');
// Explicit fresh probes keep the user's main game and its offline clock intact.
const databaseName = probeSlot && /^[a-z0-9-]{1,60}$/.test(probeSlot) ? `spire-idle-bastion-probe-${probeSlot}` : 'spire-idle-bastion';
let session: BattleSession | undefined;
let scene: BattleScene | undefined;
let game: Phaser.Game | undefined;
let gameResize: ResizeObserver | undefined;
let store: BattleSaveStore | undefined;
let selectedPadId: string | undefined;
let selectedPanel: 'tower' | 'settlement' | 'warehouse' | 'tavern' | 'mara' | 'wisp' | 'ilyra' | 'clearing' = 'tower';
let catalogPanel: 'tower' | 'settlement' = 'tower';
let contextOpen = false;
let placementType: TowerId | undefined;
let groundMode: 'mara' | BuildingId | undefined;
let ilyraMode: 'move' | 'cast' | undefined;
const buildingName = (id: BuildingId): string => ({ workshop: 'Werkstatt', warehouse: 'Lager', tavern: 'Taverne' })[id];
const buildingBuilt = (b: IdleBattle, id: BuildingId): boolean => b.settlement[`${id}Built`];
const buildingCost = (b: IdleBattle, id: BuildingId): number => id === 'workshop' ? b.workshopBuildCost : SETTLEMENT[`${id}Cost`];
let groundCandidate: GridCell | undefined;
let toastUntil = 0;
const announcedEnemies = new Set<string>();
let padListKey = '';
let mobileHintOpen = false;
let mobileHintStep = -1;
let ready = false;
let booting = false;
let lifecycle = Promise.resolve();
let retryTimer: number | undefined;
const progressUI = createProgressUI(action => {
  if (action === 'archer' || action === 'frost' || action === 'cannon' || action === 'sniper') startPlacement(({ archer: 1, frost: 2, cannon: 3, sniper: 4 } as const)[action]);
  else if (action === 'mara' || action === 'wisp') openContext(action);
  else if (action === 'clearing') { catalogPanel = 'settlement'; openContext('clearing'); }
  else if (action === 'warehouse') { catalogPanel = 'settlement'; openContext('warehouse'); }
  else if (action === 'workshop') { catalogPanel = 'settlement'; openContext('settlement'); }
  else if (action === 'upgrade' && session) {
    const towers = session.battle.towers;
    const tower = recommendedUpgrade(session.battle) ?? towers[0];
    if (!tower) return;
    selectedPadId = tower.padId; scene?.setSelected(selectedPadId); openContext('tower');
  }
}, lifetime.signal);

function duration(ms: number): string {
  const seconds = Math.floor(ms / 1000), minutes = Math.floor(seconds / 60), hours = Math.floor(minutes / 60);
  return hours ? `${hours} Std. ${minutes % 60} Min.` : minutes ? `${minutes} Min. ${seconds % 60} Sek.` : `${seconds} Sek.`;
}
function showError(message: string, canRecover = false, ownership = false): void {
  element('error-panel').hidden = false;
  element('app-error').hidden = false;
  element('app-error').textContent = message;
  element('load-actions').hidden = false;
  recover.hidden = !canRecover;
  element('activate-session').hidden = !ownership;
  element('temporary-session').hidden = ownership;
}
window.addEventListener('error', event => showError(`Ein unerwarteter Fehler ist aufgetreten: ${event.message}`), { signal: lifetime.signal });

function syncUI(): void {
  const live = session;
  const view = scene;
  const unavailable = !ready || !live || live.busy || Boolean(live.error) || live.suspended;
  build.disabled = upgrade.disabled = sell.disabled = pause.disabled = advance.disabled = claim.disabled = assignMara.disabled = unavailable;
  if (!ready || !live || live.error || live.suspended || live.paused)
    element<HTMLButtonElement>('onboarding-primary').disabled = element<HTMLButtonElement>('onboarding-secondary').disabled = true;
  element<HTMLButtonElement>('build-cannon').disabled = element<HTMLButtonElement>('build-sniper').disabled = unavailable;
  buildFrost.disabled = buildWorkshop.disabled = buildWarehouse.disabled = researchFrost.disabled = unavailable;
  if (!ready || !live || !view) { lessonPointer.show(); return; }
  view.paused = live.paused || document.hidden || Boolean(live.error) || live.suspended || live.awaitingResume;
  const saveStatus = element('save-status');
  saveStatus.dataset.revision = String(live.revision);
  saveStatus.textContent = live.error ? 'Probe angehalten · letzter bestätigter Stand erhalten'
    : live.suspended ? 'Abwesend · Kampf angehalten'
    : live.temporary ? 'Temporäre Probe · kein Speichern und kein Offline-Ertrag'
    : live.busy ? 'Wird gespeichert …' : '1× · dieser Tab ist aktiv · lokal gespeichert';
  if (live.busy) return;
  const sim = live.battle;
  element('tower-panel').hidden = selectedPanel !== 'tower';
  element('clearing-panel').hidden = selectedPanel !== 'clearing';
  element('tavern-panel').hidden = selectedPanel !== 'tavern';
  element('ilyra-panel').hidden = selectedPanel !== 'ilyra';
  syncIlyraUI(sim, unavailable || live.awaitingResume, view.paused);
  element('warehouse-panel').hidden = selectedPanel !== 'warehouse';
  element('settlement-panel').hidden = selectedPanel !== 'settlement';
  element('wisp-panel').hidden = selectedPanel !== 'wisp';
  element('wisp-status').textContent = sim.wispUnlocked ? `Aktiv · +10 % Kampf-Gold. Auftrag: ${sim.settlement.warehouseBuilt ? 'Werkstatt und Lager' : 'die Werkstatt'} versorgen.` : `Wisp kommt kostenlos nach Frostfassung und gemeisterter Welle 5. ${sim.settlement.frostResearched ? 'Frostfassung ✓' : 'Frostfassung fehlt'} · ${sim.highestCleared >= 5 ? 'Welle 5 ✓' : 'Welle 5 noch offen'}.`;
  element('pick-wisp').classList.toggle('locked', !sim.wispUnlocked);
  element('wisp-brief').textContent = sim.wispUnlocked ? '+10 % Gold' : 'Frost & Welle 5';
  element('pick-wisp').setAttribute('aria-label', sim.wispUnlocked ? 'Wisp · +10 Prozent Kampf-Gold' : 'Wisp · Frostfassung und Welle 5 nötig');
  element('catalog-next').hidden = false;
  element('mara-panel').hidden = selectedPanel !== 'mara';
  element('context-panel').hidden = !contextOpen || live.awaitingResume || Boolean(live.error);
  element('tower-catalog').hidden = catalogPanel !== 'tower';
  element('settlement-catalog').hidden = catalogPanel !== 'settlement';
  for (const kind of ['tower', 'settlement'] as const) {
    element(`${kind}-tab`).setAttribute('aria-selected', String(catalogPanel === kind));
    element(`${kind}-tab`).tabIndex = catalogPanel === kind ? 0 : -1;
  }
  const blocked = unavailable || view.paused || sim.phase === 'defeat' || sim.preparing;
  view?.setPlacement(placementType, groundMode, groundCandidate);
  view.setIlyraMode(ilyraMode);
  element('placement-help').hidden = !(placementType || groundMode || ilyraMode) || live.awaitingResume;
  element('placement-text').textContent = ilyraMode === 'move' ? 'Ilyra · freien Standort am Weg antippen · Ziehen verschiebt die Karte'
    : ilyraMode === 'cast' ? 'Sternensalve · Gegner innerhalb der blauen Reichweite antippen'
    : groundMode === 'mara' ? 'Mara · begehbares Ziel antippen'
    : groundMode && buildingBuilt(sim, groundMode) ? 'Neuen Standort wählen und Versetzen bestätigen'
    : groundMode ? `${buildingName(groundMode)} · freien Platz antippen · ${groundMode === 'workshop' && sim.workshopKitAvailable ? 'kostenloser Bausatz' : `${buildingCost(sim, groundMode)} Gold`}`
    : sim.preparing ? 'Startturm · Pfeil zeigt einen guten Platz · antippen und kostenlos bauen'
    : sim.guiding ? 'Frostkristall · goldenes Feld antippen und bauen · 110 Gold'
    : `${towerDefinition(placementType ?? 1).name} · freies Feld am Weg antippen und direkt bauen`;
  const confirm = element<HTMLButtonElement>('confirm-placement');
  confirm.hidden = !groundMode || groundMode === 'mara' || !buildingBuilt(sim, groundMode);
  if (groundMode === 'mara') confirm.hidden = true;
  const groundBuilt = !!groundMode && groundMode !== 'mara' && buildingBuilt(sim, groundMode);
  confirm.textContent = groundMode ? groundBuilt ? 'Hier versetzen' : `Hier bauen · ${buildingCost(sim, groundMode === 'mara' ? 'workshop' : groundMode)} Gold` : sim.preparing ? sim.towers.length ? 'Hierher versetzen · kostenlos' : 'Hier bauen · kostenlos' : `Hier bauen · ${towerDefinition(placementType ?? 1).cost} Gold`;
  confirm.disabled = unavailable || sim.phase === 'defeat' || (!groundMode && live.paused) || (groundMode ? !groundCandidate || !sim.canPositionBuilding(groundMode === 'mara' ? 'workshop' : groundMode, groundCandidate)
    || (groundBuilt ? !live.paused : sim.gold < buildingCost(sim, groundMode === 'mara' ? 'workshop' : groundMode))
    : !selectedPadId || !sim.canBuild(selectedPadId, placementType));
  element('pick-archer').setAttribute('aria-pressed', String(placementType === 1));
  element('pick-frost').setAttribute('aria-pressed', String(placementType === 2));
  element('pick-frost').classList.toggle('locked', !sim.settlement.frostResearched);
  element('frost-lock').textContent = sim.settlement.frostResearched ? 'Verlangsamung' : 'Frostfassung nötig';
  element('frost-price').textContent = sim.settlement.frostResearched ? '110' : 'Forschung';
  for (const [name, kind, role, condition] of [['cannon', 3, 'Flächenschaden', 'Frost & Welle 5'], ['sniper', 4, 'Ignoriert Rüstung', 'Welle 10 meistern']] as const) {
    const unlocked = sim.isTowerUnlocked(kind);
    element(`pick-${name}`).classList.toggle('locked', !unlocked);
    element(`pick-${name}`).setAttribute('aria-pressed', String(placementType === kind));
    element(`${name}-lock`).textContent = unlocked ? role : condition;
    element(`${name}-price`).textContent = unlocked ? String(towerDefinition(kind).cost) : kind === 3 ? sim.highestCleared < 5 ? 'Welle 5' : 'Forschung' : 'Welle 10';
  }
  const freePads = sim.layout.towerPads.filter(pad => sim.isPadUnlocked(pad.id) && !sim.towers.some(tower => tower.padId === pad.id));
  const padKey = freePads.map(pad => pad.id).join(',');
  if (padKey !== padListKey) {
    padListKey = padKey;
    const names: Record<string, string> = { 'tower-02': 'Nordwest', 'tower-03': 'Nordost', 'tower-04': 'Südkurve', 'tower-05': 'Nordweg', 'tower-06': 'Engpass', 'tower-07': 'Südweg', 'tower-08': 'Kernwache', 'tower-09': 'Nordbogen', 'tower-10': 'Mittelpass', 'tower-11': 'Südbogen', 'tower-east-01': 'Östlicher Sporn', 'tower-east-02': 'Ostbogen' };
    const current = padChoice.value;
    padChoice.replaceChildren(new Option('Bauplatz wählen …', ''), ...sim.layout.towerPads.filter(pad => sim.isPadUnlocked(pad.id)).map(pad => new Option(names[pad.id] ?? `Feld ${pad.cell.x + 1}/${pad.cell.y + 1}`, pad.id)));
    padChoice.value = current;
    element('placement-pads').replaceChildren();
  }
  const certificate = live.certificate;
  element('next-objective').textContent = nextObjective(sim);
  const playSeconds = sim.elapsed + sim.introduction.preparationSeconds;
  element('play-time').textContent = `${Math.floor(playSeconds / 60)}:${String(Math.floor(playSeconds % 60)).padStart(2, '0')}`;
  const hintStep = tutorialStep(sim), discovery = discoveryStep(sim);
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  if (hintStep !== mobileHintStep) { mobileHintStep = hintStep; mobileHintOpen = hintStep === 15; }
  element('wisp-arrival').hidden = !sim.wispUnlocked || sim.wispArrival.met || contextOpen || Boolean(placementType || groundMode) || live.awaitingResume;
  element('pick-wisp').classList.toggle('new-companion', sim.wispUnlocked && !sim.wispArrival.met);
  const hintAvailable = sim.introduction.stage === 'done' && !sim.discoveryActive && (sim.wispArrival.met || !sim.wispUnlocked) && !sim.bossActive && !sim.tutorial.hidden && !(sim.tutorial.seen & (1 << hintStep)) && !contextOpen && !placementType && !live.awaitingResume;
  element('tutorial-card').hidden = !hintAvailable || (mobile && !mobileHintOpen);
  element('mobile-hint').hidden = !mobile || !hintAvailable || mobileHintOpen;
  element('mobile-hint').setAttribute('aria-expanded', String(mobileHintOpen));
  element('tutorial-hint').textContent = tutorialHint(sim);
  element('tutorial-card').dataset.step = String(hintStep);
  element('hint-action').hidden = hintStep !== 15;
  element('pick-mara').classList.toggle('new-companion', hintStep === 15 && sim.wispArrival.met && !sim.tutorial.hidden);
  const mara = sim.mara;
  const maraTarget = sim.towers.find(tower => tower.uid === mara.targetTowerUid);
  const targetName = maraTarget?.protected ? 'Startturm' : maraTarget?.def.name ?? 'Noch kein Turm';
  const inSpellRange = !!maraTarget && Math.hypot(mara.x - maraTarget.x, mara.y - maraTarget.y) <= MARA.range;
  element('mara-brief').textContent = sim.maraIntroductionPending ? 'Nach Wisp' : mara.effectRemaining > 0 ? `Buff · ${Math.ceil(mara.effectRemaining)} s` : mara.cooldownRemaining > 0 ? `Bereit in ${Math.ceil(mara.cooldownRemaining)} s` : 'Zauber bereit';
  element<HTMLProgressElement>('mara-cooldown').value = MARA.cooldown - mara.cooldownRemaining;
  element('mara-status').textContent = sim.maraIntroductionPending ? 'Mara zeigt dir Übertakten nach Wisps Ankunft. Zuerst bauen wir die Verteidigung auf.' : `Ziel: ${targetName}. ` + (mara.effectRemaining > 0 ? `Buff wirkt noch ${Math.ceil(mara.effectRemaining)} s.` : mara.cooldownRemaining > 0 ? `Abklingzeit: ${Math.ceil(mara.cooldownRemaining)} s.` : !inSpellRange ? 'Außerhalb der Zauberreichweite. Ziel erneut zuweisen oder näher laufen.' : mara.autoCast ? 'Bereit · wartet auf Gegner beim Ziel.' : 'Bereit · manuell auslösen.');
  const auto = element<HTMLButtonElement>('mara-auto'); auto.disabled = blocked; auto.textContent = `Automatik: ${mara.autoCast ? 'Ein' : 'Aus'}`; auto.setAttribute('aria-pressed', String(mara.autoCast));
  element<HTMLButtonElement>('cast-mara').disabled = sim.maraIntroductionPending || blocked || live.paused || !inSpellRange || sim.phase !== 'wave' || mara.cooldownRemaining > 0 || !maraTarget || sim.isCharmed(maraTarget.uid);
  element<HTMLButtonElement>('move-mara').disabled = blocked;
  element('camera-zoom').setAttribute('aria-pressed', String(view.mapZoom > 1));
  element('camera-zoom').setAttribute('aria-label', view.mapZoom > 1 ? 'Karte weiter ansehen' : 'Karte näher ansehen');
  element('safe-rate').textContent = `${rateFormat.format(certificate ? farmRewardGold(certificate) * 60000 / certificate.durationMs : 0)} G/min sicher`;
  element('safe-rate').title = certificate ? `Welle ${certificate.wave}: zwei konservative, schadensfreie Wiederholungen inklusive Wellenpausen. Grundlage für ${offlinePolicy(sim.settlement.warehouseBuilt).efficiencyPermille / 10} % Offline-Ertrag.`
    : 'Noch kein gültiger Farmnachweis. Eine erste Welle muss live geschafft und zweimal konservativ geprüft werden.';
  element('menu-farm-rate').textContent = `${element('safe-rate').textContent}. ${element('safe-rate').title}`;
  element('gold').textContent = currency.format(sim.gold);
  element('lives').textContent = `${sim.lives} / 20`;
  element('wave').textContent = String(sim.wave);
  const mode = sim.mode === 'farm' ? 'Farmen' : 'Vorstoß';
  element('battle-phase').textContent = live.error ? 'Angehalten' : live.awaitingResume ? 'Rückkehr' : view.paused ? 'Pause'
    : sim.phase === 'defeat' ? 'Wechsel ins sichere Farmen …'
    : sim.phase === 'wave' ? `${mode} · Welle ${sim.wave} · ${sim.remaining} Gegner`
    : `${mode} · nächste Welle in ${Math.ceil(sim.intermissionRemaining)} s`;
  element('pause-state').textContent = live.paused ? 'PAUSE' : 'EIN';
  pause.classList.toggle('paused', live.paused);
  pause.setAttribute('aria-label', live.paused ? 'Auto-Kampf fortsetzen' : 'Auto-Kampf pausieren');
  pause.disabled = unavailable || live.awaitingResume;
  advance.hidden = sim.mode !== 'farm';
  advance.textContent = sim.bossChallengeRequested ? 'Boss am Wellenwechsel vorgemerkt' : sim.advanceRequested ? 'Vorstoß vorgemerkt' : `Erneut vorstoßen · Welle ${sim.nextAdvanceWave}`;
  advance.disabled = unavailable || view.paused || sim.advanceRequested || sim.bossChallengeRequested;
  element('return-card').hidden = !live.awaitingResume;
  if (live.awaitingResume) {
    const reward = live.pendingReward;
    const departure = live.offline.window ?? live.offline.baseline, basis = departure.certificate;
    element('return-gold').textContent = `+${preciseCurrency.format((reward?.amountUnits ?? 0) / 1000)} Gold`;
    element('return-elapsed').textContent = duration(reward?.elapsedMs ?? 0);
    element('return-credited').textContent = duration(reward?.creditedMs ?? 0);
    element('return-details').textContent = live.paused ? 'Die gespeicherte Pause war aktiv. Dabei entsteht kein Offline-Gold.'
      : !basis ? 'Noch kein sicherer Farmnachweis vorhanden. Besiege zuerst eine Welle zuverlässig.'
      : reward && reward.elapsedMs > reward.creditedMs ? 'Deine Vorräte sind voll. Die Sammelzeit wurde ausgeschöpft.'
      : 'Deine Verteidigung hat Gold für dich gesammelt. Setze es für deinen nächsten Ausbau ein.';
    element('return-basis').textContent = `Farmbasis beim Verlassen: ${rateFormat.format(basis ? farmRewardGold(basis) * 60000 / basis.durationMs : 0)} G/min · ${departure.efficiencyPermille / 10} % Ertrag · bis zu ${departure.limitMs / 3600000} Stunden. Zeit bis zum Einsammeln zählt mit.`;
    claim.textContent = reward && reward.amountUnits > 0 ? 'Belohnung einsammeln und fortsetzen' : live.paused ? 'Zur pausierten Verteidigung' : 'Verteidigung fortsetzen';
    claim.disabled = unavailable || document.hidden;
  }
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  const pad = sim.layout.towerPads.find(value => value.id === selectedPadId);
  padChoice.value = selectedPadId ?? '';
  element('selection-title').textContent = selectedPanel === 'ilyra' ? 'Ilyra · Sternensalve' : selectedPanel === 'tavern' ? 'Taverne' : selectedPanel === 'clearing' ? 'Siedlung am Kern' : selectedPanel === 'warehouse' ? 'Vorratslager' : selectedPanel === 'wisp' ? 'Wisp' : selectedPanel === 'mara' ? 'Mara' : selectedPanel === 'settlement' ? 'Werkstatt'
    : tower ? `${tower.def.name} · Level ${tower.level}` : pad ? 'Freier Bauplatz' : 'Bauplatz wählen';
  element('tower-name').textContent = tower?.def.name ?? 'Turm wählen';
  element('tower-role').textContent = tower?.def.id === 4 ? 'Bevorzugt Rüstung · ignoriert 100 % davon' : tower?.def.id === 3 ? 'Flächentreffer · 52 Reichweite um das Ziel' : tower?.def.id === 2 ? 'Frosttreffer · 45 % langsamer für 2 s' : 'Zuverlässige Pfeile · Allrounder';
  element('selection-description').textContent = selectedPanel !== 'tower' ? '' : tower
    ? tower.protected ? 'Dein erster Turm sichert die Grundverteidigung. Du kannst ihn verbessern.' : `${tower.def.name} verteidigt den Weg. Verbessere ihn oder investiere das Gold an anderer Stelle.`
    : (pad && sim.isPadUnlocked(pad.id)) ? 'Wähle einen freigeschalteten Turm für diesen Platz.'
    : pad?.availability === 'east-clearing' ? 'Öffne zuerst die östliche Lichtung nach dem Bosssieg.'
    : pad ? `Dieser Platz öffnet nach gemeisterter Welle ${pad.availability === 'wave-5' ? 5 : 10}.` : 'Wähle einen hell markierten Platz auf der Karte.';
  build.hidden = Boolean(tower); upgrade.hidden = !tower; sell.hidden = !tower; assignMara.hidden = !tower;
  buildFrost.hidden = Boolean(tower) || !sim.settlement.frostResearched;
  build.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId);
  buildFrost.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId, 2);
  for (const [name, kind] of [['cannon', 3], ['sniper', 4]] as const) {
    const button = element<HTMLButtonElement>(`build-${name}`);
    button.hidden = Boolean(tower) || !sim.isTowerUnlocked(kind);
    button.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId, kind);
  }
  const canUpgrade = Boolean(tower && tower.level < sim.maxLevel);
  upgrade.disabled = blocked || !tower || !canUpgrade || sim.gold < upgradeCost(tower);
  upgrade.textContent = tower && canUpgrade ? `Aufwerten · ${currency.format(upgradeCost(tower))} Gold` : 'Levelgrenze erreicht';
  sell.disabled = blocked || !tower || tower.protected;
  assignMara.disabled = blocked || !tower || (tower.uid === mara.targetTowerUid && inSpellRange);
  assignMara.textContent = tower?.uid === mara.targetTowerUid ? 'Zauberziel · Mara heranrufen' : 'Als Zauberziel wählen';
  sell.textContent = tower?.protected ? 'Geschützter Startturm' : `Verkaufen · +${currency.format(tower ? sellValue(tower) : 0)} Gold`;
  element('tower-stats').innerHTML = tower ? (() => {
    const values = stats(tower);
    return `<div><dt>Schaden</dt><dd>${values.damage.toFixed(1)}</dd></div><div><dt>Reichweite</dt><dd>${values.range}</dd></div><div><dt>Angriff alle</dt><dd>${values.cooldown.toFixed(2)} s</dd></div><div><dt>Abschüsse</dt><dd>${tower.kills}</dd></div>`;
  })() : '';
  element('action-hint').textContent = blocked ? live.error ? 'Der letzte bestätigte Spielstand bleibt erhalten.' : live.awaitingResume ? 'Setze die Verteidigung über den Rückkehrbeleg fort.' : 'Setze den Kampf fort, um zu bauen oder aufzuwerten.'
    : tower ? tower.level >= sim.maxLevel ? sim.settlement.frostResearched ? sim.settlement.workshopUpgraded ? 'Level 20 erreicht · höchster Ausbau.' : 'Werkstatt II erschließt Level 7–20.' : 'Frostfassung erschließt Level 4–6.' : sim.gold < upgradeCost(tower) ? `Noch ${currency.format(upgradeCost(tower) - sim.gold)} Gold bis zum nächsten Level.` : 'Mehr Schaden verbessert die Verteidigung sofort.'
    : (pad && sim.isPadUnlocked(pad.id)) && sim.gold < 75 ? `Noch ${currency.format(75 - sim.gold)} Gold bis zum Waldwächter.` : '';
  const settlement = sim.settlement;
  const workshopIcon = element<HTMLImageElement>('workshop-icon');
  const workshopSource = sim.settlement.workshopUpgraded ? ART.workshopUpgraded : ART.workshop;
  if (workshopIcon.getAttribute('src') !== workshopSource) workshopIcon.src = workshopSource;
  element('workshop-card-title').textContent = settlement.workshopUpgraded ? 'Werkstatt II' : settlement.workshopBuilt ? 'Werkstatt I' : 'Werkstatt I';
  element('workshop-card-copy').textContent = settlement.workshopUpgraded ? 'Turmlevel bis 20' : settlement.frostResearched ? 'Werkstatt II ausbauen' : settlement.frostResearched ? 'Frosttechnik verfügbar' : settlement.workshopBuilt ? 'Frostfassung erforschen' : 'Bauen & forschen';
  element('workshop-card-price').textContent = settlement.workshopUpgraded ? '✓ Ausgebaut' : settlement.frostResearched ? currency.format(SETTLEMENT.workshopUpgradeCost) : settlement.frostResearched ? '✓ Erforscht' : `${settlement.workshopBuilt ? SETTLEMENT.researchCost : sim.workshopKitAvailable ? 'Bausatz · kostenlos' : SETTLEMENT.workshopCost}`;
  element('pick-workshop').classList.toggle('researched', settlement.frostResearched);
  element('workshop-title').textContent = settlement.workshopUpgraded ? 'Werkstatt II' : settlement.workshopBuilt ? 'Werkstatt I' : 'Werkstatt bauen';
  element('workshop-description').textContent = settlement.workshopUpgraded ? 'Der neue Arbeitsplatz erschließt Turmlevel 7–20. Höhere Level erhöhen den Schaden; Reichweite und Feuerrate bleiben begrenzt.' : settlement.frostResearched
    ? 'Frostfassung erforscht · Frostkristall und Turmlevel 4–6 sind verfügbar.'
    : settlement.workshopBuilt ? 'Frostfassung erschließt den Frostkristall und Turmlevel 4–6.' : 'Wähle eine Position in der Siedlung und baue die Werkstatt. Sie eröffnet die Frostforschung.';
  const upgradeWorkshop = element<HTMLButtonElement>('upgrade-workshop');
  upgradeWorkshop.hidden = !settlement.frostResearched || settlement.workshopUpgraded;
  upgradeWorkshop.disabled = blocked || sim.gold < SETTLEMENT.workshopUpgradeCost;
  element('workshop-upgrade-condition').hidden = !settlement.frostResearched || settlement.workshopUpgraded;
  element('workshop-upgrade-condition').textContent = sim.gold < SETTLEMENT.workshopUpgradeCost ? `Noch ${currency.format(SETTLEMENT.workshopUpgradeCost-sim.gold)} Gold für Werkstatt II.` : 'Bereit zum Ausbau · Turmlevel 7–20 freischalten.';
  buildWorkshop.hidden = settlement.workshopBuilt;
  buildWorkshop.textContent = sim.workshopKitAvailable ? 'Werkstatt platzieren · kostenloser Bausatz' : `Werkstatt platzieren · ${sim.workshopBuildCost} Gold`;
  buildWorkshop.disabled = blocked || sim.gold < sim.workshopBuildCost;
  element<HTMLButtonElement>('pick-workshop').disabled = sim.preparing || sim.guiding && (sim.introduction.stage !== 'workshop' && sim.introduction.stage !== 'research' || !sim.learningPaused);
  researchFrost.hidden = !settlement.workshopBuilt || settlement.frostResearched;
  researchFrost.textContent = `Frostfassung erforschen · ${SETTLEMENT.researchCost} Gold`;
  researchFrost.disabled = blocked || sim.gold < SETTLEMENT.researchCost;
  element('choose-frost').hidden = !settlement.frostResearched;
  const warehouseIcon = element<HTMLImageElement>('warehouse-icon');
  if (warehouseIcon.getAttribute('src') !== ART.warehouse) warehouseIcon.src = ART.warehouse;
  for (const id of ['workshop', 'warehouse', 'tavern'] as const) {
    const button = element<HTMLButtonElement>(`move-${id}`);
    button.hidden = !buildingBuilt(sim, id);
    button.disabled = unavailable || !live.paused;
    button.textContent = live.paused ? `${buildingName(id)} versetzen` : 'Zum Versetzen pausieren';
  }
  const builtWarehouse = settlement.warehouseBuilt;
  const safeRate = certificate ? farmRewardGold(certificate) * 60000 / certificate.durationMs : 0;
  element('pick-warehouse').classList.toggle('locked', !sim.warehouseUnlocked);
  element('pick-warehouse').classList.toggle('researched', builtWarehouse);
  const warehouseNew = sim.warehouseUnlocked && !builtWarehouse && !(sim.tutorial.seen & (1 << 12)) && (!sim.discoveryActive || sim.discovery === 'warehouse');
  const ilyraNew = settlement.tavernBuilt && !sim.ilyra;
  const tavernNew = ilyraNew || sim.tavernUnlocked && !settlement.tavernBuilt && !settlement.tavernSeen;
  element('pick-warehouse').classList.toggle('new-building', warehouseNew);
  element('pick-tavern').classList.toggle('new-building', tavernNew);
  element('settlement-tab').classList.toggle('new-building', warehouseNew || tavernNew);
  element('settlement-tab').setAttribute('aria-label', ilyraNew ? 'Siedlung · Ilyra wartet in der Taverne' : tavernNew ? 'Siedlung · Neues Gebäude verfügbar: Taverne' : warehouseNew ? 'Siedlung · Neues Gebäude verfügbar: Vorratslager' : 'Siedlung');
  element<HTMLImageElement>('tavern-icon').src = ART.tavern;
  element<HTMLImageElement>('tavern-portrait').src = ART.tavern;
  element('pick-tavern').hidden = sim.highestCleared < 24 && !sim.tavernUnlocked;
  element('pick-tavern').classList.toggle('locked', !sim.tavernUnlocked);
  element('pick-tavern').classList.toggle('researched', settlement.tavernBuilt);
  element('tavern-card-price').textContent = settlement.tavernBuilt ? sim.ilyra ? 'Gefährten ansehen' : 'Ilyra wartet' : sim.tavernUnlocked ? currency.format(SETTLEMENT.tavernCost) : 'Boss 25';
  element('tavern-description').textContent = settlement.tavernBuilt
    ? 'Dein Treffpunkt für alle Gefährten. Wähle eine Figur für ihre Rolle und Befehle.'
    : 'Hier lernst du Ilyra kennen: Ihre Sternensalve trifft Gegnergruppen und ist besonders stark gegen Flieger. Die Rekrutierung ist im Bau enthalten.';
  element('tavern-condition').textContent = settlement.tavernBuilt ? sim.ilyra ? 'Mara verstärkt Türme · Wisp versorgt · Ilyra kämpft.' : 'Ilyra wartet auf dich. Kennenlernen und Rekrutierung sind kostenlos.'
    : !sim.tavernUnlocked ? 'Rosenspiegels Rückkehr in Welle 25 besiegen, dann für 1.200 Gold bauen.'
    : sim.gold < SETTLEMENT.tavernCost ? `Noch ${currency.format(SETTLEMENT.tavernCost - sim.gold)} Gold. Du kannst erst deine Verteidigung weiter ausbauen.`
    : 'Boss 25 besiegt · 1.200 Gold verfügbar. Bauplatz selbst wählen.';
  const buildTavern = element<HTMLButtonElement>('build-tavern');
  buildTavern.hidden = settlement.tavernBuilt;
  buildTavern.disabled = blocked || !sim.tavernUnlocked || sim.gold < SETTLEMENT.tavernCost;
  element('warehouse-card-price').textContent = builtWarehouse ? '✓ Gebaut' : sim.warehouseUnlocked ? String(SETTLEMENT.warehouseCost) : sim.wispUnlocked ? 'Welle 8' : 'Wisp & Welle 8';
  element('warehouse-description').textContent = builtWarehouse ? 'Wisp versorgt das Lager. Deine Vorräte sammeln automatisch während deiner Abwesenheit.'
    : 'Wenn du das Spiel schließt, sammelt deine sichere Verteidigung weiter. Das Lager verlängert das Sammeln von 2 auf 8 Stunden. Optional; es macht deine Türme nicht stärker.';
  element('warehouse-rate').textContent = certificate ? `${rateFormat.format(safeRate)} G/min` : 'Noch kein Nachweis';
  element('warehouse-efficiency').textContent = builtWarehouse ? '65 % der Farmbasis' : '60 % → 65 %';
  element('warehouse-cap').textContent = builtWarehouse ? 'Bis zu 8 Stunden' : '2 → 8 Stunden';
  element('warehouse-preview').textContent = live.paused ? '0 Gold · Pause aktiv' : !certificate ? 'Zuerst sicher farmen'
    : builtWarehouse ? `≈ ${currency.format(safeRate * 60 * WAREHOUSE_OFFLINE.efficiencyPermille / 1000)} Gold`
    : `${currency.format(safeRate * 60 * 0.6)} → ${currency.format(safeRate * 60 * 0.65)} Gold`;
  element('warehouse-condition').textContent = !sim.warehouseUnlocked ? `Voraussetzung: ${sim.wispUnlocked ? 'Wisp ✓' : 'Wisp (Frost & Welle 5)'} · Welle 8 ${sim.highestCleared >= 8 ? '✓' : 'meistern'}.`
    : !builtWarehouse && sim.gold < SETTLEMENT.warehouseCost ? `Noch ${currency.format(SETTLEMENT.warehouseCost - sim.gold)} Gold. Die Vorschau gilt bei unveränderter Verteidigung; während einer Pause entsteht kein Ertrag.`
    : 'Vorschau bei unveränderter Verteidigung. Während einer Pause entsteht kein Offline-Ertrag.';
  buildWarehouse.hidden = builtWarehouse;
  buildWarehouse.disabled = blocked || !sim.warehouseUnlocked || sim.gold < SETTLEMENT.warehouseCost;
  const atCore = sim.layout.version === 5;
  const relocatingBlocked = unavailable || live.awaitingResume || sim.layout.version !== 4 || sim.preparing || sim.guiding || sim.discoveryActive;
  element('pick-clearing').hidden = atCore && !sim.eastAccessCredit;
  element('pick-clearing').classList.toggle('researched', atCore);
  element('clearing-card-title').textContent = atCore ? 'Ostzugang' : 'Siedlung am Kern';
  element('clearing-card-copy').textContent = atCore ? 'Für den späteren Ausbau' : 'Gebäude kostenlos umziehen';
  element('clearing-card-price').textContent = atCore ? '900 G Gutschrift' : 'Kostenlos';
  element('clearing-title').textContent = atCore ? 'Ostzugang vorgemerkt' : 'Siedlung am Kern';
  element('clearing-description').textContent = atCore
    ? 'Dein früherer Lichtungskauf zählt beim späteren Öffnen der Ostfront mit 900 Gold. Diese Gutschrift ist für den Zugang reserviert.'
    : 'Werkstatt, Lager und Taverne ziehen gemeinsam in die geschützte Siedlung südöstlich des Kerns. Gebäudelevel, Gold und Verteidigung bleiben erhalten. Die Gebäude kannst du dort bei Pause frei versetzen.';
  element('clearing-condition').textContent = atCore ? 'Die Ostfront folgt in einem späteren Ausbau.'
    : sim.guiding || sim.preparing || sim.discoveryActive ? 'Beende zuerst die laufende Einführung.'
    : sim.layout.version !== 4 ? 'Nach dem laufenden Wellenversuch verfügbar.'
    : `Zum Umzug den Kampf mit Pause anhalten.${sim.eastAccessCredit ? ' Dein Lichtungskauf bleibt als 900-Gold-Gutschrift für den späteren Ostzugang erhalten.' : ''}`;
  element('unlock-clearing').hidden = atCore;
  element<HTMLButtonElement>('unlock-clearing').disabled = relocatingBlocked || !live.paused;
  element('show-clearing').hidden = !atCore;
  element('layout-status').textContent = view.paused ? 'Kampf angehalten.'
    : sim.mode === 'farm' ? `Sicheres Farmen · Welle ${sim.farmWave}. Ein neuer Vorstoß beginnt erst auf deinen Wunsch am Wellenübergang.`
    : `Automatischer Vorstoß · höchste geschaffte Welle ${sim.highestCleared}.`;
  const relevantEvents = sim.drainEvents();
  scene?.acceptEvents(relevantEvents);
  if (relevantEvents.some(event => event.type === 'map-update')) { selectedPadId = undefined; placementType = undefined; closeContext(); }
  const message = relevantEvents.find(event => event.type === 'boss-victory') ?? relevantEvents.filter(event => ['defeat', 'build', 'upgrade', 'sell', 'workshop', 'research', 'wisp', 'pads', 'warehouse', 'tavern', 'boss-victory', 'clearing', 'workshop-upgrade', 'map-update'].includes(event.type)).at(-1);
  if (message) toastUntil = performance.now() + 4500;
  if (message) element('combat-message').textContent = message.type === 'clear' ? `Welle ${message.wave} geschafft · +${currency.format(message.amount ?? 0)} Gold Abschlussbonus.`
    : message.type === 'kill' ? `Gegner besiegt · +${currency.format(message.amount ?? 0)} Gold.`
    : message.type === 'wave' ? `${mode} · Welle ${message.wave} hat begonnen. Deine Türme greifen automatisch an.`
    : message.type === 'boss-victory' ? message.amount ? `${bossEncounter(message.wave ?? 15).title} besiegt! +${currency.format(message.amount)} Gold Erstprämie.` : 'Rosenspiegel erneut besiegt. Gewöhnliche Kampfbelohnungen erhalten.'
    : message.type === 'map-update' ? `Nordbogen angepasst · drei Baureihen oberhalb des Wegs.${message.amount ? ` ${message.amount} Türme kostenlos in der Nähe versetzt; alle Upgrades bleiben erhalten.` : ''}`
    : message.type === 'clearing' ? 'Östliche Lichtung geöffnet! Optionale Fläche verfügbar · Lichtung ansehen.'
    : message.type === 'wisp' ? 'Wisp ist da! +10 % Kampf-Gold und die Steinschleuder sind jetzt verfügbar.'
    : message.type === 'pads' ? `Welle ${message.wave} gemeistert${message.wave === 10 ? ' · Scharfschütze verfügbar' : ''}.`
    : message.type === 'build' ? `${message.tower?.def.name} gebaut und einsatzbereit.`
    : message.type === 'upgrade' ? `${message.tower?.def.name} verbessert. Der nächste Schuss nutzt den höheren Schaden.`
    : message.type === 'workshop-upgrade' ? 'Werkstatt II fertig! Turmlevel 7–20 sind jetzt verfügbar.'
    : message.type === 'workshop' ? 'Die Werkstatt ist fertig! Frostfassung ist jetzt erforschbar.'
    : message.type === 'tavern' ? 'Die Taverne steht! Ein neuer Treffpunkt für deine Siedlung.'
    : message.type === 'warehouse' ? 'Vorratslager gebaut! Künftig 65 % Offline-Ertrag für bis zu 8 Stunden.'
    : message.type === 'research' ? 'Frostfassung erforscht! Baue einen Frostkristall oder verbessere Türme bis Level 6.'
    : message.type === 'sell' ? `Turm verkauft · +${currency.format(message.amount ?? 0)} Gold. Die sichere Farmbasis wird neu geprüft.`
    : 'Der Vorstoß ist gescheitert. Gold und Türme bleiben erhalten; die Verteidigung wechselt ins sichere Farmen.';
  const startedWave = relevantEvents.find(e => e.type === 'wave');
  const newcomer = startedWave && sim.waveRecipeVersion >= 9 && sim.mode === 'advance' && sim.highestCleared < sim.wave ? introducedEnemy(sim.wave) : undefined;
  if (!message && newcomer && newcomer.firstWave >= 6 && !announcedEnemies.has(newcomer.id)) {
    announcedEnemies.add(newcomer.id);
    element('combat-message').textContent = `Neu: ${newcomer.name} · ${newcomer.counter}. Mehr in der Chronik.`;
    toastUntil = performance.now() + 6500;
  }
  element('combat-message').hidden = sim.introduction.stage !== 'done' || !!discovery || performance.now() > toastUntil || contextOpen || Boolean(placementType || groundMode) || live.awaitingResume;
  if (!element('combat-message').hidden) { element('tutorial-card').hidden = true; element('mobile-hint').hidden = true; }
  progressUI.update(live);
  const boss = sim.bossEnemy, charm = sim.bossCharm;
  const showBoss = sim.bossActive && !live.awaitingResume && !contextOpen && !placementType;
  element('boss-banner').hidden = !showBoss;
  document.querySelector<HTMLElement>('.goal-ribbon')!.hidden = showBoss || sim.introduction.stage !== 'done' || !!discovery || !element('wisp-arrival').hidden || hintStep === 15 && !element('tutorial-card').hidden;
  element('boss-title').textContent = `${bossEncounter(sim.wave).title} · Welle ${sim.wave}`;
  element('boss-health').textContent = boss ? `${currency.format(Math.ceil(boss.hp))} / ${currency.format(Math.ceil(boss.maxHp))}` : sim.bossQueued ? 'Im Anmarsch' : 'Boss gefallen';
  const health = element<HTMLProgressElement>('boss-health-bar');
  health.max = boss?.maxHp ?? 1; health.value = boss?.hp ?? (sim.bossQueued ? 1 : 0);
  const charmTarget = sim.towers.find(t => t.uid === charm.targetUid);
  element('boss-skill').textContent = charm.phase === 'windup' ? `♥ Zielt auf ${charmTarget?.def.name} · ${charm.remaining.toFixed(1)} s`
    : charm.phase === 'channel' ? `♥ ${charmTarget?.def.name}: 40 % langsamer · ${charm.remaining.toFixed(1)} s`
    : charm.phase === 'interrupted' ? 'Zauber unterbrochen!'
    : boss?.slowRemaining ? `Frost aktiv · 45 % langsamer · ${boss.slowRemaining.toFixed(1)} s`
    : boss ? 'Frost bremst ihren Vormarsch · der Tanz läuft weiter' : sim.bossQueued ? sim.bossWins(sim.wave) ? 'Boss und Begleiter besiegen · Wiederholung' : `Boss und Begleiter besiegen · ${currency.format(bossEncounter(sim.wave).firstReward)} Gold Erstprämie` : 'Besiege noch die übrigen Begleiter';
  element('boss-banner').dataset.phase = charm.phase;
  element('boss-support').textContent = `${Math.max(0, sim.remaining - (boss || sim.bossQueued ? 1 : 0))} Begleiter übrig · Fläche & Durchdringung`;
  document.getElementById('app')!.classList.toggle('context-open', contextOpen || Boolean(placementType || groundMode));
  updateOnboarding(live, { placing: Boolean(placementType || groundMode), contextOpen, catalogPanel, revealing: performance.now() < workshopRevealUntil });
  updateDiscoveryUI(live, contextOpen, Boolean(placementType || groundMode), catalogPanel);
  // Focus the genuine cast once; its compact countdown runs with the battle.
  if (discovery !== focusedDiscovery) {
    focusedDiscovery = discovery ?? '';
    if (discovery === 'wisp') scene?.followWispArrival();
    if (discovery === 'mara-start' || discovery === 'mara-effect') {
      contextOpen = false; placementType = undefined; groundMode = undefined;
      const target = sim.towers.find(t => t.uid === sim.mara.effectTowerUid);
      if (target) scene?.focusPad(target.padId);
      element('context-panel').hidden = true; element('placement-help').hidden = true;
      updateDiscoveryUI(live, false, false, catalogPanel);
    }
  }
  positionContext();
  syncLessonPointer();
}

function syncLessonPointer(): void {
  const b = session?.battle;
  scene?.setLearningTarget();
  if (b?.ilyra && b.ilyra.introduction !== 'done' && b.introduction.stage === 'done' && !discoveryStep(b)
      && !session?.paused && !session?.error && !session?.suspended && !session?.awaitingResume && !document.querySelector('dialog[open]')) {
    const id = contextOpen && selectedPanel === 'ilyra' ? b.ilyra.introduction === 'move' ? 'move-ilyra' : 'aim-ilyra' : !contextOpen && !ilyraMode && !placementType && !groundMode && !b.ilyra.path.length ? 'pick-ilyra' : undefined;
    const target = id ? element<HTMLButtonElement>(id) : undefined;
    lessonPointer.show(target && !target.disabled ? target : undefined); return;
  }
  const blocked = !b || !scene || session?.paused || session?.error || session?.suspended || session?.awaitingResume
    || performance.now() < workshopRevealUntil || document.querySelector('dialog[open]') || b.introduction.stage === 'done' && !discoveryStep(b);
  if (blocked) { lessonPointer.show(); return; }
  const button = (id: string) => lessonPointer.show(element<HTMLButtonElement>(id));
  const stage = b.introduction.stage;
  if (b.learningPaused && !b.lessonComplete && focusedLesson !== stage) {
    focusedLesson = stage;
    if (stage === 'upgrade') { const tower = b.towers.find(t => t.protected); if (tower) scene!.focusPad(tower.padId); }
    if (stage === 'research') scene!.focusObject('settlement');
  }
  const world = (kind: 'starter' | 'upgrade' | 'workshop' | 'research' | 'frost' | 'cannon' | 'warehouse') => {
    const point = scene!.learningAnchor(kind), at = point && document.elementFromPoint(point.x,point.y);
    // If the player pans away, the real overview control brings the target back.
    if (!point || at !== game?.canvas) { button('camera-reset'); return; }
    scene!.setLearningTarget(kind); lessonPointer.show(point,kind);
  };
  if (stage === 'done') {
    const step = discoveryStep(b);
    if (placementType || groundMode) {
      if (step === 'cannon' && placementType === 3) world('cannon');
      else if (step === 'warehouse' && groundMode === 'warehouse') world('warehouse');
      else lessonPointer.show();
      return;
    }
    if (contextOpen) {
      if (step === 'warehouse' && selectedPanel === 'warehouse' && !buildWarehouse.disabled) button('build-warehouse');
      else if (step === 'mara-ready' && selectedPanel === 'mara' && !element<HTMLButtonElement>('cast-mara').disabled) button('cast-mara');
      else button('close-context');
      return;
    }
    if (step === 'wisp') button('meet-wisp');
    else if (step === 'mara-start' || step === 'mara-wait') button('discovery-next');
    else if (step === 'mara-controls' || step === 'mara-ready' && !b.mara.autoCast) button('pick-mara');
    else if (step === 'cannon') button(catalogPanel === 'tower' ? 'pick-cannon' : 'tower-tab');
    else if (step === 'warehouse') button(catalogPanel === 'settlement' ? 'pick-warehouse' : 'settlement-tab');
    else lessonPointer.show();
    return;
  }
  if (placementType) { world(b.preparing ? 'starter' : 'frost'); return; }
  if (groundMode) { if (groundMode === 'workshop') world('workshop'); else lessonPointer.show(); return; }
  if (contextOpen) {
    if (stage === 'upgrade' && selectedPanel === 'tower' && !upgrade.disabled) button('upgrade');
    else if (stage === 'research' && selectedPanel === 'settlement' && !researchFrost.disabled) button('research-frost');
    else if (stage === 'workshop' && selectedPanel === 'settlement' && !buildWorkshop.disabled) button('build-workshop');
    else button('close-context');
    return;
  }
  if (stage === 'welcome' || stage === 'ready' || b.lessonComplete) { button('onboarding-primary'); return; }
  if (stage === 'build') { button(catalogPanel === 'tower' ? 'pick-archer' : 'tower-tab'); return; }
  if (!b.learningPaused) { lessonPointer.show(); return; }
  if (stage === 'upgrade') world('upgrade');
  else if (stage === 'research') world('research');
  else if (stage === 'workshop') button(catalogPanel === 'settlement' ? 'pick-workshop' : 'settlement-tab');
  else if (stage === 'frost') button(catalogPanel === 'tower' ? 'pick-frost' : 'tower-tab');
  else lessonPointer.show();
}

function positionContext(): void {
  const panel = element('context-panel');
  if (panel.hidden || !scene || window.innerWidth <= 700) return;
  const anchor = scene.uiAnchor(selectedPanel);
  const canvas = game?.canvas.getBoundingClientRect();
  if (!anchor || !canvas) return;
  const x = canvas.left + anchor.x * canvas.width / scene.scale.width;
  const y = canvas.top + anchor.y * canvas.height / scene.scale.height;
  const box = panel.getBoundingClientRect();
  const top = document.querySelector('.app-header')!.getBoundingClientRect().bottom + 10;
  const bottom = document.querySelector('.command-dock')!.getBoundingClientRect().top - 10;
  panel.style.left = `${Math.max(10, Math.min(window.innerWidth - box.width - 10, x + box.width + 30 < window.innerWidth ? x + 30 : x - box.width - 30))}px`;
  panel.style.top = `${Math.max(top, Math.min(bottom - box.height, y - box.height / 2))}px`;
}

function closeContext(): void { ilyraMode = undefined; groundMode = undefined; groundCandidate = undefined; contextOpen = false; selectedPadId = undefined; scene?.setSelected(); syncUI(); }
function openContext(kind: typeof selectedPanel): void {
  if (session?.battle.preparing || performance.now() < workshopRevealUntil) return;
  ilyraMode = undefined; groundMode = undefined; groundCandidate = undefined; placementType = undefined; selectedPanel = kind; contextOpen = true;
  if (kind !== 'tower') { selectedPadId = undefined; scene?.setSelected(); }
  scene?.focusObject(kind); syncUI();
  if (kind === 'tavern' && session?.battle.tavernUnlocked && !session.battle.settlement.tavernSeen)
    void perform(b => { b.settlement.tavernSeen = true; }, true, true);
  if (kind === 'warehouse' && session?.battle.warehouseUnlocked && !(session.battle.tutorial.seen & (1 << 12)))
    void perform(b => { b.tutorial.seen |= 1 << 12; }, true, true);
}
function startPlacement(kind: TowerId): void {
  if (!session || !ready) return;
  if (session.battle.preparing && kind !== 1) return;
  if (session.battle.guiding && kind === 1) { if (session.battle.introduction.stage === 'upgrade') showLearningTower(); return; }
  if (session.battle.guiding && (kind !== 2 || session.battle.introduction.stage !== 'frost')) return;
  if (session.battle.introduction.stage === 'welcome') { void perform(b => b.beginIntroduction()).then(() => { if (session?.battle.introduction.stage === 'build') startPlacement(kind); }); return; }
  if (kind === 2 && !session.battle.settlement.frostResearched) { catalogPanel = 'settlement'; openContext('settlement'); return; }
  if (!session.battle.isTowerUnlocked(kind)) { if (kind === 3) openContext('wisp'); else { element('combat-message').textContent = 'Scharfschütze: Welle 10 meistern. Ab Welle 11 schützt Rüstung einen Teil der Gegner.'; toastUntil = performance.now() + 6000; syncUI(); } return; }
  if (placementType === kind) { placementType = undefined; closeContext(); return; }
  ilyraMode = undefined; groundMode = undefined; groundCandidate = undefined; catalogPanel = 'tower'; placementType = kind; contextOpen = false; selectedPadId = undefined; scene?.setSelected();
  // Only guided construction suggests a location. Ordinary purchases keep the player's view.
  const preferred = session.battle.preparing ? 'cell-6-6' : session.battle.guiding && kind === 2 ? session.battle.recommendedFrostPad
    : discoveryStep(session.battle) === 'cannon' && kind === 3 ? session.battle.recommendedCannonPad : undefined;
  const pads = session.battle.layout.towerPads.filter(pad => session!.battle.preparing ? session!.battle.isStarterLocation(pad.id) : session!.battle.guiding ? session!.battle.isLearningFrostLocation(pad.id) : session!.battle.isPadUnlocked(pad.id) && !session!.battle.towers.some(tower => tower.padId === pad.id));
  if (!pads.length) { placementType = undefined; selectedPadId = 'tower-03'; scene?.setSelected(selectedPadId); openContext('tower'); }
  else if (preferred) { selectedPadId = pads.find(pad => pad.id === preferred)?.id ?? pads[0].id; scene?.setSelected(selectedPadId); scene?.focusPad(selectedPadId); }
  syncUI();
}
async function placeTower(padId: string, kind: TowerId = 1): Promise<boolean> {
  const live = session;
  if (!live || live.paused || !live.battle.preparing && live.battle.towers.some(tower => tower.padId === padId)) return false;
  await perform(battle => battle.build(padId, kind));
  const built = session === live && !live.error && live.battle.towers.some(tower => tower.padId === padId);
  if (built) { scene?.focusObject('tower'); placementType = undefined; closeContext(); }
  return built;
}
async function selectPad(padId?: string): Promise<void> {
  if (session?.battle.preparing && !placementType) return;
  selectedPadId = padId; selectedPanel = 'tower'; scene?.setSelected(padId);
  if (!padId) { contextOpen = false; syncUI(); return; }
  const kind = placementType;
  if (kind) { contextOpen = false; if (session?.battle.canBuild(padId, kind)) await placeTower(padId, kind); else syncUI(); return; }
  placementType = undefined;
  contextOpen = true; scene?.focusObject('tower'); syncUI();
}

async function boot(options: { temporary?: boolean; recover?: boolean } = {}, ownershipRetries = 6): Promise<void> {
  if (booting || document.hidden) return;
  if (retryTimer !== undefined) { clearTimeout(retryTimer); retryTimer = undefined; }
  booting = true; ready = false;
  build.disabled = upgrade.disabled = sell.disabled = pause.disabled = advance.disabled = claim.disabled = assignMara.disabled = true;
  element('app-error').hidden = true; element('load-actions').hidden = true; element('error-panel').hidden = true;
  try {
    gameResize?.disconnect(); gameResize = undefined;
    game?.destroy(true); game = undefined; scene = undefined; focusedLesson = ""; focusedDiscovery = ""; lessonPointer.show();
    const previous = session; session = undefined;
    await previous?.close().catch(() => undefined);
    store?.close(); store = options.temporary ? undefined : await openBattleStore(undefined, databaseName);
    const live = await BattleSession.open(store, { recover: options.recover });
    session = live;
    progressUI.reset();
    if (document.hidden && !live.temporary) { await live.suspend(); return; }
    if (live.battle.wave > 0) element('combat-message').textContent = 'Gespeicherte Verteidigung geladen. Gold, Türme und laufender Kampf sind wieder da.';
    live.onChange = () => { if (session === live) { scene?.refresh(); syncUI(); } };
    live.onError = error => { if (session === live) { showError(`Die Probe ist angehalten; der letzte bestätigte Stand bleibt erhalten. ${error.message}`, false, true); syncUI(); } };
    // Render at up to twice CSS resolution on dense displays. Phaser's own
    // displayScale maps touch coordinates back into the larger canvas.
    const pixelDensity = Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1)));
    const host = element('game');
    const view = new BattleScene(() => live.battle, {
      advance(seconds) { live.advance(seconds); },
      canRender: () => !live.busy,
      changed: syncUI,
      select(padId) { void selectPad(padId); },
      ground(cell) { if (groundMode === 'mara') { let accepted = false; void perform(b => { accepted = b.moveMaraTo(cell); }).then(() => { if (accepted && !live.error) closeContext(); else { element('placement-text').textContent = 'Dorthin führt kein freier Weg. Wähle ein anderes Feld.'; } }); } else { groundCandidate = cell; const id = groundMode; if (id && !buildingBuilt(live.battle, id)) void placeBuilding(id, cell); else syncUI(); } },
      selectWisp() { openContext('wisp'); },
      selectMara() { openContext('mara'); },
      selectIlyra() { openContext('ilyra'); },
      ilyraGround(point) {
        const mode = ilyraMode; if (!mode) return;
        let accepted = false;
        void perform(b => { accepted = mode === 'move' ? b.moveIlyraTo({x:Math.floor(point.x/40),y:Math.floor(point.y/40)}) : b.castIlyraAt(point); }, mode === 'move', true).then(() => {
          if (accepted && !live.error) closeContext();
          else element('placement-text').textContent = mode === 'move' ? 'Kein freier Weg dorthin. Wähle einen anderen Standort.' : 'Wähle Gegner innerhalb der blauen Reichweite. Die Salve muss bereit sein.';
        });
      },
      selectClearing() { catalogPanel = 'settlement'; openContext('clearing'); },
      selectTavern() { catalogPanel = 'settlement'; openContext('tavern'); },
      selectWarehouse() { catalogPanel = 'settlement'; openContext('warehouse'); },
      selectWorkshop() { catalogPanel = 'settlement'; openContext('settlement'); },
      ready() { ready = true; drawDockArt(view); view.setSelected(selectedPadId); syncUI(); },
    }, pixelDensity);
    scene = view;
    game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'game', width: Math.round(host.clientWidth * pixelDensity), height: Math.round(host.clientHeight * pixelDensity),
      backgroundColor: '#183424', pixelArt: true, roundPixels: true, render: { antialias: false }, audio: { noAudio: true },
      scene: [view], scale: { mode: Phaser.Scale.NONE, zoom: 1 / pixelDensity, autoCenter: Phaser.Scale.CENTER_BOTH },
    });
    const activeGame = game;
    gameResize = new ResizeObserver(() => {
      const width = Math.round(host.clientWidth * pixelDensity), height = Math.round(host.clientHeight * pixelDensity);
      if (width > 0 && height > 0 && (activeGame.scale.width !== width || activeGame.scale.height !== height)) activeGame.scale.resize(width, height);
    });
    gameResize.observe(host);
  } catch (error) {
    session = undefined;
    const message = error instanceof Error ? error.message : String(error);
    const ownership = error instanceof SessionOwnershipError;
    if (ownership && ownershipRetries > 0) {
      element('save-status').textContent = 'Schreibfreigabe wird geprüft …';
      element('layout-status').textContent = 'Warte kurz auf die Freigabe der bisherigen Registerkarte.';
      retryTimer = window.setTimeout(() => { void boot(options, ownershipRetries - 1); }, 1000);
      return;
    }
    showError(ownership ? 'Spiel bereits in einem anderen Tab aktiv. Dieser Tab führt keinen Kampf aus und vergibt kein Gold. Du kannst ihn erneut aktivieren, wenn der andere Tab nicht mehr aktiv ist.'
      : `Der Spielstand wurde nicht überschrieben. ${message}`, error instanceof SessionLoadError && error.canRecover, ownership);
    element('save-status').textContent = ownership ? 'Anderer Tab ist aktiv' : 'Spielstand konnte nicht geladen werden';
  } finally { booting = false; }
}
async function perform(action: (battle: IdleBattle) => unknown, allowPaused = false, waitForSave = false): Promise<void> {
  const live = session;
  if (!ready || !live || (!allowPaused && live.paused) || live.error || document.hidden || live.awaitingResume || live.suspended) return;
  const completion = live.command(action, waitForSave || live.battle.introduction.stage !== 'done' || live.battle.discoveryActive);
  syncUI(); await completion;
  scene?.refresh(); syncUI();
}
function startGroundPlacement(id: BuildingId | 'mara'): void {
  if (!session || !ready || session.battle.preparing) return;
  ilyraMode = undefined; placementType = undefined; contextOpen = false; selectedPadId = undefined; scene?.setSelected(); groundMode = id;
  groundCandidate = id === 'mara' ? undefined : id === 'tavern' ? session.battle.recommendedTavernPlot : { ...session.battle.plots[id] };
  scene?.focusObject(id === 'workshop' ? 'settlement' : id); syncUI();
}
function showLearningTower(): void {
  const tower = session?.battle.towers.find(t => t.protected); if (!tower) return;
  selectedPadId = tower.padId; scene?.setSelected(tower.padId); openContext('tower'); scene?.focusPad(tower.padId);
}
element('onboarding-primary').addEventListener('click', () => {
  const b = session?.battle; if (!b) return;
  const stage = b.introduction.stage;
  if (stage === 'welcome') { void perform(b => b.beginIntroduction()); return; }
  if (stage === 'ready') { void perform(b => b.startDefense()); return; }
  if (b.lessonComplete) { void perform(b => b.continueLesson()); return; }

}, { signal: lifetime.signal });
element('dismiss-fallback').addEventListener('click', () => {
  void perform(b => { b.dismissedDefeatAttempt = b.progress.lastDefeat?.attemptId ?? 0; }, true, true);
}, { signal: lifetime.signal });
element('discovery-next').addEventListener('click', () => {
  void perform(b => b.continueDiscovery(), false, true);
}, { signal: lifetime.signal });
element('discovery-later').addEventListener('click', () => {
  void perform(b => b.dismissDiscovery(), false, true);
}, { signal: lifetime.signal });
element('onboarding-secondary').addEventListener('click', () => {
  if (session?.battle.introduction.stage === 'ready') startPlacement(1);
  else void perform(b => b.skipLessons());
}, { signal: lifetime.signal });
for (const id of ['workshop', 'warehouse', 'tavern', 'mara'] as const) element(`move-${id}`).addEventListener('click', () => startGroundPlacement(id), { signal: lifetime.signal });
element('mara-auto').addEventListener('click', () => { void perform(b => { b.mara.autoCast = !b.mara.autoCast; }); }, { signal: lifetime.signal });
element('cast-mara').addEventListener('click', () => { void perform(b => b.castMaraNow()).then(() => closeContext()); }, { signal: lifetime.signal });
element('meet-wisp').addEventListener('click', () => { void perform(b => { b.meetWisp(); }, true, true); }, { signal: lifetime.signal });
element('confirm-placement').addEventListener('click', () => {
  if (placementType && selectedPadId) { void placeTower(selectedPadId, placementType); return; }
  const id = groundMode, cell = groundCandidate;
  if (cell && id && id !== 'mara') void placeBuilding(id, cell);
}, { signal: lifetime.signal });
async function placeBuilding(id: BuildingId, cell: GridCell): Promise<void> {
  const live = session; if (!live || live.battle.phase === 'defeat' || !live.battle.canPositionBuilding(id, cell)) return;
  const built = buildingBuilt(live.battle, id);
  if (!built && live.battle.gold < buildingCost(live.battle, id)) return;
  let accepted = false;
  if (!built) workshopRevealUntil = performance.now() + 1800;
  await perform(b => {
    if (buildingBuilt(b, id)) { if (live.paused) accepted = b.positionBuilding(id, cell); return; }
    if (id === 'tavern') { accepted = b.buildTavern(cell); return; }
    if (b.gold < buildingCost(b, id) || id === 'warehouse' && !b.warehouseUnlocked) return;
    if (!b.positionBuilding(id, cell)) return;
    accepted = id === 'workshop' ? b.buildWorkshop() : b.buildWarehouse();
  }, true, true);
  if (accepted && !live.error) { scene?.focusObject(id === 'workshop' ? 'settlement' : id); closeContext(); }
  else { workshopRevealUntil = 0; element('placement-text').textContent = 'Hier ist kein freier Zugang. Wähle einen anderen Platz.'; }
}
build.addEventListener('click', () => { if (selectedPadId) void placeTower(selectedPadId); }, { signal: lifetime.signal });
buildFrost.addEventListener('click', () => { if (selectedPadId) void placeTower(selectedPadId, 2); }, { signal: lifetime.signal });
element('build-tavern').addEventListener('click', () => startGroundPlacement('tavern'), { signal: lifetime.signal });
element('pick-tavern').addEventListener('click', () => openContext('tavern'), { signal: lifetime.signal });
buildWarehouse.addEventListener('click', () => { startGroundPlacement('warehouse'); }, { signal: lifetime.signal });
buildWorkshop.addEventListener('click', () => { startGroundPlacement('workshop'); }, { signal: lifetime.signal });
element('upgrade-workshop').addEventListener('click', () => { void perform(battle => battle.upgradeWorkshop()); }, { signal: lifetime.signal });
element('replay-first-boss').addEventListener('click', () => { void perform(b => b.requestBossChallenge(15)).then(() => { if (session?.battle.bossChallengeRequested) element<HTMLDialogElement>('chronicle').close(); }); }, { signal: lifetime.signal });
researchFrost.addEventListener('click', () => { void perform(battle => battle.researchFrost()).then(() => { if (session?.battle.guiding && session.battle.lessonComplete) closeContext(); }); }, { signal: lifetime.signal });
padChoice.addEventListener('change', () => { placementType = undefined; void selectPad(padChoice.value || undefined); }, { signal: lifetime.signal });
for (const kind of ['tower', 'settlement'] as const) {
  element(`${kind}-tab`).addEventListener('click', () => { catalogPanel = kind; placementType = undefined; closeContext(); if (kind === 'settlement' && session?.battle.tavernUnlocked && !session.battle.settlement.tavernSeen) element('pick-tavern').scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, { signal: lifetime.signal });
  element(`${kind}-tab`).addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault(); const other = kind === 'tower' ? 'settlement' : 'tower';
    element(`${other}-tab`).click(); element(`${other}-tab`).focus();
  }, { signal: lifetime.signal });
}
element('choose-frost').addEventListener('click', () => startPlacement(2), { signal: lifetime.signal });
for (const [name, kind] of [['cannon', 3], ['sniper', 4]] as const) {
  element(`pick-${name}`).addEventListener('click', () => startPlacement(kind), { signal: lifetime.signal });
  element(`build-${name}`).addEventListener('click', () => { if (selectedPadId) void placeTower(selectedPadId, kind); }, { signal: lifetime.signal });
}
for (const hero of ['mara','wisp','ilyra'] as const) element(`tavern-${hero}`).addEventListener('click', () => openContext(hero), { signal: lifetime.signal });
element('pick-ilyra').addEventListener('click', () => openContext('ilyra'), { signal: lifetime.signal });
element('recruit-ilyra').addEventListener('click', () => {
  void perform(b => b.recruitIlyra(), true, true).then(() => { if (session?.battle.ilyra) { closeContext(); scene?.focusObject('ilyra'); element('combat-message').textContent = 'Ilyra ist dabei. Wähle ihr Porträt, um ihren Standort am Weg festzulegen.'; toastUntil = performance.now() + 4500; syncUI(); } });
}, { signal: lifetime.signal });
for (const mode of ['move','cast'] as const) element(mode === 'move' ? 'move-ilyra' : 'aim-ilyra').addEventListener('click', () => {
  const b = session?.battle; if (!b?.ilyra) return;
  placementType = undefined; groundMode = undefined; groundCandidate = undefined; contextOpen = false; selectedPadId = undefined; scene?.setSelected(); ilyraMode = mode;
  const starter = b.towers.find(t => t.protected);
  if (mode === 'move' && b.ilyra.introduction === 'move' && starter) scene?.focusPad(starter.padId); else scene?.focusObject('ilyra');
  syncUI();
}, { signal: lifetime.signal });
element('ilyra-auto').addEventListener('click', () => { void perform(b => b.setIlyraAuto(!b.ilyra?.autoCast), true, true); }, { signal: lifetime.signal });
element('pick-wisp').addEventListener('click', () => openContext('wisp'), { signal: lifetime.signal });
element('challenge-boss').addEventListener('click', () => {
  void perform(b => b.requestBossChallenge(b.nextBossWave)).then(() => { if (session?.battle.bossChallengeRequested) element<HTMLDialogElement>('chronicle').close(); });
}, { signal: lifetime.signal });
element('catalog-next').addEventListener('click', () => { const list = element(`${catalogPanel}-catalog`); list.scrollTo({ left: list.scrollLeft >= list.scrollWidth - list.clientWidth - 2 ? 0 : list.scrollLeft + list.clientWidth, behavior: 'smooth' }); }, { signal: lifetime.signal });
element('pick-archer').addEventListener('click', () => startPlacement(1), { signal: lifetime.signal });
element('pick-frost').addEventListener('click', () => startPlacement(2), { signal: lifetime.signal });
element('pick-clearing').addEventListener('click', () => openContext('clearing'), { signal: lifetime.signal });
element('unlock-clearing').addEventListener('click', async () => {
  const live = session; if (!live || !live.paused || live.busy || live.error) return;
  const completion = live.relocateSettlement(); syncUI();
  const moved = await completion; scene?.refresh();
  if (moved) { closeContext(); scene?.showBase(); }
  syncUI();
}, { signal: lifetime.signal });
element('show-clearing').addEventListener('click', () => { placementType = undefined; closeContext(); scene?.showBase(); }, { signal: lifetime.signal });

element('pick-warehouse').addEventListener('click', () => openContext('warehouse'), { signal: lifetime.signal });
element('pick-workshop').addEventListener('click', () => {
  if (session?.battle.settlement.workshopBuilt) openContext('settlement');
  else startGroundPlacement('workshop');
}, { signal: lifetime.signal });
element('skip-lessons').addEventListener('click', () => {
  void perform(b => b.skipLessons(), true, true).then(() => element<HTMLDialogElement>('game-menu').close());
}, { signal: lifetime.signal });
element('pick-mara').addEventListener('click', () => openContext('mara'), { signal: lifetime.signal });
element('close-context').addEventListener('click', closeContext, { signal: lifetime.signal });
element('cancel-placement').addEventListener('click', () => { placementType = undefined; closeContext(); }, { signal: lifetime.signal });
element('placement-pads').addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-pad]');
  if (button?.dataset.pad) void selectPad(button.dataset.pad);
}, { signal: lifetime.signal });
const menu = element<HTMLDialogElement>('game-menu');
element('open-menu').addEventListener('click', () => menu.showModal(), { signal: lifetime.signal });
element('close-menu').addEventListener('click', () => menu.close(), { signal: lifetime.signal });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.open) { placementType = undefined; closeContext(); } }, { signal: lifetime.signal });
element('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.fullscreenEnabled) await document.documentElement.requestFullscreen();
    else throw new Error('Fullscreen unavailable');
  } catch {
    element('fullscreen-notice').hidden = false;
    if (!menu.open) menu.showModal();
  }
}, { signal: lifetime.signal });
document.addEventListener('fullscreenchange', () => {
  const active = Boolean(document.fullscreenElement);
  element('fullscreen').setAttribute('aria-label', active ? 'Vollbild verlassen' : 'Vollbild');
  element('fullscreen').setAttribute('aria-pressed', String(active));
  element('fullscreen').title = active ? 'Vollbild verlassen' : 'Vollbild';
}, { signal: lifetime.signal });
element('mobile-hint').addEventListener('click', () => { mobileHintOpen = true; syncUI(); }, { signal: lifetime.signal });
element('close-mobile-hint').addEventListener('click', () => { mobileHintOpen = false; syncUI(); }, { signal: lifetime.signal });
element('hint-action').addEventListener('click', () => {
  const b = session?.battle, tower = b?.towers.find(t => t.uid === b.mara.targetTowerUid);
  if (tower) { selectedPadId = tower.padId; scene?.setSelected(tower.padId); scene?.focusPad(tower.padId); }
}, { signal: lifetime.signal });
element('hint-skip').addEventListener('click', () => { void perform(battle => { battle.tutorial.hidden = true; }, true); }, { signal: lifetime.signal });
element('hint-read').addEventListener('click', () => { const step = session && tutorialStep(session.battle); if (step !== undefined) void perform(battle => { battle.tutorial.seen |= 1 << step; }, true, true); }, { signal: lifetime.signal });
element('show-hints').addEventListener('click', () => { menu.close(); placementType = undefined; closeContext(); mobileHintOpen = true; void perform(battle => { battle.tutorial.hidden = false; battle.tutorial.seen = 0; }, true); }, { signal: lifetime.signal });
element('new-probe').addEventListener('click', () => {
  const url = new URL(location.href); url.searchParams.set('probe', crypto.randomUUID());
  void (session?.suspend() ?? Promise.resolve()).then(() => location.assign(url));
}, { signal: lifetime.signal });
upgrade.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.upgrade(tower.uid); }).then(() => { if (session?.battle.guiding && session.battle.lessonComplete) closeContext(); }); }, { signal: lifetime.signal });
sell.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.sell(tower.uid); }); }, { signal: lifetime.signal });
advance.addEventListener('click', () => { void perform(battle => battle.requestAdvance()); }, { signal: lifetime.signal });
assignMara.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.assignMara(tower.uid); }); }, { signal: lifetime.signal });
element('camera-reset').addEventListener('click', () => {
  const b = session?.battle;
  if (groundMode && groundMode !== 'mara') scene?.focusObject(groundMode === 'workshop' ? 'settlement' : groundMode);
  else if (placementType && selectedPadId) scene?.focusPad(selectedPadId);
  else if (b?.learningPaused && b.introduction.stage === 'research') scene?.focusObject('settlement');
  else if (b?.learningPaused && b.introduction.stage === 'upgrade') { const tower = b.towers.find(t => t.protected); if (tower) scene?.focusPad(tower.padId); }
  else { placementType = undefined; closeContext(); scene?.resetCamera(); }
  syncUI();
}, { signal: lifetime.signal });
element('camera-zoom').addEventListener('click', () => { if (scene) scene.setMapZoom(scene.mapZoom > 1 ? 1 : 1.15); syncUI(); }, { signal: lifetime.signal });
pause.addEventListener('click', () => { if (session) { const completion = session.setPaused(!session.paused); syncUI(); void completion.then(syncUI); } }, { signal: lifetime.signal });
claim.addEventListener('click', () => {
  const live = session;
  if (!live || live.busy || live.error || document.hidden) return;
  const complete = async () => {
    if (live.pendingReward) await live.claimOffline();
    if (!live.error && !document.hidden) await live.resumeActive();
    syncUI();
  };
  void complete(); syncUI();
}, { signal: lifetime.signal });
element('reset').addEventListener('click', () => {
  void (session?.suspend() ?? Promise.resolve()).catch(() => undefined).then(() => window.location.reload());
}, { signal: lifetime.signal });
recover.addEventListener('click', () => { void boot({ recover: true }); }, { signal: lifetime.signal });
element('temporary-session').addEventListener('click', () => { void boot({ temporary: true }); }, { signal: lifetime.signal });
element('activate-session').addEventListener('click', () => { void boot(); }, { signal: lifetime.signal });

document.addEventListener('visibilitychange', () => {
  const hidden = document.hidden;
  syncUI();
  lifecycle = lifecycle.then(async () => {
    if (session?.temporary) { if (hidden) await session.flush(); syncUI(); return; }
    if (hidden) await session?.suspend(); else await boot();
  })
    .catch(error => showError(`Die Probe ist angehalten. ${error instanceof Error ? error.message : String(error)}`, false, true));
}, { signal: lifetime.signal });
window.addEventListener('pagehide', () => { void session?.suspend().catch(() => undefined); }, { signal: lifetime.signal });
const heartbeat = window.setInterval(() => {
  if (!document.hidden && session && !session.suspended) void session.heartbeat().catch(() => syncUI());
}, 1000);
if (import.meta.hot) import.meta.hot.dispose(() => { lifetime.abort(); clearInterval(heartbeat); clearTimeout(retryTimer); game?.destroy(true); void session?.close().catch(() => undefined); });
void boot();

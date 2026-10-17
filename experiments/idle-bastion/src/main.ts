import Phaser from 'phaser';
import './battle.css';
import './progress.css';
import './premium.css';
import { mountUIIcons } from './ui-icons';
import { SETTLEMENT, towerDefinition, type TowerId, stats, upgradeCost, sellValue, type IdleBattle } from './battle';
import { BattleScene } from './battle-scene';
import { nextObjective, tutorialHint, tutorialStep } from './hud';
import { BattleSession, SessionLoadError, SessionOwnershipError } from './battle-session';
import { openBattleStore, type BattleSaveStore } from './save-store';
import { farmRewardGold } from './farming';
import { ART } from './art';
import { drawDockArt } from './dock-art';
import { createProgressUI } from './progress-ui';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing battle element: ${id}`);
  return value as T;
};
mountUIIcons();
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
let store: BattleSaveStore | undefined;
let selectedPadId: string | undefined;
let selectedPanel: 'tower' | 'settlement' | 'mara' | 'wisp' = 'tower';
let catalogPanel: 'tower' | 'settlement' = 'tower';
let contextOpen = false;
let placementType: TowerId | undefined;
let toastUntil = 0;
let padListKey = '';
let mobileHintOpen = false;
let mobileHintStep = -1;
let ready = false;
let booting = false;
let lifecycle = Promise.resolve();
let retryTimer: number | undefined;
const progressUI = createProgressUI(action => {
  if (action === 'archer' || action === 'frost' || action === 'cannon' || action === 'sniper') startPlacement(({ archer: 1, frost: 2, cannon: 3, sniper: 4 } as const)[action]);
  else if (action === 'workshop') { catalogPanel = 'settlement'; openContext('settlement'); }
  else if (action === 'upgrade' && session) {
    const towers = session.battle.towers;
    const tower = [...towers].filter(t => t.level < session!.battle.maxLevel).sort((a, b) => upgradeCost(a) - upgradeCost(b))[0] ?? towers[0];
    selectedPadId = tower.padId; scene?.setSelected(selectedPadId); openContext('tower');
  }
}, lifetime.signal);

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
  element<HTMLButtonElement>('build-cannon').disabled = element<HTMLButtonElement>('build-sniper').disabled = unavailable;
  buildFrost.disabled = buildWorkshop.disabled = researchFrost.disabled = unavailable;
  if (!ready || !live || !view) return;
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
  element('settlement-panel').hidden = selectedPanel !== 'settlement';
  element('wisp-panel').hidden = selectedPanel !== 'wisp';
  element('wisp-status').textContent = sim.wispUnlocked ? 'Aktiv · +10 % Kampf-Gold. Auftrag: die Werkstatt versorgen.' : `Wisp kommt kostenlos nach Frostfassung und gemeisterter Welle 5. ${sim.settlement.frostResearched ? 'Frostfassung ✓' : 'Frostfassung fehlt'} · ${sim.highestCleared >= 5 ? 'Welle 5 ✓' : 'Welle 5 noch offen'}.`;
  element('pick-wisp').classList.toggle('locked', !sim.wispUnlocked);
  element('wisp-brief').textContent = sim.wispUnlocked ? '+10 % Gold' : 'Frost & Welle 5';
  element('pick-wisp').setAttribute('aria-label', sim.wispUnlocked ? 'Wisp · +10 Prozent Kampf-Gold' : 'Wisp · Frostfassung und Welle 5 nötig');
  element('catalog-next').hidden = catalogPanel !== 'tower';
  element('mara-panel').hidden = selectedPanel !== 'mara';
  element('context-panel').hidden = !contextOpen || live.awaitingResume || Boolean(live.error);
  element('tower-catalog').hidden = catalogPanel !== 'tower';
  element('settlement-catalog').hidden = catalogPanel !== 'settlement';
  for (const kind of ['tower', 'settlement'] as const) {
    element(`${kind}-tab`).setAttribute('aria-selected', String(catalogPanel === kind));
    element(`${kind}-tab`).tabIndex = catalogPanel === kind ? 0 : -1;
  }
  element('placement-help').hidden = !placementType || live.awaitingResume;
  element('placement-text').textContent = `${towerDefinition(placementType ?? 1).name} · hellen Bauplatz wählen`;
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
    const names: Record<string, string> = { 'tower-02': 'Nordwest', 'tower-03': 'Nordost', 'tower-04': 'Südkurve', 'tower-05': 'Nordweg', 'tower-06': 'Engpass', 'tower-07': 'Südweg', 'tower-08': 'Kernwache' };
    const current = padChoice.value;
    padChoice.replaceChildren(new Option('Bauplatz wählen …', ''), ...sim.layout.towerPads.filter(pad => sim.isPadUnlocked(pad.id)).map(pad => new Option(names[pad.id] ?? 'Startturm', pad.id)));
    padChoice.value = current;
    element('placement-pads').replaceChildren(...freePads.map(pad => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.pad = pad.id;
      button.textContent = names[pad.id] ?? pad.id; return button;
    }));
  }
  const certificate = live.certificate;
  element('next-objective').textContent = nextObjective(sim);
  element('play-time').textContent = `${Math.floor(sim.elapsed / 60)}:${String(Math.floor(sim.elapsed % 60)).padStart(2, '0')}`;
  const hintStep = tutorialStep(sim);
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  if (hintStep !== mobileHintStep) { mobileHintStep = hintStep; mobileHintOpen = false; }
  const hintAvailable = !sim.tutorial.hidden && !(sim.tutorial.seen & (1 << hintStep)) && !contextOpen && !placementType && !live.awaitingResume;
  element('tutorial-card').hidden = !hintAvailable || (mobile && !mobileHintOpen);
  element('mobile-hint').hidden = !mobile || !hintAvailable || mobileHintOpen;
  element('mobile-hint').setAttribute('aria-expanded', String(mobileHintOpen));
  element('tutorial-hint').textContent = tutorialHint(sim);
  element('tutorial-card').dataset.step = String(hintStep);
  const mara = sim.mara;
  const maraTarget = sim.towers.find(tower => tower.uid === mara.targetTowerUid);
  const targetName = maraTarget?.protected ? 'Startturm' : maraTarget?.def.name ?? 'Startturm';
  element('mara-brief').textContent = mara.path.length ? 'Unterwegs' : mara.effectRemaining > 0 ? 'Übertakten aktiv' : 'Unterstützt den Turm';
  element('mara-status').textContent = mara.unreachable ? 'Mara erreicht dieses Ziel nicht. Wähle einen anderen Turm.'
    : mara.path.length ? `Mara ist unterwegs zum ${targetName}. Noch kein Bonus während der Anreise.`
    : mara.effectRemaining > 0 ? `Übertakten aktiv · ${Math.ceil(mara.effectRemaining)} s · ${targetName}`
    : mara.cooldownRemaining > 0 ? `Beim ${targetName} · wieder bereit in ${Math.ceil(mara.cooldownRemaining)} s`
    : `Beim ${targetName} · bereit für die nächste Welle.`;
  element('camera-zoom').setAttribute('aria-pressed', String(view.mapZoom > 1));
  element('camera-zoom').setAttribute('aria-label', view.mapZoom > 1 ? 'Karte weiter ansehen' : 'Karte näher ansehen');
  element('safe-rate').textContent = `${rateFormat.format(certificate ? farmRewardGold(certificate) * 60000 / certificate.durationMs : 0)} G/min sicher`;
  element('safe-rate').title = certificate ? `Welle ${certificate.wave}: zwei konservative, schadensfreie Wiederholungen inklusive Wellenpausen. Grundlage für 60 % Offline-Ertrag.`
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
  advance.textContent = sim.advanceRequested ? 'Vorstoß vorgemerkt' : `Erneut vorstoßen · Welle ${sim.highestCleared + 1}`;
  advance.disabled = unavailable || view.paused || sim.advanceRequested;
  element('return-card').hidden = !live.awaitingResume;
  if (live.awaitingResume) {
    const reward = live.pendingReward;
    element('return-details').textContent = reward
      ? `${live.paused ? 'Pause aktiv · ' : ''}${Math.floor(reward.elapsedMs / 1000)} s abwesend · ${rateFormat.format(reward.creditedMs / 60000)} min angerechnet · +${preciseCurrency.format(reward.amountUnits / 1000)} Gold`
      : live.paused ? 'Die gespeicherte Pause ist aktiv. Während der Pause entsteht kein Offline-Gold.' : 'Deine Verteidigung ist wieder bereit. Es ist keine Belohnung offen.';
    const basis = live.offline.window?.certificate;
    element('return-basis').textContent = `Sichere Basis beim Verlassen: ${rateFormat.format(basis ? farmRewardGold(basis) * 60000 / basis.durationMs : 0)} G/min · 60 % Ertrag · höchstens 2 Stunden. Der Kampf bleibt während der Rückkehr angehalten.`;
    claim.textContent = reward && reward.amountUnits > 0 ? 'Belohnung einsammeln und fortsetzen' : live.paused ? 'Zur pausierten Verteidigung' : 'Verteidigung fortsetzen';
    claim.disabled = unavailable || document.hidden;
  }
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  const pad = sim.layout.towerPads.find(value => value.id === selectedPadId);
  padChoice.value = selectedPadId ?? '';
  element('selection-title').textContent = selectedPanel === 'wisp' ? 'Wisp' : selectedPanel === 'mara' ? 'Mara' : selectedPanel === 'settlement' ? 'Werkstatt'
    : tower ? `${tower.def.name} · Level ${tower.level}` : pad ? 'Freier Bauplatz' : 'Bauplatz wählen';
  element('tower-name').textContent = tower?.def.name ?? 'Turm wählen';
  element('tower-role').textContent = tower?.def.id === 4 ? 'Bevorzugt Rüstung · ignoriert 100 % davon' : tower?.def.id === 3 ? 'Flächentreffer · 52 Reichweite um das Ziel' : tower?.def.id === 2 ? 'Frosttreffer · 45 % langsamer für 2 s' : 'Zuverlässige Pfeile · Allrounder';
  element('selection-description').textContent = selectedPanel !== 'tower' ? '' : tower
    ? tower.protected ? 'Dein erster Turm sichert die Grundverteidigung. Du kannst ihn verbessern.' : `${tower.def.name} verteidigt den Weg. Verbessere ihn oder investiere das Gold an anderer Stelle.`
    : (pad && sim.isPadUnlocked(pad.id)) ? 'Wähle einen freigeschalteten Turm für diesen Platz.'
    : pad ? `Dieser Platz öffnet nach gemeisterter Welle ${pad.availability === 'wave-5' ? 5 : 10}.` : 'Wähle einen hell markierten Platz auf der Karte.';
  build.hidden = Boolean(tower); upgrade.hidden = !tower; sell.hidden = !tower; assignMara.hidden = !tower;
  buildFrost.hidden = Boolean(tower) || !sim.settlement.frostResearched;
  const blocked = unavailable || view.paused || sim.phase === 'defeat';
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
  assignMara.disabled = blocked || !tower || tower.uid === mara.targetTowerUid;
  assignMara.textContent = tower?.uid === mara.targetTowerUid ? 'Mara unterstützt diesen Turm' : 'Mara hier einsetzen';
  sell.textContent = tower?.protected ? 'Geschützter Startturm' : `Verkaufen · +${currency.format(tower ? sellValue(tower) : 0)} Gold`;
  element('tower-stats').innerHTML = tower ? (() => {
    const values = stats(tower);
    return `<div><dt>Schaden</dt><dd>${values.damage.toFixed(1)}</dd></div><div><dt>Reichweite</dt><dd>${values.range}</dd></div><div><dt>Angriff alle</dt><dd>${values.cooldown.toFixed(2)} s</dd></div><div><dt>Abschüsse</dt><dd>${tower.kills}</dd></div>`;
  })() : '';
  element('action-hint').textContent = blocked ? live.error ? 'Der letzte bestätigte Spielstand bleibt erhalten.' : live.awaitingResume ? 'Setze die Verteidigung über den Rückkehrbeleg fort.' : 'Setze den Kampf fort, um zu bauen oder aufzuwerten.'
    : tower ? tower.level >= sim.maxLevel ? sim.settlement.frostResearched ? 'Level 6 erreicht.' : 'Frostfassung erschließt Level 4–6.' : sim.gold < upgradeCost(tower) ? `Noch ${currency.format(upgradeCost(tower) - sim.gold)} Gold bis zum nächsten Level.` : 'Mehr Schaden verbessert die Verteidigung sofort.'
    : (pad && sim.isPadUnlocked(pad.id)) && sim.gold < 75 ? `Noch ${currency.format(75 - sim.gold)} Gold bis zum Waldwächter.` : '';
  const settlement = sim.settlement;
  const workshopIcon = element<HTMLImageElement>('workshop-icon');
  const workshopSource = settlement.workshopBuilt ? ART.workshop : ART.workshopDamaged;
  if (workshopIcon.getAttribute('src') !== workshopSource) workshopIcon.src = workshopSource;
  element('workshop-card-title').textContent = settlement.workshopBuilt ? 'Werkstatt I' : 'Alte Werkstatt';
  element('workshop-card-copy').textContent = settlement.frostResearched ? 'Frosttechnik verfügbar' : settlement.workshopBuilt ? 'Frostfassung erforschen' : 'Reparieren & forschen';
  element('workshop-card-price').textContent = settlement.frostResearched ? '✓ Erforscht' : `${settlement.workshopBuilt ? SETTLEMENT.researchCost : SETTLEMENT.workshopCost}`;
  element('pick-workshop').classList.toggle('researched', settlement.frostResearched);
  element('workshop-title').textContent = settlement.workshopBuilt ? 'Werkstatt I' : 'Beschädigte Werkstatt';
  element('workshop-description').textContent = settlement.frostResearched
    ? 'Frostfassung erforscht · Frostkristall und Turmlevel 4–6 sind verfügbar.'
    : settlement.workshopBuilt ? 'Frostfassung erschließt den Frostkristall und Turmlevel 4–6.' : 'Repariere die alte Werkstatt. Danach kannst du Frosttechnik erforschen.';
  buildWorkshop.hidden = settlement.workshopBuilt;
  buildWorkshop.textContent = `Werkstatt reparieren · ${SETTLEMENT.workshopCost} Gold`;
  buildWorkshop.disabled = blocked || sim.gold < SETTLEMENT.workshopCost;
  researchFrost.hidden = !settlement.workshopBuilt || settlement.frostResearched;
  researchFrost.textContent = `Frostfassung erforschen · ${SETTLEMENT.researchCost} Gold`;
  researchFrost.disabled = blocked || sim.gold < SETTLEMENT.researchCost;
  element('choose-frost').hidden = !settlement.frostResearched;
  element('layout-status').textContent = view.paused ? 'Kampf angehalten.'
    : sim.mode === 'farm' ? `Sicheres Farmen · Welle ${sim.farmWave}. Ein neuer Vorstoß beginnt erst auf deinen Wunsch am Wellenübergang.`
    : `Automatischer Vorstoß · höchste geschaffte Welle ${sim.highestCleared}.`;
  const message = sim.drainEvents().filter(event => ['defeat', 'build', 'upgrade', 'sell', 'workshop', 'research', 'wisp', 'pads'].includes(event.type)).at(-1);
  if (message) toastUntil = performance.now() + 4500;
  if (message) element('combat-message').textContent = message.type === 'clear' ? `Welle ${message.wave} geschafft · +${currency.format(message.amount ?? 0)} Gold Abschlussbonus.`
    : message.type === 'kill' ? `Gegner besiegt · +${currency.format(message.amount ?? 0)} Gold.`
    : message.type === 'wave' ? `${mode} · Welle ${message.wave} hat begonnen. Deine Türme greifen automatisch an.`
    : message.type === 'wisp' ? 'Wisp ist da! +10 % Kampf-Gold und die Steinschleuder sind jetzt verfügbar.'
    : message.type === 'pads' ? `Welle ${message.wave} gemeistert: zwei weitere Bauplätze${message.wave === 10 ? ' und der Scharfschütze' : ''} sind verfügbar.`
    : message.type === 'build' ? `${message.tower?.def.name} gebaut und einsatzbereit.`
    : message.type === 'upgrade' ? `${message.tower?.def.name} verbessert. Der nächste Schuss nutzt den höheren Schaden.`
    : message.type === 'workshop' ? 'Die Werkstatt arbeitet wieder! Frostfassung ist jetzt erforschbar.'
    : message.type === 'research' ? 'Frostfassung erforscht! Baue einen Frostkristall oder verbessere Türme bis Level 6.'
    : message.type === 'sell' ? `Turm verkauft · +${currency.format(message.amount ?? 0)} Gold. Die sichere Farmbasis wird neu geprüft.`
    : 'Der Vorstoß ist gescheitert. Gold und Türme bleiben erhalten; die Verteidigung wechselt ins sichere Farmen.';
  element('combat-message').hidden = performance.now() > toastUntil || contextOpen || Boolean(placementType) || live.awaitingResume;
  progressUI.update(live);
  document.getElementById('app')!.classList.toggle('context-open', contextOpen || Boolean(placementType));
  positionContext();
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

function closeContext(): void { contextOpen = false; selectedPadId = undefined; scene?.setSelected(); syncUI(); }
function openContext(kind: typeof selectedPanel): void {
  placementType = undefined; selectedPanel = kind; contextOpen = true;
  if (kind !== 'tower') { selectedPadId = undefined; scene?.setSelected(); }
  scene?.focusObject(kind); syncUI();
}
function startPlacement(kind: TowerId): void {
  if (!session || !ready) return;
  if (kind === 2 && !session.battle.settlement.frostResearched) { catalogPanel = 'settlement'; openContext('settlement'); return; }
  if (!session.battle.isTowerUnlocked(kind)) { if (kind === 3) openContext('wisp'); else { element('combat-message').textContent = 'Scharfschütze: Welle 10 meistern. Ab Welle 11 schützt Rüstung einen Teil der Gegner.'; toastUntil = performance.now() + 6000; syncUI(); } return; }
  if (placementType === kind) { placementType = undefined; closeContext(); return; }
  catalogPanel = 'tower'; placementType = kind; contextOpen = false; selectedPadId = undefined; scene?.setSelected();
  const preferred = kind === 1 ? 'tower-03' : 'tower-02';
  const pads = session.battle.layout.towerPads.filter(pad => session!.battle.isPadUnlocked(pad.id) && !session!.battle.towers.some(tower => tower.padId === pad.id));
  if (!pads.length) { placementType = undefined; selectedPadId = 'tower-03'; scene?.setSelected(selectedPadId); openContext('tower'); }
  else scene?.focusPad(pads.find(pad => pad.id === preferred)?.id ?? pads[0].id);
  syncUI();
}
async function selectPad(padId?: string): Promise<void> {
  selectedPadId = padId; selectedPanel = 'tower'; scene?.setSelected(padId);
  if (!padId) { contextOpen = false; syncUI(); return; }
  const kind = placementType;
  if (kind && session?.battle.canBuild(padId, kind)) {
    await perform(battle => battle.build(padId, kind));
  }
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
    game?.destroy(true); game = undefined; scene = undefined;
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
    const view = new BattleScene(() => live.battle, {
      advance(seconds) { live.advance(seconds); },
      canRender: () => !live.busy,
      changed: syncUI,
      select(padId) { void selectPad(padId); },
      selectWisp() { openContext('wisp'); },
      selectMara() { openContext('mara'); },
      selectWorkshop() { catalogPanel = 'settlement'; openContext('settlement'); },
      ready() { ready = true; drawDockArt(view); view.setSelected(selectedPadId); syncUI(); },
    });
    scene = view;
    game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'game', width: live.battle.layout.startBounds.width, height: live.battle.layout.startBounds.height,
      backgroundColor: '#183424', pixelArt: true, roundPixels: true, render: { antialias: false }, audio: { noAudio: true },
      scene: [view], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    });
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
async function perform(action: (battle: IdleBattle) => unknown, allowPaused = false): Promise<void> {
  const live = session;
  if (!ready || !live || (!allowPaused && live.paused) || live.error || document.hidden || live.awaitingResume || live.suspended) return;
  const completion = live.command(action);
  syncUI(); await completion;
  scene?.refresh(); syncUI();
}
build.addEventListener('click', () => { void perform(battle => selectedPadId && battle.build(selectedPadId)); }, { signal: lifetime.signal });
buildFrost.addEventListener('click', () => { void perform(battle => selectedPadId && battle.build(selectedPadId, 2)); }, { signal: lifetime.signal });
buildWorkshop.addEventListener('click', () => { void perform(battle => battle.buildWorkshop()); }, { signal: lifetime.signal });
researchFrost.addEventListener('click', () => { void perform(battle => battle.researchFrost()); }, { signal: lifetime.signal });
padChoice.addEventListener('change', () => { placementType = undefined; void selectPad(padChoice.value || undefined); }, { signal: lifetime.signal });
for (const kind of ['tower', 'settlement'] as const) {
  element(`${kind}-tab`).addEventListener('click', () => { catalogPanel = kind; placementType = undefined; closeContext(); }, { signal: lifetime.signal });
  element(`${kind}-tab`).addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault(); const other = kind === 'tower' ? 'settlement' : 'tower';
    element(`${other}-tab`).click(); element(`${other}-tab`).focus();
  }, { signal: lifetime.signal });
}
element('choose-frost').addEventListener('click', () => startPlacement(2), { signal: lifetime.signal });
for (const [name, kind] of [['cannon', 3], ['sniper', 4]] as const) {
  element(`pick-${name}`).addEventListener('click', () => startPlacement(kind), { signal: lifetime.signal });
  element(`build-${name}`).addEventListener('click', () => { void perform(battle => selectedPadId && battle.build(selectedPadId, kind)); }, { signal: lifetime.signal });
}
element('pick-wisp').addEventListener('click', () => openContext('wisp'), { signal: lifetime.signal });
element('catalog-next').addEventListener('click', () => { const list = element('tower-catalog'); list.scrollTo({ left: list.scrollLeft >= list.scrollWidth - list.clientWidth - 2 ? 0 : list.scrollLeft + list.clientWidth, behavior: 'smooth' }); }, { signal: lifetime.signal });
element('pick-archer').addEventListener('click', () => startPlacement(1), { signal: lifetime.signal });
element('pick-frost').addEventListener('click', () => startPlacement(2), { signal: lifetime.signal });
element('pick-workshop').addEventListener('click', () => openContext('settlement'), { signal: lifetime.signal });
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
element('hint-skip').addEventListener('click', () => { void perform(battle => { battle.tutorial.hidden = true; }, true); }, { signal: lifetime.signal });
element('hint-read').addEventListener('click', () => { void perform(battle => { battle.tutorial.seen |= 1 << tutorialStep(battle); }, true); }, { signal: lifetime.signal });
element('show-hints').addEventListener('click', () => { menu.close(); placementType = undefined; closeContext(); mobileHintOpen = true; void perform(battle => { battle.tutorial.hidden = false; battle.tutorial.seen = 0; }, true); }, { signal: lifetime.signal });
element('new-probe').addEventListener('click', () => {
  const url = new URL(location.href); url.searchParams.set('probe', crypto.randomUUID());
  void (session?.suspend() ?? Promise.resolve()).then(() => location.assign(url));
}, { signal: lifetime.signal });
upgrade.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.upgrade(tower.uid); }); }, { signal: lifetime.signal });
sell.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.sell(tower.uid); }); }, { signal: lifetime.signal });
advance.addEventListener('click', () => { void perform(battle => battle.requestAdvance()); }, { signal: lifetime.signal });
assignMara.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.assignMara(tower.uid); }); }, { signal: lifetime.signal });
element('camera-reset').addEventListener('click', () => { placementType = undefined; closeContext(); scene?.resetCamera(); syncUI(); }, { signal: lifetime.signal });
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

import Phaser from 'phaser';
import './style.css';
import './battle.css';
import { stats, upgradeCost, sellValue, type IdleBattle } from './battle';
import { BattleScene } from './battle-scene';
import { nextObjective } from './hud';
import { BattleSession, SessionLoadError, SessionOwnershipError } from './battle-session';
import { openBattleStore, type BattleSaveStore } from './save-store';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing battle element: ${id}`);
  return value as T;
};
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
let session: BattleSession | undefined;
let scene: BattleScene | undefined;
let game: Phaser.Game | undefined;
let store: BattleSaveStore | undefined;
let selectedPadId: string | undefined = 'tower-02';
let ready = false;
let booting = false;
let lifecycle = Promise.resolve();
let retryTimer: number | undefined;

function showError(message: string, canRecover = false, ownership = false): void {
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
  const certificate = live.certificate;
  element('next-objective').textContent = nextObjective(sim);
  const mara = sim.mara;
  const maraTarget = sim.towers.find(tower => tower.uid === mara.targetTowerUid);
  const targetName = maraTarget?.protected ? 'Startturm' : maraTarget ? 'Waldwächter' : 'Startturm';
  element('mara-status').textContent = mara.unreachable ? 'Mara erreicht dieses Ziel nicht. Wähle einen anderen Turm.'
    : mara.path.length ? `Mara ist unterwegs zum ${targetName}. Noch kein Bonus während der Anreise.`
    : mara.effectRemaining > 0 ? `Übertakten aktiv · ${Math.ceil(mara.effectRemaining)} s · ${targetName}`
    : mara.cooldownRemaining > 0 ? `Beim ${targetName} · wieder bereit in ${Math.ceil(mara.cooldownRemaining)} s`
    : `Beim ${targetName} · bereit für die nächste Welle.`;
  element('camera-zoom').setAttribute('aria-pressed', String(view.mapZoom > 1));
  element('safe-rate').textContent = `Sicher: ${rateFormat.format(certificate ? certificate.rewardGold * 60000 / certificate.durationMs : 0)} G/min`;
  element('safe-rate').title = certificate ? `Welle ${certificate.wave}: zwei konservative, schadensfreie Wiederholungen inklusive Wellenpausen. Grundlage für 60 % Offline-Ertrag.`
    : 'Noch kein gültiger Farmnachweis. Eine erste Welle muss live geschafft und zweimal konservativ geprüft werden.';
  element('gold').textContent = preciseCurrency.format(sim.gold + sim.goldRemainderUnits / 1000);
  element('lives').textContent = `${sim.lives} / 20`;
  element('wave').textContent = String(sim.wave);
  const mode = sim.mode === 'farm' ? 'Farmen' : 'Vorstoß';
  element('battle-phase').textContent = live.error ? 'Angehalten' : live.awaitingResume ? 'Rückkehr' : view.paused ? 'Pause'
    : sim.phase === 'defeat' ? 'Wechsel ins sichere Farmen …'
    : sim.phase === 'wave' ? `${mode} · Welle ${sim.wave} · ${sim.remaining} Gegner`
    : `${mode} · nächste Welle in ${Math.ceil(sim.intermissionRemaining)} s`;
  pause.textContent = live.paused ? 'Weiter' : 'Pause';
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
    element('return-basis').textContent = `Sichere Basis beim Verlassen: ${rateFormat.format(basis ? basis.rewardGold * 60000 / basis.durationMs : 0)} G/min · 60 % Ertrag · höchstens 2 Stunden. Der Kampf bleibt während der Rückkehr angehalten.`;
    claim.textContent = reward && reward.amountUnits > 0 ? 'Belohnung einsammeln und fortsetzen' : live.paused ? 'Zur pausierten Verteidigung' : 'Verteidigung fortsetzen';
    claim.disabled = unavailable || document.hidden;
  }
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  const pad = sim.layout.towerPads.find(value => value.id === selectedPadId);
  element('selection-title').textContent = tower ? `Waldwächter · Level ${tower.level}` : pad ? 'Freier Bauplatz' : 'Bauplatz wählen';
  element('selection-description').textContent = tower
    ? tower.protected ? 'Dein erster Turm sichert die Grundverteidigung. Du kannst ihn verbessern.' : 'Dieser Waldwächter verteidigt den Weg. Verbessere ihn oder investiere das Gold an anderer Stelle.'
    : pad?.availability === 'initial' ? 'Hier kannst du einen weiteren Waldwächter errichten.'
    : pad ? 'Dieser Platz ist im aktuellen Startbereich noch nicht verfügbar.' : 'Wähle einen hell markierten Platz auf der Karte.';
  build.hidden = Boolean(tower); upgrade.hidden = !tower; sell.hidden = !tower; assignMara.hidden = !tower;
  const blocked = unavailable || view.paused || sim.phase === 'defeat';
  build.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId);
  const canUpgrade = Boolean(tower && tower.level < 3);
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
    : tower ? tower.level >= 3 ? 'Dieser Turm ist für diese Kampfprobe voll ausgebaut.' : sim.gold < upgradeCost(tower) ? `Noch ${currency.format(upgradeCost(tower) - sim.gold)} Gold bis zum nächsten Level.` : 'Mehr Schaden verbessert die Verteidigung sofort.'
    : pad?.availability === 'initial' && sim.gold < 75 ? `Noch ${currency.format(75 - sim.gold)} Gold bis zum Waldwächter.` : '';
  element('layout-status').textContent = view.paused ? 'Kampf angehalten.'
    : sim.mode === 'farm' ? `Sicheres Farmen · Welle ${sim.farmWave}. Ein neuer Vorstoß beginnt erst auf deinen Wunsch am Wellenübergang.`
    : `Automatischer Vorstoß · höchste geschaffte Welle ${sim.highestCleared}.`;
  const message = sim.drainEvents().filter(event => ['kill', 'clear', 'wave', 'defeat', 'build', 'upgrade', 'sell'].includes(event.type)).at(-1);
  if (message) element('combat-message').textContent = message.type === 'clear' ? `Welle ${message.wave} geschafft · +${currency.format(message.amount ?? 0)} Gold Abschlussbonus.`
    : message.type === 'kill' ? `Gegner besiegt · +${currency.format(message.amount ?? 0)} Gold.`
    : message.type === 'wave' ? `${mode} · Welle ${message.wave} hat begonnen. Deine Türme greifen automatisch an.`
    : message.type === 'build' ? 'Dein neuer Waldwächter greift selbstständig an.'
    : message.type === 'upgrade' ? 'Waldwächter verbessert. Der nächste Schuss nutzt den höheren Schaden.'
    : message.type === 'sell' ? `Turm verkauft · +${currency.format(message.amount ?? 0)} Gold. Die sichere Farmbasis wird neu geprüft.`
    : 'Der Vorstoß ist gescheitert. Gold und Türme bleiben erhalten; die Verteidigung wechselt ins sichere Farmen.';
}

async function boot(options: { temporary?: boolean; recover?: boolean } = {}, ownershipRetries = 6): Promise<void> {
  if (booting || document.hidden) return;
  if (retryTimer !== undefined) { clearTimeout(retryTimer); retryTimer = undefined; }
  booting = true; ready = false;
  build.disabled = upgrade.disabled = sell.disabled = pause.disabled = advance.disabled = claim.disabled = assignMara.disabled = true;
  element('app-error').hidden = true; element('load-actions').hidden = true;
  try {
    game?.destroy(true); game = undefined; scene = undefined;
    const previous = session; session = undefined;
    await previous?.close().catch(() => undefined);
    store?.close(); store = options.temporary ? undefined : await openBattleStore();
    const live = await BattleSession.open(store, { recover: options.recover });
    session = live;
    if (document.hidden && !live.temporary) { await live.suspend(); return; }
    if (live.battle.wave > 0) element('combat-message').textContent = 'Gespeicherte Verteidigung geladen. Gold, Türme und laufender Kampf sind wieder da.';
    live.onChange = () => { if (session === live) { scene?.refresh(); syncUI(); } };
    live.onError = error => { if (session === live) { showError(`Die Probe ist angehalten; der letzte bestätigte Stand bleibt erhalten. ${error.message}`, false, true); syncUI(); } };
    const view = new BattleScene(() => live.battle, {
      advance(seconds) { live.advance(seconds); },
      canRender: () => !live.busy,
      changed: syncUI,
      select(padId) { selectedPadId = padId; view.setSelected(padId); syncUI(); },
      selectMara() { element('mara-title').scrollIntoView({ block: 'nearest' }); },
      ready() { ready = true; view.setSelected(selectedPadId); syncUI(); },
    });
    scene = view;
    game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'game', width: live.battle.layout.startBounds.width, height: live.battle.layout.startBounds.height,
      backgroundColor: '#183424', pixelArt: true, roundPixels: true, render: { antialias: false }, audio: { noAudio: true },
      scene: [view], scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
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
async function perform(action: (battle: IdleBattle) => unknown): Promise<void> {
  const live = session;
  if (!ready || !live || live.paused || live.error || document.hidden || live.awaitingResume || live.suspended) return;
  const completion = live.command(action);
  syncUI(); await completion;
  scene?.refresh(); syncUI();
}
build.addEventListener('click', () => { void perform(battle => selectedPadId && battle.build(selectedPadId)); }, { signal: lifetime.signal });
upgrade.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.upgrade(tower.uid); }); }, { signal: lifetime.signal });
sell.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.sell(tower.uid); }); }, { signal: lifetime.signal });
advance.addEventListener('click', () => { void perform(battle => battle.requestAdvance()); }, { signal: lifetime.signal });
assignMara.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.assignMara(tower.uid); }); }, { signal: lifetime.signal });
element('camera-reset').addEventListener('click', () => { scene?.resetCamera(); syncUI(); }, { signal: lifetime.signal });
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

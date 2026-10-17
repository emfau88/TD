import Phaser from 'phaser';
import './style.css';
import './battle.css';
import { stats, upgradeCost, sellValue, type IdleBattle } from './battle';
import { BattleScene } from './battle-scene';
import { BattleSession, SessionLoadError } from './battle-session';
import { openBattleStore, type BattleSaveStore } from './save-store';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing battle element: ${id}`);
  return value as T;
};
const lifetime = new AbortController();
const currency = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const build = element<HTMLButtonElement>('build');
const upgrade = element<HTMLButtonElement>('upgrade');
const sell = element<HTMLButtonElement>('sell');
const pause = element<HTMLButtonElement>('pause');
const recover = element<HTMLButtonElement>('recover-save');
let session: BattleSession | undefined;
let scene: BattleScene | undefined;
let game: Phaser.Game | undefined;
let store: BattleSaveStore | undefined;
let selectedPadId: string | undefined = 'tower-02';
let ready = false;
let booting = false;

function showError(message: string, canRecover = false): void {
  const target = element('app-error');
  target.hidden = false;
  target.textContent = message;
  element('load-actions').hidden = false;
  recover.hidden = !canRecover;
}
window.addEventListener('error', event => showError(`Ein unerwarteter Fehler ist aufgetreten: ${event.message}`), { signal: lifetime.signal });

function syncUI(): void {
  const live = session;
  const view = scene;
  build.disabled = upgrade.disabled = sell.disabled = pause.disabled = !ready || !live || live.busy || Boolean(live.error);
  if (!ready || !live || !view) return;
  view.paused = live.paused || document.hidden || Boolean(live.error);
  const saveStatus = element('save-status');
  saveStatus.dataset.revision = String(live.revision);
  saveStatus.textContent = live.error ? 'Speichern fehlgeschlagen · Probe angehalten'
    : live.temporary ? 'Temporäre Probe · kein Speichern und kein Offline-Ertrag'
    : live.busy ? 'Wird gespeichert …' : '1× · Fortschritt lokal gespeichert';
  if (live.busy) return; // A tentative reward or purchase is not a confirmed UI balance.
  const sim = live.battle;
  element('gold').textContent = currency.format(sim.gold);
  element('lives').textContent = `${sim.lives} / 20`;
  element('wave').textContent = String(sim.wave);
  element('battle-phase').textContent = live.error ? 'Speicherfehler' : view.paused ? 'Pause'
    : sim.phase === 'defeat' ? 'Der Kern ist gefallen'
    : sim.phase === 'wave' ? `Welle ${sim.wave} · ${sim.remaining} Gegner`
    : `Nächste Welle in ${Math.ceil(sim.intermissionRemaining)} s`;
  pause.textContent = live.paused ? 'Weiter' : 'Pause';
  pause.disabled = sim.phase === 'defeat' || Boolean(live.error);
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  const pad = sim.layout.towerPads.find(value => value.id === selectedPadId);
  element('selection-title').textContent = tower ? `Waldwächter · Level ${tower.level}` : pad ? 'Freier Bauplatz' : 'Bauplatz wählen';
  element('selection-description').textContent = tower
    ? tower.protected ? 'Dein erster Turm sichert die Grundverteidigung. Du kannst ihn verbessern.' : 'Dieser Waldwächter verteidigt den Weg. Verbessere ihn oder investiere das Gold an anderer Stelle.'
    : pad?.availability === 'initial' ? 'Hier kannst du einen weiteren Waldwächter errichten.'
    : pad ? 'Dieser Platz ist im aktuellen Startbereich noch nicht verfügbar.' : 'Wähle einen hell markierten Platz auf der Karte.';
  build.hidden = Boolean(tower); upgrade.hidden = !tower; sell.hidden = !tower;
  const blocked = view.paused || sim.phase === 'defeat' || Boolean(live.error);
  build.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId);
  const canUpgrade = Boolean(tower && tower.level < 3);
  upgrade.disabled = blocked || !tower || !canUpgrade || sim.gold < upgradeCost(tower);
  upgrade.textContent = tower && canUpgrade ? `Aufwerten · ${currency.format(upgradeCost(tower))} Gold` : 'Levelgrenze erreicht';
  sell.disabled = blocked || !tower || tower.protected;
  sell.textContent = tower?.protected ? 'Geschützter Startturm' : `Verkaufen · +${currency.format(tower ? sellValue(tower) : 0)} Gold`;
  element('tower-stats').innerHTML = tower ? (() => {
    const values = stats(tower);
    return `<div><dt>Schaden</dt><dd>${values.damage.toFixed(1)}</dd></div><div><dt>Reichweite</dt><dd>${values.range}</dd></div><div><dt>Angriff alle</dt><dd>${values.cooldown.toFixed(2)} s</dd></div><div><dt>Abschüsse</dt><dd>${tower.kills}</dd></div>`;
  })() : '';
  element('action-hint').textContent = blocked ? live.error ? 'Der letzte bestätigte Spielstand bleibt erhalten.' : view.paused ? 'Setze den Kampf fort, um zu bauen oder aufzuwerten.' : 'Die Verteidigung ist beendet. Gold und Türme bleiben erhalten.'
    : tower ? tower.level >= 3 ? 'Dieser Turm ist für diese Kampfprobe voll ausgebaut.' : sim.gold < upgradeCost(tower) ? `Noch ${currency.format(upgradeCost(tower) - sim.gold)} Gold bis zum nächsten Level.` : 'Mehr Schaden verbessert die Verteidigung sofort.'
    : pad?.availability === 'initial' && sim.gold < 75 ? `Noch ${currency.format(75 - sim.gold)} Gold bis zum Waldwächter.` : '';
  element('layout-status').textContent = view.paused ? 'Pause · Kampf und Goldgewinn angehalten.' : sim.phase === 'defeat' ? `Welle ${sim.wave} · ${sim.kills} Gegner besiegt.` : 'Automatischer Kampf aktiv · vier Startplätze.';
  const message = sim.drainEvents().filter(event => ['kill', 'clear', 'wave', 'defeat', 'build', 'upgrade', 'sell'].includes(event.type)).at(-1);
  if (message) element('combat-message').textContent = message.type === 'clear' ? `Welle ${sim.wave} geschafft · +${currency.format(message.amount ?? 0)} Gold Abschlussbonus.`
    : message.type === 'kill' ? `Gegner besiegt · +${currency.format(message.amount ?? 0)} Gold.`
    : message.type === 'wave' ? `Welle ${sim.wave} hat begonnen. Deine Türme greifen automatisch an.`
    : message.type === 'build' ? live.temporary ? 'Dein neuer Waldwächter greift selbstständig an.' : 'Dein neuer Waldwächter ist gespeichert und greift selbstständig an.'
    : message.type === 'upgrade' ? live.temporary ? 'Waldwächter verbessert.' : 'Waldwächter verbessert und gespeichert.'
    : message.type === 'sell' ? `Turm verkauft · +${currency.format(message.amount ?? 0)} Gold.`
    : live.temporary ? 'Der Kern ist gefallen. Goldbestand und Türme bleiben für diese Probe erhalten.' : 'Der Kern ist gefallen. Goldbestand und Türme sind gespeichert.';
}

async function boot(options: { temporary?: boolean; recover?: boolean } = {}): Promise<void> {
  if (booting) return;
  booting = true; ready = false;
  build.disabled = upgrade.disabled = sell.disabled = pause.disabled = true;
  element('app-error').hidden = true; element('load-actions').hidden = true;
  try {
    game?.destroy(true); game = undefined;
    store?.close(); store = options.temporary ? undefined : await openBattleStore();
    const live = await BattleSession.open(store, { recover: options.recover });
    session = live;
    if (live.battle.wave > 0) element('combat-message').textContent = 'Gespeicherte Verteidigung geladen. Gold, Türme und laufender Kampf sind wieder da.';
    live.onChange = () => { if (session === live) { scene?.refresh(); syncUI(); } };
    live.onError = error => { if (session === live) { showError(`Speichern fehlgeschlagen. Die Probe ist angehalten; der letzte bestätigte Stand bleibt erhalten. ${error.message}`); syncUI(); } };
    const view = new BattleScene(() => live.battle, {
      advance(seconds) { live.advance(seconds); },
      canRender: () => !live.busy,
      changed: syncUI,
      select(padId) { selectedPadId = padId; view.setSelected(padId); syncUI(); },
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
    showError(`Der Spielstand wurde nicht überschrieben. ${message}`, error instanceof SessionLoadError && error.canRecover);
    element('save-status').textContent = 'Spielstand konnte nicht geladen werden';
  } finally { booting = false; }
}
async function perform(action: (battle: IdleBattle) => unknown): Promise<void> {
  const live = session;
  if (!ready || !live || live.paused || live.error || document.hidden) return;
  const completion = live.command(action);
  syncUI();
  await completion;
  scene?.refresh(); syncUI();
}
build.addEventListener('click', () => { void perform(battle => selectedPadId && battle.build(selectedPadId)); }, { signal: lifetime.signal });
upgrade.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.upgrade(tower.uid); }); }, { signal: lifetime.signal });
sell.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.sell(tower.uid); }); }, { signal: lifetime.signal });
pause.addEventListener('click', () => { if (session) { const completion = session.setPaused(!session.paused); syncUI(); void completion.then(syncUI); } }, { signal: lifetime.signal });
element('reset').addEventListener('click', () => window.location.reload(), { signal: lifetime.signal });
recover.addEventListener('click', () => { void boot({ recover: true }); }, { signal: lifetime.signal });
element('temporary-session').addEventListener('click', () => { void boot({ temporary: true }); }, { signal: lifetime.signal });
document.addEventListener('visibilitychange', () => { syncUI(); if (document.hidden) void session?.flush().catch(() => syncUI()); }, { signal: lifetime.signal });
window.addEventListener('pagehide', () => { void session?.flush().catch(() => undefined); }, { signal: lifetime.signal });
if (import.meta.hot) import.meta.hot.dispose(() => { lifetime.abort(); game?.destroy(true); void session?.close().catch(() => undefined); });
void boot();

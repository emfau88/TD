import Phaser from 'phaser';
import './style.css';
import './battle.css';
import { IdleBattle, stats, upgradeCost, sellValue } from './battle';
import { BattleScene } from './battle-scene';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing battle element: ${id}`);
  return value as T;
};
const lifetime = new AbortController();
const currency = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const sim = new IdleBattle();
const build = element<HTMLButtonElement>('build');
const upgrade = element<HTMLButtonElement>('upgrade');
const sell = element<HTMLButtonElement>('sell');
const pause = element<HTMLButtonElement>('pause');
let selectedPadId: string | undefined = 'tower-02';
let ready = false;
let manuallyPaused = false;

function showError(message: string): void {
  const target = element('app-error');
  target.hidden = false;
  target.textContent = `Die Kampfprobe konnte nicht fortgesetzt werden: ${message}`;
}
window.addEventListener('error', event => showError(event.message), { signal: lifetime.signal });

function syncUI(): void {
  if (!ready) return;
  element('gold').textContent = currency.format(sim.gold);
  element('lives').textContent = `${sim.lives} / 20`;
  element('wave').textContent = String(sim.wave);
  element('battle-phase').textContent = scene.paused ? 'Pause'
    : sim.phase === 'defeat' ? 'Der Kern ist gefallen'
    : sim.phase === 'wave' ? `Welle ${sim.wave} · ${sim.remaining} Gegner`
    : `Nächste Welle in ${Math.ceil(sim.intermissionRemaining)} s`;
  pause.textContent = manuallyPaused ? 'Weiter' : 'Pause';
  pause.disabled = sim.phase === 'defeat';
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  const pad = sim.layout.towerPads.find(value => value.id === selectedPadId);
  element('selection-title').textContent = tower ? `Waldwächter · Level ${tower.level}` : pad ? 'Freier Bauplatz' : 'Bauplatz wählen';
  element('selection-description').textContent = tower
    ? tower.protected ? 'Dein erster Turm sichert die Grundverteidigung. Du kannst ihn verbessern.' : 'Dieser Waldwächter verteidigt den Weg. Verbessere ihn oder investiere das Gold an anderer Stelle.'
    : pad?.availability === 'initial' ? 'Hier kannst du sofort einen weiteren Waldwächter errichten.'
    : pad ? 'Dieser Platz ist im aktuellen Startbereich noch nicht verfügbar.' : 'Wähle einen hell markierten Platz auf der Karte.';
  build.hidden = Boolean(tower);
  upgrade.hidden = !tower;
  sell.hidden = !tower;
  const blocked = scene.paused || sim.phase === 'defeat';
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
  element('action-hint').textContent = blocked ? scene.paused ? 'Setze den Kampf fort, um zu bauen oder aufzuwerten.' : 'Diese Verteidigung ist beendet. Deine Türme und dein Gold bleiben in dieser Sitzung erhalten.'
    : tower ? tower.level >= 3 ? 'Dieser Turm ist für diese Kampfprobe voll ausgebaut.' : sim.gold < upgradeCost(tower) ? `Noch ${currency.format(upgradeCost(tower) - sim.gold)} Gold bis zum nächsten Level.` : 'Mehr Schaden verbessert die Verteidigung sofort.'
    : pad?.availability === 'initial' && sim.gold < 75 ? `Noch ${currency.format(75 - sim.gold)} Gold bis zum Waldwächter.` : '';
  element('layout-status').textContent = scene.paused ? 'Pause · Kampf und Goldgewinn angehalten.' : sim.phase === 'defeat' ? `Welle ${sim.wave} · ${sim.kills} Gegner besiegt.` : 'Automatischer Kampf aktiv · vier Startplätze.';
  const message = sim.drainEvents().filter(event => ['kill', 'clear', 'wave', 'defeat', 'build', 'upgrade', 'sell'].includes(event.type)).at(-1);
  if (message) {
    element('combat-message').textContent = message.type === 'clear' ? `Welle ${sim.wave} geschafft · +${currency.format(message.amount ?? 0)} Gold Abschlussbonus.`
      : message.type === 'kill' ? `Gegner besiegt · +${currency.format(message.amount ?? 0)} Gold.`
      : message.type === 'wave' ? `Welle ${sim.wave} hat begonnen. Deine Türme greifen automatisch an.`
      : message.type === 'build' ? 'Dein neuer Waldwächter ist bereit und greift selbstständig an.'
      : message.type === 'upgrade' ? 'Waldwächter verbessert. Der höhere Schaden wirkt ab dem nächsten Schuss.'
      : message.type === 'sell' ? `Turm verkauft · +${currency.format(message.amount ?? 0)} Gold.`
      : 'Der Kern ist gefallen. Der erreichte Goldbestand und deine Türme bleiben erhalten.';
  }
}

const scene = new BattleScene(sim, {
  changed: syncUI,
  select(padId) { selectedPadId = padId; scene.setSelected(padId); syncUI(); },
  ready() { ready = true; scene.setSelected(selectedPadId); syncUI(); },
});
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: sim.layout.startBounds.width, height: sim.layout.startBounds.height,
  backgroundColor: '#183424', pixelArt: true, roundPixels: true, render: { antialias: false },
  audio: { noAudio: true }, scene: [scene], scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});
function perform(action: () => unknown): void {
  if (!ready || scene.paused || sim.phase === 'defeat') return;
  action(); scene.refresh(); syncUI();
}
build.addEventListener('click', () => perform(() => selectedPadId && sim.build(selectedPadId)), { signal: lifetime.signal });
upgrade.addEventListener('click', () => perform(() => {
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  return tower && sim.upgrade(tower.uid);
}), { signal: lifetime.signal });
sell.addEventListener('click', () => perform(() => {
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  return tower && sim.sell(tower.uid);
}), { signal: lifetime.signal });
pause.addEventListener('click', () => {
  manuallyPaused = !manuallyPaused; scene.paused = manuallyPaused || document.hidden; syncUI();
}, { signal: lifetime.signal });
element('reset').addEventListener('click', () => window.location.reload(), { signal: lifetime.signal });
document.addEventListener('visibilitychange', () => { scene.paused = manuallyPaused || document.hidden; syncUI(); }, { signal: lifetime.signal });
if (import.meta.hot) import.meta.hot.dispose(() => { lifetime.abort(); game.destroy(true); });

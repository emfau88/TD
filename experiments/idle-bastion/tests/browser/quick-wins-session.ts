import { IdleBattle } from '../../src/battle';
import { battleLayout, CORE_PLOTS } from '../../src/layout';
import { certifyFarm, isFarmCertificateValid } from '../../src/farming';
import { beginAbsence, createOfflineState, reserveOffline, type OfflineState } from '../../src/offline';
import { openBattleStore } from '../../src/save-store';

export type QuickWinFixture = 'cannon-locked' | 'cannon' | 'workshop-level5' | 'workshop-poor' | 'workshop-ready' | 'workshop-owned' | 'offline';

/** Deliberately synthetic, dev-only setup. All purchases use real model methods;
 * explicit records/gold prepare the requested state without altering game rules. */
export function prepareQuickWinFixture(kind: QuickWinFixture, now = Date.now()): { battle: IdleBattle; offline?: OfflineState } {
  const battle = new IdleBattle(battleLayout(false, CORE_PLOTS, 5));
  battle.update(4); battle.gold = 100_000;
  battle.highestCleared = kind === 'cannon-locked' ? 4 : 5;
  if (!battle.buildWorkshop() || !battle.researchFrost()) throw Error('Werkstatt-/Frostfixture ungültig.');
  battle.update(.025);
  battle.wispArrival.met = battle.wispUnlocked;
  battle.discovery = 'done';
  battle.tutorial.hidden = false;
  battle.tutorial.builtTower = true; battle.tutorial.upgradedTower = true; battle.tutorial.frostSeen = true;
  // Other onboarding messages are acknowledged. Cannon/workshop flags remain
  // independently inspectable by the production UI; no new schema field.
  battle.tutorial.seen = 127 | (1 << 12) | (1 << 15);
  if (!['cannon', 'cannon-locked'].includes(kind)) battle.tutorial.seen |= 1 << 8;
  const level = kind === 'workshop-level5' ? 5 : kind.startsWith('workshop-') || kind === 'offline' ? 6 : 3;
  while (battle.towers[0]!.level < level) if (!battle.upgrade(battle.towers[0]!.uid)) throw Error('Turmlevel-Fixture ungültig.');
  if (kind === 'workshop-owned' && !battle.upgradeWorkshop()) throw Error('Werkstatt-II-Fixture ungültig.');
  battle.gold = kind === 'workshop-ready' ? 1200 : 800;
  let offline: OfflineState | undefined;
  if (kind === 'offline') {
    battle.liveClearedWaves = [1];
    const certificate = certifyFarm(battle);
    if (!certificate || !isFarmCertificateValid(certificate, battle)) throw Error('Offline-Fixture hat keinen gültigen Farmnachweis.');
    const from = now - 10 * 60 * 1000;
    offline = reserveOffline(beginAbsence(createOfflineState(from), from, certificate, false), now);
    if (!offline.pendingReward || offline.pendingReward.amountUnits <= 0) throw Error('Offline-Fixture hat keinen positiven Anspruch.');
  }
  if (!IdleBattle.restore(battle.snapshot())) throw Error('Fixture lässt sich nicht laden.');
  return { battle, offline };
}

// Absent from production build inputs; node can import the preparation helper
// for validation without creating a document, network request or player save.
if (typeof document !== 'undefined') {
  if (!import.meta.env.DEV) throw new Error('Nur im lokalen Entwicklungsserver verfügbar.');
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-fixture]')) button.addEventListener('click', async () => {
    const result = document.getElementById('result')!, details = document.getElementById('fixture-details')!;
    try {
      button.disabled = true;
      result.textContent = 'Isolierter Teststand wird vorbereitet …';
      const kind = button.dataset.fixture as QuickWinFixture;
      const { battle, offline } = prepareQuickWinFixture(kind);
      const slot = `q1q2-${crypto.randomUUID()}`;
      const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
      // Pause ordinary UI fixtures so screenshots and affordability checks do not
      // race combat income. The offline case retains its real unpaused receipt.
      const paused = kind !== 'offline';
      try { await store.save(battle.snapshot(), paused, 0, offline ? { offline } : undefined); } finally { store.close(); }
      localStorage.setItem('spire-language-v1', (document.getElementById('fixture-language') as HTMLSelectElement).value);
      const link = document.createElement('a'); link.id = 'open-fixture'; link.href = `../../index.html?probe=${slot}`;
      link.textContent = 'Isolierten Spieltest öffnen'; link.style.color = '#ffe7aa'; result.replaceChildren(link);
      details.textContent = JSON.stringify({ kind, slot, gold: battle.gold, paused, highestCleared: battle.highestCleared, level: battle.towers[0]!.level, workshopII: battle.settlement.workshopUpgraded, expectedMinimumRewardUnits: offline?.pendingReward?.amountUnits ?? 0 }, null, 2);
    } catch (error) { result.textContent = String(error); }
    finally { button.disabled = false; }
  });
}

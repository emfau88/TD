import { IdleBattle } from '../../src/battle';
import { setLanguage } from '../../src/i18n';
import { openBattleStore } from '../../src/save-store';

// UI-operated local fixture; deliberately absent from production build inputs.
if (!import.meta.env.DEV) throw new Error('Nur im lokalen Entwicklungsserver verfügbar.');
for (const who of ['mara', 'ilyra'] as const) document.getElementById(who)!.addEventListener('click', async () => {
  const slot = `t07-${crypto.randomUUID()}`, b = new IdleBattle();
  b.update(4); b.gold = 12000; b.highestCleared = 25; b.bossVictories = 1; b.secondBossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.update(.025); b.wispArrival.met = true; b.discovery = 'off'; b.tutorial.hidden = true;
  if (!b.buildTavern(b.recommendedTavernPlot!) || !b.upgradeTavern()) throw new Error('Tavernenfixture ungültig');
  if (who === 'ilyra') { if (!b.recruitIlyra()) throw new Error('Rekrutierung fehlgeschlagen'); b.ilyra!.introduction = 'done'; }
  const points = Number((document.getElementById('hearts') as HTMLSelectElement).value);
  for (const companion of (who === 'ilyra' ? ['mara', 'ilyra'] : ['mara']) as ('mara' | 'ilyra')[]) {
    b.social.points[companion] = points;
    b.social.reserves[companion]!.touch = points >= 35 ? 3 : 0;
    b.social.personal[companion] = { clears: points >= 70 ? 30 : 0, claimed: points >= 70 };
  }
  setLanguage((document.getElementById('language') as HTMLSelectElement).value as 'de' | 'en');
  if (!IdleBattle.restore(b.snapshot())) throw new Error('Fixture lässt sich nicht laden');
  const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
  try { await store.save(b.snapshot(), false, 0); } finally { store.close(); }
  const result = document.getElementById('result')!; result.replaceChildren();
  const link = document.createElement('a'); link.href = `../../index.html?probe=${slot}`; link.textContent = 'Isolierten Spieltest öffnen'; result.append(link);
});

// Reuse an actual recorded boss encounter, migrate through the normal loader,
// then add only a legally built tavern. The regular save remains untouched.
document.getElementById('boss')!.addEventListener('click', async () => {
  const recorded = await import('../../../../artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json');
  const b = IdleBattle.restore(recorded.channel15); if (!b) throw new Error('Bossfixture ungültig');
  b.gold = 12000; b.discovery = 'off'; b.tutorial.hidden = true; b.wispArrival.met = true;
  if (!b.buildTavern(b.recommendedTavernPlot!)) throw new Error('Tavernenbau fehlgeschlagen');
  if (!IdleBattle.restore(b.snapshot())) throw new Error('Bossfixture lässt sich nicht laden');
  const slot = `tavern-boss-${crypto.randomUUID()}`;
  const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
  try { await store.save(b.snapshot(), true, 0); } finally { store.close(); }
  const result = document.getElementById('result')!; result.replaceChildren();
  const link = document.createElement('a'); link.href = `../../index.html?probe=${slot}`; link.textContent = 'Pausierten Bosstest öffnen'; result.append(link);
});

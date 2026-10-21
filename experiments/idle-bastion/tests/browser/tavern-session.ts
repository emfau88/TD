import { IdleBattle } from '../../src/battle';
import { openBattleStore } from '../../src/save-store';

// UI-operated local fixture; deliberately absent from production build inputs.
if (!import.meta.env.DEV) throw new Error('Nur im lokalen Entwicklungsserver verfügbar.');
for (const who of ['mara', 'ilyra'] as const) document.getElementById(who)!.addEventListener('click', async () => {
  const slot = `t07-${crypto.randomUUID()}`, b = new IdleBattle();
  b.update(4); b.gold = 12000; b.highestCleared = 25; b.bossVictories = 1; b.secondBossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.update(.025); b.wispArrival.met = true; b.discovery = 'off'; b.tutorial.hidden = true;
  if (!b.buildTavern(b.recommendedTavernPlot!) || !b.upgradeTavern()) throw new Error('Tavernenfixture ungültig');
  if (who === 'ilyra') { if (!b.recruitIlyra()) throw new Error('Rekrutierung fehlgeschlagen'); b.ilyra!.introduction = 'done'; }
  if (!IdleBattle.restore(b.snapshot())) throw new Error('Fixture lässt sich nicht laden');
  const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
  try { await store.save(b.snapshot(), false, 0); } finally { store.close(); }
  const result = document.getElementById('result')!; result.replaceChildren();
  const link = document.createElement('a'); link.href = `../../index.html?probe=${slot}`; link.textContent = 'Isolierten Spieltest öffnen'; result.append(link);
});

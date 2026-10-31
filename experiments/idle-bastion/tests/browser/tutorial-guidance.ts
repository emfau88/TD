import { IdleBattle } from '../../src/battle';
import { openBattleStore } from '../../src/save-store';

// Dev-only fixture: no gold, wave or save fields are invented or overwritten.
function prepare(stage: string): IdleBattle {
  const b = IdleBattle.newGame(); b.beginIntroduction();
  if (!b.build(b.recommendedStarterPad!)) throw Error('Starter build failed');
  if (stage === 'ready') return b;
  b.startDefense();
  for (let i = 0; i < 16000; i++) {
    b.update(.025);
    if (!b.learningPaused) continue;
    if (b.introduction.stage === 'upgrade') {
      if (!b.upgrade(1)) throw Error('Upgrade failed');
    } else if (b.introduction.stage === 'workshop') {
      if (!b.buildWorkshop() || !IdleBattle.restore(b.snapshot())) throw Error('Workshop fixture failed');
      return b;
    }
  }
  throw Error('Tutorial did not reach workshop');
}
if (!import.meta.env.DEV) throw Error('Local development only');
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-stage]')) button.onclick = async () => {
  button.disabled = true;
  const result = document.getElementById('result')!;
  try {
    const battle = prepare(button.dataset.stage!), slot = `tutorial-guidance-${crypto.randomUUID()}`;
    const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
    try { await store.save(battle.snapshot(), false, 0); } finally { store.close(); }
    const link = document.createElement('a'); link.id = 'open-fixture'; link.href = `../../index.html?probe=${slot}`;
    link.textContent = `Open game - ${battle.introduction.stage} - ${battle.gold} Gold`; result.replaceChildren(link);
  } catch (error) { result.textContent = String(error); }
  finally { button.disabled = false; }
};

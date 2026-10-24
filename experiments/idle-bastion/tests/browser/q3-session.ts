import { IdleBattle } from '../../src/battle';
import { openBattleStore } from '../../src/save-store';

/** Current schema has no Q3 field/migration. These are the exact old preparation
 * shapes: unbuilt build stage, or a free protected starter already owned on 6/6. */
export function oldPreparation(kind: 'build' | 'ready'): IdleBattle {
  const battle = IdleBattle.newGame();
  if (!battle.beginIntroduction()) throw Error('Bauvorbereitung ungültig.');
  if (kind === 'ready' && !battle.build('cell-6-6')) throw Error('Alter Startturm lässt sich nicht vorbereiten.');
  if (!IdleBattle.restore(battle.snapshot())) throw Error('Alter Vorbereitungsstand lässt sich nicht wiederherstellen.');
  return battle;
}
if (typeof document !== 'undefined') {
  if (!import.meta.env.DEV) throw Error('Nur im lokalen Entwicklungsserver verfügbar.');
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-old]')) button.addEventListener('click', async () => {
    const result = document.getElementById('q3-result')!;
    try {
      button.disabled = true;
      const kind = button.dataset.old as 'build' | 'ready', battle = oldPreparation(kind), slot = `q3-old-${crypto.randomUUID()}`;
      const store = await openBattleStore(undefined, `spire-idle-bastion-probe-${slot}`);
      try { await store.save(battle.snapshot(), false, 0); } finally { store.close(); }
      localStorage.setItem('spire-language-v1', (document.getElementById('q3-language') as HTMLSelectElement).value);
      const link = document.createElement('a'); link.id = 'open-q3-fixture'; link.href = `../../index.html?probe=${slot}`; link.textContent = 'Gespeicherte Vorbereitung öffnen'; result.replaceChildren(link);
      document.getElementById('q3-details')!.textContent = JSON.stringify({ kind, slot, stage: battle.introduction.stage, gold: battle.gold, towers: battle.snapshot().towers }, null, 2);
    } catch (error) { result.textContent = String(error); }
    finally { button.disabled = false; }
  });
}

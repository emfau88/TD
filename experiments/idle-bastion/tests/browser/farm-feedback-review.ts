import fixtures from '../../../../artifacts/idle-bastion/acceptance/farm-feedback-2026-11-14/review-fixtures.json';
import { IdleBattle } from '../../src/battle';
import { openBattleStore } from '../../src/save-store';
import { setLanguage, type Language } from '../../src/i18n';

for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-case]')) {
  button.addEventListener('click', async () => {
    for (const item of document.querySelectorAll<HTMLButtonElement>('button')) item.disabled = true;
    try {
      const scenario = button.dataset.case as keyof typeof fixtures;
      setLanguage(button.dataset.lang as Language);
      const battle = IdleBattle.restore(fixtures[scenario]);
      if (!battle) throw Error('Invalid review snapshot');
      const probe = `farm-review-${crypto.randomUUID()}`;
      const store = await openBattleStore(indexedDB, `spire-idle-bastion-probe-${probe}`);
      try { await store.save(battle.snapshot(), true, 0); } finally { store.close(); }
      const url = new URL('../../', location.href);
      url.searchParams.set('probe', probe); url.searchParams.set('lang', button.dataset.lang!);
      location.assign(url.href);
    } catch (error) { document.getElementById('status')!.textContent = String(error); }
  });
}

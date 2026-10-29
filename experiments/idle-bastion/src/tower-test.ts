import earnedLate from '../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json?raw';
import { createTowerProbe, isTowerScenario, saveTowerProbe } from './tower-test-probes';
import { SKIN_LEVELS, type SkinLevel } from './tower-evolution';
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-scenario]')];
const status = document.querySelector<HTMLElement>('#status')!;
const select = document.querySelector<HTMLSelectElement>('#level')!;
for (const level of SKIN_LEVELS) select.add(new Option(`Level ${level}`, String(level)));
for (const button of buttons) button.addEventListener('click', async () => {
  if (!isTowerScenario(button.dataset.scenario)) return;
  buttons.forEach(b => b.disabled = true); status.textContent = 'Testspiel wird vorbereitet …';
  try {
    const level = select.value === 'all' ? 'all' : Number(select.value) as SkinLevel;
    const battle = createTowerProbe(button.dataset.scenario, JSON.parse(earnedLate), level);
    const probe = await saveTowerProbe(battle);
    const target = new URL('./', location.href); target.searchParams.set('probe', probe);
    location.assign(target.href);
  } catch (error) {
    console.error(error); status.textContent = 'Teststart fehlgeschlagen. Bitte Website-Speicher erlauben und erneut versuchen.';
    buttons.forEach(b => b.disabled = false);
  }
});

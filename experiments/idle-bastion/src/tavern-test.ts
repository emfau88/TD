import snapshots from '../../../artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json?raw';
import { createTavernProbe, isTavernPreset, saveTavernProbe } from './tavern-test-probes';
import { setLanguage } from './i18n';

const form = document.querySelector<HTMLFormElement>('#tavern-test')!;
const start = document.querySelector<HTMLButtonElement>('#start')!;
const status = document.querySelector<HTMLElement>('#status')!;
const enabled = import.meta.env.VITE_FEATURE_PREVIEW === '1' && import.meta.env.VITE_TAVERN_PREVIEW === '1';
start.disabled = !enabled;
if (!enabled) status.textContent = 'Dieser Teststart ist nur in der isolierten Tavernen-Vorschau verfügbar.';
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!enabled || start.disabled) return;
  const values = new FormData(form), preset = values.get('preset');
  if (!isTavernPreset(preset)) return;
  start.disabled = true;
  const en = values.get('language') === 'en';
  status.textContent = en ? 'Preparing your Tavern visit …' : 'Dein Tavernenbesuch wird vorbereitet …';
  try {
    setLanguage(en ? 'en' : 'de');
    const battle = createTavernProbe(preset, JSON.parse(snapshots).clear25);
    const probe = await saveTavernProbe(battle);
    const target = new URL('./index.html', location.href);
    target.searchParams.set('probe', probe);
    target.searchParams.set('tavernTest', values.get('companion') === 'ilyra' ? 'ilyra' : 'mara');
    location.assign(target.href);
  } catch (error) {
    console.error('Tavern preview failed', error);
    status.textContent = en ? 'Could not start. Please allow website storage and try again. Your existing games are unchanged.'
      : 'Teststart fehlgeschlagen. Bitte Website-Speicher erlauben und erneut versuchen. Deine bestehenden Partien bleiben unverändert.';
    start.disabled = false;
  }
});

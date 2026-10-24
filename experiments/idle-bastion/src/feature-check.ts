import earnedLate from '../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json?raw';
import { createFeatureProbe, isFeatureScenario, saveFeatureProbe, type FeatureScenario } from './feature-probes';
import { language, onLanguageChange, setLanguage, t } from './i18n';

const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-scenario]')];
const status = document.querySelector<HTMLElement>('#status')!;
const error = document.querySelector<HTMLElement>('#error')!;
const selector = document.querySelector<HTMLSelectElement>('#language')!;
function translate(): void {
  document.documentElement.lang = language(); selector.value = language();
  for (const node of document.querySelectorAll<HTMLElement>('[data-text]')) node.textContent = t(node.dataset.text!);
}
selector.addEventListener('change', () => setLanguage(selector.value === 'de' ? 'de' : 'en'));
onLanguageChange(translate); translate();
let busy = false;
async function launch(scenario: FeatureScenario): Promise<void> {
  if (busy) return;
  busy = true; buttons.forEach(button => button.disabled = true);
  error.hidden = true; status.textContent = t('Testspielstand wird vorbereitet …');
  try {
    const battle = createFeatureProbe(scenario, JSON.parse(earnedLate));
    const probe = await saveFeatureProbe(battle, scenario);
    const target = new URL('./', location.href); target.searchParams.set('probe', probe);
    location.assign(target.href);
  } catch (cause) {
    console.error('Feature preview failed', cause);
    status.textContent = ''; error.hidden = false;
    error.textContent = t('Teststart nicht möglich. Bitte erlaube Website-Speicher und versuche es erneut. Es wurde keine bestehende Partie geöffnet oder ersetzt.');
    busy = false; buttons.forEach(button => button.disabled = false);
  }
}
for (const button of buttons) button.addEventListener('click', () => {
  if (isFeatureScenario(button.dataset.scenario)) void launch(button.dataset.scenario);
});
const requested = new URL(location.href).searchParams.get('scenario');
if (isFeatureScenario(requested)) void launch(requested);

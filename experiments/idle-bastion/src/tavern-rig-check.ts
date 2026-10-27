import './battle.css';
import './premium.css';
import { BattleSession } from './battle-session';
import { SOCIAL, type Companion } from './tavern-social';
import { TavernUI } from './tavern-ui';
import { rigPreviewPresentation } from './tavern-rig-preview';

// Isolated fixture: production main.ts keeps its current renderer until approval.
const session = await BattleSession.open(undefined, { guidedStart: false });
const battle = session.battle;
battle.update(4); battle.highestCleared = 25; battle.bossVictories = 1; battle.secondBossVictories = 1;
battle.gold = 2500; battle.settlement.workshopBuilt = true; battle.settlement.frostResearched = true;
battle.update(.05); battle.buildTavern(battle.recommendedTavernPlot!);
battle.wispArrival.met = true; battle.discovery = 'off'; battle.upgradeTavern(); battle.recruitIlyra();
battle.social.gifts = 20;
const select = document.querySelector<HTMLSelectElement>('#review-hearts')!;
function setHearts() {
  const count = Number(select.value);
  for (const who of ['mara', 'ilyra'] as const) {
    battle.social.points[who] = count ? SOCIAL.heartThresholds[count - 1]! : 0;
    battle.social.reserves[who] = { talk: 3, touch: count >= 2 ? 3 : 0, clears: 0 };
    battle.social.personal[who] = { clears: count >= 3 ? 30 : 0, claimed: count >= 3 };
  }
}
setHearts(); await session.setPaused(true);
const ui = new TavernUI({ session: () => session, presentation: rigPreviewPresentation, navigate: () => {} });
session.onChange = () => ui.update();
function show(who: Companion) {
  ui.close(); setHearts(); ui.open();
  ui.dialog.querySelector<HTMLButtonElement>(`[data-do="${who}"]`)!.click();
  const url = new URL(location.href); url.searchParams.set('hero', who); history.replaceState(null, '', url);
}
document.querySelector('#review-mara')!.addEventListener('click', () => show('mara'));
document.querySelector('#review-ilyra')!.addEventListener('click', () => show('ilyra'));
select.addEventListener('change', setHearts);
const comparison = document.querySelector<HTMLAnchorElement>('#quality-switch')!;
comparison.hidden = !import.meta.env.DEV;
const qualityUrl = new URL(location.href);
if (qualityUrl.searchParams.get('quality') === 'source') {
  qualityUrl.searchParams.delete('quality'); comparison.textContent = 'Kompakte Spielfassung ansehen (WebP 30)';
} else qualityUrl.searchParams.set('quality', 'source');
comparison.href = qualityUrl.href;
const previousQuality = document.querySelector<HTMLAnchorElement>('#quality90-switch')!;
previousQuality.hidden = !import.meta.env.DEV;
const previousUrl = new URL(location.href);
if (previousUrl.searchParams.get('quality') === '90') {
  previousUrl.searchParams.delete('quality'); previousQuality.textContent = 'Neue Fassung: WebP Qualität 30 ansehen';
} else previousUrl.searchParams.set('quality', '90');
previousQuality.href = previousUrl.href;
show(new URLSearchParams(location.search).get('hero') === 'ilyra' ? 'ilyra' : 'mara');
if (import.meta.hot) import.meta.hot.dispose(() => { ui.destroy(); void session.close(); });

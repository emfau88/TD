import { SOCIAL } from './tavern-social';
import './battle.css';
import './premium.css';
import { BattleSession } from './battle-session';
import { TavernUI } from './tavern-ui';
const session = await BattleSession.open(undefined, { guidedStart: false });
const b = session.battle;
b.update(4); b.highestCleared = 12; b.gold = 2500; b.settlement.workshopBuilt = true; b.settlement.frostResearched = true;
b.update(0.05); b.buildTavern(b.recommendedTavernPlot!);
const notice = document.getElementById('review-notice')!;
const ui = new TavernUI({ session: () => session, navigate: where => { notice.textContent = `In der Spielansicht öffnet sich jetzt: ${where === 'tavern' ? 'Gebäude, Ausbau und Rekrutierung' : where + ' · Kampfverwaltung'}.`; } });
session.onChange = () => ui.update();
document.getElementById('review-hearts')!.addEventListener('change', event => {
  const count = Number((event.target as HTMLSelectElement).value);
  b.social.points.mara = count ? SOCIAL.heartThresholds[count - 1]! : 0;
  notice.textContent = `Temporärer Teststand: ${count} Herzen. Zum Ansehen Taverne öffnen und Mara auswählen.`;
});
document.getElementById('review-open')!.addEventListener('click', () => ui.open());
document.getElementById('review-damage')!.addEventListener('click', () => { ui.open(); setTimeout(() => { b.lives = Math.max(1, b.lives - 2); ui.update(); }, 1800); });
// Isolated design fixture: no persistent store, no offline reward or main save access.
let last = 0, frame = 0;
function tick(now: number) { if (last && !document.hidden) session.advance(Math.min(.1, (now - last) / 1000)); last = now; ui.update(); frame = requestAnimationFrame(tick); }
// Keep the review fixture quiet so layout approval is independent of combat strength.
await session.setPaused(true);
frame = requestAnimationFrame(tick); ui.open();
if (import.meta.hot) import.meta.hot.dispose(() => { cancelAnimationFrame(frame); ui.destroy(); void session.close(); });

import { GameAudio } from './game-audio';
import { SOCIAL } from './tavern-social';
import './battle.css';
import './premium.css';
import { BattleSession } from './battle-session';
import { TavernUI } from './tavern-ui';
const session = await BattleSession.open(undefined, { guidedStart: false });
const b = session.battle;
const audio = new GameAudio({ combat:false }); audio.setState(true, false);
b.update(4); b.highestCleared = 12; b.gold = 2500; b.settlement.workshopBuilt = true; b.settlement.frostResearched = true;
b.update(0.05); b.buildTavern(b.recommendedTavernPlot!);
const notice = document.getElementById('review-notice')!;
const ui = new TavernUI({ session: () => session, onOpenChange: open => audio.setTavern(open), onGift: () => audio.play('gift'), onCompanion: who => audio.setCompanion(who), onTouch: who => audio.touchCompanion(who), navigate: where => { notice.textContent = `In der Spielansicht öffnet sich jetzt: ${where === 'tavern' ? 'Gebäude, Ausbau und Rekrutierung' : where + ' · Kampfverwaltung'}.`; } });
session.onChange = () => ui.update();
document.getElementById('review-hearts')!.addEventListener('change', event => {
  const count = Number((event.target as HTMLSelectElement).value);
  b.social.points.mara = b.social.points.ilyra = count ? SOCIAL.heartThresholds[count - 1]! : 0;
  notice.textContent = `Temporärer Teststand: ${count} Herzen. Zum Ansehen Taverne öffnen und eine Gefährtin auswählen.`;
});
function recruitForPreview() {
  b.highestCleared = 25; b.bossVictories = 1; b.secondBossVictories = 1; b.gold = 2500;
  b.wispArrival.met = true; b.discovery = 'off'; b.upgradeTavern(); b.recruitIlyra();
  notice.textContent = 'Temporärer Teststand: Boss 25 besiegt, Taverne II, Ilyra rekrutiert. Kein echter Spielstand verändert.';
}
document.getElementById('review-ilyra')!.addEventListener('click', () => { recruitForPreview(); ui.open(); });

document.getElementById('review-open')!.addEventListener('click', () => ui.open());
document.getElementById('review-damage')!.addEventListener('click', () => { ui.open(); setTimeout(() => { b.lives = Math.max(1, b.lives - 2); ui.update(); }, 1800); });
// Isolated design fixture: no persistent store, no offline reward or main save access.
let last = 0, frame = 0;
function tick(now: number) { if (last && !document.hidden) session.advance(Math.min(.1, (now - last) / 1000)); last = now; ui.update(); frame = requestAnimationFrame(tick); }
// Keep the review fixture quiet so layout approval is independent of combat strength.
await session.setPaused(true);
if (new URLSearchParams(location.search).get('hero') === 'ilyra') recruitForPreview();
frame = requestAnimationFrame(tick); ui.open();
if (import.meta.hot) import.meta.hot.dispose(() => { cancelAnimationFrame(frame); ui.destroy(); audio.destroy(); void session.close(); });

import type { IdleBattle, IntroductionStage } from './battle';
import type { MaraIntro } from './mara-intro';

/** Goals, not clicks: opening a menu and placing its building are one lesson.
 * The last two existing discovery lessons can still be skipped independently. */
export const TUTORIAL_STEPS = [
  'welcome', 'enemy-route', 'first-defense', 'place-starter', 'start-defense',
  'first-upgrade', 'workshop', 'frost-research', 'place-frost', 'wisp',
  'mara-spell', 'mara-controls', 'cannon', 'warehouse',
] as const;

export function tutorialProgress(b: IdleBattle, intro?: Pick<MaraIntro, 'active' | 'step'>) {
  const stages: Partial<Record<IntroductionStage, number>> = {
    welcome: intro?.active ? intro.step + 1 : 1, build: 4, ready: 5,
    combat: 6, upgrade: 6, workshop: 7, research: 8, frost: 9, observe: 9,
  };
  let current = stages[b.introduction.stage];
  if (current === undefined && !b.tutorial.hidden) {
    if (b.discovery === 'wisp') current = 10;
    else if (b.discovery === 'mara-controls') current = 12;
    else if (b.discovery.startsWith('mara-')) current = 11;
    else if (b.discovery === 'cannon') current = 13;
    else if (b.discovery === 'warehouse') current = 14;
  }
  return current === undefined ? undefined : { current, total: TUTORIAL_STEPS.length, optional: current >= 13 };
}

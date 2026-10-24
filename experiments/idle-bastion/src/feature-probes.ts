import { IdleBattle } from './battle';
import { ilyraFirstTarget, recommendIlyraPosition } from './hero-controls';
import { ilyraCell } from './ilyra';
import { openBattleStore } from './save-store';

export type FeatureScenario = 'frost' | 'heroes' | 'ilyra';
export function isFeatureScenario(value: unknown): value is FeatureScenario {
  return value === 'frost' || value === 'heroes' || value === 'ilyra';
}
function requireAction(ok: unknown, action: string): asserts ok {
  if (!ok) throw new Error(`Feature preview could not prepare ${action}.`);
}

/** Prepared review scenarios only. All purchases and introductions use normal commands. */
export function createFeatureProbe(scenario: FeatureScenario, earnedLate?: unknown): IdleBattle {
  if (!isFeatureScenario(scenario)) throw new Error('Unknown feature scenario');
  if (scenario === 'frost') {
    const b = IdleBattle.newGame();
    b.beginIntroduction();
    requireAction(b.build(b.recommendedStarterPad!), 'starter tower');
    requireAction(b.startDefense(), 'defense');
    for (let i = 0; i < 4000 && b.introduction.stage !== 'frost'; i++) {
      b.update(.025);
      if (!b.learningPaused) continue;
      if (b.introduction.stage === 'upgrade') requireAction(b.upgrade(1), 'first upgrade');
      if (b.introduction.stage === 'workshop') requireAction(b.buildWorkshop(), 'workshop');
      if (b.introduction.stage === 'research') requireAction(b.researchFrost(), 'Frost research');
      requireAction(b.continueLesson(), 'lesson');
    }
    requireAction(b.introduction.stage === 'frost' && b.learningPaused, 'Frost lesson');
    return b;
  }
  // Recorded earned wave-40 defense, not an unlimited wallet or changed unlock rules.
  const b = IdleBattle.restore(earnedLate);
  requireAction(b, 'recorded defense');
  requireAction(b.buildTavern(b.recommendedTavernPlot!), 'tavern');
  requireAction(b.upgradeTavern(), 'tavern upgrade');
  requireAction(b.recruitIlyra(), 'Ilyra recruitment');
  if (scenario === 'heroes') {
    const position = recommendIlyraPosition(b);
    requireAction(position && b.moveIlyraTo(ilyraCell(position)), 'Ilyra destination');
    for (let i = 0; i < 8000 && b.ilyra?.introduction !== 'done'; i++) {
      b.update(.025);
      const aim = ilyraFirstTarget(b);
      if (aim && !b.ilyra!.volley) b.castIlyraAt(aim);
    }
    requireAction(b.ilyra?.introduction === 'done' && !b.ilyra.path.length, 'Ilyra introduction');
    for (let i = 0; i < 200 && b.ilyra.volley; i++) b.update(.025);
    requireAction(!b.ilyra.volley && b.phase !== 'defeat', 'hero controls');
  }
  return b;
}

/** A fresh UUID and mandatory non-default namespace protect every existing game. */
export async function saveFeatureProbe(battle: IdleBattle, scenario: FeatureScenario,
  factory: IDBFactory = globalThis.indexedDB): Promise<string> {
  if (!isFeatureScenario(scenario)) throw new Error('Unknown feature scenario');
  const probe = `review-${scenario}-${crypto.randomUUID()}`;
  const store = await openBattleStore(factory, `spire-idle-bastion-probe-${probe}`);
  try {
    // Fail closed even in the practically impossible event of a UUID collision.
    if ((await store.load()).kind !== 'empty') throw new Error('Preview slot is already occupied');
    await store.save(battle.snapshot(), false, 0);
    return probe;
  } finally { store.close(); }
}

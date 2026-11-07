import type { Companion } from './tavern-social';
import type { TavernBeat } from './tavern-content';

export type TavernEncounterId = 'first' | 'second';
export type TavernEncounterChoice = 'first' | 'second';
export interface TavernEncounterOption {
  label: string;
  reply: readonly TavernBeat[];
}
export interface TavernEncounter {
  title: string;
  opening: readonly TavernBeat[];
  prompt: string;
  choices: readonly [TavernEncounterOption, TavernEncounterOption];
  neutral: readonly TavernBeat[];
}

/** German source lines are translated by the UI; these scenes never grant points. */
export function tavernEncounter(who: Companion, id: TavernEncounterId, priorChoice: TavernEncounterChoice | null = null): TavernEncounter {
  if (who === 'mara') {
    if (id === 'first') return {
      title: 'Ein Zahnrad mit Geschichte',
      opening: [{ line: 'Das kleine Zahnrad hier stammt aus meiner ersten Uhr. Sie ging ständig nach, aber ich habe es behalten. Nicht alles muss perfekt funktionieren, damit ich daran hänge.', clip: 'head' }],
      prompt: 'Deine Antwort',
      choices: [
        { label: 'Was bedeutet es dir?', reply: [{ line: 'Es erinnert mich daran, dass ein misslungener Anfang nichts Endgültiges ist. Und gerade gefällt mir ziemlich gut, wie unser Anfang sich entwickelt.', clip: 'head' }] },
        { label: 'Du bringst mich auch aus dem Takt.', reply: [{ line: 'Na sieh an. Dann ist meine alte Uhr vielleicht ansteckend. Bleib ruhig noch ein bisschen – ich möchte das genauer untersuchen.', clip: 'head' }] },
      ],
      neutral: [{ line: 'Für mich hat es einen Wert, auch wenn es sonst niemand verwenden würde. Schön, dass du mir zuhörst.', clip: 'idle' }],
    };
    const recollection = priorChoice === 'first'
      ? 'Du hast gefragt, was mir mein altes Zahnrad bedeutet. Deine Frage ist mir im Kopf geblieben. Heute habe ich ein kleines Stück Messing aufgehoben.'
      : priorChoice === 'second'
        ? '„Du bringst mich auch aus dem Takt“, hast du gesagt. Frecher Satz. Ich habe ihn offenbar nicht gleich wieder vergessen – und heute ein kleines Stück Messing aufgehoben.'
        : 'Heute habe ich ein kleines Stück Messing gefunden. In der Werkstatt kann ich es nicht brauchen. Trotzdem wollte ich es nicht wegwerfen.';
    return {
      title: 'Für deinen nächsten Besuch',
      opening: [
        { line: recollection, clip: 'head' },
        { line: 'Das hebe ich für dich auf. Irgendwann könnten wir uns am Tresen einen ruhigeren Platz suchen. Mit weniger Werkzeug zwischen uns.', clip: 'head' },
      ],
      prompt: 'Deine Antwort',
      choices: [
        { label: 'Das klingt nach einer guten Pause.', reply: [{ line: 'Dann halten wir das fest. Irgendwann ein Abend ohne Werkbank zwischen uns. Bis dahin darfst du mir hier weiter den Kopf verdrehen.', clip: 'head' }] },
        { label: 'Weniger Werkzeug, mehr Ablenkung?', reply: [{ line: 'Eine ausgezeichnete Beobachtung. Ob ich dich dann überhaupt noch in Ruhe lasse, muss ich mir allerdings gut überlegen.', clip: 'head' }] },
      ],
      neutral: [{ line: 'Ich hebe es erst einmal auf. Ein schöner Gedanke braucht keinen fertigen Plan – und du musst mir jetzt nichts versprechen.', clip: 'idle' }],
    };
  }
  if (id === 'first') return {
    title: 'Ein Name nur für uns',
    opening: [{ line: 'Auf meinen Reisen habe ich immer nach einem kleinen Stern gesucht. Seinen richtigen Namen kenne ich nicht. Hier im Hain ist er manchmal zwischen den Dächern zu sehen.', clip: 'head' }],
    prompt: 'Deine Antwort',
    choices: [
      { label: 'Für uns könnte er „Abendlicht“ heißen.', reply: [{ line: 'Abendlicht. Das klingt nach Ankommen. Als Name nur für uns gefällt es mir. Wie er auf einer Sternkarte heißt, darf vorerst ein Geheimnis bleiben.', clip: 'head' }] },
      { label: 'Ich würde ihn einfach mit dir ansehen.', reply: [{ line: 'Das würde ich mögen. Du musst der Stille neben mir keinen Namen geben. Dass du bleiben möchtest, genügt mir gerade.', clip: 'head' }] },
    ],
    neutral: [{ line: 'Vielleicht braucht er für uns noch keinen Namen. Es ist schön, jemanden zu haben, dem ich von ihm erzählen möchte.', clip: 'idle' }],
  };
  const recollection = priorChoice === 'first'
    ? 'Ich habe vorhin nach unserem Abendlicht gesehen. Deinen Namen dafür habe ich nicht vergessen. Heute wollte ich dich zuerst finden.'
    : priorChoice === 'second'
      ? 'Du wolltest den Stern einfach mit mir ansehen. Daran habe ich heute gedacht – und diesmal wollte ich nicht warten, bis du mich ansprichst.'
      : 'Ich habe vorhin nach meinem kleinen Stern gesehen. Danach habe ich mich dabei ertappt, nach dir Ausschau zu halten.';
  return {
    title: 'Diesmal suche ich dich',
    opening: [
      { line: recollection, clip: 'head' },
      { line: 'Am Fenster ist es abends ruhiger. Vielleicht zeige ich dir dort irgendwann, wonach ich immer suche. Heute möchte ich erst noch hier bei dir sitzen.', clip: 'head' },
    ],
    prompt: 'Deine Antwort',
    choices: [
      { label: 'Ich freue mich, dass du mich gesucht hast.', reply: [{ line: 'Ich auch. Das laut zu sagen fällt mir noch nicht ganz leicht. Aber ich möchte, dass du es weißt.', clip: 'head' }] },
      { label: 'Such mich ruhig öfter.', reply: [{ line: 'Vielleicht tue ich das. Und vielleicht lasse ich dich dann auch merken, wie sehr ich mich auf dich gefreut habe.', clip: 'head' }] },
    ],
    neutral: [{ line: 'Wir müssen das nicht gleich verabreden. Es ist schon ein guter Anfang, dass ich dir sagen wollte, wo ich gern mit dir wäre.', clip: 'idle' }],
  };
}

/** Concrete meaning for the already-earned personal gift; not a new inventory item. */
export function personalGiftLine(who: Companion): string {
  return who === 'mara'
    ? 'Ein kleines Messingzahnrad, nur für mich? Es passt zu meinem alten Glücksstück. Du hast dir wirklich gemerkt, was mir etwas bedeutet.'
    : 'Ein kleiner Sternanhänger? Den behalte ich nah bei mir. Nicht, weil er mir den Weg zeigt – sondern weil du an mich gedacht hast.';
}

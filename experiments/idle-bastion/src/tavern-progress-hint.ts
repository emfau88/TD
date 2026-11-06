import { personalGiftReady, SOCIAL, type Companion, type SocialState } from './tavern-social';

export interface TavernProgressHint { message: string; values?: (string | number)[] }

/** One next step for the existing hint area; detailed counters stay in the details. */
export function tavernProgressHint(state: SocialState, who: Companion, name: string): TavernProgressHint {
  const points = state.points[who], reserve = state.reserves[who];
  if (points >= SOCIAL.chapterMaximum) return { message: 'Diese Etappe ist abgeschlossen. Eure gemeinsamen Momente bleiben.' };
  const personal = personalGiftReady(state, who);
  const wins = Math.max(0, SOCIAL.personalClears - state.personal[who].clears);
  if (points >= 58) return personal
    ? { message: 'Dein persönliches Geschenk ist bereit – überreiche es für Herz 3.' }
    : { message: 'Für {0}s persönliches Geschenk fehlen noch {1} gewonnene normale Wellen. Auch Farmen zählt.', values: [name, wins] };
  if (points >= 23 && points < 35) return state.gifts > 0
    ? { message: 'Dein erstes Geschenk öffnet Herz 2.' }
    : { message: 'Dein nächstes Geschenk folgt nach noch {0} gewonnenen normalen Wellen. Auch Farmen zählt.', values: [SOCIAL.clearsPerGift - state.clearProgress] };
  const canEarn = !!reserve?.talk || points >= 35 && !!reserve?.touch;
  const canGift = points >= 35 && state.gifts > 0;
  if (!canEarn && !canGift) return {
    message: 'Ihr könnt weiter Zeit miteinander verbringen. Neue Zuneigung gibt es nach {0} weiteren Siegen.',
    values: [SOCIAL.clearsPerRefill - (reserve?.clears ?? 0)],
  };
  if (!canEarn && canGift) return personal
    ? { message: 'Dein persönliches Geschenk wartet. Ein normales Geschenk stärkt eure Nähe.' }
    : { message: 'Ein Geschenk aus deinem Vorrat bringt euch näher. Für dein persönliches Geschenk fehlen noch {0} Siege.', values: [wins] };
  if (points < 23) return { message: 'Lernt euch noch etwas kennen, bevor du dein erstes Geschenk überreichst.' };
  if (personal) return { message: 'Dein persönliches Geschenk wartet schon. Verbringt noch etwas Zeit miteinander.' };
  return {
    message: 'Lernt euch weiter kennen. Für dein persönliches Geschenk fehlen außerdem noch {0} gewonnene Wellen.',
    values: [wins],
  };
}

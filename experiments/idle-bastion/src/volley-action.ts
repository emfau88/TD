import type { IdleBattle } from './battle';
import { heroWorldAvailable, ilyraFirstTarget } from './hero-controls';
import { ILYRA } from './ilyra';
import { t } from './i18n';
import { syncSpellButton } from './spell-button';

export type VolleyActionState = 'locked' | 'paused' | 'casting' | 'moving' | 'position' | 'cooldown' | 'ready' | 'waiting';
/** Presentation of the existing cast gates; never changes a timer, target or command. */
export function volleyAction(b: IdleBattle, unavailable: boolean, paused: boolean) {
  const s = b.ilyra, seconds = Math.ceil(s?.cooldown ?? 0);
  const progress = Math.max(0, Math.min(1, 1 - (s?.cooldown ?? 0) / ILYRA.cooldown));
  const result = (state: VolleyActionState, status: string) => ({ state, status, progress, disabled: state !== 'ready' });
  if (!s || unavailable || !heroWorldAvailable(b)) return result('locked', t('Gerade nicht verfügbar'));
  if (paused) return result('paused', seconds ? t('Pause · noch {0} s', seconds) : t('Pausiert · Kampf fortsetzen'));
  if (s.volley) return result('casting', t('Salve wird gewirkt …'));
  if (s.path.length) return result('moving', seconds ? t('Unterwegs · noch {0} s', seconds) : t('Unterwegs · Ankunft abwarten'));
  if (s.introduction === 'move') return result('position', t('Zuerst Standort wählen'));
  if (s.cooldown > 1e-9) return result('cooldown', t('Bereit in {0} s', seconds));
  if (ilyraFirstTarget(b)) return result('ready', t('Bereit · Ziel wählen'));
  return result('waiting', t(b.phase === 'wave' && b.enemies.length ? 'Keine Gegner in Reichweite' : 'Wartet auf Gegner'));
}

export function syncVolleyAction(button: HTMLButtonElement, b: IdleBattle, unavailable: boolean, paused: boolean): void {
  const action = volleyAction(b, unavailable, paused);
  syncSpellButton(button,'ilyra',action,b.ilyra?.cooldown??0,!!b.ilyra?.autoCast);
}

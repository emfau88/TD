import { t, numberFormat } from './i18n';
import { SETTLEMENT } from './battle';

export type QuickWinNotice = 'cannon' | 'workshop';
export interface QuickWinSnapshot {
  cannonUnlocked: boolean;
  cannonBuilt: boolean;
  workshopAvailable: boolean;
  levelSix: boolean;
  gold: number;
  tutorialSeen: number;
}
export interface QuickWinPreferences { cannonDismissed: boolean; cannonInspected: boolean; workshopDismissed: boolean }
const emptyPreferences = (): QuickWinPreferences => ({ cannonDismissed: false, cannonInspected: false, workshopDismissed: false });
const currency = numberFormat({ maximumFractionDigits: 0 });
export const workshopGoldMissing = (gold: number): number => Math.max(0, Math.ceil(SETTLEMENT.workshopUpgradeCost - gold));
export function quickWinNotice(state: QuickWinSnapshot, preferences: QuickWinPreferences): QuickWinNotice | undefined {
  if (state.workshopAvailable && state.levelSix && !preferences.workshopDismissed && !(state.tutorialSeen & (1 << 16))) return 'workshop';
  if (state.cannonUnlocked && !state.cannonBuilt && !preferences.cannonDismissed && !preferences.cannonInspected && !(state.tutorialSeen & (1 << 8))) return 'cannon';
}
export const cannonIsNew = (state: QuickWinSnapshot, preferences: QuickWinPreferences): boolean => state.cannonUnlocked && !state.cannonBuilt && !preferences.cannonInspected;

/** Per-slot UI preferences only. Battle snapshots, offline clocks and money never change here. */
export class QuickWinGuidance {
  readonly element: HTMLElement;
  private readonly badge: HTMLElement;
  private readonly tabBadge: HTMLElement;
  private readonly workshopLink: HTMLButtonElement;
  private readonly preferences: QuickWinPreferences = emptyPreferences();
  private notice?: QuickWinNotice;
  private readonly key: string;
  constructor(slot: string, private readonly ports: { action: (notice: QuickWinNotice) => void; dismissed: (notice: QuickWinNotice) => void }, signal: AbortSignal) {
    this.key = `spire-ui-quick-wins-v1:${slot}`;
    try {
      const saved = JSON.parse(globalThis.localStorage?.getItem(this.key) ?? 'null');
      for (const key of Object.keys(this.preferences) as (keyof QuickWinPreferences)[]) this.preferences[key] = saved?.[key] === true;
    } catch { /* A blocked preference store keeps dismissals for this page only. */ }
    this.element = document.createElement('section');
    this.element.id = 'quick-win-hint'; this.element.className = 'quick-win-hint'; this.element.hidden = true;
    this.element.setAttribute('aria-labelledby', 'quick-win-title');
    this.element.innerHTML = '<div class="quick-win-copy" role="status" aria-live="polite"><strong id="quick-win-title"></strong><p id="quick-win-copy"></p><p id="quick-win-cost"></p></div><div class="quick-win-actions"><button id="quick-win-open" type="button"></button><button id="quick-win-dismiss" type="button"></button></div>';
    document.getElementById('app')!.append(this.element);
    this.badge = document.createElement('span'); this.badge.className = 'quick-win-new'; this.badge.hidden = true;
    document.getElementById('pick-cannon')!.append(this.badge);
    this.tabBadge = document.createElement('span'); this.tabBadge.className = 'quick-win-new quick-win-tab-new'; this.tabBadge.hidden = true;
    document.getElementById('tower-tab')!.append(this.tabBadge);
    this.workshopLink = document.createElement('button'); this.workshopLink.id = 'tower-workshop-link'; this.workshopLink.type = 'button'; this.workshopLink.hidden = true;
    document.getElementById('action-hint')!.after(this.workshopLink);
    this.element.querySelector('#quick-win-open')!.addEventListener('click', () => {
      if (!this.notice) return;
      const notice = this.notice;
      if (notice === 'cannon') this.inspectCannon(); else this.inspectWorkshop();
      this.ports.action(notice);
    }, { signal });
    this.element.querySelector('#quick-win-dismiss')!.addEventListener('click', () => {
      if (!this.notice) return;
      const notice = this.notice;
      this.remember(notice === 'cannon' ? 'cannonDismissed' : 'workshopDismissed');
      this.element.hidden = true; this.ports.dismissed(notice);
    }, { signal });
    this.workshopLink.addEventListener('click', () => { this.inspectWorkshop(); this.ports.action('workshop'); }, { signal });
  }
  inspectCannon(): void { this.remember('cannonInspected'); }
  inspectWorkshop(): void { this.remember('workshopDismissed'); }
  hide(): void { this.element.hidden = true; this.workshopLink.hidden = true; }
  destroy(): void { this.element.remove(); this.badge.remove(); this.tabBadge.remove(); this.workshopLink.remove(); }
  private remember(key: keyof QuickWinPreferences): void {
    if (this.preferences[key]) return;
    this.preferences[key] = true;
    try { globalThis.localStorage?.setItem(this.key, JSON.stringify(this.preferences)); } catch { /* UI remains usable without preference storage. */ }
  }
  update(state: QuickWinSnapshot, view: { suppressed: boolean; towerAtCap: boolean }): boolean {
    if (state.cannonBuilt) this.inspectCannon();
    const isNew = cannonIsNew(state, this.preferences);
    this.badge.hidden = !isNew; this.tabBadge.hidden = !isNew;
    this.badge.textContent = this.tabBadge.textContent = t('NEU');
    const cannon = document.getElementById('pick-cannon')!;
    cannon.classList.toggle('quick-win-new-card', isNew);
    cannon.title = t(state.cannonUnlocked ? 'Steinschleuder: Flächenschaden gegen Gruppen. Frost hält Gegner länger im Trefferbereich.' : 'Steinschleuder: Frostfassung und gemeisterte Welle 5 nötig.');
    cannon.setAttribute('aria-label', t(isNew ? 'Steinschleuder · NEU · Flächenschaden, mit Frost kombinieren' : 'Steinschleuder auswählen'));
    this.tabBadge.setAttribute('aria-label', t('Neue Baumöglichkeit: Steinschleuder'));
    this.workshopLink.textContent = t('Werkstatt II ansehen');
    this.workshopLink.hidden = !state.workshopAvailable || !view.towerAtCap;
    this.notice = quickWinNotice(state, this.preferences);
    this.element.hidden = view.suppressed || !this.notice;
    if (this.element.hidden) return false;
    const workshop = this.notice === 'workshop';
    this.element.dataset.notice = this.notice;
    this.element.querySelector('#quick-win-title')!.textContent = t(workshop ? 'Level 6 erreicht · Werkstatt II' : 'Neu: die Steinschleuder');
    this.element.querySelector('#quick-win-copy')!.textContent = t(workshop
      ? 'Dein Turm ist auf Level 6. Werkstatt II erschließt Turmlevel ab 7.'
      : 'Flächenschaden trifft mehrere Gegner. Mit Frost bleiben Gruppen länger im Trefferbereich. Der Bau ist optional.');
    const missing = workshopGoldMissing(state.gold), cost = this.element.querySelector<HTMLElement>('#quick-win-cost')!;
    cost.hidden = !workshop;
    cost.textContent = workshop ? t(missing ? 'Ausbau: {0} Gold · noch {1} Gold.' : 'Ausbau: {0} Gold · bereit.', currency.format(SETTLEMENT.workshopUpgradeCost), currency.format(missing)) : '';
    this.element.querySelector('#quick-win-open')!.textContent = t(workshop ? 'Werkstatt öffnen' : 'Im Baukatalog ansehen');
    this.element.querySelector('#quick-win-dismiss')!.textContent = t('Später');
    this.element.querySelector('#quick-win-dismiss')!.setAttribute('aria-label', t('Hinweis schließen'));
    return true;
  }
}

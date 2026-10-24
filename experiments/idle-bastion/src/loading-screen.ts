import { startupLanguage, startupText } from './locales/startup';

export type StartupPhase = 'modules' | 'save' | 'assets' | 'render';
const phaseText: Record<StartupPhase, string> = {
  modules: 'Der Wald erwacht …', save: 'Spielstand wird initialisiert …',
  assets: 'Verteidigung wird vorbereitet …', render: 'Die Lichtung wird aufgebaut …',
};
export class LoadingScreen {
  private timer?: ReturnType<typeof setTimeout>;
  private language = startupLanguage();
  private retry?: () => void;
  private recovery?: () => void;
  private readonly retryButton: HTMLButtonElement;
  private readonly recoveryButton: HTMLButtonElement;
  constructor(private host: HTMLElement, private app?: HTMLElement, private options: { timeoutMs?: number; onTimeout?: () => void } = {}) {
    this.retryButton = this.get('#boot-retry'); this.recoveryButton = this.get('#boot-recovery');
    this.retryButton.addEventListener('click', this.retryAction);
    this.recoveryButton.addEventListener('click', this.recoveryAction);
  }
  private get<T extends HTMLElement>(selector: string): T { return this.host.querySelector<T>(selector)!; }
  get visible() { return !this.host.hidden; }
  begin(phase: StartupPhase, language = this.language): void {
    this.language = language; this.host.hidden = false; this.host.dataset.phase = phase;
    this.host.setAttribute('aria-busy', 'true'); if (this.app) this.app.inert = true;
    this.get('#boot-phase').textContent = startupText(phaseText[phase], language);
    this.get('#boot-eyebrow').textContent = startupText('Der alte Hain', language);
    const progress = this.get<HTMLProgressElement>('#boot-progress');
    progress.removeAttribute('value'); progress.removeAttribute('aria-valuetext'); progress.setAttribute('aria-label', startupText('Spielgrafiken', language));
    this.get('#boot-count').textContent = ''; this.get('#boot-error').hidden = true;
    this.retryButton.hidden = this.recoveryButton.hidden = true;
    this.retryButton.textContent = startupText('Erneut versuchen', language);
    this.recoveryButton.textContent = startupText('Spielstand prüfen', language);
    this.arm();
  }
  progress(completed: number, total: number): void {
    if (!this.visible || this.host.dataset.phase === 'error' || !Number.isFinite(completed) || !Number.isFinite(total) || total < 1) return;
    if (this.host.dataset.phase !== 'assets') this.begin('assets');
    const count = Math.max(0, Math.min(Math.floor(total), Math.floor(completed)));
    const progress = this.get<HTMLProgressElement>('#boot-progress');
    progress.max = Math.floor(total); progress.value = count;
    const label = startupText('{0} / {1} Spielgrafiken geladen', this.language, count, Math.floor(total));
    progress.setAttribute('aria-valuetext', label); this.get('#boot-count').textContent = label;
    this.arm();
  }
  fail(message = startupText('Das Spiel konnte nicht gestartet werden. Bitte versuche es erneut.', this.language), retry = () => window.location.reload(), recovery?: () => void): void {
    clearTimeout(this.timer); this.host.hidden = false; this.host.dataset.phase = 'error';
    this.host.setAttribute('aria-busy', 'false');
    this.get('#boot-phase').textContent = startupText('Der Start wurde unterbrochen.', this.language);
    this.get<HTMLProgressElement>('#boot-progress').removeAttribute('value'); this.get<HTMLProgressElement>('#boot-progress').removeAttribute('aria-valuetext'); this.get('#boot-count').textContent = '';
    const error = this.get('#boot-error'); error.textContent = message; error.hidden = false;
    this.retry = retry; this.recovery = recovery;
    this.retryButton.hidden = false; this.recoveryButton.hidden = !recovery;
  }
  complete(): void { this.host.dataset.phase = 'ready'; this.dismiss(); }
  dismiss(): void {
    clearTimeout(this.timer); this.host.hidden = true; this.host.setAttribute('aria-busy', 'false');
    if (this.app) this.app.inert = false;
  }
  destroy(): void {
    this.dismiss(); this.retryButton.removeEventListener('click', this.retryAction); this.recoveryButton.removeEventListener('click', this.recoveryAction);
  }
  private retryAction = () => this.retry?.();
  private recoveryAction = () => this.recovery?.();
  private arm(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.host.ownerDocument.hidden) { this.arm(); return; }
      this.fail(startupText('Das Laden dauert ungewöhnlich lange. Bitte prüfe deine Verbindung und versuche es erneut.', this.language));
      this.options.onTimeout?.();
    }, this.options.timeoutMs ?? 30000);
  }
}
let screen: LoadingScreen | undefined;
export function loadingScreen(): LoadingScreen | undefined {
  if (typeof document === 'undefined') return undefined;
  const host = document.getElementById('boot-screen');
  if (!host) return undefined;
  return screen ??= new LoadingScreen(host, document.getElementById('app') ?? undefined);
}

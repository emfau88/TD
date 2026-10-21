import { TavernInteractions } from './tavern-interactions';
import type { BattleSession } from './battle-session';
import { hearts, SOCIAL, type Interaction } from './tavern-social';
import { TavernAnimation, drawMaraPortrait, MARA_REACTIONS, type TouchRegion } from './tavern-animation';
import ilyraPortrait from '../assets/ilyra/sources/stand-approved.png';
import './tavern-ui.css';

type Destination = 'tavern' | 'mara' | 'wisp' | 'ilyra';
interface Ports { session: () => BattleSession | undefined; navigate: (where: Destination) => void }
export class TavernUI {
  readonly dialog: HTMLDialogElement;
  private readonly lifetime = new AbortController();
  private readonly animation: TavernAnimation;
  private readonly observer: ResizeObserver;
  private screen: 'overview' | 'character' | 'touch' = 'overview';
  private pending = false;
  private generation = 0;
  private lastLives = 20;
  private lastPhase = '';
  private lastDefeat = 0;
  private readonly interactions = new TavernInteractions();
  private opener?: HTMLElement;
  constructor(private readonly ports: Ports) {
    this.dialog = document.createElement('dialog'); this.dialog.id = 'tavern-dialog';
    this.dialog.setAttribute('aria-labelledby', 'tv-title');
    this.dialog.innerHTML = `
      <header class="tv-header"><button type="button" data-do="back" class="tv-back" aria-label="Zurück zur Tavernenübersicht">‹</button><div><small>DER ALTE HAIN</small><h2 id="tv-title">Die Taverne</h2></div><button type="button" data-do="close" class="tv-close" aria-label="Taverne schließen">×</button></header>
      <div class="tv-combat"><span data-text="combat"></span><button type="button" data-do="close">Zum Kampf ↗</button></div>
      <div class="tv-warning" role="status" hidden><span data-text="warning"></span><button type="button" data-do="close">Zum Kampf</button><button type="button" data-do="dismiss" aria-label="Kampfhinweis ausblenden">×</button></div>
      <div class="tv-error" role="alert" hidden></div>
      <section class="tv-overview">
        <div class="tv-room"><span>EIN MOMENT AM FEUER</span><h3>Unter Gefährten.</h3><p>Ein Gespräch. Ein kleines Geschenk.<br>Und Zeit, einander kennenzulernen.</p></div>
        <div class="tv-guests">
          <button type="button" class="tv-guest tv-mara" data-do="mara"><canvas width="136" height="160" aria-hidden="true"></canvas><div><small>DEINE TÜFTLERIN</small><h3>Mara</h3><span data-text="mara-hearts" class="tv-hearts"></span><p>„Schön, dass du vorbeischaust.“</p><strong>Zeit mit Mara verbringen →</strong></div></button>
          <article class="tv-guest tv-ilyra"><img loading="lazy" decoding="async" src="${ilyraPortrait}" alt="Ilyra mit ihrem Speer"><div><small>STERNENWÄCHTERIN</small><h3>Ilyra</h3><p data-text="ilyra-lock"></p><button type="button" data-do="ilyra" class="tv-small">Rekrutierung ansehen →</button></div></article>
        </div>
        <footer class="tv-overview-footer"><button type="button" data-do="wisp">Wisp · Gefährtenverwaltung ↗</button><button type="button" data-do="building">Gebäude & Ausbau ↗</button></footer>
      </section>
      <section class="tv-character" hidden>
        <div class="tv-bond"><div><span class="tv-hearts" data-text="hearts"></span><span data-text="points"></span></div><progress max="160" value="0" aria-label="Maras Zuneigung"></progress></div>
        <div class="tv-character-body">
          <div class="tv-stage"><div class="tv-figure"><canvas width="384" height="512" aria-label="Mara, animierte Charakteransicht"></canvas>${Object.entries(MARA_REACTIONS).map(([key, value]) => `<button type="button" class="tv-hotspot" data-region="${key}" aria-label="${value.label} berühren"><span>＋</span><em>${value.label}</em></button>`).join('')}</div><span class="tv-stage-caption">Mara · Tüftlerin des Hains</span></div>
          <div class="tv-conversation"><div class="tv-dialogue"><small>MARA</small><p data-text="line">Da bist du ja. Setz dich einen Moment zu mir.</p></div><p class="tv-result" data-text="result" role="status"></p><p class="tv-touch-help" hidden>Tippe auf Hand, Haare oder Schulter. Ziehen löst keine Berührung aus.</p><div class="tv-actions"><button type="button" data-action="talk"><span>Sprechen</span><small data-text="talk"></small></button><button type="button" data-do="touch"><span>Berühren</span><small data-text="touch"></small></button><button type="button" data-action="gift"><span>Schenken</span><small data-text="gift"></small></button></div><div class="tv-gifts"><span data-text="stock"></span><details><summary>Geschenke & Zuneigung</summary><p>Geschenke sind für die hier ausgewählte Gefährtin. Du erhältst sie bei Meilensteinen und begrenzt nach gewonnenen Wellen. Gespräche und Berührungen sind auch ohne weitere Punkte möglich. Neue Belohnungen nach 20 Minuten laufender Spielzeit; Pause und Offline-Zeit zählen nicht.</p><p data-text="renewal"></p></details></div><button type="button" class="tv-combat-link" data-do="mara-combat">Mara im Kampf verwalten ↗</button></div>
        </div>
      </section>`;
    document.body.append(this.dialog);
    this.animation = new TavernAnimation(this.get<HTMLCanvasElement>('.tv-figure canvas'), () => this.update());
    this.observer = new ResizeObserver(() => this.positionHotspots()); this.observer.observe(this.get('.tv-stage'));
    void drawMaraPortrait(this.get('.tv-mara canvas')).catch(() => undefined);
    const options = { signal: this.lifetime.signal };
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.back(); }, options);
    this.dialog.addEventListener('close', () => { this.animation.stop(); this.generation++; }, options);
    this.dialog.addEventListener('click', event => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!target || target.disabled) return;
      const action = target.dataset.action as Interaction | undefined;
      if (action) { void this.act(action); return; }
      if (target.dataset.region) { if (!this.dragged) void this.act('touch', target.dataset.region as TouchRegion); return; }
      switch (target.dataset.do) {
        case 'close': this.close(); break;
        case 'back': this.back(); break;
        case 'dismiss': this.get('.tv-warning').hidden = true; break;
        case 'mara': this.show('character'); break;
        case 'touch': this.show(this.screen === 'touch' ? 'character' : 'touch'); break;
        case 'building': this.navigate('tavern'); break;
        case 'mara-combat': this.navigate('mara'); break;
        case 'wisp': this.navigate('wisp'); break;
        case 'ilyra': this.navigate(this.ports.session()?.battle.ilyra || this.ports.session()?.battle.ilyraRecruitable ? 'ilyra' : 'tavern'); break;
      }
    }, options);
    this.dialog.addEventListener('pointerdown', event => { this.pointer = [event.clientX, event.clientY]; this.dragged = false; }, options);
    this.dialog.addEventListener('pointermove', event => { if (this.pointer && Math.hypot(event.clientX - this.pointer[0], event.clientY - this.pointer[1]) > 12) this.dragged = true; }, options);
    this.dialog.addEventListener('pointercancel', () => { this.dragged = true; }, options);
  }
  private pointer?: number[];
  private dragged = false;
  get isOpen(): boolean { return this.dialog.open; }
  private get<T extends HTMLElement = HTMLElement>(selector: string): T { return this.dialog.querySelector<T>(selector)!; }
  private text(key: string, value: string): void { const node = this.get(`[data-text="${key}"]`); if (node.textContent !== value) node.textContent = value; }
  open(): void {
    const session = this.ports.session(); if (!session?.battle.settlement.tavernBuilt || this.isOpen) return;
    this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.lastLives = session.battle.lives; this.lastPhase = session.battle.phase; this.lastDefeat = session.battle.progress.lastDefeat?.attemptId ?? 0;
    this.get('.tv-warning').hidden = true; this.dialog.showModal(); this.show('overview'); this.get<HTMLButtonElement>('[data-do="close"]').focus();
  }
  close(): void { this.animation.stop(); this.dialog.close(); this.generation++; this.opener?.focus(); }
  private back(): void { if (this.screen === 'touch') this.show('character'); else if (this.screen === 'character') this.show('overview'); else this.close(); }
  private navigate(where: Destination): void { this.close(); this.ports.navigate(where); }
  private show(screen: typeof this.screen): void {
    const wasOverview = this.screen === 'overview'; this.screen = screen;
    this.dialog.dataset.screen = screen;
    this.get('.tv-overview').hidden = screen !== 'overview'; this.get('.tv-character').hidden = screen === 'overview';
    this.get('.tv-back').hidden = screen === 'overview';
    this.get('.tv-back').setAttribute('aria-label', screen === 'touch' ? 'Zurück zu Maras Charakteransicht' : 'Zurück zur Tavernenübersicht');
    this.get('#tv-title').textContent = screen === 'overview' ? 'Die Taverne' : screen === 'touch' ? 'Ein Moment mit Mara' : 'Mara';
    this.get('.tv-touch-help').hidden = screen !== 'touch';
    if (screen === 'overview') this.animation.stop();
    else if (wasOverview) { this.text('line', 'Da bist du ja. Setz dich einen Moment zu mir.'); this.text('result', ''); void this.animation.start(); }
    this.update(); this.positionHotspots();
    if (screen !== 'overview') this.get<HTMLButtonElement>('[data-do="back"]').focus();
  }
  private positionHotspots(): void {
    const canvas = this.get<HTMLCanvasElement>('.tv-figure canvas');
    for (const [key, value] of Object.entries(MARA_REACTIONS)) {
      const target = this.get(`[data-region="${key}"]`);
      target.style.left = `${canvas.offsetLeft + canvas.clientWidth * value.x / 384}px`;
      target.style.top = `${canvas.offsetTop + canvas.clientHeight * value.y / 512}px`;
    }
  }
  update(): void {
    if (!this.isOpen) return;
    const session = this.ports.session(); if (!session) { this.close(); return; }
    const b = session.battle;
    const defeated = this.lastPhase !== 'defeat' && b.phase === 'defeat' || (b.progress.lastDefeat?.attemptId ?? 0) > this.lastDefeat;
    if (b.lives < this.lastLives || defeated) {
      this.text('warning', defeated ? 'Vorstoß gescheitert. Deine Verteidigung braucht dich.' : `Dein Kern nimmt Schaden · ${b.lives}/20 Leben.`);
      this.get('.tv-warning').hidden = false;
    }
    this.lastLives = b.lives; this.lastPhase = b.phase; this.lastDefeat = b.progress.lastDefeat?.attemptId ?? 0;
    this.text('combat', `Welle ${b.wave} · ♥ ${b.lives}/20 · ${session.paused ? 'Pausiert' : session.suspended || session.awaitingResume ? 'Kampf angehalten' : b.learningPaused ? 'Lernpause' : 'Kampf läuft'}`);
    const error = this.get('.tv-error'); error.hidden = !session.error && !session.suspended && !session.awaitingResume;
    error.textContent = session.error ? 'Speichern fehlgeschlagen. Bitte kehre zum Kampf zurück, um den Spielstand zu prüfen.' : 'Sitzung angehalten. Bitte kehre zum Kampf zurück.';
    const points = b.social.points.mara, count = hearts(points);
    const heartText = `${'♥'.repeat(count)}${'♡'.repeat(5 - count)}`;
    this.text('hearts', heartText); this.text('mara-hearts', heartText);
    this.get('[data-text="hearts"]').setAttribute('aria-label', `${count} von 5 Herzen`);
    const next = SOCIAL.heartThresholds.find(value => value > points);
    this.text('points', next ? `${points} / ${next} · nächstes Herz` : 'Fünf Herzen · Vertraut');
    const progress = this.get<HTMLProgressElement>('progress'); progress.max = next ?? 160; progress.value = points;
    this.text('stock', `Geschenke: ${b.social.gifts} · Empfängerin: Mara`);
    this.text('renewal', `Nächster Abschnitt in ${Math.ceil((SOCIAL.windowTicks - b.social.window.ticks) / 2400)} Min. laufender Spielzeit.`);
    this.text('ilyra-lock', b.ilyra ? 'An deiner Seite. Persönliche Tavernenmomente folgen in einem späteren Ausbau.' : b.secondBossVictories ? b.settlement.tavernLevel === 2 ? 'Bereit für deine Einladung. Rekrutiere sie in der Gefährtenverwaltung.' : 'Boss 25 besiegt. Baue die Taverne auf Stufe II aus.' : 'Nach Boss 25 und dem Ausbau auf Taverne II rekrutierbar.');
    this.get('[data-do="ilyra"]').textContent = b.ilyra ? 'Ilyra im Kampf verwalten ↗' : b.ilyraRecruitable ? 'Ilyra kennenlernen →' : 'Rekrutierung & Ausbau →';
    this.get<HTMLButtonElement>('[data-do="wisp"]').disabled = !b.wispUnlocked;
    this.dialog.dataset.reacting = String(this.animation.reacting);
    const blocked = this.pending || session.busy || !!session.error || session.suspended || session.awaitingResume || !this.animation.ready || this.animation.reacting;
    for (const action of ['talk', 'touch', 'gift'] as const) {
      const offer = b.companionOffer('mara', action);
      this.text(action, offer.points ? `+${offer.points} Zuneigung${action === 'gift' ? ' · 1 Geschenk' : ''}` : offer.reason === 'no-gift' ? 'Kein Geschenk' : offer.reason === 'complete' ? 'Herzen vollständig' : action === 'gift' ? 'Abschnitt ausgeschöpft' : 'Ohne weitere Punkte');
      const button = this.get<HTMLButtonElement>(action === 'touch' ? '[data-do="touch"]' : `[data-action="${action}"]`);
      button.disabled = blocked || !offer.accepted;
    }
    this.get('[data-do="touch"]').setAttribute('aria-pressed', String(this.screen === 'touch'));
    for (const key of Object.keys(MARA_REACTIONS) as TouchRegion[]) {
      const button = this.get<HTMLButtonElement>(`[data-region="${key}"]`);
      button.hidden = this.screen !== 'touch'; button.disabled = blocked || count < MARA_REACTIONS[key].minHearts;
    }
    if (this.get('.tv-figure canvas').dataset.error) this.text('result', 'Animation konnte nicht geladen werden. Bitte Taverne schließen und erneut öffnen.');
  }
  private async act(action: Interaction, region: TouchRegion = 'shoulder'): Promise<void> {
    const session = this.ports.session();
    if (!session || this.pending || session.busy || session.error || session.suspended || session.awaitingResume || !this.animation.ready || this.animation.reacting) return;
    const offer = session.battle.companionOffer('mara', action); if (!offer.accepted) return;
    this.pending = true; const generation = this.generation; this.update();
    try {
      const result = await this.interactions.run(session, action);
      if (!result) return;
      if (generation !== this.generation || !this.isOpen) return;
      this.text('line', action === 'touch' ? MARA_REACTIONS[region].line : action === 'gift' ? 'Für mich? Das hätte ich jetzt nicht erwartet. Danke, dass du an mich gedacht hast.' : 'Weißt du, was ich an diesem Ort mag? Dass wir ihn gemeinsam aufbauen. Und du immer wieder vorbeischaust.');
      this.text('result', result.points ? `+${result.points} Zuneigung zu Mara${action === 'gift' ? ' · 1 Geschenk überreicht' : ''}` : offer.reason === 'complete' ? 'Alle Herzen erreicht. Mara freut sich trotzdem über deinen Besuch.' : 'Mara freut sich über deine Nähe. Für diesen Abschnitt gibt es keine weiteren Punkte.');
      if (action === 'touch') this.animation.play(region);
    } finally { this.pending = false; this.update(); }
  }
  destroy(): void { this.animation.stop(); this.observer.disconnect(); this.lifetime.abort(); this.dialog.remove(); }
}

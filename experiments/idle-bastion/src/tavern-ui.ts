import { t, onLanguageChange } from './i18n';
import { bindStaticTranslations } from './i18n-dom';
import { COMPANIONS } from './tavern-companions';
import { TavernInteractions } from './tavern-interactions';
import type { BattleSession } from './battle-session';
import { hearts, SOCIAL, type Interaction, type Companion } from './tavern-social';
import { TavernAnimation, drawCompanionPortrait, companionPortrait, type TouchRegion } from './tavern-animation';
import './tavern-ui.css';
import type { TavernPlayer, TavernPresentation } from './tavern-presentation';

type Destination = 'tavern' | 'mara' | 'wisp' | 'ilyra';
interface Ports { presentation?: TavernPresentation; session: () => BattleSession | undefined; navigate: (where: Destination) => void; onOpenChange?: (open:boolean) => void; onGift?: () => void; onCompanion?: (who:Companion|null) => void; onTouch?: (who:Companion) => void }
export class TavernUI {
  readonly dialog: HTMLDialogElement;
  private lineSource = '';
  private resultSource: () => string = () => '';
  private result(source = this.resultSource): void { this.resultSource = source; this.text('result', source()); }
  private readonly unbindLanguage: () => void;
  private readonly unbindStatic: () => void;
  private readonly lifetime = new AbortController();
  private readonly animation: TavernPlayer;
  private readonly observer: ResizeObserver;
  private screen: 'overview' | 'character' | 'touch' = 'overview';
  private pending = false;
  private generation = 0;
  private lastLives = 20;
  private lastPhase = '';
  private lastDefeat = 0;
  private readonly interactions = new TavernInteractions();
  private opener?: HTMLElement;
  private portraitsStarted = false;
  private moment?: { heart: number; beat: number };
  private newMoment?: number;
  private conversationTurn: Record<Companion, number> = { mara: 0, ilyra: 0 };
  private selected: Companion = 'mara';
  private replyTimer?: ReturnType<typeof setTimeout>;
  private bondCompanion?: Companion;
  private bondPoints = -1;
  private get content() { return COMPANIONS[this.selected]; }
  private get points() { return this.ports.session()?.battle.social.points[this.selected] ?? 0; }
  constructor(private readonly ports: Ports) {
    this.dialog = document.createElement('dialog'); this.dialog.id = 'tavern-dialog';
    this.dialog.setAttribute('aria-labelledby', 'tv-title');
    this.dialog.dataset.artwork = ports.presentation?.kind ?? 'legacy';
    this.dialog.innerHTML = `
      <header class="tv-header"><button type="button" data-do="back" class="tv-back" aria-label="Zurück zur Tavernenübersicht">‹</button><div><small>DER ALTE HAIN</small><h2 id="tv-title">Die Taverne</h2></div><button type="button" data-do="close" class="tv-close" aria-label="Taverne schließen">×</button></header>
      <div class="tv-combat"><span data-text="combat"></span><button type="button" data-do="close">Zum Kampf ↗</button></div>
      <div class="tv-warning" role="status" hidden><span data-text="warning"></span><button type="button" data-do="close">Zum Kampf</button><button type="button" data-do="dismiss" aria-label="Kampfhinweis ausblenden">×</button></div>
      <div class="tv-error" role="alert" hidden></div>
      <section class="tv-overview">
        <div class="tv-room"><span>EIN MOMENT AM FEUER</span><h3>Unter Gefährten.</h3><p>Ein Gespräch. Ein kleines Geschenk.<br>Und Zeit, einander kennenzulernen.</p></div>
        <div class="tv-guests">
          <button type="button" class="tv-guest tv-mara" data-do="mara"><canvas width="136" height="160" aria-hidden="true"></canvas><div><small>DEINE TÜFTLERIN</small><h3>Mara</h3><span data-text="mara-hearts" class="tv-hearts"></span><p data-text="mara-greeting">„Schön, dass du vorbeischaust.“</p><strong>Zeit mit Mara verbringen →</strong></div></button>
          <article class="tv-guest tv-ilyra"><canvas width="136" height="160" aria-hidden="true"></canvas><div><small>STERNENWÄCHTERIN</small><h3>Ilyra</h3><span data-text="ilyra-hearts" class="tv-hearts"></span><p data-text="ilyra-lock"></p><button type="button" data-do="ilyra" class="tv-small">Rekrutierung ansehen →</button></div></article>
        </div>
        <footer class="tv-overview-footer"><button type="button" data-do="wisp">Wisp · Gefährtenverwaltung ↗</button><button type="button" data-do="building">Gebäude & Ausbau ↗</button></footer>
      </section>
      <section class="tv-character" hidden>
        <div class="tv-bond"><div class="tv-bond-visual"><div class="tv-heart-buttons" role="group" aria-label="Maras persönliche Momente">${this.content.moments.map(moment => `<button type="button" data-moment="${moment.heart}"><svg viewBox="0 0 40 38" aria-hidden="true"><path class="tv-heart-shape" d="M20 34C16 30 3 22 3 12C3 2 15 0 20 9C25 0 37 2 37 12C37 22 24 30 20 34Z"/><path class="tv-heart-shine" d="M8 13C7 8 12 5 16 10"/></svg></button>`).join('')}</div><div class="tv-bond-track" title="Ein Abschnitt pro Herz"><progress max="160" value="0" aria-label="Maras Zuneigung"></progress><span class="tv-bond-fill" aria-hidden="true"></span><span class="tv-bond-marks" aria-hidden="true"></span></div></div><div class="tv-bond-copy"><span data-text="points"></span><p class="tv-moment-hint" data-text="moment-hint"></p></div></div>
        <div class="tv-character-body">
          <div class="tv-stage"><div class="tv-figure"><img class="tv-loading-portrait" alt="" aria-hidden="true" hidden><canvas width="384" height="512" aria-label="Mara, animierte Charakteransicht"></canvas>${Object.entries(this.content.reactions).map(([key, value]) => `<button type="button" class="tv-hotspot" data-region="${key}" aria-label="${value.label} berühren"><span aria-hidden="true"></span><em>${value.label}</em></button>`).join('')}</div><span class="tv-load-status" role="status" hidden></span><span class="tv-stage-caption">Mara · Tüftlerin des Hains</span></div>
          <div class="tv-conversation"><div class="tv-story-heading" hidden><small data-text="story-step"></small><h3 data-text="story-title"></h3></div><div class="tv-dialogue"><small>MARA</small><p data-text="line">Da bist du ja. Setz dich einen Moment zu mir.</p></div><p class="tv-result" data-text="result" role="status"></p><button type="button" data-do="new-moment" class="tv-unlock" hidden></button><div class="tv-story-controls" hidden><button type="button" data-do="story-next">Weiter</button><button type="button" data-do="story-exit">Zurück zu Mara</button></div><p class="tv-touch-help" hidden>Tippe auf Hand, Haare oder Schulter. Ziehen löst keine Berührung aus.</p><div class="tv-actions"><button type="button" data-action="talk"><span>Sprechen</span><small data-text="talk"></small></button><button type="button" data-do="touch"><span>Berühren</span><small data-text="touch"></small></button><button type="button" data-action="gift"><span>Schenken</span><small data-text="gift"></small></button></div><div class="tv-gifts"><details><summary><span data-text="gift-summary">Geschenke & Details</span></summary><p data-text="stock"></p><p>Geschenke sind für die hier ausgewählte Gefährtin. Du erhältst sie bei Meilensteinen und begrenzt nach gewonnenen Wellen. Gespräche und Berührungen sind auch ohne weitere Punkte möglich. Neue Belohnungen nach 20 Minuten laufender Spielzeit; Pause und Offline-Zeit zählen nicht.</p><p data-text="renewal"></p><button type="button" class="tv-combat-link" data-do="mara-combat">Mara im Kampf verwalten ↗</button></details></div></div>
        </div>
      </section>`;
    document.body.append(this.dialog);
    this.get('.tv-dialogue').setAttribute('aria-live', 'polite');
    this.get('.tv-dialogue').setAttribute('aria-atomic', 'true');
    this.animation = ports.presentation?.create(this.get<HTMLCanvasElement>('.tv-figure canvas'), () => this.update()) ?? new TavernAnimation(this.get<HTMLCanvasElement>('.tv-figure canvas'), () => this.update());
    if (ports.presentation) {
      const gestures = document.createElement('div'); gestures.className = 'tv-gestures';
      gestures.setAttribute('aria-label', 'Vertraute Gesten');
      for (const gesture of ports.presentation.gestures) {
        const button = document.createElement('button'); button.type = 'button'; button.dataset.gesture = gesture.key; button.textContent = gesture.label; gestures.append(button);
      }
      this.get('.tv-actions').after(gestures);
    }
    this.unbindStatic = bindStaticTranslations(this.dialog);
    this.unbindLanguage = onLanguageChange(() => this.refreshLanguage());
    this.observer = new ResizeObserver(() => this.positionHotspots()); this.observer.observe(this.get('.tv-stage'));
    const options = { signal: this.lifetime.signal };
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.back(); }, options);
    this.dialog.addEventListener('close', () => { this.animation.stop(); this.generation++; this.ports.onOpenChange?.(false); }, options);
    this.dialog.addEventListener('click', event => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!target || target.disabled) return;
      const action = target.dataset.action as Interaction | undefined;
      if (action) { void this.act(action); return; }
      if (target.dataset.gesture) {
        const gesture = this.ports.presentation?.gestures.find(g => g.key === target.dataset.gesture);
        if (gesture && (!gesture.companion || gesture.companion === this.selected) && hearts(this.points) >= gesture.minHearts) { this.animation.gesture?.(gesture.key); this.text('line', gesture.line[this.selected]); this.result(() => ''); this.revealReply(); this.update(); }
        return;
      }
      if (target.dataset.moment) { void this.startMoment(Number(target.dataset.moment)); return; }
      if (target.dataset.region) { if (!this.dragged) void this.act('touch', target.dataset.region as TouchRegion); return; }
      switch (target.dataset.do) {
        case 'new-moment': if (this.newMoment) void this.startMoment(this.newMoment); break;
        case 'story-next': this.nextBeat(); break;
        case 'story-exit': this.endMoment(); break;
        case 'close': this.close(); break;
        case 'back': this.back(); break;
        case 'dismiss': this.get('.tv-warning').hidden = true; break;
        case 'mara': this.select('mara'); break;
        case 'touch': this.show(this.screen === 'touch' ? 'character' : 'touch'); break;
        case 'building': this.navigate('tavern'); break;
        case 'mara-combat': this.navigate(this.selected); break;
        case 'wisp': this.navigate('wisp'); break;
        case 'ilyra': if (this.ports.session()?.battle.ilyra) this.select('ilyra'); else this.navigate(this.ports.session()?.battle.ilyraRecruitable ? 'ilyra' : 'tavern'); break;
      }
    }, options);
    this.dialog.addEventListener('pointerdown', event => { this.pointer = [event.clientX, event.clientY]; this.dragged = false; }, options);
    this.dialog.addEventListener('pointermove', event => { if (this.pointer && Math.hypot(event.clientX - this.pointer[0], event.clientY - this.pointer[1]) > 12) this.dragged = true; }, options);
    this.dialog.addEventListener('pointercancel', () => { this.dragged = true; }, options);
  }
  private refreshLanguage(): void {
    const screen = this.screen;
    this.get('#tv-title').textContent = screen === 'overview' ? t('Die Taverne') : screen === 'touch' ? t('Ein Moment mit {0}', this.content.name) : this.content.name;
    this.get('.tv-stage-caption').textContent = t("{0} · {1}", this.content.name, this.content.role);
    this.get('.tv-dialogue small').textContent = t(this.content.name.toUpperCase());
    this.get('.tv-heart-buttons').setAttribute('aria-label', t("{0}s persönliche Momente", this.content.name));
    this.get('progress').setAttribute('aria-label', t("{0}s Zuneigung", this.content.name));
    this.get('.tv-figure canvas').setAttribute('aria-label', t("{0}, animierte Charakteransicht", this.content.name));
    this.get('[data-do=story-exit]').textContent = t("Zurück zu {0}", this.content.name);
    this.get('[data-do=mara-combat]').textContent = t("{0} im Kampf verwalten ↗", this.content.name);
    if (this.lineSource) this.text('line', this.lineSource);
    const moment = this.moment && this.content.moment(this.points, this.moment.heart);
    if (moment && this.moment) {
      this.text('story-title', moment.title);
      this.text('story-step', t('{0} {1} · {2} / {3}', moment.heart, moment.heart === 1 ? t('HERZ') : t('HERZEN'), this.moment.beat + 1, moment.beats.length));
      this.get('[data-do=story-next]').textContent = this.moment.beat === moment.beats.length - 1 ? t('Moment beenden') : t('Weiter');
    }
    this.result();
    this.update();
  }
  private pointer?: number[];
  private dragged = false;
  get isOpen(): boolean { return this.dialog.open; }
  private get<T extends HTMLElement = HTMLElement>(selector: string): T { return this.dialog.querySelector<T>(selector)!; }
  private text(key: string, value: string): void { if (key === 'line') this.lineSource = value; const node = this.get(`[data-text="${key}"]`); const translated = t(value); if (node.textContent !== translated) node.textContent = translated; }
  private revealReply(): void {
    const dialogue = this.get('.tv-dialogue');
    this.get('.tv-conversation').scrollTop = 0;
    clearTimeout(this.replyTimer); delete dialogue.dataset.reply;
    void dialogue.offsetWidth;
    dialogue.dataset.reply = 'true';
    this.replyTimer = setTimeout(() => { delete dialogue.dataset.reply; }, 1600);
  }
  open(): void {
    const session = this.ports.session(); if (!session?.battle.settlement.tavernBuilt || this.isOpen) return;
    if (!this.portraitsStarted) {
      this.portraitsStarted = true;
      for (const who of ['mara', 'ilyra'] as const) void (this.ports.presentation?.drawPortrait ?? drawCompanionPortrait)(this.get(`.tv-${who} canvas`), who).catch(() => { this.portraitsStarted = false; });
    }
    this.bondCompanion = undefined;
    this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.lastLives = session.battle.lives; this.lastPhase = session.battle.phase; this.lastDefeat = session.battle.progress.lastDefeat?.attemptId ?? 0;
    this.get('.tv-warning').hidden = true; this.dialog.showModal(); this.ports.onOpenChange?.(true); this.show('overview'); this.get<HTMLButtonElement>('[data-do="close"]').focus();
  }
  close(): void { this.ports.onCompanion?.(null); this.animation.stop(); this.dialog.close(); this.generation++; this.opener?.focus(); }
  private back(): void { if (this.moment) { this.endMoment(); return; } if (this.screen === 'touch') this.show('character'); else if (this.screen === 'character') this.show('overview'); else this.close(); }
  private navigate(where: Destination): void { this.close(); this.ports.navigate(where); }
  private select(who: Companion): void {
    if (this.pending || (who === 'ilyra' && !this.ports.session()?.battle.ilyra)) return;
    this.generation++; this.animation.stop(); this.selected = who; this.newMoment = undefined;
    clearTimeout(this.replyTimer); delete this.get('.tv-dialogue').dataset.reply;
    this.get('.tv-conversation').scrollTop = 0;
    this.screen = 'overview'; this.show('character');
  }
  private show(screen: typeof this.screen): void {
    this.ports.onCompanion?.(screen==='overview'?null:this.selected);
    const wasOverview = this.screen === 'overview'; this.screen = screen;
    this.moment = undefined;
    this.dialog.dataset.screen = screen; this.dialog.dataset.companion = this.selected;
    this.get('.tv-overview').hidden = screen !== 'overview'; this.get('.tv-character').hidden = screen === 'overview';
    this.get('.tv-back').hidden = screen === 'overview';
    this.get('.tv-back').setAttribute('aria-label', t(screen === 'touch' ? t("Zurück zu {0}s Charakteransicht", this.content.name) : t('Zurück zur Tavernenübersicht')));
    this.get('#tv-title').textContent = t(screen === 'overview' ? t('Die Taverne') : screen === 'touch' ? t("Ein Moment mit {0}", this.content.name) : this.content.name);
    this.get('.tv-touch-help').hidden = screen !== 'touch';
    // Install the new loading portrait before start() can synchronously notify UI.
    this.get<HTMLImageElement>('.tv-loading-portrait').src = (this.ports.presentation?.portrait ?? companionPortrait)(this.selected);
    if (wasOverview) this.get('.tv-figure canvas').hidden = true;
    if (screen === 'overview') { this.generation++; this.pending = false; this.animation.stop(); }
    else if (wasOverview) { this.text('line', this.content.stage(this.points).greeting); this.result(() => ''); void this.animation.start(this.selected); }
    if (screen === 'touch') void this.animation.prepareReactions();
    this.refreshLanguage();
    this.update(); this.positionHotspots();
    if (screen !== 'overview') this.get<HTMLButtonElement>('[data-do="back"]').focus();
  }
  private positionHotspots(): void {
    const canvas = this.get<HTMLCanvasElement>('.tv-figure canvas');
    for (const [key, value] of Object.entries(this.content.reactions)) {
      const target = this.get(`[data-region="${key}"]`);
      const anchor = this.ports.presentation?.anchors(this.selected)[key as TouchRegion] ?? value;
      target.style.left = `${canvas.offsetLeft + canvas.clientWidth * anchor.x / canvas.width}px`;
      target.style.top = `${canvas.offsetTop + canvas.clientHeight * anchor.y / canvas.height}px`;
    }
  }
  update(): void {
    if (!this.isOpen) return;
    const session = this.ports.session(); if (!session) { this.close(); return; }
    const b = session.battle;
    const defeated = this.lastPhase !== 'defeat' && b.phase === 'defeat' || (b.progress.lastDefeat?.attemptId ?? 0) > this.lastDefeat;
    if (b.lives < this.lastLives || defeated) {
      this.text('warning', defeated ? t('Vorstoß gescheitert. Deine Verteidigung braucht dich.') : t("Dein Kern nimmt Schaden · {0}/20 Leben.", b.lives));
      this.get('.tv-warning').hidden = false;
    }
    this.lastLives = b.lives; this.lastPhase = b.phase; this.lastDefeat = b.progress.lastDefeat?.attemptId ?? 0;
    this.text('combat', t("Welle {0} · ♥ {1}/20 · {2}", b.wave, b.lives, session.paused ? t('Pausiert') : session.suspended || session.awaitingResume ? t('Kampf angehalten') : b.learningPaused ? t('Lernpause') : t('Kampf läuft')));
    const error = this.get('.tv-error'); error.hidden = !session.error && !session.suspended && !session.awaitingResume;
    error.textContent = t(session.error ? t('Speichern fehlgeschlagen. Bitte kehre zum Kampf zurück, um den Spielstand zu prüfen.') : t('Sitzung angehalten. Bitte kehre zum Kampf zurück.'));
    const points = this.points, count = hearts(points);
    this.animation.setHearts?.(count);
    for (const who of ['mara', 'ilyra'] as const) {
      const n = hearts(b.social.points[who]);
      this.text(`${who}-hearts`, who === 'ilyra' && !b.ilyra ? '' : `${'♥'.repeat(n)}${'♡'.repeat(5 - n)}`);
    }
    this.text('mara-greeting', COMPANIONS.mara.stage(b.social.points.mara).greeting);
    const next = SOCIAL.heartThresholds.find(value => value > points);
    this.text('points', t("{0} von 5 Herzen · {1}", count, next ? t("noch {0} Zuneigung", next - points) : t('Vertrautheit vollendet')));
    const progress = this.get<HTMLProgressElement>('progress'); progress.max = 160; progress.value = points;
    progress.setAttribute('aria-valuetext', t("{0} Zuneigung · {1} von 5 Herzen", points, count));
    if (this.bondCompanion !== this.selected || this.bondPoints !== points) {
      // Five equal visual sections; interpolate within each actual heart threshold.
      const lower = count ? SOCIAL.heartThresholds[count - 1]! : 0;
      const section = count >= 5 ? 5 : count + (points - lower) / (SOCIAL.heartThresholds[count]! - lower);
      const fill = this.get('.tv-bond-fill');
      fill.style.transition = this.bondCompanion === this.selected ? '' : 'none';
      fill.style.width = `${Math.max(0, Math.min(100, section * 20))}%`;
      this.bondCompanion = this.selected; this.bondPoints = points;
    }
    this.text('gift-summary', t("Geschenke: {0} · Details", b.social.gifts));
    this.text('stock', t("Geschenke: {0} · Empfängerin: {1}", b.social.gifts, this.content.name));
    this.text('renewal', t("Neue Zuneigung nach noch {0} gewonnenen Wellen.", SOCIAL.clearsPerRefill - (b.social.reserves[this.selected]?.clears ?? 0)));
    this.text('ilyra-lock', b.ilyra ? COMPANIONS.ilyra.stage(b.social.points.ilyra).greeting : b.secondBossVictories ? b.settlement.tavernLevel === 2 ? t('Bereit für deine Einladung. Rekrutiere sie in der Gefährtenverwaltung.') : t('Boss 25 besiegt. Baue die Taverne auf Stufe II aus.') : t('Nach Boss 25 und dem Ausbau auf Taverne II rekrutierbar.'));
    this.get('[data-do="ilyra"]').textContent = t(b.ilyra ? t('Zeit mit Ilyra verbringen →') : b.ilyraRecruitable ? t('Ilyra kennenlernen →') : t('Rekrutierung & Ausbau →'));
    this.get<HTMLButtonElement>('[data-do="wisp"]').disabled = !b.wispUnlocked;
    const nextMoment = this.content.next(points);
    this.text('moment-hint', nextMoment ? t("{0}Als Nächstes: „{1}“ · {2} Zuneigung.", count ? t('Herz antippen: Moment erleben. ') : '', nextMoment.title, nextMoment.points) : t('Fünf persönliche Momente · zum Wiedererleben ein Herz antippen.'));
    this.dialog.dataset.story = String(!!this.moment);
    this.get('.tv-back').setAttribute('aria-label', t(this.moment ? t("Zurück zu {0}", this.content.name) : this.screen === 'touch' ? t("Zurück zu {0}s Charakteransicht", this.content.name) : t('Zurück zur Tavernenübersicht')));
    this.get('.tv-story-heading').hidden = !this.moment;
    this.get('.tv-story-controls').hidden = !this.moment;
    this.get('.tv-actions').hidden = !!this.moment;
    this.get('.tv-gifts').hidden = !!this.moment;
    this.get('.tv-result').hidden = !!this.moment;
    this.get('.tv-touch-help').hidden = this.screen !== 'touch' || !!this.moment;
    const unlock = this.get<HTMLButtonElement>('[data-do="new-moment"]');
    unlock.hidden = !this.newMoment || !!this.moment;
    if (this.newMoment) unlock.textContent = t("Neuer Moment: {0} →", this.content.moments[this.newMoment - 1]!.title);
    this.dialog.dataset.reacting = String(this.animation.reacting);
    const blocked = this.pending || session.inputBusy || !!session.error || session.suspended || session.awaitingResume || !this.animation.ready;
    unlock.disabled = blocked;
    const gestures = this.dialog.querySelector<HTMLElement>('.tv-gestures');
    if (gestures) {
      gestures.hidden = !!this.moment || count < 2 || this.screen === 'touch';
      for (const gesture of this.ports.presentation!.gestures) {
        const button = this.get<HTMLButtonElement>(`[data-gesture="${gesture.key}"]`);
        button.hidden = !!gesture.companion && gesture.companion !== this.selected;
        button.disabled = this.pending || session.inputBusy || !!session.error || session.suspended || session.awaitingResume || !this.animation.ready || count < gesture.minHearts;
      }
    }
    this.get<HTMLButtonElement>('[data-do="story-next"]').disabled = blocked;
    for (const moment of this.content.moments) {
      const button = this.get<HTMLButtonElement>(`[data-moment="${moment.heart}"]`);
      const available = !!this.content.moment(points, moment.heart);
      button.disabled = blocked || !available;
      button.classList.toggle('unlocked', available);
      button.setAttribute('aria-label', t("{0} {1}: {2}{3}", moment.heart, moment.heart === 1 ? t('Herz') : t('Herzen'), moment.title, available ? t(' · Moment erleben') : t(" · ab {0} Zuneigung", SOCIAL.heartThresholds[moment.heart - 1])));
      button.title = t(button.getAttribute('aria-label')!);
    }
    for (const action of ['talk', 'touch', 'gift'] as const) {
      const offer = b.companionOffer(this.selected, action);
      this.text(action, offer.points ? t("+{0} Zuneigung{1}", offer.points, action === 'gift' ? t(' · 1 Geschenk') : '') : offer.reason === 'no-gift' ? t('Kein Geschenk') : offer.reason === 'complete' ? t('Herzen vollständig') : action === 'gift' ? t('Abschnitt ausgeschöpft') : t('Ohne weitere Punkte'));
      const button = this.get<HTMLButtonElement>(action === 'touch' ? '[data-do="touch"]' : `[data-action="${action}"]`);
      button.disabled = blocked || !offer.accepted;
    }
    this.get('[data-do="touch"]').setAttribute('aria-pressed', String(this.screen === 'touch'));
    for (const key of Object.keys(this.content.reactions) as TouchRegion[]) {
      const button = this.get<HTMLButtonElement>(`[data-region="${key}"]`);
      button.hidden = this.screen !== 'touch'; button.disabled = blocked || !this.animation.reactionsReady || count < this.content.reactions[key].minHearts;
    }
    const failedIdle = !!this.get('.tv-figure canvas').dataset.error;
    this.get('.tv-loading-portrait').hidden = this.animation.ready && !failedIdle;
    this.get('.tv-figure canvas').hidden = !this.animation.ready || failedIdle;
    const loading = this.get('.tv-load-status');
    const failedReaction = !!this.get('.tv-figure canvas').dataset.reactionError;
    loading.hidden = this.animation.ready && !this.animation.loadingReactions && !failedReaction;
    const loadingText = failedIdle ? t('Animation nicht verfügbar. Standbild wird angezeigt.') : !this.animation.ready ? t("{0} wird geladen …", this.content.name) : this.animation.loadingReactions ? t('Reaktion wird vorbereitet …') : failedReaction ? t('Reaktion nicht geladen. Du kannst es erneut versuchen.') : '';
    if (loading.textContent !== loadingText) loading.textContent = t(loadingText);
  }
  private async startMoment(heart: number): Promise<void> {
    const session = this.ports.session();
    if (!session || this.pending || session.inputBusy || session.error || session.suspended || session.awaitingResume || !this.animation.ready || !this.content.moment(this.points, heart)) return;
    const generation = this.generation;
    this.pending = true; this.update();
    const ready = await this.animation.prepareReactions();
    if (generation !== this.generation || !this.isOpen) return;
    this.pending = false;
    if (!ready) { this.update(); return; }
    this.show('character'); this.moment = { heart, beat: 0 };
    if (this.newMoment === heart) this.newMoment = undefined;
    this.renderBeat();
  }
  private renderBeat(): void {
    if (!this.moment) return;
    const moment = this.content.moment(this.points, this.moment.heart);
    if (!moment) { this.endMoment(); return; }
    const beat = moment.beats[this.moment.beat]!;
    this.text('story-title', moment.title);
    this.text('story-step', t("{0} {1} · {2} / {3}", moment.heart, moment.heart === 1 ? t('HERZ') : t('HERZEN'), this.moment.beat + 1, moment.beats.length));
    this.text('line', beat.line);
    this.get('[data-do="story-next"]').textContent = t(this.moment.beat === moment.beats.length - 1 ? t('Moment beenden') : t('Weiter'));
    this.animation.scene(beat.clip); this.update();
  }
  private nextBeat(): void {
    if (!this.moment) return;
    const moment = this.content.moment(this.points, this.moment.heart);
    if (!moment || ++this.moment.beat >= moment.beats.length) { this.endMoment(); return; }
    this.renderBeat();
  }
  private endMoment(): void {
    this.moment = undefined;
    this.text('line', this.content.stage(this.points).greeting);
    this.result(() => t('Deine Momente bleiben über die Herzen verfügbar.')); this.update();
  }
  private async act(action: Interaction, region: TouchRegion = 'shoulder'): Promise<void> {
    const session = this.ports.session();
    if (!session || this.pending || session.inputBusy || session.error || session.suspended || session.awaitingResume || !this.animation.ready) return;
    if (this.moment || action === 'touch' && !this.animation.reactionsReady) return;
    const who = this.selected, content = this.content, beforePoints = this.points;
    const offer = session.battle.companionOffer(this.selected, action, { region }); if (!offer.accepted) return;
    this.pending = true; const generation = this.generation; this.update();
    try {
      const result = await this.interactions.run(session, action, who, { region });
      if (!result) return;
      if (generation !== this.generation || !this.isOpen) return;
      this.text('line', content.line(beforePoints, action, region, this.conversationTurn[who]));
      if (action === 'talk') this.conversationTurn[who]++;
      const afterHearts = hearts(session.battle.social.points[who]);
      if (afterHearts > hearts(beforePoints)) this.newMoment = afterHearts;
      this.result(() => result.points ? t("+{0} Zuneigung zu {1}{2}", result.points, content.name, action === 'gift' ? t(' · 1 Geschenk überreicht') : '') : offer.reason === 'complete' ? t("Alle Herzen erreicht. {0} freut sich trotzdem über deinen Besuch.", content.name) : t("{0} freut sich über deine Nähe. Für diesen Abschnitt gibt es keine weiteren Punkte.", content.name));
      if (action === 'gift' && result.points > 0) this.ports.onGift?.();
      if (action === 'touch') { this.animation.play(region); this.ports.onTouch?.(who); }
      else this.animation.act?.(action);
      this.revealReply();
    } finally { this.pending = false; this.update(); }
  }
  destroy(): void { clearTimeout(this.replyTimer); this.unbindLanguage(); this.unbindStatic(); this.animation.stop(); this.observer.disconnect(); this.lifetime.abort(); this.dialog.remove(); }
}

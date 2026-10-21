import { AudioObserver, CUES, CueLimiter, readMix, type AudioMix, type Cue, battleCues } from './audio-cues';
import type { BattleEvent, IdleBattle } from './battle';

// URL imports emit files but do not fetch them. Music streams only after a user gesture.
const files = import.meta.glob('../assets/audio/*.{wav,mp3}', { eager:true, query:'?url', import:'default' }) as Record<string,string>;
const url = (file:string) => files[`../assets/audio/${file}`]!;
const MIX_KEY = 'spire-audio-mix-v1';
type Music = 'field'|'tavern';
type Track = { element:HTMLAudioElement; gain:GainNode; source:MediaElementAudioSourceNode };
type Voice = { source:AudioBufferSourceNode; gain:GainNode; combat:boolean };

export class GameAudio {
  mix: AudioMix;
  private context?: AudioContext;
  private master?: GainNode;
  private effects?: GainNode;
  private combat?: GainNode;
  private tracks = new Map<Music,Track>();
  private music: Music = 'field';
  private buffers = new Map<Cue,Promise<AudioBuffer | undefined>>();
  private active = new Set<Voice>();
  private limiter = new CueLimiter();
  private observer = new AudioObserver();
  private lifetime = new AbortController();
  private unlocked = false;
  private allowed = false;
  private running = false;
  private epoch = 0;
  private musicTimer?: number;
  private status?: HTMLElement;
  private disposed = false;

  constructor() {
    try { this.mix = readMix(JSON.parse(localStorage.getItem(MIX_KEY) ?? 'null')); }
    catch { this.mix = readMix(null); }
    const signal = this.lifetime.signal;
    const unlock = () => { void this.unlock(); };
    document.addEventListener('pointerdown',unlock,{capture:true,signal});
    document.addEventListener('keydown',unlock,{capture:true,signal});
    document.addEventListener('visibilitychange',() => this.refresh(),{signal});
    window.addEventListener('pagehide',() => this.silence(),{signal});
    document.addEventListener('click', e => {
      const button = (e.target as HTMLElement).closest('button,summary');
      if (!button || button.matches(':disabled') || button.closest('[data-audio-controls]')) return;
      this.play('click');
    },{capture:true,signal});
  }
  private async unlock(): Promise<void> {
    if (this.disposed || document.hidden || this.mix.muted) return;
    if (this.unlocked && this.context?.state === 'running') return;
    try {
      if (!this.context) {
        const Context = window.AudioContext ?? (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
        if (!Context) { this.setStatus('Audio wird in diesem Browser nicht unterstützt.'); return; }
        const ctx = this.context = new Context();
        this.master = ctx.createGain(); this.effects = ctx.createGain(); this.combat = ctx.createGain();
        this.effects.connect(this.master); this.combat.connect(this.effects);
        // A safety ceiling for overlapping transient effects, not automatic loudness boosting.
        const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value=-6; compressor.ratio.value=8;
        this.master.connect(compressor); compressor.connect(ctx.destination);
      }
      if (this.context.state !== 'running') await this.context.resume();
      if (this.disposed || this.context.state !== 'running') return;
      if (!this.unlocked) {
        this.unlocked = true;
        // Small effects warm once; long music never enters an AudioBuffer.
        if (this.mix.effects > 0) for(const cue of Object.keys(CUES) as Cue[]) void this.load(cue);
      }
      this.setStatus(''); this.refresh();
    } catch { this.setStatus('Ton noch gesperrt. Tippe auf „Ton testen“.'); }
  }
  private setStatus(text:string): void { if(this.status) this.status.textContent=text; }
  private canPlay(): boolean { return this.unlocked && this.context?.state === 'running' && this.allowed && !document.hidden && !this.mix.muted && !this.disposed; }
  setState(allowed:boolean,running:boolean): void {
    if(this.allowed===allowed && this.running===running) return;
    this.allowed=allowed; this.running=running; this.refresh();
  }
  setTavern(open:boolean): void {
    const music = open?'tavern':'field'; if(this.music===music) return;
    this.music=music; this.refresh();
    if(open) this.play('craft');
  }
  setMix(mix:Partial<AudioMix>): void {
    this.mix=readMix({...this.mix,...mix});
    try { localStorage.setItem(MIX_KEY,JSON.stringify(this.mix)); } catch { /* Private browsing: keep session settings. */ }
    if(!this.mix.muted) void this.unlock();
    this.refresh();
  }
  private ramp(gain:GainNode,value:number,seconds=.12): void {
    const time=this.context!.currentTime;
    gain.gain.cancelScheduledValues(time); gain.gain.setValueAtTime(gain.gain.value,time);
    gain.gain.linearRampToValueAtTime(value,time+seconds);
  }
  private silence(): void {
    this.epoch++; clearTimeout(this.musicTimer);
    for(const voice of [...this.active]) this.stop(voice);
    for(const track of this.tracks.values()) { track.element.pause(); track.gain.gain.cancelScheduledValues(this.context!.currentTime); track.gain.gain.value=0; }
    if(this.master) { this.master.gain.cancelScheduledValues(this.context!.currentTime); this.master.gain.value=0; }
    this.limiter.reset();
  }
  private refresh(): void {
    if(!this.context) return;
    if(!this.canPlay()) { this.silence(); return; }
    this.ramp(this.master!,1); this.ramp(this.effects!,this.mix.effects);
    this.ramp(this.combat!,this.music==='tavern'?.12:1);
    if(!this.running || this.mix.effects===0) for(const voice of [...this.active]) if(voice.combat || this.mix.effects===0) this.stop(voice);
    this.refreshMusic();
  }
  private refreshMusic(): void {
    clearTimeout(this.musicTimer);
    if(this.mix.music===0) { for(const track of this.tracks.values()) { track.element.pause(); track.gain.gain.value=0; } return; }
    let track=this.tracks.get(this.music);
    if(!track) {
      const element=new Audio(); element.preload='none'; element.loop=true;
      element.src=url(this.music==='field'?'exploration.mp3':'inn-music.mp3');
      element.hidden=true; element.dataset.spireMusic=this.music; document.body.append(element);
      const gain=this.context!.createGain(); gain.gain.value=0;
      const source=this.context!.createMediaElementSource(element); source.connect(gain); gain.connect(this.master!);
      track={element,gain,source}; this.tracks.set(this.music,track);
      element.addEventListener('error',()=>this.setStatus('Ein Musikstück konnte nicht geladen werden. Effekte bleiben verfügbar.'),{signal:this.lifetime.signal});
    }
    // Inn Music measures ~6 dB louder than Exploration, so compensate before the user's slider.
    for(const [kind,t] of this.tracks) this.ramp(t.gain,kind===this.music?this.mix.music*(kind==='tavern'?.5:1):0,.75);
    if(track.element.paused) void track.element.play().catch(()=>this.setStatus('Musik noch gesperrt. Tippe auf „Ton testen“.'));
    this.musicTimer=window.setTimeout(()=>{ for(const [kind,t] of this.tracks) if(kind!==this.music) t.element.pause(); },800);
  }
  private load(cue:Cue): Promise<AudioBuffer|undefined> {
    let pending=this.buffers.get(cue);
    if(!pending) {
      pending=fetch(url(CUES[cue].file),{signal:this.lifetime.signal}).then(r=>{if(!r.ok)throw Error('Audio'); return r.arrayBuffer();})
        .then(data=>this.context!.decodeAudioData(data)).catch(()=>{ if(!this.disposed) this.setStatus('Ein Klang konnte nicht geladen werden. Das Spiel läuft weiter.'); return undefined; });
      this.buffers.set(cue,pending);
    }
    return pending;
  }
  play(cue:Cue): void { void this.start(cue); }
  private async start(cue:Cue): Promise<void> {
    const spec=CUES[cue];
    if(!this.canPlay() || this.mix.effects===0 || spec.combat && !this.running) return;
    const requested=performance.now(), epoch=this.epoch;
    const buffer=await this.load(cue);
    if(!buffer || epoch!==this.epoch || !this.canPlay() || this.mix.effects===0 || spec.combat && !this.running || performance.now()-requested>250) return;
    const fighting=[...this.active].filter(v=>v.combat).length;
    if(!this.limiter.allow(cue,performance.now(),fighting)) return;
    if(this.active.size>=6) {
      const victim=[...this.active].find(v=>v.combat) ?? (cue==='alarm'?[...this.active][0]:undefined);
      if(!victim) return; this.stop(victim);
    }
    const source=this.context!.createBufferSource(),gain=this.context!.createGain();
    source.buffer=buffer; gain.gain.value=spec.gain;
    source.connect(gain); gain.connect(spec.combat?this.combat!:this.effects!);
    const voice={source,gain,combat:spec.combat}; this.active.add(voice);
    source.onended=()=>{this.active.delete(voice);source.disconnect();gain.disconnect();};
    if(cue==='draw1'||cue==='draw2') {
      // Short final draw accent during the existing cooldown, not a delayed projectile.
      const length=Math.min(.18,buffer.duration),time=this.context!.currentTime;
      gain.gain.setValueAtTime(spec.gain,time); gain.gain.linearRampToValueAtTime(0,time+length);
      source.start(time,Math.max(0,buffer.duration-.25),length);
    } else source.start();
  }
  private stop(voice:Voice): void { voice.source.stop(); this.active.delete(voice); }
  accept(events:readonly BattleEvent[],b:IdleBattle): void {
    for(const cue of battleCues(events)) this.play(cue);
    for(const cue of this.observer.update(b,this.running)) this.play(cue);
  }
  bindControls(root:HTMLElement): void {
    this.status=root.querySelector<HTMLElement>('[data-audio-status]')!;
    const mute=root.querySelector<HTMLInputElement>('[data-audio-mute]')!; mute.checked=this.mix.muted;
    const signal=this.lifetime.signal;
    mute.addEventListener('change',()=>this.setMix({muted:mute.checked}),{signal});
    for(const key of ['music','effects','voices'] as const) {
      const input=root.querySelector<HTMLInputElement>(`[data-audio="${key}"]`)!;
      const output=root.querySelector<HTMLOutputElement>(`[data-volume="${key}"]`)!;
      input.value=String(Math.round(this.mix[key]*100)); output.value=`${input.value} %`;
      input.addEventListener('input',()=>{output.value=`${input.value} %`;this.setMix({[key]:Number(input.value)/100});},{signal});
    }
    root.querySelector('[data-audio-test]')!.addEventListener('click',()=>{
      void this.unlock().then(async()=>{ if(this.context) { await this.load('gift'); this.play('gift'); } });
    },{signal});
  }
  destroy(): void {
    this.disposed=true;this.silence();this.lifetime.abort();
    for(const track of this.tracks.values()){track.source.disconnect();track.gain.disconnect();track.element.removeAttribute('src');track.element.load();track.element.remove();}
    this.buffers.clear();void this.context?.close();
  }
}

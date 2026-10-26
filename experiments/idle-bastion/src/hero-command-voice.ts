import { nextVoiceIndex } from './companion-voice';
import { ILYRA_COMMAND_VOICE_GAINS, MARA_COMMAND_VOICE_GAINS } from './ilyra-voice-levels';

export type VoiceHero='mara'|'ilyra';
export type HeroVoiceCommand='select'|'move'|'cast';
const ilyraFiles=import.meta.glob('../assets/ilyra-voice/*.mp3',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const maraFiles=import.meta.glob('../assets/mara-command-voice/*.wav',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const ilyra=Object.entries(ILYRA_COMMAND_VOICE_GAINS).map(([file,gain])=>({file,gain,url:ilyraFiles[`../assets/ilyra-voice/${file}`]}));
const mara=Object.entries(MARA_COMMAND_VOICE_GAINS).map(([file,gain])=>({file,gain,url:maraFiles[`../assets/mara-command-voice/${file}`]}));
const greetings=ilyra.filter(clip=>!clip.file.includes('youremine'));
const orders=ilyra.filter(clip=>clip.file.includes('youremine'));

/** Manual orders only. One voice/cooldown shared by both heroes; no queue or map-start preloading. */
export class HeroCommandVoice {
  private readonly element=new Audio();
  private readonly source:MediaElementAudioSourceNode;
  private readonly gain:GainNode;
  private enabled=false;
  private volume=0;
  private previous:Record<VoiceHero,string>={mara:'',ilyra:''};
  private clipGain=1;
  private lastStart=-Infinity;
  private pending=false;
  constructor(context:AudioContext,output:AudioNode){
    this.gain=context.createGain();this.gain.connect(output);
    this.source=context.createMediaElementSource(this.element);this.source.connect(this.gain);
    this.element.preload='none';this.element.hidden=true;this.element.dataset.spireVoice='hero-command';document.body.append(this.element);
  }
  setState(enabled:boolean,volume:number):void {
    this.volume=volume;this.gain.gain.value=volume*.5*this.clipGain;
    if(this.enabled===enabled)return;
    this.enabled=enabled;
    if(!enabled){this.element.pause();this.element.removeAttribute('src');this.element.load();}
  }
  play(who:VoiceHero,command:HeroVoiceCommand):void {
    if(!this.enabled||this.pending||!this.element.paused||performance.now()-this.lastStart<7000)return;
    const pool=who==='mara'?mara:command==='cast'?orders:greetings;
    const clip=pool[nextVoiceIndex(pool.length,pool.findIndex(item=>item.file===this.previous[who]))];
    this.previous[who]=clip.file;this.clipGain=clip.gain;this.gain.gain.value=this.volume*.5*clip.gain;
    this.element.src=clip.url;this.element.dataset.hero=who;this.element.dataset.command=command;
    this.lastStart=performance.now();this.pending=true;
    void this.element.play().catch(()=>{ /* Audio failure never affects an accepted game command. */ }).finally(()=>{this.pending=false;});
  }
  destroy():void {this.setState(false,0);this.source.disconnect();this.gain.disconnect();this.element.remove();}
}

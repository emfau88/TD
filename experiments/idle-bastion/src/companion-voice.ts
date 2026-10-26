export type VoiceClip = { url:string; gain:number };

export function nextVoiceIndex(count:number,previous:number,random=Math.random):number {
  if(count<=1)return 0;
  const valid=previous>=0&&previous<count;
  const pick=Math.floor(random()*(count-(valid?1:0)));
  return valid&&pick>=previous?pick+1:pick;
}

/** One streamed line per companion; only the next clip is preloaded in their tavern view. */
export class CompanionVoice {
  private readonly element=new Audio();
  private readonly source:MediaElementAudioSourceNode;
  private readonly gain:GainNode;
  private enabled=false;
  private volume=0;
  private previous=-1;
  private queued=-1;
  private lastStart=-Infinity;
  private pending=false;
  constructor(context:AudioContext,output:AudioNode,who:'mara'|'ilyra',private readonly clips:readonly VoiceClip[]){
    this.gain=context.createGain();this.gain.connect(output);
    this.source=context.createMediaElementSource(this.element);this.source.connect(this.gain);
    this.element.preload='auto';this.element.hidden=true;this.element.dataset.spireVoice=who;document.body.append(this.element);
    this.element.onended=()=>{if(this.enabled)this.prepare();};
  }
  setState(enabled:boolean,volume:number):void {
    this.volume=volume;
    this.updateGain();
    if(this.enabled===enabled)return;
    this.enabled=enabled;
    if(enabled)this.prepare();
    else {this.element.pause();this.element.removeAttribute('src');this.element.load();this.queued=-1;}
  }
  private updateGain():void {
    this.gain.gain.value=this.volume*.7*(this.clips[this.queued]?.gain??1);
  }
  private prepare():void {
    this.queued=nextVoiceIndex(this.clips.length,this.previous);
    this.updateGain();
    this.element.src=this.clips[this.queued].url;this.element.load();
  }
  play():void {
    if(!this.enabled||this.pending||!this.element.paused||performance.now()-this.lastStart<2500)return;
    this.pending=true;this.lastStart=performance.now();this.previous=this.queued;
    void this.element.play().catch(()=>{ /* Missing/blocked voice never blocks a touch. */ }).finally(()=>{this.pending=false;});
  }
  destroy():void {
    this.setState(false,0);this.element.onended=null;this.source.disconnect();this.gain.disconnect();this.element.remove();
  }
}

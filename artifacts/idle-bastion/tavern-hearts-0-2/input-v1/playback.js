// Pure playback state. Reactions enter only through an exported neutral frame.
export class Playback {
  constructor(clips,heart=0){this.clips=clips;this.heart=heart;this.key='idle';this.frame=0;this.elapsed=0;this.loops=0;this.pending=null;this.started=null;}
  request(key,payload=null){
    if(!this.clips[key]||this.clips[key].minHeart>this.heart||this.pending||this.key!=='idle')return false;
    this.pending={key,payload};return true;
  }
  step(dt,ready){
    this.started=null;
    if(this.pending && this.key==='idle' && this.clips.idle.restFrames.includes(this.frame)){
      if(!ready(this.pending.key,0))return false;
      this.started=this.pending;this.key=this.pending.key;this.pending=null;this.frame=0;this.elapsed=0;this.loops=0;return true;
    }
    const clip=this.clips[this.key];
    this.elapsed+=Math.min(dt,.1);
    if(this.elapsed<1/clip.fps)return false;
    const next=this.frame+1;
    if(next<clip.count){
      if(!ready(this.key,next)){this.elapsed=0;return false;}
      this.frame=next;this.elapsed-=1/clip.fps;return true;
    }
    if(!ready('idle',0)){this.elapsed=0;return false;}
    if(this.key==='idle')this.loops++;else this.loops=0;
    this.key='idle';this.frame=0;this.elapsed=0;
    if(this.heart>=2 && this.loops>=3 && !this.pending)this.pending={key:'variant',payload:null};
    return true;
  }
}

// Return through existing idle frames: no image blending or new pose deformation.
export class Playback {
  constructor(clips,heart=0){this.clips=clips;this.heart=heart;this.key='idle';this.frame=0;this.elapsed=0;this.loops=0;this.pending=null;this.started=null;this.returnFrames=[];this.waiting=false;}
  request(key,payload=null){
    if(!this.clips[key]||key==='idle'||this.clips[key].minHeart>this.heart)return false;
    this.pending={key,payload};
    if(this.key==='idle'&&!this.returnFrames.length){
      const target=this.clips.idle.restFrames.reduce((a,b)=>Math.abs(b-this.frame)<Math.abs(a-this.frame)?b:a);
      const from=this.frame,steps=Math.min(8,Math.abs(target-from));
      for(let i=1;i<=steps;i++){
        const t=i/steps,ease=t*t*(3-2*t);
        this.returnFrames.push(Math.round(from+(target-from)*ease));
      }
      this.elapsed=0;
    }
    return true;
  }
  cancel(){this.pending=null;this.returnFrames=[];this.elapsed=0;}
  start(ready){
    if(!ready(this.pending.key,0)){this.waiting=true;return false;}
    this.started=this.pending;this.key=this.pending.key;this.pending=null;
    this.frame=0;this.elapsed=0;this.loops=0;this.returnFrames=[];return true;
  }
  step(dt,ready){
    this.started=null;this.waiting=false;
    if(this.pending&&this.key==='idle'){
      if(!this.returnFrames.length)return this.start(ready);
      const loaded=[ready(this.pending.key,0),...this.returnFrames.map(f=>ready('idle',f))];
      if(loaded.some(ok=>!ok)){this.waiting=true;return false;}
      this.elapsed+=Math.min(dt,.1);
      if(this.elapsed<1/30)return false;
      this.elapsed-=1/30;this.frame=this.returnFrames.shift();return true;
    }
    const clip=this.clips[this.key];
    this.elapsed+=Math.min(dt,.1);
    if(this.elapsed<1/clip.fps)return false;
    const next=this.frame+1;
    if(next<clip.count){
      if(!ready(this.key,next)){this.elapsed=0;this.waiting=true;return false;}
      this.frame=next;this.elapsed-=1/clip.fps;return true;
    }
    if(this.pending)return this.start(ready);
    if(!ready('idle',0)){this.elapsed=0;this.waiting=true;return false;}
    if(this.key==='idle')this.loops++;else this.loops=0;
    this.key='idle';this.frame=0;this.elapsed=0;
    if(this.heart>=2 && this.loops>=3 && !this.pending)this.pending={key:'variant',payload:null};
    return true;
  }
}

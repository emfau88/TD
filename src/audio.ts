export class AudioEngine {
  private context?: AudioContext; volume=.28; enabled=true; private last=0;
  unlock(){try{this.context??=new AudioContext();void this.context.resume().catch(()=>{});}catch{this.enabled=false;}}
  play(kind:'build'|'fire'|'kill'|'wave'|'victory'|'defeat'|'upgrade'){
    if(!this.enabled||!this.context||this.volume<=0)return;
    const ctx=this.context, time=ctx.currentTime;
    if(kind==='fire'&&time-this.last<.075)return;
    if(kind==='fire')this.last=time;
    const notes=kind==='victory'?[392,494,587,784]:kind==='defeat'?[294,247,196]:kind==='wave'?[220,330]:kind==='upgrade'?[440,660,880]:kind==='build'?[330,494]:kind==='kill'?[740]:[180];
    notes.forEach((frequency,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),t=time+i*.11,duration=kind==='fire'?.045:.16;osc.type=kind==='fire'?'triangle':'sine';osc.frequency.setValueAtTime(frequency,t);if(kind==='fire')osc.frequency.exponentialRampToValueAtTime(75,t+duration);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(this.volume*(kind==='fire'?.08:.22),t+.006);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+duration+.02);});
  }
}

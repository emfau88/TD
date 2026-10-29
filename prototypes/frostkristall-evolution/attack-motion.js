// Completed preview attack choreography, measured in native sprite pixels.
// The approved crystal images are never stretched, rotated or repainted.
export const ATTACK_PROFILES = Object.freeze({
  2: {name:'Eiskern',lift:2,recoil:2,spread:0,fxSize:42,light:.38,charge:.08},
  3: {name:'Frostprisma',lift:3,recoil:2,spread:0,fxSize:48,light:.43,charge:.07},
  5: {name:'Eisfassung',lift:2,recoil:3,spread:0,fxSize:54,light:.45,charge:.06},
  10:{name:'Froststahl',lift:3,recoil:3,spread:1,fxSize:58,light:.48,charge:.06},
  15:{name:'Eiswächter',lift:2,recoil:3,spread:2,fxSize:60,light:.50,charge:.05},
  20:{name:'Polarstern',lift:3,recoil:3,spread:2,fxSize:62,light:.52,charge:.05},
  25:{name:'Winterkrone',lift:3,recoil:3,spread:2,fxSize:64,light:.54,charge:.04},
});
export const RELEASE=.28,SETTLED=.86;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function attackPose(level,t){
 const p=ATTACK_PROFILES[level];
 const rest={y:0,spread:0,light:0,baseLight:0,fxFrame:-1,fxOpacity:0,fxSize:p?.fxSize??0,phase:'Ruhe'};
 if(!p)return {...rest,phase:t>=.12&&t<RELEASE?'Aufladen':t>=RELEASE&&t<.38?'Abschuss':t>=.38&&t<.77?'Rückkehr':'Ruhe'};
 if(t<p.charge||t>=SETTLED)return rest;
 if(t<RELEASE){
  const q=clamp((t-p.charge)/(RELEASE-p.charge)),power=ease(q);
  return {...rest,y:-Math.round(p.lift*power),spread:Math.round(p.spread*power),light:p.light*power*.7,baseLight:power*.25,fxFrame:Math.min(3,Math.floor(q*4)),fxOpacity:.35+q*.4,phase:'Aufladen'};
 }
 const age=t-RELEASE;
 if(age<.10){
  const q=ease(age/.10);
  return {...rest,y:Math.round(-p.lift+(p.lift+p.recoil)*q),spread:Math.round(p.spread*(1-q)),light:.08+(p.light-.08)*(1-q),baseLight:.04+.28*(1-q),fxFrame:4,fxOpacity:.85*(1-q*.25),phase:'Abschuss'};
 }
 const q=clamp((age-.10)/(.86-.38)),settle=1-ease(q);
 return {...rest,y:Math.round(p.recoil*settle),light:.08*settle,baseLight:.04*settle,fxFrame:age<.20?5:age<.30?6:age<.40?7:-1,fxOpacity:.65*settle,phase:'Rückkehr'};
}

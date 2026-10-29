/** Branch-only visual selection. Saved visualStage and all combat stats stay unchanged. */
export const SKIN_LEVELS = [1,2,3,5,10,15,20,25] as const;
export type SkinLevel = typeof SKIN_LEVELS[number];
export interface EvolutionSkin {kind:number;level:number;weaponY:number;originY:number;originalStage:number;base:string;weapon:string}
export const EVOLUTION_SKINS: readonly EvolutionSkin[] = [
  {"kind":1,"level":1,"weaponY":-14.81,"originY":0.8,"originalStage":1,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-1-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-1-weapon.png"},
  {"kind":1,"level":2,"weaponY":-13.55,"originY":0.8,"originalStage":2,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-2-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-2-weapon.png"},
  {"kind":1,"level":3,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":3,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-3-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-3-weapon.png"},
  {"kind":1,"level":5,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-5-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-5-weapon.png"},
  {"kind":1,"level":10,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-10-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-10-weapon.png"},
  {"kind":1,"level":15,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-15-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-15-weapon.png"},
  {"kind":1,"level":20,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-20-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-20-weapon.png"},
  {"kind":1,"level":25,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-25-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-25-weapon.png"},
  {"kind":2,"level":1,"weaponY":-16.9144,"originY":0.8666666666666667,"originalStage":1,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-1-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-1-crystal.png"},
  {"kind":2,"level":2,"weaponY":-10.6144,"originY":0.8666666666666667,"originalStage":2,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-2-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-2-crystal.png"},
  {"kind":2,"level":3,"weaponY":-9.354400000000002,"originY":0.8666666666666667,"originalStage":3,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-3-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-3-crystal.png"},
  {"kind":2,"level":5,"weaponY":-9.354400000000002,"originY":0.8666666666666667,"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-5-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-5-crystal.png"},
  {"kind":2,"level":10,"weaponY":-9.354400000000002,"originY":0.8666666666666667,"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-10-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-10-crystal.png"},
  {"kind":2,"level":15,"weaponY":-9.354400000000002,"originY":0.8666666666666667,"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-15-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-15-crystal.png"},
  {"kind":2,"level":20,"weaponY":-9.354400000000002,"originY":0.8666666666666667,"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-20-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-20-crystal.png"},
  {"kind":2,"level":25,"weaponY":-9.354400000000002,"originY":0.8666666666666667,"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-25-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-25-crystal.png"},
];
export function skinLevel(level:number):SkinLevel {
  return [...SKIN_LEVELS].reverse().find(tier=>level>=tier)??1;
}
export function evolutionSkin(kind:number,level:number):EvolutionSkin|undefined {
  return EVOLUTION_SKINS.find(r=>r.kind===kind&&r.level===skinLevel(level));
}
export const evolutionKey=(kind:number,level:number,role:string)=>'evolution-'+kind+'-'+skinLevel(level)+'-'+role;
/** Anticipate only an available target; release remains aligned to the real fire event. */
export function frostAnimationTime(sinceShot:number,cooldown:number,effectiveCycle:number,hasTarget:boolean):number {
  const recover=Math.min(.58,Math.max(.06,effectiveCycle*.62));
  if(sinceShot>=0&&sinceShot<recover)return .28+sinceShot/recover*.58;
  const charge=Math.min(.24,Math.max(.03,effectiveCycle*.22));
  if(hasTarget&&cooldown>0&&cooldown<charge)return .04+(1-cooldown/charge)*.24;
  return 0;
}
export function arrowCopies(level:number,progress:number):readonly {offset:number;progress:number;visible:boolean}[] {
  const skin=skinLevel(level);
  if(skin<10)return [{offset:0,progress,visible:true}];
  return [0,1,2].map(i=>{
    const delay=skin===10?0:skin===15?(i===2?.35:0):i*.20;
    const offset=skin===10?(i-1)*8:skin===15&&i<2?(i-.5)*8:0;
    return {offset,progress:Math.max(0,Math.min(1,(progress-delay)/(1-delay))),visible:progress>=delay};
  });
}
export const PREVIEW_DATABASE='spire-idle-bastion-tower-evolution';
export function towerPreviewDatabase(probe?:string|null):string {
  return probe&&/^[a-z0-9-]{1,60}$/.test(probe)?PREVIEW_DATABASE+'-'+probe:PREVIEW_DATABASE;
}

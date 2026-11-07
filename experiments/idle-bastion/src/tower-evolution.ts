/** Visual selection. Saved visualStage and all combat stats stay unchanged. */
export const SKIN_LEVELS = [1,2,3,5,10,15,20,25] as const;
export type SkinLevel = typeof SKIN_LEVELS[number];
export interface EvolutionSkin {kind:number;level:number;weaponY:number;originY:number;baseScaleY?:number;weaponScale?:number;originalStage:number;base:string;weapon:string}
// Original sniper bases share a roof centre at native row 65; preserve the ground anchor.
const ORIGINAL_SNIPER_MOUNT_Y = 13 + (65 - 102.4) * .63;
/** Restore the frost pedestal's height while retaining its width and exact footing.
 * The crystal mount follows the same vertical transform; crystal pixels stay unchanged.
 */
function frostBody(level:number,originalWeaponY:number):Pick<EvolutionSkin,'baseScaleY'|'originY'|'weaponY'> {
  const nativeHeight=level<=3?[72,71,78][level-1]:82;
  const targetHeight=level<=3?[85,88,92][level-1]:92;
  const ratio=targetHeight/nativeHeight,footY=13+(192-166.4)*.63;
  return {baseScaleY:.63*ratio,originY:1-(1-166.4/192)/ratio,weaponY:footY+(originalWeaponY-footY)*ratio};
}
export const EVOLUTION_SKINS: readonly EvolutionSkin[] = [
  {"kind":1,"level":1,"weaponY":-14.81,"originY":0.8,"originalStage":1,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-1-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-1-weapon.png"},
  {"kind":1,"level":2,"weaponY":-13.55,"originY":0.8,"originalStage":2,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-2-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-2-weapon.png"},
  {"kind":1,"level":3,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":3,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-3-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-3-weapon.png"},
  {"kind":1,"level":5,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-5-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-5-weapon.png"},
  {"kind":1,"level":10,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-10-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-10-weapon.png"},
  {"kind":1,"level":15,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-15-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-15-weapon.png"},
  {"kind":1,"level":20,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-20-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-20-weapon.png"},
  {"kind":1,"level":25,"weaponY":-7.879999999999999,"originY":0.8,"originalStage":0,"base":"../../../prototypes/waldwaechter-evolution/assets/compact/level-25-base.png","weapon":"../../../prototypes/waldwaechter-evolution/assets/compact/level-25-weapon.png"},
  {"kind":2,"level":1,...frostBody(1,-16.9144),"originalStage":1,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-1-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-1-crystal.png"},
  {"kind":2,"level":2,...frostBody(2,-10.6144),"originalStage":2,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-2-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-2-crystal.png"},
  {"kind":2,"level":3,...frostBody(3,-9.354400000000002),"originalStage":3,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-3-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-3-crystal.png"},
  {"kind":2,"level":5,...frostBody(5,-9.354400000000002),"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-5-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-5-crystal.png"},
  {"kind":2,"level":10,...frostBody(10,-9.354400000000002),"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-10-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-10-crystal.png"},
  {"kind":2,"level":15,...frostBody(15,-9.354400000000002),"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-15-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-15-crystal.png"},
  {"kind":2,"level":20,...frostBody(20,-9.354400000000002),"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-20-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-20-crystal.png"},
  {"kind":2,"level":25,...frostBody(25,-9.354400000000002),"originalStage":0,"base":"../../../prototypes/frostkristall-evolution/assets/compact/level-25-base.png","weapon":"../../../prototypes/frostkristall-evolution/assets/compact/level-25-crystal.png"},
  {"kind":3,"level":1,"weaponY":-17.33,"originY":0.8,"originalStage":1,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-1-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-1-weapon.png"},
  {"kind":3,"level":2,"weaponY":-6.620000000000001,"originY":0.8,"originalStage":2,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-2-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-2-weapon.png"},
  {"kind":3,"level":3,"weaponY":-0.9499999999999993,"originY":0.8,"originalStage":3,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-3-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-3-weapon.png"},
  {"kind":3,"level":5,"weaponY":-4.892000000000003,"originY":0.8,"originalStage":0,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-5-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-5-weapon.png"},
  {"kind":3,"level":10,"weaponY":-4.892000000000003,"originY":0.8,"originalStage":0,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-10-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-10-weapon.png"},
  {"kind":3,"level":15,"weaponY":-4.892000000000003,"originY":0.8,"originalStage":0,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-15-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-15-weapon.png"},
  {"kind":3,"level":20,"weaponY":-4.892000000000003,"originY":0.8,"originalStage":0,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-20-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-20-weapon.png"},
  {"kind":3,"level":25,"weaponY":-4.892000000000003,"originY":0.8,"originalStage":0,"base":"../../../prototypes/steinschleuder-evolution/assets/compact/level-25-base.png","weapon":"../../../prototypes/steinschleuder-evolution/assets/compact/level-25-weapon.png"},
  {"kind":4,"level":1,"weaponY":ORIGINAL_SNIPER_MOUNT_Y,"originY":0.8,"weaponScale":0.53,"originalStage":1,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-1-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-1-weapon.png"},
  {"kind":4,"level":2,"weaponY":ORIGINAL_SNIPER_MOUNT_Y,"originY":0.8,"weaponScale":0.53,"originalStage":2,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-2-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-2-weapon.png"},
  {"kind":4,"level":3,"weaponY":ORIGINAL_SNIPER_MOUNT_Y,"originY":0.8,"weaponScale":0.53,"originalStage":3,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-3-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-3-weapon.png"},
  {"kind":4,"level":5,"weaponY":-4.892000000000003,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-5-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-5-weapon.png"},
  {"kind":4,"level":10,"weaponY":-4.892000000000003,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-10-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-10-weapon.png"},
  {"kind":4,"level":15,"weaponY":-4.892000000000003,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-15-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-15-weapon.png"},
  {"kind":4,"level":20,"weaponY":-4.892000000000003,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-20-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-20-weapon.png"},
  {"kind":4,"level":25,"weaponY":-4.892000000000003,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-25-base.png","weapon":"../../../prototypes/scharfschuetze-evolution/assets/compact/level-25-weapon.png"},
  {"kind":5,"level":1,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":1,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-1-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-1-weapon.png"},
  {"kind":5,"level":2,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":2,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-2-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-2-weapon.png"},
  {"kind":5,"level":3,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":3,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-3-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-3-weapon.png"},
  {"kind":5,"level":5,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-5-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-5-weapon.png"},
  {"kind":5,"level":10,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-10-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-10-weapon.png"},
  {"kind":5,"level":15,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-15-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-15-weapon.png"},
  {"kind":5,"level":20,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-20-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-20-weapon.png"},
  {"kind":5,"level":25,"weaponY":-14,"originY":0.8,"weaponScale":0.63,"originalStage":0,"base":"../../../prototypes/sturmlicht-evolution/assets/compact/level-25-base.png","weapon":"../../../prototypes/sturmlicht-evolution/assets/compact/level-25-weapon.png"},
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

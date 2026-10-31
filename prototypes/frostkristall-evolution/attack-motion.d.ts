export interface AttackPose {y:number;spread:number;light:number;baseLight:number;fxFrame:number;fxOpacity:number;fxSize:number;phase:string}
export const ATTACK_PROFILES:Readonly<Record<number,{name:string;lift:number;recoil:number;spread:number;fxSize:number;light:number;charge:number}>>;
export const RELEASE:number,SETTLED:number;
export function attackPose(level:number,t:number):AttackPose;

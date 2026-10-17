import type { EnemyDef } from './data';

// A regional specialist; the eight historical reference enemies stay unchanged.
export const ROSENSPIEGEL:EnemyDef={id:'Succubus Pixel v2',name:'Rosenspiegel',hp:140,speed:42,gold:30,flying:false,armor:.1,lives:2,charmer:true};
export const SUCCUBUS_CHARM={range:200,windup:.8,channel:4.5,cooldown:11,recovery:6,rateMultiplier:.6} as const;

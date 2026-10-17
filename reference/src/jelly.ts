import type { EnemyDef } from './data';

// The regional addition stays separate from the eight historical reference enemies.
export const LANTERN_JELLY:EnemyDef={id:'Lantern Jelly Pixel v1',name:'Laternenqualle',hp:85,speed:43,gold:20,flying:true,armor:0,lives:1,healer:true};
export const JELLY_HEAL={range:100,amount:6,maxTargets:2,interval:2,castDuration:.4,pulseAt:.2} as const;

import { ENEMIES, type EnemyDef } from './data';
import { LANTERN_JELLY } from './jelly';
import type { RegionID } from './regions';

// Short regional encounters: introduce all eight roles, then combine them.
const PLAN:ReadonlyArray<ReadonlyArray<readonly [string,number]>>=[
  [['Leafbug',8]],
  [['Leafbug',8],['Firebug',3]],
  [['Leafbug',7],['Flying Locust',4]],
  [['Firebug',5],['Scorpion',3],['Flying Locust',4]],
  [['Leafbug',6],['Firebug',4],['Firewasp',3]],
  [['Firebug',5],['Scorpion',3],['Magma Crab',3],['Flying Locust',3]],
  [['Firebug',4],['Firewasp',4],['Clampbeetle',3],['Leafbug',3]],
  [['Scorpion',4],['Magma Crab',3],['Voidbutterfly',4],['Flying Locust',4]],
  [['Firebug',4],['Scorpion',3],['Clampbeetle',3],['Voidbutterfly',4],['Firewasp',3]],
  [['Scorpion',4],['Magma Crab',4],['Clampbeetle',4],['Voidbutterfly',4]],
];
export const REGION_WAVE_COUNT=PLAN.length;
export function regionWaveComposition(wave:number,region:RegionID='old-grove'):{type:EnemyDef;boss:boolean}[]{
  const plan=PLAN[wave-1];if(!plan)throw new RangeError(`Unknown region wave: ${wave}`);
  const groups=plan.map(([id,count])=>({type:ENEMIES.find(enemy=>enemy.id===id)!,count}));
  const result:{type:EnemyDef;boss:boolean}[]=[];
  for(let round=0;groups.some(group=>group.count>round);round++)for(const group of groups)if(group.count>round)result.push({type:group.type,boss:false});
  // A small first encounter, then two later mixed groups. Existing map plans keep their original composition.
  if(region==='lantern-marsh'){
    const count=wave===4?1:wave===7||wave===9?2:0;
    for(let index=0;index<count;index++)result.splice(3+index*6,0,{type:LANTERN_JELLY,boss:false});
  }
  if(wave===5||wave===REGION_WAVE_COUNT)result.push({type:ENEMIES.find(enemy=>enemy.id===(wave===5?'Scorpion':'Magma Crab'))!,boss:true});
  return result;
}

import { IdleBattle, SETTLEMENT, upgradeCost, type TowerId } from '../../src/battle';
import { certifyFarm, defenseFingerprint, type FarmCertificate } from '../../src/farming';
export type Purchase = { type: 'build'; pad: string; kind: TowerId } | { type: 'upgrade'; uid: number } | { type: 'workshop' | 'research' | 'warehouse' | 'workshop2' | 'clearing' | 'advance' };
export type Approach = 'guided' | 'alternative' | 'watch';
export function nextPurchase(b: IdleBattle, approach: Approach = 'guided'): Purchase | undefined {
  if (b.phase === 'defeat' || approach === 'watch' && b.elapsed < 180) return;
  const archerPad = approach === 'alternative' ? 'cell-7-6' : 'tower-03';
  const build=(pad:string,kind:TowerId):Purchase|undefined=>b.canBuild(pad,kind)?{type:'build',pad,kind}:undefined;
  const up=(uid:number):Purchase|undefined=>{const t=b.towers.find(t=>t.uid===uid)!;return b.gold>=upgradeCost(t)&&t.level<b.maxLevel?{type:'upgrade',uid}:undefined;};
  const archer=b.towers.find(t=>t.padId===archerPad);
  if(!archer)return build(archerPad,1);
  if(archer.level<2)return up(archer.uid);
  if(approach==='alternative' && !b.towers.some(t=>t.padId==='cell-10-3'))return build('cell-10-3',1);
  if(!b.settlement.workshopBuilt)return b.gold>=SETTLEMENT.workshopCost?{type:'workshop'}:undefined;
  if(!b.settlement.frostResearched)return b.gold>=60?{type:'research'}:undefined;
  if(!b.towers.some(t=>t.def.id===2))return build('tower-02',2);
  if(!b.towers.some(t=>t.def.id===3))return build('tower-09',3);
  const early=b.towers.find(t=>t.level<(t.def.id===2?2:3));
  if(early)return up(early.uid);
  if(!b.settlement.warehouseBuilt)return b.warehouseUnlocked&&b.gold>=650?{type:'warehouse'}:undefined;
  if(!b.towers.some(t=>t.def.id===4))return build('cell-14-7',4);
  const preBoss=[...b.towers].sort((a,z)=>z.def.id-a.def.id).find(t=>t.level<(t.def.id===2?2:4));
  if(preBoss)return up(preBoss.uid);
  if(b.bossVictories&&!b.clearing.unlocked)return b.gold>=900?{type:'clearing'}:undefined;
  if(b.bossVictories&&!b.settlement.workshopUpgraded)return b.gold>=1200?{type:'workshop2'}:undefined;
  const main=b.towers.find(t=>t.def.id===3);
  if(b.settlement.workshopUpgraded && main && main.level<7)return up(main.uid);
  const next=[...b.towers].filter(t=>t.level<(t.def.id===2?3:10)).sort((a,z)=>upgradeCost(a)-upgradeCost(z))[0];
  return next?up(next.uid):undefined;
}
export function purchase(b: IdleBattle, a: Purchase): boolean {
  switch(a.type){case 'build':return !!b.build(a.pad,a.kind);case 'upgrade':return b.upgrade(a.uid);case 'workshop':return b.buildWorkshop();case 'research':return b.researchFrost();case 'warehouse':return b.buildWarehouse();case 'workshop2':return b.upgradeWorkshop();case 'clearing':return b.unlockClearing();case 'advance':return b.requestAdvance();}
}
export function runBalance(approach:Approach='guided',seconds=900){
 const b=new IdleBattle(),log:unknown[]=[],times:Record<string,number>={}, losses:unknown[]=[];let proof:FarmCertificate|undefined,key='',lastInvestment=-1,retriedInvestment=-1;
 for(let t=0;t<seconds;t++){
  const a=nextPurchase(b,approach);if(a&&purchase(b,a)){log.push({at:b.elapsed,...a,gold:b.gold});lastInvestment=t;}
  const k=defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');if(k!==key){proof=certifyFarm(b,proof);b.setFarmWave(proof?.wave??1);key=k;}
  if(b.mode==='farm'&&lastInvestment>retriedInvestment){b.requestAdvance();retriedInvestment=lastInvestment;}
  b.update(1);
  for(const e of b.drainEvents()){
   if(['workshop','research','wisp','warehouse','boss-victory','clearing','workshop-upgrade'].includes(e.type)&&!times[e.type])times[e.type]=b.elapsed;
   if(e.type==='defeat')losses.push({at:b.elapsed,wave:e.wave});
  }
 }
 return {b,proof,report:{approach,times,losses,record:b.highestCleared,mode:b.mode,farm:b.farmWave,gold:b.gold,levels:b.towers.map(t=>({pad:t.padId,kind:t.def.id,level:t.level,kills:t.kills})),log}};
}

import { Simulation } from './simulation';
import { CELL, COLS, ROWS, center, pathCells, waterCells, type Point, type Priority } from './data';
import { previewPath } from './style-navigation';
import { getRegion, isRegionID, type RegionID } from './regions';
import { REGION_WAVE_COUNT, regionWaveComposition } from './region-waves';

export type CompanionID='wisp'|'mara';
export type CompanionOrder={kind:'move'|'distract';col:number;row:number}|{kind:'overclock';tower:number};
export type Companion=Point & {id:CompanionID;direction:'up'|'down'|'left'|'right';path:Point[];order?:CompanionOrder;cooldown:number;action:number;pose:number};
export type WoodlandSnapshot={version:2;map:RegionID;gold:number;lives:number;wave:number;kills:number;earned:number;elapsed:number;
  towers:{id:number;col:number;row:number;level:number;priority:Priority;kills:number}[];
  heroes:{id:CompanionID;x:number;y:number;cooldown:number}[]};
const cell=(point:Point):[number,number]=>[Math.floor(point.x/CELL),Math.floor(point.y/CELL)];
export class WoodlandSimulation extends Simulation {
  override get waveLimit(){return REGION_WAVE_COUNT;}
  override compositionForWave(wave:number){return regionWaveComposition(wave);}
  heroes:Companion[]=[];
  boosts=new Map<number,number>();
  distractions:(Point & {remaining:number})[]=[];
  abilityMessages:string[]=[];
  readonly region;
  private water:Set<string>;
  constructor(key:RegionID='old-grove'){
    super(0);this.region=getRegion(key);this.map=this.region.map;this.gold=this.map.gold;
    this.water=waterCells(this.map);this.obstacles=new Set(this.region.obstacles);
    this.blocked=new Set([...this.map.paths.flatMap(p=>[...pathCells(p)]),...this.water,...this.region.bridgeCells]);
    this.heroes=(['wisp','mara'] as const).map((id,index)=>({...center(this.region.heroes[index]),id,direction:'down',path:[],cooldown:0,action:0,pose:0}));
  }
  override canBuild(col:number,row:number){return super.canBuild(col,row)&&!this.heroes.some(hero=>cell(hero)[0]===col&&cell(hero)[1]===row);}
  canWalk(col:number,row:number){return Number.isInteger(col)&&Number.isInteger(row)&&col>=1&&col<COLS-1&&row>=1&&row<ROWS-1&&(!this.water.has(`${col},${row}`)||this.region.bridgeCells.has(`${col},${row}`))&&!this.obstacles.has(`${col},${row}`)&&!this.towers.some(t=>t.col===col&&t.row===row);}
  private route(hero:Companion,order:CompanionOrder){
    const tower=order.kind==='overclock'?this.towers.find(t=>t.uid===order.tower):undefined;
    if(order.kind==='overclock'&&!tower)return;
    const destinations:[number,number][]=tower?[[tower.col-1,tower.row],[tower.col+1,tower.row],[tower.col,tower.row-1],[tower.col,tower.row+1]]:
      order.kind!=='overclock'?[[order.col,order.row]]:[];
    return destinations.map(end=>previewPath(cell(hero),end,(c,r)=>this.canWalk(c,r))).filter((path):path is Point[]=>!!path).sort((a,b)=>a.length-b.length)[0];
  }
  command(id:CompanionID,order:CompanionOrder){
    const hero=this.heroes.find(h=>h.id===id);
    if(!hero||this.phase==='defeat'||this.phase==='victory')return false;
    if(order.kind!=='move'&&(this.phase!=='wave'||hero.cooldown>0))return false;
    if((order.kind==='overclock'&&id!=='mara')||(order.kind==='distract'&&id!=='wisp'))return false;
    const path=this.route(hero,order);if(!path)return false;
    hero.path=path;hero.order=order;hero.action=0;hero.pose=0;return true;
  }
  private updateHeroes(dt:number){
    for(const hero of this.heroes){
      hero.cooldown=Math.max(0,hero.cooldown-dt);hero.pose=Math.max(0,hero.pose-dt);
      if(!hero.order)continue;
      const order=hero.order;
      if((order.kind!=='move'&&this.phase!=='wave')||(order.kind==='overclock'&&!this.towers.some(t=>t.uid===order.tower))){hero.order=undefined;hero.path=[];hero.action=0;continue;}
      if(hero.path.some(point=>!this.canWalk(...cell(point)))){
        const route=this.route(hero,hero.order);if(!route){hero.order=undefined;hero.path=[];hero.action=0;this.abilityMessages.push('Der Weg ist versperrt. Wähle ein neues Ziel.');continue;}hero.path=route;
      }
      let travel=dt*(hero.id==='wisp'?90:80);
      while(travel>0&&hero.path.length){
        const next=hero.path[0],dx=next.x-hero.x,dy=next.y-hero.y,distance=Math.hypot(dx,dy),step=Math.min(travel,distance);
        if(distance>.001){hero.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';hero.x+=dx/distance*step;hero.y+=dy/distance*step;}
        travel-=step;if(distance<=step+.001)hero.path.shift();
      }
      if(hero.path.length)continue;
      if(order.kind==='move'){hero.order=undefined;continue;}
      if(order.kind==='overclock'){
        const tower=this.towers.find(t=>t.uid===order.tower)!;const dx=tower.x-hero.x,dy=tower.y-hero.y;
        hero.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
      }
      hero.action+=dt;if(hero.action<.65)continue;
      if(order.kind==='overclock'){
        const tower=this.towers.find(t=>t.uid===order.tower)!;
        this.boosts.set(tower.uid,8);hero.cooldown=30;this.abilityMessages.push('Mara: Turm für 8 Sekunden übertaktet.');
      }else{this.distractions.push({...center([order.col,order.row]),remaining:5});hero.cooldown=22;this.abilityMessages.push('Wisp lenkt die nahen Bodengegner ab.');}
      hero.pose=.7;hero.action=0;hero.order=undefined;
    }
  }
  override update(dt:number){
    if(!Number.isFinite(dt)||dt<=0||this.phase==='defeat'||this.phase==='victory')return;
    const steps=Math.ceil(dt/.025),step=dt/steps;
    for(let i=0;i<steps;i++){
      if(!['build','wave'].includes(this.phase))break;
      this.updateHeroes(step);
      if(this.phase==='wave'){
        for(const [id,remaining]of this.boosts){const tower=this.towers.find(t=>t.uid===id);if(tower)tower.cooldown-=Math.min(step,remaining)*.5;if(remaining<=step||!tower)this.boosts.delete(id);else this.boosts.set(id,remaining-step);}
        for(const field of this.distractions){for(const enemy of this.enemies)if(!enemy.def.flying&&Math.hypot(enemy.x-field.x,enemy.y-field.y)<=110){enemy.slow=Math.max(enemy.slowTime>0?enemy.slow:0,.45);enemy.slowTime=Math.max(enemy.slowTime,Math.min(step,field.remaining));}field.remaining-=step;}
        this.distractions=this.distractions.filter(field=>field.remaining>0);
      }
      super.update(step);
      if(this.phase!=='wave'){this.boosts.clear();this.distractions=[];}
    }
  }
  snapshot():WoodlandSnapshot|undefined{
    if(this.phase!=='build')return;
    return {version:2,map:this.region.key,gold:this.gold,lives:this.lives,wave:this.wave,kills:this.kills,earned:this.earned,elapsed:this.elapsed,
      towers:this.towers.map(t=>({id:t.def.id,col:t.col,row:t.row,level:t.level,priority:t.priority,kills:t.kills})),
      heroes:this.heroes.map(h=>({id:h.id,x:h.x,y:h.y,cooldown:h.cooldown}))};
  }
  static restore(value:unknown):WoodlandSimulation|undefined{
    if(!value||typeof value!=='object')return;
    const saved=value as Omit<WoodlandSnapshot,'version'>&{version:number};
    if(![1,2].includes(saved.version)||!isRegionID(saved.map)||![saved.gold,saved.lives,saved.wave,saved.kills,saved.earned].every(n=>Number.isSafeInteger(n)&&n>=0)||saved.lives<1||saved.lives>20||saved.wave>=(saved.version===1?20:REGION_WAVE_COUNT)||!Number.isFinite(saved.elapsed)||saved.elapsed<0||!Array.isArray(saved.towers)||saved.towers.length>200||!Array.isArray(saved.heroes)||saved.heroes.length!==2)return;
    const sim=new WoodlandSimulation(saved.map);sim.heroes=[];sim.gold=Number.MAX_SAFE_INTEGER;
    for(const entry of saved.towers){
      if(!entry||![1,2,3].includes(entry.level)||!['first','strong','near','last'].includes(entry.priority)||!Number.isSafeInteger(entry.kills)||entry.kills<0)return;
      const tower=sim.build(entry.id,entry.col,entry.row);if(!tower)return;
      while(tower.level<entry.level)sim.upgrade(tower.uid);
      tower.priority=entry.priority;tower.kills=entry.kills;
    }
    const seen=new Set<string>();
    for(const stored of saved.heroes){
      if(!stored||!['wisp','mara'].includes(stored.id)||seen.has(stored.id)||![stored.x,stored.y,stored.cooldown].every(Number.isFinite)||stored.cooldown<0||stored.cooldown>(stored.id==='mara'?30:22)||!sim.canWalk(...cell(stored)))return;
      seen.add(stored.id);sim.heroes.push({...stored,direction:'down',path:[],action:0,pose:0});
    }
    // Late checkpoints from the former 20-wave format retain their defense and
    // resume before the new finale, instead of becoming unusable or auto-winning.
    sim.gold=saved.gold;sim.lives=saved.lives;sim.wave=Math.min(saved.wave,REGION_WAVE_COUNT-1);sim.kills=saved.kills;sim.earned=saved.earned;sim.elapsed=saved.elapsed;sim.events=[];
    return sim;
  }
}

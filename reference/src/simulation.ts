import { CELL,COLS,ROWS,MAPS,TOWERS,center,pathCells,pathPoints,waterCells,waveComposition, type EnemyDef,type Point,type Priority,type TowerDef } from './data';
import { JELLY_HEAL } from './jelly';
import { SUCCUBUS_CHARM } from './succubus';

export type Tower = Point & { uid: number; def: TowerDef; col: number; row: number; level: number; cooldown: number; spent: number; priority: Priority; kills: number; angle: number; charmRecoveryUntil?:number; };
export type HealAction={startedAt:number;direction:'up'|'down'|'side';flip:boolean;pulsed:boolean};
export type CharmAction={startedAt:number;targetUid:number;direction:'up'|'down'|'side';flip:boolean;active:boolean};
export type CharmEndReason='complete'|'kill'|'escape'|'range'|'sold'|'wave-end';
export type Enemy = Point & { uid: number; def: EnemyDef; hp: number; maxHp: number; distance: number; total: number; path: Point[]; segment: number; speed: number; slow: number; slowTime: number; burn: number; burnTime: number; burnOwner?: number; burnSource?: Tower; boss: boolean; direction: 'up'|'down'|'side'; flip: boolean; healAction?:HealAction;nextHealAt?:number;lastHealedAt?:number;charmAction?:CharmAction;nextCharmAt?:number; };
export type Shot = Point & { uid: number; tower: Tower; target: number; speed: number; damage: number; level: number; };
export type Event = { type: 'build'|'upgrade'|'sell'|'fire'|'hit'|'kill'|'escape'|'wave'|'clear'|'victory'|'defeat'|'heal-start'|'heal'|'charm-start'|'charm'|'charm-end'; x?: number; y?: number; tower?: Tower; enemy?: Enemy; shot?: Shot; amount?: number; links?: Point[]; healedTargets?:{enemy:Enemy;amount:number}[]; reason?:CharmEndReason; };
export type Phase = 'build'|'wave'|'victory'|'defeat';
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const stats=(tower: Tower)=>({damage:tower.def.damage*[1,1.75,2.8][tower.level-1],range:tower.def.range+(tower.level-1)*15,cooldown:tower.def.cooldown/Math.pow(1.13,tower.level-1)});
export const upgradeCost=(tower:Tower)=>Math.round(tower.def.cost*(tower.level===1?.85:1.25));
export const sellValue=(tower:Tower)=>Math.round(tower.spent*.7);

export class Simulation {
  get waveLimit():number{return 20;}
  compositionForWave(wave:number){return waveComposition(wave);}
  map: typeof MAPS[number]; gold: number; lives=20; wave=0; phase:Phase='build'; elapsed=0;
  towers:Tower[]=[]; enemies:Enemy[]=[]; shots:Shot[]=[]; events:Event[]=[];
  kills=0; earned=0; waveBonus=0; obstacles=new Set<string>(); blocked:Set<string>;
  private uid=1; private queue: ReturnType<typeof waveComposition>=[]; private spawnTimer=0; private spawned=0;
  constructor(mapId:number) {
    this.map=MAPS[mapId] ?? MAPS[0]; this.gold=this.map.gold;
    this.blocked=new Set([...this.map.paths.flatMap(p=>[...pathCells(p)]),...waterCells(this.map)]);
  }
  canBuild(col:number,row:number):boolean {
    return Number.isInteger(col) && Number.isInteger(row) && col>=1 && col<COLS-1 && row>=1 && row<ROWS-1 && !this.blocked.has(`${col},${row}`) && !this.obstacles.has(`${col},${row}`) && !this.towers.some(t=>t.col===col&&t.row===row) && this.phase!=='defeat' && this.phase!=='victory';
  }
  build(id:number,col:number,row:number):Tower|undefined {
    const def=TOWERS.find(t=>t.id===id);
    if(!def||!this.canBuild(col,row)||this.gold<def.cost)return;
    const tower:Tower={...center([col,row]),uid:this.uid++,def,col,row,level:1,cooldown:0,spent:def.cost,priority:'first',kills:0,angle:0};
    this.gold-=def.cost;this.towers.push(tower);this.events.push({type:'build',tower,x:tower.x,y:tower.y});return tower;
  }
  upgrade(uid:number):boolean {
    const tower=this.towers.find(t=>t.uid===uid);
    if(!tower||tower.level>=3||this.gold<upgradeCost(tower)||this.phase==='defeat'||this.phase==='victory')return false;
    const cost=upgradeCost(tower); this.gold-=cost;tower.spent+=cost;tower.level++;this.events.push({type:'upgrade',tower,x:tower.x,y:tower.y});return true;
  }
  sell(uid:number):boolean {
    const tower=this.towers.find(t=>t.uid===uid);
    if(!tower||this.phase==='defeat'||this.phase==='victory')return false;
    for(const enemy of this.enemies)if(enemy.charmAction?.targetUid===uid)this.endCharm(enemy,'sold');
    this.gold+=sellValue(tower);this.towers=this.towers.filter(t=>t.uid!==uid);this.events.push({type:'sell',tower,x:tower.x,y:tower.y});return true;
  }
  startWave():boolean {
    if(this.phase!=='build'||this.wave>=this.waveLimit)return false;
    this.wave++;this.phase='wave';this.queue=this.compositionForWave(this.wave);this.spawnTimer=.6;this.spawned=0;this.events.push({type:'wave'});return true;
  }
  private spawn(def:EnemyDef,boss:boolean) {
    const nodes=def.flying?this.map.air:this.map.paths[this.spawned%this.map.paths.length];
    const path=pathPoints(nodes), hp=def.hp*Math.pow(1.095,this.wave-1)*(boss?3.2:1)*(1+this.map.id*.06);
    const total=path.slice(1).reduce((sum,p,i)=>sum+distance(path[i],p),0);
    this.enemies.push({uid:this.uid++,def,...path[0],hp,maxHp:hp,path,total,distance:0,segment:0,speed:def.speed*(boss?.78:1),slow:0,slowTime:0,burn:0,burnTime:0,boss,direction:'side',flip:false,...(def.healer?{nextHealAt:this.elapsed+JELLY_HEAL.interval}:{})});
    this.spawned++;
  }
  private hurt(enemy:Enemy,damage:number,tower:Tower) {
    if(enemy.hp<=0)return;
    enemy.hp-=damage*(tower.def.pierce?1:1-enemy.def.armor);
    if(enemy.hp<=0){this.endCharm(enemy,'kill');const reward=Math.round(enemy.def.gold*(enemy.boss?3:1));this.gold+=reward;this.earned+=reward;this.kills++;tower.kills++;this.events.push({type:'kill',enemy,x:enemy.x,y:enemy.y,amount:reward});}
  }
  private impact(shot:Shot,target:Enemy) {
    const def=shot.tower.def;
    const victims=def.splash?this.enemies.filter(e=>e.hp>0&&(!e.def.flying||def.targets==='all')&&distance(e,target)<=def.splash!):[target];
    for(const enemy of victims){
      this.hurt(enemy,shot.damage,shot.tower);
      if(enemy.hp<=0)continue;
      if(def.slow){enemy.slow=Math.max(enemy.slowTime>0?enemy.slow:0,def.slow);enemy.slowTime=2.3;}
      if(def.burn){
        const burn=def.burn*shot.level;
        if(enemy.burnTime<=0||burn>=enemy.burn){enemy.burn=burn;enemy.burnOwner=shot.tower.uid;enemy.burnSource=shot.tower;}
        enemy.burnTime=3;
      }
    }
    const links:Point[]=[{x:target.x,y:target.y}];
    if(def.chain){let previous=target;const used=new Set([target.uid]);for(let i=1;i<def.chain;i++){const next=this.enemies.filter(e=>e.hp>0&&!used.has(e.uid)&&(def.targets==='all'||!e.def.flying)&&distance(e,previous)<100).sort((a,b)=>distance(a,previous)-distance(b,previous))[0];if(!next)break;this.hurt(next,shot.damage*Math.pow(.8,i),shot.tower);used.add(next.uid);links.push({x:next.x,y:next.y});previous=next;}}
    this.events.push({type:'hit',shot,x:target.x,y:target.y,links});
  }
  update(dt:number) {
    if(this.phase!=='wave'){this.clearCharms();return;}
    if(!Number.isFinite(dt)||dt<=0)return;
    const steps=Math.ceil(dt/.025), step=dt/steps;
    for(let index=0;index<steps&&this.phase==='wave';index++)this.tick(step);
  }
  protected fireRateMultiplier(tower:Tower,dt:number):number {
    return this.enemies.some(enemy=>enemy.hp>0&&enemy.charmAction?.active&&enemy.charmAction.targetUid===tower.uid)?SUCCUBUS_CHARM.rateMultiplier:1;
  }
  private endCharm(enemy:Enemy,reason:CharmEndReason){
    const action=enemy.charmAction;if(!action)return;
    const tower=this.towers.find(candidate=>candidate.uid===action.targetUid);
    if(tower)tower.charmRecoveryUntil=this.elapsed+SUCCUBUS_CHARM.recovery;
    enemy.charmAction=undefined;
    this.events.push({type:'charm-end',enemy,tower,x:enemy.x,y:enemy.y,reason});
  }
  private clearCharms(){for(const enemy of this.enemies)this.endCharm(enemy,'wave-end');}
  private updateCharms(){
    for(const enemy of this.enemies){
      if(!enemy.def.charmer)continue;
      if(enemy.hp<=0){this.endCharm(enemy,'kill');continue;}
      const action=enemy.charmAction;
      if(action){
        const tower=this.towers.find(candidate=>candidate.uid===action.targetUid);
        if(!tower){this.endCharm(enemy,'sold');continue;}
        if(distance(enemy,tower)>SUCCUBUS_CHARM.range){this.endCharm(enemy,'range');continue;}
        const age=this.elapsed-action.startedAt;
        if(age>=SUCCUBUS_CHARM.windup+SUCCUBUS_CHARM.channel-1e-9){this.endCharm(enemy,'complete');continue;}
        if(!action.active&&age>=SUCCUBUS_CHARM.windup-1e-9){action.active=true;this.events.push({type:'charm',enemy,tower,x:enemy.x,y:enemy.y});}
        continue;
      }
      if(this.elapsed<(enemy.nextCharmAt??0)-1e-9)continue;
      const target=this.towers.filter(tower=>distance(enemy,tower)<=SUCCUBUS_CHARM.range&&this.elapsed>=(tower.charmRecoveryUntil??0)-1e-9&&!this.enemies.some(other=>other!==enemy&&other.charmAction?.targetUid===tower.uid))
        .sort((a,b)=>distance(enemy,a)-distance(enemy,b)||a.uid-b.uid)[0];
      if(!target)continue;
      const dx=target.x-enemy.x,dy=target.y-enemy.y;
      const direction:Enemy['direction']=Math.abs(dx)>Math.abs(dy)?'side':dy>0?'down':'up';
      enemy.charmAction={startedAt:this.elapsed,targetUid:target.uid,direction,flip:dx<0,active:false};
      enemy.direction=direction;enemy.flip=dx<0;enemy.nextCharmAt=this.elapsed+SUCCUBUS_CHARM.cooldown;
      this.events.push({type:'charm-start',enemy,tower:target,x:enemy.x,y:enemy.y});
    }
  }
  private healTargets(healer:Enemy,pulseTime=this.elapsed){
    return this.enemies.filter(enemy=>enemy!==healer&&enemy.hp>0&&enemy.hp<enemy.maxHp&&!enemy.def.healer&&!enemy.boss&&distance(enemy,healer)<=JELLY_HEAL.range&&(enemy.lastHealedAt===undefined||pulseTime-enemy.lastHealedAt>=JELLY_HEAL.interval-1e-9))
      .sort((a,b)=>(b.maxHp-b.hp)-(a.maxHp-a.hp)||a.uid-b.uid).slice(0,JELLY_HEAL.maxTargets);
  }
  private updateHealing(){
    // Resolve only after every burn tick and projectile hit, so dead units cannot cast or receive a pulse.
    for(const healer of this.enemies){
      if(!healer.def.healer||healer.hp<=0)continue;
      const action=healer.healAction;
      if(action){
        const age=this.elapsed-action.startedAt;
        if(!action.pulsed&&age>=JELLY_HEAL.pulseAt-1e-9){
          action.pulsed=true;
          const healedTargets=this.healTargets(healer).map(enemy=>{
            const amount=Math.min(JELLY_HEAL.amount,enemy.maxHp-enemy.hp);enemy.hp+=amount;enemy.lastHealedAt=this.elapsed;return {enemy,amount};
          });
          if(healedTargets.length)this.events.push({type:'heal',enemy:healer,x:healer.x,y:healer.y,healedTargets,amount:healedTargets.reduce((sum,target)=>sum+target.amount,0)});
        }
        if(age>=JELLY_HEAL.castDuration-1e-9)healer.healAction=undefined;
      }
      if(!healer.healAction&&this.elapsed>=(healer.nextHealAt??0)-1e-9&&this.healTargets(healer,this.elapsed+JELLY_HEAL.pulseAt).length){
        healer.healAction={startedAt:this.elapsed,direction:healer.direction,flip:healer.flip,pulsed:false};
        healer.nextHealAt=this.elapsed+JELLY_HEAL.interval;
        this.events.push({type:'heal-start',enemy:healer,x:healer.x,y:healer.y});
      }
    }
  }
  private tick(dt:number) {
    if(this.phase!=='wave')return;
    this.elapsed+=dt;this.spawnTimer-=dt;
    while(this.queue.length&&this.spawnTimer<=0){const next=this.queue.shift()!;this.spawn(next.type,next.boss);this.spawnTimer+=Math.max(.32,.95-this.wave*.022);}
    for(const enemy of this.enemies){
      if(enemy.hp<=0)continue;
      if(enemy.burnTime>0){const owner=enemy.burnSource??this.towers.find(t=>t.uid===enemy.burnOwner);if(owner)this.hurt(enemy,enemy.burn*Math.min(dt,enemy.burnTime),owner);enemy.burnTime=Math.max(0,enemy.burnTime-dt);}
      if(enemy.hp<=0)continue;
      const slowedDuration=Math.min(dt,enemy.slowTime);
      enemy.slowTime=Math.max(0,enemy.slowTime-dt);
      let travel=enemy.charmAction?0:enemy.speed*(dt-slowedDuration*enemy.slow);
      while(travel>0&&enemy.segment<enemy.path.length-1){const next=enemy.path[enemy.segment+1],gap=distance(enemy,next);const step=Math.min(gap,travel);const dx=next.x-enemy.x,dy=next.y-enemy.y;enemy.direction=Math.abs(dx)>Math.abs(dy)?'side':dy>0?'down':'up';enemy.flip=dx<0;if(gap>0){enemy.x+=dx/gap*step;enemy.y+=dy/gap*step;}travel-=step;enemy.distance+=step;if(gap<=step+.001)enemy.segment++;}
      if(enemy.segment===enemy.path.length-1){enemy.hp=0;this.endCharm(enemy,'escape');this.lives=Math.max(0,this.lives-enemy.def.lives*(enemy.boss?2:1));this.events.push({type:'escape',enemy,x:enemy.x,y:enemy.y});}
    }
    if(this.lives<=0){this.phase='defeat';this.clearCharms();this.events.push({type:'defeat'});return;}
    this.updateCharms();
    for(const tower of this.towers){
      tower.cooldown-=dt*this.fireRateMultiplier(tower,dt);if(tower.cooldown>0)continue;
      const stat=stats(tower), candidates=this.enemies.filter(e=>e.hp>0&&(tower.def.targets==='all'||!e.def.flying)&&distance(e,tower)<=stat.range);
      candidates.sort((a,b)=>tower.priority==='strong'?b.hp-a.hp:tower.priority==='near'?distance(a,tower)-distance(b,tower):tower.priority==='last'?(a.distance/a.total)-(b.distance/b.total):(b.distance/b.total)-(a.distance/a.total));
      const target=candidates[0];if(!target)continue;
      tower.angle=Math.atan2(target.y-tower.y,target.x-tower.x)+Math.PI/2;tower.cooldown=stat.cooldown;
      const shot:Shot={uid:this.uid++,tower,target:target.uid,x:tower.x,y:tower.y-12,speed:defSpeed(tower.def.id),damage:stat.damage,level:tower.level};this.shots.push(shot);this.events.push({type:'fire',tower,shot});
    }
    this.shots=this.shots.filter(shot=>{
      const target=this.enemies.find(e=>e.uid===shot.target&&e.hp>0);if(!target)return false;
      const gap=distance(shot,target), step=shot.speed*dt;
      if(gap<=step+4){this.impact(shot,target);return false;}
      shot.x+=(target.x-shot.x)/gap*step;shot.y+=(target.y-shot.y)/gap*step;return true;
    });
    this.updateHealing();
    this.enemies=this.enemies.filter(e=>e.hp>0);
    if(!this.queue.length&&!this.enemies.length){this.shots=[];this.waveBonus=35+this.wave*3;this.gold+=this.waveBonus;this.events.push({type:'clear',amount:this.waveBonus});this.phase=this.wave===this.waveLimit?'victory':'build';if(this.phase==='victory')this.events.push({type:'victory'});}
  }
  get remaining(){return this.enemies.length+this.queue.length;}
  drainEvents(){const events=this.events;this.events=[];return events;}
}
function defSpeed(id:number){return id===3?240:id===5?900:id===8?380:480;}

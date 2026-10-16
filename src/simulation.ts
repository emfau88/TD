import { CELL,COLS,ROWS,MAPS,TOWERS,center,pathCells,pathPoints,platformCells,waterCells,waveComposition,mapRoutePhase, type EnemyDef,type Point,type Priority,type TowerDef,type HeroID,type GridPoint } from './data';
import { HERO_DEFS,createHeroes,commandCompanion,updateCompanions,type Hero,type HeroTarget,type Objective } from './companions';

export type Tower = Point & { uid: number; def: TowerDef; col: number; row: number; level: number; cooldown: number; spent: number; priority: Priority; kills: number; angle: number; overclockUntil?: number; };
export type Enemy = Point & { uid: number; def: EnemyDef; hp: number; maxHp: number; distance: number; total: number; path: Point[]; segment: number; speed: number; slow: number; slowTime: number; burn: number; burnTime: number; burnOwner?: number; burnSource?: Tower; boss: boolean; direction: 'up'|'down'|'side'; flip: boolean; shieldSource?: number; };
export type Shot = Point & { uid: number; tower: Tower; target: number; speed: number; damage: number; level: number; };
export type Event = { type: 'build'|'upgrade'|'sell'|'overclock'|'fire'|'hit'|'kill'|'escape'|'wave'|'clear'|'victory'|'defeat'|'hero-command'|'hero-action'|'objective'|'station'; x?: number; y?: number; tower?: Tower; enemy?: Enemy; shot?: Shot; amount?: number; links?: Point[];hero?:Hero;objective?:Objective; };
export type Phase = 'build'|'wave'|'victory'|'defeat';
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const stats=(tower: Tower)=>({damage:tower.def.damage*[1,1.75,2.8][tower.level-1],range:tower.def.range+(tower.level-1)*15,cooldown:tower.def.cooldown/Math.pow(1.13,tower.level-1)});
export const upgradeCost=(tower:Tower)=>Math.round(tower.def.cost*(tower.level===1?.85:1.25));
export const sellValue=(tower:Tower)=>Math.round(tower.spent*.7);
export const MARA_OVERCLOCK_DURATION = 8;
export const MARA_COOLDOWN = 30;
export const MARA_FIRE_RATE = 1.5;
export type SimulationSnapshot={version:1;mapId:number;gold:number;lives:number;wave:number;kills:number;earned:number;elapsed:number;towers:{uid:number;id:number;col:number;row:number;level:number;spent:number;kills:number;priority:Priority}[];heroes:{id:HeroID;x:number;y:number;cooldown:number}[];objectives:string[];stations?:{id:string;cooldown:number;uses:number}[]};

export class Simulation {
  map: typeof MAPS[number]; gold: number; lives=20; wave=0; phase:Phase='build'; elapsed=0;
  towers:Tower[]=[]; enemies:Enemy[]=[]; shots:Shot[]=[]; events:Event[]=[];
  heroes:Hero[]=[];objectives:Objective[]=[];
  regionEffect?:Point&{type:'roots'|'silence'|'overdrive'|'thaw';remaining:number;radius:number};
  kills=0; earned=0; waveBonus=0; obstacles=new Set<string>(); blocked:Set<string>;
  private uid=1; private queue: ReturnType<typeof waveComposition>=[]; private spawnTimer=0; private spawned=0;
  private land:Set<string>;private water:Set<string>;private roads:Set<string>;
  constructor(mapId:number,party:HeroID[]=['wisp','mara']) {
    this.map=MAPS[mapId] ?? MAPS[0]; this.gold=this.map.gold;
    this.blocked=new Set([...this.map.paths.flatMap(p=>[...pathCells(p)]),...waterCells(this.map)]);
    this.land=platformCells(this.map);
    this.water=waterCells(this.map);this.roads=new Set(this.map.paths.flatMap(path=>[...pathCells(path)]));
    this.objectives=(this.map.objectives??[]).map(objective=>({...center(objective.at),id:objective.id,kind:objective.kind,col:objective.at[0],row:objective.at[1],completed:false,required:objective.required??false,reward:objective.reward,label:objective.label,cooldown:0,activeRemaining:0,uses:0}));
    if(!this.setParty(party))this.setParty(['wisp','mara']);
  }
  canWalk(col:number,row:number):boolean {
    const key=`${col},${row}`;
    return Number.isInteger(col)&&Number.isInteger(row)&&col>=0&&row>=0&&col<COLS&&row<ROWS&&this.land.has(key)&&(!this.water.has(key)||this.roads.has(key))&&!this.obstacles.has(key)&&!this.towers.some(tower=>tower.col===col&&tower.row===row);
  }
  setParty(ids:HeroID[]):boolean{
    const allowed=Object.keys(HERO_DEFS) as HeroID[];
    if(this.phase!=='build'||ids.length!==2||new Set(ids).size!==2||ids.some(id=>!allowed.includes(id)))return false;
    const old=this.heroes;this.heroes=createHeroes(this.map,ids,(col,row)=>this.canWalk(col,row));
    for(const hero of this.heroes){const previous=old.find(item=>item.id===hero.id);if(previous)hero.cooldown=previous.cooldown;}
    return true;
  }
  commandHero(id:HeroID,col:number,row:number):boolean{return commandCompanion(this,id,{type:'move',col,row});}
  commandAction(id:HeroID,type:'tower'|'cache'|'rune'|'station'|'point',targetId:number|string|GridPoint):boolean{
    let target:HeroTarget;
    if(type==='point'){if(!Array.isArray(targetId)||targetId.length!==2)return false;target={type,col:targetId[0],row:targetId[1]};}
    else if(type==='tower'){if(typeof targetId!=='number')return false;target={type,id:targetId};}
    else {if(typeof targetId!=='string')return false;target={type,id:targetId};}
    return commandCompanion(this,id,target);
  }
  heroEvent(type:'hero-command'|'hero-action',hero:Hero){this.events.push({type,hero,x:hero.x,y:hero.y});}
  performHeroAction(hero:Hero,target:HeroTarget):boolean{
    if(target.type==='station'){
      const station=this.objectives.find(objective=>objective.id===target.id&&objective.kind==='station');
      if(!station||this.phase!=='wave'||station.cooldown>0||distance(hero,station)>CELL*1.08)return false;
      const type=({forest:'roots',marsh:'silence',ember:'overdrive',frost:'thaw'} as const)[this.map.theme as 'forest'|'marsh'|'ember'|'frost'];if(!type)return false;
      const duration=type==='roots'||type==='overdrive'?12:15;
      this.regionEffect={type,remaining:duration,x:station.x,y:station.y,radius:type==='roots'?175:0};
      station.cooldown=30;station.activeRemaining=duration;station.uses++;
      this.events.push({type:'station',hero,objective:station,x:station.x,y:station.y});return true;
    }
    if(target.type==='cache'||target.type==='rune'){
      const objective=this.objectives.find(item=>item.id===target.id&&!item.completed&&item.kind===target.type);
      if(!objective||distance(hero,objective)>CELL*1.08)return false;
      objective.completed=true;const reward=objective.reward+(hero.id==='wisp'&&objective.kind==='cache'?15:0);this.gold+=reward;this.earned+=reward;
      this.events.push({type:'objective',hero,objective,x:objective.x,y:objective.y,amount:reward});
      this.checkMissionVictory();return true;
    }
    if(this.phase!=='wave'||hero.cooldown>0)return false;
    if(target.type==='tower'&&hero.id==='mara'){
      const tower=this.towers.find(item=>item.uid===target.id);if(!tower||distance(hero,tower)>CELL*1.08)return false;
      tower.overclockUntil=this.elapsed+MARA_OVERCLOCK_DURATION;hero.cooldown=MARA_COOLDOWN;
      this.events.push({type:'overclock',tower,hero,x:tower.x,y:tower.y});this.heroEvent('hero-action',hero);return true;
    }
    if(target.type!=='point'||hero.id==='mara'||distance(hero,center([target.col,target.row]))>1)return false;
    const radius=hero.id==='runa'?170:hero.id==='wisp'?135:185;
    const victims=this.enemies.filter(enemy=>enemy.hp>0&&(hero.id!=='wisp'||!enemy.def.flying)&&distance(hero,enemy)<=radius);
    for(const enemy of victims){
      if(hero.id==='ilyra')this.heroHurt(enemy,enemy.def.flying?145:75);
      else {enemy.slow=Math.max(enemy.slowTime>0?enemy.slow:0,hero.id==='runa'?.65:.5);enemy.slowTime=Math.max(enemy.slowTime,hero.id==='runa'?6:5);}
    }
    hero.cooldown=HERO_DEFS[hero.id].cooldown;this.heroEvent('hero-action',hero);return true;
  }
  private heroHurt(enemy:Enemy,damage:number){
    if(enemy.hp<=0)return;enemy.hp-=damage;
    if(enemy.hp<=0)this.rewardKill(enemy);
  }
  get awaitingObjective(){return this.wave===this.totalWaves&&this.phase==='build'&&this.objectives.some(objective=>objective.required&&!objective.completed);}
  private checkMissionVictory(){
    if(this.phase==='build'&&this.wave===this.totalWaves&&!this.objectives.some(objective=>objective.required&&!objective.completed)){
      this.phase='victory';for(const hero of this.heroes){hero.path=[];hero.target=null;hero.state='celebrate';}this.events.push({type:'victory'});
    }
  }
  canBuild(col:number,row:number):boolean {
    return Number.isInteger(col) && Number.isInteger(row) && col>=1 && col<COLS-1 && row>=1 && row<ROWS-1 && this.land.has(`${col},${row}`) && !this.blocked.has(`${col},${row}`) && !this.obstacles.has(`${col},${row}`) && !this.towers.some(t=>t.col===col&&t.row===row) && !this.heroes.some(hero=>Math.floor(hero.x/CELL)===col&&Math.floor(hero.y/CELL)===row) && !this.objectives.some(objective=>objective.col===col&&objective.row===row) && this.phase!=='defeat' && this.phase!=='victory';
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
    this.gold+=sellValue(tower);this.towers=this.towers.filter(t=>t.uid!==uid);this.events.push({type:'sell',tower,x:tower.x,y:tower.y});return true;
  }
  startWave():boolean {
    if(this.phase!=='build'||this.wave>=this.totalWaves)return false;
    this.wave++;this.phase='wave';this.queue=waveComposition(this.wave,this.map.id);this.spawnTimer=.6;this.spawned=0;this.events.push({type:'wave'});return true;
  }
  get totalWaves(){return this.map.waves??20;}
  private get routeWave(){return Math.min(this.totalWaves,this.phase==='build'?this.wave+1:Math.max(1,this.wave));}
  get activePaths(){const phase=mapRoutePhase(this.map,this.routeWave);return phase?phase.paths.map(index=>this.map.paths[index]):this.map.paths;}
  get activeAir(){return this.map.theme==='wind'&&this.routeWave>=4&&this.routeWave<7?this.map.air.map(([x,y],index)=>index===this.map.air.length-1?[x,y] as GridPoint:[x,15-y] as GridPoint):this.map.air;}
  get routeLabel(){return mapRoutePhase(this.map,this.routeWave)?.label??(this.map.paths.length>1?'Zwei Bodenwege':'Ein Bodenweg');}
  get maraCooldown(){return this.heroes.find(hero=>hero.id==='mara')?.cooldown??0;}
  isOverclocked(tower:Tower){return this.phase==='wave'&&(tower.overclockUntil??0)>this.elapsed&&this.towers.includes(tower);}
  overclock(uid:number):boolean {
    return this.commandAction('mara','tower',uid);
  }
  private clearOverclocks(){for(const tower of this.towers)delete tower.overclockUntil;}
  private removeShields(source:number){for(const enemy of this.enemies)if(enemy.shieldSource===source)delete enemy.shieldSource;}
  private updateShields(){
    for(const enemy of this.enemies)delete enemy.shieldSource;
    for(const source of this.enemies){
      if(source.hp<=0||!source.def.shieldRange)continue;
      const targets=this.enemies.filter(enemy=>enemy.hp>0&&!enemy.def.shieldRange&&enemy.shieldSource===undefined&&distance(source,enemy)<=source.def.shieldRange!);
      targets.sort((a,b)=>distance(source,a)-distance(source,b)||a.uid-b.uid);
      for(const target of targets.slice(0,source.def.shieldTargets??2))target.shieldSource=source.uid;
    }
  }
  private spawn(def:EnemyDef,boss:boolean) {
    const routes=this.activePaths;
    const nodes=def.flying?this.activeAir:routes[this.spawned%routes.length];
    const campaignScale=this.map.campaignOrder===undefined?1+this.map.id*.06:1+(this.map.chapter??0)*.045;
    const path=pathPoints(nodes), hp=def.hp*Math.pow(1.095,this.wave-1)*(boss?3.2:1)*campaignScale;
    const total=path.slice(1).reduce((sum,p,i)=>sum+distance(path[i],p),0);
    this.enemies.push({uid:this.uid++,def,...path[0],hp,maxHp:hp,path,total,distance:0,segment:0,speed:def.speed*(boss?.78:1),slow:0,slowTime:0,burn:0,burnTime:0,boss,direction:'side',flip:false});
    this.spawned++;
  }
  private hurt(enemy:Enemy,damage:number,tower:Tower) {
    if(enemy.hp<=0)return;
    const shieldSource=this.enemies.find(source=>source.uid===enemy.shieldSource&&source.hp>0&&source.def.shieldRange&&distance(source,enemy)<=source.def.shieldRange);
    enemy.hp-=damage*(tower.def.pierce?1:1-enemy.def.armor)*(shieldSource ? .5 : 1);
    if(enemy.hp<=0){tower.kills++;this.rewardKill(enemy);}
  }
  private rewardKill(enemy:Enemy){this.removeShields(enemy.uid);const reward=Math.round(enemy.def.gold*(enemy.boss?3:1));this.gold+=reward;this.earned+=reward;this.kills++;this.events.push({type:'kill',enemy,x:enemy.x,y:enemy.y,amount:reward});}
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
    if(!Number.isFinite(dt)||dt<=0||this.phase==='victory'||this.phase==='defeat')return;
    const steps=Math.ceil(dt/.025), step=dt/steps;
    for(let index=0;index<steps&&(this.phase as Phase)!=='victory'&&(this.phase as Phase)!=='defeat';index++){
      if(this.regionEffect){this.regionEffect.remaining=Math.max(0,this.regionEffect.remaining-step);if(this.regionEffect.remaining<=0)delete this.regionEffect;}
      for(const objective of this.objectives)if(objective.kind==='station'){objective.cooldown=Math.max(0,objective.cooldown-step);objective.activeRemaining=this.regionEffect?.remaining??0;}
      updateCompanions(this,step);if(this.phase==='wave')this.tick(step);
    }
  }
  private tick(dt:number) {
    if(this.phase!=='wave')return;
    this.elapsed+=dt;this.spawnTimer-=dt;
    while(this.queue.length&&this.spawnTimer<=0){const next=this.queue.shift()!;this.spawn(next.type,next.boss);this.spawnTimer+=Math.max(.32,.95-this.wave*.022);}
    this.updateShields();
    if(this.regionEffect?.type!=='silence')for(const source of this.enemies)if(source.hp>0&&source.def.heal)for(const ally of this.enemies)if(ally!==source&&ally.hp>0&&distance(source,ally)<=120)ally.hp=Math.min(ally.maxHp,ally.hp+source.def.heal*dt);
    for(const enemy of this.enemies){
      if(enemy.hp<=0)continue;
      if(enemy.burnTime>0){const owner=enemy.burnSource??this.towers.find(t=>t.uid===enemy.burnOwner);if(owner)this.hurt(enemy,enemy.burn*Math.min(dt,enemy.burnTime),owner);enemy.burnTime=Math.max(0,enemy.burnTime-dt);}
      if(enemy.hp<=0)continue;
      const slowedDuration=Math.min(dt,enemy.slowTime);
      enemy.slowTime=Math.max(0,enemy.slowTime-dt);
      const haste=this.enemies.some(source=>source!==enemy&&source.hp>0&&source.def.haste&&distance(source,enemy)<115)?.25:0;
      const roots=this.regionEffect?.type==='roots'&&!enemy.def.flying&&distance(this.regionEffect,enemy)<=this.regionEffect.radius ? .5 : 1;
      let travel=enemy.speed*(dt-slowedDuration*enemy.slow)*(1+haste)*roots;
      while(travel>0&&enemy.segment<enemy.path.length-1){const next=enemy.path[enemy.segment+1],gap=distance(enemy,next);const step=Math.min(gap,travel);const dx=next.x-enemy.x,dy=next.y-enemy.y;enemy.direction=Math.abs(dx)>Math.abs(dy)?'side':dy>0?'down':'up';enemy.flip=dx<0;if(gap>0){enemy.x+=dx/gap*step;enemy.y+=dy/gap*step;}travel-=step;enemy.distance+=step;if(gap<=step+.001)enemy.segment++;}
      if(enemy.segment===enemy.path.length-1){enemy.hp=0;this.removeShields(enemy.uid);this.lives=Math.max(0,this.lives-enemy.def.lives*(enemy.boss?2:1));this.events.push({type:'escape',enemy,x:enemy.x,y:enemy.y});}
    }
    if(this.lives<=0){this.phase='defeat';this.clearOverclocks();this.events.push({type:'defeat'});return;}
    this.updateShields();
    for(const tower of this.towers){
      const boostedTime=Math.min(dt,Math.max(0,(tower.overclockUntil??0)-(this.elapsed-dt)));
      const disruption=this.regionEffect?.type!=='thaw'&&this.enemies.some(enemy=>enemy.hp>0&&enemy.def.sabotage&&distance(tower,enemy)<105)?.3:0;
      tower.cooldown-=(dt+boostedTime*(MARA_FIRE_RATE-1))*(1-disruption)*(this.regionEffect?.type==='overdrive'?1.25:1);if(tower.cooldown>1e-9)continue;
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
    this.enemies=this.enemies.filter(e=>e.hp>0);
    if(!this.queue.length&&!this.enemies.length){this.shots=[];this.clearOverclocks();delete this.regionEffect;for(const objective of this.objectives)objective.activeRemaining=0;this.waveBonus=35+this.wave*3;this.gold+=this.waveBonus;this.events.push({type:'clear',amount:this.waveBonus});this.phase='build';this.checkMissionVictory();}
  }
  get remaining(){return this.enemies.length+this.queue.length;}
  snapshot():SimulationSnapshot|undefined{
    if(this.phase!=='build')return;
    return {version:1,mapId:this.map.id,gold:this.gold,lives:this.lives,wave:this.wave,kills:this.kills,earned:this.earned,elapsed:this.elapsed,
      towers:this.towers.map(tower=>({uid:tower.uid,id:tower.def.id,col:tower.col,row:tower.row,level:tower.level,spent:tower.spent,kills:tower.kills,priority:tower.priority})),
      heroes:this.heroes.map(hero=>({id:hero.id,x:hero.x,y:hero.y,cooldown:hero.cooldown})),objectives:this.objectives.filter(objective=>objective.completed).map(objective=>objective.id),stations:this.objectives.filter(objective=>objective.kind==='station').map(objective=>({id:objective.id,cooldown:objective.cooldown,uses:objective.uses}))};
  }
  static restore(value:unknown):Simulation|undefined{
    if(!value||typeof value!=='object')return;
    const saved=value as SimulationSnapshot;
    if(saved.version!==1||!Number.isInteger(saved.mapId)||!MAPS[saved.mapId]||![saved.gold,saved.lives,saved.wave,saved.kills,saved.earned].every(number=>Number.isSafeInteger(number)&&number>=0)||!Number.isFinite(saved.elapsed)||saved.elapsed<0||!Array.isArray(saved.towers)||saved.towers.length>200||!Array.isArray(saved.heroes)||saved.heroes.length!==2||saved.heroes.some(hero=>!hero||typeof hero!=='object'||typeof hero.id!=='string')||!Array.isArray(saved.objectives)||new Set(saved.objectives).size!==saved.objectives.length)return;
    const sim=new Simulation(saved.mapId);
    if(saved.lives>20||saved.lives<=0||saved.wave>sim.totalWaves||!Number.isInteger(saved.wave)||!sim.setParty(saved.heroes.map(hero=>hero.id)))return;
    // Restore immutable tower definitions from IDs rather than trusting stored combat statistics.
    sim.heroes=[];sim.gold=Number.MAX_SAFE_INTEGER;
    const occupiedUids=new Set<number>();
    for(const entry of saved.towers){
      if(!entry||!Number.isInteger(entry.uid)||entry.uid<=0||occupiedUids.has(entry.uid)||![1,2,3].includes(entry.level)||!['first','strong','near','last'].includes(entry.priority)||!Number.isInteger(entry.kills)||entry.kills<0)return;
      const tower=sim.build(entry.id,entry.col,entry.row);if(!tower)return;
      const validSpent=tower.def.cost+(entry.level>=2?Math.round(tower.def.cost*.85):0)+(entry.level===3?Math.round(tower.def.cost*1.25):0);
      if(entry.spent!==validSpent)return;
      tower.uid=entry.uid;tower.level=entry.level;tower.spent=validSpent;tower.kills=entry.kills;tower.priority=entry.priority;occupiedUids.add(entry.uid);
    }
    sim.setParty(saved.heroes.map(hero=>hero.id));
    for(const hero of sim.heroes){const stored=saved.heroes.find(entry=>entry.id===hero.id)!;if(![stored.x,stored.y,stored.cooldown].every(Number.isFinite)||stored.cooldown<0||stored.cooldown>HERO_DEFS[hero.id].cooldown||!sim.canWalk(Math.floor(stored.x/CELL),Math.floor(stored.y/CELL)))return;hero.x=stored.x;hero.y=stored.y;hero.cooldown=stored.cooldown;}
    if(saved.objectives.some(id=>typeof id!=='string'||!sim.objectives.some(objective=>objective.id===id&&objective.kind!=='station')))return;
    for(const objective of sim.objectives)objective.completed=saved.objectives.includes(objective.id);
    if(saved.stations!==undefined){if(!Array.isArray(saved.stations)||new Set(saved.stations.map(station=>station?.id)).size!==saved.stations.length)return;for(const stored of saved.stations){if(!stored||!Number.isFinite(stored.cooldown)||stored.cooldown<0||stored.cooldown>30||!Number.isSafeInteger(stored.uses)||stored.uses<0)return;const station=sim.objectives.find(objective=>objective.id===stored.id&&objective.kind==='station');if(!station)return;station.cooldown=stored.cooldown;station.uses=stored.uses;}}
    sim.gold=saved.gold;sim.lives=saved.lives;sim.wave=saved.wave;sim.kills=saved.kills;sim.earned=saved.earned;sim.elapsed=saved.elapsed;
    sim.uid=Math.max(1,...occupiedUids)+1;sim.events=[];return sim;
  }
  drainEvents(){const events=this.events;this.events=[];return events;}
}
function defSpeed(id:number){return id===3?240:id===5?900:id===8?380:480;}

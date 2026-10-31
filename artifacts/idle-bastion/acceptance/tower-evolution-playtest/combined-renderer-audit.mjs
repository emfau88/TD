// Reproducible non-visual renderer audit. Run from repository root with Node.
// Uses actual Vite-transformed modules, PNG dimensions, simulation and render adapters.
// The strict scene records API calls; it is not a GPU or screenshot test.
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {IDBFactory} from 'fake-indexeddb';
const out=dirname(fileURLToPath(import.meta.url));
const server=await createServer({configFile:resolve('experiments/idle-bastion/vite.config.ts'),optimizeDeps:{noDiscovery:true,include:[],entries:[]},server:{middlewareMode:true,hmr:false},logLevel:'silent'});
const result={scope:'Strict scene adapter, not GPU performance',single:[],mixed:[],errors:[]};
try{
 const modules=await Promise.all(['/src/evolution-view.ts','/src/combat-effects.ts','/src/evolution-impacts.ts','/src/tower-test-probes.ts','/src/battle.ts','/src/tower-atlas.ts','/src/tower-evolution.ts','/src/save-store.ts'].map(p=>server.ssrLoadModule(p)));
 const [viewmod,{CombatEffects},impacts,{createTowerProbe},{IdleBattle,stats},{TOWER_SHEETS},tiers,{openBattleStore}]=modules;
 const textures=new Map();let drawCalls=0,registeredBytes=0;
 function register(key,image,frames=new Set([0])){assert.ok(!textures.has(key),`duplicate ${key}`);const tex={image,frames,getSourceImage:()=>image,add(frame,_source,x,y,w,h){assert.ok(x>=0&&y>=0&&x+w<=image.width&&y+h<=image.height,`atlas overflow ${key}`);frames.add(frame);return this},setFilter(){}};textures.set(key,tex);return tex}
 function png(url){let path=url.startsWith('file:')?fileURLToPath(url):decodeURIComponent(url.replace(/^\/@fs\//,''));assert.ok(existsSync(path),`missing ${path}`);const buf=readFileSync(path);return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)}}
 function sheet(key,url,cfg){const im=png(url),count=im.width/cfg.frameWidth*im.height/cfg.frameHeight;assert.ok(Number.isInteger(count));register(key,im,new Set(Array.from({length:count},(_,i)=>i)))}
 for(const s of Object.values(TOWER_SHEETS))sheet(s.key,s.url,{frameWidth:s.width,frameHeight:s.height});
 const noop=()=>{};
 const ctx={save:noop,restore:noop,translate:noop,scale:noop,fillRect(...ns){assert.ok(ns.every(Number.isFinite));drawCalls++},drawImage(image,...ns){assert.ok(image&&ns.every(Number.isFinite));drawCalls++},getImageData(_x,_y,w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData:noop};
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(name){assert.equal(name,'canvas');return {width:0,height:0,getContext:()=>ctx}}}});
 const loader={load:{image:(key,url)=>register(key,png(url)),spritesheet:sheet},textures:{exists:k=>textures.has(k),get:k=>{assert.ok(textures.has(k),k);return textures.get(k)},addCanvas:(k,c)=>{registeredBytes+=c.width*c.height*4;return register(k,c)}}};
 viewmod.preloadEvolution(loader);viewmod.prepareEvolution(loader);impacts.prepareEvolutionImpacts(loader);
 const count=textures.size;viewmod.prepareEvolution(loader);impacts.prepareEvolutionImpacts(loader);assert.equal(textures.size,count);
 if(descriptor)Object.defineProperty(globalThis,'document',descriptor);else delete globalThis.document;
 const earned=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json','utf8'));
 function scene(){const sprites=[],lines=[];let maxSprites=0,maxLines=0;
  function image(x,y,key,frame=0){const v={x,y,key,frame,depth:0,rotation:0,scale:1,visible:true,alpha:1,destroyed:false,
   setTexture(k,f=0){assert.ok(textures.has(k),`missing texture ${k}`);this.key=k;return this.setFrame(f)},setFrame(f){assert.ok(textures.get(this.key).frames.has(f),`${this.key} has no frame ${f}`);this.frame=f;return this},setScale(s){assert.ok(Number.isFinite(s)&&s>0);this.scale=s;return this},setPosition(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));this.x=x;this.y=y;return this},setRotation(r){assert.ok(Number.isFinite(r));this.rotation=r;return this},setDepth(d){assert.ok(Number.isFinite(d));this.depth=d;return this},setOrigin(){return this},setTint(){return this},setAlpha(a){assert.ok(Number.isFinite(a)&&a>=0&&a<=1);this.alpha=a;return this},setVisible(b){this.visible=b;return this},destroy(){assert.ok(!this.destroyed,'double destruction');this.destroyed=true;}};
   v.setTexture(key,frame);sprites.push(v);maxSprites=Math.max(maxSprites,sprites.filter(s=>!s.destroyed).length);return v;}
  function graphics(){const line={destroyed:false,alpha:1,setDepth(){return this},lineStyle(){return this},beginPath(){return this},moveTo(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));return this},lineTo(x,y){return this.moveTo(x,y)},strokePath(){return this},setAlpha(a){assert.ok(a>=0&&a<=1);this.alpha=a;return this},destroy(){assert.ok(!this.destroyed);this.destroyed=true}};lines.push(line);maxLines=Math.max(maxLines,lines.filter(l=>!l.destroyed).length);return line;}
  return {add:{image,graphics},sprites,lines,metrics:()=>({maxSprites,maxLines})};
 }
 const salvos=[],contacts=[];
 function run(scenario,level,fps,seconds){
  let b=createTowerProbe(scenario,earned,level),control=IdleBattle.restore(b.snapshot());const s=scene(),ev=new viewmod.EvolutionView(s),fx=new CombatEffects(s),towerViews=new Map();const fires={},hits={};let checks=0,capturedFire=false,capturedHit=false;
  const snapshots=()=>s.sprites.filter(x=>!x.destroyed).map(({x,y,key,frame,depth,rotation,scale,visible,alpha})=>({x,y,key,frame,depth,rotation,scale,visible,alpha}));
  function render(){const t=b.elapsed+b.introduction.preparationSeconds;
   fx.update(t,new Set(b.shots.map(x=>x.uid)),new Set(b.towers.map(x=>x.uid)));
   for(const tower of b.towers){let v=towerViews.get(tower.uid);if(!v){const ghost=viewmod.evolutionGhost(tower.def.id);v={base:s.add.image(tower.x,tower.y,ghost.base),weapon:s.add.image(tower.x,tower.y,ghost.weapon)};towerViews.set(tower.uid,v)}const stat=stats(tower);ev.updateTower(tower,v,t-fx.firedAt(tower.uid),stat.cooldown,tower.cooldown,b.enemies.some(e=>e.hp>0&&Math.hypot(e.x-tower.x,e.y-tower.y)<=stat.range),t,0xffffff,0,0);}
   ev.sync(b,t);checks++;
  }
  for(let tick=0;tick<fps*seconds;tick++){b.update(1/fps);control.update(1/fps);const events=b.drainEvents();control.drainEvents();for(const e of events)if(e.shot){if(e.type==='fire')fires[e.shot.kind]=(fires[e.shot.kind]??0)+1;if(e.type==='hit')hits[e.shot.kind]=(hits[e.shot.kind]??0)+1;}
   if(scenario!=='mixed'){
    const kind=['warden','frost','slinger','sniper','storm'].indexOf(scenario)+1;
    const fire=events.find(e=>e.type==='fire'&&e.shot?.kind===kind&&e.shot.level===level&&b.shots.some(s=>s.uid===e.shot.uid));
    if(fire&&!capturedFire){const shot=b.shots.find(s=>s.uid===fire.shot.uid),enemy=b.enemies.find(e=>e.uid===shot.target),id=salvos.length+1;salvos.push({event:{...fire,shot:{...fire.shot,uid:id,towerUid:id,target:id},tower:{...fire.tower,uid:id},enemy:{...enemy,uid:id}},tower:{...fire.tower,uid:id},enemy:{...enemy,uid:id},shot:{...shot,uid:id,towerUid:id,target:id}});capturedFire=true;}
    const hit=events.find(e=>e.type==='hit'&&e.shot?.kind===kind&&e.shot.level===level);
    if(hit&&!capturedHit){contacts.push({...hit,shot:{...hit.shot,uid:contacts.length+1}});capturedHit=true;}
   }
   const t=b.elapsed+b.introduction.preparationSeconds;fx.accept(events,t);ev.accept(events,t);render();
   if(tick===Math.floor(fps*seconds/2)){const before=snapshots();for(let n=0;n<5;n++)render();assert.deepEqual(snapshots(),before,'paused render changed');assert.deepEqual(b.snapshot(),control.snapshot(),'renderer mutated combat');b=IdleBattle.restore(b.snapshot());assert.ok(b);control=IdleBattle.restore(control.snapshot());}
  }
  assert.deepEqual(b.snapshot(),control.snapshot(),'renderer changed save or combat');const visibleKeys=[...new Set(s.sprites.map(i=>i.key))];ev.destroy();fx.destroy();for(const v of towerViews.values()){v.base.destroy();v.weapon.destroy()};assert.ok(s.sprites.every(i=>i.destroyed));assert.ok(s.lines.every(i=>i.destroyed));return {scenario,level,fps,seconds,checks,fires,hits,...s.metrics(),keys:visibleKeys};
 }
 for(const scenario of ['warden','frost','slinger','sniper','storm'])for(const level of tiers.SKIN_LEVELS){const r=run(scenario,level,60,16),kind=['warden','frost','slinger','sniper','storm'].indexOf(scenario)+1;assert.ok(r.hits[kind]>0,`${scenario} ${level} no hits`);assert.ok(r.keys.includes(impacts.evolutionImpact(kind,level).key));result.single.push(r)}
 for(const level of tiers.SKIN_LEVELS)for(const fps of [15,30,60,120])result.mixed.push(run('mixed',level,fps,24));
 // Deliberately simultaneous replay of real payloads. It isolates renderer load from
 // kill priority: a level-25 Stormlight normally kills before all other kinds can fire.
 assert.equal(salvos.length,40);assert.equal(contacts.length,40);
 const stress=scene(),ev=new viewmod.EvolutionView(stress),fx=new CombatEffects(stress);
 const model={towers:salvos.map(s=>s.tower),enemies:salvos.map(s=>s.enemy),shots:salvos.map(s=>s.shot)};
 const bodies=model.towers.map(t=>{const g=viewmod.evolutionGhost(t.def.id);return {base:stress.add.image(t.x,t.y,g.base),weapon:stress.add.image(t.x,t.y,g.weapon)}});
 const fires=salvos.map(s=>s.event);ev.accept(fires,0);
 for(let step=0;step<=100;step++){
  const progress=step/100;model.shots=salvos.map(({shot,enemy})=>({...shot,x:shot.x+(enemy.x-shot.x)*progress,y:shot.y+(enemy.y-shot.y)*progress}));
  const before=JSON.stringify(model);
  model.towers.forEach((t,i)=>ev.updateTower(t,bodies[i],progress,.7,t.cooldown,true,progress,0xffffff,0,0));ev.sync(model,progress);
  assert.equal(JSON.stringify(model),before);
 }
 for(let repeat=0;repeat<7;repeat++){fx.accept(fires,1);fx.accept(contacts.map(e=>({...e,shot:{...e.shot,uid:e.shot.uid+repeat*1000}})),1)}
 assert.equal(stress.sprites.filter(s=>!s.destroyed&&s.key.startsWith('evolution-impact')).length,96);
 assert.equal(stress.lines.filter(l=>!l.destroyed).length,48);
 const peak=stress.metrics();fx.update(1.7,new Set(),new Set());assert.ok(stress.lines.every(l=>l.destroyed));
 assert.ok(stress.sprites.filter(s=>s.key.startsWith('evolution-impact')).every(s=>s.destroyed));
 model.shots=[];model.towers=[];ev.sync(model,2);ev.destroy();fx.destroy();for(const b of bodies){b.base.destroy();b.weapon.destroy()};assert.ok(stress.sprites.every(s=>s.destroyed));
 result.simultaneous={actualPayloads:40,trajectorySteps:101,impactCap:96,lineCap:48,...peak,cleanup:'complete',note:'Strict renderer replay, not physical-device FPS or 40-tower balance simulation'};
 const idb=new IDBFactory(),main=await openBattleStore(idb,'spire-idle-bastion');await main.save(earned,true,0);const before=await main.load();const branch=await openBattleStore(idb,tiers.towerPreviewDatabase());result.storage={main:before.kind,branchDefault:(await branch.load()).kind,mainPreserved:JSON.stringify(await main.load())===JSON.stringify(before),branchName:tiers.towerPreviewDatabase()};assert.equal(result.storage.main,'valid');assert.equal(result.storage.branchDefault,'empty');assert.equal(result.storage.mainPreserved,true);main.close();branch.close();
 result.textures={registered:count,generatedBytes:registeredBytes,generatedMiB:registeredBytes/1048576,prebakeDrawCalls:drawCalls};
 result.result='pass';writeFileSync(resolve(out,'combined-renderer-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({result:result.result,singleCases:result.single.length,mixedCases:result.mixed.length,renderChecks:[...result.single,...result.mixed].reduce((s,x)=>s+x.checks,0),textures:result.textures,storage:result.storage,simultaneous:result.simultaneous}));
}finally{await server.close()}

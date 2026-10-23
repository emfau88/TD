import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { IdleBattle, BATTLE_SCHEMA_VERSION, BATTLE_RULES_VERSION, waveEnemy, waveCount, towerDefinition } from '../src/battle';
import { ENEMIES, ENEMY_ROSTER, JELLY_HEAL, introducedEnemy, isHealer } from '../src/enemy-roster';
import { ENEMY_SHEETS, enemyFrame, enemyFlip } from '../src/enemy-art';
import { jellyFrame } from '../../../reference/src/jelly-art';
import { certifyFarm } from '../src/farming';

const legacy = JSON.parse(readFileSync(new URL('./fixtures/enemies-v12.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(readFileSync(new URL('../../../public/assets/manifest.json', import.meta.url), 'utf8'));
function lateBattle() {
  const b = new IdleBattle(); b.highestCleared = 20; b.bossVictories = 1; b.secondBossVictories = 0;
  b.update(7); return b;
}
const healStep = (b: IdleBattle, dt: number) => (b as unknown as { stepHealers(dt: number): void }).stepHealers(dt);
function woundedGroup(b: IdleBattle) {
  const healer = b.enemies.find(e => e.def.id === 'LanternJelly')!; assert.ok(healer);
  const allies = b.enemies.filter(e => e.def.id !== 'LanternJelly' && Math.hypot(e.x-healer.x,e.y-healer.y) < 95);
  assert.ok(allies.length >= 2);
  allies.forEach(e => { e.hp=e.maxHp*.5; e.healLockout=0; }); healer.healCooldown=0;
  return {healer, allies};
}

test('staged introductions, unchanged opening and boss escorts, bounded varied late recipes', () => {
  const expected = new Map([[6,'FlyingLocust'],[9,'Firewasp'],[13,'MagmaCrab'],[17,'Clampbeetle'],[21,'LanternJelly'],[28,'Voidbutterfly'],[19,'ForestGoblin'],[26,'BoneGuard'],[32,'ForestCultist'],[42,'MossShroom'],[46,'WoodSpider'],[50,'HornedBat'],[54,'EmberBomb']]);
  for (const [wave, id] of expected) { assert.equal(introducedEnemy(wave,BATTLE_RULES_VERSION)?.id,id); assert.equal(waveEnemy(wave,2).id,id); }
  for (const wave of [1,2,3,4,5,15,25]) for (let i=0;i<waveCount(wave);i++) assert.deepEqual(waveEnemy(wave,i),waveEnemy(wave,i,8));
  const seen=new Set<string>();
  for (let wave=1;wave<=64;wave++) {
    assert.ok(waveCount(wave)<=28); let healers=0;
    for(let i=0;i<waveCount(wave);i++) {const e=waveEnemy(wave,i);assert.ok(e.firstWave<=wave); if(isHealer(e)) healers++; if(wave>28) seen.add(e.id);}
    assert.ok(healers<=2);
  }
  assert.deepEqual([...seen].sort(),ENEMY_ROSTER.filter(e=>e.id!=='Rosenspiegel').map(e=>e.id).sort());
});

test('all original movement tags resolve through frameMap, with correct sizes, timings and facing', () => {
  for (const [id, asset] of Object.entries({Leafbug:'Leafbug',Firebug:'Firebug',Scorpion:'Scorpion',FlyingLocust:'Flying Locust',Firewasp:'Firewasp',MagmaCrab:'Magma Crab',Clampbeetle:'Clampbeetle',Voidbutterfly:'Voidbutterfly'})) {
    const key=id as keyof typeof ENEMY_SHEETS, sheet=ENEMY_SHEETS[key], source=manifest[asset];
    assert.equal(sheet.width,source.width);assert.equal(sheet.height,source.height);
    for (const [index,dir] of (['down','up','side'] as const).entries()) {
      const tag=source.tags[index+5], logical=Array.from({length:tag.end-tag.start+1},(_,i)=>tag.start+i);
      assert.deepEqual(sheet.move[dir].frames,logical.map(i=>source.frameMap[i]));
      assert.deepEqual(sheet.move[dir].durations,logical.map(i=>source.durations[i]));
      let elapsed=0;
      for(let i=0;i<logical.length;i++){ assert.equal(enemyFrame(key,dir,elapsed/1000),source.frameMap[logical[i]]);elapsed+=source.durations[logical[i]]; }
      assert.equal(enemyFrame(key,dir,elapsed/1000),sheet.move[dir].frames[0]);
      assert.ok(sheet.move[dir].frames.every(f=>f>=0&&f<source.cols*source.rows));
    }
  }
  for(const id of ['Scorpion','MagmaCrab','Clampbeetle'] as const) {assert.equal(enemyFlip(id,'side',false),true);assert.equal(enemyFlip(id,'up',true),false);}
  for(const id of ['Leafbug','Firebug','Firewasp','FlyingLocust','Voidbutterfly','LanternJelly'] as const) assert.equal(enemyFlip(id,'side',false),false);
  assert.equal(jellyFrame('heal','side',.3*1000),42);
});

test('healing cast is saved exactly, bounded to two escorts, capped and protected against stacking', () => {
  const b=lateBattle(), {healer,allies}=woundedGroup(b);
  healer.hp=healer.maxHp*.5;
  healStep(b,.025);assert.equal(healer.healRemaining,JELLY_HEAL.cast);
  const before=allies.map(e=>e.hp), saved=b.snapshot(), restored=IdleBattle.restore(saved);assert.ok(restored);
  assert.deepEqual(restored.snapshot(),saved); // no pulse on reload / while paused
  healStep(b,.4);healStep(restored,.4);assert.deepEqual(restored.snapshot(),b.snapshot());
  assert.equal(allies.filter((e,i)=>e.hp>before[i]).length,2);assert.equal(healer.hp,healer.maxHp*.5);
  const healed=allies.filter(e=>e.healLockout>0);healed.forEach(e=>assert.ok(e.hp<=e.maxHp));
  const after=healed.map(e=>e.hp);healer.healRemaining=.025;
  healStep(b,.025);assert.deepEqual(healed.map(e=>e.hp),after);
  healer.healRemaining=.025;healed[0].healLockout=0;healed[0].hp=healed[0].maxHp*.999;
  allies.filter(e=>e!==healed[0]).forEach(e=>e.hp=e.maxHp);
  healStep(b,.025);assert.equal(healed[0].hp,healed[0].maxHp);
  const corrupted=b.snapshot();corrupted.enemies.find(e=>e.defId!=='LanternJelly')!.healRemaining=.1;assert.equal(IdleBattle.restore(corrupted),undefined);
});

test('a killed healer cannot pulse later in that tick, and no boss can be healed', () => {
  const b=lateBattle(), {healer,allies}=woundedGroup(b);healer.healRemaining=.025;healer.hp=1;
  b.shots.push({uid:10000,towerUid:1,target:healer.uid,x:healer.x,y:healer.y,speed:480,damage:14,level:1,kind:1});
  const before=allies.map(e=>e.hp);b.update(.025);assert.ok(!b.enemies.includes(healer));
  assert.ok(allies.every((e,i)=>e.hp<=before[i]));
  const c=lateBattle(), group=woundedGroup(c), boss=group.allies[0];boss.def=ENEMIES.Rosenspiegel;
  const bossHp=boss.hp;group.healer.healRemaining=.025;healStep(c,.025);assert.equal(boss.hp,bossHp);
});

test('void resists slow, while all four towers can target flying enemies', () => {
  for (const def of [ENEMIES.FlyingLocust,ENEMIES.Voidbutterfly]) {
    const b=lateBattle(), enemy=b.enemies[0];enemy.def=def;enemy.speed=def.speed;enemy.slowRemaining=2;
    const at=enemy.distance;b.update(.025);assert.ok(Math.abs(enemy.distance-at-def.speed*def.slowFactor*.025)<1e-6);
  }
  assert.deepEqual(ENEMY_ROSTER.filter(e=>e.flying).map(e=>e.id).sort(),['FlyingLocust','Firewasp','Clampbeetle','LanternJelly','Voidbutterfly','HornedBat'].sort());
  // Targeting in the shared tower loop has no ground/air filter; each kind fires at the same isolated flyer.
  for(const kind of [1,2,3,4] as const) {
    const c=new IdleBattle();c.highestCleared=9;c.update(.5);const e=c.enemies[0];e.def=ENEMIES.Firewasp;
    c.enemies=[e];const t=c.towers[0];t.def=towerDefinition(kind);
    t.x=e.x;t.y=e.y+40;t.cooldown=0;c.drainEvents();c.update(.025);assert.ok(c.drainEvents().some(ev=>ev.type==='fire'&&ev.shot?.target===e.uid));
  }
});

test('published v12 combat survives migration, old queue completes and next attempt uses current rules', () => {
  const b=IdleBattle.restore(legacy);assert.ok(b);
  assert.equal(b.snapshot().schemaVersion,BATTLE_SCHEMA_VERSION);assert.equal(b.waveRecipeVersion,8);assert.equal(b.gold,legacy.gold);
  assert.deepEqual(b.snapshot().queue,legacy.queue);assert.deepEqual(b.snapshot().shots,legacy.shots);
  assert.deepEqual(b.snapshot().enemies.map(({healCooldown,healRemaining,healLockout,...e})=>e),legacy.enemies);
  assert.deepEqual(b.liveClearedWaves,[]);
  for(let i=0;i<4000&&b.wave===1;i++)b.update(.025);
  assert.equal(b.waveRecipeVersion,BATTLE_RULES_VERSION);assert.ok(IdleBattle.restore(b.snapshot()));
  const fresh=new IdleBattle();for(let i=0;i<5000&&!fresh.liveClearedWaves.includes(1);i++)fresh.update(.025);
  assert.equal(certifyFarm(fresh)?.wave,1);
});

test('derived HP tolerates browser Math.pow rounding, but still rejects modified stats', () => {
  const b=lateBattle(), s=b.snapshot(), e=s.enemies[0];
  e.maxHp += e.maxHp * Number.EPSILON; e.hp=Math.min(e.hp,e.maxHp);
  const restored=IdleBattle.restore(s);assert.ok(restored);assert.equal(restored.enemies[0].maxHp,e.maxHp);
  e.maxHp += .01;assert.equal(IdleBattle.restore(s),undefined);
});

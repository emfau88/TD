// Pure cosmetic study; no battle state, damage, slowing or persistence.
export const LEVELS=[1,2,3,5,10,15,20,25],CYCLE=1.8,FIRE=.28,DISTANCE=110,SPEED=480;
export function sample(t){
 t=Math.max(0,Math.min(CYCLE,t));const age=t-FIRE,arrival=FIRE+DISTANCE/SPEED;
 return {time:t,age,arrival,flight:age>=0&&t<arrival,progress:Math.max(0,Math.min(1,age*SPEED/DISTANCE)),impact:t>=arrival&&t<arrival+.5,impactAge:t-arrival};
}
export function crystalFrame(r,t){
 if(!r.originalStage||r.paletteCorrected)return 0;
 const attack=t-.12;
 return attack>=0&&attack<.65?r.frameMap[r.idleCount+Math.min(r.frameMap.length-r.idleCount-1,Math.floor(attack/.65*(r.frameMap.length-r.idleCount)))]:r.frameMap[Math.floor(t*10)%r.idleCount];
}
export function trajectory(crystalY,degrees){
 const angle=degrees*Math.PI/180,dx=Math.sin(angle),dy=-Math.cos(angle);
 return {angle,dx,dy,start:{x:0,y:crystalY},end:{x:dx*DISTANCE,y:crystalY+dy*DISTANCE}};
}
export function tick(clock,now,active,rate){
 if(!active)return {time:clock.time,last:null};
 if(clock.last===null)return {time:clock.time,last:now};
 return {time:(clock.time+Math.max(0,now-clock.last)/1000*rate)%CYCLE,last:now};
}

// Cosmetic timeline only: no battle model, damage, targeting, or persistence.
export const LEVELS=[1,2,3,5,10,15,20,25];
export const SALVOS={1:[1],2:[2],3:[3],5:[3],10:[3],15:[2,1],20:[1,1,1],25:[1,1,1]};
export const CYCLE=1.5, FIRST_RELEASE=.18, SALVO_GAP=.11, FLIGHT_DISTANCE=110, SPEED=480, IMPACT_DURATION=.5;
export function sampleShot(level,time){
 const t=Math.max(0,Math.min(CYCLE,time));
 const groups=SALVOS[level].map((count,i)=>{
  const release=FIRST_RELEASE+i*SALVO_GAP,arrival=release+FLIGHT_DISTANCE/SPEED,age=t-release;
  return {count,release,arrival,age,progress:Math.max(0,Math.min(1,age*SPEED/FLIGHT_DISTANCE)),
   flying:t>=release&&t<arrival,impact:t>=arrival&&t<arrival+IMPACT_DURATION,impactAge:t-arrival};
 });
 const latest=[...groups].reverse().find(g=>t>=g.release);
 const recoilAge=latest?t-latest.release:Infinity;
 const recoil=recoilAge<.14?2.2*Math.sin(Math.PI*recoilAge/.14):0;
 const originalFrame=t>=.06&&t<.51?Math.min(5,Math.floor((t-.06)/.45*6)):0;
 const released=groups.filter(g=>t>=g.release).length;
 const phase=groups.some(g=>g.flying)?'Flug':groups.some(g=>g.impact)?'Treffer':released===0?'Bereit':'Nachladen';
 return {time:t,groups,recoil,originalFrame,released,phase};
}
export function geometry(weaponY,degrees){
 const angle=degrees*Math.PI/180,dx=Math.sin(angle),dy=-Math.cos(angle);
 const pivot={x:0,y:weaponY},start={x:dx*16,y:weaponY+dy*16};
 return {angle,dx,dy,pivot,start,end:{x:start.x+dx*FLIGHT_DISTANCE,y:start.y+dy*FLIGHT_DISTANCE}};
}
// No wall-clock catch-up after hidden/offscreen/pause; first active frame resets the origin.
export function tick(clock,now,active,rate){
 if(!active)return {time:clock.time,last:null};
 if(clock.last===null)return {time:clock.time,last:now};
 return {time:(clock.time+Math.max(0,now-clock.last)/1000*rate)%CYCLE,last:now};
}

import type { Shot } from './battle';

// World sprites use their ground point, never the elevated artwork or a HUD layer.
export const groundEffectDepth = 900;
export const worldEffectDepth = (groundY:number) => 1003 + groundY;
export function projectileDepth(shot:Shot, origin?:{x:number;y:number}, target?:{x:number;y:number}):number {
  if(!origin || !target) return worldEffectDepth(shot.y);
  const total=Math.hypot(target.x-origin.x,target.y-(origin.y-12));
  const remaining=Math.hypot(target.x-shot.x,target.y-shot.y);
  const lift=total>0?12*Math.min(1,remaining/total):0;
  return worldEffectDepth(shot.y+lift);
}

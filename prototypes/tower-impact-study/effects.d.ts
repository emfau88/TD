export const IMPACT_FRAME_SIZE: number;
export const IMPACT_FRAME_COUNT: number;
export const LEVELS: readonly number[];
export const NAMES: Readonly<Record<number, readonly string[]>>;
export interface ImpactProfile { i:number; life:number; scale:number; count:number; radius:number; trail:number; colors:readonly string[]; name:string }
export function profile(kind:number,level:number):ImpactProfile;
export function drawImpact(context:CanvasRenderingContext2D,kind:number,level:number,ageMs:number,base:(context:CanvasRenderingContext2D,progress:number)=>void):void;
export function drawTrail(context:CanvasRenderingContext2D,kind:number,level:number,x:number,y:number,dx:number,dy:number):void;

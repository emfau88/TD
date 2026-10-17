import type Phaser from 'phaser';

// Explicit contract for this asset. The original enemies retain their nine-tag
// animation parser; generated artwork does not pretend to have that metadata.
export const JELLY_ASSET='Lantern Jelly Pixel v1';
export const JELLY_SCALE=.83;
export const JELLY_FRAME_MS=100;
export const JELLY_DIRECTIONS=['down','up','side'] as const;
export type JellyDirection=typeof JELLY_DIRECTIONS[number];
export type JellyState='idle'|'move'|'heal'|'death';
export const JELLY_STATES:Record<JellyState,{start:number;count:number;loop:boolean}>={
  idle:{start:0,count:1,loop:true},move:{start:1,count:6,loop:true},
  heal:{start:7,count:4,loop:false},death:{start:11,count:5,loop:false},
};
export function jellyFrames(state:JellyState,direction:JellyDirection){
  const config=JELLY_STATES[state],base=JELLY_DIRECTIONS.indexOf(direction)*16;
  return Array.from({length:config.count},(_,index)=>base+config.start+index);
}
export function jellyFrame(state:JellyState,direction:JellyDirection,elapsedMs:number){
  const frames=jellyFrames(state,direction),index=Math.max(0,Math.floor((elapsedMs+.001)/JELLY_FRAME_MS));
  return frames[JELLY_STATES[state].loop?index%frames.length:Math.min(index,frames.length-1)];
}
export function makeJellyAnimations(scene:Phaser.Scene){
  if(!scene.textures.exists(JELLY_ASSET))return;
  for(const direction of JELLY_DIRECTIONS)for(const state of Object.keys(JELLY_STATES) as JellyState[]){
    const key=`${JELLY_ASSET}-${state}-${direction}`;
    if(scene.anims.exists(key))continue;
    scene.anims.create({key,frames:jellyFrames(state,direction).map(frame=>({key:JELLY_ASSET,frame})),frameRate:1000/JELLY_FRAME_MS,repeat:JELLY_STATES[state].loop?-1:0});
  }
}

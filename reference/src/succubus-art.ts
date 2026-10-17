import type Phaser from 'phaser';

// Each direction owns 24 consecutive slots in the eight-column sheet. Empty
// reserve slots are deliberately omitted from every animation.
export const SUCCUBUS_ASSET='Succubus Pixel v2';
export const SUCCUBUS_SCALE=1;
export const SUCCUBUS_FRAME_MS=100;
export const SUCCUBUS_DIRECTIONS=['down','up','side'] as const;
export type SuccubusDirection=typeof SUCCUBUS_DIRECTIONS[number];
export type SuccubusState='idle'|'move'|'dance'|'death';
export const SUCCUBUS_STATES:Record<SuccubusState,{start:number;count:number;frameMs:number;loop:boolean}>={
  idle:{start:0,count:1,frameMs:100,loop:true},
  move:{start:1,count:4,frameMs:150,loop:true},
  dance:{start:7,count:8,frameMs:190,loop:true},
  death:{start:15,count:6,frameMs:100,loop:false},
};
export function succubusFrames(state:SuccubusState,direction:SuccubusDirection){
  const config=SUCCUBUS_STATES[state],base=SUCCUBUS_DIRECTIONS.indexOf(direction)*24;
  return Array.from({length:config.count},(_,index)=>base+config.start+index);
}
export function succubusFrame(state:SuccubusState,direction:SuccubusDirection,elapsedMs:number){
  const config=SUCCUBUS_STATES[state],frames=succubusFrames(state,direction);
  const index=Math.max(0,Math.floor((elapsedMs+.001)/config.frameMs));
  return frames[config.loop?index%frames.length:Math.min(index,frames.length-1)];
}
export function makeSuccubusAnimations(scene:Phaser.Scene){
  if(!scene.textures.exists(SUCCUBUS_ASSET))return;
  for(const direction of SUCCUBUS_DIRECTIONS)for(const state of Object.keys(SUCCUBUS_STATES) as SuccubusState[]){
    const key=`${SUCCUBUS_ASSET}-${state}-${direction}`,config=SUCCUBUS_STATES[state];
    if(scene.anims.exists(key))continue;
    scene.anims.create({key,frames:succubusFrames(state,direction).map(frame=>({key:SUCCUBUS_ASSET,frame})),frameRate:1000/config.frameMs,repeat:config.loop?-1:0});
  }
}

import { COLS, ROWS, type GridPoint, type MapDef } from './data';
export const WIND_LAND=new Set<string>();
function island(left:number,top:number,width:number,height:number){for(let r=top;r<top+height;r++)for(let c=left;c<left+width;c++){
  if((r===top||r===top+height-1)&&(c===left||c===left+width-1))continue;WIND_LAND.add(`${c},${r}`);}}
island(0,4,7,7);island(10,1,7,6);island(10,10,8,5);island(21,4,7,8);
// The entry/exit remain open all the way to the viewport boundary.
for(const key of ['0,7','27,8','10,6','21,11'])WIND_LAND.add(key);
export const WIND_MAP:MapDef={id:3,name:'Windbruch',subtitle:'Vier schwebende Inseln über einem Wolkenmeer.',difficulty:'Begrenzte Bauflächen',seed:113,gold:460,
  paths:[[[-1,7],[3,7],[3,5],[6,5],[6,6],[12,6],[12,3],[14,3],[14,11],[23,11],[23,6],[25,6],[25,8],[28,8]]],
  air:[[-1,7],[7,5],[15,7],[22,9],[28,8]],water:[]};
// Void is blocked terrain just like deep water; bridge cells explicitly cross it.
for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(!WIND_LAND.has(`${c},${r}`))WIND_MAP.water.push([c,r,1,1]);
export const WIND_CRYSTALS:GridPoint[]=[[2,6],[5,9],[10,3],[15,2],[16,5],[11,12],[16,13],[22,5],[25,10],[26,7]];
export const WIND_ARCHES:GridPoint[]=[[12,2],[24,4],[4,8]];

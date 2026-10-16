import { COLS, ROWS, pathCells, waterCells, type GridPoint, type MapDef } from './data';
import { WOODLAND_MAP, WOODLAND_TREES, WOODLAND_FLOWERS, WOODLAND_ROCKS, WOODLAND_OBSTACLES } from './woodland-world';
import { WINTER_MAP, WINTER_TREES, WINTER_ROCKS, WINTER_CRYSTALS } from './winter-world';
import { WIND_MAP, WIND_CRYSTALS, WIND_ARCHES } from './wind-world';

export type RegionID='old-grove'|'lantern-marsh'|'mirror-winter'|'windbreak';
export type Bridge={col:number;row:number;direction:'horizontal'|'vertical'};
export type Region={key:RegionID;map:MapDef;intro:string;victory:string;trees:GridPoint[];flowers:GridPoint[];rocks:GridPoint[];
  bridges:Bridge[];bridgeCells:Set<string>;obstacles:Set<string>;heroes:GridPoint[];lanterns:GridPoint[];reeds:GridPoint[];stumps:GridPoint[];moss:GridPoint[];crystals:GridPoint[];arches:GridPoint[]};

const marsh:MapDef={id:1,name:'Laternenmoor',subtitle:'Drei Brücken. Vier bewachsene Ufer.',difficulty:'Fortgeschritten',seed:73,gold:390,
  paths:[[[-1,7],[3,7],[3,3],[6,3],[6,5],[13,5],[13,12],[22,12],[22,6],[25,6],[25,8],[28,8]]],
  air:[[-1,7],[6,6],[13,7],[21,8],[28,8]],
  // Connected channels; their union drives both the shore renderer and collision.
  water:[[7,0,3,16],[17,0,3,16],[10,8,7,3],[5,11,2,4],[16,1,1,3],[20,1,3,3],[23,2,2,2]]};
const bridges:Bridge[]=[{col:7,row:5,direction:'horizontal'},{col:13,row:8,direction:'vertical'},{col:17,row:12,direction:'horizontal'}];
const bridgeCells=new Set(bridges.flatMap(b=>Array.from({length:3},(_,i)=>`${b.col+(b.direction==='horizontal'?i:0)},${b.row+(b.direction==='vertical'?i:0)}`)));
const trees:GridPoint[]=[],occupied=new Set<string>(),water=waterCells(marsh),route=pathCells(marsh.paths[0]);
function tree(col:number,row:number){const key=`${col},${row}`;if(water.has(key)||route.has(key)||occupied.has(key))return;occupied.add(key);trees.push([col,row]);}
for(let col=0;col<COLS;col++){if(col%4!==2)tree(col,0);if(col%5!==1)tree(col,15);}
for(let row=1;row<15;row++){if(row<6||row>8)tree(0,row);if(row<7||row>9)tree(27,row);}
for(const [c,r]of [[1,1],[2,1],[1,2],[4,1],[5,1],[11,1],[12,1],[14,1],[15,1],[11,2],[25,1],[26,1],[26,2],
  [1,10],[2,11],[1,13],[2,14],[3,14],[10,14],[11,14],[15,14],[16,14],[24,14],[25,14],[26,13],[25,10],[26,11]] as GridPoint[])tree(c,r);
const lanterns:GridPoint[]=[[2,8],[6,6],[10,6],[12,7],[14,11],[16,13],[20,13],[24,7]];
const reeds:GridPoint[]=[[6,1],[6,9],[4,12],[6,15],[10,2],[10,7],[11,7],[15,7],[16,6],[15,11],[16,0],[16,5],[20,5],[20,8],[20,10],[16,15],[20,15],[23,4],[25,3]];
const stumps:GridPoint[]=[[1,12],[5,2],[15,2],[12,14],[24,4],[26,12]];
const rocks:GridPoint[]=[[4,10],[14,3],[21,14],[25,2]];
const moss:GridPoint[]=[[2,2],[5,7],[2,10],[3,13],[11,3],[14,6],[15,13],[11,12],[21,5],[23,10],[24,12],[26,5]];
const windBridges:Bridge[]=[{col:7,row:6,direction:'horizontal'},{col:14,row:7,direction:'vertical'},{col:18,row:11,direction:'horizontal'}];
export const REGIONS:Region[]=[
  {key:'old-grove',map:WOODLAND_MAP,intro:'Lichtungen, alte Bäume und zwei stille Teiche.',victory:'Der Hain ist gerettet.',
    trees:WOODLAND_TREES,flowers:WOODLAND_FLOWERS,rocks:WOODLAND_ROCKS,obstacles:WOODLAND_OBSTACLES,
    heroes:[[8,9],[9,9]],bridges:[],bridgeCells:new Set(),lanterns:[],reeds:[],stumps:[],moss:[],crystals:[],arches:[]},
  {key:'lantern-marsh',map:marsh,intro:'Leuchtende Ufer, enge Holzbrücken und stille Wasserarme.',victory:'Die Lichter des Moors bleiben an.',
    trees,flowers:[],rocks,bridges,bridgeCells,lanterns,reeds,stumps,moss,crystals:[],arches:[],heroes:[[11,6],[12,6]],
    obstacles:new Set([...trees,...lanterns,...reeds,...stumps,...rocks,[27,8]].map(([c,r])=>`${c},${r}`))},
  {key:'mirror-winter',map:WINTER_MAP,intro:'Zwei verschneite Pfade um einen stillen, gefrorenen See.',victory:'Der Spire übersteht den Winter.',
    trees:WINTER_TREES,flowers:[],rocks:WINTER_ROCKS,crystals:WINTER_CRYSTALS,arches:[],heroes:[[9,8],[10,8]],
    bridges:[],bridgeCells:new Set(),lanterns:[],reeds:[],stumps:[],moss:[],
    obstacles:new Set([...WINTER_TREES,...WINTER_ROCKS,...WINTER_CRYSTALS,[27,8]].map(([c,r])=>`${c},${r}`))},
  {key:'windbreak',map:WIND_MAP,intro:'Schwebende Felsen, leuchtende Kristalle und Brücken über den Wolken.',victory:'Der Spire hält dem Wind stand.',
    trees:[],flowers:[],rocks:[],crystals:WIND_CRYSTALS,arches:WIND_ARCHES,heroes:[[11,4],[12,4]],lanterns:[],reeds:[],stumps:[],moss:[],
    bridges:windBridges,bridgeCells:new Set(windBridges.flatMap(b=>Array.from({length:3},(_,i)=>`${b.col+(b.direction==='horizontal'?i:0)},${b.row+(b.direction==='vertical'?i:0)}`))),
    obstacles:new Set([...WIND_CRYSTALS,...WIND_ARCHES,[27,8]].map(([c,r])=>`${c},${r}`))},
];
export function isRegionID(value:unknown):value is RegionID{return REGIONS.some(region=>region.key===value);}
export function getRegion(key:RegionID){return REGIONS.find(region=>region.key===key)!;}

// Water uses 32px source pieces at 20 world units, exactly like the woodland.
// Only concave corners are new samples; no complete cross is stretched into a pond.
export function marshWaterSource(col:number,row:number,wet:(c:number,r:number)=>boolean):[number,number]{
  const n=!wet(col,row-1),s=!wet(col,row+1),w=!wet(col-1,row),e=!wet(col+1,row);
  if(n||s||w||e)return [w?160:e?256:192+(col%2)*32,n?32:s?384:(w||e?64:192)+(row%2)*32];
  if(!wet(col-1,row-1))return [152,152];
  if(!wet(col+1,row-1))return [264,152];
  if(!wet(col-1,row+1))return [152,264];
  if(!wet(col+1,row+1))return [264,264];
  return [192+(col%2)*32,192+(row%2)*32];
}

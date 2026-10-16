import { REGIONS, isRegionID, type RegionID } from './regions';
import { WoodlandSimulation, type WoodlandSnapshot } from './woodland-simulation';
import { REGION_WAVE_COUNT } from './region-waves';

export const SAVE_KEY='spire-woodland-v1'; // Keep the accepted forest's storage location.
export type RegionProgress={stars:number;best:number;checkpoint?:WoodlandSnapshot};
export type RegionSave={version:2;sound:boolean;selected:RegionID;maps:Record<RegionID,RegionProgress>};
export function decodeRegionSave(value:unknown):RegionSave{
  const raw=value&&typeof value==='object'?value as Record<string,any>:{};
  const maps={} as RegionSave['maps'];
  for(const region of REGIONS){
    // The previous single-map format becomes the woodland entry, without loss.
    const entry=(raw.version===2?raw.maps?.[region.key]:region.key==='old-grove'?raw:undefined)??{};
    const restored=WoodlandSimulation.restore(entry.checkpoint);
    maps[region.key]={stars:Number.isInteger(entry.stars)?Math.max(0,Math.min(3,entry.stars)):0,
      best:Number.isInteger(entry.best)?Math.max(0,Math.min(REGION_WAVE_COUNT,entry.best)):0,
      checkpoint:restored?.region.key===region.key?restored.snapshot():undefined};
  }
  return {version:2,sound:raw.sound!==false,selected:isRegionID(raw.selected)?raw.selected:'old-grove',maps};
}

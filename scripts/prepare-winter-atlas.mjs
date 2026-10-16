import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPNG,writePNG,blank,copyTile,normalizedProps,materialTile,connectedTile } from './pixel-atlas.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),assets=resolve(root,'public/assets');
const materials=await readPNG(resolve(assets,'Spiegelwinter Materials v1.png'));
const snow=materialTile(materials,0,[0xe5edf0,0xd2e0e8,0xbccfdc]);
const trail=materialTile(materials,2,[0x9eafc0,0xafc0cf,0xbdcdd8]);
const ice=materialTile(materials,3,[0x85bed0,0xa4d4df,0xcce9ed]);
const atlas=blank(512,320);[snow,trail,ice,snow].forEach((tile,i)=>copyTile(atlas,tile,i));
for(let mask=0;mask<16;mask++){
  copyTile(atlas,connectedTile(snow,trail,mask,28,[188,207,220,255]),4+mask);
  copyTile(atlas,connectedTile(snow,ice,mask,31,[204,233,237,255]),20+mask);
}
await writePNG(resolve(assets,'Spiegelwinter Tiles v1.png'),atlas);
const props=await readPNG(resolve(assets,'Spiegelwinter Props v1.png'));
await writePNG(resolve(assets,'Spiegelwinter Sprites v1.png'),normalizedProps(props,[
  {box:[112,95,451,649],foot:[335,741]}, {box:[689,134,500,610],foot:[902,741]},
  {box:[107,891,454,276],foot:[334,1164]}, {box:[802,885,287,308],foot:[947,1190]},
],1/12));
console.log('Winter atlas: 512x320, 64px cells; snow, trail, ice, 16 road connections and 16 ice connections. Props: 4x64px with fixed feet.');

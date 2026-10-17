import type { Assets } from './scene';
import { JELLY_ASSET } from './jelly-art';
import { SUCCUBUS_ASSET } from './succubus-art';
export const REGION_ASSETS:Assets={
  [JELLY_ASSET]:{sheetWidth:512,sheetHeight:384,width:64,height:64,cols:8,rows:6},
  [SUCCUBUS_ASSET]:{sheetWidth:512,sheetHeight:576,width:64,height:64,cols:8,rows:9},
  'Laternenmoor Props v1':{sheetWidth:1254,sheetHeight:1254},
  'Spiegelwinter Tiles v1':{sheetWidth:512,sheetHeight:320,width:64,height:64,cols:8,rows:5},
  'Spiegelwinter Sprites v1':{sheetWidth:256,sheetHeight:64,width:64,height:64,cols:4,rows:1},
  'Windbruch Tiles v1':{sheetWidth:512,sheetHeight:448,width:64,height:64,cols:8,rows:7},
  'Windbruch Sprites v1':{sheetWidth:256,sheetHeight:64,width:64,height:64,cols:4,rows:1},
  'Windbruch Details v1':{sheetWidth:384,sheetHeight:192},
};

export const CELL = 40;
export const COLS = 28;
export const ROWS = 16;
export const WIDTH = COLS * CELL;
export const HEIGHT = ROWS * CELL;
export type Point = { x: number; y: number };
export type GridPoint = [number, number];
export type Priority = 'first' | 'strong' | 'near' | 'last';
export type HeroID = 'wisp' | 'mara' | 'runa' | 'ilyra';
export type Theme = 'forest' | 'marsh' | 'wind' | 'ember' | 'frost' | 'moon';
export type TowerDef = {
  id: number; name: string; role: string; description: string; cost: number;
  damage: number; range: number; cooldown: number; color: number; targets: 'all' | 'ground';
  splash?: number; slow?: number; burn?: number; chain?: number; pierce?: boolean;
};
export const TOWERS: TowerDef[] = [
  { id: 1, name: 'Waldwächter', role: 'Allrounder', description: 'Zuverlässige Pfeile gegen Boden- und Fluggegner.', cost: 75, damage: 14, range: 132, cooldown: .6, color: 0xe3cf87, targets: 'all' },
  { id: 2, name: 'Frostkristall', role: 'Verlangsamung', description: 'Verlangsamt Gegner um 45 %. Ideal an Wegkreuzungen.', cost: 110, damage: 7, range: 126, cooldown: .9, color: 0x91e2ee, targets: 'all', slow: .45 },
  { id: 3, name: 'Steinschleuder', role: 'Flächenschaden', description: 'Schwere Geschosse treffen Gruppen von Bodengegnern.', cost: 135, damage: 34, range: 156, cooldown: 1.55, color: 0xd5a69c, targets: 'ground', splash: 52 },
  { id: 4, name: 'Scharfschütze', role: 'Rüstungsbrecher', description: 'Große Reichweite. Bolzen durchdringen jede Rüstung.', cost: 170, damage: 53, range: 215, cooldown: 1.85, color: 0xc7e9a8, targets: 'all', pierce: true },
  { id: 5, name: 'Sturmlicht', role: 'Kettenblitz', description: 'Blitze springen auf bis zu drei nahe Gegner über.', cost: 155, damage: 18, range: 136, cooldown: 1, color: 0x9edfea, targets: 'all', chain: 3 },
  { id: 6, name: 'Schnellfeuer', role: 'Hohe Feuerrate', description: 'Schnelle Salven halten Schwärme und Flieger auf.', cost: 115, damage: 6, range: 116, cooldown: .21, color: 0xf2da99, targets: 'all' },
  { id: 7, name: 'Glutwerfer', role: 'Brandschaden', description: 'Feuerbälle verbrennen Bodengegner über mehrere Sekunden.', cost: 145, damage: 17, range: 125, cooldown: .85, color: 0xf8a576, targets: 'ground', splash: 30, burn: 8 },
  { id: 8, name: 'Sonnenobelisk', role: 'Schwere Magie', description: 'Mächtige Energiewellen durchdringen Rüstung und treffen Gruppen.', cost: 210, damage: 48, range: 146, cooldown: 1.45, color: 0xffc77e, targets: 'all', splash: 42, pierce: true },
];
export type EnemyDef = { id: string; name: string; hp: number; speed: number; gold: number; flying: boolean; armor: number; lives: number; shieldRange?: number; shieldTargets?: number; heal?: number; haste?: number; sabotage?: number; texture?: string; };
export const ENEMIES: EnemyDef[] = [
  { id: 'Leafbug', name: 'Blattkäfer', hp: 30, speed: 57, gold: 10, flying: false, armor: 0, lives: 1 },
  { id: 'Firebug', name: 'Feuerkäfer', hp: 48, speed: 78, gold: 13, flying: false, armor: 0, lives: 1 },
  { id: 'Scorpion', name: 'Skorpion', hp: 115, speed: 44, gold: 19, flying: false, armor: .25, lives: 2 },
  { id: 'Magma Crab', name: 'Magmakrabbe', hp: 195, speed: 34, gold: 25, flying: false, armor: .4, lives: 2 },
  { id: 'Flying Locust', name: 'Flugheuschrecke', hp: 35, speed: 63, gold: 13, flying: true, armor: 0, lives: 1 },
  { id: 'Firewasp', name: 'Feuerwespe', hp: 60, speed: 72, gold: 16, flying: true, armor: 0, lives: 1 },
  { id: 'Clampbeetle', name: 'Panzerflieger', hp: 110, speed: 45, gold: 22, flying: true, armor: .28, lives: 2 },
  { id: 'Voidbutterfly', name: 'Leerenfalter', hp: 85, speed: 84, gold: 20, flying: true, armor: .12, lives: 1 },
  { id: 'Sternenrichter', name: 'Sternenrichter', hp: 135, speed: 48, gold: 30, flying: false, armor: .1, lives: 2, shieldRange: 125, shieldTargets: 2 },
  { id: 'Lantern Jelly', name: 'Laternenqualle', hp: 90, speed: 43, gold: 24, flying: true, armor: 0, lives: 1, heal: 7, texture: 'Voidbutterfly' },
  { id: 'Root Herald', name: 'Wurzeltrommler', hp: 125, speed: 39, gold: 25, flying: false, armor: .15, lives: 2, haste: .25, texture: 'Scorpion' },
  { id: 'Frost Ram', name: 'Frostwidder', hp: 210, speed: 42, gold: 30, flying: false, armor: .32, lives: 2, sabotage: .3, texture: 'Magma Crab' },
];
export type MapDef = {
  id: number; name: string; subtitle: string; difficulty: string;
  paths: GridPoint[][]; air: GridPoint[]; water: [number, number, number, number][]; seed: number; gold: number;
  theme?: Theme; waves?: number; goal?: GridPoint;
  chapter?: number; mission?: number; campaignOrder?: number; heroChoices?: HeroID[];
  islands?: [number,number,number,number][];
  objectives?: { id:string; kind:'rune'|'cache'|'station'; at:GridPoint; label:string; reward:number; required?:boolean }[];
  mechanism?: string; story?: { intro:string; outro:string; speaker:string };
  platforms?: [number, number, number, number][];
  routePhases?: { fromWave: number; label: string; paths: number[] }[];
};
export const MAPS: MapDef[] = [
  { id: 0, name: 'Der alte Hain', subtitle: 'Wo die Wächter erwachen', difficulty: 'Einstieg', seed: 11, gold: 350,
    paths: [[[-1,7],[4,7],[4,3],[10,3],[10,11],[17,11],[17,5],[24,5],[24,8],[28,8]]],
    air: [[-1,7],[6,6],[12,8],[20,7],[28,8]], water: [[13,2,4,3],[20,11,4,3]] },
  { id: 1, name: 'Die Nebelbrücke', subtitle: 'Über stillen Wassern', difficulty: 'Fortgeschritten', seed: 31, gold: 390,
    paths: [[[-1,4],[7,4],[7,11],[12,11],[12,7],[19,7],[19,3],[24,3],[24,8],[28,8]]],
    air: [[-1,4],[8,6],[16,7],[23,6],[28,8]], water: [[13,5,5,5],[2,11,3,3]] },
  { id: 2, name: 'Die letzte Lichtung', subtitle: 'Zwei Wege. Ein letzter Spire.', difficulty: 'Herausfordernd', seed: 51, gold: 440,
    paths: [[[-1,3],[5,3],[5,7],[10,7],[10,12],[19,12],[19,8],[28,8]], [[-1,12],[5,12],[5,7],[10,7],[10,3],[19,3],[19,8],[28,8]]],
    air: [[-1,8],[8,8],[16,7],[23,8],[28,8]], water: [[13,6,4,4]] },
  { id: 3, name: 'Die Mondwarte', subtitle: 'Mara und das Herz der Sterne', difficulty: 'Neues Kapitel', seed: 71, gold: 520, theme: 'moon', waves: 10, goal: [14,8],
    paths: [
      [[2,2],[8,2],[8,5],[19,5],[19,8],[14,8]],
      [[25,2],[22,2],[22,11],[10,11],[10,8],[14,8]],
      [[2,13],[5,13],[5,5],[19,5],[19,8],[14,8]],
      [[25,13],[22,13],[22,11],[10,11],[10,8],[14,8]],
    ],
    air: [[-1,8],[4,8],[10,6],[19,7],[14,8]], water: [],
    platforms: [[12,6,5,5],[1,1,3,3],[24,1,3,3],[1,12,3,3],[24,12,3,3]],
    routePhases: [
      { fromWave: 1, label: 'Nordportale', paths: [0,1] },
      { fromWave: 4, label: 'Südportale', paths: [2,3] },
      { fromWave: 7, label: 'Alle Portale', paths: [0,1,2,3] },
    ] },
];

const REGIONS: {theme:Theme; title:string; missions:[string,string,string]; speaker:string; intro:string; outro:string; mechanism:string}[] = [
  {theme:'forest',title:'Mooshain',missions:['Die widerspenstige Weiche','Wurzeln im Getriebe','Das erste Herz'],speaker:'Mara',intro:'Der erste Kern steckt unter alten Wurzeln. Wisp behauptet, der Wald habe ihn persönlich eingeladen. Der Wald bestreitet das.',outro:'Ein Kern erwacht. Mara notiert: Wurzeln hören auf Werkzeug. Wisp notiert: Mara hört nicht auf Wisp.',mechanism:'Ab Welle 4 wechseln die Gegner auf den südlichen Waldweg, ab Welle 7 greifen beide Seiten an. Beide Wege bleiben für Türme frei.'},
  {theme:'marsh',title:'Laternenmoor',missions:['Die Fährfrau verlangt Kaffee','Nasse Füße, trockener Humor','Runas Laternenfest'],speaker:'Runa',intro:'Runa kennt jeden Steg. Ihre Fähre ist gestrandet, ihre Geduld ebenfalls. Die Laternenquallen pflegen leider die falsche Seite.',outro:'Runa schließt sich der Reise an. „Ich komme nur wegen des Kaffees.“ Mara hat vorsorglich zwei Tassen eingepackt.',mechanism:'Ab Welle 4 kommen die Gegner über den südlichen Steg, ab Welle 7 über beide. Laternenquallen heilen nahe Verbündete; das Wasser bleibt unbegehbar.'},
  {theme:'wind',title:'Windbruch',missions:['Gegenwind mit Ansage','Die verlorene Staffel','Ilyras letzter Anflug'],speaker:'Ilyra',intro:'Ilyras Staffel ist verschwunden. Zwischen schwebenden Felsen hängt nur ein zerrissenes Banner. Wisp nennt es ausgesprochen ungünstiges Wetter.',outro:'Die Staffel lebt. Ilyra bleibt trotzdem: „Jemand muss hier die Flughöhe halten.“ Mara: „Und die Leiter.“',mechanism:'Zwei Luftkorridore wechseln mit den Windphasen. Die angekündigte Flugroute ist vor jeder Welle sichtbar.'},
  {theme:'ember',title:'Glutgarten',missions:['Nicht an diesem Ventil drehen','Die Nachtschicht','Herz der Schmiede'],speaker:'Mara',intro:'Die Werkhallen laufen seit hundert Jahren ohne Aufsicht. Wisp hat bereits ein Schild mit „Nicht anfassen“ angefasst.',outro:'Die Schmiede kühlt ab. Mara erklärt die Explosion zur erfolgreichen Druckprüfung. Niemand widerspricht laut.',mechanism:'Ab Welle 4 wechseln die Gegner den Werkhallenzugang, ab Welle 7 nutzen sie beide. Frostwidder bremsen nahe Türme um 30 %.'},
  {theme:'frost',title:'Spiegelwinter',missions:['Glätte ohne Gewähr','Doppelt hält kälter','Unter dem gefrorenen See'],speaker:'Runa',intro:'Im Eis spiegeln sich Dinge, die noch nicht passiert sind. Mara sieht eine Umarmung. Wisp sieht seine Heizkosten.',outro:'Der fünfte Kern taut auf. Runa behauptet, alle seien emotional gewachsen. Ilyra verlangt Messwerte.',mechanism:'Ab Welle 4 greifen die Gegner über den zweiten Eisweg an, ab Welle 7 über beide. Frostwidder stören nahe Türme; beide Eiswege bleiben für Bauten gesperrt.'},
  {theme:'moon',title:'Mondwarte',missions:['Ankunft ohne Geländer','Die falsche Sternstunde','Die Mondwarte'],speaker:'Vesper',intro:'Vesper wollte den Sternensturm aufhalten. Stattdessen zerbrach das Netz. Nun hält sie den letzten Kern fest, damit ihr Fehler nicht auch noch die Welt verschluckt.',outro:'Sechs Kerne leuchten wieder. Vesper legt die Krone ab. Mara nimmt Wisps Hand: „Diesmal hältst du mich fest.“ Wisp: „Endlich eine eindeutige Arbeitsanweisung.“',mechanism:'Die Sternportale wechseln zwischen Nord, Süd und beiden Seiten. Sternenrichter schützen zwei nahe Gegner; ihre sichtbaren Verbindungen verraten die Quelle.'},
];

function campaignMap(chapter:number, mission:number): MapDef {
  const region=REGIONS[chapter], order=chapter*3+mission;
  const id=order===17?3:order<15?order+4:order+4;
  const upper=2+(chapter%3), lower=12-(chapter%2), elbow=5+mission*2;
  const turn=16+(chapter%3), goal:GridPoint=[26,8];
  const paths:GridPoint[][]=mission===0?[
    [[-1,upper],[elbow,upper],[elbow,10],[turn,10],[turn,5],[23,5],[23,8],goal],
    [[-1,lower],[elbow,lower],[elbow,10],[turn,10],[turn,5],[23,5],[23,8],goal],
  ]:mission===1?[
    [[-1,upper],[8,upper],[8,6],[18,6],[18,12],[24,12],[24,8],goal],
    [[-1,lower],[4,lower],[4,8],[13,8],[13,3],[24,3],[24,8],goal],
  ]:[
    [[-1,upper],[6,upper],[6,7],[12,7],[12,12],[20,12],[20,8],goal],
    [[-1,lower],[6,lower],[6,7],[12,7],[12,2],[20,2],[20,8],goal],
  ];
  const heroChoices:HeroID[]=chapter<2?['wisp','mara']:chapter<3?['wisp','mara','runa']:['wisp','mara','runa','ilyra'];
  const map:MapDef={id,name:region.missions[mission],subtitle:`${region.title} · Kapitel ${chapter+1}.${mission+1}`,difficulty:mission===2?'Kapitel-Finale':'Kampagne',seed:100+order*19,gold:440+chapter*25,theme:region.theme,chapter,mission,campaignOrder:order,heroChoices,waves:mission===2?10:8,goal,paths,
    air:[[-1,5],[7,5],[15,9],[23,8],goal],water:[],mechanism:region.mechanism,story:{speaker:region.speaker,intro:region.intro,outro:region.outro},
    routePhases:[{fromWave:1,label:mission===1?'Oberer Korridor':'Erste Route',paths:[0]},{fromWave:4,label:region.theme==='marsh'?'Südlicher Steg':region.theme==='frost'?'Zweiter Eisweg':'Zweite Route',paths:[1]},{fromWave:7,label:'Beide Ankünfte',paths:[0,1]}],
    objectives:[{id:'supply',kind:'cache',at:[22,10],label:'Verlorene Werkzeugkiste',reward:65},{id:'heart',kind:'rune',at:[24,6],label:mission===2?'Sternenkern reparieren':'Wegstein aktivieren',reward:45,required:mission===2}],
  };
  if(region.theme==='marsh'){
    map.water=[[10,10,5,4],[18,1,4,3],[1,5,3,3]];
    map.platforms=[[1,1,8,4],[4,8,7,6],[11,3,9,5],[16,9,10,5],[22,4,5,6]];
  }
  if(region.theme==='forest')map.water=[[14,3,3,2]];
  if(region.theme==='ember')map.water=[[10,2,3,3],[14,11,3,3]];
  if(region.theme==='frost')map.water=[[13,8,5,4]];
  if(region.theme==='wind'){
    map.islands=[[4,upper,5,3.4],[7,9,4.2,4.6],[14,6,4.5,4.6],[20,9,4.2,4.8],[24,6,4,5.7]];
    map.water=[];
  }
  if(region.theme==='moon'){
    map.goal=[14,8];map.gold=590+mission*25;map.air=[[-1,7],[5,5],[12,5],[20,8],[14,8]];
    map.paths=mission===0?[
      [[3,3],[14,2],[14,8]],[[24,12],[14,13],[14,8]],
    ]:mission===1?[
      [[3,12],[14,13],[14,8]],[[24,3],[14,2],[14,8]],
    ]:[
      [[3,3],[14,2],[14,8]],[[24,3],[14,2],[14,8]],
      [[3,12],[14,13],[14,8]],[[24,12],[14,13],[14,8]],
    ];
    map.islands=[[14,8,2.7,2.2],[3,3,2.3,1.9],[24,3,2.3,1.9],[3,12,2.3,1.9],[24,12,2.3,1.9],[14,2,2.4,1.8],[14,13,2.4,1.6]];
    map.objectives=[{id:'supply',kind:'cache',at:[15,14],label:'Wisps vergessene Werkzeugkiste',reward:65},{id:'heart',kind:'rune',at:[15,1],label:'Mondkern stabilisieren',reward:60,required:mission===2}];
    map.routePhases=mission===2?[{fromWave:1,label:'Nordportale',paths:[0,1]},{fromWave:4,label:'Südportale',paths:[2,3]},{fromWave:7,label:'Alle Portale',paths:[0,1,2,3]}]:[{fromWave:1,label:'Erstes Sternportal',paths:[0]},{fromWave:4,label:'Zweites Sternportal',paths:[1]},{fromWave:7,label:'Beide Sternportale',paths:[0,1]}];
  }
  const stations:Partial<Record<Theme,{label:string;description:string}>>={
    forest:{label:'Wurzelrune',description:'Ein Begleiter kann die Wurzelrune während einer Welle aktivieren: 12 Sekunden lang werden Bodengegner in ihrer Nähe um 50 % gebremst.'},
    marsh:{label:'Nebelglocke',description:'Ein Begleiter kann die Nebelglocke läuten: Die Heilauren aller Laternenquallen verstummen für 15 Sekunden.'},
    ember:{label:'Dampfventil',description:'Ein Begleiter kann das Dampfventil öffnen: Alle Türme feuern für 12 Sekunden 25 % schneller.'},
    frost:{label:'Taurune',description:'Ein Begleiter kann die Taurune aktivieren: Frostwidder können für 15 Sekunden keine Türme stören.'},
  };
  const station=stations[region.theme];
  if(station){map.objectives!.push({id:'region-station',kind:'station',at:[21,9],label:station.label,reward:0});map.mechanism+=` ${station.description} Ab der Aktivierung gelten 30 Sekunden Abklingzeit.`;}
  return map;
}

// IDs remain stable for existing saves; the final Moonwatch is still map 3.
for(let chapter=0;chapter<6;chapter++)for(let mission=0;mission<3;mission++){
  const map=campaignMap(chapter,mission);MAPS[map.id]=map;
}
/** Five authored missions form the playable release; other drafts are retained as source data only. */
export const PLAYABLE_MAP_IDS=[4,7,10,16,3] as const;
Object.assign(MAPS[4],{
  goal:[25,8],waves:10,gold:440,
  paths:[
    [[-1,6],[6,6],[6,2],[10,2],[10,10],[18,10],[18,7],[24,7],[24,8],[25,8]],
    [[-1,12],[4,12],[4,9],[10,9],[10,10],[18,10],[18,7],[24,7],[24,8],[25,8]],
  ],
  air:[[-1,6],[6,5],[13,8],[21,6],[25,8]],water:[[12,2,6,4],[19,11,5,3]],
  objectives:[
    {id:'supply',kind:'cache',at:[8,11],label:'Verlorene Werkzeugkiste',reward:65},
    {id:'heart',kind:'rune',at:[21,5],label:'Waldkern reparieren',reward:45,required:true},
    {id:'region-station',kind:'station',at:[16,9],label:'Wurzelrune',reward:0},
  ],
} satisfies Partial<MapDef>);
Object.assign(MAPS[7],{
  goal:[25,8],waves:10,gold:470,
  platforms:[[1,2,6,4],[8,8,6,5],[15,2,6,5],[22,5,5,7]],water:[],
  paths:[
    [[-1,4],[4,4],[4,10],[10,10],[10,4],[18,4],[18,8],[25,8]],
    [[-1,12],[4,12],[4,10],[10,10],[10,4],[18,4],[18,8],[25,8]],
  ],
  air:[[-1,4],[5,6],[13,7],[21,5],[25,8]],
  objectives:[
    {id:'supply',kind:'cache',at:[9,12],label:'Verlorene Werkzeugkiste',reward:65},
    {id:'heart',kind:'rune',at:[24,6],label:'Moorkern reparieren',reward:45,required:true},
    {id:'region-station',kind:'station',at:[17,6],label:'Nebelglocke',reward:0},
  ],
} satisfies Partial<MapDef>);
Object.assign(MAPS[10],{
  goal:[24,6],waves:10,gold:510,
  islands:[[3,3,3.1,2.2],[8,11,3.2,2.6],[14,3,3.2,2.1],[18,11,3.1,2.7],[24,6,3,3.1]],
  paths:[
    [[-1,3],[3,3],[8,11],[14,3],[18,11],[24,6]],
    [[-1,12],[8,11],[14,3],[18,11],[24,6]],
  ],
  air:[[-1,3],[6,4],[13,9],[20,4],[24,6]],water:[],
  objectives:[
    {id:'supply',kind:'cache',at:[17,12],label:'Verlorene Werkzeugkiste',reward:65},
    {id:'heart',kind:'rune',at:[14,2],label:'Windkern reparieren',reward:45,required:true},
  ],
} satisfies Partial<MapDef>);
Object.assign(MAPS[16],{
  goal:[25,8],waves:10,gold:540,water:[[9,4,10,8]],
  paths:[
    [[-1,3],[7,3],[7,1],[21,1],[21,6],[25,6],[25,8]],
    [[-1,12],[7,12],[7,8],[21,8],[21,10],[25,10],[25,8]],
  ],
  air:[[-1,7],[7,5],[15,8],[22,6],[25,8]],
  objectives:[
    {id:'supply',kind:'cache',at:[5,10],label:'Verlorene Werkzeugkiste',reward:65},
    {id:'heart',kind:'rune',at:[22,3],label:'Frostkern reparieren',reward:45,required:true},
    {id:'region-station',kind:'station',at:[21,9],label:'Taurune',reward:0},
  ],
} satisfies Partial<MapDef>);
export const PLAYABLE_MAPS=PLAYABLE_MAP_IDS.map(id=>MAPS[id]);
export const CAMPAIGN_MAPS=MAPS.filter(map=>map.campaignOrder!==undefined).sort((a,b)=>a.campaignOrder!-b.campaignOrder!);
export function center([col, row]: GridPoint): Point { return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 }; }
export function pathPoints(nodes: GridPoint[]): Point[] { return nodes.map(center); }
export function pathCells(nodes: GridPoint[]): Set<string> {
  const cells = new Set<string>();
  for (let i = 1; i < nodes.length; i++) {
    const [ax,ay] = nodes[i-1], [bx,by] = nodes[i];
    const steps = Math.max(Math.abs(bx-ax), Math.abs(by-ay));
    if(steps===0){cells.add(`${ax},${ay}`);continue;}
    let previous:GridPoint=[ax,ay];
    for (let s=0;s<=steps;s++){
      const current:GridPoint=[Math.round(ax+(bx-ax)*s/steps),Math.round(ay+(by-ay)*s/steps)];cells.add(`${current[0]},${current[1]}`);
      if(current[0]!==previous[0]&&current[1]!==previous[1]){cells.add(`${previous[0]},${current[1]}`);cells.add(`${current[0]},${previous[1]}`);}
      previous=current;
    }
  }
  return cells;
}
export function waterCells(map: MapDef): Set<string> {
  const cells=new Set<string>();
  for (const [x,y,w,h] of map.water) for(let c=x;c<x+w;c++) for(let r=y;r<y+h;r++) {
    if(map.id===16){
      const radius=Math.min(72,w*CELL/2,h*CELL/2),px=(c-x+.5)*CELL,py=(r-y+.5)*CELL;
      const cornerX=Math.max(radius,Math.min(w*CELL-radius,px)),cornerY=Math.max(radius,Math.min(h*CELL-radius,py));
      if(Math.hypot(px-cornerX,py-cornerY)>radius)continue;
    }
    cells.add(`${c},${r}`);
  }
  return cells;
}
/** Solid observatory platforms: narrow bridge corridors and larger landing plazas. */
export function platformCells(map: MapDef): Set<string> {
  const cells = new Set<string>();
  const add = (col: number, row: number) => { if(col>=0&&col<COLS&&row>=0&&row<ROWS)cells.add(`${col},${row}`); };
  if(map.islands){
    for(let col=0;col<COLS;col++)for(let row=0;row<ROWS;row++){
      if(map.islands.some(([cx,cy,rx,ry])=>Math.pow((col-cx)/(rx-.35),2)+Math.pow((row-cy)/(ry-.35),2)<=1))add(col,row);
    }
    for(const path of map.paths)for(const key of pathCells(path)){const [col,row]=key.split(',').map(Number);add(col,row);}
    return cells;
  }
  if(!map.platforms){for(let col=0;col<COLS;col++)for(let row=0;row<ROWS;row++)add(col,row);return cells;}
  for(const [col,row,width,height] of map.platforms)for(let x=col;x<col+width;x++)for(let y=row;y<row+height;y++)add(x,y);
  for(const path of map.paths)for(const key of pathCells(path)){
    const [col,row]=key.split(',').map(Number);
    add(col,row);add(col-1,row);add(col+1,row);add(col,row-1);add(col,row+1);
  }
  return cells;
}
export function mapRoutePhase(map: MapDef, wave: number) {
  return map.routePhases?.filter(phase=>wave>=phase.fromWave).at(-1);
}
export function seeded(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
export function waveComposition(wave: number, mapId = 0): { type: EnemyDef; boss: boolean }[] {
  const map=MAPS[mapId];
  if(map?.campaignOrder!==undefined){
    const chapter=map.chapter??0;
    const regional=[[0,1,10,4,2],[0,1,9,4,2],[4,5,10,6,2],[1,3,11,5,2],[0,11,2,6,9],[0,1,8,7,2]][chapter];
    const pattern=wave<3?[regional[0],regional[1],regional[0],0]:wave<5?[regional[0],regional[2],regional[0],regional[3]]:regional;
    const count=7+Math.floor(wave*1.15)+(map.mission??0);
    const result=Array.from({length:count},(_,index)=>({type:ENEMIES[pattern[index%pattern.length]],boss:false}));
    if(wave===5||wave===(map.waves??10))result.push({type:ENEMIES[wave===5?regional[4]:regional[2]],boss:true});
    return result;
  }
  const available = wave < 3 ? [0] : wave < 5 ? [0,1] : wave < 7 ? [0,1,4] : wave < 9 ? [0,1,2,4] : wave < 12 ? [0,1,2,4,5] : wave < 15 ? [1,2,3,4,5,6] : [0,1,2,3,4,5,6,7];
  const count = 7 + Math.floor(wave * 1.15);
  const result = Array.from({length:count},(_,i)=>({ type: ENEMIES[available[(i*3+wave+Math.floor(i/3))%available.length]], boss: false }));
  if(wave%5===0) result.push({type: ENEMIES[wave===5?2:3], boss: true});
  return result;
}

import Phaser from 'phaser';
import { CELL,WIDTH,HEIGHT,center,pathCells,seeded,type HeroID,type Point } from './data';
import { Simulation,type Event } from './simulation';

const PALETTES={
  forest:{sky:'#102b24',bottom:'#284d30',edge:'#b6c683',side:'#384c35',light:0xd7ed9b,route:0xe8ce8e},
  marsh:{sky:'#10252c',bottom:'#1b4e52',edge:'#a4bd80',side:'#263d39',light:0xd5eb8c,route:0xf0ce83},
  wind:{sky:'#6899bf',bottom:'#d2e4e5',edge:'#eee0ad',side:'#59677f',light:0xf8e7a7,route:0xf7d28c},
  ember:{sky:'#211c24',bottom:'#4d2b2a',edge:'#b4a294',side:'#373643',light:0xffbd65,route:0xffc278},
  frost:{sky:'#304c70',bottom:'#93bed1',edge:'#d8f2fc',side:'#446b91',light:0xb4f4ff,route:0xefd7b0},
  moon:{sky:'#0b102a',bottom:'#23244b',edge:'#bdc7e3',side:'#384364',light:0xa9edee,route:0xc3b2ff},
};
type Theme=keyof typeof PALETTES;
type HeroView={sprite:Phaser.GameObjects.Sprite;shadow:Phaser.GameObjects.Ellipse;ring:Phaser.GameObjects.Graphics;label:Phaser.GameObjects.Text;animation:string;};
const NAMES:Record<HeroID,string>={mara:'Mara',wisp:'Wisp',runa:'Runa',ilyra:'Ilyra'};
const COLORS:Record<HeroID,number>={mara:0xf4ba88,wisp:0x95f1ce,runa:0xc4df95,ilyra:0xbadfff};

/** The world and collision geometry share the same islands and route centre lines. */
export class CampaignWorld {
  private objects:Phaser.GameObjects.GameObject[]=[];
  private textureKeys:string[]=[];
  private heroViews=new Map<HeroID,HeroView>();
  private objectiveViews=new Map<string,{icon:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text;glow:Phaser.GameObjects.Graphics}>();
  private links:Phaser.GameObjects.Graphics;
  private routes:Phaser.GameObjects.Graphics;
  private orders:Phaser.GameObjects.Graphics;
  private portals:Phaser.GameObjects.Image[]=[];
  private portalLights:Phaser.GameObjects.Arc[]=[];
  private bubble:Phaser.GameObjects.Container;
  private bubbleText:Phaser.GameObjects.Text;
  private bubbleBack:Phaser.GameObjects.Graphics;
  private time=0;
  private lastChatter=-18000;
  private bubbleUntil=0;
  private speaker:HeroID='mara';
  private lastRoute='';
  private dialogue=true;
  private selected?:HeroID;
  private theme:Theme;
  private motes:{image:Phaser.GameObjects.Arc;x:number;y:number;speed:number;phase:number}[]=[];
  private heroEffects:{x:number;y:number;color:number;radius:number;started:number}[]=[];
  private landmarkCell?:[number,number];
  private waterPainter?:(frame:number)=>void;
  private waterFrame=-1;
  private objectiveLabel(kind:string){return kind==='rune'?'RUNE':kind==='cache'?'VORRÄTE':({forest:'WURZELRUNE',marsh:'NEBELGLOCKE',ember:'DAMPFVENTIL',frost:'TAURUNE',wind:'WINDRUNE',moon:'STERNENRUNE'}[this.theme]);}
  private objectiveFrame(kind:string){return kind==='rune'?2:kind==='cache'?0:this.theme==='ember'?4:this.theme==='forest'?5:this.theme==='marsh'?6:2;}

  constructor(private scene:Phaser.Scene,private sim:Simulation){
    this.theme=(sim.map.theme??'forest') as Theme;
    for(const[cx,cy]of [...(sim.map.islands??[])].sort((a,b)=>b[1]-a[1])){
      if(sim.map.paths.some(path=>Math.hypot(path[0][0]-cx,path[0][1]-cy)<2)||Math.hypot(cx-(sim.map.goal?.[0]??27),cy-(sim.map.goal?.[1]??8))<4)continue;
      const col=cx-1,row=cy+1,position=center([col,row]);
      if(position.y<HEIGHT-45&&position.y>80&&simCanDecorate(sim,col,row)){this.landmarkCell=[col,row];break;}
    }
    if(sim.map.id===7)this.landmarkCell=[12,8];
    if(sim.map.id===16)this.landmarkCell=[3,6];
    this.drawTerrain();
    this.routes=this.keep(scene.add.graphics().setDepth(15));
    this.drawLandmarks();
    this.links=this.keep(scene.add.graphics().setDepth(4900));
    this.orders=this.keep(scene.add.graphics().setDepth(4901));
    this.bubbleBack=scene.add.graphics();
    this.bubbleText=scene.add.text(0,0,'',{fontFamily:'system-ui, sans-serif',fontSize:'12px',color:'#fbf0d7',lineSpacing:2,wordWrap:{width:215},padding:{x:12,y:10}});
    this.bubble=this.keep(scene.add.container(0,0,[this.bubbleBack,this.bubbleText]).setDepth(7200).setVisible(false));
    for(const hero of sim.heroes){
      const texture=`Hero ${NAMES[hero.id]}`;
      const fallback=hero.id==='wisp'?'Wisp - Animations':'Mara';
      const sprite=this.keep(scene.add.sprite(hero.x,hero.y,scene.textures.exists(texture)?texture:fallback,0).setOrigin(.5,.95).setDisplaySize(68,68).setDepth(hero.y+1004));
      const shadow=this.keep(scene.add.ellipse(hero.x,hero.y+2,26,10,0x07121e,.45).setDepth(hero.y+900));
      const ring=this.keep(scene.add.graphics().setDepth(1800));
      const label=this.keep(scene.add.text(hero.x,hero.y+11,NAMES[hero.id],{fontFamily:'system-ui, sans-serif',fontSize:'10px',fontStyle:'bold',color:'#fff4d6',stroke:'#122332',strokeThickness:4}).setOrigin(.5).setDepth(5000));
      this.heroViews.set(hero.id,{sprite,shadow,ring,label,animation:''});
    }
    this.update(0);
  }

  private keep<T extends Phaser.GameObjects.GameObject>(object:T):T{this.objects.push(object);return object;}
  set dialogueEnabled(value:boolean){this.dialogue=value;if(!value)this.bubble.setVisible(false);}
  selectHero(id?:HeroID){this.selected=id;}
  heroAt(x:number,y:number):HeroID|undefined{return this.sim.heroes.find(hero=>Math.hypot(hero.x-x,hero.y-20-y)<32)?.id;}
  objectiveAt(x:number,y:number){return this.sim.objectives.find(object=>!object.completed&&Math.hypot(object.x-x,object.y-10-y)<27);}

  private terrainKey(){const calm=`Terrain ${this.theme} calm`;return this.scene.textures.exists(calm)?calm:`Terrain ${this.theme}`;}

  private curatedPlots():[number,number][]{return({
    3:[[12,8],[16,8],[13,7],[15,9],[3,4],[24,4],[3,13],[24,13]],
    7:[[3,3],[5,3],[9,9],[12,10],[16,3],[19,5],[23,9],[25,10]],
    10:[[3,2],[4,3],[7,10],[9,12],[13,2],[15,3],[17,10],[19,12],[23,5],[25,7]],
    16:[[6,2],[8,2],[12,2],[17,2],[20,3],[7,10],[20,7],[22,7],[24,9]],
  } as Record<number,[number,number][]>)[this.sim.map.id]??[];}

  private drawCuratedProps(atlasKey:string,nearRoute:(col:number,row:number)=>boolean){
    const props:Record<number,[number,number,number,number][]>= {
      3:[],
      7:[[2,2,6,118],[6,2,5,60],[6,5,6,104],[13,11,6,103],[12,12,5,57],[15,2,6,110],[20,2,6,125],[20,6,5,58],[22,5,6,102],[26,11,5,58]],
      10:[[4,2,6,83],[9,13,5,50],[12,2,5,55],[16,2,6,90],[20,12,5,53],[26,4,6,88]],
      16:[[1,1,6,125],[3,1,6,120],[0,7,6,138],[2,9,6,120],[1,15,6,131],[4,15,6,126],[10,15,6,134],[13,15,6,124],[17,15,6,133],[23,15,6,126],[26,14,6,132],[26,2,6,132],[23,1,6,117],[9,0,5,52],[15,0,5,49],[20,0,5,58],[26,5,5,51]],
    };
    for(const[col,row,index,size]of props[this.sim.map.id]??[]){
      if(nearRoute(col,row)||!simCanDecorate(this.sim,col,row)||(this.landmarkCell?.[0]===col&&this.landmarkCell[1]===row))continue;
      const p=center([col,row]);this.keep(this.scene.add.ellipse(p.x,p.y+4,size*.48,size*.17,0x142a3b,.23).setDepth(20));this.keep(this.scene.add.image(p.x,p.y+12,atlasKey,index).setOrigin(.5,.88).setDisplaySize(size,size).setDepth(p.y+1000));this.sim.obstacles.add(`${col},${row}`);
    }
    if(this.sim.map.id===3)for(const[cx,cy]of [[3,3],[24,3],[3,12],[24,12]]){
      const outward=cx<14?-1:1,col=cx+outward;if(!simCanDecorate(this.sim,col,cy))continue;
      const p=center([cx,cy]),x=p.x+outward*75,y=p.y+8;
      this.keep(this.scene.add.ellipse(x,y,30,12,0x0d162b,.35).setDepth(20));this.keep(this.scene.add.image(x,y,atlasKey,6).setOrigin(.5,.88).setDisplaySize(82,82).setDepth(y+1000));this.sim.obstacles.add(`${col},${cy}`);
    }
    // Reeds and ice rocks occupy water cells only; shore dressing cannot interrupt hero routes.
    const banks=this.sim.map.id===7?[[2,7],[7,2],[13,14],[21,3],[24,13]]:this.sim.map.id===16?[[10,4],[17,4],[9,10],[18,10],[15,11]]:[];
    for(const[col,row]of banks){if(this.sim.canWalk(col,row))continue;const p=center([col,row]),size=this.sim.map.id===16?56:63;this.keep(this.scene.add.image(p.x,p.y+7,atlasKey,5).setOrigin(.5,.82).setDisplaySize(size,size).setDepth(p.y+1000));}
  }

  private drawWaterBackground(theme:'marsh'|'frost'){
    const key=`campaign-water-${this.sim.map.id}`;if(this.scene.textures.exists(key))this.scene.textures.remove(key);this.textureKeys.push(key);
    const texture=this.scene.textures.createCanvas(key,WIDTH,HEIGHT)!,ctx=texture.context;ctx.imageSmoothingEnabled=false;
    const atlas=this.scene.textures.exists('Animated water tiles')?this.scene.textures.get('Animated water tiles'):undefined,iceAtlas=theme==='frost'&&this.scene.textures.exists(this.terrainKey())?this.scene.textures.get(this.terrainKey()):undefined;
    this.waterPainter=(index:number)=>{
      ctx.fillStyle=theme==='marsh'?'#285b62':'#527f9b';ctx.fillRect(0,0,WIDTH,HEIGHT);
      if(atlas){const source=atlas.get(index);for(let y=0;y<HEIGHT;y+=128)for(let x=0;x<WIDTH;x+=128)ctx.drawImage(source.source.image as CanvasImageSource,source.cutX+192,source.cutY+192,64,64,x,y,128,128);}
      ctx.globalCompositeOperation='multiply';ctx.fillStyle=theme==='marsh'?'#385e67':'#79a6c8';ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.globalCompositeOperation='source-over';
      const glow=ctx.createRadialGradient(600,320,80,600,320,640);glow.addColorStop(0,theme==='marsh'?'rgba(72,122,118,.08)':'rgba(189,224,238,.2)');glow.addColorStop(1,theme==='marsh'?'rgba(9,29,41,.45)':'rgba(31,68,108,.25)');ctx.fillStyle=glow;ctx.fillRect(0,0,WIDTH,HEIGHT);
      if(theme==='frost'){
        for(const[x,y,w,h]of [[405,230,78,43],[646,259,82,40],[448,425,72,36],[676,421,65,35]]){
          ctx.save();ctx.beginPath();ctx.moveTo(x-w*.48,y);ctx.lineTo(x-w*.25,y-h*.48);ctx.lineTo(x+w*.22,y-h*.45);ctx.lineTo(x+w*.5,y-h*.08);ctx.lineTo(x+w*.28,y+h*.5);ctx.lineTo(x-w*.31,y+h*.35);ctx.closePath();ctx.clip();ctx.fillStyle='#bedbe5';ctx.fillRect(x-w/2,y-h/2,w,h);
          if(iceAtlas){const source=iceAtlas.get(1);ctx.globalAlpha=.75;ctx.drawImage(source.source.image as CanvasImageSource,source.cutX+6,source.cutY+6,source.cutWidth-12,source.cutHeight-12,x-w/2,y-h/2,w,h);}ctx.restore();
        }
        ctx.strokeStyle='rgba(204,240,249,.24)';ctx.lineWidth=1;for(const[x,y,dx,dy]of [[400,200,70,30],[590,210,-40,45],[680,430,-55,-30],[440,425,60,-45]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx*.55,y+dy*.3);ctx.lineTo(x+dx,y+dy);ctx.stroke();}
      }
      texture.refresh();
    };
    this.waterPainter(0);this.keep(this.scene.add.image(0,0,key).setOrigin(0).setDepth(-1));
  }

  private drawTerrain(){
    if(this.sim.map.id===4){this.drawForestClearing();return;}
    const scene=this.scene,map=this.sim.map,theme=this.theme,palette=PALETTES[theme],random=seeded(map.seed),key=`campaign-terrain-${map.id}`,curated=[3,7,10,16].includes(map.id);
    if(scene.textures.exists(key))scene.textures.remove(key);
    const texture=scene.textures.createCanvas(key,WIDTH,HEIGHT)!;
    this.textureKeys.push(key);const ctx=texture.context;
    ctx.imageSmoothingEnabled=false;
    const sky=ctx.createLinearGradient(0,0,WIDTH*.25,HEIGHT);sky.addColorStop(0,palette.sky);sky.addColorStop(1,palette.bottom);ctx.fillStyle=sky;ctx.fillRect(0,0,WIDTH,HEIGHT);
    const atlasKey=this.terrainKey(),atlas=scene.textures.exists(atlasKey)?scene.textures.get(atlasKey):undefined;
    const drawFrame=(target:CanvasRenderingContext2D,frame:number,x:number,y:number,w:number,h:number)=>{
      if(!atlas)return;const source=atlas.get(frame),gutter=frame<4?3:0;target.drawImage(source.source.image as CanvasImageSource,source.cutX+gutter,source.cutY+gutter,source.cutWidth-gutter*2,source.cutHeight-gutter*2,x,y,w,h);
    };
    const makeLayer=()=>{const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;return{canvas,ctx:c};};
    const ground=makeLayer();
    const mask=makeLayer();
    mask.ctx.fillStyle='#ffffff';mask.ctx.strokeStyle='#ffffff';mask.ctx.lineWidth=map.platforms&&!map.islands?CELL*3:CELL*2;mask.ctx.lineJoin='round';mask.ctx.lineCap='round';
    for(const route of map.paths){mask.ctx.beginPath();route.forEach((p,index)=>{const q=center(p);if(index)mask.ctx.lineTo(q.x,q.y);else mask.ctx.moveTo(q.x,q.y);});mask.ctx.stroke();}
    for(const[cx,cy,rx,ry]of map.islands??[]){
      const p=center([cx,cy]);mask.ctx.beginPath();
      if(map.id===10){
        // The legal ellipse is inset by .35 cells; this smaller edge variation stays outside it.
        const count=28,points=Array.from({length:count},(_,index)=>{const angle=index/count*Math.PI*2,factor=1+.026*Math.sin(angle*3+cx)+.02*Math.sin(angle*5+cy);return{x:p.x+Math.cos(angle)*rx*CELL*factor,y:p.y+Math.sin(angle)*ry*CELL*factor};});
        const last=points.at(-1)!,first=points[0];mask.ctx.moveTo((last.x+first.x)/2,(last.y+first.y)/2);
        points.forEach((point,index)=>{const next=points[(index+1)%count];mask.ctx.quadraticCurveTo(point.x,point.y,(point.x+next.x)/2,(point.y+next.y)/2);});mask.ctx.closePath();
      }else mask.ctx.ellipse(p.x,p.y,rx*CELL,ry*CELL,0,0,Math.PI*2);
      mask.ctx.fill();
    }
    if(!map.islands){
      if(map.platforms)for(const[x,y,w,h]of map.platforms){mask.ctx.beginPath();mask.ctx.roundRect(x*CELL,y*CELL,w*CELL,h*CELL,curated?32:18);mask.ctx.fill();}
      else mask.ctx.fillRect(0,0,WIDTH,HEIGHT);
      mask.ctx.globalCompositeOperation='destination-out';
      for(const[x,y,w,h]of map.water){mask.ctx.beginPath();mask.ctx.roundRect(x*CELL,y*CELL,w*CELL,h*CELL,map.id===16?72:curated?36:18);mask.ctx.fill();}
      mask.ctx.globalCompositeOperation='source-over';
      if(map.id===16)mask.ctx.lineWidth=48;
      for(const route of map.paths){mask.ctx.beginPath();route.forEach((p,index)=>{const q=center(p);if(index)mask.ctx.lineTo(q.x,q.y);else mask.ctx.moveTo(q.x,q.y);});mask.ctx.stroke();}
    }

    // Distant, deliberately quiet silhouettes create scale behind the playable land.
    if(theme==='moon'){
      for(let i=0;i<210;i++){const x=Math.floor(random()*WIDTH),y=Math.floor(random()*HEIGHT),a=random();ctx.fillStyle=`rgba(190,205,255,${.16+a*.65})`;ctx.fillRect(x,y,a>.95?2:1,a>.95?2:1);if(a>.985){ctx.fillRect(x-3,y,7,1);ctx.fillRect(x,y-3,1,7);}}
      const nebula=ctx.createRadialGradient(850,120,10,850,120,340);nebula.addColorStop(0,'rgba(120,91,168,.22)');nebula.addColorStop(.5,'rgba(76,61,140,.10)');nebula.addColorStop(1,'rgba(20,22,50,0)');ctx.fillStyle=nebula;ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.fillStyle='#cbd8f3';ctx.beginPath();ctx.arc(1010,65,34,0,Math.PI*2);ctx.fill();ctx.fillStyle='#18203d';ctx.beginPath();ctx.arc(1022,58,32,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.16;for(let i=0;i<(curated?9:20);i++)drawFrame(ctx,5,random()*WIDTH,random()*HEIGHT,30+random()*40,44+random()*30);ctx.globalAlpha=1;
    }else if(theme==='wind'||theme==='frost'){
      for(let i=0;i<20;i++){const x=random()*WIDTH,y=random()*HEIGHT,w=70+random()*210;const cloud=ctx.createRadialGradient(x,y,3,x,y,w);cloud.addColorStop(0,theme==='wind'?'rgba(241,251,255,.44)':'rgba(205,236,255,.14)');cloud.addColorStop(1,'rgba(230,247,255,0)');ctx.fillStyle=cloud;ctx.fillRect(x-w,y-w,w*2,w*2);}
    }else if(theme==='marsh'){
      for(let i=0;i<180;i++){const x=random()*WIDTH,y=random()*HEIGHT;ctx.fillStyle=i%3?'rgba(109,174,156,.12)':'rgba(166,202,145,.16)';ctx.fillRect(x,y,8+random()*32,1);}
    }else if(theme==='ember'){
      for(let i=0;i<14;i++){const x=random()*WIDTH,y=random()*HEIGHT;const glow=ctx.createRadialGradient(x,y,1,x,y,130);glow.addColorStop(0,'rgba(239,78,28,.27)');glow.addColorStop(1,'rgba(90,30,20,0)');ctx.fillStyle=glow;ctx.fillRect(x-130,y-130,260,260);}
    }else{
      ctx.globalAlpha=.45;for(let i=0;i<44;i++)drawFrame(ctx,5,random()*WIDTH-40,random()*HEIGHT-50,80,80);ctx.globalAlpha=1;
    }

    if(map.id===7||map.id===16){ctx.clearRect(0,0,WIDTH,HEIGHT);this.drawWaterBackground(map.id===7?'marsh':'frost');}

    // A textured vertical face is clipped to the same silhouette shifted downward.
    const depth=theme==='moon'?29:theme==='wind'?43:theme==='frost'?27:theme==='marsh'?15:22;
    const side=makeLayer();side.ctx.fillStyle=palette.side;side.ctx.fillRect(0,0,WIDTH,HEIGHT);
    const wallTile=curated?192:96;if(atlas)for(let y=0;y<HEIGHT;y+=wallTile)for(let x=0;x<WIDTH;x+=wallTile)drawFrame(side.ctx,3,x,y,wallTile,wallTile);
    side.ctx.globalCompositeOperation='destination-in';side.ctx.drawImage(mask.canvas,0,depth);side.ctx.globalCompositeOperation='source-over';
    const shadow=makeLayer();shadow.ctx.fillStyle='rgba(2,6,18,.55)';shadow.ctx.fillRect(0,0,WIDTH,HEIGHT);shadow.ctx.globalCompositeOperation='destination-in';shadow.ctx.drawImage(mask.canvas,6,depth+12);
    ctx.drawImage(shadow.canvas,0,0);ctx.drawImage(side.canvas,0,0);
    // Organic material variation is independent of the underlying build grid.
    ground.ctx.fillStyle=theme==='forest'?'#546d38':theme==='marsh'?'#547263':theme==='ember'?'#635951':theme==='frost'?'#a8c8db':'#66728f';ground.ctx.fillRect(0,0,WIDTH,HEIGHT);
    const floorTile=map.id===3?176:curated?320:128;if(atlas)for(let y=-64;y<HEIGHT;y+=floorTile)for(let x=-64;x<WIDTH;x+=floorTile)drawFrame(ground.ctx,0,x,y,floorTile,floorTile);
    if(curated&&theme==='moon'){ground.ctx.fillStyle='rgba(102,113,143,.13)';ground.ctx.fillRect(0,0,WIDTH,HEIGHT);}
    if(curated)for(const[col,row]of this.curatedPlots()){if(!this.sim.canBuild(col,row))continue;const p=center([col,row]),halo=ground.ctx.createRadialGradient(p.x,p.y,3,p.x,p.y,33);halo.addColorStop(0,theme==='frost'?'rgba(225,248,254,.32)':'rgba(235,222,164,.17)');halo.addColorStop(1,'rgba(223,218,175,0)');ground.ctx.fillStyle=halo;ground.ctx.beginPath();ground.ctx.ellipse(p.x,p.y,33,25,0,0,Math.PI*2);ground.ctx.fill();}
    const road=makeLayer();road.ctx.strokeStyle='#ffffff';road.ctx.lineWidth=theme==='marsh'?(curated?86:106):(curated?42:34);road.ctx.lineCap='round';road.ctx.lineJoin='round';
    for(const route of map.paths){road.ctx.beginPath();route.forEach((p,index)=>{const q=center(p);if(index)road.ctx.lineTo(q.x,q.y);else road.ctx.moveTo(q.x,q.y);});road.ctx.stroke();}
    const roadPaint=makeLayer(),roadTile=map.id===3?132:curated?240:80;roadPaint.ctx.fillStyle=theme==='moon'?'#b6a884':'#b39467';roadPaint.ctx.fillRect(0,0,WIDTH,HEIGHT);
    if(map.id===16||map.id===10){
      // Mixed grass/snow path tiles interrupt the route; use uninterrupted warm path material.
      const pathAtlasKey=scene.textures.exists('Terrain forest calm')?'Terrain forest calm':'Terrain forest';
      if(scene.textures.exists(pathAtlasKey)){const source=scene.textures.get(pathAtlasKey).get(2);roadPaint.ctx.globalAlpha=.85;for(let y=0;y<HEIGHT;y+=roadTile)for(let x=0;x<WIDTH;x+=roadTile)roadPaint.ctx.drawImage(source.source.image as CanvasImageSource,source.cutX+5,source.cutY+5,source.cutWidth-10,source.cutHeight-10,x,y,roadTile,roadTile);roadPaint.ctx.globalAlpha=1;}
      // The same continuous corridor becomes blue ice only over the lake.
      if(map.id===16)for(const[x,y,w,h]of map.water){roadPaint.ctx.save();roadPaint.ctx.beginPath();roadPaint.ctx.roundRect(x*CELL,y*CELL,w*CELL,h*CELL,72);roadPaint.ctx.clip();roadPaint.ctx.fillStyle='#b7dbe7';roadPaint.ctx.fillRect(x*CELL,y*CELL,w*CELL,h*CELL);if(atlas)for(let py=y*CELL;py<(y+h)*CELL;py+=240)for(let px=x*CELL;px<(x+w)*CELL;px+=240)drawFrame(roadPaint.ctx,1,px,py,240,240);roadPaint.ctx.restore();}
    }else if(atlas)for(let y=0;y<HEIGHT;y+=roadTile)for(let x=0;x<WIDTH;x+=roadTile)drawFrame(roadPaint.ctx,2,x,y,roadTile,roadTile);
    roadPaint.ctx.globalCompositeOperation='destination-in';roadPaint.ctx.drawImage(road.canvas,0,0);ground.ctx.drawImage(roadPaint.canvas,0,0);
    ground.ctx.globalCompositeOperation='destination-in';ground.ctx.drawImage(mask.canvas,0,0);ground.ctx.globalCompositeOperation='source-over';
    // Eroded outer lips are defined by alpha, so intersections remain seamless.
    const rim=makeLayer();rim.ctx.fillStyle=palette.edge;rim.ctx.fillRect(0,0,WIDTH,HEIGHT);rim.ctx.globalCompositeOperation='destination-in';rim.ctx.drawImage(mask.canvas,0,0);rim.ctx.globalCompositeOperation='destination-out';rim.ctx.drawImage(mask.canvas,0,4);rim.ctx.globalCompositeOperation='source-over';
    ctx.drawImage(ground.canvas,0,0);ctx.drawImage(rim.canvas,0,0);
    const lowerRim=makeLayer();lowerRim.ctx.fillStyle='rgba(18,27,46,.6)';lowerRim.ctx.fillRect(0,0,WIDTH,HEIGHT);lowerRim.ctx.globalCompositeOperation='destination-in';lowerRim.ctx.drawImage(mask.canvas,0,0);lowerRim.ctx.globalCompositeOperation='destination-out';lowerRim.ctx.drawImage(mask.canvas,0,-4);ctx.drawImage(lowerRim.canvas,0,0);
    if(atlas)for(const[cx,cy,rx,ry]of map.islands??[]){const p=center([cx,cy]);const size=Math.min(rx,ry)*CELL*1.08;ctx.globalAlpha=theme==='moon'?(curated?.2:.5):.16;drawFrame(ctx,4,p.x-size/2,p.y-size/2,size,size);}ctx.globalAlpha=1;
    const vignette=ctx.createRadialGradient(WIDTH*.5,HEIGHT*.5,180,WIDTH*.5,HEIGHT*.5,650);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(3,9,22,.32)');ctx.fillStyle=vignette;ctx.fillRect(0,0,WIDTH,HEIGHT);
    texture.refresh();this.keep(scene.add.image(0,0,key).setOrigin(0).setDepth(0));

    // Props live at the edge of plazas; routes, hero homes and objectives remain clear.
    const pathMask=new Set(map.paths.flatMap(path=>[...pathCells(path)]));
    const nearRoute=(col:number,row:number)=>[...pathMask].some(key=>{const[c,r]=key.split(',').map(Number);return Math.hypot(c-col,r-row)<1.25;});
    const props:Point[]=[];
    if(atlas&&curated)this.drawCuratedProps(atlasKey,nearRoute);
    if(atlas&&!curated)for(const[cx,cy,rx,ry]of map.islands??[]){
      const p=center([cx,cy]);
      for(let i=0;i<6;i++){
        const angle=(i/6)*Math.PI*2+.3,col=Math.round((p.x+Math.cos(angle)*rx*CELL*.73-20)/CELL),row=Math.round((p.y+Math.sin(angle)*ry*CELL*.68-20)/CELL),position=center([col,row]);
        if((this.landmarkCell?.[0]===col&&this.landmarkCell?.[1]===row)||nearRoute(col,row)||!simCanDecorate(this.sim,col,row)||props.some(other=>Math.hypot(other.x-position.x,other.y-position.y)<50))continue;
        const frame=(i+map.seed)%3===0?6:5,size=frame===6?75:48;
        this.keep(scene.add.image(position.x,position.y+15,atlasKey,frame).setOrigin(.5,.88).setDisplaySize(size,size).setDepth(position.y+1000));
        props.push(position);this.sim.obstacles.add(`${col},${row}`);
        if(theme==='ember'||theme==='moon')this.keep(scene.add.ellipse(position.x,position.y,25,12,palette.light,.08).setDepth(20));
      }
    }
    if(atlas&&!curated&&!map.islands){
      for(let row=0;row<16;row++)for(let col=0;col<28;col++){
        const edge=col<2||col>25||row===0||row===15;
        if((!edge&&random()>.09)||nearRoute(col,row)||!simCanDecorate(this.sim,col,row))continue;
        const p=center([col,row]),frame=edge||random()>.6?6:5,size=frame===6?78:44;
        if(props.some(other=>Math.hypot(other.x-p.x,other.y-p.y)<44))continue;
        this.keep(scene.add.image(p.x,p.y+16,atlasKey,frame).setOrigin(.5,.87).setDisplaySize(size,size).setDepth(p.y+1000));this.sim.obstacles.add(`${col},${row}`);props.push(p);
      }
    }
    for(let i=0;i<16;i++){
      const x=random()*WIDTH,y=random()*HEIGHT,image=this.keep(scene.add.circle(x,y,theme==='frost'?1.5:1,palette.light,.1+random()*.4).setDepth(4800));
      this.motes.push({image,x,y,speed:8+random()*12,phase:random()*6});
    }
  }

  /** Mooshain is an authored clearing, with forest masses framing useful open ground. */
  private drawForestClearing(){
    const scene=this.scene,map=this.sim.map,atlasKey=scene.textures.exists('Terrain forest calm')?'Terrain forest calm':'Terrain forest';
    const atlas=scene.textures.exists(atlasKey)?scene.textures.get(atlasKey):undefined;
    const key=`campaign-terrain-${map.id}`,waterKey=`campaign-water-${map.id}`;
    for(const name of [key,waterKey]){if(scene.textures.exists(name))scene.textures.remove(name);this.textureKeys.push(name);}
    const texture=scene.textures.createCanvas(key,WIDTH,HEIGHT)!,ctx=texture.context;ctx.imageSmoothingEnabled=false;
    const frame=(target:CanvasRenderingContext2D,index:number,x:number,y:number,w:number,h:number)=>{
      if(!atlas)return;const source=atlas.get(index),gutter=index<4?5:0;
      target.drawImage(source.source.image as CanvasImageSource,source.cutX+gutter,source.cutY+gutter,source.cutWidth-gutter*2,source.cutHeight-gutter*2,x,y,w,h);
    };
    const layer=()=>{const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;const context=canvas.getContext('2d')!;context.imageSmoothingEnabled=false;return{canvas,ctx:context};};
    // Large quiet turf tiles read as terrain, rather than a grid of little flower beds.
    ctx.fillStyle='#50683b';ctx.fillRect(0,0,WIDTH,HEIGHT);
    for(let row=0;row<3;row++)for(let col=0;col<4;col++)frame(ctx,(col+row*3)%5===2?1:0,col*320-48,row*320-70,320,320);
    const glade=ctx.createRadialGradient(570,325,50,570,325,660);glade.addColorStop(0,'rgba(219,225,144,.07)');glade.addColorStop(.6,'rgba(29,58,34,.02)');glade.addColorStop(1,'rgba(9,30,23,.42)');ctx.fillStyle=glade;ctx.fillRect(0,0,WIDTH,HEIGHT);
    // Visible light-soil clearings indicate especially useful tower positions, without restricting free building.
    const plots:[[number,number],number][]=[[[4,5],34],[[7,4],33],[[9,6],35],[[11,8],34],[[14,9],34],[[17,8],34],[[20,7],34],[[22,9],36],[[6,11],33]];
    for(const[cell,radius]of plots){if(!this.sim.canBuild(...cell))continue;const p=center(cell),halo=ctx.createRadialGradient(p.x,p.y,10,p.x,p.y,radius);halo.addColorStop(0,'rgba(199,187,121,.23)');halo.addColorStop(.75,'rgba(177,172,109,.12)');halo.addColorStop(1,'rgba(177,172,109,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.ellipse(p.x,p.y,radius,radius*.7,0,0,Math.PI*2);ctx.fill();}
    // Quadratic corner joins remain inside the collision corridor and soften the rectilinear enemy routes.
    const trace=(target:CanvasRenderingContext2D,route:typeof map.paths[number])=>{
      const points=route.map(center);target.beginPath();target.moveTo(points[0].x,points[0].y);
      for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y),radius=Math.min(18,ab/3,bc/3);target.lineTo(b.x+(a.x-b.x)*radius/ab,b.y+(a.y-b.y)*radius/ab);target.quadraticCurveTo(b.x,b.y,b.x+(c.x-b.x)*radius/bc,b.y+(c.y-b.y)*radius/bc);}target.lineTo(points.at(-1)!.x,points.at(-1)!.y);
    };
    const road=layer(),roadPaint=layer();road.ctx.strokeStyle='#fff';road.ctx.lineCap='round';road.ctx.lineJoin='round';road.ctx.lineWidth=46;
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(35,51,26,.5)';ctx.lineWidth=56;for(const route of map.paths){trace(ctx,route);ctx.stroke();trace(road.ctx,route);road.ctx.stroke();}
    roadPaint.ctx.fillStyle='#ad9667';roadPaint.ctx.fillRect(0,0,WIDTH,HEIGHT);
    for(let y=-30;y<HEIGHT;y+=240)for(let x=-30;x<WIDTH;x+=240)frame(roadPaint.ctx,2,x,y,240,240);
    roadPaint.ctx.globalCompositeOperation='destination-in';roadPaint.ctx.drawImage(road.canvas,0,0);ctx.drawImage(roadPaint.canvas,0,0);
    // Water has its own lower render layer; the cliff lip casts a shadow into each pond.
    for(const[x,y,w,h]of map.water){const px=x*CELL,py=y*CELL,pw=w*CELL,ph=h*CELL;ctx.save();ctx.beginPath();ctx.roundRect(px,py,pw,ph,38);ctx.clip();ctx.clearRect(px,py,pw,ph);ctx.globalAlpha=.9;frame(ctx,3,px,py-65,pw,86);ctx.globalAlpha=1;const bank=ctx.createLinearGradient(0,py,0,py+34);bank.addColorStop(0,'rgba(26,45,29,.8)');bank.addColorStop(1,'rgba(26,45,29,0)');ctx.fillStyle=bank;ctx.fillRect(px,py,pw,34);ctx.restore();ctx.strokeStyle='#7e9460';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(px,py,pw,ph,38);ctx.stroke();}
    texture.refresh();this.keep(scene.add.image(0,0,key).setOrigin(0).setDepth(0));
    const water=scene.textures.createCanvas(waterKey,WIDTH,HEIGHT)!,waterCtx=water.context;waterCtx.imageSmoothingEnabled=false;
    const waterAtlas=scene.textures.exists('Animated water tiles')?scene.textures.get('Animated water tiles'):undefined;
    this.waterPainter=(index:number)=>{
      waterCtx.clearRect(0,0,WIDTH,HEIGHT);
      for(const[x,y,w,h]of map.water){const px=x*CELL,py=y*CELL,pw=w*CELL,ph=h*CELL;waterCtx.save();waterCtx.beginPath();waterCtx.roundRect(px,py,pw,ph,38);waterCtx.clip();waterCtx.fillStyle='#3d918a';waterCtx.fillRect(px,py,pw,ph);
        if(waterAtlas){const source=waterAtlas.get(index);for(let dy=py;dy<py+ph;dy+=96)for(let dx=px;dx<px+pw;dx+=96)waterCtx.drawImage(source.source.image as CanvasImageSource,source.cutX+192,source.cutY+192,64,64,dx,dy,96,96);}
        waterCtx.globalCompositeOperation='multiply';waterCtx.fillStyle='#4d888d';waterCtx.fillRect(px,py,pw,ph);waterCtx.globalCompositeOperation='source-over';const depth=waterCtx.createLinearGradient(0,py,0,py+ph);depth.addColorStop(0,'rgba(14,49,49,.35)');depth.addColorStop(.5,'rgba(24,77,74,.07)');depth.addColorStop(1,'rgba(129,192,153,.2)');waterCtx.fillStyle=depth;waterCtx.fillRect(px,py,pw,ph);waterCtx.restore();
      }water.refresh();
    };
    this.waterPainter(0);this.keep(scene.add.image(0,0,waterKey).setOrigin(0).setDepth(-1));
    // Low bankside groups sit within the already impassable water edge, not on walking cells.
    if(atlas)for(const[x,y,w,h]of map.water){const px=x*CELL,py=y*CELL,pw=w*CELL,ph=h*CELL;for(const[dx,dy,size]of [[8,22,57],[pw-14,ph-14,63],[pw*.7,ph-2,40],[pw*.23,8,39]])this.keep(scene.add.image(px+dx,py+dy,atlasKey,5).setOrigin(.5,.78).setDisplaySize(size,size).setDepth(py+dy+1000));}
    const occupied:Point[]=[],paths=new Set(map.paths.flatMap(path=>[...pathCells(path)]));
    const nearPath=(col:number,row:number)=>[...paths].some(key=>{const[c,r]=key.split(',').map(Number);return Math.hypot(c-col,r-row)<1.4;});
    const props:[number,number,number,number][]=[
      [0,2,6,140],[2,2,6,122],[4,2,6,134],[1,0,6,130],[5,0,6,130],
      [12,0,6,125],[15,0,6,138],[18,1,6,126],[20,1,6,118],
      [26,2,6,140],[27,4,6,125],[25,0,6,130],
      [0,15,6,134],[2,15,6,118],[5,15,6,132],[8,15,6,120],[11,15,6,135],
      [14,15,6,120],[17,15,6,128],[25,15,6,132],[27,13,6,130],
      [2,9,5,58],[8,0,5,50],[11,1,5,50],[12,6,5,48],[16,6,5,54],[18,3,5,58],
      [19,10,5,50],[24,12,5,55],[23,14,5,52],[7,14,5,50],[13,13,5,48],
    ];
    if(atlas)for(const[col,row,index,size]of props){if(nearPath(col,row)||!simCanDecorate(this.sim,col,row))continue;const p=center([col,row]);if(occupied.some(other=>Math.hypot(other.x-p.x,other.y-p.y)<48))continue;this.keep(scene.add.ellipse(p.x,p.y+4,size*.53,size*.2,0x102b22,.28).setDepth(20));this.keep(scene.add.image(p.x,p.y+12,atlasKey,index).setOrigin(.5,.88).setDisplaySize(size,size).setDepth(p.y+1000));this.sim.obstacles.add(`${col},${row}`);occupied.push(p);}
    // The shrine anchors the north-east clearing; it is deliberately separated from the usable rune.
    if(atlas&&simCanDecorate(this.sim,22,2)){const p=center([22,2]);this.keep(scene.add.image(p.x,p.y+15,atlasKey,7).setOrigin(.5,.88).setDisplaySize(112,112).setDepth(p.y+1000));this.sim.obstacles.add('22,2');}
    const random=seeded(map.seed);for(let i=0;i<9;i++){const x=80+random()*(WIDTH-160),y=80+random()*(HEIGHT-160),image=this.keep(scene.add.circle(x,y,1,0xe1eda9,.2).setDepth(4800));this.motes.push({image,x,y,speed:5+random()*7,phase:random()*6});}
  }

  private drawLandmarks(){
    const scene=this.scene,sim=this.sim,palette=PALETTES[this.theme];
    sim.map.paths.forEach((path,index)=>{
      const point=center(path[0]),color=index%2?0x89e2ed:0xb99aff;
      this.portalLights.push(this.keep(scene.add.circle(point.x,point.y,30,color,.15).setDepth(21)));
      if(this.theme==='moon'&&scene.textures.exists('Moon Props')){this.portals.push(this.keep(scene.add.image(point.x,point.y+10,'Moon Props',index%2).setOrigin(.5,.86).setDisplaySize(86,86).setDepth(point.y+1000)));}
      else{const marker=this.keep(scene.add.graphics().setDepth(22));marker.lineStyle(2,palette.route,.7).strokeCircle(point.x,point.y,22);marker.fillStyle(palette.route,.7).fillTriangle(point.x-6,point.y-7,point.x+8,point.y,point.x-6,point.y+7);}
    });
    const goal=center(sim.map.goal??[27,8]);
    sim.obstacles.add(`${Math.floor(goal.x/CELL)},${Math.floor(goal.y/CELL)}`);
    this.keep(scene.add.ellipse(goal.x,goal.y+10,84,40,0x071426,.45).setDepth(22));
    this.keep(scene.add.circle(goal.x,goal.y-10,44,0x98e2da,.09).setDepth(23));
    if(scene.textures.exists('Moon Props'))this.keep(scene.add.image(goal.x,goal.y+15,'Moon Props',2).setOrigin(.5,.86).setDisplaySize(105,105).setDepth(goal.y+1001));
    else this.keep(scene.add.image(goal.x,goal.y,'Tower 08',2).setScale(.7).setOrigin(.5,.8).setDepth(goal.y+1001));
    this.keep(scene.add.text(goal.x,goal.y+23,this.theme==='moon'?'MONDKERN':'SPIRE',{fontFamily:'monospace',fontSize:'9px',letterSpacing:2,color:'#e5f8eb',stroke:'#182f42',strokeThickness:4}).setOrigin(.5).setDepth(5000));
    const terrainKey=this.terrainKey();
    if(scene.textures.exists(terrainKey)){
      if(this.landmarkCell){const[col,row]=this.landmarkCell,position=center([col,row]);this.keep(scene.add.image(position.x,position.y+8,terrainKey,7).setDisplaySize(88,88).setOrigin(.5,.88).setDepth(position.y+1000));sim.obstacles.add(`${col},${row}`);}
    }
    for(const objective of sim.objectives){
      const frame=scene.textures.exists('Campaign Objects')?this.objectiveFrame(objective.kind):objective.kind==='cache'?5:4;
      const fallback=scene.textures.exists('Campaign Objects')?'Campaign Objects':scene.textures.exists(terrainKey)?terrainKey:'Moon Props';
      const size=objective.kind==='cache'?38:46;
      const icon=this.keep(scene.add.image(objective.x,objective.y+5,fallback,frame).setOrigin(.5,.8).setDisplaySize(size,size).setDepth(objective.y+1000));
      const glow=this.keep(scene.add.graphics().setDepth(1800));
      const label=this.keep(scene.add.text(objective.x,objective.y+21,this.objectiveLabel(objective.kind),{fontFamily:'monospace',fontSize:'8px',color:'#ffe4a9',stroke:'#162437',strokeThickness:4}).setOrigin(.5).setDepth(5100));
      this.objectiveViews.set(String(objective.id),{icon,label,glow});
    }
  }

  react(event:Event){
    if(event.type==='hero-action'&&event.hero)this.heroEffects.push({x:event.hero.x,y:event.hero.y,color:COLORS[event.hero.id],radius:event.hero.id==='mara'?42:event.hero.id==='wisp'?135:event.hero.id==='runa'?170:185,started:this.time});
    if(event.type==='overclock')this.say(['Etwas mehr Spannung. Du schaffst das.','Die Garantie ist jetzt jedenfalls weg.','Mehr Feuer, weniger Ausreden.'][this.sim.wave%3],'mara');
    else if(event.type==='station')this.say(this.theme==='ember'?'Druckprüfung erfolgreich. Das war fast die richtige Richtung.':this.theme==='forest'?'Der Wald packt mit an. Endlich brauchbare Verwandtschaft.':this.theme==='marsh'?'Ruhe im Moor! Auch für leuchtende Quallen.':'Heizung an. Wer den Winter bestellt hat, zahlt.',event.hero?.id??'wisp',true);
    else if(event.type==='objective')this.say(event.objective?.kind==='cache'?'Vorräte gefunden. Diesmal wirklich keine Kekse.':'Eine Rune weniger. Wer hat die eigentlich überall liegen lassen?',event.hero?.id??'wisp');
    else if(event.type==='escape')this.say(this.sim.lives<=6?'Alles unter Kontrolle! Also … theoretisch.':'Wisp! Der Ausgang war NICHT für Gäste!','mara');
    else if(event.type==='wave')this.say(this.sim.wave===1?'Du hältst die Stellung. Ich erhöhe die Spannung.':['Türme, gebt alles! Lob gibt es hinterher.','Ich bin völlig ruhig. Das ist taktisches Zittern.','Neue Gäste. Wieder ohne Gastgeschenk.'][this.sim.wave%3],this.sim.wave%3===1?'wisp':'mara');
    else if(event.type==='clear')this.say(['War das unser Plan? Dann war er ausgezeichnet.','Du leuchtest. Ist das Stolz oder ein Kurzschluss?','Schöne Arbeit. Besonders mein bescheidener Beitrag.'][this.sim.wave%3],'mara');
    else if(event.type==='victory')this.say('Spire gerettet. Jetzt schuldest du mir ein Abendessen.','mara',true);
    else if(event.type==='defeat')this.say('Plan B: Wir nennen es einen Probelauf.','wisp',true);
  }

  private say(text:string,speaker:HeroID,priority=false){
    if(!this.dialogue||(!priority&&this.time-this.lastChatter<14000))return;
    if(!this.heroViews.has(speaker))speaker=this.sim.heroes[0]?.id??speaker;
    this.lastChatter=this.time;this.bubbleUntil=this.time+6000;this.speaker=speaker;
    this.bubbleText.setText(`${NAMES[speaker]}: ${text}`);const w=this.bubbleText.width,h=this.bubbleText.height;
    this.bubbleBack.clear().fillStyle(0x172638,.97).fillRoundedRect(0,0,w,h,7).lineStyle(2,COLORS[speaker],1).strokeRoundedRect(0,0,w,h,7);
    this.bubbleBack.fillStyle(0x172638).fillTriangle(w/2-6,h-1,w/2+6,h-1,w/2,h+7);this.bubble.setVisible(true);
  }

  update(delta:number){
    this.time+=delta;
    const waterFrame=Math.floor(this.time/170)%10;if(this.waterPainter&&waterFrame!==this.waterFrame){this.waterFrame=waterFrame;this.waterPainter(waterFrame);}
    const signature=this.sim.activePaths.map(p=>this.sim.map.paths.indexOf(p)).join(',')+`:${this.sim.phase}:${this.sim.wave}`;
    if(signature!==this.lastRoute){
      this.lastRoute=signature;this.routes.clear();
      this.sim.map.paths.forEach((path,index)=>{
        const active=this.sim.activePaths.includes(path),color=index%2?0x94e1e9:PALETTES[this.theme].route;
        if(active)for(let n=1;n<path.length;n++){
          const a=center(path[n-1]),b=center(path[n]),angle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y);
          for(let pos=30;pos<length-10;pos+=100){const x=a.x+Math.cos(angle)*pos,y=a.y+Math.sin(angle)*pos;this.routes.lineStyle(1.5,color,.6);this.routes.lineBetween(x-Math.cos(angle-.6)*5,y-Math.sin(angle-.6)*5,x,y);this.routes.lineBetween(x-Math.cos(angle+.6)*5,y-Math.sin(angle+.6)*5,x,y);}
        }
        this.portals[index]?.setAlpha(active?1:.35);
      });
      if(this.sim.phase==='build'&&this.theme==='wind'){
        const path=this.sim.activeAir;
        for(let n=1;n<path.length;n++){
          const a=center(path[n-1]),b=center(path[n]),angle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y);
          for(let pos=0;pos<length;pos+=20){const stop=Math.min(pos+7,length);this.routes.lineStyle(1.5,0xd7f6ff,.7).lineBetween(a.x+Math.cos(angle)*pos,a.y+Math.sin(angle)*pos,a.x+Math.cos(angle)*stop,a.y+Math.sin(angle)*stop);}
        }
      }
    }
    this.portalLights.forEach((light,index)=>light.setAlpha(this.sim.activePaths.includes(this.sim.map.paths[index])?.12+Math.sin(this.time*.003+index)*.04:.035));
    for(const mote of this.motes){mote.image.setPosition((mote.x+Math.sin(this.time*.0003+mote.phase)*12+WIDTH)%WIDTH,(mote.y-this.time*.001*mote.speed+HEIGHT*100)%HEIGHT).setAlpha(.16+Math.sin(this.time*.001+mote.phase)*.1);}
    this.links.clear();this.orders.clear();
    const region=this.sim.regionEffect;
    if(region){
      const color=region.type==='roots'?0xb4db8a:region.type==='silence'?0x96dbd2:region.type==='overdrive'?0xffc280:0xc0eeff;
      this.links.lineStyle(2,color,.35+Math.sin(this.time*.004)*.12).strokeCircle(region.x,region.y,region.radius||62);this.links.fillStyle(color,.035).fillCircle(region.x,region.y,region.radius||62);
      if(region.type==='overdrive')for(const tower of this.sim.towers)this.links.lineStyle(1,color,.65).strokeEllipse(tower.x,tower.y+3,37,18);
    }
    this.heroEffects=this.heroEffects.filter(effect=>this.time-effect.started<1100);
    for(const effect of this.heroEffects){const progress=(this.time-effect.started)/1100;this.links.lineStyle(2,effect.color,(1-progress)*.9).strokeCircle(effect.x,effect.y,effect.radius*(.35+progress*.65));this.links.fillStyle(effect.color,(1-progress)*.07).fillCircle(effect.x,effect.y,effect.radius);}
    for(const enemy of this.sim.enemies){
      if(enemy.hp>0&&(enemy.def.heal||enemy.def.haste||enemy.def.sabotage)){
        const color=enemy.def.heal?0xa3efbf:enemy.def.haste?0xe4ca8a:0x9dddec;
        this.links.lineStyle(1.2,color,.25+Math.sin(this.time*.004+enemy.uid)*.08).strokeEllipse(enemy.x,enemy.y,enemy.def.heal?70:58,enemy.def.heal?33:26);
        if(enemy.def.heal&&region?.type!=='silence')for(const ally of this.sim.enemies)if(ally!==enemy&&ally.hp>0&&Math.hypot(ally.x-enemy.x,ally.y-enemy.y)<120)this.links.lineStyle(1,color,.35).lineBetween(enemy.x,enemy.y-18,ally.x,ally.y-12);
      }
      if(enemy.shieldSource===undefined||enemy.hp<=0)continue;
      const source=this.sim.enemies.find(candidate=>candidate.uid===enemy.shieldSource&&candidate.hp>0);if(!source)continue;
      this.links.lineStyle(4,0x9986f5,.15).lineBetween(source.x,source.y-12,enemy.x,enemy.y-9);
      this.links.lineStyle(1.5,0xc8c1ff,.8).lineBetween(source.x,source.y-12,enemy.x,enemy.y-9);this.links.lineStyle(2,0xb5b8ff,.7).strokeEllipse(enemy.x,enemy.y-9,39,45);
    }
    for(const tower of this.sim.towers)if(this.sim.isOverclocked(tower)){this.links.lineStyle(2,0x8ef5dd,.5+Math.sin(this.time*.01)*.2).strokeCircle(tower.x,tower.y,24);this.links.lineStyle(1,0xe9d6a7,.5).strokeCircle(tower.x,tower.y,28);}
    for(const hero of this.sim.heroes){
      const view=this.heroViews.get(hero.id);if(!view)continue;
      const direction=hero.direction==='side'?(hero.flip?'left':'right'):hero.direction;
      const action=hero.state==='move'?'walk':hero.state==='action'||hero.state==='celebrate'?'cast':'idle';
      const animation=`hero-${hero.id}-${direction}-${action}`;
      if(view.animation!==animation&&this.scene.anims.exists(animation)){view.sprite.play(animation);view.animation=animation;}
      view.sprite.setFlipX(hero.id==='wisp'&&direction==='left');
      const bob=hero.state==='celebrate'?-Math.abs(Math.sin(this.time*.008))*5:hero.id==='wisp'?Math.sin(this.time*.004)*1.5:0;
      view.sprite.setPosition(hero.x,hero.y+bob).setDepth(hero.y+1004);view.shadow.setPosition(hero.x,hero.y+3).setDepth(hero.y+900);view.label.setPosition(hero.x,hero.y+16).setAlpha(this.selected===hero.id?1:.7);
      view.ring.clear();view.ring.lineStyle(this.selected===hero.id?2:1,COLORS[hero.id],this.selected===hero.id?.95:.35).strokeEllipse(hero.x,hero.y+3,35,15);
      if(this.selected===hero.id){
        view.ring.fillStyle(COLORS[hero.id],.09).fillEllipse(hero.x,hero.y+3,35,15);
        if(hero.path.length){
          this.orders.lineStyle(2,COLORS[hero.id],.55).beginPath().moveTo(hero.x,hero.y);for(const point of hero.path)this.orders.lineTo(point.x,point.y);this.orders.strokePath();
          const destination=hero.path.at(-1)!;this.orders.lineStyle(2,COLORS[hero.id],.9).strokeEllipse(destination.x,destination.y,22,12);this.orders.lineBetween(destination.x-4,destination.y,destination.x+4,destination.y);this.orders.lineBetween(destination.x,destination.y-3,destination.x,destination.y+3);
        }
      }
      if(hero.state==='action'){const progress=hero.actionDuration?1-hero.actionRemaining/hero.actionDuration:0;this.orders.lineStyle(2,COLORS[hero.id],.8).strokeCircle(hero.x,hero.y-25,9+Math.sin(this.time*.01)*2);this.orders.fillStyle(0x122535,.9).fillRoundedRect(hero.x-19,hero.y-58,38,5,2);this.orders.fillStyle(COLORS[hero.id],1).fillRoundedRect(hero.x-18,hero.y-57,36*progress,3,1);}
    }
    for(const objective of this.sim.objectives){
      const view=this.objectiveViews.get(String(objective.id));if(!view)continue;
      view.icon.setAlpha(objective.completed?.55:1);if(this.scene.textures.exists('Campaign Objects'))view.icon.setFrame(this.objectiveFrame(objective.kind)+(objective.completed?1:0));
      const suffix=objective.kind==='station'&&objective.activeRemaining>0?` · AKTIV ${Math.ceil(objective.activeRemaining)}s`:objective.kind==='station'&&objective.cooldown>0?` · ${Math.ceil(objective.cooldown)}s`:'';
      view.label.setText(objective.completed?'ERLEDIGT':this.objectiveLabel(objective.kind)+suffix).setAlpha(objective.completed?.5:1);view.icon.setTint(objective.activeRemaining>0?0xc3ffda:0xffffff);view.glow.clear();if(!objective.completed)view.glow.lineStyle(1.5,objective.activeRemaining>0?0xb9f6d3:0xf0d396,.55+Math.sin(this.time*.004)*.2).strokeEllipse(objective.x,objective.y+4,34,16);
    }
    if(this.bubble.visible){const owner=this.sim.heroes.find(hero=>hero.id===this.speaker);if(owner)this.bubble.setPosition(Phaser.Math.Clamp(owner.x-this.bubbleText.width/2,8,WIDTH-this.bubbleText.width-8),Math.max(8,owner.y-this.bubbleText.height-65));}
    if(this.time>=this.bubbleUntil||!this.dialogue)this.bubble.setVisible(false);
  }

  destroy(){for(const object of this.objects)object.destroy();this.objects=[];for(const key of this.textureKeys)if(this.scene.textures.exists(key))this.scene.textures.remove(key);this.textureKeys=[];}
}

function simCanDecorate(sim:Simulation,col:number,row:number){
  const p=center([col,row]),goal=center(sim.map.goal??[27,8]);
  return sim.canBuild(col,row)&&Math.hypot(goal.x-p.x,goal.y-p.y)>90&&!sim.heroes.some(hero=>Math.hypot(hero.x-p.x,hero.y-p.y)<70)&&!sim.objectives.some(objective=>Math.hypot(objective.x-p.x,objective.y-p.y)<60);
}

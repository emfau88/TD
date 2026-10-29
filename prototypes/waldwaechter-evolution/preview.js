// Isolated renderer. No game imports, persistence, combat, or production assets modified.
const levels = [1, 4, 7, 10, 15, 20];
const names = ['Waldwächter', 'Ausgebaut', 'Veteran', 'Verstärkt', 'Elite', 'Meister'];
const descriptions = [
  'Originale Holzfront mit Steinplattform und einfacher Armbrust.',
  'Unveränderte zweite Grafikstufe mit zwei Pfeilführungen.',
  'Unveränderte dritte Grafikstufe. Ihr Größenrahmen gilt auch für alle neuen Basen.',
  'Stählerne Träger und eine kräftigere Armbrust. Kleine Eckstützen halten die Plattform offen.',
  'Kantige Doppelarme und goldene Verbindungen. Die tragenden Streben bleiben kompakt.',
  'Ausgeprägte V-Streben und ein schweres Meistergeschütz. Keine zusätzliche Etage und keine hohe Mauerkrone.'
];
const $ = id => document.getElementById(id);
const sprites = new Map();
let manifest, terrain, selected = 20;
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Grafik konnte nicht geladen werden: ' + url));
    img.src = url;
  });
}
function drawTower(ctx, level, x, y, zoom) {
  const {base, weapon} = sprites.get(level);
  const s = manifest.scale * zoom;
  ctx.drawImage(base, x - 32*s, y + manifest.mount.baseY*zoom - 102.4*s, 64*s, 128*s);
  ctx.drawImage(weapon, x - 48*s, y + manifest.mount.weaponY*zoom - 48*s, 96*s, 96*s);
}
function drawNative(canvas, level) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  // Base top y20, preserving the exact runtime mount offset for the weapon.
  drawTower(ctx, level, 48, 122.4 - 13/manifest.scale, 1/manifest.scale);
}
function cameraZoom() {
  const w = window.innerWidth, h = window.innerHeight;
  return w <= 700 && h > w ? Math.max(h/640, w/640) : Math.min(w/1120, h/640);
}
function drawMap() {
  const canvas = $('map');
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width*dpr);
  canvas.height = Math.round(height*dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const zoom = cameraZoom();
  const camera = {x:160, y:212};
  const px = x => width/2+(x-camera.x)*zoom;
  const py = y => height/2+(y-camera.y)*zoom;
  const halfW = width/(2*zoom), halfH = height/(2*zoom);
  const bounds = {left:Math.floor((camera.x-halfW)/40),right:Math.ceil((camera.x+halfW)/40),top:Math.floor((camera.y-halfH)/40),bottom:Math.ceil((camera.y+halfH)/40)};
  for(let row=bounds.top; row<=bounds.bottom; row++) {
    for(let col=bounds.left; col<=bounds.right; col++) {
      const rect = row === 7 ? manifest.terrain.horizontalPath : manifest.terrain.grass;
      ctx.drawImage(terrain, ...rect, px(col*40), py(row*40), 40*zoom+.1, 40*zoom+.1);
    }
  }
  // Original foliage, positioned outside the six occupied cells.
  for (const [x,y] of [[-20,152],[340,152],[-60,350],[390,350]]) {
    ctx.drawImage(terrain,...manifest.terrain.tree,px(x)-24.8*zoom,py(y)-41*zoom,49.6*zoom,51.2*zoom);
  }
  levels.forEach((level,index) => {
    const x=60+index*40, y=220;
    drawTower(ctx,level,px(x),py(y),zoom);
    if($('labels').checked) {
      const tx=px(x),ty=py(258);
      ctx.fillStyle='rgba(15,29,23,.88)';
      ctx.fillRect(tx-13,ty-9,26,19);
      ctx.fillStyle='#ffe1a2';ctx.font='14px Pixelify, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(String(level),tx,ty+1);
    }
  });
  canvas.dataset.zoom=zoom.toFixed(6);
  canvas.dataset.baseCssWidth=(64*.63*zoom).toFixed(3);
  $('scale-note').textContent = window.innerWidth+' × '+window.innerHeight+' px · Normaler Spielmaßstab '+zoom.toFixed(2)+'× · Basis '+(64*.63*zoom).toFixed(1)+' px breit';
}
function showDetail(level) {
  selected=level;
  const i=levels.indexOf(level);
  $('detail-name').textContent=names[i]+' · Level '+level;
  $('detail-description').textContent=descriptions[i];
  drawNative($('detail'),level);
  for(const part of ['base','weapon']) {
    const path='./assets/level-'+level+'-'+part+'.png';
    $(part+'-part').src=path;
    $('download-'+part).href=path;
  }
  document.querySelectorAll('[data-level]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.level)===level)));
}
function setDetailZoom() {
  const factor=Number($('detail-zoom').value);
  $('detail').style.width=96*factor+'px';
  $('detail').style.height=150*factor+'px';
}
async function init() {
  const response=await fetch('./manifest.json');
  if(!response.ok) throw new Error('Grafikmanifest konnte nicht geladen werden.');
  manifest=await response.json();
  await Promise.all(levels.map(async level => {
    const [base,weapon]=await Promise.all(['base','weapon'].map(part=>loadImage('./assets/level-'+level+'-'+part+'.png')));
    sprites.set(level,{base,weapon});
  }));
  terrain=await loadImage('./assets/terrain.png');
  await document.fonts.load('14px Pixelify');
  levels.forEach((level,i)=>{
    const card=document.createElement('article');card.className='tower-card';
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=150;canvas.setAttribute('aria-label','Waldwächter Level '+level);
    const title=document.createElement('strong');title.textContent='Level '+level;
    const description=document.createElement('span');description.textContent=names[i];
    card.append(canvas,title,description);$('comparison').append(card);drawNative(canvas,level);
    const button=document.createElement('button');button.type='button';button.textContent='Lv. '+level;button.dataset.level=String(level);button.addEventListener('click',()=>showDetail(level));$('levels').append(button);
  });
  $('labels').addEventListener('change',()=>{
    document.body.classList.toggle('hide-labels',!$('labels').checked);drawMap();
  });
  $('detail-zoom').addEventListener('change',setDetailZoom);
  new ResizeObserver(drawMap).observe($('map'));
  window.addEventListener('resize',drawMap);
  setDetailZoom();showDetail(selected);drawMap();
  document.body.dataset.ready='true';
}
init().catch(error=>{
  $('scale-note').textContent=error.message+' Bitte Seite neu laden.';
  $('scale-note').setAttribute('role','alert');console.error(error);
});


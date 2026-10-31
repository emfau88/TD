// Approved pixel effects shared by the design study and isolated testbranch renderer.
export const IMPACT_FRAME_SIZE=96,IMPACT_FRAME_COUNT=10;
export const LEVELS=[1,2,3,5,10,15,20,25];
export const NAMES={
 1:['Pfeilkontakt','Holzsplitter','Stahlsplitter','Kerbsplitter','Silberfächer','Goldspaltung','Smaragdsalve','Meistersalve'],
 2:['Frostkontakt','Eissplitter','Eisfunken','Eisbruch','Kristallkrone','Prismenkreuz','Polarstern','Aurorabruch'],
 3:['Steinkontakt','Steinsplitter','Schwerer Treffer','Steinbruch','Glutstoß','Feuerstoß','Feuereruption','Inferno'],
 5:['Stromkontakt','Ladungsfunken','Roter Blitz','Lichtbogen','Donnerschlag','Kettenkrone','Sturmnova','Meistersturm'],
 4:['Kontaktstern','Grüne Funken','Scharfer Kontakt','Fokusstern','Jadestern','Doppelimpuls','Präzisionsnova','Meistertreffer']
};
const PALETTES={
 5:[['#42788d','#8edce9','#efffff'],['#795b80','#df9bb4','#fff0f7'],['#8e3448','#ed635d','#fff0d9'],['#8e3448','#ff7961','#fff5df'],['#98622d','#ffc165','#fff8df'],['#997b36','#ffdf7d','#ffffe8'],['#7652a5','#c1a4fa','#fff8d8'],['#8661b0','#e0bcff','#fffce6']],
 1:[['#625c4e','#cad1bb','#f7f0cc'],['#644a30','#c69b62','#f5d9a1'],['#465e66','#c8e2db','#f8ffed'],['#61472d','#d2a567','#ffe5b1'],['#3e6580','#b9dfe9','#f5ffff'],['#81542c','#f5c85e','#fff1b4'],['#276553','#72e6b0','#ffdf87'],['#7f5e28','#f8d774','#f7ffe4']],
 2:[['#428399','#9ce0e7','#eaffff'],['#3f869f','#8ad5e9','#e6ffff'],['#347eab','#78d1ed','#f4ffff'],['#2b779e','#76cee6','#e4ffff'],['#346b99','#a0dff6','#f6ffff'],['#304b91','#75bff2','#d9fbff'],['#355480','#a8e6e8','#f5ffff'],['#655095','#b0dcfa','#f8ffff']],
 3:[['#70534b','#c7a273','#f3d7a0'],['#75533b','#d3ae7c','#f9df9f'],['#734f39','#d9a568','#ffe1a1'],['#574938','#b59464','#efcd8e'],['#803f2b','#ec8d38','#ffe5a0'],['#873134','#f15d32','#ffe0a0'],['#8e3327','#ff9238','#fff2b2'],['#9b3827','#ffc555','#fffbe0']],
 4:[['#47674c','#a6cc76','#f0ffdb'],['#3f6e48','#aad971','#f1ffcf'],['#326b50','#a3e992','#f3ffe2'],['#326345','#9fe47f','#f3ffe0'],['#28694a','#8ce6a0','#f4ffe5'],['#276e4d','#91efac','#f7ffe9'],['#2b7651','#a4f5b1','#fff9cf'],['#347b52','#bcf5ae','#fff5b5']]
};
export function profile(kind,level){
 const i=Math.max(0,LEVELS.indexOf(level));
 return {i,life:kind===5?[250,270,290,320,350,380,410,450][i]:kind===4?[350,370,390,420,450,480,520,550][i]:[300,320,350,380,420,450,480,520][i]+(kind===3?30:0),
  scale:.85+i*.05,count:[0,2,3,4,6,8,10,12][i],radius:[7,8,10,12,15,18,21,24][i],
  trail:[0,1,1,2,3,4,5,6][i],colors:PALETTES[kind][i],name:NAMES[kind][i]};
}
function px(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
function ray(c,x,y,xx,yy,color,width=1){const n=Math.ceil(Math.max(Math.abs(xx-x),Math.abs(yy-y)));for(let j=0;j<=n;j++)px(c,x+(xx-x)*j/Math.max(1,n),y+(yy-y)*j/Math.max(1,n),width,width,color)}
function diamond(c,x,y,n,color){for(let yy=-Math.ceil(n);yy<=Math.ceil(n);yy++){const w=Math.max(0,Math.floor(n-Math.abs(yy)));px(c,x-w,y+yy,w*2+1,1,color)}}
// Stepped, asymmetric flame clouds distinguish fire from crystalline diamond facets.
function flame(c,x,y,n,color,seed){
 for(let yy=-Math.ceil(n);yy<=Math.ceil(n*.8);yy+=2){
  const row=Math.max(-n,Math.min(n,yy)),w=Math.floor(Math.sqrt(Math.max(0,n*n-row*row))*.83);
  const shift=Math.round(Math.sin((yy+seed)*.43)*1.5),notch=(Math.floor((yy+seed)/4)%3===0?1:0);
  if(w>0)px(c,x-w+shift,y+yy,w*2-notch,2,color);
 }
}
function polygon(c,points,color){
 const lo=Math.ceil(Math.min(...points.map(p=>p[1]))),hi=Math.floor(Math.max(...points.map(p=>p[1])));
 for(let y=lo;y<=hi;y++){const cuts=[];for(let j=0;j<points.length;j++){const a=points[j],b=points[(j+1)%points.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))cuts.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))}cuts.sort((a,b)=>a-b);for(let j=0;j+1<cuts.length;j+=2)px(c,Math.ceil(cuts[j]),y,Math.max(1,Math.floor(cuts[j+1])-Math.ceil(cuts[j])+1),1,color)}
}
function blade(c,x,y,a,len,width,colors){
 const dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx;
 polygon(c,[[x-dx*2,y-dy*2],[x+dx*len*.35+nx*width,y+dy*len*.35+ny*width],[x+dx*len,y+dy*len],[x+dx*len*.35-nx*width,y+dy*len*.35-ny*width]],colors[0]);
 polygon(c,[[x,y],[x+dx*len*.35+nx*(width-1),y+dy*len*.35+ny*(width-1)],[x+dx*(len-1),y+dy*(len-1)],[x+dx*len*.35,y+dy*len*.35]],colors[1]);
 ray(c,x,y,x+dx*(len-2),y+dy*(len-2),colors[2]);
}
function brokenRing(c,r,y,colors,phase=0,segments=10){
 for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2+phase;ray(c,Math.cos(a)*r,Math.sin(a)*r*.44+y,Math.cos(a+.25)*r,Math.sin(a+.25)*r*.44+y,colors[j%3?1:2])}
}
export function drawTrail(c,kind,level,x,y,dx,dy){
 const p=profile(kind,level);c.save();
 for(let j=p.trail;j>0;j--){c.globalAlpha=(1-j/(p.trail+1))*.65;const n=p.i>=5?2:1;px(c,x-dx*j*4,y-dy*j*4,n,n,p.colors[j%3?1:2]);if(p.i>=6&&j%2===0)px(c,x-dx*j*4+2,y-dy*j*4+3,1,1,p.colors[2])}c.restore();
}
function extras(c,kind,p,t){
 const count=p.i<3?p.count:Math.min(p.count,8);
 for(let j=0;j<count;j++){
  const a=j/count*Math.PI*2+.32,d=4+Math.sqrt(t)*p.radius*(kind===3?1.25:1),x=Math.cos(a)*d,y=Math.sin(a)*d*(kind===3?.65:1)+(kind===3?t*t*11:0);
  c.globalAlpha=Math.min(1,(1-t)*1.7);
  if(kind===3){const n=p.i>=6?3:2;px(c,x,y,n,n,p.colors[0]);px(c,x,y,n,1,p.colors[1])}
  else ray(c,x,y,x+Math.cos(a)*(p.i>=5?3:2),y+Math.sin(a)*(p.i>=5?3:2),p.colors[j%2?1:2],p.i>=6?2:1);
 }
}
export function drawImpact(c,kind,level,age,base){
 const p=profile(kind,level);if(age<0||age>=p.life)return;const t=age/p.life,colors=p.colors,i=p.i;c.save();
 if(i<3){
  c.save();c.scale(p.scale,p.scale);base(c,t);c.restore();extras(c,kind,p,t);c.restore();return;
 }
 const fade=Math.min(1,(1-t)*2.2);c.globalAlpha=fade;
 if(kind===1){
  if(i<=5){
   const count=i===3?2:i===4?3:5;
   for(let j=0;j<count;j++){const delay=i===5&&j%2?65:0;if(age<delay)continue;const u=(age-delay)/(p.life-delay);
    blade(c,Math.sin(j*2)*2,-u*3,-2.8+j/Math.max(1,count-1)*2.4,7+(i-3)*3+Math.sin(u*Math.PI)*4,i===3?2:3,colors);}
  }else{
   const clusters=i===6?2:3;
   for(let q=0;q<clusters;q++){const delay=q*(i===6?55:65);if(age<delay||age>delay+260)continue;
    const u=(age-delay)/260;c.globalAlpha=1-u;const x=(q-(clusters-1)/2)*9,y=q===1?-5:1;
    for(let j=0;j<3;j++)blade(c,x,y,-2.6+j*.9,10+Math.sin(u*Math.PI)*7,2,colors);
    diamond(c,x,y,Math.max(1,3-u*3),colors[2]);
   }
  }
 }else if(kind===2){
  if(i===3){diamond(c,0,0,7,colors[0]);diamond(c,0,-1,5,colors[1]);for(const a of [-2.6,-.6])blade(c,0,0,a,10+t*5,2,colors)}
  if(i===4){for(let j=0;j<5;j++)blade(c,0,5,-Math.PI+.18+j*(Math.PI-.36)/4,13+Math.sin(t*Math.PI)*6,3,colors)}
  if(i===5){for(let j=0;j<4;j++)blade(c,0,0,j*Math.PI/2+.35,13+Math.sin(t*Math.PI)*7,4,colors);diamond(c,0,0,5,colors[2])}
  if(i===6){for(let j=0;j<6;j++)blade(c,0,0,j*Math.PI/3,14+Math.sin(t*Math.PI)*6,3,colors);diamond(c,0,0,5,colors[2]);if(t<.5)brokenRing(c,13+t*14,5,colors,.3,8)}
  if(i===7){for(let j=0;j<8;j++){const a=j*Math.PI/4;blade(c,Math.cos(a)*5,Math.sin(a)*5,a,12+Math.sin(t*Math.PI)*7,3,colors)}diamond(c,0,0,6,colors[2]);if(age>65&&t<.65)brokenRing(c,15+t*20,1,colors,t*.7,12)}
 }else if(kind===3){
  if(i===3){
   for(let j=0;j<5;j++){const a=j/5*Math.PI*2,x=Math.cos(a)*(8+t*12),y=Math.sin(a)*(5+t*7);px(c,x-4,y-3,8,7,colors[0]);px(c,x-3,y-3,6,3,colors[1]);px(c,x-2,y-3,3,1,colors[2])}
   c.globalAlpha=fade*.45;brokenRing(c,13+t*9,9,colors);
  }else{
   // Keep the fire-cloud family: higher tiers retain its mass and add heat/afterburn.
   const tier=i-4,lobes=[3,5,7,8][tier],size=[15,17,20,22][tier];
   for(let j=0;j<lobes;j++){
    const a=j/lobes*Math.PI*2,x=Math.cos(a)*(7+t*6),y=Math.sin(a)*(5+t*7)-t*(5+tier*2),n=size*(1-t*.5);
    flame(c,x,y,n,colors[0],j*3);flame(c,x,y-1,n-2,colors[1],j*3);
    if(t<.48+tier*.035)flame(c,x,y-2,n-5,colors[2],j*3);
   }
   if(i>=5&&age>70&&t<.65)brokenRing(c,13+t*16+(i-5)*2,9,colors,.2,12);
   if(i>=6&&age>75&&t<.72){
    const u=(age-75)/(p.life-75),n=(i===6?9:12)*(1-u*.5);
    flame(c,0,-5-u*10,n+3,colors[1],3);flame(c,0,-7-u*10,n,colors[2],3);
    if(i===7&&age>135)brokenRing(c,18+u*16,8,colors,.5,14);
   }
  }
 }else if(kind===4){
  // Every tier keeps the original contact star and builds on the same jade piercing axis.
  const tier=i-3,length=[17,21,25,29,33][tier],width=[2,3,4,5,6][tier],axis=-.2;
  c.save();c.scale(p.scale,p.scale);base(c,t);c.restore();
  for(const a of [axis,axis+Math.PI])blade(c,0,0,a,length,width,colors);
  if(i>=4)for(let j=0;j<4;j++)blade(c,0,0,axis+Math.PI/4+j*Math.PI/2,10+(i-4)*3,2,colors);
  if(i>=5&&age>55){
   c.globalAlpha=fade*.75;
   for(const offset of [-5,5])blade(c,-9,offset,axis,18+(i-5)*3,2,colors);
  }
  if(i>=6&&age>80){
   c.globalAlpha=fade;const u=(age-80)/(p.life-80),radius=14+u*11+(i-6)*3;
   for(let j=0;j<8;j++){
    const a=j*Math.PI/4+axis,x=Math.cos(a)*radius,y=Math.sin(a)*radius;
    ray(c,x,y,x+Math.cos(a)*4,y+Math.sin(a)*4,j%2?'#e9d384':colors[1],2);
   }
  }
  if(i===7&&age>130&&age<400){
   c.globalAlpha=(1-(age-130)/270)*.8;
   for(let j=0;j<4;j++)blade(c,0,0,axis+j*Math.PI/2,22,3,['#6b753e','#d1ed9c','#fff8c8']);
  }
  c.globalAlpha=fade;
  diamond(c,0,0,2+(i-3)*.6,colors[2]);
 }

 if(kind===5){
  // Short jagged discharges retain a clear contact point; higher tiers add forks and a delayed pulse.
  const arms=[0,0,0,3,4,5,6,8][i],reach=[0,0,0,13,16,19,22,25][i];
  diamond(c,0,0,Math.max(1,5-t*4),colors[2]);
  for(let j=0;j<arms;j++){
   const a=j/arms*Math.PI*2+.25,dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx;
   let x=0,y=0;
   for(let k=1;k<=4;k++){
    const dist=reach*k/4*(.7+Math.sin(t*Math.PI)*.3),bend=k===4?0:(k%2?1:-1)*(2+i*.4);
    const xx=dx*dist+nx*bend,yy=dy*dist+ny*bend;
    ray(c,x,y,xx,yy,colors[1],i>=6?3:2);ray(c,x,y,xx,yy,colors[2]);x=xx;y=yy;
    if(i>=5&&k===3)ray(c,x,y,x+nx*(4+i-5)+dx*2,y+ny*(4+i-5)+dy*2,colors[1]);
   }
  }
  if(i>=4&&age>55&&t<.7)brokenRing(c,9+t*(10+i),3,colors,.2,8+i);
  if(i>=6&&age>110&&age<310){
   c.globalAlpha=(1-(age-110)/200)*.8;diamond(c,0,0,i===7?5:3,colors[2]);
   if(i===7)for(let j=0;j<4;j++){const a=j*Math.PI/2+.6;ray(c,Math.cos(a)*9,Math.sin(a)*9,Math.cos(a)*25,Math.sin(a)*25,colors[2],2)}
  }
 }

 extras(c,kind,p,t);c.restore();
}

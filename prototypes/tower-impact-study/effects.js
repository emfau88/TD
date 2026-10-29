// Cosmetic study only. One logical hit; bounded sparks and a short secondary accent.
export const LEVELS=[1,2,3,5,10,15,20,25];
export function profile(kind,level){
 const i=Math.max(0,LEVELS.indexOf(level));
 return {i,life:300+i*25+(kind===3?55:0),scale:.85+i*(kind===3?.055:.075),
  count:[0,2,3,4,6,8,10,12][i],radius:[7,8,10,12,15,18,21,24][i]*(kind===3?1.25:1),
  trail:[0,1,1,2,3,4,5,6][i]};
}
function px(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
function ray(c,x,y,xx,yy,color,width=1){const n=Math.ceil(Math.max(Math.abs(xx-x),Math.abs(yy-y)));for(let j=0;j<=n;j++)px(c,x+(xx-x)*j/Math.max(1,n),y+(yy-y)*j/Math.max(1,n),width,width,color)}
function diamond(c,x,y,n,color){px(c,x,y-n,1,n*2+1,color);px(c,x-n,y,n*2+1,1,color);if(n>=3)px(c,x-1,y-1,3,3,color)}
const COLORS={1:['#8a6439','#f0c77e','#fff5d2'],2:['#3a8cae','#8bddf0','#edffff'],3:['#815235','#f2b35f','#fff2c4'],4:['#49744c','#b2eb72','#f2ffda']};
export function drawTrail(c,kind,level,x,y,dx,dy){
 const p=profile(kind,level),colors=COLORS[kind];c.save();
 for(let j=p.trail;j>0;j--){c.globalAlpha=(1-j/(p.trail+1))*.5;const n=p.i>=5?2:1;
  px(c,x-dx*j*4,y-dy*j*4,n,n,colors[1]);if(p.i>=6&&j%2===0)px(c,x-dx*j*4+2,y-dy*j*4+3,1,1,colors[2]);}
 c.restore();
}
export function drawImpact(c,kind,level,age,base){
 const p=profile(kind,level);if(age<0||age>=p.life)return;
 const t=age/p.life,colors=COLORS[kind],high=p.i>=5;c.save();
 // Original silhouette anchors every tier. Later tiers add a shorter secondary burst.
 c.save();c.scale(p.scale,p.scale);c.globalAlpha=kind===3&&t>.4?Math.max(.2,1-(t-.4)*1.4):1;
 base(c,t);c.restore();
 if(p.i===0){c.restore();return}
 const kick=Math.max(0,1-age/(75+p.i*6));
 if(kick){c.globalAlpha=kick*.9;const n=2+p.i*.45;diamond(c,0,0,n,colors[2]);}
 if(high&&age>=75&&age<155){c.globalAlpha=(1-(age-75)/80)*.8;diamond(c,0,-1,p.i-1,colors[2]);}
 // Facets/debris grow in number, length and distance with each visible skin.
 for(let j=0;j<p.count;j++){
  const delay=high&&j%3===0?55:0,u=Math.max(0,(age-delay)/(p.life-delay));if(age<delay)continue;
  const a=kind===1?(-Math.PI*.96+j/(p.count-1)*Math.PI*.88):j/p.count*Math.PI*2+.32;
  const distance=(kind===3?12:3)+Math.sqrt(u)*p.radius;
  const x=Math.cos(a)*distance,y=Math.sin(a)*distance*(kind===3?.63:1)+(kind===3?u*u*11:0);
  c.globalAlpha=Math.min(1,(1-u)*2.1);
  if(kind===2){
   const length=3+p.i*.5;
   ray(c,x,y,x+Math.cos(a)*length,y+Math.sin(a)*length,colors[0],p.i>=4?3:2);
   ray(c,x,y,x+Math.cos(a)*(length-1),y+Math.sin(a)*(length-1),colors[2],p.i>=6?2:1);
  }else if(kind===3){
   const n=2+(j%3===0?1:0)+(p.i>=5?1:0);
   px(c,x,y,n,n,colors[0]);px(c,x,y,n,1,colors[1]);
   if(high&&j%2===0)ray(c,x,y,x-Math.cos(a)*3,y-Math.sin(a)*3,colors[2]);
  }else if(kind===1){
   const n=2+p.i*.5;ray(c,x,y,x+Math.cos(a)*n,y+Math.sin(a)*n,colors[0],2);
   ray(c,x,y,x+Math.cos(a)*(n-1),y+Math.sin(a)*(n-1),colors[2]);
  }else{diamond(c,x,y,high&&j%2===0?2:1,colors[j%2?1:2]);}
 }
 // A low, broken impulse for stone/ice; never a persistent overlay.
 if(p.i>=3&&(kind===2||kind===3)&&t<.6){
  const radius=(7+t*p.radius)*(kind===3?1.4:1),segments=kind===3?10:8;c.globalAlpha=(1-t/.6)*.65;
  for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;
   ray(c,Math.cos(a)*radius,Math.sin(a)*radius*.43+8,Math.cos(a+.22)*radius,Math.sin(a+.22)*radius*.43+8,colors[1],p.i>=6?2:1);}
 }
 if(kind===4&&p.i>=3&&t<.4){
  c.globalAlpha=(1-t/.4)*.85;const r=7+p.i*2;
  ray(c,-r,4,r,-4,colors[1],p.i>=5?2:1);ray(c,-r*.6,2,r*.6,-2,colors[2]);
 }
 c.restore();
}

"""Extend the independent rig with smoothly weighted secondary chest bones."""
from pathlib import Path
P=Path(__file__).resolve().parent;A=P/'unity/Assets'
s=(A/'Editor/BuildIlyra.cs').read_text()
for name,addition in [('Names',',"ChestSoftLeft","ChestSoftRight"'),('Parents',',1,1'),('Points',',new(322,650),new(446,650)'),('Ends',',new(322,610),new(446,610)')]:
 start=s.index(' '+name+'=') if ' '+name+'=' in s else s.index(' '+name+'=')
 end=s.index('};',start);s=s[:end]+addition+s[end:]
old='var p=pairs.OrderByDescending(v=>v.w).Take(4).ToArray();float sum=p.Sum(v=>v.w);'
new='''// Continuous chest fabric: no detached patches or scaled silhouettes.
   float center=x<384?322:446;
   float d=Mathf.Sqrt(Mathf.Pow((x-center)/91,2)+Mathf.Pow((y-650)/96,2));
   float influence=.78f*(1-Smooth(.22f,1,d))*Smooth(557,590,y)*(1-Smooth(706,744,y));
   influence*=x<384?1-Smooth(362,384,x):Smooth(384,406,x);
   float soft=pairs[0].w*influence;pairs[0]=(1,pairs[0].w-soft);pairs.Add((x<384?26:27,soft));
   var p=pairs.OrderByDescending(v=>v.w).Take(4).ToArray();float sum=p.Sum(v=>v.w);'''
assert old in s;s=s.replace(old,new)
s=s.replace('int step=rigid?2048:20','int step=rigid?2048:(name=="TorsoArmsHands"?12:20)')
s=s.replace('name=="Head"||','name.StartsWith("Head")||')
s=s.replace('public static void Run(){try{','public static void Run(){try{')
s=s.replace('if(Application.isBatchMode)EditorApplication.EnterPlaymode();','BuildIlyraIdle.Finish(test);')
(A/'Editor/BuildIlyra.cs').write_text(s,encoding='utf-8')
print('28-bone rig with local continuous chest weights prepared.')

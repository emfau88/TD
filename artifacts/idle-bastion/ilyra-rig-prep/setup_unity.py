"""Create the isolated Unity preparation project using the proven sprite importer.

Only shared import/PSB serialization helpers are reused from Mara; the Ilyra
artwork, hierarchy, weights and deliberately small joint test are separate.
"""
from pathlib import Path
import json, shutil
P=Path(__file__).resolve().parent
U=P/'unity'; A=U/'Assets'
for d in [A/'Art',A/'Editor',U/'Packages',U/'ProjectSettings']:d.mkdir(parents=True,exist_ok=True)
M=P.parent/'mara-rig-v2/unity'
for f in ['Packages/manifest.json','ProjectSettings/ProjectVersion.txt']:
    shutil.copy2(M/f,U/f)
assembly=json.loads((P/'art/assembly.json').read_text())
for n in assembly['backToFront']:shutil.copy2(P/'layers'/f'{n}.png',A/'Art'/f'{n}.png')
shutil.copy2(P/'Ilyra.psb',A/'Art/Ilyra.psb')
bones=[
 ('Root',-1,[384,850],[384,650]),
 ('Chest',0,[384,650],[384,510]),
 ('Neck',1,[384,505],[384,440]),
 ('Head',2,[384,435],[384,235]),
 ('UpperArmImageLeft',1,[216,555],[171,792]),
 ('ForearmImageLeft',4,[171,792],[161,1003]),
 ('HandImageLeft',5,[161,1003],[162,1140]),
 ('UpperArmImageRight',1,[552,555],[597,792]),
 ('ForearmImageRight',7,[597,792],[607,1003]),
 ('HandImageRight',8,[607,1003],[606,1140]),
 ('ThighImageLeft',0,[290,920],[290,1230]),
 ('ThighImageRight',0,[478,920],[478,1230]),
 ('SkirtImageLeft',0,[318,850],[240,1000]),
 ('SkirtLeftTip',12,[240,1000],[230,1135]),
 ('SkirtImageRight',0,[450,850],[528,1000]),
 ('SkirtRightTip',14,[528,1000],[538,1135]),
 ('SkirtCenter',0,[384,860],[384,1120]),
 ('CapeBack',1,[384,520],[384,750]),
 ('CapeLeftTip',17,[250,740],[145,940]),
 ('CapeRightTip',17,[518,740],[623,940]),
 ('HairBack',3,[384,340],[384,600]),
 ('HairBackTip',20,[384,600],[384,880]),
 ('HairLockImageLeft',3,[294,363],[250,495]),
 ('HairLeftTip',22,[250,495],[260,580]),
 ('HairLockImageRight',3,[474,363],[518,495]),
 ('HairRightTip',24,[518,495],[508,580]),
]
(P/'rig-map.json').write_text(json.dumps(dict(canvas=[768,1280],coordinateSystem='pixels, top-left origin; ImageLeft/Right means viewer side',bones=[dict(name=n,parent=p,point=a,end=b) for n,p,a,b in bones],layerOrder=assembly['backToFront']),indent=2),encoding='utf-8')
def arr(seq):return ','.join(json.dumps(x) for x in seq)
def vec(seq):return ','.join(f'new({x},{y})' for x,y in seq)
original=(M/'Assets/Editor/BuildMaraV2.cs').read_text()
imports=original[:original.index('public static class')]
top=imports+'public static class BuildIlyra {\n'
top+=f' public static readonly string[] Names={{{arr([b[0] for b in bones])}}};\n'
top+=f' public static readonly int[] Parents={{{arr([b[1] for b in bones])}}};\n'
top+=f' static readonly Vector2[] Points={{{vec([b[2] for b in bones])}}};\n'
top+=f' static readonly Vector2[] Ends={{{vec([b[3] for b in bones])}}};\n'
top+=f' static readonly string[] Layers={{{arr(assembly["backToFront"])}}};\n'
top+=original[original.index(' static Vector3 Pixel'):original.index(' static BoneWeight Weight')].replace('1024','1280')
weight=r'''
 static BoneWeight Weight(string n,float x,float y){
  if(n=="TorsoArmsHands"){
   if(y<520&&x>325&&x<443){
    if(y<450)return One(3);
    return Mix(3,1,Smooth(450,520,y));
   }
   float edge=274-.16f*(y-600);
   float arm=(x<384?1-Smooth(edge-35,edge+30,x):Smooth(768-edge-30,768-edge+35,x))*Smooth(500,605,y);
   int upper=x<384?4:7;
   float waist=Smooth(730,850,y), elbow=Smooth(740,825,y),wrist=Smooth(970,1030,y);
   var pairs=new List<(int i,float w)>{(1,(1-arm)*(1-waist)),(0,(1-arm)*waist),(upper,arm*(1-elbow)),(upper+1,arm*elbow*(1-wrist)),(upper+2,arm*elbow*wrist)};
   var p=pairs.OrderByDescending(v=>v.w).Take(4).ToArray();float sum=p.Sum(v=>v.w);
   return new BoneWeight{boneIndex0=p[0].i,weight0=p[0].w/sum,boneIndex1=p[1].i,weight1=p[1].w/sum,boneIndex2=p[2].i,weight2=p[2].w/sum,boneIndex3=p[3].i,weight3=p[3].w/sum};
  }
  if(n=="Pelvis")return One(0);
  if(n=="ThighImageLeft"||n=="ThighImageRight")return Mix(0,n.EndsWith("Left")?10:11,Smooth(880,980,y));
  if(n=="SkirtImageLeft"||n=="SkirtImageRight"){int i=n.EndsWith("Left")?12:14;return y<900?Mix(0,i,Smooth(820,900,y)):Mix(i,i+1,Smooth(940,1060,y));}
  if(n=="SkirtCenter")return Mix(0,16,Smooth(850,1000,y));
  if(n=="CapeBack")return Mix(17,x<384?18:19,Smooth(600,850,y));
  if(n=="HairBack")return y<450?Mix(3,20,Smooth(310,450,y)):Mix(20,21,Smooth(520,750,y));
  if(n=="HairLockImageLeft"||n=="HairLockImageRight"){int i=n.EndsWith("Left")?22:24;return Mix(i,i+1,Smooth(460,540,y));}
  return One(3);
 }
'''
helpers=original[original.index(' static List<SpriteBone> Bones'):original.index(' static AnimationClip MakeClip')]
helpers=helpers.replace('MaraV2','IlyraPrep').replace('Mara.psb','Ilyra.psb').replace('1024-y-origin.y','1280-y-origin.y')
helpers=helpers.replace('name=="Torso"','name=="TorsoArmsHands"').replace('Assets/Art/Torso.png','Assets/Art/TorsoArmsHands.png')
helpers=helpers.replace('int step=rigid?2048:28','int step=rigid?2048:20')
helpers=helpers.replace('name=="HairFront"','name=="HairFrontGoggles"').replace('name=="Hips"','name=="Pelvis"')
run=r'''
 [MenuItem("SPIRE/Ilyra/Build preparation rig")]
 public static void Run(){try{
  AssetDatabase.Refresh();PlayerSettings.colorSpace=ColorSpace.Gamma;QualitySettings.antiAliasing=0;PlayerSettings.runInBackground=true;
  var sprites=new Dictionary<string,Sprite>();foreach(string n in Layers)sprites[n]=Import(n);
  RigPsb();EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
  var rig=new GameObject("Ilyra Preparation");var bones=new Transform[Names.Length];var bind=Bones(Vector2.zero);
  for(int i=0;i<Names.Length;i++){var tr=new GameObject(Names[i]).transform;tr.SetParent(Parents[i]<0?rig.transform:bones[Parents[i]],false);tr.localPosition=bind[i].position-(Parents[i]<0?new Vector3(384,640,0):Vector3.zero);tr.localRotation=bind[i].rotation;bones[i]=tr;}
  var visuals=new GameObject("Visuals");visuals.transform.SetParent(rig.transform,false);
  for(int i=0;i<Layers.Length;i++){string n=Layers[i];var go=new GameObject(n);go.transform.SetParent(visuals.transform,false);var sr=go.AddComponent<SpriteRenderer>();sr.sprite=sprites[n];sr.sortingOrder=i;var skin=go.AddComponent<SpriteSkin>();skin.SetRootBone(bones[0]);skin.alwaysUpdate=true;skin.forceCpuDeformation=true;var state=skin.SetBoneTransforms(bones);if(state.ToString()!="Ready")throw new Exception(n+" skin "+state);}
  var cam=new GameObject("Inspection Camera").AddComponent<Camera>();cam.transform.position=new(0,0,-100);cam.orthographic=true;cam.orthographicSize=640;cam.aspect=.6f;cam.clearFlags=CameraClearFlags.SolidColor;cam.backgroundColor=Color.clear;cam.allowHDR=false;cam.allowMSAA=false;
  var test=rig.AddComponent<IlyraJointTest>();test.bones=bones;test.parents=Parents;test.lengths=Points.Select((p,i)=>Vector2.Distance(p,Ends[i])).ToArray();test.captureCamera=cam;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraPreparation.unity");PrefabUtility.SaveAsPrefabAsset(rig,"Assets/Ilyra.prefab");AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_RIG_READY bones="+Names.Length+" layers="+Layers.Length);if(Application.isBatchMode)EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);if(Application.isBatchMode)EditorApplication.Exit(1);else throw;}}
}
'''
(A/'Editor/BuildIlyra.cs').write_text(top+weight+helpers+run,encoding='utf-8')
print('Isolated Unity project prepared:',U)

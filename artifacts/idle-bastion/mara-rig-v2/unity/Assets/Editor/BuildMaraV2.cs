using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEditor.U2D.Sprites;
using UnityEditor.U2D.Animation;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;

public static class BuildMaraV2 {
 public static readonly string[] Names={"Root","Chest","Neck","Head","BraidA","BraidB","BraidC","HairL","HairR","CapeBack","CapeL","CapeLTip","CapeR","CapeRTip","UpperArmL","ForearmL","HandL","UpperArmR","ForearmR","HandR","BrowL","BrowR"};
 static readonly int[] Parents={-1,0,1,2,3,4,5,3,3,1,1,10,1,12,1,14,15,1,17,18,3,3};
 static readonly Vector2[] Points={new(384,760),new(384,530),new(384,390),new(384,300),new(280,336),new(276,452),new(278,560),new(247,305),new(505,305),new(384,438),new(238,493),new(180,620),new(533,493),new(590,620),new(251,435),new(196,613),new(218,761),new(518,435),new(575,613),new(556,761),new(320,225),new(425,207)};
 static readonly Vector2[] Ends={new(384,530),new(384,390),new(384,300),new(384,135),new(276,452),new(278,560),new(280,640),new(245,465),new(530,465),new(384,735),new(180,620),new(155,680),new(590,620),new(625,680),new(196,613),new(218,761),new(218,863),new(575,613),new(556,761),new(556,863),new(350,225),new(453,207)};
 static readonly string[] Layers={"CapeBack","CapeL","CapeR","HairBack","Hips","Torso","Head","Scarf","ForearmL","ForearmR","HandL","HandR","HairL","HairR","Braid","EyeL","EyeR","BrowL","BrowR","Mouth","HairFront"};
 static readonly string[] Variants={"EyeLHalf","EyeRHalf","EyeLClosed","EyeRClosed","MouthSmile"};
 static Vector3 Pixel(Vector2 p)=>new(p.x,1024-p.y,0);
 static Quaternion WorldRot(int i){Vector3 v=Pixel(Ends[i])-Pixel(Points[i]);return Quaternion.Euler(0,0,Mathf.Atan2(v.y,v.x)*Mathf.Rad2Deg);}
 static float Smooth(float a,float b,float x)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,x));
 static BoneWeight Mix(int a,int b,float w)=>new(){boneIndex0=a,weight0=1-w,boneIndex1=b,weight1=w};
 static BoneWeight One(int a)=>new(){boneIndex0=a,weight0=1};
 static BoneWeight Weight(string n,float x,float y){
  if(n=="Hips")return One(0);
  if(n=="Torso"){float edge=282-.22f*(y-420);float arm=(x<384?1-Smooth(edge-38,edge+24,x):Smooth(768-edge-24,768-edge+38,x))*Smooth(398,488,y);int upper=x<384?14:17;float waist=Smooth(565,720,y),bend=0;return new BoneWeight{boneIndex0=1,boneIndex1=0,boneIndex2=upper,boneIndex3=upper+1,weight0=(1-arm)*(1-waist),weight1=(1-arm)*waist,weight2=arm*(1-bend),weight3=arm*bend};}
  if(n=="Scarf")return One(1);
  if(n=="Braid")return y<455?Mix(4,5,Smooth(410,480,y)):Mix(5,6,Smooth(520,595,y));
  if(n=="HairBack")return Mix(3,x<384?7:8,Smooth(260,430,y)*.55f);
  if(n=="UpperArmL"||n=="UpperArmR"){int i=n.EndsWith("L")?14:17;return Mix(i,i+1,Smooth(548,610,y));}
  if(n.StartsWith("Forearm")||n.StartsWith("Hand")){int i=n.EndsWith("L")?15:18;return Mix(i,i+1,Smooth(734,774,y));}
  if(n=="CapeL"||n=="CapeR"){int i=n=="CapeL"?10:12;return Mix(i,i+1,Smooth(540,640,y));}
  int id=Array.IndexOf(Names,n);return One(id>=0?id:3);
 }
 static List<SpriteBone> Bones(Vector2 origin){
  var list=new List<SpriteBone>();
  for(int i=0;i<Names.Length;i++){
   int parent=Parents[i];var parentRotation=parent<0?Quaternion.identity:WorldRot(parent);
   list.Add(new SpriteBone{name=Names[i],parentId=parent,position=parent<0?Pixel(Points[i])-(Vector3)origin:Quaternion.Inverse(parentRotation)*(Pixel(Points[i])-Pixel(Points[parent])),rotation=Quaternion.Inverse(parentRotation)*WorldRot(i),length=Vector2.Distance(Points[i],Ends[i]),guid=Hash128.Compute("MaraV2/"+Names[i]).ToString()});
  }return list;
 }
 static RectInt Bounds(Texture2D tex){
  var a=tex.GetPixels32();int l=tex.width,b=tex.height,r=0,t=0;
  for(int y=0;y<tex.height;y++)for(int x=0;x<tex.width;x++)if(a[y*tex.width+x].a>0){l=Math.Min(l,x);r=Math.Max(r,x+1);b=Math.Min(b,y);t=Math.Max(t,y+1);}
  return new RectInt(Math.Max(0,l-2),Math.Max(0,b-2),Math.Min(tex.width,r+2)-Math.Max(0,l-2),Math.Min(tex.height,t+2)-Math.Max(0,b-2));
 }
 static void Mesh(ISpriteEditorDataProvider provider,SpriteRect rect,string name,Vector2 origin,RectInt bounds){
  provider.GetDataProvider<ISpriteBoneDataProvider>().SetBones(rect.spriteID,Bones(origin));
  var mesh=provider.GetDataProvider<ISpriteMeshDataProvider>();
  bool rigid=name.StartsWith("Eye")||name.StartsWith("Mouth")||name.StartsWith("Brow")||name=="Head"||name=="HairFront"||name=="Hips"||name=="Scarf";
  int step=rigid?2048:28;var xs=new List<int>();var ys=new List<int>();
  for(int x=bounds.xMin;x<bounds.xMax;x+=step)xs.Add(x);xs.Add(bounds.xMax);
  for(int y=bounds.yMin;y<bounds.yMax;y+=step)ys.Add(y);ys.Add(bounds.yMax);
  var vertices=new List<Vertex2DMetaData>();
  foreach(int y in ys)foreach(int x in xs){var w=Weight(name,x+origin.x,1024-y-origin.y);if(Mathf.Abs(w.weight0+w.weight1+w.weight2+w.weight3-1)>1e-6f)throw new Exception("Invalid weight "+name);vertices.Add(new Vertex2DMetaData{position=new Vector2(x,y),boneWeight=w});}
  var indices=new List<int>();var edges=new HashSet<(int,int)>();var art=name=="Torso"?AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Art/Torso.png"):null;
  void Edge(int a,int b){edges.Add(a<b?(a,b):(b,a));}
  for(int y=0;y<ys.Count-1;y++)for(int x=0;x<xs.Count-1;x++){bool occupied=art==null; if(art!=null){for(int py=ys[y];py<=ys[y+1]&&!occupied;py++)for(int px=xs[x];px<=xs[x+1];px++){int ax=px+Mathf.RoundToInt(origin.x),ay=py+Mathf.RoundToInt(origin.y);if(ax>=0&&ay>=0&&ax<art.width&&ay<art.height&&art.GetPixel(ax,ay).a>0){occupied=true;break;}}}if(!occupied)continue;int i=y*xs.Count+x;indices.AddRange(new[]{i,i+1,i+xs.Count,i+1,i+xs.Count+1,i+xs.Count});Edge(i,i+1);Edge(i,i+xs.Count);Edge(i+1,i+xs.Count);Edge(i+1,i+xs.Count+1);Edge(i+xs.Count,i+xs.Count+1);}
  mesh.SetVertices(rect.spriteID,vertices.ToArray());mesh.SetIndices(rect.spriteID,indices.ToArray());mesh.SetEdges(rect.spriteID,edges.Select(e=>new Vector2Int(e.Item1,e.Item2)).ToArray());
  Debug.Log($"MESH {name}: vertices={vertices.Count} triangles={indices.Count/3} weightSums=1 sharedIndices=true");
 }
 static Sprite Import(string name){
  string path=$"Assets/Art/{name}.png";var importer=(TextureImporter)AssetImporter.GetAtPath(path);
  importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;importer.spritePixelsPerUnit=1;importer.spritePivot=new(.5f,.5f);importer.textureCompression=TextureImporterCompression.Uncompressed;importer.filterMode=FilterMode.Bilinear;importer.mipmapEnabled=false;importer.sRGBTexture=false;importer.alphaIsTransparency=true;importer.npotScale=TextureImporterNPOTScale.None;importer.maxTextureSize=2048;importer.isReadable=true;importer.SaveAndReimport();
  var factories=new SpriteDataProviderFactories();factories.Init();var provider=factories.GetSpriteEditorDataProviderFromObject(importer);provider.InitSpriteEditorDataProvider();
  Mesh(provider,provider.GetSpriteRects()[0],name,Vector2.zero,Bounds(AssetDatabase.LoadAssetAtPath<Texture2D>(path)));provider.Apply();importer.SaveAndReimport();return AssetDatabase.LoadAssetAtPath<Sprite>(path);
 }
 static void RigPsb(){
  var importer=AssetImporter.GetAtPath("Assets/Art/Mara.psb");var so=new SerializedObject(importer);
  foreach(string key in new[]{"m_MosaicLayers","m_CharacterMode","m_UseLayerGrouping"}){var p=so.FindProperty(key);if(p!=null)p.boolValue=true;}
  var ppu=so.FindProperty("m_TextureImporterSettings.m_SpritePixelsToUnits");if(ppu!=null)ppu.floatValue=1;
  so.ApplyModifiedPropertiesWithoutUndo();importer.SaveAndReimport();
  var factories=new SpriteDataProviderFactories();factories.Init();var provider=factories.GetSpriteEditorDataProviderFromObject(importer);provider.InitSpriteEditorDataProvider();
  var cp=provider.GetDataProvider<ICharacterDataProvider>();if(cp==null)throw new Exception("PSD character provider missing");
  var data=cp.GetCharacterData();data.bones=Bones(Vector2.zero).ToArray();data.pivot=new(.5f,.5f);
  foreach(var rect in provider.GetSpriteRects()){
   int j=Array.FindIndex(data.parts,p=>p.spriteId==rect.spriteID.ToString());if(j<0)continue;
   var part=data.parts[j];part.bones=Enumerable.Range(0,Names.Length).ToArray();data.parts[j]=part;
   Mesh(provider,rect,rect.name,part.spritePosition.position,new RectInt(0,0,part.spritePosition.width,part.spritePosition.height));
  }
  cp.SetCharacterData(data);provider.Apply();importer.SaveAndReimport();
  Debug.Log("PSB_RIG_READY: character bones="+Names.Length+" parts="+data.parts.Length);
 }
 static AnimationClip MakeClip(GameObject rig,Transform[] bones,Dictionary<string,Sprite> sprites,string name,float length){
  var clip=new AnimationClip{name=name,frameRate=30,wrapMode=name=="Idle"?WrapMode.Loop:WrapMode.Once};
  float Envelope(float t)=>Mathf.Pow(Mathf.Sin(Mathf.PI*t/length),2);
  float Offset(int b,float t){
   if(t<=0||t>=length)return 0;
   float u=t/length,w=2*Mathf.PI*u;
   if(name=="Idle"){
    float[] amp={0,.12f,.12f,.32f,-.35f,-.55f,-.7f,-.3f,.3f,.18f,.4f,.6f,-.4f,-.6f,.12f,-.12f,.08f,-.12f,.12f,-.08f,0,0};
    float phase=(b>=4&&b<=13)?.18f*(b%4):0;return amp[b]*(Mathf.Sin(w-phase)+Mathf.Sin(phase));
   }
   float e=Envelope(t);float lag=e*(1-.3f*Mathf.Cos(Mathf.PI*u));
   if(name=="Head Reaction")return b switch{1=>-.25f*e,2=>.6f*e,3=>4.2f*e,4=>-1.4f*lag,5=>-1.9f*lag,6=>-2.5f*lag,7=>-1.1f*lag,8=>-1.2f*lag,_=>0};
   return b switch{1=>-.45f*e,2=>-.3f*e,3=>-2.3f*e,4=>1.1f*lag,5=>1.6f*lag,6=>2*lag,7=>.7f*lag,8=>.8f*lag,12=>-1.5f*e,13=>-2*lag,17=>-7*e,18=>-42*e,19=>12*e,_=>0};
  }
  for(int b=0;b<bones.Length;b++){
   int id=b;string path=AnimationUtility.CalculateTransformPath(bones[b],rig.transform);Vector3 rest=bones[b].localPosition;float rotation=bones[b].localEulerAngles.z;
   foreach(string property in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float Value(float t){if(property=="localEulerAnglesRaw.z")return rotation+Offset(id,t);float value=property.EndsWith("x")?rest.x:rest.y;
     if(id==1&&name=="Idle") {var world=new Vector3(0,.9f*(1-Mathf.Cos(2*Mathf.PI*t/length)),0);var local=Quaternion.Inverse(WorldRot(0))*world;value+=property.EndsWith("x")?local.x:local.y;}
     if(id>=20&&name!="Idle"){var world=new Vector3(0,1.5f*Envelope(t),0);var local=Quaternion.Inverse(WorldRot(3))*world;value+=property.EndsWith("x")?local.x:local.y;}
     return value;
    }
    int samples=(int)(length*30);var keys=new Keyframe[samples+1];for(int i=0;i<=samples;i++){float t=length*i/samples;float tangent=(Value(Mathf.Min(length,t+.001f))-Value(Mathf.Max(0,t-.001f)))/(.001f*(i==0||i==samples?1:2));keys[i]=new(t,Value(t),tangent,tangent);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(path,typeof(Transform),property),new AnimationCurve(keys));
   }
  }
  void Swaps(string layer,List<ObjectReferenceKeyframe> keys){AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/"+layer,typeof(SpriteRenderer),"m_Sprite"),keys.ToArray());}
  foreach(string side in new[]{"L","R"}){
   string layer="Eye"+side;var keys=new List<ObjectReferenceKeyframe>{new(){time=0,value=sprites[layer]}};
   if(name!="Touch Reaction"||side=="R"){
    float t=name=="Idle"?2.2f:name=="Head Reaction"?.45f:.78f;
    keys.Add(new(){time=t,value=sprites[layer+"Half"]});keys.Add(new(){time=t+.067f,value=sprites[layer+"Closed"]});keys.Add(new(){time=t+(name=="Touch Reaction"?.33f:.133f),value=sprites[layer+"Half"]});keys.Add(new(){time=t+(name=="Touch Reaction"?.4f:.2f),value=sprites[layer]});
   }Swaps(layer,keys);
  }
  var mouth=new List<ObjectReferenceKeyframe>{new(){time=0,value=sprites["Mouth"]}};
  if(name!="Idle"){mouth.Add(new(){time=.3f,value=sprites["MouthSmile"]});mouth.Add(new(){time=length-.3f,value=sprites["Mouth"]});}Swaps("Mouth",mouth);
  var settings=AnimationUtility.GetAnimationClipSettings(clip);settings.loopTime=name=="Idle";AnimationUtility.SetAnimationClipSettings(clip,settings);
  string file="Assets/Clips/"+name.Replace(" ","")+".anim";if(File.Exists(file))AssetDatabase.DeleteAsset(file);AssetDatabase.CreateAsset(clip,file);return clip;
 }
 [MenuItem("SPIRE/Mara V2/Build rig and export")]
 public static void Run(){
  try{
   Directory.CreateDirectory("Assets/Clips");AssetDatabase.Refresh();PlayerSettings.colorSpace=ColorSpace.Gamma;QualitySettings.antiAliasing=0;PlayerSettings.runInBackground=true;
   var sprites=new Dictionary<string,Sprite>();foreach(string name in Layers.Concat(Variants))sprites[name]=Import(name);
   RigPsb();EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
   var rig=new GameObject("Mara V2");var bones=new Transform[Names.Length];var bind=Bones(Vector2.zero);
   for(int i=0;i<Names.Length;i++){var tr=new GameObject(Names[i]).transform;tr.SetParent(Parents[i]<0?rig.transform:bones[Parents[i]],false);tr.localPosition=bind[i].position-(Parents[i]<0?new Vector3(384,512,0):Vector3.zero);tr.localRotation=bind[i].rotation;bones[i]=tr;}
   var visuals=new GameObject("Visuals");visuals.transform.SetParent(rig.transform,false);
   for(int i=0;i<Layers.Length;i++){string n=Layers[i];var go=new GameObject(n);go.transform.SetParent(visuals.transform,false);var sr=go.AddComponent<SpriteRenderer>();sr.sprite=sprites[n];sr.sortingOrder=i;var skin=go.AddComponent<SpriteSkin>();skin.SetRootBone(bones[0]);skin.alwaysUpdate=true;skin.forceCpuDeformation=true;var state=skin.SetBoneTransforms(bones);if(state.ToString()!="Ready")throw new Exception(n+" skin "+state);}
   var idle=MakeClip(rig,bones,sprites,"Idle",5);var head=MakeClip(rig,bones,sprites,"Head Reaction",1.6f);var touch=MakeClip(rig,bones,sprites,"Touch Reaction",2.4f);
   string ctl="Assets/MaraV2.controller";if(File.Exists(ctl))AssetDatabase.DeleteAsset(ctl);var controller=AnimatorController.CreateAnimatorControllerAtPath(ctl);var sm=controller.layers[0].stateMachine;
   var idleState=sm.AddState("Idle");idleState.motion=idle;sm.defaultState=idleState;
   foreach(var pair in new[]{("Head",head),("Touch",touch)}){controller.AddParameter(pair.Item1,AnimatorControllerParameterType.Trigger);var state=sm.AddState(pair.Item1);state.motion=pair.Item2;var entry=idleState.AddTransition(state);entry.hasExitTime=false;entry.duration=.1f;entry.AddCondition(AnimatorConditionMode.If,0,pair.Item1);var back=state.AddTransition(idleState);back.hasExitTime=true;back.exitTime=1;back.duration=.1f;}
   rig.AddComponent<Animator>().runtimeAnimatorController=controller;
   var cam=new GameObject("Export Camera").AddComponent<Camera>();cam.transform.position=new(0,0,-10);cam.orthographic=true;cam.orthographicSize=512;cam.aspect=.75f;cam.clearFlags=CameraClearFlags.SolidColor;cam.backgroundColor=Color.clear;cam.allowHDR=false;cam.allowMSAA=false;
   var exporter=rig.AddComponent<MaraV2Export>();exporter.clips=new[]{idle,head,touch};exporter.captureCamera=cam;exporter.bones=bones;exporter.parents=Parents;
   var gizmos=rig.AddComponent<MaraRigGizmos>();gizmos.bones=bones;gizmos.parents=Parents;
   idle.SampleAnimation(rig,0);EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/MaraV2.unity");PrefabUtility.SaveAsPrefabAsset(rig,"Assets/MaraV2.prefab");AssetDatabase.SaveAssets();
   Debug.Log("MARA_V2_READY bones="+bones.Length+" skins="+Layers.Length+" clips=3");if(Application.isBatchMode)EditorApplication.EnterPlaymode();
  }catch(Exception e){Debug.LogException(e);if(Application.isBatchMode)EditorApplication.Exit(1);else throw;}
 }
}







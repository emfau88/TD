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

public static class BuildIlyra {
 public static readonly string[] Names={"Root","Chest","Neck","Head","UpperArmImageLeft","ForearmImageLeft","HandImageLeft","UpperArmImageRight","ForearmImageRight","HandImageRight","ThighImageLeft","ThighImageRight","SkirtImageLeft","SkirtLeftTip","SkirtImageRight","SkirtRightTip","SkirtCenter","CapeBack","CapeLeftTip","CapeRightTip","HairBack","HairBackTip","HairLockImageLeft","HairLeftTip","HairLockImageRight","HairRightTip","ChestSoftLeft","ChestSoftRight"};
 public static readonly int[] Parents={-1,0,1,2,1,4,5,1,7,8,0,0,0,12,0,14,0,1,17,17,3,20,3,22,3,24,1,1};
 static readonly Vector2[] Points={new(384,850),new(384,650),new(384,505),new(384,435),new(216,555),new(171,792),new(161,1003),new(552,555),new(597,792),new(607,1003),new(290,920),new(478,920),new(318,850),new(240,1000),new(450,850),new(528,1000),new(384,860),new(384,520),new(250,740),new(518,740),new(384,340),new(384,600),new(294,363),new(250,495),new(474,363),new(518,495),new(322,650),new(446,650)};
 static readonly Vector2[] Ends={new(384,650),new(384,510),new(384,440),new(384,235),new(171,792),new(161,1003),new(162,1140),new(597,792),new(607,1003),new(606,1140),new(290,1230),new(478,1230),new(240,1000),new(230,1135),new(528,1000),new(538,1135),new(384,1120),new(384,750),new(145,940),new(623,940),new(384,600),new(384,880),new(250,495),new(260,580),new(518,495),new(508,580),new(322,610),new(446,610)};
 static readonly string[] Layers={"CapeBack","HairBack","ThighImageLeft","ThighImageRight","Pelvis","SkirtImageLeft","SkirtImageRight","SkirtCenter","TorsoArmsHands","Head","HairLockImageLeft","HairLockImageRight","HairFrontGoggles"};
 static Vector3 Pixel(Vector2 p)=>new(p.x,1280-p.y,0);
 static Quaternion WorldRot(int i){Vector3 v=Pixel(Ends[i])-Pixel(Points[i]);return Quaternion.Euler(0,0,Mathf.Atan2(v.y,v.x)*Mathf.Rad2Deg);}
 static float Smooth(float a,float b,float x)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,x));
 static BoneWeight Mix(int a,int b,float w)=>new(){boneIndex0=a,weight0=1-w,boneIndex1=b,weight1=w};
 static BoneWeight One(int a)=>new(){boneIndex0=a,weight0=1};

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
   // Continuous chest fabric: no detached patches or scaled silhouettes.
   float center=x<384?322:446;
   float d=Mathf.Sqrt(Mathf.Pow((x-center)/91,2)+Mathf.Pow((y-650)/96,2));
   float influence=.78f*(1-Smooth(.22f,1,d))*Smooth(557,590,y)*(1-Smooth(706,744,y));
   influence*=x<384?1-Smooth(362,384,x):Smooth(384,406,x);
   float soft=pairs[0].w*influence;pairs[0]=(1,pairs[0].w-soft);pairs.Add((x<384?26:27,soft));
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
 static List<SpriteBone> Bones(Vector2 origin){
  var list=new List<SpriteBone>();
  for(int i=0;i<Names.Length;i++){
   int parent=Parents[i];var parentRotation=parent<0?Quaternion.identity:WorldRot(parent);
   list.Add(new SpriteBone{name=Names[i],parentId=parent,position=parent<0?Pixel(Points[i])-(Vector3)origin:Quaternion.Inverse(parentRotation)*(Pixel(Points[i])-Pixel(Points[parent])),rotation=Quaternion.Inverse(parentRotation)*WorldRot(i),length=Vector2.Distance(Points[i],Ends[i]),guid=Hash128.Compute("IlyraPrep/"+Names[i]).ToString()});
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
  bool rigid=name.StartsWith("Eye")||name.StartsWith("Mouth")||name.StartsWith("Brow")||name.StartsWith("Head")||name=="HairFrontGoggles"||name=="Pelvis"||name=="Scarf";
  int step=rigid?2048:(name=="TorsoArmsHands"?12:20);var xs=new List<int>();var ys=new List<int>();
  for(int x=bounds.xMin;x<bounds.xMax;x+=step)xs.Add(x);xs.Add(bounds.xMax);
  for(int y=bounds.yMin;y<bounds.yMax;y+=step)ys.Add(y);ys.Add(bounds.yMax);
  var vertices=new List<Vertex2DMetaData>();
  foreach(int y in ys)foreach(int x in xs){var w=Weight(name,x+origin.x,1280-y-origin.y);if(Mathf.Abs(w.weight0+w.weight1+w.weight2+w.weight3-1)>1e-6f)throw new Exception("Invalid weight "+name);vertices.Add(new Vertex2DMetaData{position=new Vector2(x,y),boneWeight=w});}
  var indices=new List<int>();var edges=new HashSet<(int,int)>();var art=name=="TorsoArmsHands"?AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Art/TorsoArmsHands.png"):null;
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
  var importer=AssetImporter.GetAtPath("Assets/Art/Ilyra.psb");var so=new SerializedObject(importer);
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
  Debug.Log("ILYRA_RIG_READY bones="+Names.Length+" layers="+Layers.Length);BuildIlyraIdle.Finish(test);
 }catch(Exception e){Debug.LogException(e);if(Application.isBatchMode)EditorApplication.Exit(1);else throw;}}
}

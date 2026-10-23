using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;
using UnityEditor;
using UnityEditor.U2D.Sprites;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;

// Pose-specific continuous skin. The drawn elbow changes only a few degrees;
// an analytic two-bone solve keeps the hand attached to the moving hip.
public static class BuildIlyraHipBaseV2 {
 const string Folder="Assets/HipBaseV2", Output="../../hip-base-v2/motion/preview";
 const float W=971,H=1619,Duration=6;
 static readonly string[] Names={"Anchor","Pelvis","Chest","Head","UpperArmLeft","ForearmLeft","HandOnHip","UpperArmRight","ForearmRight","HandRight","HairLeft","HairRight","ClothLeft","ClothRight","ChestSoftLeft","ChestSoftRight"};
 static readonly int[] Parents={-1,0,1,2,2,4,1,2,7,8,3,3,1,1,2,2};
 static readonly Vector2[] Points={new(500,1600),new(500,1050),new(500,690),new(495,500),new(260,620),new(100,815),new(235,965),new(735,625),new(800,920),new(820,1160),new(320,440),new(660,440),new(260,1100),new(730,1100),new(390,770),new(600,770)};
 static Vector3 P(Vector2 p)=>new(p.x-W/2,H/2-p.y,0);
 static float S(float a,float b,float x)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,x));
 static float Segment(Vector2 p,Vector2 a,Vector2 b,out float t){t=Mathf.Clamp01(Vector2.Dot(p-a,b-a)/(b-a).sqrMagnitude);return Vector2.Distance(p,Vector2.Lerp(a,b,t));}
 static BoneWeight Weights(float x,float y){
  var v=new float[Names.Length];
  if(y<575){float n=S(455,575,y);v[3]=1-n;v[2]=n;}
  else if(y<1050){float n=S(810,1050,y);v[2]=1-n;v[1]=n;}
  else {float n=S(1240,1619,y);v[1]=1-n;v[0]=n;}
  void Add(int id,float k){k=Mathf.Clamp01(k);for(int i=0;i<v.Length;i++)v[i]*=1-k;v[id]+=k;}
  var p=new Vector2(x,y);
  // Region boundaries follow the actual silhouette, not a horizontal elbow band.
  float d1=Segment(p,Points[4],Points[5],out float u),d2=Segment(p,Points[5],Points[6],out float f);
  if(x<345&&y>565&&y<1040){
   float influence=(1-S(70,110,Mathf.Min(d1,d2)))*S(565,620,y);
   float fore=d2<d1?1:0;
   if(Vector2.Distance(p,Points[5])<65)fore=S(-35,35,Vector2.Dot(p-Points[5],(Points[6]-Points[4]).normalized));
   for(int i=0;i<v.Length;i++)v[i]*=1-influence;
   float hand=S(.62f,1,f)*(d2<d1?1:0);
   v[4]+=influence*(1-fore);v[5]+=influence*fore*(1-hand);v[6]+=influence*fore*hand;
  }
  // Hip-contact fingers are rigid with the pelvis, including their belt overlap.
  if(y>930&&y<1065&&x>220&&x<405)Add(6,S(930,965,y)*(1-S(1040,1065,y)));
  if(x>685&&y>590&&y<1400){
   float d=Segment(p,Points[7],Points[8],out float t1);float e=Segment(p,Points[8],Points[9],out float t2);
   float k=(1-S(58,98,Mathf.Min(d,e)))*S(590,650,y);
   if(y>1130)k=(1-S(65,100,Mathf.Abs(x-810)))*(1-S(1350,1400,y));
   float fore=S(865,960,y),hand=S(1120,1190,y);
   for(int i=0;i<v.Length;i++)v[i]*=1-k;
   v[7]+=k*(1-fore);v[8]+=k*fore*(1-hand);v[9]+=k*fore*hand;
  }
  // Small follow-through only; do not pretend that this attached artwork can
  // uncover hidden surfaces or perform a new viewpoint.
  if(y>425&&y<705){float c=x<490?320:660;float k=(1-S(45,95,Mathf.Abs(x-c)))*S(425,530,y)*(1-S(660,705,y));Add(x<490?10:11,.65f*k);}
  if(y>1080){float k=S(1080,1240,y)*(1-S(1450,1570,y));k*=x<500?1-S(350,430,x):S(580,690,x);Add(x<500?12:13,.35f*k);}
  if(y>610&&y<875&&x>285&&x<710){
   float c=x<500?390:600;float d=Mathf.Sqrt(Mathf.Pow((x-c)/110,2)+Mathf.Pow((y-750)/115,2));
   float k=.65f*(1-S(.2f,1,d))*S(610,660,y)*(1-S(830,875,y));
   k*=x<500?1-S(467,500,x):S(500,533,x);Add(x<500?14:15,k);
  }
  var pairs=v.Select((weight,index)=>(weight,index)).OrderByDescending(q=>q.weight).Take(4).ToArray();float sum=pairs.Sum(q=>q.weight);
  return new BoneWeight{boneIndex0=pairs[0].index,weight0=pairs[0].weight/sum,boneIndex1=pairs[1].index,weight1=pairs[1].weight/sum,boneIndex2=pairs[2].index,weight2=pairs[2].weight/sum,boneIndex3=pairs[3].index,weight3=pairs[3].weight/sum};
 }
 static Sprite Import(){
  string path=Folder+"/IlyraHipBase.png";var importer=(TextureImporter)AssetImporter.GetAtPath(path);
  importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;importer.spritePixelsPerUnit=1;importer.spritePivot=new(.5f,.5f);importer.textureCompression=TextureImporterCompression.Uncompressed;importer.filterMode=FilterMode.Bilinear;importer.mipmapEnabled=false;importer.sRGBTexture=false;importer.alphaIsTransparency=true;importer.npotScale=TextureImporterNPOTScale.None;importer.maxTextureSize=2048;importer.isReadable=true;importer.SaveAndReimport();
  var factories=new SpriteDataProviderFactories();factories.Init();var provider=factories.GetSpriteEditorDataProviderFromObject(importer);provider.InitSpriteEditorDataProvider();var rect=provider.GetSpriteRects()[0];
  var bones=new List<SpriteBone>();for(int i=0;i<Names.Length;i++)bones.Add(new SpriteBone{name=Names[i],parentId=Parents[i],position=Parents[i]<0?new Vector3(Points[i].x,H-Points[i].y,0):P(Points[i])-P(Points[Parents[i]]),rotation=Quaternion.identity,length=60,guid=Hash128.Compute("HipBaseV2/"+Names[i]).ToString()});
  provider.GetDataProvider<ISpriteBoneDataProvider>().SetBones(rect.spriteID,bones);
  var xs=new List<float>();var ys=new List<float>();for(float x=0;x<W;x+=16)xs.Add(x);xs.Add(W);for(float y=0;y<H;y+=16)ys.Add(y);ys.Add(H);
  var vertices=new List<Vertex2DMetaData>();foreach(float y in ys)foreach(float x in xs)vertices.Add(new Vertex2DMetaData{position=new Vector2(x,y),boneWeight=Weights(x,H-y)});
  var indices=new List<int>();var edges=new HashSet<(int,int)>();void Edge(int a,int b)=>edges.Add(a<b?(a,b):(b,a));
  for(int y=0;y<ys.Count-1;y++)for(int x=0;x<xs.Count-1;x++){int a=y*xs.Count+x,b=a+1,c=a+xs.Count,d=c+1;indices.AddRange(new[]{a,b,c,b,d,c});Edge(a,b);Edge(a,c);Edge(b,c);Edge(b,d);Edge(c,d);}
  var mesh=provider.GetDataProvider<ISpriteMeshDataProvider>();mesh.SetVertices(rect.spriteID,vertices.ToArray());mesh.SetIndices(rect.spriteID,indices.ToArray());mesh.SetEdges(rect.spriteID,edges.Select(e=>new Vector2Int(e.Item1,e.Item2)).ToArray());provider.Apply();importer.SaveAndReimport();return AssetDatabase.LoadAssetAtPath<Sprite>(path);
 }
 static float Wave(float t,float lag=0){float q=2*Mathf.PI*t/Duration;return Mathf.Sin(q)*Mathf.Pow(Mathf.Sin(q/2),2)+lag*(1-Mathf.Cos(q));}
 static void Pose(Transform[] b,float t){
  for(int i=0;i<b.Length;i++){b[i].localPosition=Parents[i]<0?P(Points[i]):P(Points[i])-P(Points[Parents[i]]);b[i].localRotation=Quaternion.identity;}
  float sway=Wave(t),breath=(1-Mathf.Cos(4*Mathf.PI*t/Duration))*.5f;
  b[1].localPosition+=new Vector3(23*sway,-2.5f*breath,0);b[1].localRotation=Quaternion.Euler(0,0,-.9f*sway);
  b[2].localPosition+=new Vector3(-12*sway,3.5f*breath,0);b[2].localRotation=Quaternion.Euler(0,0,1.55f*sway);
  b[3].localRotation=Quaternion.Euler(0,0,-1.3f*Wave(t,.12f));
  b[7].localRotation=Quaternion.Euler(0,0,.8f*Wave(t,-.08f));b[8].localRotation=Quaternion.Euler(0,0,-.6f*Wave(t,-.13f));b[9].localRotation=Quaternion.Euler(0,0,.35f*Wave(t,-.16f));
  b[10].localRotation=Quaternion.Euler(0,0,1.4f*Wave(t,-.18f));b[11].localRotation=Quaternion.Euler(0,0,1.1f*Wave(t,-.23f));
  b[12].localRotation=Quaternion.Euler(0,0,.8f*Wave(t,-.2f));b[13].localRotation=Quaternion.Euler(0,0,1.1f*Wave(t,-.17f));
  Vector2 shoulder=b[4].position,wrist=b[6].position;float l1=Vector2.Distance(Points[4],Points[5]),l2=Vector2.Distance(Points[5],Points[6]);
  Vector2 delta=wrist-shoulder;float distance=delta.magnitude;Vector2 direction=delta/distance;float along=(l1*l1-l2*l2+distance*distance)/(2*distance);float height=Mathf.Sqrt(Mathf.Max(0,l1*l1-along*along));
  Vector2 elbow=shoulder+direction*along-new Vector2(-direction.y,direction.x)*height;
  float Angle(Vector2 v)=>Mathf.Atan2(v.y,v.x)*Mathf.Rad2Deg;
  b[4].rotation=Quaternion.Euler(0,0,Angle(elbow-shoulder)-Angle(P(Points[5])-P(Points[4])));
  b[5].rotation=Quaternion.Euler(0,0,Angle(wrist-elbow)-Angle(P(Points[6])-P(Points[5])));
 }
 [Serializable] class Report {public string method="Continuous SpriteSkin, contact IK, acceleration-driven secondary motion";public int bones=16,solverHz=240;public float duration=6,maxWristError,maxUpperArmChange,maxForearmChange,maxSpringLeft,maxSpringRight;}
 public static void Run(){try{
  Directory.CreateDirectory(Output);AssetDatabase.Refresh();PlayerSettings.colorSpace=ColorSpace.Gamma;QualitySettings.antiAliasing=0;
  var sprite=Import();EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);var root=new GameObject("Ilyra Hip Base V2");var bones=new Transform[Names.Length];
  for(int i=0;i<bones.Length;i++){bones[i]=new GameObject(Names[i]).transform;bones[i].SetParent(Parents[i]<0?root.transform:bones[Parents[i]],false);bones[i].localPosition=Parents[i]<0?P(Points[i]):P(Points[i])-P(Points[Parents[i]]);}
  var visual=new GameObject("ContinuousPose");visual.transform.SetParent(root.transform,false);visual.AddComponent<SpriteRenderer>().sprite=sprite;var skin=visual.AddComponent<SpriteSkin>();skin.SetRootBone(bones[0]);skin.alwaysUpdate=true;skin.forceCpuDeformation=true;if(skin.SetBoneTransforms(bones).ToString()!="Ready")throw new Exception("Skin not ready");
  var camera=new GameObject("Export Camera").AddComponent<Camera>();camera.transform.position=new(0,0,-100);camera.orthographic=true;camera.orthographicSize=H/2;camera.aspect=.6f;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=Color.clear;camera.allowHDR=false;camera.allowMSAA=false;
  var clip=new AnimationClip{name="IlyraHandOnHipSway",frameRate=30,wrapMode=WrapMode.Loop};var report=new Report();int count=1440;float dt=1/240f;
  var samples=new Vector3[bones.Length][];var angles=new float[bones.Length][];for(int i=0;i<bones.Length;i++){samples[i]=new Vector3[count+1];angles[i]=new float[count+1];}
  var states=new[]{new IlyraSecondaryMotion.State(),new IlyraSecondaryMotion.State()};var previous=new Vector2[2];var velocity=new Vector2[2];
  for(int f=0;f<=count;f++){float t=f/240f;Pose(bones,t);
   Vector3 restEnd=P(Points[6])-P(Points[5]);float error=Vector3.Distance(bones[5].TransformPoint(restEnd),bones[6].position);report.maxWristError=Mathf.Max(report.maxWristError,error);
   report.maxUpperArmChange=Mathf.Max(report.maxUpperArmChange,Mathf.Abs(Mathf.DeltaAngle(0,bones[4].eulerAngles.z)));report.maxForearmChange=Mathf.Max(report.maxForearmChange,Mathf.Abs(Mathf.DeltaAngle(0,bones[5].eulerAngles.z)));
   for(int j=0;j<2;j++){Vector2 anchor=bones[14+j].position;Vector2 v=f==0?Vector2.zero:(anchor-previous[j])/dt;Vector2 acceleration=f<=1?Vector2.zero:(v-velocity[j])/dt;if(f>0)states[j].Step(acceleration,dt,1.8f+j*.035f,.5f,1.4f,10);float fade=1-S(5.3f,6,t);bones[14+j].localPosition+=bones[2].InverseTransformVector(states[j].offset*fade);if(j==0)report.maxSpringLeft=Mathf.Max(report.maxSpringLeft,states[j].offset.magnitude);else report.maxSpringRight=Mathf.Max(report.maxSpringRight,states[j].offset.magnitude);previous[j]=anchor;velocity[j]=v;}
   for(int i=0;i<bones.Length;i++){samples[i][f]=bones[i].localPosition;angles[i][f]=Mathf.DeltaAngle(0,bones[i].localEulerAngles.z);}
  }
  for(int i=0;i<bones.Length;i++){samples[i][count]=samples[i][0];angles[i][count]=angles[i][0];foreach(string property in new[]{"m_LocalPosition.x","m_LocalPosition.y","localEulerAnglesRaw.z"}){
   var keys=new Keyframe[count+1];for(int f=0;f<=count;f++)keys[f]=new Keyframe(f/240f,property.EndsWith(".z")?angles[i][f]:property.EndsWith(".x")?samples[i][f].x:samples[i][f].y);
   var curve=new AnimationCurve(keys);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}
   AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bones[i],root.transform),typeof(Transform),property),curve);
  }}
  string clipPath=Folder+"/IlyraHandOnHipSway.anim";var old=AssetDatabase.LoadAssetAtPath<AnimationClip>(clipPath);if(old==null)AssetDatabase.CreateAsset(clip,clipPath);else{EditorUtility.CopySerialized(clip,old);EditorUtility.SetDirty(old);clip=old;}
  var controller=AssetDatabase.LoadAssetAtPath<AnimatorController>(Folder+"/IlyraHandOnHip.controller");if(controller==null){controller=AnimatorController.CreateAnimatorControllerAtPath(Folder+"/IlyraHandOnHip.controller");controller.layers[0].stateMachine.AddState("HipSway").motion=clip;}
  var animator=root.AddComponent<Animator>();animator.runtimeAnimatorController=controller;animator.enabled=false;Pose(bones,0);
  var export=root.AddComponent<IlyraHeadExport>();export.bones=bones;export.parents=Parents;export.lengths=Enumerable.Repeat(60f,bones.Length).ToArray();export.captureCamera=camera;export.clip=clip;export.outputBase=Output;
  File.WriteAllText(Output+"/rig-checks.json",JsonUtility.ToJson(report,true));
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"/IlyraHandOnHip.unity");PrefabUtility.SaveAsPrefabAsset(root,Folder+"/IlyraHandOnHip.prefab");AssetDatabase.SaveAssets();Debug.Log("HIP_BASE_V2_READY");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

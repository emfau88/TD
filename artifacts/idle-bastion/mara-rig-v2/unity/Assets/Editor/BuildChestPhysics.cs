using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEditor.U2D.Sprites;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;

public static class BuildChestPhysics {
 const float Length=4.2f,Hz=240;
 static AnimationCurve Curve(params float[] p){var keys=new Keyframe[p.Length/2];for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(p[2*i],p[2*i+1],0,0);return new AnimationCurve(keys);}
 static float Smooth(float a,float b,float x)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,x));
 static BoneWeight Weight(Vector2 position){
  float x=position.x,y=1024-position.y,edge=282-.22f*(y-420),arm=(x<384?1-Smooth(edge-38,edge+24,x):Smooth(768-edge-24,768-edge+38,x))*Smooth(398,488,y),waist=Smooth(565,720,y);
  float centre=x<384?320:451,dist=Mathf.Sqrt(Mathf.Pow((x-centre)/89,2)+Mathf.Pow((y-521)/91,2));
  float influence=.92f*(1-Smooth(.25f,1,dist))*Smooth(445,478,y)*(1-Smooth(573,610,y));
  // Pin the central lacing and necklace; blend into the surrounding chest continuously.
  influence*=x<384?1-Smooth(359,382,x):Smooth(386,408,x);
  float chest=(1-arm)*(1-waist),spring=chest*influence;
  return new BoneWeight{boneIndex0=1,weight0=chest-spring,boneIndex1=0,weight1=(1-arm)*waist,boneIndex2=x<384?14:17,weight2=arm,boneIndex3=x<384?22:23,weight3=spring};
 }
 static void ExtendRig(MaraV2Export rig){
  Directory.CreateDirectory("Assets/ChestPhysics");AssetDatabase.Refresh();
  const string path="Assets/ChestPhysics/TorsoSpring.png";
  if(!AssetDatabase.CopyAsset("Assets/Art/Torso.png",path))throw new Exception("Separate torso asset already exists or copy failed");
  var importer=AssetImporter.GetAtPath(path);var factories=new SpriteDataProviderFactories();factories.Init();var provider=factories.GetSpriteEditorDataProviderFromObject(importer);provider.InitSpriteEditorDataProvider();var rect=provider.GetSpriteRects()[0];
  var bp=provider.GetDataProvider<ISpriteBoneDataProvider>();var bones=bp.GetBones(rect.spriteID);var transforms=rig.bones.ToList();var parents=rig.parents.ToList();
  for(int i=0;i<2;i++){
   string name=i==0?"ChestSpringL":"ChestSpringR";Vector3 pixel=new Vector3(i==0?320:451,1024-521,0)-new Vector3(384,512,0);
   var tr=new GameObject(name).transform;tr.SetParent(rig.bones[1],false);tr.position=rig.transform.TransformPoint(pixel);tr.localRotation=Quaternion.identity;
   transforms.Add(tr);parents.Add(1);bones.Add(new SpriteBone{name=name,parentId=1,position=tr.localPosition,rotation=Quaternion.identity,length=42,guid=Hash128.Compute("ChestPhysics/"+name).ToString()});
  }
  bp.SetBones(rect.spriteID,bones);
  var mp=provider.GetDataProvider<ISpriteMeshDataProvider>();var original=mp.GetVertices(rect.spriteID);var oldIndices=mp.GetIndices(rect.spriteID);
  var verts=original.Select(v=>new Vertex2DMetaData{position=v.position,boneWeight=Weight(v.position)}).ToList();var mids=new Dictionary<(int,int),int>();
  int Mid(int a,int b){var key=a<b?(a,b):(b,a);if(mids.TryGetValue(key,out int index))return index;Vector2 p=(verts[a].position+verts[b].position)/2;index=verts.Count;verts.Add(new Vertex2DMetaData{position=p,boneWeight=Weight(p)});mids[key]=index;return index;}
  var indices=new List<int>();for(int i=0;i<oldIndices.Length;i+=3){int a=oldIndices[i],b=oldIndices[i+1],c=oldIndices[i+2],ab=Mid(a,b),bc=Mid(b,c),ca=Mid(c,a);indices.AddRange(new[]{a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca});}
  var edges=new HashSet<(int,int)>();for(int i=0;i<indices.Count;i+=3)for(int j=0;j<3;j++){int a=indices[i+j],b=indices[i+(j+1)%3];edges.Add(a<b?(a,b):(b,a));}
  foreach(var v in verts){var w=v.boneWeight;if(Mathf.Abs(w.weight0+w.weight1+w.weight2+w.weight3-1)>1e-5)throw new Exception("Unnormalized weights");}
  mp.SetVertices(rect.spriteID,verts.ToArray());mp.SetIndices(rect.spriteID,indices.ToArray());mp.SetEdges(rect.spriteID,edges.Select(e=>new Vector2Int(e.Item1,e.Item2)).ToArray());provider.Apply();importer.SaveAndReimport();
  var torso=rig.transform.Find("Visuals/Torso");var skin=torso.GetComponent<SpriteSkin>();skin.enabled=false;torso.GetComponent<SpriteRenderer>().sprite=AssetDatabase.LoadAssetAtPath<Sprite>(path);rig.bones=transforms.ToArray();rig.parents=parents.ToArray();skin.enabled=true;skin.SetRootBone(rig.bones[0]);var result=skin.SetBoneTransforms(rig.bones);if(result.ToString()!="Ready")throw new Exception("Torso skin "+result);
  var springs=rig.gameObject.AddComponent<MaraChestSpring>();springs.chest=rig.bones[1];springs.left=rig.bones[22];springs.right=rig.bones[23];springs.leftRest=springs.left.localPosition;springs.rightRest=springs.right.localPosition;springs.simulate=false;
  Debug.Log("CHEST_RIG_READY bones="+rig.bones.Length+" torsoVertices="+verts.Count+" torsoTriangles="+indices.Count/3);
 }
 static AnimationClip Pose(MaraV2Export rig){
  var lift=Curve(0,0,.20f,0,.56f,10,.90f,-5,1.27f,1.8f,1.68f,0,4.2f,0);
  var sway=Curve(0,0,.30f,-.4f,.67f,1.3f,1.05f,-.55f,1.55f,.15f,2.15f,0,4.2f,0);
  var arms=Curve(0,0,.22f,0,.68f,1,1.12f,.8f,2.35f,0,4.2f,0);
  var head=Curve(0,0,.35f,-.4f,.84f,2.5f,1.30f,1.8f,2.5f,0,4.2f,0);
  float L(float t)=>lift.Evaluate(Mathf.Clamp(t,0,Length));float S(float t)=>sway.Evaluate(Mathf.Clamp(t,0,Length));float A(float t)=>arms.Evaluate(Mathf.Clamp(t,0,Length));float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,Length));
  float Follow(float t,float delay,float weight)=>weight*(H(t-delay)+S(t-delay)-H(t)-S(t));
  float R(int b,float t)=>b switch{0=>-.18f*A(t),1=>S(t),2=>-.15f*A(t),3=>H(t),4=>Follow(t,.1f,.4f),5=>Follow(t,.14f,.5f),6=>Follow(t,.18f,.6f),7=>Follow(t,.09f,.35f),8=>Follow(t,.12f,.4f),9=>.3f*A(t-.1f),10=>.6f*A(t-.1f),11=>.85f*A(t-.18f),12=>-.6f*A(t-.1f),13=>-.85f*A(t-.18f),14=>-4*A(t),15=>12*A(t-.1f),16=>-4*A(t-.16f),17=>6*A(t),18=>-22*A(t-.1f),19=>8*A(t-.16f),_=>0};
  var clip=new AnimationClip{name="SpringPoseWithoutPhysics",frameRate=30};
  for(int b=0;b<rig.bones.Length;b++){int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float rotation=bone.localEulerAngles.z;var inverseParent=Quaternion.Inverse(bone.parent.rotation);
   foreach(string property in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float V(float t){if(property=="localEulerAnglesRaw.z")return rotation+R(id,t);Vector3 world=Vector3.zero;if(id==1)world=new Vector3(-1.2f*S(t),L(t),0);if(id==3)world=new Vector3(0,-.18f*L(t-.07f),0);if(id==20||id==21)world=new Vector3(0,.8f*A(t),0);var d=inverseParent*world;return property.EndsWith("x")?rest.x+d.x:rest.y+d.y;}
    var keys=new Keyframe[127];for(int f=0;f<=126;f++){float t=Length*f/126,a=Mathf.Max(0,t-.001f),z=Mathf.Min(Length,t+.001f),s=(V(z)-V(a))/(z-a);keys[f]=new Keyframe(t,V(t),s,s);}AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),property),new AnimationCurve(keys));
   }
  }
  var facial=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/HeadReaction.anim");foreach(var binding in AnimationUtility.GetObjectReferenceCurveBindings(facial)){var keys=AnimationUtility.GetObjectReferenceCurve(facial,binding);float[] times=binding.path.Contains("Eye")?new[]{0,.72f,.787f,.90f,1.02f}:new[]{0,.43f,2.3f};for(int i=0;i<keys.Length;i++)keys[i].time=times[i];AnimationUtility.SetObjectReferenceCurve(clip,binding,keys);}
  AssetDatabase.CreateAsset(clip,"Assets/ChestPhysics/SpringPoseWithoutPhysics.anim");return clip;
 }
 [Serializable]class SpringReport{public float frequency,damping,inertia,limit,maxLeft,maxRight,finalLeft,finalRight;public int solverHz=240;}
 static AnimationClip Bake(MaraV2Export rig,AnimationClip pose){
  var clip=UnityEngine.Object.Instantiate(pose);clip.name=pose.name.Replace("WithoutPhysics","WithPhysics");var physics=rig.GetComponent<MaraChestSpring>();
  var states=new[]{new MaraChestSpring.State(),new MaraChestSpring.State()};var rests=new[]{physics.leftRest,physics.rightRest};var previous=new Vector2[2];var velocities=new Vector2[2];var values=new List<Vector3>[] {new(),new()};float[] max=new float[2];int count=Mathf.RoundToInt(Length*Hz);float dt=1/Hz;
  for(int f=0;f<=count;f++){float t=f/Hz;pose.SampleAnimation(rig.gameObject,t);
   for(int b=0;b<2;b++){Vector2 anchor=physics.chest.TransformPoint(rests[b]);Vector2 velocity=f==0?Vector2.zero:(anchor-previous[b])/dt,acceleration=f<=1?Vector2.zero:(velocity-velocities[b])/dt;
    if(f>0)states[b].Step(acceleration,dt,physics.frequency*(b==0?1:1.035f),physics.damping,physics.inertia,physics.limit);max[b]=Mathf.Max(max[b],states[b].offset.magnitude);
    values[b].Add(rests[b]+physics.chest.InverseTransformVector(states[b].offset));previous[b]=anchor;velocities[b]=velocity;
   }
  }
  // After a long settled tail, remove only numerical residue to preserve the shared rest pose.
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y"}){var keys=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=values[b][f];float blend=Smooth(3.65f,Length,f/Hz);p=Vector3.Lerp(p,rests[b],blend);float v=axis=="x"?p.x:p.y;keys[f]=new Keyframe(f/Hz,v);}var curve=new AnimationCurve(keys);for(int f=0;f<=count;f++)AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[22+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);}
  File.WriteAllText("../chest-physics/spring-validation.json",JsonUtility.ToJson(new SpringReport{frequency=physics.frequency,damping=physics.damping,inertia=physics.inertia,limit=physics.limit,maxLeft=max[0],maxRight=max[1],finalLeft=states[0].offset.magnitude,finalRight=states[1].offset.magnitude},true));
  AssetDatabase.CreateAsset(clip,"Assets/ChestPhysics/"+clip.name+".anim");return clip;
 }
 public static void Run(){
  EditorSceneManager.OpenScene("Assets/MaraV2.unity");var rig=UnityEngine.Object.FindFirstObjectByType<MaraV2Export>();rig.GetComponent<Animator>().enabled=false;AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/Idle.anim").SampleAnimation(rig.gameObject,0);
  ExtendRig(rig);var pose=Pose(rig);var baked=Bake(rig,pose);pose.SampleAnimation(rig.gameObject,0);
  var exporter=rig.gameObject.AddComponent<ChestPhysicsExport>();exporter.clips=new[]{pose,baked};exporter.bones=rig.bones;exporter.parents=rig.parents;exporter.captureCamera=rig.captureCamera;UnityEngine.Object.DestroyImmediate(rig);
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/ChestPhysics/ChestPhysicsStudy.unity");
  // Editable live-physics prefab uses the same base pose and reusable spring component.
  var ctl=AnimatorController.CreateAnimatorControllerAtPath("Assets/ChestPhysics/LivePhysics.controller");var state=ctl.layers[0].stateMachine.AddState("Body pose");state.motion=pose;ctl.layers[0].stateMachine.defaultState=state;
  var animator=exporter.GetComponent<Animator>();var previous=animator.runtimeAnimatorController;animator.runtimeAnimatorController=ctl;animator.enabled=true;exporter.GetComponent<MaraChestSpring>().simulate=true;
  PrefabUtility.SaveAsPrefabAsset(exporter.gameObject,"Assets/ChestPhysics/MaraPhysics.prefab");
  animator.runtimeAnimatorController=previous;animator.enabled=false;exporter.GetComponent<MaraChestSpring>().simulate=false;AssetDatabase.SaveAssets();Debug.Log("CHEST_PHYSICS_READY");EditorApplication.EnterPlaymode();
 }
 public static void Tune(){
  EditorSceneManager.OpenScene("Assets/ChestPhysics/ChestPhysicsStudy.unity");var exporter=UnityEngine.Object.FindFirstObjectByType<ChestPhysicsExport>();var physics=exporter.GetComponent<MaraChestSpring>();
  physics.frequency=2.15f;physics.damping=.24f;physics.inertia=1.15f;physics.limit=10f;physics.simulate=false;
  var pose=UnityEngine.Object.Instantiate(exporter.clips[0]);pose.name="SpringPoseWithoutPhysicsTuned";
  string chestPath=AnimationUtility.CalculateTransformPath(exporter.bones[1],exporter.transform);
  // Root's rest orientation maps world vertical translation to chest local X.
  var binding=EditorCurveBinding.FloatCurve(chestPath,typeof(Transform),"m_LocalPosition.x");var curve=AnimationUtility.GetEditorCurve(pose,binding);var keys=curve.keys;float rest=curve.Evaluate(0);
  for(int i=0;i<keys.Length;i++){keys[i].value=rest+(keys[i].value-rest)*1.4f;keys[i].inTangent*=1.4f;keys[i].outTangent*=1.4f;}curve.keys=keys;AnimationUtility.SetEditorCurve(pose,binding,curve);
  AssetDatabase.CreateAsset(pose,"Assets/ChestPhysics/"+pose.name+".anim");
  var proxy=exporter.gameObject.AddComponent<MaraV2Export>();proxy.bones=exporter.bones;proxy.parents=exporter.parents;proxy.captureCamera=exporter.captureCamera;var baked=Bake(proxy,pose);UnityEngine.Object.DestroyImmediate(proxy);
  exporter.clips=new[]{pose,baked};pose.SampleAnimation(exporter.gameObject,0);EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/ChestPhysics/ChestPhysicsTuned.unity");
  var controller=AnimatorController.CreateAnimatorControllerAtPath("Assets/ChestPhysics/LivePhysicsTuned.controller");var state=controller.layers[0].stateMachine.AddState("Aufrichten und abfedern");state.motion=pose;controller.layers[0].stateMachine.defaultState=state;var animator=exporter.GetComponent<Animator>();var old=animator.runtimeAnimatorController;animator.runtimeAnimatorController=controller;animator.enabled=true;physics.simulate=true;
  PrefabUtility.SaveAsPrefabAsset(exporter.gameObject,"Assets/ChestPhysics/MaraPhysicsTuned.prefab");animator.runtimeAnimatorController=old;animator.enabled=false;physics.simulate=false;AssetDatabase.SaveAssets();Debug.Log("CHEST_PHYSICS_TUNED");EditorApplication.EnterPlaymode();
 }
}

using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

// Additive gestures on the approved spring rig. Original clips and assets stay intact.
public static class BuildPhysicsGestures {
 const string Folder="Assets/PhysicsGestures/";
 static AnimationCurve C(params float[] p){var k=new Keyframe[p.Length/2];for(int i=0;i<k.Length;i++)k[i]=new Keyframe(p[i*2],p[i*2+1],0,0);return new AnimationCurve(k);}
 static float S(float a,float b,float t)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,t));
 static AnimationClip Make(PhysicsGesturesExport rig,int kind){
  AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/ChestPhysics/SpringPoseWithoutPhysicsTuned.anim").SampleAnimation(rig.gameObject,0);
  float duration=kind==2?5.4f:5.0f;
  var pose=C(0,0,.18f,-.055f,1.02f,1,1.82f,1,2.95f,0,duration,0);
  var hand=C(0,0,.24f,0,1.08f,1,1.95f,1,3.1f,0,duration,0);
  var head=C(0,0,.26f,0,1.20f,1,1.95f,.93f,3.18f,0,duration,0);
  // Three unequal chuckles. Their acceleration drives the spring, without a jiggle curve.
  var laugh=C(0,0,.68f,0,.86f,3.5f,1.06f,-2.7f,1.28f,3.8f,1.48f,-2.4f,1.72f,3.0f,1.94f,-1.6f,2.25f,0,duration,0);
  float P(float t)=>pose.Evaluate(Mathf.Clamp(t,0,duration));
  float A(float t)=>hand.Evaluate(Mathf.Clamp(t,0,duration));
  float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,duration));
  float G(float t)=>kind==2?laugh.Evaluate(Mathf.Clamp(t,0,duration)):0;
  float Head(float t)=>(kind==0?-1.3f:kind==1?-4.4f:3.0f)*H(t)+.20f*G(t-.07f);
  float Body(float t)=>(kind==0?1.4f:kind==1?-2.8f:-1.0f)*P(t)+.10f*G(t);
  float Follow(float t,float lag,float amount)=>amount*(Head(t-lag)+Body(t-lag)-Head(t)-Body(t));
  float R(int b,float t)=>b switch {
   0=>(kind==1?.8f:-.25f)*P(t),1=>Body(t),2=>-.2f*H(t),3=>Head(t),
   4=>Follow(t,.10f,.55f),5=>Follow(t,.15f,.65f),6=>Follow(t,.21f,.8f),
   7=>Follow(t,.09f,.4f),8=>Follow(t,.13f,.5f),
   9=>-.4f*P(t-.1f),10=>.7f*P(t-.1f)+.15f*G(t-.08f),11=>1.1f*P(t-.20f)+.20f*G(t-.16f),
   12=>-.8f*P(t-.12f)-.15f*G(t-.09f),13=>-1.2f*P(t-.22f)-.20f*G(t-.18f),
   14=>(kind==0?3:kind==1?-1:-4)*A(t)-.12f*G(t),
   15=>(kind==0?7:kind==1?3:18)*A(t-.07f),16=>(kind==0?-6:kind==1?-2:-7)*A(t-.14f),
   17=>(kind==0?-3:kind==1?16:4)*A(t)+.12f*G(t),
   18=>(kind==0?-7:kind==1?-64:-20)*A(t-.07f),19=>(kind==0?6:kind==1?39:8)*A(t-.14f),_=>0
  };
  var clip=new AnimationClip{name=new[]{"LeanForward","HandOnHip","Giggle"}[kind]+"Body",frameRate=30,wrapMode=WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float rotation=bone.localEulerAngles.z;var inv=Quaternion.Inverse(bone.parent.rotation);
   foreach(string prop in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float V(float t){if(prop=="localEulerAnglesRaw.z")return rotation+R(id,t);var world=Vector3.zero;
     if(id==0)world=new Vector3((kind==1?7:0)*P(t),0,0);
     if(id==1)world=new Vector3((kind==0?-2:kind==1?-7:1)*P(t),(kind==0?-19:kind==1?2:-4)*P(t)+G(t),0);
     if(id==2&&kind==0)world=new Vector3(0,-8*H(t),0);
     if(id==3)world=new Vector3((kind==0?2:0)*H(t),(kind==0?-12:kind==1?0:-2)*H(t)-.3f*G(t-.07f),0);
     if(id==20||id==21)world=new Vector3(0,(kind==0?1.2f:kind==1?1.6f:.4f)*H(t),0);
     var d=inv*world;return prop.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    int count=Mathf.RoundToInt(duration*60);var k=new Keyframe[count+1];for(int f=0;f<=count;f++){float t=duration*f/count,a=Mathf.Max(0,t-.001f),z=Mathf.Min(duration,t+.001f),v=(V(z)-V(a))/(z-a);k[f]=new Keyframe(t,V(t),v,v);}AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),prop),new AnimationCurve(k));
   }
  }
  Sprite Sprite(string n)=>AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/"+n+".png");
  void Swap(string n,string[] variants,float[] times){var k=new ObjectReferenceKeyframe[times.Length];for(int i=0;i<k.Length;i++)k[i]=new ObjectReferenceKeyframe{time=times[i],value=Sprite(variants[i])};AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/"+n,typeof(SpriteRenderer),"m_Sprite"),k);}
  foreach(var side in new[]{"L","R"}){string e="Eye"+side;
   if(kind==2)Swap(e,new[]{e,e+"Half",e+"Closed",e+"Half",e,e+"Half",e+"Closed",e+"Half",e},new[]{0,.78f,.86f,1.06f,1.16f,1.60f,1.68f,1.90f,2.02f});
   else Swap(e,new[]{e,e+"Half",e+"Closed",e+"Half",e},new[]{0,1.55f,1.62f,1.74f,1.81f});
  }
  Swap("Mouth",new[]{"Mouth","MouthSmile","Mouth"},new[]{0,.58f,2.75f});
  AssetDatabase.CreateAsset(clip,Folder+clip.name+".anim");return clip;
 }
 [Serializable]class SpringCheck{public string clip;public float duration,maxLeft,maxRight,residualLeft,residualRight;public int limitHits;}
 [Serializable]class Checks{public List<SpringCheck> clips=new();}
 static AnimationClip Bake(PhysicsGesturesExport rig,AnimationClip pose,Checks checks){
  var physics=rig.GetComponent<MaraChestSpring>();var clip=UnityEngine.Object.Instantiate(pose);clip.name=pose.name.Replace("Body","Physics");
  float duration=pose.length,dt=1/240f;int count=Mathf.RoundToInt(duration*240);
  var report=new SpringCheck{clip=clip.name,duration=duration};var states=new[]{new MaraChestSpring.State(),new MaraChestSpring.State()};var rests=new[]{physics.leftRest,physics.rightRest};var last=new Vector2[2];var velocities=new Vector2[2];var values=new List<Vector3>[] {new(),new()};var maxima=new float[2];
  for(int f=0;f<=count;f++){float t=f*dt;pose.SampleAnimation(rig.gameObject,t);
   for(int b=0;b<2;b++){Vector2 anchor=physics.chest.TransformPoint(rests[b]);Vector2 v=f==0?Vector2.zero:(anchor-last[b])/dt,a=f<=1?Vector2.zero:(v-velocities[b])/dt;
    if(f>0)states[b].Step(a,dt,physics.frequency*(b==0?1:1.035f),physics.damping,physics.inertia,physics.limit);
    maxima[b]=Mathf.Max(maxima[b],states[b].offset.magnitude);if(states[b].offset.magnitude>=physics.limit-.001f)report.limitHits++;
    values[b].Add(rests[b]+physics.chest.InverseTransformVector(states[b].offset));last[b]=anchor;velocities[b]=v;
   }
  }
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y"}){var k=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=Vector3.Lerp(values[b][f],rests[b],S(duration-.45f,duration,f*dt));k[f]=new Keyframe(f*dt,axis=="x"?p.x:p.y);}var curve=new AnimationCurve(k);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[22+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);}
  report.maxLeft=maxima[0];report.maxRight=maxima[1];report.residualLeft=states[0].offset.magnitude;report.residualRight=states[1].offset.magnitude;checks.clips.Add(report);AssetDatabase.CreateAsset(clip,Folder+clip.name+".anim");return clip;
 }
 public static void Run(){
  Directory.CreateDirectory(Folder);Directory.CreateDirectory("../physics-gestures");AssetDatabase.Refresh();
  EditorSceneManager.OpenScene("Assets/ChestPhysics/ChestPhysicsTuned.unity");var old=UnityEngine.Object.FindFirstObjectByType<ChestPhysicsExport>();old.GetComponent<Animator>().enabled=false;old.GetComponent<MaraChestSpring>().simulate=false;
  var rig=old.gameObject.AddComponent<PhysicsGesturesExport>();rig.bones=old.bones;rig.parents=old.parents;rig.captureCamera=old.captureCamera;UnityEngine.Object.DestroyImmediate(old);
  var checks=new Checks();var clips=new List<AnimationClip>();for(int kind=0;kind<3;kind++){var body=Make(rig,kind);clips.Add(Bake(rig,body,checks));}
  rig.clips=clips.ToArray();rig.clips[0].SampleAnimation(rig.gameObject,0);EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"PhysicsGestures.unity");
  File.WriteAllText("../physics-gestures/spring-validation.json",JsonUtility.ToJson(checks,true));AssetDatabase.SaveAssets();Debug.Log("PHYSICS_GESTURES_READY");EditorApplication.EnterPlaymode();
 }
}

using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;

public static class BuildIlyraIdle {
 const float Length=6,Hz=240;
 static AnimationCurve Breath=new(new Keyframe(0,0,0,0),new Keyframe(2.05f,1,0,0),new Keyframe(5.10f,0,0,0),new Keyframe(6,0,0,0));
 static float B(float t)=>Breath.Evaluate(Mathf.Repeat(t,Length));
 static float S(float t){t=Mathf.Repeat(t,Length);return Mathf.Sin(2*Mathf.PI*t/Length)*Mathf.Pow(Mathf.Sin(Mathf.PI*t/Length),2);}
 static float Follow(float t,float delay,float strength)=>strength*(B(t-delay)-B(t));
 static float R(int i,float t)=>i switch{
  0=>.16f*S(t),1=>.38f*S(t),2=>-.12f*S(t),3=>-.48f*S(t)+.2f*B(t-.08f),
  4=>-.34f*B(t),5=>.55f*B(t-.1f),6=>-.3f*B(t-.17f),
  7=>.29f*B(t),8=>-.45f*B(t-.12f),9=>.26f*B(t-.2f),
  10=>-.12f*S(t),11=>-.12f*S(t),
  12=>.25f*S(t),13=>Follow(t,.2f,.6f),14=>-.23f*S(t),15=>-Follow(t,.24f,.6f),16=>.12f*S(t),
  17=>-.12f*S(t),18=>Follow(t,.18f,1.4f),19=>-Follow(t,.22f,1.2f),
  20=>Follow(t,.12f,1.2f),21=>Follow(t,.3f,2.5f),
  22=>Follow(t,.14f,1.5f),23=>Follow(t,.27f,2.2f),24=>-Follow(t,.18f,1.3f),25=>-Follow(t,.32f,2f),_=>0};
 static AnimationClip Make(IlyraJointTest rig){
  Directory.CreateDirectory("Assets/Clips");AssetDatabase.Refresh();
  var clip=new AnimationClip{name="IlyraIdleBody",frameRate=30,wrapMode=WrapMode.Loop};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];Vector3 rest=bone.localPosition;float angle=bone.localEulerAngles.z;var parentInv=Quaternion.Inverse(bone.parent.rotation);
   foreach(string prop in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float V(float t){
     if(prop=="localEulerAnglesRaw.z")return angle+R(id,t);
     Vector3 d=Vector3.zero;
     if(id==1)d=new Vector3(.65f*S(t),3.6f*B(t),0);
     if(id==3)d=new Vector3(.2f*S(t),-.45f*B(t-.08f),0);
     if(id==26||id==27)d=new Vector3((id==26?-.22f:.22f)*B(t),1.15f*B(t),0);
     d=parentInv*d;return prop.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    var keys=new Keyframe[181];for(int f=0;f<=180;f++){float t=f/30f,slope=(V(t+.001f)-V(t-.001f))/.002f;keys[f]=new Keyframe(t,V(t),slope,slope);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),prop),new AnimationCurve(keys));
   }
  }
  var import=typeof(BuildIlyra).GetMethod("Import",BindingFlags.Static|BindingFlags.NonPublic);
  var open=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/Head.png");
  var half=(Sprite)import.Invoke(null,new object[]{"HeadHalf"});var closed=(Sprite)import.Invoke(null,new object[]{"HeadClosed"});
  // 233 ms blink: descent, brief closure, then slower reopening. No crossfade.
  var eyes=new[]{new ObjectReferenceKeyframe{time=0,value=open},new ObjectReferenceKeyframe{time=2.8f,value=half},new ObjectReferenceKeyframe{time=2.8666667f,value=closed},new ObjectReferenceKeyframe{time=2.9333334f,value=half},new ObjectReferenceKeyframe{time=3.0333333f,value=open},new ObjectReferenceKeyframe{time=6,value=open}};
  AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/Head",typeof(SpriteRenderer),"m_Sprite"),eyes);
  var settings=AnimationUtility.GetAnimationClipSettings(clip);settings.loopTime=true;AnimationUtility.SetAnimationClipSettings(clip,settings);
  AssetDatabase.CreateAsset(clip,"Assets/Clips/IlyraIdleBody.anim");return clip;
 }
 [Serializable]class Report{public int solverHz=240,warmupCycles=3;public float frequency,damping,inertia,limit,maxLeft,maxRight,closureErrorLeft,closureErrorRight;}
 static AnimationClip Bake(IlyraJointTest rig,AnimationClip body,IlyraSecondaryMotion physics){
  var clip=UnityEngine.Object.Instantiate(body);clip.name="IlyraIdle";
  var states=new[]{new IlyraSecondaryMotion.State(),new IlyraSecondaryMotion.State()};var previous=new Vector2[2];var velocities=new Vector2[2];
  int count=(int)(Length*Hz);float dt=1/Hz;var values=new List<Vector3>[] {new(),new()};var max=new float[2];
  for(int f=0;f<=4*count;f++){
   float t=(f%count)/Hz;body.SampleAnimation(rig.gameObject,t);
   for(int b=0;b<2;b++){
    var bone=rig.bones[26+b];Vector2 anchor=bone.position;Vector2 velocity=f==0?Vector2.zero:(anchor-previous[b])/dt,acceleration=f<=1?Vector2.zero:(velocity-velocities[b])/dt;
    if(f>0)states[b].Step(acceleration,dt,physics.frequency*(b==0?1:1.025f),physics.damping,physics.inertia,physics.limit);
    if(f>=3*count){values[b].Add(bone.localPosition+physics.chest.InverseTransformVector(states[b].offset));max[b]=Mathf.Max(max[b],states[b].offset.magnitude);}
    previous[b]=anchor;velocities[b]=velocity;
   }
  }
  var error=new[]{Vector3.Distance(values[0][0],values[0][count]),Vector3.Distance(values[1][0],values[1][count])};
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y"}){
   var keys=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=values[b][f==count?0:f];keys[f]=new Keyframe(f/Hz,axis=="x"?p.x:p.y);}
   var curve=new AnimationCurve(keys);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}
   AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[26+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);
  }
  File.WriteAllText("../preview/spring-validation.json",JsonUtility.ToJson(new Report{frequency=physics.frequency,damping=physics.damping,inertia=physics.inertia,limit=physics.limit,maxLeft=max[0],maxRight=max[1],closureErrorLeft=error[0],closureErrorRight=error[1]},true));
  AssetDatabase.CreateAsset(clip,"Assets/Clips/IlyraIdle.anim");return clip;
 }
 public static void Finish(IlyraJointTest old){
  var body=Make(old);body.SampleAnimation(old.gameObject,0);
  var physics=old.gameObject.AddComponent<IlyraSecondaryMotion>();physics.chest=old.bones[1];physics.left=old.bones[26];physics.right=old.bones[27];physics.simulate=false;
  var baked=Bake(old,body,physics);baked.SampleAnimation(old.gameObject,0);
  var exporter=old.gameObject.AddComponent<IlyraIdleExport>();exporter.clip=baked;exporter.bones=old.bones;exporter.parents=old.parents;exporter.lengths=old.lengths;exporter.captureCamera=old.captureCamera;
  UnityEngine.Object.DestroyImmediate(old);
  var controller=AnimatorController.CreateAnimatorControllerAtPath("Assets/Clips/IlyraIdle.controller");var state=controller.layers[0].stateMachine.AddState("Idle");state.motion=baked;controller.layers[0].stateMachine.defaultState=state;
  var animator=exporter.gameObject.AddComponent<Animator>();animator.runtimeAnimatorController=controller;animator.enabled=false;
  animator.enabled=true;EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraIdle.unity");
  animator.enabled=true;PrefabUtility.SaveAsPrefabAsset(exporter.gameObject,"Assets/IlyraIdle.prefab");animator.enabled=false;
  var liveController=AnimatorController.CreateAnimatorControllerAtPath("Assets/Clips/IlyraIdleLive.controller");var live=liveController.layers[0].stateMachine.AddState("Idle with live secondary motion");live.motion=body;liveController.layers[0].stateMachine.defaultState=live;
  animator.runtimeAnimatorController=liveController;animator.enabled=true;physics.simulate=true;PrefabUtility.SaveAsPrefabAsset(exporter.gameObject,"Assets/IlyraIdleLive.prefab");
  animator.runtimeAnimatorController=controller;animator.enabled=false;physics.simulate=false;AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_IDLE_READY duration=6 fps=30 bones="+exporter.bones.Length);if(Application.isBatchMode)EditorApplication.EnterPlaymode();
 }
}

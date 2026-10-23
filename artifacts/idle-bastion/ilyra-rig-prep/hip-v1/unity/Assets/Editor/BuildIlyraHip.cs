using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;

public static class BuildIlyraHip {
 const float Length=5f,Hz=240;
 static string side="left"; static string Suffix=>side=="right"?"Right":side=="both"?"Both":"Left"; static bool idleOnly=false;
 static AnimationCurve Curve(params float[] p){var keys=new Keyframe[p.Length/2];for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(p[i*2],p[i*2+1],0,0);return new AnimationCurve(keys);}
 static AnimationCurve head=Curve(0,0,.3f,0,1.45f,4,2.7f,3.2f,4.35f,0,5f,0);
 static AnimationCurve body=Curve(0,0,.2f,0,1.25f,1,2.7f,1,4.45f,0,5f,0);
 static AnimationCurve lift=Curve(0,0,.2f,0,1.3f,2,2.7f,1.5f,4.45f,0,5f,0);
 static float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,Length));
 static float C(float t)=>body.Evaluate(Mathf.Clamp(t,0,Length));
 static float Lag(float t,float d,float strength)=>strength*(H(t-d)-H(t));
 static float LeftR(int b,float t)=>b switch {
  0=>1.1f*C(t),1=>-2.2f*C(t),2=>.2f*C(t),3=>H(t),
  4=>-25f*C(t),5=>78f*C(t-.05f),6=>-40f*C(t-.1f),
  7=>-1.1f*C(t-.12f),8=>1.7f*C(t-.23f),9=>.4f*C(t-.3f),
  10=>-.75f*C(t),11=>-.35f*C(t),12=>-.35f*C(t),13=>-.6f*C(t-.2f),14=>.25f*C(t),15=>.5f*C(t-.25f),16=>-.2f*C(t),
  17=>.25f*C(t),18=>.8f*C(t-.22f),19=>1f*C(t-.3f),
  20=>-.55f*H(t-.12f)+Lag(t,.12f,.3f),21=>-.25f*H(t-.26f)+Lag(t,.26f,.3f),
  22=>-.25f*H(t-.14f)+Lag(t,.14f,.25f),23=>-.22f*H(t-.3f)+Lag(t,.3f,.25f),
  24=>-.28f*H(t-.16f)+Lag(t,.16f,.25f),25=>-.22f*H(t-.32f)+Lag(t,.32f,.25f),_=>0};
 static float R(int b,float t){
  if(side=="left")return LeftR(b,t);
  if(side=="right"){int m=b switch{4=>7,5=>8,6=>9,7=>4,8=>5,9=>6,_=>b};return -LeftR(m,t);}
  if(b>=4&&b<=6)return LeftR(b,t);if(b>=7&&b<=9)return -LeftR(b-3,t-.08f);
  return LeftR(b,t)*.45f;
 }
 static AnimationClip Make(IlyraHeadExport rig){
  var clip=new AnimationClip{name="IlyraHip"+Suffix+"Body",frameRate=30,wrapMode=WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float angle=bone.localEulerAngles.z;var inv=Quaternion.Inverse(bone.parent.rotation);
   foreach(string prop in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float V(float t){if(prop=="localEulerAnglesRaw.z")return angle+R(id,t);Vector3 d=Vector3.zero;
     if(id==0)d=new Vector3((side=="right"?-8f:side=="both"?0:8f)*C(t),-1.8f*C(t),0);
     if(id==1)d=new Vector3((side=="right"?3.5f:side=="both"?0:-3.5f)*C(t),lift.Evaluate(Mathf.Clamp(t,0,Length)),0);
     if(id==3)d=new Vector3(-.45f*C(t),-.55f*C(t),0);
     d=inv*d;return prop.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    var keys=new Keyframe[151];for(int f=0;f<=150;f++){float t=f/30f,s=(V(t+.001f)-V(t-.001f))/.002f;keys[f]=new Keyframe(t,V(t),s,s);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),prop),new AnimationCurve(keys));
   }
  }
  var open=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/Head.png");var half=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadHalf.png");var shut=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadClosed.png");
  var eyes=new[]{new ObjectReferenceKeyframe{time=0,value=open},new ObjectReferenceKeyframe{time=1.6f,value=half},new ObjectReferenceKeyframe{time=1.6666667f,value=shut},new ObjectReferenceKeyframe{time=1.7666667f,value=half},new ObjectReferenceKeyframe{time=1.8666667f,value=open},new ObjectReferenceKeyframe{time=Length,value=open}};
  AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/Head",typeof(SpriteRenderer),"m_Sprite"),eyes);
  return SaveClip(clip,"Assets/Clips/IlyraHip"+Suffix+"Body.anim");
 }
 [Serializable] class Report{public int solverHz=240;public float duration=Length,frequency,damping,inertia,limit,maxLeft,maxRight,residualLeft,residualRight;public float settleCorrectionStarts=4.45f;}
 static AnimationClip Bake(IlyraHeadExport rig,AnimationClip body,IlyraSecondaryMotion physics){
  var clip=UnityEngine.Object.Instantiate(body);clip.name="IlyraHip"+Suffix;
  var states=new[]{new IlyraSecondaryMotion.State(),new IlyraSecondaryMotion.State()};var previous=new Vector2[2];var velocities=new Vector2[2];var values=new List<Vector3>[] {new(),new()};var max=new float[2];
  int count=Mathf.RoundToInt(Length*Hz);float dt=1/Hz;
  for(int f=0;f<=count;f++){
   float t=f/Hz;body.SampleAnimation(rig.gameObject,t);
   for(int b=0;b<2;b++){
    var bone=rig.bones[26+b];Vector2 anchor=bone.position;Vector2 v=f==0?Vector2.zero:(anchor-previous[b])/dt,a=f<=1?Vector2.zero:(v-velocities[b])/dt;
    if(f>0)states[b].Step(a,dt,physics.frequency*(b==0?1:1.025f),physics.damping,physics.inertia,physics.limit);
    max[b]=Mathf.Max(max[b],states[b].offset.magnitude);
    // Only remove the settled tail residue, after the actual gesture has returned.
    float fade=1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(4.45f,Length,t));
    values[b].Add(bone.localPosition+physics.chest.InverseTransformVector(states[b].offset*fade));previous[b]=anchor;velocities[b]=v;
   }
  }
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y"}){
   var keys=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=values[b][f];keys[f]=new Keyframe(f/Hz,axis=="x"?p.x:p.y);}
   var curve=new AnimationCurve(keys);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}
   AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[26+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);
  }
  File.WriteAllText("../../hip-v1/preview/"+side+"/spring-validation.json",JsonUtility.ToJson(new Report{frequency=physics.frequency,damping=physics.damping,inertia=physics.inertia,limit=physics.limit,maxLeft=max[0],maxRight=max[1],residualLeft=states[0].offset.magnitude,residualRight=states[1].offset.magnitude},true));
  return SaveClip(clip,"Assets/Clips/IlyraHip"+Suffix+".anim");
 }
 static AnimationClip SaveClip(AnimationClip clip,string path){var existing=AssetDatabase.LoadAssetAtPath<AnimationClip>(path);if(existing==null){AssetDatabase.CreateAsset(clip,path);return clip;}EditorUtility.CopySerialized(clip,existing);EditorUtility.SetDirty(existing);return existing;}
 public static void Run(){try{
  var args=Environment.GetCommandLineArgs();int si=Array.IndexOf(args,"-hip-side");if(si>=0)side=args[si+1];idleOnly=side=="idle";Directory.CreateDirectory("../../hip-v1/preview/"+side);
  EditorSceneManager.OpenScene("Assets/IlyraTouchReaction.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();var animator=rig.GetComponent<Animator>();animator.enabled=false;
  var idle=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");idle.SampleAnimation(rig.gameObject,0);
  var physics=rig.GetComponent<IlyraSecondaryMotion>();physics.simulate=false;
  var full=IlyraHipHands.Torso(0);rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<SpriteRenderer>().sprite=full;
  var skin=rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<UnityEngine.U2D.Animation.SpriteSkin>();skin.SetRootBone(rig.bones[0]);skin.SetBoneTransforms(rig.bones);
  if(idleOnly){rig.clip=idle;rig.outputBase="../../hip-v1/preview/idle";EditorApplication.EnterPlaymode();return;}
  var body=Make(rig);var baked=Bake(rig,body,physics);IlyraHipHands.Attach(rig,baked,side=="both"?3:side=="right"?2:1,full);baked.SampleAnimation(rig.gameObject,0);
  rig.clip=baked;rig.outputBase="../../hip-v1/preview/"+side;
  var controller=AnimatorController.CreateAnimatorControllerAtPath("Assets/Clips/IlyraHip"+Suffix+".controller");
  var sm=controller.layers[0].stateMachine;var rest=sm.AddState("Idle");rest.motion=idle;sm.defaultState=rest;
  var variant=sm.AddState("Hand on hip");variant.motion=baked;controller.AddParameter("Hip",AnimatorControllerParameterType.Trigger);
  var enter=rest.AddTransition(variant);enter.hasExitTime=false;enter.exitTime=1;enter.duration=0;enter.AddCondition(AnimatorConditionMode.If,0,"Hip");
  var back=variant.AddTransition(rest);back.hasExitTime=true;back.exitTime=1;back.duration=0;
  animator.runtimeAnimatorController=controller;animator.enabled=true;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraHip"+Suffix+".unity");
  PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/IlyraHip"+Suffix+".prefab");animator.enabled=false;AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_IDLE_VARIANT_READY duration=4.8 fps=30");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

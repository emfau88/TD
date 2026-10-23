using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;

public static class BuildIlyraGreeting {
 const float Length=4.2f,Hz=240;
 static AnimationCurve Curve(params float[] p){var keys=new Keyframe[p.Length/2];for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(p[i*2],p[i*2+1],0,0);return new AnimationCurve(keys);}
 static AnimationCurve head=Curve(0,0,.25f,0,.9f,-2.8f,1.65f,-1.8f,2.3f,-2.4f,3.6f,0,4.2f,0);
 static AnimationCurve body=Curve(0,0,.15f,0,.85f,1,1.7f,.8f,2.3f,.9f,3.55f,0,4.2f,0);
 static AnimationCurve hand=Curve(0,0,.3f,0,1.25f,1,2.05f,.94f,2.45f,1,3.5f,0,4.2f,0);
 static AnimationCurve lift=Curve(0,0,.15f,0,.85f,2.5f,1.7f,1.5f,2.3f,2,3.55f,0,4.2f,0);
 static float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,Length));
 static float C(float t)=>body.Evaluate(Mathf.Clamp(t,0,Length));
 static float A(float t)=>hand.Evaluate(Mathf.Clamp(t,0,Length));
 static float Lag(float t,float d,float strength)=>strength*(H(t-d)-H(t));
 static float R(int b,float t)=>b switch {
  0=>.3f*C(t),1=>-1.3f*C(t),2=>.3f*C(t),3=>H(t),
  4=>-10f*A(t),5=>65f*A(t-.07f),6=>-20f*A(t-.15f),
  7=>1.2f*C(t-.06f),8=>-2.0f*C(t-.12f),9=>.8f*C(t-.18f),
  10=>-.3f*C(t),11=>-.3f*C(t),12=>.3f*C(t),13=>.6f*C(t-.16f),14=>.35f*C(t),15=>.5f*C(t-.18f),16=>.2f*C(t),
  17=>.4f*C(t),18=>1.1f*C(t-.12f),19=>1.3f*C(t-.2f),
  20=>-.55f*H(t-.09f)+Lag(t,.09f,.3f),21=>-.25f*H(t-.2f)+Lag(t,.2f,.3f),
  22=>-.25f*H(t-.1f)+Lag(t,.1f,.25f),23=>-.22f*H(t-.22f)+Lag(t,.22f,.25f),
  24=>-.28f*H(t-.12f)+Lag(t,.12f,.25f),25=>-.22f*H(t-.24f)+Lag(t,.24f,.25f),_=>0};
 static AnimationClip Make(IlyraHeadExport rig){
  var clip=new AnimationClip{name="IlyraGreetingBody",frameRate=30,wrapMode=WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float angle=bone.localEulerAngles.z;var inv=Quaternion.Inverse(bone.parent.rotation);
   foreach(string prop in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float V(float t){if(prop=="localEulerAnglesRaw.z")return angle+R(id,t);Vector3 d=Vector3.zero;
     if(id==1)d=new Vector3(2.8f*C(t),lift.Evaluate(Mathf.Clamp(t,0,Length)),0);
     if(id==3)d=new Vector3(-.45f*C(t),-.55f*C(t),0);
     d=inv*d;return prop.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    var keys=new Keyframe[127];for(int f=0;f<=126;f++){float t=f/30f,s=(V(t+.001f)-V(t-.001f))/.002f;keys[f]=new Keyframe(t,V(t),s,s);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),prop),new AnimationCurve(keys));
   }
  }
  var open=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/Head.png");var half=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadHalf.png");var shut=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadClosed.png");
  var eyes=new[]{new ObjectReferenceKeyframe{time=0,value=open},new ObjectReferenceKeyframe{time=.7f,value=half},new ObjectReferenceKeyframe{time=.7666667f,value=shut},new ObjectReferenceKeyframe{time=.8333333f,value=half},new ObjectReferenceKeyframe{time=.9333333f,value=open},new ObjectReferenceKeyframe{time=Length,value=open}};
  AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/Head",typeof(SpriteRenderer),"m_Sprite"),eyes);
  return SaveClip(clip,"Assets/Clips/IlyraGreetingBody.anim");
 }
 [Serializable] class Report{public int solverHz=240;public float duration=Length,frequency,damping,inertia,limit,maxLeft,maxRight,residualLeft,residualRight;public float settleCorrectionStarts=3.9f;}
 static AnimationClip Bake(IlyraHeadExport rig,AnimationClip body,IlyraSecondaryMotion physics){
  var clip=UnityEngine.Object.Instantiate(body);clip.name="IlyraGreeting";
  var states=new[]{new IlyraSecondaryMotion.State(),new IlyraSecondaryMotion.State()};var previous=new Vector2[2];var velocities=new Vector2[2];var values=new List<Vector3>[] {new(),new()};var max=new float[2];
  int count=Mathf.RoundToInt(Length*Hz);float dt=1/Hz;
  for(int f=0;f<=count;f++){
   float t=f/Hz;body.SampleAnimation(rig.gameObject,t);
   for(int b=0;b<2;b++){
    var bone=rig.bones[26+b];Vector2 anchor=bone.position;Vector2 v=f==0?Vector2.zero:(anchor-previous[b])/dt,a=f<=1?Vector2.zero:(v-velocities[b])/dt;
    if(f>0)states[b].Step(a,dt,physics.frequency*(b==0?1:1.025f),physics.damping,physics.inertia,physics.limit);
    max[b]=Mathf.Max(max[b],states[b].offset.magnitude);
    // Only remove the settled tail residue, after the actual gesture has returned.
    float fade=1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(3.9f,Length,t));
    values[b].Add(bone.localPosition+physics.chest.InverseTransformVector(states[b].offset*fade));previous[b]=anchor;velocities[b]=v;
   }
  }
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y"}){
   var keys=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=values[b][f];keys[f]=new Keyframe(f/Hz,axis=="x"?p.x:p.y);}
   var curve=new AnimationCurve(keys);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}
   AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[26+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);
  }
  File.WriteAllText("../../greeting-v1/preview/spring-validation.json",JsonUtility.ToJson(new Report{frequency=physics.frequency,damping=physics.damping,inertia=physics.inertia,limit=physics.limit,maxLeft=max[0],maxRight=max[1],residualLeft=states[0].offset.magnitude,residualRight=states[1].offset.magnitude},true));
  return SaveClip(clip,"Assets/Clips/IlyraGreeting.anim");
 }
 static AnimationClip SaveClip(AnimationClip clip,string path){var existing=AssetDatabase.LoadAssetAtPath<AnimationClip>(path);if(existing==null){AssetDatabase.CreateAsset(clip,path);return clip;}EditorUtility.CopySerialized(clip,existing);EditorUtility.SetDirty(existing);return existing;}
 public static void ExportIdle(){try{EditorSceneManager.OpenScene("Assets/IlyraGreeting.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;rig.clip=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");rig.outputBase="../../greeting-v1/preview/idle";EditorApplication.EnterPlaymode();}catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 public static void Run(){try{
  EditorSceneManager.OpenScene("Assets/IlyraTouchReaction.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();var animator=rig.GetComponent<Animator>();animator.enabled=false;
  var idle=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");idle.SampleAnimation(rig.gameObject,0);
  var torso=rig.transform.Find("Visuals/TorsoArmsHands");
  torso.GetComponent<SpriteRenderer>().sprite=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/TorsoHip0.png");
  var skin=torso.GetComponent<UnityEngine.U2D.Animation.SpriteSkin>();skin.SetRootBone(rig.bones[0]);skin.SetBoneTransforms(rig.bones);
  var physics=rig.GetComponent<IlyraSecondaryMotion>();physics.simulate=false;
  var body=Make(rig);var baked=Bake(rig,body,physics);baked.SampleAnimation(rig.gameObject,0);
  rig.clip=baked;rig.outputBase="../../greeting-v1/preview";
  var controller=AssetDatabase.LoadAssetAtPath<AnimatorController>("Assets/Clips/IlyraGreeting.controller");if(controller==null){controller=AnimatorController.CreateAnimatorControllerAtPath("Assets/Clips/IlyraGreeting.controller");
  var sm=controller.layers[0].stateMachine;var rest=sm.AddState("Idle");rest.motion=idle;sm.defaultState=rest;
  var reaction=sm.AddState("Open-handed greeting");reaction.motion=baked;controller.AddParameter("Greeting",AnimatorControllerParameterType.Trigger);
  var enter=rest.AddTransition(reaction);enter.hasExitTime=true;enter.exitTime=1;enter.duration=0;enter.AddCondition(AnimatorConditionMode.If,0,"Greeting");
  var back=reaction.AddTransition(rest);back.hasExitTime=true;back.exitTime=1;back.duration=0;}
  animator.runtimeAnimatorController=controller;animator.enabled=true;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraGreeting.unity");
  PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/IlyraGreeting.prefab");animator.enabled=false;AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_GREETING_READY duration=4.2 fps=30");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

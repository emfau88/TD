using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;

public static class BuildIlyraGiggle {
 const float Length=4f,Hz=240;
 static AnimationCurve Curve(params float[] p){var keys=new Keyframe[p.Length/2];for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(p[i*2],p[i*2+1],0,0);return new AnimationCurve(keys);}
 // Authored torso impulses lead; hands stay in the approved relaxed range.
 static AnimationCurve envelope=Curve(0,0,.18f,0,.58f,.8f,.8f,1,1.65f,.9f,2.15f,.55f,2.8f,0,4f,0);
 static float C(float t)=>envelope.Evaluate(Mathf.Clamp(t,0,Length));
 static float Pulse(float t,float start,float end){if(t<=start||t>=end)return 0;return Mathf.Pow(Mathf.Sin(Mathf.PI*(t-start)/(end-start)),4);}
 static float Laugh(float t)=>Pulse(t,.68f,1.10f)+.78f*Pulse(t,1.18f,1.66f);
 static float Y(float t)=>1.5f*C(t)+4.8f*Laugh(t);
 static float H(float t)=>-3.1f*C(t-.055f)+.75f*Laugh(t-.055f);
 static float Lag(float t,float d,float strength)=>strength*(H(t-d)-H(t));
 static float R(int b,float t)=>b switch {
  0=>.22f*C(t),1=>-1.05f*C(t)+.38f*Laugh(t),2=>.2f*C(t-.03f),3=>H(t),
  4=>-1.1f*C(t)-.35f*Laugh(t-.03f),5=>.6f*C(t-.08f),6=>-.3f*C(t-.15f),
  7=>.95f*C(t-.025f)+.3f*Laugh(t-.05f),8=>-.55f*C(t-.1f),9=>.3f*C(t-.17f),
  10=>-.18f*C(t),11=>-.18f*C(t),12=>.3f*C(t),13=>.6f*C(t-.14f),14=>.3f*C(t),15=>.55f*C(t-.18f),16=>.15f*C(t),
  17=>.3f*C(t),18=>.8f*C(t-.12f),19=>.9f*C(t-.2f),
  20=>-.4f*H(t-.08f)+Lag(t,.08f,.35f),21=>-.2f*H(t-.2f)+Lag(t,.2f,.4f),
  22=>-.2f*H(t-.09f)+Lag(t,.09f,.35f),23=>-.18f*H(t-.19f)+Lag(t,.19f,.35f),
  24=>-.22f*H(t-.11f)+Lag(t,.11f,.35f),25=>-.18f*H(t-.22f)+Lag(t,.22f,.35f),_=>0};
 static AnimationClip Make(IlyraHeadExport rig){
  var clip=new AnimationClip{name="IlyraGiggleBody",frameRate=30,wrapMode=WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float angle=bone.localEulerAngles.z;var inv=Quaternion.Inverse(bone.parent.rotation);
   foreach(string prop in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float V(float t){if(prop=="localEulerAnglesRaw.z")return angle+R(id,t);Vector3 d=Vector3.zero;
     if(id==0)d=new Vector3(1.0f*C(t),-.6f*C(t),0);
     if(id==1)d=new Vector3(1.5f*C(t),Y(t),0);
     if(id==3)d=new Vector3(-.4f*C(t),-.55f*C(t)+.4f*(Y(t-.055f)-Y(t)),0);
     if(id==20||id==22||id==24)d=new Vector3(0,.2f*(Y(t-.055f)-Y(t)),0);
     d=inv*d;return prop.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    var keys=new Keyframe[121];for(int f=0;f<=120;f++){float t=f/30f,s=(V(t+.001f)-V(t-.001f))/.002f;keys[f]=new Keyframe(t,V(t),s,s);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),prop),new AnimationCurve(keys));
   }
  }
  var open=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/Head.png");var half=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadHalf.png");var shut=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadClosed.png");
  var eyes=new[]{new ObjectReferenceKeyframe{time=0,value=open},new ObjectReferenceKeyframe{time=.60f,value=half},new ObjectReferenceKeyframe{time=.7333333f,value=shut},new ObjectReferenceKeyframe{time=1.7f,value=half},new ObjectReferenceKeyframe{time=1.8666667f,value=open},new ObjectReferenceKeyframe{time=Length,value=open}};
  AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/Head",typeof(SpriteRenderer),"m_Sprite"),eyes);
  return SaveClip(clip,"Assets/Clips/IlyraGiggleBody.anim");
 }
 [Serializable] class Report{public int solverHz=240;public float duration=Length,frequency,damping,inertia,limit,maxLeft,maxRight,residualLeft,residualRight;public float settleCorrectionStarts=3.6f;}
 static AnimationClip Bake(IlyraHeadExport rig,AnimationClip body,IlyraSecondaryMotion physics){
  var clip=UnityEngine.Object.Instantiate(body);clip.name="IlyraGiggle";
  var states=new[]{new IlyraSecondaryMotion.State(),new IlyraSecondaryMotion.State()};var previous=new Vector2[2];var velocities=new Vector2[2];var values=new List<Vector3>[] {new(),new()};var max=new float[2];
  int count=Mathf.RoundToInt(Length*Hz);float dt=1/Hz;
  for(int f=0;f<=count;f++){
   float t=f/Hz;body.SampleAnimation(rig.gameObject,t);
   for(int b=0;b<2;b++){
    var bone=rig.bones[26+b];Vector2 anchor=bone.position;Vector2 v=f==0?Vector2.zero:(anchor-previous[b])/dt,a=f<=1?Vector2.zero:(v-velocities[b])/dt;
    if(f>0)states[b].Step(a,dt,physics.frequency*(b==0?1:1.025f),physics.damping,physics.inertia,physics.limit);
    max[b]=Mathf.Max(max[b],states[b].offset.magnitude);
    // Only remove the settled tail residue, after the actual gesture has returned.
    float fade=1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(3.6f,Length,t));
    values[b].Add(bone.localPosition+physics.chest.InverseTransformVector(states[b].offset*fade));previous[b]=anchor;velocities[b]=v;
   }
  }
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y"}){
   var keys=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=values[b][f];keys[f]=new Keyframe(f/Hz,axis=="x"?p.x:p.y);}
   var curve=new AnimationCurve(keys);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}
   AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[26+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);
  }
  File.WriteAllText("../../giggle-v1/preview/spring-validation.json",JsonUtility.ToJson(new Report{frequency=physics.frequency,damping=physics.damping,inertia=physics.inertia,limit=physics.limit,maxLeft=max[0],maxRight=max[1],residualLeft=states[0].offset.magnitude,residualRight=states[1].offset.magnitude},true));
  return SaveClip(clip,"Assets/Clips/IlyraGiggle.anim");
 }
 static AnimationClip SaveClip(AnimationClip clip,string path){var existing=AssetDatabase.LoadAssetAtPath<AnimationClip>(path);if(existing==null){AssetDatabase.CreateAsset(clip,path);return clip;}EditorUtility.CopySerialized(clip,existing);EditorUtility.SetDirty(existing);return existing;}
 public static void ExportIdle(){try{EditorSceneManager.OpenScene("Assets/IlyraGiggle.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;rig.clip=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");rig.outputBase="../../giggle-v1/preview/idle";EditorApplication.EnterPlaymode();}catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 public static void Run(){try{
  EditorSceneManager.OpenScene("Assets/IlyraTouchReaction.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();var animator=rig.GetComponent<Animator>();animator.enabled=false;
  var idle=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");idle.SampleAnimation(rig.gameObject,0);
  var torso=rig.transform.Find("Visuals/TorsoArmsHands");
  torso.GetComponent<SpriteRenderer>().sprite=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/TorsoHip0.png");
  var skin=torso.GetComponent<UnityEngine.U2D.Animation.SpriteSkin>();skin.SetRootBone(rig.bones[0]);skin.SetBoneTransforms(rig.bones);
  var physics=rig.GetComponent<IlyraSecondaryMotion>();physics.simulate=false;physics.frequency=2.25f;physics.damping=.27f;physics.inertia=2.5f;physics.limit=24f;
  var body=Make(rig);var baked=Bake(rig,body,physics);baked.SampleAnimation(rig.gameObject,0);
  rig.clip=baked;rig.outputBase="../../giggle-v1/preview";
  var controller=AssetDatabase.LoadAssetAtPath<AnimatorController>("Assets/Clips/IlyraGiggle.controller");if(controller==null){controller=AnimatorController.CreateAnimatorControllerAtPath("Assets/Clips/IlyraGiggle.controller");
  var sm=controller.layers[0].stateMachine;var rest=sm.AddState("Idle");rest.motion=idle;sm.defaultState=rest;
  var reaction=sm.AddState("Giggle");reaction.motion=baked;controller.AddParameter("Giggle",AnimatorControllerParameterType.Trigger);
  var enter=rest.AddTransition(reaction);enter.hasExitTime=true;enter.exitTime=1;enter.duration=0;enter.AddCondition(AnimatorConditionMode.If,0,"Giggle");
  var back=reaction.AddTransition(rest);back.hasExitTime=true;back.exitTime=1;back.duration=0;}
  animator.runtimeAnimatorController=controller;animator.enabled=true;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraGiggle.unity");
  PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/IlyraGiggle.prefab");animator.enabled=false;AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_GIGGLE_READY duration=4.0 fps=30");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

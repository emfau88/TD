using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;

public static class BuildIlyraMiniHopV2 {
 const float Length=3.2f,Hz=240;
 static AnimationCurve Curve(params float[] p){var keys=new Keyframe[p.Length/2];for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(p[i*2],p[i*2+1],0,0);return new AnimationCurve(keys);}
 static AnimationCurve head=Curve(0,0,.18f,0,.43f,-.5f,.75f,.35f,1.08f,-1.15f,1.38f,.4f,1.8f,0,3.2f,0);
 static AnimationCurve body=Curve(0,0,.18f,0,.42f,1,.75f,-.3f,1.08f,1,1.45f,0,3.2f,0);
 static AnimationCurve hand=Curve(0,0,.35f,0,.8f,1,1.05f,.4f,1.28f,-.3f,1.8f,0,3.2f,0);
 static AnimationCurve lift=new AnimationCurve(new Keyframe(0,0,0,0),new Keyframe(.18f,0,0,0),new Keyframe(.42f,-5,0,0),new Keyframe(.52f,0,160,160),new Keyframe(.75f,18,0,0),new Keyframe(.98f,0,-160,-160),new Keyframe(1.08f,-4,0,0),new Keyframe(1.42f,0,0,0),new Keyframe(3.2f,0,0,0));
 static float Y(float t)=>lift.Evaluate(Mathf.Clamp(t,0,Length));
 static float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,Length));
 static float C(float t)=>body.Evaluate(Mathf.Clamp(t,0,Length));
 static float A(float t)=>hand.Evaluate(Mathf.Clamp(t,0,Length));
 static float Lag(float t,float d,float strength)=>strength*(H(t-d)-H(t));
 static float R(int b,float t)=>b switch {
  0=>0,1=>-.4f*C(t),2=>.15f*C(t-.03f),3=>H(t),
  4=>-.7f*A(t),5=>.5f*A(t-.05f),6=>-.3f*A(t-.1f),
  7=>.7f*A(t-.03f),8=>-.5f*A(t-.08f),9=>.3f*A(t-.13f),
  10=>-.2f*C(t),11=>.2f*C(t),12=>-.45f*A(t),13=>-1.2f*A(t-.12f),14=>.45f*A(t),15=>1.2f*A(t-.15f),16=>.2f*A(t-.1f),
  17=>.2f*A(t),18=>-1.2f*A(t-.1f),19=>1.2f*A(t-.14f),
  20=>-.3f*H(t-.08f),21=>-.7f*A(t-.15f),
  22=>-.65f*A(t-.05f),23=>-1.0f*A(t-.15f),24=>.65f*A(t-.08f),25=>1.0f*A(t-.18f),_=>0};
 static AnimationClip Make(IlyraHeadExport rig){
  var clip=new AnimationClip{name="IlyraMiniHopV2Body",frameRate=30,wrapMode=WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float angle=bone.localEulerAngles.z;var inv=Quaternion.Inverse(bone.parent.rotation);
   foreach(string prop in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float V(float t){if(prop=="localEulerAnglesRaw.z")return angle+R(id,t);Vector3 d=Vector3.zero;
     if(id==0)d=new Vector3(0,Y(t),0);
     if(id==1)d=new Vector3(0,-.9f*C(t),0);
     if(id==3)d=new Vector3(0,.4f*(Y(t-.035f)-Y(t)),0);
     if(id==20||id==22||id==24)d=new Vector3(0,.2f*(Y(t-.055f)-Y(t)),0);
     d=inv*d;return prop.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    var keys=new Keyframe[97];for(int f=0;f<=96;f++){float t=f/30f,s=(V(t+.001f)-V(t-.001f))/.002f;keys[f]=new Keyframe(t,V(t),s,s);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),prop),new AnimationCurve(keys));
   }
  }
  var open=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/Head.png");var half=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadHalf.png");var shut=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HeadClosed.png");
  var eyes=new[]{new ObjectReferenceKeyframe{time=0,value=open},new ObjectReferenceKeyframe{time=1f,value=half},new ObjectReferenceKeyframe{time=1.0666667f,value=shut},new ObjectReferenceKeyframe{time=1.1333333f,value=half},new ObjectReferenceKeyframe{time=1.2333333f,value=open},new ObjectReferenceKeyframe{time=Length,value=open}};
  AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/Head",typeof(SpriteRenderer),"m_Sprite"),eyes);
  return SaveClip(clip,"Assets/Clips/IlyraMiniHopV2Body.anim");
 }
 [Serializable] class Report{public int solverHz=240;public float duration=Length,frequency,damping,inertia,limit,maxLeft,maxRight,residualLeft,residualRight;public float settleCorrectionStarts=2.8f;}
 static AnimationClip Bake(IlyraHeadExport rig,AnimationClip body,IlyraSecondaryMotion physics){
  var clip=UnityEngine.Object.Instantiate(body);clip.name="IlyraMiniHopV2";
  var states=new[]{new IlyraSecondaryMotion.State(),new IlyraSecondaryMotion.State()};var previous=new Vector2[2];var velocities=new Vector2[2];var values=new List<Vector3>[] {new(),new()};var max=new float[2];
  int count=Mathf.RoundToInt(Length*Hz);float dt=1/Hz;
  for(int f=0;f<=count;f++){
   float t=f/Hz;body.SampleAnimation(rig.gameObject,t);
   for(int b=0;b<2;b++){
    var bone=rig.bones[26+b];Vector2 anchor=bone.position;Vector2 v=f==0?Vector2.zero:(anchor-previous[b])/dt,a=f<=1?Vector2.zero:(v-velocities[b])/dt;
    if(f>0)states[b].Step(a,dt,physics.frequency*(b==0?1:1.025f),physics.damping,physics.inertia,physics.limit);
    max[b]=Mathf.Max(max[b],states[b].offset.magnitude);
    // Only remove the settled tail residue, after the actual gesture has returned.
    float fade=1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(2.8f,Length,t));
    values[b].Add(bone.localPosition+physics.chest.InverseTransformVector(states[b].offset*fade));previous[b]=anchor;velocities[b]=v;
   }
  }
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y"}){
   var keys=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=values[b][f];keys[f]=new Keyframe(f/Hz,axis=="x"?p.x:p.y);}
   var curve=new AnimationCurve(keys);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}
   AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[26+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);
  }
  File.WriteAllText("../../mini-hop-v2/preview/spring-validation.json",JsonUtility.ToJson(new Report{frequency=physics.frequency,damping=physics.damping,inertia=physics.inertia,limit=physics.limit,maxLeft=max[0],maxRight=max[1],residualLeft=states[0].offset.magnitude,residualRight=states[1].offset.magnitude},true));
  return SaveClip(clip,"Assets/Clips/IlyraMiniHopV2.anim");
 }
 static AnimationClip SaveClip(AnimationClip clip,string path){var existing=AssetDatabase.LoadAssetAtPath<AnimationClip>(path);if(existing==null){AssetDatabase.CreateAsset(clip,path);return clip;}EditorUtility.CopySerialized(clip,existing);EditorUtility.SetDirty(existing);return existing;}
 public static void ExportIdle(){try{EditorSceneManager.OpenScene("Assets/IlyraMiniHopV2.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;rig.clip=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");rig.outputBase="../../mini-hop-v2/preview/idle";EditorApplication.EnterPlaymode();}catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 public static void Run(){try{
  EditorSceneManager.OpenScene("Assets/IlyraTouchReaction.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();var animator=rig.GetComponent<Animator>();animator.enabled=false;
  var idle=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");idle.SampleAnimation(rig.gameObject,0);
  var torso=rig.transform.Find("Visuals/TorsoArmsHands");
  torso.GetComponent<SpriteRenderer>().sprite=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/TorsoHip0.png");
  var skin=torso.GetComponent<UnityEngine.U2D.Animation.SpriteSkin>();skin.SetRootBone(rig.bones[0]);skin.SetBoneTransforms(rig.bones);
  var physics=rig.GetComponent<IlyraSecondaryMotion>();physics.simulate=false;physics.frequency=2.25f;physics.damping=.25f;physics.inertia=1.9f;physics.limit=22f;
  var body=Make(rig);var baked=Bake(rig,body,physics);baked.SampleAnimation(rig.gameObject,0);
  rig.clip=baked;rig.outputBase="../../mini-hop-v2/preview";
  var controller=AssetDatabase.LoadAssetAtPath<AnimatorController>("Assets/Clips/IlyraMiniHopV2.controller");if(controller==null){controller=AnimatorController.CreateAnimatorControllerAtPath("Assets/Clips/IlyraMiniHopV2.controller");
  var sm=controller.layers[0].stateMachine;var rest=sm.AddState("Idle");rest.motion=idle;sm.defaultState=rest;
  var reaction=sm.AddState("Mini hop");reaction.motion=baked;controller.AddParameter("MiniHop",AnimatorControllerParameterType.Trigger);
  var enter=rest.AddTransition(reaction);enter.hasExitTime=true;enter.exitTime=1;enter.duration=0;enter.AddCondition(AnimatorConditionMode.If,0,"MiniHop");
  var back=reaction.AddTransition(rest);back.hasExitTime=true;back.exitTime=1;back.duration=0;}
  animator.runtimeAnimatorController=controller;animator.enabled=true;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraMiniHopV2.unity");
  PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/IlyraMiniHopV2.prefab");animator.enabled=false;AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_MINIHOP_READY duration=3.2 fps=30");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

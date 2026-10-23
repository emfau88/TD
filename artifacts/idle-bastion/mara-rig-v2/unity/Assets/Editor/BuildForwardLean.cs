using System;
using System.IO;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class BuildForwardLean {
 const string Folder="Assets/ForwardLean/";
 static float S(float a,float b,float t)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,t));
 static AnimationCurve C(params float[] p){var k=new Keyframe[p.Length/2];for(int i=0;i<k.Length;i++)k[i]=new Keyframe(p[i*2],p[i*2+1],0,0);return new AnimationCurve(k);}
 [Serializable]class SpringCheck{public string clip;public float duration,maxLeft,maxRight,residualLeft,residualRight;public int limitHits;}
 [Serializable]class Checks{public List<SpringCheck> clips=new();}
 static AnimationClip Bake(ForwardLeanExport rig,AnimationClip pose,Checks checks){
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
  for(int b=0;b<2;b++)foreach(string axis in new[]{"x","y","z"}){var k=new Keyframe[count+1];for(int f=0;f<=count;f++){var p=Vector3.Lerp(values[b][f],rests[b],S(duration-.45f,duration,f*dt));k[f]=new Keyframe(f*dt,axis=="x"?p.x:axis=="y"?p.y:p.z);}var curve=new AnimationCurve(k);for(int f=0;f<=count;f++){AnimationUtility.SetKeyLeftTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,f,AnimationUtility.TangentMode.ClampedAuto);}AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[22+b],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);}
  report.maxLeft=maxima[0];report.maxRight=maxima[1];report.residualLeft=states[0].offset.magnitude;report.residualRight=states[1].offset.magnitude;checks.clips.Add(report);AssetDatabase.CreateAsset(clip,Folder+clip.name+".anim");return clip;
 }
 public static void Run(){
  Directory.CreateDirectory(Folder);AssetDatabase.Refresh();EditorSceneManager.OpenScene("Assets/PhysicsGestures/PhysicsGestures.unity");
  var old=UnityEngine.Object.FindFirstObjectByType<PhysicsGesturesExport>();old.GetComponent<Animator>().enabled=false;old.GetComponent<MaraChestSpring>().simulate=false;
  var rig=old.gameObject.AddComponent<ForwardLeanExport>();rig.bones=old.bones;rig.parents=old.parents;rig.captureCamera=old.captureCamera;UnityEngine.Object.DestroyImmediate(old);
  var original=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/PhysicsGestures/LeanForwardBody.anim");original.SampleAnimation(rig.gameObject,0);
  var clip=UnityEngine.Object.Instantiate(original);clip.name="ForwardLeanBody";
  var pose=C(0,0,.18f,-.055f,1.02f,1,1.82f,1,2.95f,0,5,0);
  var follow=C(0,0,.26f,0,1.20f,1,1.95f,.93f,3.18f,0,5,0);
  float P(float t)=>pose.Evaluate(Mathf.Clamp(t,0,5));float H(float t)=>follow.Evaluate(Mathf.Clamp(t,0,5));
  void Set(int id,string property,Func<float,float> value){var keys=new Keyframe[301];for(int i=0;i<=300;i++){float t=i/60f,a=Mathf.Max(0,t-.001f),b=Mathf.Min(5,t+.001f),d=(value(b)-value(a))/(b-a);keys[i]=new Keyframe(t,value(t),d,d);}AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[id],rig.transform),typeof(Transform),property),new AnimationCurve(keys));}
  // Pitch the upper body about the fixed hip, instead of lowering the head alone.
  // The orthographic camera preserves scale; the mesh foreshortens geometrically.
  var chest=rig.bones[1].localPosition;
  Set(1,"m_LocalPosition.x",t=>chest.x*Mathf.Cos(35*P(t)*Mathf.Deg2Rad));
  Set(1,"m_LocalPosition.y",t=>chest.y);
  Set(1,"m_LocalPosition.z",t=>chest.z-chest.x*Mathf.Sin(35*P(t)*Mathf.Deg2Rad));
  Set(1,"localEulerAnglesRaw.y",t=>35*P(t));
  foreach(int id in new[]{2,3}){var rest=rig.bones[id].localPosition;Set(id,"m_LocalPosition.x",t=>rest.x);Set(id,"m_LocalPosition.y",t=>rest.y);Set(id,"m_LocalPosition.z",t=>rest.z);}
  // Counter-pitch the neck/head to retain eye contact and uncompressed facial proportions.
  Set(2,"localEulerAnglesRaw.y",t=>-8*H(t));Set(3,"localEulerAnglesRaw.y",t=>-27*H(t));
  // Accommodate the depth motion without changing orthographic framing or sprite ordering.
  var cam=rig.captureCamera;var cp=cam.transform.position;cam.transform.position=new Vector3(cp.x,cp.y,-1000);cam.nearClipPlane=.1f;cam.farClipPlane=2000;
  AssetDatabase.CreateAsset(clip,Folder+clip.name+".anim");var checks=new Checks();var baked=Bake(rig,clip,checks);rig.clips=new[]{baked};baked.SampleAnimation(rig.gameObject,0);
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"ForwardLean.unity");File.WriteAllText("../forward-lean/spring-validation.json",JsonUtility.ToJson(checks,true));AssetDatabase.SaveAssets();Debug.Log("FORWARD_LEAN_READY");EditorApplication.EnterPlaymode();
 }
}

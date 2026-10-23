using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Additional clips/scenes only; original rig, art, clips and approved head study stay intact.
public static class BuildBodyOrganic {
 static AnimationCurve Curve(params float[] pairs) {
  var keys=new Keyframe[pairs.Length/2];
  for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(pairs[2*i],pairs[2*i+1],0,0);
  return new AnimationCurve(keys);
 }
 static AnimationClip Make(MaraV2Export rig,bool idle) {
  var original=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/"+(idle?"Idle":"TouchReaction")+".anim");
  original.SampleAnimation(rig.gameObject,0);
  float length=idle?5f:2.8f;
  var breath=Curve(0,0,.15f,0,1.65f,1,2f,.96f,4.3f,0,5,0);
  var gaze=Curve(0,0,.3f,0,2.2f,.30f,3.8f,-.10f,4.6f,0,5,0);
  var body=Curve(0,0,.16f,.10f,.80f,-.90f,1.25f,-.80f,2.57f,0,2.8f,0);
  var head=Curve(0,0,.16f,.18f,.72f,-2.5f,1.22f,-2.3f,2.4f,0,2.8f,0);
  var upper=Curve(0,0,.18f,.25f,.74f,-6.5f,1.17f,-6.2f,2.48f,0,2.8f,0);
  var forearm=Curve(0,0,.25f,0,.98f,-40,1.30f,-38,2.60f,0,2.8f,0);
  var hand=Curve(0,0,.34f,0,1.08f,10,1.38f,9,2.72f,0,2.8f,0);
  var response=Curve(0,0,.18f,0,.82f,1,1.25f,.9f,2.5f,0,2.8f,0);
  float B(float t)=>breath.Evaluate(Mathf.Clamp(t,0,length));
  float G(float t)=>gaze.Evaluate(Mathf.Clamp(t,0,length));
  float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,length));
  float R(float t)=>response.Evaluate(Mathf.Clamp(t,0,length));
  float HeadWorld(float t)=>idle?.22f*B(t)-.08f*B(t-.08f)+G(t):body.Evaluate(Mathf.Clamp(t,0,length))+.12f*R(t)+H(t);
  float Follow(float t,float delay,float strength)=>strength*(HeadWorld(t-delay)-HeadWorld(t));
  float Rotation(int b,float t) {
   if(idle)return b switch {
    1=>.22f*B(t),2=>-.08f*B(t-.08f),3=>G(t),
    4=>Follow(t,.12f,.5f),5=>Follow(t,.18f,.65f),6=>Follow(t,.24f,.8f),
    7=>Follow(t,.10f,.45f),8=>Follow(t,.14f,.5f),
    9=>-.10f*B(t-.12f),10=>.22f*B(t-.10f),11=>.30f*B(t-.20f),
    12=>-.18f*B(t-.13f),13=>-.26f*B(t-.25f),
    14=>-.28f*B(t-.04f),15=>.14f*B(t-.10f),16=>-.07f*B(t-.17f),
    17=>.24f*B(t-.06f),18=>-.12f*B(t-.12f),19=>.06f*B(t-.19f),_=>0
   };
   return b switch {
    1=>body.Evaluate(t),2=>.12f*R(t),3=>H(t),
    4=>Follow(t,.10f,.4f),5=>Follow(t,.14f,.5f),6=>Follow(t,.18f,.6f),
    7=>Follow(t,.09f,.35f),8=>Follow(t,.12f,.4f),
    9=>.15f*R(t-.12f),10=>.25f*R(t-.10f),11=>.35f*R(t-.18f),
    12=>-1.3f*R(t-.08f),13=>-1.7f*R(t-.18f),
    14=>.3f*R(t),15=>.65f*R(t-.1f),16=>-.2f*R(t-.15f),
    17=>upper.Evaluate(t),18=>forearm.Evaluate(t),19=>hand.Evaluate(t),_=>0
   };
  }
  var clip=new AnimationClip{name=idle?"IdleOrganic":"TouchReactionOrganic",frameRate=30,wrapMode=idle?WrapMode.Loop:WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++) {
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float rotation=bone.localEulerAngles.z;var inverseParent=Quaternion.Inverse(bone.parent.rotation);
   foreach(string property in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}) {
    float Value(float t) {
     if(property=="localEulerAnglesRaw.z")return rotation+Rotation(id,t);
     var world=Vector3.zero;
     if(id==1)world=idle?new Vector3(.8f*B(t),1.8f*B(t),0):new Vector3(1.2f*R(t),.65f*R(t),0);
     if(id>=20&&!idle)world=new Vector3(0,1.25f*R(t),0);
     var delta=inverseParent*world;
     return property.EndsWith("x")?rest.x+delta.x:rest.y+delta.y;
    }
    int count=Mathf.RoundToInt(length*30);var keys=new Keyframe[count+1];
    for(int f=0;f<=count;f++){float t=length*f/count,a=Mathf.Max(0,t-.001f),z=Mathf.Min(length,t+.001f);float slope=(Value(z)-Value(a))/(z-a);keys[f]=new Keyframe(t,Value(t),slope,slope);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),property),new AnimationCurve(keys));
   }
  }
  foreach(var binding in AnimationUtility.GetObjectReferenceCurveBindings(original)) {
   var keys=AnimationUtility.GetObjectReferenceCurve(original,binding);
   if(!idle) {
    float[] times=binding.path.Contains("Eye")?new[]{0,.86f,.927f,1.087f,1.154f}:new[]{0,.45f,2.2f};
    for(int i=0;i<keys.Length;i++)keys[i].time=times[i];
   }
   AnimationUtility.SetObjectReferenceCurve(clip,binding,keys);
  }
  var settings=AnimationUtility.GetAnimationClipSettings(clip);settings.loopTime=idle;AnimationUtility.SetAnimationClipSettings(clip,settings);
  AssetDatabase.CreateAsset(clip,"Assets/Clips/"+clip.name+".anim");return clip;
 }
 public static void Run() {
  EditorSceneManager.OpenScene("Assets/MaraV2.unity");var old=UnityEngine.Object.FindFirstObjectByType<MaraV2Export>();old.GetComponent<Animator>().enabled=false;
  var idle=Make(old,true);var touch=Make(old,false);
  var exporter=old.gameObject.AddComponent<BodyOrganicExport>();exporter.clips=new[]{idle,touch};exporter.bones=old.bones;exporter.parents=old.parents;exporter.captureCamera=old.captureCamera;
  UnityEngine.Object.DestroyImmediate(old);idle.SampleAnimation(exporter.gameObject,0);
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/BodyOrganicComparison.unity");AssetDatabase.SaveAssets();
  Debug.Log("BODY_ORGANIC_READY");EditorApplication.EnterPlaymode();
 }
}

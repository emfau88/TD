using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Separate body-led variation. No original sprites, weights, clips or scenes are changed.
public static class BuildNeckenBody {
 static AnimationCurve Curve(params float[] p){var keys=new Keyframe[p.Length/2];for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(p[2*i],p[2*i+1],0,0);return new AnimationCurve(keys);}
 public static void Run(){
  EditorSceneManager.OpenScene("Assets/MaraV2.unity");var rig=UnityEngine.Object.FindFirstObjectByType<MaraV2Export>();rig.GetComponent<Animator>().enabled=false;
  AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/Idle.anim").SampleAnimation(rig.gameObject,0);
  const float length=3.4f;
  var pose=Curve(0,0,.18f,-.08f,.85f,1,1.55f,.96f,2.1f,.78f,3.06f,0,3.4f,0);
  var lean=Curve(0,0,.30f,-.12f,1.12f,1,1.65f,.94f,3.05f,0,3.4f,0);
  var head=Curve(0,0,.28f,1.2f,1.04f,-4.0f,1.64f,-3.7f,3.08f,0,3.4f,0);
  var elbow=Curve(0,0,.23f,0,1.02f,1,1.72f,1,3.12f,0,3.4f,0);
  var wrist=Curve(0,0,.34f,0,1.14f,1,1.75f,1,3.22f,0,3.4f,0);
  var expression=Curve(0,0,.3f,0,1.1f,1,1.7f,.85f,2.7f,0,3.4f,0);
  float P(float t)=>pose.Evaluate(Mathf.Clamp(t,0,length));
  float L(float t)=>lean.Evaluate(Mathf.Clamp(t,0,length));
  float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,length));
  float Follow(float t,float delay,float strength)=>strength*((H(t-delay)-2.4f*L(t-delay))-(H(t)-2.4f*L(t)));
  float Rotation(int b,float t)=>b switch {
   0=>.35f*P(t),1=>-2.4f*L(t),2=>.28f*L(t-.08f),3=>H(t),
   4=>Follow(t,.1f,.4f),5=>Follow(t,.14f,.5f),6=>Follow(t,.18f,.6f),7=>Follow(t,.09f,.35f),8=>Follow(t,.12f,.4f),
   9=>-.3f*L(t-.1f),10=>.65f*L(t-.1f),11=>.9f*L(t-.18f),12=>-1.0f*P(t-.1f),13=>-1.3f*P(t-.2f),
   14=>.9f*L(t),15=>1.4f*L(t-.1f),16=>-.6f*L(t-.17f),
   17=>10f*P(t),18=>-48f*elbow.Evaluate(t),19=>30f*wrist.Evaluate(t),_=>0
  };
  var clip=new AnimationClip{name="ReactionNeckenBody",frameRate=30,wrapMode=WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float rotation=bone.localEulerAngles.z;var inverseParent=Quaternion.Inverse(bone.parent.rotation);
   foreach(string property in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float Value(float t){if(property=="localEulerAnglesRaw.z")return rotation+Rotation(id,t);var world=Vector3.zero;
     if(id==0)world=new Vector3(3.5f*P(t),0,0);
     if(id==1)world=new Vector3(-5f*L(t),-4.5f*L(t),0);
     if(id==3)world=new Vector3(0,-1.8f*L(t-.06f),0);
     if(id>=20)world=new Vector3(0,expression.Evaluate(t)*(id==20?1.4f:.8f),0);
     var d=inverseParent*world;return property.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    var keys=new Keyframe[103];for(int f=0;f<=102;f++){float t=length*f/102,a=Mathf.Max(0,t-.001f),z=Mathf.Min(length,t+.001f),slope=(Value(z)-Value(a))/(z-a);keys[f]=new Keyframe(t,Value(t),slope,slope);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),property),new AnimationCurve(keys));
   }
  }
  var original=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/ReactionNecken.anim");
  foreach(var binding in AnimationUtility.GetObjectReferenceCurveBindings(original)){
   var keys=AnimationUtility.GetObjectReferenceCurve(original,binding);float[] times=binding.path.Contains("Eye")?new[]{0,1.05f,1.117f,1.33f,1.397f}:new[]{0,.65f,2.7f};for(int i=0;i<keys.Length;i++)keys[i].time=times[i];AnimationUtility.SetObjectReferenceCurve(clip,binding,keys);
  }
  AssetDatabase.CreateAsset(clip,"Assets/Clips/ReactionNeckenBody.anim");var exporter=rig.gameObject.AddComponent<NeckenBodyExport>();exporter.clips=new[]{clip};exporter.bones=rig.bones;exporter.parents=rig.parents;exporter.captureCamera=rig.captureCamera;
  UnityEngine.Object.DestroyImmediate(rig);clip.SampleAnimation(exporter.gameObject,0);EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/NeckenBodyStudy.unity");AssetDatabase.SaveAssets();Debug.Log("NECKEN_BODY_READY");EditorApplication.EnterPlaymode();
 }
}

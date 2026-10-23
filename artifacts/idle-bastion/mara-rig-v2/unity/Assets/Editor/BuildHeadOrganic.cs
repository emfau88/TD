using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Independent comparison asset: never rewrites the original clips, prefab or scene.
public static class BuildHeadOrganic {
 static AnimationCurve Curve(params float[] pairs) {
  var keys=new Keyframe[pairs.Length/2];
  for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(pairs[i*2],pairs[i*2+1],0,0);
  return new AnimationCurve(keys);
 }
 public static void Run() {
  EditorSceneManager.OpenScene("Assets/MaraV2.unity");
  var old=UnityEngine.Object.FindFirstObjectByType<MaraV2Export>();
  var rig=old.gameObject;rig.GetComponent<Animator>().enabled=false;
  var original=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/HeadReaction.anim");
  original.SampleAnimation(rig,0);
  var clip=new AnimationClip{name="Head Organic",frameRate=30,wrapMode=WrapMode.Once};
  const float length=2f;
  var head=Curve(0,0,.14f,-.25f,.66f,4.25f,.98f,4.05f,1.78f,0,2,0);
  var body=Curve(0,0,.19f,.08f,.78f,-.85f,1.04f,-.78f,1.88f,0,2,0);
  var neck=Curve(0,0,.18f,-.06f,.72f,.58f,1.02f,.52f,1.83f,0,2,0);
  var lift=Curve(0,0,.2f,0,.8f,1,1.1f,.9f,1.88f,0,2,0);
  var face=Curve(0,0,.2f,0,.58f,1,1.1f,.85f,1.7f,0,2,0);
  float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,length));
  float Follow(float t,float delay,float strength)=>strength*(H(t-delay)-H(t));
  float Rotation(int b,float t) => b switch {
   1=>body.Evaluate(t),2=>neck.Evaluate(t),3=>H(t),
   4=>Follow(t,.10f,.40f),5=>Follow(t,.14f,.50f),6=>Follow(t,.18f,.60f),
   7=>Follow(t,.09f,.35f),8=>Follow(t,.12f,.40f),
   9=>-.12f*lift.Evaluate(t-.1f),10=>-.22f*lift.Evaluate(t-.1f),
   11=>-.30f*lift.Evaluate(t-.1f),12=>.18f*lift.Evaluate(t-.1f),13=>.25f*lift.Evaluate(t-.1f),
   14=>-.25f*body.Evaluate(t),17=>-.4f*body.Evaluate(t),
   15=>.12f*lift.Evaluate(t),18=>-.12f*lift.Evaluate(t),_=>0
  };
  for(int b=0;b<old.bones.Length;b++) {
   int id=b;var bone=old.bones[b];var rest=bone.localPosition;float rotation=bone.localEulerAngles.z;
   var inverseParent=Quaternion.Inverse(bone.parent.rotation);
   foreach(string property in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}) {
    float Value(float t) {
     if(property=="localEulerAnglesRaw.z")return rotation+Rotation(id,t);
     var delta=Vector3.zero;
     if(id==1)delta=inverseParent*new Vector3(-1.6f*lift.Evaluate(t),.8f*lift.Evaluate(t),0);
     if(id>=20)delta=inverseParent*new Vector3(0,1.5f*face.Evaluate(t),0);
     return property.EndsWith("x")?rest.x+delta.x:rest.y+delta.y;
    }
    var keys=new Keyframe[61];
    for(int f=0;f<=60;f++){float t=f/30f;float a=Mathf.Max(0,t-.001f),z=Mathf.Min(length,t+.001f);float slope=(Value(z)-Value(a))/(z-a);keys[f]=new Keyframe(t,Value(t),slope,slope);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),property),new AnimationCurve(keys));
   }
  }
  foreach(var binding in AnimationUtility.GetObjectReferenceCurveBindings(original)) {
   var keys=AnimationUtility.GetObjectReferenceCurve(original,binding);
   if(binding.path.Contains("Eye")) {float[] times={0,.35f,.417f,.483f,.55f};for(int i=0;i<keys.Length;i++)keys[i].time=times[i];}
   else {float[] times={0,.38f,1.6f};for(int i=0;i<keys.Length;i++)keys[i].time=times[i];}
   AnimationUtility.SetObjectReferenceCurve(clip,binding,keys);
  }
  AssetDatabase.CreateAsset(clip,"Assets/Clips/HeadReactionOrganic.anim");
  var exporter=rig.AddComponent<HeadOrganicExport>();exporter.clips=new[]{clip};exporter.bones=old.bones;exporter.parents=old.parents;exporter.captureCamera=old.captureCamera;
  UnityEngine.Object.DestroyImmediate(old);
  clip.SampleAnimation(rig,0);
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/HeadOrganicComparison.unity");
  AssetDatabase.SaveAssets();Debug.Log("HEAD_ORGANIC_READY");EditorApplication.EnterPlaymode();
 }
}

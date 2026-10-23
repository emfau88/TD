using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Two additive gestures, on the unchanged rig and existing face drawings.
public static class BuildGestureStudy {
 static AnimationCurve Curve(params float[] p){var keys=new Keyframe[p.Length/2];for(int i=0;i<keys.Length;i++)keys[i]=new Keyframe(p[2*i],p[2*i+1],0,0);return new AnimationCurve(keys);}
 static AnimationClip Make(MaraV2Export rig,bool gaze){
  AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/Idle.anim").SampleAnimation(rig.gameObject,0);
  float length=gaze?3.8f:2.8f;
  var head=gaze?Curve(0,0,.18f,0,1.12f,2.4f,1.85f,2.3f,3.48f,0,3.8f,0):Curve(0,0,.32f,1.8f,.96f,-3.2f,1.38f,-2.9f,2.50f,0,2.8f,0);
  var body=gaze?Curve(0,0,.22f,0,1.26f,-.40f,1.95f,-.36f,3.5f,0,3.8f,0):Curve(0,0,.28f,.70f,1.04f,-.75f,1.4f,-.65f,2.56f,0,2.8f,0);
  var lift=gaze?Curve(0,0,.18f,0,1.34f,1,1.9f,.92f,3.45f,0,3.8f,0):Curve(0,0,.30f,-.65f,.98f,1,1.35f,.92f,2.52f,0,2.8f,0);
  var arm=Curve(0,0,.32f,0,.86f,1,1.35f,.85f,2.48f,0,2.8f,0);
  var brow=gaze?Curve(0,0,.3f,0,.95f,.7f,1.9f,.55f,3.15f,0,3.8f,0):Curve(0,0,.28f,.3f,.88f,1.4f,1.35f,1.2f,2.24f,0,2.8f,0);
  float H(float t)=>head.Evaluate(Mathf.Clamp(t,0,length));
  float B(float t)=>body.Evaluate(Mathf.Clamp(t,0,length));
  float L(float t)=>lift.Evaluate(Mathf.Clamp(t,0,length));
  float A(float t)=>arm.Evaluate(Mathf.Clamp(t,0,length));
  float Follow(float t,float delay,float amount)=>amount*(H(t-delay)+B(t-delay)-H(t)-B(t));
  float Rotation(int b,float t)=>b switch {
   1=>B(t),2=>(gaze?.14f:.16f)*L(t),3=>H(t),
   4=>Follow(t,.10f,.4f),5=>Follow(t,.14f,.5f),6=>Follow(t,.18f,.6f),7=>Follow(t,.09f,.35f),8=>Follow(t,.12f,.4f),
   9=>-.10f*L(t-.1f),10=>.2f*L(t-.1f),11=>.3f*L(t-.18f),12=>-.22f*L(t-.12f),13=>-.34f*L(t-.2f),
   14=>-.28f*B(t),15=>.15f*L(t-.08f),16=>-.08f*L(t-.14f),
   17=>gaze?-.3f*B(t):-2.2f*A(t),18=>gaze?-.15f*L(t-.08f):-17*A(t-.08f),19=>gaze?.08f*L(t-.14f):6*A(t-.16f),_=>0
  };
  var clip=new AnimationClip{name=gaze?"IdleBlickkontakt":"ReactionNecken",frameRate=30,wrapMode=WrapMode.Once};
  for(int b=0;b<rig.bones.Length;b++){
   int id=b;var bone=rig.bones[b];var rest=bone.localPosition;float rotation=bone.localEulerAngles.z;var inverseParent=Quaternion.Inverse(bone.parent.rotation);
   foreach(string property in new[]{"localEulerAnglesRaw.z","m_LocalPosition.x","m_LocalPosition.y"}){
    float Value(float t){if(property=="localEulerAnglesRaw.z")return rotation+Rotation(id,t);var world=Vector3.zero;
     if(id==1)world=gaze?new Vector3(-.8f*L(t),.9f*L(t),0):new Vector3(1.6f*L(t),1.7f*L(t),0);
     if(id>=20)world=new Vector3(0,brow.Evaluate(t)*(id==20?1:.72f),0);
     var d=inverseParent*world;return property.EndsWith("x")?rest.x+d.x:rest.y+d.y;
    }
    int count=Mathf.RoundToInt(length*30);var keys=new Keyframe[count+1];for(int f=0;f<=count;f++){float t=length*f/count,a=Mathf.Max(0,t-.001f),z=Mathf.Min(length,t+.001f),slope=(Value(z)-Value(a))/(z-a);keys[f]=new Keyframe(t,Value(t),slope,slope);}
    AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(bone,rig.transform),typeof(Transform),property),new AnimationCurve(keys));
   }
  }
  Sprite S(string n)=>AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/"+n+".png");
  void Swap(string n,string[] variants,float[] times){var k=new ObjectReferenceKeyframe[times.Length];for(int i=0;i<k.Length;i++)k[i]=new ObjectReferenceKeyframe{time=times[i],value=S(variants[i])};AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/"+n,typeof(SpriteRenderer),"m_Sprite"),k);}
  foreach(string side in new[]{"L","R"}){string eye="Eye"+side;if(gaze||side=="R")Swap(eye,new[]{eye,eye+"Half",eye+"Closed",eye+"Half",eye},gaze?new[]{0,1.35f,1.45f,1.60f,1.75f}:new[]{0,.84f,.907f,1.12f,1.187f});else Swap(eye,new[]{eye},new[]{0f});}
  Swap("Mouth",new[]{"Mouth","MouthSmile","Mouth"},gaze?new[]{0,.75f,2.75f}:new[]{0,.58f,2.1f});
  AssetDatabase.CreateAsset(clip,"Assets/Clips/"+clip.name+".anim");return clip;
 }
 public static void Run(){
  EditorSceneManager.OpenScene("Assets/MaraV2.unity");var old=UnityEngine.Object.FindFirstObjectByType<MaraV2Export>();old.GetComponent<Animator>().enabled=false;
  var gaze=Make(old,true);var tease=Make(old,false);var exporter=old.gameObject.AddComponent<GestureStudyExport>();exporter.clips=new[]{gaze,tease};exporter.bones=old.bones;exporter.parents=old.parents;exporter.captureCamera=old.captureCamera;
  UnityEngine.Object.DestroyImmediate(old);gaze.SampleAnimation(exporter.gameObject,0);EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/GestureStudy.unity");AssetDatabase.SaveAssets();Debug.Log("GESTURE_STUDY_READY");EditorApplication.EnterPlaymode();
 }
}

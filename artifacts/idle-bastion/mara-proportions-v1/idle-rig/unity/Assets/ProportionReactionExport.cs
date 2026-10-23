using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;
using UnityEngine.Rendering;

// Samples existing clips with the original or approved M01 meshes. No curve edits.
public class ProportionReactionExport : MonoBehaviour {
 public AnimationClip[] clips;
 public string[] keys;
 public Camera captureCamera;
 public Transform[] bones;
 public SpriteRenderer[] renderers;
 public Sprite[] originals, revised;
 public string outputBase = "../../reactions-v1";
 public string auditFile = "mesh-audit.json";
 [Serializable] public class Joint { public string name; public float x,y; public Vector3 position,scale; public Quaternion rotation; }
 [Serializable] public class Pose { public string clip,version; public int frame; public Joint[] joints; }
 [Serializable] public class Layer { public string name; public int order,layer; }
 [Serializable] public class Audit { public int states,triangles,folded; public float minRatio=999,maxRatio; public List<Pose> poses=new(); public Layer[] layers; }
 static float Area(Vector2 a,Vector2 b,Vector2 c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 void Inspect(Audit audit,string key,string version,int frame){
  audit.states++;var pose=new Pose{clip=key,version=version,frame=frame,joints=new Joint[bones.Length]};
  for(int i=0;i<bones.Length;i++){
   var p=captureCamera.WorldToViewportPoint(bones[i].position);
   pose.joints[i]=new Joint{name=bones[i].name,x=p.x*768,y=(1-p.y)*1024,position=bones[i].localPosition,rotation=bones[i].localRotation,scale=bones[i].localScale};
  }
  audit.poses.Add(pose);
  foreach(var skin in GetComponentsInChildren<SpriteSkin>()){
   var s=skin.GetComponent<SpriteRenderer>().sprite;var v=s.vertices;var ids=s.triangles;
   var weights=s.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight);var bind=s.GetBindPoses();var result=new Vector2[v.Length];
   for(int i=0;i<v.Length;i++){
    var w=weights[i];Vector3 p=v[i];
    Vector3 Apply(int b,float k)=>(skin.boneTransforms[b].localToWorldMatrix*bind[b]).MultiplyPoint3x4(p)*k;
    result[i]=Apply(w.boneIndex0,w.weight0)+Apply(w.boneIndex1,w.weight1)+Apply(w.boneIndex2,w.weight2)+Apply(w.boneIndex3,w.weight3);
   }
   for(int i=0;i<ids.Length;i+=3){
    int a=ids[i],b=ids[i+1],c=ids[i+2];float rest=Area(v[a],v[b],v[c]);if(Mathf.Abs(rest)<.00001f)continue;
    float ratio=Area(result[a],result[b],result[c])/rest;audit.triangles++;
    if(ratio<=0||float.IsNaN(ratio))audit.folded++;
    audit.minRatio=Mathf.Min(audit.minRatio,ratio);audit.maxRatio=Mathf.Max(audit.maxRatio,ratio);
   }
  }
 }
 IEnumerator Start(){
  if(!Array.Exists(Environment.GetCommandLineArgs(),x=>x=="-spire-export"))yield break;
  GetComponent<Animator>().enabled=false;captureCamera.enabled=false;
  var transforms=GetComponentsInChildren<Transform>();
  var positions=new Vector3[transforms.Length];var rotations=new Quaternion[transforms.Length];var scales=new Vector3[transforms.Length];
  for(int i=0;i<transforms.Length;i++){positions[i]=transforms[i].localPosition;rotations[i]=transforms[i].localRotation;scales[i]=transforms[i].localScale;}
  var allRenderers=GetComponentsInChildren<SpriteRenderer>();var savedSprites=new Sprite[allRenderers.Length];
  var audit=new Audit{layers=new Layer[allRenderers.Length]};
  for(int i=0;i<allRenderers.Length;i++){savedSprites[i]=allRenderers[i].sprite;audit.layers[i]=new Layer{name=allRenderers[i].name,order=allRenderers[i].sortingOrder,layer=allRenderers[i].sortingLayerID};}
  var rt=new RenderTexture(768,1024,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){antiAliasing=1};captureCamera.targetTexture=rt;
  var pixels=new Texture2D(768,1024,TextureFormat.RGBA32,false,true);var encoded=new Texture2D(768,1024,TextureFormat.RGBA32,false,true);
  for(int ci=0;ci<clips.Length;ci++)foreach(string version in new[]{"before","after"}){
   for(int i=0;i<transforms.Length;i++){transforms[i].localPosition=positions[i];transforms[i].localRotation=rotations[i];transforms[i].localScale=scales[i];}
   for(int i=0;i<allRenderers.Length;i++)allRenderers[i].sprite=savedSprites[i];
   for(int i=0;i<renderers.Length;i++)renderers[i].sprite=version=="before"?originals[i]:revised[i];
   var clip=clips[ci];int count=Mathf.RoundToInt(clip.length*30);string folder=Path.Combine(outputBase,"export",keys[ci],version);Directory.CreateDirectory(folder);
   for(int frame=0;frame<=count;frame++){
    clip.SampleAnimation(gameObject,clip.length*frame/count);yield return null;yield return null;
    Inspect(audit,keys[ci],version,frame);
    var previous=RenderTexture.active;captureCamera.Render();RenderTexture.active=rt;pixels.ReadPixels(new Rect(0,0,768,1024),0,0);pixels.Apply();RenderTexture.active=previous;
    var colors=pixels.GetPixels32();for(int k=0;k<colors.Length;k++){
     var c=colors[k];if(c.a==0){colors[k]=new Color32(0,0,0,0);continue;}
     if(c.a<255){c.r=(byte)Mathf.Clamp(Mathf.RoundToInt(c.r*255f/c.a),0,255);c.g=(byte)Mathf.Clamp(Mathf.RoundToInt(c.g*255f/c.a),0,255);c.b=(byte)Mathf.Clamp(Mathf.RoundToInt(c.b*255f/c.a),0,255);}colors[k]=c;
    }
    encoded.SetPixels32(colors);encoded.Apply();File.WriteAllBytes(Path.Combine(folder,$"frame-{frame:D3}.png"),encoded.EncodeToPNG());
   }
   Debug.Log($"REACTION_PROPORTIONS_EXPORTED {keys[ci]} {version} {count+1}");
  }
  File.WriteAllText(Path.Combine(outputBase,auditFile),JsonUtility.ToJson(audit,true));captureCamera.targetTexture=null;rt.Release();
  Debug.Log($"REACTION_PROPORTIONS_DONE states={audit.states} folds={audit.folded}");UnityEditor.EditorApplication.Exit(audit.folded==0?0:1);
 }
}

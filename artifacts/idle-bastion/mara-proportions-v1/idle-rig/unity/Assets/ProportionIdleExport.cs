using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;
using UnityEngine.Rendering;

public class ProportionIdleExport:MonoBehaviour {
 public AnimationClip clip;public Camera captureCamera;public Transform[] bones;
 public SpriteRenderer[] renderers;public Sprite[] originals,revised;
 [Serializable]public class Pose {public string version;public int frame;public Vector3[] joints;}
 [Serializable]public class Audit {public int states,triangles,folded;public float minRatio=999,maxRatio;public List<Pose> poses=new();}
 float Area(Vector2 a,Vector2 b,Vector2 c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 void Inspect(Audit audit,string version,int frame){
  audit.states++;var pose=new Pose{version=version,frame=frame,joints=new Vector3[bones.Length]};
  for(int i=0;i<bones.Length;i++)pose.joints[i]=bones[i].position;audit.poses.Add(pose);
  foreach(var skin in GetComponentsInChildren<SpriteSkin>()){
   var s=skin.GetComponent<SpriteRenderer>().sprite;var v=s.vertices;var ids=s.triangles;var w=s.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight);var bind=s.GetBindPoses();var result=new Vector2[v.Length];
   for(int i=0;i<v.Length;i++){
    var weight=w[i];Vector3 p=v[i];
    result[i]=(skin.boneTransforms[weight.boneIndex0].localToWorldMatrix*bind[weight.boneIndex0]).MultiplyPoint3x4(p)*weight.weight0+
     (skin.boneTransforms[weight.boneIndex1].localToWorldMatrix*bind[weight.boneIndex1]).MultiplyPoint3x4(p)*weight.weight1+
     (skin.boneTransforms[weight.boneIndex2].localToWorldMatrix*bind[weight.boneIndex2]).MultiplyPoint3x4(p)*weight.weight2+
     (skin.boneTransforms[weight.boneIndex3].localToWorldMatrix*bind[weight.boneIndex3]).MultiplyPoint3x4(p)*weight.weight3;
   }
   for(int i=0;i<ids.Length;i+=3){int a=ids[i],b=ids[i+1],c=ids[i+2];float rest=Area(v[a],v[b],v[c]);if(Mathf.Abs(rest)<.00001f)continue;
    float ratio=Area(result[a],result[b],result[c])/rest;audit.triangles++;if(ratio<=0||float.IsNaN(ratio))audit.folded++;audit.minRatio=Mathf.Min(audit.minRatio,ratio);audit.maxRatio=Mathf.Max(audit.maxRatio,ratio);
   }
  }
 }
 IEnumerator Start(){
  if(!Array.Exists(Environment.GetCommandLineArgs(),x=>x=="-spire-export"))yield break;
  GetComponent<Animator>().enabled=false;captureCamera.enabled=false;
  var rt=new RenderTexture(768,1024,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){antiAliasing=1};captureCamera.targetTexture=rt;
  var pixels=new Texture2D(768,1024,TextureFormat.RGBA32,false,true);var encoded=new Texture2D(768,1024,TextureFormat.RGBA32,false,true);var audit=new Audit();
  foreach(string version in new[]{"before","after"}){
   for(int i=0;i<renderers.Length;i++)renderers[i].sprite=version=="before"?originals[i]:revised[i];
   string folder="../export/"+version;Directory.CreateDirectory(folder);int count=Mathf.RoundToInt(clip.length*30);
   for(int i=0;i<=count;i++){
    clip.SampleAnimation(gameObject,i/30f);yield return null;yield return null;
    Inspect(audit,version,i);
    var previous=RenderTexture.active;captureCamera.Render();RenderTexture.active=rt;pixels.ReadPixels(new Rect(0,0,768,1024),0,0);pixels.Apply();RenderTexture.active=previous;
    var colors=pixels.GetPixels32();for(int k=0;k<colors.Length;k++){var c=colors[k];if(c.a==0){colors[k]=new Color32(0,0,0,0);continue;}if(c.a<255){c.r=(byte)Mathf.Clamp(Mathf.RoundToInt(c.r*255f/c.a),0,255);c.g=(byte)Mathf.Clamp(Mathf.RoundToInt(c.g*255f/c.a),0,255);c.b=(byte)Mathf.Clamp(Mathf.RoundToInt(c.b*255f/c.a),0,255);}colors[k]=c;}
    encoded.SetPixels32(colors);encoded.Apply();File.WriteAllBytes($"{folder}/frame-{i:D3}.png",encoded.EncodeToPNG());
   }Debug.Log("PROPORTION_EXPORTED "+version);
  }
  File.WriteAllText("../mesh-audit.json",JsonUtility.ToJson(audit,true));captureCamera.targetTexture=null;rt.Release();
  Debug.Log("PROPORTION_EXPORT_DONE folded="+audit.folded);UnityEditor.EditorApplication.Exit(audit.folded==0?0:1);
 }
}

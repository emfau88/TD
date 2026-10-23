using System;
using System.IO;
using System.Linq;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;

// Samples the editable 2.8-second clip and validates every exported mesh pose.
public class IlyraHeadExport:MonoBehaviour {
 public string outputBase="../preview";public AnimationClip clip; public Transform[] bones;public int[] parents;public float[] lengths;public Camera captureCamera;
 [Serializable] public class Joint {public string name;public int parent;public float x,y,endX,endY;}
 [Serializable] public class Pose {public int frame;public Joint[] joints;}
 [Serializable] public class Evidence {public int samples,trianglesChecked,foldedTriangles;public float minAreaRatio=999;public string minLayer;public List<Pose> poses=new();}
 static float Area(Vector2 a,Vector2 b,Vector2 c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 void Inspect(Evidence ev){
  foreach(var skin in GetComponentsInChildren<SpriteSkin>()){
   var sprite=skin.GetComponent<SpriteRenderer>().sprite;var v=sprite.vertices;var ids=sprite.triangles;var weights=sprite.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight);var bind=sprite.GetBindPoses();var posed=new Vector2[v.Length];
   for(int j=0;j<v.Length;j++){
    var w=weights[j];Vector3 p=v[j];
    Vector3 Apply(int b,float k)=>bones[b].localToWorldMatrix.MultiplyPoint3x4(bind[b].MultiplyPoint3x4(p))*k;
    posed[j]=Apply(w.boneIndex0,w.weight0)+Apply(w.boneIndex1,w.weight1)+Apply(w.boneIndex2,w.weight2)+Apply(w.boneIndex3,w.weight3);
   }
   for(int j=0;j<ids.Length;j+=3){int a=ids[j],b=ids[j+1],c=ids[j+2];float baseArea=Area(v[a],v[b],v[c]);if(Mathf.Abs(baseArea)<.0001f)continue;float ratio=Area(posed[a],posed[b],posed[c])/baseArea;ev.trianglesChecked++;if(ratio<=0||float.IsNaN(ratio))ev.foldedTriangles++;if(ratio<ev.minAreaRatio){ev.minAreaRatio=ratio;ev.minLayer=skin.name;}}
  }
 }
 IEnumerator Start(){
  if(!Environment.GetCommandLineArgs().Contains("-spire-export"))yield break;
  GetComponent<Animator>().enabled=false;
  captureCamera.enabled=false;string output=outputBase+"/frames";Directory.CreateDirectory(output);
  var rt=new RenderTexture(768,1280,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){antiAliasing=1};captureCamera.targetTexture=rt;
  var read=new Texture2D(768,1280,TextureFormat.RGBA32,false,true);var encoded=new Texture2D(768,1280,TextureFormat.RGBA32,false,true);
  var rotations=bones.Select(b=>b.localRotation).ToArray();var ev=new Evidence();
  int frameCount=Mathf.RoundToInt(clip.length*30);
  for(int frame=0;frame<=frameCount;frame++){
   clip.SampleAnimation(gameObject,frame/30f);
   yield return null;yield return null;Inspect(ev);ev.samples++;
   var previous=RenderTexture.active;captureCamera.Render();RenderTexture.active=rt;read.ReadPixels(new Rect(0,0,768,1280),0,0);read.Apply();RenderTexture.active=previous;
   var colors=read.GetPixels32();for(int k=0;k<colors.Length;k++){var c=colors[k];if(c.a==0){colors[k]=new Color32(0,0,0,0);continue;}if(c.a<255){c.r=(byte)Mathf.Clamp(Mathf.RoundToInt(c.r*255f/c.a),0,255);c.g=(byte)Mathf.Clamp(Mathf.RoundToInt(c.g*255f/c.a),0,255);c.b=(byte)Mathf.Clamp(Mathf.RoundToInt(c.b*255f/c.a),0,255);}colors[k]=c;}
   encoded.SetPixels32(colors);encoded.Apply();File.WriteAllBytes($"{output}/frame-{frame:D3}.png",encoded.EncodeToPNG());
   var pose=new Pose{frame=frame,joints=new Joint[bones.Length]};for(int b=0;b<bones.Length;b++){var p=captureCamera.WorldToViewportPoint(bones[b].position);var tip=captureCamera.WorldToViewportPoint(bones[b].TransformPoint(new Vector3(lengths[b],0,0)));pose.joints[b]=new Joint{name=bones[b].name,parent=parents[b],x=p.x*768,y=(1-p.y)*1280,endX=tip.x*768,endY=(1-tip.y)*1280};}ev.poses.Add(pose);
  }
  File.WriteAllText(outputBase+"/validation.json",JsonUtility.ToJson(ev,true));captureCamera.targetTexture=null;rt.Release();Debug.Log($"ILYRA_HEAD_EXPORT_DONE samples={ev.samples} folds={ev.foldedTriangles}");
  UnityEditor.EditorApplication.Exit(ev.foldedTriangles==0?0:1);
 }
 void OnDrawGizmos(){if(bones==null)return;Gizmos.color=new Color(.2f,1,.8f,1);for(int i=0;i<bones.Length;i++){if(bones[i]==null)continue;Gizmos.DrawSphere(bones[i].position,3);if(parents[i]>=0)Gizmos.DrawLine(bones[parents[i]].position,bones[i].position);}}
}

using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
public class PhysicsGesturesExport:MonoBehaviour {
 public AnimationClip[] clips;public Camera captureCamera;public Transform[] bones;public int[] parents;
 [Serializable]public class Joint{public string name;public int parent;public float x,y;}
 [Serializable]public class Pose{public string clip;public float time;public Joint[] joints;}
 [Serializable]public class Evidence{public List<Pose> poses=new();}
 IEnumerator Start(){
  if(!Array.Exists(Environment.GetCommandLineArgs(),x=>x=="-spire-export"))yield break;
  GetComponent<Animator>().enabled=false;captureCamera.enabled=false;Directory.CreateDirectory("Export/PhysicsGestures");
  var rt=new RenderTexture(768,1024,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){antiAliasing=1};captureCamera.targetTexture=rt;
  var readback=new Texture2D(768,1024,TextureFormat.RGBA32,false,true);var encoded=new Texture2D(768,1024,TextureFormat.RGBA32,false,true);var evidence=new Evidence();
  foreach(var clip in clips){
   string folder="Export/PhysicsGestures/"+clip.name.Replace(" ","");Directory.CreateDirectory(folder);int count=Mathf.RoundToInt(clip.length*30);
   for(int i=0;i<=count;i++){
    float t=clip.length*i/count;clip.SampleAnimation(gameObject,t);
    // SpriteSkin runs through its normal update/deformation pipeline before capture.
    yield return null;yield return null;
    var previous=RenderTexture.active;captureCamera.Render();RenderTexture.active=rt;readback.ReadPixels(new Rect(0,0,768,1024),0,0);readback.Apply();RenderTexture.active=previous;
    var colors=readback.GetPixels32();for(int k=0;k<colors.Length;k++){var c=colors[k];if(c.a==0){colors[k]=new Color32(0,0,0,0);continue;}if(c.a<255){c.r=(byte)Mathf.Clamp(Mathf.RoundToInt(c.r*255f/c.a),0,255);c.g=(byte)Mathf.Clamp(Mathf.RoundToInt(c.g*255f/c.a),0,255);c.b=(byte)Mathf.Clamp(Mathf.RoundToInt(c.b*255f/c.a),0,255);}colors[k]=c;}
    encoded.SetPixels32(colors);encoded.Apply();File.WriteAllBytes($"{folder}/frame-{i:D3}.png",encoded.EncodeToPNG());
    {var pose=new Pose{clip=clip.name,time=t,joints=new Joint[bones.Length]};for(int b=0;b<bones.Length;b++){var p=captureCamera.WorldToViewportPoint(bones[b].position);pose.joints[b]=new Joint{name=bones[b].name,parent=parents[b],x=p.x*768,y=(1-p.y)*1024};}evidence.poses.Add(pose);}
   }Debug.Log("EXPORTED "+clip.name+" frames="+(count+1));
  }
  File.WriteAllText("Export/PhysicsGestures/rig-poses.json",JsonUtility.ToJson(evidence,true));captureCamera.targetTexture=null;rt.Release();Debug.Log("MARA_V2_EXPORT_DONE");UnityEditor.EditorApplication.Exit(0);
 }
}







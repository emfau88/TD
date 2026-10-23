using System;
using System.IO;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;
using UnityEngine.Rendering;
public static class InspectPhysicsGestures {
 [Serializable]public class Check {public string clip,minLayer,minPixel;public float minAlpha;public int samples,trianglesChecked,foldedTriangles;public float minAreaRatio=999,maxAreaRatio=0;}
 [Serializable]public class Report {public List<Check> clips=new();}
 static float Area(Vector2 a,Vector2 b,Vector2 c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 
 public static void Run(){
  EditorSceneManager.OpenScene("Assets/PhysicsGestures/PhysicsGestures.unity");var rig=UnityEngine.Object.FindFirstObjectByType<PhysicsGesturesExport>();rig.GetComponent<Animator>().enabled=false;
  var poses=new MaraV2Export.Evidence();var report=new Report();
  foreach(var clip in rig.clips){var check=new Check{clip=clip.name,samples=Mathf.RoundToInt(clip.length*30)+1};
   for(int f=0;f<check.samples;f++){
    float t=f/30f;clip.SampleAnimation(rig.gameObject,t);var pose=new MaraV2Export.Pose{clip=clip.name,time=t,joints=new MaraV2Export.Joint[rig.bones.Length]};
    for(int i=0;i<rig.bones.Length;i++){Vector3 p=rig.captureCamera.WorldToViewportPoint(rig.bones[i].position);pose.joints[i]=new MaraV2Export.Joint{name=rig.bones[i].name,parent=rig.parents[i],x=p.x*768,y=(1-p.y)*1024};}poses.poses.Add(pose);
    foreach(var skin in rig.GetComponentsInChildren<SpriteSkin>()){
     var sprite=skin.GetComponent<SpriteRenderer>().sprite;var verts=sprite.vertices;var indices=sprite.triangles;var weights=sprite.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight);var bind=sprite.GetBindPoses();var deformed=new Vector2[verts.Length];
     for(int i=0;i<verts.Length;i++){var w=weights[i];Vector3 p=verts[i];deformed[i]=(skin.boneTransforms[w.boneIndex0].localToWorldMatrix*bind[w.boneIndex0]).MultiplyPoint3x4(p)*w.weight0+(skin.boneTransforms[w.boneIndex1].localToWorldMatrix*bind[w.boneIndex1]).MultiplyPoint3x4(p)*w.weight1+(skin.boneTransforms[w.boneIndex2].localToWorldMatrix*bind[w.boneIndex2]).MultiplyPoint3x4(p)*w.weight2+(skin.boneTransforms[w.boneIndex3].localToWorldMatrix*bind[w.boneIndex3]).MultiplyPoint3x4(p)*w.weight3;}
     for(int j=0;j<indices.Length;j+=3){int a=indices[j],b=indices[j+1],c=indices[j+2];float before=Area(verts[a],verts[b],verts[c]);if(Mathf.Abs(before)<.0001f)continue;float ratio=Area(deformed[a],deformed[b],deformed[c])/before;check.trianglesChecked++;if(ratio<=0||float.IsNaN(ratio))check.foldedTriangles++;if(ratio<check.minAreaRatio){Vector2 centre=(verts[a]+verts[b]+verts[c])/3+sprite.pivot;check.minLayer=skin.name;check.minPixel=centre.ToString();check.minAlpha=sprite.texture.GetPixel((int)centre.x,(int)centre.y).a;}check.minAreaRatio=Mathf.Min(check.minAreaRatio,ratio);check.maxAreaRatio=Mathf.Max(check.maxAreaRatio,ratio);}
    }
   }report.clips.Add(check);
  }
  File.WriteAllText("../physics-gestures/rig-poses.json",JsonUtility.ToJson(poses,true));File.WriteAllText("../physics-gestures/mesh-audit.json",JsonUtility.ToJson(report,true));
  rig.clips[0].SampleAnimation(rig.gameObject,0);rig.GetComponent<Animator>().enabled=true;
  Selection.activeGameObject=rig.gameObject;SceneView.lastActiveSceneView?.LookAt(new Vector3(0,0,0),Quaternion.identity,560,true);
  Debug.Log("MARA_MESH_AUDIT_DONE");
  if(Application.isBatchMode)EditorApplication.Exit(0);
 }
 
 public static void OpenSkinning(){Selection.activeObject=AssetDatabase.LoadMainAssetAtPath("Assets/Art/Mara.psb");EditorApplication.ExecuteMenuItem("Window/2D/Sprite Editor");}
}









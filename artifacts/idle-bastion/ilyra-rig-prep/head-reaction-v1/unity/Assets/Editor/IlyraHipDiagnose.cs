using System;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.U2D.Sprites;
using UnityEditor.U2D.Animation;
using UnityEngine.U2D.Animation;
using UnityEngine.U2D;
using UnityEngine.Rendering;
using UnityEditor.SceneManagement;

public static class IlyraHipDiagnose {
 public static void Diagnose(){try{
  EditorSceneManager.OpenScene("Assets/IlyraHipLeft.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;rig.clip.SampleAnimation(rig.gameObject,2f);
  var sr=rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<SpriteRenderer>();var sprite=sr.sprite;var vertices=sprite.vertices;var indices=sprite.triangles;var weights=sprite.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight);var binds=sprite.GetBindPoses();
  float Area(Vector2 a,Vector2 b,Vector2 c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  var posed=new Vector2[vertices.Length];for(int i=0;i<vertices.Length;i++){var w=weights[i];Vector3 p=vertices[i];Vector3 At(int b,float f)=>rig.bones[b].localToWorldMatrix.MultiplyPoint3x4(binds[b].MultiplyPoint3x4(p))*f;posed[i]=At(w.boneIndex0,w.weight0)+At(w.boneIndex1,w.weight1)+At(w.boneIndex2,w.weight2)+At(w.boneIndex3,w.weight3);}
  for(int i=0;i<indices.Length;i+=3){int a=indices[i],b=indices[i+1],c=indices[i+2];float ratio=Area(posed[a],posed[b],posed[c])/Area(vertices[a],vertices[b],vertices[c]);if(ratio>0)continue;var p=(vertices[a]+vertices[b]+vertices[c])/3;Debug.Log($"FOLD xy={p.x+384},{640-p.y} ratio={ratio} verts={vertices[a]} {vertices[b]} {vertices[c]}");}
  EditorApplication.Exit(0);
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

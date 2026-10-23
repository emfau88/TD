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

public static class IlyraTouchWeights {
 public static void Diagnose(){try{
  EditorSceneManager.OpenScene("Assets/IlyraTouchReaction.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;rig.clip.SampleAnimation(rig.gameObject,.9f);
  var sr=rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<SpriteRenderer>();var sprite=sr.sprite;var vertices=sprite.vertices;var indices=sprite.triangles;var weights=sprite.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight);var binds=sprite.GetBindPoses();
  float Area(Vector2 a,Vector2 b,Vector2 c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  var posed=new Vector2[vertices.Length];for(int i=0;i<vertices.Length;i++){var w=weights[i];Vector3 p=vertices[i];Vector3 At(int b,float f)=>rig.bones[b].localToWorldMatrix.MultiplyPoint3x4(binds[b].MultiplyPoint3x4(p))*f;posed[i]=At(w.boneIndex0,w.weight0)+At(w.boneIndex1,w.weight1)+At(w.boneIndex2,w.weight2)+At(w.boneIndex3,w.weight3);}
  for(int i=0;i<indices.Length;i+=3){int a=indices[i],b=indices[i+1],c=indices[i+2];float ratio=Area(posed[a],posed[b],posed[c])/Area(vertices[a],vertices[b],vertices[c]);if(ratio>0)continue;var p=(vertices[a]+vertices[b]+vertices[c])/3;Debug.Log($"FOLD xy={p.x+384},{640-p.y} ratio={ratio} verts={vertices[a]} {vertices[b]} {vertices[c]}");}
  EditorApplication.Exit(0);
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 public static void Apply(IlyraHeadExport rig){
  const string source="Assets/Art/TorsoArmsHands.png",path="Assets/Art/TorsoTouchWeights.png";
  if(AssetDatabase.LoadAssetAtPath<Texture2D>(path)==null&&!AssetDatabase.CopyAsset(source,path))throw new Exception("Cannot copy torso for isolated weights");
  var importer=(TextureImporter)AssetImporter.GetAtPath(path);
  var factories=new SpriteDataProviderFactories();factories.Init();
  var provider=factories.GetSpriteEditorDataProviderFromObject(importer);provider.InitSpriteEditorDataProvider();
  var rect=provider.GetSpriteRects()[0];var mesh=provider.GetDataProvider<ISpriteMeshDataProvider>();
  var sourceProvider=factories.GetSpriteEditorDataProviderFromObject(AssetImporter.GetAtPath(source));sourceProvider.InitSpriteEditorDataProvider();
  var sourceMesh=sourceProvider.GetDataProvider<ISpriteMeshDataProvider>();var sourceID=sourceProvider.GetSpriteRects()[0].spriteID;
  var vertices=sourceMesh.GetVertices(sourceID);var indices=sourceMesh.GetIndices(sourceID);var edges=sourceMesh.GetEdges(sourceID);int changed=0;
  for(int i=0;i<vertices.Length;i++){
   var v=vertices[i];float x=v.position.x,y=1280-v.position.y;
   // Below the elbow, the arms are separated from the torso by transparent space.
   // The old sloping torso/arm boundary crossed the inner fingers at these heights.
   if(y<=800)continue;
   float side=x<384?1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(250,370,x)):Mathf.SmoothStep(0,1,Mathf.InverseLerp(398,518,x));
   float blend=Mathf.SmoothStep(0,1,Mathf.InverseLerp(800,950,y))*side;
   float wrist=Mathf.SmoothStep(0,1,Mathf.InverseLerp(970,1030,y));int fore=x<384?5:8;
   var old=v.boneWeight;var weights=new Dictionary<int,float>();
   void Add(int id,float weight){if(weight<=0)return;if(!weights.ContainsKey(id))weights[id]=0;weights[id]+=weight;}
   Add(old.boneIndex0,old.weight0*(1-blend));Add(old.boneIndex1,old.weight1*(1-blend));
   Add(old.boneIndex2,old.weight2*(1-blend));Add(old.boneIndex3,old.weight3*(1-blend));
   Add(fore,blend*(1-wrist));Add(fore+1,blend*wrist);
   var w=weights.OrderByDescending(e=>e.Value).Take(4).ToArray();float sum=w.Sum(e=>e.Value);var bw=new BoneWeight();
   for(int k=0;k<w.Length;k++){float value=w[k].Value/sum;switch(k){case 0:bw.boneIndex0=w[k].Key;bw.weight0=value;break;case 1:bw.boneIndex1=w[k].Key;bw.weight1=value;break;case 2:bw.boneIndex2=w[k].Key;bw.weight2=value;break;case 3:bw.boneIndex3=w[k].Key;bw.weight3=value;break;}}
   v.boneWeight=bw;vertices[i]=v;changed++;
  }
  mesh.SetVertices(rect.spriteID,vertices);mesh.SetIndices(rect.spriteID,indices);mesh.SetEdges(rect.spriteID,edges);provider.Apply();importer.SaveAndReimport();
  var sr=rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<SpriteRenderer>();sr.sprite=AssetDatabase.LoadAssetAtPath<Sprite>(path);
  var skin=sr.GetComponent<SpriteSkin>();skin.SetRootBone(rig.bones[0]);skin.SetBoneTransforms(rig.bones);
  Debug.Log("ILYRA_TOUCH_WEIGHT_FIX vertices="+changed+" sourcePreserved=true");
 }
}

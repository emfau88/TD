using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.U2D.Sprites;
using UnityEngine;
using UnityEngine.U2D.Animation;

public static class RefineGestureNeck {
 static float S(float a,float b,float x)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,x));
 public static void Run(){
  EditorSceneManager.OpenScene("Assets/PhysicsGestures/PhysicsGestures.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<PhysicsGesturesExport>();rig.clips[0].SampleAnimation(rig.gameObject,0);
  const string path="Assets/PhysicsGestures/HeadNeck.png";
  if(AssetDatabase.LoadAssetAtPath<Sprite>(path)==null&&!AssetDatabase.CopyAsset("Assets/Art/Head.png",path))throw new Exception("HeadNeck copy failed");
  var importer=AssetImporter.GetAtPath(path);var factories=new SpriteDataProviderFactories();factories.Init();var provider=factories.GetSpriteEditorDataProviderFromObject(importer);provider.InitSpriteEditorDataProvider();var rect=provider.GetSpriteRects()[0];var mp=provider.GetDataProvider<ISpriteMeshDataProvider>();var original=mp.GetVertices(rect.spriteID);
  float xmin=original.Min(v=>v.position.x),xmax=original.Max(v=>v.position.x),ymin=original.Min(v=>v.position.y),ymax=original.Max(v=>v.position.y);
  var xs=new List<float>{xmin};for(float x=xmin+18;x<xmax;x+=18)xs.Add(x);xs.Add(xmax);
  var ys=new List<float>{ymin};for(float y=ymin+8;y<1024-344;y+=8)ys.Add(y);ys.Add(1024-344);ys.Add(ymax);
  var verts=new List<Vertex2DMetaData>();foreach(float y in ys)foreach(float x in xs){float py=1024-y;
   // Face stays rigid; neck base stays under the scarf. Side mask preserves the earring.
   float side=1-S(58,102,Mathf.Abs(x-390));float w=S(360,440,py)*Mathf.Lerp(side,1,S(395,475,py));
   verts.Add(new Vertex2DMetaData{position=new Vector2(x,y),boneWeight=new BoneWeight{boneIndex0=3,weight0=1-w,boneIndex1=1,weight1=w}});
  }
  var ids=new List<int>();var edges=new HashSet<(int,int)>();for(int y=0;y<ys.Count-1;y++)for(int x=0;x<xs.Count-1;x++){int a=y*xs.Count+x,b=a+1,c=a+xs.Count,d=c+1;ids.AddRange(new[]{a,b,c,b,d,c});foreach(var e in new[]{(a,b),(a,c),(b,c),(b,d),(c,d)})edges.Add(e.Item1<e.Item2?e:(e.Item2,e.Item1));}
  mp.SetVertices(rect.spriteID,verts.ToArray());mp.SetIndices(rect.spriteID,ids.ToArray());mp.SetEdges(rect.spriteID,edges.Select(e=>new Vector2Int(e.Item1,e.Item2)).ToArray());provider.Apply();importer.SaveAndReimport();
  var tr=rig.transform.Find("Visuals/Head");var skin=tr.GetComponent<SpriteSkin>();skin.enabled=false;tr.GetComponent<SpriteRenderer>().sprite=AssetDatabase.LoadAssetAtPath<Sprite>(path);skin.enabled=true;skin.SetRootBone(rig.bones[0]);var result=skin.SetBoneTransforms(rig.bones.Take(22).ToArray());if(result.ToString()!="Ready")throw new Exception("Head skin "+result);
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene());AssetDatabase.SaveAssets();Debug.Log("NECK_BASE_PINNED");EditorApplication.EnterPlaymode();
 }
}

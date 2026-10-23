using System;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.U2D.Sprites;
using UnityEditor.U2D.Animation;
using UnityEngine.U2D.Animation;
public static class IlyraHipHands {
 public static Sprite Torso(int cut){
  string source="Assets/Art/TorsoTouchWeights.png", path="Assets/Art/TorsoHip"+cut+".png";
  if(AssetDatabase.LoadAssetAtPath<Texture2D>(path)==null)AssetDatabase.CopyAsset(source,path);
  var f=new SpriteDataProviderFactories();f.Init();
  var src=f.GetSpriteEditorDataProviderFromObject(AssetImporter.GetAtPath(source));src.InitSpriteEditorDataProvider();
  var dst=f.GetSpriteEditorDataProviderFromObject(AssetImporter.GetAtPath(path));dst.InitSpriteEditorDataProvider();
  var sm=src.GetDataProvider<ISpriteMeshDataProvider>();var dm=dst.GetDataProvider<ISpriteMeshDataProvider>();var sid=src.GetSpriteRects()[0].spriteID;var did=dst.GetSpriteRects()[0].spriteID;
  var sourceVerts=sm.GetVertices(sid);var indices=sm.GetIndices(sid);var verts=new List<Vertex2DMetaData>();var output=new List<int>();
  float Edge(float y){float[] yy={0,540,560,590,610,630,650,670,690,720,800,850,1280};float[] xx={0,0,237,235,234,225,224,237,244,244,230,235,235};for(int j=1;j<yy.Length;j++)if(y<=yy[j])return Mathf.Lerp(xx[j-1],xx[j],Mathf.InverseLerp(yy[j-1],yy[j],y));return 235;}
  BoneWeight Blend(BoneWeight a,BoneWeight b,float t){var w=new Dictionary<int,float>();void Add(BoneWeight v,float q){int[] ids={v.boneIndex0,v.boneIndex1,v.boneIndex2,v.boneIndex3};float[] ww={v.weight0,v.weight1,v.weight2,v.weight3};for(int k=0;k<4;k++){if(!w.ContainsKey(ids[k]))w[ids[k]]=0;w[ids[k]]+=ww[k]*q;}}Add(a,1-t);Add(b,t);var z=w.OrderByDescending(e=>e.Value).Take(4).ToArray();float sum=z.Sum(e=>e.Value);var r=new BoneWeight();for(int k=0;k<z.Length;k++){switch(k){case 0:r.boneIndex0=z[k].Key;r.weight0=z[k].Value/sum;break;case 1:r.boneIndex1=z[k].Key;r.weight1=z[k].Value/sum;break;case 2:r.boneIndex2=z[k].Key;r.weight2=z[k].Value/sum;break;case 3:r.boneIndex3=z[k].Key;r.weight3=z[k].Value/sum;break;}}return r;}
  List<Vertex2DMetaData> Clip(List<Vertex2DMetaData> poly,Func<Vector2,float> d){var r=new List<Vertex2DMetaData>();for(int j=0;j<poly.Count;j++){var a=poly[j];var b=poly[(j+1)%poly.Count];float da=d(a.position),db=d(b.position);if(da>=0)r.Add(a);if((da>=0)!=(db>=0)){float t=da/(da-db);r.Add(new Vertex2DMetaData{position=Vector2.Lerp(a.position,b.position,t),boneWeight=Blend(a.boneWeight,b.boneWeight,t)});}}return r;}
  void Add(List<Vertex2DMetaData> poly,int region){
   if(region>0&&(cut&(1<<(region-1)))!=0)poly=Clip(poly,p=>p.y-280);
   int start=verts.Count;foreach(var v0 in poly){var v=v0;float y=1280-v.position.y;
    if(region>0){int u=region==1?4:7;float shoulder=Mathf.SmoothStep(0,1,Mathf.InverseLerp(550,620,y));float elbow=Mathf.SmoothStep(0,1,Mathf.InverseLerp(720,850,y));float wrist=Mathf.SmoothStep(0,1,Mathf.InverseLerp(1000,1040,y));v.boneWeight=new BoneWeight{boneIndex0=1,weight0=1-shoulder,boneIndex1=u,weight1=shoulder*(1-elbow),boneIndex2=u+1,weight2=shoulder*elbow*(1-wrist),boneIndex3=u+2,weight3=shoulder*elbow*wrist};}
    else {var old=v.boneWeight;float a=old.boneIndex0>=4&&old.boneIndex0<=9?old.weight0:0,b=old.boneIndex1>=4&&old.boneIndex1<=9?old.weight1:0,c=old.boneIndex2>=4&&old.boneIndex2<=9?old.weight2:0,d=old.boneIndex3>=4&&old.boneIndex3<=9?old.weight3:0;float arm=a+b+c+d;if(arm>0){if(y>=740){float waist=Mathf.SmoothStep(0,1,Mathf.InverseLerp(730,850,y));v.boneWeight=new BoneWeight{boneIndex0=1,weight0=1-waist,boneIndex1=0,weight1=waist};}else{if(a>0)old.boneIndex0=1;if(b>0)old.boneIndex1=1;if(c>0)old.boneIndex2=1;if(d>0)old.boneIndex3=1;v.boneWeight=old;}}}
    if(region==0&&y>=540&&y<610){float distance=Mathf.Min(v.position.x,768-v.position.x)-Edge(y);float match=(1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(0,18,distance)))*(1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(575,610,y)));int u=v.position.x<384?4:7;float shoulder=Mathf.SmoothStep(0,1,Mathf.InverseLerp(550,620,y));v.boneWeight=Blend(v.boneWeight,new BoneWeight{boneIndex0=1,weight0=1-shoulder,boneIndex1=u,weight1=shoulder},match);}
    verts.Add(v);
   }
   for(int j=1;j+1<poly.Count;j++){var a=poly[0].position;var b=poly[j].position;var c=poly[j+1].position;if(Mathf.Abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))<.0001f)continue;output.Add(start);output.Add(start+j);output.Add(start+j+1);}
  }
  for(int i=0;i<indices.Length;i+=3){var tri=new List<Vertex2DMetaData>{sourceVerts[indices[i]],sourceVerts[indices[i+1]],sourceVerts[indices[i+2]]};
   Add(Clip(tri,p=>Edge(1280-p.y)-p.x),1);Add(Clip(tri,p=>Edge(1280-p.y)-(768-p.x)),2);
   Add(Clip(Clip(tri,p=>p.x-Edge(1280-p.y)),p=>(768-p.x)-Edge(1280-p.y)),0);
  }
  Debug.Log("HIP_TOPOLOGY_RAW verts="+verts.Count+" triangles="+output.Count/3);
  var unique=new List<Vertex2DMetaData>();var map=new Dictionary<string,int>();var remap=new int[verts.Count];
  for(int k=0;k<verts.Count;k++){var v=verts[k];var w=v.boneWeight;string key=$"{v.position.x:F4},{v.position.y:F4}/{w.boneIndex0}:{w.weight0:F5},{w.boneIndex1}:{w.weight1:F5},{w.boneIndex2}:{w.weight2:F5},{w.boneIndex3}:{w.weight3:F5}";if(!map.TryGetValue(key,out int id)){id=unique.Count;map.Add(key,id);unique.Add(v);}remap[k]=id;}
  output=output.Select(k=>remap[k]).ToList();var edges=new HashSet<(int,int)>();for(int k=0;k<output.Count;k+=3)for(int j=0;j<3;j++){int a=output[k+j],b=output[k+(j+1)%3];edges.Add(a<b?(a,b):(b,a));}
  Debug.Log("HIP_TOPOLOGY_COMPACT verts="+unique.Count+" triangles="+output.Count/3);
  dm.SetVertices(did,unique.ToArray());dm.SetIndices(did,output.ToArray());dm.SetEdges(did,edges.Select(e=>new Vector2Int(e.Item1,e.Item2)).ToArray());dst.Apply();((TextureImporter)AssetImporter.GetAtPath(path)).SaveAndReimport();return AssetDatabase.LoadAssetAtPath<Sprite>(path);
 }
 public static void Attach(IlyraHeadExport rig,AnimationClip clip,int cut,Sprite full){
  var ti=(TextureImporter)AssetImporter.GetAtPath("Assets/Art/HipHand.png");ti.textureType=TextureImporterType.Sprite;ti.spriteImportMode=SpriteImportMode.Single;ti.spritePixelsPerUnit=1;ti.alphaIsTransparency=true;ti.mipmapEnabled=false;ti.filterMode=FilterMode.Bilinear;ti.textureCompression=TextureImporterCompression.Uncompressed;ti.maxTextureSize=2048;var settings=new TextureImporterSettings();ti.ReadTextureSettings(settings);settings.spriteAlignment=(int)SpriteAlignment.Custom;settings.spritePivot=new Vector2(400f/1312,1-380f/1199);ti.SetTextureSettings(settings);ti.SaveAndReimport();
  // Trim the unused wrist extension as sprite geometry, retaining the source PNG.
  var hf=new SpriteDataProviderFactories();hf.Init();var hp=hf.GetSpriteEditorDataProviderFromObject(ti);hp.InitSpriteEditorDataProvider();var hm=hp.GetDataProvider<ISpriteMeshDataProvider>();var hid=hp.GetSpriteRects()[0].spriteID;
  var polygon=new List<Vector2>{new(0,0),new(1312,0),new(1312,1199),new(0,1199)};var clipped=new List<Vector2>();float D(Vector2 p)=>.65f*(p.x-400)+.76f*((1199-p.y)-380)+30;
  for(int k=0;k<polygon.Count;k++){var a=polygon[k];var b=polygon[(k+1)%polygon.Count];float da=D(a),db=D(b);if(da>=0)clipped.Add(a);if((da>=0)!=(db>=0))clipped.Add(Vector2.Lerp(a,b,da/(da-db)));}
  hm.SetVertices(hid,clipped.Select(p=>new Vertex2DMetaData{position=p,boneWeight=new BoneWeight{weight0=1}}).ToArray());var ids=new List<int>();for(int k=1;k+1<clipped.Count;k++)ids.AddRange(new[]{0,k,k+1});hm.SetIndices(hid,ids.ToArray());hm.SetEdges(hid,Enumerable.Range(0,clipped.Count).Select(k=>new Vector2Int(k,(k+1)%clipped.Count)).ToArray());hp.Apply();ti.SaveAndReimport();
  clip.SampleAnimation(rig.gameObject,1.8f);
  var torso=rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<SpriteRenderer>();
  for(int side=0;side<2;side++){if((cut&(1<<side))==0)continue;var go=new GameObject(side==0?"HipHandImageLeft":"HipHandImageRight");go.transform.SetParent(rig.bones[side==0?6:9],false);go.transform.position=go.transform.parent.position;go.transform.rotation=Quaternion.Euler(0,0,side==0?-25f:25f);var scale=go.transform.lossyScale;go.transform.localScale=new Vector3(.145f/scale.x,.145f/scale.y,1);var sr=go.AddComponent<SpriteRenderer>();sr.sprite=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/HipHand.png");sr.flipX=side==1;sr.sortingOrder=torso.sortingOrder-1;sr.sharedMaterial=torso.sharedMaterial;
   var keys=new[]{new Keyframe(0,0),new Keyframe(.8f,1),new Keyframe(3.7f,0),new Keyframe(5,0)};var c=new AnimationCurve(keys);for(int i=0;i<c.length;i++){AnimationUtility.SetKeyLeftTangentMode(c,i,AnimationUtility.TangentMode.Constant);AnimationUtility.SetKeyRightTangentMode(c,i,AnimationUtility.TangentMode.Constant);}AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(go.transform,rig.transform),typeof(SpriteRenderer),"m_Enabled"),c);
  }
  var cutSprite=Torso(cut);AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/TorsoArmsHands",typeof(SpriteRenderer),"m_Sprite"),new[]{new ObjectReferenceKeyframe{time=0,value=full},new ObjectReferenceKeyframe{time=.8f,value=cutSprite},new ObjectReferenceKeyframe{time=3.7f,value=full},new ObjectReferenceKeyframe{time=5,value=full}});
 }
}

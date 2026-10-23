using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;
using UnityEngine.Rendering;
using Unity.Collections;
using UnityEditor;
using UnityEditor.SceneManagement;

// Isolated elbow study. Original textures, scenes and clips are read-only inputs.
public static class BuildIlyraArmBend {
 const string Folder="Assets/ArmBendStudy";
 static void Diagnose(IlyraHeadExport rig,AnimationClip clip){
  float Area(Vector2 a,Vector2 b,Vector2 c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  foreach(int degrees in new[]{30,60,90}){clip.SampleAnimation(rig.gameObject,degrees/30f);int total=0;
   foreach(var skin in rig.GetComponentsInChildren<SpriteSkin>()){var sp=skin.GetComponent<SpriteRenderer>().sprite;var v=sp.vertices;var uv=sp.uv;var ids=sp.triangles;var w=sp.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight);var bind=sp.GetBindPoses();var posed=new Vector2[v.Length];
    for(int i=0;i<v.Length;i++){var bw=w[i];Vector3 B(int n,float f)=>rig.bones[n].localToWorldMatrix.MultiplyPoint3x4(bind[n].MultiplyPoint3x4(v[i]))*f;posed[i]=B(bw.boneIndex0,bw.weight0)+B(bw.boneIndex1,bw.weight1)+B(bw.boneIndex2,bw.weight2)+B(bw.boneIndex3,bw.weight3);}
    for(int j=0;j<ids.Length;j+=3){int a=ids[j],b=ids[j+1],c=ids[j+2];float original=Area(v[a],v[b],v[c]);if(Mathf.Abs(original)<.0001f)continue;float ratio=Area(posed[a],posed[b],posed[c])/original;if(ratio>0)continue;total++;var tex=(uv[a]+uv[b]+uv[c])/3;var pos=(v[a]+v[b]+v[c])/3;if(total<=8)Debug.Log($"ARM_FOLD degrees={degrees} layer={skin.name} restXY={pos.x+384},{640-pos.y} sourceXY={tex.x*768},{(1-tex.y)*1280} ratio={ratio}");}
   }Debug.Log($"ARM_FOLD_TOTAL degrees={degrees} count={total}");
  }clip.SampleAnimation(rig.gameObject,0);
 }
 static BoneWeight Mix(int a,int b,float t)=>new BoneWeight{boneIndex0=a,weight0=1-t,boneIndex1=b,weight1=t};
 static float S(float a,float b,float v)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,v));
 static Sprite Rebind(IlyraHeadExport rig,SpriteRenderer sr){
  var src=sr.sprite;var v=src.vertices;var uv=src.uv;var ids=src.triangles;var old=src.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight).ToArray();var bind=src.GetBindPoses().ToArray();
  Vector3 At(Vector3 p,BoneWeight w){Vector3 B(int n,float f)=>rig.bones[n].localToWorldMatrix.MultiplyPoint3x4(bind[n].MultiplyPoint3x4(p))*f;return B(w.boneIndex0,w.weight0)+B(w.boneIndex1,w.weight1)+B(w.boneIndex2,w.weight2)+B(w.boneIndex3,w.weight3);}
  var rest=v.Select((p,i)=>(Vector2)sr.transform.InverseTransformPoint(At(p,old[i]))).ToList();
  var tex=uv.ToList();var arm=old.Select(w=>(w.boneIndex0>=4&&w.boneIndex0<=6?w.weight0:0)+(w.boneIndex1>=4&&w.boneIndex1<=6?w.weight1:0)+(w.boneIndex2>=4&&w.boneIndex2<=6?w.weight2:0)+(w.boneIndex3>=4&&w.boneIndex3<=6?w.weight3:0)).ToList();
  var weights=old.ToList();
  // Correct pivot toward the elbow visible in the source; texture remains unchanged.
  float ew=S(720,850,770);Vector3 elbow=At(new Vector3(176-384,640-770,0),Mix(4,5,ew));
  Vector3 hand=rig.bones[6].position;var rotations=new[]{rig.bones[4].rotation,rig.bones[5].rotation,rig.bones[6].rotation};
  var positions=new[]{rig.bones[4].position,elbow,hand};
  for(int k=0;k<3;k++){var bone=rig.bones[4+k];bone.localScale=Vector3.one;bone.position=positions[k];bone.rotation=rotations[k];}
  var helper=new GameObject("ElbowShapeImageLeft").transform;helper.SetParent(rig.bones[4],true);helper.position=elbow;helper.rotation=rig.bones[5].rotation;
  rig.bones=rig.bones.Concat(new[]{helper}).ToArray();rig.parents=rig.parents.Concat(new[]{4}).ToArray();rig.lengths=rig.lengths.Concat(new[]{24f}).ToArray();
  rig.lengths[4]=Vector3.Distance(rig.bones[4].position,elbow);rig.lengths[5]=Vector3.Distance(elbow,hand);
  // Refine only the joint neighborhood. UVs are interpolated, never regenerated.
  var tris=new List<int>();var mid=new Dictionary<(int,int),int>();
  int Mid(int a,int b){var key=a<b?(a,b):(b,a);if(mid.TryGetValue(key,out int found))return found;int i=rest.Count;mid[key]=i;rest.Add((rest[a]+rest[b])*.5f);tex.Add((tex[a]+tex[b])*.5f);arm.Add((arm[a]+arm[b])*.5f);weights.Add(weights[a]);return i;}
  Vector2 center=sr.transform.InverseTransformPoint(elbow);
  for(int j=0;j<ids.Length;j+=3){int a=ids[j],b=ids[j+1],c=ids[j+2];bool near=new[]{a,b,c}.Any(i=>arm[i]>.99f&&Vector2.Distance(rest[i],center)<100);
   if(near){int ab=Mid(a,b),bc=Mid(b,c),ca=Mid(c,a);tris.AddRange(new[]{a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca});}else tris.AddRange(new[]{a,b,c});
  }
  Vector2 axis=sr.transform.InverseTransformVector((hand-elbow).normalized);axis.Normalize();Vector2 inward=new(-axis.y,axis.x);
  for(int i=0;i<rest.Count;i++)if(arm[i]>.99f){Vector2 delta=rest[i]-center;float along=Vector2.Dot(delta,axis),cross=Vector2.Dot(delta,inward);
   // A steep smoothstep squeezes the inner surface through itself at high angles.
   // Distribute the change linearly across the joint; helper preserves its volume.
   if(along>-125&&along<110){float width=Mathf.Lerp(45,55,Mathf.InverseLerp(-25,25,cross));weights[i]=along<0?Mix(4,28,Mathf.InverseLerp(-width,0,along)):Mix(28,5,Mathf.InverseLerp(0,width,along));}
  }
  var sprite=Sprite.Create(src.texture,src.rect,src.pivot/src.rect.size,src.pixelsPerUnit,0,SpriteMeshType.FullRect);sprite.name="TorsoArmBendRebound";
  sprite.SetVertexCount(rest.Count);
  using(var a=new NativeArray<Vector3>(rest.Select(p=>(Vector3)p).ToArray(),Allocator.Temp))sprite.SetVertexAttribute(VertexAttribute.Position,a);
  using(var a=new NativeArray<ushort>(tris.Select(i=>(ushort)i).ToArray(),Allocator.Temp))sprite.SetIndices(a);
  using(var a=new NativeArray<Vector2>(tex.ToArray(),Allocator.Temp))sprite.SetVertexAttribute(VertexAttribute.TexCoord0,a);
  using(var a=new NativeArray<BoneWeight>(weights.ToArray(),Allocator.Temp))sprite.SetVertexAttribute(VertexAttribute.BlendWeight,a);
  var matrices=rig.bones.Select(b=>b.worldToLocalMatrix*sr.transform.localToWorldMatrix).ToArray();
  using(var a=new NativeArray<Matrix4x4>(matrices,Allocator.Temp))sprite.SetBindPoses(a);
  var bones=new SpriteBone[rig.bones.Length];for(int i=0;i<bones.Length;i++)bones[i]=new SpriteBone{name=rig.bones[i].name,parentId=rig.parents[i],position=rig.bones[i].localPosition,rotation=rig.bones[i].localRotation,length=rig.lengths[i],guid=Hash128.Compute("IlyraArmStudy/"+i).ToString()};sprite.SetBones(bones);
  // The forearm can cross the belt. Render its triangles in front of the torso,
  // keeping precisely the same vertices, weights, bind poses and UVs at the seam.
  var frontIndices=new List<ushort>();var backIndices=new List<ushort>();
  for(int j=0;j<tris.Count;j+=3){var target=arm[tris[j]]>.99f&&arm[tris[j+1]]>.99f&&arm[tris[j+2]]>.99f?frontIndices:backIndices;target.Add((ushort)tris[j]);target.Add((ushort)tris[j+1]);target.Add((ushort)tris[j+2]);}
  var front=UnityEngine.Object.Instantiate(sprite);front.name="ArmImageLeftFront";
  using(var a=new NativeArray<ushort>(frontIndices.ToArray(),Allocator.Temp))front.SetIndices(a);
  using(var a=new NativeArray<ushort>(backIndices.ToArray(),Allocator.Temp))sprite.SetIndices(a);
  Sprite SaveSprite(Sprite item,string path){var existing=AssetDatabase.LoadAssetAtPath<Sprite>(path);if(existing==null)AssetDatabase.CreateAsset(item,path);else{EditorUtility.CopySerialized(item,existing);item=existing;EditorUtility.SetDirty(item);}return item;}
  sprite=SaveSprite(sprite,Folder+"/TorsoRebound.asset");front=SaveSprite(front,Folder+"/ArmFront.asset");
  var go=new GameObject("ArmImageLeftFront");go.transform.SetParent(sr.transform.parent,false);go.transform.localPosition=sr.transform.localPosition;go.transform.localRotation=sr.transform.localRotation;go.transform.localScale=sr.transform.localScale;
  var frontRenderer=go.AddComponent<SpriteRenderer>();frontRenderer.sprite=front;frontRenderer.sharedMaterial=sr.sharedMaterial;frontRenderer.sortingLayerID=sr.sortingLayerID;frontRenderer.sortingOrder=sr.sortingOrder+1;
  var frontSkin=go.AddComponent<SpriteSkin>();frontSkin.SetRootBone(rig.bones[0]);frontSkin.SetBoneTransforms(rig.bones);
  Debug.Log($"ARM_REBOUND vertices={rest.Count} triangles={tris.Count/3} elbow={elbow} wrist={hand} neutral proportions baked, arm scales=1");return sprite;
 }
 public static void Run(){try{
  var args=Environment.GetCommandLineArgs();bool baseline=args.Contains("-arm-baseline");string name=baseline?"before":"after";
  Directory.CreateDirectory("../../arm-bend-v1/preview/"+name);Directory.CreateDirectory(Folder);AssetDatabase.Refresh();
  EditorSceneManager.OpenScene("Assets/IlyraTouchReaction.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;
  AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim").SampleAnimation(rig.gameObject,0);rig.GetComponent<IlyraSecondaryMotion>().simulate=false;
  var sr=rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<SpriteRenderer>();sr.sprite=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/TorsoHip0.png");
  if(!baseline)sr.sprite=Rebind(rig,sr);
  var skin=sr.GetComponent<SpriteSkin>();skin.SetRootBone(rig.bones[0]);skin.SetBoneTransforms(rig.bones);
  var clip=new AnimationClip{name="IlyraArmBend"+name,frameRate=30};
  foreach(int b in baseline?new[]{5}:new[]{5,28}){float rest=rig.bones[b].localEulerAngles.z,range=b==28?45:90;var curve=new AnimationCurve(new Keyframe(0,rest,range/3,range/3),new Keyframe(3,rest+range,range/3,range/3));AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(rig.bones[b],rig.transform),typeof(Transform),"localEulerAnglesRaw.z"),curve);}
  string cp=Folder+"/Bend-"+name+".anim";var existing=AssetDatabase.LoadAssetAtPath<AnimationClip>(cp);if(existing==null)AssetDatabase.CreateAsset(clip,cp);else{EditorUtility.CopySerialized(clip,existing);clip=existing;EditorUtility.SetDirty(clip);}
  rig.clip=clip;rig.outputBase="../../arm-bend-v1/preview/"+name;
  Diagnose(rig,clip);
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"/Arm-"+name+".unity");PrefabUtility.SaveAsPrefabAsset(rig.gameObject,Folder+"/Arm-"+name+".prefab");AssetDatabase.SaveAssets();EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

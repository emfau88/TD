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

// I03-only additive contour correction. Source artwork and original motion curves stay intact.
public static class BuildIlyraTouchElbow {
 const string Folder = "Assets/ElbowCorrection";
 const float Inset = 11f;
 static float Smooth(float a,float b,float x) => Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,x));
 static float Influence(Vector2 pixel) => Smooth(695,748,pixel.y)*(1-Smooth(803,875,pixel.y))*(1-Smooth(153,198,pixel.x));
 static BoneWeight Weights(Dictionary<int,float> values) {
  var items=values.Where(p=>p.Value>0).OrderByDescending(p=>p.Value).ToArray();
  if(items.Length>4)throw new Exception("Correction exceeded four skin influences");
  var w=new BoneWeight();
  for(int i=0;i<items.Length;i++)switch(i){
   case 0:w.boneIndex0=items[i].Key;w.weight0=items[i].Value;break;
   case 1:w.boneIndex1=items[i].Key;w.weight1=items[i].Value;break;
   case 2:w.boneIndex2=items[i].Key;w.weight2=items[i].Value;break;
   case 3:w.boneIndex3=items[i].Key;w.weight3=items[i].Value;break;
  }
  return w;
 }
 [Serializable] class Report {public int verticesChanged,totalVertices;public float maximumInsetPixels=Inset;public string method="Two additive contour bones, limited to outer image-left elbow; original clip curves and artwork preserved";}
 public static void Run(){try{
  Directory.CreateDirectory(Folder);AssetDatabase.Refresh();
  EditorSceneManager.OpenScene("Assets/TavernTest.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();
  rig.captureCamera.aspect=768f/1280f;
  rig.GetComponent<Animator>().enabled=false;rig.GetComponent<IlyraSecondaryMotion>().simulate=false;
  var original=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraTouchReaction.anim");
  original.SampleAnimation(rig.gameObject,0);
  float restAngle=rig.bones[5].localEulerAngles.z;
  var sr=rig.transform.Find("Visuals/TorsoArmsHands").GetComponent<SpriteRenderer>();
  var source=sr.sprite;var vertices=source.vertices;var old=source.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight).ToArray();
  var bind=source.GetBindPoses().ToArray();var weights=(BoneWeight[])old.Clone();
  int first=rig.bones.Length;
  var helpers=new Transform[2];var directions=new Vector3[2];
  for(int k=0;k<2;k++){
   int parent=4+k;helpers[k]=new GameObject("TouchElbowContour"+(k==0?"Upper":"Lower")).transform;
   helpers[k].SetParent(rig.bones[parent],false);
   directions[k]=rig.bones[parent].InverseTransformVector(Vector3.right*Inset);
  }
  int changed=0;
  for(int i=0;i<vertices.Length;i++){
   var w=old[i];int[] ids={w.boneIndex0,w.boneIndex1,w.boneIndex2,w.boneIndex3};float[] values={w.weight0,w.weight1,w.weight2,w.weight3};
   if(Enumerable.Range(0,4).Any(k=>values[k]>0&&ids[k]!=4&&ids[k]!=5))continue;
   Vector3 posed=Vector3.zero;
   for(int k=0;k<4;k++)if(values[k]>0)posed+=rig.bones[ids[k]].localToWorldMatrix.MultiplyPoint3x4(bind[ids[k]].MultiplyPoint3x4(vertices[i]))*values[k];
   var viewport=rig.captureCamera.WorldToViewportPoint(posed);
   float amount=Influence(new Vector2(viewport.x*768,(1-viewport.y)*1280));
   if(amount<=0)continue;
   var adjusted=new Dictionary<int,float>();
   void Add(int id,float v){if(v<=0)return;adjusted[id]=adjusted.TryGetValue(id,out float previous)?previous+v:v;}
   for(int k=0;k<4;k++)if(values[k]>0){Add(ids[k],values[k]*(1-amount));Add(first+ids[k]-4,values[k]*amount);}
   weights[i]=Weights(adjusted);changed++;
  }
  if(changed==0)throw new Exception("No elbow vertices selected");
  rig.bones=rig.bones.Concat(helpers).ToArray();rig.parents=rig.parents.Concat(new[]{4,5}).ToArray();rig.lengths=rig.lengths.Concat(new[]{12f,12f}).ToArray();
  var corrected=UnityEngine.Object.Instantiate(source);corrected.name="TorsoTouchElbowCorrected";
  using(var a=new NativeArray<BoneWeight>(weights,Allocator.Temp))corrected.SetVertexAttribute(VertexAttribute.BlendWeight,a);
  using(var a=new NativeArray<Matrix4x4>(bind.Concat(new[]{bind[4],bind[5]}).ToArray(),Allocator.Temp))corrected.SetBindPoses(a);
  var spriteBones=source.GetBones().ToList();
  for(int k=0;k<2;k++)spriteBones.Add(new SpriteBone{name=helpers[k].name,parentId=4+k,position=Vector3.zero,rotation=Quaternion.identity,length=12,guid=Hash128.Compute("IlyraTouchElbow/"+k).ToString()});
  corrected.SetBones(spriteBones.ToArray());
  AssetDatabase.CreateAsset(corrected,Folder+"/TorsoTouchElbow.asset");
  sr.sprite=corrected;var skin=sr.GetComponent<SpriteSkin>();skin.SetRootBone(rig.bones[0]);skin.SetBoneTransforms(rig.bones);
  var clip=UnityEngine.Object.Instantiate(original);clip.name="IlyraTouchElbowCorrected";
  for(int k=0;k<2;k++)foreach(string axis in new[]{"x","y"}){
   var keys=new Keyframe[97];
   for(int frame=0;frame<=96;frame++){
    float t=frame/30f;original.SampleAnimation(rig.gameObject,t);
    float amount=Mathf.Clamp01(Mathf.DeltaAngle(restAngle,rig.bones[5].localEulerAngles.z)/22f);
    keys[frame]=new Keyframe(t,(axis=="x"?directions[k].x:directions[k].y)*amount);
   }
   var curve=new AnimationCurve(keys);
   for(int frame=0;frame<keys.Length;frame++){AnimationUtility.SetKeyLeftTangentMode(curve,frame,AnimationUtility.TangentMode.ClampedAuto);AnimationUtility.SetKeyRightTangentMode(curve,frame,AnimationUtility.TangentMode.ClampedAuto);}
   AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(AnimationUtility.CalculateTransformPath(helpers[k],rig.transform),typeof(Transform),"m_LocalPosition."+axis),curve);
  }
  AssetDatabase.CreateAsset(clip,Folder+"/IlyraTouchElbow.anim");clip.SampleAnimation(rig.gameObject,0);
  rig.testClips=new[]{clip};rig.testNames=new[]{"after"};rig.clip=clip;rig.outputBase=Path.GetFullPath("../export");
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"/IlyraTouchElbow.unity");
  PrefabUtility.SaveAsPrefabAsset(rig.gameObject,Folder+"/IlyraTouchElbow.prefab");AssetDatabase.SaveAssets();
  Directory.CreateDirectory("../export");File.WriteAllText("../export/correction.json",JsonUtility.ToJson(new Report{verticesChanged=changed,totalVertices=vertices.Length},true));
  Debug.Log($"ILYRA_ELBOW_CORRECTION vertices={changed}/{vertices.Length} inset={Inset} originalMotionPreserved=true");
  EditorApplication.EnterPlaymode();
 }catch(Exception error){Debug.LogException(error);EditorApplication.Exit(1);}}
}

using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Animations;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.Rendering;
using Unity.Collections;

public static class BuildProportionExtra {
 const string Root="Assets/ProportionExtras";
 public static void ExportSaved(){try{
  var args=Environment.GetCommandLineArgs();int arg=Array.IndexOf(args,"-spire-clip");if(arg<0)throw new Exception("Missing -spire-clip");
  EditorSceneManager.OpenScene(Root+"/"+args[arg+1]+"/Comparison.unity");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 static Sprite PhysicsTorso(Sprite source){
  string path=Root+"/TorsoSpringProportions.asset";
  var existing=AssetDatabase.LoadAssetAtPath<Sprite>(path);if(existing!=null)return existing;
  var original=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Art/Torso.png");
  var approved=AssetDatabase.LoadAssetAtPath<Sprite>("Assets/ProportionsNative/Torso.asset");
  var a=original.vertices;var b=approved.vertices;var ids=original.triangles;var input=source.vertices;
  if(a.Length!=b.Length)throw new Exception("Approved reference mesh differs.");
  var sprite=Sprite.Create(source.texture,source.rect,new Vector2(source.pivot.x/source.rect.width,source.pivot.y/source.rect.height),source.pixelsPerUnit,0,SpriteMeshType.FullRect);
  sprite.name="TorsoSpringM01Proportions";sprite.SetVertexCount(input.Length);
  using(var uv=new NativeArray<Vector2>(source.GetVertexAttribute<Vector2>(VertexAttribute.TexCoord0).ToArray(),Allocator.Temp))sprite.SetVertexAttribute(VertexAttribute.TexCoord0,uv);
  using(var weights=new NativeArray<BoneWeight>(source.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight).ToArray(),Allocator.Temp))sprite.SetVertexAttribute(VertexAttribute.BlendWeight,weights);
  using(var indices=new NativeArray<ushort>(source.triangles,Allocator.Temp))sprite.SetIndices(indices);
  using(var bind=new NativeArray<Matrix4x4>(source.GetBindPoses().ToArray(),Allocator.Temp))sprite.SetBindPoses(bind);
  sprite.SetBones(source.GetBones());int vertices=0,midpoints=0;
  var positions=new NativeArray<Vector3>(input.Length,Allocator.Temp);try{
   for(int i=0;i<input.Length;i++){
    bool found=false;
    for(int j=0;j<a.Length;j++)if((input[i]-a[j]).sqrMagnitude<.000001f){positions[i]=b[j];found=true;vertices++;break;}
    if(!found)for(int j=0;j<ids.Length&&!found;j+=3)for(int e=0;e<3;e++){
     int p=ids[j+e],q=ids[j+(e+1)%3];
     if((input[i]-(a[p]+a[q])*.5f).sqrMagnitude<.000001f){positions[i]=(b[p]+b[q])*.5f;found=true;midpoints++;break;}
    }
    if(!found)throw new Exception("Unmapped physics vertex "+i+" at "+input[i]);
   }
   sprite.SetVertexAttribute(VertexAttribute.Position,positions);
  }finally{positions.Dispose();}
  AssetDatabase.CreateAsset(sprite,path);Debug.Log($"M01_PHYSICS_TRANSFER vertices={vertices} edgeMidpoints={midpoints}; UV/weights/bones/indices preserved");return sprite;
 }
 public static void Run(){try{
  var args=Environment.GetCommandLineArgs();int arg=Array.IndexOf(args,"-spire-clip");if(arg<0)throw new Exception("Missing -spire-clip");string key=args[arg+1];
  string clipPath=key switch {
   "glance"=>"Assets/Clips/IdleBlickkontakt.anim","tease"=>"Assets/Clips/ReactionNeckenBody.anim",
   "joy"=>"Assets/ChestPhysics/SpringPoseWithPhysicsTuned.anim","hip"=>"Assets/PhysicsGestures/HandOnHipPhysics.anim",
   "giggle"=>"Assets/PhysicsGestures/GigglePhysics.anim",_=>throw new Exception("Unknown clip "+key)};
  string folder=Root+"/"+key;if(Directory.Exists(folder))throw new Exception("Existing result retained: "+folder);
  bool physics=key=="joy"||key=="hip"||key=="giggle";
  EditorSceneManager.OpenScene(!physics?"Assets/ProportionsNative/MaraIdleComparison.unity":key=="joy"?"Assets/ChestPhysics/ChestPhysicsTuned.unity":"Assets/PhysicsGestures/PhysicsGestures.unity");
  MonoBehaviour source;Camera camera;Transform[] bones;Sprite[] originals=null;
  if(!physics){var s=UnityEngine.Object.FindFirstObjectByType<ProportionIdleExport>();source=s;camera=s.captureCamera;bones=s.bones;originals=s.originals;}
  else if(key=="joy"){var s=UnityEngine.Object.FindFirstObjectByType<ChestPhysicsExport>();source=s;camera=s.captureCamera;bones=s.bones;}
  else {var s=UnityEngine.Object.FindFirstObjectByType<PhysicsGesturesExport>();source=s;camera=s.captureCamera;bones=s.bones;}
  var animator=source.GetComponent<Animator>();animator.enabled=false;
  foreach(var spring in source.GetComponentsInChildren<MaraChestSpring>())spring.simulate=false;
  var clip=AssetDatabase.LoadAssetAtPath<AnimationClip>(clipPath);if(clip==null)throw new Exception("Missing clip");clip.SampleAnimation(source.gameObject,0);
  Directory.CreateDirectory(folder);AssetDatabase.Refresh();
  var export=source.gameObject.AddComponent<ProportionReactionExport>();export.captureCamera=camera;export.bones=bones;export.clips=new[]{clip};export.keys=new[]{key};export.auditFile="mesh-audit-"+key+".json";
  string[] names={"Torso","ForearmL","ForearmR","HandL","HandR"};export.renderers=new SpriteRenderer[5];export.originals=new Sprite[5];export.revised=new Sprite[5];
  for(int i=0;i<5;i++){
   var r=source.transform.Find("Visuals/"+names[i]).GetComponent<SpriteRenderer>();export.renderers[i]=r;
   export.originals[i]=originals==null?r.sprite:originals[i];
   export.revised[i]=physics&&i==0?PhysicsTorso(r.sprite):AssetDatabase.LoadAssetAtPath<Sprite>("Assets/ProportionsNative/"+names[i]+".asset");
   r.sprite=export.revised[i];
  }
  UnityEngine.Object.DestroyImmediate(source);
  animator.runtimeAnimatorController=AnimatorController.CreateAnimatorControllerAtPathWithClip(folder+"/Playback.controller",clip);animator.enabled=true;
  if(PrefabUtility.SaveAsPrefabAsset(export.gameObject,folder+"/Mara.prefab")==null)throw new Exception("Prefab save failed");
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),folder+"/Comparison.unity");AssetDatabase.SaveAssets();
  Debug.Log("PROPORTION_EXTRA_READY "+key);EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

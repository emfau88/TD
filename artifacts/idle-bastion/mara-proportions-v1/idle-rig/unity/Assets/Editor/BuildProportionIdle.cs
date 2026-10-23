using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Animations;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;
using UnityEngine.Rendering;
using Unity.Collections;

public static class BuildProportionIdle {
 public static void FinishPlayback(){
  EditorSceneManager.OpenScene("Assets/ProportionsNative/MaraIdleComparison.unity");
  var rig=UnityEngine.Object.FindAnyObjectByType<ProportionIdleExport>();
  var controller=AnimatorController.CreateAnimatorControllerAtPathWithClip("Assets/ProportionsNative/IdleOrganic.controller",rig.clip);
  var animator=rig.GetComponent<Animator>();animator.runtimeAnimatorController=controller;animator.enabled=true;
  PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/ProportionsNative/MaraProportions.prefab");
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene());AssetDatabase.SaveAssets();
  Debug.Log("PROPORTION_PLAYBACK_READY");EditorApplication.Exit(0);
 }
 static float S(float a,float b,float v)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,v));
 // A shared map across both wrist sprites preserves their existing painted overlap.
 static Vector2 Lower(Vector2 p,bool left){
  float centre=Mathf.Lerp(left?196:575,left?218:556,Mathf.InverseLerp(613,761,p.y));
  float width=1+.08f*S(610,656,p.y)+.14f*S(720,774,p.y);
  float stretch=.20f*Mathf.Max(0,p.y-761)*S(751,779,p.y);
  return new Vector2(centre+(p.x-centre)*width,p.y+stretch);
 }
 static Vector2 Upper(Vector2 p){
  bool left=p.x<384;
  var shoulder=new Vector2(left?251:518,435);var elbow=new Vector2(left?196:575,613);
  var axis=(elbow-shoulder).normalized;var normal=new Vector2(-axis.y,axis.x);
  float along=Vector2.Dot(p-shoulder,axis),across=Vector2.Dot(p-shoulder,normal);
  float armSide=left?1-S(270,310,p.x):S(458,498,p.x);
  float amount=.12f*S(398,465,p.y)*(1-S(550,614,p.y))*armSide;
  if(amount==0)return p;
  return shoulder+axis*along+normal*(across*(1-amount));
 }
 static Sprite Changed(Sprite original,string name){
  // An imported Sprite clone keeps its import key and can reload original geometry.
  // A fresh native Sprite owns its mesh while referencing the same unchanged texture.
  var sprite=Sprite.Create(original.texture,original.rect,new Vector2(original.pivot.x/original.rect.width,original.pivot.y/original.rect.height),original.pixelsPerUnit,0,SpriteMeshType.FullRect);
  sprite.name=name+"Proportions";
  var old=original.GetVertexAttribute<Vector3>(VertexAttribute.Position).ToArray();
  sprite.SetVertexCount(old.Length);
  var uv=new NativeArray<Vector2>(original.GetVertexAttribute<Vector2>(VertexAttribute.TexCoord0).ToArray(),Allocator.Temp);
  var weights=new NativeArray<BoneWeight>(original.GetVertexAttribute<BoneWeight>(VertexAttribute.BlendWeight).ToArray(),Allocator.Temp);
  var indices=new NativeArray<ushort>(original.triangles,Allocator.Temp);
  var bind=new NativeArray<Matrix4x4>(original.GetBindPoses().ToArray(),Allocator.Temp);
  sprite.SetVertexAttribute(VertexAttribute.TexCoord0,uv);sprite.SetVertexAttribute(VertexAttribute.BlendWeight,weights);sprite.SetIndices(indices);sprite.SetBindPoses(bind);sprite.SetBones(original.GetBones());
  uv.Dispose();weights.Dispose();indices.Dispose();bind.Dispose();
  var positions=new NativeArray<Vector3>(old.Length,Allocator.Temp);
  try{
   for(int i=0;i<old.Length;i++){
    var v=old[i];var p=new Vector2(v.x+sprite.pivot.x,1024-v.y-sprite.pivot.y);
    var target=name=="Torso"?Upper(p):Lower(p,name.EndsWith("L"));
    positions[i]=target==p?v:new Vector3(target.x-sprite.pivot.x,1024-target.y-sprite.pivot.y,v.z);
   }
   // Write positions only: UVs, weights, shared triangle indices and bind poses stay intact.
   sprite.SetVertexAttribute(VertexAttribute.Position,positions);
  }finally{positions.Dispose();}
  AssetDatabase.CreateAsset(sprite,"Assets/ProportionsNative/"+name+".asset");return sprite;
 }
 public static void Run(){
  try{
   EditorSceneManager.OpenScene("Assets/BodyOrganicComparison.unity");
   var old=UnityEngine.Object.FindFirstObjectByType<BodyOrganicExport>();old.GetComponent<Animator>().enabled=false;
   var clip=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IdleOrganic.anim");clip.SampleAnimation(old.gameObject,0);
   Directory.CreateDirectory("Assets/ProportionsNative");AssetDatabase.Refresh();
   var exporter=old.gameObject.AddComponent<ProportionIdleExport>();exporter.clip=clip;exporter.captureCamera=old.captureCamera;exporter.bones=old.bones;
   string[] names={"Torso","ForearmL","ForearmR","HandL","HandR"};
   exporter.renderers=new SpriteRenderer[names.Length];exporter.originals=new Sprite[names.Length];exporter.revised=new Sprite[names.Length];
   for(int i=0;i<names.Length;i++){
    var renderer=old.transform.Find("Visuals/"+names[i]).GetComponent<SpriteRenderer>();
    exporter.renderers[i]=renderer;exporter.originals[i]=renderer.sprite;exporter.revised[i]=Changed(renderer.sprite,names[i]);
    renderer.sprite=exporter.revised[i];
   }
   UnityEngine.Object.DestroyImmediate(old);
   var prefab=PrefabUtility.SaveAsPrefabAsset(exporter.gameObject,"Assets/ProportionsNative/MaraProportions.prefab");
   if(prefab==null)throw new Exception("Prefab was not saved");
   EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/ProportionsNative/MaraIdleComparison.unity");
   AssetDatabase.SaveAssets();Debug.Log("PROPORTION_RIG_READY");EditorApplication.EnterPlaymode();
  }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}
 }
}

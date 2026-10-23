using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Animations;
using UnityEngine;

public static class BuildProportionReactions {
 const string Folder="Assets/ProportionReactions";
 public static void Run(){try{
  if(Directory.Exists(Folder))throw new Exception("Reaction assets already exist; use ExportSaved to preserve them.");
  EditorSceneManager.OpenScene("Assets/ProportionsNative/MaraIdleComparison.unity");
  var source=UnityEngine.Object.FindFirstObjectByType<ProportionIdleExport>();
  var animator=source.GetComponent<Animator>();animator.enabled=false;
  source.clip.SampleAnimation(source.gameObject,0);
  var export=source.gameObject.AddComponent<ProportionReactionExport>();
  export.captureCamera=source.captureCamera;export.bones=source.bones;export.renderers=source.renderers;
  export.originals=source.originals;export.revised=source.revised;export.keys=new[]{"head","touch"};
  export.clips=new[]{AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/HeadReactionOrganic.anim"),AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/TouchReactionOrganic.anim")};
  foreach(var clip in export.clips)if(clip==null)throw new Exception("Required original clip missing.");
  Directory.CreateDirectory(Folder);AssetDatabase.Refresh();
  var controller=AnimatorController.CreateAnimatorControllerAtPath(Folder+"/MaraReactions.controller");
  var machine=controller.layers[0].stateMachine;
  var idle=machine.AddState("M01 Idle");idle.motion=source.clip;machine.defaultState=idle;
  for(int i=0;i<export.clips.Length;i++){
   string trigger=i==0?"Head":"Touch";controller.AddParameter(trigger,AnimatorControllerParameterType.Trigger);
   var state=machine.AddState(i==0?"M02 Kopf":"M03 Beruehrung");state.motion=export.clips[i];
   var start=idle.AddTransition(state);start.hasExitTime=false;start.duration=0;start.AddCondition(AnimatorConditionMode.If,0,trigger);
   var finish=state.AddTransition(idle);finish.hasExitTime=true;finish.exitTime=1;finish.duration=0;
  }
  // Exporter handles matched endpoints; manual controller triggering is only an editor preview.
  UnityEngine.Object.DestroyImmediate(source);animator.runtimeAnimatorController=controller;animator.enabled=true;
  if(PrefabUtility.SaveAsPrefabAsset(export.gameObject,Folder+"/MaraReactions.prefab")==null)throw new Exception("Prefab save failed.");
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"/MaraReactionComparison.unity");
  AssetDatabase.SaveAssets();Debug.Log("REACTION_PROPORTIONS_READY");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 public static void ExportSaved(){try{
  EditorSceneManager.OpenScene(Folder+"/MaraReactionComparison.unity");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

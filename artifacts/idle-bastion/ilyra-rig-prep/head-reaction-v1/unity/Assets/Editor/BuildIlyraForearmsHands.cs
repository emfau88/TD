using System;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

// Additive variant: the previous scenes/prefabs and clips stay untouched.
public static class BuildIlyraForearmsHands {
 public static void Run(){try{
  EditorSceneManager.OpenScene("Assets/IlyraHeadBalancedArms.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();
  var animator=rig.GetComponent<Animator>();animator.enabled=false;
  rig.clip.SampleAnimation(rig.gameObject,0);
  // Upper arms and elbow anchors keep the previous 90% setting.
  // Shorten forearms along their own axis, with unchanged width.
  foreach(int b in new[]{5,8})rig.bones[b].localScale=new Vector3(.92f,1,1);
  // Hands are 90% as long and 95% as wide as in the preceding variant.
  // Cancel inherited forearm shortening to avoid double shortening the hand.
  foreach(int b in new[]{6,9})rig.bones[b].localScale=new Vector3(1/.92f,.95f,1);
  rig.outputBase="../../forearm-hands-v2/preview/head";
  animator.enabled=true;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraForearmsHands.unity");
  PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/IlyraForearmsHands.prefab");
  animator.enabled=false;AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_FOREARMS_HANDS_READY forearm=.92 handLength=.90 handWidth=.95 relativeToBalanced");
  EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 public static void ExportIdle(){try{
  EditorSceneManager.OpenScene("Assets/IlyraForearmsHands.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;
  rig.clip=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");
  rig.outputBase="../../forearm-hands-v2/preview/idle";
  EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

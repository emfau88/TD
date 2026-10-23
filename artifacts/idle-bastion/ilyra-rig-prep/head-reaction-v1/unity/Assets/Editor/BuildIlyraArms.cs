using System;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

public static class BuildIlyraArms {
 public static void ExportIdle(){try{
  EditorSceneManager.OpenScene("Assets/IlyraHeadShorterArms.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;
  rig.clip=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/IlyraIdle.anim");rig.outputBase="../preview/shorter-arms/idle";
  EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
 public static void Run(){try{
  EditorSceneManager.OpenScene("Assets/IlyraHeadReaction.unity");var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();var animator=rig.GetComponent<Animator>();animator.enabled=false;rig.clip.SampleAnimation(rig.gameObject,0);
  // Bone local X follows the limb. A small longitudinal adjustment shortens both
  // upper and lower arm together while preserving their width and shoulder anchor.
  foreach(int b in new[]{4,7})rig.bones[b].localScale=new Vector3(.95f,1,1);
  // Undo inherited shortening at the hands; fingers and palm keep their size.
  foreach(int b in new[]{6,9})rig.bones[b].localScale=new Vector3(1/.95f,1,1);
  rig.outputBase="../preview/shorter-arms";
  animator.enabled=true;EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/IlyraHeadShorterArms.unity");PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/IlyraShorterArms.prefab");animator.enabled=false;AssetDatabase.SaveAssets();
  Debug.Log("ILYRA_SHORTER_ARMS_READY longitudinalScale=0.95 handsCompensated=true");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

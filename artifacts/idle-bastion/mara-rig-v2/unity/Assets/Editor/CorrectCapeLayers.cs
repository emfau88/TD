using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class CorrectCapeLayers {
 public static void Run() {
  try {
   EditorSceneManager.OpenScene("Assets/MaraV2.unity");
   var rig=UnityEngine.Object.FindFirstObjectByType<MaraV2Export>();
   string[] order={"CapeBack","CapeL","CapeR","HairBack","Hips","Torso","Head","Scarf","ForearmL","ForearmR","HandL","HandR","HairL","HairR","Braid","EyeL","EyeR","BrowL","BrowR","Mouth","HairFront"};
   for(int i=0;i<order.Length;i++)rig.transform.Find("Visuals/"+order[i]).GetComponent<SpriteRenderer>().sortingOrder=i;
   rig.clips[0].SampleAnimation(rig.gameObject,0);
   rig.GetComponent<Animator>().enabled=true;
   EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene());
   PrefabUtility.SaveAsPrefabAsset(rig.gameObject,"Assets/MaraV2.prefab");
   AssetDatabase.SaveAssets();
   Debug.Log("CAPE_LAYERS_CORRECTED: all cape pieces behind both arms; clips unchanged");
   EditorApplication.EnterPlaymode();
  } catch(Exception e) { Debug.LogException(e); EditorApplication.Exit(1); }
 }
}



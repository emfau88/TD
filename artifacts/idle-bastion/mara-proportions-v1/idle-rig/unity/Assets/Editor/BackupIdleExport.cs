using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Re-export the saved approved rig without recreating or replacing its assets.
public static class BackupIdleExport {
 public static void Run(){
  try{
   EditorSceneManager.OpenScene("Assets/ProportionsNative/MaraIdleComparison.unity");
   EditorApplication.EnterPlaymode();
  }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}
 }
}

using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
public static class RunDiagnosis {
 public static void Run() {
  EditorSceneManager.OpenScene("Assets/MaraIdle.unity");
  var old=Object.FindFirstObjectByType<MaraIdleExport>();
  var d=old.gameObject.AddComponent<Diagnose>();d.clip=old.idle;d.cam=old.captureCamera;
  Object.DestroyImmediate(old);
  EditorApplication.EnterPlaymode();
 }
}

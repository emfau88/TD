using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

public static class ExportTavern {
 public static void Run(){try{
  EditorSceneManager.OpenScene("Assets/IlyraGiggle.unity");
  var rig=UnityEngine.Object.FindFirstObjectByType<IlyraHeadExport>();
  rig.GetComponent<Animator>().enabled=false;
  rig.GetComponent<IlyraSecondaryMotion>().simulate=false;
  var keys=new[]{"idle","head","touch","variant","joy","giggle"};
  var names=new[]{"IlyraIdle","IlyraHeadReaction","IlyraTouchReaction","IlyraIdleVariant","IlyraMiniHopV3","IlyraGiggle"};
  rig.testNames=keys;rig.testClips=new AnimationClip[names.Length];
  for(int i=0;i<names.Length;i++)rig.testClips[i]=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Clips/"+names[i]+".anim");
  rig.testClips[0].SampleAnimation(rig.gameObject,0);
  rig.clip=rig.testClips[0];rig.outputBase=Path.GetFullPath("../unity-export");
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/TavernTest.unity");
  EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

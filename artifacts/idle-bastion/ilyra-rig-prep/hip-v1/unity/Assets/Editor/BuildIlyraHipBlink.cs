using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;

public static class BuildIlyraHipBlink {
 const string Folder="Assets/HipBaseBlink",Output="../../hip-base-v2/blink-v1/preview",Source="../../hip-base-v2/blink-v1/source";
 static float Smooth(float a,float b,float x)=>Mathf.SmoothStep(0,1,Mathf.InverseLerp(a,b,x));
 static float Region(float x,float y,float l,float r)=>Smooth(l,l+5,x)*(1-Smooth(r-5,r,x))*Smooth(297,303,y)*(1-Smooth(356,362,y));
 static Sprite Patch(string name,string input){
  var tex=new Texture2D(2,2,TextureFormat.RGBA32,false,true);tex.LoadImage(File.ReadAllBytes(input));
  if(tex.width!=971||tex.height!=1619)throw new Exception("Unregistered blink size");
  var colors=tex.GetPixels32();int changed=0;
  for(int y=0;y<tex.height;y++)for(int x=0;x<tex.width;x++){
   float py=tex.height-1-y;float mask=Mathf.Max(Region(x,py,384,478),Region(x,py,516,606));int i=y*tex.width+x;
   var c=colors[i];c.a=(byte)Mathf.RoundToInt(255*mask);if(c.a==0)c=new Color32(0,0,0,0);else changed++;colors[i]=c;
  }
  tex.SetPixels32(colors);tex.Apply();string path=Folder+"/"+name+".png";File.WriteAllBytes(path,tex.EncodeToPNG());UnityEngine.Object.DestroyImmediate(tex);AssetDatabase.ImportAsset(path);
  var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;importer.spritePixelsPerUnit=1;importer.spritePivot=new(.5f,.5f);importer.textureCompression=TextureImporterCompression.Uncompressed;importer.filterMode=FilterMode.Bilinear;importer.mipmapEnabled=false;importer.sRGBTexture=false;importer.alphaIsTransparency=true;importer.npotScale=TextureImporterNPOTScale.None;importer.maxTextureSize=2048;importer.SaveAndReimport();Debug.Log("BLINK_PATCH "+name+" pixels="+changed);return AssetDatabase.LoadAssetAtPath<Sprite>(path);
 }
 public static void Run(){try{
  Directory.CreateDirectory(Output);Directory.CreateDirectory(Folder);AssetDatabase.Refresh();
  var half=Patch("LidsHalf",Source+"/half-generated.png");var closed=Patch("LidsClosed",Source+"/closed-generated.png");
  EditorSceneManager.OpenScene("Assets/HipBaseV2/IlyraHandOnHip.unity");var rig=UnityEngine.Object.FindAnyObjectByType<IlyraHeadExport>();var animator=rig.GetComponent<Animator>();animator.enabled=false;
  var original=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/HipBaseV2/IlyraHandOnHipSway.anim");original.SampleAnimation(rig.gameObject,0);
  var patch=new GameObject("BlinkLids");patch.transform.SetParent(rig.bones[3],false);patch.transform.localPosition=new Vector3(971/2f-495,500-1619/2f,0);var sr=patch.AddComponent<SpriteRenderer>();sr.sortingOrder=5;
  var clip=UnityEngine.Object.Instantiate(original);clip.name="IlyraHandOnHipBlink";
  var keys=new[]{new ObjectReferenceKeyframe{time=0,value=null},new ObjectReferenceKeyframe{time=1.8f,value=half},new ObjectReferenceKeyframe{time=1.8666667f,value=closed},new ObjectReferenceKeyframe{time=1.9666667f,value=half},new ObjectReferenceKeyframe{time=2.0666667f,value=null},new ObjectReferenceKeyframe{time=4.7333333f,value=half},new ObjectReferenceKeyframe{time=4.8f,value=closed},new ObjectReferenceKeyframe{time=4.9f,value=half},new ObjectReferenceKeyframe{time=5,value=null},new ObjectReferenceKeyframe{time=6,value=null}};
  AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve(AnimationUtility.CalculateTransformPath(patch.transform,rig.transform),typeof(SpriteRenderer),"m_Sprite"),keys);
  string clipPath=Folder+"/IlyraHandOnHipBlink.anim";var old=AssetDatabase.LoadAssetAtPath<AnimationClip>(clipPath);if(old==null)AssetDatabase.CreateAsset(clip,clipPath);else{EditorUtility.CopySerialized(clip,old);EditorUtility.SetDirty(old);clip=old;}
  var controller=AssetDatabase.LoadAssetAtPath<AnimatorController>(Folder+"/IlyraHandOnHipBlink.controller");if(controller==null){controller=AnimatorController.CreateAnimatorControllerAtPath(Folder+"/IlyraHandOnHipBlink.controller");controller.layers[0].stateMachine.AddState("HipSwayBlink").motion=clip;}
  animator.runtimeAnimatorController=controller;rig.clip=clip;rig.outputBase=Output;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"/IlyraHandOnHipBlink.unity");PrefabUtility.SaveAsPrefabAsset(rig.gameObject,Folder+"/IlyraHandOnHipBlink.prefab");AssetDatabase.SaveAssets();
  File.WriteAllText(Output+"/blink-timing.json","{\"duration\":6,\"fps\":30,\"blinks\":[{\"half\":1.8,\"closed\":1.8666667,\"reopen\":1.9666667,\"open\":2.0666667},{\"half\":4.7333333,\"closed\":4.8,\"reopen\":4.9,\"open\":5.0}],\"bodyClipUnchanged\":true}");
  Debug.Log("HIP_BLINK_READY");EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

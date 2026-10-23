using System;
using System.IO;
using UnityEngine;
using UnityEngine.U2D.Animation;
using UnityEditor;
using UnityEditor.U2D.Sprites;
using UnityEditor.SceneManagement;

// Isolated texture correction. Geometry, weights, bones, body animation and
// blinking are copied/referenced unchanged from the approved hip-pose study.
public static class BuildIlyraHipHandSize {
 const string Folder="Assets/HipHandSizeV2", ImagePath=Folder+"/IlyraHipHandSize.png";
 const string Output="../../hip-base-v2/hip-hand-v2/preview";
 public static void Run(){try{
  Directory.CreateDirectory(Output);AssetDatabase.Refresh();
  var imp=(TextureImporter)AssetImporter.GetAtPath(ImagePath);
  imp.textureType=TextureImporterType.Sprite;imp.spriteImportMode=SpriteImportMode.Single;imp.spritePixelsPerUnit=1;imp.spritePivot=new(.5f,.5f);imp.textureCompression=TextureImporterCompression.Uncompressed;imp.filterMode=FilterMode.Bilinear;imp.mipmapEnabled=false;imp.sRGBTexture=false;imp.alphaIsTransparency=true;imp.npotScale=TextureImporterNPOTScale.None;imp.maxTextureSize=2048;imp.isReadable=true;imp.SaveAndReimport();
  var factory=new SpriteDataProviderFactories();factory.Init();
  var from=factory.GetSpriteEditorDataProviderFromObject(AssetImporter.GetAtPath("Assets/HipBaseV2/IlyraHipBase.png"));from.InitSpriteEditorDataProvider();
  var to=factory.GetSpriteEditorDataProviderFromObject(imp);to.InitSpriteEditorDataProvider();var a=from.GetSpriteRects()[0].spriteID;var b=to.GetSpriteRects()[0].spriteID;
  to.GetDataProvider<ISpriteBoneDataProvider>().SetBones(b,from.GetDataProvider<ISpriteBoneDataProvider>().GetBones(a));
  var src=from.GetDataProvider<ISpriteMeshDataProvider>();var dst=to.GetDataProvider<ISpriteMeshDataProvider>();dst.SetVertices(b,src.GetVertices(a));dst.SetIndices(b,src.GetIndices(a));dst.SetEdges(b,src.GetEdges(a));to.Apply();AssetDatabase.ImportAsset(ImagePath,ImportAssetOptions.ForceUpdate);
  EditorSceneManager.OpenScene("Assets/HipBaseBlink/IlyraHandOnHipBlink.unity");
  var rig=UnityEngine.Object.FindAnyObjectByType<IlyraHeadExport>();rig.GetComponent<Animator>().enabled=false;rig.clip.SampleAnimation(rig.gameObject,0);
  var skin=rig.GetComponentInChildren<SpriteSkin>();skin.GetComponent<SpriteRenderer>().sprite=AssetDatabase.LoadAssetAtPath<Sprite>(ImagePath);skin.SetBoneTransforms(rig.bones);rig.outputBase=Output;
  EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),Folder+"/IlyraHandOnHipHandSize.unity");PrefabUtility.SaveAsPrefabAsset(rig.gameObject,Folder+"/IlyraHandOnHipHandSize.prefab");AssetDatabase.SaveAssets();
  Debug.Log("HIP_HAND_SIZE_READY unchanged clip="+AssetDatabase.GetAssetPath(rig.clip));EditorApplication.EnterPlaymode();
 }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(1);}}
}

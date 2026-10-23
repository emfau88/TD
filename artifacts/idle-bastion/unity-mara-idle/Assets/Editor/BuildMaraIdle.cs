using System;
using System.Linq;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEditor.U2D.Sprites;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.U2D.Animation;

public static class BuildMaraIdle
{
    static readonly string[] Names = { "Root", "Torso", "Neck", "Head", "Braid", "BraidTip", "LeftHair", "RightHair", "LeftCloth", "RightCloth", "LeftHand", "RightHand" };
    static readonly int[] Parents = { -1, 0, 1, 2, 3, 4, 3, 3, 1, 1, 0, 0 };
    static readonly Vector2[] Points = { new(192,360), new(192,286), new(192,206), new(187,187), new(143,215), new(134,278), new(98,220), new(241,213), new(85,285), new(269,286), new(130,366), new(278,384) };
    static readonly string[] Layers = { "HiddenBody", "Torso", "Hips", "RightCloth", "LeftCloth", "RightHand", "LeftHand", "RightHair", "LeftHair", "Braid", "Head" };
    static Vector3 Pixel(Vector2 p) => new(p.x, 512 - p.y, 0);
    static float Ramp(float a, float b, float x) => Mathf.SmoothStep(0, 1, Mathf.InverseLerp(a,b,x));
    static BoneWeight Weight(string layer, float y)
    {
        int id = Array.IndexOf(Names, layer);
        if (layer.StartsWith("Head")) id = 3;
        if (layer == "Hips") id = 0;
        if (layer == "Torso" || layer == "HiddenBody")
        {
            float w = 1 - Ramp(278, 335, y);
            return new BoneWeight { boneIndex0 = 0, weight0 = 1-w, boneIndex1 = 1, weight1 = w };
        }
        if (layer == "Braid")
        {
            if (y < 230) { float w = Ramp(194,230,y); return new BoneWeight {boneIndex0=3,weight0=1-w,boneIndex1=4,weight1=w}; }
            float t = Ramp(246,310,y); return new BoneWeight {boneIndex0=4,weight0=1-t,boneIndex1=5,weight1=t};
        }
        return new BoneWeight { boneIndex0 = Math.Max(id,0), weight0 = 1 };
    }
    static List<SpriteBone> Bones()
    {
        var list = new List<SpriteBone>();
        for (int i=0;i<Names.Length;i++) list.Add(new SpriteBone { name=Names[i], parentId=Parents[i], position=Parents[i]<0 ? Pixel(Points[i]) : Pixel(Points[i])-Pixel(Points[Parents[i]]), rotation=Quaternion.identity, length=i==0?0:30 });
        return list;
    }
    static Sprite Import(string name)
    {
        string path=$"Assets/Art/{name}.png";
        var importer=(TextureImporter)AssetImporter.GetAtPath(path);
        importer.textureType=TextureImporterType.Sprite; importer.spriteImportMode=SpriteImportMode.Single;
        importer.spritePixelsPerUnit=1; importer.spritePivot=new Vector2(.5f,.5f);
        importer.textureCompression=TextureImporterCompression.Uncompressed; importer.filterMode=FilterMode.Point;
        importer.mipmapEnabled=false; importer.sRGBTexture=false; importer.alphaIsTransparency=false;
        importer.npotScale=TextureImporterNPOTScale.None; importer.maxTextureSize=1024; importer.isReadable=true;
        importer.SaveAndReimport();
        var factories=new SpriteDataProviderFactories(); factories.Init();
        var provider=factories.GetSpriteEditorDataProviderFromObject(importer); provider.InitSpriteEditorDataProvider();
        var rect=provider.GetSpriteRects()[0];
        provider.GetDataProvider<ISpriteBoneDataProvider>().SetBones(rect.spriteID,Bones());
        var mesh=provider.GetDataProvider<ISpriteMeshDataProvider>();
        int step=(name=="Torso" || name=="HiddenBody" || name=="Braid")?8:128;
        var xs=new List<int>(); var ys=new List<int>();
        for(int x=0;x<384;x+=step)xs.Add(x);xs.Add(384);
        for(int y=0;y<512;y+=step)ys.Add(y);ys.Add(512);
        var vertices=new List<Vertex2DMetaData>();
        foreach(int y in ys)foreach(int x in xs) vertices.Add(new Vertex2DMetaData {position=new Vector2(x,y),boneWeight=Weight(name,512-y)});
        var indices=new List<int>(); var edges=new List<Vector2Int>();
        for(int y=0;y<ys.Count-1;y++)for(int x=0;x<xs.Count-1;x++)
        {
            int i=y*xs.Count+x;indices.AddRange(new[]{i,i+1,i+xs.Count,i+1,i+xs.Count+1,i+xs.Count});
            edges.Add(new Vector2Int(i,i+1));edges.Add(new Vector2Int(i,i+xs.Count));
        }
        mesh.SetVertices(rect.spriteID,vertices.ToArray());mesh.SetIndices(rect.spriteID,indices.ToArray());mesh.SetEdges(rect.spriteID,edges.ToArray());
        provider.Apply();importer.SaveAndReimport();
        return AssetDatabase.LoadAssetAtPath<Sprite>(path);
    }
    [MenuItem("SPIRE/Mara/Rebuild full idle and export")]
    public static void Run()
    {
        try
        {
            PlayerSettings.colorSpace=ColorSpace.Gamma; QualitySettings.antiAliasing=0;
            PlayerSettings.runInBackground=true;
            var sprites=new Dictionary<string,Sprite>();
            foreach(string n in Layers.Concat(new[]{"HeadHalf","HeadClosed"}))sprites[n]=Import(n);
            // Preserve the layered PSB as an editable source with individual sprites.
            var psb=AssetImporter.GetAtPath("Assets/Art/MaraLayers.psb");
            if(psb==null)throw new Exception("Layered PSB import failed");
            var serialized=new SerializedObject(psb);
            foreach(string key in new[]{"m_MosaicLayers","m_CharacterMode","m_UseLayerGrouping"})
            {var property=serialized.FindProperty(key);if(property!=null)property.boolValue=true;}
            serialized.ApplyModifiedPropertiesWithoutUndo();psb.SaveAndReimport();

            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var rig=new GameObject("Mara");var bones=new Transform[Names.Length];
            for(int i=0;i<Names.Length;i++)
            {
                bones[i]=new GameObject(Names[i]).transform;bones[i].SetParent(Parents[i]<0?rig.transform:bones[Parents[i]],false);
                bones[i].localPosition=Parents[i]<0?Pixel(Points[i])-new Vector3(192,256,0):Pixel(Points[i])-Pixel(Points[Parents[i]]);
            }
            var visuals=new GameObject("Visuals");visuals.transform.SetParent(rig.transform,false);
            for(int i=0;i<Layers.Length;i++)
            {
                string name=Layers[i];var go=new GameObject(name);go.transform.SetParent(visuals.transform,false);
                var renderer=go.AddComponent<SpriteRenderer>();renderer.sprite=sprites[name];renderer.sortingOrder=i;
                var skin=go.AddComponent<SpriteSkin>();skin.SetRootBone(bones[0]);skin.SetBoneTransforms(bones);
                skin.alwaysUpdate=true;skin.forceCpuDeformation=true;
                Debug.Log("Skin bones assigned: "+name+" / "+skin.SetBoneTransforms(bones));
            }
            var clip=new AnimationClip {name="Mara Idle",frameRate=24,wrapMode=WrapMode.Loop};
            string PathFor(int i)=>AnimationUtility.CalculateTransformPath(bones[i],rig.transform);
            void Curve(int bone,string property,Func<float,float> value,Func<float,float> derivative)
            {
                var keys=new List<Keyframe>();for(int i=0;i<=32;i++){float t=i*.25f;keys.Add(new Keyframe(t,value(t),derivative(t),derivative(t)));}
                AnimationUtility.SetEditorCurve(clip,EditorCurveBinding.FloatCurve(PathFor(bone),typeof(Transform),property),new AnimationCurve(keys.ToArray()));
            }
            float w=Mathf.PI/4;
            Curve(1,"m_LocalPosition.y",t=>74+.4f*(1-Mathf.Cos(2*w*t)),t=>.8f*w*Mathf.Sin(2*w*t));
            void Swing(int bone,float strength,float phase=0)
            {Curve(bone,"localEulerAnglesRaw.z",t=>strength*(Mathf.Sin(w*t-phase)+Mathf.Sin(phase)),t=>strength*w*Mathf.Cos(w*t-phase));}
            Swing(2,.08f);Swing(3,.45f);Swing(4,-.35f,.35f);Swing(5,-.5f,.75f);
            Swing(6,-.4f,.5f);Swing(7,-.35f,.65f);Swing(8,.6f,.9f);Swing(9,-.5f,.7f);
            var blink=new List<ObjectReferenceKeyframe>{new(){time=0,value=sprites["Head"]}};
            foreach(float time in new[]{2.8f,6.1f})
            {
                blink.Add(new(){time=time,value=sprites["HeadHalf"]});blink.Add(new(){time=time+.06f,value=sprites["HeadClosed"]});
                blink.Add(new(){time=time+.14f,value=sprites["HeadHalf"]});blink.Add(new(){time=time+.23f,value=sprites["Head"]});
            }
            blink.Add(new(){time=8,value=sprites["Head"]});
            AnimationUtility.SetObjectReferenceCurve(clip,EditorCurveBinding.PPtrCurve("Visuals/Head",typeof(SpriteRenderer),"m_Sprite"),blink.ToArray());
            var settings=AnimationUtility.GetAnimationClipSettings(clip);settings.loopTime=true;AnimationUtility.SetAnimationClipSettings(clip,settings);
            AssetDatabase.DeleteAsset("Assets/MaraIdle.anim");AssetDatabase.CreateAsset(clip,"Assets/MaraIdle.anim");
            AssetDatabase.DeleteAsset("Assets/Mara.controller");var controller=AnimatorController.CreateAnimatorControllerAtPath("Assets/Mara.controller");controller.AddMotion(clip);
            rig.AddComponent<Animator>().runtimeAnimatorController=controller;
            var camera=new GameObject("Preview Camera").AddComponent<Camera>();camera.transform.position=new Vector3(0,0,-10);
            camera.orthographic=true;camera.orthographicSize=256;camera.aspect=.75f;camera.clearFlags=CameraClearFlags.SolidColor;
            camera.backgroundColor=Color.clear;camera.allowHDR=false;camera.allowMSAA=false;
            var exporter=rig.AddComponent<MaraIdleExport>();exporter.idle=clip;exporter.captureCamera=camera;
            clip.SampleAnimation(rig,0);
            EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),"Assets/MaraIdle.unity");
            EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene("Assets/MaraIdle.unity",true)};
            AssetDatabase.SaveAssets();Debug.Log("SPIRE_RIG_OK: 11 SpriteSkins, 12 bones, layered PSB, editable animation clip.");
            if(Application.isBatchMode) EditorApplication.EnterPlaymode();
        }
        catch(Exception e){Debug.LogException(e);if(Application.isBatchMode)EditorApplication.Exit(1);else throw;}
    }
}

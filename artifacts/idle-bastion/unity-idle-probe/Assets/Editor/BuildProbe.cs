using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class BuildProbe
{
    const int Width = 384, Height = 512, Step = 4;
    static Vector3 Point(float x, float y) => new Vector3(x - Width / 2f, Height / 2f - y, 0);
    static float Ramp(float a, float b, float x) => Mathf.SmoothStep(0, 1, Mathf.InverseLerp(a, b, x));

    [MenuItem("SPIRE Probe/Rebuild scene and export 4-second loop")]
    public static void Run()
    {
        try
        {
            PlayerSettings.colorSpace = ColorSpace.Gamma;
            PlayerSettings.runInBackground = true;
            QualitySettings.antiAliasing = 0;
            var importer = (TextureImporter)AssetImporter.GetAtPath("Assets/Mara.png");
            importer.textureType = TextureImporterType.Default;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.filterMode = FilterMode.Point;
            importer.wrapMode = TextureWrapMode.Clamp;
            importer.mipmapEnabled = false;
            importer.npotScale = TextureImporterNPOTScale.None;
            importer.sRGBTexture = false;
            importer.alphaIsTransparency = false;
            importer.maxTextureSize = 1024;
            importer.SaveAndReimport();

            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var rig = new GameObject("Mara — small cloth rig");
            Transform Bone(string name, Vector3 p)
            {
                var t = new GameObject(name).transform;
                t.SetParent(rig.transform, false); t.localPosition = p; return t;
            }
            var fixedBody = Bone("Fixed body, face, hands and hair", Vector3.zero);
            var left = Bone("Left cloth edge", Point(85, 285));
            var right = Bone("Right cloth edge", Point(269, 286));
            var bones = new[] { fixedBody, left, right };
            int columns = Width / Step + 1, rows = Height / Step + 1;
            var vertices = new Vector3[columns * rows];
            var uv = new Vector2[vertices.Length];
            var weights = new BoneWeight[vertices.Length];
            for (int y = 0; y < rows; y++) for (int x = 0; x < columns; x++)
            {
                int i = y * columns + x; float px = x * Step, py = y * Step;
                vertices[i] = Point(px, py);
                uv[i] = new Vector2(px / Width, 1 - py / Height);
                // Pinned inner boundaries protect arm, breast and glove pixels.
                float l = Ramp(274, 320, py) * (1 - Ramp(62, 74, px)) * (1 - Ramp(404, 416, py));
                float r = Ramp(286, 320, py) * Ramp(286, 298, px) * (1 - Ramp(336, 348, py));
                weights[i] = new BoneWeight { boneIndex0 = 0, weight0 = 1-l-r,
                    boneIndex1 = 1, weight1 = l, boneIndex2 = 2, weight2 = r };
            }
            var triangles = new int[(columns - 1) * (rows - 1) * 6]; int index = 0;
            for (int y = 0; y < rows - 1; y++) for (int x = 0; x < columns - 1; x++)
            {
                int i = y * columns + x;
                triangles[index++] = i; triangles[index++] = i + columns; triangles[index++] = i + 1;
                triangles[index++] = i + 1; triangles[index++] = i + columns; triangles[index++] = i + columns + 1;
            }
            var mesh = new Mesh { name = "Mara cloth mesh", vertices = vertices, uv = uv, triangles = triangles, boneWeights = weights };
            mesh.bindposes = Array.ConvertAll(bones, b => b.worldToLocalMatrix * rig.transform.localToWorldMatrix);
            mesh.RecalculateBounds();
            AssetDatabase.DeleteAsset("Assets/MaraMesh.asset");
            AssetDatabase.CreateAsset(mesh, "Assets/MaraMesh.asset");
            var material = new Material(Shader.Find("SpireProbe/ExactPixels")) { mainTexture = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Mara.png") };
            AssetDatabase.DeleteAsset("Assets/MaraMaterial.mat");
            AssetDatabase.CreateAsset(material, "Assets/MaraMaterial.mat");
            var skin = rig.AddComponent<SkinnedMeshRenderer>();
            skin.sharedMesh = mesh; skin.sharedMaterial = material;
            skin.bones = bones; skin.rootBone = fixedBody; skin.updateWhenOffscreen = true;
            skin.quality = SkinQuality.Bone4;
            var motion = rig.AddComponent<MaraClothProbe>(); motion.leftCloth = left; motion.rightCloth = right;
            var camera = new GameObject("Preview Camera").AddComponent<Camera>();
            camera.transform.position = new Vector3(0, 0, -10);
            camera.orthographic = true; camera.orthographicSize = Height / 2f;
            camera.aspect = (float)Width / Height; camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0, 0, 0, 0); camera.allowHDR = false; camera.allowMSAA = false;
            motion.Pose(0);
            EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(), "Assets/MaraProbe.unity");
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene("Assets/MaraProbe.unity", true) };
            AssetDatabase.SaveAssets();

            // Bake the actual Unity skinned mesh per sample for deterministic offline capture.
            // The saved scene retains the live SkinnedMeshRenderer and bone animation.
            var capture = new GameObject("Export capture");
            var filter = capture.AddComponent<MeshFilter>();
            capture.AddComponent<MeshRenderer>().sharedMaterial = material;
            skin.enabled = false;
            var baked = new Mesh(); filter.sharedMesh = baked;
            string output = Path.GetFullPath("Export"); Directory.CreateDirectory(output);
            var rt = new RenderTexture(Width * 2, Height * 2, 24, RenderTextureFormat.ARGB32, RenderTextureReadWrite.Linear) { antiAliasing = 1 };
            var pixels = new Texture2D(rt.width, rt.height, TextureFormat.RGBA32, false, true);
            camera.targetTexture = rt;
            for (int frame = 0; frame <= 96; frame++)
            {
                motion.Pose(frame / 24f);
                skin.BakeMesh(baked); camera.Render();
                RenderTexture.active = rt;
                pixels.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0); pixels.Apply();
                File.WriteAllBytes(Path.Combine(output, $"frame-{frame:D3}.png"), pixels.EncodeToPNG());
            }
            RenderTexture.active = null; camera.targetTexture = null;
            UnityEngine.Object.DestroyImmediate(capture); UnityEngine.Object.DestroyImmediate(baked);
            UnityEngine.Object.DestroyImmediate(pixels); rt.Release(); UnityEngine.Object.DestroyImmediate(rt);
            skin.enabled = true; motion.Pose(0);
            Debug.Log("SPIRE_PROBE_OK: 97 transparent Unity frames, 768x1024, 24 fps, 4 s. Endpoint included for validation.");
            if (Application.isBatchMode) EditorApplication.Exit(0);
        }
        catch (Exception e)
        {
            Debug.LogException(e);
            if (Application.isBatchMode) EditorApplication.Exit(1);
            else throw;
        }
    }
}

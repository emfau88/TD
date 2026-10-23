using System;
using System.Collections;
using System.IO;
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

public class MaraIdleExport : MonoBehaviour
{
    public AnimationClip idle;
    public Camera captureCamera;
    public const float Duration = 8;
    IEnumerator Start()
    {
        if (!Array.Exists(Environment.GetCommandLineArgs(), x => x == "-spire-export")) yield break;
        GetComponent<Animator>().enabled = false;
        string folder = Path.GetFullPath("Export"); Directory.CreateDirectory(folder);
        var rt = new RenderTexture(768, 1024, 24, RenderTextureFormat.ARGB32, RenderTextureReadWrite.Linear) { antiAliasing = 1 };
        var pixels = new Texture2D(768, 1024, TextureFormat.RGBA32, false, true);
        captureCamera.targetTexture = rt;
        yield return null;
        for (int i = 0; i <= 192; i++)
        {
            idle.SampleAnimation(gameObject, i / 24f);
            // Let SpriteSkin's normal runtime deformation process this sampled pose.
            yield return null;
            captureCamera.Render(); RenderTexture.active = rt;
            pixels.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0); pixels.Apply();
            var colors = pixels.GetPixels32();
            for (int j = 0; j < colors.Length; j++)
            {
                var c = colors[j];
                if (c.a > 0 && c.a < 255)
                {
                    c.r = (byte)Mathf.Min(255, Mathf.RoundToInt(c.r * 255f / c.a));
                    c.g = (byte)Mathf.Min(255, Mathf.RoundToInt(c.g * 255f / c.a));
                    c.b = (byte)Mathf.Min(255, Mathf.RoundToInt(c.b * 255f / c.a));
                    colors[j] = c;
                }
            }
            pixels.SetPixels32(colors); pixels.Apply();
            File.WriteAllBytes(Path.Combine(folder, $"frame-{i:D3}.png"), pixels.EncodeToPNG());
        }
        RenderTexture.active = null; captureCamera.targetTexture = null; rt.Release();
        Destroy(pixels); Destroy(rt);
        Debug.Log("SPIRE_IDLE_OK: 193 real SpriteSkin render samples, 768x1024, 24 fps, 8 seconds.");
#if UNITY_EDITOR
        EditorApplication.Exit(0);
#endif
    }
}

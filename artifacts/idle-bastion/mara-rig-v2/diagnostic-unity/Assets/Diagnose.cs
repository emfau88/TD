using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.U2D.Animation;
public class Diagnose:MonoBehaviour {
 public AnimationClip clip; public Camera cam;
 IEnumerator Start(){
  GetComponent<Animator>().enabled=false;
  Directory.CreateDirectory("Diagnosis");
  var rs=GetComponentsInChildren<SpriteRenderer>();
  var rt=new RenderTexture(768,1024,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear);cam.targetTexture=rt;
  var tex=new Texture2D(768,1024,TextureFormat.RGBA32,false,true);
  for(int frame=0;frame<=24;frame++) {
   clip.SampleAnimation(gameObject,frame/24f);yield return null;
   cam.Render();RenderTexture.active=rt;tex.ReadPixels(new Rect(0,0,768,1024),0,0);tex.Apply();
   if(frame==24)File.WriteAllBytes("Diagnosis/sequence-no-writeback.png",tex.EncodeToPNG());
  }
  for(int frame=0;frame<=24;frame++) {
   clip.SampleAnimation(gameObject,frame/24f);yield return null;
   cam.Render();RenderTexture.active=rt;tex.ReadPixels(new Rect(0,0,768,1024),0,0);tex.Apply();
   if(frame==24)File.WriteAllBytes("Diagnosis/sequence-raw.png",tex.EncodeToPNG());
   var c=tex.GetPixels32();for(int j=0;j<c.Length;j++){if(c[j].a>0&&c[j].a<255){var v=c[j];v.r=(byte)Mathf.Min(255,Mathf.RoundToInt(v.r*255f/v.a));v.g=(byte)Mathf.Min(255,Mathf.RoundToInt(v.g*255f/v.a));v.b=(byte)Mathf.Min(255,Mathf.RoundToInt(v.b*255f/v.a));c[j]=v;}}
   tex.SetPixels32(c);tex.Apply();
   if(frame==24)File.WriteAllBytes("Diagnosis/sequence-unpremul.png",tex.EncodeToPNG());
  }
  foreach(float t in new[]{0f,1f,2f}) {
   clip.SampleAnimation(gameObject,t);yield return null;yield return null;yield return null;
   for(int k=-1;k<rs.Length;k++) {
    foreach(var r in rs)r.enabled=k<0||r==rs[k];
    yield return null;yield return null;
    cam.Render();RenderTexture.active=rt;tex.ReadPixels(new Rect(0,0,768,1024),0,0);tex.Apply();
    File.WriteAllBytes($"Diagnosis/{t}-{(k<0?"full":rs[k].name)}.png",tex.EncodeToPNG());
   }
  }
  foreach(var r in rs)r.enabled=true;
  foreach(var r in rs)r.sprite.texture.filterMode=FilterMode.Bilinear;
  clip.SampleAnimation(gameObject,1f);yield return null;cam.Render();RenderTexture.active=rt;tex.ReadPixels(new Rect(0,0,768,1024),0,0);tex.Apply();
  File.WriteAllBytes("Diagnosis/1-bilinear.png",tex.EncodeToPNG());
  Debug.Log("DIAGNOSIS_DONE");UnityEditor.EditorApplication.Exit(0);
 }
}

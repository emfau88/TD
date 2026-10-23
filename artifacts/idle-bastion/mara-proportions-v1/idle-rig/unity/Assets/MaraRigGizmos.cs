using UnityEngine;
public class MaraRigGizmos:MonoBehaviour {
 public Transform[] bones;public int[] parents;
 void OnDrawGizmos(){if(bones==null)return;Gizmos.color=new Color(.2f,1,.8f,1);for(int i=0;i<bones.Length;i++){if(bones[i]==null)continue;Gizmos.DrawSphere(bones[i].position,3);if(parents[i]>=0)Gizmos.DrawLine(bones[parents[i]].position,bones[i].position);}}
}

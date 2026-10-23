using System;
using UnityEngine;

// Reusable secondary-motion solver. SpriteSkin deforms one continuous garment mesh.
public class MaraChestSpring:MonoBehaviour {
 public Transform chest,left,right;
 public Vector3 leftRest,rightRest;
 public bool simulate;
 [Range(.5f,6f)]public float frequency=2.6f;
 [Range(.1f,1f)]public float damping=.30f;
 [Range(0,2)]public float inertia=.85f;
 [Range(0,14)]public float limit=8f;
 [Serializable]public class State {
  public Vector2 offset,velocity;
  public void Step(Vector2 acceleration,float dt,float frequency,float damping,float inertia,float limit){
   float w=2*Mathf.PI*frequency;
   velocity+=(-w*w*offset-2*damping*w*velocity-inertia*acceleration)*dt;
   offset+=velocity*dt;
   if(offset.magnitude>limit){offset=offset.normalized*limit;float outward=Vector2.Dot(velocity,offset.normalized);if(outward>0)velocity-=offset.normalized*outward;}
  }
 }
 State l=new(),r=new();Vector2 lastL,lastR,velocityL,velocityR;bool initialized;
 void OnEnable(){initialized=false;l=new();r=new();}
 void LateUpdate(){
  if(!simulate||chest==null||left==null||right==null)return;
  Vector2 a=chest.TransformPoint(leftRest),b=chest.TransformPoint(rightRest);
  if(!initialized){lastL=a;lastR=b;velocityL=velocityR=Vector2.zero;initialized=true;}
  float dt=Mathf.Clamp(Time.deltaTime,.0001f,.05f);Vector2 vl=(a-lastL)/dt,vr=(b-lastR)/dt,al=(vl-velocityL)/dt,ar=(vr-velocityR)/dt;
  int steps=Mathf.CeilToInt(dt*240);for(int i=0;i<steps;i++){l.Step(al,dt/steps,frequency,damping,inertia,limit);r.Step(ar,dt/steps,frequency*1.035f,damping,inertia,limit);}
  left.localPosition=leftRest+chest.InverseTransformVector(l.offset);right.localPosition=rightRest+chest.InverseTransformVector(r.offset);
  lastL=a;lastR=b;velocityL=vl;velocityR=vr;
 }
}

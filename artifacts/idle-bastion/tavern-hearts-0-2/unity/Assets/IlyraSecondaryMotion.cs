using System;
using UnityEngine;

// Reusable, acceleration-driven secondary motion on the continuous chest mesh.
public class IlyraSecondaryMotion : MonoBehaviour {
 public Transform chest,left,right;
 public bool simulate;
 public float frequency=1.65f,damping=.58f,inertia=.9f,limit=3f;
 [Serializable] public class State {
  public Vector2 offset,velocity;
  public void Step(Vector2 acceleration,float dt,float frequency,float damping,float inertia,float limit){
   float w=2*Mathf.PI*frequency;
   velocity+=(-w*w*offset-2*damping*w*velocity-inertia*acceleration)*dt;
   offset+=velocity*dt;
   if(offset.magnitude>limit){offset=offset.normalized*limit;float outward=Vector2.Dot(velocity,offset.normalized);if(outward>0)velocity-=offset.normalized*outward;}
  }
 }
 State[] states={new(),new()};Vector2[] previous=new Vector2[2],velocities=new Vector2[2];bool initialized;
 void OnEnable(){initialized=false;states=new State[]{new(),new()};}
 void LateUpdate(){
  if(!simulate||chest==null)return;
  float dt=Mathf.Clamp(Time.deltaTime,.0001f,.05f);var targets=new[]{left,right};
  for(int b=0;b<2;b++){
   var bone=targets[b];Vector2 anchor=bone.position;
   Vector2 v=initialized?(anchor-previous[b])/dt:Vector2.zero;
   Vector2 acc=initialized?(v-velocities[b])/dt:Vector2.zero;
   int steps=Mathf.CeilToInt(dt*240);
   for(int i=0;i<steps;i++)states[b].Step(acc,dt/steps,frequency*(b==0?1:1.025f),damping,inertia,limit);
   // Animator supplies the authored position before LateUpdate on each frame.
   bone.localPosition+=chest.InverseTransformVector(states[b].offset);
   previous[b]=anchor;velocities[b]=v;
  }
  initialized=true;
 }
}

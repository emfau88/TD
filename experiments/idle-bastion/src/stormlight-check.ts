/** Local review launcher: isolated native saves, never the user's default database. */
import {createOfflineState} from './offline';
const status=document.querySelector<HTMLElement>('#status')!;
for(const button of document.querySelectorAll<HTMLButtonElement>('button[data-sample]'))button.onclick=async()=>{
 try{
  if(!import.meta.env.DEV)throw Error('Diese Probe benötigt den lokalen Entwicklungsserver.');
  const sample=button.dataset.sample!,response=await fetch(`./.local-assets/stormlight-${sample}.json`);
  if(!response.ok)throw Error('Lokale Prüfdaten fehlen. Siehe B16-Prüfbericht zur Wiederherstellung.');
  const battle=await response.json(),slot='b16-review-'+crypto.randomUUID(),now=Date.now(),offline=createOfflineState(now);offline.baseline.paused=true;
  await new Promise<void>((resolve,reject)=>{const r=indexedDB.open('spire-idle-bastion-probe-'+slot,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:true,battle,offline},'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});
  location.assign('./?probe='+slot);
 }catch(error){status.textContent=String(error);}
};

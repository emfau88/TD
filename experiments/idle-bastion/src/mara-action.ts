import type {IdleBattle} from './battle';
import {MARA} from './mara';
import {t} from './i18n';
import {syncSpellButton} from './spell-button';
export function maraAction(b:IdleBattle,unavailable:boolean,paused:boolean){
 const m=b.mara,seconds=Math.ceil(m.cooldownRemaining),target=b.towers.find(t=>t.uid===m.targetTowerUid);
 const progress=Math.max(0,Math.min(1,1-m.cooldownRemaining/MARA.cooldown));
 const result=(state:string,status:string)=>({state,status,progress,disabled:state!=='ready'});
 if(unavailable||b.preparing||b.maraIntroductionPending||b.phase==='defeat')return result('locked',t('Gerade nicht verfügbar'));
 if(paused)return result('paused',seconds?t('Pause · noch {0} s',seconds):t('Pausiert · Kampf fortsetzen'));
 if(b.isMaraBoosted(m.effectTowerUid??-1))return result('casting',t('Verstärkt · noch {0} s',Math.ceil(m.effectRemaining)));
 if(m.cooldownRemaining>1e-9)return result('cooldown',t('Bereit in {0} s',seconds));
 if(!target)return result('waiting',t('Zuerst einen Turm zuweisen'));
 if(b.isCharmed(target.uid))return result('locked',t('Zielturm ist verzaubert'));
 if(Math.hypot(target.x-m.x,target.y-m.y)>MARA.range)return result('position',t('Zielturm außerhalb der Reichweite'));
 if(b.phase!=='wave')return result('waiting',t('Wartet auf die nächste Welle'));
 return result('ready',t('Bereit · Verstärkung wirken'));
}
export function syncMaraAction(button:HTMLButtonElement,b:IdleBattle,unavailable:boolean,paused:boolean):void {
 syncSpellButton(button,'mara',maraAction(b,unavailable,paused),b.mara.cooldownRemaining,b.mara.autoCast);
}

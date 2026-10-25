import {t} from './i18n';
import {SPELL_ART} from './spell-art';
export interface SpellButtonState {state:string;status:string;progress:number;disabled:boolean}
/** Stable native button, radial cooldown and readable status; no timer or gameplay command. */
export function syncSpellButton(button:HTMLButtonElement,hero:'mara'|'ilyra',action:SpellButtonState,remaining:number,auto:boolean):void {
 if(!button.querySelector('.spell-disc')){
  button.classList.add('spell-button');
  button.innerHTML='<span class="spell-disc" aria-hidden="true"><img alt=""><span class="spell-shade"></span><span class="spell-number"></span></span><span class="spell-copy"><span class="spell-name"></span><span class="spell-status volley-status"></span><span class="spell-auto"></span></span>';
  button.querySelector('img')!.src=SPELL_ART[`${hero}-spell`];
 }
 const name=hero==='mara'?t('Übertakten'):t('Sternensalve');
 button.disabled=action.disabled;button.dataset.state=action.state;
 button.style.setProperty('--reveal',`${(action.progress*360).toFixed(2)}deg`);
 const text=(selector:string,value:string)=>{const node=button.querySelector<HTMLElement>(selector)!;if(node.textContent!==value)node.textContent=value;};
 text('.spell-name',name);text('.spell-status',action.status);
 text('.spell-number',remaining>1e-9?String(Math.ceil(remaining)):'');
 text('.spell-auto',t(auto?'AUTO EIN':'AUTO AUS'));button.querySelector('.spell-auto')!.classList.toggle('on',auto);
 button.setAttribute('aria-label',`${name} · ${action.status} · ${t('Automatik: {0}',t(auto?'Ein':'Aus'))}`);
}

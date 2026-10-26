import { CompanionVoice } from './companion-voice';
export { nextVoiceIndex } from './companion-voice';

const clips=Object.values(import.meta.glob('../assets/mara-voice/*.wav',{eager:true,query:'?url',import:'default'}))
  .map(url=>({url:url as string,gain:1}));
export class MaraVoice extends CompanionVoice {
  constructor(context:AudioContext,output:AudioNode){super(context,output,'mara',clips);}
}

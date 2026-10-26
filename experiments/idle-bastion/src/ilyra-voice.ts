import { CompanionVoice } from './companion-voice';
import { ILYRA_VOICE_GAINS } from './ilyra-voice-levels';

const files=import.meta.glob('../assets/ilyra-voice/*.mp3',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const clips=Object.entries(ILYRA_VOICE_GAINS).map(([file,gain])=>({url:files[`../assets/ilyra-voice/${file}`],gain}));
export class IlyraVoice extends CompanionVoice {
  constructor(context:AudioContext,output:AudioNode){super(context,output,'ilyra',clips);}
}

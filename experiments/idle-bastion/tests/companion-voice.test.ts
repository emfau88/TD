import test from 'node:test';
import assert from 'node:assert/strict';
import { nextVoiceIndex } from '../src/companion-voice';
import { ILYRA_VOICE_GAINS } from '../src/ilyra-voice-levels';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

test('every other voice is reachable exactly once, without an immediate repeat',()=>{
  for(const count of [7,10])for(let previous=-1;previous<count;previous++){
    const choices=count-(previous>=0?1:0);
    const actual=Array.from({length:choices},(_,i)=>nextVoiceIndex(count,previous,()=>(i+.5)/choices));
    assert.deepEqual(actual,Array.from({length:count},(_,i)=>i).filter(i=>i!==previous));
  }
  assert.equal(nextVoiceIndex(1,0),0);
});

test('the approved seven original files match their loudness calibration and retain peak headroom',()=>{
  const base=new URL('../assets/ilyra-voice/',import.meta.url);
  const report=JSON.parse(readFileSync(new URL('levels.json',base),'utf8'));
  assert.equal(report.ilyra.length,7);
  assert.equal(Object.keys(ILYRA_VOICE_GAINS).length,7);
  for(const clip of report.ilyra){
    const gain=ILYRA_VOICE_GAINS[clip.file as keyof typeof ILYRA_VOICE_GAINS];
    assert.equal(createHash('sha256').update(readFileSync(new URL(clip.file,base))).digest('hex'),clip.sha256);
    assert.ok(Math.abs(clip.integratedLufs+20*Math.log10(gain)-report.targetLufs)<.001);
    assert.ok(clip.truePeakDbtp+20*Math.log10(gain)<-3);
  }
});

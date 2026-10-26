import test from 'node:test';
import assert from 'node:assert/strict';
import { nextVoiceIndex } from '../src/companion-voice';
import { ILYRA_VOICE_GAINS, ILYRA_COMMAND_VOICE_GAINS, MARA_COMMAND_VOICE_GAINS } from '../src/ilyra-voice-levels';
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

test('command pools contain only the chosen clips and use the same quieter loudness target',()=>{
  assert.deepEqual(Object.keys(MARA_COMMAND_VOICE_GAINS),['P11','P09','P07','P06','P03','P01','P14'].map(id=>`${id}.wav`));
  assert.deepEqual(Object.keys(ILYRA_COMMAND_VOICE_GAINS),['senpai1','senpai2','senpai3','sweetheart1','sweetheart2','sweetheart3','youremine1'].map(id=>`voice1-${id}.mp3`));
  const assets=new URL('../assets/',import.meta.url);
  const report=JSON.parse(readFileSync(new URL('ilyra-voice/levels.json',assets),'utf8'));
  assert.equal(report.commandPlaybackGain,.5);
  for(const [rows,table,folder] of [[report.commands,ILYRA_COMMAND_VOICE_GAINS,'ilyra-voice'],[report.maraCommands,MARA_COMMAND_VOICE_GAINS,'mara-command-voice']] as const){
    for(const clip of rows){
      const gain=(table as Record<string,number>)[clip.file];
      assert.equal(createHash('sha256').update(readFileSync(new URL(`${folder}/${clip.file}`,assets))).digest('hex'),clip.sha256);
      assert.ok(Math.abs(clip.integratedLufs+20*Math.log10(gain)-report.targetLufs)<.001);
      assert.ok(clip.truePeakDbtp+20*Math.log10(gain*.5)<-6,'headroom even at maximum voice slider');
    }
  }
});

test('all 32 reserve clips retain their own cuts; selected runtime WAVs are exact copies',()=>{
  const reserve=new URL('../../../artifacts/idle-bastion/audio-reserve/pyro-vocals/',import.meta.url);
  const manifest=JSON.parse(readFileSync(new URL('segments.json',reserve),'utf8'));
  assert.equal(manifest.clips.length,32);
  for(const clip of manifest.clips){
    const data=readFileSync(new URL(clip.file,reserve));
    assert.equal(createHash('sha256').update(data).digest('hex'),clip.sha256);
    if(`${clip.id}.wav` in MARA_COMMAND_VOICE_GAINS)assert.deepEqual(data,readFileSync(new URL(`../assets/mara-command-voice/${clip.id}.wav`,import.meta.url)));
  }
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

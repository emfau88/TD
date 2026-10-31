import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { HERO_COMMAND_GAIN } from '../src/audio-cues';
import { ILYRA_COMMAND_VOICE_GAINS, MARA_COMMAND_VOICE_GAINS } from '../src/ilyra-voice-levels';

test('Ilyra boost survives mix refresh; Mara, mute and shared command cooldown are preserved', async () => {
  let now = 0, element: any;
  const nodes: any[] = [];
  class AudioStub {
    paused = true; src = ''; dataset = {}; preload = ''; hidden = false;
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {} remove() {} removeAttribute() { this.src = ''; }
  }
  const context = {
    createGain() { const n = { gain: { value: 0 }, connect() {}, disconnect() {} }; nodes.push(n); return n; },
    createMediaElementSource() { return { connect() {}, disconnect() {} }; },
  };
  const source = readFileSync(new URL('../src/hero-command-voice.ts', import.meta.url), 'utf8').replaceAll('import.meta.glob', 'glob');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: any = {};
  new Function('require', 'exports', 'glob', 'Audio', 'document', 'performance', code)(
    (name: string) => name === './audio-cues' ? { HERO_COMMAND_GAIN }
      : name === './companion-voice' ? { nextVoiceIndex: () => 0 }
      : { ILYRA_COMMAND_VOICE_GAINS, MARA_COMMAND_VOICE_GAINS }, exports,
    () => Object.fromEntries([
      ...Object.keys(ILYRA_COMMAND_VOICE_GAINS).map(file => [`../assets/ilyra-voice/${file}`, file]),
      ...Object.keys(MARA_COMMAND_VOICE_GAINS).map(file => [`../assets/mara-command-voice/${file}`, file]),
    ]), AudioStub, { body: { append(value: any) { element = value; } } }, { now: () => now });
  const voice = new exports.HeroCommandVoice(context, {}), gain = nodes[0].gain;
  voice.setState(true, .55); voice.play('ilyra', 'select');
  assert.equal(element.src, 'voice1-senpai1.mp3');
  assert.equal(gain.value, .55 * .8 * ILYRA_COMMAND_VOICE_GAINS['voice1-senpai1.mp3']);
  voice.setState(true, .3);
  assert.equal(gain.value, .3 * .8 * ILYRA_COMMAND_VOICE_GAINS['voice1-senpai1.mp3']);
  await Promise.resolve(); await Promise.resolve();
  element.paused = true; now = 6999; voice.play('mara', 'select');
  assert.equal(element.dataset.hero, 'ilyra', 'shared cooldown still blocks the next hero');
  now = 7001; voice.play('mara', 'select');
  assert.equal(gain.value, .3 * .5 * MARA_COMMAND_VOICE_GAINS['P11.wav']);
  voice.setState(false, 0);
  assert.equal(element.paused, true); assert.equal(element.src, ''); assert.equal(gain.value, 0);
  voice.destroy();
});

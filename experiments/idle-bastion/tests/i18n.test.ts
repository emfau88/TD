import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { ENEMY_ROSTER } from '../src/enemy-roster';
import { MARA_MOMENTS, maraStage } from '../src/tavern-mara-content';
import { ILYRA_MOMENTS, ilyraStage } from '../src/tavern-ilyra-content';
import { SOCIAL } from '../src/tavern-social';
import { BOSS_ENCOUNTERS } from '../src/boss';
import { english } from '../src/locales/en';
import { t, language, readLanguage, setLanguage, numberFormat, LANGUAGE_KEY, hasTranslation } from '../src/i18n';
import { bindStaticTranslations, mountLanguageSettings } from '../src/i18n-dom';
import { IdleBattle } from '../src/battle';
import { certifyFarm, defenseFingerprint, isFarmCertificateValid } from '../src/farming';
import { beginAbsence, createOfflineState, offlinePolicy, reserveOffline } from '../src/offline';

test('English is the explicit default; language choices survive blocked preference storage', () => {
  assert.equal(readLanguage(null), 'en'); assert.equal(readLanguage('fr'), 'en'); assert.equal(readLanguage('de'), 'de');
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
  try { setLanguage('de'); assert.equal(language(), 'de'); setLanguage('en'); assert.equal(language(), 'en'); }
  finally { if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor); else Reflect.deleteProperty(globalThis, 'localStorage'); }
});

test('complete sentences retain every placeholder, whitespace and dynamic values in both languages', () => {
  for (const [source, translation] of Object.entries(english)) {
    const placeholders = (text: string) => [...text.matchAll(/\{\d+\}/g)].map(match => match[0]).sort();
    assert.deepEqual(placeholders(source), placeholders(translation), source);
    assert.ok(translation.trim(), source);
  }
  const formatter = numberFormat({ maximumFractionDigits: 1 });
  setLanguage('en');
  assert.equal(t('{0} auf Level {1}', 'Waldwächter', 12), 'Grove Warden to level 12');
  assert.equal(formatter.format(1234.5), '1,234.5');
  assert.equal(t(' · Neu: {0} berühren', 'Haare'), ' · New: touch Hair');
  assert.equal(t(' · in einem kommenden Update'), ' · in a future update');
  assert.equal(t(' · Persönliches Geschenk überreicht'), ' · Personal gift given');
  assert.equal(t(' · Lernpause'), ' · Tutorial pause'); assert.equal(t(' '), ' ');
  setLanguage('de');
  assert.equal(t('{0} auf Level {1}', 'Waldwächter', 12), 'Waldwächter auf Level 12');
  assert.equal(formatter.format(1234.5), '1.234,5');
  setLanguage('en');
});

test('menu language switch preserves DOM identity, updates accessibility and persists only the preference', () => {
  const dom = new JSDOM('<html lang="en"><body><button title="Spielmenü öffnen">Spielmenü</button><select id="language-choice"><option value="en">English</option><option value="de">Deutsch</option></select><p>Waldwächter</p></body></html>', { url: 'https://example.test' });
  const doc = dom.window.document, button = doc.querySelector('button')!;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: dom.window.localStorage });
  setLanguage('en'); const unbind = bindStaticTranslations(doc), unmount = mountLanguageSettings(doc);
  try {
    assert.equal(button.textContent, 'Game menu'); assert.equal(button.title, 'Open game menu');
    const select = doc.querySelector('select')!; select.value = 'de'; select.dispatchEvent(new dom.window.Event('change'));
    assert.equal(button.textContent, 'Spielmenü'); assert.equal(doc.documentElement.lang, 'de');
    assert.equal(doc.querySelector('button'), button);
    assert.equal(dom.window.localStorage.getItem(LANGUAGE_KEY), 'de'); assert.equal(dom.window.localStorage.length, 1);
    // A dynamic renderer owns replaced children; static bindings must not resurrect them.
    doc.querySelector('p')!.textContent = '42'; setLanguage('en'); assert.equal(doc.querySelector('p')!.textContent, '42');
  } finally { unbind(); unmount(); dom.window.close(); if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor); else Reflect.deleteProperty(globalThis, 'localStorage'); setLanguage('en'); }
});

test('language changes preserve an earned battle, farm proof and historical offline receipt exactly', () => {
  const snapshot = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/b16/economy/two-storms-wave50-earned.json', import.meta.url), 'utf8'));
  const battle = IdleBattle.restore(snapshot); assert.ok(battle);
  setLanguage('en'); const before = battle.snapshot(), fingerprint = defenseFingerprint(battle), proof = certifyFarm(battle); assert.ok(proof);
  const offline = reserveOffline(beginAbsence(createOfflineState(1000), 1000, proof, false, offlinePolicy(true)), 61000);
  const historical = structuredClone(offline);
  setLanguage('de'); assert.deepEqual(battle.snapshot(), before); assert.equal(defenseFingerprint(battle), fingerprint);
  assert.ok(isFarmCertificateValid(proof, battle)); assert.deepEqual(certifyFarm(battle, proof), proof); assert.deepEqual(offline, historical);
  const restored = IdleBattle.restore(before); assert.ok(restored); assert.deepEqual(restored.snapshot(), before);
  setLanguage('en'); battle.update(1); setLanguage('de'); restored.update(1); assert.deepEqual(restored.snapshot(), battle.snapshot());
  assert.deepEqual(offline, historical); setLanguage('en');
});

test('all enemy descriptions and companion dialogue stages have translations, without translating IDs', () => {
  const sources = new Set<string>();
  const definitions = JSON.stringify({ ENEMY_ROSTER, BOSS_ENCOUNTERS });
  for (const enemy of ENEMY_ROSTER) for (const key of ['name', 'role', 'counter'] as const) sources.add(enemy[key]);
  for (const boss of Object.values(BOSS_ENCOUNTERS)) sources.add(boss.title);
  for (const companion of [{ stage: maraStage, moments: MARA_MOMENTS }, { stage: ilyraStage, moments: ILYRA_MOMENTS }]) {
    for (const points of [0, ...SOCIAL.heartThresholds]) {
      const stage = companion.stage(points);
      for (const value of Object.values(stage)) for (const line of typeof value === 'string' ? [value] : value) sources.add(line);
    }
    for (const moment of companion.moments) {
      sources.add(moment.title);
      for (const beat of moment.beats) sources.add(beat.line);
    }
  }
  for (const source of sources) assert.ok(hasTranslation(source), source);
  setLanguage('de');
  for (const source of Object.keys(english)) assert.equal(t(source), source, 'German is the unchanged source message');
  setLanguage('en');
  assert.equal(t('Rosenspiegel'), 'Rosemirror');
  assert.equal(ENEMY_ROSTER.find(enemy => enemy.id === 'Rosenspiegel')?.id, 'Rosenspiegel');
  assert.equal(JSON.stringify({ ENEMY_ROSTER, BOSS_ENCOUNTERS }), definitions);
});

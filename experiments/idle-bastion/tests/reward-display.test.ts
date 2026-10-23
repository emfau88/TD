import test from 'node:test';
import assert from 'node:assert/strict';
import { offlineGoldDisplay } from '../src/reward-display';
import { setLanguage } from '../src/i18n';

test('return gold uses whole coins and unambiguous grouping, with exact fractional details', () => {
  setLanguage('en');
  assert.deepEqual(offlineGoldDisplay(12_345_678), { headline: '+12\u202f345 gold', exact: '+12\u202f345.678 gold', showDetails: true });
  assert.equal(offlineGoldDisplay(999).headline, 'Less than 1 gold');
  assert.equal(offlineGoldDisplay(1).exact, '+0.001 gold');
  assert.equal(offlineGoldDisplay(0).headline, '+0 gold');
  assert.equal(offlineGoldDisplay(1000).showDetails, false);
  assert.equal(offlineGoldDisplay(999_999_999).headline, '+999\u202f999 gold');
  setLanguage('de');
  assert.deepEqual(offlineGoldDisplay(12_345_678), { headline: '+12\u202f345 Gold', exact: '+12\u202f345,678 Gold', showDetails: true });
  assert.equal(offlineGoldDisplay(1).headline, 'Weniger als 1 Gold');
  setLanguage('en');
});

test('only actual millions receive a scale label; exact values remain lossless at the safe unit limit', () => {
  setLanguage('en');
  assert.equal(offlineGoldDisplay(1_000_000_000).headline, '≈ +1 million gold');
  assert.equal(offlineGoldDisplay(1_234_567_890).headline, '≈ +1.2 million gold');
  assert.equal(offlineGoldDisplay(1_000_000_000_000).headline, '≈ +1 billion gold');
  assert.equal(offlineGoldDisplay(Number.MAX_SAFE_INTEGER).exact, '+9\u202f007\u202f199\u202f254\u202f740.991 gold');
  setLanguage('de');
  assert.equal(offlineGoldDisplay(1_234_567_890).headline, '≈ +1,2 Mio. Gold');
  assert.equal(offlineGoldDisplay(Number.MAX_SAFE_INTEGER).headline, '≈ +9 Bio. Gold');
  setLanguage('en');
});

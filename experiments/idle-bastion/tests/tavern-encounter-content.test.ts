import test from 'node:test';
import assert from 'node:assert/strict';
import { english } from '../src/locales/en';
import { tavernEncounter, personalGiftLine, type TavernEncounterChoice } from '../src/tavern-encounter-content';

test('four short encounters have two equal choices, usable existing clips and complete English', () => {
  const titles = new Set<string>();
  for (const who of ['mara', 'ilyra'] as const) for (const id of ['first', 'second'] as const) {
    for (const prior of [null, 'first', 'second'] as const) {
      const encounter = tavernEncounter(who, id, prior);
      titles.add(encounter.title);
      assert.equal(encounter.choices.length, 2);
      assert.notEqual(encounter.choices[0].label, encounter.choices[1].label);
      assert.ok(encounter.opening.length >= 1 && encounter.opening.length <= 2);
      const lines = [encounter.title, encounter.prompt, ...encounter.opening.map(b => b.line), ...encounter.neutral.map(b => b.line)];
      for (const choice of encounter.choices) {
        assert.equal(choice.reply.length, 1);
        assert.ok(encounter.opening.length + choice.reply.length <= 3);
        lines.push(choice.label, ...choice.reply.map(b => b.line));
      }
      for (const beat of [...encounter.opening, ...encounter.neutral, ...encounter.choices.flatMap(c => c.reply)]) {
        assert.ok(['idle', 'head'].includes(beat.clip), 'Quiet conversation uses existing neutral artwork.');
        assert.ok(beat.line.length < 240, 'Keep each manually read dialogue beat short.');
      }
      for (const line of lines) {
        assert.ok(line.trim());
        assert.ok(english[line]?.trim(), `Missing English: ${line}`);
      }
    }
    assert.ok(english[personalGiftLine(who)]?.trim());
  }
  assert.equal(titles.size, 4);
});

test('second encounter recalls only the actual first choice; neutral history invents no choice', () => {
  for (const who of ['mara', 'ilyra'] as const) {
    const openings = ([null, 'first', 'second'] as const).map(choice => tavernEncounter(who, 'second', choice).opening[0]!.line);
    assert.equal(new Set(openings).size, 3);
    assert.doesNotMatch(openings[0]!, /Du hast gefragt|hast du gesagt|Du wolltest|Deinen Namen|unserem Abendlicht/);
    assert.deepEqual(tavernEncounter(who, 'first', null), tavernEncounter(who, 'first', 'second'));
  }
  assert.match(tavernEncounter('mara', 'second', 'first').opening[0]!.line, /Du hast gefragt/);
  assert.match(tavernEncounter('mara', 'second', 'second').opening[0]!.line, /aus dem Takt/);
  assert.match(tavernEncounter('ilyra', 'second', 'first').opening[0]!.line, /unserem Abendlicht/);
  assert.match(tavernEncounter('ilyra', 'second', 'second').opening[0]!.line, /Du wolltest den Stern/);
});

test('star nickname remains private and personal gifts have concrete separate meanings', () => {
  const named = tavernEncounter('ilyra', 'first').choices[0].reply[0]!.line;
  assert.match(named, /Name nur für uns/);
  assert.match(named, /Sternkarte/);
  assert.match(personalGiftLine('mara'), /Messingzahnrad/);
  assert.match(personalGiftLine('ilyra'), /Sternanhänger/);
  for (const choice of ['first', 'second'] satisfies TavernEncounterChoice[]) {
    assert.equal(tavernEncounter('ilyra', 'second', choice).opening.length, 2);
  }
});

/** Chrome spot checks on the same generated A/B modules; isolated native IDB. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE!);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const cases = [['one-storm', 40], ['two-storms', 50], ['control', 60], ['two-storms', 70]].map(([strategy, wave]) => ({
  strategy, wave, snapshot: JSON.parse(readFileSync(`artifacts/idle-bastion/acceptance/b16/economy/${strategy}-wave${wave}-earned.json`, 'utf8')),
}));
const results: unknown[] = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1600, height: 1000 }, isMobile: mobile });
    // TSX names callbacks before Playwright serializes them into this isolated page.
    await context.addInitScript("globalThis.__name = (fn, name) => Object.defineProperty(fn, 'name', { value: name, configurable: true });");
    const page = await context.newPage();
    await page.goto(`${process.env.SPIRE_TEST_URL ?? 'http://127.0.0.1:5201'}/stormlight-check.html`);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: mobile ? 4 : 1 });
    const samples = await page.evaluate(async (inputs: typeof cases) => {
      const battlePath = '/src/battle.ts', baselinePath = '/.local-assets/farm-search-baseline.ts', currentPath = '/.local-assets/farm-search-current.ts';
      const { IdleBattle } = await import(battlePath);
      const policies = [await import(baselinePath), await import(currentPath)];
      const output = [];
      for (const input of inputs) {
        const previous = policies[0].certifyFarm(IdleBattle.restore(input.snapshot));
        const timings: number[][] = [[], []], choices = [];
        for (const policy of policies) policy.certifyFarm(IdleBattle.restore(input.snapshot), previous);
        for (let repeat = 0; repeat < 5; repeat++) for (const index of repeat % 2 ? [1, 0] : [0, 1]) {
          const b = IdleBattle.restore(input.snapshot), before = JSON.stringify(b.snapshot());
          const start = performance.now(), proof = policies[index].certifyFarm(b, previous);
          timings[index].push(performance.now() - start); choices[index] = proof.wave;
          if (JSON.stringify(b.snapshot()) !== before) throw Error('Live snapshot changed');
        }
        output.push({ strategy: input.strategy, record: input.wave, choices, timings,
          medianMs: timings.map(values => [...values].sort((a, b) => a - b)[2]) });
      }
      return output;
    }, cases);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const native = await page.evaluate(async (snapshot: unknown) => {
      const storePath = '/src/save-store.ts', sessionPath = '/src/battle-session.ts', offlinePath = '/src/offline.ts';
      const battlePath = '/src/battle.ts', baselinePath = '/.local-assets/farm-search-baseline.ts';
      const { openBattleStore } = await import(storePath), { BattleSession } = await import(sessionPath);
      const { beginAbsence, reserveOffline, createOfflineState, offlinePolicy } = await import(offlinePath);
      const { IdleBattle } = await import(battlePath), { certifyFarm } = await import(baselinePath);
      const b = IdleBattle.restore(snapshot), proof = certifyFarm(b), now = 61000;
      const offline = reserveOffline(beginAbsence(createOfflineState(1000), 1000, proof, false, offlinePolicy(true)), now);
      const pending = structuredClone(offline.pendingReward), name = `spire-idle-bastion-probe-farm-${crypto.randomUUID()}`;
      let store = await openBattleStore(indexedDB, name, () => now);
      await store.save(b.snapshot(), false, 0, { offline }); store.close();
      store = await openBattleStore(indexedDB, name, () => now);
      let session = await BattleSession.open(store, { now: () => now, locks: null });
      if (JSON.stringify(session.pendingReward) !== JSON.stringify(pending)) throw Error('Historical receipt changed');
      const selected = session.certificate.wave, before = session.battle.gold * 1000 + session.battle.goldRemainderUnits;
      if (!await session.claimOffline() || await session.claimOffline()) throw Error('Incorrect claim count');
      const credited = session.battle.gold * 1000 + session.battle.goldRemainderUnits - before;
      if (credited !== pending.amountUnits) throw Error('Incorrect claim amount');
      const saved = JSON.stringify(session.battle.snapshot()); await session.close();
      store = await openBattleStore(indexedDB, name, () => now);
      session = await BattleSession.open(store, { now: () => now, locks: null });
      if (JSON.stringify(session.battle.snapshot()) !== saved) throw Error('Reload changed battle');
      if (session.pendingReward?.amountUnits > 0) throw Error('Duplicate receipt');
      await session.close();
      return { oldWave: proof.wave, selected, creditedUnits: credited, exactReload: true, doubleCredit: false };
    }, JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/b16/economy/control-wave50-earned.json', 'utf8')));
    assert.equal(native.oldWave, 23); assert.equal(native.selected, 36);
    results.push({ mobile, cpuSlowdown: mobile ? 4 : 1, samples, native });
    console.log(JSON.stringify(results.at(-1))); await context.close();
  }
} finally { await browser.close(); }
writeFileSync('artifacts/idle-bastion/acceptance/farm-search/browser-results.json', JSON.stringify(results, null, 2) + '\n');

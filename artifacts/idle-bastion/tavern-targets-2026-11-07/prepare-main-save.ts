import { readFileSync, writeFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { createTavernProbe } from '../../../experiments/idle-bastion/src/tavern-test-probes';
import { openBattleStore } from '../../../experiments/idle-bastion/src/save-store';

const snapshots = JSON.parse(readFileSync(new URL('../acceptance/early-balance-release/selected/B-snapshots.json', import.meta.url), 'utf8'));
const store = await openBattleStore(new IDBFactory(), 'tavern-main-release-fixture');
try {
  const save = await store.save(createTavernProbe('heart3', snapshots.clear25).snapshot(), true, 0);
  writeFileSync(new URL('./main-save.json', import.meta.url), JSON.stringify(save, null, 2) + '\n');
} finally { store.close(); }

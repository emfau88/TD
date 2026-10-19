/** Run from the repository root. Model measurements are not real-time browser playtests. */
import { runBalance, type Approach } from './balance-run';
import { writeFileSync } from 'node:fs';
const approaches: Approach[] = ['guided', 'alternative', 'watch'];
const reports = approaches.map(approach => runBalance(approach).report);
writeFileSync('artifacts/idle-bastion/acceptance/15min/b13-after.json', JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports.map(({ log, ...report }) => report), null, 2));

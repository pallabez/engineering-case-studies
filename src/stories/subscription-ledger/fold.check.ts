// Run with: node src/stories/subscription-ledger/fold.check.ts
import { UNLIMITED_SEATS, project, toLifecycle, type LedgerRow } from './fold.ts';

const trial: LedgerRow = { kind: 'TRIAL', start: 1, end: 14, count: UNLIMITED_SEATS, graceEnd: 14 };
const sale: LedgerRow = { kind: 'PAID', start: 8, end: 37, count: 10, graceEnd: 43 };
const addon: LedgerRow = { kind: 'PAID', start: 20, end: 37, count: 5, graceEnd: 43 };
const correction: LedgerRow = { kind: 'PAID', start: 26, end: 37, count: -3, graceEnd: 37 };
const renewal: LedgerRow = { kind: 'PAID', start: 38, end: 67, count: 10, graceEnd: 73 };

function check(name: string, rows: LedgerRow[], today: number, suspended: boolean, state: string, staffLimit: number | null) {
  const projection = project(rows, today, suspended);
  const got = `${toLifecycle(projection)} ${projection?.staffLimit ?? null}`;
  if (got !== `${state} ${staffLimit}`) throw new Error(`${name}: expected ${state} ${staffLimit}, got ${got}`);
}

check('no rows', [], 5, false, 'NONE', null);
check('trial live', [trial], 5, false, 'IN_TRIAL', -1);
check('trial over, nothing bought', [trial], 20, false, 'TRIAL_EXPIRED', -1);
check('paid wins mid-trial', [trial, sale], 10, false, 'ACTIVE', 10);
check('addon stacks', [trial, sale, addon], 22, false, 'ACTIVE', 15);
check('correction subtracts', [trial, sale, addon, correction], 30, false, 'ACTIVE', 12);
check('grace after the window', [trial, sale], 40, false, 'GRACE', 10);
check('expired after grace', [trial, sale], 44, false, 'EXPIRED', 10);
check('renewal joins the window', [trial, sale, renewal], 40, false, 'ACTIVE', 10);
check('suspended while live', [trial, sale], 35, true, 'DEACTIVATED', 10);
check('suspension over dead coverage', [trial, sale], 50, true, 'EXPIRED', 10);
check('rows net to zero', [sale, { ...sale, count: -10, graceEnd: 37 }], 10, false, 'EXPIRED', null);
check('paid ahead', [renewal], 20, false, 'FUTURE', 10);
console.log('fold checks passed');

/**
 * A port of the coverage fold to whole-number days, for the interactive ledger.
 * Windows include both end days. Paid and trial rows fold separately.
 */
export type Kind = 'PAID' | 'TRIAL';

export interface LedgerRow {
  kind: Kind;
  start: number;
  end: number;
  count: number;
  /** Last entitled day for a positive paid row. */
  graceEnd: number;
}

export type Status = 'IN_TRIAL' | 'PENDING' | 'ACTIVE' | 'EXPIRED_GRACE' | 'FUTURE' | 'DEACTIVATED' | 'EXPIRED';
export type Lifecycle = 'NONE' | 'IN_TRIAL' | 'TRIAL_EXPIRED' | 'ACTIVE' | 'GRACE' | 'FUTURE' | 'DEACTIVATED' | 'EXPIRED';

export interface Projection {
  kind: Kind | null;
  status: Status;
  start: number | null;
  /** Exclusive, like the stored column. */
  end: number | null;
  graceEnd: number | null;
  /** -1 means unlimited. */
  staffLimit: number | null;
}

export const UNLIMITED_SEATS = 1_000_000;

interface CoverageWindow { start: number; end: number }

export interface Fold {
  seatsOn(day: number): number;
  windows: CoverageWindow[];
  lastCoveredDay: number | null;
}

export function foldLedger(rows: readonly LedgerRow[]): Fold {
  const deltas = new Map<number, number>();
  for (const row of rows) {
    deltas.set(row.start, (deltas.get(row.start) ?? 0) + row.count);
    deltas.set(row.end + 1, (deltas.get(row.end + 1) ?? 0) - row.count);
  }
  const points: { day: number; seats: number }[] = [];
  const windows: CoverageWindow[] = [];
  let seats = 0;
  let windowStart: number | null = null;
  for (const day of [...deltas.keys()].sort((a, b) => a - b)) {
    const previous = seats;
    seats += deltas.get(day)!;
    points.push({ day, seats });
    if (previous <= 0 && seats > 0) windowStart = day;
    else if (previous > 0 && seats <= 0 && windowStart !== null) {
      windows.push({ start: windowStart, end: day - 1 });
      windowStart = null;
    }
  }
  return {
    seatsOn: day => points.filter(point => point.day <= day).at(-1)?.seats ?? 0,
    windows,
    lastCoveredDay: windows.at(-1)?.end ?? null,
  };
}

const toStaffLimit = (seats: number) => (seats >= UNLIMITED_SEATS ? -1 : seats);

function projectPaid(rows: readonly LedgerRow[], today: number, suspended: boolean): Projection | null {
  const fold = foldLedger(rows);
  const last = fold.lastCoveredDay;
  if (last === null) return null;
  const storedGrace = rows.filter(row => row.count > 0 && row.end === last).map(row => row.graceEnd);
  const graceEnd = storedGrace.length ? Math.max(...storedGrace) : last + 1;
  const seatsToday = fold.seatsOn(today);
  const next = fold.windows.find(window => window.start > today);
  const governing = fold.windows.find(window => window.start <= today && window.end >= today) ?? next ?? fold.windows.at(-1)!;
  let status: Status;
  let seats: number;
  // A suspension over dead coverage entitles nothing, so it reads EXPIRED, not DEACTIVATED.
  if (!next && graceEnd < today) { status = 'EXPIRED'; seats = fold.seatsOn(last); }
  else if (suspended) { status = 'DEACTIVATED'; seats = seatsToday > 0 ? seatsToday : fold.seatsOn(next?.start ?? last); }
  else if (seatsToday > 0) { status = 'ACTIVE'; seats = seatsToday; }
  else if (next) { status = 'FUTURE'; seats = fold.seatsOn(next.start); }
  else { status = 'EXPIRED_GRACE'; seats = fold.seatsOn(last); }
  return { kind: 'PAID', status, start: governing.start, end: last + 1, graceEnd, staffLimit: toStaffLimit(seats) };
}

function projectTrial(rows: readonly LedgerRow[], today: number): Projection | null {
  const fold = foldLedger(rows);
  if (fold.lastCoveredDay === null) return null;
  const current = fold.windows.find(window => window.start <= today && window.end >= today);
  const next = fold.windows.find(window => window.start > today);
  const governing = current ?? next ?? fold.windows.at(-1)!;
  return {
    kind: 'TRIAL',
    status: current ? 'IN_TRIAL' : next ? 'FUTURE' : 'PENDING',
    start: governing.start,
    end: governing.end + 1,
    graceEnd: null,
    staffLimit: toStaffLimit(fold.seatsOn(governing.start)),
  };
}

/** Returns null when the key holds no ledger rows, so no projection row exists. */
export function project(rows: readonly LedgerRow[], today: number, suspended: boolean): Projection | null {
  if (!rows.length) return null;
  const paidRows = rows.filter(row => row.kind === 'PAID');
  const trialRows = rows.filter(row => row.kind === 'TRIAL');
  const paid = projectPaid(paidRows, today, suspended);
  if (paid && paid.status !== 'EXPIRED') return paid;
  const trial = projectTrial(trialRows, today);
  if (!trial) return paid ?? { kind: null, status: 'EXPIRED', start: null, end: null, graceEnd: null, staffLimit: null };
  if (trial.status !== 'PENDING') return trial;
  // Between two dead folds, the one that outlived the other names the status.
  return paid && paid.end! >= trial.end! ? paid : trial;
}

const LIFECYCLE: Record<Status, Lifecycle> = {
  IN_TRIAL: 'IN_TRIAL', PENDING: 'TRIAL_EXPIRED', ACTIVE: 'ACTIVE', EXPIRED_GRACE: 'GRACE',
  FUTURE: 'FUTURE', DEACTIVATED: 'DEACTIVATED', EXPIRED: 'EXPIRED',
};

export const toLifecycle = (projection: Projection | null): Lifecycle => (projection ? LIFECYCLE[projection.status] : 'NONE');
export const isEntitled = (state: Lifecycle) => state === 'IN_TRIAL' || state === 'ACTIVE' || state === 'GRACE';

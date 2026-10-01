import { UNLIMITED_SEATS, isEntitled, project, toLifecycle, type LedgerRow, type Lifecycle, type Projection } from './fold.ts';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector)!;

/* The row that goes stale */

const rot = $<HTMLElement>('[data-rot]');
const rotDay = $<HTMLInputElement>('[data-rot-day]', rot);
const ROT_END = 30;

function drawRot() {
  const day = Number(rotDay.value);
  const stale = day > ROT_END;
  rot.dataset.stale = String(stale);
  $('[data-rot-out]', rot).textContent = `day ${day}`;
  $('[data-rot-cal]', rot).textContent = String(day);
  $('[data-rot-derived]', rot).textContent = stale ? 'EXPIRED' : 'ACTIVE';
  $('[data-rot-note]', rot).textContent = stale
    ? 'Stored status says ACTIVE. The dates say EXPIRED. Nothing wrote to this row.'
    : 'Stored status and dates agree.';
}

let autoplay: number | undefined;
const stopAutoplay = () => clearInterval(autoplay);
rotDay.addEventListener('input', drawRot);
rotDay.addEventListener('pointerdown', stopAutoplay);
rotDay.addEventListener('keydown', stopAutoplay);
drawRot();
if (!reduceMotion) {
  setTimeout(() => {
    autoplay = setInterval(() => {
      if (Number(rotDay.value) >= 34) return stopAutoplay();
      rotDay.value = String(Number(rotDay.value) + 1);
      drawRot();
    }, 260);
  }, 1200);
}

/* The ledger lab */

interface Fact {
  id: string;
  title: string;
  detail: string;
  filed: number;
  provenance?: string;
  row?: LedgerRow;
  needs?: string;
  on: boolean;
}

const DAYS = 75;
const SUSPENDED_FROM = 34;
const FACTS: Fact[] = [
  { id: 'trial', title: 'Trial granted', detail: 'filed day 1 · unlimited seats · days 1 to 14', filed: 1, provenance: 'TRIAL_GRANT · 301', row: { kind: 'TRIAL', start: 1, end: 14, count: UNLIMITED_SEATS, graceEnd: 14 }, on: true },
  { id: 'sale', title: 'Plan bought', detail: 'filed day 8 · +10 seats · days 8 to 37', filed: 8, provenance: 'SALES_ORDER · 4812 · item 1', row: { kind: 'PAID', start: 8, end: 37, count: 10, graceEnd: 43 }, on: true },
  { id: 'addon', title: 'Extra seats bought', detail: 'filed day 20 · +5 seats · days 20 to 37', filed: 20, provenance: 'SALES_ORDER · 4907 · item 1', row: { kind: 'PAID', start: 20, end: 37, count: 5, graceEnd: 43 }, needs: 'sale', on: true },
  { id: 'fix', title: 'Correction approved', detail: 'filed day 26 · −3 seats · days 26 to 37', filed: 26, provenance: 'CHANGE_REQUEST · 77 · adj 1', row: { kind: 'PAID', start: 26, end: 37, count: -3, graceEnd: 37 }, needs: 'sale', on: true },
  { id: 'renewal', title: 'Renewal bought early', detail: 'filed day 30 · +10 seats · days 38 to 67', filed: 30, provenance: 'SALES_ORDER · 5120 · item 1', row: { kind: 'PAID', start: 38, end: 67, count: 10, graceEnd: 73 }, needs: 'sale', on: true },
  { id: 'suspend', title: 'Account suspended', detail: `from day ${SUSPENDED_FROM} · a suspension, not a ledger row`, filed: SUSPENDED_FROM, on: false },
];
const fact = (id: string) => FACTS.find(item => item.id === id)!;

const lab = $<HTMLElement>('[data-lab]');
const factsEl = $<HTMLElement>('[data-lab-facts]', lab);
const chartEl = $<HTMLElement>('[data-lab-chart]', lab);
const dayEl = $<HTMLInputElement>('[data-lab-day]', lab);
const replayNote = $<HTMLElement>('[data-lab-replay-note]', lab);
let fresh: string | null = null;

const rowsAt = (day: number) => FACTS.filter(item => item.on && item.row && item.filed <= day).map(item => item.row!);
const suspendedAt = (day: number) => fact('suspend').on && day >= SUSPENDED_FROM;
const signed = (count: number) => (count >= UNLIMITED_SEATS ? 'unlimited' : `${count < 0 ? '−' : '+'}${Math.abs(count)}`);
const seatWord = (limit: number | null) => (limit === -1 ? 'unlimited seats' : `${limit} seat${limit === 1 ? '' : 's'}`);

const STATE_LABEL: Record<Lifecycle, string> = {
  NONE: 'NONE', IN_TRIAL: 'IN TRIAL', TRIAL_EXPIRED: 'TRIAL EXPIRED', ACTIVE: 'ACTIVE',
  GRACE: 'GRACE', FUTURE: 'FUTURE', DEACTIVATED: 'DEACTIVATED', EXPIRED: 'EXPIRED',
};

function drawFacts() {
  factsEl.innerHTML = FACTS.map(item => {
    const blocked = item.needs !== undefined && !fact(item.needs).on;
    return `<label class="fact fact-${item.id}"><input type="checkbox" data-fact="${item.id}"${item.on ? ' checked' : ''}${blocked ? ' disabled' : ''}><span><b>${item.title}</b><small>${item.detail}</small></span></label>`;
  }).join('');
}

function why(projection: Projection | null, state: Lifecycle, today: number): string {
  const paidToday = rowsAt(today).filter(row => row.kind === 'PAID' && row.start <= today && row.end >= today);
  const trialToday = rowsAt(today).some(row => row.kind === 'TRIAL' && row.start <= today && row.end >= today);
  switch (state) {
    case 'NONE': return 'The ledger holds no rows for this account on this day, so no projection row exists.';
    case 'IN_TRIAL': return 'The trial window covers today and no paid coverage is in force.';
    case 'TRIAL_EXPIRED': return 'The trial ended and nothing was bought.';
    case 'ACTIVE': {
      const sum = paidToday.length > 1 ? `${paidToday.map(row => signed(row.count)).join(' ')} = ${projection!.staffLimit}` : signed(paidToday[0].count);
      return `Paid rows covering day ${today}: ${sum}.${trialToday ? ' The trial row is still there. Paid coverage wins.' : ''}`;
    }
    case 'GRACE': return `Paid coverage ended on day ${projection!.end! - 1}. Grace runs through day ${projection!.graceEnd}.`;
    case 'FUTURE': return `Coverage starts on day ${projection!.start}. Coverage that has not started grants nothing.`;
    case 'DEACTIVATED': return 'A suspension is open while the paid window is live. The rows are unchanged.';
    case 'EXPIRED': return projection!.kind
      ? `Coverage and grace both ended.${suspendedAt(today) ? ' A suspension over ended coverage still reads as expired.' : ''}`
      : 'The rows net to zero coverage.';
  }
}

function drawChart(today: number) {
  const width = chartEl.clientWidth || 720;
  const pad = width < 520 ? 8 : 16;
  const cell = (width - pad * 2) / DAYS;
  const x = (day: number) => pad + (day - 1) * cell;
  const lanes = FACTS.filter(item => item.row);
  const laneTop = 30, laneHeight = 24, laneGap = 6;
  const foldTop = laneTop + lanes.length * (laneHeight + laneGap) + 34, foldHeight = 120, maxSeats = 16;
  const y = (seats: number) => foldTop + foldHeight - (Math.min(seats, maxSeats) / maxSeats) * foldHeight;
  const stripTop = foldTop + foldHeight + 34, stripHeight = 24;
  const height = stripTop + stripHeight + 26;
  const out: string[] = [];

  out.push(`<text class="c-label" x="${today < 22 ? width - pad : pad}" y="12"${today < 22 ? ' text-anchor="end"' : ''}>LEDGER ROWS</text>`);
  lanes.forEach((item, lane) => {
    if (!item.on) return;
    const row = item.row!;
    const top = laneTop + lane * (laneHeight + laneGap);
    const barWidth = (row.end - row.start + 1) * cell - 1;
    const type = row.kind === 'TRIAL' ? 'trial' : row.count < 0 ? 'neg' : 'pos';
    const ghost = item.filed > today;
    out.push(`<rect class="c-bar c-${type}${ghost ? ' c-ghost' : ''}${fresh === item.id ? ' c-fresh' : ''}" x="${x(row.start)}" y="${top}" width="${barWidth}" height="${laneHeight}" rx="3"/>`);
    if (barWidth > 34) out.push(`<text class="c-bar-text${ghost ? ' c-ghost-text' : ''}" x="${x(row.start) + 7}" y="${top + 15}">${row.kind === 'TRIAL' ? 'trial' : signed(row.count)}</text>`);
  });

  out.push(`<text class="c-label" x="${pad}" y="${foldTop - 12}">${width < 520 ? 'SEATS ON EACH DAY' : 'SEATS ON EACH DAY, AS THE LEDGER STANDS TODAY'}</text>`);
  for (const seats of [0, 5, 10, 15]) {
    out.push(`<line class="c-grid" x1="${pad}" x2="${width - pad}" y1="${y(seats)}" y2="${y(seats)}"/>`);
    if (seats) out.push(`<text class="c-tick" x="${width - pad}" y="${y(seats) - 3}" text-anchor="end">${seats}</text>`);
  }
  const rows = rowsAt(today);
  for (const row of rows.filter(item => item.kind === 'TRIAL')) {
    out.push(`<rect class="c-trial-band" x="${x(row.start)}" y="${foldTop}" width="${(row.end - row.start + 1) * cell}" height="${foldHeight}"/>`);
    if (cell * 14 > 70) out.push(`<text class="c-tick" x="${x(row.start) + 6}" y="${foldTop + 13}">trial, unlimited</text>`);
  }
  const seatsOn = (day: number) => rows.filter(row => row.kind === 'PAID' && row.start <= day && row.end >= day).reduce((sum, row) => sum + row.count, 0);
  let path = `M${x(1)} ${y(0)}`;
  let previous = 0;
  for (let day = 1; day <= DAYS + 1; day++) {
    const seats = day > DAYS ? 0 : seatsOn(day);
    if (seats !== previous) {
      path += `L${x(day)} ${y(previous)}L${x(day)} ${y(seats)}`;
      if (seats > 0) out.push(`<text class="c-step-text" x="${x(day) + 4}" y="${y(seats) - 5}">${seats}</text>`);
    }
    previous = seats;
  }
  out.push(`<path class="c-area" d="${path}L${x(DAYS + 1)} ${y(0)}Z"/>`);

  out.push(`<text class="c-label" x="${pad}" y="${stripTop - 12}">STATE ON EACH DAY</text>`);
  let start = 1;
  let current = toLifecycle(project(rowsAt(1), 1, suspendedAt(1)));
  for (let day = 2; day <= DAYS + 1; day++) {
    const state = day > DAYS ? null : toLifecycle(project(rowsAt(day), day, suspendedAt(day)));
    if (state === current) continue;
    const segmentWidth = (day - start) * cell;
    out.push(`<rect class="c-state c-state-${current}" x="${x(start)}" y="${stripTop}" width="${segmentWidth - 1}" height="${stripHeight}" rx="2"/>`);
    if (segmentWidth > STATE_LABEL[current].length * 7 + 12) out.push(`<text class="c-state-text c-on-${current}" x="${x(start) + 6}" y="${stripTop + 16}">${STATE_LABEL[current]}</text>`);
    start = day;
    current = state!;
  }

  for (const day of [1, 10, 20, 30, 40, 50, 60, 70]) {
    out.push(`<text class="c-tick" x="${x(day)}" y="${height - 6}">${day === 1 ? 'day 1' : day}</text>`);
  }
  const todayX = x(today) + cell / 2;
  out.push(`<line class="c-today" x1="${todayX}" x2="${todayX}" y1="8" y2="${stripTop + stripHeight + 4}"/><circle class="c-today-dot" cx="${todayX}" cy="8" r="5"/><text class="c-today-text" x="${todayX + (today > DAYS - 9 ? -10 : 10)}" y="12"${today > DAYS - 9 ? ' text-anchor="end"' : ''}>day ${today}</text>`);

  chartEl.innerHTML = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="c-hatch" x1="0" y1="0" x2="0" y2="6"/></pattern></defs>${out.join('')}</svg>`;
  fresh = null;
}

function draw() {
  const today = Number(dayEl.value);
  const projection = project(rowsAt(today), today, suspendedAt(today));
  const state = toLifecycle(projection);
  const entitled = isEntitled(state);

  $('[data-lab-day-out]', lab).textContent = `day ${today}`;
  $<HTMLElement>('[data-lab-verdict]', lab).dataset.entitled = String(entitled);
  $('[data-lab-state]', lab).textContent = STATE_LABEL[state];
  $('[data-lab-answer]', lab).textContent = entitled ? `Entitled, ${seatWord(projection!.staffLimit)}` : 'Not entitled';
  $('[data-lab-why]', lab).textContent = why(projection, state, today);

  const included = FACTS.filter(item => item.on && item.row).sort((a, b) => a.filed - b.filed);
  const filed = included.filter(item => item.filed <= today).length;
  $('[data-lab-count]', lab).textContent = `${filed} row${filed === 1 ? '' : 's'} on day ${today}`;
  $('[data-lab-rows]', lab).innerHTML = (included.map(item => {
    const row = item.row!;
    const pending = item.filed > today;
    return `<tr class="${pending ? 'pending' : ''}"><td>day ${item.filed}${pending ? ' <i>not yet</i>' : ''}</td><td>${item.provenance}</td><td>${row.start} to ${row.end}</td><td class="${row.count < 0 ? 'neg' : ''}">${signed(row.count)}</td></tr>`;
  }).join('') || '<tr><td colspan="4">No rows.</td></tr>')
    + (suspendedAt(today) ? `<tr class="suspension"><td>day ${SUSPENDED_FROM}</td><td colspan="3">Suspension open. It lives in its own table.</td></tr>` : '');

  const fields: [string, string][] = !projection
    ? [['row', 'none']]
    : projection.kind === 'TRIAL'
      ? [['kind', 'TRIAL'], ['status', projection.status], ['staffLimit', String(projection.staffLimit)], ['trialStartDate', `day ${projection.start}`], ['trialEndDate', `day ${projection.end}`]]
      : projection.kind === 'PAID'
        ? [['kind', 'PAID'], ['status', projection.status], ['staffLimit', String(projection.staffLimit)], ['startDate', `day ${projection.start}`], ['endDate', `day ${projection.end}`], ['graceEndDate', `day ${projection.graceEnd}`]]
        : [['kind', 'null'], ['status', projection.status]];
  $('[data-lab-projection]', lab).innerHTML = fields.map(([name, value]) => `<div><dt>${name}</dt><dd>${value}</dd></div>`).join('');

  drawChart(today);
}

factsEl.addEventListener('change', event => {
  const input = event.target as HTMLInputElement;
  const item = fact(input.dataset.fact!);
  item.on = input.checked;
  if (item.on) fresh = item.id;
  for (const dependent of FACTS) if (dependent.needs === item.id && !item.on) dependent.on = false;
  replayNote.textContent = '';
  drawFacts();
  $<HTMLInputElement>(`[data-fact="${item.id}"]`, factsEl).focus();
  draw();
});

dayEl.addEventListener('input', draw);

$<HTMLButtonElement>('[data-lab-replay]', lab).addEventListener('click', () => {
  const today = Number(dayEl.value);
  const sale = fact('sale');
  replayNote.textContent = sale.on && sale.filed <= today
    ? 'Order 4812\'s webhook arrived again. Its provenance is already in the ledger. 0 rows appended.'
    : `No plan has been bought by day ${today}, so there is no webhook to repeat.`;
});

function scrub(event: PointerEvent) {
  const box = chartEl.getBoundingClientRect();
  const pad = box.width < 520 ? 8 : 16;
  const day = Math.floor(((event.clientX - box.left - pad) / (box.width - pad * 2)) * DAYS) + 1;
  dayEl.value = String(Math.max(1, Math.min(DAYS, day)));
  draw();
}
chartEl.addEventListener('pointerdown', event => { chartEl.setPointerCapture(event.pointerId); scrub(event); });
chartEl.addEventListener('pointermove', event => { if (chartEl.hasPointerCapture(event.pointerId)) scrub(event); });

new ResizeObserver(() => drawChart(Number(dayEl.value))).observe(chartEl);
drawFacts();
draw();

/* Section nav and reveals */

const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
const spy = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const link of links) link.dataset.nav === entry.target.id ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current');
  }
}, { rootMargin: '-45% 0px -50% 0px' });
for (const link of links) spy.observe(document.getElementById(link.dataset.nav!)!);

if (!reduceMotion) {
  document.documentElement.classList.add('js');
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const element of document.querySelectorAll('.reveal')) reveal.observe(element);
}

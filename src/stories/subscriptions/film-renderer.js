const COLORS = ['#ffb168', '#87bbdd', '#ed8f87'];
const WHITE = '#e6ded2';
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a, b, t) => a + (b - a) * t;

/** Passive illustration: the host owns state, events and animation timing. */
export function createFilmRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 1, h = 1, dpr = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, rect.width); h = Math.max(1, rect.height);
    dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  }
  function line(draw, color = WHITE, alpha = 1, width = 1, glow = 0) {
    ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width;
    ctx.shadowColor = color; ctx.shadowBlur = glow; ctx.beginPath(); draw(ctx); ctx.stroke(); ctx.restore();
  }
  function dot(x, y, r, color, alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function text(value, x, y, color = WHITE, size = 12, align = 'left', alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.textAlign = align;
    ctx.font = `400 ${Math.max(12, size)}px "DM Sans", system-ui, sans-serif`;
    ctx.fillText(value, x, y); ctx.restore();
  }
  function draw(state, seconds = 0, reducedMotion = false) {
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const mobile = w < 650, scene = clamp(state.scene || 0, 0, 5), phase = clamp(state.phase || 0);
    const left = w * (mobile ? .09 : .45), right = w * (mobile ? .91 : .94), span = right - left;
    const top = h * (mobile ? .64 : .48), bottom = h * (mobile ? .88 : .85), gap = Math.min(48, h * .057);
    const time = reducedMotion ? 0 : seconds;
    const day = scene === 3 ? 25 + Math.min(6, Math.floor(phase * 7)) : scene >= 4 ? 31 : 25;
    const rows = [
      { start: 1, end: 45, amount: '+20', name: 'Purchase', color: COLORS[0] },
      { start: 15, end: 30, amount: '+10', name: 'Temporary', color: COLORS[1] },
      { start: 20, end: 45, amount: '−4', name: 'Correction', color: COLORS[2] }
    ];
    const cx = (left + right) / 2;
    const ambient = ctx.createRadialGradient(cx, top + gap, 0, cx, top + gap, span * .65);
    ambient.addColorStop(0, '#87bbdd0b'); ambient.addColorStop(1, '#080b1000');
    ctx.fillStyle = ambient; ctx.fillRect(left - 12, top - 35, span + 24, bottom - top + 35);
    if (scene <= 1) {
      // Scene 1 shows the same three records faded: the old table never stored them.
      const reveal = scene === 0 ? clamp((phase - .18) / .65) : 1, alpha = scene === 0 ? reveal : .3;
      line(c => c.arc(cx, top + gap + 20, 5 + reveal * 35, 0, Math.PI * 2), WHITE, .35 * (1 - reveal), 1, 15);
      rows.forEach((r, i) => {
        const x = mix(cx, left + span * (.18 + i * .32), reveal);
        const y = top + gap + Math.sin(i * 2 + time * .4) * 3;
        dot(x, y + 20, 3, r.color, alpha);
        text(r.amount, x, y, r.color, 27, 'center', alpha);
        text(r.name, x, y + 45, r.color, 12, 'center', alpha);
      });
      text(scene === 0 ? 'Three records behind one answer' : 'Only the total was stored. The records behind it were not.', cx, top + gap * 3.2, WHITE, 12, 'center', reveal * .75);
      ctx.restore(); return;
    }
    if (scene <= 3) {
      const xDay = d => left + span * (d - 1) / 44;
      const axis = top + gap * 2.9;
      rows.forEach((r, i) => {
        const y = top + gap * i, a = xDay(r.start), b = xDay(r.end);
        const active = day >= r.start && day <= r.end;
        const alpha = scene >= 3 && !active ? .28 : .95;
        line(c => { c.moveTo(a, y); c.lineTo(b, y); }, r.color, alpha * .08, 10, 15);
        line(c => { c.moveTo(a, y); c.lineTo(b, y); }, r.color, alpha, 2, 12);
        dot(a, y, 3, r.color, alpha); dot(b, y, 3, r.color, alpha);
        const count = i === 0 ? 20 : i === 1 ? 10 : 4;
        for (let n = 0; n < count; n++) dot(mix(a, b, (n + .5) / count), y + Math.sin(time * .5 + n) * (reducedMotion ? 0 : 1), 1.8, r.color, alpha * .7);
        text(`${r.amount}  ${r.name}`, a, y - 14, r.color, 12, 'left', alpha);
        text(`days ${r.start}–${r.end}`, b, y + 18, WHITE, 12, 'right', Math.max(.48, alpha * .72));
        if (scene >= 3 && active) dot(xDay(day), y, 4, r.color);
      });
      line(c => { c.moveTo(left, axis); c.lineTo(right, axis); }, WHITE, .2);
      [1, 15, 30, 45].forEach(d => {
        line(c => { c.moveTo(xDay(d), axis - 3); c.lineTo(xDay(d), axis + 3); }, WHITE, .4);
        text(String(d), xDay(d), axis + 21, WHITE, 12, 'center', .7);
      });
      if (scene >= 3) {
        ctx.save(); ctx.setLineDash([2, 5]);
        line(c => { c.moveTo(xDay(day), top - 28); c.lineTo(xDay(day), axis); }, WHITE, .45); ctx.restore();
        dot(xDay(day), axis, 3, WHITE);
        text(`Day ${day}`, xDay(day), top - 36, WHITE, 12, 'center');
      }
      text(scene === 2 ? 'All three records are already applied' : day > 30 ? '20 + 0 − 4 = 16' : '20 + 10 − 4 = 26', cx, Math.min(bottom - 5, axis + 51), WHITE, 13, 'center', .85);
      ctx.restore(); return;
    }
    // The source ledger remains visible while its answer feeds every reader.
    const ledgerEnd = left + span * (mobile ? .42 : .38);
    const projectionX = left + span * (mobile ? .70 : .64);
    const projectionY = top + gap * .88;
    const radius = mobile ? 29 : 36;
    rows.forEach((r, i) => {
      const y = top + i * gap;
      text(`${r.amount} ${r.name}`, left, y - 13, r.color);
      line(c => { c.moveTo(left, y); c.lineTo(ledgerEnd, y); }, r.color, i === 1 ? .3 : .9, 2, 10);
      dot(left, y, 2.5, r.color, i === 1 ? .3 : 1);
      text(`days ${r.start}–${r.end}`, left, y + 18, WHITE, 12, 'left', .7);
      line(c => { c.moveTo(ledgerEnd, y); c.bezierCurveTo(ledgerEnd + span * .1, y, projectionX - radius - 14, projectionY, projectionX - radius, projectionY); }, r.color, i === 1 ? .14 : .4);
      if (i !== 1 && !reducedMotion) {
        const u = (time * .16 + i * .33) % 1;
        dot(mix(ledgerEnd, projectionX - radius, u), mix(y, projectionY, u), 2, r.color, .7);
      }
    });
    line(c => c.arc(projectionX, projectionY, radius, 0, Math.PI * 2), WHITE, .65, 1, 12);
    text('16', projectionX, projectionY + 9, WHITE, 28, 'center');
    text('Stored answer', projectionX, projectionY - radius - 14, WHITE, 12, 'center', .8);
    text('Day 31', projectionX, projectionY + radius + 19, WHITE, 12, 'center', .65);
    const readerY = Math.min(bottom - (mobile ? 60 : 27), top + gap * 3.8);
    ['Login checks', 'Billing page', 'Staff access'].forEach((name, i) => {
      const x = left + span * (.13 + i * .37);
      line(c => { c.moveTo(projectionX, projectionY + radius + 27); c.bezierCurveTo(projectionX, readerY - 21, x, readerY - 21, x, readerY); }, WHITE, .25);
      dot(x, readerY, 3, WHITE, .8); text(name, x, readerY + 23, WHITE, 12, 'center', .85);
    });
    ctx.restore();
  }
  resize();
  return { resize, draw };
}

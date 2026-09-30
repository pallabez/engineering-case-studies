const FACTS = [
  { key: 'base', name: 'Purchase', amount: 20, start: 1, end: 45 },
  { key: 'temp', name: 'Temporary', amount: 10, start: 15, end: 30 },
  { key: 'correction', name: 'Correction', amount: -4, start: 20, end: 45 },
  { key: 'renewal', name: 'Next purchase', amount: 24, start: 46, end: 60 }
];
export function computeCoverage(day, options = {}) {
  const chosenDay = Math.max(1, Math.min(60, Math.round(Number(day) || 1)));
  const enabled = { base: true, temp: true, correction: true, renewal: false, ...options };
  enabled.base = true;
  const active = FACTS.filter(fact => enabled[fact.key] && chosenDay >= fact.start && chosenDay <= fact.end);
  return { day: chosenDay, total: active.reduce((sum, fact) => sum + fact.amount, 0), active, enabled };
}
export function initPlayground(root) {
  if (!root) throw new Error('A playground root is required.');
  const query = selector => root.querySelector(selector);
  const slider = query('[data-lab-slider]');
  if (!slider) throw new Error('The playground requires a day slider.');
  const options = [...root.querySelectorAll('[data-lab-option]')];
  const presets = [...root.querySelectorAll('[data-lab-preset]')];
  const listeners = [];
  const listen = (element, event, callback) => { element.addEventListener(event, callback); listeners.push(() => element.removeEventListener(event, callback)); };
  const setText = (selector, text) => { const element = query(selector); if (element) element.textContent = text; };
  const signed = number => number < 0 ? `−${Math.abs(number)}` : `+${number}`;
  const render = () => {
    const config = Object.fromEntries(options.map(input => [input.dataset.labOption, input.checked]));
    const state = computeCoverage(slider.value, config);
    slider.value = String(state.day);
    slider.setAttribute('aria-valuetext', `Day ${state.day}, ${state.total} seats, ${state.active.length} active facts`);
    root.style.setProperty('--lab-position', `${(state.day - 0.5) / 60 * 100}%`);
    setText('[data-lab-day]', `Day ${state.day}`);
    setText('[data-lab-slider-day]', String(state.day));
    setText('[data-lab-total]', String(state.total));
    setText('[data-lab-status]', `${state.active.length} active ${state.active.length === 1 ? 'fact' : 'facts'}`);
    const expression = state.active.map((fact, index) => index === 0 ? String(fact.amount).replace('-', '−') : `${fact.amount < 0 ? '−' : '+'} ${Math.abs(fact.amount)}`).join(' ');
    setText('[data-lab-equation]', `${expression || '0'} = ${state.total} seats`);
    setText('[data-lab-facts]', state.active.length ? `${state.active.map(fact => `${fact.name} ${signed(fact.amount)}`).join(', ')} count on day ${state.day}.` : `No coverage windows count on day ${state.day}.`);
    FACTS.forEach(fact => {
      const row = query(`[data-lab-row="${fact.key}"]`);
      if (!row) return;
      const active = state.active.some(item => item.key === fact.key);
      row.dataset.enabled = String(Boolean(state.enabled[fact.key]));
      row.dataset.active = String(active);
      const label = row.querySelector('[data-lab-state]');
      if (label) label.textContent = !state.enabled[fact.key] ? 'Not included' : active ? 'Counts today' : state.day < fact.start ? 'Starts later' : 'Window ended';
    });
    presets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.labPreset) === state.day && state.enabled.temp && state.enabled.correction && !state.enabled.renewal)));
  };
  listen(slider, 'input', render);
  options.forEach(input => listen(input, 'change', render));
  presets.forEach(button => listen(button, 'click', () => {
    slider.value = button.dataset.labPreset;
    options.forEach(input => { input.checked = input.dataset.labOption !== 'renewal'; });
    render();
  }));
  render();
  return { resize: render, destroy() { listeners.forEach(remove => remove()); } };
}

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const OPEN_DURATION = 430;
const CLOSE_DURATION = 320;
const states = new WeakMap();

function stateFor(card) {
  let state = states.get(card);
  if (!state) {
    state = { target: null, animations: [], token: 0 };
    states.set(card, state);
  }
  return state;
}

function cancel(state) {
  for (const animation of state.animations) {
    try { animation.cancel(); } catch {}
  }
  state.animations = [];
}

function done(animation) { return animation.finished.catch(() => undefined); }

async function animateCard(card, targetOpen, reduceMotion) {
  const summary = card.querySelector(':scope > .main10-card__summary');
  const panel = card.querySelector(':scope > .main10-card__panel');
  const body = panel?.querySelector('.main10-card__panel-body');
  const detail = panel?.querySelector('.main10-card__detail-slot');
  if (!summary || !panel || !body || !detail) return;

  const state = stateFor(card);
  const token = ++state.token;
  cancel(state);
  state.target = targetOpen;

  if (reduceMotion || typeof panel.animate !== 'function') {
    card.open = targetOpen;
    panel.style.height = '';
    panel.style.overflow = '';
    state.target = null;
    return;
  }

  const startHeight = Math.max(0, panel.getBoundingClientRect().height);
  if (targetOpen && !card.open) card.open = true;
  const targetHeight = targetOpen ? panel.scrollHeight : 0;
  panel.style.height = `${startHeight}px`;
  panel.style.overflow = 'hidden';

  const panelAnimation = panel.animate(
    [{ height: `${startHeight}px`, opacity: targetOpen ? .68 : 1 }, { height: `${targetHeight}px`, opacity: targetOpen ? 1 : .66 }],
    { duration: targetOpen ? OPEN_DURATION : CLOSE_DURATION, delay: targetOpen ? 45 : 0, easing: targetOpen ? 'cubic-bezier(.22,.88,.32,1)' : 'cubic-bezier(.4,0,.6,1)', fill: 'both' },
  );

  const summaryAnimation = summary.animate(
    targetOpen ? [{ transform: 'translateY(1px)' }, { transform: 'translateY(-3px)' }] : [{ transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }],
    { duration: targetOpen ? 250 : 190, easing: 'cubic-bezier(.22,.88,.32,1)', fill: 'both' },
  );

  const bodyAnimation = body.animate(
    targetOpen ? [{ opacity: .22, transform: 'translateY(-8px) scale(.992)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 1, transform: 'none' }, { opacity: .2, transform: 'translateY(-5px) scale(.994)' }],
    { duration: targetOpen ? 310 : 170, delay: targetOpen ? 115 : 0, easing: targetOpen ? 'cubic-bezier(.2,.88,.28,1)' : 'ease-in', fill: 'both' },
  );

  const detailAnimation = detail.animate(
    targetOpen ? [{ opacity: .18, transform: 'translateY(-5px)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 1, transform: 'none' }, { opacity: .18, transform: 'translateY(-3px)' }],
    { duration: targetOpen ? 260 : 130, delay: targetOpen ? 185 : 0, easing: 'ease-out', fill: 'both' },
  );

  state.animations = [panelAnimation, summaryAnimation, bodyAnimation, detailAnimation];
  await Promise.all(state.animations.map(done));
  if (state.token !== token || state.target !== targetOpen) return;

  if (!targetOpen) card.open = false;
  panel.style.height = '';
  panel.style.overflow = '';
  cancel(state);
  state.target = null;
}

export function initMain10Glass() {
  const cards = document.querySelectorAll('[data-main10-card]');
  if (!cards.length) return;
  const motionPreference = window.matchMedia(MOTION_QUERY);

  for (const card of cards) {
    const summary = card.querySelector(':scope > .main10-card__summary');
    if (!summary) continue;
    summary.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;
      if (motionPreference.matches || typeof Element.prototype.animate !== 'function') return;
      const state = stateFor(card);
      const targetOpen = state.target === null ? !card.open : !state.target;
      event.preventDefault();
      void animateCard(card, targetOpen, false);
    });
  }
}

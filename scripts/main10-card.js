const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const OPEN_DURATION = 550;
const CLOSE_DURATION = 360;
const states = new WeakMap();

function getState(card) {
  let state = states.get(card);
  if (!state) {
    state = { target: null, animations: [], token: 0 };
    states.set(card, state);
  }
  return state;
}

function cancelAnimations(state) {
  for (const animation of state.animations) {
    try { animation.cancel(); } catch {}
  }
  state.animations = [];
}

function finished(animation) {
  return animation.finished.catch(() => undefined);
}

async function animateCard(card, targetOpen, reduceMotion) {
  const panel = card.querySelector(':scope > .main10-card__panel');
  const body = panel?.querySelector('.main10-card__panel-body');
  if (!panel || !body) return;

  const state = getState(card);
  const token = ++state.token;
  cancelAnimations(state);
  state.target = targetOpen;

  if (reduceMotion || typeof panel.animate !== 'function') {
    card.open = targetOpen;
    panel.style.height = targetOpen ? 'auto' : '';
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
    [
      { height: `${startHeight}px`, opacity: targetOpen ? 0.18 : 1 },
      { height: `${targetHeight}px`, opacity: targetOpen ? 1 : 0 },
    ],
    {
      duration: targetOpen ? OPEN_DURATION : CLOSE_DURATION,
      easing: targetOpen ? 'cubic-bezier(.22,1,.36,1)' : 'cubic-bezier(.4,0,.6,1)',
      fill: 'both',
    },
  );

  const bodyAnimation = body.animate(
    [
      { transform: targetOpen ? 'translateY(-10px)' : 'translateY(0)', opacity: targetOpen ? 0.28 : 1 },
      { transform: targetOpen ? 'translateY(0)' : 'translateY(-5px)', opacity: targetOpen ? 1 : 0.18 },
    ],
    {
      duration: targetOpen ? 440 : 220,
      delay: targetOpen ? 55 : 0,
      easing: targetOpen ? 'cubic-bezier(.22,1,.36,1)' : 'ease-in',
      fill: 'both',
    },
  );

  state.animations = [panelAnimation, bodyAnimation];
  await Promise.all(state.animations.map(finished));

  if (state.token !== token || state.target !== targetOpen) return;

  cancelAnimations(state);
  if (targetOpen) {
    card.open = true;
    panel.style.height = 'auto';
    panel.style.overflow = '';
  } else {
    card.open = false;
    panel.style.height = '';
    panel.style.overflow = '';
  }
  state.target = null;
}

export function initMain10Cards() {
  const cards = document.querySelectorAll('[data-main10-card]');
  if (!cards.length) return;

  const motionPreference = window.matchMedia(MOTION_QUERY);

  for (const card of cards) {
    const summary = card.querySelector(':scope > .main10-card__summary');
    if (!summary) continue;

    summary.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;
      if (motionPreference.matches || typeof Element.prototype.animate !== 'function') return;

      const state = getState(card);
      const targetOpen = state.target === null ? !card.open : !state.target;
      event.preventDefault();
      void animateCard(card, targetOpen, false);
    });
  }
}

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const OPEN_DURATION = 520;
const CLOSE_DURATION = 360;
const states = new WeakMap();

function stateFor(card) {
  let state = states.get(card);
  if (!state) {
    state = { target: null, animations: [], token: 0 };
    states.set(card, state);
  }
  return state;
}

function cancelAll(state) {
  for (const animation of state.animations) {
    try { animation.cancel(); } catch {}
  }
  state.animations = [];
}

function done(animation) {
  return animation.finished.catch(() => undefined);
}

async function setOpen(card, targetOpen, reduceMotion) {
  const panel = card.querySelector(':scope > .main10-card__panel');
  const body = panel?.querySelector('.main10-card__panel-body');
  if (!panel || !body) return;

  const state = stateFor(card);
  const token = ++state.token;
  cancelAll(state);
  state.target = targetOpen;

  if (reduceMotion || typeof panel.animate !== 'function') {
    card.open = targetOpen;
    panel.style.height = targetOpen ? 'auto' : '';
    panel.style.opacity = targetOpen ? '1' : '';
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
      { height: `${startHeight}px`, opacity: targetOpen ? 0.12 : 1 },
      { height: `${targetHeight}px`, opacity: targetOpen ? 1 : 0 },
    ],
    {
      duration: targetOpen ? OPEN_DURATION : CLOSE_DURATION,
      easing: targetOpen ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,.7,1)',
      fill: 'both',
    },
  );

  const bodyAnimation = body.animate(
    [
      {
        transform: targetOpen ? 'translateY(-12px) scale(.965)' : 'translateY(0) scale(1)',
        opacity: targetOpen ? 0.18 : 1,
        filter: targetOpen ? 'brightness(.72)' : 'brightness(1)',
      },
      {
        transform: targetOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(.985)',
        opacity: targetOpen ? 1 : 0.14,
        filter: targetOpen ? 'brightness(1)' : 'brightness(.8)',
      },
    ],
    {
      duration: targetOpen ? 460 : 230,
      delay: targetOpen ? 70 : 0,
      easing: targetOpen ? 'cubic-bezier(.16,1,.3,1)' : 'ease-in',
      fill: 'both',
    },
  );

  state.animations = [panelAnimation, bodyAnimation];
  await Promise.all(state.animations.map(done));

  if (state.token !== token || state.target !== targetOpen) return;

  cancelAll(state);
  if (targetOpen) {
    card.open = true;
    panel.style.height = 'auto';
    panel.style.opacity = '1';
    panel.style.overflow = '';
  } else {
    card.open = false;
    panel.style.height = '';
    panel.style.opacity = '';
    panel.style.overflow = '';
  }
  state.target = null;
}

export function initMain10Space() {
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
      void setOpen(card, targetOpen, false);
    });
  }
}

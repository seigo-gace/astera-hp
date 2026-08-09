const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const OPEN_DURATION = 470;
const CLOSE_DURATION = 380;

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

function readTransform(element, fallback) {
  const transform = getComputedStyle(element).transform;
  return transform === 'none' ? fallback : transform;
}

async function animateCard(card, targetOpen, reduceMotion) {
  const summary = card.querySelector(':scope > .main10-card__summary');
  const panel = card.querySelector(':scope > .main10-card__panel');
  const body = panel?.querySelector('.main10-card__panel-body');
  const detail = panel?.querySelector('.main10-card__detail-slot');

  if (!summary || !panel || !body || !detail) return;

  const state = getState(card);
  const token = ++state.token;

  cancelAnimations(state);
  state.target = targetOpen;

  if (reduceMotion || typeof panel.animate !== 'function') {
    card.open = targetOpen;
    panel.style.height = '';
    panel.style.overflow = '';
    card.removeAttribute('data-main10-motion');
    state.target = null;
    return;
  }

  const startHeight = Math.max(0, panel.getBoundingClientRect().height);
  const lidStart = readTransform(summary, 'translateZ(8px)');
  const bodyStyle = getComputedStyle(body);
  const detailStyle = getComputedStyle(detail);

  card.setAttribute('data-main10-motion', 'active');

  if (targetOpen && !card.open) card.open = true;

  const targetHeight = targetOpen ? panel.scrollHeight : 0;
  panel.style.height = `${startHeight}px`;
  panel.style.overflow = 'hidden';

  const lidTarget = targetOpen
    ? 'translateY(-2px) translateZ(14px) rotateX(-0.45deg)'
    : 'translateY(0) translateZ(8px) rotateX(0deg)';

  const panelAnimation = panel.animate(
    [{ height: `${startHeight}px` }, { height: `${targetHeight}px` }],
    {
      duration: targetOpen ? OPEN_DURATION : CLOSE_DURATION,
      delay: targetOpen ? 55 : 20,
      easing: targetOpen ? 'cubic-bezier(.22,1,.36,1)' : 'cubic-bezier(.4,0,.6,1)',
      fill: 'both',
    },
  );

  const lidAnimation = summary.animate(
    [{ transform: lidStart }, { transform: lidTarget }],
    {
      duration: targetOpen ? 250 : 210,
      delay: targetOpen ? 0 : 55,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'both',
    },
  );

  const bodyAnimation = body.animate(
    [
      {
        opacity: bodyStyle.opacity,
        transform: bodyStyle.transform === 'none' ? 'none' : bodyStyle.transform,
      },
      {
        opacity: targetOpen ? 1 : 0,
        transform: targetOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(.993)',
      },
    ],
    {
      duration: targetOpen ? 240 : 150,
      delay: targetOpen ? 135 : 0,
      easing: targetOpen ? 'cubic-bezier(.22,1,.36,1)' : 'ease-in',
      fill: 'both',
    },
  );

  const detailAnimation = detail.animate(
    [
      {
        opacity: detailStyle.opacity,
        transform: detailStyle.transform === 'none' ? 'none' : detailStyle.transform,
      },
      {
        opacity: targetOpen ? 0.72 : 0.38,
        transform: targetOpen ? 'translateY(0)' : 'translateY(-3px)',
      },
    ],
    {
      duration: targetOpen ? 190 : 120,
      delay: targetOpen ? 220 : 0,
      easing: 'ease-out',
      fill: 'both',
    },
  );

  state.animations = [panelAnimation, lidAnimation, bodyAnimation, detailAnimation];
  await Promise.all(state.animations.map(finished));

  if (state.token !== token || state.target !== targetOpen) return;

  if (!targetOpen) card.open = false;

  panel.style.height = '';
  panel.style.overflow = '';
  card.removeAttribute('data-main10-motion');
  cancelAnimations(state);
  state.target = null;
}

export function initMain10Chassis() {
  const cards = document.querySelectorAll('[data-main10-card]');
  if (!cards.length) return;

  const motionPreference = window.matchMedia(MOTION_QUERY);

  for (const card of cards) {
    const summary = card.querySelector(':scope > .main10-card__summary');
    if (!summary) continue;

    summary.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;

      if (motionPreference.matches || typeof Element.prototype.animate !== 'function') {
        return;
      }

      const state = getState(card);
      const targetOpen = state.target === null ? !card.open : !state.target;

      event.preventDefault();
      void animateCard(card, targetOpen, false);
    });
  }
}

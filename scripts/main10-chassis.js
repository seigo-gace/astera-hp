const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const OPEN_DURATION = 560;
const CLOSE_DURATION = 500;

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
    try {
      animation.cancel();
    } catch {}
  }
  state.animations = [];
}

function finished(animation) {
  return animation.finished.catch(() => undefined);
}

function snapshot(card, summary, panel, body, detail) {
  const bodyStyle = getComputedStyle(body);
  const summaryStyle = getComputedStyle(summary);
  const detailStyle = getComputedStyle(detail);

  return {
    panelHeight: panel.getBoundingClientRect().height,
    summaryTransform: summaryStyle.transform === 'none' ? 'translateZ(7px)' : summaryStyle.transform,
    bodyOpacity: bodyStyle.opacity,
    bodyTransform: bodyStyle.transform === 'none' ? 'none' : bodyStyle.transform,
    detailOpacity: detailStyle.opacity,
    detailTransform: detailStyle.transform === 'none' ? 'none' : detailStyle.transform,
  };
}

async function animateCard(card, targetOpen, reduceMotion) {
  const summary = card.querySelector(':scope > .main10-card__summary');
  const panel = card.querySelector(':scope > .main10-card__panel');
  const body = panel?.querySelector('.main10-card__panel-body');
  const detail = panel?.querySelector('.main10-card__detail-slot');

  if (!summary || !panel || !body || !detail) return;

  const state = getState(card);
  const token = ++state.token;
  const snap = snapshot(card, summary, panel, body, detail);

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

  card.setAttribute('data-main10-motion', 'active');

  if (targetOpen && !card.open) {
    card.open = true;
  }

  const targetHeight = targetOpen ? panel.scrollHeight : 0;
  const startHeight = Math.max(0, snap.panelHeight);

  panel.style.height = `${startHeight}px`;
  panel.style.overflow = 'clip';

  const lidTarget = targetOpen
    ? 'translateY(-3px) translateZ(15px) rotateX(-0.65deg)'
    : 'translateY(0) translateZ(7px) rotateX(0deg)';

  const bodyTargetTransform = targetOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.994)';
  const bodyTargetOpacity = targetOpen ? 1 : 0;
  const detailTargetTransform = targetOpen ? 'translateY(0)' : 'translateY(-4px)';
  const detailTargetOpacity = targetOpen ? 1 : 0.25;

  const panelAnimation = panel.animate(
    [
      { height: `${startHeight}px` },
      { height: `${targetHeight}px` },
    ],
    {
      duration: targetOpen ? OPEN_DURATION : CLOSE_DURATION,
      delay: targetOpen ? 72 : 35,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'both',
    },
  );

  const lidAnimation = summary.animate(
    [
      { transform: snap.summaryTransform },
      { transform: lidTarget },
    ],
    {
      duration: targetOpen ? 310 : 260,
      delay: targetOpen ? 0 : 90,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'both',
    },
  );

  const bodyAnimation = body.animate(
    [
      { opacity: snap.bodyOpacity, transform: snap.bodyTransform },
      { opacity: bodyTargetOpacity, transform: bodyTargetTransform },
    ],
    {
      duration: targetOpen ? 290 : 180,
      delay: targetOpen ? 175 : 0,
      easing: targetOpen ? 'cubic-bezier(.22,1,.36,1)' : 'ease-in',
      fill: 'both',
    },
  );

  const detailAnimation = detail.animate(
    [
      { opacity: snap.detailOpacity, transform: snap.detailTransform },
      { opacity: detailTargetOpacity, transform: detailTargetTransform },
    ],
    {
      duration: targetOpen ? 250 : 150,
      delay: targetOpen ? 275 : 0,
      easing: 'ease-out',
      fill: 'both',
    },
  );

  state.animations = [panelAnimation, lidAnimation, bodyAnimation, detailAnimation];

  await Promise.all(state.animations.map(finished));

  if (state.token !== token || state.target !== targetOpen) return;

  if (!targetOpen) {
    card.open = false;
  }

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

      const state = getState(card);
      const targetOpen = state.target === null ? !card.open : !state.target;

      if (motionPreference.matches || typeof Element.prototype.animate !== 'function') {
        return;
      }

      event.preventDefault();
      void animateCard(card, targetOpen, false);
    });
  }
}

import { MAIN10_ITEMS } from './main10-text.js';
import { initMain10Space } from './main10-space.js';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function itemById(id) {
  return MAIN10_ITEMS.find((item) => item.id === id) || null;
}

function setField(root, field, value) {
  const element = root.querySelector(`[data-main10-field="${field}"]`);
  if (element) element.textContent = value || '';
}

function populatePanel(dialog, item) {
  dialog.dataset.item = item.id;
  setField(dialog, 'title', item.title);
  setField(dialog, 'lead', item.lead);
  setField(dialog, 'body', item.body);
  const icon = dialog.querySelector('[data-main10-panel-icon]');
  if (icon) icon.dataset.icon = item.id;
  const cta = dialog.querySelector('[data-main10-field="cta"]');
  if (cta) {
    cta.href = item.route;
    cta.setAttribute('aria-label', `${item.title}の詳細を見る`);
  }
}

function populateCards(root) {
  root.querySelectorAll('[data-main10-card]').forEach((card) => {
    const item = itemById(card.dataset.key);
    if (!item) return;
    const title = card.querySelector('[data-main10-card-title]');
    if (title) title.textContent = item.title;
    card.setAttribute('aria-label', `${item.title}を開く`);
  });
}

function bindCardLighting(card) {
  let frame = 0;
  const reset = () => {
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };
  const onMove = (event) => {
    if (reducedMotion()) return;
    const rect = card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(1, rect.width)));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(1, rect.height)));
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      card.style.setProperty('--mx', `${(x * 100).toFixed(2)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(2)}%`);
      card.style.setProperty('--rx', `${((.5 - y) * 3.2).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((x - .5) * 4.6).toFixed(2)}deg`);
    });
  };
  card.addEventListener('pointermove', onMove, { passive: true });
  card.addEventListener('pointerleave', reset, { passive: true });
  return () => {
    if (frame) cancelAnimationFrame(frame);
    card.removeEventListener('pointermove', onMove);
    card.removeEventListener('pointerleave', reset);
  };
}

function animateFallback(panel, direction = 'in') {
  if (reducedMotion() || !panel.animate) return Promise.resolve();
  const entering = direction === 'in';
  const keyframes = entering
    ? [
        { opacity: 0, transform: 'translateY(28px) scale(.94)', filter: 'blur(8px)' },
        { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
      ]
    : [
        { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        { opacity: 0, transform: 'translateY(18px) scale(.965)', filter: 'blur(5px)' }
      ];
  const animation = panel.animate(keyframes, {
    duration: entering ? 560 : 280,
    easing: entering ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.55,0,1,.45)',
    fill: 'both'
  });
  return animation.finished.catch(() => {});
}

export function initMain10() {
  const root = document.querySelector('[data-main10]');
  const dialog = document.querySelector('[data-main10-dialog]');
  if (!root || !dialog) return;

  populateCards(root);
  const destroySpace = initMain10Space(root);
  const cards = [...root.querySelectorAll('[data-main10-card]')];
  const panel = dialog.querySelector('[data-main10-panel]');
  const closeButton = dialog.querySelector('[data-main10-close]');
  const cleanups = cards.map(bindCardLighting);
  let opener = null;
  let closing = false;

  const setTransitionName = (element, name) => {
    if (!element) return;
    element.style.viewTransitionName = name || 'none';
  };

  const clearTransitionNames = () => {
    cards.forEach((card) => setTransitionName(card, 'none'));
    setTransitionName(panel, 'none');
  };

  const openPanel = async (card) => {
    if (dialog.open || closing) return;
    const item = itemById(card.dataset.key);
    if (!item) return;
    opener = card;
    populatePanel(dialog, item);
    const transitionName = `main10-${item.id}`;
    const supportsTransition = typeof document.startViewTransition === 'function' && !reducedMotion();

    if (supportsTransition) {
      setTransitionName(card, transitionName);
      setTransitionName(panel, transitionName);
      const transition = document.startViewTransition(() => {
        document.documentElement.classList.add('main10-panel-open');
        dialog.showModal();
      });
      try { await transition.ready; } catch {}
      try { await transition.finished; } catch {}
      clearTransitionNames();
    } else {
      document.documentElement.classList.add('main10-panel-open');
      dialog.showModal();
      await animateFallback(panel, 'in');
    }
    closeButton?.focus({ preventScroll: true });
  };

  const closePanel = async () => {
    if (!dialog.open || closing) return;
    closing = true;
    const item = itemById(dialog.dataset.item);
    const destination = item ? cards.find((card) => card.dataset.key === item.id) : opener;
    const supportsTransition = typeof document.startViewTransition === 'function' && !reducedMotion() && destination;

    if (supportsTransition) {
      const transitionName = `main10-${item?.id || 'panel'}`;
      setTransitionName(destination, transitionName);
      setTransitionName(panel, transitionName);
      const transition = document.startViewTransition(() => {
        dialog.close();
        document.documentElement.classList.remove('main10-panel-open');
      });
      try { await transition.finished; } catch {}
      clearTransitionNames();
    } else {
      await animateFallback(panel, 'out');
      dialog.close();
      document.documentElement.classList.remove('main10-panel-open');
    }

    closing = false;
    const focusTarget = destination || opener;
    if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
  };

  cards.forEach((card) => card.addEventListener('click', () => openPanel(card)));
  closeButton?.addEventListener('click', closePanel);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closePanel();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closePanel();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('main10-panel-open');
    closing = false;
  });

  window.addEventListener('pagehide', () => {
    destroySpace?.();
    cleanups.forEach((cleanup) => cleanup?.());
  }, { once: true });
}

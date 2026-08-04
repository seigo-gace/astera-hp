(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  if (!(visual instanceof HTMLElement)) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let pending = 0;
  let nextX = 0;
  let nextY = 0;

  const apply = () => {
    pending = 0;
    visual.style.setProperty('--astera-pointer-x', nextX.toFixed(4));
    visual.style.setProperty('--astera-pointer-y', nextY.toFixed(4));
  };
  const schedule = () => { if (!pending) pending = requestAnimationFrame(apply); };
  const reset = () => { nextX = 0; nextY = 0; schedule(); };

  visual.addEventListener('pointermove', (event) => {
    if (reduced.matches || !finePointer.matches || document.hidden) return;
    const box = visual.getBoundingClientRect();
    if (!box.width || !box.height) return;
    nextX = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - 0.5) * 2));
    nextY = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - 0.5) * 2));
    schedule();
  }, {passive: true});
  visual.addEventListener('pointerleave', reset, {passive: true});
  visual.addEventListener('pointercancel', reset, {passive: true});
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  reduced.addEventListener?.('change', reset);
})();

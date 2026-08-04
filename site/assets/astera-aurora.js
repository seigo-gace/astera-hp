const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');
const root = document.documentElement;

function installPointerEnvironmentLight() {
  if (coarsePointer.matches || reduceMotion.matches) return;
  let frame = 0;
  let nextX = 0;
  let nextY = 0;

  const flush = () => {
    frame = 0;
    root.style.setProperty('--pointer-x', `${nextX}px`);
    root.style.setProperty('--pointer-y', `${nextY}px`);
  };

  window.addEventListener('pointermove', (event) => {
    nextX = event.clientX;
    nextY = event.clientY;
    if (!frame) frame = requestAnimationFrame(flush);
  }, {passive: true});

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
}

installPointerEnvironmentLight();

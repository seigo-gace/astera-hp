export function initHeroEffect() {
  const stage = document.querySelector('[data-hero-stage]');
  if (!(stage instanceof HTMLElement)) return;

  const media = stage.querySelector('[data-hero-media]');
  if (!(media instanceof HTMLImageElement)) return;

  let settled = false;

  const markReady = () => {
    if (settled) return;
    settled = true;
    requestAnimationFrame(() => stage.classList.add('is-ready'));
  };

  const markFallback = () => {
    if (settled) return;
    settled = true;
    stage.classList.add('is-fallback');
  };

  if (media.complete) {
    if (media.naturalWidth > 0) markReady();
    else markFallback();
    return;
  }

  media.addEventListener('load', markReady, { once: true });
  media.addEventListener('error', markFallback, { once: true });
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const header = document.querySelector('[data-header]');
const updateHeader = () => header?.classList.toggle('is-scrolled', scrollY > 12);
addEventListener('scroll', updateHeader, {passive: true});
updateHeader();

const revealNodes = [...document.querySelectorAll('[data-reveal]')];
if (reduced.matches || !('IntersectionObserver' in window)) {
  revealNodes.forEach((node) => node.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), {rootMargin: '0px 0px -8% 0px', threshold: .08});
  revealNodes.forEach((node) => revealObserver.observe(node));
}

const infinityRoot = document.querySelector('[data-infinity-hero]');
const infinityDepth = infinityRoot?.querySelector('[data-infinity-depth]');
let heroVisible = true;
const resetInfinity = () => {
  if (!(infinityDepth instanceof HTMLElement)) return;
  infinityDepth.style.transform = '';
};

if (infinityRoot instanceof HTMLElement && infinityDepth instanceof HTMLElement) {
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .04);
      if (!heroVisible) resetInfinity();
    }, {threshold: [0, .04, .2]});
    heroObserver.observe(infinityRoot);
  }

  infinityRoot.addEventListener('pointermove', (event) => {
    if (reduced.matches || !finePointer.matches || document.hidden || !heroVisible) return;
    const rect = infinityRoot.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
    infinityDepth.style.transform = `translate3d(${(x * 8).toFixed(2)}px,${(y * 6).toFixed(2)}px,0) scale(1.012)`;
  }, {passive: true});
  infinityRoot.addEventListener('pointerleave', resetInfinity, {passive: true});
  infinityRoot.addEventListener('pointercancel', resetInfinity, {passive: true});
}

document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('tab-hidden', document.hidden);
  if (document.hidden) resetInfinity();
});
reduced.addEventListener?.('change', () => {
  if (!reduced.matches) return;
  resetInfinity();
  revealNodes.forEach((node) => node.classList.add('is-visible'));
});

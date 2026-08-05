import './astera-aurora.js';
import './astera-hero-image.js';

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

const motionRoots = [...document.querySelectorAll('[data-motion-root]')];
const resetRoot = (root) => root.querySelectorAll('[data-motion-layer]').forEach((layer) => { layer.style.transform = ''; });
const bindPointer = (root) => {
  const strength = Number(root.dataset.motionStrength || 18);
  root.addEventListener('pointermove', (event) => {
    if (reduced.matches || !finePointer.matches || document.hidden) return;
    const rect = root.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * strength;
    const y = ((event.clientY - rect.top) / rect.height - .5) * strength;
    root.querySelectorAll('[data-motion-layer]').forEach((layer) => {
      const depth = Number(layer.dataset.motionLayer || 1);
      layer.style.transform = `translate3d(${x * depth}px,${y * depth}px,0) scale(1.015)`;
    });
  });
  root.addEventListener('pointerleave', () => resetRoot(root));
};
motionRoots.forEach(bindPointer);

document.querySelectorAll('[data-particles]').forEach((layer, index) => {
  if (reduced.matches) return;
  const count = innerWidth < 768 ? 6 : 14;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('i');
    particle.style.left = `${(i * 37 + index * 11) % 94 + 3}%`;
    particle.style.top = `${(i * 53 + 17) % 88 + 5}%`;
    particle.style.setProperty('--d', `${6 + (i % 6)}s`);
    particle.style.setProperty('--x', `${(i % 2 ? 1 : -1) * (12 + i)}px`);
    particle.style.setProperty('--y', `${-18 - (i % 5) * 8}px`);
    fragment.appendChild(particle);
  }
  layer.appendChild(fragment);
});

document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('tab-hidden', document.hidden);
  if (document.hidden) motionRoots.forEach(resetRoot);
});
reduced.addEventListener?.('change', () => {
  if (!reduced.matches) return;
  motionRoots.forEach(resetRoot);
  revealNodes.forEach((node) => node.classList.add('is-visible'));
});

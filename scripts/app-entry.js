export function initAppEntry() {
  const entry = document.querySelector('[data-app-entry]');
  if (!entry) return;
  entry.addEventListener('click', () => window.location.assign('./app/'));
}

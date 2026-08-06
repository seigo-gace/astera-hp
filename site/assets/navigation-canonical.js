const navToggle = document.querySelector('[data-nav-toggle]');
const globalNav = document.querySelector('[data-global-nav]');
const toggleLabel = navToggle?.querySelector('.sr-only');
const closeControls = [...document.querySelectorAll('[data-nav-close]')];
const accordionTriggers = [...document.querySelectorAll('[data-nav-accordion]')];
const routeControls = [...document.querySelectorAll('[data-nav-route]')];
const appEntry = document.querySelector('[data-app-entry]');

function isDrawerOpen() {
  return navToggle?.getAttribute('aria-expanded') === 'true' && globalNav?.classList.contains('is-open');
}

function syncDrawerState({focusDrawer = false} = {}) {
  const open = Boolean(isDrawerOpen());
  if (toggleLabel) toggleLabel.textContent = open ? 'サイドメニューを閉じる' : 'サイドメニューを開く';
  if (!globalNav) return;
  globalNav.inert = !open;
  globalNav.setAttribute('aria-hidden', String(!open));
  if (open && focusDrawer) globalNav.querySelector('[data-nav-close]')?.focus();
}

function closeDrawer({returnFocus = false} = {}) {
  if (!isDrawerOpen()) return;
  navToggle?.click();
  queueMicrotask(() => {
    syncDrawerState();
    if (returnFocus) navToggle?.focus();
  });
}

function closeOtherAccordions(active) {
  for (const trigger of accordionTriggers) {
    if (trigger === active) continue;
    trigger.setAttribute('aria-expanded', 'false');
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (panel) panel.hidden = true;
  }
}

navToggle?.addEventListener('click', () => {
  queueMicrotask(() => syncDrawerState({focusDrawer: isDrawerOpen()}));
});

for (const control of closeControls) {
  control.addEventListener('click', () => closeDrawer({returnFocus: true}));
}

for (const trigger of accordionTriggers) {
  trigger.addEventListener('click', () => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    const open = trigger.getAttribute('aria-expanded') !== 'true';
    closeOtherAccordions(trigger);
    trigger.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  });
}

for (const control of routeControls) {
  control.addEventListener('click', () => {
    const route = control.dataset.navRoute;
    if (!route) return;
    closeDrawer();
    window.location.assign(route);
  });
}

appEntry?.addEventListener('click', () => {
  const route = appEntry.dataset.appRoute || '/app/';
  window.location.assign(route);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') queueMicrotask(syncDrawerState);
});

syncDrawerState();

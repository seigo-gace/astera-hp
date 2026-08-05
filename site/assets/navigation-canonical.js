const mobileNavigation = window.matchMedia('(max-width: 1199px)');
const navToggle = document.querySelector('[data-nav-toggle]');
const globalNav = document.querySelector('[data-global-nav]');
const productToggle = document.querySelector('[data-product-toggle]');
const productMenu = document.querySelector('[data-product-menu]');
const toggleLabel = navToggle?.querySelector('.sr-only');

function syncToggleLabel() {
  if (!navToggle || !toggleLabel) return;
  toggleLabel.textContent = navToggle.getAttribute('aria-expanded') === 'true'
    ? 'メニューを閉じる'
    : 'メニューを開く';
}

function exposeMain8InMobileMenu() {
  if (!mobileNavigation.matches || !navToggle || !globalNav || !productToggle || !productMenu) return;
  if (navToggle.getAttribute('aria-expanded') !== 'true' || !globalNav.classList.contains('is-open')) return;
  productMenu.hidden = false;
  productToggle.setAttribute('aria-expanded', 'true');
}

navToggle?.addEventListener('click', () => {
  queueMicrotask(() => {
    syncToggleLabel();
    exposeMain8InMobileMenu();
  });
});

productToggle?.addEventListener('click', () => queueMicrotask(syncToggleLabel));

mobileNavigation.addEventListener?.('change', () => {
  if (mobileNavigation.matches) exposeMain8InMobileMenu();
  else if (globalNav?.classList.contains('is-open')) navToggle?.click();
});

syncToggleLabel();

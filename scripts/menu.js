import { buildCanonicalMenuMarkup } from './menu-canon.js';

const currentLanguage = () => {
  const match = window.location.pathname.match(/^\/(ja|en)(?=\/|$)/);
  return match?.[1] ?? 'ja';
};

const localPath = (suffix) => `/${currentLanguage()}${suffix}`.replace(/\/{2,}/g, '/');

const normalizePath = (value) => {
  const url = new URL(value, window.location.href);
  let path = url.pathname.replace(/\/{2,}/g, '/');
  if (!path.endsWith('/')) path += '/';
  return path;
};

const markCurrentLocation = (menu) => {
  const current = normalizePath(window.location.href);
  let currentGroup = null;

  menu.querySelectorAll('a[href]').forEach((link) => {
    if (link.origin !== window.location.origin || link.hash) return;
    const isCurrent = normalizePath(link.href) === current;
    link.toggleAttribute('aria-current', isCurrent);
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) currentGroup = link.closest('[data-menu-group]');
  });

  if (current.startsWith(localPath('/developer/')) ||
      current.startsWith(localPath('/corporate/')) ||
      current.startsWith(localPath('/contact/')) ||
      current.startsWith(localPath('/legal/'))) {
    currentGroup = menu.querySelector('[data-menu-group="developer"]');
  }
  if (current.startsWith(localPath('/support/')) || current.startsWith(localPath('/investors/'))) {
    currentGroup = menu.querySelector('[data-menu-group="support"]');
  }

  if (currentGroup) {
    const trigger = currentGroup.querySelector('.accordion-trigger');
    const panel = currentGroup.querySelector('.accordion-panel');
    trigger?.setAttribute('aria-expanded', 'true');
    if (panel) panel.hidden = false;
  }
};

const focusableElements = (menu) => [...menu.querySelectorAll(
  'a[href],button:not([disabled]),select:not([disabled]),textarea:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])',
)].filter((element) => !element.closest('[hidden]') && element.getClientRects().length > 0);

export function initSideMenu() {
  const body = document.body;
  const menu = document.getElementById('side-menu');
  const opener = document.querySelector('[data-menu-open]');
  if (!menu || !opener) return;

  const nav = menu.querySelector('.side-menu-body');
  if (!nav) return;

  nav.innerHTML = buildCanonicalMenuMarkup(currentLanguage());
  markCurrentLocation(menu);

  const triggers = [...menu.querySelectorAll('.accordion-trigger')];
  let isOpen = false;

  const setOpen = (open, { returnFocus = true } = {}) => {
    isOpen = open;
    body.classList.toggle('menu-open', open);
    opener.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;

    if (open) {
      window.requestAnimationFrame(() => {
        const focusables = focusableElements(menu);
        (focusables[0] ?? menu).focus?.();
      });
    } else if (returnFocus) {
      opener.focus();
    }
  };

  opener.addEventListener('click', () => setOpen(!isOpen));
  document.querySelectorAll('[data-menu-close]').forEach((control) => control.addEventListener('click', () => setOpen(false)));

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panelId = trigger.getAttribute('aria-controls') ?? '';
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel || !menu.contains(panel)) return;
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

      triggers.forEach((other) => {
        if (other === trigger) return;
        const otherPanelId = other.getAttribute('aria-controls') ?? '';
        const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
        other.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.hidden = true;
      });

      trigger.setAttribute('aria-expanded', String(willOpen));
      panel.hidden = !willOpen;
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusables = focusableElements(menu);
    if (!focusables.length) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!isOpen) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (menu.contains(target) || opener.contains(target)) return;
    setOpen(false);
  });

  setOpen(false, { returnFocus: false });
}

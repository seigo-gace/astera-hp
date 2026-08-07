export function initSideMenu() {
  const body = document.body;
  const menu = document.getElementById('side-menu');
  const opener = document.querySelector('[data-menu-open]');
  if (!menu || !opener) return;

  const triggers = [...document.querySelectorAll('.accordion-trigger')];

  const setOpen = (open) => {
    body.classList.toggle('menu-open', open);
    opener.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
  };

  opener.addEventListener('click', () => setOpen(!body.classList.contains('menu-open')));
  document.querySelectorAll('[data-menu-close]').forEach((button) => {
    button.addEventListener('click', () => setOpen(false));
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

      triggers.forEach((other) => {
        const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
        if (other !== trigger) {
          other.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      trigger.setAttribute('aria-expanded', String(willOpen));
      panel.hidden = !willOpen;
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) setOpen(false);
  });
}

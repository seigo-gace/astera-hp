const body = document.body;
const sideMenu = document.getElementById('side-menu');
const menuOpen = document.querySelector('[data-menu-open]');
const aiBubble = document.getElementById('ai-bubble');
const aiOpen = document.querySelector('[data-ai-open]');

function setMenu(open) {
  body.classList.toggle('menu-open', open);
  menuOpen.setAttribute('aria-expanded', String(open));
  sideMenu.setAttribute('aria-hidden', String(!open));
  sideMenu.inert = !open;
}

menuOpen.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
document.querySelectorAll('[data-menu-close]').forEach((button) => {
  button.addEventListener('click', () => setMenu(false));
});

document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

    document.querySelectorAll('.accordion-trigger').forEach((other) => {
      if (other === trigger) return;
      other.setAttribute('aria-expanded', 'false');
      document.getElementById(other.getAttribute('aria-controls')).hidden = true;
    });

    trigger.setAttribute('aria-expanded', String(willOpen));
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = !willOpen;
  });
});

aiOpen.addEventListener('click', () => {
  const open = aiBubble.hidden;
  aiBubble.hidden = !open;
  aiOpen.setAttribute('aria-expanded', String(open));
});

document.querySelector('[data-ai-close]').addEventListener('click', () => {
  aiBubble.hidden = true;
  aiOpen.setAttribute('aria-expanded', 'false');
});

document.querySelector('[data-app-entry]').addEventListener('click', () => {
  window.location.assign('./app/');
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  setMenu(false);
  aiBubble.hidden = true;
  aiOpen.setAttribute('aria-expanded', 'false');
});

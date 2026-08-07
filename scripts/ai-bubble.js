export function initAiBubble() {
  const bubble = document.getElementById('ai-bubble');
  const opener = document.querySelector('[data-ai-open]');
  const closer = document.querySelector('[data-ai-close]');
  if (!bubble || !opener || !closer) return;

  const setOpen = (open) => {
    bubble.hidden = !open;
    opener.setAttribute('aria-expanded', String(open));
    if (!open) opener.focus();
  };

  opener.addEventListener('click', () => setOpen(bubble.hidden));
  closer.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !bubble.hidden) setOpen(false);
  });
}

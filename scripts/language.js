export function initLanguageSelect() {
  const select = document.getElementById('site-language');
  if (!select) return;

  const enabled = new Set([...select.options].filter((option) => !option.disabled).map((option) => option.value));
  let stored = null;
  try { stored = localStorage.getItem('astera-language'); } catch {}

  const initial = enabled.has(stored) ? stored : 'ja';
  select.value = initial;
  document.documentElement.lang = initial;

  select.addEventListener('change', () => {
    const next = enabled.has(select.value) ? select.value : 'ja';
    select.value = next;
    document.documentElement.lang = next;
    try { localStorage.setItem('astera-language', next); } catch {}
  });
}

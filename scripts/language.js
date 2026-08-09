const LOCALE_PATTERN = /\/(ja|en)(?=\/|$)/;

function currentLocale() {
  const match = window.location.pathname.match(LOCALE_PATTERN);
  return match?.[1] ?? 'ja';
}

function localePath(nextLocale) {
  const currentPath = window.location.pathname;
  if (LOCALE_PATTERN.test(currentPath)) {
    return currentPath.replace(LOCALE_PATTERN, `/${nextLocale}`);
  }
  return new URL(`./${nextLocale}/`, window.location.href).pathname;
}

export function initLanguageSelect() {
  const select = document.getElementById('site-language');
  if (!select) return;

  const enabled = new Set(
    [...select.options]
      .filter((option) => !option.disabled)
      .map((option) => option.value),
  );

  const initial = currentLocale();
  select.value = enabled.has(initial) ? initial : 'ja';
  document.documentElement.lang = select.value;

  select.addEventListener('change', () => {
    const next = enabled.has(select.value) ? select.value : currentLocale();
    select.value = next;
    document.documentElement.lang = next;

    try { localStorage.setItem('astera-language', next); } catch {}

    if (next === currentLocale()) return;

    const target = new URL(window.location.href);
    target.pathname = localePath(next);
    window.location.assign(target.href);
  });
}

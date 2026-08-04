import { submitChat } from './customer-ai-transport.js';
import { submitContact } from './contact-transport.js';

const q = (selector, root = document) => root.querySelector(selector);
const qa = (selector, root = document) => [...root.querySelectorAll(selector)];
const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function createDialogController(panel, opener, closeButton) {
  let previousFocus = null;
  const open = () => { previousFocus = document.activeElement; panel.hidden = false; opener?.setAttribute('aria-expanded', 'true'); q(focusableSelector, panel)?.focus(); };
  const close = () => { panel.hidden = true; opener?.setAttribute('aria-expanded', 'false'); (previousFocus || opener)?.focus?.(); };
  closeButton?.addEventListener('click', close);
  panel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') return close();
    if (event.key !== 'Tab') return;
    const items = qa(focusableSelector, panel).filter((node) => !node.hidden);
    if (!items.length) return;
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  return {open, close};
}

qa('[data-brand-image]').forEach((image) => {
  image.addEventListener('load', () => image.closest('.brand,.footer-brand')?.classList.remove('asset-missing'));
  image.addEventListener('error', () => { image.hidden = true; image.closest('.brand,.footer-brand')?.classList.add('asset-missing'); });
});
qa('[data-required-asset]').forEach((image) => image.addEventListener('error', () => {
  image.hidden = true;
  const fallback = image.closest('.visual-stage')?.querySelector('[data-asset-fallback]');
  if (fallback) fallback.hidden = false;
}));

const navToggle = q('[data-nav-toggle]');
const globalNav = q('[data-global-nav]');
const productToggle = q('[data-product-toggle]');
const productMenu = q('[data-product-menu]');
function closeProductMenu({returnFocus = false} = {}) { if (!productMenu || !productToggle) return; productMenu.hidden = true; productToggle.setAttribute('aria-expanded', 'false'); if (returnFocus) productToggle.focus(); }
function closeMobileMenu({returnFocus = false} = {}) { if (!globalNav || !navToggle) return; globalNav.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); closeProductMenu(); if (returnFocus) navToggle.focus(); }
navToggle?.addEventListener('click', () => { const open = navToggle.getAttribute('aria-expanded') !== 'true'; navToggle.setAttribute('aria-expanded', String(open)); globalNav?.classList.toggle('is-open', open); document.body.classList.toggle('nav-open', open); if (!open) closeProductMenu(); });
productToggle?.addEventListener('click', () => { const open = productToggle.getAttribute('aria-expanded') !== 'true'; productToggle.setAttribute('aria-expanded', String(open)); if (productMenu) productMenu.hidden = !open; if (open) q('a', productMenu)?.focus(); });
document.addEventListener('click', (event) => { if (productMenu?.hidden !== false) return; if (!productMenu.contains(event.target) && !productToggle?.contains(event.target)) closeProductMenu(); });
document.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; if (productMenu?.hidden === false) closeProductMenu({returnFocus: true}); else if (globalNav?.classList.contains('is-open')) closeMobileMenu({returnFocus: true}); });
qa('a', globalNav).forEach((link) => link.addEventListener('click', () => closeMobileMenu()));

const languageOpen = q('[data-language-open]');
const languageDialog = q('[data-language-dialog]');
if (languageOpen && languageDialog) { const language = createDialogController(languageDialog, languageOpen, q('[data-language-close]', languageDialog)); languageOpen.addEventListener('click', language.open); languageDialog.addEventListener('click', (event) => { if (event.target === languageDialog) language.close(); }); }
const aiLauncher = q('[data-ai-launcher]');
const aiPanel = q('[data-ai-panel]');
if (aiLauncher && aiPanel) { const ai = createDialogController(aiPanel, aiLauncher, q('[data-ai-close]', aiPanel)); aiLauncher.addEventListener('click', () => aiPanel.hidden ? ai.open() : ai.close()); }

const capsule = q('[data-capsule]');
if (capsule) {
  const tabs = qa('[data-capsule-tab]', capsule), panels = qa('[data-capsule-panel]', capsule);
  const activate = (tab, focus = true) => { tabs.forEach((item) => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; }); panels.forEach((panel) => { panel.hidden = panel.dataset.capsulePanel !== tab.dataset.capsuleTab; }); if (focus) tab.focus(); };
  tabs.forEach((tab, index) => { tab.addEventListener('click', () => activate(tab, false)); tab.addEventListener('keydown', (event) => { let next = null; if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = tabs[(index + 1) % tabs.length]; if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = tabs[(index - 1 + tabs.length) % tabs.length]; if (event.key === 'Home') next = tabs[0]; if (event.key === 'End') next = tabs.at(-1); if (next) { event.preventDefault(); activate(next); } }); });
}

const qaSearch = q('[data-qa-search]');
if (qaSearch) {
  const items = qa('[data-qa-item]'), empty = q('[data-qa-empty]');
  const apply = () => { const term = qaSearch.value.trim().toLocaleLowerCase('ja'); let visible = 0; items.forEach((item) => { const match = !term || item.textContent.toLocaleLowerCase('ja').includes(term); item.hidden = !match; if (match) visible += 1; }); if (empty) empty.hidden = visible !== 0; const url = new URL(location.href); if (term) url.searchParams.set('q', qaSearch.value.trim()); else url.searchParams.delete('q'); history.replaceState(null, '', url); };
  const initial = new URL(location.href).searchParams.get('q'); if (initial) qaSearch.value = initial; qaSearch.addEventListener('input', apply); apply();
}

let activeChatController = null;
async function handleChatSubmit(form, status, sources) {
  activeChatController?.abort(); activeChatController = new AbortController(); status.textContent = '送信中…';
  const abortButton = q('[data-chat-abort]', form); if (abortButton) { abortButton.hidden = false; abortButton.onclick = () => activeChatController?.abort(); }
  try { await submitChat(new FormData(form), status, {signal: activeChatController.signal, sources}); }
  catch (error) { status.textContent = error?.name === 'AbortError' ? '回答を停止しました。' : '現在利用できません。Q&Aまたはお問い合わせをご利用ください。'; }
  finally { if (abortButton) abortButton.hidden = true; activeChatController = null; }
}
q('[data-chat-form]')?.addEventListener('submit', (event) => { event.preventDefault(); handleChatSubmit(event.currentTarget, q('[data-status]', event.currentTarget), q('[data-chat-sources]', event.currentTarget)); });
q('[data-bubble-chat-form]')?.addEventListener('submit', (event) => { event.preventDefault(); handleChatSubmit(event.currentTarget, q('[data-bubble-answer]', event.currentTarget), null); });

q('[data-contact-form]')?.addEventListener('submit', async (event) => {
  event.preventDefault(); const form = event.currentTarget, status = q('[data-status]', form), button = q('button[type="submit"]', form); const files = [...(form.elements.attachments?.files || [])]; const total = files.reduce((sum, file) => sum + file.size, 0);
  if (files.length > 5 || total > 25 * 1024 * 1024) { status.textContent = '添付は5件・合計25MB以内にしてください。'; return; }
  button.disabled = true; status.textContent = '送信中…'; const id = crypto.randomUUID(); form.elements.clientRequestId.value = id;
  try { const response = await submitContact(new FormData(form), id); status.textContent = response.ok ? `受付しました。Request ID: ${response.data.requestId || id}` : response.message || '送信できませんでした。入力内容は保持されています。'; }
  catch { status.textContent = '一時的に送信できません。入力内容は保持されています。'; }
  finally { button.disabled = false; }
});

qa('[data-copy]').forEach((button) => button.addEventListener('click', async () => { const target = document.getElementById(button.dataset.copy); if (!target) return; await navigator.clipboard.writeText(target.textContent); button.textContent = 'コピーしました'; }));
document.documentElement.classList.add('js');

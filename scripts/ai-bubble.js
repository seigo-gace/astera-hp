const CUSTOMER_AI_API = 'https://api.asterav8.jp/v1/customer-ai';
const SESSION_KEY = 'astera.customer-ai.session-id';
const MODE_KEY = 'astera.customer-ai.response-mode';
const MODE_SOURCE_KEY = 'astera.customer-ai.mode-source';
const HISTORY_KEY = 'astera.customer-ai.history-v1';
const RESPONSE_MODES = {
  general: 'Asteraについて',
  operation: '操作・使い方',
  billing: '料金・Account',
  technical: '技術者向け',
  investor: '投資家・法人向け',
  support: '開発支援・Sponsor',
  trouble: '不具合・困りごと',
  auto: 'AIに任せる'
};
let memorySessionId = '';
let configPromise;
let turnstileScriptPromise;

function randomId(prefix) {
  const value = typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID().replaceAll('-', '')
    : `${Date.now()}${Math.random().toString(36).slice(2)}`.replace(/[^A-Za-z0-9]/g, '');
  return `${prefix}_${value}`;
}

function readStore(key, fallback = '') {
  try { return sessionStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function writeStore(key, value) {
  try { sessionStorage.setItem(key, value); } catch {}
}
function removeStore(key) {
  try { sessionStorage.removeItem(key); } catch {}
}

function getSessionId() {
  const stored = readStore(SESSION_KEY);
  if (stored) return stored;
  const created = randomId('session');
  memorySessionId = created;
  writeStore(SESSION_KEY, created);
  return created;
}
function storeSessionId(value) {
  if (!value) return;
  memorySessionId = value;
  writeStore(SESSION_KEY, value);
}
function forgetSessionId() {
  memorySessionId = '';
  removeStore(SESSION_KEY);
}

function currentMode() {
  const value = readStore(MODE_KEY, 'auto');
  return Object.hasOwn(RESPONSE_MODES, value) ? value : 'auto';
}
function currentModeSource() {
  const value = readStore(MODE_SOURCE_KEY, 'auto');
  return ['selected', 'auto', 'confirmed'].includes(value) ? value : 'auto';
}
function storeMode(mode, source = mode === 'auto' ? 'auto' : 'selected') {
  writeStore(MODE_KEY, mode);
  writeStore(MODE_SOURCE_KEY, source);
}

function setEmptyState(empty, hidden) {
  if (empty) empty.hidden = hidden;
}
function createMessage(timeline, empty, role, text, state = '') {
  setEmptyState(empty, true);
  const item = document.createElement('div');
  item.className = `ai-message ai-message--${state || role}`;
  item.setAttribute('data-ai-message-role', role);
  const label = document.createElement('strong');
  label.className = 'ai-message__label';
  label.textContent = role === 'user' ? 'あなた' : 'Astera AI';
  const body = document.createElement('p');
  body.className = 'ai-message__body';
  body.textContent = text;
  item.append(label, body);
  timeline.append(item);
  timeline.scrollTop = timeline.scrollHeight;
  return item;
}
function updateMessage(item, text, state = 'assistant') {
  if (!item) return;
  item.className = `ai-message ai-message--${state}`;
  const body = item.querySelector('.ai-message__body');
  if (body) body.textContent = text;
  item.parentElement?.scrollTo({ top: item.parentElement.scrollHeight, behavior: 'smooth' });
}
function persistHistory(timeline) {
  const history = [...timeline.querySelectorAll('.ai-message')].slice(-24).map((item) => ({
    role: item.getAttribute('data-ai-message-role') === 'user' ? 'user' : 'assistant',
    text: item.querySelector('.ai-message__body')?.textContent?.slice(0, 8000) || '',
    state: item.classList.contains('ai-message--error') ? 'error' : 'completed'
  })).filter((item) => item.text);
  writeStore(HISTORY_KEY, JSON.stringify(history));
}
function restoreHistory(timeline, empty) {
  let history = [];
  try { history = JSON.parse(readStore(HISTORY_KEY, '[]')); } catch {}
  if (!Array.isArray(history)) return;
  for (const entry of history.slice(-24)) {
    if (!entry || !['user', 'assistant'].includes(entry.role) || !String(entry.text || '').trim()) continue;
    createMessage(timeline, empty, entry.role, String(entry.text), entry.state === 'error' ? 'error' : '');
  }
}

async function customerAiConfig() {
  if (!configPromise) {
    configPromise = fetch(`${CUSTOMER_AI_API}/config`, {
      method: 'GET', mode: 'cors', credentials: 'omit', headers: { accept: 'application/json' }
    }).then(async (response) => response.ok ? response.json().catch(() => ({})) : {}).catch(() => ({}));
  }
  return configPromise;
}
function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-astera-turnstile]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.asteraTurnstile = 'true';
      script.addEventListener('load', () => resolve(window.turnstile), { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });
  }
  return turnstileScriptPromise;
}
async function turnstileToken() {
  const config = await customerAiConfig();
  const sitekey = String(config.turnstile_site_key || '').trim();
  if (!sitekey) return '';
  const turnstile = await loadTurnstileScript();
  if (!turnstile?.render) return '';
  return new Promise((resolve, reject) => {
    const host = document.createElement('div');
    host.className = 'ai-turnstile-host';
    host.hidden = true;
    document.body.append(host);
    let widgetId;
    const cleanup = () => { try { if (widgetId !== undefined) turnstile.remove(widgetId); } catch {} host.remove(); };
    const timeout = window.setTimeout(() => { cleanup(); reject(new Error('turnstile_timeout')); }, 10000);
    widgetId = turnstile.render(host, {
      sitekey, action: 'customer_ai', size: 'invisible',
      callback(token) { window.clearTimeout(timeout); cleanup(); resolve(token); },
      'error-callback'() { window.clearTimeout(timeout); cleanup(); reject(new Error('turnstile_failed')); },
      'expired-callback'() { window.clearTimeout(timeout); cleanup(); reject(new Error('turnstile_expired')); }
    });
    try { turnstile.execute(widgetId); } catch {}
  });
}

function publicErrorMessage(code) {
  switch (code) {
    case 'rate_limited': return 'アクセスが集中しています。少し時間を空けてからもう一度お試しください。';
    case 'turnstile_failed': return '安全確認に失敗しました。ページを更新してもう一度お試しください。';
    case 'message_too_large': return '質問が長すぎます。内容を分けて送信してください。';
    case 'customer_ai_edge_not_configured': return '案内AIの公開接続が現在利用できません。';
    case 'gateway_rejected': return '案内AIへの中継に失敗しました。入力内容を保持したまま再試行できます。';
    case 'timeout': return '回答に時間がかかっています。入力内容を保持したまま再試行できます。';
    default: return '案内AIで一時的なエラーが発生しました。入力内容を保持したまま再試行できます。';
  }
}
function resizeInput(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(120, Math.max(44, textarea.scrollHeight))}px`;
}
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { window.clearTimeout(id); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });
}

async function acceptedMessage(message, token, signal) {
  const mode = currentMode();
  const headers = { 'content-type': 'application/json', accept: 'application/json' };
  if (token) headers['x-turnstile-token'] = token;
  const response = await fetch(`${CUSTOMER_AI_API}/messages`, {
    method: 'POST', mode: 'cors', credentials: 'omit', headers, signal,
    body: JSON.stringify({
      message,
      source: 'astera-hp',
      locale: document.documentElement.lang?.toLowerCase().startsWith('en') ? 'en' : 'ja-JP',
      session_id: getSessionId(),
      message_id: randomId('message'),
      response_mode: mode,
      mode_source: currentModeSource(),
      current_path: location.pathname
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(payload.error || `http_${response.status}`));
  storeSessionId(String(payload.session_id || ''));
  if (!payload.job_id) throw new Error('job_id_missing');
  return payload;
}

async function pollJob(jobId, signal) {
  const started = Date.now();
  while (Date.now() - started < 35000) {
    const response = await fetch(`${CUSTOMER_AI_API}/jobs/${encodeURIComponent(jobId)}`, {
      method: 'GET', mode: 'cors', credentials: 'omit', headers: { accept: 'application/json' }, signal
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 200) return payload;
    if (response.status !== 202) throw new Error(String(payload.error || `http_${response.status}`));
    await delay(Math.max(500, Math.min(1800, Number(payload.retry_after || 0) * 1000 || 700)), signal);
  }
  throw new DOMException('Timed out', 'AbortError');
}

async function requestSessionDelete(sessionId) {
  if (!sessionId) return true;
  const token = await turnstileToken().catch(() => '');
  const headers = { accept: 'application/json' };
  if (token) headers['x-turnstile-token'] = token;
  const response = await fetch(`${CUSTOMER_AI_API}/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE', mode: 'cors', credentials: 'omit', headers
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(payload.error || `http_${response.status}`));
  return payload.ok === true;
}

export function initAiBubble() {
  const panel = document.getElementById('ai-chat');
  const opener = document.querySelector('[data-ai-open]');
  const minimize = panel?.querySelector('[data-ai-minimize]');
  const deleteClose = panel?.querySelector('[data-ai-delete-close]');
  const newChat = panel?.querySelector('[data-ai-new-chat]');
  const modeChange = panel?.querySelector('[data-ai-mode-change]');
  const modePicker = panel?.querySelector('[data-ai-mode-picker]');
  const modeLabel = panel?.querySelector('[data-ai-mode-label]');
  const modeButtons = [...(panel?.querySelectorAll('[data-ai-mode]') || [])];
  const timeline = panel?.querySelector('[data-ai-timeline]');
  const empty = panel?.querySelector('[data-ai-empty]');
  const textarea = panel?.querySelector('[data-ai-input]');
  const sendButton = panel?.querySelector('.ai-send');
  const status = panel?.querySelector('[data-ai-status]');
  const connection = panel?.querySelector('[data-ai-connection]');
  if (!panel || !opener || !minimize || !deleteClose || !newChat || !modeChange || !modePicker || !modeLabel || !timeline || !textarea || !sendButton || !status) return;

  let sending = false;
  restoreHistory(timeline, empty);

  const renderMode = (showPicker = false) => {
    const mode = currentMode();
    modeLabel.textContent = RESPONSE_MODES[mode];
    for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.aiMode === mode));
    modePicker.hidden = !showPicker;
  };
  renderMode(!readStore(MODE_KEY));

  const setOpen = (open) => {
    panel.hidden = !open;
    if (!open) panel.classList.remove('is-minimized');
    opener.setAttribute('aria-expanded', String(open));
    if (open) window.setTimeout(() => textarea.focus(), 0);
  };
  const clearLocalConversation = () => {
    timeline.querySelectorAll('.ai-message').forEach((item) => item.remove());
    setEmptyState(empty, false);
    forgetSessionId();
    removeStore(HISTORY_KEY);
    storeMode('auto', 'auto');
    renderMode(true);
    textarea.value = '';
    resizeInput(textarea);
  };
  const resetConversation = async (keepOpen) => {
    if (sending) return;
    const oldSession = readStore(SESSION_KEY) || memorySessionId;
    status.textContent = oldSession ? '会話を削除しています…' : '';
    try {
      await requestSessionDelete(oldSession);
      clearLocalConversation();
      status.textContent = '';
      if (keepOpen) setOpen(true); else setOpen(false);
    } catch (error) {
      status.textContent = `会話を削除できませんでした。${publicErrorMessage(String(error?.message || 'internal_error'))}`;
    }
  };

  for (const button of modeButtons) {
    button.addEventListener('click', () => {
      const mode = button.dataset.aiMode;
      if (!Object.hasOwn(RESPONSE_MODES, mode)) return;
      storeMode(mode, mode === 'auto' ? 'auto' : 'selected');
      renderMode(false);
      textarea.focus();
    });
  }
  modeChange.addEventListener('click', () => renderMode(true));
  newChat.addEventListener('click', () => resetConversation(true));
  deleteClose.addEventListener('click', () => resetConversation(false));
  minimize.addEventListener('click', () => {
    panel.classList.toggle('is-minimized');
    minimize.textContent = panel.classList.contains('is-minimized') ? '□' : '－';
    minimize.setAttribute('aria-label', panel.classList.contains('is-minimized') ? '案内AIを展開' : '案内AIを最小化');
  });

  async function send() {
    if (sending) return;
    const message = textarea.value.trim();
    if (!message) { status.textContent = '質問を入力してください。'; textarea.focus(); return; }
    sending = true;
    sendButton.disabled = true;
    textarea.disabled = true;
    connection?.classList.add('is-working');
    status.textContent = '';
    createMessage(timeline, empty, 'user', message);
    textarea.value = '';
    resizeInput(textarea);
    const pending = createMessage(timeline, empty, 'assistant', '回答中…', 'pending');
    persistHistory(timeline);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 38000);
    try {
      const token = await turnstileToken().catch(() => '');
      const accepted = await acceptedMessage(message, token, controller.signal);
      const payload = await pollJob(accepted.job_id, controller.signal);
      const answer = String(payload.answer || payload.clarification || '').trim();
      if (!answer) throw new Error('empty_answer');
      updateMessage(pending, answer, payload.status === 'failed' ? 'error' : 'assistant');
      status.textContent = payload.status === 'awaiting_clarification' ? '追加情報を確認しています。' : '';
      persistHistory(timeline);
    } catch (error) {
      const code = error?.name === 'AbortError' ? 'timeout' : String(error?.message || 'internal_error');
      updateMessage(pending, publicErrorMessage(code), 'error');
      textarea.value = message;
      resizeInput(textarea);
      persistHistory(timeline);
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      sendButton.disabled = false;
      textarea.disabled = false;
      connection?.classList.remove('is-working');
      textarea.focus();
    }
  }

  opener.addEventListener('click', () => {
    if (panel.hidden) return setOpen(true);
    if (panel.classList.contains('is-minimized')) {
      panel.classList.remove('is-minimized');
      minimize.textContent = '－';
      return;
    }
    setOpen(false);
  });
  sendButton.addEventListener('click', send);
  textarea.addEventListener('input', () => resizeInput(textarea));
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
}

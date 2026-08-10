const PANEL_ID = 'ai-chat';
const DEFAULT_API = 'https://g-ace-astera-customerai-public.hf.space/public/customer-ai';
const SESSION_KEY = 'astera.customer-ai.session-id';
const MODE_KEY = 'astera.customer-ai.response-mode';
const MODE_SOURCE_KEY = 'astera.customer-ai.mode-source';
const HISTORY_KEY = 'astera.customer-ai.history-v2';
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
  const existing = readStore(SESSION_KEY);
  if (existing) return existing;
  const created = randomId('session');
  writeStore(SESSION_KEY, created);
  return created;
}
function currentMode() {
  const value = readStore(MODE_KEY, 'auto');
  return Object.hasOwn(RESPONSE_MODES, value) ? value : 'auto';
}
function currentModeSource() {
  const value = readStore(MODE_SOURCE_KEY, 'auto');
  return ['selected', 'auto', 'confirmed'].includes(value) ? value : 'auto';
}
function storeMode(mode) {
  writeStore(MODE_KEY, mode);
  writeStore(MODE_SOURCE_KEY, mode === 'auto' ? 'auto' : 'selected');
}
function apiBase(panel) {
  return String(panel?.dataset.customerAiApi || DEFAULT_API).replace(/\/$/, '');
}
function setEmptyState(empty, hidden) {
  if (empty) empty.hidden = hidden;
}
function createMessage(timeline, empty, role, text, state = '') {
  setEmptyState(empty, true);
  const item = document.createElement('div');
  item.className = `ai-message ai-message--${state || role}`;
  item.dataset.aiMessageRole = role;
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
    role: item.dataset.aiMessageRole === 'user' ? 'user' : 'assistant',
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
function resizeInput(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(120, Math.max(44, textarea.scrollHeight))}px`;
}
function errorMessage(code) {
  switch (code) {
    case 'rate_limited': return 'アクセスが集中しています。少し時間を空けてからもう一度お試しください。';
    case 'unsupported_public_source': return '現在の公開ページからは案内AIを利用できません。';
    case 'timeout': return '回答に時間がかかっています。入力内容を保持したまま再試行できます。';
    case 'Failed to fetch': return '案内AIへ接続できません。少し時間を空けて再試行してください。';
    default: return '案内AIで一時的なエラーが発生しました。入力内容を保持したまま再試行できます。';
  }
}
async function jsonOrEmpty(response) {
  return response.json().catch(() => ({}));
}
async function respond(panel, message, signal) {
  const response = await fetch(`${apiBase(panel)}/respond`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    signal,
    body: JSON.stringify({
      message,
      source: 'astera-hp',
      locale: document.documentElement.lang?.toLowerCase().startsWith('en') ? 'en' : 'ja-JP',
      session_id: getSessionId(),
      message_id: randomId('message'),
      response_mode: currentMode(),
      mode_source: currentModeSource(),
      current_path: location.pathname
    })
  });
  const payload = await jsonOrEmpty(response);
  if (!response.ok) throw new Error(String(payload.detail || payload.error || `http_${response.status}`));
  return payload;
}
async function deleteSession(panel, sessionId) {
  if (!sessionId) return true;
  const response = await fetch(`${apiBase(panel)}/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE', mode: 'cors', credentials: 'omit', headers: { accept: 'application/json' }
  });
  const payload = await jsonOrEmpty(response);
  if (!response.ok) throw new Error(String(payload.detail || payload.error || `http_${response.status}`));
  return payload.ok === true;
}

export function initAiBubble() {
  const panel = document.getElementById(PANEL_ID);
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
    removeStore(SESSION_KEY);
    removeStore(HISTORY_KEY);
    storeMode('auto');
    renderMode(true);
    textarea.value = '';
    resizeInput(textarea);
  };
  const resetConversation = async (keepOpen) => {
    if (sending) return;
    const oldSession = readStore(SESSION_KEY);
    status.textContent = oldSession ? '会話を削除しています…' : '';
    try {
      await deleteSession(panel, oldSession);
      clearLocalConversation();
      status.textContent = '';
      setOpen(keepOpen);
    } catch (error) {
      status.textContent = `会話を削除できませんでした。${errorMessage(String(error?.message || 'internal_error'))}`;
    }
  };

  for (const button of modeButtons) {
    button.addEventListener('click', () => {
      const mode = button.dataset.aiMode;
      if (!Object.hasOwn(RESPONSE_MODES, mode)) return;
      storeMode(mode);
      renderMode(false);
      textarea.focus();
    });
  }
  modeChange.addEventListener('click', () => renderMode(true));
  newChat.addEventListener('click', () => resetConversation(true));
  deleteClose.addEventListener('click', () => resetConversation(false));
  minimize.addEventListener('click', () => {
    panel.classList.toggle('is-minimized');
    const minimized = panel.classList.contains('is-minimized');
    minimize.textContent = minimized ? '□' : '－';
    minimize.setAttribute('aria-label', minimized ? '案内AIを展開' : '案内AIを最小化');
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
    const timeout = window.setTimeout(() => controller.abort(), 45000);
    try {
      const payload = await respond(panel, message, controller.signal);
      const answer = String(payload.answer || payload.clarification || '').trim();
      if (!answer) throw new Error('empty_answer');
      updateMessage(pending, answer, payload.status === 'failed' ? 'error' : 'assistant');
      status.textContent = payload.status === 'awaiting_clarification' ? '追加情報を確認しています。' : '';
      persistHistory(timeline);
    } catch (error) {
      const code = error?.name === 'AbortError' ? 'timeout' : String(error?.message || 'internal_error');
      updateMessage(pending, errorMessage(code), 'error');
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
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      send();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
}

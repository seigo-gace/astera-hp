const CUSTOMER_AI_API = 'https://api.asterav8.jp/v1/customer-ai';
const SESSION_KEY = 'astera.customer-ai.session-id';
let memorySessionId = '';
let configPromise;
let turnstileScriptPromise;

function randomId(prefix) {
  const value = typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID().replaceAll('-', '')
    : `${Date.now()}${Math.random().toString(36).slice(2)}`.replace(/[^A-Za-z0-9]/g, '');
  return `${prefix}_${value}`;
}

function getSessionId() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const created = randomId('session');
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    if (!memorySessionId) memorySessionId = randomId('session');
    return memorySessionId;
  }
}

function storeSessionId(value) {
  if (!value) return;
  memorySessionId = value;
  try { sessionStorage.setItem(SESSION_KEY, value); } catch {}
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

async function customerAiConfig() {
  if (!configPromise) {
    configPromise = fetch(`${CUSTOMER_AI_API}/config`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: { accept: 'application/json' }
    }).then(async (response) => {
      if (!response.ok) return {};
      return response.json().catch(() => ({}));
    }).catch(() => ({}));
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
    const cleanup = () => {
      try { if (widgetId !== undefined) turnstile.remove(widgetId); } catch {}
      host.remove();
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('turnstile_timeout'));
    }, 10000);
    widgetId = turnstile.render(host, {
      sitekey,
      action: 'customer_ai',
      size: 'invisible',
      callback(token) {
        window.clearTimeout(timeout);
        cleanup();
        resolve(token);
      },
      'error-callback'() {
        window.clearTimeout(timeout);
        cleanup();
        reject(new Error('turnstile_failed'));
      },
      'expired-callback'() {
        window.clearTimeout(timeout);
        cleanup();
        reject(new Error('turnstile_expired'));
      }
    });
    try { turnstile.execute(widgetId); } catch {}
  });
}

function publicErrorMessage(code) {
  switch (code) {
    case 'rate_limited': return 'アクセスが集中しています。少し時間を空けてからもう一度お試しください。';
    case 'turnstile_failed': return '安全確認に失敗しました。ページを更新してもう一度お試しください。';
    case 'message_too_large': return '質問が長すぎます。内容を分けて送信してください。';
    case 'customer_ai_runtime_not_configured': return '案内AIは現在接続準備中です。';
    case 'runtime_accept_failed':
    case 'runtime_process_failed': return '案内AIへ接続できませんでした。入力内容を保持したまま再試行できます。';
    case 'timeout': return '回答に時間がかかっています。入力内容を保持したまま再試行できます。';
    default: return '案内AIで一時的なエラーが発生しました。入力内容を保持したまま再試行できます。';
  }
}

function resizeInput(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(120, Math.max(44, textarea.scrollHeight))}px`;
}

export function initAiBubble() {
  const panel = document.getElementById('ai-chat');
  const opener = document.querySelector('[data-ai-open]');
  const closer = panel?.querySelector('[data-ai-close]');
  const timeline = panel?.querySelector('[data-ai-timeline]');
  const empty = panel?.querySelector('[data-ai-empty]');
  const textarea = panel?.querySelector('[data-ai-input]');
  const sendButton = panel?.querySelector('.ai-send');
  const status = panel?.querySelector('[data-ai-status]');
  if (!panel || !opener || !closer || !timeline || !textarea || !sendButton || !status) return;

  let sending = false;

  const setOpen = (open) => {
    panel.hidden = !open;
    opener.setAttribute('aria-expanded', String(open));
    if (open) window.setTimeout(() => textarea.focus(), 0);
    else opener.focus();
  };

  async function send() {
    if (sending) return;
    const message = textarea.value.trim();
    if (!message) {
      status.textContent = '質問を入力してください。';
      textarea.focus();
      return;
    }

    sending = true;
    sendButton.disabled = true;
    textarea.disabled = true;
    status.textContent = '';
    createMessage(timeline, empty, 'user', message);
    textarea.value = '';
    resizeInput(textarea);
    const pending = createMessage(timeline, empty, 'assistant', '回答中…', 'pending');

    try {
      const token = await turnstileToken().catch(() => '');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 35000);
      const headers = { 'content-type': 'application/json', accept: 'application/json' };
      if (token) headers['x-turnstile-token'] = token;
      const response = await fetch(`${CUSTOMER_AI_API}/respond`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers,
        body: JSON.stringify({
          message,
          source: 'astera-hp',
          locale: document.documentElement.lang?.toLowerCase().startsWith('en') ? 'en-US' : 'ja-JP',
          session_id: getSessionId(),
          message_id: randomId('message')
        }),
        signal: controller.signal
      });
      window.clearTimeout(timeout);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || `http_${response.status}`));
      storeSessionId(String(payload.session_id || ''));
      const answer = String(payload.answer || '').trim();
      if (!answer) throw new Error('empty_answer');
      updateMessage(pending, answer, 'assistant');
      status.textContent = payload.status === 'awaiting_clarification'
        ? '追加情報を確認しています。'
        : '';
    } catch (error) {
      const code = error?.name === 'AbortError' ? 'timeout' : String(error?.message || 'internal_error');
      updateMessage(pending, publicErrorMessage(code), 'error');
      textarea.value = message;
      resizeInput(textarea);
    } finally {
      sending = false;
      sendButton.disabled = false;
      textarea.disabled = false;
      textarea.focus();
    }
  }

  opener.addEventListener('click', () => setOpen(panel.hidden));
  closer.addEventListener('click', () => setOpen(false));
  sendButton.addEventListener('click', send);
  textarea.addEventListener('input', () => resizeInput(textarea));
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      send();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (panel.hidden || panel.contains(event.target) || opener.contains(event.target)) return;
    setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
}

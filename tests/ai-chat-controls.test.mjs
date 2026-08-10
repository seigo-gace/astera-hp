import assert from 'node:assert/strict';
import test from 'node:test';

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...items) { for (const item of items) this.values.add(item); }
  remove(...items) { for (const item of items) this.values.delete(item); }
  contains(item) { return this.values.has(item); }
  toggle(item) {
    if (this.values.has(item)) { this.values.delete(item); return false; }
    this.values.add(item); return true;
  }
}

class FakeElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.textContent = '';
    this.className = '';
    this.classList = new FakeClassList();
    this.dataset = {};
    this.style = {};
    this.scrollHeight = 44;
    this.scrollTop = 0;
    this.parentElement = null;
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.focused = false;
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  dispatch(type, init = {}) {
    const event = {
      key: '', ctrlKey: false, metaKey: false,
      preventDefault() {},
      ...init,
    };
    for (const handler of this.listeners.get(type) || []) handler(event);
  }

  click() { this.dispatch('click'); }
  focus() { this.focused = true; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }

  append(...nodes) {
    for (const node of nodes) {
      node.parentElement = this;
      this.children.push(node);
    }
  }

  remove() {
    if (!this.parentElement) return;
    const index = this.parentElement.children.indexOf(this);
    if (index >= 0) this.parentElement.children.splice(index, 1);
    this.parentElement = null;
  }

  querySelector(selector) {
    if (selector === '.ai-message__body') {
      return this.children.find((child) => child.className === 'ai-message__body') || null;
    }
    return null;
  }

  querySelectorAll(selector) {
    if (selector === '.ai-message') {
      return this.children.filter((child) => child.className.startsWith('ai-message '));
    }
    return [];
  }

  scrollTo({ top }) { this.scrollTop = top; }
}

class FakeStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

function makeMessage(role, text) {
  const item = new FakeElement();
  item.className = `ai-message ai-message--${role}`;
  item.dataset.aiMessageRole = role;
  const body = new FakeElement('p');
  body.className = 'ai-message__body';
  body.textContent = text;
  item.append(body);
  return item;
}

function buildUi() {
  const panel = new FakeElement('section');
  panel.id = 'ai-chat';
  panel.hidden = false;
  panel.dataset.customerAiApi = 'https://api.asterav8.jp/v1/customer-ai';

  const opener = new FakeElement('button');
  const minimize = new FakeElement('button');
  const deleteClose = new FakeElement('button');
  const newChat = new FakeElement('button');
  const modeChange = new FakeElement('button');
  const modePicker = new FakeElement();
  const modeLabel = new FakeElement('strong');
  const timeline = new FakeElement();
  const empty = new FakeElement();
  const textarea = new FakeElement('textarea');
  const send = new FakeElement('button');
  const status = new FakeElement('p');
  const connection = new FakeElement('span');

  const modeNames = ['general', 'operation', 'billing', 'technical', 'investor', 'support', 'trouble', 'auto'];
  const modeButtons = modeNames.map((mode) => {
    const button = new FakeElement('button');
    button.dataset.aiMode = mode;
    return button;
  });

  const bySelector = new Map([
    ['[data-ai-minimize]', minimize],
    ['[data-ai-delete-close]', deleteClose],
    ['[data-ai-new-chat]', newChat],
    ['[data-ai-mode-change]', modeChange],
    ['[data-ai-mode-picker]', modePicker],
    ['[data-ai-mode-label]', modeLabel],
    ['[data-ai-timeline]', timeline],
    ['[data-ai-empty]', empty],
    ['[data-ai-input]', textarea],
    ['.ai-send', send],
    ['[data-ai-status]', status],
    ['[data-ai-connection]', connection],
  ]);
  panel.querySelector = (selector) => bySelector.get(selector) || null;
  panel.querySelectorAll = (selector) => selector === '[data-ai-mode]' ? modeButtons : [];

  return { panel, opener, minimize, deleteClose, newChat, modeChange, modePicker, modeLabel, modeButtons, timeline, empty, textarea, send, status, connection };
}

const storage = new FakeStorage();
const ui = buildUi();

globalThis.sessionStorage = storage;
globalThis.location = { pathname: '/ja/' };
globalThis.window = {
  setTimeout,
  clearTimeout,
  turnstile: null,
};
globalThis.document = {
  documentElement: { lang: 'ja' },
  head: new FakeElement('head'),
  body: new FakeElement('body'),
  getElementById(id) { return id === 'ai-chat' ? ui.panel : null; },
  querySelector(selector) {
    if (selector === '[data-ai-open]') return ui.opener;
    if (selector === 'script[data-astera-turnstile]') return null;
    return null;
  },
  createElement(tag) { return new FakeElement(tag); },
  addEventListener() {},
};

let respondReject;
globalThis.fetch = async (url, options = {}) => {
  const value = String(url);
  if (value.endsWith('/config')) {
    return { ok: true, async json() { return {}; } };
  }
  if (value.endsWith('/respond')) {
    return await new Promise((resolve, reject) => {
      respondReject = reject;
      options.signal?.addEventListener('abort', () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        reject(error);
      }, { once: true });
    });
  }
  if (options.method === 'DELETE') throw new Error('offline');
  throw new Error(`unexpected fetch: ${value}`);
};

const { initAiBubble } = await import(new URL('../scripts/ai-hf-chat.js?controls-behavior-test=1', import.meta.url));
initAiBubble();

function seedConversation(mode = 'billing') {
  storage.setItem('astera.customer-ai.session-id', 'session_test_1234567890');
  storage.setItem('astera.customer-ai.response-mode', mode);
  storage.setItem('astera.customer-ai.mode-source', mode === 'auto' ? 'auto' : 'selected');
  storage.setItem('astera.customer-ai.history-v2', JSON.stringify([{ role: 'user', text: '料金を教えて' }]));
  ui.timeline.append(makeMessage('user', '料金を教えて'));
  ui.textarea.value = '料金を教えて';
}

function assertConversationCleared() {
  assert.equal(storage.getItem('astera.customer-ai.session-id'), null);
  assert.equal(storage.getItem('astera.customer-ai.history-v2'), null);
  assert.equal(storage.getItem('astera.customer-ai.response-mode'), 'auto');
  assert.equal(storage.getItem('astera.customer-ai.mode-source'), 'auto');
  assert.equal(ui.timeline.querySelectorAll('.ai-message').length, 0);
  assert.equal(ui.textarea.value, '');
  assert.equal(ui.textarea.disabled, false);
  assert.equal(ui.send.disabled, false);
}

test('new chat clears locally even when remote session deletion is offline', async () => {
  seedConversation('billing');
  ui.panel.hidden = false;

  ui.newChat.click();
  assertConversationCleared();
  assert.equal(ui.panel.hidden, false);
  assert.equal(ui.opener.getAttribute('aria-expanded'), 'true');

  await new Promise((resolve) => setTimeout(resolve, 0));
  assertConversationCleared();
});

test('close clears locally and closes even when remote session deletion is offline', async () => {
  seedConversation('technical');
  ui.panel.hidden = false;

  ui.deleteClose.click();
  assertConversationCleared();
  assert.equal(ui.panel.hidden, true);
  assert.equal(ui.opener.getAttribute('aria-expanded'), 'false');

  await new Promise((resolve) => setTimeout(resolve, 0));
  assertConversationCleared();
});

test('new chat aborts an in-flight send and stale failure cannot repopulate cleared chat', async () => {
  storage.clear();
  ui.timeline.children = [];
  ui.panel.hidden = false;
  ui.textarea.value = '料金を教えて';

  ui.send.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(ui.textarea.disabled, true);
  assert.equal(ui.timeline.querySelectorAll('.ai-message').length, 2);

  ui.newChat.click();
  assertConversationCleared();
  assert.equal(ui.panel.hidden, false);

  if (respondReject) respondReject(new Error('late network failure'));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assertConversationCleared();
  assert.equal(ui.timeline.querySelectorAll('.ai-message').length, 0);
});

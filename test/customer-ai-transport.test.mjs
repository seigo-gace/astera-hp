import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../assets/customer-ai-transport.js', import.meta.url), 'utf8');

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; }
  };
}

function boot(fetchImpl, overrides = {}) {
  const events = [];
  const store = new Map();
  const window = {
    AsteraCustomerAI: overrides.current || {},
    AsteraTurnstile: overrides.turnstile || {
      async getToken() { return 'turnstile-test'; }
    },
    dispatchEvent(event) { events.push(event); }
  };
  const context = {
    window,
    document: {
      currentScript: {
        dataset: {
          apiBase: 'https://api.asterav8.jp/',
          source: 'astera-hp'
        }
      },
      documentElement: { lang: 'ja-JP' }
    },
    localStorage: {
      getItem(key) { return store.get(key) || null; },
      setItem(key, value) { store.set(key, value); }
    },
    crypto: {
      randomUUID() { return '12345678-1234-1234-1234-123456789abc'; }
    },
    fetch: fetchImpl,
    CustomEvent: class {
      constructor(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
    DOMException,
    Error,
    Promise,
    setTimeout,
    clearTimeout,
    URL,
    console
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'customer-ai-transport.js' });
  return { api: window.AsteraCustomerAI, events, store };
}

test('transport extends the frozen UI object instead of replacing it', () => {
  const existing = { uiState: 'frozen' };
  const { api, events } = boot(async () => response(500, {}), { current: existing });
  assert.equal(api, existing);
  for (const method of ['send', 'submit', 'poll', 'getJob', 'ask', 'getSessionId', 'configure']) {
    assert.equal(typeof api[method], 'function');
  }
  assert.equal(api.uiState, 'frozen');
  assert.equal(events[0].type, 'astera:customer-ai-ready');
});

test('send posts only the public message contract using the HP source', async () => {
  let captured;
  const { api, events } = boot(async (url, options) => {
    captured = { url, options };
    return response(202, { job_id: 'job_12345678', status: 'accepted' });
  });
  const accepted = await api.send('  Asteraとは？  ');
  assert.equal(accepted.job_id, 'job_12345678');
  assert.equal(captured.url, 'https://api.asterav8.jp/v1/customer-ai/messages');
  assert.equal(captured.options.headers['x-turnstile-token'], 'turnstile-test');
  const body = JSON.parse(captured.options.body);
  assert.deepEqual(
    Object.keys(body).sort(),
    ['job_id', 'locale', 'message', 'message_id', 'session_id', 'source'].sort()
  );
  assert.equal(body.message, 'Asteraとは？');
  assert.equal(body.source, 'astera-hp');
  assert.equal(events.at(-1).type, 'astera:customer-ai-accepted');
});

test('session identity is stable in browser storage', () => {
  const { api } = boot(async () => response(202, {}));
  const first = api.getSessionId();
  const second = api.getSessionId();
  assert.equal(first, second);
  assert.match(first, /^session_[A-Za-z0-9_.:]+$/);
});

test('ask polls pending jobs and returns a terminal KB result', async () => {
  let polls = 0;
  const { api, events } = boot(async (url) => {
    if (url.endsWith('/messages')) {
      return response(202, { job_id: 'job_12345678', status: 'accepted' });
    }
    polls += 1;
    if (polls === 1) {
      return response(202, { job_id: 'job_12345678', status: 'processing' });
    }
    return response(200, {
      job_id: 'job_12345678',
      status: 'completed',
      answer: '公開KB回答'
    });
  });
  const result = await api.ask('判断素材8項目は？', {
    pollIntervalMs: 1,
    maxPolls: 3
  });
  assert.equal(result.status, 'completed');
  assert.equal(result.answer, '公開KB回答');
  assert.equal(
    events.filter((event) => event.type === 'astera:customer-ai-progress').length,
    2
  );
  assert.equal(events.at(-1).type, 'astera:customer-ai-result');
});

test('blank messages and public-edge errors remain explicit', async () => {
  const { api } = boot(async () => response(403, { error: 'turnstile_failed' }));
  await assert.rejects(api.send('   '), /message_required/);
  await assert.rejects(
    api.send('質問'),
    (error) => error.message === 'turnstile_failed' && error.status === 403
  );
});

test('bounded polling times out instead of waiting forever', async () => {
  const { api } = boot(async (url) => url.endsWith('/messages')
    ? response(202, { job_id: 'job_12345678', status: 'accepted' })
    : response(202, { job_id: 'job_12345678', status: 'processing' }));
  await assert.rejects(
    api.ask('質問', { pollIntervalMs: 1, maxPolls: 2 }),
    /customer_ai_poll_timeout/
  );
});

test('browser source contains no private runtime or Gateway credential', () => {
  for (const forbidden of [
    'huggingface.co/spaces',
    '/internal/customer-ai',
    'WEBHOOK_INTERNAL_API_TOKEN',
    'RESULT_WEBHOOK_SECRET',
    'CUSTOMER_AI_HMAC_SECRET'
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
});

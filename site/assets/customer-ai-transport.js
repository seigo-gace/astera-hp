function parseEventBlock(block) {
  const event = {type: 'message', data: ''};
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) event.type = line.slice(6).trim();
    if (line.startsWith('data:')) event.data += `${line.slice(5).trim()}\n`;
  }
  event.data = event.data.trim();
  try { event.json = event.data ? JSON.parse(event.data) : null; } catch { event.json = null; }
  return event;
}

export async function submitChat(formData, status, options = {}) {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(new DOMException('Timeout', 'TimeoutError')), 30000);
  const abort = () => timeoutController.abort(new DOMException('Aborted', 'AbortError'));
  options.signal?.addEventListener('abort', abort, {once: true});
  const payload = {
    sessionId: crypto.randomUUID(),
    answerType: formData.get('answerType'),
    message: formData.get('message'),
    history: [],
    pageContext: {route: location.pathname, title: document.title}
  };
  let answer = '';
  let sourceCount = 0;
  try {
    const response = await fetch('/api/ai/chat', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(payload), signal: timeoutController.signal});
    if (response.status === 429) throw new Error('RATE_LIMITED');
    if (!response.ok || !response.body) throw new Error('UNAVAILABLE');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const {done, value} = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), {stream: !done});
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || '';
      for (const block of blocks) {
        const event = parseEventBlock(block);
        if (event.type === 'delta') { answer += event.json?.text ?? event.json?.delta ?? event.data; status.textContent = answer.slice(-12000); }
        else if (event.type === 'source' && options.sources) { const source = event.json || {}; const link = document.createElement('a'); link.href = source.url || '#'; link.textContent = source.title || 'Source'; if (/^https?:/.test(link.href)) link.rel = 'external noopener'; options.sources.append(link); sourceCount += 1; }
        else if (event.type === 'error') throw new Error(event.json?.code || 'STREAM_ERROR');
        else if (event.type === 'done') status.textContent = answer || '回答を受信しました。';
      }
      if (done) break;
    }
    if (!answer && sourceCount === 0) status.textContent = '回答を受信できませんでした。Q&Aまたはお問い合わせをご利用ください。';
  } catch (error) {
    if (timeoutController.signal.reason?.name === 'TimeoutError') throw timeoutController.signal.reason;
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}

(() => {
  'use strict';
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  if (button && nav) button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav.dataset.open = String(!open);
  });

  const qaInput = document.querySelector('[data-qa-search]');
  if (qaInput) qaInput.addEventListener('input', () => {
    const q = qaInput.value.trim().toLowerCase();
    document.querySelectorAll('[data-qa-item]').forEach((item) => {
      item.hidden = q && !item.textContent.toLowerCase().includes(q);
    });
    const url = new URL(location.href);
    q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
  });

  const chat = document.querySelector('[data-chat-form]');
  if (chat) chat.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = chat.querySelector('[data-status]');
    const message = chat.elements.message.value.trim();
    if (!message) return;
    status.textContent = '送信しています…';
    try {
      const response = await fetch('/api/ai/chat', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({answerType:chat.elements.answerType.value,message,history:[],pageContext:{route:location.pathname,title:document.title}})});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      status.textContent = '回答を受信中です。';
      const reader = response.body?.getReader();
      if (!reader) throw new Error('stream unavailable');
      const decoder = new TextDecoder();
      let text='';
      while (true) { const {done,value}=await reader.read(); if(done) break; text += decoder.decode(value,{stream:true}); status.textContent=text.slice(-4000); }
    } catch { status.textContent = '現在案内AIを利用できません。Q&Aまたはお問い合わせをご利用ください。'; }
  });

  const contact = document.querySelector('[data-contact-form]');
  if (contact) contact.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status=contact.querySelector('[data-status]');
    status.textContent='送信しています…';
    try { const response=await fetch('/api/contact',{method:'POST',body:new FormData(contact)}); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data?.error?.code||`HTTP ${response.status}`); status.textContent=`受付しました。受付ID: ${data.requestId}`; contact.reset(); }
    catch(error){ status.textContent=`送信できませんでした。入力内容を保持したまま再試行してください。 (${error.message})`; }
  });
})();

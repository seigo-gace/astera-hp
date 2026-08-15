const form=document.querySelector('[data-contact-form]');

if(form){
  const submit=form.querySelector('[data-contact-submit]');
  const status=form.querySelector('[data-contact-status]');
  const files=form.querySelector('[data-contact-files]');
  const fileSummary=form.querySelector('[data-contact-file-summary]');
  const endpoint=(form.dataset.contactEndpoint||'').trim();
  const turnstileSiteKey=(form.dataset.turnstileSiteKey||'').trim();
  const MAX_FILES=5;
  const MAX_TOTAL_BYTES=25*1024*1024;
  const deniedExtensions=new Set(['exe','msi','bat','cmd','com','scr','ps1','sh','js','mjs','cjs','vbs','jar','apk']);

  const setStatus=(message,state='')=>{
    if(!status)return;
    status.textContent=message;
    if(state)status.dataset.state=state;else delete status.dataset.state;
  };

  const safeExt=(name)=>{
    const match=String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/);
    return match?.[1]||'';
  };

  const validateFiles=()=>{
    const selected=[...(files?.files||[])];
    const total=selected.reduce((sum,file)=>sum+file.size,0);
    const denied=selected.find((file)=>deniedExtensions.has(safeExt(file.name)));
    let error='';
    if(selected.length>MAX_FILES)error=`添付は最大${MAX_FILES}件までです。`;
    else if(total>MAX_TOTAL_BYTES)error='添付Fileの合計は25MBまでです。';
    else if(denied)error=`${denied.name} はSecurity上の理由で添付できません。`;
    if(fileSummary){
      fileSummary.replaceChildren();
      const summary=document.createElement('span');
      summary.textContent=selected.length?`${selected.length}件 / ${(total/1024/1024).toFixed(1)}MB`:'添付なし';
      fileSummary.append(summary);
      selected.forEach((file)=>{
        const row=document.createElement('span');
        row.textContent=`${file.name} (${(file.size/1024/1024).toFixed(1)}MB)`;
        fileSummary.append(row);
      });
    }
    if(error)setStatus(error,'error');
    else if(status?.dataset.state==='error')setStatus('');
    return !error;
  };

  files?.addEventListener('change',validateFiles);

  const configureTurnstile=()=>{
    const host=form.querySelector('[data-contact-turnstile]');
    if(!host||!turnstileSiteKey)return Promise.resolve(false);
    if(window.turnstile?.render){
      window.turnstile.render(host,{sitekey:turnstileSiteKey,callback:(token)=>{
        const target=form.querySelector('[name="turnstile_token"]');
        if(target)target.value=token;
      }});
      return Promise.resolve(true);
    }
    return new Promise((resolve)=>{
      const script=document.createElement('script');
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async=true;
      script.defer=true;
      script.addEventListener('load',()=>{
        if(window.turnstile?.render){
          window.turnstile.render(host,{sitekey:turnstileSiteKey,callback:(token)=>{
            const target=form.querySelector('[name="turnstile_token"]');
            if(target)target.value=token;
          }});
          resolve(true);
        }else resolve(false);
      },{once:true});
      script.addEventListener('error',()=>resolve(false),{once:true});
      document.head.append(script);
    });
  };

  const clientReady=Boolean(endpoint&&turnstileSiteKey);
  if(!clientReady){
    if(submit)submit.disabled=true;
    setStatus('送信先Backendの公開Bindingが確定するまで送信は有効化しません。','error');
  }else{
    configureTurnstile().then((ready)=>{
      if(!ready){
        if(submit)submit.disabled=true;
        setStatus('送信確認機能を読み込めませんでした。時間をおいて再度お試しください。','error');
      }else if(submit){
        submit.disabled=false;
        setStatus('');
      }
    });
  }

  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    if(!endpoint){setStatus('送信先が未接続です。','error');return;}
    if(!form.reportValidity()||!validateFiles())return;
    const token=form.querySelector('[name="turnstile_token"]')?.value?.trim();
    if(!token){setStatus('送信確認を完了してください。','error');return;}
    const body=new FormData(form);
    if(submit)submit.disabled=true;
    form.setAttribute('aria-busy','true');
    setStatus('送信しています…');
    try{
      const response=await fetch(endpoint,{method:'POST',body,headers:{Accept:'application/json'}});
      let payload=null;
      try{payload=await response.json();}catch{payload=null;}
      if(!response.ok){
        const message=payload?.error?.message||payload?.message||'お問い合わせを送信できませんでした。';
        throw new Error(message);
      }
      const ticketId=payload?.ticket_id||payload?.ticket?.id||'';
      form.reset();
      if(fileSummary)fileSummary.textContent='添付なし';
      setStatus(ticketId?`送信を受け付けました。受付番号：${ticketId}`:'送信を受け付けました。','success');
      if(window.turnstile?.reset)window.turnstile.reset();
    }catch(error){
      setStatus(error instanceof Error?error.message:'お問い合わせを送信できませんでした。','error');
    }finally{
      form.removeAttribute('aria-busy');
      if(submit&&clientReady)submit.disabled=false;
    }
  });
}

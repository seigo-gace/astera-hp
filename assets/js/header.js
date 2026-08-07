export function initHeader(){
  const language=document.getElementById('site-language');
  if(language){
    let stored=null;
    try{stored=localStorage.getItem('astera-language')}catch{}
    if(stored==='ja')language.value='ja';
    document.documentElement.lang='ja';
    language.addEventListener('change',()=>{
      const next=language.value==='ja'?'ja':'ja';
      language.value=next;
      document.documentElement.lang=next;
      try{localStorage.setItem('astera-language',next)}catch{}
    });
  }

  document.querySelector('[data-app-entry]')?.addEventListener('click',()=>{
    window.location.assign('./app/');
  });
}

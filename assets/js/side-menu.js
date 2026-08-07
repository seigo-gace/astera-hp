export function initSideMenu(){
  const body=document.body;
  const sideMenu=document.getElementById('side-menu');
  const menuOpen=document.querySelector('[data-menu-open]');
  if(!sideMenu||!menuOpen)return;

  const setMenu=(open)=>{
    body.classList.toggle('menu-open',open);
    menuOpen.setAttribute('aria-expanded',String(open));
    sideMenu.setAttribute('aria-hidden',String(!open));
    sideMenu.inert=!open;
  };

  menuOpen.addEventListener('click',()=>setMenu(!body.classList.contains('menu-open')));
  document.querySelectorAll('[data-menu-close]').forEach((button)=>button.addEventListener('click',()=>setMenu(false)));

  document.querySelectorAll('.accordion-trigger').forEach((trigger)=>{
    trigger.addEventListener('click',()=>{
      const willOpen=trigger.getAttribute('aria-expanded')!=='true';
      document.querySelectorAll('.accordion-trigger').forEach((other)=>{
        if(other!==trigger){
          other.setAttribute('aria-expanded','false');
          const otherPanel=document.getElementById(other.getAttribute('aria-controls'));
          if(otherPanel)otherPanel.hidden=true;
        }
      });
      trigger.setAttribute('aria-expanded',String(willOpen));
      const panel=document.getElementById(trigger.getAttribute('aria-controls'));
      if(panel)panel.hidden=!willOpen;
    });
  });

  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape')setMenu(false);
  });
}

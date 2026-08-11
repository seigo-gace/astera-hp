import { initLanguageSelect } from './scripts/language.js';
import { initSideMenu } from './scripts/menu.js';
import { initAiBubble } from './scripts/ai-hf-chat.js?v=cu47-mobile-chat';
import { initAppEntry } from './scripts/app-entry.js';
import { initHeroEffect } from './scripts/hero-effect.js';
import { initCosmicMain10 } from './scripts/cosmic-interface.js?v=cu66-supporters-layered-design';
import { SITE_TEXT } from './scripts/main10-text.js?v=cu58-header-logo-copyright';

initLanguageSelect();
initSideMenu();
initAiBubble();
initAppEntry();
initHeroEffect();
initCosmicMain10();

const copyrightCopy=document.querySelector('[data-top-copyright]');
if(copyrightCopy)copyrightCopy.textContent=SITE_TEXT.topCopyright??'Copyright © 2026 Astera';

const releaseStaleScrollLocks=()=>{
  const dialog=document.querySelector('[data-cosmic-modal]');
  if(!dialog?.open)document.documentElement.classList.remove('cosmic-modal-open');
  const menu=document.getElementById('side-menu');
  if(!menu||menu.getAttribute('aria-hidden')!=='false')document.body.classList.remove('menu-open');
};
document.querySelector('[data-cosmic-modal]')?.addEventListener('close',releaseStaleScrollLocks);
window.addEventListener('pageshow',releaseStaleScrollLocks);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)releaseStaleScrollLocks()});
releaseStaleScrollLocks();

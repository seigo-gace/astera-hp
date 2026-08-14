import { initLanguageSelect } from './scripts/language.js';
import { initSideMenu } from './scripts/menu.js';
import { initAiBubble } from './scripts/ai-hf-chat.js?v=cu47-mobile-chat';
import { initAppEntry } from './scripts/app-entry.js';
import { initHeroEffect } from './scripts/hero-effect.js';
import { initCosmicMain10 } from './scripts/cosmic-interface.js?v=cu73-main10-panel-forward-fix';
import { initDetailIllustrations } from './scripts/detail-illustrations.js?v=cu-main10-illustrations-01';
import { MAIN10_ITEMS, SITE_TEXT } from './scripts/main10-text.js?v=cu58-header-logo-copyright';

initLanguageSelect();
initSideMenu();
initAiBubble();
initAppEntry();
initHeroEffect();
initCosmicMain10();
initDetailIllustrations();

const copyrightCopy=document.querySelector('[data-top-copyright]');
if(copyrightCopy)copyrightCopy.textContent=SITE_TEXT.topCopyright??'Copyright © 2026 Astera';

const normalizePath=(value)=>{
  let path=String(value||'/').replace(/\/{2,}/g,'/');
  if(!path.startsWith('/'))path=`/${path}`;
  if(!path.endsWith('/'))path=`${path}/`;
  return path;
};

const routeToJaPath=(route)=>normalizePath(`/ja/${String(route||'').replace(/^\.\//,'')}`);

const initDetailMain10Navigation=()=>{
  const article=document.querySelector('.detail-article');
  if(!article||document.querySelector('[data-main10-detail-nav]'))return;

  const currentPath=normalizePath(window.location.pathname);
  const knownPaths=MAIN10_ITEMS.map((item)=>routeToJaPath(item.route));
  if(!knownPaths.includes(currentPath))return;

  const nav=document.createElement('nav');
  nav.className='detail-main10-nav';
  nav.dataset.main10DetailNav='';
  nav.setAttribute('aria-label','Asteraの詳細ページ');

  const heading=document.createElement('h2');
  heading.className='detail-main10-nav__title';
  heading.textContent='Asteraをさらに見る';
  nav.append(heading);

  const grid=document.createElement('div');
  grid.className='detail-main10-nav__grid';

  MAIN10_ITEMS.forEach((item)=>{
    const path=routeToJaPath(item.route);
    const isCurrent=path===currentPath;
    const node=document.createElement(isCurrent?'span':'a');
    node.className=`detail-main10-nav__item${isCurrent?' is-current':''}`;
    node.textContent=item.title;
    if(isCurrent){
      node.setAttribute('aria-current','page');
      node.dataset.main10Current='';
    }else{
      node.href=path;
    }
    grid.append(node);
  });

  nav.append(grid);
  article.append(nav);
};

initDetailMain10Navigation();

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

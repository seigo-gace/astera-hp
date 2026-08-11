import { initLanguageSelect } from './scripts/language.js';
import { initSideMenu } from './scripts/menu.js';
import { initAiBubble } from './scripts/ai-hf-chat.js?v=cu47-mobile-chat';
import { initAppEntry } from './scripts/app-entry.js';
import { initHeroEffect } from './scripts/hero-effect.js';
import { initCosmicMain10 } from './scripts/cosmic-interface.js?v=cu55-supporters-two-row';
import { SITE_TEXT } from './scripts/main10-text.js?v=cu57-copyright-inline';

initLanguageSelect();
initSideMenu();
initAiBubble();
initAppEntry();
initHeroEffect();
initCosmicMain10();

const copyrightCopy=document.querySelector('[data-top-copyright],[data-footer-copy]');
if(copyrightCopy)copyrightCopy.textContent=SITE_TEXT.topCopyright??SITE_TEXT.footerCopyright??'ASTERA ©';

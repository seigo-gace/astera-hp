import { initLanguageSelect } from './scripts/language.js';
import { initSideMenu } from './scripts/menu.js';
import { initAiBubble } from './scripts/ai-hf-chat.js?v=cu47-mobile-chat';
import { initAppEntry } from './scripts/app-entry.js';
import { initHeroEffect } from './scripts/hero-effect.js';
import { initCosmicMain10 } from './scripts/cosmic-interface.js?v=cu55-supporters-two-row';
import { SITE_TEXT } from './scripts/main10-text.js?v=cu56-top-footer';

initLanguageSelect();
initSideMenu();
initAiBubble();
initAppEntry();
initHeroEffect();
initCosmicMain10();

const footerCopy=document.querySelector('[data-footer-copy]');
if(footerCopy)footerCopy.textContent=SITE_TEXT.footerCopyright;

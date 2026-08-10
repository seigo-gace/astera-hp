import { initLanguageSelect } from './scripts/language.js';
import { initSideMenu } from './scripts/menu.js';
import { initAiBubble } from './scripts/ai-hf-chat.js?v=cu44-no-cloudflare-client';
import { initAppEntry } from './scripts/app-entry.js';
import { initHeroEffect } from './scripts/hero-effect.js';
import { initCosmicMain10 } from './scripts/cosmic-interface.js';

const aiPanel = document.getElementById('ai-chat');
if (aiPanel) {
  aiPanel.dataset.customerAiApi = 'https://g-ace-astera-customerai-public.hf.space/public/customer-ai';
}

initLanguageSelect();
initSideMenu();
initAiBubble();
initAppEntry();
initHeroEffect();
initCosmicMain10();

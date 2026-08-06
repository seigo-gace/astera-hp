const navToggle=document.querySelector('[data-nav-toggle]');
const productToggle=document.querySelector('[data-product-toggle]');
function syncNavigationLabels(){if(navToggle)navToggle.setAttribute('aria-label',navToggle.getAttribute('aria-expanded')==='true'?'サイドメニューを閉じる':'サイドメニューを開く');if(productToggle)productToggle.setAttribute('aria-label',productToggle.getAttribute('aria-expanded')==='true'?'製品メニューを閉じる':'製品メニューを開く')}
navToggle?.addEventListener('click',()=>queueMicrotask(syncNavigationLabels));
productToggle?.addEventListener('click',()=>queueMicrotask(syncNavigationLabels));
document.addEventListener('keydown',event=>{if(event.key==='Escape')queueMicrotask(syncNavigationLabels)});
syncNavigationLabels();

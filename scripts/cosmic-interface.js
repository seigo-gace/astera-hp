import { PUBLIC_MAIN10 } from '../data/public-main10.ja.js';
import { MAIN10_ITEMS } from './main10-text.js';

const byId=new Map(PUBLIC_MAIN10.map(item=>[item.id,item]));
const routeById=new Map(MAIN10_ITEMS.map(item=>[item.id,item.route]));
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=()=>matchMedia('(hover:hover) and (pointer:fine)').matches;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const icon=(id,className)=>`<span class="${className} cosmic-icon" data-icon="${id}" aria-hidden="true"></span>`;

const cardMarkup=item=>`<button class="cosmic-card" type="button" data-cosmic-card data-key="${item.id}" aria-label="${item.title}を開く"><span class="cosmic-card__stack" data-cosmic-card-stack><span class="cosmic-card__ghost" aria-hidden="true"></span><span class="cosmic-card__glass"><span class="cosmic-card__top">${icon(item.id,'cosmic-card__icon')}<span class="cosmic-card__divider" aria-hidden="true"></span><span class="cosmic-card__label" data-cosmic-label>${item.title}</span></span><span class="cosmic-card__edge" aria-hidden="true"></span><span class="cosmic-card__flare" aria-hidden="true"></span></span></span></button>`;

function setPointer(card,e){
  const r=card.getBoundingClientRect();
  const x=Math.min(1,Math.max(0,(e.clientX-r.left)/Math.max(1,r.width)));
  const y=Math.min(1,Math.max(0,(e.clientY-r.top)/Math.max(1,r.height)));
  card.style.setProperty('--mx',`${(x*100).toFixed(2)}%`);
  card.style.setProperty('--my',`${(y*100).toFixed(2)}%`);
  if(finePointer()){
    card.style.setProperty('--ry',`${((x-.5)*3.8).toFixed(2)}deg`);
    card.style.setProperty('--rx',`${((.5-y)*3.0).toFixed(2)}deg`);
  }
}
function resetPointer(card){card.style.setProperty('--mx','50%');card.style.setProperty('--my','50%');card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg')}
function fitSingleLineLabel(label){
  if(!label)return;
  label.style.fontSize='';
  label.style.letterSpacing='';
  label.style.transform='';
  const computed=getComputedStyle(label);
  let size=Number.parseFloat(computed.fontSize)||16;
  const minSize=10;
  while(label.scrollWidth>label.clientWidth+1&&size>minSize){
    size=Math.max(minSize,size-.5);
    label.style.fontSize=`${size}px`;
    if(size<=12.5)label.style.letterSpacing='-.035em';
  }
  if(label.scrollWidth>label.clientWidth+1){
    const ratio=Math.max(.84,label.clientWidth/Math.max(1,label.scrollWidth));
    label.style.transform=`scaleX(${ratio})`;
  }
}
function fitCardLabels(cards){
  cards.forEach(card=>fitSingleLineLabel(card.querySelector('[data-cosmic-label]')));
}
function fillExpanded(panel,item){
  const title=panel.querySelector('[data-expanded-label]');
  title.textContent=item.title;
  panel.querySelector('[data-expanded-lead]').textContent=item.lead;
  panel.querySelector('[data-expanded-copy]').textContent=item.body;
  const expandedIcon=panel.querySelector('[data-expanded-icon]');
  if(expandedIcon) expandedIcon.dataset.icon=item.id;
  const detail=panel.querySelector('[data-expanded-detail]');
  const route=routeById.get(item.id);
  if(detail){
    if(route){
      detail.href=route;
      detail.setAttribute('aria-label',`${item.title}の詳細ページへ`);
      detail.removeAttribute('aria-disabled');
    }else{
      detail.removeAttribute('href');
      detail.setAttribute('aria-disabled','true');
    }
  }
}
function clearTransitionNames(cards,panelStack){
  cards.forEach(card=>{const stack=card.querySelector('[data-cosmic-card-stack]');if(stack)stack.style.viewTransitionName='none'});
  if(panelStack)panelStack.style.viewTransitionName='none';
}
async function fallbackOpen(dialog,panel,source){
  const sourceStack=source.querySelector('[data-cosmic-card-stack]');
  const from=sourceStack.getBoundingClientRect();
  document.documentElement.classList.add('cosmic-modal-open');
  dialog.showModal();
  const panelStack=panel.querySelector('[data-cosmic-expanded-stack]');
  const to=panelStack.getBoundingClientRect();
  if(panelStack.animate&&!reduceMotion()){
    const anim=panelStack.animate([
      {transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`,opacity:.55,filter:'brightness(1.18)'},
      {transform:'translate(0,0) scale(1.015)',opacity:1,offset:.82,filter:'brightness(1.04)'},
      {transform:'translate(0,0) scale(1)',opacity:1,filter:'brightness(1)'}
    ],{duration:620,easing:'cubic-bezier(.16,.86,.22,1)'});
    await anim.finished.catch(()=>{});
  }
}
async function fallbackClose(dialog,panel,source){
  const panelStack=panel.querySelector('[data-cosmic-expanded-stack]');
  const sourceStack=source?.querySelector('[data-cosmic-card-stack]');
  if(panelStack?.animate&&sourceStack&&!reduceMotion()){
    const from=panelStack.getBoundingClientRect(),to=sourceStack.getBoundingClientRect();
    const anim=panelStack.animate([
      {transform:'translate(0,0) scale(1)',opacity:1},
      {transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:.28}
    ],{duration:420,easing:'cubic-bezier(.4,0,.2,1)'});
    await anim.finished.catch(()=>{});
  }
  dialog.close();
  document.documentElement.classList.remove('cosmic-modal-open');
}

export function initCosmicMain10(){
  const root=document.querySelector('[data-cosmic-main10]');
  const grid=root?.querySelector('[data-cosmic-grid]');
  const dialog=document.querySelector('[data-cosmic-modal]');
  const panel=dialog?.querySelector('[data-cosmic-expanded]');
  const panelStack=panel?.querySelector('[data-cosmic-expanded-stack]');
  if(!root||!grid||!dialog||!panel||!panelStack)return;

  grid.innerHTML=PUBLIC_MAIN10.map(cardMarkup).join('');
  const cards=[...grid.querySelectorAll('[data-cosmic-card]')];
  requestAnimationFrame(()=>fitCardLabels(cards));
  document.fonts?.ready?.then(()=>fitCardLabels(cards)).catch(()=>{});
  let fitTimer=0;
  window.addEventListener('resize',()=>{clearTimeout(fitTimer);fitTimer=setTimeout(()=>fitCardLabels(cards),90)},{passive:true});
  let source=null;
  let active=null;
  let busy=false;

  for(const card of cards){
    card.addEventListener('pointermove',e=>setPointer(card,e),{passive:true});
    card.addEventListener('pointerleave',()=>resetPointer(card));
    card.addEventListener('click',async()=>{
      if(busy||dialog.open)return;
      const item=byId.get(card.dataset.key);
      if(!item)return;
      busy=true;
      source=card;
      active=item;
      fillExpanded(panel,item);
      panel.classList.remove('is-revealed','is-closing');
      panel.classList.add('is-preparing');

      if(!reduceMotion()){
        card.classList.add('is-launching');
        await wait(175);
      }

      const sourceStack=card.querySelector('[data-cosmic-card-stack]');
      const canTransition=typeof document.startViewTransition==='function'&&!reduceMotion();
      if(canTransition){
        sourceStack.style.viewTransitionName='cosmic-card';
        panelStack.style.viewTransitionName='none';
        const transition=document.startViewTransition(()=>{
          card.classList.remove('is-launching');
          sourceStack.style.viewTransitionName='none';
          panelStack.style.viewTransitionName='cosmic-card';
          document.documentElement.classList.add('cosmic-modal-open');
          dialog.showModal();
        });
        await transition.finished.catch(()=>{});
        clearTransitionNames(cards,panelStack);
      }else{
        card.classList.remove('is-launching');
        await fallbackOpen(dialog,panel,card);
      }

      panel.classList.remove('is-preparing');
      panel.classList.add('is-revealed');
      busy=false;
      dialog.querySelector('[data-cosmic-close]')?.focus({preventScroll:true});
    });
  }

  const close=async()=>{
    if(!dialog.open||busy)return;
    busy=true;
    panel.classList.remove('is-revealed');
    panel.classList.add('is-closing');
    if(!reduceMotion())await wait(120);
    const sourceStack=source?.querySelector('[data-cosmic-card-stack]');
    const canTransition=typeof document.startViewTransition==='function'&&!reduceMotion()&&sourceStack;
    if(canTransition){
      panelStack.style.viewTransitionName='cosmic-card';
      sourceStack.style.viewTransitionName='none';
      const transition=document.startViewTransition(()=>{
        dialog.close();
        panelStack.style.viewTransitionName='none';
        sourceStack.style.viewTransitionName='cosmic-card';
        document.documentElement.classList.remove('cosmic-modal-open');
      });
      await transition.finished.catch(()=>{});
      clearTransitionNames(cards,panelStack);
    }else{
      await fallbackClose(dialog,panel,source);
    }
    panel.classList.remove('is-closing','is-preparing');
    source?.focus({preventScroll:true});
    active=null;
    busy=false;
  };

  dialog.querySelector('[data-cosmic-close]')?.addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  dialog.querySelector('[data-cosmic-modal-stage]')?.addEventListener('click',e=>{if(!e.target.closest?.('[data-cosmic-expanded]'))close()});
  panel.addEventListener('pointermove',e=>{
    const r=panel.getBoundingClientRect();
    panel.style.setProperty('--mx',`${((e.clientX-r.left)/Math.max(1,r.width)*100).toFixed(2)}%`);
    panel.style.setProperty('--my',`${((e.clientY-r.top)/Math.max(1,r.height)*100).toFixed(2)}%`);
  },{passive:true});
}

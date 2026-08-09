const TIMING = Object.freeze({
  cosmosStart: 8800,
  mediaFadeStart: 9400,
  mediaFadeEnd: 11000,
  cosmosFull: 11500,
  line1Start: 11000,
  line2Start: 12500,
  copyDuration: 2000
});

const TAU = Math.PI * 2;

function clamp01(value){
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value){
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(a,b,t){
  return a + (b-a)*t;
}

function random(min,max){
  return min + Math.random()*(max-min);
}

function readMetalPalette(){
  const styles=getComputedStyle(document.documentElement);
  const token=(name)=>styles.getPropertyValue(name).trim() || '#fff';
  return {
    far:token('--astera-metal-75'),
    mid:token('--astera-metal-85'),
    dust:token('--astera-metal-55'),
    spark:token('--astera-metal-100')
  };
}

function createParticles(width,height,isMobile){
  const farCount = isMobile ? 54 : 86;
  const midCount = isMobile ? 18 : 28;
  const dustCount = isMobile ? 12 : 18;
  const sparkCount = isMobile ? 5 : 8;

  const farStars = Array.from({length:farCount},()=>({
    x:random(0,width), y:random(0,height),
    vx:random(-.022,.022), vy:random(-.012,.026),
    r:random(.35,1.05), alpha:random(.25,.78), phase:random(0,TAU), twinkle:random(.0007,.0018)
  }));

  const midStars = Array.from({length:midCount},()=>({
    x:random(0,width), y:random(0,height), depth:random(.22,.72),
    vx:random(-.035,.05), vy:random(-.01,.045), vz:random(.000025,.000065),
    r:random(.65,1.55), alpha:random(.24,.66), phase:random(0,TAU), twinkle:random(.0008,.0021)
  }));

  const lightDust = Array.from({length:dustCount},()=>({
    x:random(0,width), y:random(0,height), depth:random(.12,.62),
    vx:random(-.025,.04), vy:random(.006,.04), vz:random(.00006,.00013),
    r:random(1.0,2.5), alpha:random(.09,.34), phase:random(0,TAU)
  }));

  const foregroundParticles = Array.from({length:sparkCount},()=>({
    x:random(0,width), y:random(0,height),
    vx:random(-.08,.10), vy:random(-.025,.08),
    r:random(1.15,2.25), alpha:random(.22,.60), phase:random(0,TAU), pulse:random(.0012,.0032)
  }));

  return {farStars,midStars,lightDust,foregroundParticles};
}

function resetAtEdge(p,width,height){
  if (p.x < -20) p.x = width + 20;
  if (p.x > width + 20) p.x = -20;
  if (p.y < -20) p.y = height + 20;
  if (p.y > height + 20) p.y = -20;
}

function setupCanvas(canvas){
  const context = canvas.getContext('2d',{alpha:true,desynchronized:true});
  if (!context) return null;

  const state = {context,width:0,height:0,dpr:1,particles:null,isMobile:false,palette:readMetalPalette()};

  const resize = ()=>{
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1,Math.round(rect.width));
    const height = Math.max(1,Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1,2);
    state.width = width;
    state.height = height;
    state.dpr = dpr;
    state.isMobile = width < 600;
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    context.setTransform(dpr,0,0,dpr,0,0);
    state.particles = createParticles(width,height,state.isMobile);
  };

  resize();
  return {
    ...state,
    resize,
    get width(){return state.width},
    get height(){return state.height},
    get particles(){return state.particles},
    get palette(){return state.palette}
  };
}

function drawGlow(ctx,x,y,r,alpha){
  ctx.globalAlpha = alpha*.25;
  ctx.beginPath();
  ctx.arc(x,y,r*3.4,0,TAU);
  ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x,y,r,0,TAU);
  ctx.fill();
}

function renderCosmos(canvasState,elapsed,layerAlpha,delta){
  const {context:ctx,width,height,particles,palette} = canvasState;
  if (!particles || width <= 0 || height <= 0) return;
  ctx.clearRect(0,0,width,height);

  const dt = Math.min(32,Math.max(8,delta));
  const drift = dt/16.67;

  ctx.fillStyle=palette.far;
  for (const p of particles.farStars){
    p.x += p.vx*drift;
    p.y += p.vy*drift;
    resetAtEdge(p,width,height);
    const twinkle = .74 + .26*Math.sin(elapsed*p.twinkle+p.phase);
    const alpha = layerAlpha.far*p.alpha*twinkle;
    ctx.globalAlpha=alpha;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();
  }

  ctx.fillStyle=palette.mid;
  for (const p of particles.midStars){
    p.depth += p.vz*dt;
    if (p.depth>1){p.depth=.2;p.x=random(0,width);p.y=random(0,height)}
    p.x += p.vx*drift*(.6+p.depth);
    p.y += p.vy*drift*(.6+p.depth);
    resetAtEdge(p,width,height);
    const scale=.62+p.depth*1.15;
    const twinkle=.78+.22*Math.sin(elapsed*p.twinkle+p.phase);
    ctx.globalAlpha=layerAlpha.mid*p.alpha*twinkle;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r*scale,0,TAU);ctx.fill();
  }

  ctx.fillStyle=palette.dust;
  for (const p of particles.lightDust){
    p.depth += p.vz*dt;
    if (p.depth>1){p.depth=.14;p.x=random(0,width);p.y=random(0,height)}
    p.x += p.vx*drift*(.55+p.depth*1.4);
    p.y += p.vy*drift*(.55+p.depth*1.4);
    resetAtEdge(p,width,height);
    const scale=.48+p.depth*1.55;
    const pulse=.72+.28*Math.sin(elapsed*.00055+p.phase);
    ctx.globalAlpha=layerAlpha.dust*p.alpha*pulse;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r*scale,0,TAU);ctx.fill();
  }

  ctx.fillStyle=palette.spark;
  for (const p of particles.foregroundParticles){
    p.x += p.vx*drift;
    p.y += p.vy*drift;
    resetAtEdge(p,width,height);
    const pulse=.56+.44*Math.max(0,Math.sin(elapsed*p.pulse+p.phase));
    drawGlow(ctx,p.x,p.y,p.r,layerAlpha.spark*p.alpha*pulse);
  }
  ctx.globalAlpha=1;
}

function updateNebula(nebulae,elapsed,alpha){
  const t=elapsed/1000;
  const configs=[
    {x:Math.sin(t*.055)*2.8,y:Math.cos(t*.043)*2.0,s:1+Math.sin(t*.037)*.035,a:.78},
    {x:Math.cos(t*.041)*2.5,y:Math.sin(t*.052)*2.4,s:1+Math.cos(t*.033)*.045,a:.62},
    {x:Math.sin(t*.038)*2.2,y:Math.cos(t*.048)*2.7,s:1+Math.sin(t*.029)*.04,a:.48}
  ];
  nebulae.forEach((el,index)=>{
    if (!el) return;
    const c=configs[index];
    el.style.opacity=String(alpha*c.a);
    el.style.transform=`translate3d(${c.x}%,${c.y}%,0) scale(${c.s})`;
  });
}

function updateCopy(line,progress){
  const eased=smoothstep(progress);
  const y=lerp(30,0,eased);
  const scale=lerp(.90,1,eased);
  const blur=lerp(8,0,eased);
  line.style.opacity=String(eased);
  line.style.transform=`translate3d(0,${y}px,0) scale(${scale})`;
  line.style.filter=`blur(${blur}px)`;
  line.style.textShadow=eased < .01 ? 'none' : `0 0 ${lerp(0,22,eased)}px var(--astera-metal-75)`;
}

export function initHeroEffect(){
  const stage=document.querySelector('[data-hero-stage]');
  if (!(stage instanceof HTMLElement)) return;
  const media=stage.querySelector('[data-hero-media]');
  const mediaFrame=stage.querySelector('[data-hero-media-frame]');
  const canvas=stage.querySelector('[data-hero-canvas]');
  const line1=stage.querySelector('[data-hero-copy-line="1"]');
  const line2=stage.querySelector('[data-hero-copy-line="2"]');
  const nebulae=['a','b','c'].map(key=>stage.querySelector(`[data-nebula="${key}"]`));
  if (!(media instanceof HTMLImageElement) || !(mediaFrame instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement) || !(line1 instanceof HTMLElement) || !(line2 instanceof HTMLElement)) return;

  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvasState=setupCanvas(canvas);
  if (!canvasState) return;

  let started=false;
  let rafId=0;
  let resizeTimer=0;
  let visible=true;
  let lastFrame=0;

  const stop=()=>{if(rafId){cancelAnimationFrame(rafId);rafId=0}};

  const frame=(now)=>{
    if(!started || !visible || document.hidden){rafId=0;return}
    const elapsed=now-started;
    const delta=lastFrame?now-lastFrame:16.67;
    lastFrame=now;

    const cosmos=smoothstep((elapsed-TIMING.cosmosStart)/(TIMING.cosmosFull-TIMING.cosmosStart));
    const far=smoothstep((elapsed-TIMING.cosmosStart)/2400);
    const mid=smoothstep((elapsed-9600)/2300);
    const dust=smoothstep((elapsed-10000)/2400);
    const spark=smoothstep((elapsed-10300)/2600);
    const mediaFade=smoothstep((elapsed-TIMING.mediaFadeStart)/(TIMING.mediaFadeEnd-TIMING.mediaFadeStart));

    mediaFrame.style.opacity=String(1-mediaFade);
    if(mediaFade>=1 && !mediaFrame.classList.contains('is-hidden')) mediaFrame.classList.add('is-hidden');

    canvas.style.opacity=String(cosmos);
    renderCosmos(canvasState,elapsed,{far,mid,dust,spark},delta);
    updateNebula(nebulae,elapsed,smoothstep((elapsed-9300)/3000));

    updateCopy(line1,(elapsed-TIMING.line1Start)/TIMING.copyDuration);
    updateCopy(line2,(elapsed-TIMING.line2Start)/TIMING.copyDuration);

    stage.dataset.heroPhase = elapsed<TIMING.cosmosStart ? 'media' : elapsed<TIMING.mediaFadeEnd ? 'crossfade' : elapsed<TIMING.line2Start+TIMING.copyDuration ? 'copy' : 'space';
    rafId=requestAnimationFrame(frame);
  };

  const start=()=>{
    if(started) return;
    if(reducedMotion){
      mediaFrame.style.opacity='0';
      mediaFrame.classList.add('is-hidden');
      line1.style.opacity='1'; line1.style.transform='none'; line1.style.filter='none';
      line2.style.opacity='1'; line2.style.transform='none'; line2.style.filter='none';
      stage.dataset.heroPhase='reduced-motion';
      return;
    }
    started=performance.now();
    lastFrame=started;
    stage.classList.add('is-ready');
    rafId=requestAnimationFrame(frame);
  };

  const fallback=()=>{
    if(started) return;
    stage.classList.add('is-fallback');
    mediaFrame.style.opacity='0';
    mediaFrame.classList.add('is-hidden');
    if(reducedMotion){
      line1.style.opacity='1'; line1.style.transform='none'; line1.style.filter='none';
      line2.style.opacity='1'; line2.style.transform='none'; line2.style.filter='none';
      stage.dataset.heroPhase='fallback';
      return;
    }
    started=performance.now()-15000;
    lastFrame=performance.now();
    stage.classList.add('is-ready');
    rafId=requestAnimationFrame(frame);
  };

  const observer=new IntersectionObserver((entries)=>{
    visible=entries.some(entry=>entry.isIntersecting);
    if(visible && started && !rafId && !document.hidden){lastFrame=performance.now();rafId=requestAnimationFrame(frame)}
    if(!visible) stop();
  },{threshold:.01});
  observer.observe(stage);

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) stop();
    else if(visible && started && !rafId){lastFrame=performance.now();rafId=requestAnimationFrame(frame)}
  });

  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>canvasState.resize(),120);
  },{passive:true});

  if(media.complete){
    if(media.naturalWidth>0) start(); else fallback();
  }else{
    media.addEventListener('load',start,{once:true});
    media.addEventListener('error',fallback,{once:true});
  }
}

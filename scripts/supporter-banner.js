const TITLE = '支援者・スポンサーのご紹介';
const DESCRIPTION_LINES = [
  'Asteraを支えてくださる皆さまへ、心より感謝申し上げます。',
  '皆さまのご支援が、Asteraの挑戦を前へ進める力です。'
];

const FALLBACK_STYLE = `
.supporters-banner-section{position:relative;width:min(920px,96%);margin:28px auto 0;padding:0 0 42px;background:transparent;color:var(--text,#f6f6f6)}
.supporters-banner{position:relative;display:block;width:100%;min-height:210px;margin:0;border:1px solid var(--line-strong,#5e5e5e);border-radius:20px;background:linear-gradient(138deg,var(--surface-3,#101010) 0%,var(--surface-2,#0a0a0a) 48%,var(--surface,#050505) 100%);box-shadow:0 24px 64px rgba(0,0,0,.72),inset 0 1px 0 rgba(246,246,246,.18);isolation:isolate;overflow:visible}
.supporters-banner::before,.supporters-banner::after{content:"";position:absolute;inset:0;border:1px solid var(--line-subtle,#313131);border-radius:inherit;background:linear-gradient(145deg,var(--surface-2,#0a0a0a),var(--surface,#050505));pointer-events:none;z-index:-1}
.supporters-banner::before{transform:translate(7px,8px);opacity:.62}.supporters-banner::after{transform:translate(14px,16px);opacity:.32}
.supporters-banner__stack,.supporters-banner__panel{position:relative;display:block;min-height:inherit;border-radius:inherit}.supporters-banner__panel{overflow:hidden}
.supporters-banner__panel::after{content:"";position:absolute;left:28px;top:26px;width:42px;height:2px;background:var(--brand-signal,#8e4a3c);opacity:.9}
.supporters-banner__content{position:relative;z-index:2;min-height:inherit;display:grid;grid-template-columns:minmax(0,1fr) minmax(112px,160px);gap:32px;align-items:center;padding:34px 42px}
.supporters-banner__copy{min-width:0}.supporters-banner__eyebrow{display:inline-flex;align-items:center;gap:9px;margin:0 0 12px;color:var(--text-secondary,#babdc2);font:650 11px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif;letter-spacing:.14em;text-transform:uppercase}.supporters-banner__eyebrow::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--brand-signal,#8e4a3c)}
.supporters-banner__title{margin:0;color:var(--text,#f6f6f6);font:620 clamp(26px,4vw,42px)/1.15 ui-sans-serif,system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif;letter-spacing:.01em}.supporters-banner__description{margin:16px 0 0;color:var(--text-secondary,#babdc2);font:400 14px/1.65 ui-sans-serif,system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif;letter-spacing:.01em}.supporters-banner__description-line{display:block;white-space:nowrap}
.supporters-banner__cta{display:inline-flex;align-items:center;gap:9px;margin-top:20px;color:var(--text,#f6f6f6);font:600 13px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif}.supporters-banner__cta-arrow{display:inline-grid;place-items:center;width:30px;height:30px;border:1px solid var(--line,#4a4d50);border-radius:50%;color:var(--text-secondary,#babdc2)}
.supporters-banner__ornament{position:relative;justify-self:end;width:132px;aspect-ratio:1;border:1px solid var(--line-subtle,#313131);border-radius:50%;opacity:.72}.supporters-banner__ornament::before,.supporters-banner__ornament::after{content:"";position:absolute;border-radius:50%}.supporters-banner__ornament::before{inset:16%;border:1px solid var(--line,#4a4d50)}.supporters-banner__ornament::after{inset:39%;border:1px solid var(--line-strong,#5e5e5e);box-shadow:0 0 22px rgba(246,246,246,.08)}.supporters-banner__axis{position:absolute;left:8%;right:8%;top:50%;height:1px;background:linear-gradient(90deg,transparent,var(--line,#4a4d50),transparent)}.supporters-banner__axis::after{content:"";position:absolute;left:50%;top:-51px;width:1px;height:102px;background:linear-gradient(180deg,transparent,var(--line,#4a4d50),transparent)}
.supporters-banner:focus-visible{outline:2px solid var(--focus,#d5d5d5);outline-offset:4px}
@media(max-width:640px){.supporters-banner-section{width:96%;margin-top:24px;padding-bottom:max(42px,env(safe-area-inset-bottom))}.supporters-banner{min-height:214px;border-radius:17px}.supporters-banner__content{grid-template-columns:1fr;gap:0;padding:30px 22px 26px}.supporters-banner__ornament{position:absolute;right:16px;bottom:14px;width:112px;opacity:.2}.supporters-banner__title{max-width:88%;font-size:clamp(22px,6.4vw,28px)}.supporters-banner__description{position:relative;z-index:2;margin-top:14px;font-size:clamp(10.5px,3.05vw,12px);line-height:1.72;letter-spacing:-.01em}.supporters-banner__description-line{white-space:nowrap}.supporters-banner__cta{position:relative;z-index:2;margin-top:18px;font-size:12px}}
`;

function bannerMarkup(){
  return `<section class="supporters-banner-section" data-supporters-banner-runtime aria-labelledby="supporters-banner-title"><a class="supporters-banner" href="./supporters/" aria-describedby="supporters-banner-description"><div class="supporters-banner__stack"><span class="supporters-banner__ghost" aria-hidden="true"></span><div class="supporters-banner__panel"><div class="supporters-banner__content"><div class="supporters-banner__copy"><span class="supporters-banner__eyebrow">Supporters / Sponsors</span><h2 id="supporters-banner-title" class="supporters-banner__title">${TITLE}</h2><p id="supporters-banner-description" class="supporters-banner__description"><span class="supporters-banner__description-line">${DESCRIPTION_LINES[0]}</span><span class="supporters-banner__description-line">${DESCRIPTION_LINES[1]}</span></p><span class="supporters-banner__cta">支援者・スポンサーを見る<span class="supporters-banner__cta-arrow" aria-hidden="true">↗</span></span></div><span class="supporters-banner__ornament" aria-hidden="true"><span class="supporters-banner__axis"></span></span></div></div></div></a></section>`;
}

function ensureFallbackStyle(){
  if(document.getElementById('supporters-banner-runtime-style')) return;
  const style=document.createElement('style');
  style.id='supporters-banner-runtime-style';
  style.textContent=FALLBACK_STYLE;
  document.head.append(style);
}

function normalizeContent(section){
  const title=section.querySelector('#supporters-banner-title,.supporters-banner__title');
  if(title) title.textContent=TITLE;
  const description=section.querySelector('#supporters-banner-description,.supporters-banner__description');
  if(description){
    description.innerHTML=DESCRIPTION_LINES.map(line=>`<span class="supporters-banner__description-line">${line}</span>`).join('');
  }
  const link=section.querySelector('.supporters-banner');
  if(link) link.setAttribute('href','./supporters/');
  section.setAttribute('data-supporters-banner-runtime','ready');
}

export function initSupportersBanner(){
  const root=document.querySelector('[data-cosmic-main10]');
  if(!root) return;
  ensureFallbackStyle();

  let section=document.querySelector('.supporters-banner-section');
  if(!section){
    const template=document.createElement('template');
    template.innerHTML=bannerMarkup().trim();
    section=template.content.firstElementChild;
  }
  if(!section) return;

  normalizeContent(section);
  if(section.parentElement!==root) root.append(section);
}

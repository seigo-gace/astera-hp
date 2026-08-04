import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const site=join(here,'..');
const dist=join(site,'dist');
const base='https://asterav8.jp';
const read=(p)=>readFile(join(site,p),'utf8');
const esc=(v)=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const replaceAll=(source,values)=>Object.entries(values).reduce((out,[key,value])=>out.replaceAll(`{{${key}}}`,String(value??'')),source);
const routeToFile=(route)=>route==='/'?join(dist,'index.html'):join(dist,route.slice(1),'index.html');
const linkLabel=(link)=>link.startsWith('http')?new URL(link).hostname:link.replaceAll('/',' ').trim()||'ホーム';
const sectionHtml=(sections=[],template='article')=>sections.map((section,index)=>`<section class="content-section"${template==='qa'?' data-qa-item':''}><p class="eyebrow">${String(index+1).padStart(2,'0')}</p><h2>${esc(section.title)}</h2><p>${esc(section.body)}</p>${section.items?.length?`<div class="item-grid">${section.items.map(item=>`<div class="item">${esc(item)}</div>`).join('')}</div>`:''}</section>`).join('');
const relatedHtml=(links=[])=>`<aside class="related" aria-label="関連ページ"><h2>関連ページ</h2><div class="related-links">${links.map(link=>`<a href="${esc(link)}">${esc(linkLabel(link))}</a>`).join('')}</div></aside>`;
const breadcrumb=(page)=>page.route==='/'?'':`<nav class="breadcrumbs" aria-label="パンくず"><a href="/">ホーム</a> <span aria-hidden="true">/</span> <span>${esc(page.h1)}</span></nav>`;
const special=(page)=>{
 if(page.template==='qa') return `<section class="qa-search"><label for="qa-search">質問を検索</label><input id="qa-search" type="search" data-qa-search autocomplete="off" placeholder="例: AsteraはAIですか？"></section>`;
 if(page.template==='chat') return `<form class="chat-panel" data-chat-form><label>回答Type<select name="answerType"><option value="general">一般</option><option value="technical">技術</option><option value="corporate">法人</option><option value="investor">投資家</option><option value="operation">運用</option></select></label><label>質問<textarea name="message" maxlength="12000" required></textarea></label><button class="button primary" type="submit">送信</button><p class="status" data-status aria-live="polite"></p></form>`;
 if(page.template==='contact') return `<form class="contact-panel" data-contact-form><div class="form-row"><label>区分<select name="category" required><option value="product">製品</option><option value="billing">請求</option><option value="account">Account</option><option value="privacy">Privacy</option><option value="security">Security</option><option value="incident">Incident</option><option value="corporate">法人</option><option value="support">支援</option><option value="investor">投資</option><option value="development">開発</option><option value="other">その他</option></select></label><label>返信先Email<input name="replyEmail" type="email" required></label></div><div class="form-row"><label>名前・Nickname<input name="displayName" required maxlength="120"></label><label>件名<input name="subject" required maxlength="200"></label></div><label>本文<textarea name="message" required maxlength="20000"></textarea></label><label>添付<input name="attachments" type="file" multiple accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"></label><label><input name="privacyAccepted" value="true" type="checkbox" required> Privacy Policyに同意する</label><input type="hidden" name="clientRequestId" value=""><button class="button primary" type="submit">送信</button><p class="status" data-status aria-live="polite"></p></form>`;
 return '';
};
const jsonLd=(page)=>JSON.stringify({
 '@context':'https://schema.org','@graph':[
  {'@type':'Organization','@id':`${base}/#organization`,name:'Astera',url:`${base}/`},
  {'@type':'WebSite','@id':`${base}/#website`,url:`${base}/`,name:'Astera',inLanguage:'ja-JP',publisher:{'@id':`${base}/#organization`}},
  {'@type':page.route==='/'?'SoftwareApplication':'WebPage','@id':`${base}${page.route}#page`,url:`${base}${page.route}`,name:page.title,description:page.description,inLanguage:'ja-JP',isPartOf:{'@id':`${base}/#website`},...(page.route==='/'?{applicationCategory:'BusinessApplication',operatingSystem:'Web'}:{breadcrumb:{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'ホーム',item:`${base}/`},{'@type':'ListItem',position:2,name:page.h1,item:`${base}${page.route}`} ]}})}
 ]
}).replaceAll('<','\u003c');

await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
const pages=(await Promise.all(['data/pages.1.json','data/pages.2.json','data/pages.3.json'].map(async p=>JSON.parse(await read(p))))).flat();
const baseTpl=await read('templates/base.html');
const header=await read('templates/partials/header.html');
const footer=await read('templates/partials/footer.html');
for(const page of pages){
 const pageTpl=await read(`templates/${page.template}.html`);
 const content=replaceAll(pageTpl,{EYEBROW:esc(page.eyebrow),H1:esc(page.h1),LEAD:esc(page.lead),SECTIONS:sectionHtml(page.sections,page.template),RELATED:relatedHtml(page.related),BREADCRUMB:breadcrumb(page),SPECIAL:special(page)});
 const html=replaceAll(baseTpl,{TITLE:esc(page.title),DESCRIPTION:esc(page.description),CANONICAL:`${base}${page.route}`,ROUTE_KEY:esc(page.key),JSONLD:jsonLd(page),HEADER:header,CONTENT:content,FOOTER:footer});
 const file=routeToFile(page.route); await mkdir(dirname(file),{recursive:true}); await writeFile(file,html);
}
await cp(join(site,'assets'),join(dist,'assets'),{recursive:true});
await cp(join(site,'public','_headers'),join(dist,'_headers'));
await cp(join(site,'public','_redirects'),join(dist,'_redirects'));
await cp(join(site,'public','robots.txt'),join(dist,'robots.txt'));
await writeFile(join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p=>`  <url><loc>${base}${p.route}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(join(dist,'404.html'),replaceAll(baseTpl,{TITLE:'ページが見つかりません｜Astera',DESCRIPTION:'指定されたページは見つかりませんでした。',CANONICAL:`${base}/404`,ROUTE_KEY:'not-found',JSONLD:'{}',HEADER:header,CONTENT:'<article class="article"><header class="page-hero"><p class="eyebrow">404</p><h1>ページが見つかりません</h1><p class="lead">URLを確認するか、ホームへ戻ってください。</p><a class="button primary" href="/">ホームへ戻る</a></header></article>',FOOTER:footer}));
console.log(`Built ${pages.length} routes into ${dist}`);

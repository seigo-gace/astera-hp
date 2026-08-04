import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readChunkedData } from './lib-data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const dist = join(site, 'dist');
const read = (path) => readFile(join(site, path), 'utf8');
const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const repl = (source, values) => Object.entries(values).reduce((output, [key, value]) => output.replaceAll(`{{${key}}}`, String(value ?? '')), source);

const data = await readChunkedData(new URL('../data/', import.meta.url), 'content-bundle.index.json');
const visuals = await readChunkedData(new URL('../data/', import.meta.url), 'page-visuals.index.json');
const config = JSON.parse(await read('data/site-config.json'));
const base = config.baseUrl;
const routeFile = (route) => route === '/' ? join(dist, 'index.html') : join(dist, route.slice(1), 'index.html');
const slug = (section, index) => section.id || `section-${index + 1}`;

const main8HeaderLinks = config.main8.map((item) => `<a href="${item.route}"><span>${String(item.order).padStart(2, '0')}</span><strong>${esc(item.label)}</strong></a>`).join('');
const main8FooterLinks = config.main8.map((item) => `<a href="${item.route}">${String(item.order).padStart(2, '0')} ${esc(item.label)}</a>`).join('');
const main8Cards = config.main8.map((item) => { const page = data.find((candidate) => candidate.route === item.route); return `<a class="main-eight-card" href="${item.route}" data-reveal><span class="number">${String(item.order).padStart(2, '0')}</span><h3>${esc(item.label)}</h3><p>${esc(page?.lead || page?.description || '')}</p><span class="card-link">詳しく見る</span></a>`; }).join('');

const capsuleItems = [
  ['purpose', '本当の目的', '表面的な作業名ではなく、達成したい結果、成功条件、優先順位を明確にします。'],
  ['assumptions', '前提不足', '回答を変える不足条件と、確認が必要な事項を分離します。'],
  ['facts', '事実確認', '確認済み事実、推測、未確認情報、矛盾を分けます。'],
  ['risks', '危機察知', '実行・未実行・途中失敗のRisk、停止条件、復旧条件を整理します。'],
  ['opposition', '反対視点', '反論、弱い主張、採用してはいけない条件を保持します。'],
  ['options', '比較案', '主案、反対案、第三案を同じ軸で比較します。'],
  ['recommendation', '推奨判断', '理由、採用条件、残る不確実性、次の一手を示します。'],
  ['instruction', '主役AIへの再指示', '目的、Evidence、未確認、Risk、比較案、完成条件を具体的な再指示にします。']
];
const capsuleTabs = capsuleItems.map(([id, label], index) => `<button type="button" role="tab" id="capsule-tab-${id}" aria-controls="capsule-panel-${id}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}" data-capsule-tab="${id}">${String(index + 1).padStart(2, '0')} ${esc(label)}</button>`).join('');
const capsulePanels = capsuleItems.map(([id, label, text], index) => `<article id="capsule-panel-${id}" role="tabpanel" aria-labelledby="capsule-tab-${id}" ${index === 0 ? '' : 'hidden'} data-capsule-panel="${id}"><span class="number">${String(index + 1).padStart(2, '0')}</span><h3>${esc(label)}</h3><p>${esc(text)}</p></article>`).join('');

const sectionHtml = (page) => page.sections.map((section, index) => { const items = section.items?.length ? `<ul class="item-grid">${section.items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''; const note = section.note ? `<aside class="note">${esc(section.note)}</aside>` : ''; const code = section.code ? `<pre><code>${esc(section.code)}</code></pre>` : ''; return `<section class="content-section" id="${esc(slug(section, index))}"${page.template === 'qa' ? ' data-qa-item' : ''} data-reveal><p class="section-number">${String(index + 1).padStart(2, '0')}</p><h2>${esc(section.title)}</h2>${section.body ? `<p>${esc(section.body)}</p>` : ''}${note}${items}${code}</section>`; }).join('');

const visualHtml = (page) => { const visual = visuals.find((item) => item.route === page.route); if (!visual) throw new Error(`VISUAL_MISSING ${page.route}`); const items = visual.items.map((item, index) => `<article class="visual-item" data-reveal><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(item.label)}</h3><p>${esc(item.text)}</p></article>`).join(''); const center = visual.kind === 'hub' ? '<div class="visual-center" aria-hidden="true"><span>ASTERA</span></div>' : ''; return `<section class="page-visual visual-${esc(visual.kind)}" aria-labelledby="visual-title-${esc(page.key)}"><header class="section-heading"><p>VISUAL GUIDE</p><h2 id="visual-title-${esc(page.key)}">${esc(visual.title)}</h2></header><div class="visual-contract">${center}${items}</div></section>`; };
const toc = (page) => page.sections.map((section, index) => `<a href="#${esc(slug(section, index))}">${String(index + 1).padStart(2, '0')} ${esc(section.title)}</a>`).join('');
const related = (page) => `<aside class="related"><h2>関連ページ</h2><div class="related-links">${page.related.map((route) => `<a href="${esc(route)}"${route.startsWith('http') ? ' rel="external noopener"' : ''}>${esc(route)}</a>`).join('')}</div></aside>`;
const crumbs = (page) => page.route === '/' ? '' : `<nav class="breadcrumbs" aria-label="パンくず"><a href="/">ホーム</a><span aria-hidden="true">/</span><span>${esc(page.h1)}</span></nav>`;

const special = (page) => {
  if (page.template === 'qa') return `<section class="qa-tools" aria-labelledby="qa-tools-title"><h2 id="qa-tools-title">正式回答を検索</h2><label for="qa-search">質問・回答・Categoryから検索</label><input id="qa-search" type="search" data-qa-search autocomplete="off"><div class="qa-empty" hidden data-qa-empty><p>該当する正式回答が見つかりません。</p><a href="/chat/">総合案内AI</a><a href="/contact/">お問い合わせ</a></div></section>`;
  if (page.template === 'chat') return `<section class="chat-workspace" aria-labelledby="chat-workspace-title"><h2 id="chat-workspace-title">公開情報を会話形式で確認</h2><form class="chat-panel" data-chat-form><label>回答Type<select name="answerType"><option value="general">一般</option><option value="technical">技術</option><option value="corporate">法人</option><option value="investor">投資家</option><option value="operation">操作説明</option></select></label><label>質問<textarea name="message" maxlength="12000" required></textarea></label><button class="button is-primary" type="submit">送信</button><button class="button" type="button" hidden data-chat-abort>停止</button><div data-status aria-live="polite"></div><div data-chat-sources></div></form><p class="privacy-note">Password、API Key、Card情報、医療等の機微情報は入力しないでください。会話本文をLocal Storageへ自動保存しません。</p></section>`;
  if (page.template === 'contact') return `<section class="contact-workspace" aria-labelledby="contact-form-title"><h2 id="contact-form-title">問い合わせ内容を送信</h2><form class="contact-panel" data-contact-form enctype="multipart/form-data"><div class="form-row"><label>区分<select name="category" required><option value="">選択してください</option><option value="product">製品・使い方</option><option value="billing">料金・請求</option><option value="account">Account</option><option value="privacy">Privacy</option><option value="security">Security</option><option value="incident">不具合・Incident</option><option value="corporate">法人・協業</option><option value="support">支援・Sponsor</option><option value="investor">投資家・取材</option><option value="development">技術・開発協力</option><option value="other">その他</option></select></label><label>返信先Email<input name="replyEmail" type="email" autocomplete="email" required></label></div><div class="form-row"><label>表示名・Nickname<input name="displayName" maxlength="120" autocomplete="name"></label><label>件名<input name="subject" maxlength="200" required></label></div><label>本文<textarea name="message" maxlength="20000" required></textarea></label><label>添付（0〜5件・合計25MB）<input name="attachments" type="file" multiple accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"></label><label class="checkbox-row"><input name="privacyAccepted" value="true" type="checkbox" required> Privacy Policyに同意する</label><input name="turnstileToken" type="hidden"><input name="clientRequestId" type="hidden"><button class="button is-primary" type="submit">送信</button><p data-status aria-live="polite"></p></form></section>`;
  if (page.route === '/news/') return '<section class="filter-tools"><label>Category<select data-news-filter><option value="all">すべて</option><option>Service</option><option>Product</option><option>Security・Privacy</option><option>Development</option><option>Support</option></select></label></section>';
  if (page.route === '/docs/') return '<section class="filter-tools"><label>資料を検索<input type="search" data-doc-search></label><p>Category、対象者、Version、更新日、形式、Statusを確認できます。</p></section>';
  return '';
};

const jsonLd = (page) => JSON.stringify({'@context': 'https://schema.org', '@graph': [{'@type': 'WebSite', '@id': `${base}/#website`, name: 'Astera', url: `${base}/`, inLanguage: 'ja-JP'}, {'@type': page.template === 'qa' ? 'FAQPage' : page.route === '/' ? 'SoftwareApplication' : 'WebPage', '@id': `${base}${page.route}#page`, url: `${base}${page.route}`, name: page.title, description: page.description, inLanguage: 'ja-JP'}]}).replaceAll('<', '\\u003c');

await rm(dist, {recursive: true, force: true}); await mkdir(dist, {recursive: true});
const baseTemplate = await read('templates/base.html'); let header = await read('templates/partials/header.html'); let footer = await read('templates/partials/footer.html'); header = header.replaceAll('{{MAIN8_LINKS}}', main8HeaderLinks); footer = footer.replaceAll('{{MAIN8_LINKS}}', main8FooterLinks);
for (const page of data) { let content; if (page.route === '/') { const template = await read('templates/home.html'); content = repl(template, {MAIN8_CARDS: main8Cards, CAPSULE_TABS: capsuleTabs, CAPSULE_PANELS: capsulePanels}); } else { const template = await read('templates/article.html'); content = repl(template, {BREADCRUMB: crumbs(page), EYEBROW: esc(page.eyebrow), H1: esc(page.h1), LEAD: esc(page.lead), HERO_CTA: '', TOC: toc(page), PAGE_VISUAL: visualHtml(page), SPECIAL: special(page), SECTIONS: sectionHtml(page), RELATED: related(page)}); } const html = repl(baseTemplate, {TITLE: esc(page.title), DESCRIPTION: esc(page.description), CANONICAL: `${base}${page.route}`, ROUTE_KEY: esc(page.key), JSONLD: jsonLd(page), HEADER: header, CONTENT: content, FOOTER: footer}); if (html.includes('{{')) throw new Error(`PLACEHOLDER_UNRESOLVED ${page.route}`); const file = routeFile(page.route); await mkdir(dirname(file), {recursive: true}); await writeFile(file, html); }
await cp(join(site, 'assets'), join(dist, 'assets'), {recursive: true}); for (const file of ['_headers', '_redirects', 'robots.txt']) await cp(join(site, 'public', file), join(dist, file));
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${data.map((page) => `<url><loc>${base}${page.route}</loc></url>`).join('\n')}\n</urlset>`);
await writeFile(join(dist, '404.html'), repl(baseTemplate, {TITLE: 'ページが見つかりません｜Astera', DESCRIPTION: '指定されたページは見つかりません。', CANONICAL: `${base}/404`, ROUTE_KEY: 'not-found', JSONLD: '{}', HEADER: header, CONTENT: '<article class="page"><header class="page-hero section-frame"><p class="eyebrow">404</p><h1>ページが見つかりません</h1><p>URLを確認するか、サイトマップから目的のページへ進んでください。</p><a class="button is-primary" href="/">ホームへ戻る</a></header></article>', FOOTER: footer}));
console.log(`Built ${data.length} Notion-canonical routes`);

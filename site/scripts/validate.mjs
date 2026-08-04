import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const dist=join(root,'dist');
const pages=(await Promise.all(['pages.1.json','pages.2.json','pages.3.json'].map(async name=>JSON.parse(await readFile(join(root,'data',name),'utf8'))))).flat();
const fail=(m)=>{throw new Error(m)};
if(pages.length!==26) fail(`expected 26 routes, got ${pages.length}`);
const routes=new Set(pages.map(p=>p.route));
if(routes.size!==26) fail('duplicate route');
if(routes.has('/pricing')||routes.has('/pricing/')) fail('normal pricing page is forbidden');
const htmls=[];
async function walk(dir){for(const name of await readdir(dir)){const path=join(dir,name);const s=await stat(path);if(s.isDirectory())await walk(path);else if(name.endsWith('.html'))htmls.push(path)}}
await walk(dist);
for(const page of pages){
 const file=page.route==='/'?join(dist,'index.html'):join(dist,page.route.slice(1),'index.html');
 const html=await readFile(file,'utf8').catch(()=>fail(`missing ${page.route}`));
 for(const marker of ['<title>','name="description"','rel="canonical"','property="og:title"','application/ld+json','<h1>']) if(!html.includes(marker)) fail(`${page.route} missing ${marker}`);
 if((html.match(/<h1>/g)||[]).length!==1) fail(`${page.route} must have one h1`);
 if(html.includes('128K TOKENS')||html.includes('LOAD 62%')||html.includes('STABLE')) fail(`${page.route} contains forbidden fixed performance claim`);
 if(/(?:¥|円\/月|credit\s*=)/i.test(html)) fail(`${page.route} contains hard-coded commercial value`);
}
const sitemap=await readFile(join(dist,'sitemap.xml'),'utf8');
if((sitemap.match(/<url>/g)||[]).length!==26) fail('sitemap must contain 26 urls');
const redirects=await readFile(join(dist,'_redirects'),'utf8');
for(const path of ['/pricing ','/pricing/ ']) if(!redirects.includes(path)) fail(`missing redirect ${path}`);
const robots=await readFile(join(dist,'robots.txt'),'utf8');
if(!robots.includes('Sitemap: https://asterav8.jp/sitemap.xml')) fail('robots sitemap missing');
console.log(`Validated ${pages.length} routes, ${htmls.length} HTML files, sitemap, robots and redirects.`);

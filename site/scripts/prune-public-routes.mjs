import {readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const site = fileURLToPath(new URL('..', import.meta.url));
const dist = join(site, 'dist');
const removedRoutes = ['/company/'];

await rm(join(dist, 'company'), {recursive: true, force: true});

async function walk(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

const files = await walk(dist);
for (const file of files) {
  if (!file.endsWith('.html') && !file.endsWith('.xml')) continue;
  let source = await readFile(file, 'utf8');
  const before = source;
  for (const route of removedRoutes) {
    const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    source = source
      .replace(new RegExp(`<a\\b[^>]*href=["']${escaped}["'][^>]*>[\\s\\S]*?<\\/a>`, 'g'), '')
      .replace(new RegExp(`<url>[\\s\\S]*?<loc>https:\/\/asterav8\\.jp${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, 'g'), '');
  }
  if (source !== before) await writeFile(file, source);
}

const publicHtml = (await walk(dist)).filter((file) => file.endsWith('.html'));
for (const file of publicHtml) {
  const html = await readFile(file, 'utf8');
  if (/href=["']\/company\//.test(html)) throw new Error(`REMOVED_ROUTE_LINK_REMAINS ${file}`);
}

console.log(JSON.stringify({event: 'public_routes_pruned', removedRoutes, htmlFilesChecked: publicHtml.length}));

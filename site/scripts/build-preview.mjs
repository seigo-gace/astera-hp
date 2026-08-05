import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {extname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const site = fileURLToPath(new URL('../', import.meta.url));
const source = join(site, 'dist');
const preview = join(site, 'preview-dist');
const basePath = String(process.env.PREVIEW_BASE_PATH || '/astera-hp').replace(/\/$/, '');
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.xml', '.svg', '.txt', '.md']);

await rm(preview, {recursive: true, force: true});
await cp(source, preview, {recursive: true});
await writeFile(join(preview, '.nojekyll'), '');

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

function rewrite(content, extension) {
  let output = content;
  if (extension === '.html' || extension === '.svg') {
    output = output
      .replace(/\b(href|xlink:href|src|action|data-svg-src)="\/(?!\/)/g, `$1="${basePath}/`)
      .replace(/\b(href|xlink:href|src|action|data-svg-src)='\/(?!\/)/g, `$1='${basePath}/`);
  }
  if (extension === '.css') {
    output = output
      .replace(/url\((['"]?)\/(?!\/)/g, `url($1${basePath}/`)
      .replace(/@import\s+(['"])\/(?!\/)/g, `@import $1${basePath}/`);
  }
  if (extension === '.js' || extension === '.json') {
    output = output
      .replace(/(['"`])\/(assets|api|chat|qa|contact|news|docs|developers|product|support|investors|corporate|company|legal|use-cases)\//g, `$1${basePath}/$2/`)
      .replace(/(['"`])\/(404\.html)(['"`])/g, `$1${basePath}/$2$3`);
  }
  return output;
}

for (const file of await walk(preview)) {
  const extension = extname(file).toLowerCase();
  if (!textExtensions.has(extension)) continue;
  const original = await readFile(file, 'utf8');
  const updated = rewrite(original, extension);
  if (updated !== original) await writeFile(file, updated);
}

await mkdir(join(preview, 'preview'), {recursive: true});
await writeFile(join(preview, 'preview', 'BUILD.txt'), [
  'Astera GitHub Pages preview',
  `basePath=${basePath}`,
  `generatedAt=${new Date().toISOString()}`,
  `source=${relative(process.cwd(), source)}`
].join('\n'));

console.log(`Prepared GitHub Pages preview at ${preview} with base path ${basePath}`);

import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {extname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const site = fileURLToPath(new URL('../', import.meta.url));
const source = join(site, 'dist');
const preview = join(site, 'preview-dist');
const basePath = String(process.env.PREVIEW_BASE_PATH || '/astera-hp').replace(/\/$/, '');
const sourceCommit = String(process.env.GITHUB_SHA || 'local-unverified').trim();
const buildId = sourceCommit.slice(0, 12);
const generatedAt = new Date().toISOString();
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
  if (extension === '.html') {
    const marker = `<meta name="astera-preview-build" content="${sourceCommit}">`;
    if (!output.includes('name="astera-preview-build"')) {
      output = output.replace('</head>', `  ${marker}\n</head>`);
    }
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

const statusDirectory = join(preview, 'preview');
await mkdir(statusDirectory, {recursive: true});
const buildStatus = {
  project: 'Astera HP GitHub Pages preview',
  status: 'generated',
  basePath,
  sourceCommit,
  buildId,
  generatedAt,
  source: relative(process.cwd(), source),
  confirmationUrl: `${basePath}/?build=${buildId}`
};
await writeFile(join(statusDirectory, 'BUILD.json'), `${JSON.stringify(buildStatus, null, 2)}\n`);
await writeFile(join(statusDirectory, 'BUILD.txt'), [
  buildStatus.project,
  `status=${buildStatus.status}`,
  `basePath=${basePath}`,
  `sourceCommit=${sourceCommit}`,
  `buildId=${buildId}`,
  `generatedAt=${generatedAt}`,
  `source=${buildStatus.source}`,
  `confirmationUrl=${buildStatus.confirmationUrl}`
].join('\n'));
await writeFile(join(statusDirectory, 'index.html'), `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Astera HP Preview Status</title>
  <style>
    :root{color-scheme:dark}body{margin:0;background:#000;color:#f5f8f9;font:16px/1.6 system-ui,sans-serif}main{width:min(720px,calc(100% - 32px));margin:64px auto;padding:28px;border:1px solid #293238;border-radius:16px;background:#07090a}h1{margin-top:0;font-size:1.5rem}dl{display:grid;grid-template-columns:max-content 1fr;gap:10px 16px}dt{color:#8f989d}dd{margin:0;overflow-wrap:anywhere}code{color:#7be5ec}a{display:inline-block;margin-top:24px;padding:12px 18px;border:1px solid #7be5ec;border-radius:999px;color:#fff;text-decoration:none}a:focus-visible{outline:3px solid #fff;outline-offset:3px}
  </style>
</head>
<body>
  <main>
    <p>CONFIRMATION PREVIEW</p>
    <h1>Astera HP 実装確認サイト</h1>
    <dl>
      <dt>Status</dt><dd>公開用Build生成済み</dd>
      <dt>Commit</dt><dd><code>${sourceCommit}</code></dd>
      <dt>Generated</dt><dd>${generatedAt}</dd>
    </dl>
    <a href="${basePath}/?build=${buildId}">このBuildのTOPを確認する</a>
  </main>
</body>
</html>`, 'utf8');

console.log(`Prepared GitHub Pages preview at ${preview} with base path ${basePath}, commit ${sourceCommit}`);

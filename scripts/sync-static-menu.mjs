import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCanonicalMenuMarkup, buildNoJsMenuMarkup } from './menu-canon.js';

const currentFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(currentFile);
const repositoryRoot = path.resolve(scriptDir, '..');

const sideMenuNavPattern = /(<nav class="side-menu-body"[^>]*>)[\s\S]*?(<\/nav>\s*<\/aside>)/i;
const noJsPattern = /<!-- ASTERA_NOJS_MENU_START -->[\s\S]*?<!-- ASTERA_NOJS_MENU_END -->/i;

export function syncHtml(source, language = 'ja') {
  if (!source.includes('id="side-menu"')) return { changed: false, html: source };
  if (!sideMenuNavPattern.test(source)) throw new Error('SIDE_MENU_NAV_NOT_FOUND');

  const runtimeMarkup = buildCanonicalMenuMarkup(language).trim();
  let html = source.replace(sideMenuNavPattern, `$1\n${runtimeMarkup}\n$2`);
  html = html.replace(noJsPattern, '');
  const fallback = buildNoJsMenuMarkup(language);
  if (!/<\/body>/i.test(html)) throw new Error('BODY_END_NOT_FOUND');
  html = html.replace(/\s*<\/body>/i, `\n${fallback}\n</body>`);
  return { changed: html !== source, html };
}

function collectHtmlFiles(directory) {
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...collectHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) output.push(fullPath);
  }
  return output;
}

export function syncRepository(root = repositoryRoot) {
  const jaRoot = path.join(root, 'ja');
  if (!fs.existsSync(jaRoot)) throw new Error(`JA_ROOT_NOT_FOUND: ${jaRoot}`);
  const files = collectHtmlFiles(jaRoot);
  let changed = 0;
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const result = syncHtml(source, 'ja');
    if (!result.changed) continue;
    fs.writeFileSync(file, result.html);
    changed += 1;
  }
  return { scanned: files.length, changed };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === currentFile;
if (invokedDirectly) {
  const result = syncRepository();
  console.log(`STATIC_MENU_SYNC_PASS scanned=${result.scanned} changed=${result.changed}`);
}

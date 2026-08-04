import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {readChunkedData} from '../site/scripts/lib-data.mjs';

const data = await readChunkedData(new URL('../site/data/', import.meta.url), 'content-bundle.index.json');
const deprecatedPatterns = [
  /Business\s*(?:月額)?\s*9[,，]?980/u,
  /Enterprise\s*(?:月額)?\s*29[,，]?800/u,
  /6,600,000\s*クレ/u,
  /640,000\s*クレ/u,
  /180,000\s*クレ/u,
  /旧Plan|旧料金|旧Credit/u
];
const privatePatterns = [
  /https?:\/\/(?:app\.)?notion\.(?:com|so)\//i,
  /<mention-(?:page|user|date)/i,
  /<page\s+url=/i,
  /\b(?:api[_-]?key|secret|password)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /\/admin(?:\/|\b)/i,
  /internal-only-endpoint/i
];

test('every non-home route uses a complete Notion public source file', async () => {
  const pages = data.filter((page) => page.route !== '/');
  assert.equal(pages.length, 25);
  for (const page of pages) {
    assert.ok(page.key, `route key missing: ${page.route}`);
    assert.ok(page.sourceContent, `sourceContent id missing: ${page.route}`);
    const url = new URL(`../site/content/${page.key}.md`, import.meta.url);
    const info = await stat(url);
    assert.ok(info.isFile(), `source is not a file: ${page.key}`);
    const source = await readFile(url, 'utf8');
    assert.ok(source.length >= 500, `source too short: ${page.route} (${source.length})`);
    assert.match(source, /^#\s+\S+/m, `H1 missing: ${page.route}`);
    const headings = source.match(/^##\s+\S+/gm) || [];
    assert.ok(headings.length >= 2, `at least two H2 headings required: ${page.route}`);
    for (const pattern of deprecatedPatterns) assert.doesNotMatch(source, pattern, `deprecated value in ${page.route}`);
    for (const pattern of privatePatterns) assert.doesNotMatch(source, pattern, `private/internal content in ${page.route}`);
  }
});

test('use-cases keeps all canonical public anchors', async () => {
  const source = await readFile(new URL('../site/content/use-cases.md', import.meta.url), 'utf8');
  for (const anchor of ['personal', 'ai-review', 'development', 'business', 'research', 'organization']) {
    assert.match(source, new RegExp(`\\{#${anchor}\\}`), `missing #${anchor}`);
  }
});

test('legal and pricing sources point to the App pricing source of truth', async () => {
  for (const key of ['value', 'qa', 'terms', 'privacy', 'commerce']) {
    const source = await readFile(new URL(`../site/content/${key}.md`, import.meta.url), 'utf8');
    assert.match(source, /https:\/\/app\.asterav8\.jp\/pricing/);
  }
});

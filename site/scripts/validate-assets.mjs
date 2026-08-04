import { readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const manifest = JSON.parse(await readFile(join(site, 'data/asset-manifest.json'), 'utf8'));

if (manifest.brand.length !== 10 || manifest.visual.length !== 12) throw new Error('ASSET_CONTRACT_COUNT');
if (!manifest.status.includes('brand-byte-production-blocked')) throw new Error('BRAND_BLOCKER_MUST_REMAIN_EXPLICIT');
if (manifest.brand.some((asset) => !asset.status)) throw new Error('BRAND_STATUS_MISSING');

for (const asset of manifest.visual) {
  if (asset.status !== 'implemented-original-svg') throw new Error(`VISUAL_STATUS_INVALID ${asset.id}`);
  if (!asset.file.endsWith('.svg')) throw new Error(`VISUAL_NOT_SVG ${asset.id}`);
  const relative = asset.file.replace(/^\/assets\//, 'assets/');
  const absolute = join(site, relative);
  const details = await stat(absolute);
  if (!details.isFile() || details.size < 500) throw new Error(`VISUAL_FILE_INVALID ${asset.id}`);
  const source = await readFile(absolute, 'utf8');
  if (!/^<svg\b/u.test(source.trim())) throw new Error(`VISUAL_XML_INVALID ${asset.id}`);
  if (!/viewBox=/u.test(source)) throw new Error(`VISUAL_VIEWBOX_MISSING ${asset.id}`);
}

console.log('Visual asset contract PASS (12/12 original SVG); official brand bytes remain an explicit production gate');

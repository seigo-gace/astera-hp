import { createHash } from 'node:crypto';
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
  const relative = asset.file.replace(/^\/assets\//, 'assets/');
  const absolute = join(site, relative);
  const details = await stat(absolute);
  if (!details.isFile() || details.size < 500) throw new Error(`VISUAL_FILE_INVALID ${asset.id}`);

  if (asset.id === 'astera-globe-top') {
    if (asset.status !== 'user-provided-web-optimized') throw new Error('HERO_SOURCE_STATUS_INVALID');
    if (asset.file !== '/assets/images/astera-globe-top.webp') throw new Error('HERO_SOURCE_PATH_INVALID');
    if (details.size !== asset.bytes || details.size !== 178672) throw new Error(`HERO_SOURCE_SIZE_INVALID ${details.size}`);
    if (asset.psnrDb < 43.5) throw new Error(`HERO_SOURCE_QUALITY_INVALID ${asset.psnrDb}`);
    const source = await readFile(absolute);
    const sha256 = createHash('sha256').update(source).digest('hex');
    if (sha256 !== asset.sha256 || sha256 !== '64f34c997275d1769c8b767957038eaf1bfe3f0f0dd672e68ea550bc5314b8b2') throw new Error(`HERO_SOURCE_HASH_INVALID ${sha256}`);
    if (source.subarray(0, 4).toString('ascii') !== 'RIFF' || source.subarray(8, 12).toString('ascii') !== 'WEBP') throw new Error('HERO_SOURCE_SIGNATURE_INVALID');
    continue;
  }

  if (asset.status !== 'implemented-original-svg') throw new Error(`VISUAL_STATUS_INVALID ${asset.id}`);
  if (!asset.file.endsWith('.svg')) throw new Error(`VISUAL_NOT_SVG ${asset.id}`);
  const source = await readFile(absolute, 'utf8');
  if (!/^<svg\b/u.test(source.trim())) throw new Error(`VISUAL_XML_INVALID ${asset.id}`);
  if (!/viewBox=/u.test(source)) throw new Error(`VISUAL_VIEWBOX_MISSING ${asset.id}`);
}

console.log('Visual asset contract PASS (latest user-provided premium WebP + 11 supporting SVG); official brand bytes remain an explicit production gate');

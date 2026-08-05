import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const cssUrl = new URL('../dist/assets/astera-hero-image.css', import.meta.url);
const cssPath = fileURLToPath(cssUrl);
const canonicalAsset = '/assets/images/astera-globe-lower-right-restoration.webp';
const embeddedPatchPattern = /background-image\s*:\s*url\((['"]?)data:image\/webp;base64,[A-Za-z0-9+/=]+\1\)\s*;/g;

const original = await readFile(cssPath, 'utf8');
const matches = original.match(embeddedPatchPattern) || [];

if (matches.length !== 1) {
  throw new Error(`HERO_RESTORATION_EMBEDDED_PATCH_COUNT_INVALID expected=1 actual=${matches.length}`);
}

const normalized = original.replace(
  embeddedPatchPattern,
  `background-image:url("${canonicalAsset}");`
);

if (normalized.includes('data:image/webp;base64,')) {
  throw new Error('HERO_RESTORATION_DATA_URI_REMAINS_IN_DELIVERY_CSS');
}

await writeFile(cssPath, normalized);
console.log(`Normalized Hero restoration delivery CSS to ${canonicalAsset}`);

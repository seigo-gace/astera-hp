import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, stat} from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const canonicalWebp = (encoded) => {
  const transport = Buffer.from(encoded, 'base64');
  assert.equal(transport.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(transport.subarray(8, 12).toString('ascii'), 'WEBP');
  const declaredBytes = transport.readUInt32LE(4) + 8;
  assert.equal(declaredBytes, 1834);
  const remainder = transport.subarray(declaredBytes);
  assert.ok(remainder.length <= 1);
  assert.ok(remainder.every((byte) => byte === 0));
  return transport.subarray(0, declaredBytes);
};

test('layered globe keeps the supplied image as the base and contains effect layers only', async () => {
  const svg = await read('site/assets/visual/hero/astera-globe-exact-layered.svg');
  for (const marker of [
    'data-astera-layered-svg="true"',
    'id="base-image"',
    'id="effects-behind"',
    'id="effects-orbits"',
    'id="effects-particles"',
    'id="effects-front"',
    'href="/assets/images/astera-globe-top.webp"'
  ]) assert.match(svg, new RegExp(marker.replaceAll('.', '\\.')));
  assert.ok((svg.match(/class="data-line/g) || []).length >= 10);
  assert.ok((svg.match(/class="glow-node/g) || []).length >= 18);
  assert.doesNotMatch(svg, /<text\b|<foreignObject\b|<script\b|<style\b/);
  assert.equal((svg.match(/id="lower-right-sparkle-removal"/g) || []).length, 1);
  assert.match(svg, /id="lower-right-sparkle-removal"[\s\S]*x="825" y="1338" width="110" height="112"/);
  const svgPatch = svg.match(/id="lower-right-sparkle-removal"[\s\S]*?href="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/)?.[1];
  assert.ok(svgPatch, 'Layered SVG restoration patch is missing');
  const canonical = canonicalWebp(svgPatch);
  assert.equal(createHash('sha256').update(canonical).digest('hex'), '6ae36d248ac206ec4e7785991ef9df8c60feab1bd466371aa3500ec92188357a');
});

test('hero controller uses pinned local GSAP with viewport and accessibility guards', async () => {
  const script = await read('site/assets/astera-hero-image.js');
  for (const marker of [
    '/assets/vendor/gsap-3.12.2.min.js',
    '/assets/visual/hero/astera-globe-exact-layered.svg',
    '/assets/images/astera-globe-lower-right-restoration.webp',
    'new DOMParser()',
    'gsap.quickTo',
    'strokeDashoffset',
    'IntersectionObserver',
    "prefers-reduced-motion: reduce",
    'visibilitychange',
    'is-svg-failed'
  ]) assert.match(script, new RegExp(marker.replaceAll('.', '\\.').replaceAll('(', '\\(').replaceAll(')', '\\)')));
  assert.doesNotMatch(script, /canvas|getContext\(|requestAnimationFrame\(draw|astera-hero-hud|innerHTML\s*=/);

  const compatibility = await read('site/assets/astera-bootstrap.js');
  assert.match(compatibility, /astera-globe-exact-layered\.svg/);
  assert.match(compatibility, /astera-globe-top\.webp/);
  assert.doesNotMatch(compatibility, /<canvas|network-canvas|data-network-canvas|concept-labels|network-orbit|astera-hero-hud/);
});

test('baked-in lower-right sparkle is removed in fallback and moving SVG states', async () => {
  const script = await read('site/assets/astera-hero-image.js');
  const css = await read('site/assets/astera-hero-image.css');

  for (const marker of [
    'x: 825',
    'y: 1338',
    'width: 110',
    'height: 112',
    'lower-right-sparkle-removal',
    'installSparkleRemoval(svg)',
    'patch.setAttribute(\'href\', patchAsset)',
    'is-sparkle-patch-in-svg'
  ]) assert.ok(script.includes(marker), `Missing sparkle-removal controller marker: ${marker}`);

  assert.match(css, /\.astera-hero-depth::after/);
  assert.match(css, /left:80\.56640625%/);
  assert.match(css, /top:87\.109375%/);
  assert.match(css, /width:10\.7421875%/);
  assert.match(css, /height:7\.291666667%/);
  assert.match(css, /data:image\/webp;base64,/);
  assert.match(css, /is-sparkle-patch-in-svg/);
  assert.doesNotMatch(script + css, /✦/u);

  const encodedPatch = css.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/)?.[1];
  assert.ok(encodedPatch, 'Sparkle-removal WebP patch is missing');
  const canonicalPatch = canonicalWebp(encodedPatch);
  assert.equal(canonicalPatch.length, 1834);
  assert.equal(createHash('sha256').update(canonicalPatch).digest('hex'), '6ae36d248ac206ec4e7785991ef9df8c60feab1bd466371aa3500ec92188357a');

  const patchFile = await readFile(new URL('../site/assets/images/astera-globe-lower-right-restoration.webp', import.meta.url));
  assert.equal(patchFile.length, 1834);
  assert.equal(createHash('sha256').update(patchFile).digest('hex'), '6ae36d248ac206ec4e7785991ef9df8c60feab1bd466371aa3500ec92188357a');
});

test('hero CSS preserves a visible WebP fallback and contains no overlaid UI selectors', async () => {
  const css = await read('site/assets/astera-hero-image.css');
  assert.match(css, /\.astera-hero-image/);
  assert.match(css, /\.astera-hero-svg/);
  assert.match(css, /is-svg-image-ready/);
  assert.match(css, /is-svg-failed/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /hero-hud|hud-status|concept-label|data-node|network-canvas/);
});

test('build pins and self-hosts GSAP instead of weakening CSP', async () => {
  const packageJson = JSON.parse(await read('package.json'));
  const packageLock = JSON.parse(await read('package-lock.json'));
  assert.equal(packageJson.dependencies.gsap, '3.12.2');
  assert.equal(packageLock.packages['node_modules/gsap'].version, '3.12.2');
  const headers = await read('site/public/_headers');
  assert.match(headers, /script-src 'self'/);
  assert.doesNotMatch(headers, /cdnjs|jsdelivr|unsafe-inline/);
  const layeredSource = await read('site/assets/visual/hero/astera-globe-exact-layered.svg');
  assert.doesNotMatch(layeredSource, /<style\b/);
  const runtimePath = new URL('../site/assets/vendor/gsap-3.12.2.min.js', import.meta.url);
  const runtimeInfo = await stat(runtimePath);
  assert.ok(runtimeInfo.size > 50000);
  assert.match(await readFile(runtimePath, 'utf8'), /GSAP 3\.12\.2/);
});

test('built TOP keeps the fallback image and ships the layered effect asset', async () => {
  const html = await read('site/dist/index.html');
  assert.match(html, /assets\/images\/astera-globe-top\.webp/);
  assert.match(html, /data-svg-src="\/assets\/visual\/hero\/astera-globe-exact-layered\.svg"/);
  assert.doesNotMatch(html, /astera-hero-hud|ASTERA \/ JUDGMENT NETWORK|<canvas/);
  const layered = await stat(new URL('../site/dist/assets/visual/hero/astera-globe-exact-layered.svg', import.meta.url));
  const patch = await stat(new URL('../site/dist/assets/images/astera-globe-lower-right-restoration.webp', import.meta.url));
  const runtime = await stat(new URL('../site/dist/assets/vendor/gsap-3.12.2.min.js', import.meta.url));
  assert.ok(layered.size > 8000);
  assert.equal(patch.size, 1834);
  assert.ok(runtime.size > 50000);
});

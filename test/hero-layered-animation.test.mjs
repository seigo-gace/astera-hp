import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

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
  assert.doesNotMatch(svg, /<text\b|<foreignObject\b|<script\b|data:image\//);
});

test('hero controller uses pinned local GSAP with viewport and accessibility guards', async () => {
  const script = await read('site/assets/astera-hero-image.js');
  for (const marker of [
    '/assets/vendor/gsap-3.12.2.min.js',
    '/assets/visual/hero/astera-globe-exact-layered.svg',
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
  const runtime = await stat(new URL('../site/dist/assets/vendor/gsap-3.12.2.min.js', import.meta.url));
  assert.ok(layered.size > 9000);
  assert.ok(runtime.size > 50000);
});

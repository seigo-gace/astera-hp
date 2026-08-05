import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const controllerUrl = new URL('../site/assets/astera-hero-image.js', import.meta.url);
const patchUrl = new URL('../site/assets/images/astera-globe-lower-right-restoration.webp', import.meta.url);

test('hero controller is valid JavaScript and references the canonical restoration asset', async () => {
  const source = await readFile(controllerUrl, 'utf8');
  assert.doesNotThrow(() => new Function(source));
  assert.match(source, /\/assets\/images\/astera-globe-lower-right-restoration\.webp/);

  const patch = await readFile(patchUrl);
  assert.equal(patch.length, 1834);
  assert.equal(patch.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(patch.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.equal(patch.readUInt32LE(4) + 8, 1834);
  assert.equal(createHash('sha256').update(patch).digest('hex'), '6ae36d248ac206ec4e7785991ef9df8c60feab1bd466371aa3500ec92188357a');
});

test('hero controller validates one patch and rewrites it before mounting the SVG', async () => {
  const source = await readFile(controllerUrl, 'utf8');
  assert.match(source, /function installSparkleRemoval\(svg\)/);
  assert.match(source, /svg\.querySelector\('#lower-right-sparkle-removal'\)/);
  assert.match(source, /patch\.setAttribute\('href', patchAsset\)/);
  assert.match(source, /patch\.removeAttribute\('xlink:href'\)/);
  assert.match(source, /if \(!installSparkleRemoval\(svg\)\)/);
  assert.match(source, /mount\.append\(svg\);/);
  assert.ok(source.indexOf('installSparkleRemoval(svg)') < source.indexOf('mount.append(svg)'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const controllerUrl = new URL('../site/assets/astera-hero-image.js', import.meta.url);

test('hero controller is valid JavaScript and embeds the canonical restoration patch', async () => {
  const source = await readFile(controllerUrl, 'utf8');
  assert.doesNotThrow(() => new Function(source));

  const encoded = source.match(/const PATCH_SOURCE = `\$\{PATCH_PREFIX\}([A-Za-z0-9+/=]+)`;/)?.[1];
  assert.ok(encoded, 'Embedded hero restoration patch is missing');

  const transport = Buffer.from(encoded, 'base64');
  assert.equal(transport.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(transport.subarray(8, 12).toString('ascii'), 'WEBP');

  const declaredLength = transport.readUInt32LE(4) + 8;
  assert.equal(declaredLength, 1834);
  const canonical = transport.subarray(0, declaredLength);
  assert.equal(canonical.length, 1834);
  assert.equal(createHash('sha256').update(canonical).digest('hex'), '6ae36d248ac206ec4e7785991ef9df8c60feab1bd466371aa3500ec92188357a');
  assert.ok(transport.subarray(declaredLength).length <= 1);
});

test('hero controller installs exactly one patch before mounting the SVG', async () => {
  const source = await readFile(controllerUrl, 'utf8');
  assert.match(source, /function installSparkleRemoval\(svg\)/);
  assert.match(source, /svg\.querySelector\('#lower-right-sparkle-removal'\)/);
  assert.match(source, /baseLayer\.after\(patch\)/);
  assert.match(source, /const sparklePatchInstalled = installSparkleRemoval\(svg\);/);
  assert.match(source, /mount\.append\(svg\);/);
  assert.ok(source.indexOf('installSparkleRemoval(svg)') < source.indexOf('mount.append(svg)'));
});

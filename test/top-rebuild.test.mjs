import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('Notion-approved TOP contract is complete',async()=>{
  const [home,header,base,css,script,transport,packageJson,materializer,manifest,apply]=await Promise.all([
    read('site/templates/home.html'),
    read('site/templates/partials/header.html'),
    read('site/templates/base.html'),
    read('site/assets/top-rebuild.css'),
    read('site/assets/top-rebuild.js'),
    read('site/assets/customer-ai-transport.js'),
    read('package.json'),
    read('site/scripts/materialize-top-svg.mjs'),
    read('site/data/asset-manifest.json'),
    read('site/scripts/apply-top-rebuild.mjs')
  ]);
  assert.equal((home.match(/<details class="top-topic"/g)||[]).length,9);
  for(const route of ['/product/what-is-astera/','/product/why-astera/','/product/value/','/product/process/','/product/engine/','/product/usage/','/product/technology/','/product/integration/','/evidence/','/supporters/'])assert.match(home,new RegExp(route.replaceAll('/','\\/')));
  assert.match(home,/astera-original-transparent\.svg/);
  assert.doesNotMatch(home,/astera-globe-top\.webp/);
  assert.match(header,/header-language-row/);
  assert.match(header,/header-action-row/);
  assert.match(header,/data-ai-open/);
  assert.match(header,/data-brand-status="pending-official-logo"/);
  assert.match(header,/astera-top-brand-label/);
  assert.doesNotMatch(header,/assets\/brand\/astera-(logo|symbol|wordmark)|brand-fallback/);
  assert.match(base,/top-rebuild\.css/);
  assert.match(base,/top-rebuild\.js/);
  assert.match(base,/data-ai-draggable/);
  assert.match(css,/grid-template-columns:repeat\(3/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(script,/astera\.hp\.ai-position/);
  assert.match(script,/data-language-cycle/);
  assert.match(script,/productTranslations/);
  assert.match(transport,/api\.asterav8\.jp\/v1\/customer-ai/);
  assert.match(transport,/\/messages/);
  assert.match(transport,/\/jobs\//);
  assert.doesNotMatch(transport,/HF_TOKEN|huggingface\.co|astera-customerAI/);
  assert.doesNotMatch(packageJson,/materialize-official-brand-assets\.mjs/);
  assert.match(packageJson,/materialize-top-svg\.mjs/);
  assert.match(packageJson,/apply-top-rebuild\.mjs/);
  assert.match(materializer,/3097567/);
  assert.match(materializer,/84a9988a47157a9b6f01602fee08f1b176dbe7d6996a4fd42b07ca644551c5e2/);
  assert.match(manifest,/top-rebuild-svg-verified-logo-pending/);
  assert.match(manifest,/pending-design-and-approval/);
  assert.doesNotMatch(manifest,/hash-verified|git-history-or-archive|archiveSha256/);
  assert.match(apply,/routeCount!==27/);
});

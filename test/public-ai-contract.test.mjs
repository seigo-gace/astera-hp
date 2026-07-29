import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contract = JSON.parse(await readFile(new URL('../public-ai/approved-public-ai.json', import.meta.url), 'utf8'));
const expectedItems = [
  '本当の目的',
  '前提不足',
  '事実確認',
  '危機察知',
  '反対視点',
  '比較案',
  '推奨判断',
  '主役AIへの再指示'
];

test('approved source revision is pinned', () => {
  assert.equal(contract.schema_version, 'astera-hp-public-ai-v2');
  assert.equal(contract.effective_date, '2026-07-29');
  assert.equal(contract.source_sha256, '8c2de4259b00a4c64dc175bb76ed7187387db1c127e2f3de66fc21278490d8f5');
  assert.equal(contract.source_policy.visual_design_frozen, true);
});

test('new public positioning is exact', () => {
  assert.equal(contract.positioning.brand_label, '外付けAI強化外装');
  assert.equal(contract.positioning.kicker, 'GOOGLE V8 × 多重並列思考');
  assert.equal(contract.positioning.tagline, '問いを星図に変える。');
  assert.equal(contract.positioning.subhero, 'あなたのAIを置き換えず、判断に必要な材料を外側から加える。');
});

test('eight judgment materials are complete, ordered and answerable', () => {
  assert.deepEqual(contract.judgment_materials.map((item) => item.title), expectedItems);
  assert.equal(contract.judgment_materials.length, 8);
  for (const item of contract.judgment_materials) {
    assert.match(item.number, /^0[1-8]$/);
    assert.ok(item.summary.length >= 10);
    assert.ok(item.deliver_to_main_ai.length >= 5);
    assert.ok(item.answer_effect.length >= 20);
  }
});

test('all transfer methods are preserved without claiming universal availability', () => {
  assert.deepEqual(contract.transfer_methods.map((item) => item.id), ['copy', 'form', 'api', 'webhook']);
  assert.equal(contract.source_policy.customer_ai_bubble_is_separate_from_this_explanation, true);
});

test('technical boundary blocks misleading public interpretations', () => {
  assert.equal(contract.technical_boundary.google_v8_is_a_javascript_runtime_not_a_generative_model, true);
  assert.equal(contract.technical_boundary.parallel_processing_respects_dependency_order, true);
  assert.equal(contract.technical_boundary.public_eight_materials_are_output_contract_not_internal_module_list, true);
  assert.equal(contract.technical_boundary.main_ai_and_expert_judgment_are_not_replaced, true);
});

test('browser transport is public-edge-only', () => {
  assert.equal(contract.customer_ai_transport.api_base, 'https://api.asterav8.jp');
  assert.equal(contract.customer_ai_transport.message_path, '/v1/customer-ai/messages');
  assert.equal(contract.customer_ai_transport.source, 'astera-hp');
  assert.equal(contract.customer_ai_transport.browser_must_not_receive_private_runtime_or_gateway_credentials, true);
});

test('old public bundle is not accepted as current pricing or provider truth', () => {
  const serialized = JSON.stringify(contract);
  for (const forbidden of ['2,000円', '9,800円', 'Stripe', 'KAGURA v1.1.0']) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});

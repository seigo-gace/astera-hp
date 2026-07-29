# Customer AI UI Integration

## Confirmed UI boundary

The approved official website already contains a separate all-page Customer AI bubble shell with compact, expanded, minimized, dragged and mobile states. This integration must not replace that shell and must not merge it with the standalone public AI explanation scene.

The latest public AI explanation is pinned by `public-ai/approved-public-ai.json`:

- schema: `astera-hp-public-ai-v2`
- effective date: `2026-07-29`
- approved source: `index(18).html`
- SHA-256: `8c2de4259b00a4c64dc175bb76ed7187387db1c127e2f3de66fc21278490d8f5`

The contract preserves the new public wording—`外付けAI強化外装`, `GOOGLE V8 × 多重並列思考`, the eight judgment materials, and the copy/form/API/Webhook transfer explanation—without treating the explanatory 3D scene as the Customer AI chat UI.

## Include

Load the transport after the existing frozen Customer AI UI code. The approved snippet is stored at `public-ai/customer-ai-transport-include.html`.

```html
<script
  defer
  src="/assets/customer-ai-transport.js"
  data-source="astera-hp"
  data-api-base="https://api.asterav8.jp"
></script>
```

The script merges communication methods into the existing `window.AsteraCustomerAI` object rather than replacing it.

## Methods

```text
window.AsteraCustomerAI.send(message, options)
window.AsteraCustomerAI.submit(message, options)
window.AsteraCustomerAI.poll(jobId)
window.AsteraCustomerAI.getJob(jobId)
window.AsteraCustomerAI.ask(message, options)
window.AsteraCustomerAI.getSessionId()
window.AsteraCustomerAI.configure(options)
```

`ask()` performs request acceptance and bounded polling and returns the completed, clarification, degraded or failed result.

## Events

```text
astera:customer-ai-ready
astera:customer-ai-accepted
astera:customer-ai-progress
astera:customer-ai-result
```

The approved bubble UI may call the methods directly or subscribe to these events. The visual state, layout, drag behavior and responsive rules remain owned by the existing website UI.

## Public route

```text
Browser
  -> https://api.asterav8.jp/v1/customer-ai/messages
  -> generic Webhook Gateway
  -> private Hugging Face Customer AI runtime
  -> CustomerAI_Master_v2 public records
  -> result event
  -> https://api.asterav8.jp/v1/customer-ai/jobs/{job_id}
  -> existing HP bubble
```

The browser must never call the private Hugging Face Space or the generic Gateway directly.

## Turnstile

The transport obtains a token from either:

```text
window.AsteraCustomerAI.getTurnstileToken()
window.AsteraTurnstile.getToken()
```

The browser never receives Webhook Gateway credentials, Hugging Face credentials, private Space URLs, Notion credentials or result callback secrets.

## Verification

The repository verification runs:

```text
node --check assets/customer-ai-transport.js
node --test test/*.test.mjs
```

The tests confirm the latest public wording, eight-item order, transfer methods, no old price/provider contamination, UI-object preservation, Turnstile submission, bounded polling, explicit failures and absence of private credentials.

## Deployment boundary

The semantic public contract and transport boundary are committed. The production website build must include `public-ai/customer-ai-transport-include.html` after the frozen bubble UI. No visual HTML, CSS, Three.js scene, layout or interaction may be regenerated or redesigned as part of this integration.

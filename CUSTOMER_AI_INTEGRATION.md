# Customer AI UI Integration

## Confirmed UI boundary

The approved official website already contains a separate all-page Customer AI bubble shell with compact, expanded, minimized, dragged and mobile states. This integration must not replace that shell and must not merge it with the standalone Q&A page.

## Include

Load the transport after the existing Customer AI UI code:

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

## Turnstile

The transport obtains a token from either:

```text
window.AsteraCustomerAI.getTurnstileToken()
window.AsteraTurnstile.getToken()
```

The browser never receives Webhook Gateway credentials, Hugging Face credentials, private Space URLs or result callback secrets.

## Missing repository input

The approved website source is not yet committed to this repository. Therefore this branch adds only the verified transport boundary. The final HTML inclusion and browser E2E must be performed after the frozen website files are placed in the repository without redesign or replacement.

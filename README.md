# erli-rest-client-ts

Typed, server-side TypeScript client for the ERLI marketplace Shop API.

> This is an independent open-source project and is not an official ERLI package.

## Features

- Bearer API-key authentication
- Node.js 18+ native `fetch`
- ESM and CommonJS builds
- TypeScript declarations
- configurable timeout
- retries for `429`, connection errors and server errors
- `Retry-After` support
- structured API and network errors
- generic `request<T>()`
- resources for inbox, orders, products, hooks and delivery price lists
- Vitest test suite and GitHub Actions CI

## Installation

From GitHub while the package is not yet published to npm:

```bash
npm install github:CichockiAdrian/erli-rest-client-ts
```

After npm publication:

```bash
npm install erli-rest-client-ts
```

## Getting the ERLI API key

The seller retrieves the key in the ERLI seller panel:

```text
Metoda integracji → Własna integracja po API
```

Keep the API key on the server. Do not expose it in browser code or commit it to Git.

## Quick start

```ts
import { ErliClient } from "erli-rest-client-ts";

const erli = new ErliClient({
  apiKey: process.env.ERLI_API_KEY!,
  userAgent: "MyApplication/1.0.0 (+https://example.com)"
});

const inbox = await erli.inbox.list();
console.log(inbox);
```

## Configuration

```ts
const erli = new ErliClient({
  apiKey: process.env.ERLI_API_KEY!,
  baseUrl: "https://erli.pl/svc/shop-api",
  userAgent: "MyApplication/1.0.0 (+https://example.com)",
  timeoutMs: 10_000,
  maxRetries: 3,
  retryBaseDelayMs: 300
});
```

`baseUrl` can also point to an ERLI test environment after ERLI support provides access and its dedicated domain.

## Inbox

ERLI documents the inbox as a source of order events and product synchronization notifications. One read returns up to 500 unread messages.

```ts
const messages = await erli.inbox.list();
```

The exact acknowledgement operation is intentionally not guessed in `v0.1.0`. Use the generic request method after confirming the current endpoint and payload in ERLI's API reference for your account.

## Orders

```ts
const orders = await erli.orders.list();

const order = await erli.orders.get("1234x5678");

await erli.orders.update("1234x5678", {
  status: "sent",
  trackingNumber: "TRACKING-123"
});
```

ERLI's documented base order statuses include `pending`, `purchased` and `cancelled`. Filtering and pagination shapes can evolve, so use `request<T>()` with the current ERLI API reference when you need fields not yet wrapped by this package. Processing/fulfilment fields may also depend on the current reference.

## Products

Product IDs are seller-system identifiers and are URL-encoded by the client.

```ts
await erli.products.create("sku-123", {
  name: "Krzesło ogrodowe",
  stock: 10,
  status: "active",
  price: 199.99
});

await erli.products.update("sku-123", {
  stock: 7,
  price: 189.99
});

const product = await erli.products.get("sku-123");
```

ERLI product writes are asynchronous. A successful `202` confirms initial validation and queuing, not completion of all marketplace processing.

## Hooks

```ts
await erli.hooks.register({
  hookName: "orderCreated",
  url: "https://example.com/webhooks/erli/order-created",
  accessToken: "your-generated-hook-secret"
});
```

Known hook names include:

- `productsNeedSync`
- `orderCreated`
- `orderStatusChanged`

Test the product-sync hook:

```ts
await erli.hooks.runProductsNeedSyncTest();
```

ERLI expects hook handlers to return any `2xx` response within 5 seconds. Failed hook deliveries are not retried, so production integrations should also poll the inbox.

## Delivery price lists

```ts
const priceLists = await erli.delivery.getPriceLists();
```

## Generic requests

Use `request<T>()` for endpoints not yet wrapped by a resource:

```ts
interface CustomResponse {
  value: string;
}

const data = await erli.request<CustomResponse>({
  method: "GET",
  path: "/some-endpoint",
  query: { limit: 50 }
});
```

Absolute URLs are rejected to reduce the risk of accidentally forwarding the API key to another host.

## Errors

```ts
import { ErliApiError, ErliNetworkError } from "erli-rest-client-ts";

try {
  await erli.inbox.list();
} catch (error) {
  if (error instanceof ErliApiError) {
    console.error(error.status, error.responseBody, error.requestId);
  } else if (error instanceof ErliNetworkError) {
    console.error(error.method, error.url, error.cause);
  }
}
```

## Retry rules

By default, retries apply to:

- `GET`
- `PATCH`
- `PUT`
- `DELETE`

and to retryable responses such as `429` and `5xx`, plus network failures.

`POST` is not retried by default because it may create duplicates. Enable it only for an operation you know is safe:

```ts
await erli.request({
  method: "POST",
  path: "/some-idempotent-operation",
  body: {},
  retry: true
});
```

`products.create()` enables retries because the external product ID is deterministic and ERLI's integration guide recommends retrying product writes after connection/server failures.

## Security

- Use this library on the server, not directly in a browser.
- Store API keys encrypted at rest.
- Never log the complete API key.
- Use a separate random access token for each registered hook.
- Validate incoming hook authorization before processing its body.

## Development

```bash
npm install
npm run check
```

Available scripts:

```bash
npm run typecheck
npm test
npm run build
npm run test:coverage
```

## License

MIT

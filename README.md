# erli-rest-client-ts

[![CI](https://github.com/CichockiAdrian/erli-rest-client-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/CichockiAdrian/erli-rest-client-ts/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933.svg)](package.json)

A typed, server-side TypeScript client for the ERLI marketplace Shop API.

> Independent open-source project. This package is not an official ERLI SDK
> and is not affiliated with ERLI.

## Status

`0.1.x` is an early public API. Endpoint wrappers intentionally remain small;
use `request<T>()` for operations that are not wrapped yet.

## Features

- Bearer API-key authentication
- configurable base URL, timeout and retry policy
- `Retry-After` support
- structured API, configuration and network errors
- inbox, orders, products, hooks and delivery helpers
- generic typed `request<T>()`
- protection against forwarding the API key to absolute external URLs
- ESM, CommonJS and TypeScript declarations
- tests and GitHub Actions CI

## Requirements

- Node.js 18+
- an ERLI seller account
- an API key generated in the ERLI seller panel
- server-side usage

Never expose the API key in browser code.

## Installation

Until the package is published to npm:

```bash
npm install github:CichockiAdrian/erli-rest-client-ts
```

After publication:

```bash
npm install erli-rest-client-ts
```

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

## Resources

```ts
await erli.inbox.list();

await erli.orders.list();
await erli.orders.get("order-id");
await erli.orders.update("order-id", {
  status: "sent",
  trackingNumber: "TRACKING-123"
});

await erli.products.get("sku-123");
await erli.products.create("sku-123", {
  name: "Garden chair",
  stock: 10,
  status: "active",
  price: 199.99
});
await erli.products.update("sku-123", { stock: 8 });

await erli.hooks.register({
  hookName: "orderCreated",
  url: "https://example.com/webhooks/erli",
  accessToken: "a-separate-random-hook-secret"
});

await erli.delivery.getPriceLists();
```

## Generic requests

```ts
interface CustomResponse {
  value: string;
}

const response = await erli.request<CustomResponse>({
  method: "GET",
  path: "/some-endpoint",
  query: { limit: 50 }
});
```

Only API-relative paths are accepted. This prevents accidental forwarding of
the Bearer key to another host.

## Retry behavior

Safe methods are retried by default for network failures, `429` and selected
server errors. `POST` is not retried unless the caller explicitly enables it
or a resource helper uses a deterministic identifier.

```ts
await erli.request({
  method: "POST",
  path: "/known-idempotent-operation",
  body: {},
  retry: true
});
```

Review the idempotency guarantees of every write operation before enabling
retries.

## Errors

```ts
import { ErliApiError, ErliNetworkError } from "erli-rest-client-ts";

try {
  await erli.orders.list();
} catch (error) {
  if (error instanceof ErliApiError) {
    console.error(error.status, error.requestId);
  }

  if (error instanceof ErliNetworkError) {
    console.error(error.method, error.url);
  }
}
```

Do not log the API key or complete order payloads.

## Documentation

- [Quick start](docs/quickstart.md)
- [Authentication](docs/authentication.md)
- [API reference](docs/api-reference.md)
- [Inbox and hooks](docs/inbox-and-hooks.md)
- [Production checklist](docs/production-checklist.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Release process](RELEASING.md)

## Official platform documentation

- [ERLI Shop API documentation](https://erli.pl/svc/shop-api/doc/)

## License

MIT

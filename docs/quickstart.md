# Quick start

## 1. Get an API key

In the ERLI seller panel, select the API integration method and copy the API
key. Keep it in a backend secret store.

```env
ERLI_API_KEY=
```

## 2. Create the client

```ts
import { ErliClient } from "erli-rest-client-ts";

export const erli = new ErliClient({
  apiKey: process.env.ERLI_API_KEY!,
  userAgent: "MyApplication/1.0.0 (+https://example.com)",
  timeoutMs: 10_000,
  maxRetries: 3
});
```

## 3. Test the connection

Use a read-only operation first:

```ts
const inbox = await erli.inbox.list();
console.log(inbox);
```

## 4. Add synchronization

Process inbox events idempotently and persist a cursor or processed-message
identifier in your own database. Fetch full order data only when required.

## 5. Add hooks as an optimization

Hooks can reduce latency, but inbox polling should remain the recovery path for
missed deliveries.

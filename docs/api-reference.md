# API reference

## `ErliClient`

```ts
new ErliClient({
  apiKey,
  baseUrl,
  userAgent,
  timeoutMs,
  maxRetries,
  retryBaseDelayMs,
  fetch
})
```

## Generic request

```ts
client.request<TResponse, TBody>({
  method,
  path,
  query,
  body,
  headers,
  retry,
  signal
})
```

The path must be relative to the configured Shop API base URL.

## Resources

```ts
client.inbox.list()

client.orders.list()
client.orders.get(orderId)
client.orders.update(orderId, update)

client.products.get(externalProductId)
client.products.create(externalProductId, payload)
client.products.update(externalProductId, changes)

client.hooks.register(registration)
client.hooks.runProductsNeedSyncTest()

client.delivery.getPriceLists()
```

Some response shapes are generic because marketplace fields can evolve. Supply
your own response type when you need stricter typing:

```ts
const response = await erli.orders.list<MyOrdersResponse>();
```

## Errors

- `ErliConfigurationError`
- `ErliApiError`
- `ErliNetworkError`

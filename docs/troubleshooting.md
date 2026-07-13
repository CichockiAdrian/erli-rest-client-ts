# Troubleshooting

## `401` or `403`

Confirm that the API key is current, belongs to the expected seller account
and is being sent from the backend.

## `429 Too Many Requests`

Reduce polling frequency, batch work where supported and honor `Retry-After`.

## Duplicate writes

Do not blindly retry `POST`. Use deterministic identifiers or a platform
idempotency mechanism before enabling retries.

## Missing hook events

Treat hooks as a fast notification path, not the only source of truth. Poll the
inbox and process events idempotently.

## Response type differs from the wrapper

Provide an explicit generic response type or use `request<T>()` while checking
the current ERLI API reference.

## npm install fails

```bash
rm -rf node_modules
npm cache verify
npm ci
```

Confirm `.npmrc` and `package-lock.json` use `https://registry.npmjs.org/`.

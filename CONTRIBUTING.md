# Contributing

Contributions are welcome.

## Development

```bash
npm ci
npm run check
```

## Pull requests

Keep changes focused and include tests for behavior changes. Update README or
the relevant file in `docs/` when the public API changes.

Before opening a pull request:

```bash
npm run typecheck
npm test
npm run build
```

## Endpoint wrappers

New endpoint helpers must:

- be based on current official platform documentation,
- preserve access to the generic request method,
- avoid logging credentials or personal data,
- use URL encoding for path identifiers,
- define retry behavior explicitly for non-idempotent operations.

## Commit messages

Use clear, imperative messages, for example:

```text
feat: add product listing helper
fix: honor Retry-After date header
docs: document token rotation
test: cover expired access token refresh
```

## Security

Never add real credentials, tokens, shop data, customer data or order payloads
to source code, tests, fixtures, issues or pull requests.

# Production checklist

- [ ] API keys are stored only on the backend.
- [ ] API keys are encrypted at rest.
- [ ] Every connection is scoped to one tenant.
- [ ] Read-only smoke tests pass before enabling writes.
- [ ] Order and inbox processing is idempotent.
- [ ] Hook requests are authenticated.
- [ ] Hook handlers respond quickly.
- [ ] Inbox polling recovers missed hook deliveries.
- [ ] Write retries are enabled only for idempotent operations.
- [ ] `429` and `Retry-After` are respected.
- [ ] Logs contain no API keys or personal data.
- [ ] Account disconnect deletes or revokes stored credentials.
- [ ] CI runs `npm ci` and `npm run check`.

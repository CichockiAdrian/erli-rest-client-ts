# Inbox and hooks

## Recommended architecture

Use both:

1. hooks for low-latency notification,
2. inbox polling as the reliability backstop.

Process every event idempotently. A hook and inbox message can describe the
same business change.

## Inbox loop

A safe worker should:

1. fetch unread messages,
2. validate message shape,
3. enqueue or process each event idempotently,
4. acknowledge messages only after durable processing,
5. persist progress.

The library exposes inbox reading but does not guess an acknowledgement
operation that has not been confirmed for the target account and current API
reference. Use `request<T>()` after verifying the official endpoint and payload.

## Hook security

Use a separate random secret for each hook registration. Validate that secret
before parsing or processing the payload.

Return a successful response quickly, then perform heavy work asynchronously.
Do not depend on a single hook delivery for correctness.

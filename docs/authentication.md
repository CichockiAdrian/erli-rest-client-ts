# Authentication

ERLI Shop API requests use a static Bearer API key.

The client sends:

```http
Authorization: Bearer <api-key>
```

## Storage

- keep the key on the backend,
- encrypt it at rest,
- scope it to one ERLI connection,
- never return it from API responses,
- never place it in logs or analytics,
- rotate it after suspected exposure.

## Multi-tenant applications

Create one encrypted credential record for each connected ERLI seller account.
Instantiate a client with the credential selected for the current tenant.

## Browser applications

Do not call ERLI directly from browser code. Route requests through your own
backend so the key is never exposed to the user or third-party scripts.

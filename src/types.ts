export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type ErliHttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type ErliQueryValue = string | number | boolean | null | undefined;

export interface ErliClientOptions {
  /** API key copied from ERLI seller panel. */
  apiKey: string;
  /** Defaults to https://erli.pl/svc/shop-api. */
  baseUrl?: string;
  /** Recommended by ERLI for easier integration diagnostics. */
  userAgent?: string;
  /** Request timeout. Defaults to 10 seconds. */
  timeoutMs?: number;
  /** Number of retries after the first request. Defaults to 3. */
  maxRetries?: number;
  /** Base delay for exponential backoff. Defaults to 300 ms. */
  retryBaseDelayMs?: number;
  /** Optional fetch implementation, useful in tests or custom runtimes. */
  fetch?: typeof globalThis.fetch;
}

export interface ErliRequestOptions<TBody = unknown> {
  method?: ErliHttpMethod;
  path: string;
  query?: Record<string, ErliQueryValue>;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Override the default retry decision for this request. */
  retry?: boolean;
}

export interface ErliPagination {
  sortField?: string;
  after?: string;
  order?: "ASC" | "DESC";
  limit?: number;
}

export interface ErliListRequest {
  pagination?: ErliPagination;
  [key: string]: unknown;
}

export type ErliOrderStatus = "pending" | "purchased" | "cancelled" | (string & {});

/**
 * ERLI order responses may contain additional fields. Known core fields are
 * typed while unknown fields remain available to integrations.
 */
export interface ErliOrder {
  id: string;
  status: ErliOrderStatus;
  created?: string;
  updated?: string;
  cursor?: string;
  trackingNumber?: string | null;
  [key: string]: unknown;
}

export interface ErliOrderUpdate {
  status?: string;
  trackingNumber?: string | null;
  [key: string]: unknown;
}

export interface ErliInboxMessage {
  id: string | number;
  type?: string;
  created?: string;
  order?: ErliOrder;
  [key: string]: unknown;
}

export interface ErliProductPayload {
  name?: string;
  stock?: number;
  status?: "active" | "inactive" | (string & {});
  price?: number;
  description?: unknown;
  images?: Array<{ url: string; [key: string]: unknown }>;
  packaging?: {
    weight?: number;
    tags?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type ErliHookName =
  | "productsNeedSync"
  | "orderCreated"
  | "orderStatusChanged"
  | (string & {});

export interface ErliHookRegistration {
  hookName: ErliHookName;
  url: string;
  accessToken: string;
}

export interface ErliProductsNeedSyncHookPayload {
  externalProductIds: string[];
  fields?: string[];
}

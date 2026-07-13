import { ErliApiError, ErliConfigurationError, ErliNetworkError } from "./errors.js";
import { HooksResource } from "./resources/hooks.js";
import { InboxResource } from "./resources/inbox.js";
import { OrdersResource } from "./resources/orders.js";
import { ProductsResource } from "./resources/products.js";
import { DeliveryResource } from "./resources/delivery.js";
import type { ErliClientOptions, ErliRequestOptions } from "./types.js";
import {
  DEFAULT_BASE_URL,
  buildUrl,
  exponentialDelay,
  extractErrorMessage,
  isMethodRetryable,
  isRetryableStatus,
  normalizeBaseUrl,
  parseResponseBody,
  parseRetryAfter,
  sleep
} from "./utils.js";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_BASE_DELAY_MS = 300;

export class ErliClient {
  readonly inbox: InboxResource;
  readonly orders: OrdersResource;
  readonly products: ProductsResource;
  readonly hooks: HooksResource;
  readonly delivery: DeliveryResource;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly userAgent: string | undefined;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;
  private readonly fetchImplementation: typeof globalThis.fetch;

  constructor(options: ErliClientOptions) {
    if (!options.apiKey?.trim()) {
      throw new ErliConfigurationError("ERLI apiKey is required.");
    }

    const fetchImplementation = options.fetch ?? globalThis.fetch;
    if (typeof fetchImplementation !== "function") {
      throw new ErliConfigurationError(
        "No fetch implementation is available. Use Node.js 18+ or pass options.fetch."
      );
    }

    this.apiKey = options.apiKey.trim();
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    this.userAgent = options.userAgent;
    this.timeoutMs = validateNonNegativeInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS, "timeoutMs");
    this.maxRetries = validateNonNegativeInteger(
      options.maxRetries,
      DEFAULT_MAX_RETRIES,
      "maxRetries"
    );
    this.retryBaseDelayMs = validateNonNegativeInteger(
      options.retryBaseDelayMs,
      DEFAULT_RETRY_BASE_DELAY_MS,
      "retryBaseDelayMs"
    );
    this.fetchImplementation = fetchImplementation;

    this.inbox = new InboxResource(this);
    this.orders = new OrdersResource(this);
    this.products = new ProductsResource(this);
    this.hooks = new HooksResource(this);
    this.delivery = new DeliveryResource(this);
  }

  async request<TResponse = unknown, TBody = unknown>(
    options: ErliRequestOptions<TBody>
  ): Promise<TResponse> {
    const method = options.method ?? "GET";
    const url = buildUrl(this.baseUrl, options.path, options.query);
    const shouldRetryMethod = options.retry ?? isMethodRetryable(method);
    const maxAttempts = shouldRetryMethod ? this.maxRetries + 1 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const timeoutMs = options.timeoutMs ?? this.timeoutMs;
      const timeoutController = new AbortController();
      const timeout = setTimeout(
        () => timeoutController.abort(new DOMException("ERLI request timed out", "TimeoutError")),
        timeoutMs
      );
      const combinedSignal = combineAbortSignals(options.signal, timeoutController.signal);

      try {
        const headers = this.createHeaders(options.headers, options.body !== undefined);
        const requestInit: RequestInit = {
          method,
          headers,
          signal: combinedSignal
        };

        if (options.body !== undefined) {
          requestInit.body = JSON.stringify(options.body);
        }

        const response = await this.fetchImplementation(url, requestInit);

        const responseBody = await parseResponseBody(response);

        if (response.ok) {
          return responseBody as TResponse;
        }

        const retryable = isRetryableStatus(response.status);
        const requestId =
          response.headers.get("x-request-id") ?? response.headers.get("request-id") ?? undefined;
        const errorOptions = {
          message: extractErrorMessage(
            responseBody,
            `ERLI API request failed with HTTP ${response.status}.`
          ),
          status: response.status,
          method,
          url,
          responseBody,
          retryable,
          ...(requestId !== undefined ? { requestId } : {})
        };
        const error = new ErliApiError(errorOptions);

        if (!retryable || attempt >= maxAttempts) {
          throw error;
        }

        const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
        await sleep(
          retryAfterMs ?? exponentialDelay(this.retryBaseDelayMs, attempt),
          options.signal
        );
      } catch (error) {
        if (error instanceof ErliApiError) {
          throw error;
        }

        if (options.signal?.aborted) {
          throw options.signal.reason ?? error;
        }

        const networkError = new ErliNetworkError(
          error instanceof DOMException && error.name === "TimeoutError"
            ? `ERLI API request timed out after ${timeoutMs} ms.`
            : "ERLI API request failed before receiving a response.",
          method,
          url,
          error
        );

        if (attempt >= maxAttempts) {
          throw networkError;
        }

        await sleep(exponentialDelay(this.retryBaseDelayMs, attempt), options.signal);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new ErliNetworkError("ERLI API request failed.", method, url, undefined);
  }

  private createHeaders(input: HeadersInit | undefined, hasBody: boolean): Headers {
    const headers = new Headers(input);
    headers.set("Authorization", `Bearer ${this.apiKey}`);
    headers.set("Accept", "application/json");

    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (this.userAgent && !headers.has("User-Agent")) {
      headers.set("User-Agent", this.userAgent);
    }

    return headers;
  }
}

function validateNonNegativeInteger(
  value: number | undefined,
  fallback: number,
  name: string
): number {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved < 0) {
    throw new ErliConfigurationError(`${name} must be a non-negative integer.`);
  }
  return resolved;
}

function combineAbortSignals(
  externalSignal: AbortSignal | undefined,
  timeoutSignal: AbortSignal
): AbortSignal {
  if (!externalSignal) {
    return timeoutSignal;
  }

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([externalSignal, timeoutSignal]);
  }

  const controller = new AbortController();
  const abort = (signal: AbortSignal) => controller.abort(signal.reason);

  if (externalSignal.aborted) {
    abort(externalSignal);
  } else if (timeoutSignal.aborted) {
    abort(timeoutSignal);
  } else {
    externalSignal.addEventListener("abort", () => abort(externalSignal), { once: true });
    timeoutSignal.addEventListener("abort", () => abort(timeoutSignal), { once: true });
  }

  return controller.signal;
}

import type { ErliQueryValue } from "./types.js";

export const DEFAULT_BASE_URL = "https://erli.pl/svc/shop-api";

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function normalizePath(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    throw new TypeError("ERLI request path must be relative, not an absolute URL.");
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, ErliQueryValue>
): string {
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${normalizePath(path)}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function isMethodRetryable(method: string): boolean {
  return method === "GET" || method === "PATCH" || method === "PUT" || method === "DELETE";
}

export function parseRetryAfter(value: string | null, nowMs = Date.now()): number | null {
  if (!value) {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const dateMs = Date.parse(value);
  if (Number.isNaN(dateMs)) {
    return null;
  }

  return Math.max(0, dateMs - nowMs);
}

export function exponentialDelay(baseDelayMs: number, retryNumber: number): number {
  const exponential = baseDelayMs * 2 ** Math.max(0, retryNumber - 1);
  const jitter = Math.floor(Math.random() * Math.max(1, baseDelayMs));
  return exponential + jitter;
}

export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  return text;
}

export function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (body && typeof body === "object") {
    for (const key of ["message", "error", "title", "detail"] as const) {
      const value = Reflect.get(body, key);
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return fallback;
}

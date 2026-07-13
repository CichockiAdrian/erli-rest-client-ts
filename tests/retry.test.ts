import { describe, expect, it, vi } from "vitest";
import { ErliClient, ErliNetworkError } from "../src/index.js";

function response(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "retry-after": "0" }
  });
}

describe("retry behavior", () => {
  it("retries 429 and then returns a successful response", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(429, { message: "Rate limited" }))
      .mockResolvedValueOnce(response(200, { ok: true }));

    const client = new ErliClient({
      apiKey: "key",
      fetch: fetchMock,
      maxRetries: 2,
      retryBaseDelayMs: 0
    });

    await expect(client.request<{ ok: boolean }>({ path: "/inbox" })).resolves.toEqual({
      ok: true
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry POST by default", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response(503));
    const client = new ErliClient({ apiKey: "key", fetch: fetchMock, maxRetries: 3 });

    await expect(
      client.request({ method: "POST", path: "/hooks", body: { hookName: "x" } })
    ).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("retries POST when explicitly enabled", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(503))
      .mockResolvedValueOnce(response(200, { ok: true }));
    const client = new ErliClient({
      apiKey: "key",
      fetch: fetchMock,
      maxRetries: 1,
      retryBaseDelayMs: 0
    });

    await expect(
      client.request({ method: "POST", path: "/products/123", body: {}, retry: true })
    ).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries network failures and exposes a network error", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("socket closed"));
    const client = new ErliClient({
      apiKey: "key",
      fetch: fetchMock,
      maxRetries: 1,
      retryBaseDelayMs: 0
    });

    await expect(client.request({ path: "/inbox" })).rejects.toBeInstanceOf(ErliNetworkError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

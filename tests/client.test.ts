import { describe, expect, it, vi } from "vitest";
import { ErliApiError, ErliClient, ErliConfigurationError } from "../src/index.js";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) }
  });
}

describe("ErliClient", () => {
  it("requires an API key", () => {
    expect(() => new ErliClient({ apiKey: "" })).toThrow(ErliConfigurationError);
  });

  it("adds Bearer authorization and recommended JSON headers", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    const client = new ErliClient({
      apiKey: "secret-key",
      userAgent: "TestApp/1.0",
      fetch: fetchMock
    });

    await client.request({ path: "/inbox" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);

    expect(url).toBe("https://erli.pl/svc/shop-api/inbox");
    expect(headers.get("authorization")).toBe("Bearer secret-key");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("user-agent")).toBe("TestApp/1.0");
  });

  it("serializes a request body as JSON", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ accepted: true }));
    const client = new ErliClient({ apiKey: "key", fetch: fetchMock });

    await client.request({
      method: "PATCH",
      path: "/products/123",
      body: { stock: 7 }
    });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.body).toBe('{"stock":7}');
    expect(new Headers(init?.headers).get("content-type")).toBe("application/json");
  });

  it("throws a structured API error", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
        { message: "Invalid API key" },
        { status: 401, headers: { "x-request-id": "req-123" } }
      )
    );
    const client = new ErliClient({ apiKey: "bad", fetch: fetchMock });

    try {
      await client.request({ path: "/inbox" });
      throw new Error("Expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ErliApiError);
      expect(error).toMatchObject({
        name: "ErliApiError",
        status: 401,
        requestId: "req-123",
        retryable: false
      });
      expect((error as Error).message).toBe("Invalid API key");
    }
  });

  it("rejects absolute request URLs", async () => {
    const client = new ErliClient({ apiKey: "key", fetch: vi.fn<typeof fetch>() });

    await expect(
      client.request({ path: "https://attacker.example/collect" })
    ).rejects.toThrow("must be relative");
  });
});

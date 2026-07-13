import { describe, expect, it, vi } from "vitest";
import { ErliClient } from "../src/index.js";

const ok = () =>
  new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });

describe("resource paths", () => {
  it("uses the documented inbox endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(ok());
    const client = new ErliClient({ apiKey: "key", fetch: fetchMock });

    await client.inbox.list();

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://erli.pl/svc/shop-api/inbox");
  });

  it("encodes external product IDs", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(ok());
    const client = new ErliClient({ apiKey: "key", fetch: fetchMock, maxRetries: 0 });

    await client.products.update("sku/black 42", { stock: 3 });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://erli.pl/svc/shop-api/products/sku%2Fblack%2042"
    );
  });

  it("registers hooks through POST /hooks", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(ok());
    const client = new ErliClient({ apiKey: "key", fetch: fetchMock });

    await client.hooks.register({
      hookName: "orderCreated",
      url: "https://example.com/hooks/erli",
      accessToken: "hook-secret"
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://erli.pl/svc/shop-api/hooks");
    expect(init?.method).toBe("POST");
  });

  it("fetches delivery price lists", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(ok());
    const client = new ErliClient({ apiKey: "key", fetch: fetchMock });

    await client.delivery.getPriceLists();

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://erli.pl/svc/shop-api/delivery/priceLists"
    );
  });
});

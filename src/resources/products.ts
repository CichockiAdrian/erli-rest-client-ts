import type { ErliClient } from "../client.js";
import type { ErliProductPayload } from "../types.js";

export class ProductsResource {
  constructor(private readonly client: ErliClient) {}

  create<TResponse = unknown>(
    externalProductId: string,
    product: ErliProductPayload
  ): Promise<TResponse> {
    return this.client.request<TResponse, ErliProductPayload>({
      method: "POST",
      path: `/products/${encodeURIComponent(externalProductId)}`,
      body: product,
      // Product identifiers are deterministic, and ERLI's integration guide
      // recommends retrying server/connection failures for product writes.
      retry: true
    });
  }

  update<TResponse = unknown>(
    externalProductId: string,
    changes: Partial<ErliProductPayload>
  ): Promise<TResponse> {
    return this.client.request<TResponse, Partial<ErliProductPayload>>({
      method: "PATCH",
      path: `/products/${encodeURIComponent(externalProductId)}`,
      body: changes
    });
  }

  get<TResponse = unknown>(externalProductId: string): Promise<TResponse> {
    return this.client.request<TResponse>({
      method: "GET",
      path: `/products/${encodeURIComponent(externalProductId)}`
    });
  }
}

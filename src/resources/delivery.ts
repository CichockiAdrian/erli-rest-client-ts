import type { ErliClient } from "../client.js";

export class DeliveryResource {
  constructor(private readonly client: ErliClient) {}

  getPriceLists<TResponse = unknown>(): Promise<TResponse> {
    return this.client.request<TResponse>({
      method: "GET",
      path: "/delivery/priceLists"
    });
  }
}

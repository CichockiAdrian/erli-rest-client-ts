import type { ErliClient } from "../client.js";
import type { ErliOrder, ErliOrderUpdate } from "../types.js";

export class OrdersResource {
  constructor(private readonly client: ErliClient) {}

  list<TResponse = ErliOrder[]>(): Promise<TResponse> {
    return this.client.request<TResponse>({
      method: "GET",
      path: "/orders"
    });
  }

  get<TResponse = ErliOrder>(orderId: string): Promise<TResponse> {
    return this.client.request<TResponse>({
      method: "GET",
      path: `/orders/${encodeURIComponent(orderId)}`
    });
  }

  update<TResponse = ErliOrder>(
    orderId: string,
    update: ErliOrderUpdate
  ): Promise<TResponse> {
    return this.client.request<TResponse, ErliOrderUpdate>({
      method: "PATCH",
      path: `/orders/${encodeURIComponent(orderId)}`,
      body: update
    });
  }
}

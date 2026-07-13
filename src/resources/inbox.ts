import type { ErliClient } from "../client.js";
import type { ErliInboxMessage } from "../types.js";

/**
 * ERLI inbox can be used as the primary source of order and product-sync events.
 * The official overview documents GET /inbox and a maximum of 500 unread messages.
 */
export class InboxResource {
  constructor(private readonly client: ErliClient) {}

  list<TResponse = ErliInboxMessage[]>(): Promise<TResponse> {
    return this.client.request<TResponse>({
      method: "GET",
      path: "/inbox"
    });
  }
}

import type { ErliClient } from "../client.js";
import type { ErliHookRegistration } from "../types.js";

export class HooksResource {
  constructor(private readonly client: ErliClient) {}

  register<TResponse = unknown>(hook: ErliHookRegistration): Promise<TResponse> {
    return this.client.request<TResponse, ErliHookRegistration>({
      method: "POST",
      path: "/hooks",
      body: hook
    });
  }

  runProductsNeedSyncTest<TResponse = unknown>(): Promise<TResponse> {
    return this.client.request<TResponse>({
      method: "POST",
      path: "/hooks/productsNeedSync/run"
    });
  }
}

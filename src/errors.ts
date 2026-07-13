export interface ErliApiErrorOptions {
  message: string;
  status: number;
  method: string;
  url: string;
  responseBody?: unknown;
  retryable: boolean;
  requestId?: string;
}

export class ErliApiError extends Error {
  readonly status: number;
  readonly method: string;
  readonly url: string;
  readonly responseBody: unknown;
  readonly retryable: boolean;
  readonly requestId?: string;

  constructor(options: ErliApiErrorOptions) {
    super(options.message);
    this.name = "ErliApiError";
    this.status = options.status;
    this.method = options.method;
    this.url = options.url;
    this.responseBody = options.responseBody;
    this.retryable = options.retryable;
    if (options.requestId !== undefined) {
      this.requestId = options.requestId;
    }
  }
}

export class ErliConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErliConfigurationError";
  }
}

export class ErliNetworkError extends Error {
  readonly method: string;
  readonly url: string;
  readonly retryable: boolean;
  override readonly cause: unknown;

  constructor(message: string, method: string, url: string, cause: unknown, retryable = true) {
    super(message);
    this.name = "ErliNetworkError";
    this.method = method;
    this.url = url;
    this.retryable = retryable;
    this.cause = cause;
  }
}

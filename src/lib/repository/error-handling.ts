export enum RepositoryErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN = "UNKNOWN",
}

export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;
  public readonly isRetryable: boolean;
  public readonly originalError: unknown;

  constructor(
    operation: string,
    error: unknown,
    code: RepositoryErrorCode = RepositoryErrorCode.UNKNOWN,
  ) {
    const message = error instanceof Error ? error.message : "Unknown error";
    super(`[${operation}] ${message}`);
    this.name = "RepositoryError";
    this.originalError = error;
    this.code = code;
    this.isRetryable =
      code === RepositoryErrorCode.NETWORK_ERROR ||
      code === RepositoryErrorCode.RATE_LIMIT ||
      code === RepositoryErrorCode.SERVER_ERROR;
  }
}

export function classifyError(error: unknown): RepositoryErrorCode {
  if (!error || typeof error !== "object") {
    return RepositoryErrorCode.UNKNOWN;
  }
  const err = error as { code?: string; message?: string; status?: number };
  if (err.code) {
    if (err.code === "PGRST116") {
      return RepositoryErrorCode.NOT_FOUND;
    }
    if (err.code === "23505") {
      return RepositoryErrorCode.CONFLICT;
    }
    if (err.code === "PGRST301") {
      return RepositoryErrorCode.AUTH_ERROR;
    }
    if (err.code.startsWith("22")) {
      return RepositoryErrorCode.VALIDATION_ERROR;
    }
    if (err.code.startsWith("28")) {
      return RepositoryErrorCode.AUTH_ERROR;
    }
    if (err.code.startsWith("42")) {
      return RepositoryErrorCode.VALIDATION_ERROR;
    }
  }
  if (err.status) {
    if (err.status === 401 || err.status === 403) {
      return RepositoryErrorCode.AUTH_ERROR;
    }
    if (err.status === 404) {
      return RepositoryErrorCode.NOT_FOUND;
    }
    if (err.status === 409) {
      return RepositoryErrorCode.CONFLICT;
    }
    if (err.status === 422) {
      return RepositoryErrorCode.VALIDATION_ERROR;
    }
    if (err.status === 429) {
      return RepositoryErrorCode.RATE_LIMIT;
    }
    if (err.status >= 500) {
      return RepositoryErrorCode.SERVER_ERROR;
    }
  }
  if (
    err.message?.includes("fetch") ||
    err.message?.includes("network") ||
    err.message?.includes("ECONNREFUSED") ||
    err.message?.includes("ETIMEDOUT")
  ) {
    return RepositoryErrorCode.NETWORK_ERROR;
  }
  return RepositoryErrorCode.UNKNOWN;
}

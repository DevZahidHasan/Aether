/**
 * Standard normalized error structure for AETHER.
 * Follows core architecture guidelines.
 */
export type AppError = {
  message: string;
  code: string;
  status: number;
};

/**
 * Helper to normalize unknown errors into a standard AppError.
 */
export function normalizeError(err: unknown, fallbackMessage = "An unexpected error occurred"): AppError {
  if (typeof err === "object" && err !== null && "message" in err && "code" in err && "status" in err) {
    const candidate = err as Record<string, unknown>;
    if (
      typeof candidate["message"] === "string" &&
      typeof candidate["code"] === "string" &&
      typeof candidate["status"] === "number"
    ) {
      return {
        message: candidate["message"],
        code: candidate["code"],
        status: candidate["status"],
      };
    }
  }

  if (err instanceof Error) {
    return {
      message: err.message,
      code: "ERR_INTERNAL",
      status: 500,
    };
  }

  return {
    message: fallbackMessage,
    code: "ERR_UNKNOWN",
    status: 500,
  };
}

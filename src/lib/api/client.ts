/**
 * Typed fetch wrapper for the AgriShift AI backend.
 * Base URL: NEXT_PUBLIC_API_BASE_URL env var (default: http://localhost:8000)
 *
 * Features:
 * - 10 second timeout via AbortController
 * - Up to 2 retries on network failure only (not on 4xx or 5xx)
 * - ApiError class with status, code, and detail fields
 * - JSON Content-Type and Accept headers on every request
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

/** Structured error thrown by apiFetch on non-ok HTTP responses. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly detail: string;

  constructor(status: number, code: string, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof ApiError) return false;
  if (err instanceof Error) {
    return (
      err.name === "TypeError" ||
      err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError") ||
      err.message.includes("ECONNREFUSED")
    );
  }
  return false;
}

async function extractDetail(response: Response): Promise<string> {
  try {
    const json = await response.json();
    if (typeof json === "object" && json !== null) {
      const detail = (json as Record<string, unknown>)["detail"];
      if (typeof detail === "string") return detail;
      if (typeof detail === "object") return JSON.stringify(detail);
    }
  } catch {
    // fall through to status text
  }
  return response.statusText || `HTTP ${response.status}`;
}

export interface ApiFetchOptions extends Omit<RequestInit, "signal"> {
  timeout?: number;
  retries?: number;
}

/**
 * Typed fetch wrapper. All API calls must go through this function.
 * Components must never call fetch directly.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT_MS, retries = MAX_RETRIES, ...fetchOptions } = options;

  const url = `${BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(fetchOptions.headers ?? {}),
  };

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timerId);

      if (response.ok) {
        return (await response.json()) as T;
      }

      // Non-ok response: throw ApiError, do not retry
      const detail = await extractDetail(response);
      throw new ApiError(
        response.status,
        `HTTP_${response.status}`,
        detail
      );
    } catch (err: unknown) {
      clearTimeout(timerId);

      // Abort timeout: treat as network error for retry purposes
      if (err instanceof Error && err.name === "AbortError") {
        const timeoutErr = new Error(
          `Request to ${path} timed out after ${timeout}ms.`
        );
        if (attempt < retries) {
          attempt++;
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        throw timeoutErr;
      }

      // ApiError: do not retry
      if (err instanceof ApiError) {
        throw err;
      }

      // Network failure: retry up to MAX_RETRIES
      if (isNetworkError(err) && attempt < retries) {
        attempt++;
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      throw err;
    }
  }
}

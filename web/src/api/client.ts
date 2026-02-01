import { resolveApiUrl } from "../lib/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export async function apiRequest<TResponse>(
  path: string,
  { method = "GET", body, headers = {}, token }: ApiRequestOptions = {}
): Promise<TResponse> {
  const response = await fetch(resolveApiUrl(path), {
    method,
    headers: {
      "Content-Type": body ? "application/json" : headers?.["Content-Type"] ?? "application/json",
      ...headers,
      ...(token ? { "X-Session-Token": token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const parsed = JSON.parse(errorText) as { detail?: string };
      if (parsed?.detail) {
        message = parsed.detail;
      }
    } catch {
      // Fall back to raw text.
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

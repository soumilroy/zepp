import { resolveApiUrl } from "../lib/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function parseApiError(response: Response): Promise<Error> {
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
  return new Error(message || `Request failed with status ${response.status}`);
}

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
    throw await parseApiError(response);
  }

  return (await response.json()) as TResponse;
}

type ApiUploadOptions = {
  formData: FormData;
  headers?: Record<string, string>;
  token?: string;
};

export async function apiUpload<TResponse>(
  path: string,
  { formData, headers = {}, token }: ApiUploadOptions
): Promise<TResponse> {
  const response = await fetch(resolveApiUrl(path), {
    method: "POST",
    headers: {
      ...headers,
      ...(token ? { "X-Session-Token": token } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as TResponse;
}

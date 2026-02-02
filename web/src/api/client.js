import { resolveApiUrl } from "../lib/env";
export async function apiRequest(path, { method = "GET", body, headers = {}, token } = {}) {
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
            const parsed = JSON.parse(errorText);
            if (parsed?.detail) {
                message = parsed.detail;
            }
        }
        catch {
            // Fall back to raw text.
        }
        throw new Error(message || `Request failed with status ${response.status}`);
    }
    return (await response.json());
}

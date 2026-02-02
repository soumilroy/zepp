type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
interface ApiRequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    token?: string;
}
export declare function apiRequest<TResponse>(path: string, { method, body, headers, token }?: ApiRequestOptions): Promise<TResponse>;
export {};

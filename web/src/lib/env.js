const DEFAULT_API_BASE = "http://localhost:8000";
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE;
export function resolveApiUrl(path) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const normalized = path.startsWith("/") ? path.slice(1) : path;
    return `${API_BASE_URL.replace(/\/$/, "")}/${normalized}`;
}

import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
}
export function createQueryWrapper(client) {
    return function QueryWrapper({ children }) {
        return _jsx(QueryClientProvider, { client: client, children: children });
    };
}

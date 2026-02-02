import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "./client";
export function useProtectedStatusQuery(token) {
    return useQuery({
        queryKey: ["protected-status", token],
        queryFn: () => apiRequest("/session-status-check", { token }),
        enabled: Boolean(token),
        retry: false,
    });
}
export function useCreateSessionMutation() {
    return useMutation({
        mutationFn: ({ email, openai_key }) => apiRequest("/sessions", {
            method: "POST",
            body: { email, openai_key },
        }),
    });
}
export function useUserQuery(token) {
    return useQuery({
        queryKey: ["user", token],
        queryFn: () => apiRequest("/user", { token }),
        enabled: Boolean(token),
        retry: false,
    });
}
export function useLogoutMutation() {
    return useMutation({
        mutationFn: (token) => apiRequest("/logout", {
            method: "DELETE",
            token,
        }),
    });
}

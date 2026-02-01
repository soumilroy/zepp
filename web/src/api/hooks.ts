import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "./client";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  HealthResponse,
  LogoutResponse,
} from "./types";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiRequest<HealthResponse>("/"),
  });
}

export function useProtectedStatusQuery(token?: string) {
  return useQuery({
    queryKey: ["protected-status", token],
    queryFn: () =>
      apiRequest<HealthResponse>("/session-status-check", { token }),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useCreateSessionMutation() {
  return useMutation<CreateSessionResponse, Error, CreateSessionRequest>({
    mutationFn: ({ email, openai_key }) =>
      apiRequest<CreateSessionResponse>("/sessions", {
        method: "POST",
        body: { email, openai_key } satisfies CreateSessionRequest,
      }),
  });
}

export function useLogoutMutation() {
  return useMutation<LogoutResponse, Error, string>({
    mutationFn: (token) =>
      apiRequest<LogoutResponse>("/logout", {
        method: "DELETE",
        token,
      }),
  });
}

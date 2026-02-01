import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "./client";
import type { CreateSessionRequest, CreateSessionResponse, HealthResponse } from "./types";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiRequest<HealthResponse>("/"),
  });
}

export function useProtectedStatusQuery(token?: string) {
  return useQuery({
    queryKey: ["protected-status", token],
    queryFn: () => apiRequest<HealthResponse>("/protected", { token }),
    enabled: Boolean(token),
    retry: false,
  });
}

interface CreateSessionVariables extends CreateSessionRequest {
  token: string;
}

export function useCreateSessionMutation() {
  return useMutation<CreateSessionResponse, Error, CreateSessionVariables>({
    mutationFn: ({ email, token }) =>
      apiRequest<CreateSessionResponse>("/sessions", {
        method: "POST",
        body: { email } satisfies CreateSessionRequest,
        token,
      }),
  });
}

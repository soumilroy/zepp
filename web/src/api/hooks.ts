import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest, apiUpload } from "./client";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  HealthResponse,
  LogoutResponse,
  ResumeImportResponse,
  UserResponse,
} from "./types";

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

export function useUserQuery(token?: string) {
  return useQuery({
    queryKey: ["user", token],
    queryFn: () => apiRequest<UserResponse>("/user", { token }),
    enabled: Boolean(token),
    retry: false,
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

export function useImportResumePdfMutation() {
  return useMutation<ResumeImportResponse, Error, { token: string; file: File }>({
    mutationFn: async ({ token, file }) => {
      const formData = new FormData();
      formData.append("file", file, file.name);
      return apiUpload<ResumeImportResponse>("/resume/import/pdf", { formData, token });
    },
  });
}

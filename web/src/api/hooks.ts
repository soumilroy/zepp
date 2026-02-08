import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest, apiUpload } from "./client";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  HealthResponse,
  LogoutResponse,
  ResumeDeleteResponse,
  ResumeImportResponse,
  ResumeListResponse,
  ResumeSchemaResponse,
  UserResponse,
} from "./types";

export function useResumeSchemaQuery() {
  return useQuery({
    queryKey: ["resume-schema"],
    queryFn: () => apiRequest<ResumeSchemaResponse>("/resume/schema"),
    staleTime: Infinity,
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

export function useResumesQuery(token?: string) {
  return useQuery({
    queryKey: ["resumes", token],
    queryFn: () => apiRequest<ResumeListResponse>("/resumes", { token }),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useResumeQuery(token: string | undefined, resumeId: string | null) {
  return useQuery({
    queryKey: ["resume", token, resumeId],
    queryFn: () => apiRequest<ResumeImportResponse>(`/resumes/${resumeId}`, { token }),
    enabled: Boolean(token && resumeId),
    retry: false,
  });
}

export function useSaveResumeMutation() {
  return useMutation<
    ResumeImportResponse,
    Error,
    { token: string; resumeId: string; body: { sections: ResumeImportResponse["sections"] } }
  >({
    mutationFn: ({ token, resumeId, body }) =>
      apiRequest<ResumeImportResponse>(`/resumes/${resumeId}`, {
        method: "PUT",
        token,
        body,
      }),
  });
}

export function useDeleteResumeMutation() {
  return useMutation<ResumeDeleteResponse, Error, { token: string; resumeId: string }>({
    mutationFn: ({ token, resumeId }) =>
      apiRequest<ResumeDeleteResponse>(`/resumes/${resumeId}`, {
        method: "DELETE",
        token,
      }),
  });
}

import type { CreateSessionRequest, CreateSessionResponse, HealthResponse, LogoutResponse, UserResponse } from "./types";
export declare function useProtectedStatusQuery(token?: string): import("@tanstack/react-query").UseQueryResult<HealthResponse, Error>;
export declare function useCreateSessionMutation(): import("@tanstack/react-query").UseMutationResult<CreateSessionResponse, Error, CreateSessionRequest, unknown>;
export declare function useUserQuery(token?: string): import("@tanstack/react-query").UseQueryResult<UserResponse, Error>;
export declare function useLogoutMutation(): import("@tanstack/react-query").UseMutationResult<LogoutResponse, Error, string, unknown>;

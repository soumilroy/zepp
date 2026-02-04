import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { apiRequest } from "../api/client";
import { useCreateSessionMutation, useLogoutMutation, useProtectedStatusQuery, useUserQuery, } from "../api/hooks";
import { createQueryClient, createQueryWrapper } from "./test-utils";
vi.mock("../api/client", () => ({
    apiRequest: vi.fn(),
}));
const apiRequestMock = vi.mocked(apiRequest);
describe("api hooks", () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });
    it("skips protected status query without token", async () => {
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        renderHook(() => useProtectedStatusQuery(), { wrapper });
        await waitFor(() => expect(apiRequestMock).not.toHaveBeenCalled());
    });
    it("fetches protected status when token exists", async () => {
        const response = { status: "success", message: "ok" };
        apiRequestMock.mockResolvedValueOnce(response);
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        const { result } = renderHook(() => useProtectedStatusQuery("token-123"), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(apiRequestMock).toHaveBeenCalledWith("/session-status-check", { token: "token-123" });
        expect(result.current.data).toEqual(response);
    });
    it("creates a session", async () => {
        const response = {
            email: "test@example.com",
            session_token: "token-123",
            openai_key: "sk-test",
        };
        apiRequestMock.mockResolvedValueOnce(response);
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        const { result } = renderHook(() => useCreateSessionMutation(), { wrapper });
        result.current.mutate({ email: "test@example.com", openai_key: "sk-test" });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(apiRequestMock).toHaveBeenCalledWith("/sessions", {
            method: "POST",
            body: { email: "test@example.com", openai_key: "sk-test" },
        });
        expect(result.current.data).toEqual(response);
    });
    it("fetches current user when token exists", async () => {
        const response = { email: "user@example.com" };
        apiRequestMock.mockResolvedValueOnce(response);
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        const { result } = renderHook(() => useUserQuery("token-abc"), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(apiRequestMock).toHaveBeenCalledWith("/user", { token: "token-abc" });
        expect(result.current.data).toEqual(response);
    });
    it("logs out with token", async () => {
        const response = { status: "success", message: "ok" };
        apiRequestMock.mockResolvedValueOnce(response);
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        const { result } = renderHook(() => useLogoutMutation(), { wrapper });
        result.current.mutate("token-logout");
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(apiRequestMock).toHaveBeenCalledWith("/logout", {
            method: "DELETE",
            token: "token-logout",
        });
        expect(result.current.data).toEqual(response);
    });
});

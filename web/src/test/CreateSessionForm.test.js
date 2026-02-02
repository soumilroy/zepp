import { jsx as _jsx } from "react/jsx-runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { apiRequest } from "../api/client";
import CreateSessionForm from "../components/CreateSessionForm";
import { createQueryClient, createQueryWrapper } from "./test-utils";
vi.mock("../api/client", () => ({
    apiRequest: vi.fn(),
}));
const apiRequestMock = vi.mocked(apiRequest);
describe("CreateSessionForm", () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });
    it("shows validation errors for empty fields", async () => {
        const user = userEvent.setup();
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        render(_jsx(CreateSessionForm, {}), { wrapper });
        await user.click(screen.getByRole("button", { name: /create session/i }));
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("OpenAI key is required")).toBeInTheDocument();
    });
    it("shows validation error for invalid OpenAI key", async () => {
        const user = userEvent.setup();
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        render(_jsx(CreateSessionForm, {}), { wrapper });
        await user.type(screen.getByLabelText("Email"), "user@example.com");
        await user.type(screen.getByLabelText("OpenAI key"), "invalid-key");
        await user.click(screen.getByRole("button", { name: /create session/i }));
        expect(screen.getByText("OpenAI key must start with 'sk-'")).toBeInTheDocument();
    });
    it("submits and shows session details", async () => {
        const user = userEvent.setup();
        const response = {
            email: "user@example.com",
            session_token: "token-123",
            openai_key: "sk-test",
        };
        apiRequestMock.mockResolvedValueOnce(response);
        const client = createQueryClient();
        const wrapper = createQueryWrapper(client);
        render(_jsx(CreateSessionForm, {}), { wrapper });
        await user.type(screen.getByLabelText("Email"), "user@example.com");
        await user.type(screen.getByLabelText("OpenAI key"), "sk-test");
        await user.click(screen.getByRole("button", { name: /create session/i }));
        await waitFor(() => expect(screen.getByText("Session created and key validated.")).toBeInTheDocument());
        expect(screen.getByText(/token-123/i)).toBeInTheDocument();
        expect(apiRequestMock).toHaveBeenCalledWith("/sessions", {
            method: "POST",
            body: { email: "user@example.com", openai_key: "sk-test" },
        });
    });
});

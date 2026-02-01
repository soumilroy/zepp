import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CreateSessionResponse } from "../api/types";
import { apiRequest } from "../api/client";
import SessionGateModal from "../components/SessionGateModal";
import { createQueryClient, createQueryWrapper } from "./test-utils";

vi.mock("../api/client", () => ({
  apiRequest: vi.fn(),
}));

const apiRequestMock = vi.mocked(apiRequest);

describe("SessionGateModal", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    sessionStorage.clear();
  });

  it("opens when there is no session token", () => {
    const client = createQueryClient();
    const wrapper = createQueryWrapper(client);

    render(<SessionGateModal />, { wrapper });

    expect(screen.getByText("Enter your email and OpenAI key to start a session")).toBeInTheDocument();
  });

  it("stores token and closes after session creation", async () => {
    const user = userEvent.setup();
    const response: CreateSessionResponse = {
      email: "user@example.com",
      session_token: "token-123",
      openai_key: "sk-test",
    };
    apiRequestMock.mockResolvedValueOnce(response);
    const onSessionCreated = vi.fn();

    const client = createQueryClient();
    const wrapper = createQueryWrapper(client);

    render(<SessionGateModal onSessionCreated={onSessionCreated} />, { wrapper });

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("OpenAI key"), "sk-test");
    await user.click(screen.getByRole("button", { name: /create session/i }));

    await waitFor(() => expect(onSessionCreated).toHaveBeenCalledWith("token-123"));
    expect(sessionStorage.getItem("session_token")).toBe("token-123");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows validation error for invalid OpenAI key", async () => {
    const user = userEvent.setup();
    const client = createQueryClient();
    const wrapper = createQueryWrapper(client);

    render(<SessionGateModal />, { wrapper });

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("OpenAI key"), "invalid-key");
    await user.click(screen.getByRole("button", { name: /create session/i }));

    expect(
      screen.getByText("OpenAI key must start with 'sk-'")
    ).toBeInTheDocument();
  });
});

import { jsx as _jsx } from "react/jsx-runtime";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutConfirmDialog from "../components/LogoutConfirmDialog";
describe("LogoutConfirmDialog", () => {
    it("disables confirm button when disabled", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        const onOpenChange = vi.fn();
        render(_jsx(LogoutConfirmDialog, { isOpen: true, isPending: false, isDisabled: true, onOpenChange: onOpenChange, onCancel: onCancel, onConfirm: onConfirm }));
        const confirmButton = screen.getByRole("button", { name: /confirm logout/i });
        expect(confirmButton).toBeDisabled();
        await user.click(screen.getByRole("button", { name: /cancel/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
    it("shows loading state while pending", () => {
        render(_jsx(LogoutConfirmDialog, { isOpen: true, isPending: true, isDisabled: false, onOpenChange: () => { }, onCancel: () => { }, onConfirm: () => { } }));
        expect(screen.getByRole("button", { name: /logging out/i })).toBeDisabled();
    });
});

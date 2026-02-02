import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LogOut, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "./ui/dialog";
export default function LogoutConfirmDialog({ isOpen, isPending, isDisabled, onOpenChange, onCancel, onConfirm, }) {
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (nextOpen) => {
            if (isPending && !nextOpen) {
                return;
            }
            onOpenChange(nextOpen);
        }, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "mb-2 flex items-center gap-2", children: [_jsx(ShieldAlert, { className: "h-4 w-4 text-slate-300" }), "Log out?"] }), _jsx(DialogDescription, { className: "border-t border-slate-800 pt-4 leading-relaxed", children: "This will delete any saved sessions and data." })] }), _jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [_jsx(Button, { variant: "ghost", onClick: onCancel, disabled: isPending, children: "Cancel" }), _jsxs(Button, { variant: "secondary", className: "gap-2", onClick: onConfirm, disabled: isDisabled || isPending, children: [_jsx(LogOut, { className: "h-4 w-4" }), isPending ? "Logging out..." : "Confirm logout"] })] })] }) }));
}

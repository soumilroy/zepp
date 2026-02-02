import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateSessionMutation } from "../api/hooks";
import BrandMark from "./BrandMark";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, } from "./ui/dialog";
const SESSION_TOKEN_KEY = "session_token";
function getHasToken() {
    if (typeof window === "undefined") {
        return false;
    }
    return Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
}
export default function SessionGateModal({ forceOpenKey, onSessionCreated, }) {
    const [hasToken, setHasToken] = useState(getHasToken);
    const [isOpen, setIsOpen] = useState(!hasToken);
    const createSession = useCreateSessionMutation();
    const { register, handleSubmit, formState: { errors }, } = useForm({
        defaultValues: { email: "", openai_key: "" },
    });
    useEffect(() => {
        if (forceOpenKey === undefined) {
            return;
        }
        const hasTokenNow = getHasToken();
        setHasToken(hasTokenNow);
        setIsOpen(!hasTokenNow);
    }, [forceOpenKey]);
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (nextOpen) => {
            if (!hasToken && !nextOpen) {
                return;
            }
            setIsOpen(nextOpen);
        }, children: _jsxs(DialogContent, { className: "[&>button]:hidden", children: [_jsx(DialogHeader, { children: _jsx(BrandMark, {}) }), _jsx("p", { className: "text-sm text-slate-400 my-2", children: "Enter your email and OpenAI key to start a session" }), _jsxs("form", { className: "flex flex-col gap-4", onSubmit: handleSubmit((values) => {
                        createSession.mutate(values, {
                            onSuccess: (data) => {
                                sessionStorage.setItem(SESSION_TOKEN_KEY, data.session_token);
                                setHasToken(true);
                                setIsOpen(false);
                                onSessionCreated?.(data.session_token);
                            },
                        });
                    }), children: [_jsxs("label", { className: "text-sm text-slate-300", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-4 w-4 text-slate-400" }), "Email"] }), _jsx("input", { className: "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-500 focus:outline-none", type: "email", placeholder: "user@example.com", ...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^\S+@\S+\.\S+$/,
                                            message: "Enter a valid email address",
                                        },
                                    }) })] }), errors.email && _jsx("p", { className: "text-sm text-red-400", children: errors.email.message }), _jsxs("label", { className: "text-sm text-slate-300", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(KeyRound, { className: "h-4 w-4 text-slate-400" }), "OpenAI key"] }), _jsx("input", { className: "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-500 focus:outline-none", type: "password", placeholder: "sk-...", ...register("openai_key", {
                                        required: "OpenAI key is required",
                                        pattern: {
                                            value: /^sk-[A-Za-z0-9-_]+$/,
                                            message: "OpenAI key must start with 'sk-'",
                                        },
                                    }) })] }), errors.openai_key && (_jsx("p", { className: "text-sm text-red-400", children: errors.openai_key.message })), _jsxs(Button, { type: "submit", className: "gap-2", disabled: createSession.isPending, children: [_jsx(ArrowRight, { className: "h-4 w-4" }), createSession.isPending ? "Creating session..." : "Create session"] }), createSession.isError && (_jsx("p", { className: "text-sm text-red-400", children: createSession.error.message }))] })] }) }));
}

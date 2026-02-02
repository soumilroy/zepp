import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, KeyRound, Mail, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateSessionMutation } from "../api/hooks";
export default function CreateSessionForm() {
    const createSession = useCreateSessionMutation();
    const { register, handleSubmit, formState: { errors }, reset, } = useForm({
        defaultValues: { email: "", openai_key: "" },
    });
    return (_jsxs("article", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsxs("header", { className: "mb-4", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.3em] text-slate-400", children: "Sessions" }), _jsx("h2", { className: "text-2xl font-semibold text-white", children: "Create a session via API" })] }), _jsxs("form", { className: "flex flex-col gap-4", onSubmit: handleSubmit((values) => {
                    createSession.mutate(values, { onSuccess: () => reset() });
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
                                }) })] }), errors.openai_key && (_jsx("p", { className: "text-sm text-red-400", children: errors.openai_key.message })), _jsxs("button", { type: "submit", className: "inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50", disabled: createSession.isPending, children: [_jsx(Sparkles, { className: "h-4 w-4" }), createSession.isPending ? "Creating..." : "Create session"] }), createSession.isError && (_jsx("p", { className: "text-sm text-red-400", children: createSession.error.message })), createSession.data && !createSession.isError && (_jsxs("div", { className: "rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm", children: [_jsxs("p", { className: "flex items-center gap-2 text-emerald-400", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), "Session created and key validated."] }), _jsxs("p", { className: "mt-2 text-slate-300", children: [_jsx("span", { className: "font-semibold", children: "Token:" }), " ", createSession.data.session_token] }), _jsxs("p", { className: "text-slate-300", children: [_jsx("span", { className: "font-semibold", children: "OpenAI key:" }), " ", createSession.data.openai_key] })] }))] })] }));
}

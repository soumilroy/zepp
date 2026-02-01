import { CheckCircle2, KeyRound, Mail, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";

import { useCreateSessionMutation } from "../api/hooks";

type CreateSessionFormValues = {
  email: string;
  openai_key: string;
};

export default function CreateSessionForm() {
  const createSession = useCreateSessionMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSessionFormValues>({
    defaultValues: { email: "", openai_key: "" },
  });

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sessions</p>
        <h2 className="text-2xl font-semibold text-white">Create a session via API</h2>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => {
          createSession.mutate(values, { onSuccess: () => reset() });
        })}
      >
        <label className="text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            Email
          </span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            type="email"
            placeholder="user@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email address",
              },
            })}
          />
        </label>
        {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}

        <label className="text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-slate-400" />
            OpenAI key
          </span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            type="password"
            placeholder="sk-..."
            {...register("openai_key", {
              required: "OpenAI key is required",
            })}
          />
        </label>
        {errors.openai_key && (
          <p className="text-sm text-red-400">{errors.openai_key.message}</p>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={createSession.isPending}
        >
          <Sparkles className="h-4 w-4" />
          {createSession.isPending ? "Creating..." : "Create session"}
        </button>

        {createSession.isError && (
          <p className="text-sm text-red-400">{createSession.error.message}</p>
        )}
        {createSession.data && !createSession.isError && (
          <div className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm">
            <p className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Session created!
            </p>
            <p className="mt-2 text-slate-300">
              <span className="font-semibold">Token:</span> {createSession.data.session_token}
            </p>
            <p className="text-slate-300">
              <span className="font-semibold">OpenAI key:</span> {createSession.data.openai_key}
            </p>
          </div>
        )}
      </form>
    </article>
  );
}

import { useState } from "react";

import { useCreateSessionMutation, useHealthQuery, useProtectedStatusQuery } from "./api/hooks";

export default function App() {
  const healthQuery = useHealthQuery();
  const [sessionToken, setSessionToken] = useState("");
  const [email, setEmail] = useState("");

  const protectedQuery = useProtectedStatusQuery(sessionToken || undefined);
  const createSession = useCreateSessionMutation();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
        <header>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Zepp.ai</p>
          <h1 className="text-4xl font-semibold text-white">Frontend Starter</h1>
          <p className="mt-2 text-slate-400">
            React + TypeScript + Tailwind + TanStack Query, wired up for rapid API experiments.
          </p>
        </header>

        <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-400">API Status</p>
              <h2 className="text-2xl font-semibold text-white">
                {healthQuery.isLoading && "Checking..."}
                {healthQuery.isError && "Offline"}
                {healthQuery.data && healthQuery.data.status === "success" && "Online"}
              </h2>
            </div>
            <button
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
              onClick={() => healthQuery.refetch()}
              disabled={healthQuery.isLoading}
            >
              Refresh
            </button>
          </div>
          <p className="mt-4 text-lg text-slate-300">
            {healthQuery.isError && "We couldn't reach the backend. Check your API URL or start the server."}
            {healthQuery.data && !healthQuery.isError && healthQuery.data.message}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <header className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Protected route</p>
            <h2 className="text-2xl font-semibold text-white">Check session access</h2>
          </header>

          <div className="flex flex-col gap-4">
            <label className="text-sm text-slate-300">
              Session token
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                value={sessionToken}
                onChange={(event) => setSessionToken(event.target.value)}
                placeholder="Paste X-Session-Token"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => protectedQuery.refetch()}
                disabled={!sessionToken || protectedQuery.isFetching}
              >
                Check access
              </button>
              {protectedQuery.isLoading && <p className="text-sm text-slate-400">Verifying...</p>}
            </div>

            {protectedQuery.isError && (
              <p className="text-sm text-red-400">{protectedQuery.error instanceof Error ? protectedQuery.error.message : "Unable to reach protected route."}</p>
            )}
            {protectedQuery.data && !protectedQuery.isError && (
              <p className="text-sm text-emerald-400">{protectedQuery.data.message}</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <header className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sessions</p>
            <h2 className="text-2xl font-semibold text-white">Create a session via API</h2>
          </header>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!sessionToken || !email) {
                return;
              }
              createSession.mutate({ email, token: sessionToken });
            }}
          >
            <label className="text-sm text-slate-300">
              Email
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
                required
              />
            </label>

            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!sessionToken || !email || createSession.isPending}
            >
              {createSession.isPending ? "Creating..." : "Create session"}
            </button>

            {createSession.isError && (
              <p className="text-sm text-red-400">{createSession.error.message}</p>
            )}
            {createSession.data && !createSession.isError && (
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm">
                <p className="text-emerald-400">Session created!</p>
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
      </section>
    </main>
  );
}

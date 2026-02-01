import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/`);
  if (!response.ok) {
    throw new Error("Unable to reach API");
  }
  return response.json() as Promise<{ status: string; message: string }>;
}

export default function App() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

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
                {isLoading && "Checking..."}
                {isError && "Offline"}
                {data && data.status === "success" && "Online"}
              </h2>
            </div>
            <button
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
          <p className="mt-4 text-lg text-slate-300">
            {isError && "We couldn't reach the backend. Check your API URL or start the server."}
            {data && !isError && data.message}
          </p>
        </article>
      </section>
    </main>
  );
}

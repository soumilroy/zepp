import { useHealthQuery } from "../api/hooks";
import CreateSessionForm from "../components/CreateSessionForm";

export default function AdminPage() {
  const healthQuery = useHealthQuery();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
        <header>
          <h1 className="text-sm uppercase tracking-[0.3em] text-slate-400">Zepp.ai</h1>
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

        {/* <SessionStatusCheck /> */}
        <CreateSessionForm />
      </section>
    </main>
  );
}

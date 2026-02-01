import { useState } from "react";

import AppHeader from "../components/AppHeader";

export default function HomePage() {
  const [editorValue, setEditorValue] = useState("");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-10">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Resume editor</h2>
          <p className="text-sm text-slate-400">Draft and refine your resume content.</p>
        </div>

      </section>
    </main>
  );
}

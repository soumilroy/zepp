import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import AppHeader from "../components/AppHeader";
import FullScreenLoadingOverlay from "../components/FullScreenLoadingOverlay";
import ImportResumePdfCard from "../components/ImportResumePdfCard";
import ResumeLibraryCard from "../components/ResumeLibraryCard";
import { useSessionToken } from "../lib/sessionToken";

export default function ResumesPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const sessionToken = useSessionToken();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen">
      <AppHeader />
      <FullScreenLoadingOverlay
        open={isImporting || isDeleting}
        title={isDeleting ? "Deleting resume…" : "Importing resume…"}
      />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start">
        <ResumeLibraryCard
          sessionToken={sessionToken}
          isImporting={isImporting}
          onDeletingChange={setIsDeleting}
        />
        <ImportResumePdfCard
          onImported={(data) => {
            if (sessionToken) {
              queryClient.invalidateQueries({ queryKey: ["resumes", sessionToken] });
            }
            navigate(`/resumes/${data.resume_id}`);
          }}
          onProcessingChange={setIsImporting}
        />
      </section>
    </main>
  );
}

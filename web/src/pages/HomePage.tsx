import { useState } from "react";
import { LogOut } from "lucide-react";

import { useLogoutMutation, useUserQuery } from "../api/hooks";
import SessionGateModal from "../components/SessionGateModal";
import LogoutConfirmDialog from "../components/LogoutConfirmDialog";
import { Button } from "../components/ui/button";

const SESSION_TOKEN_KEY = "session_token";

export default function HomePage() {
  const logoutMutation = useLogoutMutation();
  const [sessionToken, setSessionToken] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  });
  const userQuery = useUserQuery(sessionToken ?? undefined);
  const [logoutSignal, setLogoutSignal] = useState(0);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const logoutConfirm = () => {
    if (!sessionToken) {
      setIsLogoutOpen(false);
      return;
    }
    logoutMutation.mutate(sessionToken, {
      onSuccess: () => {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        setSessionToken(null);
        setLogoutSignal((value) => value + 1);
        setIsLogoutOpen(false);
      },
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <SessionGateModal
        forceOpenKey={logoutSignal}
        onSessionCreated={(token) => setSessionToken(token)}
      />
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        isPending={logoutMutation.isPending}
        isDisabled={!sessionToken}
        onOpenChange={setIsLogoutOpen}
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={logoutConfirm}
      />
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-white">Zepp.ai</h1>
          <div className="flex flex-wrap items-center gap-3">
            {sessionToken ? (
              <span className="text-sm text-slate-300">
                {userQuery.isLoading ? "Loading user..." : userQuery.data?.email ?? "Unknown user"}
              </span>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => setIsLogoutOpen(true)}
              disabled={!sessionToken || logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </header>
      </section>
    </main>
  );
}

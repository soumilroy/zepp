import { useState } from "react";
import { LogOut } from "lucide-react";

import { useLogoutMutation, useUserQuery } from "../api/hooks";
import BrandMark from "./BrandMark";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import SessionGateModal from "./SessionGateModal";
import { Button } from "./ui/button";

const SESSION_TOKEN_KEY = "session_token";

export default function AppHeader() {
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
  };

  return (
    <>
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
      <header className="w-full border-b border-slate-800/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <BrandMark />
          <div className="flex flex-wrap items-center gap-3">
            {sessionToken ? (
              <span className="text-sm text-slate-500 font-medium">
                {userQuery.isLoading ? "Loading user..." : userQuery.data?.email ?? "Unknown user"}
              </span>
            ) : null}
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setIsLogoutOpen(true)}
              disabled={!sessionToken || logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

import { useEffect, useState } from "react";
import { KeyRound, Mail, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";

import { useCreateSessionMutation } from "../api/hooks";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const SESSION_TOKEN_KEY = "session_token";

type SessionGateValues = {
  email: string;
  openai_key: string;
};

function getHasToken() {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
}

type SessionGateModalProps = {
  forceOpenKey?: number;
  onSessionCreated?: (token: string) => void;
};

export default function SessionGateModal({
  forceOpenKey,
  onSessionCreated,
}: SessionGateModalProps) {
  const [hasToken, setHasToken] = useState(getHasToken);
  const [isOpen, setIsOpen] = useState(!hasToken);
  const createSession = useCreateSessionMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionGateValues>({
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!hasToken && !nextOpen) {
          return;
        }
        setIsOpen(nextOpen);
      }}
    >
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-300" />
            Connect your session
          </DialogTitle>
          <DialogDescription>
            Enter your email and OpenAI key to start a session.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => {
            createSession.mutate(values, {
              onSuccess: (data) => {
                sessionStorage.setItem(SESSION_TOKEN_KEY, data.session_token);
                setHasToken(true);
                setIsOpen(false);
                onSessionCreated?.(data.session_token);
              },
            });
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

          <Button type="submit" className="gap-2" disabled={createSession.isPending}>
            <Sparkles className="h-4 w-4" />
            {createSession.isPending ? "Creating session..." : "Create session"}
          </Button>

          {createSession.isError && (
            <p className="text-sm text-red-400">{createSession.error.message}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

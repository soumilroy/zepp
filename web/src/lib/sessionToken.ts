import { useSyncExternalStore } from "react";

const SESSION_TOKEN_KEY = "session_token";

type Listener = () => void;
const listeners = new Set<Listener>();

export function getSessionToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string) {
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  listeners.forEach((listener) => listener());
}

export function clearSessionToken() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  listeners.forEach((listener) => listener());
}

export function subscribeSessionToken(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSessionToken() {
  return useSyncExternalStore(subscribeSessionToken, getSessionToken, () => null);
}


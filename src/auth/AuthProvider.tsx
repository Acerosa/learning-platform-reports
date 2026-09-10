import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  createReportsClient,
  getSession,
  signInWithPassword,
  signOut,
  type ReportsClient
} from "../api/reporting-api";

type AuthStatus = "loading" | "signed-out" | "authenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  client: ReportsClient;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  clientFactory = createReportsClient
}: {
  children: ReactNode;
  clientFactory?: () => ReportsClient;
}) {
  const client = useMemo(() => clientFactory(), [clientFactory]);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSession(client)
      .then((next) => {
        if (!active) return;
        setSession(next);
        setStatus(next ? "authenticated" : "signed-out");
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setStatus("error");
        setError("We could not restore your session. Please sign in again.");
      });

    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setStatus(next ? "authenticated" : "signed-out");
      setError(null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  async function handleSignIn(email: string, password: string) {
    setError(null);
    try {
      const next = await signInWithPassword(client, email, password);
      setSession(next);
      setStatus("authenticated");
    } catch {
      setStatus("signed-out");
      setSession(null);
      setError("Sign-in failed. Check your email and password, then try again.");
      throw new Error("AUTH_FAILED");
    }
  }

  async function handleSignOut() {
    await signOut(client);
    setSession(null);
    setStatus("signed-out");
    setError(null);
  }

  const value: AuthContextValue = {
    status,
    session,
    client,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider required");
  return value;
}

import { useState, type FormEvent } from "react";
import { APP_CONFIG } from "../config";
import { useAuth } from "./AuthProvider";

export function SignInForm() {
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    setBusy(true);
    try {
      await signIn(email, password);
    } catch {
      setLocalError("Sign-in failed. Check your email and password, then try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="sign-in-title">
      <h1 id="sign-in-title">{APP_CONFIG.appName}</h1>
      <p className="lede">
        Sign in with your learning platform account to view completed lesson reports for{" "}
        {APP_CONFIG.pilotHubTitle}.
      </p>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label htmlFor="reports-email">Email address</label>
        <input
          id="reports-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="reports-password">Password</label>
        <input
          id="reports-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {(localError || error) && (
          <p className="error" role="alert">
            {localError || error}
          </p>
        )}
        <button type="submit" className="button" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}

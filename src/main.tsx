import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { APP_CONFIG } from "./config";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element missing");

document.documentElement.style.setProperty("--lp-primary", APP_CONFIG.theme.primary);
document.documentElement.style.setProperty("--lp-accent", APP_CONFIG.theme.accent);
document.documentElement.style.setProperty("--lp-surface", APP_CONFIG.theme.surface);
document.documentElement.style.setProperty("--lp-text", APP_CONFIG.theme.text);
document.documentElement.style.setProperty("--lp-muted", APP_CONFIG.theme.muted);
document.documentElement.style.setProperty("--lp-border", APP_CONFIG.theme.border);
document.documentElement.style.setProperty("--lp-danger", APP_CONFIG.theme.danger);
document.documentElement.style.setProperty("--lp-success", APP_CONFIG.theme.success);

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

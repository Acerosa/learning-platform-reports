import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";
import { APP_CONFIG } from "../config";
import type { HubActivityProgressRow } from "../report/types";

export type ReportsClient = SupabaseClient;

export function createReportsClient(): ReportsClient {
  return createClient(APP_CONFIG.supabase.projectUrl, APP_CONFIG.supabase.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: APP_CONFIG.supabase.authStorageKey
    }
  });
}

export async function fetchHubActivityProgress(
  client: ReportsClient,
  hubCode: string
): Promise<HubActivityProgressRow[]> {
  const { data, error } = await client.schema("api").rpc("my_hub_activity_progress", {
    p_hub_code: hubCode
  });

  if (error) {
    const message = String(error.message || "");
    const code = String(error.code || message || "RPC_FAILED");
    const haystack = `${code} ${message}`;
    if (/28000|AUTH_REQUIRED|JWT|session/i.test(haystack)) {
      throw Object.assign(new Error("AUTH_REQUIRED"), { code: "AUTH_REQUIRED" });
    }
    if (/HUB_UNKNOWN|INVALID_HUB_CODE|22023/i.test(haystack)) {
      throw Object.assign(new Error("HUB_UNAVAILABLE"), { code: "HUB_UNAVAILABLE" });
    }
    throw Object.assign(new Error("RPC_FAILED"), {
      code: "RPC_FAILED"
    });
  }

  return Array.isArray(data) ? (data as HubActivityProgressRow[]) : [];
}

export async function getSession(client: ReportsClient): Promise<Session | null> {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

export async function signInWithPassword(
  client: ReportsClient,
  email: string,
  password: string
): Promise<Session> {
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password
  });
  if (error) {
    throw Object.assign(new Error(error.message), { code: error.code || "AUTH_FAILED" });
  }
  if (!data.session) {
    throw Object.assign(new Error("No session returned."), { code: "AUTH_FAILED" });
  }
  return data.session;
}

export async function signOut(client: ReportsClient): Promise<void> {
  await client.auth.signOut();
}

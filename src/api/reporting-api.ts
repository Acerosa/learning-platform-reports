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
    const code = String(error.code || error.message || "RPC_FAILED");
    if (/28000|AUTH_REQUIRED|JWT|session/i.test(code + " " + (error.message || ""))) {
      throw Object.assign(new Error("AUTH_REQUIRED"), { code: "AUTH_REQUIRED" });
    }
    throw Object.assign(new Error(error.message || "RPC_FAILED"), {
      code: code || "RPC_FAILED"
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

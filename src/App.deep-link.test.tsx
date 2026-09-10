import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import type { ReportsClient } from "./api/reporting-api";
import type { HubActivityProgressRow } from "./report/types";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

function row(
  partial: Partial<HubActivityProgressRow> &
    Pick<HubActivityProgressRow, "activity_key" | "week_number" | "session_number" | "completed">
): HubActivityProgressRow {
  return {
    hub_code: "unit-3-cyber-security",
    activity_title: partial.activity_title ?? partial.activity_key,
    activity_version: partial.activity_version ?? "1.0.0",
    week_key: "week-1",
    attempt_count: partial.completed ? 1 : 0,
    first_score: null,
    latest_score: partial.completed ? 8 : null,
    best_score: partial.completed ? 8 : null,
    max_score: 10,
    first_percentage: partial.completed ? 80 : null,
    latest_percentage: partial.completed ? 80 : null,
    best_percentage: partial.completed ? 80 : null,
    improvement: null,
    improvement_percentage_points: null,
    first_attempt_at: null,
    latest_attempt_at: null,
    ...partial
  };
}

function createClient(rows: HubActivityProgressRow[]): ReportsClient {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: { access_token: "t" } }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn(async () => ({ error: null }))
    },
    schema: vi.fn(() => ({
      rpc: vi.fn(async () => ({ data: rows, error: null }))
    }))
  } as unknown as ReportsClient;
}

describe("deep-link report lock", () => {
  it("does not render the final report for an incomplete deep-linked session", async () => {
    window.history.replaceState(
      null,
      "",
      "/?hub=unit-3-cyber-security&week=1&session=1"
    );
    const rows = [
      row({ activity_key: "a", week_number: 1, session_number: 1, completed: true }),
      row({ activity_key: "b", week_number: 1, session_number: 1, completed: false })
    ];

    render(
      <AuthProvider clientFactory={() => createClient(rows)}>
        <App />
      </AuthProvider>
    );

    expect(await screen.findByRole("heading", { name: /not ready yet/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Session 1 report/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /What went well/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /Areas to review/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /Overall performance/i })).toBeNull();
    expect(screen.getByText(/1 of 2 activities completed/i)).toBeInTheDocument();
  });

  it("rejects learner identity parameters in the URL", async () => {
    window.history.replaceState(null, "", "/?hub=unit-3-cyber-security&studentId=abc");
    render(
      <AuthProvider clientFactory={() => createClient([])}>
        <App />
      </AuthProvider>
    );
    expect(
      await screen.findByText(/includes learner identity details/i)
    ).toBeInTheDocument();
  });
});

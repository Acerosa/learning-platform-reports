import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../auth/AuthProvider";
import type { ReportsClient } from "../api/reporting-api";

afterEach(() => {
  cleanup();
});

function Probe() {
  const { status } = useAuth();
  return <p>status:{status}</p>;
}

function createMockClient(session: unknown = null): ReportsClient {
  const listeners = new Set<(event: string, session: unknown) => void>();
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session }, error: null })),
      onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
        listeners.add(callback);
        return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(async () => ({ error: null }))
    }
  } as unknown as ReportsClient;
}

describe("authentication states", () => {
  it("shows signed-out when there is no session", async () => {
    render(
      <AuthProvider clientFactory={() => createMockClient(null)}>
        <Probe />
      </AuthProvider>
    );
    expect(await screen.findByText("status:signed-out")).toBeInTheDocument();
  });

  it("shows authenticated when a session exists", async () => {
    render(
      <AuthProvider clientFactory={() => createMockClient({ access_token: "test" })}>
        <Probe />
      </AuthProvider>
    );
    expect(await screen.findByText("status:authenticated")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { fetchHubActivityProgress, type ReportsClient } from "./reporting-api";

describe("reporting-api errors", () => {
  it("maps auth failures without exposing SQL detail", async () => {
    const client = {
      schema: () => ({
        rpc: async () => ({
          data: null,
          error: { code: "28000", message: "AUTH_REQUIRED detail should stay internal" }
        })
      })
    } as unknown as ReportsClient;

    await expect(fetchHubActivityProgress(client, "unit-3-cyber-security")).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
      message: "AUTH_REQUIRED"
    });
  });

  it("maps unknown hubs safely", async () => {
    const client = {
      schema: () => ({
        rpc: async () => ({
          data: null,
          error: { code: "22023", message: "HUB_UNKNOWN" }
        })
      })
    } as unknown as ReportsClient;

    await expect(fetchHubActivityProgress(client, "not-a-real-hub")).rejects.toMatchObject({
      code: "HUB_UNAVAILABLE"
    });
  });
});

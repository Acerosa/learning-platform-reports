import { describe, expect, it } from "vitest";
import { buildReportScopeSearch, parseReportScope } from "./parse-report-scope";

describe("parseReportScope", () => {
  it("parses curriculum scope only", () => {
    expect(parseReportScope("?hub=unit-3-cyber-security&week=1&session=2", {
      hub: "unit-3-cyber-security"
    })).toEqual({
      hub: "unit-3-cyber-security",
      week: 1,
      session: 2
    });
  });

  it("rejects learner identity URL parameters", () => {
    expect(() =>
      parseReportScope("?hub=unit-3-cyber-security&studentId=abc", {
        hub: "unit-3-cyber-security"
      })
    ).toThrow(/LEARNER_IDENTITY_URL_FORBIDDEN/);

    expect(() =>
      parseReportScope("?email=learner@example.com", { hub: "unit-3-cyber-security" })
    ).toThrow(/LEARNER_IDENTITY_URL_FORBIDDEN/);
  });

  it("builds search without identity fields", () => {
    const search = buildReportScopeSearch({
      hub: "unit-3-cyber-security",
      week: 1,
      session: 1
    });
    expect(search).toBe("?hub=unit-3-cyber-security&week=1&session=1");
    expect(search).not.toMatch(/student|email|uid|learner/i);
  });
});

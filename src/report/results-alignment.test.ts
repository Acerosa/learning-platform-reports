import { describe, expect, it } from "vitest";
import { buildDiagnostics } from "@learning-platform/results";
import { RESULTS_LIBRARY_ALIGNMENT } from "./results-alignment";

describe("Results library alignment", () => {
  it("keeps pilot thresholds aligned with buildDiagnostics defaults", () => {
    const report = buildDiagnostics([]);
    expect(RESULTS_LIBRARY_ALIGNMENT.strengthThreshold).toBe(80);
    expect(RESULTS_LIBRARY_ALIGNMENT.weaknessThreshold).toBe(50);
    expect(report.strengths).toEqual([]);
    expect(report.weaknesses).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  buildActivityLine,
  buildSessionPerformanceReport,
  calculateOverallLatestPercentage,
  classifyActivityPerformance
} from "./session-performance";
import type { HubActivityProgressRow, SessionGroup } from "./types";

function row(partial: Partial<HubActivityProgressRow> & Pick<HubActivityProgressRow, "activity_key">): HubActivityProgressRow {
  return {
    hub_code: "unit-3-cyber-security",
    activity_title: partial.activity_title ?? partial.activity_key,
    activity_version: "1.0.0",
    week_key: "week-1",
    week_number: 1,
    session_number: 1,
    attempt_count: 1,
    first_score: null,
    latest_score: null,
    best_score: null,
    max_score: 10,
    first_percentage: null,
    latest_percentage: null,
    best_percentage: null,
    improvement: null,
    improvement_percentage_points: null,
    completed: true,
    first_attempt_at: null,
    latest_attempt_at: null,
    ...partial
  };
}

function session(activities: HubActivityProgressRow[]): SessionGroup {
  const requiredCount = activities.length;
  const completedCount = activities.filter((item) => item.completed).length;
  return {
    hubCode: "unit-3-cyber-security",
    weekNumber: 1,
    sessionNumber: 1,
    weekKey: "week-1",
    activities,
    requiredCount,
    completedCount,
    remainingCount: requiredCount - completedCount,
    sessionComplete: requiredCount > 0 && completedCount === requiredCount,
    reportReady: requiredCount > 0 && completedCount === requiredCount
  };
}

describe("session performance", () => {
  it("handles single-attempt activities without false improvement", () => {
    const line = buildActivityLine(
      row({
        activity_key: "single",
        activity_title: "Password security",
        attempt_count: 1,
        latest_score: 8,
        first_score: 8,
        best_score: 8,
        first_percentage: 80,
        latest_percentage: 80,
        best_percentage: 80,
        improvement_percentage_points: 0
      })
    );
    expect(line.showImprovement).toBe(false);
    expect(line.latestPercentage).toBe(80);
  });

  it("shows first/latest/best and improvement for multi-attempt activities", () => {
    const line = buildActivityLine(
      row({
        activity_key: "multi",
        activity_title: "Identifying cyber threats",
        attempt_count: 2,
        first_score: 5.4,
        latest_score: 7.8,
        best_score: 7.8,
        first_percentage: 54,
        latest_percentage: 78,
        best_percentage: 78,
        improvement_percentage_points: 24
      })
    );
    expect(line.showImprovement).toBe(true);
    expect(line.firstPercentage).toBe(54);
    expect(line.latestPercentage).toBe(78);
    expect(line.bestPercentage).toBe(78);
    expect(line.improvementPercentagePoints).toBe(24);
  });

  it("treats non-scored completed activities as completed but not scored", () => {
    const line = buildActivityLine(
      row({
        activity_key: "reflection",
        activity_title: "Reflection",
        max_score: 0,
        latest_percentage: null,
        completed: true
      })
    );
    expect(line.completed).toBe(true);
    expect(line.scored).toBe(false);
  });

  it("averages latest percentages without weighting by attempt count", () => {
    const overall = calculateOverallLatestPercentage([
      row({
        activity_key: "a",
        attempt_count: 5,
        latest_percentage: 100,
        max_score: 10
      }),
      row({
        activity_key: "b",
        attempt_count: 1,
        latest_percentage: 50,
        max_score: 10
      }),
      row({
        activity_key: "c",
        max_score: 0,
        latest_percentage: null
      })
    ]);
    expect(overall).toBe(75);
  });

  it("classifies strengths and areas to review from activity titles", () => {
    const { strengths, areasToReview } = classifyActivityPerformance([
      row({ activity_key: "a", activity_title: "Password security", latest_percentage: 90 }),
      row({ activity_key: "b", activity_title: "Vulnerability classification", latest_percentage: 40 }),
      row({ activity_key: "c", activity_title: "Defensive controls", latest_percentage: 70 })
    ]);
    expect(strengths).toEqual(["Password security"]);
    expect(areasToReview).toEqual(["Vulnerability classification"]);
  });

  it("represents score decreases without inventing positive improvement", () => {
    const line = buildActivityLine(
      row({
        activity_key: "drop",
        attempt_count: 2,
        first_percentage: 80,
        latest_percentage: 55,
        best_percentage: 80,
        improvement_percentage_points: -25
      })
    );
    expect(line.showImprovement).toBe(true);
    expect(line.improvementPercentagePoints).toBe(-25);
    expect(line.bestPercentage).toBe(80);
    expect(line.latestPercentage).toBe(55);
  });

  it("does not treat non-scored completed work as 0% performance", () => {
    const { strengths, areasToReview } = classifyActivityPerformance([
      row({
        activity_key: "reflection",
        activity_title: "Reflection",
        max_score: 0,
        latest_percentage: null,
        completed: true
      }),
      row({
        activity_key: "quiz",
        activity_title: "Quiz",
        latest_percentage: 90,
        max_score: 10
      })
    ]);
    expect(strengths).toEqual(["Quiz"]);
    expect(areasToReview).toEqual([]);
    expect(
      calculateOverallLatestPercentage([
        row({
          activity_key: "reflection",
          max_score: 0,
          latest_percentage: null,
          completed: true
        }),
        row({ activity_key: "a", latest_percentage: 80, max_score: 10 }),
        row({ activity_key: "b", latest_percentage: 60, max_score: 10 })
      ])
    ).toBe(70);
  });

  it("allows low-scoring complete sessions to unlock a report", () => {
    const ready = session([
      row({ activity_key: "a", latest_percentage: 20, latest_score: 2, completed: true }),
      row({ activity_key: "b", latest_percentage: 10, latest_score: 1, completed: true })
    ]);
    const report = buildSessionPerformanceReport(ready);
    expect(report.overallLatestPercentage).toBe(15);
    expect(report.areasToReview.length).toBe(2);
  });

  it("builds a completed session report only when report-ready", () => {
    const ready = session([
      row({ activity_key: "a", activity_title: "Password security", latest_percentage: 90, latest_score: 9 }),
      row({ activity_key: "b", activity_title: "Risk responses", latest_percentage: 45, latest_score: 4.5 })
    ]);
    const report = buildSessionPerformanceReport(ready, "2026-09-10T12:00:00.000Z");
    expect(report.overallLatestPercentage).toBe(67.5);
    expect(report.strengths).toEqual(["Password security"]);
    expect(report.areasToReview).toEqual(["Risk responses"]);

    const incomplete = session([
      row({ activity_key: "a", completed: true, latest_percentage: 90 }),
      row({ activity_key: "b", completed: false, attempt_count: 0 })
    ]);
    expect(() => buildSessionPerformanceReport(incomplete)).toThrow(/SESSION_REPORT_NOT_READY/);
  });
});

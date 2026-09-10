import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ReportsHomePage } from "./ReportsHomePage";
import { IncompleteSessionPage } from "./IncompleteSessionPage";
import { CompletedSessionReportPage } from "./CompletedSessionReportPage";
import type { SessionGroup } from "../report/types";
import { buildSessionPerformanceReport } from "../report/session-performance";

afterEach(() => cleanup());

const incomplete: SessionGroup = {
  hubCode: "unit-3-cyber-security",
  weekNumber: 1,
  sessionNumber: 1,
  weekKey: "week-1",
  activities: [],
  requiredCount: 28,
  completedCount: 24,
  remainingCount: 4,
  sessionComplete: false,
  reportReady: false
};

const complete: SessionGroup = {
  hubCode: "unit-3-cyber-security",
  weekNumber: 1,
  sessionNumber: 1,
  weekKey: "week-1",
  activities: [
    {
      hub_code: "unit-3-cyber-security",
      activity_key: "password-security",
      activity_title: "Password security",
      activity_version: "1.0.0",
      week_key: "week-1",
      week_number: 1,
      session_number: 1,
      attempt_count: 2,
      first_score: 5,
      latest_score: 9,
      best_score: 9,
      max_score: 10,
      first_percentage: 50,
      latest_percentage: 90,
      best_percentage: 90,
      improvement: 4,
      improvement_percentage_points: 40,
      completed: true,
      first_attempt_at: null,
      latest_attempt_at: null
    },
    {
      hub_code: "unit-3-cyber-security",
      activity_key: "risk-responses",
      activity_title: "Risk responses",
      activity_version: "1.0.0",
      week_key: "week-1",
      week_number: 1,
      session_number: 1,
      attempt_count: 1,
      first_score: 4,
      latest_score: 4,
      best_score: 4,
      max_score: 10,
      first_percentage: 40,
      latest_percentage: 40,
      best_percentage: 40,
      improvement: null,
      improvement_percentage_points: null,
      completed: true,
      first_attempt_at: null,
      latest_attempt_at: null
    }
  ],
  requiredCount: 2,
  completedCount: 2,
  remainingCount: 0,
  sessionComplete: true,
  reportReady: true
};

describe("report screens", () => {
  it("does not offer a final report button for incomplete sessions", () => {
    render(
      <ReportsHomePage
        hubCode="unit-3-cyber-security"
        sessions={[incomplete]}
        unscopedCount={0}
        onOpenSession={() => {}}
      />
    );
    expect(screen.getByText(/Report not ready/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /View Session 1 report/i })).toBeNull();
    expect(screen.getByRole("button", { name: /View progress/i })).toBeInTheDocument();
  });

  it("shows incomplete session messaging with counts", () => {
    render(<IncompleteSessionPage session={incomplete} onBack={() => {}} />);
    expect(screen.getByRole("heading", { name: /not ready yet/i })).toBeInTheDocument();
    expect(screen.getByText(/24 of 28 activities completed/i)).toBeInTheDocument();
  });

  it("renders completed session report details", () => {
    render(
      <CompletedSessionReportPage
        report={buildSessionPerformanceReport(complete, "2026-09-10T12:00:00.000Z")}
        onBack={() => {}}
      />
    );
    expect(screen.getByRole("heading", { name: /Session 1 report/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Password security/).length).toBeGreaterThan(0);
    expect(screen.getByText(/\+40 pp/)).toBeInTheDocument();
    expect(screen.getAllByText(/Risk responses/).length).toBeGreaterThan(0);
  });
});

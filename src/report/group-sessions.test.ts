import { describe, expect, it } from "vitest";
import { findSession, groupActivitiesBySession } from "./group-sessions";
import type { HubActivityProgressRow } from "./types";

function row(
  partial: Partial<HubActivityProgressRow> &
    Pick<HubActivityProgressRow, "activity_key" | "week_number" | "session_number" | "completed">
): HubActivityProgressRow {
  return {
    hub_code: "unit-3-cyber-security",
    activity_title: partial.activity_title ?? partial.activity_key,
    activity_version: "1.0.0",
    week_key: partial.week_key ?? (partial.week_number != null ? `week-${partial.week_number}` : null),
    attempt_count: partial.attempt_count ?? (partial.completed ? 1 : 0),
    first_score: partial.first_score ?? null,
    latest_score: partial.latest_score ?? null,
    best_score: partial.best_score ?? null,
    max_score: partial.max_score ?? 10,
    first_percentage: partial.first_percentage ?? null,
    latest_percentage: partial.latest_percentage ?? null,
    best_percentage: partial.best_percentage ?? null,
    improvement: partial.improvement ?? null,
    improvement_percentage_points: partial.improvement_percentage_points ?? null,
    first_attempt_at: null,
    latest_attempt_at: null,
    ...partial
  };
}

describe("groupActivitiesBySession", () => {
  it("groups by hub + week + session and keeps sessions separate", () => {
    const rows = [
      row({ activity_key: "a1", week_number: 1, session_number: 1, completed: true }),
      row({ activity_key: "a2", week_number: 1, session_number: 1, completed: false }),
      row({ activity_key: "b1", week_number: 1, session_number: 2, completed: true }),
      row({ activity_key: "c1", week_number: 2, session_number: 1, completed: false }),
      row({
        activity_key: "other-hub",
        hub_code: "tlevel-software-development",
        week_number: 1,
        session_number: 1,
        completed: true
      })
    ];

    const { sessions, unscoped } = groupActivitiesBySession(rows, "unit-3-cyber-security");
    expect(unscoped).toHaveLength(0);
    expect(sessions).toHaveLength(3);

    const s1 = findSession(sessions, 1, 1)!;
    const s2 = findSession(sessions, 1, 2)!;
    expect(s1.activities.map((item) => item.activity_key)).toEqual(["a1", "a2"]);
    expect(s2.activities.map((item) => item.activity_key)).toEqual(["b1"]);
    expect(s1.activities.some((item) => item.activity_key === "b1")).toBe(false);
  });

  it("marks incomplete and complete sessions correctly for arbitrary counts", () => {
    const twentySeven = Array.from({ length: 27 }, (_, index) =>
      row({
        activity_key: `w1s1-${index}`,
        week_number: 1,
        session_number: 1,
        completed: true
      })
    );
    twentySeven.push(
      row({ activity_key: "w1s1-last", week_number: 1, session_number: 1, completed: false })
    );

    const incomplete = groupActivitiesBySession(twentySeven, "unit-3-cyber-security").sessions[0];
    expect(incomplete.requiredCount).toBe(28);
    expect(incomplete.completedCount).toBe(27);
    expect(incomplete.remainingCount).toBe(1);
    expect(incomplete.reportReady).toBe(false);

    const completeRows = twentySeven.map((item) => ({ ...item, completed: true, attempt_count: 1 }));
    const complete = groupActivitiesBySession(completeRows, "unit-3-cyber-security").sessions[0];
    expect(complete.reportReady).toBe(true);
  });

  it("does not invent a completed report when there are zero assignments", () => {
    const { sessions } = groupActivitiesBySession([], "unit-3-cyber-security");
    expect(sessions).toEqual([]);
  });

  it("excludes rows missing week/session metadata from session reports", () => {
    const { sessions, unscoped } = groupActivitiesBySession(
      [
        row({ activity_key: "ok", week_number: 1, session_number: 1, completed: true }),
        row({ activity_key: "missing", week_number: null, session_number: null, completed: true })
      ],
      "unit-3-cyber-security"
    );
    expect(sessions).toHaveLength(1);
    expect(unscoped.map((item) => item.activity_key)).toEqual(["missing"]);
  });

  it("keeps 39/40-style sessions locked until every row is complete", () => {
    const almost = Array.from({ length: 39 }, (_, index) =>
      row({
        activity_key: `s1-${index}`,
        week_number: 1,
        session_number: 1,
        completed: index < 38,
        attempt_count: index < 38 ? 1 : 0
      })
    );
    const incomplete = groupActivitiesBySession(almost, "unit-3-cyber-security").sessions[0];
    expect(incomplete.requiredCount).toBe(39);
    expect(incomplete.completedCount).toBe(38);
    expect(incomplete.reportReady).toBe(false);

    const completeRows = almost.map((item) => ({ ...item, completed: true, attempt_count: 1 }));
    const complete = groupActivitiesBySession(completeRows, "unit-3-cyber-security").sessions[0];
    expect(complete.requiredCount).toBe(39);
    expect(complete.reportReady).toBe(true);
  });

  it("keeps session isolation across week and hub boundaries", () => {
    const rows = [
      row({ activity_key: "a", week_number: 1, session_number: 1, completed: true }),
      row({ activity_key: "b", week_number: 1, session_number: 2, completed: false }),
      row({ activity_key: "c", week_number: 2, session_number: 1, completed: true }),
      row({
        activity_key: "d",
        hub_code: "other-hub",
        week_number: 1,
        session_number: 1,
        completed: true
      })
    ];
    const { sessions } = groupActivitiesBySession(rows, "unit-3-cyber-security");
    const s1 = findSession(sessions, 1, 1)!;
    expect(s1.requiredCount).toBe(1);
    expect(s1.reportReady).toBe(true);
    expect(findSession(sessions, 1, 2)?.reportReady).toBe(false);
  });
});

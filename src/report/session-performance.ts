import { REPORT_INTERPRETATION } from "./interpretation";
import { displayTitle, hasScoredPerformance } from "./parse-report-scope";
import type { HubActivityProgressRow, SessionGroup } from "./types";

export type ActivityReportLine = {
  activityKey: string;
  activityVersion: string;
  title: string;
  completed: boolean;
  scored: boolean;
  attemptCount: number;
  latestScore: number | null;
  maxScore: number | null;
  firstPercentage: number | null;
  latestPercentage: number | null;
  bestPercentage: number | null;
  improvementPercentagePoints: number | null;
  showImprovement: boolean;
};

export type SessionPerformanceReport = {
  hubCode: string;
  weekNumber: number;
  sessionNumber: number;
  weekKey: string | null;
  completedActivityCount: number;
  requiredActivityCount: number;
  scoredActivityCount: number;
  unscoredCompletedCount: number;
  /** Mean of latest percentages across scored activities only. Null if none scored. */
  overallLatestPercentage: number | null;
  activities: ActivityReportLine[];
  strengths: string[];
  areasToReview: string[];
  viewedAt: string;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildActivityLine(row: HubActivityProgressRow): ActivityReportLine {
  const scored = hasScoredPerformance(row);
  const showImprovement =
    row.completed &&
    Number(row.attempt_count) > 1 &&
    row.improvement_percentage_points != null &&
    row.first_percentage != null &&
    row.latest_percentage != null;

  return {
    activityKey: row.activity_key,
    activityVersion: row.activity_version,
    title: displayTitle(row),
    completed: row.completed,
    scored,
    attemptCount: Number(row.attempt_count) || 0,
    latestScore: row.latest_score,
    maxScore: row.max_score,
    firstPercentage: row.first_percentage,
    latestPercentage: row.latest_percentage,
    bestPercentage: row.best_percentage,
    improvementPercentagePoints: row.improvement_percentage_points,
    showImprovement
  };
}

/**
 * Overall session performance = unweighted average of each activity's latest percentage.
 * Matches the Results analytics idea of average completed-attempt percentage without
 * weighting by attempt count. Non-scored completed activities are excluded from the mean.
 */
export function calculateOverallLatestPercentage(
  activities: readonly HubActivityProgressRow[]
): number | null {
  const scored = activities
    .filter((row) => row.completed && hasScoredPerformance(row))
    .map((row) => Number(row.latest_percentage));
  if (scored.length === 0) return null;
  return round1(scored.reduce((sum, value) => sum + value, 0) / scored.length);
}

export function classifyActivityPerformance(
  activities: readonly HubActivityProgressRow[],
  thresholds = REPORT_INTERPRETATION
): { strengths: string[]; areasToReview: string[] } {
  const scored = activities.filter((row) => row.completed && hasScoredPerformance(row));
  const strengths = scored
    .filter((row) => Number(row.latest_percentage) >= thresholds.strengthThreshold)
    .map((row) => displayTitle(row));
  const areasToReview = scored
    .filter((row) => Number(row.latest_percentage) <= thresholds.weaknessThreshold)
    .map((row) => displayTitle(row));
  return { strengths, areasToReview };
}

export function buildSessionPerformanceReport(
  session: SessionGroup,
  viewedAt = new Date().toISOString()
): SessionPerformanceReport {
  if (!session.reportReady) {
    throw new Error("SESSION_REPORT_NOT_READY");
  }

  const activities = session.activities.map(buildActivityLine);
  const scoredActivityCount = activities.filter((row) => row.scored).length;
  const unscoredCompletedCount = activities.filter((row) => row.completed && !row.scored).length;
  const { strengths, areasToReview } = classifyActivityPerformance(session.activities);

  return {
    hubCode: session.hubCode,
    weekNumber: session.weekNumber,
    sessionNumber: session.sessionNumber,
    weekKey: session.weekKey,
    completedActivityCount: session.completedCount,
    requiredActivityCount: session.requiredCount,
    scoredActivityCount,
    unscoredCompletedCount,
    overallLatestPercentage: calculateOverallLatestPercentage(session.activities),
    activities,
    strengths,
    areasToReview,
    viewedAt
  };
}

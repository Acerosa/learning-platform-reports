import type { HubActivityProgressRow, ReportScope } from "./types";

const HUB_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FORBIDDEN_IDENTITY_PARAMS = Object.freeze([
  "learner",
  "learnerId",
  "learner_id",
  "student",
  "studentId",
  "student_id",
  "studentNumber",
  "student_number",
  "email",
  "uid",
  "userId",
  "user_id",
  "authUid",
  "auth_uid"
]);

function positiveInt(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  if (!/^\d+$/.test(value.trim())) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Curriculum/report scope only. Learner identity must never appear in the URL.
 */
export function parseReportScope(
  search: string,
  defaults: { hub: string }
): ReportScope {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);

  for (const key of FORBIDDEN_IDENTITY_PARAMS) {
    if (params.has(key)) {
      throw new Error("LEARNER_IDENTITY_URL_FORBIDDEN");
    }
  }

  const hubRaw = (params.get("hub") || defaults.hub).trim().toLowerCase();
  if (!HUB_PATTERN.test(hubRaw) || hubRaw.length > 80) {
    throw new Error("INVALID_HUB_CODE");
  }

  return {
    hub: hubRaw,
    week: positiveInt(params.get("week")),
    session: positiveInt(params.get("session"))
  };
}

export function buildReportScopeSearch(scope: ReportScope): string {
  const params = new URLSearchParams();
  params.set("hub", scope.hub);
  if (scope.week != null) params.set("week", String(scope.week));
  if (scope.session != null) params.set("session", String(scope.session));
  return `?${params.toString()}`;
}

export function hasScoredPerformance(row: HubActivityProgressRow): boolean {
  return row.latest_percentage != null && row.max_score != null && Number(row.max_score) > 0;
}

export function displayTitle(row: HubActivityProgressRow): string {
  const title = typeof row.activity_title === "string" ? row.activity_title.trim() : "";
  return title || row.activity_key || "Untitled activity";
}

export type HubActivityProgressRow = {
  hub_code: string;
  activity_key: string;
  activity_title: string | null;
  activity_version: string;
  week_key: string | null;
  week_number: number | null;
  session_number: number | null;
  attempt_count: number;
  first_score: number | null;
  latest_score: number | null;
  best_score: number | null;
  max_score: number | null;
  first_percentage: number | null;
  latest_percentage: number | null;
  best_percentage: number | null;
  improvement: number | null;
  improvement_percentage_points: number | null;
  completed: boolean;
  first_attempt_at: string | null;
  latest_attempt_at: string | null;
};

export type SessionKey = {
  hubCode: string;
  weekNumber: number;
  sessionNumber: number;
  weekKey: string | null;
};

export type SessionGroup = SessionKey & {
  activities: HubActivityProgressRow[];
  requiredCount: number;
  completedCount: number;
  remainingCount: number;
  sessionComplete: boolean;
  reportReady: boolean;
};

export type ReportScope = {
  hub: string;
  week: number | null;
  session: number | null;
};

import type { HubActivityProgressRow, SessionGroup } from "./types";

function sessionSortKey(group: SessionGroup): string {
  return `${String(group.weekNumber).padStart(4, "0")}-${String(group.sessionNumber).padStart(4, "0")}`;
}

/**
 * Group Phase 1A rows by hub + week_number + session_number.
 * Rows missing week or session metadata are excluded from session reports.
 */
export function groupActivitiesBySession(
  rows: readonly HubActivityProgressRow[],
  hubCode: string
): {
  sessions: SessionGroup[];
  unscoped: HubActivityProgressRow[];
} {
  const scoped = rows.filter((row) => row.hub_code === hubCode);
  const unscoped: HubActivityProgressRow[] = [];
  const map = new Map<string, HubActivityProgressRow[]>();

  for (const row of scoped) {
    if (row.week_number == null || row.session_number == null) {
      unscoped.push(row);
      continue;
    }
    const key = `${row.week_number}:${row.session_number}`;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }

  const sessions: SessionGroup[] = [...map.entries()].map(([, activities]) => {
    const weekNumber = activities[0].week_number as number;
    const sessionNumber = activities[0].session_number as number;
    const weekKey = activities.find((row) => row.week_key)?.week_key ?? null;
    const requiredCount = activities.length;
    const completedCount = activities.filter((row) => row.completed).length;
    const remainingCount = Math.max(0, requiredCount - completedCount);
    const sessionComplete = requiredCount > 0 && completedCount === requiredCount;
    return {
      hubCode,
      weekNumber,
      sessionNumber,
      weekKey,
      activities: [...activities].sort((a, b) =>
        displaySort(a.activity_title, a.activity_key).localeCompare(
          displaySort(b.activity_title, b.activity_key)
        )
      ),
      requiredCount,
      completedCount,
      remainingCount,
      sessionComplete,
      reportReady: sessionComplete
    };
  });

  sessions.sort((a, b) => sessionSortKey(a).localeCompare(sessionSortKey(b)));
  return { sessions, unscoped };
}

function displaySort(title: string | null, key: string): string {
  return `${(title || "").trim()}|${key}`;
}

export function findSession(
  sessions: readonly SessionGroup[],
  week: number,
  session: number
): SessionGroup | null {
  return sessions.find((item) => item.weekNumber === week && item.sessionNumber === session) ?? null;
}

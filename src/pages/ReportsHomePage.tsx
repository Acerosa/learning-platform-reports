import type { SessionGroup } from "../report/types";
import { APP_CONFIG } from "../config";
import { buildReportScopeSearch } from "../report/parse-report-scope";

export function ReportsHomePage({
  hubCode,
  sessions,
  unscopedCount,
  onOpenSession
}: {
  hubCode: string;
  sessions: SessionGroup[];
  unscopedCount: number;
  onOpenSession: (week: number, session: number) => void;
}) {
  const byWeek = new Map<number, SessionGroup[]>();
  for (const session of sessions) {
    const list = byWeek.get(session.weekNumber) ?? [];
    list.push(session);
    byWeek.set(session.weekNumber, list);
  }

  return (
    <section className="panel" aria-labelledby="reports-home-title">
      <h1 id="reports-home-title">{APP_CONFIG.pilotHubTitle}</h1>
      <p className="lede">
        {APP_CONFIG.qualification}. Reports become available after you complete every required
        activity in a lesson.
      </p>

      {sessions.length === 0 ? (
        <p role="status">
          No Unit 3 lesson assignments were found for your account yet. Complete learning in the
          Cyber Security hub first.
        </p>
      ) : (
        [...byWeek.entries()].map(([weekNumber, weekSessions]) => (
          <section key={weekNumber} className="week-block" aria-labelledby={`week-${weekNumber}`}>
            <h2 id={`week-${weekNumber}`}>Week {weekNumber}</h2>
            <ul className="session-list">
              {weekSessions.map((session) => (
                <li key={`${session.weekNumber}-${session.sessionNumber}`}>
                  <div className="session-row">
                    <div>
                      <h3>
                        Session {session.sessionNumber}
                      </h3>
                      {session.reportReady ? (
                        <p className="status-ready">Report available</p>
                      ) : (
                        <p className="status-pending">
                          {session.completedCount} of {session.requiredCount} activities complete.
                          Report not ready.
                        </p>
                      )}
                    </div>
                    {session.reportReady ? (
                      <button
                        type="button"
                        className="button"
                        onClick={() => onOpenSession(session.weekNumber, session.sessionNumber)}
                      >
                        View Session {session.sessionNumber} report
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => onOpenSession(session.weekNumber, session.sessionNumber)}
                      >
                        View progress
                      </button>
                    )}
                  </div>
                  <p className="sr-only">
                    Deep link scope:{" "}
                    {buildReportScopeSearch({
                      hub: hubCode,
                      week: session.weekNumber,
                      session: session.sessionNumber
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {unscopedCount > 0 && (
        <p className="muted">
          {unscopedCount} assigned {unscopedCount === 1 ? "activity has" : "activities have"} no
          week/session metadata and {unscopedCount === 1 ? "is" : "are"} not included in lesson
          reports.
        </p>
      )}
    </section>
  );
}

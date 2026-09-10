import type { SessionGroup } from "../report/types";

export function IncompleteSessionPage({
  session,
  onBack
}: {
  session: SessionGroup;
  onBack: () => void;
}) {
  return (
    <section className="panel" aria-labelledby="incomplete-title">
      <p className="eyebrow">
        Week {session.weekNumber} · Session {session.sessionNumber}
      </p>
      <h1 id="incomplete-title">Your report is not ready yet</h1>
      <p className="lede">
        Complete all required activities in this lesson to generate your report.
      </p>
      <dl className="stats">
        <div>
          <dt>Completed</dt>
          <dd>{session.completedCount}</dd>
        </div>
        <div>
          <dt>Required</dt>
          <dd>{session.requiredCount}</dd>
        </div>
        <div>
          <dt>Remaining</dt>
          <dd>{session.remainingCount}</dd>
        </div>
      </dl>
      <p>
        {session.completedCount} of {session.requiredCount} activities completed.
      </p>
      <p className="muted">
        This page shows progress only. Strengths and areas to review appear after the whole lesson
        is complete.
      </p>
      <button type="button" className="button button-secondary" onClick={onBack}>
        Back to reports
      </button>
    </section>
  );
}

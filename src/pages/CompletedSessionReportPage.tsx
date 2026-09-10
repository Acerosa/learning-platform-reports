import { APP_CONFIG } from "../config";
import { REPORT_INTERPRETATION } from "../report/interpretation";
import type { SessionPerformanceReport } from "../report/session-performance";

function formatPercent(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value}%`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function CompletedSessionReportPage({
  report,
  onBack
}: {
  report: SessionPerformanceReport;
  onBack: () => void;
}) {
  return (
    <article className="panel" aria-labelledby="report-title">
      <p className="eyebrow">
        {APP_CONFIG.pilotHubTitle} · Week {report.weekNumber} · Session {report.sessionNumber}
      </p>
      <h1 id="report-title">Session {report.sessionNumber} report</h1>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading">Session summary</h2>
        <dl className="stats">
          <div>
            <dt>Course</dt>
            <dd>{APP_CONFIG.qualification}</dd>
          </div>
          <div>
            <dt>Completion</dt>
            <dd>
              {report.completedActivityCount} of {report.requiredActivityCount} activities
            </dd>
          </div>
          <div>
            <dt>Report viewed</dt>
            <dd>{formatDate(report.viewedAt)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="performance-heading">
        <h2 id="performance-heading">Overall performance</h2>
        {report.overallLatestPercentage != null ? (
          <p>
            Average of your latest scores across scored activities:{" "}
            <strong>{formatPercent(report.overallLatestPercentage)}</strong>
          </p>
        ) : (
          <p>
            This lesson has no scored activities yet, so an overall percentage is not available.
            Completion is still recorded.
          </p>
        )}
        {report.unscoredCompletedCount > 0 && (
          <p className="muted">
            {report.unscoredCompletedCount} completed{" "}
            {report.unscoredCompletedCount === 1 ? "activity was" : "activities were"} not included
            in the average because {report.unscoredCompletedCount === 1 ? "it has" : "they have"} no
            meaningful numeric score.
          </p>
        )}
        <p className="muted">
          These suggestions are based on your activity results and are intended to help you decide
          what to review next. They are not official grade boundaries.
        </p>
      </section>

      <section aria-labelledby="strengths-heading">
        <h2 id="strengths-heading">What went well</h2>
        {report.strengths.length ? (
          <>
            <p>You performed strongly in:</p>
            <ul>
              {report.strengths.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>No scored activities reached the strong-performance suggestion band in this lesson.</p>
        )}
      </section>

      <section aria-labelledby="review-heading">
        <h2 id="review-heading">Areas to review</h2>
        {report.areasToReview.length ? (
          <>
            <p>You may benefit from reviewing:</p>
            <ul>
              {report.areasToReview.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>No scored activities fell into the review suggestion band for this lesson.</p>
        )}
        <p className="muted">
          Labels use activity titles and latest scores only. They are not formal topic, skill,
          OCR or college grading judgements. Suggestion bands follow the Results library defaults (
          {REPORT_INTERPRETATION.strengthThreshold}% / {REPORT_INTERPRETATION.weaknessThreshold}%).
        </p>
      </section>

      <section aria-labelledby="activities-heading">
        <h2 id="activities-heading">Activity results</h2>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">
              Activity scores for Week {report.weekNumber} Session {report.sessionNumber}
            </caption>
            <thead>
              <tr>
                <th scope="col">Activity</th>
                <th scope="col">Latest</th>
                <th scope="col">Attempts</th>
                <th scope="col">First</th>
                <th scope="col">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {report.activities.map((activity) => (
                <tr key={`${activity.activityKey}@${activity.activityVersion}`}>
                  <th scope="row">{activity.title}</th>
                  <td>
                    {activity.scored
                      ? `${activity.latestScore ?? "—"} / ${activity.maxScore ?? "—"} (${formatPercent(activity.latestPercentage)})`
                      : "Completed (not scored)"}
                  </td>
                  <td>{activity.attemptCount}</td>
                  <td>{activity.scored ? formatPercent(activity.firstPercentage) : "—"}</td>
                  <td>
                    {activity.showImprovement
                      ? `${activity.improvementPercentagePoints! >= 0 ? "+" : ""}${activity.improvementPercentagePoints} pp`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button type="button" className="button button-secondary" onClick={onBack}>
        Back to reports
      </button>
    </article>
  );
}

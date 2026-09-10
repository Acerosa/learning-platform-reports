import { useCallback, useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "./config";
import { fetchHubActivityProgress } from "./api/reporting-api";
import { useAuth } from "./auth/AuthProvider";
import { SignInForm } from "./auth/SignInForm";
import { findSession, groupActivitiesBySession } from "./report/group-sessions";
import {
  buildReportScopeSearch,
  parseReportScope
} from "./report/parse-report-scope";
import { buildSessionPerformanceReport } from "./report/session-performance";
import type { HubActivityProgressRow, ReportScope } from "./report/types";
import { CompletedSessionReportPage } from "./pages/CompletedSessionReportPage";
import { IncompleteSessionPage } from "./pages/IncompleteSessionPage";
import { ReportsHomePage } from "./pages/ReportsHomePage";

function readScopeFromLocation(): ReportScope {
  return parseReportScope(window.location.search, { hub: APP_CONFIG.pilotHubCode });
}

function scopeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "LEARNER_IDENTITY_URL_FORBIDDEN") {
    return "This link is not valid because it includes learner identity details.";
  }
  return "This report link is not valid.";
}

function initialScopeState(): { scope: ReportScope; scopeError: string | null } {
  try {
    return { scope: readScopeFromLocation(), scopeError: null };
  } catch (error) {
    return {
      scope: { hub: APP_CONFIG.pilotHubCode, week: null, session: null },
      scopeError: scopeErrorMessage(error)
    };
  }
}

export function App() {
  const { status, client, signOut, error: authError } = useAuth();
  const initial = initialScopeState();
  const [scope, setScope] = useState<ReportScope>(initial.scope);
  const [scopeError, setScopeError] = useState<string | null>(initial.scopeError);
  const [rows, setRows] = useState<HubActivityProgressRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);

  const applyScope = useCallback((next: ReportScope, push = true) => {
    setScope(next);
    const search = buildReportScopeSearch(next);
    if (push && window.location.search !== search) {
      window.history.pushState(null, "", `${window.location.pathname}${search}`);
    }
  }, []);

  useEffect(() => {
    function onPopState() {
      try {
        setScopeError(null);
        setScope(readScopeFromLocation());
      } catch (error) {
        setScopeError(scopeErrorMessage(error));
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setRows(null);
      setLoadError(null);
      return;
    }

    let active = true;
    setLoadingRows(true);
    setLoadError(null);
    fetchHubActivityProgress(client, scope.hub)
      .then((data) => {
        if (!active) return;
        setRows(data);
      })
      .catch((error: { code?: string }) => {
        if (!active) return;
        if (error?.code === "AUTH_REQUIRED") {
          setLoadError("Your session has expired. Please sign in again.");
        } else if (error?.code === "HUB_UNAVAILABLE") {
          setLoadError("That course hub is not available for reports.");
        } else {
          setLoadError("We could not load your reports right now. Try again shortly.");
        }
        setRows(null);
      })
      .finally(() => {
        if (active) setLoadingRows(false);
      });

    return () => {
      active = false;
    };
  }, [status, client, scope.hub]);

  const grouped = useMemo(() => {
    if (!rows) return null;
    return groupActivitiesBySession(rows, scope.hub);
  }, [rows, scope.hub]);

  const selectedSession =
    grouped && scope.week != null && scope.session != null
      ? findSession(grouped.sessions, scope.week, scope.session)
      : null;

  function openSession(week: number, session: number) {
    applyScope({ hub: scope.hub, week, session });
  }

  function backHome() {
    applyScope({ hub: scope.hub, week: null, session: null });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand">{APP_CONFIG.appName}</p>
          <p className="muted small">{APP_CONFIG.qualification}</p>
        </div>
        {status === "authenticated" && (
          <button type="button" className="button button-secondary" onClick={() => void signOut()}>
            Sign out
          </button>
        )}
      </header>

      <main>
        {scopeError && (
          <p className="error" role="alert">
            {scopeError}
          </p>
        )}

        {status === "loading" && <p role="status">Checking your session…</p>}

        {(status === "signed-out" || status === "error") && (
          <>
            {authError && (
              <p className="error" role="alert">
                {authError}
              </p>
            )}
            <SignInForm />
          </>
        )}

        {status === "authenticated" && (
          <>
            {loadingRows && <p role="status">Loading your lesson reports…</p>}
            {loadError && (
              <p className="error" role="alert">
                {loadError}
              </p>
            )}
            {!loadingRows && !loadError && grouped && selectedSession == null && (
              <ReportsHomePage
                hubCode={scope.hub}
                sessions={grouped.sessions}
                unscopedCount={grouped.unscoped.length}
                onOpenSession={openSession}
              />
            )}
            {!loadingRows && !loadError && selectedSession && !selectedSession.reportReady && (
              <IncompleteSessionPage session={selectedSession} onBack={backHome} />
            )}
            {!loadingRows && !loadError && selectedSession?.reportReady && (
              <CompletedSessionReportPage
                report={buildSessionPerformanceReport(selectedSession)}
                onBack={backHome}
              />
            )}
            {!loadingRows &&
              !loadError &&
              grouped &&
              scope.week != null &&
              scope.session != null &&
              selectedSession == null && (
                <section className="panel">
                  <h1>Lesson not found</h1>
                  <p>
                    No assigned activities were found for Week {scope.week}, Session {scope.session}.
                  </p>
                  <button type="button" className="button button-secondary" onClick={backHome}>
                    Back to reports
                  </button>
                </section>
              )}
          </>
        )}
      </main>
    </div>
  );
}

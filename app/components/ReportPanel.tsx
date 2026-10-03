"use client";

import { useEffect, useState } from "react";
import type { DemoProgram } from "@/app/data/demos";
import type { ReportContext } from "@/app/lib/report-presenter";
import { LOADING_STAGES_UI, formatElapsed } from "@/app/lib/report-presenter";
import AuditReport from "@/app/components/AuditReport";

interface ReportPanelProps {
  report: DemoProgram | null;
  loading?: boolean;
  loadingStage?: string;
  loadingStageIndex?: number;
  loadingStartedAt?: number;
  emptyMessage?: string;
  error?: string | null;
  context?: ReportContext;
}

export default function ReportPanel({
  report,
  loading = false,
  loadingStage = LOADING_STAGES_UI[0],
  loadingStageIndex = 0,
  loadingStartedAt,
  emptyMessage = "Select a curated pair or enter upgrade signatures, then run diff to open a live reconstruction report.",
  error = null,
  context,
}: ReportPanelProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!loading || !loadingStartedAt) return;
    const tick = () => setElapsedMs(Date.now() - loadingStartedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [loading, loadingStartedAt]);

  return (
    <div className="playground-frame">
      <div className="playground-toolbar">
        <div className="playground-toolbar-left">
          <div className="playground-brand-mark" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className="playground-toolbar-titles">
            <span className="playground-toolbar-label">SolDiff</span>
            <span className="playground-toolbar-sub">Live analysis workstation</span>
          </div>
        </div>
        <div className="playground-toolbar-right">
          {report && !loading && (
            <span className="playground-badge playground-badge-live">
              <span className="playground-badge-dot" />
              Report ready
            </span>
          )}
          {loading && (
            <span className="playground-badge playground-badge-loading">
              Reconstructing…
            </span>
          )}
          {!loading && !report && !error && (
            <span className="playground-badge">Idle</span>
          )}
          {!loading && error && (
            <span className="playground-badge playground-badge-error">Failed</span>
          )}
        </div>
      </div>

      <div className="playground-shell">
        {loading && (
          <div className="report-loading" role="status" aria-live="polite">
            <div className="report-loading-header">
              <div>
                <div className="report-loading-eyebrow">Pipeline</div>
                <h2 className="report-loading-title">Reconstructing upgrade pair</h2>
              </div>
              {loadingStartedAt ? (
                <span className="report-loading-elapsed">{formatElapsed(elapsedMs)}</span>
              ) : null}
            </div>
            <p className="report-loading-lead">
              Fetching archival Write history and rebuilding ELF bytes. Large programs can take
              several minutes — keep this tab open. Progress below reflects actual pipeline stages
              (not estimated percentages).
            </p>
            <ol className="report-loading-steps">
              {LOADING_STAGES_UI.map((step, i) => {
                const state =
                  i < loadingStageIndex
                    ? "done"
                    : i === loadingStageIndex
                      ? "active"
                      : "pending";
                return (
                  <li key={step} className={`report-loading-step is-${state}`}>
                    <span className="report-loading-dot" aria-hidden />
                    <span>{step}</span>
                  </li>
                );
              })}
            </ol>
            <p className="report-loading-current">{loadingStage}</p>
            <p className="report-loading-hint">
              Do not refresh while buffer-write replay is in progress.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="report-error" role="alert">
            <div className="report-error-icon" aria-hidden>
              !
            </div>
            <h2 className="report-error-title">Analysis failed</h2>
            <p className="report-error-message">{error}</p>
            <p className="report-error-hint">
              Common causes: incomplete archival Write history, RPC rate limits, or very large
              binaries. Retry with a smaller pair (Token-2022 Case A) or a higher-capacity archival
              RPC. Local CLI tip:{" "}
              <code className="report-mono">NODE_OPTIONS=--max-old-space-size=8192</code>.
            </p>
          </div>
        )}

        {!loading && !error && !report && (
          <div className="report-empty">
            <div className="report-empty-icon" aria-hidden>
              ◈
            </div>
            <h2 className="report-empty-title">No report yet</h2>
            <p>{emptyMessage}</p>
            <p className="report-empty-hint">
              Reports are produced by live reconstruction — never from fabricated findings.
            </p>
          </div>
        )}

        {!loading && !error && report && (
          <AuditReport report={report} context={context} />
        )}
      </div>
    </div>
  );
}

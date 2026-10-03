"use client";

import { useId, useState } from "react";
import type { DemoProgram, Finding } from "@/app/data/demos";
import BlastRadius from "@/app/components/BlastRadius";
import DiffViewer from "@/app/components/DiffViewer";
import {
  AddressField,
  HeuristicBadge,
  ProvenanceBadge,
  SeverityBadge,
  StatGrid,
} from "@/app/components/report/ReportChrome";
import {
  executiveBullets,
  formatElapsed,
  formatTimestamp,
  getRiskBanner,
  getRiskLevel,
  parseReconstructionMeta,
  presentFinding,
  sectionStatus,
  severityLabel,
  type ReportContext,
} from "@/app/lib/report-presenter";

const SECTIONS = [
  { id: "summary", label: "Summary", index: "01" },
  { id: "change", label: "Observed Change", index: "02" },
  { id: "findings", label: "Findings", index: "03" },
  { id: "sections", label: "Sections", index: "04" },
  { id: "bytecode", label: "Bytecode", index: "05" },
  { id: "blast", label: "Blast Radius", index: "06" },
  { id: "reconstruction", label: "Reconstruction", index: "07" },
  { id: "versions", label: "Versions", index: "08" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface Props {
  report: DemoProgram;
  context?: ReportContext;
}

export default function AuditReport({ report, context }: Props) {
  const navId = useId();
  const [activeSection, setActiveSection] = useState<SectionId>("summary");
  const [expandedFinding, setExpandedFinding] = useState<string | null>(
    report.findings.find((f) => f.code !== "NO_CHANGE")?.id ?? null
  );

  const risk = getRiskLevel(report.riskScore);
  const banner = getRiskBanner(report.riskScore, report.findings);
  const recon = parseReconstructionMeta(report.description);
  const textStatus = sectionStatus(report.instructionDiff, "text");
  const rodataStatus = sectionStatus(report.accountDiff, "rodata");
  const bullets = executiveBullets(report);
  const totalFindings = report.findings.filter((f) => f.code !== "NO_CHANGE").length;
  const elapsed =
    context?.analysisStartedAt && context?.analysisCompletedAt
      ? formatElapsed(context.analysisCompletedAt - context.analysisStartedAt)
      : "—";

  const noChangeFinding = report.findings.find((f) => f.code === "NO_CHANGE");
  const visibleFindings = report.findings.filter((f) => f.code !== "NO_CHANGE");
  const displayFindings = noChangeFinding ? [noChangeFinding] : visibleFindings;

  const scoreColor =
    report.riskScore >= 80
      ? "var(--sev-critical)"
      : report.riskScore >= 50
        ? "var(--sev-high)"
        : report.riskScore >= 25
          ? "var(--sev-medium)"
          : "var(--sev-safe)";

  const writesA =
    context?.versionA?.writeTransactionCount !== undefined
      ? String(context.versionA.writeTransactionCount)
      : recon.writesA !== null
        ? String(recon.writesA)
        : "—";
  const writesB =
    context?.versionB?.writeTransactionCount !== undefined
      ? String(context.versionB.writeTransactionCount)
      : recon.writesB !== null
        ? String(recon.writesB)
        : "—";

  const coverageA = context?.versionA?.coverageComplete;
  const coverageB = context?.versionB?.coverageComplete;
  const method =
    context?.versionA?.reconstructionMethod ??
    context?.versionB?.reconstructionMethod ??
    "buffer-write-replay";

  const syntheticBlastCount = report.blastNodes.filter((n) => n.changed).length;

  return (
    <div className="audit-playground">
      <aside className="audit-playground-nav" aria-label="Report sections">
        <div className="audit-playground-nav-head">
          <span>Sections</span>
          <span className="audit-playground-nav-count">{SECTIONS.length}</span>
        </div>
        <div className="audit-playground-nav-list" role="tablist" aria-orientation="vertical">
          {SECTIONS.map((item) => {
            const isActive = activeSection === item.id;
            const badge =
              item.id === "findings"
                ? totalFindings || (noChangeFinding ? 1 : 0)
                : item.id === "bytecode"
                  ? report.instructionDiff.filter(
                      (l) => l.type === "added" || l.type === "removed"
                    ).length
                  : item.id === "blast"
                    ? syntheticBlastCount
                    : null;
            const tabId = `${navId}-${item.id}`;
            return (
              <button
                key={item.id}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${navId}-panel`}
                className={`audit-playground-nav-btn${isActive ? " is-active" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="audit-nav-index">{item.index}</span>
                <span className="audit-nav-label">{item.label}</span>
                {badge !== null && badge > 0 && (
                  <span className="audit-playground-nav-badge">{badge}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="audit-playground-nav-foot">
          Live data from on-chain reconstruction
        </div>
      </aside>

      <div className="audit-playground-main">
        <header className="audit-playground-header">
          <ObservedChangeMeter score={report.riskScore} color={scoreColor} />
          <div className="audit-playground-header-meta">
            <div className="audit-playground-header-title">
              <span>{report.name}</span>
              <span
                className="audit-playground-risk-tag"
                style={{ borderColor: scoreColor, color: scoreColor }}
              >
                {risk.label}
              </span>
              <ProvenanceBadge>Live</ProvenanceBadge>
            </div>
            <div className="audit-playground-header-sub">
              <span className="report-mono">
                {report.programId.slice(0, 14)}…{report.programId.slice(-4)}
              </span>
              <span className="audit-header-sep">·</span>
              <span className="report-mono">
                {report.fromSlot.toLocaleString("en-US")} →{" "}
                {report.toSlot.toLocaleString("en-US")}
              </span>
            </div>
            <p className="audit-header-score-note">
              Observed Change Score {report.riskScore}/100 — observational signal, not a
              vulnerability severity rating.
            </p>
          </div>
          <div className="audit-header-chips">
            {recon.cacheHit && (
              <span className="playground-badge playground-badge-cache">cache hit</span>
            )}
            <span className="playground-badge">
              {coverageA === true && coverageB === true
                ? "Coverage complete"
                : "Reconstruction"}
            </span>
            <span className="playground-badge report-mono">{elapsed}</span>
          </div>
        </header>

        <div
          className="audit-playground-content"
          id={`${navId}-panel`}
          role="tabpanel"
          aria-labelledby={`${navId}-${activeSection}`}
        >
          {activeSection === "summary" && (
            <div className="audit-panel-scroll">
              <div className="audit-panel-block">
                <div className="audit-panel-eyebrow">SolDiff Upgrade Report</div>
                <div className="audit-summary-grid">
                  <SummaryStat
                    label="Observed change"
                    value={`${report.riskScore}/100`}
                    accent={scoreColor}
                  />
                  <SummaryStat label="Findings" value={String(totalFindings)} />
                  <SummaryStat label="Analysis time" value={elapsed} />
                  <SummaryStat
                    label="Reconstruction"
                    value={recon.cacheHit ? "Cache hit" : "Complete"}
                  />
                </div>

                <AddressField label="Program ID" value={report.programId} reveal />

                <div className="audit-change-strip">
                  <ChangeChip
                    label=".text"
                    value={textStatus.tone === "changed" ? "Modified" : "Unchanged"}
                    tone={textStatus.tone}
                  />
                  <ChangeChip
                    label=".rodata"
                    value={rodataStatus.tone === "changed" ? "Modified" : "Unchanged"}
                    tone={rodataStatus.tone}
                  />
                  <ChangeChip label="Writes A" value={writesA} tone="unchanged" />
                  <ChangeChip label="Writes B" value={writesB} tone="unchanged" />
                  <ChangeChip
                    label="SBF insn deltas"
                    value={String(report.summary.instructionsChanged)}
                    tone="unchanged"
                  />
                  <ChangeChip
                    label="Pubkey candidates"
                    value={String(report.summary.accountsAffected)}
                    tone="unchanged"
                    heuristic
                  />
                </div>

                <ul className="audit-bullet-list compact">
                  {bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="audit-muted compact">{report.description}</p>
              </div>
            </div>
          )}

          {activeSection === "change" && (
            <div className="audit-panel-scroll">
              <div className={`audit-risk-banner tone-${banner.tone} flat`}>
                <div className="audit-risk-banner-kicker">Observed Change</div>
                <div className="audit-risk-banner-title">{banner.title}</div>
                <p className="audit-risk-banner-reason">{banner.reason}</p>
              </div>
              <div className="audit-panel-block">
                <p className="audit-score-disclaimer">
                  This score measures observed binary/data change magnitude. It is not a security
                  or vulnerability rating.
                </p>
                <StatGrid
                  items={[
                    {
                      label: "Observed change score",
                      value: `${report.riskScore}/100`,
                      hint: "Observational",
                    },
                    { label: "Critical", value: String(report.summary.critical) },
                    { label: "High", value: String(report.summary.high) },
                    { label: "Medium", value: String(report.summary.medium) },
                    {
                      label: "Proven new CPI targets",
                      value: String(report.summary.newCpiTargets),
                    },
                    {
                      label: "SBF insn deltas (A/R/R)",
                      value: String(report.summary.instructionsChanged),
                      hint: "Binary evidence, not vulns",
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {activeSection === "findings" && (
            <div className="audit-panel-scroll">
              {displayFindings.length === 0 ? (
                <div className="audit-empty-section">
                  <h3>No findings detected</h3>
                  <p>
                    No findings were returned by the analyzer for this version comparison.
                  </p>
                </div>
              ) : (
                <FindingsList
                  findings={displayFindings}
                  expandedId={expandedFinding}
                  onExpand={setExpandedFinding}
                />
              )}
            </div>
          )}

          {activeSection === "sections" && (
            <div className="audit-panel-scroll">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="report-mono">.text</td>
                    <td>
                      <span
                        className={
                          textStatus.tone === "changed" ? "status-changed" : "status-ok"
                        }
                      >
                        {textStatus.label}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="report-mono">.rodata</td>
                    <td>
                      <span
                        className={
                          rodataStatus.tone === "changed" ? "status-changed" : "status-ok"
                        }
                      >
                        {rodataStatus.label}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Program size</td>
                    <td>
                      <span
                        className={
                          textStatus.tone === "changed" ? "status-changed" : "status-ok"
                        }
                      >
                        {textStatus.tone === "changed" ? "Changed" : "Same"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>ELF header</td>
                    <td>
                      <span className="status-ok">Unchanged</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "bytecode" && (
            <div className="audit-panel-scroll">
              <p className="audit-muted compact" style={{ marginBottom: 12 }}>
                Raw byte diffs are evidence of binary difference. They do not by themselves prove
                semantic behavior change. If a header notes “showing first N”, only a preview is
                rendered — not the full change set.
              </p>
              <DiffViewer lines={report.instructionDiff} title=".text section" compact />
              <div style={{ height: 14 }} />
              <DiffViewer lines={report.accountDiff} title=".rodata section" compact />
            </div>
          )}

          {activeSection === "blast" && (
            <div className="audit-panel-scroll audit-panel-blast">
              <div className="audit-heuristic-callout">
                <HeuristicBadge>Synthetic</HeuristicBadge>
                <div>
                  <strong>Synthetic blast-radius visualization</strong>
                  <p>
                    Inferred from sampled byte patterns and report structure. Not an on-chain
                    dependency graph. Edges are not proven CPI / PDA relationships.
                  </p>
                </div>
              </div>
              <BlastRadius nodes={report.blastNodes} edges={report.blastEdges} compact />
            </div>
          )}

          {activeSection === "reconstruction" && (
            <div className="audit-panel-scroll">
              <div className="audit-recon-pipeline" aria-label="Reconstruction pipeline">
                {[
                  "Historical upgrade",
                  "Program buffer",
                  "Buffer writes",
                  "Write replay",
                  "Reconstructed ELF",
                  "SHA-256 + diff",
                ].map((step, i, arr) => (
                  <div key={step} className="audit-recon-step">
                    <span className="audit-recon-dot" aria-hidden />
                    <span>{step}</span>
                    {i < arr.length - 1 && <span className="audit-recon-arrow" aria-hidden>↓</span>}
                  </div>
                ))}
              </div>

              <StatGrid
                items={[
                  { label: "Method", value: method },
                  { label: "Writes (Version A)", value: writesA },
                  { label: "Writes (Version B)", value: writesB },
                  { label: "Elapsed", value: elapsed },
                  {
                    label: "Coverage A/B",
                    value: `${coverageA ?? "?"} / ${coverageB ?? "?"}`,
                  },
                  { label: "Verified build", value: "Not claimed" },
                ]}
              />

              <div className="audit-coverage-row">
                <CoveragePill
                  label="Version A"
                  complete={coverageA}
                />
                <CoveragePill
                  label="Version B"
                  complete={coverageB}
                />
              </div>

              {context?.limitations && context.limitations.length > 0 && (
                <div className="audit-limitations">
                  <h4 className="audit-version-heading">Method &amp; limitations</h4>
                  <p className="audit-muted compact" style={{ marginBottom: 10 }}>
                    Engineering transparency — caveats from this analysis run.
                  </p>
                  <ul>
                    {context.limitations.map((lim) => (
                      <li key={lim}>{lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeSection === "versions" && (
            <div className="audit-panel-scroll">
              <div className="audit-version-flow" aria-hidden>
                <span>Before</span>
                <span>→</span>
                <span>Reconstruction</span>
                <span>→</span>
                <span>After</span>
              </div>
              <div className="audit-version-grid">
                <ProvenanceColumn
                  title="Version A — before"
                  fallbackSig={context?.prevUpgradeSignature}
                  fallbackSlot={context?.prevUpgradeSlot ?? report.fromSlot}
                  provenance={context?.versionA}
                />
                <ProvenanceColumn
                  title="Version B — after"
                  fallbackSig={context?.upgradeSignature}
                  fallbackSlot={context?.upgradeSlot ?? report.toSlot}
                  provenance={context?.versionB}
                />
              </div>
              <p className="audit-muted compact" style={{ marginTop: 16 }}>
                Completed {formatTimestamp(context?.analysisCompletedAt)}
                {context?.framework ? ` · framework heuristic: ${context.framework}` : ""}
              </p>
            </div>
          )}
        </div>

        <footer className="audit-playground-footer">
          <div className="audit-playground-footer-stats">
            <span>
              SBF insn deltas{" "}
              <strong>{report.summary.instructionsChanged}</strong>
            </span>
            <span>
              Pubkey candidates <strong>{report.summary.accountsAffected}</strong>
              <span className="audit-footer-note"> · not proven CPI</span>
            </span>
            <span>
              Synthetic blast nodes <strong>{syntheticBlastCount}</strong>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ChangeChip({
  label,
  value,
  tone,
  heuristic,
}: {
  label: string;
  value: string;
  tone: "changed" | "unchanged";
  heuristic?: boolean;
}) {
  return (
    <div className={`audit-change-chip tone-${tone}${heuristic ? " is-heuristic" : ""}`}>
      <span className="audit-change-chip-label">
        {label}
        {heuristic ? " · heuristic" : ""}
      </span>
      <span className="audit-change-chip-value report-mono">{value}</span>
    </div>
  );
}

function CoveragePill({
  label,
  complete,
}: {
  label: string;
  complete: boolean | undefined;
}) {
  const text =
    complete === true ? "Complete" : complete === false ? "Incomplete" : "Unknown";
  const cls =
    complete === true ? "is-complete" : complete === false ? "is-incomplete" : "is-unknown";
  return (
    <div className={`audit-coverage-pill ${cls}`}>
      <span>{label}</span>
      <strong>{text}</strong>
    </div>
  );
}

function ProvenanceColumn({
  title,
  fallbackSig,
  fallbackSlot,
  provenance,
}: {
  title: string;
  fallbackSig?: string;
  fallbackSlot: number;
  provenance?: ReportContext["versionA"];
}) {
  const sig = provenance?.upgradeSignature ?? fallbackSig;
  const slot = provenance?.upgradeSlot ?? fallbackSlot;
  return (
    <div className="audit-version-col shell-raised">
      <h4 className="audit-version-heading">{title}</h4>
      {sig ? <AddressField label="Upgrade signature" value={sig} kind="tx" /> : null}
      <div className="audit-version-meta">
        <span>Slot</span>
        <code className="report-mono">{slot.toLocaleString("en-US")}</code>
      </div>
      {provenance?.bufferAddress && (
        <AddressField label="Buffer" value={provenance.bufferAddress} />
      )}
      {provenance?.sha256 && (
        <div className="audit-version-meta stack">
          <span>SHA-256</span>
          <code className="report-mono audit-hash">{provenance.sha256}</code>
        </div>
      )}
      {provenance?.byteLength !== undefined && (
        <div className="audit-version-meta">
          <span>Size</span>
          <code className="report-mono">
            {provenance.byteLength.toLocaleString("en-US")} bytes
          </code>
        </div>
      )}
      {provenance?.coverageComplete !== undefined && (
        <div className="audit-version-meta">
          <span>Coverage</span>
          <code className="report-mono">
            {provenance.coverageComplete ? "complete" : "incomplete"}
          </code>
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="audit-summary-stat shell-inset">
      <div className="audit-summary-stat-label">{label}</div>
      <div
        className="audit-summary-stat-value"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function ObservedChangeMeter({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className="audit-risk-meter"
      title="Observed Change Score"
      aria-label={`Observed change score ${score} out of 100`}
    >
      <svg width="46" height="46" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="28"
          cy="28"
          r="22"
          fill="none"
          stroke="rgba(17,17,17,0.08)"
          strokeWidth="3"
        />
        <circle
          cx="28"
          cy="28"
          r="22"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="audit-risk-meter-label">
        <span style={{ color }}>{score}</span>
        <span>Obs.</span>
      </div>
    </div>
  );
}

function FindingsList({
  findings,
  expandedId,
  onExpand,
}: {
  findings: Finding[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
}) {
  return (
    <div className="audit-findings-compact">
      {findings.map((f) => {
        const p = presentFinding(f);
        const isExpanded = expandedId === f.id;
        const isNoChange = f.code === "NO_CHANGE";
        const isCandidate = f.code === "NEW_32_BYTE_PUBLIC_KEY_CANDIDATE";
        return (
          <div
            key={f.id}
            className={`audit-finding-row sev-${f.severity.toLowerCase()}${isExpanded ? " is-expanded" : ""}${isNoChange ? " tone-safe" : ""}`}
          >
            <button
              type="button"
              className="audit-finding-row-btn"
              aria-expanded={isExpanded}
              onClick={() => onExpand(isExpanded ? null : f.id)}
            >
              <span className="audit-finding-sev-rail" aria-hidden />
              <span className="audit-finding-row-icon" aria-hidden>
                {p.icon}
              </span>
              <span className="audit-finding-row-main">
                <span className="audit-finding-row-title">{p.title}</span>
                {isCandidate && (
                  <span className="audit-finding-candidate-note">
                    Candidate — not a proven CPI target
                  </span>
                )}
              </span>
              <SeverityBadge severity={severityLabel(f.severity)} />
            </button>
            {isExpanded && (
              <div className="audit-finding-row-body">
                <p>{f.description}</p>
                {(f.analyzer || f.confidence) && (
                  <div className="audit-finding-meta">
                    {f.analyzer ? (
                      <div>
                        <span>Analyzer</span>
                        <code className="report-mono">{f.analyzer}</code>
                      </div>
                    ) : null}
                    {f.confidence ? (
                      <div>
                        <span>Confidence</span>
                        <code className="report-mono">{f.confidence}</code>
                      </div>
                    ) : null}
                  </div>
                )}
                {f.evidence?.summary && (
                  <div className="audit-finding-evidence">
                    <div className="audit-finding-rec-label">Evidence</div>
                    <p>{f.evidence.summary}</p>
                  </div>
                )}
                {f.after && <AddressField label="Program / target" value={f.after} />}
                <div className="audit-finding-rec compact">
                  <div className="audit-finding-rec-label">Recommendation</div>
                  <p>{f.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import ReportPanel from "@/app/components/ReportPanel";
import type { DemoProgram } from "@/app/data/demos";
import {
  PROVEN_EXAMPLE,
  PROVEN_EXAMPLES,
} from "@/app/analyze/constants";
import {
  getMainnetPair,
  type MainnetUpgradePair,
} from "@/app/data/mainnet-pairs";
import {
  LOADING_STAGES_UI,
  type ProvenanceSummary,
  type ReportContext,
} from "@/app/lib/report-presenter";

const LOADING_STAGES = [...LOADING_STAGES_UI];

type UpgradeRow = {
  slot: number;
  signature: string;
  diffable?: boolean;
};

function parseSlot(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function ApplySearchParams({
  onApply,
}: {
  onApply: (pair: {
    pairId: string | null;
    programId: string;
    label: string;
    from: string;
    to: string;
    fromSlot: number | null;
    toSlot: number | null;
  }) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const pairId = searchParams.get("pair");
    const curated = getMainnetPair(pairId);

    const program =
      searchParams.get("program")?.trim() || curated?.programId || "";
    const label = searchParams.get("label")?.trim() || curated?.label || "";
    const from =
      searchParams.get("from")?.trim() || curated?.prevUpgradeSignature || "";
    const to = searchParams.get("to")?.trim() || curated?.upgradeSignature || "";
    const fromSlot =
      parseSlot(searchParams.get("fromSlot")) ?? curated?.prevUpgradeSlot ?? null;
    const toSlot =
      parseSlot(searchParams.get("toSlot")) ?? curated?.upgradeSlot ?? null;

    if (!program && !from && !to) return;

    onApply({
      pairId: curated?.id ?? pairId,
      programId: program,
      label,
      from,
      to,
      fromSlot,
      toSlot,
    });
    // Intentionally once on mount / when query string identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

export default function AnalyzePage() {
  const [programId, setProgramId] = useState("");
  const [label, setLabel] = useState("");
  const [prevUpgradeSignature, setPrevUpgradeSignature] = useState("");
  const [upgradeSignature, setUpgradeSignature] = useState("");
  const [prevUpgradeSlot, setPrevUpgradeSlot] = useState<number | null>(null);
  const [upgradeSlot, setUpgradeSlot] = useState<number | null>(null);
  const [upgrades, setUpgrades] = useState<UpgradeRow[]>([]);
  const [upgradesLoading, setUpgradesLoading] = useState(false);
  const [upgradesError, setUpgradesError] = useState<string | null>(null);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(LOADING_STAGES[0]);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [loadingStartedAt, setLoadingStartedAt] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [report, setReport] = useState<DemoProgram | null>(null);
  const [reportContext, setReportContext] = useState<ReportContext | undefined>();
  const [activePairId, setActivePairId] = useState<string | null>(null);

  const canDiff =
    Boolean(programId.trim()) &&
    Boolean(prevUpgradeSignature.trim()) &&
    Boolean(upgradeSignature.trim());

  const fillPair = (pair: MainnetUpgradePair, opts?: { useAlternateB?: boolean }) => {
    const toSig =
      opts?.useAlternateB && pair.alternateUpgradeSignature
        ? pair.alternateUpgradeSignature
        : pair.upgradeSignature;
    const toSlot =
      opts?.useAlternateB && pair.alternateUpgradeSlot != null
        ? pair.alternateUpgradeSlot
        : pair.upgradeSlot;

    setProgramId(pair.programId);
    setLabel(pair.label);
    setPrevUpgradeSignature(pair.prevUpgradeSignature);
    setUpgradeSignature(toSig);
    setPrevUpgradeSlot(pair.prevUpgradeSlot);
    setUpgradeSlot(toSlot);
    setSelectedA(pair.prevUpgradeSignature);
    setSelectedB(toSig);
    setActivePairId(pair.id);
    setError(null);
    setAnalysisError(null);
    setUpgrades([]);
    setUpgradesError(null);
  };

  const loadUpgradeHistory = async () => {
    setUpgradesError(null);
    setUpgrades([]);
    if (!programId.trim()) {
      setUpgradesError("Enter a Program ID first.");
      return;
    }
    setUpgradesLoading(true);
    try {
      const res = await fetch(
        `/api/upgrades?programId=${encodeURIComponent(programId.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load upgrades");
      const rows = (data.upgrades as UpgradeRow[]) ?? [];
      setUpgrades(rows);
      if (rows.length >= 2) {
        const newer = rows[0];
        const older = rows[1];
        setSelectedB(newer.signature);
        setSelectedA(older.signature);
        setUpgradeSignature(newer.signature);
        setPrevUpgradeSignature(older.signature);
        setUpgradeSlot(newer.slot);
        setPrevUpgradeSlot(older.slot);
      }
    } catch (err) {
      setUpgradesError(err instanceof Error ? err.message : "Upgrade history failed");
    } finally {
      setUpgradesLoading(false);
    }
  };

  const applySelection = (which: "A" | "B", signature: string) => {
    const row = upgrades.find((u) => u.signature === signature);
    if (which === "A") {
      setSelectedA(signature);
      setPrevUpgradeSignature(signature);
      setPrevUpgradeSlot(row?.slot ?? null);
    } else {
      setSelectedB(signature);
      setUpgradeSignature(signature);
      setUpgradeSlot(row?.slot ?? null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnalysisError(null);
    setReport(null);

    if (!programId.trim()) {
      setError("Program ID is required.");
      return;
    }
    if (!prevUpgradeSignature.trim()) {
      setError("Version A (before) upgrade signature is required.");
      return;
    }
    if (!upgradeSignature.trim()) {
      setError("Version B (after) upgrade signature is required.");
      return;
    }
    if (prevUpgradeSignature.trim() === upgradeSignature.trim()) {
      setError("Version A and Version B must be different upgrade transactions.");
      return;
    }

    const startedAt = Date.now();
    setLoading(true);
    setLoadingStartedAt(startedAt);
    setLoadingStageIndex(0);
    setLoadingStage(LOADING_STAGES[0]);

    let stageIdx = 0;
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, LOADING_STAGES.length - 2);
      setLoadingStageIndex(stageIdx);
      setLoadingStage(LOADING_STAGES[stageIdx]);
    }, 12000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);

    try {
      const res = await fetch("/api/diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          programId: programId.trim(),
          prevUpgradeSignature: prevUpgradeSignature.trim(),
          upgradeSignature: upgradeSignature.trim(),
          prevUpgradeSlot: prevUpgradeSlot ?? undefined,
          upgradeSlot: upgradeSlot ?? undefined,
          label: label.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      setLoadingStageIndex(LOADING_STAGES.length - 1);
      setLoadingStage(LOADING_STAGES[LOADING_STAGES.length - 1]);

      const prov = data.provenance as
        | {
            versionA?: ProvenanceSummary;
            versionB?: ProvenanceSummary;
            limitations?: string[];
            framework?: string;
          }
        | undefined;

      setReportContext({
        prevUpgradeSignature: prevUpgradeSignature.trim(),
        upgradeSignature: upgradeSignature.trim(),
        prevUpgradeSlot,
        upgradeSlot,
        analysisStartedAt: startedAt,
        analysisCompletedAt: Date.now(),
        versionA: prov?.versionA,
        versionB: prov?.versionB,
        limitations: prov?.limitations,
        framework: prov?.framework,
      });
      setAnalysisError(null);
      setReport(data.report);
    } catch (err) {
      setReport(null);
      if (err instanceof Error && err.name === "AbortError") {
        setAnalysisError(
          "Analysis timed out after 10 minutes. Try a smaller program or check RPC rate limits."
        );
      } else {
        setAnalysisError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      clearTimeout(timeout);
      clearInterval(stageTimer);
      setLoading(false);
      setLoadingStartedAt(undefined);
    }
  };

  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <ApplySearchParams
          onApply={({ pairId, programId: p, label: l, from, to, fromSlot, toSlot }) => {
            setProgramId(p);
            setLabel(l);
            setPrevUpgradeSignature(from);
            setUpgradeSignature(to);
            setPrevUpgradeSlot(fromSlot);
            setUpgradeSlot(toSlot);
            setSelectedA(from);
            setSelectedB(to);
            setActivePairId(pairId);
            setError(null);
            setAnalysisError(null);
          }}
        />
      </Suspense>
      <main style={{ paddingTop: 80, minHeight: "100vh", background: "var(--bg-base)" }}>
        <div className="container-wide" style={{ paddingBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <Link
              href="/"
              style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}
            >
              ← Back to home
            </Link>
            <h1
              style={{
                fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 400,
                marginTop: 16,
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Diff two on-chain versions
            </h1>
            <p
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                color: "var(--text-secondary)",
                fontSize: 15,
                maxWidth: 640,
                lineHeight: 1.6,
              }}
            >
              Load upgrade history for a program, select Version A and Version B, then reconstruct
              and compare bytecode. Artifacts are not marked verified unless independently proven.
            </p>
          </div>

          <div className="analyze-layout">
            <form onSubmit={handleSubmit} className="analyze-form">
              <div className="analyze-tip">
                <span className="analyze-tip-label">Tip</span>
                <p>
                  Prefer programs with distinct buffers per upgrade and complete Write history on
                  your RPC. Large binaries can take several minutes. Start with Token-2022 (~1.35
                  MB); use Kamino for stress; use the reused-buffer Token-2022 pair for adversarial
                  reconstruction.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Curated mainnet pairs</span>
                {PROVEN_EXAMPLES.map((pair) => {
                  const active = activePairId === pair.id;
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      className="analyze-example-btn"
                      onClick={() => fillPair(pair)}
                      style={
                        active
                          ? { borderColor: "var(--accent-border)", background: "var(--accent-soft)" }
                          : undefined
                      }
                    >
                      <span className="analyze-example-badge">
                        Case {pair.caseKey}
                        {pair.id === PROVEN_EXAMPLE.id ? " · start here" : ""}
                      </span>
                      <span className="analyze-example-title">{pair.label}</span>
                      <span className="analyze-example-sub report-mono">
                        slots {pair.prevUpgradeSlot.toLocaleString("en-US")} →{" "}
                        {pair.upgradeSlot.toLocaleString("en-US")} ·{" "}
                        {pair.programId.slice(0, 12)}…
                      </span>
                    </button>
                  );
                })}
              </div>

              <fieldset className="analyze-fieldset">
                <legend className="analyze-legend">Program</legend>
                <div>
                  <label style={labelStyle}>Program ID *</label>
                  <input
                    required
                    value={programId}
                    onChange={(e) => {
                      setProgramId(e.target.value);
                      setActivePairId(null);
                    }}
                    placeholder={PROVEN_EXAMPLE.programId}
                    style={inputStyle}
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Label (optional)</label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={PROVEN_EXAMPLE.label}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={loadUpgradeHistory}
                  disabled={upgradesLoading || !programId.trim()}
                  style={{ justifyContent: "center", marginTop: 8 }}
                >
                  {upgradesLoading ? "Loading history…" : "Load upgrade history"}
                </button>
                {upgradesError && <div className="analyze-form-error">{upgradesError}</div>}
                {upgrades.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <label style={labelStyle}>Upgrade history (newest first)</label>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "8px 0 0",
                        maxHeight: 180,
                        overflow: "auto",
                        border: "1px solid var(--border-strong)",
                        borderRadius: 8,
                      }}
                    >
                      {upgrades.map((u) => (
                        <li
                          key={u.signature}
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--border)",
                            fontSize: 12,
                            fontFamily: "var(--font-mono), monospace",
                          }}
                        >
                          slot {u.slot.toLocaleString("en-US")} · {u.signature.slice(0, 20)}…
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                      <div>
                        <label style={labelStyle}>Version A (older)</label>
                        <select
                          value={selectedA}
                          onChange={(e) => applySelection("A", e.target.value)}
                          style={inputStyle}
                        >
                          <option value="">Select older upgrade…</option>
                          {upgrades.map((u) => (
                            <option key={`a-${u.signature}`} value={u.signature}>
                              slot {u.slot} · {u.signature.slice(0, 16)}…
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Version B (newer)</label>
                        <select
                          value={selectedB}
                          onChange={(e) => applySelection("B", e.target.value)}
                          style={inputStyle}
                        >
                          <option value="">Select newer upgrade…</option>
                          {upgrades.map((u) => (
                            <option key={`b-${u.signature}`} value={u.signature}>
                              slot {u.slot} · {u.signature.slice(0, 16)}…
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>

              <fieldset className="analyze-fieldset">
                <legend className="analyze-legend">Version A — before</legend>
                <div>
                  <label style={labelStyle}>Upgrade transaction signature *</label>
                  <input
                    required
                    value={prevUpgradeSignature}
                    onChange={(e) => {
                      setPrevUpgradeSignature(e.target.value);
                      setSelectedA(e.target.value);
                      setPrevUpgradeSlot(null);
                      setActivePairId(null);
                    }}
                    placeholder="Older BPF Upgrade tx signature"
                    style={inputStyle}
                    spellCheck={false}
                  />
                  {prevUpgradeSlot !== null && (
                    <p style={hintStyle}>Slot {prevUpgradeSlot.toLocaleString("en-US")}</p>
                  )}
                </div>
              </fieldset>

              <fieldset className="analyze-fieldset">
                <legend className="analyze-legend">Version B — after</legend>
                <div>
                  <label style={labelStyle}>Upgrade transaction signature *</label>
                  <input
                    required
                    value={upgradeSignature}
                    onChange={(e) => {
                      setUpgradeSignature(e.target.value);
                      setSelectedB(e.target.value);
                      setUpgradeSlot(null);
                      setActivePairId(null);
                    }}
                    placeholder="Newer BPF Upgrade tx signature"
                    style={inputStyle}
                    spellCheck={false}
                  />
                  {upgradeSlot !== null && (
                    <p style={hintStyle}>Slot {upgradeSlot.toLocaleString("en-US")}</p>
                  )}
                </div>
              </fieldset>

              {error && <div className="analyze-form-error">{error}</div>}

              <p className="analyze-runtime-note">
                Reconstruction requires complete buffer Write history and a bounded deployment
                cycle. Results include full SHA-256 provenance — not verified-build attestation.
              </p>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !canDiff}
                style={{ justifyContent: "center" }}
              >
                {loading ? "Analyzing…" : "Run diff"}
              </button>
            </form>

            <ReportPanel
              report={report}
              loading={loading}
              loadingStage={loadingStage}
              loadingStageIndex={loadingStageIndex}
              loadingStartedAt={loadingStartedAt}
              error={analysisError}
              context={reportContext}
            />
          </div>
        </div>
      </main>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
  letterSpacing: "-0.01em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--bg-input)",
  color: "var(--text-primary)",
  fontSize: 13,
  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
  outline: "none",
};

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-muted)",
  marginTop: 6,
  lineHeight: 1.45,
};

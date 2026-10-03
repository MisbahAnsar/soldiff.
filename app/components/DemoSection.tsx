"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MAINNET_PAIRS,
  analyzeHrefForPair,
  type MainnetUpgradePair,
} from "../data/mainnet-pairs";

function shortSig(sig: string): string {
  return `${sig.slice(0, 8)}…${sig.slice(-6)}`;
}

function CaseBadge({ caseKey }: { caseKey: MainnetUpgradePair["caseKey"] }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "var(--accent)",
        background: "var(--accent-soft)",
        border: "1px solid var(--accent-border)",
        borderRadius: 6,
        padding: "2px 8px",
      }}
    >
      Case {caseKey}
    </span>
  );
}

export default function DemoSection() {
  const [selected, setSelected] = useState<MainnetUpgradePair>(MAINNET_PAIRS[0]);
  const [useWideB, setUseWideB] = useState(false);

  const href = analyzeHrefForPair(selected, {
    useAlternateB: useWideB && Boolean(selected.alternateUpgradeSignature),
  });

  const toSig =
    useWideB && selected.alternateUpgradeSignature
      ? selected.alternateUpgradeSignature
      : selected.upgradeSignature;
  const toSlot =
    useWideB && selected.alternateUpgradeSlot != null
      ? selected.alternateUpgradeSlot
      : selected.upgradeSlot;

  return (
    <section id="demo" style={{ padding: "96px 0 112px", position: "relative" }}>
      <div className="container-wide">
        <div style={{ marginBottom: 40, maxWidth: 720 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="eyebrow">01 / Mainnet pairs</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: "clamp(32px, 3.6vw, 48px)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.08,
              marginBottom: 16,
              color: "var(--text-primary)",
            }}
          >
            Run a real mainnet upgrade diff.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              color: "var(--text-secondary)",
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 580,
            }}
          >
            Five verified on-chain upgrade pairs (Token-2022 → Kamino stress → reused buffer).
            Open Analyze with the exact program ID and upgrade signatures — reports come from the
            live pipeline, not hand-written fixtures.
          </p>
        </div>

        <div className="demo-pairs-grid">
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 12,
              borderRadius: 14,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                padding: "4px 8px 8px",
                fontFamily: "var(--font-inter), Inter, sans-serif",
              }}
            >
              {MAINNET_PAIRS.length} curated pairs
            </div>
            {MAINNET_PAIRS.map((pair) => {
              const active = pair.id === selected.id;
              return (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => {
                    setSelected(pair);
                    setUseWideB(false);
                  }}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 10,
                    padding: "12px 12px",
                    border: active
                      ? "1px solid var(--accent-border)"
                      : "1px solid transparent",
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: "var(--text-primary)",
                    transition: "background 0.15s ease, border-color 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <CaseBadge caseKey={pair.caseKey} />
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 560,
                      letterSpacing: "-0.01em",
                      marginBottom: 4,
                    }}
                  >
                    {pair.label}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {pair.programId.slice(0, 8)}…{pair.programId.slice(-4)}
                  </div>
                </button>
              );
            })}
          </aside>

          <div
            style={{
              borderRadius: 16,
              border: "1px solid var(--border-strong)",
              background: "var(--bg-surface)",
              padding: "28px 28px 24px",
              minHeight: 360,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <CaseBadge caseKey={selected.caseKey} />
              <h3
                style={{
                  fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {selected.label}
              </h3>
            </div>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14.5,
                lineHeight: 1.65,
                marginBottom: 24,
                maxWidth: 640,
              }}
            >
              {selected.notes}
            </p>

            <dl
              style={{
                display: "grid",
                gap: 14,
                marginBottom: 28,
                fontSize: 13,
              }}
            >
              <div>
                <dt style={{ color: "var(--text-muted)", marginBottom: 4 }}>Program ID</dt>
                <dd className="mono" style={{ color: "var(--text-code)", wordBreak: "break-all" }}>
                  {selected.programId}
                </dd>
              </div>
              <div className="demo-slot-grid">
                <div>
                  <dt style={{ color: "var(--text-muted)", marginBottom: 4 }}>
                    Version A · slot {selected.prevUpgradeSlot.toLocaleString("en-US")}
                  </dt>
                  <dd className="mono" style={{ color: "var(--text-code)", wordBreak: "break-all" }}>
                    {selected.prevUpgradeSignature}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "var(--text-muted)", marginBottom: 4 }}>
                    Version B · slot {toSlot.toLocaleString("en-US")}
                    {useWideB && selected.alternateUpgradeSignature ? " (wider)" : ""}
                  </dt>
                  <dd className="mono" style={{ color: "var(--text-code)", wordBreak: "break-all" }}>
                    {toSig}
                  </dd>
                </div>
              </div>
            </dl>

            {selected.alternateUpgradeSignature && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={useWideB}
                  onChange={(e) => setUseWideB(e.target.checked)}
                />
                Use wider Version B ({shortSig(selected.alternateUpgradeSignature)}, slot{" "}
                {selected.alternateUpgradeSlot?.toLocaleString("en-US")})
              </label>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Link href={href} className="btn-primary" style={{ textDecoration: "none" }}>
                Open in Analyze
              </Link>
              <a
                href={selected.solscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                }}
              >
                View program on Solscan →
              </a>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

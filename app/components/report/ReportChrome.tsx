"use client";

import { useState, type ReactNode } from "react";

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={`report-chip-btn${copied ? " is-copied" : ""}`}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      onPointerDown={(e) => e.currentTarget.classList.add("is-pressed")}
      onPointerUp={(e) => e.currentTarget.classList.remove("is-pressed")}
      onPointerLeave={(e) => e.currentTarget.classList.remove("is-pressed")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard may be blocked; leave UI unchanged */
        }
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function ExplorerButton({
  value,
  kind = "account",
}: {
  value: string;
  kind?: "account" | "tx";
}) {
  const href =
    kind === "tx"
      ? `https://solscan.io/tx/${value}`
      : `https://solscan.io/account/${value}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="report-chip-btn"
      aria-label={`Open ${kind === "tx" ? "transaction" : "account"} in Solscan`}
    >
      Explorer
    </a>
  );
}

export function AddressField({
  label,
  value,
  kind = "account",
  reveal = false,
}: {
  label: string;
  value: string;
  kind?: "account" | "tx";
  /** When true, show full value (wrap). Default truncates for density. */
  reveal?: boolean;
}) {
  const short =
    !reveal && value.length > 24
      ? `${value.slice(0, 10)}…${value.slice(-8)}`
      : value;

  return (
    <div className="report-address-field">
      <div className="report-address-label">{label}</div>
      <div className="report-address-row">
        <code className="report-mono" title={value}>
          {short}
        </code>
        <div className="report-address-actions">
          <CopyButton value={value} label={label} />
          <ExplorerButton value={value} kind={kind} />
        </div>
      </div>
    </div>
  );
}

export function ReportCard({
  title,
  children,
  id,
  eyebrow,
}: {
  title?: string;
  children: ReactNode;
  id?: string;
  eyebrow?: string;
}) {
  return (
    <section className="report-card shell-raised" id={id}>
      {(eyebrow || title) && (
        <header className="report-card-head">
          {eyebrow && <div className="report-card-eyebrow">{eyebrow}</div>}
          {title && <h3 className="report-card-title">{title}</h3>}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatGrid({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="report-stat-grid">
      {items.map((item) => (
        <div key={item.label} className="report-stat shell-inset">
          <div className="report-stat-label">{item.label}</div>
          <div className="report-stat-value">{item.value}</div>
          {item.hint ? <div className="report-stat-hint">{item.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const cls = `report-sev report-sev-${severity.toLowerCase()}`;
  return <span className={cls}>{severity}</span>;
}

export function HeuristicBadge({ children = "Heuristic" }: { children?: string }) {
  return <span className="report-heuristic-badge">{children}</span>;
}

export function ProvenanceBadge({ children = "On-chain" }: { children?: string }) {
  return <span className="report-provenance-badge">{children}</span>;
}

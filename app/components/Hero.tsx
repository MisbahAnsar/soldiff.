"use client";

import Link from "next/link";
import { handleSectionNav } from "../lib/scrollToSection";

export default function Hero() {
  return (
    <section id="hero" className="hero-editorial">
      <div className="bg-grid hero-grid" aria-hidden />

      <div className="hero-editorial-inner">
        <p className="hero-kicker">On-chain program upgrade analysis</p>

        <p className="hero-brand">SolDiff</p>

        <h1 className="hero-headline">
          Understand what changed.
        </h1>

        <p className="hero-lead">
          Reconstruct historical Solana program versions from upgrade buffer writes,
          then compare the binaries with evidence-backed diffs — not marketing claims.
        </p>

        <div className="hero-actions">
          <Link href="/analyze" className="btn-primary">
            Analyze a Program
          </Link>
          <Link
            href="/"
            className="btn-secondary"
            onClick={(e) => handleSectionNav(e, "how-it-works")}
          >
            How it works
          </Link>
        </div>

        <div className="hero-diagram" aria-hidden>
          <div className="hero-diagram-col">
            <span className="hero-diagram-label">Version A</span>
            <span className="hero-diagram-mono">Before</span>
            <span className="hero-diagram-mono muted">Upgrade slot</span>
          </div>
          <div className="hero-diagram-flow">
            <span>Buffer writes</span>
            <span className="hero-diagram-arrow">→</span>
            <span>Replay</span>
            <span className="hero-diagram-arrow">→</span>
            <span>SHA-256</span>
            <span className="hero-diagram-arrow">→</span>
            <span>Diff</span>
          </div>
          <div className="hero-diagram-col">
            <span className="hero-diagram-label">Version B</span>
            <span className="hero-diagram-mono">After</span>
            <span className="hero-diagram-mono muted">Upgrade slot</span>
          </div>
        </div>
        <p className="hero-diagram-caption">
          Illustrative reconstruction flow — live reports use real on-chain signatures and hashes.
        </p>
      </div>
    </section>
  );
}

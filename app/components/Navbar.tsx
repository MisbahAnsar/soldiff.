"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { handleSectionNav } from "../lib/scrollToSection";
import SolDiffIcon from "./SolDiffIcon";

const NAV_LINKS = [
  { label: "Analyze", href: "/analyze" },
  { label: "How it works", sectionId: "how-it-works" },
  { label: "Pairs", sectionId: "demo" },
  { label: "Methodology", sectionId: "case-studies" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-nav-inner">
        <Link
          href="/"
          onClick={(e) => handleSectionNav(e, "hero")}
          className="site-nav-brand"
        >
          <SolDiffIcon size={22} />
          <span>SolDiff</span>
        </Link>

        <nav className="site-nav-links hide-md" aria-label="Main navigation">
          {NAV_LINKS.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className="site-nav-link">
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                href="/"
                className="site-nav-link"
                onClick={(e) => item.sectionId && handleSectionNav(e, item.sectionId)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <Link href="/analyze" className="site-nav-cta">
          Launch App →
        </Link>
      </div>
    </header>
  );
}

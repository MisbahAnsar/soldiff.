"use client";

export default function SolDiffIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="22" height="22" rx="6" fill="#111111" />
      <text
        x="14"
        y="18.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="11"
        fontWeight="700"
        fontFamily="var(--font-mono), monospace"
      >
        ∆
      </text>
    </svg>
  );
}

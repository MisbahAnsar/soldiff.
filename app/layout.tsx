import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import "./audit-report.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SolDiff — On-Chain Program Upgrade Analysis for Solana",
  description:
    "Reconstruct historical Solana program versions from on-chain upgrade buffer writes and compare binaries with evidence-backed diffs.",
  keywords: ["Solana", "program audit", "upgrade diff", "smart contract security", "BPF", "Anchor", "DAO governance"],
  openGraph: {
    title: "SolDiff — On-Chain Program Upgrade Analysis",
    description: "Understand what changed in any Solana program upgrade.",
    type: "website",
    url: "https://soldiff.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolDiff — On-Chain Program Upgrade Analysis",
    description: "Reconstruct and diff Solana program upgrades from on-chain data.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}

/**
 * Curated mainnet upgrade pairs for SolDiff setup / smoke tests.
 * All IDs, slots, and signatures are real on-chain facts — no fabricated findings.
 */

export type MainnetPairId =
  | "token-2022"
  | "jupiter-v6"
  | "meteora-dlmm"
  | "kamino-lend"
  | "token-2022-reused-buffer";

export interface MainnetUpgradePair {
  id: MainnetPairId;
  /** Short UI label */
  label: string;
  /** One-letter case key from the setup matrix (A–E) */
  caseKey: "A" | "B" | "C" | "D" | "E";
  programId: string;
  /** Version A — older upgrade */
  prevUpgradeSignature: string;
  prevUpgradeSlot: number;
  /** Version B — newer upgrade */
  upgradeSignature: string;
  upgradeSlot: number;
  /** Optional alternate newer upgrade for a wider B (when documented) */
  alternateUpgradeSignature?: string;
  alternateUpgradeSlot?: number;
  /** Factual notes only (size, buffer behavior, why this pair exists) */
  notes: string;
  solscanUrl: string;
}

function solscan(programId: string): string {
  return `https://solscan.io/account/${programId}`;
}

export const MAINNET_PAIRS: readonly MainnetUpgradePair[] = [
  {
    id: "token-2022",
    caseKey: "A",
    label: "Token-2022",
    programId: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    prevUpgradeSignature:
      "39CiabTipsmCxWLVsY9ciVBuY5FNHUr2FpF5x6shs42w6KFjx1J2nogMtJezwgNfyAxDgTexZwc3P1SEUMd2vhPP",
    prevUpgradeSlot: 346_170_941,
    upgradeSignature:
      "2cM3S25AJnHyy4shW7zsoqz5W8JPXPvXiUxk545n5ANf6BET9VvBRfsnSNYi9MqogjVWNBxNfaZpE9QBJX4XCbfn",
    upgradeSlot: 427_147_035,
    notes:
      "Lightest real pair (~1.35 MB). Distinct buffers: GcAbnM4D… (542 writes) → BsRtj52F… (629 writes). Both cycles verified clean. Non-Anchor — exercises historical IDL unavailable (never silently unchanged).",
    solscanUrl: solscan("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
  },
  {
    id: "jupiter-v6",
    caseKey: "B",
    label: "Jupiter Aggregator v6",
    programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    prevUpgradeSignature:
      "4XMQTzasmwN7DwREnYkRihjjGdmibA33ZtE29NFybgz5eqZU6E5xRANviUmcW3hRmCf4jUCooU71J47W6XJwxy7m",
    prevUpgradeSlot: 428_832_322,
    upgradeSignature:
      "46xB4XctKsUhiEehmNczJTcFGVqxgRxdV75RdinXSFWCyYq1riz5Cke5aagdgjN67YqTtSo6pmATKaAtLf6mpNNR",
    upgradeSlot: 433_056_714,
    alternateUpgradeSignature:
      "2WJSyc1DaeZ9auoM4JC8oirA4kmj7fhYDhfWzrGRSXVbDFELUMuHXDiX81XXXF4TP4ZZMHtmecLe5qBqaukxCoE",
    alternateUpgradeSlot: 437_349_164,
    notes:
      "Anchor IDL-diff path. ~2.8 MB, ~1,900 write txs per buffer, distinct buffer per upgrade. Use alternateUpgradeSignature for a wider B (slot 437,349,164).",
    solscanUrl: solscan("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
  },
  {
    id: "meteora-dlmm",
    caseKey: "C",
    label: "Meteora DLMM",
    programId: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
    prevUpgradeSignature:
      "zEUr4sCz8T6NPfW4T9QJzxHNKaLc8z1TdK1mf2dTvFErHPQdFQcDMn7VCjqS1oFyXXL1RKzDndALxDSuKBq1Cb4",
    prevUpgradeSlot: 419_829_239,
    upgradeSignature:
      "5Gf1jGz9qyERLPMKppaeFt64hHiJc8pV8HSEXK1FP28aG5ozjSvbKtiZn7u9covcQVDyqvnpy7paXCN32T6LT3s6",
    upgradeSlot: 423_977_638,
    notes: "Second Anchor IDL-diff case.",
    solscanUrl: solscan("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"),
  },
  {
    id: "kamino-lend",
    caseKey: "D",
    label: "Kamino Lend",
    programId: "KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD",
    prevUpgradeSignature:
      "4mVFW8YSrFcxxGYmwceyRZGvYGkMiXd1ZSTN7vwd2bthrY3qz2E8FoVUBL4bPUuokFmnQCouDtvXsbxDTKaBhXDS",
    prevUpgradeSlot: 419_212_537,
    upgradeSignature:
      "WkzUHqZgSsTC9nFJL3mm1TgxCqJDtbovUZedoMHf7hGpZeTAQpasWomoFhk5zhgE8WLfsHpDcKA6mmFLmftSjk4",
    upgradeSlot: 422_723_185,
    notes:
      "Stress / performance (~2,500 writes per buffer, 10,240 KB binary — max program size). Upgrades via Squads multisig (SQDS4ep65T…). Use to surface timeouts and memory blowups.",
    solscanUrl: solscan("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD"),
  },
  {
    id: "token-2022-reused-buffer",
    caseKey: "E",
    label: "Token-2022 (reused buffer)",
    programId: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    prevUpgradeSignature:
      "64zh76dV7QZ6aK7ZRHKXsmaDTKt1Cdc5gFjcCToV9b4TqEmqRdesRZkFTcspXxqwsK5Ao4hq4JaqfdUMXxcEKY2j",
    prevUpgradeSlot: 339_066_954,
    upgradeSignature:
      "RJynTPg7Rm3ByayW7o3mSGW4KPvikcrHTwiQCVDXskTMTqTZQUZTAD6dWfF6SAR7cnJDfPkuYcHHWi9uPUvkh9t",
    upgradeSlot: 395_047_597,
    notes:
      "Adversarial reused-buffer case — most important reconstruction stress. Same program as case A, different upgrade pair.",
    solscanUrl: solscan("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
  },
] as const;

/** Default / lightest pair — start here for smoke tests. */
export const DEFAULT_MAINNET_PAIR = MAINNET_PAIRS[0];

export function getMainnetPair(id: string | null | undefined): MainnetUpgradePair | undefined {
  if (!id) return undefined;
  return MAINNET_PAIRS.find((p) => p.id === id);
}

/** Build `/analyze` query string for a curated pair. */
export function analyzeHrefForPair(
  pair: MainnetUpgradePair,
  opts?: { useAlternateB?: boolean }
): string {
  const params = new URLSearchParams({
    pair: pair.id,
    program: pair.programId,
    label: pair.label,
    from: pair.prevUpgradeSignature,
    fromSlot: String(pair.prevUpgradeSlot),
  });

  if (opts?.useAlternateB && pair.alternateUpgradeSignature) {
    params.set("to", pair.alternateUpgradeSignature);
    if (pair.alternateUpgradeSlot != null) {
      params.set("toSlot", String(pair.alternateUpgradeSlot));
    }
  } else {
    params.set("to", pair.upgradeSignature);
    params.set("toSlot", String(pair.upgradeSlot));
  }

  return `/analyze?${params.toString()}`;
}

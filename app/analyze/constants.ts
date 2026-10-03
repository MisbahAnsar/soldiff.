import {
  DEFAULT_MAINNET_PAIR,
  MAINNET_PAIRS,
  type MainnetUpgradePair,
} from "@/app/data/mainnet-pairs";

/**
 * One-click analyze examples — curated real mainnet upgrade pairs.
 * Default is Token-2022 (case A): lightest verified reconstructable pair.
 */
export const PROVEN_EXAMPLE = {
  id: DEFAULT_MAINNET_PAIR.id,
  label: DEFAULT_MAINNET_PAIR.label,
  programId: DEFAULT_MAINNET_PAIR.programId,
  solscanUrl: DEFAULT_MAINNET_PAIR.solscanUrl,
  prevUpgradeSignature: DEFAULT_MAINNET_PAIR.prevUpgradeSignature,
  prevUpgradeSlot: DEFAULT_MAINNET_PAIR.prevUpgradeSlot,
  upgradeSignature: DEFAULT_MAINNET_PAIR.upgradeSignature,
  upgradeSlot: DEFAULT_MAINNET_PAIR.upgradeSlot,
  notes: DEFAULT_MAINNET_PAIR.notes,
} as const;

export const PROVEN_EXAMPLES: readonly MainnetUpgradePair[] = MAINNET_PAIRS;

export type { MainnetUpgradePair };

/**
 * Shared report / UI types for live pipeline output.
 * Static fabricated “demo findings” were removed — use MAINNET_PAIRS + /analyze.
 */

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface DiffLine {
  type: "added" | "removed" | "unchanged" | "context";
  lineA?: number;
  lineB?: number;
  content: string;
}

export interface Finding {
  id: string;
  severity: Severity;
  code: string;
  instruction: string;
  description: string;
  recommendation: string;
  before?: string;
  after?: string;
  /** Present on live pipeline findings. */
  analyzer?: string;
  confidence?: "high" | "medium" | "low" | "unknown";
  evidence?: {
    summary: string;
    details?: Record<string, unknown>;
    before?: unknown;
    after?: unknown;
    offsets?: number[];
    hashes?: Record<string, string>;
  };
  affectedVersions?: ("A" | "B")[];
}

export interface AccountNode {
  id: string;
  label: string;
  type: "pda" | "token" | "signer" | "program" | "external";
  changed: boolean;
  risk?: Severity;
  balance?: string;
}

export interface AccountEdge {
  from: string;
  to: string;
  label: string;
  type: "write" | "read" | "cpi" | "sign";
  isNew?: boolean;
  isRemoved?: boolean;
}

export interface DemoProgram {
  id: string;
  name: string;
  programId: string;
  fromSlot: number;
  toSlot: number;
  fromDate: string;
  toDate: string;
  description: string;
  riskScore: number;
  findings: Finding[];
  instructionDiff: DiffLine[];
  accountDiff: DiffLine[];
  blastNodes: AccountNode[];
  blastEdges: AccountEdge[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    instructionsChanged: number;
    accountsAffected: number;
    newCpiTargets: number;
  };
}

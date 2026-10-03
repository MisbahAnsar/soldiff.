# SolDiff

On-chain Solana program upgrade diff tool.

SolDiff reconstructs historical upgradeable-program ELF bytes from BPF Upgradeable Loader `Write` transactions, compares two versions with evidence-backed analyzers, and produces a report you can reproduce from signatures.

> Homepage playground links to **curated mainnet upgrade pairs** (Token-2022, Jupiter v6, Meteora DLMM, Kamino Lend, reused-buffer adversarial). Reports are produced by the live `/analyze` pipeline — not static fabricated findings.
>
> See [`report.md`](./report.md) for a published case study (Solayer endoAVS).

## What works today

- Parse BPF Upgradeable Loader `Upgrade` transactions
- Reconstruct uploaded ELFs from buffer `Write` history with:
  - deterministic write ordering
  - deployment-cycle isolation
  - coverage / overlap detection
  - ELF validation + full SHA-256 identity
- Raw `.text` / `.rodata` byte diff (always available)
- Sequence-aligned SBF **instruction-level** diff (ISA decode; optional external `sbpf` / `llvm-objdump`)
- Supplementary `.rodata` string context (byte regions are primary evidence)
- Optional Anchor IDL diff when IDLs can be historically matched (historical IDL otherwise marked **unavailable**)
- `/analyze` UI with upgrade-history selection via `/api/upgrades`
- Case-study CLI for reproducible runs

## What is not implemented yet

- Verified builds / `solana-verify`
- Full semantic decompilation or source-level diff
- Persistent shareable report database
- Auth, billing, alerts, governance integrations
- Guaranteed CPI / account-dependency proofs from sampled bytes
- Malicious-upgrade detection from binary churn alone

## Quick start

```bash
bun install
cp .env.example .env   # set SOLANA_RPC_URL or HELIUS_API_KEY
bun run dev
```

Open [http://localhost:3000/analyze](http://localhost:3000/analyze).

Default smoke pair (Token-2022):

```text
Program  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
From     39CiabTipsmCxWLVsY9ciVBuY5FNHUr2FpF5x6shs42w6KFjx1J2nogMtJezwgNfyAxDgTexZwc3P1SEUMd2vhPP
To       2cM3S25AJnHyy4shW7zsoqz5W8JPXPvXiUxk545n5ANf6BET9VvBRfsnSNYi9MqogjVWNBxNfaZpE9QBJX4XCbfn
```

All curated pairs live in [`app/data/mainnet-pairs.ts`](./app/data/mainnet-pairs.ts).

## Case study CLI

```bash
bun run case-study --program <PROGRAM_ID> --from <OLDER_UPGRADE_SIG> --to <NEWER_UPGRADE_SIG> --out /tmp/soldiff-out
```

Requires archival-capable RPC history for the buffer Write transactions.

To regenerate the repository-root Solayer report:

```bash
bun scripts/generate-root-report.ts
```

## Tests

```bash
bun test
```

## Environment

See `.env.example`:

- `SOLANA_RPC_URL` / `SOLANA_RPC_URL_2` or `HELIUS_API_KEY`
- Optional `SOLANA_REWIND_RPC_URL` for slot-mode historical ProgramData
- Optional `SOLDIFF_DISASSEMBLER=sbpf|llvm-objdump`

## License

MIT

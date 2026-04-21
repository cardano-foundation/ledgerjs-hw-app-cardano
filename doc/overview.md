# Codebase Overview

## Related repositories

- **This library** (`ledgerjs-cardano-shelley`) — JS/TS SDK for communicating with the Cardano Ledger app.
- **`../ledger-app-cardano`** — device-side Cardano app (C). The wire protocol implemented here is defined there.
- **`../cardano-hw-interop-lib`** — shared Cardano data types used in tests and parsing.

## Source layout (`src/`)

```
Ada.ts                   — public entry point; exports the Ada class
types/
  public.ts              — all types exported to library consumers
  internal.ts            — parsed/internal types used across src/
interactions/
  *.ts                   — top-level dispatchers (one per operation); route to v7 or v8
  common/
    ins.ts               — APDU instruction byte constants
    types.ts             — Interaction<T> generator type and SendParams
    witnessPaths.ts      — gatherWitnessPaths + uniquify (shared by v7 and v8 signTx)
  serialization/         — legacy shared serialization helpers (used by v7)
  v7/                    — v7 app interaction implementations (legacy; maintenance only)
  v8/
    commandBuilder.ts    — pure functions: domain objects → SendParams (APDU descriptors)
    commandSender.ts     — generator functions: sequences APDU exchanges
    *.ts                 — per-operation result parsers
    serialization/       — v8 binary serialization helpers
    common/apdu.ts       — v8 APDU encoding helpers
parsing/                 — input validation; all user input is validated here before use
errors/                  — error classes (InvalidData, DeviceVersionUnsupported, DeviceStatusError)
utils/                   — address encoding, BIP32 path parsing, binary helpers
```

## Communication pattern

Each operation is a generator function typed as `Interaction<T>`. It yields `SendParams` (APDU descriptor) and receives `Buffer` (device response). `Ada.ts` drives the generator loop using the Ledger transport, wrapping each yield in a transport send.

## v7 vs v8 interaction style

The codebase contains two interaction architectures. **v8 is the only active architecture; v7 is legacy maintenance.**

**v7** (`src/interactions/v7/`): supports app version 7, which runs only on the discontinued Ledger Nano S. As of 2026 the Nano S is no longer sold and Ledger no longer supports it. The v7 code path exists solely for users who have not yet upgraded their app to v8. It is a maintenance target only — monolithic per-operation files where staging, serialization, and response parsing are all inline (`signTx.ts` is ~1500 lines). Do not imitate for new work, and do not invest in refactoring it.

**v8** (`src/interactions/v8/`): supports all current devices and app versions. Split into three layers:

- `commandBuilder.ts` — pure: domain objects → APDU descriptors. No I/O.
- `commandSender.ts` — sequences the APDU exchange using builder output.
- per-operation files — interpret responses, collect results.

New work must follow the v8 layering. **Avoid touching v7 code.** If a bug fix or feature strictly requires a v7 change, make the smallest possible edit and nothing more — no refactoring, no structural improvements.

## Validation rule

All user-supplied input is validated in `src/parsing/` before reaching serialization or device communication. Validation failures throw `InvalidData` with an `InvalidDataReason` enum value — never a generic message or raw error.

## Public API boundary

`src/types/public.ts` and the `Ada` class methods are the public API. Do not change exported types or method signatures without explicit sign-off — this is a published library with downstream consumers.

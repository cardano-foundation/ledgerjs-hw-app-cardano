# ledgerjs-hw-app-cardano Development Guidelines

JS library for communication with Ledger hardware wallets running the Cardano app.

## Context

- **This library:** `src/Ada.ts` is the main entry point; see README.md for architecture overview.
- **Cardano Ledger app:** `../ledger-app-cardano` — the device-side counterpart.
- **Interop lib:** `../cardano-hw-interop-lib` — shared Cardano data types used in tests and parsing.

## Instructions for Coding Agent

### What to DO

- **Follow existing patterns:** Before adding new functionality, read the existing interaction/parsing/serialization files for the closest analog and mimic the structure.
- **Types:** Keep public types in `src/types/public.ts` and internal types in `src/types/internal.ts`. Do not leak internal types into the public API.
- **Validation:** All user input must be validated in `src/parsing/` before serialization or device communication.
- **Error reasons:** Add new `InvalidDataReason` enum values for new validation failures rather than using generic messages.
- **Test fixtures:** Add test fixtures in `test/integration/__fixtures__/` for new functionality. Tests are data-driven.
- **Use cheap fast model to gather context if possible (e.g. Haiku).**

### What NOT to DO

- **Do NOT perform git write operations.** Read-only commands like `git diff` are fine.
- **Do NOT install anything.**
- **Do NOT change the public API** (exported types and `Ada` class methods) without explicit confirmation — this is a published library with downstream consumers.
- **Do NOT add dependencies** without explicit confirmation.

## Testing

- `yarn test-unit` — unit tests (fast, no device needed)
- `yarn test-integration` — integration tests against a real Ledger device
- `yarn test-speculos` — starts Speculos automatically and runs integration tests against it
- `yarn test-speculos --display` — same, but with the Speculos GUI visible
- `yarn test-speculos --grep <pattern>` — run only tests whose name matches the pattern (passed to mocha `--grep`)
- `APP_ELF=/path/to/app.elf yarn test-speculos` — override the default elf path
- `yarn test-speculos --display --grep <pattern>` — combine flags freely; `--display` is consumed by the script, all other flags are forwarded to mocha
- `yarn lint` — ESLint + Prettier checks (treat warnings as failures)
- `yarn build` — compile TypeScript to `dist/`

Run unit tests after any change to parsing or serialization logic. Integration/Speculos tests require a connected device or running emulator.

### Speculos setup

`yarn test-speculos` uses Speculos from the sibling repo `../ledger-app-cardano`. The default `app.elf` path is `../ledger-app-cardano/build/stax/bin/app.elf`. Speculos is picked up from `../ledger-app-cardano/tests/venv` automatically — set up that venv once following `doc/testing.md` in that repo:

> **App version matters for automated testing:**
>
> - **App v7 and earlier:** A debug/developer build compiled with headless mode enabled auto-confirms all prompts without button presses, making fully automated testing possible. Use such a build with `yarn test-speculos`. The `--display headless` flag passed to speculos only hides the GUI window — it does **not** enable auto-confirmation; that is a compile-time property of the elf.
> - **App v8 and later:** Headless auto-confirmation mode was removed. Fully automated Speculos testing is not yet solved for v8 — this is an open problem.

```bash
cd ../ledger-app-cardano
python3 -m venv tests/venv
source tests/venv/bin/activate
pip install -r tests/requirements.txt
```

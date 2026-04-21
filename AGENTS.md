# ledgerjs-hw-app-cardano — Agent Guidelines

JS library for communication with Ledger hardware wallets running the Cardano app.

Terminology: this repository is `ledgerjs`, not the Ledger SDK. In this codebase,
"SDK" should refer only to Ledger's underlying app/library terminology when
that distinction is necessary.

See [`doc/overview.md`](doc/overview.md) for codebase architecture and [`doc/testing.md`](doc/testing.md) for how to run tests.

## Tooling setup

**MANDATORY: run these two commands before EVERY yarn invocation, without exception.**

```sh
nvm use         # switches to Node 22 per .nvmrc
corepack enable # enables the yarn version declared in package.json
```

Do NOT skip this step. Do NOT assume the environment is already set up. Do NOT run
any `yarn` command without running these first. Skipping them silently uses the wrong
Node or yarn version and produces misleading results.

## Workflow

### What to DO

- **Follow existing patterns:** Before adding new functionality, read the existing interaction/parsing/serialization files for the closest analog and mimic the structure. New interactions must follow the v8 layering. v7 (`src/interactions/v7/`) is legacy code for an old app version on discontinued Nano S hardware — avoid touching it. If a change to v7 is strictly necessary, make the smallest possible edit and nothing more. See [`doc/overview.md`](doc/overview.md) for details.
- **Types:** Keep public types in `src/types/public.ts` and internal types in `src/types/internal.ts`. Do not leak internal types into the public API.
- **Validation:** All user input must be validated in `src/parsing/` before serialization or device communication.
- **Error reasons:** Add new `InvalidDataReason` enum values for new validation failures rather than using generic messages.
- **Test fixtures:** Add test fixtures in `test/integration/__fixtures__/` for new functionality. Tests are data-driven.
- **Use a cheap fast model to gather context if possible (e.g. Haiku).**

### What NOT to DO

- **Do NOT perform git write operations.** Read-only commands like `git diff` are fine.
- **Do NOT install anything.**
- **Do NOT use web search.** Work only with the local repository, sibling repositories, and local tools/files.
- **Do NOT change the public API** (exported types and `Ada` class methods) without explicit confirmation — this is a published library with downstream consumers.
- **Do NOT add dependencies** without explicit confirmation.

## Testing

Run `yarn test-unit` after any change to parsing or serialization. See [`doc/testing.md`](doc/testing.md) for the full test reference.

Quick reference:

- `yarn test-unit` — unit tests, no device needed
- `yarn test-speculos` — integration tests against Speculos emulator
- `yarn lint` — ESLint + Prettier
- `yarn build` — compile TypeScript

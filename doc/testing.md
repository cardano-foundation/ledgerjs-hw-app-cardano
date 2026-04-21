# Testing

## Test suites

### Unit tests (`test/unit/`)

No device needed. Fast. Run after any change to parsing or serialization logic.

```bash
yarn test-unit
```

What they cover:

- `address.test.ts`, `parse.test.ts` — address encoding and parser utilities
- `txOptionsEncoding.test.ts` — transaction options encoding
- `v8/` — v8 APDU command builder and sender behavior, per-operation dispatch:
  - `commandBuilder.opcert.test.ts`, `commandSender.opcert.test.ts`
  - `signTx.test.ts`, `signTxAllElements.test.ts`
  - `signCVote.test.ts`, `signMessage.test.ts`, `deriveAddress.test.ts`
  - `credential.test.ts`, `dispatch.signOperationalCertificate.test.ts`

Unit test fixtures live in `test/unit/__fixtures__/`. The v8 fixtures (`test/unit/__fixtures__/v8/`) import shared transaction data from `test/integration/__fixtures__/` to avoid duplication.

### Integration tests (`test/integration/`)

Require a connected Ledger device or Speculos emulator. Test the full stack end-to-end against the real app.

```bash
yarn test-integration          # real device
yarn test-speculos             # Speculos emulator (started automatically)
yarn test-speculos --display   # same, with Speculos GUI visible
yarn test-speculos --grep signTx   # run only matching tests
APP_ELF=/path/to/app.elf yarn test-speculos   # override elf path
```

Integration fixtures live in `test/integration/__fixtures__/`. They are data-driven: each fixture file exports arrays of test cases with `tx`, `signingMode`, `expectedResult`, etc.

### Device self-test

Runs tests embedded in the device app itself. Requires a development build of the app.

```bash
yarn device-self-test
yarn device-self-test-speculos
```

## Speculos setup

`yarn test-speculos` uses Speculos from the sibling repo `../ledger-app-cardano`. The default elf is `../ledger-app-cardano/build/stax/bin/app.elf`. Set up the venv once:

```bash
cd ../ledger-app-cardano
python3 -m venv tests/venv
source tests/venv/bin/activate
pip install -r tests/requirements.txt
```

### App version and headless mode

- **App v7 and earlier:** A debug build compiled with headless mode enabled auto-confirms all prompts — fully automated testing is possible. Use such a build with `yarn test-speculos`. The `--display headless` flag only hides the GUI window; it does **not** enable auto-confirmation (that is a compile-time property of the elf).
- **App v8 and later:** Headless auto-confirmation was removed. Fully automated Speculos testing is not yet solved for v8.

## Lint and build

```bash
yarn lint     # ESLint + Prettier (treat warnings as failures)
yarn build    # compile TypeScript to dist/
```

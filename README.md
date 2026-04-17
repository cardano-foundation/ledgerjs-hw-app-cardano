![image](https://user-images.githubusercontent.com/837681/53001830-d7c8a600-342b-11e9-9038-e745cc91e543.png)

### @cardano-foundation/ledgerjs-hw-app-cardano

JS library for communication with Ledger Hardware Wallets running the [Cardano ADA Ledger Application](https://github.com/cardano-foundation/ledger-app-cardano).

Note: this project comes with both [Typescript](https://www.typescriptlang.org/) and [Flow](https://flow.org/) type definitions, but only the Typescript ones are checked for correctness.

See [`doc/overview.md`](doc/overview.md) for architecture and [`doc/testing.md`](doc/testing.md) for how to run tests.

### Example code

Example code interacting with `hw-app-cardano` is provided in `example-node` directory.
You can execute it with the `yarn run-example` command.

### Tooling

This repo uses Corepack with Yarn 4. If `yarn audit` does not work locally, use:

```bash
corepack yarn npm audit --all --no-deprecations --recursive
```

On Linux, `corepack yarn install` may require system packages for `node-hid`:

```bash
sudo apt-get update
sudo apt-get install -y libusb-1.0-0-dev libudev-dev
```

### Documentation

- you can build the docs by running `yarn gen-docs` and then navigate to docs_generated/index.html
- generated docs can also be found at (https://vacuumlabs.github.io/ledgerjs-cardano-shelley)
- [CHANGELOG](CHANGELOG.md)

![image](https://user-images.githubusercontent.com/837681/53001830-d7c8a600-342b-11e9-9038-e745cc91e543.png)

### @cardano-foundation/ledgerjs-hw-app-cardano

JS Library for communication with Ledger Hardware Wallets.
This library is compatible with the [Cardano ADA Ledger Application](https://github.com/cardano-foundation/ledger-app-cardano).

Note: this project comes with both [Typescript](https://www.typescriptlang.org/) and [Flow](https://flow.org/) type definitions, but only the Typescript ones are checked for correctness.

### Example code

Example code interacting with `hw-app-cardano` is provided in `example-node` directory.
You can execute it with the `yarn run-example` command.

### Tests

Automated tests are provided. There are two types of tests

1. `yarn test-integration`. Tests JS API and integration with the physical Ledger device.
    * `yarn test-speculos`. Runs the `test-integration` test against the Speculos emulator.

2. `yarn device-self-test`. Runs tests defined in the application code of the Ledger application, requires development build of the application.
    * `yarn device-self-test-speculos`. Runs `yarn device-self-test` on Speculos (useful because the full app in debug mode with self-tests does not fit on Nanos S).

Note that for these tests it is advisable to install the developer build of the Cardano app with _headless_ mode enabled unless you want to verify the UI flows, otherwise you will need a significant amount of time to manually confirm all prompts on the device.

#### Speculos

To run the Speculos emulator, you first need to install it. The [Speculos documentation](https://speculos.ledger.com/installation/build.html) should take you through the installation process.
After installing you can start the emulator with the correct seed:
``
speculos /path/to/your/ledger-app-cardano-shelley/bin/app.elf --seed "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --display headless
``
*Note: replace `/path/to/your/ledger-app-cardano-shelley/bin/app.elf` with a path to the `app.elf` file of the Cardano ledger app.*
This will start the emulator with a TCP server listening on port 9999 for APDU messages and a web interface running on port 5000 (http://localhost:5000) which can be used to interact with the app.
The `--display headless` option just hides any window UI.

### Documentation

- you can build the docs by running `yarn gen-docs` and then navigate to docs_generated/index.html
- generated docs can also be found at (https://vacuumlabs.github.io/ledgerjs-cardano-shelley)
- [CHANGELOG](CHANGELOG.md)

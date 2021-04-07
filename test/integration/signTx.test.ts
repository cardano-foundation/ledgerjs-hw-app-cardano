import { expect } from "chai";

import type Ada from "../../src/Ada";
import { TransactionSigningMode } from "../../src/Ada";
import { getAda } from "../test_utils";
import {
  testsAllegra,
  testsByron,
  testsCatalystRegistration,
  testsMary,
  testsShelleyOther,
  testsShelleyOutputs,
} from "./__fixtures__/signTx";

// ========================================   BYRON   ========================================



// Shelley transaction format, but includes legacy Byron addresses in outputs
describe("signTxOrdinaryByron", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  for (const { testname, tx, result: expected } of testsByron) {
    it(testname, async () => {
      const response = await ada.signTransaction({ tx, signingMode: TransactionSigningMode.ORDINARY_TRANSACTION })
      expect(response).to.deep.equal(expected);
    })
  }
});

// ========================================   SHELLEY   ========================================

describe("signTxOrdinaryShelley", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  for (const { testname, tx, result: expected } of testsShelleyOutputs) {
    it(testname, async () => {
      const response = await ada.signTransaction({ tx, signingMode: TransactionSigningMode.ORDINARY_TRANSACTION })
      expect(response).to.deep.equal(expected);
    })
  }

  for (const { testname, tx, result: expected } of testsShelleyOther) {
    it(testname, async () => {
      const response = await ada.signTransaction({ tx, signingMode: TransactionSigningMode.ORDINARY_TRANSACTION })
      expect(response).to.deep.equal(expected);
    })
  }
});

// ========================================   ALLEGRA   ========================================

// changes:
// ttl optional
// added validity_interval_start

describe("signTxOrdinaryAllegra", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  for (const { testname, tx, result: expected } of testsAllegra) {
    it(testname, async () => {
      const response = await ada.signTransaction({ tx, signingMode: TransactionSigningMode.ORDINARY_TRANSACTION })
      expect(response).to.deep.equal(expected);
    })
  }
});

// ========================================   MARY   ========================================

// changes:
// multiassets in outputs

describe("signTxOrdinaryMary", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  for (const { testname, tx, result: expected } of testsMary) {
    it(testname, async () => {
      const response = await ada.signTransaction({ tx, signingMode: TransactionSigningMode.ORDINARY_TRANSACTION })
      expect(response).to.deep.equal(expected);
    })
  }

  for (const { testname, tx, result: expected } of testsCatalystRegistration) {
    it(testname, async () => {
      const response = await ada.signTransaction({ tx, signingMode: TransactionSigningMode.ORDINARY_TRANSACTION })
      expect(response).to.deep.equal(expected);
    })
  }
});

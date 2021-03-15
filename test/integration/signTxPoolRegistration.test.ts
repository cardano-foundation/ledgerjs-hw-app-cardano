import chai, { expect } from "chai"
import chaiAsPromised from "chai-as-promised"

import type Ada from "../../src/Ada";
import type { Transaction } from "../../src/Ada";
import { InvalidDataReason } from "../../src/Ada";
import { getAda, Networks } from "../test_utils";
import {
  certificates,
  inputs,
  invalidCertificates,
  invalidPoolMetadataTestcases,
  outputs,
  poolRegistrationTestcases,
  withdrawals,
} from "./__fixtures__/signTxPoolRegistration";
chai.use(chaiAsPromised)

describe("signTxPoolRegistrationOK", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  for (const { testname, tx, result: expectedResult } of poolRegistrationTestcases) {
    it(testname, async () => {
      const response = await ada.signTransaction(tx);
      expect(response).to.deep.equal(expectedResult);
    })
  }
});

// ======================================== negative tests (tx should be rejected) ===============================

describe("signTxPoolRegistrationReject", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  const txBase: Omit<Transaction, 'certificates'> = {
    network: Networks.Mainnet,
    inputs: [inputs.utxo],
    outputs: [outputs.external],
    fee: 42,
    ttl: 10,
    withdrawals: [],
    metadataHashHex: null
  }

  for (const { testName, poolRegistrationCertificate, expectedReject } of invalidCertificates) {
    it(`Should reject ${testName}`, async () => {
      const promise = ada.signTransaction({
        ...txBase,
        certificates: [poolRegistrationCertificate],
      });
      await expect(promise).to.be.rejectedWith(expectedReject);
    });
  }

  for (const { testName, metadata, rejectReason } of invalidPoolMetadataTestcases) {
    it(`Should reject ${testName}`, async () => {
      const cert = {
        ...certificates.poolRegistrationDefault,
        params: {
          ...certificates.poolRegistrationDefault.params,
          metadata,
        },
      };

      const promise = ada.signTransaction({
        ...txBase,
        certificates: [cert as any],
      });
      await expect(promise).to.be.rejectedWith(rejectReason);
    });
  }


  it("Should reject pool registration with numerator bigger than denominator", async () => {
    const promise = ada.signTransaction({
      ...txBase,
      certificates: [certificates.poolRegistrationWrongMargin],
    });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.POOL_REGISTRATION_INVALID_MARGIN);
  });

  it("Should reject pool registration along with other certificates", async () => {
    const promise = ada.signTransaction({
      ...txBase,
      certificates: [
        certificates.poolRegistrationDefault,
        certificates.stakeDelegation,
      ]
    });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.CERTIFICATES_COMBINATION_FORBIDDEN);
  });

  it("Should reject pool registration along with a withdrawal", async () => {
    const promise = ada.signTransaction({
      ...txBase,
      certificates: [certificates.poolRegistrationDefault],
      withdrawals: [withdrawals.withdrawal0],
    });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.WITHDRAWALS_FORBIDDEN);
  });
});

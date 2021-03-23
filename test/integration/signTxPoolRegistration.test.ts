import chai, { expect } from "chai"
import chaiAsPromised from "chai-as-promised"

import type Ada from "../../src/Ada";
import type { Certificate, Transaction } from "../../src/Ada";
import { CertificateType, InvalidDataReason, TransactionSigningMode } from "../../src/Ada";
import { getAda, Networks } from "../test_utils";
import {
  certificates,
  defaultPoolRegistration,
  inputs,
  invalidCertificates,
  invalidPoolMetadataTestcases,
  invalidRelayTestcases,
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
      const response = await ada.signTransaction({ tx, signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER });
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
  }

  for (const { testName, poolRegistrationCertificate, expectedReject } of invalidCertificates) {
    it(`Should reject ${testName}`, async () => {
      const tx: Transaction = {
        ...txBase,
        certificates: [poolRegistrationCertificate],
      }
      const promise = ada.signTransaction({ tx, signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER });

      await expect(promise).to.be.rejectedWith(expectedReject);
    });
  }

  for (const { testName, metadata, rejectReason } of invalidPoolMetadataTestcases) {
    it(`Should reject ${testName}`, async () => {
      const cert: Certificate = {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
          ...defaultPoolRegistration,
          metadata,
        },
      };

      const tx: Transaction = {
        ...txBase,
        certificates: [cert],
      }
      const promise = ada.signTransaction({ tx, signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER });
      await expect(promise).to.be.rejectedWith(rejectReason);
    });
  }

  describe("Should reject pool registration with invalid relays", async () => {
    for (const { testname, relay, rejectReason } of invalidRelayTestcases) {
      it(testname, async () => {
        const cert: Certificate = {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: {
            ...defaultPoolRegistration,
            relays: [relay],
          }
        }

        const tx: Transaction = {
          ...txBase,
          certificates: [cert]
        }
        const promise = ada.signTransaction({ tx, signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER });
        await expect(promise).to.be.rejectedWith(rejectReason)
      })
    }
  });


  it("Should reject pool registration with numerator bigger than denominator", async () => {
    const tx: Transaction = {
      ...txBase,
      certificates: [certificates.poolRegistrationWrongMargin],
    }
    const promise = ada.signTransaction({ tx, signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.POOL_REGISTRATION_INVALID_MARGIN);
  });

  it("Should reject pool registration along with other certificates", async () => {
    const tx: Transaction = {
      ...txBase,
      certificates: [
        certificates.poolRegistrationDefault,
        certificates.stakeDelegation,
      ]
    }
    const promise = ada.signTransaction({ tx, signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED);
  });

  it("Should reject pool registration along with a withdrawal", async () => {
    const tx: Transaction = {
      ...txBase,
      certificates: [certificates.poolRegistrationDefault],
      withdrawals: [withdrawals.withdrawal0],
    }
    const promise = ada.signTransaction({ tx, signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.SIGN_MODE_POOL_OWNER__WITHDRAWALS_NOT_ALLOWED);
  });
});

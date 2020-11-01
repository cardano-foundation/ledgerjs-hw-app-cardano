import { expect } from "chai";
import { Assert, getAda, NetworkIds, ProtocolMagics} from "../test_utils";
import { getErrorDescription, TxErrors } from "../../../lib/Ada";
import { ERRORS } from "../direct/constants";
import { inputs, outputs, relays, poolMetadataVariations, sampleFeeStr, sampleTtlStr, certificates, withdrawals, results } from './__fixtures__/signTxPoolRegistration';


describe("signTxPoolRegistrationOK", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should correctly witness valid multiple mixed owners all relays pool registration", async () => {
    // txBody: a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad848400190bb84436e44b9af68400190bb84436e44b9b500178ff2483e3a2330a34c4a5e576c2078301190bb86d616161612e626262622e636f6d82026d616161612e626262632e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb
    const cert = certificates.poolRegistrationMixedOwnersAllRelays;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.allRelaysHashAndPathOwners);
  });

  it("Should correctly witness valid single path owner ipv4 relay pool registration", async () => {
    const cert = certificates.poolRegistrationDefault;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.poolRegistrationDefault);
  });

  it("Should correctly witness valid multiple mixed owners ipv4 relay pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwners;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.poolRegistrationMixedOwners);
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4, single host relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4SingleHostRelays;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.poolRegistrationMixedOwnersIpv4SingleHostRelays);
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4 ipv6 relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4Ipv6Relays;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.poolRegistrationMixedOwnersIpv4Ipv6Relays);
  });

  it("Should correctly witness valid single path owner no relays pool registration ", async () => {
    // Pool won't be listed in the topology, it will need to connect manually to known nodes
    const cert = certificates.poolRegistrationNoRelays;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.noRelaysSinglePathOwner);
  });

  it("Should correctly witness default registration with no metadata", async () => {
    // works as a private pool not visible in yoroi, daedalus, etc.
    const cert = certificates.poolRegistrationNoMetadata;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.noMetadata);
  });
});


// ======================================== negative tests (tx should be rejected) ===============================

describe("signTxPoolRegistrationReject", async () => {
  let ada = {};

  let checkThrows = async (f, errorMsg) => {
    Assert.assert(typeof f === "function", "the test is messed up");
    try {
      await f();
      throw new Error("should have thrown by now");
    } catch (error) {
      expect(error.message).to.have.string(errorMsg);
    }
  };

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should reject pool registration with multiple path owners", async () => {
    async function f() {
      const cert = certificates.poolRegistration2PathOwners;
      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        [cert],
        [],
        null
      );
    }

    const errMsg = TxErrors.CERTIFICATE_POOL_OWNERS_SINGLE_PATH;
    // after removing js validation, this should pass instead:
    // const errMsg = getErrorDescription(parseInt(ERRORS.INVALID_DATA));
    await checkThrows(f, errMsg);
  });

  it("Should reject pool registration with only hash owners", async () => {
    async function f() {
      const cert = certificates.poolRegistration2HashOwners;
      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        [cert],
        [],
        null
      );
    }

    await checkThrows(f, TxErrors.CERTIFICATE_POOL_OWNERS_SINGLE_PATH);
  });

  it("Should reject pool registration with no owners", async () => {
    async function f() {
      const cert = certificates.poolRegistrationNoOwners;
      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        [cert],
        [],
        null
      );
    }

    await checkThrows(f, TxErrors.CERTIFICATE_POOL_OWNERS_SINGLE_PATH);
  });

  it("Should reject pool registration with invalid metadata url", async () => {
    const invalidMetadataVariations = [
      poolMetadataVariations.poolMetadataUrlTooLong,
      poolMetadataVariations.poolMetadataInvalidUrl,
      poolMetadataVariations.poolMetadataMissingUrl
    ]

    for (const metadataVariant of invalidMetadataVariations) {
      async function f() {
        const cert = {
          ...certificates.poolRegistrationDefault,
          poolRegistrationParams: {
            ...certificates.poolRegistrationDefault.poolRegistrationParams,
            metadata: metadataVariant
          }
        }

        const response = await ada.signTransaction(
          NetworkIds.MAINNET,
          ProtocolMagics.MAINNET,
          [inputs.utxo],
          [
            outputs.external,
          ],
          sampleFeeStr,
          sampleTtlStr,
          [cert],
          [],
          null
        );
      }

      const errMsg = TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL;
      // for poolMetadataUrlTooLong, after removing js validation, this should pass instead:
      // const errMsg = getErrorDescription(parseInt(ERRORS.INVALID_DATA));
      await checkThrows(f, errMsg);
    }
  });

  it("Should reject pool registration with invalid metadata hash", async () => {
    const invalidMetadataVariations = [
      poolMetadataVariations.poolMetadataInvalidHexLength,
      poolMetadataVariations.poolMetadataMissingHash,
    ]

    for (const metadataVariant of invalidMetadataVariations) {
      async function f() {
        const cert = {
          ...certificates.poolRegistrationDefault,
          poolRegistrationParams: {
            ...certificates.poolRegistrationDefault.poolRegistrationParams,
            metadata: metadataVariant
          }
        }

        const response = await ada.signTransaction(
          NetworkIds.MAINNET,
          ProtocolMagics.MAINNET,
          [inputs.utxo],
          [
            outputs.external,
          ],
          sampleFeeStr,
          sampleTtlStr,
          [cert],
          [],
          null
        );
      }

      const errMsg = TxErrors.CERTIFICATE_POOL_METADATA_INVALID_HASH;
      // for poolMetadataUrlTooLong, after removing js validation, this should pass instead:
      // const errMsg = getErrorDescription(parseInt(ERRORS.INVALID_DATA));
      await checkThrows(f, errMsg);
    }
  });

  it("Should reject pool registration with invalid relay", async () => {
    const relayVariants = [
      relays.singleHostNameRelayMissingDns,
      relays.multiHostNameRelayMissingDns
    ]

    for (const relayVariant of relayVariants) {
      async function f() {
        const cert = {
          ...certificates.poolRegistrationDefault,
          poolRegistrationParams: {
            ...certificates.poolRegistrationDefault.poolRegistrationParams,
            relays: [relayVariant]
          }
        }
        const response = await ada.signTransaction(
          NetworkIds.MAINNET,
          ProtocolMagics.MAINNET,
          [inputs.utxo],
          [
            outputs.external,
          ],
          sampleFeeStr,
          sampleTtlStr,
          [cert],
          [],
          null
        );
      }

      await checkThrows(f, TxErrors.CERTIFICATE_POOL_RELAY_MISSING_DNS);
    }
  });

  it("Should reject pool registration with numerator bigger than denominator", async () => {
    async function f() {
      const cert = certificates.poolRegistrationWrongMargin;
      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        [cert],
        [],
        null
      );
    }

    await checkThrows(f, TxErrors.CERTIFICATE_POOL_INVALID_MARGIN);
  });

  it("Should reject pool registration along with other certificates", async () => {
    async function f() {
      const certs = [
        certificates.poolRegistrationDefault,
        certificates.stakeDelegation,
      ]
      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        certs,
        [],
        null
      );
    }

    await checkThrows(f, TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN);
  });

  it("Should reject pool registration along with a withdrawal", async () => {
    async function f() {
      const cert = certificates.poolRegistrationDefault;
      const withdrawal = withdrawals.withdrawal0
      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        [cert],
        [withdrawal],
        null
      );
    }

    const errMsg = TxErrors.WITHDRAWALS_FORBIDDEN;
    // after removing js validation, this should pass instead:
    // const errMsg = getErrorDescription(parseInt(ERRORS.INVALID_DATA));
    await checkThrows(f, errMsg);
  });
});

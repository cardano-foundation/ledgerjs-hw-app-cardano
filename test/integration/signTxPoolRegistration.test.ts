import chai, { expect } from "chai"
import chaiAsPromised from "chai-as-promised"

import type Ada from "../../src/Ada";
import { InvalidDataReason } from "../../src/Ada";
import { getAda, Networks } from "../test_utils";
import {
  certificates,
  inputs,
  invalidCertificates,
  invalidPoolMetadataTestcases,
  outputs,
  results,
  sampleFeeStr,
  sampleTtlStr,
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

  it("Should correctly witness valid multiple mixed owners all relays pool registration", async () => {
    // txBody: a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad848400190bb84436e44b9af68400190bb84436e44b9b500178ff2483e3a2330a34c4a5e576c2078301190bb86d616161612e626262622e636f6d82026d616161612e626262632e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb
    const cert = certificates.poolRegistrationMixedOwnersAllRelays;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(results.allRelaysHashAndPathOwners);
  });

  it("Should correctly witness valid single path owner ipv4 relay pool registration", async () => {
    const cert = certificates.poolRegistrationDefault;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(results.poolRegistrationDefault);
  });

  it("Should correctly witness valid multiple mixed owners ipv4 relay pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwners;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(results.poolRegistrationMixedOwners);
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4, single host relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4SingleHostRelays;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(
      results.poolRegistrationMixedOwnersIpv4SingleHostRelays
    );
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4 ipv6 relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4Ipv6Relays;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(
      results.poolRegistrationMixedOwnersIpv4Ipv6Relays
    );
  });

  it("Should correctly witness valid single path owner no relays pool registration ", async () => {
    // Pool won't be listed in the topology, it will need to connect manually to known nodes
    const cert = certificates.poolRegistrationNoRelays;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(results.noRelaysSinglePathOwner);
  });

  it("Should correctly witness pool registration with no metadata", async () => {
    // works as a private pool not visible in yoroi, daedalus, etc.
    const cert = certificates.poolRegistrationNoMetadata;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(results.noMetadata);
  });

  it("Should correctly witness pool registration without outputs", async () => {
    const cert = certificates.poolRegistrationMixedOwnersAllRelays;
    const response = await ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });
    expect(response).to.deep.equal(results.noOutputs);
  });
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

  for (const { testName, poolRegistrationCertificate, expectedReject } of invalidCertificates) {
    it(`Should reject ${testName}`, async () => {
      const promise = ada.signTransaction({
        network: Networks.Mainnet,
        inputs: [inputs.utxo],
        outputs: [outputs.external],
        fee: sampleFeeStr,
        ttl: sampleTtlStr,
        certificates: [poolRegistrationCertificate as any],
        withdrawals: [],
        metadataHashHex: null
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
        network: Networks.Mainnet,
        inputs: [inputs.utxo],
        outputs: [outputs.external],
        fee: sampleFeeStr,
        ttl: sampleTtlStr,
        certificates: [cert as any],
        withdrawals: [],
        metadataHashHex: null
      });
      await expect(promise).to.be.rejectedWith(rejectReason);
    });
  }


  it("Should reject pool registration with numerator bigger than denominator", async () => {
    const cert = certificates.poolRegistrationWrongMargin;
    const promise = ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [],
      metadataHashHex: null
    });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.POOL_REGISTRATION_INVALID_MARGIN);
  });

  it("Should reject pool registration along with other certificates", async () => {
    const certs = [
      certificates.poolRegistrationDefault,
      certificates.stakeDelegation,
    ];
    const promise = ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: certs as any,
      withdrawals: [],
      metadataHashHex: null
    });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.CERTIFICATES_COMBINATION_FORBIDDEN);
  });

  it("Should reject pool registration along with a withdrawal", async () => {
    const cert = certificates.poolRegistrationDefault;
    const withdrawal = withdrawals.withdrawal0;
    const promise = ada.signTransaction({
      network: Networks.Mainnet,
      inputs: [inputs.utxo],
      outputs: [outputs.external],
      fee: sampleFeeStr,
      ttl: sampleTtlStr,
      certificates: [cert as any],
      withdrawals: [withdrawal],
      metadataHashHex: null
    });

    await expect(promise).to.be.rejectedWith(InvalidDataReason.WITHDRAWALS_FORBIDDEN);
  });
});

import { expect } from "chai";

import type Ada from "../../src/Ada";
import { getAda, Networks } from "../test_utils";
import {
  certificates,
  inputs,
  outputs,
  resultsAllegra,
  resultsByron,
  resultsMary,
  resultsShelley,
  sampleBigIntStr,
  sampleFee,
  sampleMetadataHashHex,
  sampleTtl,
  sampleValidityIntervalStartStr,
  withdrawals,
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

  const byronBase = {
    inputs: [inputs.utxoByron],
    fee: sampleFee,
    ttl: sampleTtl,
    certificates: [],
    withdrawals: [],
    metadataHashHex: null
  }

  it("Should correctly sign tx without change address with Byron mainnet output", async () => {
    const response = await ada.signTransaction({
      ...byronBase,
      network: Networks.Mainnet,
      outputs: [outputs.externalByronMainnet],
    });
    expect(response).to.deep.equal(resultsByron.noChangeByronMainnet);
  });

  it("Should correctly sign tx without change address with Byron Daedalus mainnet output", async () => {
    const response = await ada.signTransaction({
      ...byronBase,
      network: Networks.Mainnet,
      outputs: [outputs.externalByronDaedalusMainnet],
    });
    expect(response).to.deep.equal(resultsByron.noChangeByronDaedalusMainnet);
  });

  it("Should correctly sign tx without change address with Byron testnet output", async () => {
    const response = await ada.signTransaction({
      ...byronBase,
      network: Networks.Testnet,
      outputs: [outputs.externalByronTestnet],
    });
    expect(response).to.deep.equal(resultsByron.noChangeByronTestnet);
  });
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

  const shelleyBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    outputs: [outputs.externalByronMainnet],
    fee: sampleFee,
    ttl: sampleTtl,
    certificates: [],
    withdrawals: [],
    metadataHashHex: null
  }

  it("Should correctly sign tx without outputs", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      outputs: [],
    });
    expect(response).to.deep.equal(resultsShelley.noOutputs);
  });

  it("Should correctly sign tx without change address", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      outputs: [outputs.externalShelley],
    });
    expect(response).to.deep.equal(resultsShelley.noChangeShelley);
  });

  it("Should correctly sign tx without change address with Shelley scripthash output", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      network: Networks.Testnet,
      outputs: [outputs.externalShelleyScripthash],
    });
    expect(response).to.deep.equal(resultsShelley.noChangeShelleyScripthash);
  });

  it("Should correctly sign tx with change base address with staking path", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingPath as any],
    });
    expect(response).to.deep.equal(resultsShelley.changeBaseWithStakingPath);
  });

  it("Should correctly sign tx with change base address with staking key hash", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingKeyHash as any],
    });
    expect(response).to.deep.equal(resultsShelley.changeBaseWithStakingKeyHash);
  });

  it("Should correctly sign tx with enterprise change address", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      outputs: [outputs.externalByronMainnet, outputs.internalEnterprise as any],
    });
    expect(response).to.deep.equal(resultsShelley.changeEnterprise);
  });

  it("Should correctly sign tx with pointer change address", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      outputs: [outputs.externalByronMainnet, outputs.internalPointer as any],
    });
    expect(response).to.deep.equal(resultsShelley.changePointer);
  });

  it("Should correctly sign tx with withdrawal", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      withdrawals: [withdrawals.withdrawal0],
    });
    expect(response).to.deep.equal(resultsShelley.withWithdrawal);
  });

  it("Should correctly sign tx with a stake registration certificate", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      certificates: [certificates.stakeRegistration],
    });
    expect(response).to.deep.equal(resultsShelley.withRegistrationCertificate);
  });

  it("Should correctly sign tx with a stake delegation certificate", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      certificates: [certificates.stakeDelegation],
    });
    expect(response).to.deep.equal(resultsShelley.withDelegationCertificate);
  });

  it("Should correctly sign tx with a stake deregistration certificate", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      certificates: [certificates.stakeDeregistration],
    });
    expect(response).to.deep.equal(
      resultsShelley.withDeregistrationCertificate
    );
  });

  it("Should correctly sign tx and filter out witnesses with duplicate paths", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      certificates: [certificates.stakeDeregistration, certificates.stakeDeregistration],
    });
    expect(response).to.deep.equal(resultsShelley.withDuplicateWitnessPaths);
  });

  it("Should correctly sign tx with nonempty metadata", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      metadataHashHex: sampleMetadataHashHex
    });
    expect(response).to.deep.equal(resultsShelley.withMetadata);
  });

  it("Should correctly sign tx with non-reasonable account and address", async () => {
    const response = await ada.signTransaction({
      ...shelleyBase,
      inputs: [inputs.utxoNonReasonable],
      outputs: [outputs.internalBaseWithStakingPathNonReasonable as any],
      metadataHashHex: sampleMetadataHashHex
    });
    expect(response).to.deep.equal(resultsShelley.nonReasonable);
  });
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

  const allegraBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    outputs: [outputs.externalShelley],
    fee: sampleFee,
    //ttl: null,
    certificates: [],
    withdrawals: [],
    metadataHashHex: null,
    //validityIntervalStart: null
  }

  it("Transaction with no ttl and no validity interval start", async () => {
    const response = await ada.signTransaction({
      ...allegraBase,
      ttl: null,
      validityIntervalStart: null
    });
    expect(response).to.deep.equal(resultsAllegra.noTtlNoValidityIntervalStart);
  });

  it("Transaction with no ttl, but with validity interval start", async () => {
    const response = await ada.signTransaction({
      ...allegraBase,
      ttl: null,
      validityIntervalStart: sampleValidityIntervalStartStr
    });
    expect(response).to.deep.equal(
      resultsAllegra.noTtlYesValidityIntervalStart
    );
  });
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

  const maryBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    //outputs: [outputs.multiassetOneToken, outputs.internalBaseWithStakingPath as any],
    fee: sampleFee,
    ttl: sampleTtl,
    certificates: [],
    withdrawals: [],
    metadataHashHex: null,
    validityIntervalStart: sampleValidityIntervalStartStr
  }

  it("Mary era transaction with a multiasset output", async () => {
    const response = await ada.signTransaction({
      ...maryBase,
      outputs: [outputs.multiassetOneToken, outputs.internalBaseWithStakingPath as any],
    });
    expect(response).to.deep.equal(resultsMary.multiassetOneToken);
  });

  it("Mary era transaction with a complex multiasset output", async () => {
    const response = await ada.signTransaction({
      ...maryBase,
      outputs: [outputs.multiassetManyTokens, outputs.internalBaseWithStakingPath as any],
    });
    expect(response).to.deep.equal(resultsMary.multiassetManyTokens);
  });

  it("Mary era transaction with big numbers", async () => {
    const response = await ada.signTransaction({
      ...maryBase,
      outputs: [outputs.multiassetBigNumber as any],
      fee: sampleBigIntStr,
      ttl: sampleBigIntStr,
      validityIntervalStart: sampleBigIntStr
    });
    expect(response).to.deep.equal(resultsMary.bigNumbersEverywhere);
  });

  it("Mary era transaction with a multiasset change output", async () => {
    const response = await ada.signTransaction({
      ...maryBase,
      outputs: [outputs.externalShelley, outputs.multiassetChange as any],
    });
    expect(response).to.deep.equal(resultsMary.withMultiassetChange);
  });
});

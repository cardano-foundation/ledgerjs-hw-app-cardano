import { expect } from "chai";
import { getAda, str_to_path, NetworkIds, ProtocolMagics} from "../test_utils";
import { AddressTypeNibbles, utils } from "../../../lib/Ada";
import {
  inputs,
  outputs,
  sampleFeeStr,
  sampleTtlStr,
  sampleBigIntStr,
  certificates,
  withdrawals,
  sampleMetadataHashHex,
  sampleValidityIntervalStartStr,
  resultsByron,
  resultsShelley,
  resultsAllegra,
  resultsMary,
} from './__fixtures__/signTx.js';


// ========================================   BYRON   ========================================

// Shelley transaction format, but includes legacy Byron addresses in outputs
describe("signTxOrdinaryByron", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should correctly sign tx without change address with Byron mainnet output", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoByron],
      [
        outputs.externalByronMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsByron.noChangeByronMainnet);
  });

  it("Should correctly sign tx without change address with Byron Daedalus mainnet output", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoByron],
      [
        outputs.externalByronDaedalusMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsByron.noChangeByronDaedalusMainnet);
  });

  it("Should correctly sign tx without change address with Byron testnet output", async () => {
    const response = await ada.signTransaction(
      NetworkIds.TESTNET,
      ProtocolMagics.TESTNET,
      [inputs.utxoByron],
      [
        outputs.externalByronTestnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsByron.noChangeByronTestnet);
  });
});


// ========================================   SHELLEY   ========================================

describe("signTxOrdinaryShelley", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should correctly sign tx without outputs", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.noOutputs);
  });

  it("Should correctly sign tx without change address", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalShelley,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.noChangeShelley);
  });

  it("Should correctly sign tx without change address with Shelley scripthash output", async () => {
    const response = await ada.signTransaction(
      NetworkIds.TESTNET,
      ProtocolMagics.TESTNET,
      [inputs.utxoShelley],
      [
        outputs.externalShelleyScripthash,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.noChangeShelleyScripthash);
  });

  it("Should correctly sign tx with change base address with staking path", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
        outputs.internalBaseWithStakingPath,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.changeBaseWithStakingPath);
  });

  it("Should correctly sign tx with change base address with staking key hash", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
        outputs.internalBaseWithStakingKeyHash,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.changeBaseWithStakingKeyHash);
  });

  it("Should correctly sign tx with enterprise change address", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
        outputs.internalEnterprise,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.changeEnterprise);
  });

  it("Should correctly sign tx with pointer change address", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
        outputs.internalPointer,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.changePointer);
  });

  it("Should correctly sign tx with withdrawal", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [withdrawals.withdrawal0],
      null
    );
    expect(response).to.deep.equal(resultsShelley.withWithdrawal);
  });

  it("Should correctly sign tx with a stake registration certificate", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [certificates.stakeRegistration],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.withRegistrationCertificate);
  });

  it("Should correctly sign tx with a stake delegation certificate", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [certificates.stakeDelegation],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.withDelegationCertificate);
  });

  it("Should correctly sign tx with a stake deregistration certificate", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [certificates.stakeDeregistration],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.withDeregistrationCertificate);
  });

  it("Should correctly sign tx and filter out witnesses with duplicate paths", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [certificates.stakeDeregistration, certificates.stakeDeregistration],
      [],
      null
    );
    expect(response).to.deep.equal(resultsShelley.withDuplicateWitnessPaths);
  });

  it("Should correctly sign tx with nonempty metadata", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalByronMainnet,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      sampleMetadataHashHex
    );
    expect(response).to.deep.equal(resultsShelley.withMetadata);
  });

  it("Should correctly sign tx with non-reasonable account and address", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoNonReasonable],
      [
        outputs.internalBaseWithStakingPathNonReasonable,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      sampleMetadataHashHex
    );
    expect(response).to.deep.equal(resultsShelley.nonReasonable);
  });
});


// ========================================   ALLEGRA   ========================================

// changes:
// ttl optional
// added validity_interval_start

describe("signTxOrdinaryAllegra", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Transaction with no ttl and no validity interval start", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalShelley
      ],
      sampleFeeStr,
      null,
      [],
      [],
      null,
      null
    );
    expect(response).to.deep.equal(resultsAllegra.noTtlNoValidityIntervalStart);
  });

  it("Transaction with no ttl, but with validity interval start", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.externalShelley
      ],
      sampleFeeStr,
      null,
      [],
      [],
      null,
      sampleValidityIntervalStartStr
    );
    expect(response).to.deep.equal(resultsAllegra.noTtlYesValidityIntervalStart);
  });
});


// ========================================   MARY   ========================================

// changes:
// multiassets in outputs

describe("signTxOrdinaryMary", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Mary era transaction with a multiasset output", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.multiassetOneToken,
        outputs.internalBaseWithStakingPath
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null,
      sampleValidityIntervalStartStr
    );
    expect(response).to.deep.equal(resultsMary.multiassetOneToken);
  });

  it("Mary era transaction with a complex multiasset output", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.multiassetManyTokens,
        outputs.internalBaseWithStakingPath
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null,
      sampleValidityIntervalStartStr
    );
    expect(response).to.deep.equal(resultsMary.multiassetManyTokens);
  });

  it("Mary era transaction with big numbers", async () => {
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxoShelley],
      [
        outputs.multiassetBigNumber,
      ],
      sampleBigIntStr,
      sampleBigIntStr,
      [],
      [],
      null,
      sampleBigIntStr
    );
    expect(response).to.deep.equal(resultsMary.bigNumbersEverywhere);
  });
});

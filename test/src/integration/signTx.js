import { expect } from "chai";
import { getAda, str_to_path } from "../test_utils";

const inputs = {
  utxo0: {
    txHashHex: "1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc",
    outputIndex: 0,
    path: str_to_path("44'/1815'/0'/0/0")
  }
};

const outputs = {
  externalByron: {
    amountStr: "3003112",
    humanAddress:
      "Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2"
  },
  internalBaseNoStaking: {
    "addressType": 0,
    "spendingPath": "m/1852'/1815'/0'/0/0",
    "amount": "7120787",
  },
  internalBaseWithStakingKeyHash: {
      "addressType": 0,
      "spendingPath": "m/1852'/1815'/0'/0/0",
      "stakingKeyHash": "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
      "amount": "7120787",
  },
  internalBaseWithStakingPath: {
      "addressType": 0,
      "spendingPath": "m/1852'/1815'/0'/0/0",
      "stakingKeyPath": "m/1852'/1815'/0'",
      "amount": "7120787",
  },
  internalPointer: {
      "addressType": 1,
      "path": "m/1852'/1815'/0'/0/0",
      "pointer": {"block_index": 1, "tx_index": 2, "certificate_index": 3},
      "amount": "7120787",
  },
};

const sampleMetadata = "deadbeef";
const sampleFeeStr = "42";
const sampleTtlStr = "10";

const results = {
  noChange: {
    /*
    * txBody: a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63d
    * cfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2
    * e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a
    */
    txHashHex: "73e09bdebf98a9e0f17f86a2d11e0f14f4f8dae77cdf26ff1678e821f20c8db6",
    witnesses: [
      {
        path: str_to_path("44'/1815'/0'/0/0"),
        witnessSignatureHex:
          "248e6f443503febbaa46a71f2007b024bc6d64f4ecd8897c4827b39ca45802377ed19d" +
          "84a0565d50e681414748a884503a1aee224207878b0062aa179eeb4400"
      }
    ]
  },
  changeBaseNoStaking: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  changeBaseWithStakingPath: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  changeBaseWithStakingKeyHash: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  changePointer: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  withMetadata: {
    txHashHex: "TODO",
    witnesses: [
    ]
  }
};



describe("signTx", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should correctly sign tx without change address", async () => {
    const response = await ada.signTransaction(
      [inputs.utxo0],
      [
        outputs.externalByron,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(results.noChange);
  });
/*
  it("Should correctly sign tx with base change address without staking", async () => {
    const response = await ada.signTransaction(
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalBaseNoStaking,
      ],
      sampleFeeStr,
      sampleTtlStr,
      null
    );
    expect(response).to.deep.equal(results.changeBaseNoStaking);
  });

  it("Should correctly sign tx with change base address with staking path", async () => {
    const response = await ada.signTransaction(
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalBaseWithStakingPath,
      ],
      sampleFeeStr,
      sampleTtlStr,
      null
    );
    expect(response).to.deep.equal(resultWithChangeBaseWithStakingPath);
  });

  it("Should correctly sign tx with change base address with staking key hash", async () => {
    const response = await ada.signTransaction(
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalBaseWithStakingKeyHash,
      ],
      sampleFeeStr,
      sampleTtlStr,
      null
    );
    expect(response).to.deep.equal(resultWithChangeBaseWithStakingKeyHash);
  });

  it("Should correctly sign tx with pointer change address", async () => {
    const response = await ada.signTransaction(
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalPointer, // TODO fix failing change address in ledger app
      ],
      sampleFeeStr,
      sampleTtlStr,
      null
    );
    expect(response).to.deep.equal(resultChangeInternalPointer);
  });

  it("Should correctly sign tx with nonempty metadata", async () => {
    const response = await ada.signTransaction(
      [inputs.utxo0],
      [
        outputs.externalByron,
      ],
      sampleFeeStr,
      sampleTtlStr,
      sampleMetadata
    );
    expect(response).to.deep.equal(resultWithMetadata);
  });
*/
});

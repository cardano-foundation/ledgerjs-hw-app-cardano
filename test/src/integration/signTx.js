import { expect } from "chai";
import { getAda, str_to_path } from "../test_utils";
import { AddressTypeNibbles, utils } from "../../../lib/Ada";

const networkIds = {
  mainnet: 0x00
}

const protocolMagics = {
  mainnet: 764824073
}

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
    addressHex: utils.buf_to_hex(utils.base58_decode(
      "Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2"
    ))
  },
  internalBaseWithStakingKeyHash: {
    addressTypeNibble: AddressTypeNibbles.BASE,
    spendingPath: str_to_path("1852'/1815'/0'/0/0"),
    stakingKeyHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
    amountStr: "7120787"
  },
  internalBaseWithStakingPath: {
    addressTypeNibble: AddressTypeNibbles.BASE,
    spendingPath: str_to_path("1852'/1815'/0'/0/0"),
    stakingPath: str_to_path("1852'/1815'/0'/2/0"),
    amountStr: "7120787"
  },
  internalEnterprise: {
    addressTypeNibble: AddressTypeNibbles.ENTERPRISE,
    spendingPath: str_to_path("1852'/1815'/0'/0/0"),
    amountStr: "7120787"
  },
  internalPointer: {
    addressTypeNibble: AddressTypeNibbles.POINTER,
    spendingPath: str_to_path("1852'/1815'/0'/0/0"),
    stakingBlockchainPointer: {
      blockIndex: 1,
      txIndex: 2,
      certificateIndex: 3
    },
    amountStr: "7120787"
  }
};

const certificates = {
  stakeRegistration: {
    type: 0,
    path: str_to_path("1852'/1815'/0'/2/0")
  },
  stakeDeregistration: {
    type: 1,
    path: str_to_path("1852'/1815'/0'/2/0")
  },
  stakeDelegation: {
    type: 2,
    path: str_to_path("1852'/1815'/0'/2/0"),
    poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973"
  }
}

const withdrawals = {
  withdrawal0: {
    path: str_to_path("1852'/1815'/0'/2/0"),
    amountStr: "111"
  }
}

const sampleMetadata = "deadbeef".repeat(8);
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
  changeEnterprise: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  withWithdrawal: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  withRegistrationCertificate: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  withDelegationCertificate: {
    txHashHex: "TODO",
    witnesses: [
    ]
  },
  withDeregistrationCertificate: {
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
      networkIds.mainnet,
      protocolMagics.mainnet,
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

  it("Should correctly sign tx with change base address with staking path", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalBaseWithStakingPath,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(results.changeBaseWithStakingPath);
  });

  it("Should correctly sign tx with change base address with staking key hash", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalBaseWithStakingKeyHash,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(results.changeBaseWithStakingKeyHash);
  });

  it("Should correctly sign tx with enterprise change address", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalEnterprise,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(results.changeEnterprise);
  });

  it("Should correctly sign tx with pointer change address", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
        outputs.internalPointer, // TODO fix failing change address in ledger app
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      null
    );
    expect(response).to.deep.equal(results.changePointer);
  });

  it("Should correctly sign tx with withdrawal", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [withdrawals.withdrawal0],
      null
    );
    expect(response).to.deep.equal(results.noChange);
  });

  it("Should correctly sign tx with a stake registration certificate", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [certificates.stakeRegistration],
      [],
      null
    );
    expect(response).to.deep.equal(results.noChange);
  });

  it("Should correctly sign tx with a stake delegation certificate", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [certificates.stakeDelegation],
      [],
      null
    );
    expect(response).to.deep.equal(results.noChange);
  });


  it("Should correctly sign tx with a stake deregistration certificate", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [certificates.stakeDeregistration],
      [],
      null
    );
    expect(response).to.deep.equal(results.noChange);
  });

  it("Should correctly sign tx with nonempty metadata", async () => {
    const response = await ada.signTransaction(
      networkIds.mainnet,
      protocolMagics.mainnet,
      [inputs.utxo0],
      [
        outputs.externalByron,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [],
      [],
      sampleMetadata
    );
    expect(response).to.deep.equal(results.withMetadata);
  });
});

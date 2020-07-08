import { expect } from "chai";
import { getAda, str_to_path } from "../test_utils";

const inputs = {
  utxo0: {
    txHashHex: "01f54c866c778568c01b9e4c0a2cbab29e0af285623404e0ef922c6b63f9b222",
    outputIndex: 0,
    path: str_to_path("44'/1815'/0'/0/0")
  }
};

const outputs = {
  adalite: {
    amountStr: "700000",
    humanAddress:
      "DdzFFzCqrhsoarXqLakMBEiURCGPCUL7qRvPf2oGknKN2nNix5b9SQKj2YckgXZK" +
      "6q1Ym7BNLxgEX3RQFjS2C41xt54yJHeE1hhMUfSG"
  },
  ledgerChange: {
    amountStr: "100000",
    path: str_to_path("44'/1815'/0'/1/0")
  },
  ledgerChangeTooMuch: {
    amountStr: "1000000",
    path: str_to_path("44'/1815'/0'/1/0")
  }
};

const results = {
  txHashHex: "01f54c866c778568c01b9e4c0a2cbab29e0af285623404e0ef922c6b63f9b222",

  witnesses: [
    {
      path: str_to_path("44'/1815'/0'/0/0"),
      witnessSignatureHex:
        "f89f0d3e2ad34a29c36d9eebdceb951088b52d33638d0f55d49ba2f8baff6e29" +
        "056720be55fd2eb7198c05b424ce4308eaeed7195310e5879c41c1743245b000"
    }
  ]
};

describe("signTx", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should correctly sign Tx", async () => {
    const response = await ada.signTransaction(
      [inputs.utxo0],
      [outputs.adalite, outputs.ledgerChange],
      "0",
      "0",
    );
    expect(response).to.deep.equal(results);
  });
});

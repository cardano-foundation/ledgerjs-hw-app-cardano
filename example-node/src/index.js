import "babel-polyfill";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import AppAda, { utils, cardano } from "../../lib/Ada";

const makeExamples = appAda => ({
  getVersion: async () => {
    console.log("getVersion");
    console.log(await appAda.getVersion());
  },

  getExtendedPublicKey: async () => {
    console.log("getExtendedPublicKey");
    console.log(
      await appAda.getExtendedPublicKey([
        utils.HARDENED + 44,
        utils.HARDENED + 1815,
        utils.HARDENED + 0
      ])
    );
  },

  deriveAddress: async () => {
    console.log("deriveAddress");
    console.log(
      await appAda.deriveAddress(cardano.str_to_path("44'/1815'/0'/1/0"))
    );
  },

  showAddress: async () => {
    console.log("showAddress");
    console.log(
      await appAda.showAddress(cardano.str_to_path("44'/1815'/1000'/1/0"))
    );
  },

  signTransaction: async () => {
    console.log("signTransaction");
    const inputs = [
      {
        txDataHex:
          "839f8200d8185824825820918c11e1c041a0cb04baea651b9fb1bdef7ee5295f" +
          "032307e2e57d109de118b8008200d81858248258208f34e4f719effe82c28c8f" +
          "f45e426233651fc03686130cb7e1d4bc6de20e689c01ff9f8282d81858218358" +
          "1cb6f4b193e083530aca83ff03de4a60f4e7a6732b68b4fa6972f42c11a0001a" +
          "907ab5c71a000f42408282d818584283581cb5bacd405a2dcedce19899f8647a" +
          "8c4f45d84c06fb532c63f9479a40a101581e581c6b8487e9d22850b7539db255" +
          "e27dd48dc0a50c7994d678696be64f21001ac5000d871a03dc396fffa0",
        outputIndex: 0,
        path: cardano.str_to_path("44'/1815'/0'/0/0")
        // Details:
        // txHashHex:
        //    'd5c5c15054228da1f1a973ff36098658ce5147a989cf2c4a92c8a2a84686afc6',
        // amountStr: "1000000",
        // humanAddress:
        //      'Ae2tdPwUPEZF4a8fNdkUt8HSyyWgsq2DqP2AKGFKiF3SLsXNDuu6wYp15Dp'
      }
    ];

    const outputs = [
      {
        amountStr: "700000",
        humanAddress:
          "DdzFFzCqrhsoarXqLakMBEiURCGPCUL7qRvPf2oGknKN2nNix5b9SQKj2YckgXZK" +
          "6q1Ym7BNLxgEX3RQFjS2C41xt54yJHeE1hhMUfSG"
      },
      {
        amountStr: "100000",
        path: cardano.str_to_path("44'/1815'/0'/1/0")
        //humanAddress:
        //    'Ae2tdPwUPEZLrRBShqCSucUymQSfXHEx3EthwabAYSYLyG52i6QaXTDwNVL'
      }
    ];

    console.log(await appAda.signTransaction(inputs, outputs));
    /*
      {
        txHashHex: '01f54c866c778568c01b9e4c0a2cbab29e0af285623404e0ef922c6b63f9b222',
        witnesses: [
          {
            path: [Array],
            witnessHex: 'f89f0d3e2ad34a29c36d9eebdceb951088b52d33638d0f55d49ba2f8baff6e29056720be55fd2eb7198c05b424ce4308eaeed7195310e5879c41c1743245b000'
          }
        ]
      }
    */
  },

  runTests: async () => {
    console.log("runTests");
    console.log(await appAda.runTests());
  }
});

async function example() {
  console.log("Running ADA examples");
  const transport = await TransportNodeHid.create(5000);
  //transport.setDebugMode(true);
  const appAda = new AppAda(transport);

  const examples = makeExamples(appAda);

  await examples.getVersion();
  await examples.getExtendedPublicKey();
  await examples.deriveAddress();
  await examples.showAddress();
  await examples.signTransaction();
  await examples.runTests();
}

example();

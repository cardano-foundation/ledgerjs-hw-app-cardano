import "babel-polyfill";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import AppAda, { AddressTypeNibbles, utils, cardano } from "../../lib/Ada";

const makeExamples = appAda => ({
  getVersion: async () => {
    console.log("getVersion");
    console.log(await appAda.getVersion());
    console.log("-".repeat(40));
  },

  getExtendedPublicKey: async () => {
    console.log("getExtendedPublicKey");
    console.log(
      await appAda.getExtendedPublicKey([
        cardano.HARDENED + 44,
        cardano.HARDENED + 1815,
        cardano.HARDENED + 0
      ])
    );
    /*
      {
        publicKeyHex: '09353fce36f0b6eb8b8042d94289387af815dc2e31f6455cc0272adcb784358f',
        chainCodeHex: '7fec2640ed66eb3f6170ddef57a934298ad87cbeb233df243da1ecd9bd506762'
      }
    */
    console.log("-".repeat(40));
  },

  deriveAddress: async () => {
    console.log("deriveAddress");

    console.log("Legacy address")
    const responseLegacy = await appAda.deriveAddress(
      AddressTypeNibbles.BYRON,
      764824073, // mainnet protocol magic
      utils.str_to_path("44'/1815'/0'/1/0"),
      null
    );
    console.log(responseLegacy);
    console.log(utils.base58_encode(
      Buffer.from(responseLegacy.addressHex, "hex")
    ));
    /*
      {
        addressHex: '82d818582183581cf0fcec2c3cb9b16e10951aacab4a1e05d1b0418b61d9801544a24f1ba0001a1e5a48cf'
      }
      Ae2tdPwUPEZLrRBShqCSucUymQSfXHEx3EthwabAYSYLyG52i6QaXTDwNVL
    */
    console.log("-".repeat(40));

    console.log("Base address")
    const responseBase = await appAda.deriveAddress(
      AddressTypeNibbles.BASE,
      0x00, // testnet network id
      utils.str_to_path("1852'/1815'/0'/0/0"),
      utils.str_to_path("1852'/1815'/0'/2/0"),
    )

    console.log(responseBase);
    console.log(utils.bech32_encodeAddress(
      Buffer.from(responseBase.addressHex, "hex")
    ));
    /*
      {
        addressHex: '0014c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c'
      }
      addr_test1qq2vzmtlgvjrhkq50rngh8d482zj3l20kyrc6kx4ffl3zfqayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq2glhm4
    */
    console.log("-".repeat(40));
  },

  showAddress: async () => {
    console.log("showAddress");
    console.log("Legacy address")
    const responseLegacy = await appAda.showAddress(
      AddressTypeNibbles.BYRON,
      764824073, // mainnet protocol magic
      utils.str_to_path("44'/1815'/0'/1/0"),
      null
    );
    console.log(responseLegacy)
    /*
      returns undefined
    */
    console.log("-".repeat(40));

    console.log("Base address")
    const responseBase = await appAda.showAddress(
      AddressTypeNibbles.BASE,
      0x00, // testnet network id
      utils.str_to_path("1852'/1815'/0'/0/0"),
      utils.str_to_path("1852'/1815'/0'/2/0"),
    )
    console.log(responseBase)
    /*
      returns undefined
    */
    console.log("-".repeat(40));
  },

  signTransaction: async () => {
    console.log("signTransaction");
    
    console.log(await appAda.signTransaction(
      1, //networkId
      764824073, //protocolMagic
      [
        {
          path: [(44 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 1],
          txHashHex: "1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc",
          outputIndex: 0,
        }
      ], //inputs
      [
        {
          addressHex: "82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561",
          amountStr: "3003112",
        },
        {
          addressHex: "82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561",
          amountStr: "4700",
          tokenBundle: [
            {
              policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
              tokens: [
                {
                  assetNameHex: "7564247542686911",
                  amountStr: "47"
                }
              ]
            },
            {
              policyIdHex: "95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
              tokens: [
                {
                  assetNameHex: "456c204e69c3b16f",
                  amountStr: "7878754"
                },
                {
                  assetNameHex: "74652474436f696e", // "te$tCoin"
                  amountStr: "1234"
                }
              ]
            }
          ]
        },
        {
          addressTypeNibble: 0b0000,
          spendingPath: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 0],
          stakingPath: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
          amountStr: "7120787",
        }
      ], //outputs
      "42", //feeStr
      "10", //ttlStr
      [
        {
          type: 0,
          path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]
        },
        {
          type: 1,
          path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]
        },
        {
          type: 2,
          path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
          poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973"
        },
      ], //certificates
      [
        {
          path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
          amountStr: "1000",
        }
      ], //withdrawals
      "a200a11864a118c843aa00ff01a119012c590100a200a11864a1a200a11864a1", //metadataHashHex,
      "7", //validityIntervalStartStr
    ));
    /*
      {
        txHashHex: '30f6d278f7b5191364f7ae59ecf1db15db10d3efedcb367c5c34761793a653ee',
        witnesses: [
          {
            path: [Array],
            witnessSignatureHex: '078c05676f2183f7da9f69a23cadf0a34ba04fc5dacf000f40eaf13a1edcbf7591b8fcf56b75b9e157363c4be9cb1ba5d3f01a7713567ee223cffb6e2afda30c'
          },
          {
            path: [Array],
            witnessSignatureHex: '5b1439560ce51cd67cdb5922cbc7b42f8fa24f8009d7d9bd49af9206c46d8e32cba96639498e3064ab31b93b7cfa5506fdf167e1eedd298adaa580ae616f800d'
          }
        ]
      }
    */
    console.log("-".repeat(40));
  },

  runTests: async () => {
    console.log("runTests");
    console.log(await appAda.runTests());
    console.log("-".repeat(40));
  }
});

async function example() {
  console.log("Running ADA examples");
  const transport = await TransportNodeHid.create(5000);
  // transport.setDebugMode(true);
  const appAda = new AppAda(transport);

  const examples = makeExamples(appAda);

  await examples.getVersion();
  await examples.getExtendedPublicKey();
  await examples.deriveAddress();
  await examples.showAddress();
  await examples.signTransaction();

  // Ledger device app needs to be compiled with DEVEL flag
  // in order for the tests to run 
  await examples.runTests();
}

example();

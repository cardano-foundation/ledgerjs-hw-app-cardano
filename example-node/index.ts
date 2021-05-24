import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

import { Certificate, StakeCredentialParamsType, TxInput, TxOutput, Withdrawal } from "../src/Ada";
import { Ada, AddressType, CertificateType, HARDENED, Networks, TransactionSigningMode, TxOutputDestinationType } from "../src/Ada";
import { base58_encode, bech32_encodeAddress, str_to_path } from "../src/utils/address";

const getVersion = async (appAda: Ada) => {
  console.log("getVersion");
  console.log(await appAda.getVersion());
  console.log("-".repeat(40));
}

const getExtendedPublicKey = async (appAda: Ada) => {
  console.log("getExtendedPublicKey");
  console.log(
    await appAda.getExtendedPublicKey({
      path: [
        HARDENED + 44,
        HARDENED + 1815,
        HARDENED + 0,
      ]
    })
  );
  /*
    {
      publicKeyHex: '09353fce36f0b6eb8b8042d94289387af815dc2e31f6455cc0272adcb784358f',
      chainCodeHex: '7fec2640ed66eb3f6170ddef57a934298ad87cbeb233df243da1ecd9bd506762'
    }
  */
  console.log("-".repeat(40));
}

const deriveAddress = async (appAda: Ada) => {
  console.log("deriveAddress");

  console.log("Legacy address");
  const responseLegacy = await appAda.deriveAddress({
    network: Networks.Mainnet,
    address: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/0'/1/0")
      }
    }
  });
  console.log(responseLegacy);
  console.log(
    base58_encode(Buffer.from(responseLegacy.addressHex, "hex"))
  );
  /*
    {
      addressHex: '82d818582183581cf0fcec2c3cb9b16e10951aacab4a1e05d1b0418b61d9801544a24f1ba0001a1e5a48cf'
    }
    Ae2tdPwUPEZLrRBShqCSucUymQSfXHEx3EthwabAYSYLyG52i6QaXTDwNVL
  */
  console.log("-".repeat(40));

  console.log("Base address");
  const responseBase = await appAda.deriveAddress({
    network: Networks.Testnet,
    address: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/0"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0")
      }
    }
  })

  console.log(responseBase);
  console.log(
    bech32_encodeAddress(Buffer.from(responseBase.addressHex, "hex"))
  );
  /*
    {
      addressHex: '0014c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c'
    }
    addr_test1qq2vzmtlgvjrhkq50rngh8d482zj3l20kyrc6kx4ffl3zfqayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq2glhm4
  */
  console.log("-".repeat(40));
}

const showAddress = async (appAda: Ada) => {
  console.log("showAddress");
  console.log("Legacy address");
  const responseLegacy = await appAda.showAddress({
    network: Networks.Mainnet,
    address: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/0'/1/0"),
      }
    }
  })
  console.log(responseLegacy);
  /*
    returns undefined
  */
  console.log("-".repeat(40));

  console.log("Base address");
  const responseBase = await appAda.showAddress({
    network: Networks.Testnet,
    address: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/0"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0")
      }
    }
  })
  console.log(responseBase);
  /*
    returns undefined
  */
  console.log("-".repeat(40));
}

const signTransaction = async (appAda: Ada) => {
  console.log("signTransaction");

  const network = Networks.Mainnet
  const inputs: TxInput[] = [
    {

      txHashHex:
        "1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc",
      outputIndex: 0,
      path: [(44 + HARDENED), (1815 + HARDENED), (0 + HARDENED), 0, 1],
    },
  ]

  const outputs: TxOutput[] = [
    {
      destination: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex:
            "82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561",
        }
      },
      amount: "3003112",
    },
    {
      destination: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex:
            "82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561",
        }
      },
      amount: "4700",
      tokenBundle: [
        {
          policyIdHex:
            "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
          tokens: [
            {
              assetNameHex: "7564247542686911",
              amount: "47",
            },
          ],
        },
        {
          policyIdHex:
            "95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
          tokens: [
            {
              assetNameHex: "456c204e69c3b16f",
              amount: "7878754",
            },
            {
              assetNameHex: "74652474436f696e", // "te$tCoin"
              amount: "1234",
            },
          ],
        },
      ],
    },
    {
      destination: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
          type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
          params: {
            spendingPath: [(1852 + HARDENED), (1815 + HARDENED), (0 + HARDENED), 0, 0],
            stakingPath: [(1852 + HARDENED), (1815 + HARDENED), (0 + HARDENED), 2, 0],
          }
        }
      },
      amount: "7120787",
    },
  ]

  const certificates: Certificate[] = [
    {
      type: CertificateType.STAKE_REGISTRATION,
      params: {
        stakeCredential: {
          type: StakeCredentialParamsType.KEY_PATH,
          keyPath: [(1852 + HARDENED), (1815 + HARDENED), (0 + HARDENED), 2, 0],
        },
      }
    }, {
      type: CertificateType.STAKE_DELEGATION,
      params: {
        stakeCredential: {
          type: StakeCredentialParamsType.KEY_PATH,
          keyPath: [(1852 + HARDENED), (1815 + HARDENED), (0 + HARDENED), 2, 0],
        },
        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
      }
    }
  ]

  const withdrawals: Withdrawal[] = [
    {
      stakeCredential: {
        type: StakeCredentialParamsType.KEY_PATH,
        keyPath: [(1852 + HARDENED), (1815 + HARDENED), (0 + HARDENED), 2, 0],
      },
      amount: "1000",
    },

  ]

  console.log(
    await appAda.signTransaction({
      signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
      tx: {
        network,
        inputs,
        outputs,
        certificates,
        withdrawals,
        fee: 42,
        ttl: 10,
        validityIntervalStart: 7,
      },
      additionalWitnessPaths: [],
    })
  );
  /*
    {
      txHashHex: '1a00d10b384a8cd546fdd73bb01309e62a613d284f513872ff5b97a333626a8a',
      witnesses: [
        {
          path: [Array],
          witnessSignatureHex: '895516163dbedf069b1e7872f0bf29b8b619d5c2c8f09ddafd2ea233e69d7b9c1c5e3a28d8cc5e7a224dda456b35af7dcbe205739add02848bfa49f804603603'
        },
        {
          path: [Array],
          witnessSignatureHex: '46904569fd767d7335c4cae9f5fcaf511019442d65b508f9d09b9b29895959e0c18822aceb50f7828c729c5d883c7bb2a23657e5bfcc6003aaf18f36690b8d0f'
        }
      ]
    }
  */
  console.log("-".repeat(40));
}


async function example() {
  console.log("Running ADA examples");
  const transport = await TransportNodeHid.create(5000);
  // transport.setDebugMode(true);
  const appAda = new Ada(transport);

  await getVersion(appAda);
  await getExtendedPublicKey(appAda);
  await deriveAddress(appAda);
  await showAddress(appAda);
  await signTransaction(appAda);

}

example();

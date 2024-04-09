/* eslint-disable no-console */
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import SpeculosTransport from '@ledgerhq/hw-transport-node-speculos'

import * as blake2 from 'blake2'

import {
  Certificate,
  CredentialParamsType,
  TxInput,
  TxOutput,
  Withdrawal,
  Ada,
  AddressType,
  CertificateType,
  HARDENED,
  Networks,
  TransactionSigningMode,
  TxOutputDestinationType,
  MessageAddressFieldType,
  MessageData,
} from '../src/Ada'
import {
  base58_encode,
  bech32_encodeAddress,
  str_to_path,
} from '../src/utils/address'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getVersion = async (appAda: Ada) => {
  console.log('getVersion')
  console.log(await appAda.getVersion())
  console.log('-'.repeat(40))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getExtendedPublicKey = async (appAda: Ada) => {
  console.log('getExtendedPublicKey')
  const result = await appAda.getExtendedPublicKey({
    path: [HARDENED + 1852, HARDENED + 1815, HARDENED + 0],
  })
  console.log(result)
  /*
    {
      publicKeyHex: '0d94fa4489745249e9cd999c907f2692e0e5c7ac868a960312ed5d480c59f2dc',
      chainCodeHex: '231adc1ee85703f714abe70c6d95f027e76ee947f361cbb72a155ac8cad6d23f'
    }
  */

  // useful for crafting hw-cli tests
  const b2 = blake2.createHash('blake2b', {digestLength: 28})
  b2.update(Buffer.from(result.publicKeyHex, 'hex'))
  console.log(b2.digest('hex'))
  // dc0b21682c420507046b81d94fc72b756350b1682ba8020c5b5c5fa3

  console.log('-'.repeat(40))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deriveAddress = async (appAda: Ada) => {
  console.log('deriveAddress')

  console.log('Legacy address')
  const responseLegacy = await appAda.deriveAddress({
    network: Networks.Mainnet,
    address: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/0'/1/0"),
      },
    },
  })
  console.log(responseLegacy)
  console.log(base58_encode(Buffer.from(responseLegacy.addressHex, 'hex')))
  /*
    {
      addressHex: '82d818582183581cf0fcec2c3cb9b16e10951aacab4a1e05d1b0418b61d9801544a24f1ba0001a1e5a48cf'
    }
    Ae2tdPwUPEZLrRBShqCSucUymQSfXHEx3EthwabAYSYLyG52i6QaXTDwNVL
  */
  console.log('-'.repeat(40))

  console.log('Base address')
  const responseBase = await appAda.deriveAddress({
    network: Networks.Testnet,
    address: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/0"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
  })

  console.log(responseBase)
  console.log(bech32_encodeAddress(Buffer.from(responseBase.addressHex, 'hex')))
  /*
    {
      addressHex: '0014c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c'
    }
    addr_test1qq2vzmtlgvjrhkq50rngh8d482zj3l20kyrc6kx4ffl3zfqayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq2glhm4
  */
  console.log('-'.repeat(40))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const showAddress = async (appAda: Ada) => {
  console.log('showAddress')
  console.log('Legacy address')
  const responseLegacy = await appAda.showAddress({
    network: Networks.Mainnet,
    address: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/0'/1/0"),
      },
    },
  })
  console.log(responseLegacy)
  /*
    returns undefined
  */
  console.log('-'.repeat(40))

  console.log('Base address')
  const responseBase = await appAda.showAddress({
    network: Networks.Testnet,
    address: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/0"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
  })
  console.log(responseBase)
  /*
    returns undefined
  */
  console.log('-'.repeat(40))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const signTransaction = async (appAda: Ada) => {
  console.log('signTransaction')

  const network = Networks.Mainnet
  const inputs: TxInput[] = [
    {
      txHashHex:
        '1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc',
      outputIndex: 0,
      path: [44 + HARDENED, 1815 + HARDENED, 0 + HARDENED, 0, 1],
    },
  ]

  const outputs: TxOutput[] = [
    {
      destination: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex:
            '82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561',
        },
      },
      amount: '3003112',
    },
    {
      destination: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex:
            '82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561',
        },
      },
      amount: '4700',
      tokenBundle: [
        {
          policyIdHex:
            '75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39',
          tokens: [
            {
              assetNameHex: '7564247542686911',
              amount: '47',
            },
          ],
        },
        {
          policyIdHex:
            '95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39',
          tokens: [
            {
              assetNameHex: '456c204e69c3b16f',
              amount: '7878754',
            },
            {
              assetNameHex: '74652474436f696e', // "te$tCoin"
              amount: '1234',
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
            spendingPath: [
              1852 + HARDENED,
              1815 + HARDENED,
              0 + HARDENED,
              0,
              0,
            ],
            stakingPath: [1852 + HARDENED, 1815 + HARDENED, 0 + HARDENED, 2, 0],
          },
        },
      },
      amount: '7120787',
    },
  ]

  const certificates: Certificate[] = [
    {
      type: CertificateType.STAKE_REGISTRATION,
      params: {
        stakeCredential: {
          type: CredentialParamsType.KEY_PATH,
          keyPath: [1852 + HARDENED, 1815 + HARDENED, 0 + HARDENED, 2, 0],
        },
      },
    },
    {
      type: CertificateType.STAKE_DELEGATION,
      params: {
        stakeCredential: {
          type: CredentialParamsType.KEY_PATH,
          keyPath: [1852 + HARDENED, 1815 + HARDENED, 0 + HARDENED, 2, 0],
        },
        poolKeyHashHex:
          'f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973',
      },
    },
  ]

  const withdrawals: Withdrawal[] = [
    {
      stakeCredential: {
        type: CredentialParamsType.KEY_PATH,
        keyPath: [1852 + HARDENED, 1815 + HARDENED, 0 + HARDENED, 2, 0],
      },
      amount: '1000',
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
    }),
  )
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
  console.log('-'.repeat(40))
}

const signMessage = async (appAda: Ada) => {
  console.log('signMessage')
  const messageData = {
    messageHex:
      '7b22707572706f7365223a224b6f696f73204163636f756e7420566572696669636174696f6e222c226163636f756e74223a2265316163353563626432383964373965343932656339393962623864613637386637643238303532366461313031336532643330393738613662222c226e6f6e6365223a313731313632373430343536367d',
    signingPath: [1852 + HARDENED, 1815 + HARDENED, 0 + HARDENED, 2, 0],
    hashPayload: false,
    preferHexDisplay: false,
    addressFieldType: MessageAddressFieldType.ADDRESS,
    address: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: [1852 + HARDENED, 1815 + HARDENED, 0 + HARDENED, 2, 0],
      },
    },
    network: {protocolMagic: 764824073, networkId: 1},
  } as MessageData

  console.log(await appAda.signMessage(messageData))
  /*
    {
      signatureHex: '483a4a47584f1ddebc2873b76a712aadff074a06d858cc268c56be106fe3126e76dca62f864353e020ebdbc0b3c2e0d5408950066e228efa86598e6775dd2a0d',
      signingPublicKeyHex: '66610efd336e1137c525937b76511fbcf2a0e6bcf0d340a67bcb39bc870d85e8',
      addressFieldHex: 'e11d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c'
    }
  */
}

export function shouldUseSpeculos(): boolean {
  return process.env.LEDGER_TRANSPORT === 'speculos'
}

export function getTransport() {
  return shouldUseSpeculos()
    ? SpeculosTransport.open({apduPort: 9999})
    : TransportNodeHid.create(1000)
}

async function example() {
  console.log('Running ADA examples')
  const transport = await getTransport()
  // transport.setDebugMode(true);
  const appAda = new Ada(transport)

  // await getVersion(appAda);
  // await getExtendedPublicKey(appAda);
  // await deriveAddress(appAda);
  // await showAddress(appAda);
  // await signTransaction(appAda)
  await signMessage(appAda)
}

example()

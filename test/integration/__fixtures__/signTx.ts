import type { AssetGroup, DeviceOwnedAddress, SignedTransactionData, Transaction, TxInput, TxOutput, TxOutputDestination } from "../../../src/Ada"
import {InvalidDataReason, TxAuxiliaryDataSupplementType} from "../../../src/Ada"
import { AddressType, CertificateType, Networks, TxAuxiliaryDataType, TxOutputDestinationType, utils } from "../../../src/Ada"
import type { BIP32Path} from '../../../src/types/public'
import { StakeCredentialParamsType, TransactionSigningMode } from '../../../src/types/public'
import { str_to_path } from "../../../src/utils/address"

export const inputs: Record<
  | 'utxoByron'
  | 'utxoShelley'
  | 'utxoNonReasonable'
  | 'utxoMultisig'
  , TxInput
> = {
    utxoByron: {
        txHashHex:
      "1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc",
        outputIndex: 0,
        path: str_to_path("44'/1815'/0'/0/0"),
    },
    utxoShelley: {
        txHashHex:
      "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
        outputIndex: 0,
        path: str_to_path("1852'/1815'/0'/0/0"),
    },
    utxoNonReasonable: {
        txHashHex:
      "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
        outputIndex: 0,
        path: str_to_path("1852'/1815'/456'/0/0"),
    },
    utxoMultisig: {
        txHashHex:
      "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
        outputIndex: 0,
        path: null,
    },
}

const base58_to_hex = (str: string): string => utils.buf_to_hex(utils.base58_decode(str))
const bech32_to_hex = (str: string): string => utils.buf_to_hex(utils.bech32_decodeAddress(str))

const destinations: Record<
  | 'externalByronMainnet'
  | 'externalByronDaedalusMainnet'
  | 'externalByronTestnet'
  | 'externalShelley'
  | 'externalShelleyScripthash'
  | 'internalBaseWithStakingKeyHash'
  | 'internalBaseWithStakingPath'
  | 'internalBaseWithStakingPathNonReasonable'
  | 'internalEnterprise'
  | 'internalPointer'
  | 'multiassetThirdParty'
  | 'rewardsInternal'
  , TxOutputDestination
> = {
    externalByronMainnet: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            addressHex: base58_to_hex(
                "Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2"
            ),
        },
    },
    externalByronDaedalusMainnet: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            addressHex: base58_to_hex(
                "DdzFFzCqrht7HGoJ87gznLktJGywK1LbAJT2sbd4txmgS7FcYLMQFhawb18ojS9Hx55mrbsHPr7PTraKh14TSQbGBPJHbDZ9QVh6Z6Di"
            ),
        },
    },
    externalByronTestnet: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            addressHex: base58_to_hex(
                "2657WMsDfac6Cmfg4Varph2qyLKGi2K9E8jrtvjHVzfSjmbTMGy5sY3HpxCKsmtDA"
            ),
        },
    },
    externalShelley: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            addressHex: bech32_to_hex(
                "addr1q97tqh7wzy8mnx0sr2a57c4ug40zzl222877jz06nt49g4zr43fuq3k0dfpqjh3uvqcsl2qzwuwsvuhclck3scgn3vya5cw5yhe5vyg5x20akz"
            ),
        },
    },
    externalShelleyScripthash: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            addressHex: bech32_to_hex(
                "addr_test1zp0z7zqwhya6mpk5q929ur897g3pp9kkgalpreny8y304rfw6j2jxnwq6enuzvt0lp89wgcsufj7mvcnxpzgkd4hz70z3h2pnc8lhq8r"
            ),
        },
    },
    internalBaseWithStakingKeyHash: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/0"),
                stakingKeyHashHex:
          "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
    },
    internalBaseWithStakingPath: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/0"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
    },
    internalBaseWithStakingPathNonReasonable: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/456'/0/5000000"),
                stakingPath: str_to_path("1852'/1815'/456'/2/0"),
            },
        },
    },
    internalEnterprise: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.ENTERPRISE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/0"),
            },
        },
    },
    internalPointer: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.POINTER_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/0"),
                stakingBlockchainPointer: {
                    blockIndex: 1,
                    txIndex: 2,
                    certificateIndex: 3,
                },
            },
        },
    },
    multiassetThirdParty: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            addressHex: bech32_to_hex(
                "addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r"
            ),
        },
    },
    rewardsInternal: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.REWARD_KEY,
            params: {
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
    },
}

export const mints: Record<
    | 'mintAmountVariety'
    | 'mintInvalidCanonicalOrderingPolicy'
    | 'mintInvalidCanonicalOrderingAssetName'
  , Array<AssetGroup>
> = {
    mintAmountVariety: [
        {
            // fingerprints taken from CIP 14 draft
            policyIdHex: "7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373",
            tokens: [
                {
                    // fingerprint: asset1rjklcrnsdzqp65wjgrg55sy9723kw09mlgvlc3
                    assetNameHex: "",
                    amount: "0",
                },
                {
                    // fingerprint: asset17jd78wukhtrnmjh3fngzasxm8rck0l2r4hhyyt
                    assetNameHex: "1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209",
                    amount: "-1",
                },
                {
                    // fingerprint: asset17jd78wukhtrnmjh3fngzasxm8rck0l2r4hhyyt (and incremented)
                    assetNameHex: "1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20a",
                    amount: "9223372036854775807",
                },
                {
                    // fingerprint: asset17jd78wukhtrnmjh3fngzasxm8rck0l2r4hhyyt (and incremented)
                    assetNameHex: "1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20b",
                    amount: "-9223372036854775808",
                },
            ],
        },
    ],
    mintInvalidCanonicalOrderingPolicy: [
        {
            // fingerprints taken from CIP 14 draft (and incremented)
            policyIdHex: "7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc374",
            tokens: [
                {
                    // fingerprint: asset1rjklcrnsdzqp65wjgrg55sy9723kw09mlgvlc3
                    assetNameHex: "",
                    amount: "0",
                },
                {
                    // fingerprint: asset17jd78wukhtrnmjh3fngzasxm8rck0l2r4hhyyt
                    assetNameHex: "1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209",
                    amount: "-1",
                },
            ],
        },
        {
            // fingerprints taken from CIP 14 draft
            policyIdHex: "7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373",
            tokens: [
                {
                    // fingerprint: asset1rjklcrnsdzqp65wjgrg55sy9723kw09mlgvlc3
                    assetNameHex: "",
                    amount: "0",
                },
            ],
        },
    ],
    mintInvalidCanonicalOrderingAssetName: [
        {
            // fingerprints taken from CIP 14 draft (and incremented)
            policyIdHex: "7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc374",
            tokens: [
                {
                    // fingerprint: asset17jd78wukhtrnmjh3fngzasxm8rck0l2r4hhyyt
                    assetNameHex: "1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209",
                    amount: "-1",
                },
                {
                    // fingerprint: asset1rjklcrnsdzqp65wjgrg55sy9723kw09mlgvlc3
                    assetNameHex: "",
                    amount: "0",
                },
            ],
        },
    ],
}

export const outputs: Record<
  | 'externalByronMainnet'
  | 'externalByronDaedalusMainnet'
  | 'externalByronTestnet'
  | 'externalShelley'
  | 'externalShelleyScripthash'
  | 'internalBaseWithStakingKeyHash'
  | 'internalBaseWithStakingPath'
  | 'internalBaseWithStakingPathNonReasonable'
  | 'internalEnterprise'
  | 'internalPointer'
  | 'multiassetOneToken'
  | 'multiassetManyTokens'
  | 'multiassetChange'
  | 'multiassetBigNumber'
//   | 'multiassetInvalidAssetGroupOrdering'
  | 'multiassetAssetGroupsNotUnique'
//   | 'multiassetInvalidTokenOrderingSameLength'
//   | 'multiassetInvalidTokenOrderingDifferentLengths'
  | 'multiassetTokensNotUnique'
  | 'trezorParity'
  , TxOutput
> = {
    externalByronMainnet: {
        amount: 3003112,
        destination: destinations.externalByronMainnet,
    },
    externalByronDaedalusMainnet: {
        amount: 3003112,
        destination: destinations.externalByronDaedalusMainnet,
    },
    externalByronTestnet: {
        amount: 3003112,
        destination: destinations.externalByronTestnet,
    },
    externalShelley: {
        amount: 1,
        destination: destinations.externalShelley,
    },
    externalShelleyScripthash: {
        amount: 1,
        destination: destinations.externalShelleyScripthash,
    },
    internalBaseWithStakingKeyHash: {
        amount: 7120787,
        destination: destinations.internalBaseWithStakingKeyHash,
    },
    internalBaseWithStakingPath: {
        destination: destinations.internalBaseWithStakingPath,
        amount: 7120787,
    },
    internalBaseWithStakingPathNonReasonable: {
        destination: destinations.internalBaseWithStakingPathNonReasonable,
        amount: 7120787,
    },
    internalEnterprise: {
        destination: destinations.internalEnterprise,
        amount: 7120787,
    },
    internalPointer: {
        destination: destinations.internalPointer,
        amount: 7120787,
    },
    multiassetOneToken: {
        destination: destinations.multiassetThirdParty,
        amount: 1234,
        tokenBundle: [
            {
                policyIdHex: "95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "74652474436f696e",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
    multiassetManyTokens: {
        destination: destinations.multiassetThirdParty,
        amount: "1234",
        tokenBundle: [
            {
                // fingerprints taken from CIP 14 draft
                policyIdHex: "7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373",
                tokens: [
                    {
                        // fingerprint: asset1rjklcrnsdzqp65wjgrg55sy9723kw09mlgvlc3
                        assetNameHex: "",
                        amount: "3",
                    },
                    {
                        // fingerprint: asset17jd78wukhtrnmjh3fngzasxm8rck0l2r4hhyyt
                        assetNameHex: "1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209",
                        amount: "1",
                    },
                    {
                        // fingerprint: asset1pkpwyknlvul7az0xx8czhl60pyel45rpje4z8w
                        assetNameHex: "0000000000000000000000000000000000000000000000000000000000000000",
                        amount: "2",
                    },
                ],
            },
            {
                policyIdHex: "95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "456c204e69c3b16f",
                        amount: "1234",
                    },
                    {
                        assetNameHex: "74652474436f696e",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
    multiassetChange: {
        destination: destinations.internalBaseWithStakingPath,
        amount: "1234",
        tokenBundle: [
            {
                policyIdHex: "95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "74652474436f696e",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
    multiassetBigNumber: {
        destination: destinations.multiassetThirdParty,
        amount: "24103998870869519",
        tokenBundle: [
            {
                policyIdHex: "95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "74652474436f696e",
                        amount: "24103998870869519",
                    },
                ],
            },
        ],
    },
    // enforcing of asset groups order is removed for now and will be added back after the ordering is properly defined by a CIP
    // multiassetInvalidAssetGroupOrdering: {
    //     destination: destinations.multiassetThirdParty,
    //     amount: "1234",
    //     tokenBundle: [
    //         {
    //             policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
    //             tokens: [
    //                 {
    //                     assetNameHex: "7564247542686911",
    //                     amount: "47",
    //                 },
    //             ],
    //         },
    //         {
    //             policyIdHex: "71a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
    //             tokens: [
    //                 {
    //                     assetNameHex: "7564247542686911",
    //                     amount: "47",
    //                 },
    //             ],
    //         },
    //     ],
    // },
    multiassetAssetGroupsNotUnique: {
        destination: destinations.multiassetThirdParty,
        amount: "1234",
        tokenBundle: [
            {
                policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "7564247542686911",
                        amount: "47",
                    },
                ],
            },
            {
                policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "7564247542686911",
                        amount: "47",
                    },
                ],
            },
        ],
    },
    // enforcing of asset order is removed for now and will be added back after the ordering is properly defined by a CIP
    // multiassetInvalidTokenOrderingSameLength: {
    //     destination: destinations.multiassetThirdParty,
    //     amount: "1234",
    //     tokenBundle: [
    //         {
    //             policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
    //             tokens: [
    //                 {
    //                     assetNameHex: "7564247542686911",
    //                     amount: "47",
    //                 },
    //                 {
    //                     assetNameHex: "74652474436f696e",
    //                     amount: "7878754",
    //                 },
    //             ],
    //         },
    //     ],
    // },
    // multiassetInvalidTokenOrderingDifferentLengths: {
    //     destination: destinations.multiassetThirdParty,
    //     amount: "1234",
    //     tokenBundle: [
    //         {
    //             policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
    //             tokens: [
    //                 {
    //                     assetNameHex: "7564247542686911",
    //                     amount: "47",
    //                 },
    //                 {
    //                     assetNameHex: "756424754268",
    //                     amount: "7878754",
    //                 },
    //             ],
    //         },
    //     ],
    // },
    multiassetTokensNotUnique: {
        destination: destinations.multiassetThirdParty,
        amount: "1234",
        tokenBundle: [
            {
                policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "7564247542686911",
                        amount: "47",
                    },
                    {
                        assetNameHex: "7564247542686911",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
    trezorParity: {
        destination: destinations.multiassetThirdParty,
        amount: 2000000,
        tokenBundle: [
            {
                policyIdHex: "0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425",
                tokens: [
                    {
                        assetNameHex: "74657374436f696e",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
}

const byronBase = {
    inputs: [inputs.utxoByron],
    fee: 42,
    ttl: 10,
}

export type TestcaseByron = {
  testname: string
  tx: Transaction
  signingMode: TransactionSigningMode
  result: SignedTransactionData
}

export const testsByron: TestcaseByron[] = [
    {
        testname: "Sign tx without change address with Byron mainnet output",
        tx: {
            ...byronBase,
            network: Networks.Mainnet,
            outputs: [outputs.externalByronMainnet],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        result: {
            /*
       * txBody: a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a
       */
            txHashHex:
        "73e09bdebf98a9e0f17f86a2d11e0f14f4f8dae77cdf26ff1678e821f20c8db6",
            witnesses: [
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "9c12b678a047bf3148e867d969fba4f9295042c4fff8410782425a356820c79e7549de" +
            "798f930480ba83615a5e2a19389c795a3281a59077b7d37cd5a071a606",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx without change address with Byron Daedalus mainnet output",
        tx: {
            ...byronBase,
            network: Networks.Mainnet,
            outputs: [outputs.externalByronDaedalusMainnet],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        result: {
            txHashHex:
        "3cf35b4d9bfa87b8eab5de659e0520bdac37b0de0b3840c1d8abd683330a9756",
            witnesses: [
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "fdca7969a3e8bc091c9ee32c04732f79bb7c0091f1796fd2c0e1de8aa8547a00457d50d0576f4dd421baf754499cf0e77584e848e3547addd5d5b7167597a307",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx without change address with Byron testnet output",
        tx: {
            ...byronBase,
            network: Networks.Testnet,
            outputs: [outputs.externalByronTestnet],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        result: {
            txHashHex:
        "e2319ee8317ac537af4c2c3322aaf9fb6c64a95e3921ad75ab91b4f5b5306963",
            witnesses: [
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "224d103185f4709f7b749339ff7ba432d50ca5cb742678847f5e574858cf7dda7ed402399a9ddba81ecd731b6f939ba07a247cd570dcd543f83a9aeadc4f9603",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]


const shelleyBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    outputs: [outputs.externalByronMainnet],
    fee: 42,
    ttl: 10,
}

export type TestcaseShelley = {
  testname: string
  tx: Transaction
  signingMode: TransactionSigningMode
    additionalWitnessPaths: BIP32Path[],
  txBody?: string,
  txAuxiliaryData?: string,
  result: SignedTransactionData
}

export const testsShelleyNoCertificates: TestcaseShelley[] = [
    {
        testname: "Sign tx without outputs",
        tx: {
            ...shelleyBase,
            outputs: [],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            txHashHex:
        "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "190dcee0cc7125fd0ec104cf685674f1ad77f3e439a4a249e596a3306f9eb110ced8fb8ec59da15b721203c8973bd341d88e6a60b85c1e9f2623152fee8dc00a",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx without change address",
        tx: {
            ...shelleyBase,
            outputs: [outputs.externalShelley],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc000181825841017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09da61d425f34611140102182a030a",
        result: {
            txHashHex:
        "97e40841b9b494d4c63993c35038484a72e70f0d5356471e9f1e3e311663b67e",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "5137e748df308525b46deaef18e61e04994f6658c32ada286b06d32b99d6676aef94f36895a51b9025d94b2ab0776749eedc7451ac1f0e61bef8b9cf5ec0240e",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    ///////////////////////////
    // multisig
    //  possibly with certificate (for the keyhash) ?
    {
        testname: "Sign tx without change address with Shelley scripthash output",
        tx: {
            ...shelleyBase,
            network: Networks.Testnet,
            outputs: [outputs.externalShelleyScripthash],
        },
        signingMode: TransactionSigningMode.SCRIPT_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0")],
        result: {
            txHashHex:
        "23d82edc8fbd2d55237cba955a2280161ebd5643b23844e9b5abdc843b966e62",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "38472a39eead64017e449be5affcf4bf5e20260a92004d6ea2a6eac5dab9fcaf274031f4988df4a6e5f88b9194db05e24b5f3fa0d26bbf308cd2111505260603",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with change base address with staking path",
        tx: {
            ...shelleyBase,
            outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            txHashHex:
        "bd9e06485299c3c2be83135438f18fa4bde6e324420ae0a79dd2a12295f28597",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "ce028294627e27e8d80c5902f7dae91da851bf530df8b12efef44f7afa316b613cdb2b404e39df2a47f7fa64818a66b2b34d4b45ca3a04bf519c24c7a4ac3f00",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with change base address with staking key hash",
        tx: {
            ...shelleyBase,
            outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingKeyHash],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            txHashHex:
        "f475a32afbf7b028fb794f81311a10f655afbbdf1d0201e5c801010a8cde9ea7",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "4ac5017c014886406a38a45417a165156280be63ca6975a5acffcabc0cc842ca603248b8a7ebfa729d7affce34518f4ca94fe797420a4d7aa0ef8c2b0ddfba0b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with enterprise change address",
        tx: {
            ...shelleyBase,
            outputs: [outputs.externalByronMainnet, outputs.internalEnterprise],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            txHashHex:
        "c192b24a87d45c768f7f33ed37998054db96d34558e59afebabe51cfb7034b65",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "70559415746a9646dc492b7758e18cb367c005ab0479558b3d540be2310eb1bb1dd0839081e22c0b4727e8bd8e163cfbfe9def99a8506fb4a6787a200862e00f",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with pointer change address",
        tx: {
            ...shelleyBase,
            outputs: [outputs.externalByronMainnet, outputs.internalPointer],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            txHashHex:
        "4b19e27ffc006ace16592311c4d2f0cafc255eaa47a6178ff540c0a46d07027c",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "1838884e08cf6966ebe6b3e775191c4f08d90834723421779efd6aa96e52ffc91a24e5073abe6db94c74fe080d008258b3d989c159d9b87a9c778a51404abc08",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with non-reasonable account and address",
        tx: {
            ...shelleyBase,
            inputs: [inputs.utxoNonReasonable],
            outputs: [outputs.internalBaseWithStakingPathNonReasonable],
            auxiliaryData: {
                type: TxAuxiliaryDataType.ARBITRARY_HASH,
                params: {
                    hashHex: "deadbeef".repeat(8),
                },
            },
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            txHashHex:
        "40b3a79c645be040139078befee154d5f935c8ba2af6144cebcf447f8ef2e580",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/456'/0/0"),
                    witnessSignatureHex:
            "bb1a035acf4a7b5dd68914f0007dfc4d1cc7b4d88748c0ad24326fd06597542ce0352075ed861b3ae012ab976cacd3dbbc58802cdf82409917ebf9a8bb182e04",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with path based withdrawal",
        tx: {
            ...shelleyBase,
            withdrawals: [
                {
                    stakeCredential: {
                        type: StakeCredentialParamsType.KEY_PATH,
                        keyPath: str_to_path("1852'/1815'/0'/2/0"),
                    },
                    amount: 111,
                },
            ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aa" +
      "d1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1" +
      "a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a05a1581de11d227aefa4b77314917088" +
      "5aadba30aab3127cc611ddbc4999def61c186f",
        result: {
            txHashHex:
        "dfc63f395fba4bbf8d3507d05c455f0db7d85d0cabdd6f033c6112d6c32a6b93",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "22ef3b54a54a1f5390436911b23328225f92c660eb251189fceab2fa428187a2cec584ea5f6f9c9fcdf7f19bc496b3b2b9bb416ad07a3d31d73fbc0c05bec10c",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "04b995979c2072b469c1e0ace5331c3d188e3e65d5a6f06aa4e608fb18a3588621370ee1b5d39d55afe0744aa4906785baa07210dc4cb49594eba507f7215102",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with script based withdrawal",
        tx: {
            ...shelleyBase,
            withdrawals: [
                {
                    stakeCredential: {
                        type: StakeCredentialParamsType.SCRIPT_HASH,
                        scriptHash: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                    },
                    amount: 111,
                },
            ],
        },
        signingMode: TransactionSigningMode.SCRIPT_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aa" +
      "d1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1" +
      "a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a05a1581de11d227aefa4b77314917088" +
      "5aadba30aab3127cc611ddbc4999def61c186f",
        result: {
            txHashHex:
        "87de2c36e5a222f796b392a290717316d039dc42dc2150873e86ec9b0c870357",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "64f26fb866f0840f2ec299db16e6eff9d039ebacf673bdd8dba5110078344bf9647c4038588bfc826c73d7e0c03ea2ffb028de632d9462a129fd78f3a1bd7c0e",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with nonempty auxiliary data",
        tx: {
            ...shelleyBase,
            auxiliaryData: {
                type: TxAuxiliaryDataType.ARBITRARY_HASH,
                params: {
                    hashHex: "deadbeef".repeat(8),
                },
            },
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163" +
      "f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2" +
      "e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a075820deadbeefdeadbeefdeadbee" +
      "fdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        result: {
            txHashHex:
        "34c1dd59c14252008b680bf6a727c8f371e2d96e8bca6b783bcf3f8f36407e6f",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "953c5243ba09570dd4e52642236834c138ad4abbbb21796a90540a11e8dc96e47043401d370cdaed70ebc332dd4db80c9b167fd7f20971c4f142875cea57200c",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

export const testsShelleyWithCertificates: TestcaseShelley[] = [
    {
        testname: "Sign tx with a stake registration script certificate",
        tx: {
            ...shelleyBase,
            certificates: [
                {
                    type: CertificateType.STAKE_REGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHash: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.SCRIPT_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163" +
      "f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2" +
      "e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182008200581c1d227aefa4b77" +
      "3149170885aadba30aab3127cc611ddbc4999def61c",
        result: {
            txHashHex:
        "fba0908b41300d1b075ec6a7dafc2dcbe3376df17ef3feb2e4536b309f0034d1",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "bfb96452a106da86ff17c71692e25fac4826ae1c318c94d671fd7602229b411cf4422614cba241954a9bdb66bfd364bc9cfdf446639ff6e03273dc4073d66b0a",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a stake registration path certificate",
        tx: {
            ...shelleyBase,
            certificates: [
                {
                    type: CertificateType.STAKE_REGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_PATH,
                            keyPath: str_to_path("1852'/1815'/0'/2/0"),
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163" +
      "f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2" +
      "e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182008200581c1d227aefa4b77" +
      "3149170885aadba30aab3127cc611ddbc4999def61c",
        result: {
            txHashHex:
        "a119ec712822b2f4bc96737121f286cf149ac2f8de2230e0d675f074094d1cd6",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "9825594e5a91333b9f5762665ba316af34c2208bd7ef073178af5e48f2aae8673d50436045e292d5bb9be7492eeeda475a04e58621a326c91049a2ef26a33200",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "a2a22faa4ac4ba4b5a89c770dd7b2afe877ba8c86f0205df8c01a2184275aaafada9b6be4640aa573cafbbca26ac2eccd98f804065b39b10a0559c7dc441fa0a",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a stake delegation script certificate",
        tx: {
            ...shelleyBase,
            certificates: [
                {
                    type: CertificateType.STAKE_DELEGATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHash: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.SCRIPT_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163" +
      "f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2" +
      "e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048183028200581c1d227aefa4b77" +
      "3149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad" +
      "3e72f674f957fe23ff0acb4973",
        result: {
            txHashHex:
        "927d8924e77c879bcc2a1e5317d963028737d0764c6532a05474d8eda203911d",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "78de23f120ff291913eee3d3981281d500e9476debb27bb640ff73eba53c1de452b5d9dba57d4353a37652f7a72a272e60a928fbf4181b70c031c9ba93888606",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a stake delegation path certificate",
        tx: {
            ...shelleyBase,
            certificates: [
                {
                    type: CertificateType.STAKE_DELEGATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_PATH,
                            keyPath: str_to_path("1852'/1815'/0'/2/0"),
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163" +
      "f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2" +
      "e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048183028200581c1d227aefa4b77" +
      "3149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad" +
      "3e72f674f957fe23ff0acb4973",
        result: {
            txHashHex:
        "7afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c808b3a8aa",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "d94c8f8fe73946c25f3bd0919d05a60b8373ef0a7261fa73eefe1f2a20e8a4c3401feb5eea701222184fceab2c45b47bd823ac76123e2d17f804d3e4ed2df909",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "035b4e6ae6f7a8089f2a302ddcb60bc56d48bcf267fdcb071844da5ce3086d51e816777a6fb5eabfcb326a32b830674ac0de40ee1b2360a69adba4b64c662404",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a stake deregistration script certificate",
        tx: {
            ...shelleyBase,
            certificates: [
                {
                    type: CertificateType.STAKE_DEREGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHash: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.SCRIPT_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163" +
      "f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2" +
      "e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182018200581c1d227aefa4b77" +
      "3149170885aadba30aab3127cc611ddbc4999def61c",
        result: {
            txHashHex:
        "c4c8910810de8dc39aa0c33b65ee24f3f95216c7050f9ba85c00302a99f6d596",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "468e5dc048efa4985bb392248f6d8df3b4ed297a9cbe4b9670ac0cc0debc4e6dc00018a75079cf20c050f4bf9be1c9aecccae851d22fe940a72b25af802d910b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a stake deregistration path certificate",
        tx: {
            ...shelleyBase,
            certificates: [
                {
                    type: CertificateType.STAKE_DEREGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_PATH,
                            keyPath: str_to_path("1852'/1815'/0'/2/0"),
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163" +
      "f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2" +
      "e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182018200581c1d227aefa4b77" +
      "3149170885aadba30aab3127cc611ddbc4999def61c",
        result: {
            txHashHex:
        "8b143fae3b37748fee1decdc10fbfa554158b58fbc99623ecdd2ba7aa709e471",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "6136510eb91449474f6137c8d1c7c69eb518e3844a3e63a626be8cf4af91afa24e12f4fa578398bf0e7992e22dcfc5f9773fb8546b88c19e3abfdaa3bbe7a304",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "77210ce6533a76db3673af1076bf3933747a8d81cabda80c8bc9c852c78685f8a42c9372721bdfe9b47611039364afb3391031211b5c427cfec0c5c505cfec0c",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx and filter out witnesses with duplicate paths",
        tx: {
            ...shelleyBase,
            certificates: [
                {
                    type: CertificateType.STAKE_DEREGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_PATH,
                            keyPath: str_to_path("1852'/1815'/0'/2/0"),
                        },
                    },
                },
                {
                    type: CertificateType.STAKE_DEREGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_PATH,
                            keyPath: str_to_path("1852'/1815'/0'/2/0"),
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            txHashHex:
        "8d720755bcbc724fc71a1868bafbd057d855a176362417f62711a34f2d9b896d",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "04e071e39903e7e1e3ea9d26ce6822d5cbef88ee389f4f63a585668a5a6df98924dca16f8f61c01909162730014bb309fc7043b80ac54375697d6e9c01df0a0c",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "7b53ba805658d801baa39546777b611ed071c89938daea50c2c3275358abec2c1d67c8062b24fc4778e09af13e58ea33dd7d0627e221574386716aaa25e1f20b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with pool retirement combined with another certificate",
        tx: {
            ...shelleyBase,
            inputs: [
                {
                    txHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
                    outputIndex: 0,
                    path: str_to_path("1852'/1815'/0'/0/0"),
                },
            ],
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_RETIREMENT,
                    params: {
                        poolKeyPath: str_to_path("1853'/1815'/0'/0'"),
                        retirementEpoch: "10",
                    },
                },
                {
                    type: CertificateType.STAKE_REGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_PATH,
                            keyPath: str_to_path("1852'/1815'/0'/2/0"),
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        result: {
            // WARNING: only as computed by ledger, not verified with cardano-cli
            txHashHex: "70aea83c8e5e9a3e0ec92860d5bd4750c34911193f092a96b9da6906d6ea6247",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "8212cdabe1be514fdc21e02a2b405ce284ebbce0208a5c2b289dac662bf87fb4c2d18237c66761e285d78ee76cc26b7517718e641174d69f49737a49e9482607",
                },
                {
                    path: str_to_path("1853'/1815'/0'/0'"),
                    witnessSignatureHex:
            "9386c2545e2671497daf95db93be1386690a4f884547a60f2913ef8a9e61486ba068d7477e1cd712f8d9cc20778d9e71b72eda96c9394c2f3111c61803f9a70d",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "32d0be05a8103a834265aa9e29562d5dde4473e4d7596714c000ae3a980b8e55543db42dde19e407c40943591978f03b28106f75cbc77d21ea2c28ab1ad4c100",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Full test for trezor feature parity",
        tx: {
            // "protocol_magic": 764824073,
            // "network_id": 1,
            // if Networks.Mainnet differs, the test should just explicitly give these
            network: Networks.Mainnet,
            inputs: [inputs.utxoMultisig],
            outputs: [outputs.trezorParity],
            fee: 42,
            ttl: 10,
            validityIntervalStart: 47,
            certificates: [
                {
                    type: CertificateType.STAKE_REGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHash: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                    },
                },
                {
                    type: CertificateType.STAKE_DEREGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHash: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                    },
                },
                {
                    type: CertificateType.STAKE_DELEGATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHash: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
            withdrawals: [
                {
                    stakeCredential: {
                        type: StakeCredentialParamsType.SCRIPT_HASH,
                        scriptHash: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                    },
                    amount: 1000,
                },
            ],
            mint: [
                {
                    policyIdHex: "0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425",
                    tokens: [
                        {
                            assetNameHex: "74657374436f696e",
                            amount: 7878754,
                        },
                        {
                            assetNameHex: "75657374436f696e",
                            amount: -7878754,
                        },
                    ],
                },
            ],
            auxiliaryData: {
                type: TxAuxiliaryDataType.ARBITRARY_HASH,
                params: {
                    hashHex: "58ec01578fcdfdc376f09631a7b2adc608eaf57e3720484c7ff37c13cff90fdf",
                },
            },
        },
        signingMode: TransactionSigningMode.SCRIPT_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0"), str_to_path("1854'/1815'/0'/2/0")],

        result: {
            txHashHex: "2be64c04ea3f5bac3c224ec47a4157ade91fc6ab4fd6b83ce3d57b2e9186720b",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/0/0"),
                    witnessSignatureHex: "32557d65b2be5eb169e966d42bf59076adfd33e3e66622905c6aba831e2524b678251ed41a770dce35d27925eedb9c0fc0347e5e8383460ce1f346d056667f08",
                },
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex: "3bfd800af9db4a26be9895321d548df57a2a65ff5a0ccf867f709117098a352bd803f6cdc9e806f676f2d6259cb961234260347fd283d196af5db8665703af0c",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

const allegraBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    outputs: [outputs.externalShelley],
    fee: 42,
}

export type TestcaseAllegra = {
  testname: string
  tx: Transaction
  signingMode: TransactionSigningMode
  txBody: string
  result: SignedTransactionData
}
export const testsAllegra: TestcaseAllegra[] = [
    {
        testname: "Sign tx with no ttl and no validity interval start",
        tx: {
            ...allegraBase,
            ttl: null,
            validityIntervalStart: null,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a300818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825841017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09da61d425f34611140102182a",
        result: {
            txHashHex:
        "971dc8ccbc34fde78028b9642352ac84b6c8867cfd72ca9bc92d68203d7ed86f",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "6dc4da7a0bee07e4ecc687b0d1b9e73d772dfb6a09b2bf435fe1e3d481ed8214f8d751ceff0e9fa41ef0ad7318ea9ca561c9b773e5673adb8049569c380f5301",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with no ttl, but with validity interval start",
        tx: {
            ...allegraBase,
            ttl: null,
            validityIntervalStart: 47,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825841017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09da61d425f34611140102182a08182f",
        result: {
            txHashHex:
        "bfe53d40c5eb0cd04b53d555b85be4474168adbc1d8f82cf5c9792854234cf70",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "b1bc7a4b110523f8b0a1a3aa0ae0f45a718faf7beb648a021d0d777755ab214ba1b079d79d8517a275ebb74c79aa244600f0877c611ca00383d67fc447074003",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

const maryBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    fee: 42,
    ttl: 10,
    // FIXME: this is quite unreasonable as validity start is after ttl
    validityIntervalStart: 47,
}

export type TestcaseMary = {
  testname: string
  tx: Transaction
  signingMode: TransactionSigningMode
  txBody: string,
  txAuxiliaryData?: string,
  result: SignedTransactionData
}

export const testsMary: TestcaseMary[] = [
    {
        testname: "Sign tx with a multiasset output",
        tx: {
            ...maryBase,
            outputs: [outputs.multiassetOneToken, outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1a007838628258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a08182f",
        result: {
            txHashHex:
        "8502ab1a781627663e8bfcff54a58747e319da3bb592a3446fc35fa5d2f2fbe9",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "b48877586d90a249579a5f3994c3ad0c21c5f78960a04aadd182ca49c3b606f1d8a578edf17923188e4e0e40f191e019a5174081c092c458a82e9f0c1e1fae08",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a complex multiasset output",
        tx: {
            ...maryBase,
            outputs: [outputs.multiassetManyTokens, outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a2581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a1487564247542686911182f581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2401904d24874652474436f696e1a007838628258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a08182f",
        result: {
            txHashHex:
        "fc640534def42c6c9a16e51de379191cc39d0950015e8db8e237e17b55b7cc5a",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "cf297c45c32dc51fa84f7cdbf967496b6493fac86bf6e283cf6c10564ad1fed7f5702939f712e00eaede88847dde24db6591d7ad6e998287835eb2473de7a204",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with big numbers",
        tx: {
            ...maryBase,
            outputs: [outputs.multiassetBigNumber],
            fee: "24103998870869519",
            ttl: "24103998870869519",
            validityIntervalStart: "24103998870869519",
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821b0055a275925d560fa1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1b0055a275925d560f021b0055a275925d560f031b0055a275925d560f081b0055a275925d560f",
        result: {
            txHashHex:
        "e60735a3cc71a8a3f89652797c3e650d6ed80059c0b59978c59858dcf6f8ca48",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "632cd935550a71c1e1869e6f5749ee4cb8c268cbe014138561fc2d1045b5b2be84526cfd5a6fea01de99bdf903fa17c79a58a832b5cdcb1c999bcbe995a56806",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a multiasset change output",
        tx: {
            ...maryBase,
            outputs: [outputs.externalShelley, outputs.multiassetChange],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000182825841017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09da61d425f3461114018258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c821904d2a1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1a0078386202182a030a08182f",
        result: {
            txHashHex:
        "75ef0b3ac08d56e8ca4a6d3a3de054ed028bad025b0fad3cbb351fc94e967bc5",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "f19c5f698d3d46dac99c83268d8b5154262c22f9599d38b5221b78d08cef8f5bb81de648a0c94d328b74e88c58d46535de289123f08a47a05a1c253980d6b80e",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with zero fee, TTL and validity interval start",
        tx: {
            ...maryBase,
            fee: 0,
            ttl: 0,
            validityIntervalStart: 0,
            outputs: [outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca793020003000800",
        result: {
            txHashHex:
        "acc997f583c78f36529ee29134e2cfb7a4550493727f565a502ab40544827311",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "e5ee59942fba139b5547e5e1dae1389ed9edd6e7bd7f057b988973c2451b5e3e41901c1d9a0fa74d34dae356a064ee783205d731fee01105c904702826b66b04",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with mint fields with various amounts",
        tx: {
            ...maryBase,
            outputs: [],
            mint: mints.mintAmountVariety,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "",
        result: {
            txHashHex: "dd0b254a628cbfa271e580091bce114a1344cf037a07f4ad1d6afe7fa93501ac",
            "witnesses": [
                {
                    "path": [
                        2147485500,
                        2147485463,
                        2147483648,
                        0,
                        0,
                    ],
                    "witnessSignatureHex": "10c83de863442e6aca75674b63429fd257323883e7c6195d53884a022d9742c607c30602986bd57f69c9560311b32b507f390a7fdfae9c7c724ba4d5203fd302",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with mint fields among other fields",
        tx: {
            ...maryBase,
            outputs: [outputs.multiassetOneToken, outputs.internalBaseWithStakingPath],
            fee: 10,
            validityIntervalStart: 100,
            ttl: 1000,
            mint: mints.mintAmountVariety,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "",
        result: {
            txHashHex: "49686d9089cba67506537574dd0514038f813a2b9e648097aa49c2b93d14d549",
            witnesses: [
                {
                    "path": [
                        2147485500,
                        2147485463,
                        2147483648,
                        0,
                        0,
                    ],
                    "witnessSignatureHex": "2a4ec4e5eb03d24264d612923e62b01384d215a70c415b067cc109580cef1044fc9a5b17fe92f752b70702fd457e6ea455a4ef5f3afdd44548223e913bc43b08",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

export const testsCatalystRegistration: TestcaseMary[] = [
    {
        testname: "Sign tx with Catalyst voting key registration metadata with base address",
        tx: {
            ...maryBase,
            outputs: [outputs.internalBaseWithStakingPath],
            auxiliaryData: {
                type: TxAuxiliaryDataType.CATALYST_REGISTRATION,
                params: {
                    votingPublicKeyHex: "4b19e27ffc006ace16592311c4d2f0cafc255eaa47a6178ff540c0a46d07027c",
                    stakingPath: str_to_path("1852'/1815'/0'/2/0"),
                    nonce: 1454448,
                    rewardsDestination: destinations.internalBaseWithStakingPath.params as DeviceOwnedAddress,
                },
            },
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad" +
      "1c0b70001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d" +
      "227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a075" +
      "820e9141b460aea0abb69ce113c7302c7c03690267736d6a382ee62d2a53c2ec92608182f",
        txAuxiliaryData: "82a219ef64a40158204b19e27ffc006ace16592311c4d2f0cafc255eaa47" +
      "a6178ff540c0a46d07027c02582066610efd336e1137c525937b76511fbcf2a0e6bcf0d340a67" +
      "bcb39bc870d85e80358390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11" +
      "241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c041a0016317019ef65a" +
      "10158400ca3bb69cad5f471ddd32097a8501e3956e4ae0c2bf523625d1686b123dcc04af24063" +
      "0eb93bf1069c607b59bbe7d521fb8dd14a4312788bc0b72b7473ee160e80",
        result: {
            txHashHex:
        "ffb0c7daf1bcb661cdab8b452a6e6664a9fd9da289405a4234c356c75ce5be66",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "b4e2bd2985668b6cbce395700545f3773b72ca1e86cc9470cb5340e5b266d05feb968cf09a1febe852d180f5ba93113f13e5d56fe8cf7bbfb31b3ccaa45fb800",
                },
            ],
            auxiliaryDataSupplement: {
                type: TxAuxiliaryDataSupplementType.CATALYST_REGISTRATION,
                auxiliaryDataHashHex: "e9141b460aea0abb69ce113c7302c7c03690267736d6a382ee62d2a53c2ec926",
                catalystRegistrationSignatureHex: "0ca3bb69cad5f471ddd32097a8501e3956e4ae0c2bf523625d1686b123dcc04af240630eb93bf1069c607b59bbe7d521fb8dd14a4312788bc0b72b7473ee160e",
            },
        },
    },
    {
        testname: "Sign tx with Catalyst voting key registration metadata with stake address",
        tx: {
            ...maryBase,
            outputs: [outputs.internalBaseWithStakingPath],
            auxiliaryData: {
                type: TxAuxiliaryDataType.CATALYST_REGISTRATION,
                params: {
                    votingPublicKeyHex: "4b19e27ffc006ace16592311c4d2f0cafc255eaa47a6178ff540c0a46d07027c",
                    stakingPath: str_to_path("1852'/1815'/0'/2/0"),
                    nonce: 1454448,
                    rewardsDestination: destinations.rewardsInternal.params as DeviceOwnedAddress,
                },
            },
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3a" +
      "ad1c0b70001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f1124" +
      "1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a0" +
      "75820d19f7cb4d48a6ae8d370c64d2a42fca1f61d6b2cf3d0c0c02801541811338deb08182f",
        txAuxiliaryData: "82a219ef64a40158204b19e27ffc006ace16592311c4d2f0cafc255eaa47" +
      "a6178ff540c0a46d07027c02582066610efd336e1137c525937b76511fbcf2a0e6bcf0d340a67" +
      "bcb39bc870d85e803581de11d227aefa4b773149170885aadba30aab3127cc611ddbc4999def6" +
      "1c041a0016317019ef65a10158401514b6bbc582b33edcf5fa30ec04dcaa62128de8755c78676" +
      "8ae5922132c2aa50b9ba17be28072de979f45b0f429c7f5d489c549a1e22bc8e7d0b2445c1036" +
      "0980",
        result: {
            txHashHex:
        "83deb3ed2f37df4cb6c7a4d81399cd29f88505e4f3d053342ada4f630fb23ae1",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "a344a5e466eb333e0bf417edefce2dec8a5fc4ddd6458b5fbb349bf2b42bf7b302a3d052d44b82e799a5de9d2c3442a5761d6baa77ec2051244b8184b5f35902",
                },
            ],
            auxiliaryDataSupplement: {
                type: TxAuxiliaryDataSupplementType.CATALYST_REGISTRATION,
                auxiliaryDataHashHex: "d19f7cb4d48a6ae8d370c64d2a42fca1f61d6b2cf3d0c0c02801541811338deb",
                catalystRegistrationSignatureHex: "1514b6bbc582b33edcf5fa30ec04dcaa62128de8755c786768ae5922132c2aa50b9ba17be28072de979f45b0f429c7f5d489c549a1e22bc8e7d0b2445c103609",
            },
        },
    },
]

export type InvalidTokenBundleOrderingTestcase = {
  testname: string,
  tx: Transaction,
  signingMode: TransactionSigningMode
  rejectReason: InvalidDataReason
}

export const testsInvalidTokenBundleOrdering: InvalidTokenBundleOrderingTestcase[] = [
    // enforcing of asset groups order is removed for now and will be added back after the ordering is properly defined by a CIP
    // {
    //     testname: "Reject tx where asset groups are not ordered",
    //     tx: {
    //         ...maryBase,
    //         outputs: [outputs.multiassetInvalidAssetGroupOrdering],
    //     },
    //     rejectReason: InvalidDataReason.OUTPUT_INVALID_TOKEN_BUNDLE_ORDERING,
    // },
    {
        testname: "Reject tx where asset groups are not unique",
        tx: {
            ...maryBase,
            outputs: [outputs.multiassetAssetGroupsNotUnique],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        rejectReason: InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_UNIQUE,
    },
    // enforcing of asset order is removed for now and will be added back after the ordering is properly defined by a CIP
    // {
    //     testname: "Reject tx where tokens within an asset group are not ordered - alphabetical",
    //     tx: {
    //         ...maryBase,
    //         outputs: [outputs.multiassetInvalidTokenOrderingSameLength],
    //     },
    //     rejectReason: InvalidDataReason.OUTPUT_INVALID_ASSET_GROUP_ORDERING,
    // },
    // {
    //     testname: "Reject tx where tokens within an asset group are not ordered - length",
    //     tx: {
    //         ...maryBase,
    //         outputs: [outputs.multiassetInvalidTokenOrderingDifferentLengths],
    //     },
    //     rejectReason: InvalidDataReason.OUTPUT_INVALID_ASSET_GROUP_ORDERING,
    // },
    {
        testname: "Reject tx where tokens within an asset group are not unique",
        tx: {
            ...maryBase,
            outputs: [outputs.multiassetTokensNotUnique],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        rejectReason: InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_NOT_UNIQUE,
    },
    // !! canonical ordering is temporarily out of the codebase !!
    // {
    //     testname: "Reject tx with mint fields with invalid canonical ordering of policies",
    //     tx: {
    //         ...maryBase,
    //         outputs: [],
    //         mint: mints.mintInvalidCanonicalOrderingPolicy,
    //     },
    //     signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    //     rejectReason: InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_ORDERING,
    // },
    // {
    //     testname: "Reject tx with mint fields with invalid canonical ordering of asset names",
    //     tx: {
    //         ...maryBase,
    //         outputs: [],
    //         mint: mints.mintInvalidCanonicalOrderingAssetName,
    //     },
    //     signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    //     rejectReason: InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_ORDERING,
    // },
]

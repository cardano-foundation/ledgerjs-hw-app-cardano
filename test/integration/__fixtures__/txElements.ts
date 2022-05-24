import type { AssetGroup, TxInput, TxOutput, TxOutputDestination} from "../../../src/types/public"
import { AddressType, TxOutputDestinationType } from "../../../src/types/public"
import utils, { str_to_path } from "../../../src/utils"
import { bech32_to_hex, Networks } from "../../test_utils"

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
// const bech32_to_hex = (str: string): string => utils.buf_to_hex(utils.bech32_decodeAddress(str))

export const destinations: Record<
  | 'externalByronMainnet'
  | 'externalByronDaedalusMainnet'
  | 'externalByronTestnet'
  | 'externalShelleyBaseKeyhashKeyhash'
  | 'externalShelleyBaseScripthashKeyhash'
  | 'externalShelleyBaseKeyhashScripthash'
  | 'internalByronMainnet'
  | 'internalBaseWithStakingKeyHash'
  | 'internalBaseWithStakingPath'
  | 'internalBaseWithStakingScript'
  | 'internalBaseWithStakingPathNonReasonable'
  | 'internalEnterprise'
  | 'internalPointer'
  | 'multiassetThirdParty'
  | 'rewardsKeyPath'
  | 'rewardsScriptHash'
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
    externalShelleyBaseKeyhashKeyhash: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            // 017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09da61d425f3461114
            addressHex: bech32_to_hex(
                "addr1q97tqh7wzy8mnx0sr2a57c4ug40zzl222877jz06nt49g4zr43fuq3k0dfpqjh3uvqcsl2qzwuwsvuhclck3scgn3vya5cw5yhe5vyg5x20akz"
            ),
        },
    },
    externalShelleyBaseScripthashKeyhash: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            // 105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e
            addressHex: bech32_to_hex(
                "addr_test1zp0z7zqwhya6mpk5q929ur897g3pp9kkgalpreny8y304rfw6j2jxnwq6enuzvt0lp89wgcsufj7mvcnxpzgkd4hz70z3h2pnc8lhq8r"
            ),
        },
    },
    externalShelleyBaseKeyhashScripthash: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            addressHex: bech32_to_hex(
                "addr1yyfatq352yhh7ctw7c3s33qpwrq3pvhcmqg0yvzq9308g9msqj6hs5cg8q8zmtpf2hfrfds25jmcvpta6k5nnpzrn5eqy6fknd"
            ),
        },
    },
    internalByronMainnet: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/0'/0/0"),
            },
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
    internalBaseWithStakingScript: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/0"),
                stakingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
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
    rewardsKeyPath: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.REWARD_KEY,
            params: {
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
    },
    rewardsScriptHash: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
            type: AddressType.REWARD_SCRIPT,
            params: {
                stakingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
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
  | 'externalShelleyBaseKeyhashKeyhash'
  | 'externalShelleyBaseScripthashKeyhash'
  | 'internalBaseWithStakingKeyHash'
  | 'internalBaseWithStakingPath'
  | 'internalBaseWithStakingPathNonReasonable'
  | 'internalEnterprise'
  | 'internalPointer'
  | 'multiassetOneToken'
  | 'multiassetManyTokens'
  | 'multiassetChange'
  | 'multiassetBigNumber'
  | 'multiassetInvalidAssetGroupOrdering'
  | 'multiassetAssetGroupsNotUnique'
  | 'multiassetInvalidTokenOrderingSameLength'
  | 'multiassetInvalidTokenOrderingDifferentLengths'
  | 'multiassetTokensNotUnique'
  | 'trezorParity'
  | 'trezorParityDatumHash'
  | 'datumHashInternal'
  | 'datumHashExternal'
  | 'datumHashWithTokens'
  | 'missingDatumHashWithTokens'
  | 'datumHashStakePath'
  | 'datumHashStakePathExternal'
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
    externalShelleyBaseKeyhashKeyhash: {
        amount: 1,
        destination: destinations.externalShelleyBaseKeyhashKeyhash,
    },
    externalShelleyBaseScripthashKeyhash: {
        amount: 1,
        destination: destinations.externalShelleyBaseScripthashKeyhash,
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
    multiassetInvalidAssetGroupOrdering: {
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
                policyIdHex: "71a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "7564247542686911",
                        amount: "47",
                    },
                ],
            },
        ],
    },
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
    multiassetInvalidTokenOrderingSameLength: {
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
                        assetNameHex: "74652474436f696e",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
    multiassetInvalidTokenOrderingDifferentLengths: {
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
                        assetNameHex: "756424754268",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
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
    trezorParityDatumHash: {
        destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
                addressHex: bech32_to_hex(
                    "addr1w9rhu54nz94k9l5v6d9rzfs47h7dv7xffcwkekuxcx3evnqpvuxu0"
                ),
            },
        },
        amount: 1,
        datumHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
    },
    datumHashInternal: {
        destination: destinations.internalBaseWithStakingScript,
        amount: 7120787,
        datumHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
    },
    datumHashExternal: {
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        datumHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
    },
    datumHashWithTokens: {
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        tokenBundle: [
            {
                policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "7564247542686911",
                        amount: "47",
                    },
                    {
                        assetNameHex: "7564247542686912",
                        amount: "7878754",
                    },
                ],
            },
        ],
        datumHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
    },
    missingDatumHashWithTokens: {
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        tokenBundle: [
            {
                policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                tokens: [
                    {
                        assetNameHex: "7564247542686911",
                        amount: "47",
                    },
                    {
                        assetNameHex: "7564247542686912",
                        amount: "7878754",
                    },
                ],
            },
        ],
    },
    datumHashStakePath: {
        destination: destinations.internalBaseWithStakingPath,
        amount: 7120787,
        datumHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
    },
    datumHashStakePathExternal: {
        destination: destinations.externalShelleyBaseKeyhashKeyhash,
        amount: 7120787,
        datumHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
    },
}

export const shelleyBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    outputs: [outputs.externalByronMainnet],
    fee: 42,
    ttl: 10,
}

export const maryBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    fee: 42,
    ttl: 10,
    // FIXME: this is quite unreasonable as validity start is after ttl
    validityIntervalStart: 47,
}

export const mainnetFeeTtl = {
    network: Networks.Mainnet,
    fee: 42,
    ttl: 10,
}

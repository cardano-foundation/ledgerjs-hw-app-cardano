import type {AssetGroup, TxInput, TxOutput, TxOutputDestination} from "../../../src/types/public"
import {AddressType, DatumType, TxOutputDestinationType, TxOutputFormat} from "../../../src/types/public"
import utils, {str_to_path} from "../../../src/utils"
import {bech32_to_hex, Networks} from "../../test_utils"

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
            // 017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09
            addressHex: bech32_to_hex(
                "addr1q97tqh7wzy8mnx0sr2a57c4ug40zzl222877jz06nt49g4zr43fuq3k0dfpqjh3uvqcsl2qzwuwsvuhclck3scgn3vys6wkj5d"
            ),
        },
    },
    externalShelleyBaseScripthashKeyhash: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            // 105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e
            addressHex: bech32_to_hex(
                "addr_test1zp0z7zqwhya6mpk5q929ur897g3pp9kkgalpreny8y304rfw6j2jxnwq6enuzvt0lp89wgcsufj7mvcnxpzgkd4hz70qe8ugl4"
            ),
        },
    },
    externalShelleyBaseKeyhashScripthash: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
            // 2113d58234512f7f616ef62308c40170c110b2f8d810f230402c5e74177004b5785308380e2dac2955d234b60aa4b786057dd5a93984439d32
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
    | 'mintWithDecimalPlaces'
    | 'mintAmountVariety'
    | 'mintInvalidCanonicalOrderingPolicy'
    | 'mintInvalidCanonicalOrderingAssetName'
  , Array<AssetGroup>
> = {
    mintWithDecimalPlaces: [
        {
            policyIdHex: "6954264b15bc92d6d592febeac84f14645e1ed46ca5ebb9acdb5c15f",
            tokens: [
                {
                    // fingerprint: asset155nxgqj5acff7fdhc8ranfwyl7nq4ljrks7l6w
                    assetNameHex: "5354524950",
                    amount: "-3456789", // -3,456.789
                },
            ],
        },
        {
            policyIdHex: "af2e27f580f7f08e93190a81f72462f153026d06450924726645891b",
            tokens: [
                {
                    // fingerprint: asset14yqf3pclzx88jjahydyfad8pxw5xhuca6j7k2p
                    assetNameHex: "44524950",
                    amount: "1234", // 0.01234
                },
                {
                    // fingerprint: asset12wejgxu04lpg6h3pm056qd207k2sfh7yjklclf
                    assetNameHex: "ffffffffffffffffffffffff",
                    amount: "1234", // 1,234 with warning
                },
            ],
        },
    ],
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
  | 'internalBaseWithStakingPathBabbage'
  | 'internalBaseWithStakingPathNonReasonable'
  | 'internalEnterprise'
  | 'internalPointer'
  | 'multiassetOneToken'
  | 'multiassetManyTokens'
  | 'multiassetManyTokensBabbage'
  | 'multiassetManyTokensInlineDatumBabbage'
  | 'multiassetDecimalPlaces'
  | 'multiassetChange'
  | 'multiassetBigNumber'
  | 'multiassetInvalidAssetGroupOrdering'
  | 'multiassetAssetGroupsNotUnique'
  | 'multiassetInvalidTokenOrderingSameLength'
  | 'multiassetInvalidTokenOrderingDifferentLengths'
  | 'multiassetTokensNotUnique'
  | 'trezorParity1'
  | 'trezorParity2'
  | 'trezorParityDatumHash1'
  | 'trezorParityDatumHash2'
  | 'trezorParityBabbageOutputs'
  | 'datumHashInternal'
  | 'datumHashExternal'
  | 'datumHashWithTokens'
  | 'missingDatumHashWithTokens'
  | 'datumHashStakePath'
  | 'datumHashStakePathExternal'
  | 'internalBaseWithStakingPathMap'
  | 'internalBaseWithTokensMap'
  | 'datumHashExternalMap'
  | 'datumHashScriptRefExternalMap'
  | 'datumHashScriptRef240ExternalMap'
  | 'datumHashScriptRef304ExternalMap'
  | 'datumHashWithTokensMap'
  | 'inlineDatumWithTokensMap'
  | 'inlineDatum480Map'
  | 'inlineDatum304WithTokensMap'
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
    internalBaseWithStakingPathBabbage: {
        format: TxOutputFormat.MAP_BABBAGE,
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
    multiassetManyTokensBabbage: {
        format: TxOutputFormat.MAP_BABBAGE,
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
    multiassetManyTokensInlineDatumBabbage: {
        format: TxOutputFormat.MAP_BABBAGE,
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
        datum: {
            type:DatumType.INLINE,
            datumHex: "5579657420616e6f746865722063686f636f6c617465",
        },
    },
    multiassetDecimalPlaces: {
        destination: destinations.multiassetThirdParty,
        amount: "1234",
        tokenBundle: [
            {
                policyIdHex: "6954264b15bc92d6d592febeac84f14645e1ed46ca5ebb9acdb5c15f",
                tokens: [
                    {
                        // fingerprint: asset155nxgqj5acff7fdhc8ranfwyl7nq4ljrks7l6w
                        assetNameHex: "5354524950",
                        amount: "3456789", // 3,456.789
                    },
                ],
            },
            {
                policyIdHex: "af2e27f580f7f08e93190a81f72462f153026d06450924726645891b",
                tokens: [
                    {
                        // fingerprint: asset14yqf3pclzx88jjahydyfad8pxw5xhuca6j7k2p
                        assetNameHex: "44524950",
                        amount: "1234", // 0.01234
                    },
                    {
                        // fingerprint: asset12wejgxu04lpg6h3pm056qd207k2sfh7yjklclf
                        assetNameHex: "ffffffffffffffffffffffff",
                        amount: "1234", // 1,234 with warning
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
    trezorParity1: {
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
    trezorParity2: {
        format: TxOutputFormat.ARRAY_LEGACY,
        destination: destinations.externalShelleyBaseKeyhashKeyhash,
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
    trezorParityDatumHash1: {
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
    trezorParityDatumHash2: {
        format: TxOutputFormat.ARRAY_LEGACY,
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
    trezorParityBabbageOutputs: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
                addressHex: bech32_to_hex(
                    "addr1w9rhu54nz94k9l5v6d9rzfs47h7dv7xffcwkekuxcx3evnqpvuxu0"
                ),
            },
        },
        amount: 1,
        datum:{
            type: DatumType.INLINE,
            datumHex: "5579657420616e6f746865722063686f636f6c617465",
        } ,
        scriptHex: "0080f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
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
    internalBaseWithStakingPathMap: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: destinations.internalBaseWithStakingPath,
        amount: 7120787,
    },
    internalBaseWithTokensMap: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: destinations.internalBaseWithStakingPath,
        amount: 7120787,
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
        ],
    },
    datumHashExternalMap: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        datum: {
            type: DatumType.HASH,
            datumHashHex:"ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
        },
    },
    datumHashScriptRefExternalMap: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        datum: {
            type: DatumType.HASH,
            datumHashHex:"ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
        },
        scriptHex: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    },
    datumHashScriptRef240ExternalMap: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        datum: {
            type: DatumType.HASH,
            datumHashHex:"ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
        },
        scriptHex: "4784392787cc567ac21d7b5346a4a89ae112b7ff7610e402284042aa4e6efca7956a53c3f5cb3ec6745f5e21150f2a77bd71a2adc3f8b9539e9bab41934b477f60a8b302584d1a619ed9b178b5ce6fcad31adc0d6fc17023ede474c09f29fdbfb290a5b30b5240fae5de71168036201772c0d272ae90220181f9bf8c3198e79fc2ae32b076abf4d0e10d3166923ce56994b25c00909e3faab8ef1358c136cd3b197488efc883a7c6cfa3ac63ca9cebc62121c6e22f594420c2abd54e78282adec20ee7dba0e6de65554adb8ee8314f23f86cf7cf0906d4b6c643966baf6c54240c19f4131374e298f38a626a4ad63e61",
    },
    datumHashScriptRef304ExternalMap: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        datum: {
            type: DatumType.HASH,
            datumHashHex:"ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
        },
        scriptHex: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeaddeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeaddeadbeef",
    },
    datumHashWithTokensMap: {
        format: TxOutputFormat.MAP_BABBAGE,
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
        datum: {
            type:DatumType.HASH,
            datumHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",

        },
    },
    inlineDatumWithTokensMap: {
        format: TxOutputFormat.MAP_BABBAGE,
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
        datum: {
            type: DatumType.INLINE,
            datumHex: "5579657420616e6f746865722063686f636f6c617465",

        },
    },
    inlineDatum480Map: {
        format: TxOutputFormat.MAP_BABBAGE,
        destination: destinations.externalShelleyBaseScripthashKeyhash,
        amount: 7120787,
        datum: {
            type: DatumType.INLINE,
            datumHex: "12b8240c5470b47c159597b6f71d78c7fc99d1d8d911cb19b8f50211938ef361a22d30cd8f6354ec50e99a7d3cf3e06797ed4af3d358e01b2a957caa4010da328720b9fbe7a3a6d10209a13d2eb11933eb1bf2ab02713117e421b6dcc66297c41b95ad32d3457a0e6b44d8482385f311465964c3daff226acfb7bbda47011f1a6531db30e5b5977143c48f8b8eb739487f87dc13896f58529cfb48e415fc6123e708cdc3cb15cc1900ecf88c5fc9ff66d8ad6dae18c79e4a3c392a0df4d16ffa3e370f4dad8d8e9d171c5656bb317c78a2711057e7ae0beb1dc66ba01aa69d0c0db244e6742d7758ce8da00dfed6225d4aed4b01c42a0352688ed5803f3fd64873f11355305d9db309f4a2a6673cc408a06b8827a5edef7b0fd8742627fb8aa102a084b7db72fcb5c3d1bf437e2a936b738902a9c0258b462b9f2e9befd2c6bcfc036143bb34342b9124888a5b29fa5d60909c81319f034c11542b05ca3ff6c64c7642ff1e2b25fb60dc9bb6f5c914dd4149f31896955d4d204d822deddc46f852115a479edf7521cdf4ce596805875011855158fd303c33a2a7916a9cb7acaaf5aeca7e6efb75960e9597cd845bd9a93610bf1ab47ab0de943e8a96e26a24c4996f7b07fad437829fee5bc3496192608d4c04ac642cdec7bdbb8a948ad1d434",
        },
    },
    inlineDatum304WithTokensMap: {
        format: TxOutputFormat.MAP_BABBAGE,
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
        datum: {
            type: DatumType.INLINE,
            datumHex: "5579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f74686572206374686572",
        },
    },
}

export const shelleyBase = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoShelley],
    outputs: [outputs.externalByronMainnet],
    fee: 42,
    ttl: 10,
}

export const mainnetFeeTtl = {
    network: Networks.Mainnet,
    fee: 42,
    ttl: 10,
}

export const testnetFeeTtl = {
    network: Networks.Testnet,
    fee: 42,
    ttl: 10,
}

import { CertificateType, Networks, TxRequiredSignerType } from "../../../src/Ada"
import { StakeCredentialParamsType, TransactionSigningMode } from '../../../src/types/public'
import { str_to_path } from "../../../src/utils/address"
import type { SignTxTestcase } from "./signTx"
import { inputs, mainnetFeeTtl, outputs } from "./txElements"


export const testsAlonzo: SignTxTestcase[] = [
    {
        testname: "Sign tx with script data hash",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            scriptDataHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0b5820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce1880f01",
        expectedResult: {
            txHashHex: "7c5aac719dd3e0888deef0c59d6daba9e578d0dc27f82ff4978fc2893cdc2202",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "5c66a4f75359a62b4b32751fe30a1adbf7ed2839fd4cb762e9a4d2b086de82fca2310bcf07efc2b03086211faa19941dbe059bbfb747e128863f339720e71304",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        // tx does not contain any Plutus elements, but should be accepted (differs only in UI)
        testname: "Sign tx with change output (Plutus)",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a",
        expectedResult: {
            txHashHex: "b72616520aac51e8f4d081cec9899d8113ba61488d736c81bff39521684d52ad",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "ea26a98ce5399280ec8ad553d155c0900396204f9fe5a33969f279752a53263188d643544cdb4ffed108017bc7544e80df924143866638faffcd11646e57710b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with datum hash in output",
        tx: {
            ...mainnetFeeTtl,
            network: Networks.Testnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.datumHashExternal],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181835839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e1a006ca7935820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        expectedResult: {
            txHashHex: "0ac3011036018a6ff19105464f2b98fd7c13e42eb369f930f23fe24f48fc40f4",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "afc57872d539c398acbb2d18c09796639029b4066ae3439925976d085b7150af418cf070b2ef80e907c20a2c942da4811b6847b1cd42fddc53d4c97732205d0d",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with datum hash in output with tokens",
        tx: {
            ...mainnetFeeTtl,
            network: Networks.Testnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.datumHashWithTokens],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181835839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a007838625820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        expectedResult: {
            txHashHex: "7ffbaefea15f1c24c069b39b30360f6a36da6e6dae1666108e873156c338e543",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "166a23e78036d5e776874bef45f86c757c60c5d1af83943982bbc1cc6bd68526cab1c554f2438c6a4c5491df00066b181891e5b97350e5b4fe367bf9a1317202",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        // tests the path where a warning about missing datum hash is shown on Ledger
        testname: "Sign tx with missing datum hash in output with tokens",
        tx: {
            ...mainnetFeeTtl,
            network: Networks.Testnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.missingDatumHashWithTokens],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a0078386202182a030a\n",
        expectedResult: {
            txHashHex: "c236cfde289e669a04fca8bd9a2b9b632fe4c08d31627da25ac517a40082df2a",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "ce096ed674ca863fb4af024f9341c8fd7fadd363ffc1b031cba65cb885f8d272759e69e44686e784d3a1e9b8b31c0e965752f13a79eb4095cd96ce26315c1903",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with collaterals",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            collaterals: [inputs.utxoByron],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0d818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc000f01",
        expectedResult: {
            txHashHex: "f08021608db631b5b5c1553042ac9722efbcdf738e0b256e7300963e66e41638",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "4867e65c60793b6bd60e677f30111d32f3f8dbf02a6f20985095bf8463b3062b5ad0669836d3e661dc1d0d710fd91f0756e6e5e0ab15cf829ab1f78226808a00",
                },
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex: "be7162dc1348a79aa5260f33bda84c3eb5f909b108b444ff109bc8fa670fa032fe9951686e004f95453eaa49a73ee9f7c6193d215af804df1ac818ff31efbd01",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with required signers - path",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            requiredSigners: [
                {
                    type: TxRequiredSignerType.PATH,
                    path: str_to_path("1852'/1815'/0'/0/0"),
                },
                {
                    type: TxRequiredSignerType.PATH,
                    path: str_to_path("1852'/1815'/0'/0/44"),
                },
            ],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0e82581c14c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f1124581c8195e13f380f93540b05a6fae0626438624dfc10f847a301c27d399d0f01",
        expectedResult: {
            txHashHex: "8e49327f2c95d6fd4e33ae0c0ec4269908a25c050f7f3db2ecfc0c56f62d1e36",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "378e21f528fba730349a158f3bd0a81fd6fe5ebd3b85f6d903d15b14873845b69c30f85e0c38cbeed04dd9b4140b2abca7653e930c0bf77ef90547417e0fe807",
                },
                {
                    path: str_to_path("1852'/1815'/0'/0/44"),
                    witnessSignatureHex: "bee209c2084baeb4a009b386bf53ed72ed549596d08e4991972c30500a0f1838e237b13d6f6041d5869280062a243dd128b98263d0021c81d1228eda3e6f6401",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with required signers - mixed",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            requiredSigners: [
                {
                    type: TxRequiredSignerType.HASH,
                    hashHex: "fea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a",
                },
                {
                    type: TxRequiredSignerType.PATH,
                    path: str_to_path("1852'/1815'/0'/0/0"),
                },
            ],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0e82581cfea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a581c14c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11240f01",
        expectedResult: {
            txHashHex: "9e41ce0d7bcc1bbef0d96fd025054a54d1435e7a1e1e66595f2ed594dabb5faf",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "f5b2eb79b74678d3237b757dfcb8a623a8f7f5a10c5925b256da7723935bc98bbfc91ebc001d0e18c2929c611c99d43352ab33ee2dda45b6c115689ddaeeb502",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with required signers - mixed",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            requiredSigners: [
                {
                    type: TxRequiredSignerType.HASH,
                    hashHex: "fea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a",
                },
                {
                    type: TxRequiredSignerType.PATH,
                    path: str_to_path("1852'/1815'/0'/0/0"),
                },
            ],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0e82581cfea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a581c14c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11240f01",
        expectedResult: {
            txHashHex: "9e41ce0d7bcc1bbef0d96fd025054a54d1435e7a1e1e66595f2ed594dabb5faf",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "f5b2eb79b74678d3237b757dfcb8a623a8f7f5a10c5925b256da7723935bc98bbfc91ebc001d0e18c2929c611c99d43352ab33ee2dda45b6c115689ddaeeb502",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with required signers - hash",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            requiredSigners: [
                {
                    type: TxRequiredSignerType.HASH,
                    hashHex: "fea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a",
                },
                {
                    type: TxRequiredSignerType.HASH,
                    hashHex: "eea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a",
                },
            ],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0e82581cfea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a581ceea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a0f01",
        expectedResult: {
            txHashHex: "4b4f95e418c5be9ffa0c1e819b8edc0a05396a8d77f75554c82727d423a49daa",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "d1f0aad96945c18f2620accc95b8f86831fb85ccc59f9f80478931435fbacae9d8c016879ed5d9274847dc882ee1b4da8abba0575b7ce613c4f2c3b59ab17808",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with mint path in a required signer",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalByronMainnet],
            requiredSigners: [
                {
                    type: TxRequiredSignerType.PATH,
                    path: str_to_path("1855'/1815'/0'"),
                },
            ],
        },
        additionalWitnessPaths: [str_to_path("1855'/1815'/0'")],
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a0e81581c43040068ce85252be6164296d6dca9595644bbf424b56b7424458227",
        expectedResult: {
            txHashHex: "728bbc72445c3a17a9d56d1cb6a99b1362d3bcbf508fcb153320dfa62e4b42ba",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "3dcd818effb503e4cf9d7c3836c29498d5258de7775915bf376eccae95e1b933afa5372478f136720b3c60346c9e674efea9f4b222916c96f0805962a16e9806",
                },
                {
                    path: str_to_path("1855'/1815'/0'"),
                    witnessSignatureHex: "29d3410bf89fa938a73fb27df35a30910fb3111eb941e835946fd30c0bfcc377c7b8a8ac15dc807f995fb482efdf57e6d697d0d3effaa5cab104861698e39900",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with key hash in stake credential",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            certificates: [
                {
                    type: CertificateType.STAKE_DELEGATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_HASH,
                            keyHashHex: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
            withdrawals: [
                {
                    stakeCredential: {
                        type: StakeCredentialParamsType.KEY_HASH,
                        keyHashHex: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                    },
                    amount: 1000,
                },
            ],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a700818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a048183028200581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497305a1581de129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd1903e80f01",
        expectedResult: {
            txHashHex: "7ae1c854aad0469a08cd678786ed9a70791808afd6dd1a7deaae72df12430baa",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "c986cf978bb08f49f0c50032c8eafa7fddce2a748d3bb0edc0245b5a205a60c55a5ad389d17b897cb83cfe34567c446afed4fd9d64a8304d02c55b9579685d0a",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

export const testsBabbage: SignTxTestcase[] = [
    {
        testname: "Sign tx with script data hash",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            scriptDataHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0b5820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce1880f01",
        expectedResult: {
            txHashHex: "7c5aac719dd3e0888deef0c59d6daba9e578d0dc27f82ff4978fc2893cdc2202",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "5c66a4f75359a62b4b32751fe30a1adbf7ed2839fd4cb762e9a4d2b086de82fca2310bcf07efc2b03086211faa19941dbe059bbfb747e128863f339720e71304",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        // tx does not contain any Plutus elements, but should be accepted (differs only in UI)
        testname: "Sign tx with change output (Plutus) Babbage format",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.internalBaseWithStakingPathMap],
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a",
        expectedResult: {
            txHashHex: "0318d9550a6de08e565a8882891ea7fbbfae1b9c3083e53aa3cf301153044d58",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "5a74df477b9a6e8995693994732c5f7a7fb8aad1c240a04358a8e40bc611c24c2ff3df0e64ce5a4022ea3a691d824e483fadaec3b246760ace5511749056890a",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with datum hash in output in Babbage format",
        tx: {
            ...mainnetFeeTtl,
            network: Networks.Testnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.datumHashExternalMap],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a3005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e011a006ca7930282005820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        expectedResult: {
            txHashHex: "ebdafe8cac49e39d96a9532c58e3e55713ec3e37897d576fcfdf1f25a70bd0f8",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "087d9a41ab06689f8c8679adac619545cfefb90bf2b8b370292b1c96bc29870a1eee912eda2714a8f73a59d4e837d3b366b3c926998943499d831d9c05c4400f",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with datum hash in output with tokens in Babbage format",
        tx: {
            ...mainnetFeeTtl,
            network: Networks.Testnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.datumHashWithTokensMap],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a3005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e01821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a007838620282005820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        expectedResult: {
            txHashHex: "77c4e9441b6b5bc5a1157b2b54ac6c0165e6959ffbc378f0528fafd4e5d9ba64",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "ec6d5db61abe1daa9d43ea0e4e89b9151227b3e5937cb304fa5d7823d555625327b19f71d890ddc73401e3dcad61903c32d889241643f64fb218f98828643f08",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        // tx does not contain any Plutus elements, but should be accepted (differs only in UI)
        testname: "Sign tx with change output (Plutus) in Babbage format and Total Collateral",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.internalBaseWithStakingPathMap],
            totalCollateral: 10,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a110a",
        expectedResult: {
            txHashHex: "54b8acbf5c3d28c68d37e3c3b639a7c1f808663f5a9868f786db49e7c12d25f3",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "79f0ea0a193158b7b85058ba09291f3b733a09df8cc99a83ac1998623d53a45cb34ec6599fae27acffea866ab8b466bd19d354b2b709a5168e5552a74c4fc90e",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        // tx does not contain any Plutus elements, but should be accepted (differs only in UI)
        testname: "Sign tx with change output (Plutus) in Babbage format and Reference Input",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.internalBaseWithStakingPathMap],
            collaterals: [inputs.utxoShelley],
            referenceInputs: [inputs.utxoShelley],
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "A600818258203B40265111D8BB3C3C608D95B3A0BF83461ACE32D79336579A1939B3AAD1C0B7000181A20058390114C16D7F43243BD81478E68B9DB53A8528FD4FB1078D58D54A7F11241D227AEFA4B773149170885AADBA30AAB3127CC611DDBC4999DEF61C011A006CA79302182A030A0D818258203B40265111D8BB3C3C608D95B3A0BF83461ACE32D79336579A1939B3AAD1C0B70012818258203B40265111D8BB3C3C608D95B3A0BF83461ACE32D79336579A1939B3AAD1C0B700",
        expectedResult: {
            txHashHex: "fb7091c4663cb54099a292945a4259680bca9beed060568dd93a6d0d5d37a7c1",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "5a0960fc89422aa07bd2c25742cf35894b2047d42d542db0f29d5f22489cd137b5dce422ae4fcfbbbd915bc58b82f55441e04db6ee818fe9415028234893c001",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        // tx does not contain any Plutus elements, but should be accepted (differs only in UI)
        testname: "Sign tx with change output (Plutus) in Babbage format and multiple Reference Inputs",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.internalBaseWithStakingPathMap],
            collaterals: [inputs.utxoShelley],
            referenceInputs: [inputs.utxoShelley,inputs.utxoShelley],
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a0d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70012828258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7008258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700\n",
        expectedResult: {
            txHashHex: "a1cf02dafe36567a46276def8293afa77bc000331fafc5463297f94e7410605e",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "4c2398b4e4852eee1c3d381cb82ef245fb1a9d401a99cf7c95de52527a621a65705cb9d369aebaf49ebdaf09402d8e735cab8f3de8d93c34156e4ad83eb62907",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]
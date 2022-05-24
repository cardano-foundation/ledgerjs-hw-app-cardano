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
        // TODO somewhat odd since it does not contain any Plutus elements, differs only in UI
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
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018183583d105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e1a006ca7935820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        expectedResult: {
            txHashHex: "9bc6b304b751817c7d661d8d91a6a9c8df20395c3a80363b15fe97a5c0512426",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "a528a2574a5fdfff39102c00c8ff73ee295e68d50822b1173751bb6e183b96f4032e2b4e10df405bd9053f27631b69cbf0902e83bdfd5578f1fac0c749599e00",
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
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018183583d105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a007838625820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        expectedResult: {
            txHashHex: "baa2a49cb3a39a186823174d83816395f5ff47d9d86251b5274bd902cd209a8f",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "f0bfc7765ef2556c4efe8b7dc7851703ff5b985bb2e6389f0a344afedcdbec869d6139e8ee566c3ffd8ccfbe2b7a7158f305ac9944384096c2d64c19d0099d02",
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
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583d105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a0078386202182a030a",
        expectedResult: {
            txHashHex: "ba0d8838e02f9fad6778bc02b6da39fbef85bd8e887b026a570962032035a506",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "6643523bfebbe604a09fbd313e841be7b98f252067e82221f0db4dd7e1cf1233d1c0b10c1f6f42158ab6ca1c1d90da85ae8d81600875bc18f4911243eb5af306",
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

import type { Transaction } from "../../../src/Ada"
import { CertificateType, Networks, TxAuxiliaryDataType } from "../../../src/Ada"
import type { BIP32Path, SignedTransactionData} from '../../../src/types/public'
import { StakeCredentialParamsType, TransactionSigningMode } from '../../../src/types/public'
import { str_to_path } from "../../../src/utils/address"
import { inputs, mainnetFeeTtl, mints, outputs, shelleyBase, testnetFeeTtl } from "./txElements"

export type SignTxTestcase = {
    testname: string;
    tx: Transaction;
    signingMode: TransactionSigningMode;
    additionalWitnessPaths?: BIP32Path[];
    txBody?: string;
    txAuxiliaryData?: string;
    expectedResult: SignedTransactionData;
}


export const testsByron: SignTxTestcase[] = [
    {
        testname: "Sign tx with third-party Byron mainnet output",
        tx: {
            inputs: [inputs.utxoByron],
            fee: 42,
            ttl: 10,
            network: Networks.Mainnet,
            outputs: [outputs.externalByronMainnet],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a",
        expectedResult: {
            txHashHex: "73e09bdebf98a9e0f17f86a2d11e0f14f4f8dae77cdf26ff1678e821f20c8db6",
            witnesses: [
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex: "9c12b678a047bf3148e867d969fba4f9295042c4fff8410782425a356820c79e7549de798f930480ba83615a5e2a19389c795a3281a59077b7d37cd5a071a606",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with third-party Byron Daedalus mainnet output",
        tx: {
            inputs: [inputs.utxoByron],
            fee: 42,
            ttl: 10,
            network: Networks.Mainnet,
            outputs: [outputs.externalByronDaedalusMainnet],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182584c82d818584283581cd2348b8ef7b8a6d1c922efa499c669b151eeef99e4ce3521e88223f8a101581e581cf281e648a89015a9861bd9e992414d1145ddaf80690be53235b0e2e5001a199834651a002dd2e802182a030a",
        expectedResult: {
            txHashHex: "3cf35b4d9bfa87b8eab5de659e0520bdac37b0de0b3840c1d8abd683330a9756",
            witnesses: [
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex: "fdca7969a3e8bc091c9ee32c04732f79bb7c0091f1796fd2c0e1de8aa8547a00457d50d0576f4dd421baf754499cf0e77584e848e3547addd5d5b7167597a307",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with third-party Byron testnet output",
        tx: {
            inputs: [inputs.utxoByron],
            fee: 42,
            ttl: 10,
            network: {
                ... Networks.Testnet,
                // legacy Byron testnet used 42 for protocol magic
                // it's encoded into the Byron address we use
                protocolMagic: 42,
            },
            outputs: [outputs.externalByronTestnet],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582f82d818582583581c709bfb5d9733cbdd72f520cd2c8b9f8f942da5e6cd0b6994e1803b0aa10242182a001aef14e76d1a002dd2e802182a030a",
        expectedResult: {
            txHashHex: "e2319ee8317ac537af4c2c3322aaf9fb6c64a95e3921ad75ab91b4f5b5306963",
            witnesses: [
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex: "224d103185f4709f7b749339ff7ba432d50ca5cb742678847f5e574858cf7dda7ed402399a9ddba81ecd731b6f939ba07a247cd570dcd543f83a9aeadc4f9603",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]


export const testsShelleyNoCertificates: SignTxTestcase[] = [
    {
        testname: "Sign tx without outputs",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: undefined,
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a",
        expectedResult: {
            txHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "190dcee0cc7125fd0ec104cf685674f1ad77f3e439a4a249e596a3306f9eb110ced8fb8ec59da15b721203c8973bd341d88e6a60b85c1e9f2623152fee8dc00a",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx without change address",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalShelleyBaseKeyhashKeyhash],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a",
        expectedResult: {
            txHashHex: "5268bdedcdbd3e2bad037cd292b3832ff2c77c8c628c37485da2dd930f5fc32a",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "ef73b0838e831dc86278e450ef36fecf4b7ad712dabb901f0d8470b6046ced8246cd086a15ad4c723c0cf01b685d8113e72a01511a5ceba374ebb8f4417afd0a",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with change base address with staking path",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoByron],
            outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e88258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a",
        expectedResult: {
            txHashHex: "5fac237a413de9337149b4735e7bad3ecccb8813bb03056332312cf56932df30",
            witnesses: [
                {
                    path: str_to_path("44'/1815'/0'/0/0"),
                    witnessSignatureHex: "4d29b3a66a152819baf9eb4866ab13ff6c5279ed80157463b96e2fd55aed14fa01d9df1de2a32560354da3db4f34cad79772804356401fa22523aabfd0363f03",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with change base address with staking key hash",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingKeyHash],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e88258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f1124122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42771a006ca79302182a030a",
        expectedResult: {
            txHashHex: "f475a32afbf7b028fb794f81311a10f655afbbdf1d0201e5c801010a8cde9ea7",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "4ac5017c014886406a38a45417a165156280be63ca6975a5acffcabc0cc842ca603248b8a7ebfa729d7affce34518f4ca94fe797420a4d7aa0ef8c2b0ddfba0b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with enterprise change address",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalByronMainnet, outputs.internalEnterprise],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e882581d6114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241a006ca79302182a030a",
        expectedResult: {
            txHashHex: "c192b24a87d45c768f7f33ed37998054db96d34558e59afebabe51cfb7034b65",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "70559415746a9646dc492b7758e18cb367c005ab0479558b3d540be2310eb1bb1dd0839081e22c0b4727e8bd8e163cfbfe9def99a8506fb4a6787a200862e00f",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with pointer change address",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalByronMainnet, outputs.internalPointer],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e88258204114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11240102031a006ca79302182a030a",
        expectedResult: {
            txHashHex: "4b19e27ffc006ace16592311c4d2f0cafc255eaa47a6178ff540c0a46d07027c",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "1838884e08cf6966ebe6b3e775191c4f08d90834723421779efd6aa96e52ffc91a24e5073abe6db94c74fe080d008258b3d989c159d9b87a9c778a51404abc08",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with non-reasonable account and address",
        tx: {
            ...mainnetFeeTtl,
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901f90b0dfcace47bf03e88f7469a2f4fb3a7918461aa4765bfaf55f0dae260546c20562e598fb761f419dad27edcd49f4ee4f0540b8e40d4d51a006ca79302182a030a075820deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        expectedResult: {
            txHashHex: "40b3a79c645be040139078befee154d5f935c8ba2af6144cebcf447f8ef2e580",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/456'/0/0"),
                    witnessSignatureHex: "bb1a035acf4a7b5dd68914f0007dfc4d1cc7b4d88748c0ad24326fd06597542ce0352075ed861b3ae012ab976cacd3dbbc58802cdf82409917ebf9a8bb182e04",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with path based withdrawal",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalByronMainnet],
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a05a1581de11d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c186f",
        expectedResult: {
            txHashHex: "dfc63f395fba4bbf8d3507d05c455f0db7d85d0cabdd6f033c6112d6c32a6b93",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "22ef3b54a54a1f5390436911b23328225f92c660eb251189fceab2fa428187a2cec584ea5f6f9c9fcdf7f19bc496b3b2b9bb416ad07a3d31d73fbc0c05bec10c",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex: "04b995979c2072b469c1e0ace5331c3d188e3e65d5a6f06aa4e608fb18a3588621370ee1b5d39d55afe0744aa4906785baa07210dc4cb49594eba507f7215102",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with auxiliary data hash",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalByronMainnet],
            auxiliaryData: {
                type: TxAuxiliaryDataType.ARBITRARY_HASH,
                params: {
                    hashHex: "deadbeef".repeat(8),
                },
            },
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a075820deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        expectedResult: {
            txHashHex: "34c1dd59c14252008b680bf6a727c8f371e2d96e8bca6b783bcf3f8f36407e6f",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "953c5243ba09570dd4e52642236834c138ad4abbbb21796a90540a11e8dc96e47043401d370cdaed70ebc332dd4db80c9b167fd7f20971c4f142875cea57200c",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]


export const testsShelleyWithCertificates: SignTxTestcase[] = [
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182008200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
        expectedResult: {
            txHashHex: "a119ec712822b2f4bc96737121f286cf149ac2f8de2230e0d675f074094d1cd6",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "9825594e5a91333b9f5762665ba316af34c2208bd7ef073178af5e48f2aae8673d50436045e292d5bb9be7492eeeda475a04e58621a326c91049a2ef26a33200",
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048183028200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
        expectedResult: {
            txHashHex: "7afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c808b3a8aa",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "d94c8f8fe73946c25f3bd0919d05a60b8373ef0a7261fa73eefe1f2a20e8a4c3401feb5eea701222184fceab2c45b47bd823ac76123e2d17f804d3e4ed2df909",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex: "035b4e6ae6f7a8089f2a302ddcb60bc56d48bcf267fdcb071844da5ce3086d51e816777a6fb5eabfcb326a32b830674ac0de40ee1b2360a69adba4b64c662404",
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182018200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
        expectedResult: {
            txHashHex: "8b143fae3b37748fee1decdc10fbfa554158b58fbc99623ecdd2ba7aa709e471",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "6136510eb91449474f6137c8d1c7c69eb518e3844a3e63a626be8cf4af91afa24e12f4fa578398bf0e7992e22dcfc5f9773fb8546b88c19e3abfdaa3bbe7a304",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex: "77210ce6533a76db3673af1076bf3933747a8d81cabda80c8bc9c852c78685f8a42c9372721bdfe9b47611039364afb3391031211b5c427cfec0c5c505cfec0c",
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048282018200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c82018200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
        expectedResult: {
            txHashHex: "8d720755bcbc724fc71a1868bafbd057d855a176362417f62711a34f2d9b896d",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "04e071e39903e7e1e3ea9d26ce6822d5cbef88ee389f4f63a585668a5a6df98924dca16f8f61c01909162730014bb309fc7043b80ac54375697d6e9c01df0a0c",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex: "7b53ba805658d801baa39546777b611ed071c89938daea50c2c3275358abec2c1d67c8062b24fc4778e09af13e58ea33dd7d0627e221574386716aaa25e1f20b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with pool retirement combined with stake registration",
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a04828304581cdbfee4665e58c8f8e9b9ff02b17f32e08a42c855476a5d867c2737b70a82008200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
        expectedResult: {
            // WARNING: only as computed by ledger, not verified with cardano-cli
            txHashHex: "70aea83c8e5e9a3e0ec92860d5bd4750c34911193f092a96b9da6906d6ea6247",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "8212cdabe1be514fdc21e02a2b405ce284ebbce0208a5c2b289dac662bf87fb4c2d18237c66761e285d78ee76cc26b7517718e641174d69f49737a49e9482607",
                },
                {
                    path: str_to_path("1853'/1815'/0'/0'"),
                    witnessSignatureHex: "9386c2545e2671497daf95db93be1386690a4f884547a60f2913ef8a9e61486ba068d7477e1cd712f8d9cc20778d9e71b72eda96c9394c2f3111c61803f9a70d",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with pool retirement combined with stake deregistration",
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a04828304581cdbfee4665e58c8f8e9b9ff02b17f32e08a42c855476a5d867c2737b70a82018200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
        expectedResult: {
            // WARNING: only as computed by ledger, not verified with cardano-cli
            txHashHex: "edbafe86ae40467d2a02b917aa782eb9c37d2fbc4e316a3c446c0d3946231882",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "82bc899f008446e57daef9dc750d500d43f12fdd1e353d5ab8b42100a7bb94c9794de5e1ce03c06775e7da581f9cb08427e1d8b491d39ddfb3db060de3001700",
                },
                {
                    path: str_to_path("1853'/1815'/0'/0'"),
                    witnessSignatureHex: "4f58bfe90112eee3ce66edb7196506b5548c1c342619ee125e1f35fdbe009736593b3bfa80622727b6debc72626d60e3c4cb2d35007da9478baa4109dd80d004",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex: "1c926e24d825d699a4b2d5d7dc95d717d4c19a0196ed120f115c76a168a7e661e6c393c4f97fe7b7533f20017be834fae53711265a3fe52b4c4211ac18990007",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]


export const testsMultisig: SignTxTestcase[] = [
    {
        testname: "Sign tx without change address with Shelley scripthash output",
        tx: {
            ...testnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalShelleyBaseScripthashKeyhash],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0")],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e0102182a030a",
        expectedResult: {
            txHashHex: "1e994755bafebf435f91e34655ba6a66ee92de64529dc811dce7001d92b0a44a",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/0/0"),
                    witnessSignatureHex: "9c06b237c35be528a3f550e469e38c32c29a58417d489d8d4f1276a2111b2f6feca9b84d658f5e51ee7921512fe935e11defc7a1ff6152f76ea590baca04f307",
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
                        scriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                    },
                    amount: 111,
                },
            ],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a05a1581df1122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277186f",
        expectedResult: {
            txHashHex: "87de2c36e5a222f796b392a290717316d039dc42dc2150873e86ec9b0c870357",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex: "64f26fb866f0840f2ec299db16e6eff9d039ebacf673bdd8dba5110078344bf9647c4038588bfc826c73d7e0c03ea2ffb028de632d9462a129fd78f3a1bd7c0e",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
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
                            scriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182008201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
        expectedResult: {
            txHashHex: "fba0908b41300d1b075ec6a7dafc2dcbe3376df17ef3feb2e4536b309f0034d1",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex: "bfb96452a106da86ff17c71692e25fac4826ae1c318c94d671fd7602229b411cf4422614cba241954a9bdb66bfd364bc9cfdf446639ff6e03273dc4073d66b0a",
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
                            scriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048183028201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
        expectedResult: {
            txHashHex: "927d8924e77c879bcc2a1e5317d963028737d0764c6532a05474d8eda203911d",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex: "78de23f120ff291913eee3d3981281d500e9476debb27bb640ff73eba53c1de452b5d9dba57d4353a37652f7a72a272e60a928fbf4181b70c031c9ba93888606",
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
                            scriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182018201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
        expectedResult: {
            txHashHex: "c4c8910810de8dc39aa0c33b65ee24f3f95216c7050f9ba85c00302a99f6d596",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex: "468e5dc048efa4985bb392248f6d8df3b4ed297a9cbe4b9670ac0cc0debc4e6dc00018a75079cf20c050f4bf9be1c9aecccae851d22fe940a72b25af802d910b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]


export const testsAllegra: SignTxTestcase[] = [
    {
        testname: "Sign tx with no ttl and no validity interval start",
        tx: {
            network: Networks.Mainnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalShelleyBaseKeyhashKeyhash],
            fee: 42,
            ttl: null,
            validityIntervalStart: null,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a300818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a",
        expectedResult: {
            txHashHex: "cbb6ee600297d0b5067b1e79cf1dc6361de4e5e731eacc57c42765944381ff18",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "4f6e3a61b48921fa0c3f67856fc955e754d16d210f0725ff31d959c53f830ddef354663040bc0bc4306127c3549f0c5339cc5a604512090a4fe26ebadc80550f",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with no ttl, but with validity interval start",
        tx: {
            network: Networks.Mainnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalShelleyBaseKeyhashKeyhash],
            fee: 42,
            ttl: null,
            validityIntervalStart: 47,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a08182f",
        expectedResult: {
            txHashHex: "9fbc15167cfdf408998b0348ff6e69e63f404d1f0acf65763a057003f8a3a93b",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "e245b89938ad182361d696dafb0644b6b93bcfa3e631716afb5f73b6b6d6852c9313d7fd34a4a404e4b345b64d9b29ddef406197911106593000cd2fd18b900f",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]


export const testsMary: SignTxTestcase[] = [
    {
        testname: "Sign tx with a multiasset output",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.multiassetOneToken, outputs.internalBaseWithStakingPath],
            validityIntervalStart: 7,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1a007838628258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a0807",
        expectedResult: {
            txHashHex: "9a9bce0cfe146a1327a94a6257e1013b12476d9c73c891d73faf74aaf131cde5",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "6c4d490ea8f3973f9d030c36ff7221f012663af276bde346f8b90b54b06f49c22bcde3968cc281d548183e1506380028853948f7ef3c98a9e179540119688106",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a complex multiasset output",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.multiassetManyTokens, outputs.internalBaseWithStakingPath],
            validityIntervalStart: 7,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a2581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a34003581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209015820000000000000000000000000000000000000000000000000000000000000000002581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a248456c204e69c3b16f1904d24874652474436f696e1a007838628258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a0807",
        expectedResult: {
            txHashHex: "b81c3a6f8506eeacb0512a54f12500151745fbb683f52dbc52f6c099437baca8",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "e2c96040194d1baef4b9dfac945496f60d446597863a2049d12796df7fb6f9f9f31392555cfccfd7c745eef802d1904ba3a9ba4892569d0eed6f6e19a871630f",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with big numbers",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.multiassetBigNumber],
            fee: "24103998870869519",
            ttl: "24103998870869519",
            validityIntervalStart: "24103998870869519",
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821b0055a275925d560fa1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1b0055a275925d560f021b0055a275925d560f031b0055a275925d560f081b0055a275925d560f",
        expectedResult: {
            txHashHex: "e60735a3cc71a8a3f89652797c3e650d6ed80059c0b59978c59858dcf6f8ca48",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "632cd935550a71c1e1869e6f5749ee4cb8c268cbe014138561fc2d1045b5b2be84526cfd5a6fea01de99bdf903fa17c79a58a832b5cdcb1c999bcbe995a56806",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with a multiasset change output",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalShelleyBaseKeyhashKeyhash, outputs.multiassetChange],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000182825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09018258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c821904d2a1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1a0078386202182a030a",
        expectedResult: {
            txHashHex: "005b324472b13e181f72a9c5eb1f05351a22b103ce35517768bab1d3bfe4a114",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "7d437d698a9a8f06f1e0ced7378c22b864b4a3dd8bba575e5cc497f55fcee984724549a34cb6e5ea11acf4749544ddabf2118c0545c668c5f75251a6be443905",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with zero fee, TTL and validity interval start",
        tx: {
            network: Networks.Mainnet,
            fee: 0,
            ttl: 0,
            validityIntervalStart: 0,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca793020003000800",
        expectedResult: {
            txHashHex: "acc997f583c78f36529ee29134e2cfb7a4550493727f565a502ab40544827311",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "e5ee59942fba139b5547e5e1dae1389ed9edd6e7bd7f057b988973c2451b5e3e41901c1d9a0fa74d34dae356a064ee783205d731fee01105c904702826b66b04",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with output with decimal places",
        tx: {
            network: Networks.Mainnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.multiassetDecimalPlaces],
            fee: 33,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a300818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a2581c6954264b15bc92d6d592febeac84f14645e1ed46ca5ebb9acdb5c15fa14553545249501a0034bf15581caf2e27f580f7f08e93190a81f72462f153026d06450924726645891ba244445249501904d24cffffffffffffffffffffffff1904d2021821",
        expectedResult: {
            txHashHex: "a36c270c8ee52c8f5b9cc47ccad0869ad72f00dd1ac1510b682752e09738a27f",
            "witnesses": [
                {
                    "path": [
                        2147485500,
                        2147485463,
                        2147483648,
                        0,
                        0,
                    ],
                    "witnessSignatureHex": "30e8da0b9230bc1b1e2748ef51e9259f457d4e0bd0387eb186ade839f3bbac5a2face7eea72061b850c7d26a5b66bd0f90cff546c6c30e0987091a067c960d06",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with mint fields with various amounts",
        tx: {
            ...mainnetFeeTtl,
            inputs: [inputs.utxoShelley],
            outputs: [],
            mint: mints.mintAmountVariety,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a09a1581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a44000581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20920581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20a1b7fffffffffffffff581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20b3b7fffffffffffffff",
        expectedResult: {
            txHashHex: "d31008087e3a9a267661f802993f7604ac2dd53d4b458f27bfc3663bc7072de1",
            "witnesses": [
                {
                    "path": [
                        2147485500,
                        2147485463,
                        2147483648,
                        0,
                        0,
                    ],
                    "witnessSignatureHex": "18fa055fb6d74b12170cdc227aaf4922c78405d4caf7bdbe5f959df2c3a912e20c5a18c4412d504685fe1179d32b5b588efe4a8d59f0274492de77f30f315409",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with mint with decimal places",
        tx: {
            network: Networks.Mainnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.externalShelleyBaseKeyhashKeyhash],
            fee: 33,
            mint: mints.mintWithDecimalPlaces,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182109a2581c6954264b15bc92d6d592febeac84f14645e1ed46ca5ebb9acdb5c15fa14553545249503a0034bf14581caf2e27f580f7f08e93190a81f72462f153026d06450924726645891ba244445249501904d24cffffffffffffffffffffffff1904d2",
        expectedResult: {
            txHashHex: "a96b68158758496044fbf91d7abaaa59e1cc426315c4fc2a1c4fa2c5db432807",
            "witnesses": [
                {
                    "path": [
                        2147485500,
                        2147485463,
                        2147483648,
                        0,
                        0,
                    ],
                    "witnessSignatureHex": "11b9ed90e2923c01869627ed5bc49ea66874fbef2418a2184437e19a30738a8bb52d7569113984617d73144e304be5cf84a30c21bd8b1c4cfe93cc434ed3db04",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with mint fields among other fields",
        tx: {
            network: Networks.Mainnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.multiassetOneToken, outputs.internalBaseWithStakingPath],
            fee: 10,
            validityIntervalStart: 100,
            ttl: 1000,
            mint: mints.mintAmountVariety,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1a007838628258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca793020a031903e808186409a1581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a44000581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20920581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20a1b7fffffffffffffff581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20b3b7fffffffffffffff",
        expectedResult: {
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


export const testsAlonzoTrezorComparison: SignTxTestcase[] = [
    {
        testname: "Full test for trezor feature parity",
        tx: {
            // "protocol_magic": 764824073,
            // "network_id": 1,
            // if Networks.Mainnet differs, the test should just explicitly give these
            network: Networks.Mainnet,
            inputs: [inputs.utxoMultisig],
            outputs: [outputs.trezorParity1, outputs.trezorParityDatumHash1],
            fee: 42,
            ttl: 10,
            validityIntervalStart: 47,
            certificates: [
                {
                    type: CertificateType.STAKE_REGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHashHex: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                    },
                },
                {
                    type: CertificateType.STAKE_DEREGISTRATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHashHex: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                    },
                },
                {
                    type: CertificateType.STAKE_DELEGATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.SCRIPT_HASH,
                            scriptHashHex: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
            withdrawals: [
                {
                    stakeCredential: {
                        type: StakeCredentialParamsType.SCRIPT_HASH,
                        scriptHashHex: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
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
            scriptDataHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0"), str_to_path("1854'/1815'/0'/2/0")],
        txBody: "ab00818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821a001e8480a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a14874657374436f696e1a0078386283581d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c0158203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b702182a030a048382008201581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd82018201581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd83028201581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497305a1581df129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd1903e807582058ec01578fcdfdc376f09631a7b2adc608eaf57e3720484c7ff37c13cff90fdf08182f09a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a24874657374436f696e1a007838624875657374436f696e3a007838610b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70f01",
        expectedResult: {
            txHashHex: "c3637e34529fae17dbbb90c58307df0cf3b818f4c034860fff362d1ea864cca4",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/0/0"),
                    witnessSignatureHex: "0d35e3f273db757d6137ff897dcfe5abf44054185a428197933a61bb0c7ad960c2090ba808ab86404fe2b407abba12041f5e9306a6f1ae0ad5b6cd4fc7b36904",
                },
                {
                    path: str_to_path("1854'/1815'/0'/2/0"),
                    witnessSignatureHex: "a164b873fa4678dc7a986ad9e4db62b638faff7f45c81af835155bc74dd3ad4b2f696734bf1e536de2baa237f92e158624920eb10269f9ee1d9910993b194a0b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]


export const testsBabbageTrezorComparison: SignTxTestcase[] = [
    {
        testname: "Full test for trezor feature parity - Babbage elements (Plutus)",
        tx: {
            network: Networks.Mainnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.trezorParity2, outputs.trezorParityDatumHash2],
            fee: 42,
            ttl: 10,
            validityIntervalStart: 47,
            scriptDataHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
            collateralInputs: [inputs.utxoShelley],
            collateralOutput: outputs.externalShelleyBaseKeyhashKeyhash,
            totalCollateral: 10,
            referenceInputs: [inputs.utxoShelley],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        txBody: "ab00818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000182825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09821a001e8480a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a14874657374436f696e1a0078386283581d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c0158203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b702182a030a08182f0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000f0110825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b0901110a12818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700",
        expectedResult: {
            txHashHex: "3e0c44577b78d0b9628167ca03bfe56d2730e3291b0992d0316e6eebabf0685e",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "b6625562153024a481503905b9d05b9e3b6c1b5267f2cce6531e93a14052a1c7db6cc799d77c3ce4f1efd5b7b199c28af4aca6ca59d0d1423eac476e748a8901",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Full test for trezor feature parity - Babbage elements (ordinary)",
        tx: {
            network: Networks.Mainnet,
            inputs: [inputs.utxoShelley],
            outputs: [outputs.trezorParityBabbageOutputs],
            fee: 42,
            ttl: 10,
            validityIntervalStart: 47,
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a400581d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c0101028201d818565579657420616e6f746865722063686f636f6c61746503d81858390080f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b427702182a030a08182f0f01",
        expectedResult: {
            txHashHex: "de264f4b285415fd88932156862e775be26aab30a0003767aa8a04881595f77f",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "a655f96ffc6fe56c5f9287dc28474805a97a46b85def8002cb1d4ee975fe69ae89a4a24c317db9cc3c7390410465ded89f349d081de5fd757689af9b6c125609",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

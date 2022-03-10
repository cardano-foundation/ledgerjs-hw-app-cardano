import type { DeviceOwnedAddress, Transaction } from "../../../src/Ada"
import { TxAuxiliaryDataSupplementType } from "../../../src/Ada"
import { CertificateType, Networks, TxAuxiliaryDataType, TxRequiredSignerType } from "../../../src/Ada"
import type { BIP32Path, SignedTransactionData} from '../../../src/types/public'
import { StakeCredentialParamsType, TransactionSigningMode } from '../../../src/types/public'
import { str_to_path } from "../../../src/utils/address"
import { allegraBase, alonzoBase, byronBase, destinations, inputs, maryBase, mints, outputs, shelleyBase } from "./txElements"

export type TestcaseByron = {
  testname: string;
  tx: Transaction;
  signingMode: TransactionSigningMode;
  txBody?: string;
  result: SignedTransactionData;
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
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a",
        result: {
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
        testname: "Sign tx without change address with Byron Daedalus mainnet output",
        tx: {
            ...byronBase,
            network: Networks.Mainnet,
            outputs: [outputs.externalByronDaedalusMainnet],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182584c82d818584283581cd2348b8ef7b8a6d1c922efa499c669b151eeef99e4ce3521e88223f8a101581e581cf281e648a89015a9861bd9e992414d1145ddaf80690be53235b0e2e5001a199834651a002dd2e802182a030a",
        result: {
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
        testname: "Sign tx without change address with Byron testnet output",
        tx: {
            ...byronBase,
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
        result: {
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

export type TestcaseShelley = {
  testname: string;
  tx: Transaction;
  signingMode: TransactionSigningMode;
  additionalWitnessPaths?: BIP32Path[];
  txBody?: string;
  txAuxiliaryData?: string;
  result: SignedTransactionData;
}

export const testsShelleyNoCertificates: TestcaseShelley[] = [
    {
        testname: "Sign tx without outputs",
        tx: {
            ...shelleyBase,
            outputs: [],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: undefined,
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a",
        result: {
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
            ...shelleyBase,
            outputs: [outputs.externalShelleyBaseKeyhashKeyhash],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825841017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09da61d425f34611140102182a030a",
        result: {
            txHashHex: "97e40841b9b494d4c63993c35038484a72e70f0d5356471e9f1e3e311663b67e",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "5137e748df308525b46deaef18e61e04994f6658c32ada286b06d32b99d6676aef94f36895a51b9025d94b2ab0776749eedc7451ac1f0e61bef8b9cf5ec0240e",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with change base address with staking path",
        tx: {
            ...shelleyBase,
            inputs: [
                inputs.utxoByron,
            ],
            outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e88258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a",
        result: {
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
            ...shelleyBase,
            outputs: [outputs.externalByronMainnet, outputs.internalBaseWithStakingKeyHash],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e88258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f1124122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42771a006ca79302182a030a",
        result: {
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
            ...shelleyBase,
            outputs: [outputs.externalByronMainnet, outputs.internalEnterprise],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e882581d6114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241a006ca79302182a030a",
        result: {
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
            ...shelleyBase,
            outputs: [outputs.externalByronMainnet, outputs.internalPointer],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e88258204114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11240102031a006ca79302182a030a",
        result: {
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901f90b0dfcace47bf03e88f7469a2f4fb3a7918461aa4765bfaf55f0dae260546c20562e598fb761f419dad27edcd49f4ee4f0540b8e40d4d51a006ca79302182a030a075820deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        result: {
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a05a1581de11d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c186f",
        result: {
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a075820deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        result: {
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

export const testsShelleyWithCertificates: TestcaseShelley[] = [
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
        result: {
            txHashHex: "a119ec712822b2f4bc96737121f286cf149ac2f8de2230e0d675f074094d1cd6",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "9825594e5a91333b9f5762665ba316af34c2208bd7ef073178af5e48f2aae8673d50436045e292d5bb9be7492eeeda475a04e58621a326c91049a2ef26a33200",
                },
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex: "a2a22faa4ac4ba4b5a89c770dd7b2afe877ba8c86f0205df8c01a2184275aaafada9b6be4640aa573cafbbca26ac2eccd98f804065b39b10a0559c7dc441fa0a",
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
        result: {
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
        result: {
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
        result: {
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a04828304581cdbfee4665e58c8f8e9b9ff02b17f32e08a42c855476a5d867c2737b70a82008200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
        result: {
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
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex: "32d0be05a8103a834265aa9e29562d5dde4473e4d7596714c000ae3a980b8e55543db42dde19e407c40943591978f03b28106f75cbc77d21ea2c28ab1ad4c100",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

export const testsMultisig: TestcaseShelley[] = [
    {
        testname: "Sign tx without change address with Shelley scripthash output",
        tx: {
            ...shelleyBase,
            network: Networks.Testnet,
            outputs: [outputs.externalShelleyBaseScripthashKeyhash],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0")],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583d105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e0102182a030a",
        result: {
            txHashHex: "23d82edc8fbd2d55237cba955a2280161ebd5643b23844e9b5abdc843b966e62",
            witnesses: [
                {
                    path: str_to_path("1854'/1815'/0'/0/0"),
                    witnessSignatureHex: "38472a39eead64017e449be5affcf4bf5e20260a92004d6ea2a6eac5dab9fcaf274031f4988df4a6e5f88b9194db05e24b5f3fa0d26bbf308cd2111505260603",
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
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a05a1581df1122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277186f",
        result: {
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
                            scriptHash: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182008201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
        result: {
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
                            scriptHash: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048183028201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
        result: {
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
                            scriptHash: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048182018201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
        result: {
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

export type TestcaseAllegra = {
  testname: string;
  tx: Transaction;
  signingMode: TransactionSigningMode;
  txBody: string;
  result: SignedTransactionData;
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
            txHashHex: "971dc8ccbc34fde78028b9642352ac84b6c8867cfd72ca9bc92d68203d7ed86f",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "6dc4da7a0bee07e4ecc687b0d1b9e73d772dfb6a09b2bf435fe1e3d481ed8214f8d751ceff0e9fa41ef0ad7318ea9ca561c9b773e5673adb8049569c380f5301",
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
            txHashHex: "bfe53d40c5eb0cd04b53d555b85be4474168adbc1d8f82cf5c9792854234cf70",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "b1bc7a4b110523f8b0a1a3aa0ae0f45a718faf7beb648a021d0d777755ab214ba1b079d79d8517a275ebb74c79aa244600f0877c611ca00383d67fc447074003",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

export type TestcaseMary = {
  testname: string;
  tx: Transaction;
  signingMode: TransactionSigningMode;
  txBody: string;
  txAuxiliaryData?: string;
  result: SignedTransactionData;
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
            txHashHex: "8502ab1a781627663e8bfcff54a58747e319da3bb592a3446fc35fa5d2f2fbe9",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "b48877586d90a249579a5f3994c3ad0c21c5f78960a04aadd182ca49c3b606f1d8a578edf17923188e4e0e40f191e019a5174081c092c458a82e9f0c1e1fae08",
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
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a2581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a34003581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209015820000000000000000000000000000000000000000000000000000000000000000002581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a248456c204e69c3b16f1904d24874652474436f696e1a007838628258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a08182f",
        result: {
            txHashHex: "fc640534def42c6c9a16e51de379191cc39d0950015e8db8e237e17b55b7cc5a",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "cf297c45c32dc51fa84f7cdbf967496b6493fac86bf6e283cf6c10564ad1fed7f5702939f712e00eaede88847dde24db6591d7ad6e998287835eb2473de7a204",
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
            ...maryBase,
            outputs: [outputs.externalShelleyBaseKeyhashKeyhash, outputs.multiassetChange],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000182825841017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09da61d425f3461114018258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c821904d2a1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1a0078386202182a030a08182f",
        result: {
            txHashHex: "75ef0b3ac08d56e8ca4a6d3a3de054ed028bad025b0fad3cbb351fc94e967bc5",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "f19c5f698d3d46dac99c83268d8b5154262c22f9599d38b5221b78d08cef8f5bb81de648a0c94d328b74e88c58d46535de289123f08a47a05a1c253980d6b80e",
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
        testname: "Sign tx with mint fields with various amounts",
        tx: {
            ...maryBase,
            outputs: [],
            mint: mints.mintAmountVariety,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a08182f09a1581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a44000581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20920581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20a1b7fffffffffffffff581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20b3b7fffffffffffffff",
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
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821904d2a1581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a14874652474436f696e1a007838628258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca793020a031903e808186409a1581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a44000581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20920581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20a1b7fffffffffffffff581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df20b3b7fffffffffffffff",
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
            txHashHex: "ffb0c7daf1bcb661cdab8b452a6e6664a9fd9da289405a4234c356c75ce5be66",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "b4e2bd2985668b6cbce395700545f3773b72ca1e86cc9470cb5340e5b266d05feb968cf09a1febe852d180f5ba93113f13e5d56fe8cf7bbfb31b3ccaa45fb800",
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
                    rewardsDestination: destinations.rewardsKeyPath.params as DeviceOwnedAddress,
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
            txHashHex: "83deb3ed2f37df4cb6c7a4d81399cd29f88505e4f3d053342ada4f630fb23ae1",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "a344a5e466eb333e0bf417edefce2dec8a5fc4ddd6458b5fbb349bf2b42bf7b302a3d052d44b82e799a5de9d2c3442a5761d6baa77ec2051244b8184b5f35902",
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

export type TestcaseAlonzo = {
  testname: string;
  tx: Transaction;
  signingMode: TransactionSigningMode;
  additionalWitnessPaths: BIP32Path[];
  txBody?: string;
  txAuxiliaryData?: string;
  result: SignedTransactionData;
}

export const testsAlonzo: TestcaseAlonzo[] = [
    {
        testname: "Sign tx with only script data hash",
        tx: {
            ...alonzoBase,
            outputs: [],
            scriptDataHashHex: "ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188",
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0b5820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce1880f01",
        result: {
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
        testname: "Sign tx with Plutus change output",
        tx: {
            ...shelleyBase,
            outputs: [outputs.internalBaseWithStakingPath],
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a",
        result: {
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
            ...alonzoBase,
            network: Networks.Testnet,
            outputs: [outputs.datumHashExternal],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018183583d105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e1a006ca7935820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        result: {
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
            ...alonzoBase,
            network: Networks.Testnet,
            outputs: [outputs.datumHashWithTokens],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018183583d105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a007838625820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a",
        result: {
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
            ...alonzoBase,
            network: Networks.Testnet,
            outputs: [outputs.missingDatumHashWithTokens],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583d105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e28dd419e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a0078386202182a030a",
        result: {
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
            ...alonzoBase,
            outputs: [],
            collaterals: [inputs.utxoByron],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0d818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc000f01",
        result: {
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
            ...alonzoBase,
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
        result: {
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
            ...alonzoBase,
            outputs: [],
            requiredSigners: [
                {
                    type: TxRequiredSignerType.HASH,
                    hash: "fea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a",
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
        result: {
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
            ...alonzoBase,
            outputs: [],
            requiredSigners: [
                {
                    type: TxRequiredSignerType.HASH,
                    hash: "fea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a",
                },
                {
                    type: TxRequiredSignerType.HASH,
                    hash: "eea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a",
                },
            ],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0e82581cfea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a581ceea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a0f01",
        result: {
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
            ...alonzoBase,
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
        result: {
            txHashHex: "728bbc72445c3a17a9d56d1cb6a99b1362d3bcbf508fcb153320dfa62e4b42ba",
            witnesses: [
                {
                    path: str_to_path("1855'/1815'/0'"),
                    witnessSignatureHex: "29d3410bf89fa938a73fb27df35a30910fb3111eb941e835946fd30c0bfcc377c7b8a8ac15dc807f995fb482efdf57e6d697d0d3effaa5cab104861698e39900",
                },
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex: "3dcd818effb503e4cf9d7c3836c29498d5258de7775915bf376eccae95e1b933afa5372478f136720b3c60346c9e674efea9f4b222916c96f0805962a16e9806",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Sign tx with key hash in stake credential",
        tx: {
            ...alonzoBase,
            outputs: [],
            certificates: [
                {
                    type: CertificateType.STAKE_DELEGATION,
                    params: {
                        stakeCredential: {
                            type: StakeCredentialParamsType.KEY_HASH,
                            keyHash: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                        },
                        poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                    },
                },
            ],
            withdrawals: [
                {
                    stakeCredential: {
                        type: StakeCredentialParamsType.KEY_HASH,
                        keyHash: "29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd",
                    },
                    amount: 1000,
                },
            ],
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
        additionalWitnessPaths: [],
        txBody: "a700818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a048183028200581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497305a1581de129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd1903e80f01",
        result: {
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

export const testsAlonzoTrezorComparison: TestcaseAlonzo[] = [
    {
        testname: "Full test for trezor feature parity",
        tx: {
            // "protocol_magic": 764824073,
            // "network_id": 1,
            // if Networks.Mainnet differs, the test should just explicitly give these
            network: Networks.Mainnet,
            inputs: [inputs.utxoMultisig],
            outputs: [outputs.trezorParity, outputs.trezorParityDatumHash],
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
            scriptDataHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
            includeNetworkId: true,
        },
        signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
        additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0"), str_to_path("1854'/1815'/0'/2/0")],
        txBody: "ab00818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821a001e8480a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a14874657374436f696e1a0078386283581d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c0158203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b702182a030a048382008201581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd82018201581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd83028201581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497305a1581df129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd1903e807582058ec01578fcdfdc376f09631a7b2adc608eaf57e3720484c7ff37c13cff90fdf08182f09a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a24874657374436f696e1a007838624875657374436f696e3a007838610b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70f01",
        result: {
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

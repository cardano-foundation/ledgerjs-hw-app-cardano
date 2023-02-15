import {CertificateType, Networks, TxRequiredSignerType} from '../../../src/Ada'
import {
  StakeCredentialParamsType,
  TransactionSigningMode,
} from '../../../src/types/public'
import {str_to_path} from '../../../src/utils/address'
import type {SignTxTestcase} from './signTx'
import {inputs, mainnetFeeTtl, outputs} from './txElements'

export const testsAlonzo: SignTxTestcase[] = [
  {
    testName: 'Sign tx with script data hash',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [],
      scriptDataHashHex:
        'ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce188',
      includeNetworkId: true,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0b5820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce1880f01',
    expectedResult: {
      txHashHex:
        '7c5aac719dd3e0888deef0c59d6daba9e578d0dc27f82ff4978fc2893cdc2202',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '5c66a4f75359a62b4b32751fe30a1adbf7ed2839fd4cb762e9a4d2b086de82fca2310bcf07efc2b03086211faa19941dbe059bbfb747e128863f339720e71304',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    // tx does not contain any Plutus elements, but should be accepted (differs only in UI)
    testName: 'Sign tx with change output as array',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.internalBaseWithStakingPath],
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70001818258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca79302182a030a',
    expectedResult: {
      txHashHex:
        'b72616520aac51e8f4d081cec9899d8113ba61488d736c81bff39521684d52ad',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'ea26a98ce5399280ec8ad553d155c0900396204f9fe5a33969f279752a53263188d643544cdb4ffed108017bc7544e80df924143866638faffcd11646e57710b',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with datum hash in output as array',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.datumHashExternal],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181835839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e1a006ca7935820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a',
    expectedResult: {
      txHashHex:
        '0ac3011036018a6ff19105464f2b98fd7c13e42eb369f930f23fe24f48fc40f4',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'afc57872d539c398acbb2d18c09796639029b4066ae3439925976d085b7150af418cf070b2ef80e907c20a2c942da4811b6847b1cd42fddc53d4c97732205d0d',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with datum hash in output as array with tokens',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.datumHashWithTokens],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181835839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a007838625820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a',
    expectedResult: {
      txHashHex:
        '7ffbaefea15f1c24c069b39b30360f6a36da6e6dae1666108e873156c338e543',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '166a23e78036d5e776874bef45f86c757c60c5d1af83943982bbc1cc6bd68526cab1c554f2438c6a4c5491df00066b181891e5b97350e5b4fe367bf9a1317202',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    // tests the path where a warning about missing datum hash is shown on Ledger
    testName: 'Sign tx with missing datum hash in output with tokens',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.missingDatumHashWithTokens],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a0078386202182a030a\n',
    expectedResult: {
      txHashHex:
        'c236cfde289e669a04fca8bd9a2b9b632fe4c08d31627da25ac517a40082df2a',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'ce096ed674ca863fb4af024f9341c8fd7fadd363ffc1b031cba65cb885f8d272759e69e44686e784d3a1e9b8b31c0e965752f13a79eb4095cd96ce26315c1903',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with collateral inputs',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [],
      collateralInputs: [inputs.utxoByron],
      includeNetworkId: true,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0d818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc000f01',
    expectedResult: {
      txHashHex:
        'f08021608db631b5b5c1553042ac9722efbcdf738e0b256e7300963e66e41638',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '4867e65c60793b6bd60e677f30111d32f3f8dbf02a6f20985095bf8463b3062b5ad0669836d3e661dc1d0d710fd91f0756e6e5e0ab15cf829ab1f78226808a00',
        },
        {
          path: str_to_path("44'/1815'/0'/0/0"),
          witnessSignatureHex:
            'be7162dc1348a79aa5260f33bda84c3eb5f909b108b444ff109bc8fa670fa032fe9951686e004f95453eaa49a73ee9f7c6193d215af804df1ac818ff31efbd01',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with required signers - mixed',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [],
      requiredSigners: [
        {
          type: TxRequiredSignerType.HASH,
          hashHex: 'fea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a',
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
    txBody:
      'a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0e82581cfea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a581c14c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11240f01',
    expectedResult: {
      txHashHex:
        '9e41ce0d7bcc1bbef0d96fd025054a54d1435e7a1e1e66595f2ed594dabb5faf',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'f5b2eb79b74678d3237b757dfcb8a623a8f7f5a10c5925b256da7723935bc98bbfc91ebc001d0e18c2929c611c99d43352ab33ee2dda45b6c115689ddaeeb502',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with required signers - mixed',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [],
      requiredSigners: [
        {
          type: TxRequiredSignerType.HASH,
          hashHex: 'fea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a',
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
    txBody:
      'a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a0e82581cfea6646c67fb467f8a5425e9c752e1e262b0420ba4b638f39514049a581c14c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11240f01',
    expectedResult: {
      txHashHex:
        '9e41ce0d7bcc1bbef0d96fd025054a54d1435e7a1e1e66595f2ed594dabb5faf',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'f5b2eb79b74678d3237b757dfcb8a623a8f7f5a10c5925b256da7723935bc98bbfc91ebc001d0e18c2929c611c99d43352ab33ee2dda45b6c115689ddaeeb502',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with mint path in a required signer',
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
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a0e81581c43040068ce85252be6164296d6dca9595644bbf424b56b7424458227',
    expectedResult: {
      txHashHex:
        '728bbc72445c3a17a9d56d1cb6a99b1362d3bcbf508fcb153320dfa62e4b42ba',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '3dcd818effb503e4cf9d7c3836c29498d5258de7775915bf376eccae95e1b933afa5372478f136720b3c60346c9e674efea9f4b222916c96f0805962a16e9806',
        },
        {
          path: str_to_path("1855'/1815'/0'"),
          witnessSignatureHex:
            '29d3410bf89fa938a73fb27df35a30910fb3111eb941e835946fd30c0bfcc377c7b8a8ac15dc807f995fb482efdf57e6d697d0d3effaa5cab104861698e39900',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with key hash in stake credential',
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
              keyHashHex:
                '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
            },
            poolKeyHashHex:
              'f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973',
          },
        },
      ],
      withdrawals: [
        {
          stakeCredential: {
            type: StakeCredentialParamsType.KEY_HASH,
            keyHashHex:
              '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
          },
          amount: 1000,
        },
      ],
      includeNetworkId: true,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a700818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a048183028200581c29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497305a1581de129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd1903e80f01',
    expectedResult: {
      txHashHex:
        '7ae1c854aad0469a08cd678786ed9a70791808afd6dd1a7deaae72df12430baa',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'c986cf978bb08f49f0c50032c8eafa7fddce2a748d3bb0edc0245b5a205a60c55a5ad389d17b897cb83cfe34567c446afed4fd9d64a8304d02c55b9579685d0a',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
]

export const testsBabbage: SignTxTestcase[] = [
  // inline datum
  {
    testName: 'Sign tx with short inline datum in output with tokens',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.inlineDatumWithTokensMap],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a3005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e01821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a00783862028201d818565579657420616e6f746865722063686f636f6c61746502182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    expectedResult: {
      txHashHex:
        '5dbfc21ef1c9cfcec97d81dbe5ad732cf8fe2237969321c830a9dd166172b649',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'c2842b7a30a09634201425f707085b8eef73343ed69298e4e5d3887af362c8b92ee8f6d2c6a04bc7bb66ddcef35c27feb0efd046f5183a02c2267ebedb09780c',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with long inline datum (480 B) in output',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.inlineDatum480Map],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a3005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e011a006ca793028201d8185901e012b8240c5470b47c159597b6f71d78c7fc99d1d8d911cb19b8f50211938ef361a22d30cd8f6354ec50e99a7d3cf3e06797ed4af3d358e01b2a957caa4010da328720b9fbe7a3a6d10209a13d2eb11933eb1bf2ab02713117e421b6dcc66297c41b95ad32d3457a0e6b44d8482385f311465964c3daff226acfb7bbda47011f1a6531db30e5b5977143c48f8b8eb739487f87dc13896f58529cfb48e415fc6123e708cdc3cb15cc1900ecf88c5fc9ff66d8ad6dae18c79e4a3c392a0df4d16ffa3e370f4dad8d8e9d171c5656bb317c78a2711057e7ae0beb1dc66ba01aa69d0c0db244e6742d7758ce8da00dfed6225d4aed4b01c42a0352688ed5803f3fd64873f11355305d9db309f4a2a6673cc408a06b8827a5edef7b0fd8742627fb8aa102a084b7db72fcb5c3d1bf437e2a936b738902a9c0258b462b9f2e9befd2c6bcfc036143bb34342b9124888a5b29fa5d60909c81319f034c11542b05ca3ff6c64c7642ff1e2b25fb60dc9bb6f5c914dd4149f31896955d4d204d822deddc46f852115a479edf7521cdf4ce596805875011855158fd303c33a2a7916a9cb7acaaf5aeca7e6efb75960e9597cd845bd9a93610bf1ab47ab0de943e8a96e26a24c4996f7b07fad437829fee5bc3496192608d4c04ac642cdec7bdbb8a948ad1d43402182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    expectedResult: {
      txHashHex:
        '0cccea3eb974bd362720a460d84d4970e89c523b2145cbe29bb56f36cec4b826',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '9b45eae3e9e59f501adbe22ce7f22fbacce7c36623f28e1aa4fdb0942e58e839b02e21a6808a13c7490cbb70e9a174279b4c845dba3ee99b8d458cfa9d349908',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with long inline datum (304 B) in output with tokens',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.inlineDatum304WithTokensMap],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a3005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e01821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a00783862028201d8185901305579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f746865722063686f636f6c6174655579657420616e6f7468657220637468657202182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    expectedResult: {
      txHashHex:
        '92f83ca3e05fb48ffe0f90e6d7ac653a684039476b4963984b84fdc6fecea67d',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'e6baf473e8caabcdfaa961e4e25f31f1389de3528e6ffede36e8e23ac163a6b5fcab490f009577aa4f260a7f4e45d5b481f4b5c3542148feafcae101805f4001',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  // reference script
  {
    testName: 'Sign tx with datum hash and short ref. script in output',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.datumHashRefScriptExternalMap],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a4005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e011a006ca7930282005820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18803d81854deadbeefdeadbeefdeadbeefdeadbeefdeadbeef02182a030a',
    expectedResult: {
      txHashHex:
        '66b8ad26b626f8fc6bd788d75b64f4d8db1c934e0fe30ba7873fa291f38359ef',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '09ac32c49b80265e668793ce441031b9bb8f99643ded6b3fa3f3c8109a287bd91a7fb899d137dd7333134ec748ee11a629aa252cfc9a75fd96217dfb08305003',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName:
      'Sign tx with datum hash and ref. script (240 B) in output in Babbage format',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.datumHashRefScript240ExternalMap],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a4005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e011a006ca7930282005820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18803d81858f04784392787cc567ac21d7b5346a4a89ae112b7ff7610e402284042aa4e6efca7956a53c3f5cb3ec6745f5e21150f2a77bd71a2adc3f8b9539e9bab41934b477f60a8b302584d1a619ed9b178b5ce6fcad31adc0d6fc17023ede474c09f29fdbfb290a5b30b5240fae5de71168036201772c0d272ae90220181f9bf8c3198e79fc2ae32b076abf4d0e10d3166923ce56994b25c00909e3faab8ef1358c136cd3b197488efc883a7c6cfa3ac63ca9cebc62121c6e22f594420c2abd54e78282adec20ee7dba0e6de65554adb8ee8314f23f86cf7cf0906d4b6c643966baf6c54240c19f4131374e298f38a626a4ad63e6102182a030a',
    expectedResult: {
      txHashHex:
        '88ba739a1ac160afc2cfb75d7132431a534665a928e3ed27c90efdd3c15a6eea',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '64d1ef5a3e8a074ad9ef34e0d6c19d313c09122f8cbbd54f3e46024b492e2d523a0ad1e132fc0fbf5ca4b2ddd2e72f110a9f669fef2f921a037553262aaffe06',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName:
      'Sign tx with datum hash and script reference (304 B) in output as map',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.datumHashRefScript304ExternalMap],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a4005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e011a006ca7930282005820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18803d818590130deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeaddeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeaddeadbeef02182a030a',
    expectedResult: {
      txHashHex:
        'eb4c4fde4db6ad34b83087e0d52f48127cd9f0bab5bd6e271cdcc3904ce6556f',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '166e6a6749e103b0ddd2af822066a867fdf62f32fe91b6099a4d9983c6699f0d4da5d0be68afb5d41ecc54c2799665a6caf4beec8893c7f6593eaae3da8b0800',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  // various output combinations
  {
    testName: 'Sign tx with datum hash in output with tokens in Babbage format',
    tx: {
      ...mainnetFeeTtl,
      network: Networks.Testnet,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.datumHashWithTokensMap],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a3005839105e2f080eb93bad86d401545e0ce5f2221096d6477e11e6643922fa8d2ed495234dc0d667c1316ff84e572310e265edb31330448b36b7179e01821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a2487564247542686911182f4875642475426869121a007838620282005820ffd4d009f554ba4fd8ed1f1d703244819861a9d34fd4753bcf3ff32f043ce18802182a030a',
    expectedResult: {
      txHashHex:
        '77c4e9441b6b5bc5a1157b2b54ac6c0165e6959ffbc378f0528fafd4e5d9ba64',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'ec6d5db61abe1daa9d43ea0e4e89b9151227b3e5937cb304fa5d7823d555625327b19f71d890ddc73401e3dcad61903c32d889241643f64fb218f98828643f08',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName: 'Sign tx with a complex multiasset output Babbage',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [
        outputs.multiassetManyTokensBabbage,
        outputs.internalBaseWithStakingPathBabbage,
      ],
      validityIntervalStart: 7,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000182a200583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff01821904d2a2581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a34003581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209015820000000000000000000000000000000000000000000000000000000000000000002581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a248456c204e69c3b16f1904d24874652474436f696e1a00783862a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a0807',
    expectedResult: {
      txHashHex:
        'c0f070b69c71a042622bb2187c400087be2ad0c1587c528834adea0308155169',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '6d31e18be58b2f5c8a2ea10e83d370418b51ef29e3f142f6605f3918d09fd78b5b520eb03332465d6304617b1a037cd4606e11f8ce4824038507d68bea5c6f02',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  // reference inputs
  {
    testName: 'Sign tx with change output as map and multiple reference inputs',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.internalBaseWithStakingPathMap],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      collateralInputs: [inputs.utxoShelley],
      referenceInputs: [inputs.utxoShelley, inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a700818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70012828258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7008258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700',
    expectedResult: {
      txHashHex:
        '4ce1c9129a74a3d15e5edee72520ee9c497020894548769b8bfa7f26b7f32db3',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '014537c021b33afaa6bd8909ce0059fceed55f6ee2db1e39b877dbdd3458d8ab9b1e632058916526ccf9b57f30a6f14006b3875ee400c59b5d43db3b0afd5b08',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  // total collateral and collateral return output
  {
    testName: 'Sign tx with change output as map and total collateral',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.internalBaseWithStakingPathMap],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      totalCollateral: 10,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7110a',
    expectedResult: {
      txHashHex:
        '67f5f21ae9b8c5d5b628b9220f20a8dee75da05224d1cb1928d869935642197f',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '448576703ceed680504a957c12c973ec72d2562a49fbe978762668a5eb8fd767cb1b36a16018a573b23c1f669f35ec6401e73438f7414ae5f6e18ce304c71b0b',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName:
      'Sign tx with change output as map and collateral output as array',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.internalBaseWithStakingPathMap],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      collateralOutput: outputs.internalBaseWithStakingPath,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7108258390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1a006ca793',
    expectedResult: {
      txHashHex:
        'ce976eb3a14882f33a1643ac011592ceb277991d3858c1c5fdc40bdd5182510d',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '67615b4517feb87ed9a8a1b464de4e7e02264e02036538afc2091f8fef992c6b5de4e9b7f8a1cff7b21d25b6f71916161127119a63e076ce42d1e7289865d608',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName:
      'Sign tx with change collateral output as map without total collateral',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.internalBaseWithStakingPathMap],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      collateralInputs: [inputs.utxoShelley],
      collateralOutput: outputs.internalBaseWithTokensMap,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a700818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70010a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c01821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a1487564247542686911182f',
    expectedResult: {
      txHashHex:
        '20bcabb8e36ea440bd9097909bd4e17e77bf0da3fe013f07a6714467a4758440',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'd17f32d31ba25f36b02b1b9994b9c3aea3df863a55dffc313612f2bf1f92e1fb65028cfd83f0b2f6b81c99ae2a02d2fc1e2d99b442e937fa33b5f4c0ccd6c60f',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName:
      'Sign tx with change collateral output as map with total collateral',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.internalBaseWithStakingPathMap],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      collateralInputs: [inputs.utxoShelley],
      collateralOutput: outputs.internalBaseWithTokensMap,
      totalCollateral: 5,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a800818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c011a006ca79302182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70010a20058390114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c01821a006ca793a1581c75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a1487564247542686911182f1105',
    expectedResult: {
      txHashHex:
        '2ffa5b60996c0396bafecb3f63c10c9798689dd125039c7c49d1c85568cc4a34',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'c81d783cdf7b54ec560fce529169dd914b19a9ceb96371a5ec29c135c69e655a682c3e184216efd9557d53f6bcfd68c45031e3ad2c2e155a0bcff5095ab12608',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName:
      'Sign tx with third-party collateral output as map without total collateral',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.multiassetManyTokensBabbage],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      collateralInputs: [inputs.utxoShelley],
      collateralOutput: outputs.externalShelleyBaseKeyhashKeyhash,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a700818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a200583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff01821904d2a2581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a34003581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209015820000000000000000000000000000000000000000000000000000000000000000002581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a248456c204e69c3b16f1904d24874652474436f696e1a0078386202182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70010825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b0901',
    expectedResult: {
      txHashHex:
        'ad44aad52c32b6123220ec15548b3902b091f73c4ccfb229700a32bc6958eb6f',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '0d71240327d12b951d5953e7936dc87f91d10554aa7f476e82681d9584f95c50705ebf7d2f7f484ca552bbe385b4d09de1957d895a35e4f015c6a95bbb7c0707',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
  {
    testName:
      'Sign tx with third-party collateral output as map with total collateral',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.multiassetManyTokensBabbage],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      collateralInputs: [inputs.utxoShelley],
      collateralOutput: outputs.externalShelleyBaseKeyhashKeyhash,
      totalCollateral: 5,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    additionalWitnessPaths: [],
    txBody:
      'a800818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181a200583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff01821904d2a2581c7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373a34003581c1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209015820000000000000000000000000000000000000000000000000000000000000000002581c95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39a248456c204e69c3b16f1904d24874652474436f696e1a0078386202182a030a0b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70010825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09011105',
    expectedResult: {
      txHashHex:
        'ae45aaab5ceb5234a46d1a9173fdcfa965cdd5ebc37054c18a1ac22ad5d4904e',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'f0048a529b21431fb4a4b39991b3301ff2c73994990da91b84484284f0681a8c0693e48b1c5bccd61c5c3533fdad2d89a481a85134b3a4e3c0805fdf05aa7f07',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
]

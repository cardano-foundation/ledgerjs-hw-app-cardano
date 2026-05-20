import {Networks} from '../../test_utils'
import {str_to_path} from '../../../src/utils/address'
import {
  AddressType,
  CertificateType,
  CIP36VoteDelegationType,
  CIP36VoteRegistrationFormat,
  CredentialParamsType,
  DRepParamsType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
  TxRequiredSignerType,
  VoterType,
  PoolKeyType,
  PoolOwnerType,
  RelayType,
  PoolRewardAccountType,
  TxAuxiliaryDataSupplementType,
} from '../../../src/types/public'
import type {SignTxTestCase} from './signTx'
import {inputs, outputs, shelleyBase} from './txElements'

const stakePath = str_to_path("1852'/1815'/0'/2/0")
const poolRetirementPath = str_to_path("1853'/1815'/0'/1'")
const dRepPath = str_to_path("1852'/1815'/0'/3/0")
const committeeColdPath = str_to_path("1852'/1815'/0'/4/0")
const committeeHotPath = str_to_path("1852'/1815'/0'/5/0")
const votePath = str_to_path("1694'/1815'/0'/0/1")
const unusualVotePath = str_to_path("1694'/1815'/101'/0/1")

const poolKeyHashHex =
  'f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973'
const poolVrfKeyHashHex =
  '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'
const poolOwnerStakingKeyHashHex =
  '1234567890abcdef1234567890abcdef1234567890abcdef12345678'
const poolRewardAccountPath = str_to_path("1852'/1815'/3'/2/0")
const poolMetadataHashHex =
  'ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100'
const stakeScriptHashHex =
  '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277'
const committeeScriptHashHex =
  'cf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba6'
const dRepScriptHashHex =
  '1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8'
const committeeKeyHashHex =
  '1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8'
const dRepKeyHashHex =
  '7afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8'
const voteKeyHex =
  '4b19e27ffc006ace16592311c4d2f0cafc255eaa47a6178ff540c0a46d07027c'
const anchor = {
  url: 'https://www.vacuumlabs.com/sampleAnchor',
  hashHex: '1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef',
}
const externalPaymentAddressHex =
  '2113d58234512f7f616ef62308c40170c110b2f8d810f230402c5e74177004b5785308380e2dac2955d234b60aa4b786057dd5a93984439d32'

const keyPathCredential = (keyPath: number[]) => ({
  type: CredentialParamsType.KEY_PATH as const,
  keyPath,
})

const keyHashCredential = (keyHashHex: string) => ({
  type: CredentialParamsType.KEY_HASH as const,
  keyHashHex,
})

const scriptHashCredential = (scriptHashHex: string) => ({
  type: CredentialParamsType.SCRIPT_HASH as const,
  scriptHashHex,
})

const abstainDRep = {
  type: DRepParamsType.ABSTAIN as const,
}

const noConfidenceDRep = {
  type: DRepParamsType.NO_CONFIDENCE as const,
}

export const signTxAllElementsAuxiliaryData: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsAuxiliaryData_0 minimal_coverage_v8',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a0758201999b3bb9102b585c42616e40cf1290518d788f967ab4b3329dcb712ac933da0',
    tx: {
      ...shelleyBase,
      auxiliaryData: {
        type: TxAuxiliaryDataType.CIP36_REGISTRATION,
        params: {
          format: CIP36VoteRegistrationFormat.CIP_36,
          voteKeyHex,
          stakingPath: stakePath,
          paymentDestination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.REWARD_KEY,
              params: {
                stakingPath: stakePath,
              },
            },
          },
          nonce: 1454448,
        },
      },
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex:
        '3ab4380755f30a7ded07dcdcc8a0487df1a4762e7a69d383cd4e75ba25378730',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'f9a4614237159258f3555a2fb8691bc66a55d973a0bbf874b87af381698da4f651d49c3602d81a8c4f2248781c2cebf007457f6c8ba2c0961a3edea745bbf707',
        },
      ],
      auxiliaryDataSupplement: {
        type: TxAuxiliaryDataSupplementType.CIP36_REGISTRATION,
        auxiliaryDataHashHex:
          '1999b3bb9102b585c42616e40cf1290518d788f967ab4b3329dcb712ac933da0',
        cip36VoteRegistrationSignatureHex:
          'd07070f841e17f50139bfd6cadeaa89ce87474200db051f48d585cba52360f52444db9b4529e1721348763374f35fa8a054d5a3931fb3524484aa910cf465505',
      },
    },
  },
  {
    testName: 'signTxAllElementsAuxiliaryData_1 minimal_coverage_v8',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a075820fdc7791ba8f92fb6e03ad8879a0299a7afc54bd795fee76fe16bd6ea4fb85dd1',
    tx: {
      ...shelleyBase,
      auxiliaryData: {
        type: TxAuxiliaryDataType.CIP36_REGISTRATION,
        params: {
          format: CIP36VoteRegistrationFormat.CIP_36,
          voteKeyPath: unusualVotePath,
          stakingPath: stakePath,
          paymentDestination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: externalPaymentAddressHex,
            },
          },
          nonce: 1454448,
        },
      },
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex:
        'd3fa9c5f144daf3df329a62b90d93129547a724adac02064dcde8b8f211248a3',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'f4d96ac70927355eb166c2acbd2653874699c8827c0386f943e0c261e9995b87f51790f1eda9b7c40c7b48245663d344dbac5a9a97c1c4f308177aa6b7ce280d',
        },
      ],
      auxiliaryDataSupplement: {
        type: TxAuxiliaryDataSupplementType.CIP36_REGISTRATION,
        auxiliaryDataHashHex:
          'fdc7791ba8f92fb6e03ad8879a0299a7afc54bd795fee76fe16bd6ea4fb85dd1',
        cip36VoteRegistrationSignatureHex:
          '20e5f3916dcef94cbb04ca735b423db6d5ba4b521c7b241ae91d5ee5fa423ff9478ab3cda6e73979425fb3940503a2faf76b3a0254ce60deeca63a0142f15e0f',
      },
    },
  },
  {
    testName: 'signTxAllElementsAuxiliaryData_2 minimal_coverage_v8',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a07582072dd10fb9a48a9307d1c3faeda41bacb161aecedc1e6c5a3288d550e6a5c38a9',
    tx: {
      ...shelleyBase,
      auxiliaryData: {
        type: TxAuxiliaryDataType.CIP36_REGISTRATION,
        params: {
          format: CIP36VoteRegistrationFormat.CIP_36,
          delegations: [
            {
              type: CIP36VoteDelegationType.KEY,
              voteKeyHex,
              weight: 9,
            },
            {
              type: CIP36VoteDelegationType.PATH,
              voteKeyPath: votePath,
              weight: 0,
            },
          ],
          stakingPath: stakePath,
          paymentDestination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
              params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/0"),
                stakingScriptHashHex: stakeScriptHashHex,
              },
            },
          },
          nonce: 1454448,
          votingPurpose: 2790,
        },
      },
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex:
        '6cbfabb62dd3a38376acea87c1b1b8935ae2dfa4a970a6e98fb7ae04b70891a6',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '257e5047ea108e66ae5a3fd0d8b6beaef652d1530963eb32a2f9310e3dd5eaf6c8674a4caac25e4d6665d27787d401c32b6f77cb154e30f902a2cfd9371f590b',
        },
      ],
      auxiliaryDataSupplement: {
        type: TxAuxiliaryDataSupplementType.CIP36_REGISTRATION,
        auxiliaryDataHashHex:
          '72dd10fb9a48a9307d1c3faeda41bacb161aecedc1e6c5a3288d550e6a5c38a9',
        cip36VoteRegistrationSignatureHex:
          '98aaf88ee2ae3172b1a68225f63d3a9819b21942b8d22b379dbd8fe21591636674196f8f6639181d8a1e67b6ef297bc4536d130b3a249cbee14c382d8f6a4b0d',
      },
    },
  },
]

export const signTxAllElementsPoolRegistration: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsPoolRegistration minimal_coverage_v8',
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821a001e8480a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a14874657374436f696e1a0078386202182a04818a03581c14c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f1124582000112233445566778899aabbccddeeff00112233445566778899aabbccddeeff1903e81864d81e820102581de1eef1689a3970b7880dcf3cb4ca9f22453b3833824fea34105117c84081581c1234567890abcdef1234567890abcdef1234567890abcdef123456788182026b6578616d706c652e636f6d827368747470733a2f2f6578616d706c652e636f6d5820ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoMultisig],
      outputs: [outputs.trezorParity1],
      fee: 42,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: {
            poolKey: {
              type: PoolKeyType.DEVICE_OWNED,
              params: {
                path: str_to_path("1852'/1815'/0'/0/0"),
              },
            },
            vrfKeyHashHex: poolVrfKeyHashHex,
            pledge: '1000',
            cost: '100',
            margin: {numerator: '1', denominator: '2'},
            rewardAccount: {
              type: PoolRewardAccountType.DEVICE_OWNED,
              params: {
                path: poolRewardAccountPath,
              },
            },
            poolOwners: [
              {
                type: PoolOwnerType.THIRD_PARTY,
                params: {stakingKeyHashHex: poolOwnerStakingKeyHashHex},
              },
            ],
            relays: [
              {type: RelayType.MULTI_HOST, params: {dnsName: 'example.com'}},
            ],
            metadata: {
              metadataUrl: 'https://example.com',
              metadataHashHex: poolMetadataHashHex,
            },
          },
        },
      ],
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex:
        '7b26594457ff51ede6fe7085aeb35d0d074111f368612c0551562dc726afa39b',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '647741725e12dcad8be828f7a8177295e522baaeac7bbf3ad7f90b4ec23dbf0f98a258f429648b7d3468a01e6a78f919858e389db784593a3e428e621797990c',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
]

export const signTxAllElementsCertificatesOrdinary: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsCertificatesOrdinary minimal_coverage_v8',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a048b82008200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c82018200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c83028200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497383078200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1183088200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1183098200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c8200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a1830e8200581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba68200581cd098c6a0a621f3343abe55877ee88fd5a83363e3c7887b3c48839092830f8200581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba682782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef84108200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a11382782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef83118200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a11383128200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a182782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef',
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: {
            stakeCredential: keyPathCredential(stakePath),
          },
        },
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: {
            stakeCredential: keyPathCredential(stakePath),
          },
        },
        {
          type: CertificateType.STAKE_DELEGATION,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            poolKeyHashHex,
          },
        },
        {
          type: CertificateType.STAKE_REGISTRATION_CONWAY,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            deposit: 17,
          },
        },
        {
          type: CertificateType.STAKE_DEREGISTRATION_CONWAY,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            deposit: 17,
          },
        },
        {
          type: CertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            dRep: {
              type: DRepParamsType.KEY_PATH,
              keyPath: dRepPath,
            },
          },
        },
        {
          type: CertificateType.AUTHORIZE_COMMITTEE_HOT,
          params: {
            coldCredential: keyPathCredential(committeeColdPath),
            hotCredential: keyPathCredential(committeeHotPath),
          },
        },
        {
          type: CertificateType.RESIGN_COMMITTEE_COLD,
          params: {
            coldCredential: keyPathCredential(committeeColdPath),
            anchor,
          },
        },
        {
          type: CertificateType.DREP_REGISTRATION,
          params: {
            dRepCredential: keyPathCredential(dRepPath),
            deposit: 19,
            anchor,
          },
        },
        {
          type: CertificateType.DREP_DEREGISTRATION,
          params: {
            dRepCredential: keyPathCredential(dRepPath),
            deposit: 19,
          },
        },
        {
          type: CertificateType.DREP_UPDATE,
          params: {
            dRepCredential: keyPathCredential(dRepPath),
            anchor,
          },
        },
      ],
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex:
        'd5c10b6e8632ebac921a0523e7a9ce90b493bc043ebecbcdc08aa928956dde0f',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            '8d384627f012ffeeff05052da49e6f710a50fa63f46648f87edae7019568f3728b49bc40cef2897d19b06dfc123c72da82a124d1cf5ee587b66c6639af8ac605',
        },
        {
          path: str_to_path("1852'/1815'/0'/2/0"),
          witnessSignatureHex:
            'ba9a1101b7fdfedeb6d347d8fb331bc34eaa397fe9fd6f9513b4261fec671c0ece05f167c544d96d30b132a359ef936555bfb3708db708277bea0920fbd68d00',
        },
        {
          path: str_to_path("1852'/1815'/0'/4/0"),
          witnessSignatureHex:
            '0a50e0d49dce2f410dc45cf3bf97dda8649dacbf20dc0a476af7cca9a7c1f3c4ed79d00b187a5d1cc47e22c1dbcc1415246bd90a310f3f4be8093ea000798607',
        },
        {
          path: str_to_path("1852'/1815'/0'/3/0"),
          witnessSignatureHex:
            '2fd679a7e09cac2474f66d7aaaafaa85b5045e23f38768e5fa3be47bb6f9904abe05cfe115ea875f5cd75a373f6028f2706fe931890ac0f7f0cc08fe8031a80b',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
]

export const signTxAllElementsCombinedCertificates: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsCombinedCertificates minimal_coverage_v8',
    appVersion: {supportedSinceV8: true},
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    txBody:
      'a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a049082008200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c82018200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c83078200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1183088200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c1183028200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49738304581c8e00cd50efb2c15b548abeced2bce0ec4ee445a6954d762aa301d13f182a83098200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c8200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a1830e8200581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba68200581cd098c6a0a621f3343abe55877ee88fd5a83363e3c7887b3c48839092830f8200581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba682782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef84108200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a11382782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef83118200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a11383128200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a182782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef840a8200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49738200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a1840b8200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49731a000f4240840c8200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c8200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a11a000f4240850d8200581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49738200581cba41c59ac6e1a0e4ac304af98db801097d0bf8d2a5b28a54752426a11a000f4240',
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: {stakeCredential: keyPathCredential(stakePath)},
        },
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: {stakeCredential: keyPathCredential(stakePath)},
        },
        {
          type: CertificateType.STAKE_REGISTRATION_CONWAY,
          params: {stakeCredential: keyPathCredential(stakePath), deposit: 17},
        },
        {
          type: CertificateType.STAKE_DEREGISTRATION_CONWAY,
          params: {stakeCredential: keyPathCredential(stakePath), deposit: 17},
        },
        {
          type: CertificateType.STAKE_DELEGATION,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            poolKeyHashHex,
          },
        },
        {
          type: CertificateType.STAKE_POOL_RETIREMENT,
          params: {
            poolKeyPath: poolRetirementPath,
            retirementEpoch: 42,
          },
        },
        {
          type: CertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            dRep: {type: DRepParamsType.KEY_PATH, keyPath: dRepPath},
          },
        },
        {
          type: CertificateType.AUTHORIZE_COMMITTEE_HOT,
          params: {
            coldCredential: keyPathCredential(committeeColdPath),
            hotCredential: keyPathCredential(committeeHotPath),
          },
        },
        {
          type: CertificateType.RESIGN_COMMITTEE_COLD,
          params: {
            coldCredential: keyPathCredential(committeeColdPath),
            anchor,
          },
        },
        {
          type: CertificateType.DREP_REGISTRATION,
          params: {
            dRepCredential: keyPathCredential(dRepPath),
            deposit: 19,
            anchor,
          },
        },
        {
          type: CertificateType.DREP_DEREGISTRATION,
          params: {dRepCredential: keyPathCredential(dRepPath), deposit: 19},
        },
        {
          type: CertificateType.DREP_UPDATE,
          params: {dRepCredential: keyPathCredential(dRepPath), anchor},
        },
        {
          type: CertificateType.STAKE_POOL_AND_DREP_DELEGATION,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            poolKeyHashHex,
            dRep: {type: DRepParamsType.KEY_PATH, keyPath: dRepPath},
          },
        },
        {
          type: CertificateType.ACCOUNT_REGISTRATION_DELEGATION_TO_STAKE_POOL,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            poolKeyHashHex,
            deposit: 1000000,
          },
        },
        {
          type: CertificateType.ACCOUNT_REGISTRATION_DELEGATION_TO_DREP,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            dRep: {type: DRepParamsType.KEY_PATH, keyPath: dRepPath},
            deposit: 1000000,
          },
        },
        {
          type: CertificateType.ACCOUNT_REGISTRATION_DELEGATION_TO_STAKE_POOL_AND_DREP,
          params: {
            stakeCredential: keyPathCredential(stakePath),
            poolKeyHashHex,
            dRep: {type: DRepParamsType.KEY_PATH, keyPath: dRepPath},
            deposit: 1000000,
          },
        },
      ],
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex: 'b3a34e61830daae31aafa26c1d5a363bd7e86f7d37f031e1ddaa881f3bf35940',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex: 'fd9fa79656e587d18c56df957f68fcf62a6404a691d9b29c5507ab973aadadba5b1f4d438ecf1f755f3d1891bca64a4f42d5b20f39b07eb73d3f842243adac09',
        },
        {
          path: stakePath,
          witnessSignatureHex: '4f4a2283b7061742dc9bd7ffa4e7f301db7f87d4b31a34bc1c188beff7ccb67bfb1c453cc0c46e61f3c8a25b4ca99cba2a3fa2bcf0c0069206c95b6eea3b2202',
        },
        {
          path: poolRetirementPath,
          witnessSignatureHex: 'c73e5a35237a873a66aece7f2bf77236812a5ef7bb10f141c28c8c0d1d4d5f7846fbf8e94f476345f3f1ebd94213672471701e6298c9d9cbd70a9e32d73ec507',
        },
        {
          path: committeeColdPath,
          witnessSignatureHex: 'd6b1c7caf997af96ff082ea082e8bc388c2a22e82999e1040f54f088fd99b0b50aeb09c1f7536b6aaf18c4c003fa63e0c4788f74e308b98d0d0e7da8e8deb608',
        },
        {
          path: dRepPath,
          witnessSignatureHex: '0cf57ea5835ff2a8bb8939711d2c8ca620f25ddf64b18b71e9e0baab6c70c3108c28d8b917f89d33010cca73ea330fced0147602b455c1b859a2c39e97fb8b0e',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
]

export const signTxAllElementsCertificatesMultisig: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsCertificatesMultisig minimal_coverage_v8',
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    txBody:
      'a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821a001e8480a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a14874657374436f696e1a0078386202182a048e82008201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b427782018201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b427783028201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497383098201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42778200581c7afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c883098201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42778201581c1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c883098201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277810283098201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42778103830e8201581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba68200581c1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8830e8201581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba68201581c1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8830f8201581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba682782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef84108201581c1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c81382782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef83118201581c1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c81383128201581c1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c882782768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f7258201afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef83088201581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b427711',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoMultisig],
      outputs: [outputs.trezorParity1],
      fee: 42,
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
          },
        },
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
          },
        },
        {
          type: CertificateType.STAKE_DELEGATION,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
            poolKeyHashHex,
          },
        },
        {
          type: CertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
            dRep: {
              type: DRepParamsType.KEY_HASH,
              keyHashHex: dRepKeyHashHex,
            },
          },
        },
        {
          type: CertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
            dRep: {
              type: DRepParamsType.SCRIPT_HASH,
              scriptHashHex: dRepScriptHashHex,
            },
          },
        },
        {
          type: CertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
            dRep: abstainDRep,
          },
        },
        {
          type: CertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
            dRep: noConfidenceDRep,
          },
        },
        {
          type: CertificateType.AUTHORIZE_COMMITTEE_HOT,
          params: {
            coldCredential: scriptHashCredential(committeeScriptHashHex),
            hotCredential: keyHashCredential(committeeKeyHashHex),
          },
        },
        {
          type: CertificateType.AUTHORIZE_COMMITTEE_HOT,
          params: {
            coldCredential: scriptHashCredential(committeeScriptHashHex),
            hotCredential: scriptHashCredential(committeeKeyHashHex),
          },
        },
        {
          type: CertificateType.RESIGN_COMMITTEE_COLD,
          params: {
            coldCredential: scriptHashCredential(committeeScriptHashHex),
            anchor,
          },
        },
        {
          type: CertificateType.DREP_REGISTRATION,
          params: {
            dRepCredential: scriptHashCredential(dRepScriptHashHex),
            deposit: 19,
            anchor,
          },
        },
        {
          type: CertificateType.DREP_DEREGISTRATION,
          params: {
            dRepCredential: scriptHashCredential(dRepScriptHashHex),
            deposit: 19,
          },
        },
        {
          type: CertificateType.DREP_UPDATE,
          params: {
            dRepCredential: scriptHashCredential(dRepScriptHashHex),
            anchor,
          },
        },
        {
          type: CertificateType.STAKE_DEREGISTRATION_CONWAY,
          params: {
            stakeCredential: scriptHashCredential(stakeScriptHashHex),
            deposit: 17,
          },
        },
      ],
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex:
        '8521bed764330528ad9134b34ef58dfe542155296d2d8ea4e0633ac7b3ffd582',
      witnesses: [],
      auxiliaryDataSupplement: null,
    },
  },
]

export const signTxAllElementsNoCertificates: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsNoCertificates minimal_coverage_v8',
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    txBody:
      'b100818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821a001e8480a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a14874657374436f696e1a0078386283581d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c0158203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b702182a030a05a1581df129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd1903e808182f09a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a24874657374436f696e1a007838624875657374436f696e3a007838610b58203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70d818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000e81581c14c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11240f011082583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff821a001e8480a1581c0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425a14874657374436f696e1a00783862110a12818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b70013a18200581ccf737588be6e9edeb737eb2e6d06e5cbd292bd8ee32e410c0bba1ba6a18258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7008200f615181b16181c',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoMultisig],
      outputs: [outputs.trezorParity1, outputs.trezorParityDatumHash1],
      fee: 42,
      ttl: 10,
      withdrawals: [
        {
          stakeCredential: scriptHashCredential(
            '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
          ),
          amount: 1000,
        },
      ],
      mint: [
        {
          policyIdHex:
            '0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425',
          tokens: [
            {
              assetNameHex: '74657374436f696e',
              amount: 7878754,
            },
            {
              assetNameHex: '75657374436f696e',
              amount: -7878754,
            },
          ],
        },
      ],
      includeNetworkId: true,
      validityIntervalStart: 47,
      requiredSigners: [
        {
          type: TxRequiredSignerType.PATH,
          path: str_to_path("1852'/1815'/0'/0/0"),
        },
      ],
      scriptDataHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      collateralInputs: [inputs.utxoShelley],
      collateralOutput: outputs.trezorParity1,
      totalCollateral: 10,
      referenceInputs: [inputs.utxoShelley],
      treasury: 27,
      donation: 28,
      votingProcedures: [
        {
          voter: {
            type: VoterType.COMMITTEE_KEY_PATH,
            keyPath: committeeColdPath,
          },
          votes: [
            {
              govActionId: {
                txHashHex:
                  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
                govActionIndex: 0,
              },
              votingProcedure: {vote: 0},
            },
          ],
        },
      ],
    } as SignTxTestCase['tx'],
    expectedResult: {
      txHashHex:
        '3a1c694bacc75fd9e6b20d8d5a9e2e0c950b3dd40b18161b6b7c368fda9a4f27',
      witnesses: [
        {
          path: str_to_path("1852'/1815'/0'/0/0"),
          witnessSignatureHex:
            'e5f5b8de8f1a7eeb7dca22f6cd1c31a0a7ca7e02bdbb3afb17b4bfcfc19a9d97136e74c3f43d96bc68a57fd43cc99d6ffab2da60e911ffebe2df2c091424120f',
        },
        {
          path: str_to_path("1852'/1815'/0'/4/0"),
          witnessSignatureHex:
            'a4b6daf0b0bb308e8ea422dda5eebf0fc550a0d123895ec74ef075bfa2946adcf97b5ab1e7e41c909ff238fd6e31553a7d786d37187a30bb99f0eb93fc5c4c01',
        },
      ],
      auxiliaryDataSupplement: null,
    },
  },
]

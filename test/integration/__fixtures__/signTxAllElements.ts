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
} from '../../../src/types/public'
import type {SignTxTestCase} from './signTx'
import {inputs, outputs, shelleyBase} from './txElements'

const pendingResult = {} as SignTxTestCase['expectedResult']

const stakePath = str_to_path("1852'/1815'/0'/2/0")
const dRepPath = str_to_path("1852'/1815'/0'/3/0")
const committeeColdPath = str_to_path("1852'/1815'/0'/4/0")
const committeeHotPath = str_to_path("1852'/1815'/0'/5/0")
const votePath = str_to_path("1694'/1815'/0'/0/1")
const unusualVotePath = str_to_path("1694'/1815'/101'/0/1")

const poolKeyHashHex = 'f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973'
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
    testName: 'signTxAllElementsAuxiliaryData_0',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
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
    expectedResult: pendingResult,
  },
  {
    testName: 'signTxAllElementsAuxiliaryData_1',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
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
    expectedResult: pendingResult,
  },
  {
    testName: 'signTxAllElementsAuxiliaryData_2',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
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
    expectedResult: pendingResult,
  },
]

export const signTxAllElementsPoolRegistration: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsPoolRegistration',
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
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
            vrfKeyHashHex: poolKeyHashHex,
            pledge: '1000',
            cost: '100',
            margin: { numerator: '1', denominator: '2' },
            rewardAccount: {
              type: PoolRewardAccountType.THIRD_PARTY,
              params: {
                rewardAccountHex: poolKeyHashHex,
              }
            },
            poolOwners: [{ type: PoolOwnerType.DEVICE_OWNED, params: { stakingPath: stakePath } }],
            relays: [{ type: RelayType.MULTI_HOST, params: { dnsName: 'example.com' } }],
            metadata: { metadataUrl: 'https://example.com', metadataHashHex: poolKeyHashHex },
          }
        }
      ]
    } as SignTxTestCase['tx'],
    expectedResult: pendingResult,
  },
]

export const signTxAllElementsCertificatesOrdinary: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsCertificatesOrdinary',
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
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
    expectedResult: pendingResult,
  },
]

export const signTxAllElementsCertificatesMultisig: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsCertificatesMultisig',
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
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
    expectedResult: pendingResult,
  },
]

export const signTxAllElementsNoCertificates: SignTxTestCase[] = [
  {
    testName: 'signTxAllElementsNoCertificates',
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoMultisig],
      outputs: [outputs.trezorParity1, outputs.trezorParityDatumHash1],
      fee: 42,
      ttl: 10,
      withdrawals: [
        {
          stakeCredential: scriptHashCredential('29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd'),
          amount: 1000,
        },
      ],
      mint: [
        {
          policyIdHex: '0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425',
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
      requiredSigners: [{
        type: TxRequiredSignerType.PATH,
        path: str_to_path("1852'/1815'/0'/0/0"),
      }],
      scriptDataHashHex: '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
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
              govActionId: { txHashHex: '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7', govActionIndex: 0 },
              votingProcedure: { vote: 0 }
            }
          ],
        },
      ],
    } as SignTxTestCase['tx'],
    expectedResult: pendingResult,
  },
]

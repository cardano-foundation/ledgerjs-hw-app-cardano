// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  AddressType,
  CertificateType,
  CIP36VoteDelegationType,
  CIP36VoteRegistrationFormat,
  DatumType,
  NativeScriptType,
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  RelayType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
  TxOutputFormat,
  VoteOption,
  VoterType,
} from './public'

// Basic primitives
export type VarLenAsciiString = string & {__type: 'ascii'}
export type FixLenHexString<N> = string & {__type: 'hex'; __length: N}
export type HexString = string & {__type: 'hex'}

export type _Uint64_num = number & {__type: 'uint64_t'}
export type _Uint64_bigint = bigint & {__type: 'uint64_t'}
export type Uint64_str = string & {__type: 'uint64_t'}
export type Uint32_t = number & {__type: 'uint32_t'}
export type Uint16_t = number & {__type: 'uint16_t'}
export type Uint8_t = number & {__type: 'uint8_t'}
export type _Int64_num = number & {__type: 'int64_t'}
export type _Int64_bigint = bigint & {__type: 'int64_t'}
export type Int64_str = string & {__type: 'int64_t'}
export type ValidBIP32Path = Array<Uint32_t> & {__type: 'bip32_path'}

// Reexport blockchain spec
export {
  AddressType,
  CertificateType,
  DatumType,
  NativeScriptType,
  RelayType,
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  CIP36VoteDelegationType,
  TxOutputDestinationType,
  TxOutputFormat,
}
export {
  Version,
  DeviceCompatibility,
  NativeScriptHashDisplayFormat,
} from './public'
// Our types
export const EXTENDED_PUBLIC_KEY_LENGTH = 64
export const KEY_HASH_LENGTH = 28
export const SCRIPT_HASH_LENGTH = 28
export const TX_HASH_LENGTH = 32
export const AUXILIARY_DATA_HASH_LENGTH = 32
export const KES_PUBLIC_KEY_LENGTH = 32
export const VRF_KEY_HASH_LENGTH = 32
export const REWARD_ACCOUNT_HEX_LENGTH = 29
export const ED25519_SIGNATURE_LENGTH = 64
export const SCRIPT_DATA_HASH_LENGTH = 32
export const DATUM_HASH_LENGTH = 32
export const ANCHOR_HASH_LENGTH = 32

export const MAX_URL_LENGTH = 128
export const MAX_DNS_NAME_LENGTH = 128

export type ParsedInput = {
  txHashHex: FixLenHexString<typeof TX_HASH_LENGTH>
  outputIndex: Uint32_t
  path: ValidBIP32Path | null
}

export const enum CredentialType {
  // enum values are affected by backwards-compatibility
  KEY_PATH = 0,
  KEY_HASH = 2,
  SCRIPT_HASH = 1,
}

export type ParsedCredential =
  | {
      type: CredentialType.KEY_PATH
      path: ValidBIP32Path
    }
  | {
      type: CredentialType.KEY_HASH
      keyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }
  | {
      type: CredentialType.SCRIPT_HASH
      scriptHashHex: FixLenHexString<typeof SCRIPT_HASH_LENGTH>
    }

export const enum DRepType {
  KEY_HASH = 0,
  KEY_PATH = 100,
  SCRIPT_HASH = 1,
  ABSTAIN = 2,
  NO_CONFIDENCE = 3,
}

export type ParsedDRep =
  | {
      type: DRepType.KEY_PATH
      path: ValidBIP32Path
    }
  | {
      type: DRepType.KEY_HASH
      keyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }
  | {
      type: DRepType.SCRIPT_HASH
      scriptHashHex: FixLenHexString<typeof SCRIPT_HASH_LENGTH>
    }
  | {
      type: DRepType.ABSTAIN
    }
  | {
      type: DRepType.NO_CONFIDENCE
    }

export type ParsedAnchor = {
  url: VarLenAsciiString
  hashHex: FixLenHexString<typeof ANCHOR_HASH_LENGTH>
} & {__brand: 'anchor'}

export type ParsedCertificate =
  | {
      type: CertificateType.STAKE_REGISTRATION
      stakeCredential: ParsedCredential
    }
  | {
      type: CertificateType.STAKE_REGISTRATION_CONWAY
      stakeCredential: ParsedCredential
      deposit: Uint64_str
    }
  | {
      type: CertificateType.STAKE_DEREGISTRATION
      stakeCredential: ParsedCredential
    }
  | {
      type: CertificateType.STAKE_DEREGISTRATION_CONWAY
      stakeCredential: ParsedCredential
      deposit: Uint64_str
    }
  | {
      type: CertificateType.STAKE_DELEGATION
      stakeCredential: ParsedCredential
      poolKeyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }
  | {
      type: CertificateType.VOTE_DELEGATION
      stakeCredential: ParsedCredential
      dRep: ParsedDRep
    }
  | {
      type: CertificateType.AUTHORIZE_COMMITTEE_HOT
      coldCredential: ParsedCredential
      hotCredential: ParsedCredential
    }
  | {
      type: CertificateType.RESIGN_COMMITTEE_COLD
      coldCredential: ParsedCredential
      anchor: ParsedAnchor | null
    }
  | {
      type: CertificateType.DREP_REGISTRATION
      dRepCredential: ParsedCredential
      deposit: Uint64_str
      anchor: ParsedAnchor | null
    }
  | {
      type: CertificateType.DREP_DEREGISTRATION
      dRepCredential: ParsedCredential
      deposit: Uint64_str
    }
  | {
      type: CertificateType.DREP_UPDATE
      dRepCredential: ParsedCredential
      anchor: ParsedAnchor | null
    }
  | {
      type: CertificateType.STAKE_POOL_REGISTRATION
      pool: ParsedPoolParams
    }
  | {
      type: CertificateType.STAKE_POOL_RETIREMENT
      path: ValidBIP32Path
      retirementEpoch: Uint64_str
    }

export const TOKEN_POLICY_LENGTH = 28

// this type is used with both uint64 for outputs and int64 for minting
export type ParsedToken<IntegerType> = {
  assetNameHex: HexString
  amount: IntegerType
}

export type ParsedAssetGroup<T> = {
  policyIdHex: FixLenHexString<typeof TOKEN_POLICY_LENGTH>
  tokens: Array<ParsedToken<T>>
}

export type ParsedWithdrawal = {
  amount: Uint64_str
  stakeCredential: ParsedCredential
}

export const enum RequiredSignerType {
  PATH = 0,
  HASH = 1,
}

export type ParsedRequiredSigner =
  | {
      type: RequiredSignerType.HASH
      hashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }
  | {
      type: RequiredSignerType.PATH
      path: ValidBIP32Path
    }

export type ParsedGovActionId = {
  txHashHex: FixLenHexString<typeof TX_HASH_LENGTH>
  govActionIndex: Uint32_t
}

export type ParsedVotingProcedure = {
  vote: VoteOption
  anchor: ParsedAnchor | null
}

export type ParsedVote = {
  govActionId: ParsedGovActionId
  votingProcedure: ParsedVotingProcedure
}

export type ParsedVoter =
  | {
      type: VoterType.COMMITTEE_KEY_HASH
      keyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }
  | {
      type: VoterType.COMMITTEE_KEY_PATH
      keyPath: ValidBIP32Path
    }
  | {
      type: VoterType.COMMITTEE_SCRIPT_HASH
      scriptHashHex: FixLenHexString<typeof SCRIPT_HASH_LENGTH>
    }
  | {
      type: VoterType.DREP_KEY_HASH
      keyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }
  | {
      type: VoterType.DREP_KEY_PATH
      keyPath: ValidBIP32Path
    }
  | {
      type: VoterType.DREP_SCRIPT_HASH
      scriptHashHex: FixLenHexString<typeof SCRIPT_HASH_LENGTH>
    }
  | {
      type: VoterType.STAKE_POOL_KEY_HASH
      keyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }
  | {
      type: VoterType.STAKE_POOL_KEY_PATH
      keyPath: ValidBIP32Path
    }

export type ParsedVoterVotes = {
  voter: ParsedVoter
  votes: Array<ParsedVote>
}

export const CVOTE_PUBLIC_KEY_LENGTH = 32

export type CVotePublicKey = FixLenHexString<typeof CVOTE_PUBLIC_KEY_LENGTH>

export type ParsedTxAuxiliaryData =
  | {
      type: TxAuxiliaryDataType.ARBITRARY_HASH
      hashHex: FixLenHexString<typeof AUXILIARY_DATA_HASH_LENGTH>
    }
  | {
      type: TxAuxiliaryDataType.CIP36_REGISTRATION
      params: ParsedCVoteRegistrationParams
    }

export type ParsedCVoteRegistrationParams = {
  format: CIP36VoteRegistrationFormat
  votePublicKey: CVotePublicKey | null
  votePublicKeyPath: ValidBIP32Path | null
  delegations: Array<ParsedCVoteDelegation> | null
  stakingPath: ValidBIP32Path
  paymentDestination: ParsedOutputDestination
  nonce: Uint64_str
  votingPurpose: Uint64_str | null
}

export type ParsedCVoteDelegation =
  | {
      type: CIP36VoteDelegationType.PATH
      voteKeyPath: ValidBIP32Path
      weight: Uint32_t
    }
  | {
      type: CIP36VoteDelegationType.KEY
      voteKey: CVotePublicKey
      weight: Uint32_t
    }

export type ParsedNetwork = {
  protocolMagic: Uint32_t
  networkId: Uint8_t
}

export type ParsedTransaction = {
  network: ParsedNetwork
  inputs: ParsedInput[]
  outputs: ParsedOutput[]
  fee: Uint64_str
  ttl: Uint64_str | null
  certificates: ParsedCertificate[]
  withdrawals: ParsedWithdrawal[]
  auxiliaryData: ParsedTxAuxiliaryData | null
  validityIntervalStart: Uint64_str | null
  mint: Array<ParsedAssetGroup<Int64_str>> | null
  scriptDataHashHex: ScriptDataHash | null
  collateralInputs: ParsedInput[]
  requiredSigners: ParsedRequiredSigner[]
  includeNetworkId: boolean
  collateralOutput: ParsedOutput | null
  totalCollateral: Uint64_str | null
  referenceInputs: ParsedInput[]
  votingProcedures: ParsedVoterVotes[]
  treasury: Uint64_str | null
  donation: Uint64_str | null
}

export type ParsedTransactionOptions = {
  tagCborSets: boolean
}

export type ParsedSigningRequest = {
  tx: ParsedTransaction
  signingMode: TransactionSigningMode
  additionalWitnessPaths: ValidBIP32Path[]
  options: ParsedTransactionOptions
}

export type ScriptDataHash = FixLenHexString<typeof SCRIPT_DATA_HASH_LENGTH>

export type ParsedMargin = {
  numerator: Uint64_str
  denominator: Uint64_str
}

export type ParsedPoolParams = {
  poolKey: ParsedPoolKey
  vrfHashHex: FixLenHexString<typeof VRF_KEY_HASH_LENGTH>
  pledge: Uint64_str
  cost: Uint64_str
  margin: ParsedMargin
  rewardAccount: ParsedPoolRewardAccount
  owners: ParsedPoolOwner[]
  relays: ParsedPoolRelay[]
  metadata: ParsedPoolMetadata | null
}

export type ParsedPoolKey =
  | {
      type: PoolKeyType.DEVICE_OWNED
      path: ValidBIP32Path
    }
  | {
      type: PoolKeyType.THIRD_PARTY
      hashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }

export type ParsedPoolOwner =
  | {
      type: PoolOwnerType.DEVICE_OWNED
      path: ValidBIP32Path
    }
  | {
      type: PoolOwnerType.THIRD_PARTY
      hashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
    }

export type ParsedPoolRewardAccount =
  | {
      type: PoolRewardAccountType.DEVICE_OWNED
      path: ValidBIP32Path
    }
  | {
      type: PoolRewardAccountType.THIRD_PARTY
      rewardAccountHex: FixLenHexString<typeof REWARD_ACCOUNT_HEX_LENGTH>
    }

export type ParsedPoolRelay =
  | {
      type: RelayType.SINGLE_HOST_IP_ADDR
      port: Uint16_t | null
      ipv4: Buffer | null
      ipv6: Buffer | null
    }
  | {
      type: RelayType.SINGLE_HOST_HOSTNAME
      port: Uint16_t | null
      dnsName: VarLenAsciiString
    }
  | {
      type: RelayType.MULTI_HOST
      dnsName: VarLenAsciiString
    }

export type ParsedPoolMetadata = {
  url: VarLenAsciiString
  hashHex: FixLenHexString<32>
} & {__brand: 'pool_metadata'}

export const enum SpendingDataSourceType {
  NONE = 'no_spending',
  PATH = 'spending_path',
  SCRIPT_HASH = 'spending_script_hash',
}

type SpendingDataSourceNone = {
  type: SpendingDataSourceType.NONE
}
type SpendingDataSourcePath = {
  type: SpendingDataSourceType.PATH
  path: ValidBIP32Path
}
type SpendingDataSourceScriptHash = {
  type: SpendingDataSourceType.SCRIPT_HASH
  scriptHashHex: FixLenHexString<typeof SCRIPT_HASH_LENGTH>
}

export const enum StakingDataSourceType {
  NONE = 'no_staking',
  KEY_PATH = 'staking_key_path',
  KEY_HASH = 'staking_key_hash',
  BLOCKCHAIN_POINTER = 'blockchain_pointer',
  SCRIPT_HASH = 'staking_script_hash',
}

type ParsedBlockchainPointer = {
  blockIndex: Uint32_t
  txIndex: Uint32_t
  certificateIndex: Uint32_t
}

type StakingDataSourceNone = {
  type: StakingDataSourceType.NONE
}
type StakingDataSourcePath = {
  type: StakingDataSourceType.KEY_PATH
  path: ValidBIP32Path
}
type StakingDataSourceKeyHash = {
  type: StakingDataSourceType.KEY_HASH
  keyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
}
type StakingDataSourcePointer = {
  type: StakingDataSourceType.BLOCKCHAIN_POINTER
  pointer: ParsedBlockchainPointer
}
type StakingDataSourceScriptHash = {
  type: StakingDataSourceType.SCRIPT_HASH
  scriptHashHex: FixLenHexString<typeof SCRIPT_HASH_LENGTH>
}

export type SpendingDataSource =
  | SpendingDataSourcePath
  | SpendingDataSourceScriptHash
  | SpendingDataSourceNone
export type StakingDataSource =
  | StakingDataSourceNone
  | StakingDataSourcePath
  | StakingDataSourceKeyHash
  | StakingDataSourcePointer
  | StakingDataSourceScriptHash

export type ByronAddressParams = {
  type: AddressType.BYRON
  protocolMagic: Uint32_t
  spendingDataSource: SpendingDataSourcePath
  stakingDataSource: StakingDataSourceNone
}

export type ShelleyAddressParams = {
  type:
    | AddressType.BASE_PAYMENT_KEY_STAKE_KEY
    | AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY
    | AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT
    | AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT
    | AddressType.ENTERPRISE_KEY
    | AddressType.ENTERPRISE_SCRIPT
    | AddressType.POINTER_KEY
    | AddressType.POINTER_SCRIPT
    | AddressType.REWARD_KEY
    | AddressType.REWARD_SCRIPT
  networkId: Uint8_t
} & (
  | {
      type:
        | AddressType.BASE_PAYMENT_KEY_STAKE_KEY
        | AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT
        | AddressType.ENTERPRISE_KEY
        | AddressType.POINTER_KEY
      spendingDataSource: SpendingDataSourcePath
    }
  | {
      type:
        | AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY
        | AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT
        | AddressType.ENTERPRISE_SCRIPT
        | AddressType.POINTER_SCRIPT
      spendingDataSource: SpendingDataSourceScriptHash
    }
  | {
      type: AddressType.REWARD_KEY | AddressType.REWARD_SCRIPT
      spendingDataSource: SpendingDataSourceNone
    }
) &
  (
    | {
        type:
          | AddressType.BASE_PAYMENT_KEY_STAKE_KEY
          | AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY
          | AddressType.REWARD_KEY
        stakingDataSource: StakingDataSourcePath | StakingDataSourceKeyHash
      }
    | {
        type:
          | AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT
          | AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT
          | AddressType.REWARD_SCRIPT
        stakingDataSource: StakingDataSourceScriptHash
      }
    | {
        type: AddressType.ENTERPRISE_KEY | AddressType.ENTERPRISE_SCRIPT
        stakingDataSource: StakingDataSourceNone
      }
    | {
        type: AddressType.POINTER_KEY | AddressType.POINTER_SCRIPT
        stakingDataSource: StakingDataSourcePointer
      }
  )

export type ParsedAddressParams = ByronAddressParams | ShelleyAddressParams

export type ParsedOutputDestination =
  | {
      type: TxOutputDestinationType.THIRD_PARTY
      addressHex: HexString
    }
  | {
      type: TxOutputDestinationType.DEVICE_OWNED
      addressParams: ParsedAddressParams
    }

export type DatumHash = FixLenHexString<typeof DATUM_HASH_LENGTH>

export type ParsedDatum =
  | {
      type: DatumType.HASH
      datumHashHex: FixLenHexString<typeof DATUM_HASH_LENGTH>
    }
  | {
      type: DatumType.INLINE
      datumHex: HexString
    }

export type ParsedOutput = {
  format: TxOutputFormat
  amount: Uint64_str
  tokenBundle: ParsedAssetGroup<Uint64_str>[]
  destination: ParsedOutputDestination
  datum: ParsedDatum | null
  referenceScriptHex: HexString | null
}

export const ASSET_NAME_LENGTH_MAX = 32

export type ParsedOperationalCertificate = {
  kesPublicKeyHex: FixLenHexString<typeof KES_PUBLIC_KEY_LENGTH>
  kesPeriod: Uint64_str
  issueCounter: Uint64_str
  coldKeyPath: ValidBIP32Path
}

export type ParsedCVote = {
  voteCastDataHex: HexString
  witnessPath: ValidBIP32Path
}

export const NATIVE_SCRIPT_HASH_LENGTH = 28

export type ParsedSimpleNativeScript =
  | {
      type: NativeScriptType.PUBKEY_DEVICE_OWNED
      params: {
        path: ValidBIP32Path
      }
    }
  | {
      type: NativeScriptType.PUBKEY_THIRD_PARTY
      params: {
        keyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>
      }
    }
  | {
      type: NativeScriptType.INVALID_BEFORE
      params: {
        slot: Uint64_str
      }
    }
  | {
      type: NativeScriptType.INVALID_HEREAFTER
      params: {
        slot: Uint64_str
      }
    }

export type ParsedComplexNativeScript =
  | {
      type: NativeScriptType.ALL | NativeScriptType.ANY
      params: {
        scripts: ParsedNativeScript[]
      }
    }
  | {
      type: NativeScriptType.N_OF_K
      params: {
        requiredCount: Uint32_t
        scripts: ParsedNativeScript[]
      }
    }

export type ParsedNativeScript =
  | ParsedSimpleNativeScript
  | ParsedComplexNativeScript

import { AddressType, CertificateType, NativeScriptType, PoolKeyType, PoolOwnerType, PoolRewardAccountType, RelayType, TransactionSigningMode, TxAuxiliaryDataType, TxOutputDestinationType } from './public'

// Basic primitives
export type VarlenAsciiString = string & { __type: 'ascii' }
export type FixlenHexString<N> = string & { __type: 'hex', __length: N }
export type HexString = string & { __type: 'hex' }

export type _Uint64_num = number & { __type: 'uint64_t' }
export type _Uint64_bigint = bigint & { __type: 'uint64_t' }

export type ValidBIP32Path = Array<Uint32_t> & { __type: 'bip32_path' }
export type Uint64_str = string & { __type: 'uint64_t' }
export type Uint32_t = number & { __type: 'uint32_t' }
export type Uint16_t = number & { __type: 'uint16_t' }
export type Uint8_t = number & { __type: 'uint8_t' }

// Reexport blockchain spec
export { AddressType, CertificateType, NativeScriptType, RelayType, PoolKeyType, PoolOwnerType, PoolRewardAccountType, TransactionSigningMode, TxAuxiliaryDataType, TxOutputDestinationType }
export { Version, DeviceCompatibility, NativeScriptHashDisplayFormat } from './public'
// Our types
export const EXTENDED_PUBLIC_KEY_LENGTH = 64
export const KEY_HASH_LENGTH = 28
export const TX_HASH_LENGTH = 32
export const AUXILIARY_DATA_HASH_LENGTH = 32
export const KES_PUBLIC_KEY_LENGTH = 32
export const VRF_KEY_HASH_LENGTH = 32
export const REWARD_ACCOUNT_HEX_LENGTH = 29
export const ED25519_SIGNATURE_LENGTH = 64

export type ParsedCertificate = {
    type: CertificateType.STAKE_REGISTRATION
    path: ValidBIP32Path
} | {
    type: CertificateType.STAKE_DEREGISTRATION
    path: ValidBIP32Path
} | {
    type: CertificateType.STAKE_DELEGATION
    path: ValidBIP32Path
    poolKeyHashHex: FixlenHexString<typeof KEY_HASH_LENGTH>
} | {
    type: CertificateType.STAKE_POOL_REGISTRATION
    pool: ParsedPoolParams
} | {
    type: CertificateType.STAKE_POOL_RETIREMENT
    path: ValidBIP32Path
    retirementEpoch: Uint64_str
}

export const TOKEN_POLICY_LENGTH = 28


export type ParsedToken = {
    assetNameHex: HexString,
    amount: Uint64_str,
};

export type ParsedAssetGroup = {
    policyIdHex: FixlenHexString<typeof TOKEN_POLICY_LENGTH>,
    tokens: Array<ParsedToken>,
};


export type ParsedNetwork = {
    protocolMagic: Uint32_t
    networkId: Uint8_t
}

export const CATALYST_VOTING_PUBLIC_KEY_LENGTH = 32

export type CatalystVotingPublicKey = FixlenHexString<typeof CATALYST_VOTING_PUBLIC_KEY_LENGTH>

export type ParsedTxAuxiliaryData = {
    type: TxAuxiliaryDataType.ARBITRARY_HASH
    hashHex: FixlenHexString<typeof AUXILIARY_DATA_HASH_LENGTH>
} | {
    type: TxAuxiliaryDataType.CATALYST_REGISTRATION
    params: ParsedCatalystRegistrationParams
}

export type ParsedCatalystRegistrationParams = {
    type: TxAuxiliaryDataType.CATALYST_REGISTRATION,
    votingPublicKey: CatalystVotingPublicKey
    stakingPath: ValidBIP32Path
    rewardsDestination: ShelleyAddressParams
    nonce: Uint64_str
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
}

export type ParsedSigningRequest = {
    tx: ParsedTransaction
    signingMode: TransactionSigningMode
}


export type ParsedInput = {
    txHashHex: FixlenHexString<typeof TX_HASH_LENGTH>
    outputIndex: Uint32_t
    path: ValidBIP32Path | null
}


export type ParsedWithdrawal = {
    amount: Uint64_str
    path: ValidBIP32Path
}


export type ParsedMargin = {
    numerator: Uint64_str,
    denominator: Uint64_str
}


export type ParsedPoolParams = {
    poolKey: ParsedPoolKey,
    vrfHashHex: FixlenHexString<typeof VRF_KEY_HASH_LENGTH>,
    pledge: Uint64_str,
    cost: Uint64_str,
    margin: ParsedMargin,
    rewardAccount: ParsedPoolRewardAccount,
    owners: ParsedPoolOwner[],
    relays: ParsedPoolRelay[],
    metadata: ParsedPoolMetadata | null
}


export type ParsedPoolKey = {
    type: PoolKeyType.DEVICE_OWNED,
    path: ValidBIP32Path
} | {
    type: PoolKeyType.THIRD_PARTY
    hashHex: FixlenHexString<typeof KEY_HASH_LENGTH>
}


export type ParsedPoolOwner = {
    type: PoolOwnerType.DEVICE_OWNED,
    path: ValidBIP32Path
} | {
    type: PoolOwnerType.THIRD_PARTY
    hashHex: FixlenHexString<typeof KEY_HASH_LENGTH>
}


export type ParsedPoolRewardAccount = {
    type: PoolRewardAccountType.DEVICE_OWNED,
    path: ValidBIP32Path
} | {
    type: PoolRewardAccountType.THIRD_PARTY
    rewardAccountHex: FixlenHexString<typeof REWARD_ACCOUNT_HEX_LENGTH>
}


export type ParsedPoolRelay = {
    type: RelayType.SINGLE_HOST_IP_ADDR,
    port: Uint16_t | null,
    ipv4: Buffer | null,
    ipv6: Buffer | null,
} | {
    type: RelayType.SINGLE_HOST_HOSTNAME,
    port: Uint16_t | null,
    dnsName: VarlenAsciiString,
} | {
    type: RelayType.MULTI_HOST,
    dnsName: VarlenAsciiString
}


export type ParsedPoolMetadata = {
    url: VarlenAsciiString,
    hashHex: FixlenHexString<32>,
} & { __brand: 'pool_metadata' }


export const enum StakingChoiceType {
    NO_STAKING = 'no_staking',
    STAKING_KEY_PATH = 'staking_key_path',
    STAKING_KEY_HASH = 'staking_key_hash',
    BLOCKCHAIN_POINTER = 'blockchain_pointer',
}

type ParsedBlockchainPointer = {
    blockIndex: Uint32_t,
    txIndex: Uint32_t,
    certificateIndex: Uint32_t,
}

type StakingChoiceNone = {
    type: StakingChoiceType.NO_STAKING
}
type StakingChoicePath = {
    type: StakingChoiceType.STAKING_KEY_PATH,
    path: ValidBIP32Path
}
type StakingChoiceHash = {
    type: StakingChoiceType.STAKING_KEY_HASH,
    hashHex: FixlenHexString<typeof KEY_HASH_LENGTH>
}
type StakingChoicePointer = {
    type: StakingChoiceType.BLOCKCHAIN_POINTER,
    pointer: ParsedBlockchainPointer
}


export type StakingChoice = StakingChoiceNone | StakingChoicePath | StakingChoiceHash | StakingChoicePointer

export type ByronAddressParams = {
    type: AddressType.BYRON,
    protocolMagic: Uint32_t
    spendingPath: ValidBIP32Path,
    stakingChoice: StakingChoiceNone,
}

export type ShelleyAddressParams = {
    type: AddressType.BASE | AddressType.ENTERPRISE | AddressType.POINTER | AddressType.REWARD,
    networkId: Uint8_t,
    spendingPath: ValidBIP32Path
} & ( // Extra properties
        {
            type: AddressType.BASE,
            stakingChoice: StakingChoicePath | StakingChoiceHash
        } | {
            type: AddressType.ENTERPRISE,
            stakingChoice: StakingChoiceNone
        } | {
            type: AddressType.POINTER,
            stakingChoice: StakingChoicePointer
        } | {
            type: AddressType.REWARD
            stakingChoice: StakingChoiceNone // included in spending path
        }
    )

export type ParsedAddressParams = ByronAddressParams | ShelleyAddressParams

export type OutputDestination = {
    type: TxOutputDestinationType.THIRD_PARTY
    addressHex: HexString
} | {
    type: TxOutputDestinationType.DEVICE_OWNED
    addressParams: ParsedAddressParams
}

export type ParsedOutput = {
    amount: Uint64_str
    tokenBundle: ParsedAssetGroup[]
    destination: OutputDestination
}

export const ASSET_NAME_LENGTH_MAX = 32

export type ParsedOperationalCertificate = {
    kesPublicKeyHex: FixlenHexString<typeof KES_PUBLIC_KEY_LENGTH>,
    kesPeriod: Uint64_str,
    issueCounter: Uint64_str,
    coldKeyPath: ValidBIP32Path,
}

export const NATIVE_SCRIPT_HASH_LENGTH = 28

export type ParsedSimpleNativeScript = {
    type: NativeScriptType.PUBKEY_DEVICE_OWNED,
    params: {
        path: ValidBIP32Path,
    },
} | {
    type: NativeScriptType.PUBKEY_THIRD_PARTY,
    params: {
        keyHashHex: FixlenHexString<typeof KEY_HASH_LENGTH>,
    },
} | {
    type: NativeScriptType.INVALID_BEFORE,
    params: {
        slot: Uint64_str,
    },
} | {
    type: NativeScriptType.INVALID_HEREAFTER,
    params: {
        slot: Uint64_str,
    },
}

export type ParsedComplexNativeScript = {
    type: NativeScriptType.ALL | NativeScriptType.ANY,
    params: {
        scripts: ParsedNativeScript[],
    },
} | {
    type: NativeScriptType.N_OF_K,
    params: {
        requiredCount: Uint32_t,
        scripts: ParsedNativeScript[],
    },
}

export type ParsedNativeScript = ParsedSimpleNativeScript | ParsedComplexNativeScript

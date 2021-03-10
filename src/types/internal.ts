import { AddressType, CertificateType, RelayType } from './public'

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
export { AddressType, CertificateType, RelayType }
export { Version, DeviceCompatibility } from './public'
// Our types
export const KEY_HASH_LENGTH = 28;
export const TX_HASH_LENGTH = 32;

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
}

export const TOKEN_POLICY_LENGTH = 28;


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

export type ParsedTransaction = {
    network: ParsedNetwork
    inputs: ParsedInput[]
    outputs: ParsedOutput[]
    fee: Uint64_str
    ttl: Uint64_str | null
    certificates: ParsedCertificate[]
    withdrawals: ParsedWithdrawal[]
    metadataHashHex: FixlenHexString<32> | null
    validityIntervalStart: Uint64_str | null
    isSigningPoolRegistrationAsOwner: boolean
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
    keyHashHex: FixlenHexString<28>,
    vrfHashHex: FixlenHexString<32>,
    pledge: Uint64_str,
    cost: Uint64_str,
    margin: ParsedMargin,
    rewardAccountHex: FixlenHexString<29>
    owners: ParsedPoolOwner[],
    relays: ParsedPoolRelay[],
    metadata: ParsedPoolMetadata | null
}


export const enum PoolOwnerType {
    PATH = 1,
    KEY_HASH = 2,
}

export type ParsedPoolOwner = {
    type: PoolOwnerType.PATH,
    path: ValidBIP32Path
} | {
    type: PoolOwnerType.KEY_HASH
    hashHex: FixlenHexString<typeof KEY_HASH_LENGTH>
}

export type ParsedPoolRelay = {
    type: RelayType.SingleHostAddr,
    port: Uint16_t | null,
    ipv4: Buffer | null,
    ipv6: Buffer | null,
} | {
    type: RelayType.SingleHostName,
    port: Uint16_t | null,
    dnsName: VarlenAsciiString,
} | {
    type: RelayType.MultiHostName,
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

type ByronAddressParams = {
    type: AddressType.BYRON,
    protocolMagic: Uint32_t
    spendingPath: ValidBIP32Path,
    stakingChoice: StakingChoiceNone,
}

type ShelleyAddressParams = {
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

export const enum TxOutputType {
    SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES = 1,
    SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS = 2,
}

export type OutputDestination = {
    type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES
    addressHex: HexString
} | {
    type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS
    addressParams: ParsedAddressParams
}

export type ParsedOutput = {
    amount: Uint64_str
    tokenBundle: ParsedAssetGroup[]
    destination: OutputDestination
}

export const ASSET_NAME_LENGTH_MAX = 32;

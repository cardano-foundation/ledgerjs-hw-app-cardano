// Blockchain-defined constants
export enum AddressType {
    BASE = 0b0000,
    POINTER = 0b0100,
    ENTERPRISE = 0b0110,
    BYRON = 0b1000,
    REWARD = 0b1110,
}

export enum CertificateType {
    STAKE_REGISTRATION = 0,
    STAKE_DEREGISTRATION = 1,
    STAKE_DELEGATION = 2,
    STAKE_POOL_REGISTRATION = 3,
}

export const enum RelayType {
    SingleHostAddr = 0,
    SingleHostName = 1,
    MultiHostName = 2,
}

// Our types
export type BIP32Path = Array<number>;

export type Network = {
    protocolMagic: number
    networkId: number
}

export type AddressParams = {
    addressTypeNibble: number,
    spendingPath: BIP32Path,
    stakingPath?: BIP32Path | null,
    stakingKeyHashHex?: string | null,
    stakingBlockchainPointer?: StakingBlockchainPointer | null
}

export type InputTypeUTxO = {
    txHashHex: string,
    outputIndex: number,
    path?: BIP32Path,
};

export type Token = {
    assetNameHex: string,
    amount: bigint_like,
};

export type AssetGroup = {
    policyIdHex: string,
    tokens: Array<Token>,
};

export type TxOutputTypeAddress = {
    amount: bigint_like,
    tokenBundle?: Array<AssetGroup> | null,
    addressHex: string,
};

export type TxOutputTypeAddressParams = {
    amount: bigint_like,
    tokenBundle?: Array<AssetGroup> | null,
    addressTypeNibble: AddressType,
    spendingPath: BIP32Path,
    stakingPath?: BIP32Path | null,
    stakingKeyHashHex?: string | null,
    stakingBlockchainPointer?: StakingBlockchainPointer | null,
};

export type TxOutput = TxOutputTypeAddress | TxOutputTypeAddressParams;

export type StakingBlockchainPointer = {
    blockIndex: number,
    txIndex: number,
    certificateIndex: number,
};

export type PoolOwnerParams = {
    stakingPath?: BIP32Path,
    stakingKeyHashHex?: string,
};

export type SingleHostIPRelay = {
    portNumber?: number | null,
    ipv4?: string | null, // e.g. "192.168.0.1"
    ipv6?: string | null, // e.g. "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
};

export type SingleHostNameRelay = {
    portNumber?: number | null,
    dnsName: string,
};

export type MultiHostNameRelay = {
    dnsName: string,
};

export type RelayParams = {
    type: number, // single host ip = 0, single hostname = 1, multi host name = 2
    params: SingleHostIPRelay | SingleHostNameRelay | MultiHostNameRelay,
};

export type PoolMetadataParams = {
    metadataUrl: string,
    metadataHashHex: string,
};

export type Margin = {
    numerator: bigint_like,
    denominator: bigint_like,
};

export type PoolParams = {
    poolKeyHashHex: string,
    vrfKeyHashHex: string,
    pledge: bigint_like,
    cost: bigint_like,
    margin: Margin,
    rewardAccountHex: string,
    poolOwners: Array<PoolOwnerParams>,
    relays: Array<RelayParams>,
    metadata: PoolMetadataParams,
};

export type Certificate = {
    type: number,
    path?: BIP32Path | null,
    poolKeyHashHex?: string | null,
    poolRegistrationParams?: PoolParams | null,
};

export type Withdrawal = {
    path: BIP32Path,
    amount: bigint_like,
};

export type Flags = {
    isDebug: boolean,
};

export type GetVersionResponse = {
    major: number,
    minor: number,
    patch: number,
    flags: Flags,
};

export type GetSerialResponse = {
    serial: string,
};

export type DeriveAddressResponse = {
    addressHex: string,
};

export type GetExtendedPublicKeyResponse = {
    publicKeyHex: string,
    chainCodeHex: string,
};

export type Witness = {
    path: BIP32Path,
    // Note: this is *only* a signature
    // you need to add proper extended public key
    // to form a full witness
    witnessSignatureHex: string,
};

export type SignTransactionResponse = {
    txHashHex: string,
    witnesses: Array<Witness>,
};

export type bigint_like = number | bigint | string

export type Transaction = {
    network: Network,
    inputs: Array<InputTypeUTxO>,
    outputs: Array<TxOutputTypeAddress | TxOutputTypeAddressParams>,
    fee: bigint_like,
    ttl: bigint_like | null,
    certificates: Array<Certificate>,
    withdrawals: Array<Withdrawal>,
    metadataHashHex?: string | null,
    validityIntervalStart?: string | null
}
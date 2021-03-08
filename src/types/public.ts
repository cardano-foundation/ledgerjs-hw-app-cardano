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
    networkIdOrProtocolMagic: number,
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
    amountStr: string,
};

export type AssetGroup = {
    policyIdHex: string,
    tokens: Array<Token>,
};

export type TxOutputTypeAddress = {
    amountStr: string,
    tokenBundle?: Array<AssetGroup> | null,
    addressHex: string,
};

export type TxOutputTypeAddressParams = {
    amountStr: string,
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
    portNumber?: number,
    ipv4?: string, // e.g. "192.168.0.1"
    ipv6?: string, // e.g. "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
};

export type SingleHostNameRelay = {
    portNumber?: number,
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
    numeratorStr: string,
    denominatorStr: string,
};

export type PoolParams = {
    poolKeyHashHex: string,
    vrfKeyHashHex: string,
    pledgeStr: string,
    costStr: string,
    margin: Margin,
    rewardAccountHex: string,
    poolOwners: Array<PoolOwnerParams>,
    relays: Array<RelayParams>,
    metadata: PoolMetadataParams,
};

export type Certificate = {
    type: number,
    path: BIP32Path,
    poolKeyHashHex?: string,
    poolRegistrationParams?: PoolParams,
};

export type Withdrawal = {
    path: BIP32Path,
    amountStr: string,
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

export type Transaction = {
    network: Network,
    inputs: Array<InputTypeUTxO>,
    outputs: Array<TxOutputTypeAddress | TxOutputTypeAddressParams>,
    feeStr: string,
    ttlStr: string | null,
    certificates: Array<Certificate>,
    withdrawals: Array<Withdrawal>,
    metadataHashHex?: string | null,
    validityIntervalStartStr?: string | null
}
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

export type DeviceOwnedAddress = {
    type: AddressType.BYRON
    params: AddressParamsByron
} | {
    type: AddressType.BASE
    params: AddressParamsBase
} | {
    type: AddressType.ENTERPRISE
    params: AddressParamsEnterprise
} | {
    type: AddressType.POINTER
    params: AddressParamsPointer
} | {
    type: AddressType.REWARD
    params: AddressParamsReward
}

export type AddressParamsByron = {
    spendingPath: BIP32Path
}

export type AddressParamsBase = {
    spendingPath: BIP32Path
} & ( // Not really worth the effort of disambiguation through additional tagged enum
        | { stakingPath: BIP32Path }
        | { stakingKeyHashHex: string }
    )

export type AddressParamsEnterprise = {
    spendingPath: BIP32Path
}

export type AddressParamsPointer = {
    spendingPath: BIP32Path
    stakingBlockchainPointer: BlockchainPointer
}

export type AddressParamsReward = {
    spendingPath: BIP32Path
}

export type TxInput = {
    txHashHex: string,
    outputIndex: number,
    // Note: null indicates we don't want to sign this utxo. This is highly non-standard
    // and the only usecase so far is pool registration as owner.
    // We therefore don't mark it as optional so that people won't forget specifying it
    path: BIP32Path | null,
};

export type Token = {
    assetNameHex: string,
    amount: bigint_like,
};

export type AssetGroup = {
    policyIdHex: string,
    tokens: Array<Token>,
};

export type TxOutput = {
    amount: bigint_like
    tokenBundle?: Array<AssetGroup> | null
    destination: TxOutputDestination
}

export enum TxOutputDestinationType {
    ThirdParty = 'third_party',
    DeviceOwned = 'device_owned',
}

export type ThirdPartyAddressParams = {
    addressHex: string
}

export type TxOutputDestination = {
    type: TxOutputDestinationType.ThirdParty
    params: ThirdPartyAddressParams
} | {
    type: TxOutputDestinationType.DeviceOwned
    params: DeviceOwnedAddress
}

export type BlockchainPointer = {
    blockIndex: number,
    txIndex: number,
    certificateIndex: number,
};

export type PoolOwnerParams = {
    stakingPath?: BIP32Path,
    stakingKeyHashHex?: string,
};

export type SingleHostIPRelayParams = {
    portNumber?: number | null,
    ipv4?: string | null, // e.g. "192.168.0.1"
    ipv6?: string | null, // e.g. "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
};

export type SingleHostNameRelayParams = {
    portNumber?: number | null,
    dnsName: string,
};

export type MultiHostNameRelayParams = {
    dnsName: string,
};

export type Relay = {
    type: RelayType.SingleHostAddr
    params: SingleHostIPRelayParams
} | {
    type: RelayType.SingleHostName
    params: SingleHostNameRelayParams
} | {
    type: RelayType.MultiHostName
    params: MultiHostNameRelayParams
}

export type PoolMetadataParams = {
    metadataUrl: string,
    metadataHashHex: string,
};

export type Margin = {
    numerator: bigint_like,
    denominator: bigint_like,
};

export type PoolRegistrationParams = {
    poolKeyHashHex: string,
    vrfKeyHashHex: string,
    pledge: bigint_like,
    cost: bigint_like,
    margin: Margin,
    rewardAccountHex: string,
    poolOwners: Array<PoolOwnerParams>,
    relays: Array<Relay>,
    metadata: PoolMetadataParams,
};

export type StakeRegistrationParams = {
    path: BIP32Path
}

export type StakeDeregistrationParams = {
    path: BIP32Path
}

export type StakeDelegationParams = {
    path: BIP32Path
    poolKeyHashHex: string
}

export type Certificate = {
    type: CertificateType.STAKE_REGISTRATION
    params: StakeRegistrationParams
} | {
    type: CertificateType.STAKE_DEREGISTRATION
    params: StakeDeregistrationParams
} | {
    type: CertificateType.STAKE_DELEGATION
    params: StakeDelegationParams
} | {
    type: CertificateType.STAKE_POOL_REGISTRATION
    params: PoolRegistrationParams
}

export type Withdrawal = {
    path: BIP32Path,
    amount: bigint_like,
};

export type Flags = {
    isDebug: boolean,
};

export type Version = {
    major: number,
    minor: number,
    patch: number,
    flags: Flags,
};

export type DeviceCompatibility = {
    isCompatible: boolean
    recommendedVersion: string | null
    supportsMary: boolean
}

export type GetSerialResponse = {
    serial: string,
};

export type DerivedAddress = {
    addressHex: string,
};

export type ExtendedPublicKey = {
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

export type SignedTransactionData = {
    txHashHex: string,
    witnesses: Array<Witness>,
};

export type bigint_like = number | bigint | string

export type Transaction = {
    network: Network,
    inputs: Array<TxInput>,
    outputs: Array<TxOutput>,
    fee: bigint_like,
    ttl: bigint_like | null,
    certificates: Array<Certificate>,
    withdrawals: Array<Withdrawal>,
    metadataHashHex?: string | null,
    validityIntervalStart?: bigint_like | null
}
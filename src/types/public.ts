/**
 * @description Type for 64-bit integers.
 * 
 * We accept either
 * - `Number` (if it is less than Number.MAX_SAFE_INTEGER)
 * - `String` (representing 64-bit number)
 * - `BigInt` (if platform supports it natively)
 * @category Basic types
 */
export type bigint_like = number | bigint | string

// Blockchain-defined constants

/**
 *  Address type (as defined by the Cardano spec)
 *  @category Addresses
 *  @see [[DeviceOwnedAddress]]
 */
export enum AddressType {
    BASE = 0b0000,
    POINTER = 0b0100,
    ENTERPRISE = 0b0110,
    BYRON = 0b1000,
    REWARD = 0b1110,
}

/** 
 * Certificate type (as defined by the Cardano spec)
 * @category Shelley
 * @see [[Certificate]]
 */
export enum CertificateType {
    STAKE_REGISTRATION = 0,
    STAKE_DEREGISTRATION = 1,
    STAKE_DELEGATION = 2,
    STAKE_POOL_REGISTRATION = 3,
}

/**
 * Relay type (as defined by the Cardano spec)
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export const enum RelayType {
    SingleHostAddr = 0,
    SingleHostName = 1,
    MultiHostName = 2,
}

/**
 * Hardened derivation
 * 
 * @example
 * ```
 * const accountId = 0 + HARDENED
 * ```
 * 
 * @see [[BIP32Path]]
 */
export const HARDENED = 0x80000000;

// Our types

/**
 * Represents BIP 32 path.
 * 
 * @example
 * ```
 *  const HD = HARDENED
 *  const ByronAccount0 = [44 + HD, 1815 + HD, 0 + HD];
 *  const ShelleyChangeAddress0 = [1852 + HD, 1815 + HD, 0 + HD, 1, 0]; 
 * ```
 * 
 * @see [[HARDENED]]
 * @category Basic types
 */
export type BIP32Path = Array<number>;

/**
 * Cardano network magic constants
 * @category Basic types
 */
export type Network = {
    /** byron protocol id */
    protocolMagic: number
    /** shelley network id */
    networkId: number
}

/**
 * Describes address owned by the Ledger device.
 * Outputs with **these addresses are not shown** to the user during transaction signing
 * @category Addresses
 * @see [[AddressType]]
 */
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

/** 
 * Byron address parameters
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 */
export type AddressParamsByron = {
    spendingPath: BIP32Path
}

/**
 * Shelley *base* address parameters.
 * The API allows for using device staking key, or supplying third-party staking key.
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 */
export type AddressParamsBase = {
    spendingPath: BIP32Path
} & AddressParamsBaseStaking

/**
 * Shelley *base* address parameters staking choice.
 * The API allows for using device staking key, or supplying third-party staking key.
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 */
// Not really worth the effort of disambiguation through additional tagged enum
export type AddressParamsBaseStaking =
    | { stakingPath: BIP32Path }
    | { stakingKeyHashHex: string }


/**
 * Shelley *enterprise* address parameters
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 * */
export type AddressParamsEnterprise = {
    spendingPath: BIP32Path
}

/**
 * Shelley *pointer* address parameters
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 * */
export type AddressParamsPointer = {
    spendingPath: BIP32Path
    stakingBlockchainPointer: BlockchainPointer
}

/** Shelley *reward* address parameters.
 * 
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 */
export type AddressParamsReward = {
    /**
     * Note that we use "spending" path instead of "staking" path even though this represents "staking" address.
     */
    spendingPath: BIP32Path
}

/**
 * Describes single transaction input (i.e. UTxO)
 * @category Basic types
 * @see [[Transaction]]
 */
export type TxInput = {
    /** UTxO hash */
    txHashHex: string,
    /** UTxO output number */
    outputIndex: number,
    /**
     * Describes path used for witnessing this UTxO. The API will sign transaction with this path.
     * 
     * Note: null indicates we don't want to sign this utxo. This is highly non-standard
     * and the only usecase so far is pool registration as owner.
     * We therefore don't mark it as optional so that people won't forget specifying it
     * 
     * Note: Device has no ability to really check whether `path` is correct witnessing path for this UTxO.
     */
    path: BIP32Path | null,
};

/**
 * Describes single token to be transferred with the output
 * @category Mary
 * @see [[AssetGroup]]
 */
export type Token = {
    assetNameHex: string,
    /** Note: device does not know the number of decimal places the token uses */
    amount: bigint_like,
};

/**
 * Describes asset group transferred with the output
 * @category Mary
 * @see [[TxOutput]]
 */
export type AssetGroup = {
    policyIdHex: string,
    tokens: Array<Token>,
};

/**
 * Transaction output
 * @category Basic types
 * @see [[Transaction]]
 */
export type TxOutput = {
    /** amount in Lovelace */
    amount: bigint_like
    /** additional assets sent to the output */
    tokenBundle?: Array<AssetGroup> | null
    /** destination of the output */
    destination: TxOutputDestination
}

/**
 * Specified type of output destination
 * @category Basic types
 * @see [[TxOutputDestination]]
 */
export enum TxOutputDestinationType {
    /** For addresses not owned by the device */
    ThirdParty = 'third_party',
    /** For address owned by the device. Device will not show the address (unles it seems fishy) */
    DeviceOwned = 'device_owned',
}

/**
 * Address now owned by the device. Device will show it during transaction review
 * @category Addresses
 * @see [[TxOutputDestination]]
 */
export type ThirdPartyAddressParams = {
    /** Byron or Shelley address in raw hex format (without bech32/base58 encoding) */
    addressHex: string
}

/**
 * Represents output address.
 * @category Addresses
 * @see [[TxOutputDestinationType]]
 * @see [[Transaction]]
 */
export type TxOutputDestination = {
    type: TxOutputDestinationType.ThirdParty
    params: ThirdPartyAddressParams
} | {
    type: TxOutputDestinationType.DeviceOwned
    params: DeviceOwnedAddress
}

/**
 * Blochain pointer for Pointer addresses
 * @category Addresses
 * @see [[AddressParamsPointer]]
 */
export type BlockchainPointer = {
    blockIndex: number,
    txIndex: number,
    certificateIndex: number,
};

/**
 * Represents pool owner.
 * Note that for now this is not in tagged-enum format and the two options are mutually exclusive.
 * @category Pool registration certificate
 * @see [[PoolRegistrationParams]]
 */
export type PoolOwnerParams = {
    /** Pool owner is Ledger device. Supply staking key path which should sign the certificate */
    stakingPath?: BIP32Path,
    /** Pool owner is external party */
    stakingKeyHashHex?: string,
};

/**
 * Represents pool relay.
 * Note that at least one of `ipv4` and `ipv6` must be supplied
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type SingleHostIPRelayParams = {
    /** TCP port of the relay. Should be 0..65535 */
    portNumber?: number | null,
    /**
     * IPv4 address of the relay. Should be in string format, e.g. `"192.168.0.1"`
     * */
    ipv4?: string | null,
    /**
     * IPv6 address of the relay. Should be in *fully expanded* string format, e.g. 
     * `"2001:0db8:85a3:0000:0000:8a2e:0370:7334"`
     * */
    ipv6?: string | null,
};

/**
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type SingleHostNameRelayParams = {
    portNumber?: number | null,
    dnsName: string,
};

/**
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type MultiHostNameRelayParams = {
    dnsName: string,
};

/**
 * @category Pool registration certificate
 * @see [[RelayType]]
 * @see [[PoolRegistrationParams]]
 */
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

/**
 * Pool registratin metadata
 * 
 * @category Pool registration certificate
 * @see [[PoolRegistrationParams]]
 */
export type PoolMetadataParams = {
    metadataUrl: string,
    metadataHashHex: string,
};

/**
 * Pool margin represented as fraction (numerator/denominator)
 * 
 * @category Pool registration certificate
 * @see [[PoolRegistrationParams]]
 */
export type Margin = {
    numerator: bigint_like,
    /** Limited to maximum value of TODO */
    denominator: bigint_like,
};

/**
 * Pool registration certificate
 * 
 * @category Pool registration certificate
 * @see [[Certificate]]
 */
export type PoolRegistrationParams = {
    /** Pool cold key */
    poolKeyHashHex: string,
    /** Pool vrf key */
    vrfKeyHashHex: string,
    /** Owner pledge */
    pledge: bigint_like,
    cost: bigint_like,
    margin: Margin,
    /** Pool rewards account */
    rewardAccountHex: string,
    poolOwners: Array<PoolOwnerParams>,
    relays: Array<Relay>,
    metadata: PoolMetadataParams,
};

/**
 * Stake key registration certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 */
export type StakeRegistrationParams = {
    /** Path to staking key being registered */
    path: BIP32Path
}

/**
 * Stake key deregistration certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 */
export type StakeDeregistrationParams = {
    /** Path to the staking key being deregistered */
    path: BIP32Path
}

/**
 * Stake delegation certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 * */
export type StakeDelegationParams = {
    /** Path to the staking key that wants to delegate */
    path: BIP32Path
    /** Pool ID we want to delegate to */
    poolKeyHashHex: string
}

/**
 * Certificate. Can be one of multiple options.
 * @category Shelley
 * @see [[CertificateType]]
 * @see [[Transaction]]
 */
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

/**
 * Rewards account withdwaral operation
 * @category Shelley
 * @see [[Transaction]]
 */
export type Withdrawal = {
    /** Path to rewards account being withdrawn */
    path: BIP32Path,
    /** Amount (in Lovelace) being withdrawn. FIXME(is this true?): Must be all of accumulated rewards */
    amount: bigint_like,
};

/**
 * Device app flags
 * @category Basic types
 * @see [[Version]]
 * */
export type Flags = {
    isDebug: boolean,
};

/** 
 * Device app version
 * @category Basic types
 * @see [[Ada.getVersion]]
 * @see [[DeviceCompatibility]]
 * */
export type Version = {
    major: number,
    minor: number,
    patch: number,
    flags: Flags,
};

/**
 * Describes compatibility of device with current SDK
 * @category Basic types
 * @see [[Ada.getVersion]]
 * */
export type DeviceCompatibility = {
    /** Overall compatibility.
     * - true if SDK somewhat supports device
     * - false if SDK refuses to communicate with current device version
     */
    isCompatible: boolean
    /**
     * In case there are some compatibility problem, SDK recommended version.
     * Clients of SDK should check whether this is null and if not, urge users to upgrade.
     */
    recommendedVersion: string | null
    /**
     * Whether we support Mary features
     */
    supportsMary: boolean
}

/**
 * Response to [[Ada.getSerial]] call
 * @category Basic types
 */
export type Serial = {
    /** Serial number of the device. TODO: is this ascii? hex? */
    serial: string,
};

/**
 * Response to [[Ada.deriveAddress]] call
 * @category Basic types
 * @see [[DeriveAddressRequest]]
 */
export type DerivedAddress = {
    addressHex: string,
};


/**
 * Derived extended public key
 * @category Basic types
 * @see [[Ada.getExtendedPublicKey]]
 */
export type ExtendedPublicKey = {
    publicKeyHex: string,
    chainCodeHex: string,
};

/**
 * Transaction witness.
 * @see [[SignedTransactionData]]
 * @category Basic types
 */
export type Witness = {
    /**
     * Witnessed path
     */
    path: BIP32Path,
    /** 
     * Note: this is *only* a signature.
     * You need to add proper extended public key to form a full witness
     */
    witnessSignatureHex: string,
};

/**
 * Result of signing a transaction.
 * @category Basic types
 * @see [[Ada.signTransaction]]
 */
export type SignedTransactionData = {
    /**
     * Hash of signed transaction. Callers should check that they serialize tx the same way
     */
    txHashHex: string,
    /**
     * List of witnesses. Caller should assemble full transaction to be submitted to the network.
     * */
    witnesses: Array<Witness>,
};

/**
 * @description Represents transaction to be signed by the device.
 * @category Basic types
 * @see [[Ada.signTransaction]]
 */
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
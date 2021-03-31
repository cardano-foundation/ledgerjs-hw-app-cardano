/**
 * Type for 64-bit integers.
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
    /**
     * Shelley base address
     * @see [[AddressParamsBase]]
     */
    BASE = 0b0000,
    /**
     * Shelley pointer address
     * @see [[AddressParamsPointer]]
     */
    POINTER = 0b0100,
    /**
     * Shelley enterprise address
     * @see [[AddressParamsEnterprise]]
     */
    ENTERPRISE = 0b0110,
    /**
     * Byron address
     * @see [[AddressParamsByron]]
     */
    BYRON = 0b1000,
    /**
     * Shelley staking rewards address
     * @see [[AddressParamsReward]]
     */
    REWARD = 0b1110,
}

/** 
 * Certificate type (as defined by the Cardano spec)
 * @category Shelley
 * @see [[Certificate]]
 */
export enum CertificateType {
    /**
     * Staking key registration certificate.
     * @see [[StakeRegistrationParams]]
     */
    STAKE_REGISTRATION = 0,
    /**
     * Staking key deregistration certificate
     * @see [[StakeDeregistrationParams]]
     */
    STAKE_DEREGISTRATION = 1,
    /**
     * Stake delegation certificate
     * @see [[StakeDelegationParams]]
     */
    STAKE_DELEGATION = 2,
    /**
     * Stake pool registration certificate
     * @see [[PoolRegistrationParams]]
     */
    STAKE_POOL_REGISTRATION = 3,
}

/**
 * Relay type (as defined by the Cardano spec)
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export const enum RelayType {
    /**
     * Relay is a single host specified with IPv4 or IPv6
     * @see [[SingleHostIpAddrRelayParams]]
     */
    SINGLE_HOST_IP_ADDR = 0,
    /**
     * Relay is a single host specified as dns name
     * @see [[SingleHostHostnameRelayParams]]
     */
    SINGLE_HOST_HOSTNAME = 1,
    /**
     * Relay is multiple hosts reachable under dns name
     * @see [[MultiHostRelayParams]]
     */
    MULTI_HOST = 2,
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
    /**
     * UTxO's hash of the transaction
     */
    txHashHex: string,
    /**
     * UTxO's transaction output index
     */
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
    /**
     * Output amount.
     * Specified in Lovelace
     */
    amount: bigint_like
    /**
     * Additional assets sent to the output
     */
    tokenBundle?: Array<AssetGroup> | null
    /**
     * Destination address of the output
     */
    destination: TxOutputDestination
}

/**
 * Specified type of output destination
 * @category Basic types
 * @see [[TxOutputDestination]]
 */
export enum TxOutputDestinationType {
    /**
     * Destination is an address not owned by the device.
     * Device will show this address in the review screen.
     * @see [[ThirdPartyAddressParams]]
     */
    THIRD_PARTY = 'third_party',
    /**
     * Destination is an address owned by the device.
     * Device will not show the address (unles it seems fishy)
     * @see [[DeviceOwnedAddress]]
     */
    DEVICE_OWNED = 'device_owned',
}

/**
 * Address now owned by the device. Device will show it during transaction review
 * @category Addresses
 * @see [[TxOutputDestination]]
 */
export type ThirdPartyAddressParams = {
    /**
     * Byron or Shelley address in raw hex format (without bech32/base58 encoding)
     */
    addressHex: string
}

/**
 * Represents output address.
 * @category Addresses
 * @see [[TxOutputDestinationType]]
 * @see [[Transaction]]
 */
export type TxOutputDestination = {
    type: TxOutputDestinationType.THIRD_PARTY
    params: ThirdPartyAddressParams
} | {
    type: TxOutputDestinationType.DEVICE_OWNED
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
 * Type of an owner in pool registration certificate.
 * Ledger device needs to distinguish between owners which are third party
 * and this device if one needs to sign pool registration certificate as an owner.
 * @see [[PoolOwner]]
 * @category Pool registration certificate
 */
export enum PoolOwnerType {
    /**
     * Pool owner is third party
     * @see [[PoolOwnerThirdPartyParams]]
     */
    THIRD_PARTY = 'third_party',
    /**
     * Pool owner is this device
     * @see [[PoolOwnerDeviceOwnedParams]]
     */
    DEVICE_OWNED = 'device_owned',
}
/**
 * Represents pool owner.
 * @category Pool registration certificate
 * @see [[PoolRegistrationParams]]
 */
export type PoolOwner = {
    type: PoolOwnerType.THIRD_PARTY
    params: PoolOwnerThirdPartyParams
} | {
    type: PoolOwnerType.DEVICE_OWNED
    params: PoolOwnerDeviceOwnedParams
}

/**
 * Pool owner is external party
 * @category Pool registration certificate
 * @see [[PoolOwner]]
 * @see [[PoolOwnerType]]
 */
export type PoolOwnerThirdPartyParams = {
    stakingKeyHashHex: string,
}

/**
 * Pool owner is Ledger device. Supply staking key path which should sign the certificate
 * @category Pool registration certificate
 * @see [[PoolOwner]]
 * @see [[PoolOwnerType]]
 */
export type PoolOwnerDeviceOwnedParams = {
    stakingPath: BIP32Path,
};

/**
 * Represents pool relay.
 * Note that at least one of `ipv4` and `ipv6` must be supplied
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type SingleHostIpAddrRelayParams = {
    /**
     * TCP port of the relay.
     * Should be 0..65535
     */
    portNumber?: number | null,
    /**
     * IPv4 address of the relay.
     * Should be in string format, e.g. `"192.168.0.1"`
     * */
    ipv4?: string | null,
    /**
     * IPv6 address of the relay.
     * Should be in *fully expanded* string format, e.g. `"2001:0db8:85a3:0000:0000:8a2e:0370:7334"`
     * */
    ipv6?: string | null,
};

/**
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type SingleHostHostnameRelayParams = {
    portNumber?: number | null,
    dnsName: string,
};

/**
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type MultiHostRelayParams = {
    dnsName: string,
};

/**
 * @category Pool registration certificate
 * @see [[RelayType]]
 * @see [[PoolRegistrationParams]]
 */
export type Relay = {
    type: RelayType.SINGLE_HOST_IP_ADDR
    params: SingleHostIpAddrRelayParams
} | {
    type: RelayType.SINGLE_HOST_HOSTNAME
    params: SingleHostHostnameRelayParams
} | {
    type: RelayType.MULTI_HOST
    params: MultiHostRelayParams
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
    /**
     * Numerator
     * Must be <= denominator
     */
    numerator: bigint_like,
    /**
     * Denominator.
     * Limited to maximum value of 1e18
     */
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
    poolOwners: Array<PoolOwner>,
    relays: Array<Relay>,
    metadata?: PoolMetadataParams | null,
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
    /**
     * Path to the staking key being deregistered
     */
    path: BIP32Path
}

/**
 * Stake delegation certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 * */
export type StakeDelegationParams = {
    /**
     * Path to the staking key / reward account that wants to delegate
     */
    path: BIP32Path
    /**
     * Pool ID user wants to delegate to
     */
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
    /**
     * Path to rewards account being withdrawn
     */
    path: BIP32Path,
    /**
     * Amount (in Lovelace) being withdrawn.
     * Note that Amount *must* be all accumulated rewards.
     */
    amount: bigint_like,
};

/**
 * Device app flags
 * @category Basic types
 * @see [[Version]]
 */
export type Flags = {
    isDebug: boolean,
};

/** 
 * Device app version
 * @category Basic types
 * @see [[Ada.getVersion]]
 * @see [[DeviceCompatibility]]
 */
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
 */
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
    /**
     * Serial is a Ledger device identifier.
     * It is 7 bytes long, which is represented here as 14-character hex string
     */
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
     */
    witnesses: Array<Witness>,
};

/**
 * Kind of transaction auxiliary data supplied to Ledger
 * @category Basic types
 * @see [[TxAuxiliaryData]]
 */
export enum TxAuxiliaryDataType {
    /** Auxiliary data is supplied as raw hash value */
    ARBITRARY_HASH = 'arbitrary_hash',

    // CatalystVoting = 'catalyst_voting'
}

/**
 * Specifies transaction auxiliary data.
 * Auxiliary data can be supplied to Ledger possibly in multiple forms.
 * @category Basic types
 * @see [[TxAuxiliaryDataType]]
 */
export type TxAuxiliaryData =
    {
        type: TxAuxiliaryDataType.ARBITRARY_HASH
        params: TxAuxiliaryDataArbitraryHashParams
    }

/**
 * Auxiliary data is supplied as raw hash. Ledger will just display this hash to the user
 * @see [[TxAuxiliaryData]]
 */
export type TxAuxiliaryDataArbitraryHashParams = {
    /** Hash of the transaction metadata */
    hashHex: string
}

/**
 * Represents transaction to be signed by the device.
 * Note that this represents a *superset* of what Ledger can sign due to certain hardware app/security limitations.
 * @see [[TransactionSigningMode]] for a details on further restrictions
 * @category Basic types
 * @see [[Ada.signTransaction]]
 */
export type Transaction = {
    /**
     * Cardano network the transaction is supposed to be submitted to.
     */
    network: Network,
    /**
     * Transaction inputs (UTxOs)
     */
    inputs: Array<TxInput>,
    /**
     * Transaction outputs
     */
    outputs: Array<TxOutput>,
    /**
     * Transaction fee (in Lovelace).
     * Note that transaction is valid only if inputs + fee == outputs.
     */
    fee: bigint_like,
    /**
     * "Time-to-live" (block height).
     * Transaction will become invalid at this block height.
     */
    ttl?: bigint_like | null,
    /**
     * Transaction certificates (if any).
     */
    certificates?: Array<Certificate> | null,
    /**
     * Withdrawals (if any) from rewards accounts
     */
    withdrawals?: Array<Withdrawal> | null,
    /**
     * Transaction auxiliary data (if any)
     */
    auxiliaryData?: TxAuxiliaryData | null,
    /**
     * Validity start (block height) if any.
     * Transaction becomes valid only starting from this block height.
     */
    validityIntervalStart?: bigint_like | null
}

/**
 * Mode in which we want to sign the transaction.
 * Ledger hardware app has certain limitations and it cannot sign arbitrary combination of all transaction features.
 * The mode specifies which use-case the user wants to use and triggers additional validation on `tx` field.
 * @see [[Transaction]]
 * @see [[SigningRequest]]
 * @category Basic types
 */
export enum TransactionSigningMode {
    /**
     * Represents an ordinary user transaction transferring funds.
     * 
     * The transaction
     * - *should* have valid `path` property on all `inputs`
     * - *must not* contain a pool registration certificate
     * 
     * The API witnesses
     * - all non-null [[TxInput.path]] on `inputs`
     * - all [[Withdrawal.path]] on `withdrawals`
     * - all `path` properties on `certificates` for Stake registering/deregistering/delegating certificate.
     */
    ORDINARY_TRANSACTION = 'ordinary_transaction',

    /**
     * Represents pool registration from the perspective of pool owner.
     * 
     * The transaction
     * - *must* have `path=null` on all `inputs` (i.e., we are not witnessing any UTxO)
     * - *must* have single Pool registration certificate
     * - *must* have single owner of type [[PoolOwnerType.DEVICE_OWNED]] on that certificate
     * - *must not* have withdrawals
     * 
     * These restrictions are in place due to a possibility of maliciously signing *another* part of
     * the transaction with the pool owner path as we are not displaying device-owned paths on the device screen.
     * 
     * The API witnesses
     * - the single [[PoolOwnerDeviceOwnedParams.stakingPath]] found in pool registration
     */
    POOL_REGISTRATION_AS_OWNER = 'pool_registration_as_owner',

    /**
     * Reserved for future use
     */
    __RESEVED_POOL_REGISTRATION_AS_OPERATOR = '__pool_registration_as_operator'

}

/**
 * Transaction signing request.
 * This represents the transaction user wants to sign.
 * Due to certain Ledger limitation, we also require user to specify a "mode" in which he/she wants to sign the transaction.
 * @category Basic types
 */
export type SignTransactionRequest = {
    /**
     * Mode in which we want to sign the transaction.
     * Ledger has certain limitations (see [[TransactionSigningMode]] in detail) due to which
     * it cannot sign arbitrary combination of all transaction features.
     * The mode specifies which use-case the user want to use and triggers additional validation on `tx` field. 
     */
    signingMode: TransactionSigningMode
    /**
     * Transaction to be signed
     */
    tx: Transaction
}


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
     * Shelley base addresses
     * @see [[AddressParamsBase]]
     */
    BASE_PAYMENT_KEY_STAKE_KEY          = 0b0000,
    BASE_PAYMENT_SCRIPT_STAKE_KEY       = 0b0001,
    BASE_PAYMENT_KEY_STAKE_SCRIPT       = 0b0010,
    BASE_PAYMENT_SCRIPT_STAKE_SCRIPT    = 0b0011,
    /**
     * Shelley pointer address
     * @see [[AddressParamsPointer]]
     */
    POINTER_KEY                         = 0b0100,
    POINTER_SCRIPT                      = 0b0101,
    /**
     * Shelley enterprise address
     * @see [[AddressParamsEnterprise]]
     */
    ENTERPRISE_KEY                      = 0b0110,
    ENTERPRISE_SCRIPT                   = 0b0111,
    /**
     * Byron address
     * @see [[AddressParamsByron]]
     */
    BYRON                               = 0b1000,
    /**
     * Shelley staking rewards address
     * @see [[AddressParamsReward]]
     */
    REWARD_KEY                          = 0b1110,
    REWARD_SCRIPT                       = 0b1111,
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
    /**
     * Stake pool retirement certificate
     * @see [[PoolRegistrationParams]]
     */
    STAKE_POOL_RETIREMENT = 4,
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
export const HARDENED = 0x80000000

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
    protocolMagic: number;
    /** shelley network id */
    networkId: number;
}

/**
 * Describes address owned by the Ledger device.
 * Outputs with **these addresses are not shown** to the user during transaction signing
 * @category Addresses
 * @see [[AddressType]]
 */
export type DeviceOwnedAddress = {
    type: AddressType.BYRON;
    params: AddressParamsByron;
} | {
    type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY |
    AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY |
    AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT |
    AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT;
    params: AddressParamsBase;
} | {
    type: AddressType.ENTERPRISE_KEY | AddressType.ENTERPRISE_SCRIPT;
    params: AddressParamsEnterprise;
} | {
    type: AddressType.POINTER_KEY | AddressType.POINTER_SCRIPT;
    params: AddressParamsPointer;
} | {
    type: AddressType.REWARD_KEY | AddressType.REWARD_SCRIPT;
    params: AddressParamsReward;
}

/**
 * Byron address parameters
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 */
export type AddressParamsByron = {
    spendingPath: BIP32Path;
}

export type SpendingParams = {
    spendingPath: BIP32Path;
} | {
    spendingScriptHashHex: string;
}

/**
 * Shelley *base* address parameters.
 * The API allows for using device staking key, or supplying third-party staking key.
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 */
export type AddressParamsBase = SpendingParams & ({
    stakingPath: BIP32Path;
} | {
    stakingKeyHashHex: string;
} | {
    stakingScriptHashHex: string;
})

/**
 * Shelley *enterprise* address parameters
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 * */
export type AddressParamsEnterprise = SpendingParams

/**
 * Shelley *pointer* address parameters
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 * */
export type AddressParamsPointer = SpendingParams & {
    stakingBlockchainPointer: BlockchainPointer;
}

/** Shelley *reward* address parameters.
 *
 * @category Addresses
 * @see [[DeviceOwnedAddress]]
 */
export type AddressParamsReward = {
    stakingPath: BIP32Path;
} | {
    stakingScriptHashHex: string;
}

/** Operational certificate
 *
 * @category Basic types
 */
export type OperationalCertificate = {
    kesPublicKeyHex: string;
    kesPeriod: bigint_like;
    issueCounter: bigint_like;
    coldKeyPath: BIP32Path;
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
    txHashHex: string;
    /**
     * UTxO's transaction output index
     */
    outputIndex: number;
    /**
     * Describes path used for witnessing this UTxO. The API will sign transaction with this path.
     *
     * Note: null indicates we don't want to sign this utxo. This is highly non-standard
     * and the only usecase so far is pool registration as owner.
     * We therefore don't mark it as optional so that people won't forget specifying it
     *
     * Note: Device has no ability to really check whether `path` is correct witnessing path for this UTxO.
     */
    path: BIP32Path | null;
};

/**
 * Describes a single token within a multiasset structure.
 * @category Mary
 * @see [[AssetGroup]]
 */
export type Token = {
    assetNameHex: string;
    /** Note: can be signed or unsigned, depending on the context.
     * device does not know the number of decimal places the token uses. */
    amount: bigint_like;
};

/**
 * Describes a group of assets belonging to the same policy in a multiasset structure.
 * The asset names of tokens must be unique and sorted lowest value to highest to reflect a canonical CBOR.
 * The sorting rules (as described in the [CBOR RFC](https://datatracker.ietf.org/doc/html/rfc7049#section-3.9)) are:
 *  * if two keys have different lengths, the shorter one sorts earlier;
 *  * if two keys have the same length, the one with the lower value in lexical order sorts earlier.
 * @category Mary
 * @see [[TxOutput]]
 */
export type AssetGroup = {
    policyIdHex: string;
    tokens: Array<Token>;
};

/**
 * Transaction output
 * @category Basic types
 * @see [[Transaction]]
 */
export type TxOutput = {
    /**
     * Destination address of the output
     */
    destination: TxOutputDestination;
    /**
     * Output amount.
     * Specified in Lovelace
     */
    amount: bigint_like;
    /**
     * Additional assets sent to the output.
     * If not null, the entries' keys (policyIds) must be unique and sorted to reflect a canonical CBOR as described
     * in the [CBOR RFC](https://datatracker.ietf.org/doc/html/rfc7049#section-3.9)),
     * i.e. the key with the lower value in lexical order sorts earlier.
     */
    tokenBundle?: Array<AssetGroup> | null;
    /**
     * Optional datum hash
     */
    datumHashHex?: string | null;
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
    addressHex: string;
}

/**
 * Represents output address.
 * @category Addresses
 * @see [[TxOutputDestinationType]]
 * @see [[Transaction]]
 */
export type TxOutputDestination = {
    type: TxOutputDestinationType.THIRD_PARTY;
    params: ThirdPartyAddressParams;
} | {
    type: TxOutputDestinationType.DEVICE_OWNED;
    params: DeviceOwnedAddress;
}

/**
 * Blockchain pointer for Pointer addresses
 * @category Addresses
 * @see [[AddressParamsPointer]]
 */
export type BlockchainPointer = {
    blockIndex: number;
    txIndex: number;
    certificateIndex: number;
};

/**
 * Type of a pool key in pool registration certificate.
 * Ledger device needs to distinguish between keys which are owned by a third party
 * or by this device if one needs to sign pool registration certificate as an operator.
 * @see [[PoolKey]]
 * @category Pool registration certificate
 */
export enum PoolKeyType {
    /**
     * Pool key is third party
     * @see [[PoolKeyThirdPartyParams]]
     */
    THIRD_PARTY = 'third_party',
    /**
     * Pool key is owned by this device
     * @see [[PoolKeyDeviceOwnedParams]]
     */
    DEVICE_OWNED = 'device_owned',
}
/**
 * Represents pool cold key.
 * @category Pool registration certificate
 * @see [[PoolRegistrationParams]]
 */
export type PoolKey = {
    type: PoolKeyType.THIRD_PARTY;
    params: PoolKeyThirdPartyParams;
} | {
    type: PoolKeyType.DEVICE_OWNED;
    params: PoolKeyDeviceOwnedParams;
}

/**
 * Pool key is owned by an external party
 * @category Pool registration certificate
 * @see [[PoolKey]]
 * @see [[PoolKeyType]]
 */
export type PoolKeyThirdPartyParams = {
    keyHashHex: string;
}

/**
 * Pool key is owned by the Ledger device
 * @category Pool registration certificate
 * @see [[PoolKey]]
 * @see [[PoolKeyType]]
 */
export type PoolKeyDeviceOwnedParams = {
    path: BIP32Path;
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
    type: PoolOwnerType.THIRD_PARTY;
    params: PoolOwnerThirdPartyParams;
} | {
    type: PoolOwnerType.DEVICE_OWNED;
    params: PoolOwnerDeviceOwnedParams;
}

/**
 * Pool owner is an external party
 * @category Pool registration certificate
 * @see [[PoolOwner]]
 * @see [[PoolOwnerType]]
 */
export type PoolOwnerThirdPartyParams = {
    stakingKeyHashHex: string;
}

/**
 * Pool owner is the Ledger device. Supply staking key path which should sign the certificate
 * @category Pool registration certificate
 * @see [[PoolOwner]]
 * @see [[PoolOwnerType]]
 */
export type PoolOwnerDeviceOwnedParams = {
    stakingPath: BIP32Path;
};

/**
 * Type of a reward account in pool registration certificate.
 * Ledger device needs to distinguish between reward accounts which are owned by a third party
 * or by this device if one needs to sign pool registration certificate as an owner.
 * @see [[PoolRewardAccount]]
 * @category Pool registration certificate
 */
export enum PoolRewardAccountType {
    /**
     * Pool reward account is third party
     * @see [[PoolRewardAccountThirdPartyParams]]
     */
    THIRD_PARTY = 'third_party',
    /**
     * Pool reward account is owned by this device
     * @see [[PoolRewardAccountDeviceOwnedParams]]
     */
    DEVICE_OWNED = 'device_owned',
}
/**
 * Represents pool reward account.
 * @category Pool registration certificate
 * @see [[PoolRegistrationParams]]
 */
export type PoolRewardAccount = {
    type: PoolRewardAccountType.THIRD_PARTY;
    params: PoolRewardAccountThirdPartyParams;
} | {
    type: PoolRewardAccountType.DEVICE_OWNED;
    params: PoolRewardAccountDeviceOwnedParams;
}

/**
 * Pool reward account is owned by an external party
 * @category Pool registration certificate
 * @see [[PoolRewardAccount]]
 * @see [[PoolRewardAccountType]]
 */
export type PoolRewardAccountThirdPartyParams = {
    rewardAccountHex: string;
}

/**
 * Pool reward account is owned by the Ledger device. Supply staking key path for reward account
 * @category Pool registration certificate
 * @see [[PoolRewardAccount]]
 * @see [[PoolRewardAccountType]]
 */
export type PoolRewardAccountDeviceOwnedParams = {
    path: BIP32Path;
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
    portNumber?: number | null;
    /**
     * IPv4 address of the relay.
     * Should be in string format, e.g. `"192.168.0.1"`
     * */
    ipv4?: string | null;
    /**
     * IPv6 address of the relay.
     * Should be in *fully expanded* string format, e.g. `"2001:0db8:85a3:0000:0000:8a2e:0370:7334"`
     * */
    ipv6?: string | null;
};

/**
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type SingleHostHostnameRelayParams = {
    portNumber?: number | null;
    dnsName: string;
};

/**
 * @category Pool registration certificate
 * @see [[Relay]]
 */
export type MultiHostRelayParams = {
    dnsName: string;
};

/**
 * @category Pool registration certificate
 * @see [[RelayType]]
 * @see [[PoolRegistrationParams]]
 */
export type Relay = {
    type: RelayType.SINGLE_HOST_IP_ADDR;
    params: SingleHostIpAddrRelayParams;
} | {
    type: RelayType.SINGLE_HOST_HOSTNAME;
    params: SingleHostHostnameRelayParams;
} | {
    type: RelayType.MULTI_HOST;
    params: MultiHostRelayParams;
}

/**
 * Pool registration metadata
 *
 * @category Pool registration certificate
 * @see [[PoolRegistrationParams]]
 */
export type PoolMetadataParams = {
    metadataUrl: string;
    metadataHashHex: string;
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
    numerator: bigint_like;
    /**
     * Denominator.
     * Limited to maximum value of 1e18
     */
    denominator: bigint_like;
};

/**
 * Pool registration certificate
 *
 * @category Pool registration certificate
 * @see [[Certificate]]
 */
export type PoolRegistrationParams = {
    poolKey: PoolKey;
    /** Pool vrf key */
    vrfKeyHashHex: string;
    /** Owner pledge */
    pledge: bigint_like;
    cost: bigint_like;
    margin: Margin;
    rewardAccount: PoolRewardAccount;
    poolOwners: Array<PoolOwner>;
    relays: Array<Relay>;
    metadata?: PoolMetadataParams | null;
};

/**
 * Pool retirement certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 * */
export type PoolRetirementParams = {
    /**
     * Path to the pool key
     */
    poolKeyPath: BIP32Path;
    /**
     * Epoch after which the pool should be retired
     */
    retirementEpoch: bigint_like;
}

export enum StakeCredentialParamsType {
    KEY_PATH,
    KEY_HASH,
    SCRIPT_HASH,
}

export type KeyPathStakeCredentialParams = {
    type: StakeCredentialParamsType.KEY_PATH;
    keyPath: BIP32Path;
}

export type KeyHashStakeCredentialParams = {
    type: StakeCredentialParamsType.KEY_HASH;
    keyHashHex: string;
}

export type ScriptStakeCredentialParams = {
    type: StakeCredentialParamsType.SCRIPT_HASH;
    scriptHashHex: string;
}

export type StakeCredentialParams = KeyPathStakeCredentialParams | KeyHashStakeCredentialParams | ScriptStakeCredentialParams

/**
 * Stake key registration certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 */
export type StakeRegistrationParams = {
    /**
     * Id to be registered
     */
     stakeCredential: StakeCredentialParams;
}

/**
 * Stake key deregistration certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 */
export type StakeDeregistrationParams = {
    /**
     * Id to be deregistered
     */
    stakeCredential: StakeCredentialParams;
}

/**
 * Stake delegation certificate parameters
 * @category Shelley
 * @see [[Certificate]]
 * */
export type StakeDelegationParams = {
    /**
     * Id of the staking entity / reward account that wants to delegate
     */
     stakeCredential: StakeCredentialParams;
     /**
     * Pool ID user wants to delegate to
     */
    poolKeyHashHex: string;
}

/**
 * Certificate. Can be one of multiple options.
 * @category Shelley
 * @see [[CertificateType]]
 * @see [[Transaction]]
 */
export type Certificate = {
    type: CertificateType.STAKE_REGISTRATION;
    params: StakeRegistrationParams;
} | {
    type: CertificateType.STAKE_DEREGISTRATION;
    params: StakeDeregistrationParams;
} | {
    type: CertificateType.STAKE_DELEGATION;
    params: StakeDelegationParams;
} | {
    type: CertificateType.STAKE_POOL_REGISTRATION;
    params: PoolRegistrationParams;
} | {
    type: CertificateType.STAKE_POOL_RETIREMENT;
    params: PoolRetirementParams;
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
    stakeCredential: StakeCredentialParams;
    /**
     * Amount (in Lovelace) being withdrawn.
     * Note that Amount *must* be all accumulated rewards.
     */
    amount: bigint_like;
};

/**
 * Device app flags
 * @category Basic types
 * @see [[Version]]
 */
export type Flags = {
    isDebug: boolean;
};

/**
 * Device app version
 * @category Basic types
 * @see [[Ada.getVersion]]
 * @see [[DeviceCompatibility]]
 */
export type Version = {
    major: number;
    minor: number;
    patch: number;
    flags: Flags;
};

/**
 * Describes compatibility of device with current SDK
 * @category Basic types
 * @see [[Ada.getVersion]]
 */
export type DeviceCompatibility = {
    /** Overall compatibility.
     * - true if SDK supports the device with given firmware version (to the
     *   extent of the features supported by the firmware itself)
     * - false if SDK refuses to communicate with current device version
     */
    isCompatible: boolean;
    /**
     * In case there are some compatibility problem, SDK recommended version.
     * Clients of SDK should check whether this is null and if not, urge users to upgrade.
     */
    recommendedVersion: string | null;
    /**
     * Whether we support Mary features
     */
    supportsMary: boolean;
    /**
     * Whether we support Catalyst registration
     */
    supportsCatalystRegistration: boolean;
    /**
     * Whether we support transactions with zero TTL
     * (useful for dummy transactions to ensure invalidity)
     */
    supportsZeroTtl: boolean;
    /**
     * Whether we support operational certificate signing
     */
    supportsPoolRegistrationAsOperator: boolean;
    /**
     * Whether we support pool retirement certificate
     */
    supportsPoolRetirement: boolean;
    /**
     * Whether we support script hash derivation
     */
    supportsNativeScriptHashDerivation: boolean;
    /**
     * Whether we support multisig transaction
     */
    supportsMultisigTransaction: boolean;
    /**
     * Whether we support mint
     */
    supportsMint: boolean;
    /**
     * Whether we support Alonzo and Plutus
     */
    supportsAlonzo: boolean;
    /**
     * Whether we support required signers in ordinary and multisig transactions
     */
     supportsReqSignersInOrdinaryTx: boolean;
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
    serialHex: string;
};

/**
 * Response to [[Ada.deriveAddress]] call
 * @category Basic types
 * @see [[DeriveAddressRequest]]
 */
export type DerivedAddress = {
    addressHex: string;
};


/**
 * Derived extended public key
 * @category Basic types
 * @see [[Ada.getExtendedPublicKey]]
 */
export type ExtendedPublicKey = {
    publicKeyHex: string;
    chainCodeHex: string;
};

/**
 * Operational certificate signature
 * @category Basic types
 * @see [[Ada.signOperationalCertificate]]
 */
export type OperationalCertificateSignature = {
    signatureHex: string;
}

/**
 * Transaction witness.
 * @see [[SignedTransactionData]]
 * @category Basic types
 */
export type Witness = {
    /**
     * Witnessed path
     */
    path: BIP32Path;
    /**
     * Note: this is *only* a signature.
     * You need to add proper extended public key to form a full witness
     */
    witnessSignatureHex: string;
};

/**
 * Kind of auxiliary data supplementary information
 * @category Basic types
 * @see [[TxAuxiliaryDataSupplement]]
 * @see [[TxAuxiliaryDataType]]
 */
export enum TxAuxiliaryDataSupplementType {
    /** Supplementary information for the caller to assemble the Catalyst voting registration
     * they sent to be signed.
     */
    CATALYST_REGISTRATION = 'catalyst_registration',
}

/**
 * Transaction auxiliary data supplementary information.
 * @category Basic types
 * @see [[TxAuxiliaryDataSupplementType]]
 * @see [[SignedTransactionData]]
 */
export type TxAuxiliaryDataSupplement = {
    type: TxAuxiliaryDataSupplementType.CATALYST_REGISTRATION;
    /** Hash of the auxiliary data including the Catalyst registration */
    auxiliaryDataHashHex: string;
    /** Signature of the Catalyst registration payload by the staking key that was supplied */
    catalystRegistrationSignatureHex: string;
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
    txHashHex: string;
    /**
     * List of witnesses. Caller should assemble full transaction to be submitted to the network.
     */
    witnesses: Array<Witness>;
    /**
     * Additional information about auxiliary data serialized into the transaction, providing
     * the caller with information needed to assemble the transation containing these auxiliary data.
     */
    auxiliaryDataSupplement: TxAuxiliaryDataSupplement | null;
};

/**
 * Kind of transaction auxiliary data supplied to Ledger
 * @category Basic types
 * @see [[TxAuxiliaryData]]
 */
export enum TxAuxiliaryDataType {
    /** Auxiliary data is supplied as raw hash value */
    ARBITRARY_HASH = 'arbitrary_hash',
    /**
     * Auxiliary data representing a Catalyst registration. Ledger serializes the auxiliary data
     * as `[<catalyst registration metadata>, []]` (a.k.a. Mary-era format)
     */
    CATALYST_REGISTRATION = 'catalyst_registration',
}

/**
 * Specifies transaction auxiliary data.
 * Auxiliary data can be supplied to Ledger possibly in multiple forms.
 * @category Basic types
 * @see [[TxAuxiliaryDataType]]
 */
export type TxAuxiliaryData =
    {
        type: TxAuxiliaryDataType.ARBITRARY_HASH;
        params: TxAuxiliaryDataArbitraryHashParams;
    } | {
        type: TxAuxiliaryDataType.CATALYST_REGISTRATION;
        params: CatalystRegistrationParams;
    }

/**
 * Auxiliary data is supplied as raw hash. Ledger will just display this hash to the user
 * @see [[TxAuxiliaryData]]
 */
export type TxAuxiliaryDataArbitraryHashParams = {
    /** Hash of the transaction auxiliary data */
    hashHex: string;
}

/**
 * Parameters needed for Ledger to assemble and sign the Catalyst voting registration metadata.
 * Ledger will display the voting registration parameters and overall metadata hash.
 * @see [[TxAuxiliaryData]]
 */
export type CatalystRegistrationParams = {
    /**
     * Voting key to be registered given in hex
     */
    votingPublicKeyHex: string;

    /**
     * Path to the staking key to which voting rights would be associated
     */
    stakingPath: BIP32Path;

    /**
     * Address for receiving voting rewards, Byron-era addresses not supported
     */
    rewardsDestination: DeviceOwnedAddress;

    /**
     * Nonce value
     */
    nonce: bigint_like;
}

export enum TxRequiredSignerType {
    /** Required Signer is supplied as key path or hash value */
    PATH = 'required_signer_path',
    HASH = 'required_signer_hash',
}

export type RequiredSigner = {
    type: TxRequiredSignerType.PATH;
    path: BIP32Path;
} | {
    type: TxRequiredSignerType.HASH;
    hashHex: string;
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
    network: Network;
    /**
     * Transaction inputs (UTxOs)
     */
    inputs: Array<TxInput>;
    /**
     * Transaction outputs
     */
    outputs: Array<TxOutput>;
    /**
     * Transaction fee (in Lovelace).
     * Note that transaction is valid only if inputs + fee === outputs.
     */
    fee: bigint_like;
    /**
     * "Time-to-live" (block height).
     * Transaction will become invalid at this block height.
     */
    ttl?: bigint_like | null;
    /**
     * Transaction certificates (if any).
     */
    certificates?: Array<Certificate> | null;
    /**
     * Withdrawals (if any) from rewards accounts
     * If not null, the entries' keys (reward addresses derived from the given stake credentials)
     * must be unique and sorted ascending to reflect a canonical CBOR as described
     * in the [CBOR RFC](https://datatracker.ietf.org/doc/html/rfc7049#section-3.9)),
     * i.e. the key with the lower value in lexical order sorts earlier.
     */
    withdrawals?: Array<Withdrawal> | null;
    /**
     * Transaction auxiliary data (if any)
     */
    auxiliaryData?: TxAuxiliaryData | null;
    /**
     * Validity start (block height) if any.
     * Transaction becomes valid only starting from this block height.
     */
    validityIntervalStart?: bigint_like | null;
    /**
     * Mint or burn instructions (if any).
     * Assets to be minted (token amount positive) or burned (token amount negative) with the transaction.
     * If not null, the entries' keys (policyIds) must be unique and sorted to reflect a canonical CBOR as described
     * in the [CBOR RFC](https://datatracker.ietf.org/doc/html/rfc7049#section-3.9)),
     * i.e. the key with the lower value in lexical order sorts earlier.
     */
    mint?: Array<AssetGroup> | null;
    /**
     * Script Data hash (if any)
     */
    scriptDataHashHex?: string | null;
    /**
     * Collaterals (if any)
     */
    collaterals?: Array<TxInput> | null;
    /**
     * Required Signers by key (if any)
     */
    requiredSigners?: Array<RequiredSigner> | null;
    /**
     * True if network id should be included in the transaction body; false or not given otherwise
     */
    includeNetworkId?: boolean;
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
     * - *must* contain key path stake credentials in certificates and withdrawals (no key or script hash)
     * - *must not* contain collateral inputs
     * - *must not* contain required signers
     *
     * - *must* contain only 1852 and 1855 paths
     * - *must* contain 1855 witness requests only when transaction contains token minting/burning
     *
     * The API witnesses
     * - all non-null [[TxInput.path]] on `inputs`
     * - all [[Withdrawal.path]] on `withdrawals`
     * - all [[StakeCredentialParams.path]] properties on `certificates` for Stake registering/deregistering/delegating certificate.
     */
    ORDINARY_TRANSACTION = 'ordinary_transaction',

    /**
     * Represents a transaction controlled by native scripts.
     *
     * Like an ordinary transaction, but stake credentials and all similar elements are given as script hashes
     * and witnesses are decoupled from transaction elements.
     *
     * The transaction
     * - *must* have `path` undefined on all `inputs`
     * - *must* only contain output addresses given as [[TxOutputDestinationType.THIRD_PARTY]]
     * - *must not* contain a pool registration or retirement certificate
     * - *must* contain script hash stake credentials in certificates and withdrawals
     * - *must not* contain collateral inputs
     * - *must not* contain required signers
     *
     * - *must* contain only 1854 and 1855 witness requests
     * - *must* contain 1855 witness requests only when transaction contains token minting/burning
     *
     * The API witnesses
     * - all given in [[SignTransactionRequest.additionalWitnessPaths]]
     */
    MULTISIG_TRANSACTION = 'multisig_transaction',

    /**
     * Represents pool registration from the perspective of a pool owner.
     *
     * The transaction
     * - *must* have `path=null` on all `inputs` (i.e., we are not witnessing any UTxO)
     * - *must not* have device-owned outputs
     * - *must not* have outputs with datum
     * - *must* have a single certificate, and it must be pool registration
     * - *must* have a single owner of type [[PoolOwnerType.DEVICE_OWNED]] on that certificate
     * - *must not* contain withdrawals
     * - *must not* contain token minting
     * - *must not* contain script data hash
     * - *must not* contain collateral inputs
     * - *must not* contain required signers
     * - *must* contain only staking witness requests
     *
     * These restrictions are in place due to a possibility of maliciously signing *another* part of
     * the transaction with the pool owner path as we are not displaying device-owned paths on the device screen.
     *
     * The API witnesses
     * - the single [[PoolOwnerDeviceOwnedParams.stakingPath]] found in pool registration
     */
    POOL_REGISTRATION_AS_OWNER = 'pool_registration_as_owner',

    /**
     * Represents pool registration from the perspective of a pool operator.
     *
     * The transaction
     * - *should* have valid `path` property on all `inputs`
     * - *must not* have outputs with datum
     * - *must* have a single certificate, and it must be pool registration
     * - *must* have a pool key of [[PoolKeyType.DEVICE_OWNED]] on that certificate
     * - *must* have all owners of type [[PoolOwnerType.THIRD_PARTY]] on that certificate
     * - *must not* have withdrawals
     * - *must not* contain token minting
     * - *must not* contain script data hash
     * - *must not* contain collateral inputs
     * - *must not* contain required signers
     *
     * Most of these restrictions are in place since pool owners need to be able to sign
     * the same tx body.
     *
     * The API witnesses
     * - all non-null [[TxInput.path]] on `inputs`
     * - [[PoolKeyDeviceOwnedParams.path]] found in pool registration
     */
    POOL_REGISTRATION_AS_OPERATOR = 'pool_registration_as_operator',

    /**
     * Represents a transaction that includes Plutus script evaluation (e.g. spending from a script address).
     *
     * The transaction
     * - *must not* contain a pool registration certificate
     */
    PLUTUS_TRANSACTION = 'plutus_transaction',
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
    signingMode: TransactionSigningMode;
    /**
     * Transaction to be signed
     */
    tx: Transaction;

    /**
     * Additional witness paths that are not gathered from the transaction body, eg. mint witnesses
     */
    additionalWitnessPaths?: BIP32Path[];
}

/**
 * Native script type (as defined by the Cardano spec)
 * @category Scripts
 * @see [[NativeScript]]
 */
export enum NativeScriptType {
    /**
     * The signature of a key with a specific path is required.
     * @see [[NativeScriptParamsDeviceOwnedPubkey]]
     */
    PUBKEY_DEVICE_OWNED = 'pubkey_device_owned',
     /**
     * The signature of a key with a specific hash is required.
     * @see [[NativeScriptParamsThirdPartyPubkey]]
     */
    PUBKEY_THIRD_PARTY = 'pubkey_third_party',
    /**
     * All scripts specified in the list are required.
     * @see [[NativeScriptParamsAll]]
     */
    ALL = 'all',
    /**
     * At least one script specified in the list is required.
     * @see [[NativeScriptParamsAny]]
     */
    ANY = 'any',
    /**
     * N of K scripts specified in the list are required.
     * @see [[NativeScriptParamsNofK]]
     */
    N_OF_K = 'n_of_k',
    /**
     * The script is invalid before the specified slot.
     * Timelock validity intervals are half-open intervals `[a, b)`.
     * This field specifies the left (included) endpoint `a`.
     * @see [[NativeScriptParamsInvalidBefore]]
     */
    INVALID_BEFORE = 'invalid_before',
    /**
     * The script is invalid after the specified slot.
     * Timelock validity intervals are half-open intervals `[a, b)`.
     * This field specifies the right (excluded) endpoint `b`.
     * @see [[NativeScriptParamsInvalidHereafter]]
     */
    INVALID_HEREAFTER = 'invalid_hereafter',
}

/**
 * Describes a native script, that can be passed to a Ledger device,
 * to generate it's hash.
 * @category Scripts
 * @see [[NativeScriptType]]
 */
export type NativeScript = {
    type: NativeScriptType.PUBKEY_DEVICE_OWNED;
    params: NativeScriptParamsDeviceOwnedPubkey;
} | {
    type: NativeScriptType.PUBKEY_THIRD_PARTY;
    params: NativeScriptParamsThirdPartyPubkey;
} | {
    type: NativeScriptType.ALL;
    params: NativeScriptParamsAll;
} | {
    type: NativeScriptType.ANY;
    params: NativeScriptParamsAny;
} | {
    type: NativeScriptType.N_OF_K;
    params: NativeScriptParamsNofK;
} | {
    type: NativeScriptType.INVALID_BEFORE;
    params: NativeScriptParamsInvalidBefore;
} | {
    type: NativeScriptType.INVALID_HEREAFTER;
    params: NativeScriptParamsInvalidHereafter;
}

/**
 * Native script of type *pubkey* parameters.
 * Pubkey is owned by the device, it is specified by key path
 * @category Scripts
 * @see [[NativeScriptType.PUBKEY_DEVICE_OWNED]]
 * @see [[NativeScript]]
 */
export type NativeScriptParamsDeviceOwnedPubkey = {
    path: BIP32Path;
}

/**
 * Native script of type *pubkey* parameters.
 * Pubkey is third party, it is specified by a key hash in hex format
 * @category Scripts
 * @see [[NativeScriptType.PUBKEY_THIRD_PARTY]]
 * @see [[NativeScript]]
 */
export type NativeScriptParamsThirdPartyPubkey = {
    keyHashHex: string;
}

/**
 * Native script of type *all* parameters.
 * @category Scripts
 * @see [[NativeScriptType.ALL]]
 * @see [[NativeScript]]
 */
export type NativeScriptParamsAll = {
    scripts: NativeScript[];
}

/**
 * Native script of type *any* parameters.
 * @category Scripts
 * @see [[NativeScriptType.ANY]]
 * @see [[NativeScript]]
 */
export type NativeScriptParamsAny = {
    scripts: NativeScript[];
}

/**
 * Native script of type *n_of_k* parameters.
 * @category Scripts
 * @see [[NativeScriptType.N_OF_K]]
 * @see [[NativeScript]]
 */
export type NativeScriptParamsNofK = {
    requiredCount: bigint_like;
    scripts: NativeScript[];
}

/**
 * Native script of type *invalid_before* parameters.
 * @category Scripts
 * @see [[NativeScriptType.INVALID_BEFORE]]
 * @see [[NativeScript]]
 */
export type NativeScriptParamsInvalidBefore = {
    slot: bigint_like;
}

/**
 * Native script of type *invalid_hereafter* parameters.
 * @category Scripts
 * @see [[NativeScriptType.INVALID_HEREAFTER]]
 * @see [[NativeScript]]
 */
export type NativeScriptParamsInvalidHereafter = {
    slot: bigint_like;
}

/**
 * Response to [[Ada.deriveNativeScriptHash]] call
 * @category Scripts
 * @see [[DeriveNativeScriptHashRequest]]
 */
export type NativeScriptHash = {
    scriptHashHex: string;
}

/**
 * Defines in what format is the resulting native script hash shown on the
 * Ledger device
 * @category Scripts
 * @see [[DeriveNativeScriptHashRequest]]
 */
export enum NativeScriptHashDisplayFormat {
    /**
     * The native script hash will be shown in a bech32 encoded format
     */
    BECH32 = 'bech32',
    /**
     * The native script hash will be shown as a policy id
     */
    POLICY_ID = 'policyId',
}


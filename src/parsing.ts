import type {
    AddressParams,
    AssetGroup,
    BIP32Path,
    Certificate,
    InputTypeUTxO,
    MultiHostNameRelay,
    Network,
    PoolMetadataParams,
    PoolOwnerParams,
    PoolParams,
    RelayParams,
    SingleHostIPRelay,
    SingleHostNameRelay,
    Token,
    TxOutput,
    TxOutputTypeAddress,
    TxOutputTypeAddressParams,
    Withdrawal,
} from "./Ada";
import {
    TxOutputType,
} from './Ada'
import type { FixlenHexString, HexString, Uint8_t, Uint16_t, Uint32_t, Uint64_str, ValidBIP32Path, VarlenAsciiString } from "./parseUtils";
import { parseIntFromStr } from "./parseUtils";
import { isArray, isHexStringOfLength, isString, isUint8, isUint16, isValidPath, validate } from "./parseUtils";
import { parseAscii, parseHexString, parseHexStringOfLength, parseUint8_t, parseUint32_t, parseUint64_str } from "./parseUtils";
import { hex_to_buf } from "./serializeUtils";
import { TxErrors } from "./txErrors";

export const MAX_LOVELACE_SUPPLY_STR = "45 000 000 000.000000".replace(/[ .]/, "");

export enum AddressTypeNibble {
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

export const KEY_HASH_LENGTH = 28;
export const TX_HASH_LENGTH = 32;

const TOKEN_POLICY_LENGTH = 28;
const ASSET_NAME_LENGTH_MAX = 32;

const ASSET_GROUPS_MAX = 1000;
const TOKENS_IN_GROUP_MAX = 1000;

const POOL_REGISTRATION_OWNERS_MAX = 1000;
const POOL_REGISTRATION_RELAYS_MAX = 1000;

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

function parseCertificate(cert: Certificate): ParsedCertificate {
    switch (cert.type) {
        case CertificateType.STAKE_REGISTRATION:
        case CertificateType.STAKE_DEREGISTRATION: {
            validate(cert.poolKeyHashHex == null, TxErrors.CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH);
            return {
                type: cert.type,
                path: parseBIP32Path(cert.path, TxErrors.CERTIFICATE_MISSING_PATH)
            }
        }
        case CertificateType.STAKE_DELEGATION: {
            return {
                type: cert.type,
                path: parseBIP32Path(cert.path, TxErrors.CERTIFICATE_MISSING_PATH),
                poolKeyHashHex: parseHexStringOfLength(cert.poolKeyHashHex!, KEY_HASH_LENGTH, TxErrors.CERTIFICATE_MISSING_POOL_KEY_HASH)
            }
        }
        case CertificateType.STAKE_POOL_REGISTRATION: {
            return {
                type: cert.type,
                pool: parsePoolParams(cert.poolRegistrationParams!)
            }
        }

        default:
            throw new Error(TxErrors.CERTIFICATE_INVALID);
    }
}

export function parseCertificates(certificates: Array<Certificate>): Array<ParsedCertificate> {
    validate(isArray(certificates), TxErrors.CERTIFICATES_NOT_ARRAY);

    const parsed = certificates.map(cert => parseCertificate(cert))

    // Pool registration certificate is not allowed to be combined with anything else
    validate(
        parsed.every((cert) => cert.type !== CertificateType.STAKE_POOL_REGISTRATION) || parsed.length === 1,
        TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN
    );
    return parsed
}


export type ParsedToken = {
    assetNameHex: HexString,
    amountStr: Uint64_str,
};

export type ParsedAssetGroup = {
    policyIdHex: FixlenHexString<typeof TOKEN_POLICY_LENGTH>,
    tokens: Array<ParsedToken>,
};

function parseToken(token: Token): ParsedToken {
    const assetNameHex = parseHexString(token.assetNameHex, TxErrors.OUTPUT_INVALID_ASSET_NAME);
    validate(
        token.assetNameHex.length <= ASSET_NAME_LENGTH_MAX * 2,
        TxErrors.OUTPUT_INVALID_ASSET_NAME
    );

    const amountStr = parseUint64_str(token.amountStr, {}, TxErrors.OUTPUT_INVALID_AMOUNT)
    return {
        assetNameHex,
        amountStr,
    }
}

export function parseAssetGroup(assetGroup: AssetGroup): ParsedAssetGroup {
    validate(isArray(assetGroup.tokens), 'TODO: missing error');
    validate(assetGroup.tokens.length <= TOKENS_IN_GROUP_MAX, 'TODO: missing error');

    return {
        policyIdHex: parseHexStringOfLength(assetGroup.policyIdHex, TOKEN_POLICY_LENGTH, TxErrors.OUTPUT_INVALID_TOKEN_POLICY),
        tokens: assetGroup.tokens.map(t => parseToken(t))
    }
}

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


export type ParsedNetwork = {
    protocolMagic: Uint32_t
    networkId: Uint8_t
}

export type ParsedTransaction = {
    network: ParsedNetwork
    inputs: ParsedInput[]
    outputs: ParsedOutput[]
    feeStr: Uint64_str
    ttlStr: Uint64_str | null
    certificates: ParsedCertificate[]
    withdrawals: ParsedWithdrawal[]
    metadataHashHex: FixlenHexString<32> | null
    validityIntervalStartStr: Uint64_str | null
    isSigningPoolRegistrationAsOwner: boolean
}

export function parseTransaction(tx: Transaction): ParsedTransaction {
    const network: ParsedNetwork = {
        protocolMagic: parseUint32_t(tx.network.protocolMagic, TxErrors.INVALID_PROTOCOL_MAGIC),
        networkId: parseUint8_t(tx.network.networkId, TxErrors.INVALID_NETWORK_ID)
    }
    validate(network.networkId <= 0b00001111, TxErrors.INVALID_NETWORK_ID)

    // inputs
    validate(isArray(tx.inputs), TxErrors.INPUTS_NOT_ARRAY);
    const inputs = tx.inputs.map(inp => parseTxInput(inp))

    // outputs
    validate(isArray(tx.outputs), TxErrors.OUTPUTS_NOT_ARRAY);
    const outputs = tx.outputs.map(o => parseTxOutput(o, tx.network))

    // fee
    const feeStr = parseUint64_str(tx.feeStr, { max: MAX_LOVELACE_SUPPLY_STR }, TxErrors.FEE_INVALID);

    //  ttl
    const ttlStr = tx.ttlStr == null
        ? null
        : parseUint64_str(tx.ttlStr, { min: "1" }, TxErrors.TTL_INVALID)

    // certificates
    validate(isArray(tx.certificates), TxErrors.CERTIFICATES_NOT_ARRAY);
    const certificates = parseCertificates(tx.certificates);

    // withdrawals
    validate(isArray(tx.withdrawals), TxErrors.WITHDRAWALS_NOT_ARRAY);
    const withdrawals = tx.withdrawals.map(w => parseWithdrawal(w))

    // metadata
    const metadataHashHex = tx.metadataHashHex == null
        ? null
        : parseHexStringOfLength(tx.metadataHashHex, 32, TxErrors.METADATA_INVALID)

    // validity start
    const validityIntervalStart = tx.validityIntervalStartStr == null
        ? null
        : parseUint64_str(tx.validityIntervalStartStr, { min: "1" }, TxErrors.VALIDITY_INTERVAL_START_INVALID)

    // Additional restrictions for signing pool registration as an owner
    const isSigningPoolRegistrationAsOwner = tx.certificates.some(
        (cert) => cert.type === CertificateType.STAKE_POOL_REGISTRATION
    );
    if (isSigningPoolRegistrationAsOwner) {
        // input should not be given with a path
        // the path is not used, but we check just to avoid potential confusion of developers using this
        validate(
            inputs.every(inp => inp.path == null),
            TxErrors.INPUT_WITH_PATH_WHEN_SIGNING_AS_POOL_OWNER
        );
        // cannot have our output in the tx
        validate(
            outputs.every(out => out.destination.type === TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES),
            TxErrors.OUTPUT_WITH_PATH
        )
        // cannot have withdrawal in the tx
        validate(withdrawals.length === 0, TxErrors.WITHDRAWALS_FORBIDDEN)
    }

    return {
        network,
        inputs,
        outputs,
        ttlStr,
        metadataHashHex,
        validityIntervalStartStr: validityIntervalStart,
        withdrawals,
        certificates,
        feeStr,
        isSigningPoolRegistrationAsOwner
    }
}

export type ParsedInput = {
    txHashHex: FixlenHexString<typeof TX_HASH_LENGTH>
    outputIndex: Uint32_t
    path: ValidBIP32Path | null
}

export function parseTxInput(input: InputTypeUTxO): ParsedInput {
    const txHashHex = parseHexStringOfLength(input.txHashHex, TX_HASH_LENGTH, TxErrors.INPUT_INVALID_TX_HASH)
    const outputIndex = parseUint32_t(input.outputIndex, TxErrors.INPUT_INVALID_UTXO_INDEX)
    return {
        txHashHex,
        outputIndex,
        path: input.path != null ? parseBIP32Path(input.path, TxErrors.INPUT_INVALID_PATH) : null
    }
}

export type ParsedWithdrawal = {
    amountStr: Uint64_str
    path: ValidBIP32Path
}

export function parseWithdrawal(params: Withdrawal): ParsedWithdrawal {
    return {
        amountStr: parseUint64_str(params.amountStr, { max: MAX_LOVELACE_SUPPLY_STR }, TxErrors.WITHDRAWAL_INVALID_AMOUNT),
        path: parseBIP32Path(params.path, TxErrors.WITHDRAWAL_INVALID_PATH)
    }
}


export function parseBIP32Path(path: BIP32Path, err: string): ValidBIP32Path {
    validate(isValidPath(path), err);
    return path as ValidBIP32Path
}

export type ParsedMargin = {
    numeratorStr: Uint64_str,
    denominatorStr: Uint64_str
}

export function parseMargin(params: PoolParams['margin']): ParsedMargin {
    const POOL_MARGIN_DENOMINATOR_MAX_STR = "1 000 000 000 000.000000".replace(/[ .]/, "")

    const marginDenominatorStr = parseUint64_str(
        params.denominatorStr,
        { max: POOL_MARGIN_DENOMINATOR_MAX_STR },
        TxErrors.CERTIFICATE_POOL_INVALID_MARGIN_DENOMINATOR
    );

    const marginNumeratorStr = parseUint64_str(
        params.numeratorStr,
        { max: marginDenominatorStr },
        TxErrors.CERTIFICATE_POOL_INVALID_MARGIN
    );

    return {
        numeratorStr: marginNumeratorStr as Uint64_str,
        denominatorStr: marginDenominatorStr as Uint64_str,
    }
}


export type ParsedPoolParams = {
    keyHashHex: FixlenHexString<28>,
    vrfHashHex: FixlenHexString<32>,
    pledgeStr: Uint64_str,
    costStr: Uint64_str,
    margin: ParsedMargin,
    rewardAccountHex: FixlenHexString<29>
    owners: ParsedPoolOwner[],
    relays: ParsedPoolRelay[],
    metadata: ParsedPoolMetadata | null
}


export function parsePoolParams(params: PoolParams): ParsedPoolParams {
    const keyHashHex = parseHexStringOfLength(params.poolKeyHashHex, KEY_HASH_LENGTH, TxErrors.CERTIFICATE_POOL_INVALID_POOL_KEY_HASH)
    const vrfHashHex = parseHexStringOfLength(params.vrfKeyHashHex, 32, TxErrors.CERTIFICATE_POOL_INVALID_VRF_KEY_HASH)
    const pledgeStr = parseUint64_str(params.pledgeStr, { max: MAX_LOVELACE_SUPPLY_STR }, TxErrors.CERTIFICATE_POOL_INVALID_PLEDGE)
    const costStr = parseUint64_str(params.costStr, { max: MAX_LOVELACE_SUPPLY_STR }, TxErrors.CERTIFICATE_POOL_INVALID_COST)
    const margin = parseMargin(params.margin)
    const rewardAccountHex = parseHexStringOfLength(params.rewardAccountHex, 29, TxErrors.CERTIFICATE_POOL_INVALID_REWARD_ACCOUNT)

    const owners = params.poolOwners.map(owner => parsePoolOwnerParams(owner))
    const relays = params.relays.map(relay => parsePoolRelayParams(relay))
    const metadata = parsePoolMetadataParams(params.metadata)

    // Additional checks
    validate(
        owners.length <= POOL_REGISTRATION_OWNERS_MAX,
        TxErrors.CERTIFICATE_POOL_OWNERS_TOO_MANY
    );
    validate(
        relays.length <= POOL_REGISTRATION_RELAYS_MAX,
        TxErrors.CERTIFICATE_POOL_RELAYS_TOO_MANY
    );
    validate(
        owners.filter(o => o.type === PoolOwnerType.PATH).length === 1,
        TxErrors.CERTIFICATE_POOL_OWNERS_SINGLE_PATH
    )

    return {
        keyHashHex,
        vrfHashHex,
        pledgeStr,
        costStr,
        margin,
        rewardAccountHex,
        owners,
        relays,
        metadata
    }

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

export function parsePoolOwnerParams(params: PoolOwnerParams): ParsedPoolOwner {
    // TODO: should we check if mutually exclusive?
    if (params.stakingPath) {
        const path = parseBIP32Path(params.stakingPath, TxErrors.CERTIFICATE_POOL_OWNER_INVALID_PATH);

        return {
            type: PoolOwnerType.PATH,
            path,
        }
    }

    if (params.stakingKeyHashHex) {
        const hashHex = parseHexStringOfLength(
            params.stakingKeyHashHex,
            KEY_HASH_LENGTH,
            TxErrors.CERTIFICATE_POOL_OWNER_INVALID_KEY_HASH
        );

        return {
            type: PoolOwnerType.KEY_HASH,
            hashHex
        }
    }

    throw new Error(TxErrors.CERTIFICATE_POOL_OWNER_INCOMPLETE);
}

export const enum RelayType {
    SingleHostAddr = 0,
    SingleHostName = 1,
    MultiHostName = 2,
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

function parsePort(portNumber: number, err: string): Uint16_t {
    validate(isUint16(portNumber), err)
    return portNumber
}

function parseIPv4(ipv4: string, err: string): Buffer {
    validate(isString(ipv4), err);
    const ipParts = ipv4.split(".");
    validate(ipParts.length === 4, err)

    const ipBytes = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
        const ipPart = parseIntFromStr(ipParts[i], "invalid IP");
        validate(isUint8(ipPart), err)
        ipBytes.writeUInt8(ipPart, i);
    }
    return ipBytes
}

// FIXME(ppershing): This is terrible and wrong implementation
function parseIPv6(ipv6: string, err: string): Buffer {
    validate(isString(ipv6), err)
    const ipHex = ipv6.split(":").join("");
    validate(isHexStringOfLength(ipHex, 16), err)
    return hex_to_buf(ipHex);
}

function parseDnsName(dnsName: string, err: string): VarlenAsciiString {
    validate(isString(dnsName), err);
    validate(dnsName.length <= 64, err)
    // eslint-disable-next-line no-control-regex
    validate(/^[\x00-\x7F]*$/.test(dnsName), err)
    validate(
        dnsName
            .split("")
            .every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126),
        err
    );
    return dnsName as VarlenAsciiString
}

function parsePoolRelayParams(relayParams: RelayParams): ParsedPoolRelay {
    switch (relayParams.type) {
        case RelayType.SingleHostAddr: {
            const params = relayParams.params as SingleHostIPRelay
            return {
                type: RelayType.SingleHostAddr,
                port: ('portNumber' in params && params.portNumber != null)
                    ? parsePort(params.portNumber, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_PORT)
                    : null,
                ipv4: ('ipv4' in params && params.ipv4 != null)
                    ? parseIPv4(params.ipv4, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV4)
                    : null,
                ipv6: ('ipv6' in params && params.ipv6 != null)
                    ? parseIPv6(params.ipv6, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV6)
                    : null,
            }
        }
        case RelayType.SingleHostName: {
            const params = relayParams.params as SingleHostNameRelay

            return {
                type: RelayType.SingleHostName,
                port: ('portNumber' in params && params.portNumber != null)
                    ? parsePort(params.portNumber, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_PORT)
                    : null,
                dnsName: parseDnsName(params.dnsName, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_DNS)
            }
        }
        case RelayType.MultiHostName: {
            const params = relayParams.params as MultiHostNameRelay
            return {
                type: RelayType.MultiHostName,
                dnsName: parseDnsName(params.dnsName, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_DNS)
            }
        }
        default:
            throw new Error(TxErrors.CERTIFICATE_POOL_RELAY_INVALID_TYPE);
    }
}

export type ParsedPoolMetadata = {
    url: VarlenAsciiString,
    hashHex: FixlenHexString<32>,
} & { __brand: 'pool_metadata' }

export function parsePoolMetadataParams(params: PoolMetadataParams | null): ParsedPoolMetadata | null {
    if (params == null) return null

    const url = parseAscii(params.metadataUrl, TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL);
    // Additional length check
    validate(
        url.length <= 64,
        TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL
    );

    const hashHex = parseHexStringOfLength(params.metadataHashHex, 32, TxErrors.CERTIFICATE_POOL_METADATA_INVALID_HASH);

    return {
        url,
        hashHex,
        __brand: 'pool_metadata' as const
    }
}

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
    type: AddressTypeNibble.BYRON,
    protocolMagic: Uint32_t
    spendingPath: ValidBIP32Path,
    stakingChoice: StakingChoiceNone,
}

type ShelleyAddressParams = {
    type: AddressTypeNibble.BASE | AddressTypeNibble.ENTERPRISE | AddressTypeNibble.POINTER | AddressTypeNibble.REWARD,
    networkId: Uint8_t,
    spendingPath: ValidBIP32Path
} & ( // Extra properties
        {
            type: AddressTypeNibble.BASE,
            stakingChoice: StakingChoicePath | StakingChoiceHash
        } | {
            type: AddressTypeNibble.ENTERPRISE,
            stakingChoice: StakingChoiceNone
        } | {
            type: AddressTypeNibble.POINTER,
            stakingChoice: StakingChoicePointer
        } | {
            type: AddressTypeNibble.REWARD
            stakingChoice: StakingChoiceNone // included in spending path
        }
    )

export type ParsedAddressParams = ByronAddressParams | ShelleyAddressParams

export function parseAddressParams(
    params: AddressParams
): ParsedAddressParams {
    if (params.addressTypeNibble === AddressTypeNibble.BYRON) {
        validate(params.stakingBlockchainPointer == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
        validate(params.stakingKeyHashHex == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
        validate(params.stakingPath == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)

        return {
            type: params.addressTypeNibble,
            protocolMagic: parseUint32_t(params.networkIdOrProtocolMagic, TxErrors.INVALID_PROTOCOL_MAGIC),
            spendingPath: parseBIP32Path(params.spendingPath, TxErrors.OUTPUT_INVALID_SPENDING_PATH),
            stakingChoice: { type: StakingChoiceType.NO_STAKING }
        }
    }

    const networkId = parseUint8_t(params.networkIdOrProtocolMagic, TxErrors.INVALID_NETWORK_ID)
    validate(networkId <= 0b00001111, TxErrors.INVALID_NETWORK_ID)
    const spendingPath = parseBIP32Path(params.spendingPath, TxErrors.OUTPUT_INVALID_SPENDING_PATH)

    switch (params.addressTypeNibble) {
        case AddressTypeNibble.BASE: {
            validate(params.stakingBlockchainPointer == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
            const _hash = params.stakingKeyHashHex != null ? 'hash' : ''
            const _path = params.stakingPath != null ? 'path' : ''
            switch (_hash + _path) {
                case 'hash': {
                    const hashHex = parseHexStringOfLength(params.stakingKeyHashHex!, KEY_HASH_LENGTH, TxErrors.OUTPUT_INVALID_STAKING_KEY_HASH)
                    return {
                        type: params.addressTypeNibble,
                        networkId,
                        spendingPath,
                        stakingChoice: {
                            type: StakingChoiceType.STAKING_KEY_HASH,
                            hashHex,
                        }
                    }
                }

                case 'path': {
                    const path = parseBIP32Path(params.stakingPath!, TxErrors.OUTPUT_INVALID_STAKING_KEY_PATH)

                    return {
                        type: params.addressTypeNibble,
                        networkId,
                        spendingPath,
                        stakingChoice: {
                            type: StakingChoiceType.STAKING_KEY_PATH,
                            path,
                        }
                    }
                }

                default:
                    throw new Error(TxErrors.OUTPUT_INVALID_STAKING_INFO)
            }
        }
        case AddressTypeNibble.ENTERPRISE: {
            validate(params.stakingBlockchainPointer == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
            validate(params.stakingKeyHashHex == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)

            return {
                type: params.addressTypeNibble,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.NO_STAKING,
                }
            }
        }
        case AddressTypeNibble.POINTER: {
            validate(params.stakingKeyHashHex == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)

            validate(params.stakingBlockchainPointer != null, TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER)
            const pointer = params.stakingBlockchainPointer!

            return {
                type: params.addressTypeNibble,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.BLOCKCHAIN_POINTER,
                    pointer: {
                        blockIndex: parseUint32_t(pointer.blockIndex, TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER),
                        txIndex: parseUint32_t(pointer.txIndex, TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER),
                        certificateIndex: parseUint32_t(pointer.certificateIndex, TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER)
                    },
                }
            }
        }
        case AddressTypeNibble.REWARD: {
            validate(params.stakingBlockchainPointer == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
            validate(params.stakingKeyHashHex == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, TxErrors.OUTPUT_INVALID_STAKING_INFO)

            return {
                type: params.addressTypeNibble,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.NO_STAKING
                }
            }
        }
        default:
            throw new Error(TxErrors.OUTPUT_UNKNOWN_TYPE);
    }
}


export type OutputDestination = {
    type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES
    addressHex: HexString
} | {
    type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS
    addressParams: ParsedAddressParams
}

export type ParsedOutput = {
    amountStr: Uint64_str
    tokenBundle: AssetGroup[]
    destination: OutputDestination
}

export function parseTxOutput(
    output: TxOutput,
    network: Network,
): ParsedOutput {
    const amountStr = parseUint64_str(output.amountStr, { max: MAX_LOVELACE_SUPPLY_STR }, TxErrors.OUTPUT_INVALID_AMOUNT)

    validate(isArray(output.tokenBundle ?? []), TxErrors.OUTPUT_INVALID_TOKEN_BUNDLE);
    validate((output.tokenBundle ?? []).length <= ASSET_GROUPS_MAX, TxErrors.OUTPUT_INVALID_TOKEN_BUNDLE_TOO_LARGE);
    const tokenBundle = (output.tokenBundle ?? []).map((ag) => parseAssetGroup(ag))

    const hasAddressHex = "addressHex" in output && output.addressHex != null
    const hasAddressParams = "spendingPath" in output && output.spendingPath != null
    if (hasAddressHex && !hasAddressParams) {
        output = output as TxOutputTypeAddress
        const addressHex = parseHexString(output.addressHex, TxErrors.OUTPUT_INVALID_ADDRESS)
        validate(output.addressHex.length <= 128 * 2, TxErrors.OUTPUT_INVALID_ADDRESS);
        return {
            amountStr,
            tokenBundle,
            destination: {
                type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES,
                addressHex,
            }
        }
    } else if (!hasAddressHex && hasAddressParams) {
        output = output as TxOutputTypeAddressParams
        return {
            amountStr,
            tokenBundle,
            destination: {
                type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS,
                addressParams: parseAddressParams({
                    addressTypeNibble: output.addressTypeNibble,
                    networkIdOrProtocolMagic: output.addressTypeNibble === AddressTypeNibble.BYRON
                        ? network.protocolMagic
                        : network.networkId,
                    spendingPath: output.spendingPath,
                    stakingPath: output.stakingPath,
                    stakingKeyHashHex: output.stakingKeyHashHex,
                    stakingBlockchainPointer: output.stakingBlockchainPointer
                })
            }
        }
    } else {
        throw new Error(TxErrors.OUTPUT_UNKNOWN_TYPE)
    }
}
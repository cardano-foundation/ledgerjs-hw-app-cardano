import { InvalidData } from "./errors";
import { InvalidDataReason } from "./errors/invalidDataReason";
import { parseIntFromStr } from "./parseUtils";
import { isArray, isHexStringOfLength, isString, isUint8, isUint16, isValidPath, validate } from "./parseUtils";
import { parseAscii, parseHexString, parseHexStringOfLength, parseUint8_t, parseUint32_t, parseUint64_str } from "./parseUtils";
import { hex_to_buf } from "./serializeUtils";
import type { OutputDestination, ParsedAddressParams, ParsedAssetGroup, ParsedCertificate, ParsedInput, ParsedMargin, ParsedNetwork, ParsedOutput, ParsedPoolMetadata, ParsedPoolOwner, ParsedPoolParams, ParsedPoolRelay, ParsedToken, ParsedTransaction, ParsedWithdrawal, Uint16_t, Uint64_str, ValidBIP32Path, VarlenAsciiString } from "./types/internal";
import { AddressType, ASSET_NAME_LENGTH_MAX, CertificateType, KEY_HASH_LENGTH, PoolOwnerType, RelayType, StakingChoiceType, TOKEN_POLICY_LENGTH, TX_HASH_LENGTH, TxOutputType } from "./types/internal";
import type {
    AssetGroup,
    BIP32Path,
    BlockchainPointer,
    Certificate,
    DeviceOwnedAddress,
    MultiHostNameRelayParams,
    Network,
    PoolMetadataParams,
    PoolOwnerParams,
    PoolRegistrationParams,
    Relay,
    SingleHostIPRelayParams,
    SingleHostNameRelayParams,
    Token,
    Transaction,
    TxInput,
    TxOutput,
    TxOutputDestination,
    Withdrawal
} from "./types/public";
import {
    TxOutputDestinationType,
} from "./types/public";

export const MAX_LOVELACE_SUPPLY_STR = "45 000 000 000.000000".replace(/[ .]/, "");

const ASSET_GROUPS_MAX = 1000;
const TOKENS_IN_GROUP_MAX = 1000;

const POOL_REGISTRATION_OWNERS_MAX = 1000;
const POOL_REGISTRATION_RELAYS_MAX = 1000;


function parseCertificate(cert: Certificate): ParsedCertificate {
    switch (cert.type) {
        case CertificateType.STAKE_REGISTRATION:
        case CertificateType.STAKE_DEREGISTRATION: {
            validate((cert.params as any).poolKeyHashHex == null, InvalidDataReason.CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH);
            return {
                type: cert.type,
                path: parseBIP32Path(cert.params.path, InvalidDataReason.CERTIFICATE_MISSING_PATH)
            }
        }
        case CertificateType.STAKE_DELEGATION: {
            return {
                type: cert.type,
                path: parseBIP32Path(cert.params.path, InvalidDataReason.CERTIFICATE_MISSING_PATH),
                poolKeyHashHex: parseHexStringOfLength(cert.params.poolKeyHashHex, KEY_HASH_LENGTH, InvalidDataReason.CERTIFICATE_MISSING_POOL_KEY_HASH)
            }
        }
        case CertificateType.STAKE_POOL_REGISTRATION: {
            return {
                type: cert.type,
                pool: parsePoolParams(cert.params)
            }
        }

        default:
            throw new InvalidData(InvalidDataReason.CERTIFICATE_INVALID);
    }
}

export function parseCertificates(certificates: Array<Certificate>): Array<ParsedCertificate> {
    validate(isArray(certificates), InvalidDataReason.CERTIFICATES_NOT_ARRAY);

    const parsed = certificates.map(cert => parseCertificate(cert))

    // Pool registration certificate is not allowed to be combined with anything else
    validate(
        parsed.every((cert) => cert.type !== CertificateType.STAKE_POOL_REGISTRATION) || parsed.length === 1,
        InvalidDataReason.CERTIFICATES_COMBINATION_FORBIDDEN
    );
    return parsed
}


function parseToken(token: Token): ParsedToken {
    const assetNameHex = parseHexString(token.assetNameHex, InvalidDataReason.OUTPUT_INVALID_ASSET_NAME);
    validate(
        token.assetNameHex.length <= ASSET_NAME_LENGTH_MAX * 2,
        InvalidDataReason.OUTPUT_INVALID_ASSET_NAME
    );

    const amount = parseUint64_str(token.amount, {}, InvalidDataReason.OUTPUT_INVALID_AMOUNT)
    return {
        assetNameHex,
        amount,
    }
}

export function parseAssetGroup(assetGroup: AssetGroup): ParsedAssetGroup {
    validate(isArray(assetGroup.tokens), InvalidDataReason.OUTPUT_INVALID_ASSET_GROUP_TOKENS_NOT_ARRAY);
    validate(assetGroup.tokens.length <= TOKENS_IN_GROUP_MAX, InvalidDataReason.OUTPUT_INVALID_ASSET_GROUP_TOKENS_TOO_LARGE);

    return {
        policyIdHex: parseHexStringOfLength(assetGroup.policyIdHex, TOKEN_POLICY_LENGTH, InvalidDataReason.OUTPUT_INVALID_TOKEN_POLICY),
        tokens: assetGroup.tokens.map(t => parseToken(t))
    }
}

export function parseTransaction(tx: Transaction): ParsedTransaction {
    const network = parseNetwork(tx.network)

    // inputs
    validate(isArray(tx.inputs), InvalidDataReason.INPUTS_NOT_ARRAY);
    const inputs = tx.inputs.map(inp => parseTxInput(inp))

    // outputs
    validate(isArray(tx.outputs), InvalidDataReason.OUTPUTS_NOT_ARRAY);
    const outputs = tx.outputs.map(o => parseTxOutput(o, tx.network))

    // fee
    const fee = parseUint64_str(tx.fee, { max: MAX_LOVELACE_SUPPLY_STR }, InvalidDataReason.FEE_INVALID);

    //  ttl
    const ttl = tx.ttl == null
        ? null
        : parseUint64_str(tx.ttl, { min: "1" }, InvalidDataReason.TTL_INVALID)

    // certificates
    validate(isArray(tx.certificates), InvalidDataReason.CERTIFICATES_NOT_ARRAY);
    const certificates = parseCertificates(tx.certificates);

    // withdrawals
    validate(isArray(tx.withdrawals), InvalidDataReason.WITHDRAWALS_NOT_ARRAY);
    const withdrawals = tx.withdrawals.map(w => parseWithdrawal(w))

    // metadata
    const metadataHashHex = tx.metadataHashHex == null
        ? null
        : parseHexStringOfLength(tx.metadataHashHex, 32, InvalidDataReason.METADATA_INVALID)

    // validity start
    const validityIntervalStart = tx.validityIntervalStart == null
        ? null
        : parseUint64_str(tx.validityIntervalStart, { min: "1" }, InvalidDataReason.VALIDITY_INTERVAL_START_INVALID)

    // Additional restrictions for signing pool registration as an owner
    const isSigningPoolRegistrationAsOwner = tx.certificates.some(
        (cert) => cert.type === CertificateType.STAKE_POOL_REGISTRATION
    );
    if (isSigningPoolRegistrationAsOwner) {
        // input should not be given with a path
        // the path is not used, but we check just to avoid potential confusion of developers using this
        validate(
            inputs.every(inp => inp.path == null),
            InvalidDataReason.INPUT_WITH_PATH_WHEN_SIGNING_AS_POOL_OWNER
        );
        // cannot have our output in the tx
        validate(
            outputs.every(out => out.destination.type === TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES),
            InvalidDataReason.OUTPUT_WITH_PATH
        )
        // cannot have withdrawal in the tx
        validate(withdrawals.length === 0, InvalidDataReason.WITHDRAWALS_FORBIDDEN)
    }

    return {
        network,
        inputs,
        outputs,
        ttl,
        metadataHashHex,
        validityIntervalStart: validityIntervalStart,
        withdrawals,
        certificates,
        fee,
        isSigningPoolRegistrationAsOwner
    }
}

export function parseTxInput(input: TxInput): ParsedInput {
    const txHashHex = parseHexStringOfLength(input.txHashHex, TX_HASH_LENGTH, InvalidDataReason.INPUT_INVALID_TX_HASH)
    const outputIndex = parseUint32_t(input.outputIndex, InvalidDataReason.INPUT_INVALID_UTXO_INDEX)
    return {
        txHashHex,
        outputIndex,
        path: input.path != null ? parseBIP32Path(input.path, InvalidDataReason.INPUT_INVALID_PATH) : null
    }
}

export function parseWithdrawal(params: Withdrawal): ParsedWithdrawal {
    return {
        amount: parseUint64_str(params.amount, { max: MAX_LOVELACE_SUPPLY_STR }, InvalidDataReason.WITHDRAWAL_INVALID_AMOUNT),
        path: parseBIP32Path(params.path, InvalidDataReason.WITHDRAWAL_INVALID_PATH)
    }
}

export function parseBIP32Path(path: BIP32Path, err: InvalidDataReason): ValidBIP32Path {
    validate(isValidPath(path), err);
    return path as ValidBIP32Path
}


export function parseMargin(params: PoolRegistrationParams['margin']): ParsedMargin {
    const POOL_MARGIN_DENOMINATOR_MAX_STR = "1 000 000 000 000.000000".replace(/[ .]/, "")

    const marginDenominator = parseUint64_str(
        params.denominator,
        { max: POOL_MARGIN_DENOMINATOR_MAX_STR },
        InvalidDataReason.POOL_MARGIN_INVALID_MARGIN_DENOMINATOR
    );

    const marginNumerator = parseUint64_str(
        params.numerator,
        { max: marginDenominator },
        InvalidDataReason.POOL_REGISTRATION_INVALID_MARGIN
    );

    return {
        numerator: marginNumerator as Uint64_str,
        denominator: marginDenominator as Uint64_str,
    }
}



export function parsePoolParams(params: PoolRegistrationParams): ParsedPoolParams {
    const keyHashHex = parseHexStringOfLength(params.poolKeyHashHex, KEY_HASH_LENGTH, InvalidDataReason.POOL_REGISTRATION_INVALID_POOL_KEY_HASH)
    const vrfHashHex = parseHexStringOfLength(params.vrfKeyHashHex, 32, InvalidDataReason.POOL_REGISTRATION_INVALID_VRF_KEY_HASH)
    const pledge = parseUint64_str(params.pledge, { max: MAX_LOVELACE_SUPPLY_STR }, InvalidDataReason.POOL_REGISTRATION_INVALID_PLEDGE)
    const cost = parseUint64_str(params.cost, { max: MAX_LOVELACE_SUPPLY_STR }, InvalidDataReason.POOL_REGISTRATION_INVALID_COST)
    const margin = parseMargin(params.margin)
    const rewardAccountHex = parseHexStringOfLength(params.rewardAccountHex, 29, InvalidDataReason.POOL_REGISTRATION_INVALID_REWARD_ACCOUNT)

    const owners = params.poolOwners.map(owner => parsePoolOwnerParams(owner))
    const relays = params.relays.map(relay => parsePoolRelayParams(relay))
    const metadata = parsePoolMetadataParams(params.metadata)

    // Additional checks
    validate(
        owners.length <= POOL_REGISTRATION_OWNERS_MAX,
        InvalidDataReason.POOL_REGISTRATION_OWNERS_TOO_MANY
    );
    validate(
        relays.length <= POOL_REGISTRATION_RELAYS_MAX,
        InvalidDataReason.POOL_REGISTRATION_RELAYS_TOO_MANY
    );
    validate(
        owners.filter(o => o.type === PoolOwnerType.PATH).length === 1,
        InvalidDataReason.POOL_REGISTRATION_OWNERS_SINGLE_PATH
    )

    return {
        keyHashHex,
        vrfHashHex,
        pledge,
        cost,
        margin,
        rewardAccountHex,
        owners,
        relays,
        metadata
    }

}

export function parsePoolOwnerParams(params: PoolOwnerParams): ParsedPoolOwner {
    // TODO: should we check if mutually exclusive?
    if (params.stakingPath) {
        const path = parseBIP32Path(params.stakingPath, InvalidDataReason.POOL_OWNER_INVALID_PATH);

        return {
            type: PoolOwnerType.PATH,
            path,
        }
    }

    if (params.stakingKeyHashHex) {
        const hashHex = parseHexStringOfLength(
            params.stakingKeyHashHex,
            KEY_HASH_LENGTH,
            InvalidDataReason.POOL_OWNER_INVALID_KEY_HASH
        );

        return {
            type: PoolOwnerType.KEY_HASH,
            hashHex
        }
    }

    throw new InvalidData(InvalidDataReason.POOL_OWNER_INCOMPLETE);
}


function parsePort(portNumber: number, err: InvalidDataReason): Uint16_t {
    validate(isUint16(portNumber), err)
    return portNumber
}

function parseIPv4(ipv4: string, err: InvalidDataReason): Buffer {
    validate(isString(ipv4), err);
    const ipParts = ipv4.split(".");
    validate(ipParts.length === 4, err)

    const ipBytes = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
        const ipPart = parseIntFromStr(ipParts[i], InvalidDataReason.RELAY_INVALID_IPV4);
        validate(isUint8(ipPart), err)
        ipBytes.writeUInt8(ipPart, i);
    }
    return ipBytes
}

// FIXME(ppershing): This is terrible and wrong implementation
function parseIPv6(ipv6: string, err: InvalidDataReason): Buffer {
    validate(isString(ipv6), err)
    const ipHex = ipv6.split(":").join("");
    validate(isHexStringOfLength(ipHex, 16), err)
    return hex_to_buf(ipHex);
}

function parseDnsName(dnsName: string, err: InvalidDataReason): VarlenAsciiString {
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

function parsePoolRelayParams(relayParams: Relay): ParsedPoolRelay {
    switch (relayParams.type) {
        case RelayType.SingleHostAddr: {
            const params = relayParams.params as SingleHostIPRelayParams
            return {
                type: RelayType.SingleHostAddr,
                port: ('portNumber' in params && params.portNumber != null)
                    ? parsePort(params.portNumber, InvalidDataReason.RELAY_INVALID_PORT)
                    : null,
                ipv4: ('ipv4' in params && params.ipv4 != null)
                    ? parseIPv4(params.ipv4, InvalidDataReason.RELAY_INVALID_IPV4)
                    : null,
                ipv6: ('ipv6' in params && params.ipv6 != null)
                    ? parseIPv6(params.ipv6, InvalidDataReason.RELAY_INVALID_IPV6)
                    : null,
            }
        }
        case RelayType.SingleHostName: {
            const params = relayParams.params as SingleHostNameRelayParams

            return {
                type: RelayType.SingleHostName,
                port: ('portNumber' in params && params.portNumber != null)
                    ? parsePort(params.portNumber, InvalidDataReason.RELAY_INVALID_PORT)
                    : null,
                dnsName: parseDnsName(params.dnsName, InvalidDataReason.RELAY_INVALID_DNS)
            }
        }
        case RelayType.MultiHostName: {
            const params = relayParams.params as MultiHostNameRelayParams
            return {
                type: RelayType.MultiHostName,
                dnsName: parseDnsName(params.dnsName, InvalidDataReason.RELAY_INVALID_DNS)
            }
        }
        default:
            throw new InvalidData(InvalidDataReason.RELAY_INVALID_TYPE);
    }
}

export function parsePoolMetadataParams(params: PoolMetadataParams | null): ParsedPoolMetadata | null {
    if (params == null) return null

    const url = parseAscii(params.metadataUrl, InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL);
    // Additional length check
    validate(
        url.length <= 64,
        InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL
    );

    const hashHex = parseHexStringOfLength(params.metadataHashHex, 32, InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_HASH);

    return {
        url,
        hashHex,
        __brand: 'pool_metadata' as const
    }
}

export function parseNetwork(network: Network): ParsedNetwork {
    const parsed = {
        protocolMagic: parseUint32_t(network.protocolMagic, InvalidDataReason.NETWORK_INVALID_PROTOCOL_MAGIC),
        networkId: parseUint8_t(network.networkId, InvalidDataReason.NETWORK_INVALID_NETWORK_ID)
    }
    validate(parsed.networkId <= 0b00001111, InvalidDataReason.NETWORK_INVALID_NETWORK_ID)
    return parsed
}

export function parseAddress(
    network: Network,
    address: DeviceOwnedAddress
): ParsedAddressParams {
    const parsedNetwork = parseNetwork(network)

    // Cast to union of all param fields
    const params = address.params as {
        stakingPath?: BIP32Path
        stakingKeyHashHex?: string
        stakingBlockchainPointer?: BlockchainPointer
    }

    if (address.type === AddressType.BYRON) {
        validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
        validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
        validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

        return {
            type: address.type,
            protocolMagic: parsedNetwork.protocolMagic,
            spendingPath: parseBIP32Path(address.params.spendingPath, InvalidDataReason.ADDRESS_INVALID_SPENDING_PATH),
            stakingChoice: { type: StakingChoiceType.NO_STAKING }
        }
    }

    const networkId = parsedNetwork.networkId
    const spendingPath = parseBIP32Path(address.params.spendingPath, InvalidDataReason.ADDRESS_INVALID_SPENDING_PATH)

    switch (address.type) {
        case AddressType.BASE: {

            validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            const _hash = params.stakingKeyHashHex != null ? 'hash' : ''
            const _path = params.stakingPath != null ? 'path' : ''
            switch (_hash + _path) {
                case 'hash': {
                    const hashHex = parseHexStringOfLength(params.stakingKeyHashHex!, KEY_HASH_LENGTH, InvalidDataReason.ADDRESS_INVALID_STAKING_KEY_HASH)
                    return {
                        type: address.type,
                        networkId,
                        spendingPath,
                        stakingChoice: {
                            type: StakingChoiceType.STAKING_KEY_HASH,
                            hashHex,
                        }
                    }
                }

                case 'path': {
                    const path = parseBIP32Path(params.stakingPath!, InvalidDataReason.ADDRESS_INVALID_STAKING_KEY_PATH)

                    return {
                        type: address.type,
                        networkId,
                        spendingPath,
                        stakingChoice: {
                            type: StakingChoiceType.STAKING_KEY_PATH,
                            path,
                        }
                    }
                }

                default:
                    throw new InvalidData(InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            }
        }
        case AddressType.ENTERPRISE: {
            validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

            return {
                type: address.type,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.NO_STAKING,
                }
            }
        }
        case AddressType.POINTER: {
            validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

            validate(params.stakingBlockchainPointer != null, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER)
            const pointer = params.stakingBlockchainPointer!

            return {
                type: address.type,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.BLOCKCHAIN_POINTER,
                    pointer: {
                        blockIndex: parseUint32_t(pointer.blockIndex, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER),
                        txIndex: parseUint32_t(pointer.txIndex, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER),
                        certificateIndex: parseUint32_t(pointer.certificateIndex, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER)
                    },
                }
            }
        }
        case AddressType.REWARD: {
            validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

            return {
                type: address.type,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.NO_STAKING
                }
            }
        }
        default:
            throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE);
    }
}

export function parseTxDestination(
    network: Network,
    destination: TxOutputDestination
): OutputDestination {
    switch (destination.type) {
        case TxOutputDestinationType.ThirdParty: {
            const params = destination.params
            const addressHex = parseHexString(params.addressHex, InvalidDataReason.OUTPUT_INVALID_ADDRESS)
            validate(params.addressHex.length <= 128 * 2, InvalidDataReason.OUTPUT_INVALID_ADDRESS);
            return {
                type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES,
                addressHex,
            }
        }
        case TxOutputDestinationType.DeviceOwned: {
            const params = destination.params

            return {
                type: TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS,
                addressParams: parseAddress(network, params)
            }
        }
        default:
            throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE)
    }
}

export function parseTxOutput(
    output: TxOutput,
    network: Network,
): ParsedOutput {
    const amount = parseUint64_str(output.amount, { max: MAX_LOVELACE_SUPPLY_STR }, InvalidDataReason.OUTPUT_INVALID_AMOUNT)

    validate(isArray(output.tokenBundle ?? []), InvalidDataReason.OUTPUT_INVALID_TOKEN_BUNDLE);
    validate((output.tokenBundle ?? []).length <= ASSET_GROUPS_MAX, InvalidDataReason.OUTPUT_INVALID_TOKEN_BUNDLE_TOO_LARGE);
    const tokenBundle = (output.tokenBundle ?? []).map((ag) => parseAssetGroup(ag))

    const destination = parseTxDestination(network, output.destination)
    return {
        amount,
        tokenBundle,
        destination
    }
}
import { InvalidData } from "../errors";
import { InvalidDataReason } from "../errors/invalidDataReason";
import type { OutputDestination, ParsedAssetGroup, ParsedCertificate, ParsedInput, ParsedOutput, ParsedSigningRequest, ParsedToken, ParsedTransaction, ParsedWithdrawal } from "../types/internal";
import { ASSET_NAME_LENGTH_MAX, CertificateType, TOKEN_POLICY_LENGTH, TX_HASH_LENGTH } from "../types/internal";
import type {
    AssetGroup,
    Certificate,
    Network,
    SignTransactionRequest,
    Token,
    Transaction,
    TxInput,
    TxOutput,
    TxOutputDestination,
    Withdrawal
} from "../types/public";
import {
    PoolOwnerType,
    TransactionSigningMode,
    TxOutputDestinationType
} from "../types/public";
import { assert, unreachable } from "../utils/assert";
import { isArray, parseBIP32Path, validate } from "../utils/parse";
import { parseHexString, parseHexStringOfLength, parseUint32_t, parseUint64_str } from "../utils/parse";
import { parseAddress } from "./address";
import { parseCertificate } from "./certificate";
import { ASSET_GROUPS_MAX, MAX_LOVELACE_SUPPLY_STR, TOKENS_IN_GROUP_MAX } from "./constants";
import { parseNetwork } from "./network";
import { parseTxAuxiliaryData } from "./txAuxiliaryData";

function parseCertificates(certificates: Array<Certificate>): Array<ParsedCertificate> {
    validate(isArray(certificates), InvalidDataReason.CERTIFICATES_NOT_ARRAY);

    const parsed = certificates.map(cert => parseCertificate(cert))

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

function parseAssetGroup(assetGroup: AssetGroup): ParsedAssetGroup {
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
        : parseUint64_str(tx.ttl, {}, InvalidDataReason.TTL_INVALID)

    // certificates
    validate(isArray(tx.certificates ?? []), InvalidDataReason.CERTIFICATES_NOT_ARRAY);
    const certificates = parseCertificates(tx.certificates ?? []);

    // withdrawals
    validate(isArray(tx.withdrawals ?? []), InvalidDataReason.WITHDRAWALS_NOT_ARRAY);
    const withdrawals = (tx.withdrawals ?? []).map(w => parseWithdrawal(w));

    // auxiliary data
    const auxiliaryData = tx.auxiliaryData == null
        ? null
        : parseTxAuxiliaryData(network, tx.auxiliaryData);

    // validity start
    const validityIntervalStart = tx.validityIntervalStart == null
        ? null
        : parseUint64_str(tx.validityIntervalStart, {}, InvalidDataReason.VALIDITY_INTERVAL_START_INVALID);

    return {
        network,
        inputs,
        outputs,
        ttl,
        auxiliaryData,
        validityIntervalStart,
        withdrawals,
        certificates,
        fee,
    }
}

function parseTxInput(input: TxInput): ParsedInput {
    const txHashHex = parseHexStringOfLength(input.txHashHex, TX_HASH_LENGTH, InvalidDataReason.INPUT_INVALID_TX_HASH)
    const outputIndex = parseUint32_t(input.outputIndex, InvalidDataReason.INPUT_INVALID_UTXO_INDEX)
    return {
        txHashHex,
        outputIndex,
        path: input.path != null ? parseBIP32Path(input.path, InvalidDataReason.INPUT_INVALID_PATH) : null
    }
}

function parseWithdrawal(params: Withdrawal): ParsedWithdrawal {
    return {
        amount: parseUint64_str(params.amount, { max: MAX_LOVELACE_SUPPLY_STR }, InvalidDataReason.WITHDRAWAL_INVALID_AMOUNT),
        path: parseBIP32Path(params.path, InvalidDataReason.WITHDRAWAL_INVALID_PATH)
    }
}

function parseTxDestination(
    network: Network,
    destination: TxOutputDestination
): OutputDestination {
    switch (destination.type) {
        case TxOutputDestinationType.THIRD_PARTY: {
            const params = destination.params
            const addressHex = parseHexString(params.addressHex, InvalidDataReason.OUTPUT_INVALID_ADDRESS)
            validate(params.addressHex.length <= 128 * 2, InvalidDataReason.OUTPUT_INVALID_ADDRESS);
            return {
                type: TxOutputDestinationType.THIRD_PARTY,
                addressHex,
            }
        }
        case TxOutputDestinationType.DEVICE_OWNED: {
            const params = destination.params

            return {
                type: TxOutputDestinationType.DEVICE_OWNED,
                addressParams: parseAddress(network, params)
            }
        }
        default:
            throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE)
    }
}

function parseTxOutput(
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

export function parseSigningMode(mode: TransactionSigningMode): TransactionSigningMode {
    switch (mode) {
        case TransactionSigningMode.ORDINARY_TRANSACTION:
        case TransactionSigningMode.POOL_REGISTRATION_AS_OWNER:
            return mode
        default:
            throw new Error('TODO')
    }
}

export function parseSignTransactionRequest(request: SignTransactionRequest): ParsedSigningRequest {
    const tx = parseTransaction(request.tx)
    const signingMode = parseSigningMode(request.signingMode)

    // Additional restrictions based on signing mode
    switch (signingMode) {
        case TransactionSigningMode.ORDINARY_TRANSACTION: {
            validate(
                tx.certificates.every(certificate => certificate.type !== CertificateType.STAKE_POOL_REGISTRATION),
                InvalidDataReason.SIGN_MODE_ORDINARY__POOL_REGISTRATION_NOT_ALLOWED,
            )
            break
        }
        case TransactionSigningMode.POOL_REGISTRATION_AS_OWNER: {
            // all these restictions are due to fact that pool owner signature *might* accidentally/maliciously sign another part of tx
            // but we are not showing these parts to the user

            // input should not be given with a path
            // the path is not used, but we check just to avoid potential confusion of developers using this
            validate(
                tx.inputs.every(inp => inp.path == null),
                InvalidDataReason.SIGN_MODE_POOL_OWNER__INPUT_WITH_PATH_NOT_ALLOWED
            );
            // cannot have our output in the tx
            validate(
                tx.outputs.every(out => out.destination.type === TxOutputDestinationType.THIRD_PARTY),
                InvalidDataReason.SIGN_MODE_POOL_OWNER__DEVICE_OWNED_ADDRESS_NOT_ALLOWED
            )

            validate(
                tx.certificates.length === 1,
                InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED
            )
            tx.certificates.forEach(certificate => {
                validate(
                    certificate.type === CertificateType.STAKE_POOL_REGISTRATION,
                    InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED
                )
                validate(
                    certificate.pool.owners.filter(o => o.type === PoolOwnerType.DEVICE_OWNED).length === 1,
                    InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_DEVICE_OWNER_REQUIRED
                )
            })

            // cannot have withdrawal in the tx
            validate(
                tx.withdrawals.length === 0,
                InvalidDataReason.SIGN_MODE_POOL_OWNER__WITHDRAWALS_NOT_ALLOWED
            )
            break
        }
        case TransactionSigningMode.__RESEVED_POOL_REGISTRATION_AS_OPERATOR: {
            assert(false, "Not implemented")
            break
        }
        default:
            unreachable(signingMode)
    }

    return { tx, signingMode }
}
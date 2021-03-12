import { InvalidData } from "../errors";
import { InvalidDataReason } from "../errors/invalidDataReason";
import type { OutputDestination, ParsedAssetGroup, ParsedCertificate, ParsedInput, ParsedOutput, ParsedToken, ParsedTransaction, ParsedWithdrawal } from "../types/internal";
import { ASSET_NAME_LENGTH_MAX, CertificateType, TOKEN_POLICY_LENGTH, TX_HASH_LENGTH, TxOutputType } from "../types/internal";
import type {
    AssetGroup,
    Certificate,
    Network,
    Token,
    Transaction,
    TxInput,
    TxOutput,
    TxOutputDestination,
    Withdrawal
} from "../types/public";
import {
    TxOutputDestinationType,
} from "../types/public";
import { parseBIP32Path } from "../utils/parse";
import { isArray, validate } from "../utils/parse";
import { parseHexString, parseHexStringOfLength, parseUint32_t, parseUint64_str } from "../utils/parse";
import { parseAddress } from "./address";
import { parseCertificate } from "./certificate";
import { ASSET_GROUPS_MAX, MAX_LOVELACE_SUPPLY_STR, TOKENS_IN_GROUP_MAX } from "./constants";
import { parseNetwork } from "./network";

function parseCertificates(certificates: Array<Certificate>): Array<ParsedCertificate> {
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
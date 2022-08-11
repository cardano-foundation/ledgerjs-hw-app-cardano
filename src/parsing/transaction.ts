import {InvalidData} from "../errors"
import {InvalidDataReason} from "../errors/invalidDataReason"
import type {
    OutputDestination,
    ParsedAssetGroup,
    ParsedCertificate,
    ParsedDatum,
    ParsedInput,
    ParsedOutput,
    ParsedRequiredSigner,
    ParsedSigningRequest,
    ParsedToken,
    ParsedTransaction,
    ParsedWithdrawal,
} from "../types/internal"
import {
    ASSET_NAME_LENGTH_MAX,
    CertificateType,
    DATUM_HASH_LENGTH,
    KEY_HASH_LENGTH,
    RequiredSignerType,
    SCRIPT_DATA_HASH_LENGTH,
    SpendingDataSourceType,
    StakeCredentialType,
    TOKEN_POLICY_LENGTH,
    TX_HASH_LENGTH,
} from "../types/internal"
import type {
    AssetGroup,
    Certificate,
    Network,
    RequiredSigner,
    SignTransactionRequest,
    Token,
    Transaction,
    TxInput,
    TxOutput,
    TxOutputDestination,
    Withdrawal,
} from "../types/public"
import {
    DatumType,
    PoolKeyType,
    PoolOwnerType,
    TransactionSigningMode,
    TxOutputDestinationType,
    TxOutputFormat,
    TxRequiredSignerType,
} from "../types/public"
import {unreachable} from '../utils/assert'
import {
    isArray,
    parseBIP32Path,
    parseHexString,
    parseHexStringOfLength,
    parseInt64_str,
    parseStakeCredential,
    parseUint32_t,
    parseUint64_str,
    validate,
} from "../utils/parse"
import {parseAddress} from "./address"
import {parseCertificate} from "./certificate"
import {ASSET_GROUPS_MAX, MAX_LOVELACE_SUPPLY_STR, TOKENS_IN_GROUP_MAX} from "./constants"
import {parseNetwork} from "./network"
import {parseTxAuxiliaryData} from "./txAuxiliaryData"

function parseCertificates(certificates: Array<Certificate>): Array<ParsedCertificate> {
    validate(isArray(certificates), InvalidDataReason.CERTIFICATES_NOT_ARRAY)

    const parsed = certificates.map(cert => parseCertificate(cert))

    return parsed
}


type ParseTokenAmountFn<T> = (
    val: unknown,
    constraints: { min?: string; max?: string },
    errMsg: InvalidDataReason
) => T

function parseToken<T>(token: Token, parseTokenAmountFn: ParseTokenAmountFn<T>): ParsedToken<T> {
    const assetNameHex = parseHexString(token.assetNameHex, InvalidDataReason.MULTIASSET_INVALID_ASSET_NAME)
    validate(
        token.assetNameHex.length <= ASSET_NAME_LENGTH_MAX * 2,
        InvalidDataReason.MULTIASSET_INVALID_ASSET_NAME
    )

    const amount = parseTokenAmountFn(token.amount, {}, InvalidDataReason.MULTIASSET_INVALID_TOKEN_AMOUNT)
    return {
        assetNameHex,
        amount,
    }
}

function parseAssetGroup<T>(assetGroup: AssetGroup, parseTokenAmountFn: ParseTokenAmountFn<T>): ParsedAssetGroup<T> {
    validate(isArray(assetGroup.tokens), InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_NOT_ARRAY)
    validate(assetGroup.tokens.length <= TOKENS_IN_GROUP_MAX, InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_TOO_LARGE)
    validate(assetGroup.tokens.length > 0, InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_EMPTY)

    const parsedAssetGroup = {
        policyIdHex: parseHexStringOfLength(assetGroup.policyIdHex, TOKEN_POLICY_LENGTH, InvalidDataReason.MULTIASSET_INVALID_POLICY_NAME),
        tokens: assetGroup.tokens.map(t => parseToken(t, parseTokenAmountFn)),
    }

    const assetNamesHex = parsedAssetGroup.tokens.map(t => t.assetNameHex)
    validate(assetNamesHex.length === new Set(assetNamesHex).size, InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_NOT_UNIQUE)

    const sortedAssetNames = [...assetNamesHex].sort((n1, n2) => {
        if (n1.length === n2.length) return n1.localeCompare(n2)
        else return n1.length - n2.length
    })
    validate(JSON.stringify(assetNamesHex) === JSON.stringify(sortedAssetNames), InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_ORDERING)

    return parsedAssetGroup
}

function parseTokenBundle<T>(tokenBundle: AssetGroup[], emptyTokenBundleAllowed: boolean, parseTokenAmountFn: ParseTokenAmountFn<T>): ParsedAssetGroup<T>[] {
    validate(isArray(tokenBundle), InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_ARRAY)
    validate(tokenBundle.length <= ASSET_GROUPS_MAX, InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_TOO_LARGE)
    validate(emptyTokenBundleAllowed || tokenBundle.length > 0, InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_EMPTY)
    const parsedTokenBundle = tokenBundle.map(ag => parseAssetGroup(ag, parseTokenAmountFn))

    const policyIds = parsedTokenBundle.map(ag => ag.policyIdHex)
    validate(policyIds.length === new Set(policyIds).size, InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_UNIQUE)

    const sortedPolicyIds = [...policyIds].sort()
    validate(JSON.stringify(policyIds) === JSON.stringify(sortedPolicyIds), InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_ORDERING)

    return parsedTokenBundle
}

function parseDatumHash(datumHashHex: string): ParsedDatum | null {
    return {
        type: DatumType.HASH,
        datumHashHex: parseHexStringOfLength(datumHashHex, DATUM_HASH_LENGTH, InvalidDataReason.OUTPUT_INVALID_DATUM_HASH),
    }
}

function parseDatum(output: TxOutput): ParsedDatum | null {
    if (output.format === TxOutputFormat.MAP_BABBAGE) {

        switch (output.datum?.type) {
        case DatumType.HASH:
            return parseDatumHash(output.datum?.datumHashHex)

        case DatumType.INLINE:
            return {
                type: DatumType.INLINE,
                datumHex: parseHexString(output.datum.datumHex, InvalidDataReason.OUTPUT_INVALID_INLINE_DATUM),
            }

        default:
            return null
        }

    } else { // Alonzo
        return output.datumHashHex == null
            ? null
            : parseDatumHash(output.datumHashHex)
    }
}

function parseBoolean(value: unknown, errorMsg: InvalidDataReason): boolean {
    validate(typeof value === 'boolean', errorMsg)
    return value
}

export function parseTransaction(tx: Transaction): ParsedTransaction {
    const network = parseNetwork(tx.network)
    // inputs
    validate(isArray(tx.inputs), InvalidDataReason.INPUTS_NOT_ARRAY)
    const inputs = tx.inputs.map(inp => parseTxInput(inp))

    // outputs
    validate(isArray(tx.outputs), InvalidDataReason.OUTPUTS_NOT_ARRAY)
    const outputs = tx.outputs.map(o => parseTxOutput(o, tx.network))

    // fee
    const fee = parseUint64_str(tx.fee, {max: MAX_LOVELACE_SUPPLY_STR}, InvalidDataReason.FEE_INVALID)

    //  ttl
    const ttl = tx.ttl == null
        ? null
        : parseUint64_str(tx.ttl, {}, InvalidDataReason.TTL_INVALID)

    // certificates
    validate(isArray(tx.certificates ?? []), InvalidDataReason.CERTIFICATES_NOT_ARRAY)
    const certificates = parseCertificates(tx.certificates ?? [])

    // withdrawals
    // we can't check here, but withdrawal map keys (derived from stake credentials) should be in CBOR canonical ordering
    validate(isArray(tx.withdrawals ?? []), InvalidDataReason.WITHDRAWALS_NOT_ARRAY)
    const withdrawals = (tx.withdrawals ?? []).map(w => parseWithdrawal(w))

    // auxiliary data
    const auxiliaryData = tx.auxiliaryData == null
        ? null
        : parseTxAuxiliaryData(network, tx.auxiliaryData)

    // validity start
    const validityIntervalStart = tx.validityIntervalStart == null
        ? null
        : parseUint64_str(tx.validityIntervalStart, {}, InvalidDataReason.VALIDITY_INTERVAL_START_INVALID)

    // mint instructions
    const mint = tx.mint == null
        ? null
        : parseTokenBundle(tx.mint, false, parseInt64_str)

    // script data hash hex
    const scriptDataHashHex = tx.scriptDataHashHex == null
        ? null
        : parseHexStringOfLength(tx.scriptDataHashHex, SCRIPT_DATA_HASH_LENGTH, InvalidDataReason.SCRIPT_DATA_HASH_WRONG_LENGTH)

    // collateral inputs
    validate(isArray(tx.collateralInputs ?? []), InvalidDataReason.COLLATERAL_INPUTS_NOT_ARRAY)
    const collateralInputs = (tx.collateralInputs ?? []).map(inp => parseTxInput(inp))

    // required signers
    validate(isArray(tx.requiredSigners ?? []), InvalidDataReason.REQUIRED_SIGNERS_NOT_ARRAY)
    const requiredSigners = (tx.requiredSigners ?? []).map(rs => parseRequiredSigner(rs))

    // include network ID
    const includeNetworkId = tx.includeNetworkId == null
        ? false
        : parseBoolean(tx.includeNetworkId, InvalidDataReason.NETWORK_ID_INCLUDE_INVALID)

    // collateral output
    const collateralOutput = tx.collateralOutput == null
        ? null
        : parseTxOutput(tx.collateralOutput, tx.network)

    // total collateral
    const totalCollateral = tx.totalCollateral == null
        ? null
        : parseUint64_str(tx.totalCollateral, {max: MAX_LOVELACE_SUPPLY_STR}, InvalidDataReason.TOTAL_COLLATERAL_NOT_VALID)

    // reference inputs
    validate(isArray(tx.referenceInputs ?? []), InvalidDataReason.REFERENCE_INPUTS_NOT_ARRAY)
    const referenceInputs = (tx.referenceInputs ?? []).map(ri => parseTxInput(ri))

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
        mint,
        scriptDataHashHex,
        collateralInputs,
        requiredSigners,
        includeNetworkId,
        collateralOutput,
        totalCollateral,
        referenceInputs,
    }
}

function parseTxInput(input: TxInput): ParsedInput {
    const txHashHex = parseHexStringOfLength(input.txHashHex, TX_HASH_LENGTH, InvalidDataReason.INPUT_INVALID_TX_HASH)
    const outputIndex = parseUint32_t(input.outputIndex, InvalidDataReason.INPUT_INVALID_UTXO_INDEX)
    return {
        txHashHex,
        outputIndex,
        path: input.path != null ? parseBIP32Path(input.path, InvalidDataReason.INPUT_INVALID_PATH) : null,
    }
}

function parseWithdrawal(params: Withdrawal): ParsedWithdrawal {
    return {
        amount: parseUint64_str(params.amount, {max: MAX_LOVELACE_SUPPLY_STR}, InvalidDataReason.WITHDRAWAL_INVALID_AMOUNT),
        stakeCredential: parseStakeCredential(params.stakeCredential, InvalidDataReason.WITHDRAWAL_INVALID_STAKE_CREDENTIAL),
    }
}

function parseTxDestination(
    network: Network,
    destination: TxOutputDestination,
): OutputDestination {
    switch (destination.type) {
    case TxOutputDestinationType.THIRD_PARTY: {
        const params = destination.params
        const addressHex = parseHexString(params.addressHex, InvalidDataReason.OUTPUT_INVALID_ADDRESS)
        validate(params.addressHex.length <= 128 * 2, InvalidDataReason.OUTPUT_INVALID_ADDRESS)
        return {
            type: TxOutputDestinationType.THIRD_PARTY,
            addressHex,
        }
    }
    case TxOutputDestinationType.DEVICE_OWNED: {
        const params = destination.params
        const addressParams = parseAddress(network, params)
        validate(addressParams.spendingDataSource.type == SpendingDataSourceType.PATH, InvalidDataReason.OUTPUT_INVALID_ADDRESS_PARAMS)
        return {
            type: TxOutputDestinationType.DEVICE_OWNED,
            addressParams: addressParams,
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
    const format = output.format === TxOutputFormat.MAP_BABBAGE
        ? TxOutputFormat.MAP_BABBAGE
        : TxOutputFormat.ARRAY_LEGACY

    const amount = parseUint64_str(output.amount, {max: MAX_LOVELACE_SUPPLY_STR}, InvalidDataReason.OUTPUT_INVALID_AMOUNT)

    const tokenBundle = parseTokenBundle(output.tokenBundle ?? [], true, parseUint64_str)

    const destination = parseTxDestination(network, output.destination)

    const datum = parseDatum(output)
    if (datum?.type === DatumType.INLINE) {
        validate(output.format === TxOutputFormat.MAP_BABBAGE, InvalidDataReason.OUTPUT_INCONSISTENT_DATUM)
    }

    const scriptHex = output.format === TxOutputFormat.MAP_BABBAGE && output.scriptHex
        ? parseHexString(output.scriptHex, InvalidDataReason.OUTPUT_INVALID_SCRIPT_HEX)
        : null
    if (scriptHex != null) {
        validate(output.format === TxOutputFormat.MAP_BABBAGE, InvalidDataReason.OUTPUT_INCONSISTENT_REF_SCRIPT)
    }

    return {
        format,
        amount,
        tokenBundle,
        destination,
        datum,
        scriptHex,
    }
}

function parseRequiredSigner(requiredSigner: RequiredSigner): ParsedRequiredSigner {
    switch (requiredSigner.type) {
    case TxRequiredSignerType.PATH:
        return {
            type: RequiredSignerType.PATH,
            path: parseBIP32Path(requiredSigner.path, InvalidDataReason.REQUIRED_SIGNER_INVALID_PATH),
        }
    case TxRequiredSignerType.HASH:
        return {
            type: RequiredSignerType.HASH,
            hashHex: parseHexStringOfLength(requiredSigner.hashHex, KEY_HASH_LENGTH, InvalidDataReason.VKEY_HASH_WRONG_LENGTH),
        }
    default:
        throw new InvalidData(InvalidDataReason.UNKNOWN_REQUIRED_SIGNER_TYPE)
    }
}

export function parseSigningMode(mode: TransactionSigningMode): TransactionSigningMode {
    switch (mode) {
    case TransactionSigningMode.ORDINARY_TRANSACTION:
    case TransactionSigningMode.POOL_REGISTRATION_AS_OWNER:
    case TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR:
    case TransactionSigningMode.MULTISIG_TRANSACTION:
    case TransactionSigningMode.PLUTUS_TRANSACTION:
        return mode
    default:
        throw new InvalidData(InvalidDataReason.SIGN_MODE_UNKNOWN)
    }
}

export function parseSignTransactionRequest(request: SignTransactionRequest): ParsedSigningRequest {
    const tx = parseTransaction(request.tx)
    const signingMode = parseSigningMode(request.signingMode)

    validate(isArray(request.additionalWitnessPaths ?? []), InvalidDataReason.ADDITIONAL_WITNESSES_NOT_ARRAY)
    const additionalWitnessPaths = (request.additionalWitnessPaths ?? []).map(
        path => parseBIP32Path(path, InvalidDataReason.INVALID_PATH)
    )

    // Additional restrictions based on signing mode
    switch (signingMode) {

    case TransactionSigningMode.ORDINARY_TRANSACTION: {
        // pool registrations have separate signing modes
        validate(
            tx.certificates.every(certificate => certificate.type !== CertificateType.STAKE_POOL_REGISTRATION),
            InvalidDataReason.SIGN_MODE_ORDINARY__POOL_REGISTRATION_NOT_ALLOWED,
        )
        // certificate stake credentials given by paths
        validate(
            tx.certificates.every(certificate => {
                switch (certificate.type) {
                case CertificateType.STAKE_REGISTRATION:
                case CertificateType.STAKE_DEREGISTRATION:
                case CertificateType.STAKE_DELEGATION:
                    return certificate.stakeCredential.type === StakeCredentialType.KEY_PATH
                default:
                    return true
                }
            }),
            InvalidDataReason.SIGN_MODE_ORDINARY__CERTIFICATE_STAKE_CREDENTIAL_ONLY_AS_PATH
        )
        // withdrawals as paths
        validate(
            tx.withdrawals.every(withdrawal => withdrawal.stakeCredential.type === StakeCredentialType.KEY_PATH),
            InvalidDataReason.SIGN_MODE_ORDINARY__WITHDRAWAL_ONLY_AS_PATH,
        )
        // cannot have collateralInputs in the tx
        validate(
            tx.collateralInputs.length === 0,
            InvalidDataReason.SIGN_MODE_ORDINARY__COLLATERAL_INPUTS_NOT_ALLOWED
        )

        // cannot have collateral output in the tx
        validate(
            tx.collateralOutput === null,
            InvalidDataReason.SIGN_MODE_ORDINARY__COLLATERAL_OUTPUT_NOT_ALLOWED
        )

        // cannot have total collateral in the tx
        validate(
            tx.totalCollateral === null,
            InvalidDataReason.SIGN_MODE_ORDINARY__TOTAL_COLLATERAL_NOT_ALLOWED
        )

        // cannot have reference input in the tx
        validate(
            tx.referenceInputs.length === 0,
            InvalidDataReason.SIGN_MODE_ORDINARY__REFERENCE_INPUTS_NOT_ALLOWED
        )

        break
    }

    case TransactionSigningMode.MULTISIG_TRANSACTION: {
        // only third-party outputs
        validate(
            tx.outputs.every(output => output.destination.type === TxOutputDestinationType.THIRD_PARTY),
            InvalidDataReason.SIGN_MODE_MULTISIG__DEVICE_OWNED_ADDRESS_NOT_ALLOWED,
        )
        // pool registrations have separate signing modes
        validate(
            tx.certificates.every(certificate => certificate.type !== CertificateType.STAKE_POOL_REGISTRATION),
            InvalidDataReason.SIGN_MODE_MULTISIG__POOL_REGISTRATION_NOT_ALLOWED,
        )
        // pool retirement is not allowed
        validate(
            tx.certificates.every(certificate => certificate.type !== CertificateType.STAKE_POOL_RETIREMENT),
            InvalidDataReason.SIGN_MODE_MULTISIG__POOL_RETIREMENT_NOT_ALLOWED,
        )
        // certificate stake credentials given by scripts
        validate(
            tx.certificates.every(certificate => {
                switch (certificate.type) {
                case CertificateType.STAKE_REGISTRATION:
                case CertificateType.STAKE_DEREGISTRATION:
                case CertificateType.STAKE_DELEGATION:
                    return certificate.stakeCredential.type === StakeCredentialType.SCRIPT_HASH
                default:
                    return true
                }
            }),
            InvalidDataReason.SIGN_MODE_MULTISIG__CERTIFICATE_STAKE_CREDENTIAL_ONLY_AS_SCRIPT,
        )
        // withdrawals as scripts
        validate(
            tx.withdrawals.every(withdrawal => withdrawal.stakeCredential.type === StakeCredentialType.SCRIPT_HASH),
            InvalidDataReason.SIGN_MODE_MULTISIG__WITHDRAWAL_ONLY_AS_SCRIPT,
        )
        // cannot have collateralInputs in the tx
        validate(
            tx.collateralInputs.length === 0,
            InvalidDataReason.SIGN_MODE_MULTISIG__COLLATERAL_INPUTS_NOT_ALLOWED
        )

        // cannot have collateral output in the tx
        validate(
            tx.collateralOutput === null,
            InvalidDataReason.SIGN_MODE_MULTISIG__COLLATERAL_OUTPUT_NOT_ALLOWED
        )

        // cannot have total collateral in the tx
        validate(
            tx.totalCollateral === null,
            InvalidDataReason.SIGN_MODE_MULTISIG__TOTAL_COLLATERAL_NOT_ALLOWED
        )

        // cannot have reference input in the tx
        validate(
            tx.referenceInputs.length === 0,
            InvalidDataReason.SIGN_MODE_MULTISIG__REFERENCE_INPUTS_NOT_ALLOWED
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
        )
        // cannot have change output in the tx, all is paid by the pool operator
        validate(
            tx.outputs.every(out => out.destination.type === TxOutputDestinationType.THIRD_PARTY),
            InvalidDataReason.SIGN_MODE_POOL_OWNER__DEVICE_OWNED_ADDRESS_NOT_ALLOWED
        )

        // no datum in outputs
        validate(
            tx.outputs.every(out => (out.datum == null)),
            InvalidDataReason.SIGN_MODE_POOL_OWNER__DATUM_NOT_ALLOWED
        )
        // no reference script in outputs
        validate(
            tx.outputs.every(out => (out.scriptHex == null)),
            InvalidDataReason.SIGN_MODE_POOL_OWNER__REFERENCE_SCRIPT_NOT_ALLOWED
        )

        // only a single certificate that is pool registration
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
                certificate.pool.poolKey.type === PoolKeyType.THIRD_PARTY,
                InvalidDataReason.SIGN_MODE_POOL_OWNER__THIRD_PARTY_POOL_KEY_REQUIRED
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

        // cannot have mint in the tx
        validate(
            tx.mint == null,
            InvalidDataReason.SIGN_MODE_POOL_OWNER__MINT_NOT_ALLOWED
        )

        // cannot have script data hash in the tx
        validate(
            tx.scriptDataHashHex == null,
            InvalidDataReason.SIGN_MODE_POOL_OWNER__SCRIPT_DATA_HASH_NOT_ALLOWED
        )

        // cannot have collateralInputs in the tx
        validate(
            tx.collateralInputs.length === 0,
            InvalidDataReason.SIGN_MODE_POOL_OWNER__COLLATERAL_INPUTS_NOT_ALLOWED
        )

        // cannot have required signers in the tx
        validate(
            tx.requiredSigners.length === 0,
            InvalidDataReason.SIGN_MODE_POOL_OWNER__REQUIRED_SIGNERS_NOT_ALLOWED
        )

        // cannot have collateral output in the tx
        validate(
            tx.collateralOutput === null,
            InvalidDataReason.SIGN_MODE_POOL_OWNER__COLLATERAL_OUTPUT_NOT_ALLOWED
        )

        // cannot have total collateral in the tx
        validate(
            tx.totalCollateral === null,
            InvalidDataReason.SIGN_MODE_POOL_OWNER__TOTAL_COLLATERAL_NOT_ALLOWED
        )

        // cannot have reference input in the tx
        validate(
            tx.referenceInputs.length === 0,
            InvalidDataReason.SIGN_MODE_POOL_OWNER__REFERENCE_INPUTS_NOT_ALLOWED
        )


        break
    }

    case TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR: {
        // Most of these restrictions are necessary in TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        // and since pool owner signatures will be added to the same tx body, we need the restrictions here, too
        // (we don't want to let operator sign a tx that pool owners will not be able to sign).

        // no datum in outputs
        validate(
            tx.outputs.every(out => (out.datum == null)),
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DATUM_NOT_ALLOWED
        )
        // no reference script in outputs
        validate(
            tx.outputs.every(out => (out.scriptHex == null)),
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REFERENCE_SCRIPT_NOT_ALLOWED
        )

        // only a single certificate that is pool registration
        validate(
            tx.certificates.length === 1,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED
        )
        tx.certificates.forEach(certificate => {
            validate(
                certificate.type === CertificateType.STAKE_POOL_REGISTRATION,
                InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED
            )
            validate(
                certificate.pool.poolKey.type === PoolKeyType.DEVICE_OWNED,
                InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DEVICE_OWNED_POOL_KEY_REQUIRED
            )
            validate(
                certificate.pool.owners.filter(o => o.type === PoolOwnerType.DEVICE_OWNED).length === 0,
                InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DEVICE_OWNED_POOL_OWNER_NOT_ALLOWED
            )
        })

        // cannot have withdrawal in the tx
        validate(
            tx.withdrawals.length === 0,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__WITHDRAWALS_NOT_ALLOWED
        )

        // cannot have mint in the tx
        validate(
            tx.mint == null,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__MINT_NOT_ALLOWED
        )

        // cannot have script data hash in the tx
        validate(
            tx.scriptDataHashHex == null,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SCRIPT_DATA_HASH_NOT_ALLOWED
        )

        // cannot have collateralInputs in the tx
        validate(
            tx.collateralInputs.length === 0,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__COLLATERAL_INPUTS_NOT_ALLOWED
        )

        // cannot have required signers in the tx
        validate(
            tx.requiredSigners.length === 0,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REQUIRED_SIGNERS_NOT_ALLOWED
        )

        // cannot have collateral output in the tx
        validate(
            tx.collateralOutput === null,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__COLLATERAL_OUTPUT_NOT_ALLOWED
        )

        // cannot have total collateral in the tx
        validate(
            tx.totalCollateral === null,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__TOTAL_COLLATERAL_NOT_ALLOWED
        )

        // cannot have reference input in the tx
        validate(
            tx.referenceInputs.length === 0,
            InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REFERENCE_INPUTS_NOT_ALLOWED
        )

        break
    }

    case TransactionSigningMode.PLUTUS_TRANSACTION: {
        // pool registrations not allowed to be combined with Plutus
        validate(
            tx.certificates.every(certificate => certificate.type !== CertificateType.STAKE_POOL_REGISTRATION),
            InvalidDataReason.SIGN_MODE_PLUTUS__POOL_REGISTRATION_NOT_ALLOWED,
        )

        break
    }

    default:
        unreachable(signingMode)
    }

    return { tx, signingMode, additionalWitnessPaths: additionalWitnessPaths }
}

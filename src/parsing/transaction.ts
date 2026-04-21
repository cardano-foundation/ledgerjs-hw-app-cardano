import {InvalidData} from '../errors'
import {InvalidDataReason} from '../errors/invalidDataReason'
import type {
  ParsedSigningRequest,
  ParsedTransaction,
  ParsedTransactionOptions,
  ParsedCertificate,
  ParsedInput,
  ParsedRequiredSigner,
  ParsedVote,
  ParsedVoter,
  ParsedVoterVotes,
  ParsedWithdrawal,
  ValidBIP32Path,
} from '../types/internal'
import {
  SCRIPT_HASH_LENGTH,
  CertificateType,
  KEY_HASH_LENGTH,
  RequiredSignerType,
  SCRIPT_DATA_HASH_LENGTH,
  CredentialType,
  TX_HASH_LENGTH,
} from '../types/internal'
import type {
  SignTransactionRequest,
  Transaction,
  TransactionOptions,
  Certificate,
  RequiredSigner,
  TxInput,
  Vote,
  Voter,
  VoterVotes,
  Withdrawal,
} from '../types/public'
import {
  HARDENED,
  VoterType,
  PoolKeyType,
  PoolOwnerType,
  TransactionSigningMode,
  TxOutputDestinationType,
  TxRequiredSignerType,
  VoteOption,
} from '../types/public'
import {unreachable} from '../utils/assert'
import {
  isArray,
  isObject,
  parseBIP32Path,
  parseHexStringOfLength,
  parseInt64_str,
  parseBoolean,
  parseCredential,
  parseUint32_t,
  parseUint64_str,
  validate,
  parseAnchor,
  parseCoin,
} from '../utils/parse'
import {parseCertificate} from './certificate'
import {MAX_LOVELACE_SUPPLY_STR} from './constants'
import {parseNetwork} from './network'
import {parseTokenBundle, parseTxOutput} from './output'
import {parseTxAuxiliaryData} from './txAuxiliaryData'

function parseTxInput(input: TxInput): ParsedInput {
  validate(isObject(input), InvalidDataReason.INPUT_INVALID_TX_HASH)
  const txHashHex = parseHexStringOfLength(
    input.txHashHex,
    TX_HASH_LENGTH,
    InvalidDataReason.INPUT_INVALID_TX_HASH,
  )
  const outputIndex = parseUint32_t(
    input.outputIndex,
    InvalidDataReason.INPUT_INVALID_UTXO_INDEX,
  )
  return {
    txHashHex,
    outputIndex,
    path:
      input.path != null
        ? parseBIP32Path(input.path, InvalidDataReason.INPUT_INVALID_PATH)
        : null,
  }
}

function parseWithdrawal(params: Withdrawal): ParsedWithdrawal {
  validate(isObject(params), InvalidDataReason.WITHDRAWAL_INVALID_AMOUNT)
  return {
    amount: parseCoin(
      params.amount,
      InvalidDataReason.WITHDRAWAL_INVALID_AMOUNT,
    ),
    stakeCredential: parseCredential(
      params.stakeCredential,
      InvalidDataReason.WITHDRAWAL_INVALID_STAKE_CREDENTIAL,
    ),
  }
}

function parseRequiredSigner(
  requiredSigner: RequiredSigner,
): ParsedRequiredSigner {
  validate(
    isObject(requiredSigner),
    InvalidDataReason.UNKNOWN_REQUIRED_SIGNER_TYPE,
  )
  switch (requiredSigner.type) {
    case TxRequiredSignerType.PATH:
      return {
        type: RequiredSignerType.PATH,
        path: parseBIP32Path(
          requiredSigner.path,
          InvalidDataReason.REQUIRED_SIGNER_INVALID_PATH,
        ),
      }
    case TxRequiredSignerType.HASH:
      return {
        type: RequiredSignerType.HASH,
        hashHex: parseHexStringOfLength(
          requiredSigner.hashHex,
          KEY_HASH_LENGTH,
          InvalidDataReason.VKEY_HASH_WRONG_LENGTH,
        ),
      }
    default:
      throw new InvalidData(InvalidDataReason.UNKNOWN_REQUIRED_SIGNER_TYPE)
  }
}

function parseVoter(voter: Voter): ParsedVoter {
  const errMsg = InvalidDataReason.VOTER_INVALID
  validate(isObject(voter), errMsg)
  switch (voter.type) {
    case VoterType.COMMITTEE_KEY_HASH:
    case VoterType.DREP_KEY_HASH:
    case VoterType.STAKE_POOL_KEY_HASH:
      return {
        type: voter.type,
        keyHashHex: parseHexStringOfLength(
          voter.keyHashHex,
          KEY_HASH_LENGTH,
          errMsg,
        ),
      }
    case VoterType.COMMITTEE_KEY_PATH:
    case VoterType.DREP_KEY_PATH:
    case VoterType.STAKE_POOL_KEY_PATH:
      return {
        type: voter.type,
        keyPath: parseBIP32Path(voter.keyPath, errMsg),
      }

    case VoterType.DREP_SCRIPT_HASH:
    case VoterType.COMMITTEE_SCRIPT_HASH:
      return {
        type: voter.type,
        scriptHashHex: parseHexStringOfLength(
          voter.scriptHashHex,
          SCRIPT_HASH_LENGTH,
          errMsg,
        ),
      }

    default:
      unreachable(voter)
  }
}

function parseVoteOption(voteOption: VoteOption): VoteOption {
  switch (voteOption) {
    case VoteOption.NO:
    case VoteOption.YES:
    case VoteOption.ABSTAIN:
      return voteOption
    default:
      throw new InvalidData(
        InvalidDataReason.VOTING_PROCEDURE_INVALID_VOTE_OPTION,
      )
  }
}

function parseVote(vote: Vote): ParsedVote {
  validate(isObject(vote), InvalidDataReason.GOV_ACTION_ID_INVALID)
  validate(isObject(vote.govActionId), InvalidDataReason.GOV_ACTION_ID_INVALID)
  validate(
    isObject(vote.votingProcedure),
    InvalidDataReason.VOTING_PROCEDURE_INVALID,
  )
  return {
    govActionId: {
      txHashHex: parseHexStringOfLength(
        vote.govActionId.txHashHex,
        TX_HASH_LENGTH,
        InvalidDataReason.GOV_ACTION_ID_INVALID_TX_HASH,
      ),
      govActionIndex: parseUint32_t(
        vote.govActionId.govActionIndex,
        InvalidDataReason.GOV_ACTION_ID_INVALID_INDEX,
      ),
    },
    votingProcedure: {
      vote: parseVoteOption(vote.votingProcedure.vote),
      anchor:
        vote.votingProcedure.anchor == null
          ? null
          : parseAnchor(vote.votingProcedure.anchor),
    },
  }
}

function parseVoterVotes(voterVotes: VoterVotes): ParsedVoterVotes {
  validate(isObject(voterVotes), InvalidDataReason.VOTER_VOTES_NOT_ARRAY)
  validate(isArray(voterVotes.votes), InvalidDataReason.VOTER_VOTES_NOT_ARRAY)
  return {
    voter: parseVoter(voterVotes.voter),
    votes: voterVotes.votes.map((v) => parseVote(v)),
  }
}

function parseCertificates(
  certificates: Array<Certificate>,
): Array<ParsedCertificate> {
  validate(isArray(certificates), InvalidDataReason.CERTIFICATES_NOT_ARRAY)

  const parsed = certificates.map((cert) => parseCertificate(cert))

  return parsed
}

function parseWithdrawals(
  withdrawals: Array<Withdrawal>,
): Array<ParsedWithdrawal> {
  validate(isArray(withdrawals), InvalidDataReason.WITHDRAWALS_NOT_ARRAY)
  return withdrawals.map((withdrawal) => parseWithdrawal(withdrawal))
}

function parseCollateralInputs(inputs: Array<TxInput>): Array<ParsedInput> {
  validate(isArray(inputs), InvalidDataReason.COLLATERAL_INPUTS_NOT_ARRAY)
  return inputs.map((input) => parseTxInput(input))
}

function parseRequiredSigners(
  requiredSigners: Array<RequiredSigner>,
): Array<ParsedRequiredSigner> {
  validate(
    isArray(requiredSigners),
    InvalidDataReason.REQUIRED_SIGNERS_NOT_ARRAY,
  )
  return requiredSigners.map((requiredSigner) =>
    parseRequiredSigner(requiredSigner),
  )
}

function parseReferenceInputs(inputs: Array<TxInput>): Array<ParsedInput> {
  validate(isArray(inputs), InvalidDataReason.REFERENCE_INPUTS_NOT_ARRAY)
  return inputs.map((input) => parseTxInput(input))
}

function parseVotingProcedures(
  votingProcedures: Array<VoterVotes>,
): Array<ParsedVoterVotes> {
  validate(
    isArray(votingProcedures),
    InvalidDataReason.VOTING_PROCEDURES_NOT_ARRAY,
  )
  return votingProcedures.map((voterVotes) => parseVoterVotes(voterVotes))
}

function parseAdditionalWitnessPaths(
  additionalWitnessPaths: Array<number[]>,
): Array<ValidBIP32Path> {
  validate(
    isArray(additionalWitnessPaths),
    InvalidDataReason.ADDITIONAL_WITNESSES_NOT_ARRAY,
  )
  return additionalWitnessPaths.map((path) =>
    parseBIP32Path(path, InvalidDataReason.INVALID_PATH),
  )
}

export function parseSigningMode(
  mode: TransactionSigningMode,
): TransactionSigningMode {
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

function hasPlutusFields(tx: ParsedTransaction): boolean {
  // These fields are Plutus-only in the current device policy, so any one of
  // them is enough to resolve AUTO to PLUTUS immediately.
  return (
    tx.scriptDataHashHex != null ||
    tx.collateralInputs.length > 0 ||
    tx.collateralOutput != null ||
    tx.totalCollateral != null ||
    tx.referenceInputs.length > 0
  )
}

function inferPoolRegistrationSigningMode(
  tx: ParsedTransaction,
): TransactionSigningMode | null {
  // Pool registration owner/operator modes are only possible when a pool
  // registration certificate is present. Otherwise this helper has no signal.
  const poolRegistrationCertificates = tx.certificates.filter(
    (certificate) =>
      certificate.type === CertificateType.STAKE_POOL_REGISTRATION,
  )

  if (poolRegistrationCertificates.length === 0) {
    return null
  }

  if (tx.certificates.length !== 1) {
    // Pool owner/operator modes are only uniquely identifiable when the
    // transaction has exactly one certificate and that certificate is the pool
    // registration itself. Once other certificates are present, AUTO cannot
    // tell whether pool-specific signing should still apply or whether the
    // transaction belongs to a different mode entirely.
    throw new InvalidData(InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE)
  }

  // there is only one certificate, and it is pool registration
  const certificate = poolRegistrationCertificates[0]
  // In the parsed JS model, DEVICE_OWNED owner corresponds to a path owner on
  // the device side, while THIRD_PARTY corresponds to a hash owner.
  const deviceOwnedOwnerCount = certificate.pool.owners.filter(
    (owner) => owner.type === PoolOwnerType.DEVICE_OWNED,
  ).length

  // Owner mode is the unique shape "third-party pool key + exactly one
  // device-owned owner".
  if (
    certificate.pool.poolKey.type === PoolKeyType.THIRD_PARTY &&
    deviceOwnedOwnerCount === 1
  ) {
    return TransactionSigningMode.POOL_REGISTRATION_AS_OWNER
  }

  // Operator mode is the unique shape "device-owned pool key + no
  // device-owned owners".
  if (
    certificate.pool.poolKey.type === PoolKeyType.DEVICE_OWNED &&
    deviceOwnedOwnerCount === 0
  ) {
    return TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR
  }

  // Any other pool-registration shape is not unique enough for AUTO to choose
  // between owner and operator modes.
  throw new InvalidData(InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE)
}

function inferOrdinaryOrMultisigFromTx(
  tx: ParsedTransaction,
):
  | TransactionSigningMode.ORDINARY_TRANSACTION
  | TransactionSigningMode.MULTISIG_TRANSACTION
  | null {
  let mode:
    | TransactionSigningMode.ORDINARY_TRANSACTION
    | TransactionSigningMode.MULTISIG_TRANSACTION
    | null = null

  const commitMode = (
    newMode:
      | TransactionSigningMode.ORDINARY_TRANSACTION
      | TransactionSigningMode.MULTISIG_TRANSACTION,
  ) => {
    // The first ordinary/multisig signal commits the mode.
    if (mode == null) {
      mode = newMode
      return
    }

    // Repeating the same signal is consistent and changes nothing.
    if (mode === newMode) {
      return
    }

    // TODO: When unrestricted transaction signing is added, mixed ordinary and
    // multisig requirements should resolve to that mode instead of failing here.
    // These signals are mutually exclusive across the supported modes, so
    // conflicting signals mean AUTO cannot choose a unique mode.
    throw new InvalidData(InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE)
  }

  const commitCredentialMode = (credentialType: CredentialType) => {
    // For AUTO purposes, KEY_PATH implies ordinary mode and SCRIPT_HASH implies
    // multisig mode. KEY_HASH is not a useful signal here.
    if (credentialType === CredentialType.KEY_PATH) {
      commitMode(TransactionSigningMode.ORDINARY_TRANSACTION)
      return
    }

    if (credentialType === CredentialType.SCRIPT_HASH) {
      commitMode(TransactionSigningMode.MULTISIG_TRANSACTION)
    }
  }

  // Witnessed inputs imply ordinary mode because multisig transactions do not
  // witness spent UTxOs via input.path.
  if (tx.inputs.some((input) => input.path != null)) {
    commitMode(TransactionSigningMode.ORDINARY_TRANSACTION)
  }

  // Device-owned outputs imply ordinary mode because multisig mode requires all
  // outputs to be third-party addresses.
  if (
    tx.outputs.some(
      (output) =>
        output.destination.type === TxOutputDestinationType.DEVICE_OWNED,
    )
  ) {
    commitMode(TransactionSigningMode.ORDINARY_TRANSACTION)
  }

  for (const certificate of tx.certificates) {
    switch (certificate.type) {
      case CertificateType.STAKE_REGISTRATION:
      case CertificateType.STAKE_REGISTRATION_CONWAY:
      case CertificateType.STAKE_DEREGISTRATION:
      case CertificateType.STAKE_DEREGISTRATION_CONWAY:
      case CertificateType.STAKE_DELEGATION:
      case CertificateType.VOTE_DELEGATION:
        // Staking-style credentials are direct ordinary-vs-multisig signals.
        commitCredentialMode(certificate.stakeCredential.type)
        break
      case CertificateType.AUTHORIZE_COMMITTEE_HOT:
      case CertificateType.RESIGN_COMMITTEE_COLD:
        commitCredentialMode(certificate.coldCredential.type)
        break
      case CertificateType.DREP_REGISTRATION:
      case CertificateType.DREP_DEREGISTRATION:
      case CertificateType.DREP_UPDATE:
        commitCredentialMode(certificate.dRepCredential.type)
        break
      case CertificateType.STAKE_POOL_RETIREMENT:
        // Pool retirement is not allowed in multisig mode, so its presence is
        // enough to commit to ordinary mode.
        commitMode(TransactionSigningMode.ORDINARY_TRANSACTION)
        break
      default:
        // Other certificate kinds do not help distinguish ordinary vs multisig.
        break
    }
  }

  // Withdrawals use the same credential distinction as certificates.
  for (const withdrawal of tx.withdrawals) {
    commitCredentialMode(withdrawal.stakeCredential.type)
  }

  for (const voterVotes of tx.votingProcedures) {
    switch (voterVotes.voter.type) {
      case VoterType.COMMITTEE_KEY_PATH:
      case VoterType.DREP_KEY_PATH:
      case VoterType.STAKE_POOL_KEY_PATH:
        // Path-based Conway voters belong to ordinary mode.
        commitMode(TransactionSigningMode.ORDINARY_TRANSACTION)
        break
      case VoterType.COMMITTEE_SCRIPT_HASH:
      case VoterType.DREP_SCRIPT_HASH:
        // Script-hash Conway voters belong to multisig mode.
        commitMode(TransactionSigningMode.MULTISIG_TRANSACTION)
        break
      default:
        // No other voter kind distinguishes ordinary from multisig here.
        break
    }
  }

  return mode
}

function inferOrdinaryOrMultisigFromWitnessPaths(
  additionalWitnessPaths: ValidBIP32Path[],
):
  | TransactionSigningMode.ORDINARY_TRANSACTION
  | TransactionSigningMode.MULTISIG_TRANSACTION
  | null {
  let hasOrdinaryWitnessPath = false
  let hasMultisigWitnessPath = false

  for (const path of additionalWitnessPaths) {
    const purpose = path[0] - HARDENED

    // 1852' paths are ordinary payment/staking paths, 1854' paths are
    // multisig payment/staking paths. Other purposes, such as 1855' mint
    // witnesses, do not distinguish the signing mode and are ignored here.
    if (purpose === 1852) {
      hasOrdinaryWitnessPath = true
    } else if (purpose === 1854) {
      hasMultisigWitnessPath = true
    }
  }

  if (hasOrdinaryWitnessPath && hasMultisigWitnessPath) {
    // TODO: When unrestricted transaction signing is added, mixed ordinary and
    // multisig witness requirements should resolve to that mode instead of
    // failing here.
    throw new InvalidData(InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE)
  }

  if (hasOrdinaryWitnessPath) {
    return TransactionSigningMode.ORDINARY_TRANSACTION
  }

  if (hasMultisigWitnessPath) {
    return TransactionSigningMode.MULTISIG_TRANSACTION
  }

  return null
}

function inferSigningMode(
  tx: ParsedTransaction,
  additionalWitnessPaths: ValidBIP32Path[],
): TransactionSigningMode {
  // Pool registration must win before the generic modes because the dedicated
  // pool modes have stricter transaction-shape requirements than ordinary,
  // multisig, or Plutus.
  const poolRegistrationMode = inferPoolRegistrationSigningMode(tx)
  if (poolRegistrationMode != null) {
    return poolRegistrationMode
  }

  // Plutus signals are unambiguous and do not need witness-path inspection.
  if (hasPlutusFields(tx)) {
    return TransactionSigningMode.PLUTUS_TRANSACTION
  }

  const txMode = inferOrdinaryOrMultisigFromTx(tx)
  const witnessMode = inferOrdinaryOrMultisigFromWitnessPaths(
    additionalWitnessPaths,
  )

  if (txMode != null && witnessMode != null && txMode !== witnessMode) {
    // TODO: When unrestricted transaction signing is added, mixed ordinary and
    // multisig requirements should resolve to that mode instead of failing here.
    // Body-derived and witness-derived signals must agree on a unique
    // ordinary-vs-multisig interpretation.
    throw new InvalidData(InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE)
  }

  // Witness paths are only a fallback for otherwise body-ambiguous ordinary vs
  // multisig transactions.
  const mode = txMode ?? witnessMode
  if (mode != null) {
    return mode
  }

  throw new InvalidData(InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE)
}

export function parseTransaction(tx: Transaction): ParsedTransaction {
  const network = parseNetwork(tx.network)
  // inputs
  validate(isArray(tx.inputs), InvalidDataReason.INPUTS_NOT_ARRAY)
  const inputs = tx.inputs.map((inp) => parseTxInput(inp))

  // outputs
  validate(isArray(tx.outputs), InvalidDataReason.OUTPUTS_NOT_ARRAY)
  const outputs = tx.outputs.map((o) => parseTxOutput(o, tx.network))

  // fee
  const fee = parseCoin(tx.fee, InvalidDataReason.FEE_INVALID)

  //  ttl
  const ttl =
    tx.ttl == null
      ? null
      : parseUint64_str(tx.ttl, {}, InvalidDataReason.TTL_INVALID)

  // certificates
  const certificates = parseCertificates(tx.certificates ?? [])

  // withdrawals
  // we can't check here, but withdrawal map keys (derived from stake credentials) should be in CBOR canonical ordering
  const withdrawals = parseWithdrawals(tx.withdrawals ?? [])

  // auxiliary data
  const auxiliaryData =
    tx.auxiliaryData == null
      ? null
      : parseTxAuxiliaryData(network, tx.auxiliaryData)

  // validity start
  const validityIntervalStart =
    tx.validityIntervalStart == null
      ? null
      : parseUint64_str(
          tx.validityIntervalStart,
          {},
          InvalidDataReason.VALIDITY_INTERVAL_START_INVALID,
        )

  // mint instructions
  const mint =
    tx.mint == null ? null : parseTokenBundle(tx.mint, false, parseInt64_str)

  // script data hash hex
  const scriptDataHashHex =
    tx.scriptDataHashHex == null
      ? null
      : parseHexStringOfLength(
          tx.scriptDataHashHex,
          SCRIPT_DATA_HASH_LENGTH,
          InvalidDataReason.SCRIPT_DATA_HASH_WRONG_LENGTH,
        )

  // collateral inputs
  const collateralInputs = parseCollateralInputs(tx.collateralInputs ?? [])

  // required signers
  const requiredSigners = parseRequiredSigners(tx.requiredSigners ?? [])

  // include network ID
  const includeNetworkId =
    tx.includeNetworkId == null
      ? false
      : parseBoolean(
          tx.includeNetworkId,
          InvalidDataReason.NETWORK_ID_INCLUDE_INVALID,
        )

  // collateral output
  const collateralOutput =
    tx.collateralOutput == null
      ? null
      : parseTxOutput(tx.collateralOutput, tx.network)
  validate(
    collateralOutput?.datum == null,
    InvalidDataReason.COLLATERAL_INPUT_CONTAINS_DATUM,
  )
  validate(
    collateralOutput?.referenceScriptHex == null,
    InvalidDataReason.COLLATERAL_INPUT_CONTAINS_REFERENCE_SCRIPT,
  )

  // total collateral
  const totalCollateral =
    tx.totalCollateral == null
      ? null
      : parseCoin(
          tx.totalCollateral,
          InvalidDataReason.TOTAL_COLLATERAL_NOT_VALID,
        )

  // reference inputs
  const referenceInputs = parseReferenceInputs(tx.referenceInputs ?? [])

  // voting procedures
  const votingProcedures = parseVotingProcedures(tx.votingProcedures ?? [])

  // treasury
  const treasury =
    tx.treasury == null
      ? null
      : parseCoin(tx.treasury, InvalidDataReason.TREASURY_NOT_VALID)

  // donation
  const donation =
    tx.donation == null
      ? null
      : parseUint64_str(
          tx.donation,
          {min: '1', max: MAX_LOVELACE_SUPPLY_STR},
          InvalidDataReason.DONATION_NOT_VALID,
        )

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
    votingProcedures,
    treasury,
    donation,
  }
}

function parseTxOptions(
  options: TransactionOptions | undefined,
): ParsedTransactionOptions {
  return {
    tagCborSets:
      options?.tagCborSets == null
        ? false
        : parseBoolean(
            options.tagCborSets,
            InvalidDataReason.TX_OPTIONS_INVALID_TAG_CBOR_SETS,
          ),
  }
}

export function parseSignTransactionRequest(
  request: SignTransactionRequest,
): ParsedSigningRequest {
  const tx = parseTransaction(request.tx)
  const additionalWitnessPaths = parseAdditionalWitnessPaths(
    request.additionalWitnessPaths ?? [],
  )
  const signingMode =
    request.signingMode != null
      ? parseSigningMode(request.signingMode)
      : inferSigningMode(tx, additionalWitnessPaths)
  const options = parseTxOptions(request.options)

  // Additional restrictions based on signing mode
  switch (signingMode) {
    case TransactionSigningMode.ORDINARY_TRANSACTION: {
      // pool registrations have separate signing modes
      validate(
        tx.certificates.every(
          (certificate) =>
            certificate.type !== CertificateType.STAKE_POOL_REGISTRATION,
        ),
        InvalidDataReason.SIGN_MODE_ORDINARY__POOL_REGISTRATION_NOT_ALLOWED,
      )
      // certificate credentials given by paths
      validate(
        tx.certificates.every((certificate) => {
          switch (certificate.type) {
            case CertificateType.STAKE_REGISTRATION:
            case CertificateType.STAKE_REGISTRATION_CONWAY:
            case CertificateType.STAKE_DEREGISTRATION:
            case CertificateType.STAKE_DEREGISTRATION_CONWAY:
            case CertificateType.STAKE_DELEGATION:
            case CertificateType.VOTE_DELEGATION:
              return (
                certificate.stakeCredential.type === CredentialType.KEY_PATH
              )
            default:
              return true
          }
        }),
        InvalidDataReason.SIGN_MODE_ORDINARY__CERTIFICATE_STAKE_CREDENTIAL_ONLY_AS_PATH,
      )
      validate(
        tx.certificates.every((certificate) => {
          switch (certificate.type) {
            case CertificateType.AUTHORIZE_COMMITTEE_HOT:
            case CertificateType.RESIGN_COMMITTEE_COLD:
              return certificate.coldCredential.type === CredentialType.KEY_PATH
            default:
              return true
          }
        }),
        InvalidDataReason.SIGN_MODE_ORDINARY__CERTIFICATE_COMMITTEE_COLD_CREDENTIAL_ONLY_AS_PATH,
      )
      validate(
        tx.certificates.every((certificate) => {
          switch (certificate.type) {
            case CertificateType.DREP_REGISTRATION:
            case CertificateType.DREP_DEREGISTRATION:
            case CertificateType.DREP_UPDATE:
              return certificate.dRepCredential.type === CredentialType.KEY_PATH
            default:
              return true
          }
        }),
        InvalidDataReason.SIGN_MODE_ORDINARY__CERTIFICATE_DREP_CREDENTIAL_ONLY_AS_PATH,
      )

      // withdrawals as paths
      validate(
        tx.withdrawals.every(
          (withdrawal) =>
            withdrawal.stakeCredential.type === CredentialType.KEY_PATH,
        ),
        InvalidDataReason.SIGN_MODE_ORDINARY__WITHDRAWAL_ONLY_AS_PATH,
      )
      // cannot have collateralInputs in the tx
      validate(
        tx.collateralInputs.length === 0,
        InvalidDataReason.SIGN_MODE_ORDINARY__COLLATERAL_INPUTS_NOT_ALLOWED,
      )

      // cannot have collateral output in the tx
      validate(
        tx.collateralOutput == null,
        InvalidDataReason.SIGN_MODE_ORDINARY__COLLATERAL_OUTPUT_NOT_ALLOWED,
      )

      // cannot have total collateral in the tx
      validate(
        tx.totalCollateral == null,
        InvalidDataReason.SIGN_MODE_ORDINARY__TOTAL_COLLATERAL_NOT_ALLOWED,
      )

      // cannot have reference input in the tx
      validate(
        tx.referenceInputs.length === 0,
        InvalidDataReason.SIGN_MODE_ORDINARY__REFERENCE_INPUTS_NOT_ALLOWED,
      )

      // voting procedure voter must be given by path
      validate(
        tx.votingProcedures.every((voterVotes) => {
          switch (voterVotes.voter.type) {
            case VoterType.COMMITTEE_KEY_PATH:
            case VoterType.DREP_KEY_PATH:
            case VoterType.STAKE_POOL_KEY_PATH:
              return true
            default:
              return false
          }
        }),
        InvalidDataReason.SIGN_MODE_ORDINARY__VOTER_ONLY_AS_PATH,
      )

      break
    }

    case TransactionSigningMode.MULTISIG_TRANSACTION: {
      // only third-party outputs
      validate(
        tx.outputs.every(
          (output) =>
            output.destination.type === TxOutputDestinationType.THIRD_PARTY,
        ),
        InvalidDataReason.SIGN_MODE_MULTISIG__DEVICE_OWNED_ADDRESS_NOT_ALLOWED,
      )
      // pool registrations have separate signing modes
      validate(
        tx.certificates.every(
          (certificate) =>
            certificate.type !== CertificateType.STAKE_POOL_REGISTRATION,
        ),
        InvalidDataReason.SIGN_MODE_MULTISIG__POOL_REGISTRATION_NOT_ALLOWED,
      )
      // pool retirement is not allowed
      validate(
        tx.certificates.every(
          (certificate) =>
            certificate.type !== CertificateType.STAKE_POOL_RETIREMENT,
        ),
        InvalidDataReason.SIGN_MODE_MULTISIG__POOL_RETIREMENT_NOT_ALLOWED,
      )
      // certificate credentials given by scripts
      validate(
        tx.certificates.every((certificate) => {
          switch (certificate.type) {
            case CertificateType.STAKE_REGISTRATION:
            case CertificateType.STAKE_REGISTRATION_CONWAY:
            case CertificateType.STAKE_DEREGISTRATION:
            case CertificateType.STAKE_DEREGISTRATION_CONWAY:
            case CertificateType.STAKE_DELEGATION:
            case CertificateType.VOTE_DELEGATION:
              return (
                certificate.stakeCredential.type === CredentialType.SCRIPT_HASH
              )
            case CertificateType.AUTHORIZE_COMMITTEE_HOT:
            case CertificateType.RESIGN_COMMITTEE_COLD:
              return (
                certificate.coldCredential.type === CredentialType.SCRIPT_HASH
              )
            case CertificateType.DREP_REGISTRATION:
            case CertificateType.DREP_DEREGISTRATION:
            case CertificateType.DREP_UPDATE:
              return (
                certificate.dRepCredential.type === CredentialType.SCRIPT_HASH
              )
            default:
              return true
          }
        }),
        InvalidDataReason.SIGN_MODE_MULTISIG__CERTIFICATE_CREDENTIAL_ONLY_AS_SCRIPT,
      )
      // withdrawals as scripts
      validate(
        tx.withdrawals.every(
          (withdrawal) =>
            withdrawal.stakeCredential.type === CredentialType.SCRIPT_HASH,
        ),
        InvalidDataReason.SIGN_MODE_MULTISIG__WITHDRAWAL_ONLY_AS_SCRIPT,
      )
      // cannot have collateralInputs in the tx
      validate(
        tx.collateralInputs.length === 0,
        InvalidDataReason.SIGN_MODE_MULTISIG__COLLATERAL_INPUTS_NOT_ALLOWED,
      )

      // cannot have collateral output in the tx
      validate(
        tx.collateralOutput == null,
        InvalidDataReason.SIGN_MODE_MULTISIG__COLLATERAL_OUTPUT_NOT_ALLOWED,
      )

      // cannot have total collateral in the tx
      validate(
        tx.totalCollateral == null,
        InvalidDataReason.SIGN_MODE_MULTISIG__TOTAL_COLLATERAL_NOT_ALLOWED,
      )

      // cannot have reference inputs in the tx
      validate(
        tx.referenceInputs.length === 0,
        InvalidDataReason.SIGN_MODE_MULTISIG__REFERENCE_INPUTS_NOT_ALLOWED,
      )

      // voting procedure voter must be given by script hash
      validate(
        tx.votingProcedures.every((voterVotes) => {
          switch (voterVotes.voter.type) {
            case VoterType.COMMITTEE_SCRIPT_HASH:
            case VoterType.DREP_SCRIPT_HASH:
              return true
            default:
              return false
          }
        }),
        InvalidDataReason.SIGN_MODE_MULTISIG__VOTER_ONLY_AS_SCRIPT,
      )

      break
    }

    case TransactionSigningMode.POOL_REGISTRATION_AS_OWNER: {
      // all these restrictions are due to the fact that pool owner signature
      // *might* accidentally/maliciously sign another part of tx
      // but we are not showing these parts to the user

      // input should not be given with a path
      // the path is not used, but we check just to avoid potential confusion of developers using this
      validate(
        tx.inputs.every((inp) => inp.path == null),
        InvalidDataReason.SIGN_MODE_POOL_OWNER__INPUT_WITH_PATH_NOT_ALLOWED,
      )
      // cannot have change output in the tx, all is paid by the pool operator
      validate(
        tx.outputs.every(
          (out) => out.destination.type === TxOutputDestinationType.THIRD_PARTY,
        ),
        InvalidDataReason.SIGN_MODE_POOL_OWNER__DEVICE_OWNED_ADDRESS_NOT_ALLOWED,
      )

      // no datum in outputs
      validate(
        tx.outputs.every((out) => out.datum == null),
        InvalidDataReason.SIGN_MODE_POOL_OWNER__DATUM_NOT_ALLOWED,
      )
      // no reference script in outputs
      validate(
        tx.outputs.every((out) => out.referenceScriptHex == null),
        InvalidDataReason.SIGN_MODE_POOL_OWNER__REFERENCE_SCRIPT_NOT_ALLOWED,
      )

      // only a single certificate that is pool registration
      validate(
        tx.certificates.length === 1,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
      )
      tx.certificates.forEach((certificate) => {
        validate(
          certificate.type === CertificateType.STAKE_POOL_REGISTRATION,
          InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
        )
        validate(
          certificate.pool.poolKey.type === PoolKeyType.THIRD_PARTY,
          InvalidDataReason.SIGN_MODE_POOL_OWNER__THIRD_PARTY_POOL_KEY_REQUIRED,
        )
        validate(
          certificate.pool.owners.filter(
            (o) => o.type === PoolOwnerType.DEVICE_OWNED,
          ).length === 1,
          InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_DEVICE_OWNER_REQUIRED,
        )
      })

      // cannot have withdrawal in the tx
      validate(
        tx.withdrawals.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__WITHDRAWALS_NOT_ALLOWED,
      )

      // cannot have mint in the tx
      validate(
        tx.mint == null,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__MINT_NOT_ALLOWED,
      )

      // cannot have script data hash in the tx
      validate(
        tx.scriptDataHashHex == null,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__SCRIPT_DATA_HASH_NOT_ALLOWED,
      )

      // cannot have collateralInputs in the tx
      validate(
        tx.collateralInputs.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__COLLATERAL_INPUTS_NOT_ALLOWED,
      )

      // cannot have required signers in the tx
      validate(
        tx.requiredSigners.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__REQUIRED_SIGNERS_NOT_ALLOWED,
      )

      // cannot have collateral output in the tx
      validate(
        tx.collateralOutput == null,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__COLLATERAL_OUTPUT_NOT_ALLOWED,
      )

      // cannot have total collateral in the tx
      validate(
        tx.totalCollateral == null,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__TOTAL_COLLATERAL_NOT_ALLOWED,
      )

      // cannot have reference inputs in the tx
      validate(
        tx.referenceInputs.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__REFERENCE_INPUTS_NOT_ALLOWED,
      )

      // cannot have voting procedures in the tx
      validate(
        tx.votingProcedures.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__VOTING_PROCEDURES_NOT_ALLOWED,
      )

      // cannot have treasury in the tx
      validate(
        tx.treasury == null,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__TREASURY_NOT_ALLOWED,
      )

      // cannot have donation in the tx
      validate(
        tx.donation == null,
        InvalidDataReason.SIGN_MODE_POOL_OWNER__DONATION_NOT_ALLOWED,
      )

      break
    }

    case TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR: {
      // Most of these restrictions are necessary in TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
      // and since pool owner signatures will be added to the same tx body, we need the restrictions here, too
      // (we don't want to let operator sign a tx that pool owners will not be able to sign).

      // no datum in outputs
      validate(
        tx.outputs.every((out) => out.datum == null),
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DATUM_NOT_ALLOWED,
      )
      // no reference script in outputs
      validate(
        tx.outputs.every((out) => out.referenceScriptHex == null),
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REFERENCE_SCRIPT_NOT_ALLOWED,
      )

      // only a single certificate that is pool registration
      validate(
        tx.certificates.length === 1,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
      )
      tx.certificates.forEach((certificate) => {
        validate(
          certificate.type === CertificateType.STAKE_POOL_REGISTRATION,
          InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
        )
        validate(
          certificate.pool.poolKey.type === PoolKeyType.DEVICE_OWNED,
          InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DEVICE_OWNED_POOL_KEY_REQUIRED,
        )
        validate(
          certificate.pool.owners.filter(
            (o) => o.type === PoolOwnerType.DEVICE_OWNED,
          ).length === 0,
          InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DEVICE_OWNED_POOL_OWNER_NOT_ALLOWED,
        )
      })

      // cannot have withdrawal in the tx
      validate(
        tx.withdrawals.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__WITHDRAWALS_NOT_ALLOWED,
      )

      // cannot have mint in the tx
      validate(
        tx.mint == null,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__MINT_NOT_ALLOWED,
      )

      // cannot have script data hash in the tx
      validate(
        tx.scriptDataHashHex == null,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SCRIPT_DATA_HASH_NOT_ALLOWED,
      )

      // cannot have collateralInputs in the tx
      validate(
        tx.collateralInputs.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__COLLATERAL_INPUTS_NOT_ALLOWED,
      )

      // cannot have required signers in the tx
      validate(
        tx.requiredSigners.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REQUIRED_SIGNERS_NOT_ALLOWED,
      )

      // cannot have collateral output in the tx
      validate(
        tx.collateralOutput == null,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__COLLATERAL_OUTPUT_NOT_ALLOWED,
      )

      // cannot have total collateral in the tx
      validate(
        tx.totalCollateral == null,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__TOTAL_COLLATERAL_NOT_ALLOWED,
      )

      // cannot have reference inputs in the tx
      validate(
        tx.referenceInputs.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REFERENCE_INPUTS_NOT_ALLOWED,
      )

      // cannot have voting procedures in the tx
      validate(
        tx.votingProcedures.length === 0,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__VOTING_PROCEDURES_NOT_ALLOWED,
      )

      // cannot have treasury in the tx
      validate(
        tx.treasury == null,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__TREASURY_NOT_ALLOWED,
      )

      // cannot have donation in the tx
      validate(
        tx.donation == null,
        InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DONATION_NOT_ALLOWED,
      )

      break
    }

    case TransactionSigningMode.PLUTUS_TRANSACTION: {
      // pool registrations not allowed to be combined with Plutus
      validate(
        tx.certificates.every(
          (certificate) =>
            certificate.type !== CertificateType.STAKE_POOL_REGISTRATION,
        ),
        InvalidDataReason.SIGN_MODE_PLUTUS__POOL_REGISTRATION_NOT_ALLOWED,
      )

      break
    }

    default:
      unreachable(signingMode)
  }

  return {tx, signingMode, additionalWitnessPaths, options}
}

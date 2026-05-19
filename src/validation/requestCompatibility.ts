import {DeviceVersionUnsupported} from '../errors'
import type {
  ParsedAddressParams,
  ParsedCVote,
  ParsedMessageData,
  ParsedNativeScript,
  ParsedOperationalCertificate,
  ParsedOutput,
  ParsedSigningRequest,
  ParsedTransaction,
  ValidBIP32Path,
  Version,
} from '../types/internal'
import {CredentialType} from '../types/internal'
import {
  AddressType,
  CertificateType,
  CIP36VoteRegistrationFormat,
  HARDENED,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
  TxOutputFormat,
} from '../types/public'
import {getVersionString} from '../utils'
import {
  ensureLedgerAppVersionCompatible,
  getCompatibility,
  isV7App,
} from './deviceCapabilities'

const V7_POOL_REGISTRATION_OWNERS_MAX = 1000
const V7_POOL_REGISTRATION_RELAYS_MAX = 1000

function unsupported(version: Version, message: string): never {
  throw new DeviceVersionUnsupported(
    `${message} not supported by Ledger app version ${getVersionString(
      version,
    )}.`,
  )
}

export function ensureAddressDerivationSupported(
  version: Version,
  addressParams: ParsedAddressParams,
): void {
  ensureLedgerAppVersionCompatible(version)

  if (
    addressParams.type === AddressType.BYRON &&
    !getCompatibility(version).supportsByronAddressDerivation
  ) {
    unsupported(version, 'Byron address parameters')
  }
}

export function ensureNativeScriptHashDerivationSupported(
  version: Version,
  _script: ParsedNativeScript,
): void {
  ensureLedgerAppVersionCompatible(version)

  if (!getCompatibility(version).supportsNativeScriptHashDerivation) {
    unsupported(version, 'Native script hash derivation')
  }
}

export function ensureOperationalCertificateSigningSupported(
  version: Version,
  _operationalCertificate: ParsedOperationalCertificate,
): void {
  ensureLedgerAppVersionCompatible(version)

  if (!getCompatibility(version).supportsPoolRegistrationAsOperator) {
    unsupported(version, 'Operational certificate signing')
  }
}

export function ensureCVoteSigningSupported(
  version: Version,
  _cVote: ParsedCVote,
): void {
  ensureLedgerAppVersionCompatible(version)

  if (!getCompatibility(version).supportsCIP36Vote) {
    unsupported(version, 'CIP36 voting')
  }
}

export function ensureExtendedPublicKeysSupported(
  version: Version,
  paths: Array<ValidBIP32Path>,
): void {
  ensureLedgerAppVersionCompatible(version)

  const voteKeysPresent = paths.some((path) => path[0] === 1694 + HARDENED)
  if (voteKeysPresent && !getCompatibility(version).supportsCIP36Vote) {
    unsupported(version, 'CIP36 vote keys')
  }
}

export function ensureMessageSigningSupported(
  version: Version,
  _msgData: ParsedMessageData,
): void {
  ensureLedgerAppVersionCompatible(version)

  if (!getCompatibility(version).supportsMessageSigning) {
    unsupported(version, 'CIP-8 message signing')
  }
}

function hasCredentialInCertificatesPreConway(
  tx: ParsedTransaction,
  credentialType: CredentialType,
) {
  return tx.certificates.some(
    (c) =>
      (c.type === CertificateType.STAKE_DELEGATION ||
        c.type === CertificateType.STAKE_REGISTRATION ||
        c.type === CertificateType.STAKE_DEREGISTRATION) &&
      c.stakeCredential.type === credentialType,
  )
}

function hasCredentialInWithdrawals(
  tx: ParsedTransaction,
  stakeCredentialType: CredentialType,
) {
  return tx.withdrawals.some(
    (w) => w.stakeCredential.type === stakeCredentialType,
  )
}

function hasScriptHashInAddressParams(tx: ParsedTransaction) {
  const scriptAddressTypes = [
    AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
    AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
    AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT,
    AddressType.ENTERPRISE_SCRIPT,
    AddressType.POINTER_SCRIPT,
    AddressType.REWARD_SCRIPT,
  ]
  return tx.outputs.some(
    (o) =>
      o.destination.type === TxOutputDestinationType.DEVICE_OWNED &&
      scriptAddressTypes.includes(o.destination.addressParams.type),
  )
}

export function ensureSignTxRequestSupported(
  version: Version,
  request: ParsedSigningRequest,
): void {
  ensureLedgerAppVersionCompatible(version)
  const compatibility = getCompatibility(version)

  if (
    request.signingMode === TransactionSigningMode.POOL_REGISTRATION_AS_OWNER &&
    !compatibility.supportsPoolRegistrationAsOwner
  ) {
    unsupported(version, 'Pool registration as owner')
  }

  if (
    request.signingMode ===
      TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR &&
    !compatibility.supportsPoolRegistrationAsOperator
  ) {
    unsupported(version, 'Pool registration as operator')
  }

  if (
    request.signingMode === TransactionSigningMode.MULTISIG_TRANSACTION &&
    !compatibility.supportsMultisigTransaction
  ) {
    unsupported(version, 'Multisig transactions')
  }

  if (
    request.signingMode === TransactionSigningMode.PLUTUS_TRANSACTION &&
    !compatibility.supportsAlonzo
  ) {
    unsupported(version, 'Plutus transactions')
  }

  if (
    request.signingMode === TransactionSigningMode.UNRESTRICTED_TRANSACTION &&
    !compatibility.supportsUnrestrictedTransaction
  ) {
    unsupported(version, 'Unrestricted transactions')
  }

  const isOutputByron = (o: ParsedOutput | null) =>
    o != null &&
    o.destination.type === TxOutputDestinationType.DEVICE_OWNED &&
    o.destination.addressParams.type === AddressType.BYRON

  const hasByronAddressParam =
    request.tx.outputs.some(isOutputByron) ||
    isOutputByron(request.tx.collateralOutput)
  if (hasByronAddressParam && !compatibility.supportsByronAddressDerivation) {
    unsupported(version, 'Byron address parameters')
  }

  if (
    hasScriptHashInAddressParams(request.tx) &&
    !compatibility.supportsMultisigTransaction
  ) {
    unsupported(version, 'Script hash in address parameters in output')
  }

  const hasDatumInOutputs = request.tx.outputs.some((o) => o.datum != null)
  if (hasDatumInOutputs && !compatibility.supportsAlonzo) {
    unsupported(version, 'Datum in output')
  }

  const hasMapFormatInOutputs = request.tx.outputs.some(
    (o) => o.format === TxOutputFormat.MAP_BABBAGE,
  )
  if (hasMapFormatInOutputs && !compatibility.supportsBabbage) {
    unsupported(version, 'Outputs with map format')
  }

  if (request.tx.ttl === '0' && !compatibility.supportsZeroTtl) {
    unsupported(version, 'Zero TTL')
  }

  const hasPoolRegistration = request.tx.certificates.some(
    (c) => c.type === CertificateType.STAKE_POOL_REGISTRATION,
  )
  const supportsPoolRegistration =
    compatibility.supportsPoolRegistrationAsOwner ||
    compatibility.supportsPoolRegistrationAsOperator
  if (hasPoolRegistration && !supportsPoolRegistration) {
    unsupported(version, 'Pool registration certificate')
  }

  if (isV7App(version)) {
    const hasTooManyPoolOwners = request.tx.certificates.some(
      (c) =>
        c.type === CertificateType.STAKE_POOL_REGISTRATION &&
        c.pool.owners.length > V7_POOL_REGISTRATION_OWNERS_MAX,
    )
    if (hasTooManyPoolOwners) {
      unsupported(
        version,
        `More than ${V7_POOL_REGISTRATION_OWNERS_MAX} pool registration owners`,
      )
    }

    const hasTooManyPoolRelays = request.tx.certificates.some(
      (c) =>
        c.type === CertificateType.STAKE_POOL_REGISTRATION &&
        c.pool.relays.length > V7_POOL_REGISTRATION_RELAYS_MAX,
    )
    if (hasTooManyPoolRelays) {
      unsupported(
        version,
        `More than ${V7_POOL_REGISTRATION_RELAYS_MAX} pool registration relays`,
      )
    }
  }

  const hasPoolRetirement = request.tx.certificates.some(
    (c) => c.type === CertificateType.STAKE_POOL_RETIREMENT,
  )
  if (hasPoolRetirement && !compatibility.supportsPoolRetirement) {
    unsupported(version, 'Pool retirement certificate')
  }

  const conwayCertificateTypes = [
    CertificateType.STAKE_REGISTRATION_CONWAY,
    CertificateType.STAKE_DEREGISTRATION_CONWAY,
    CertificateType.VOTE_DELEGATION,
    CertificateType.AUTHORIZE_COMMITTEE_HOT,
    CertificateType.RESIGN_COMMITTEE_COLD,
    CertificateType.DREP_REGISTRATION,
    CertificateType.DREP_DEREGISTRATION,
    CertificateType.DREP_UPDATE,
  ]
  const hasConwayCertificates = request.tx.certificates.some((c) =>
    conwayCertificateTypes.includes(c.type),
  )
  if (hasConwayCertificates && !compatibility.supportsConway) {
    unsupported(version, 'Conway era certificates')
  }

  if (
    hasCredentialInCertificatesPreConway(
      request.tx,
      CredentialType.SCRIPT_HASH,
    ) &&
    !compatibility.supportsMultisigTransaction
  ) {
    unsupported(version, 'Script hash in certificate stake credential')
  }

  if (
    hasCredentialInCertificatesPreConway(request.tx, CredentialType.KEY_HASH) &&
    !compatibility.supportsAlonzo
  ) {
    unsupported(version, 'Key hash in certificate stake credential')
  }

  if (
    hasCredentialInWithdrawals(request.tx, CredentialType.SCRIPT_HASH) &&
    !compatibility.supportsMultisigTransaction
  ) {
    unsupported(version, 'Script hash in withdrawal')
  }

  if (
    hasCredentialInWithdrawals(request.tx, CredentialType.KEY_HASH) &&
    !compatibility.supportsAlonzo
  ) {
    unsupported(version, 'Key hash in withdrawal')
  }

  if (request.tx.mint !== null && !compatibility.supportsMint) {
    unsupported(version, 'Mint')
  }

  if (
    request.tx.validityIntervalStart !== null &&
    !compatibility.supportsMary
  ) {
    unsupported(version, 'Validity interval start')
  }

  if (request.tx.scriptDataHashHex !== null && !compatibility.supportsAlonzo) {
    unsupported(version, 'Script data hash')
  }

  if (request.tx.collateralInputs.length > 0 && !compatibility.supportsAlonzo) {
    unsupported(version, 'Collateral inputs')
  }

  if (request.tx.requiredSigners.length > 0) {
    if (!compatibility.supportsAlonzo) {
      unsupported(version, 'Required signers')
    }
    if (!compatibility.supportsReqSignersInOrdinaryTx) {
      switch (request.signingMode) {
        case TransactionSigningMode.ORDINARY_TRANSACTION:
          return unsupported(
            version,
            'Required signers in ordinary transaction',
          )
        case TransactionSigningMode.MULTISIG_TRANSACTION:
          return unsupported(
            version,
            'Required signers in multisig transaction',
          )
        default:
          break
      }
    }
  }

  if (request.tx.includeNetworkId && !compatibility.supportsAlonzo) {
    unsupported(version, 'Network id in tx body')
  }

  if (request.tx.collateralOutput !== null && !compatibility.supportsBabbage) {
    unsupported(version, 'Collateral output')
  }

  if (request.tx.totalCollateral !== null && !compatibility.supportsBabbage) {
    unsupported(version, 'Total collateral')
  }

  if (request.tx.referenceInputs.length > 0 && !compatibility.supportsBabbage) {
    unsupported(version, 'Reference inputs')
  }

  if (request.tx.votingProcedures.length > 0) {
    if (!compatibility.supportsConway) {
      unsupported(version, 'Voting procedures')
    }
    if (
      request.tx.votingProcedures.length > 1 &&
      !compatibility.supportsMultipleVoters
    ) {
      unsupported(version, 'Multiple voters in voting procedures')
    }
    if (
      request.tx.votingProcedures.some(
        (voterVotes) => voterVotes.votes.length > 1,
      ) &&
      !compatibility.supportsMultipleVotesPerVoter
    ) {
      unsupported(version, 'Multiple votes per voter in voting procedures')
    }
  }

  if (request.tx.treasury !== null && !compatibility.supportsConway) {
    unsupported(version, 'Treasury amount')
  }

  if (request.tx.donation !== null && !compatibility.supportsConway) {
    unsupported(version, 'Treasury donation')
  }

  const auxiliaryData = request.tx.auxiliaryData
  const hasCIP15Registration =
    auxiliaryData?.type === TxAuxiliaryDataType.CIP36_REGISTRATION &&
    auxiliaryData.params.format === CIP36VoteRegistrationFormat.CIP_15
  if (hasCIP15Registration && !compatibility.supportsCatalystRegistration) {
    unsupported(version, 'Catalyst registration')
  }

  const hasCIP36Registration =
    auxiliaryData?.type === TxAuxiliaryDataType.CIP36_REGISTRATION &&
    auxiliaryData.params.format === CIP36VoteRegistrationFormat.CIP_36
  if (hasCIP36Registration && !compatibility.supportsCIP36) {
    unsupported(version, 'CIP36 registration')
  }

  const hasKeyPath =
    auxiliaryData?.type === TxAuxiliaryDataType.CIP36_REGISTRATION &&
    auxiliaryData.params.votePublicKeyPath != null
  if (hasKeyPath && !compatibility.supportsCIP36Vote) {
    unsupported(version, 'Vote key derivation path in CIP15/CIP36 registration')
  }

  const thirdPartyPayment =
    auxiliaryData?.type === TxAuxiliaryDataType.CIP36_REGISTRATION &&
    auxiliaryData.params.paymentDestination.type !==
      TxOutputDestinationType.DEVICE_OWNED
  if (thirdPartyPayment && !compatibility.supportsCIP36) {
    unsupported(version, 'CIP36 payment addresses not owned by the device')
  }
}

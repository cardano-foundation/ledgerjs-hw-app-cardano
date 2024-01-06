import type {
  ParsedTransaction,
  Uint8_t,
  Uint32_t,
  Version,
  ParsedTransactionOptions,
  Uint64_str,
} from '../../types/internal'
import {TransactionSigningMode} from '../../types/internal'
import {assert} from '../../utils/assert'
import {
  serializeOptionFlag,
  uint8_to_buf,
  uint32_to_buf,
  uint64_to_buf,
} from '../../utils/serialize'
import {getCompatibility} from '../getVersion'

const _serializeSigningMode = (mode: TransactionSigningMode): Buffer => {
  const value = {
    [TransactionSigningMode.ORDINARY_TRANSACTION]: 3 as Uint8_t,
    [TransactionSigningMode.POOL_REGISTRATION_AS_OWNER]: 4 as Uint8_t,
    [TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR]: 5 as Uint8_t,
    [TransactionSigningMode.MULTISIG_TRANSACTION]: 6 as Uint8_t,
    [TransactionSigningMode.PLUTUS_TRANSACTION]: 7 as Uint8_t,
  }[mode]

  assert(value !== undefined, 'Invalid signing mode')

  return uint8_to_buf(value)
}

const enum OptionFlags {
  TAG_CBOR_SETS = 1,
}

function serializeTxOptions(options: ParsedTransactionOptions): Buffer {
  // we reserve 64 bits for options in the APDU for future use
  // the code below would need to be changed if a typescript number
  // was not enough to fit all the future flags
  let optionFlags = 0
  if (options.tagCborSets) {
    optionFlags += OptionFlags.TAG_CBOR_SETS
  }
  return uint64_to_buf(optionFlags.toString() as Uint64_str)
}

export function serializeTxInit(
  tx: ParsedTransaction,
  signingMode: TransactionSigningMode,
  numWitnesses: number,
  options: ParsedTransactionOptions,
  version: Version,
) {
  const optionsBuffer = getCompatibility(version).supportsConway
    ? serializeTxOptions(options)
    : Buffer.from([])

  const appAwareOfMint =
    getCompatibility(version).supportsMint || version.flags.isAppXS
  // even if XS app doesn't support minting, it does expect the flag value
  // (we want to keep the APDU serialization uniform)
  const mintBuffer = appAwareOfMint
    ? serializeOptionFlag(tx.mint != null)
    : Buffer.from([])

  const scriptDataHashBuffer = getCompatibility(version).supportsAlonzo
    ? serializeOptionFlag(tx.scriptDataHashHex != null)
    : Buffer.from([])
  const collateralInputsBuffer = getCompatibility(version).supportsAlonzo
    ? uint32_to_buf(tx.collateralInputs.length as Uint32_t)
    : Buffer.from([])
  const requiredSignersBuffer = getCompatibility(version).supportsAlonzo
    ? uint32_to_buf(tx.requiredSigners.length as Uint32_t)
    : Buffer.from([])
  const includeNetworkIdBuffer = getCompatibility(version).supportsAlonzo
    ? serializeOptionFlag(tx.includeNetworkId)
    : Buffer.from([])
  const includeCollateralOutputBuffer = getCompatibility(version)
    .supportsBabbage
    ? serializeOptionFlag(tx.collateralOutput != null)
    : Buffer.from([])
  const includeTotalCollateralBuffer = getCompatibility(version).supportsBabbage
    ? serializeOptionFlag(tx.totalCollateral != null)
    : Buffer.from([])
  const referenceInputsBuffer = getCompatibility(version).supportsBabbage
    ? uint32_to_buf(tx.referenceInputs.length as Uint32_t)
    : Buffer.from([])
  const votingProceduresBuffer = getCompatibility(version).supportsConway
    ? uint32_to_buf(tx.votingProcedures.length as Uint32_t)
    : Buffer.from([])
  const includeTreasuryBuffer = getCompatibility(version).supportsConway
    ? serializeOptionFlag(tx.treasury != null)
    : Buffer.from([])
  const includeDonationBuffer = getCompatibility(version).supportsConway
    ? serializeOptionFlag(tx.donation != null)
    : Buffer.from([])

  //  we have re-ordered numWitnesses in wireDataBuffer since Babbage
  const witnessBufferLegacy = getCompatibility(version).supportsBabbage
    ? Buffer.from([])
    : uint32_to_buf(numWitnesses as Uint32_t)
  const witnessBufferBabbage = getCompatibility(version).supportsBabbage
    ? uint32_to_buf(numWitnesses as Uint32_t)
    : Buffer.from([])

  return Buffer.concat([
    optionsBuffer,
    uint8_to_buf(tx.network.networkId),
    uint32_to_buf(tx.network.protocolMagic),
    serializeOptionFlag(tx.ttl != null),
    serializeOptionFlag(tx.auxiliaryData != null),
    serializeOptionFlag(tx.validityIntervalStart != null),
    mintBuffer,
    scriptDataHashBuffer,
    includeNetworkIdBuffer,
    includeCollateralOutputBuffer,
    includeTotalCollateralBuffer,
    includeTreasuryBuffer,
    includeDonationBuffer,
    _serializeSigningMode(signingMode),
    uint32_to_buf(tx.inputs.length as Uint32_t),
    uint32_to_buf(tx.outputs.length as Uint32_t),
    uint32_to_buf(tx.certificates.length as Uint32_t),
    uint32_to_buf(tx.withdrawals.length as Uint32_t),
    witnessBufferLegacy,
    collateralInputsBuffer,
    requiredSignersBuffer,
    referenceInputsBuffer,
    votingProceduresBuffer,
    witnessBufferBabbage,
  ])
}

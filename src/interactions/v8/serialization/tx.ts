import type {
  CVotePublicKey,
  ParsedAssetGroup,
  ParsedAnchor,
  ParsedCertificate,
  ParsedCredential,
  ParsedCVoteDelegation,
  ParsedCVoteRegistrationParams,
  ParsedDRep,
  ParsedOutput,
  ParsedOutputDestination,
  ParsedPoolKey,
  ParsedPoolMetadata,
  ParsedPoolOwner,
  ParsedPoolRelay,
  ParsedPoolRewardAccount,
  ParsedRequiredSigner,
  ParsedSigningRequest,
  ParsedTransaction,
  ParsedVoter,
  Uint16_t,
  Uint64_str,
  Uint8_t,
  ValidBIP32Path,
} from '../../../types/internal'
import {
  CertificateType,
  CIP36VoteDelegationType,
  CredentialType,
  DRepType,
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  RelayType,
  RequiredSignerType,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
  TransactionSigningMode,
} from '../../../types/internal'
import {
  CIP36VoteRegistrationFormat,
  DatumType,
  VoterType,
} from '../../../types/public'
import {assert, unreachable} from '../../../utils/assert'
import {
  hex_to_buf,
  int64_to_buf,
  path_to_buf,
  uint8_to_buf,
  uint16_to_buf,
  uint32_to_buf,
  uint64Number_to_buf,
  uint64_to_buf,
} from '../../../utils/serialize'
import {serializeCredential} from './credential'
import {serializeAddressParams} from './addressParams'
import {
  AuxDataType,
  CIP36RegistrationFormat,
  CVoteCredentialType,
  Included,
  OutputDestinationType,
  PoolRewardAccountWireType,
  SigningMode,
} from './wireTypes'

export const MAX_SIGN_TX_CHUNK_SIZE = 250

function serializeIncluded(value: boolean): Buffer {
  return uint8_to_buf((value ? Included.YES : Included.NO) as Uint8_t)
}

function u8(value: number): Buffer {
  return uint8_to_buf(value as Uint8_t)
}

function serializeSigningMode(signingMode: TransactionSigningMode): Buffer {
  const value = {
    [TransactionSigningMode.ORDINARY_TRANSACTION]: SigningMode.ORDINARY_TRANSACTION,
    [TransactionSigningMode.POOL_REGISTRATION_AS_OWNER]: SigningMode.POOL_REGISTRATION_AS_OWNER,
    [TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR]: SigningMode.POOL_REGISTRATION_AS_OPERATOR,
    [TransactionSigningMode.MULTISIG_TRANSACTION]: SigningMode.MULTISIG_TRANSACTION,
    [TransactionSigningMode.PLUTUS_TRANSACTION]: SigningMode.PLUTUS_TRANSACTION,
  }[signingMode]

  assert(value !== undefined, 'invalid signing mode')
  return uint8_to_buf(value as Uint8_t)
}

function serializeTxOptions(request: ParsedSigningRequest): Buffer {
  let optionFlags = 0
  if (request.options.tagCborSets) {
    optionFlags += 1
  }
  return uint64Number_to_buf(optionFlags)
}

function serializeCount16(count: number): Buffer {
  return uint16_to_buf(count as Uint16_t)
}

function serializePathOrCvKey(value: ValidBIP32Path | CVotePublicKey): Buffer {
  if (Array.isArray(value)) {
    return Buffer.concat([
      uint8_to_buf(CVoteCredentialType.KEY_PATH as Uint8_t),
      path_to_buf(value),
    ])
  }

  return Buffer.concat([
    uint8_to_buf(CVoteCredentialType.KEY as Uint8_t),
    hex_to_buf(value),
  ])
}

function serializeAnchor(anchor: ParsedAnchor | null): Buffer {
  if (anchor == null) {
    return serializeIncluded(false)
  }

  const urlBuffer = Buffer.from(anchor.url, 'ascii')
  return Buffer.concat([
    serializeIncluded(true),
    uint16_to_buf(urlBuffer.length as Uint16_t),
    urlBuffer,
    hex_to_buf(anchor.hashHex),
  ])
}

function serializePoolKeyCredential(poolKey: ParsedPoolKey): ParsedCredential {
  switch (poolKey.type) {
    case PoolKeyType.DEVICE_OWNED:
      return {type: CredentialType.KEY_PATH, path: poolKey.path}
    case PoolKeyType.THIRD_PARTY:
      return {type: CredentialType.KEY_HASH, keyHashHex: poolKey.hashHex}
    default:
      unreachable(poolKey)
  }
}

function serializePoolOwnerCredential(
  owner: ParsedPoolOwner,
): ParsedCredential {
  switch (owner.type) {
    case PoolOwnerType.DEVICE_OWNED:
      return {type: CredentialType.KEY_PATH, path: owner.path}
    case PoolOwnerType.THIRD_PARTY:
      return {type: CredentialType.KEY_HASH, keyHashHex: owner.hashHex}
    default:
      unreachable(owner)
  }
}

function serializePoolRewardAccount(
  rewardAccount: ParsedPoolRewardAccount,
): Buffer {
  switch (rewardAccount.type) {
    case PoolRewardAccountType.DEVICE_OWNED:
      return Buffer.concat([
        uint8_to_buf(PoolRewardAccountWireType.KEY_PATH as Uint8_t),
        path_to_buf(rewardAccount.path),
      ])
    case PoolRewardAccountType.THIRD_PARTY: {
      const rewardAccountBuffer = hex_to_buf(rewardAccount.rewardAccountHex)
      assert(rewardAccountBuffer.length === 29, 'invalid reward account length')
      return Buffer.concat([
        uint8_to_buf(PoolRewardAccountWireType.KEY_HASH as Uint8_t),
        rewardAccountBuffer,
      ])
    }
    default:
      unreachable(rewardAccount)
  }
}

function serializeOutputDestination(
  destination: ParsedOutputDestination,
): Buffer {
  const destinationTypeEncoding = {
    [TxOutputDestinationType.THIRD_PARTY]: OutputDestinationType.THIRD_PARTY,
    [TxOutputDestinationType.DEVICE_OWNED]: OutputDestinationType.DEVICE_OWNED,
  } as const

  switch (destination.type) {
    case TxOutputDestinationType.THIRD_PARTY: {
      const address = hex_to_buf(destination.addressHex)
      return Buffer.concat([
        u8(destinationTypeEncoding[destination.type]),
        uint16_to_buf(address.length as Uint16_t),
        address,
      ])
    }
    case TxOutputDestinationType.DEVICE_OWNED:
      return Buffer.concat([
        u8(destinationTypeEncoding[destination.type]),
        serializeAddressParams(destination.addressParams),
      ])
    default:
      unreachable(destination)
  }
}

function serializeTokenBundle(
  assetGroups: ParsedAssetGroup<Uint64_str>[],
): Buffer {
  const buffers: Buffer[] = []

  for (const assetGroup of assetGroups) {
    buffers.push(hex_to_buf(assetGroup.policyIdHex))
    buffers.push(serializeCount16(assetGroup.tokens.length))

    for (const token of assetGroup.tokens) {
      const assetName = hex_to_buf(token.assetNameHex)
      buffers.push(uint8_to_buf(assetName.length as Uint8_t))
      buffers.push(assetName)
      buffers.push(uint64_to_buf(token.amount))
    }
  }

  return Buffer.concat(buffers)
}

function serializeOutput(output: ParsedOutput): Buffer {
  const buffers: Buffer[] = [
    serializeOutputDestination(output.destination),
    uint64_to_buf(output.amount),
    uint8_to_buf(output.format as Uint8_t),
    serializeIncluded(output.datum != null),
    serializeIncluded(output.referenceScriptHex != null),
    serializeCount16(output.tokenBundle.length),
  ]

  if (output.tokenBundle.length > 0) {
    buffers.push(serializeTokenBundle(output.tokenBundle))
  }

  if (output.datum != null) {
    switch (output.datum.type) {
      case DatumType.HASH:
        buffers.push(uint8_to_buf(DatumType.HASH as Uint8_t))
        buffers.push(hex_to_buf(output.datum.datumHashHex))
        break
      case DatumType.INLINE: {
        const datum = hex_to_buf(output.datum.datumHex)
        buffers.push(uint8_to_buf(DatumType.INLINE as Uint8_t))
        buffers.push(uint16_to_buf(datum.length as Uint16_t))
        buffers.push(datum)
        break
      }
      default:
        unreachable(output.datum)
    }
  }

  if (output.referenceScriptHex != null) {
    const referenceScript = hex_to_buf(output.referenceScriptHex)
    buffers.push(uint16_to_buf(referenceScript.length as Uint16_t))
    buffers.push(referenceScript)
  }

  const result = Buffer.concat(buffers)
  assert(result.length <= 0xffff, 'output too large')
  return result
}

function serializeDRep(dRep: ParsedDRep): Buffer {
  switch (dRep.type) {
    case DRepType.KEY_PATH:
      return Buffer.concat([
        uint8_to_buf(dRep.type as Uint8_t),
        path_to_buf(dRep.path),
      ])
    case DRepType.KEY_HASH:
      return Buffer.concat([
        uint8_to_buf(dRep.type as Uint8_t),
        hex_to_buf(dRep.keyHashHex),
      ])
    case DRepType.SCRIPT_HASH:
      return Buffer.concat([
        uint8_to_buf(dRep.type as Uint8_t),
        hex_to_buf(dRep.scriptHashHex),
      ])
    case DRepType.ABSTAIN:
    case DRepType.NO_CONFIDENCE:
      return uint8_to_buf(dRep.type as Uint8_t)
    default:
      unreachable(dRep)
  }
}

function serializeRelay(relay: ParsedPoolRelay): Buffer {
  switch (relay.type) {
    case RelayType.SINGLE_HOST_IP_ADDR:
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        serializeIncluded(relay.port != null),
        relay.port != null ? uint16_to_buf(relay.port) : Buffer.alloc(0),
        serializeIncluded(relay.ipv4 != null),
        relay.ipv4 ?? Buffer.alloc(0),
        serializeIncluded(relay.ipv6 != null),
        relay.ipv6 ?? Buffer.alloc(0),
      ])
    case RelayType.SINGLE_HOST_HOSTNAME: {
      const dnsName = Buffer.from(relay.dnsName, 'ascii')
      assert(dnsName.length <= 255, 'dnsName too long')
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        serializeIncluded(relay.port != null),
        relay.port != null ? uint16_to_buf(relay.port) : Buffer.alloc(0),
        serializeIncluded(true),
        uint8_to_buf(dnsName.length as Uint8_t),
        dnsName,
      ])
    }
    case RelayType.MULTI_HOST: {
      const dnsName = Buffer.from(relay.dnsName, 'ascii')
      assert(dnsName.length <= 255, 'dnsName too long')
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        serializeIncluded(true),
        uint8_to_buf(dnsName.length as Uint8_t),
        dnsName,
      ])
    }
    default:
      unreachable(relay)
  }
}

function serializePoolMetadata(metadata: ParsedPoolMetadata): Buffer {
  const url = Buffer.from(metadata.url, 'ascii')
  return Buffer.concat([
    uint16_to_buf(url.length as Uint16_t),
    url,
    hex_to_buf(metadata.hashHex),
  ])
}

function serializePoolRegistration(
  certificate: Extract<
    ParsedCertificate,
    {type: CertificateType.STAKE_POOL_REGISTRATION}
  >,
): Buffer {
  const {pool} = certificate
  const buffers: Buffer[] = [
    serializeCredential(serializePoolKeyCredential(pool.poolKey)),
    hex_to_buf(pool.vrfHashHex),
    uint64_to_buf(pool.pledge),
    uint64_to_buf(pool.cost),
    uint64_to_buf(pool.margin.numerator),
    uint64_to_buf(pool.margin.denominator),
    serializePoolRewardAccount(pool.rewardAccount),
    serializeCount16(pool.owners.length),
    serializeCount16(pool.relays.length),
    serializeIncluded(pool.metadata != null),
  ]

  for (const owner of pool.owners) {
    buffers.push(serializeCredential(serializePoolOwnerCredential(owner)))
  }

  for (const relay of pool.relays) {
    buffers.push(serializeRelay(relay))
  }

  if (pool.metadata != null) {
    buffers.push(serializePoolMetadata(pool.metadata))
  }

  const payload = Buffer.concat(buffers)
  return Buffer.concat([uint16_to_buf(payload.length as Uint16_t), payload])
}

function serializeCertificate(certificate: ParsedCertificate): Buffer {
  switch (certificate.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION:
      return Buffer.concat([
        u8(certificate.type),
        serializeCredential(certificate.stakeCredential),
      ])
    case CertificateType.STAKE_REGISTRATION_CONWAY:
    case CertificateType.STAKE_DEREGISTRATION_CONWAY:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.stakeCredential),
        uint64_to_buf(certificate.deposit),
      ])
    case CertificateType.STAKE_DELEGATION:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.stakeCredential),
        hex_to_buf(certificate.poolKeyHashHex),
      ])
    case CertificateType.VOTE_DELEGATION:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.stakeCredential),
        serializeDRep(certificate.dRep),
      ])
    case CertificateType.AUTHORIZE_COMMITTEE_HOT:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.coldCredential),
        serializeCredential(certificate.hotCredential),
      ])
    case CertificateType.RESIGN_COMMITTEE_COLD:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.coldCredential),
        serializeAnchor(certificate.anchor),
      ])
    case CertificateType.DREP_REGISTRATION:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.dRepCredential),
        uint64_to_buf(certificate.deposit),
        serializeAnchor(certificate.anchor),
      ])
    case CertificateType.DREP_DEREGISTRATION:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.dRepCredential),
        uint64_to_buf(certificate.deposit),
      ])
    case CertificateType.DREP_UPDATE:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.dRepCredential),
        serializeAnchor(certificate.anchor),
      ])
    case CertificateType.STAKE_POOL_REGISTRATION:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializePoolRegistration(certificate),
      ])
    case CertificateType.STAKE_POOL_RETIREMENT:
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential({
          type: CredentialType.KEY_PATH,
          path: certificate.path,
        }),
        uint64_to_buf(certificate.retirementEpoch),
      ])
    default:
      unreachable(certificate)
  }
}

function serializeRequiredSigner(requiredSigner: ParsedRequiredSigner): Buffer {
  switch (requiredSigner.type) {
    case RequiredSignerType.PATH:
      return Buffer.concat([
        uint8_to_buf(requiredSigner.type as Uint8_t),
        path_to_buf(requiredSigner.path),
      ])
    case RequiredSignerType.HASH:
      return Buffer.concat([
        uint8_to_buf(requiredSigner.type as Uint8_t),
        hex_to_buf(requiredSigner.hashHex),
      ])
    default:
      unreachable(requiredSigner)
  }
}

function serializeVoter(voter: ParsedVoter): Buffer {
  switch (voter.type) {
    case VoterType.COMMITTEE_KEY_HASH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        hex_to_buf(voter.keyHashHex),
      ])
    case VoterType.DREP_KEY_HASH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        hex_to_buf(voter.keyHashHex),
      ])
    case VoterType.STAKE_POOL_KEY_HASH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        hex_to_buf(voter.keyHashHex),
      ])
    case VoterType.COMMITTEE_KEY_PATH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        path_to_buf(voter.keyPath),
      ])
    case VoterType.DREP_KEY_PATH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        path_to_buf(voter.keyPath),
      ])
    case VoterType.STAKE_POOL_KEY_PATH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        path_to_buf(voter.keyPath),
      ])
    case VoterType.COMMITTEE_SCRIPT_HASH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        hex_to_buf(voter.scriptHashHex),
      ])
    case VoterType.DREP_SCRIPT_HASH:
      return Buffer.concat([
        uint8_to_buf(voter.type as Uint8_t),
        hex_to_buf(voter.scriptHashHex),
      ])
    default:
      unreachable(voter)
  }
}

export function serializeTransactionRaw(tx: ParsedTransaction): Buffer {
  const buffers: Buffer[] = []

  for (const input of tx.inputs) {
    buffers.push(hex_to_buf(input.txHashHex))
    buffers.push(uint32_to_buf(input.outputIndex))
  }

  for (const output of tx.outputs) {
    const outputBytes = serializeOutput(output)
    buffers.push(uint16_to_buf(outputBytes.length as Uint16_t))
    buffers.push(outputBytes)
  }

  buffers.push(uint64_to_buf(tx.fee))

  if (tx.ttl != null) {
    buffers.push(uint64_to_buf(tx.ttl))
  }

  for (const certificate of tx.certificates) {
    buffers.push(serializeCertificate(certificate))
  }

  for (const withdrawal of tx.withdrawals) {
    buffers.push(uint64_to_buf(withdrawal.amount))
    buffers.push(serializeCredential(withdrawal.stakeCredential))
  }

  if (tx.validityIntervalStart != null) {
    buffers.push(uint64_to_buf(tx.validityIntervalStart))
  }

  for (const mintAssetGroup of tx.mint ?? []) {
    buffers.push(hex_to_buf(mintAssetGroup.policyIdHex))
    buffers.push(serializeCount16(mintAssetGroup.tokens.length))
    for (const token of mintAssetGroup.tokens) {
      const assetName = hex_to_buf(token.assetNameHex)
      assert(assetName.length <= 255, 'assetName too long')
      buffers.push(uint8_to_buf(assetName.length as Uint8_t))
      buffers.push(assetName)
      buffers.push(int64_to_buf(token.amount))
    }
  }

  if (tx.scriptDataHashHex != null) {
    buffers.push(hex_to_buf(tx.scriptDataHashHex))
  }

  for (const collateralInput of tx.collateralInputs) {
    buffers.push(hex_to_buf(collateralInput.txHashHex))
    buffers.push(uint32_to_buf(collateralInput.outputIndex))
  }

  for (const requiredSigner of tx.requiredSigners) {
    buffers.push(serializeRequiredSigner(requiredSigner))
  }

  if (tx.collateralOutput != null) {
    const outputBytes = serializeOutput(tx.collateralOutput)
    buffers.push(uint16_to_buf(outputBytes.length as Uint16_t))
    buffers.push(outputBytes)
  }

  if (tx.totalCollateral != null) {
    buffers.push(uint64_to_buf(tx.totalCollateral))
  }

  for (const referenceInput of tx.referenceInputs) {
    buffers.push(hex_to_buf(referenceInput.txHashHex))
    buffers.push(uint32_to_buf(referenceInput.outputIndex))
  }

  for (const voterVotes of tx.votingProcedures) {
    buffers.push(serializeVoter(voterVotes.voter))
    buffers.push(serializeCount16(voterVotes.votes.length))
    for (const vote of voterVotes.votes) {
      buffers.push(hex_to_buf(vote.govActionId.txHashHex))
      buffers.push(uint32_to_buf(vote.govActionId.govActionIndex))
      buffers.push(u8(vote.votingProcedure.vote))
      buffers.push(serializeAnchor(vote.votingProcedure.anchor))
    }
  }

  if (tx.treasury != null) {
    buffers.push(uint64_to_buf(tx.treasury))
  }

  if (tx.donation != null) {
    buffers.push(uint64_to_buf(tx.donation))
  }

  return Buffer.concat(buffers)
}

export function serializeTxInitData(
  request: ParsedSigningRequest,
  witnessPaths: ValidBIP32Path[],
  rawTx = serializeTransactionRaw(request.tx),
): Buffer {
  const {tx} = request

  const includeAuxiliaryData = tx.auxiliaryData != null
  const auxiliaryDataType =
    tx.auxiliaryData?.type === TxAuxiliaryDataType.ARBITRARY_HASH
      ? AuxDataType.ARBITRARY_HASH
      : tx.auxiliaryData?.type === TxAuxiliaryDataType.CIP36_REGISTRATION
        ? AuxDataType.CVOTE_REGISTRATION
        : null
  const auxiliaryDataHash =
    tx.auxiliaryData?.type === TxAuxiliaryDataType.ARBITRARY_HASH
      ? tx.auxiliaryData.hashHex
      : null

  return Buffer.concat([
    serializeTxOptions(request),
    uint8_to_buf(tx.network.networkId),
    uint32_to_buf(tx.network.protocolMagic),
    serializeSigningMode(request.signingMode),
    serializeCount16(tx.inputs.length),
    serializeCount16(tx.outputs.length),
    serializeIncluded(tx.ttl != null),
    serializeCount16(tx.certificates.length),
    serializeCount16(tx.withdrawals.length),
    serializeIncluded(includeAuxiliaryData),
    includeAuxiliaryData && auxiliaryDataType != null
      ? u8(auxiliaryDataType)
      : Buffer.alloc(0),
    auxiliaryDataHash != null ? hex_to_buf(auxiliaryDataHash) : Buffer.alloc(0),
    serializeIncluded(tx.validityIntervalStart != null),
    serializeCount16((tx.mint ?? []).length),
    serializeIncluded(tx.scriptDataHashHex != null),
    serializeCount16(tx.collateralInputs.length),
    serializeCount16(tx.requiredSigners.length),
    serializeIncluded(tx.includeNetworkId),
    serializeIncluded(tx.collateralOutput != null),
    serializeIncluded(tx.totalCollateral != null),
    serializeCount16(tx.referenceInputs.length),
    serializeCount16(tx.votingProcedures.length),
    serializeIncluded(tx.treasury != null),
    serializeIncluded(tx.donation != null),
    serializeCount16(witnessPaths.length),
    uint16_to_buf(rawTx.length as Uint16_t),
  ])
}

export function serializeTxAuxiliaryDataInit(
  params: ParsedCVoteRegistrationParams,
): Buffer {
  const registrationFormatEncoding = {
    [CIP36VoteRegistrationFormat.CIP_15]: CIP36RegistrationFormat.CIP15,
    [CIP36VoteRegistrationFormat.CIP_36]: CIP36RegistrationFormat.CIP36,
  } as const
  const delegationCount = params.delegations?.length ?? 0
  const votingKey = params.votePublicKeyPath ?? params.votePublicKey ?? null

  const buffers: Buffer[] = [
    u8(registrationFormatEncoding[params.format]),
    serializeCount16(delegationCount),
    serializePathOrCvKey(params.stakingPath),
    serializeOutputDestination(params.paymentDestination),
    uint64_to_buf(params.nonce),
  ]

  if (params.format === CIP36VoteRegistrationFormat.CIP_36) {
    buffers.push(uint64_to_buf((params.votingPurpose ?? '0') as Uint64_str))
    if (delegationCount === 0) {
      assert(votingKey != null, 'missing CIP-36 vote key')
      buffers.push(serializePathOrCvKey(votingKey))
    }
  } else {
    assert(votingKey != null, 'missing CIP-15 vote key')
    buffers.push(serializePathOrCvKey(votingKey))
  }

  return Buffer.concat(buffers)
}

export function serializeTxAuxiliaryDataDelegation(
  delegation: ParsedCVoteDelegation,
): Buffer {
  switch (delegation.type) {
    case CIP36VoteDelegationType.PATH:
      return Buffer.concat([
        serializePathOrCvKey(delegation.voteKeyPath),
        uint32_to_buf(delegation.weight),
      ])
    case CIP36VoteDelegationType.KEY:
      return Buffer.concat([
        serializePathOrCvKey(delegation.voteKey),
        uint32_to_buf(delegation.weight),
      ])
    default:
      unreachable(delegation)
  }
}

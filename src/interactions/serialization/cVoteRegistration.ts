import {getCompatibility} from '../../interactions/getVersion'
import type {
  CVotePublicKey,
  ParsedCVoteDelegation,
  ParsedCVoteRegistrationParams,
  ParsedOutputDestination,
  Uint8_t,
  Uint32_t,
  Uint64_str,
  ValidBIP32Path,
} from '../../types/internal'
import type {Version} from '../../types/public'
import {
  TxOutputDestinationType,
  CIP36VoteDelegationType,
  CIP36VoteRegistrationFormat,
} from '../../types/public'
import {assert, unreachable} from '../../utils/assert'
import {
  hex_to_buf,
  path_to_buf,
  serializeOptionFlag,
  uint8_to_buf,
  uint32_to_buf,
  uint64_to_buf,
} from '../../utils/serialize'
import {serializeAddressParams} from './addressParams'
import {serializeTxOutputDestination} from './txOutput'

export function serializeCVoteRegistrationInit(
  params: ParsedCVoteRegistrationParams,
): Buffer {
  const registrationFormatEncoding = {
    [CIP36VoteRegistrationFormat.CIP_15]: 0x01,
    [CIP36VoteRegistrationFormat.CIP_36]: 0x02,
  } as const
  const formatBuffer = uint8_to_buf(
    registrationFormatEncoding[params.format] as Uint8_t,
  )

  const numDelegations =
    params.delegations != null ? params.delegations.length : 0
  const numDelegationsBuffer = uint32_to_buf(numDelegations as Uint32_t)

  return Buffer.concat([
    formatBuffer, // 1 B
    numDelegationsBuffer, // 4 B
  ])
}

function serializeDelegationType(type: CIP36VoteDelegationType): Buffer {
  const delegationTypeEncoding = {
    [CIP36VoteDelegationType.KEY]: 0x01,
    [CIP36VoteDelegationType.PATH]: 0x02,
  } as const
  return uint8_to_buf(delegationTypeEncoding[type] as Uint8_t)
}

export function serializeCVoteRegistrationVoteKey(
  votePublicKey: CVotePublicKey | null,
  votePublicKeyPath: ValidBIP32Path | null,
  version: Version,
): Buffer {
  if (votePublicKey != null) {
    assert(votePublicKeyPath == null, 'redundant vote key path')

    const delegationTypeBuffer = getCompatibility(version).supportsCIP36
      ? serializeDelegationType(CIP36VoteDelegationType.KEY)
      : Buffer.from([])

    return Buffer.concat([delegationTypeBuffer, hex_to_buf(votePublicKey)])
  } else {
    assert(votePublicKeyPath != null, 'missing vote key')
    assert(
      getCompatibility(version).supportsCIP36Vote,
      'key derivation path for vote keys not supported by the device',
    )

    return Buffer.concat([
      serializeDelegationType(CIP36VoteDelegationType.PATH),
      path_to_buf(votePublicKeyPath),
    ])
  }
}

export function serializeCVoteRegistrationDelegation(
  delegation: ParsedCVoteDelegation,
): Buffer {
  const typeBuffer = serializeDelegationType(delegation.type)

  const weightBuffer = uint32_to_buf(delegation.weight)

  switch (delegation.type) {
    case CIP36VoteDelegationType.KEY:
      return Buffer.concat([
        typeBuffer,
        hex_to_buf(delegation.voteKey),
        weightBuffer,
      ])

    case CIP36VoteDelegationType.PATH:
      return Buffer.concat([
        typeBuffer,
        path_to_buf(delegation.voteKeyPath),
        weightBuffer,
      ])

    default:
      unreachable(delegation)
  }
}

export function serializeCVoteRegistrationStakingPath(
  stakingPath: ValidBIP32Path,
): Buffer {
  return Buffer.concat([path_to_buf(stakingPath)])
}

export function serializeCVoteRegistrationPaymentDestination(
  paymentDestination: ParsedOutputDestination,
  version: Version,
): Buffer {
  if (getCompatibility(version).supportsCIP36) {
    return serializeTxOutputDestination(paymentDestination, version)
  } else {
    // older ledger versions with only Catalyst as in CIP-15
    assert(
      paymentDestination.type === TxOutputDestinationType.DEVICE_OWNED,
      'wrong destination for payment address in Catalyst',
    )
    return serializeAddressParams(paymentDestination.addressParams, version)
  }
}

export function serializeCVoteRegistrationNonce(nonce: Uint64_str): Buffer {
  return Buffer.concat([uint64_to_buf(nonce)])
}

export function serializeCVoteRegistrationVotingPurpose(
  votingPurpose: Uint64_str | null,
): Buffer {
  const includeVotingPurposeBuffer = serializeOptionFlag(votingPurpose != null)

  const votingPurposeBuffer =
    votingPurpose != null ? uint64_to_buf(votingPurpose) : Buffer.from([])

  return Buffer.concat([
    includeVotingPurposeBuffer, // 1 B
    votingPurposeBuffer, // 0 or 8 B
  ])
}

import {InvalidDataReason} from '../errors/invalidDataReason'
import type {ParsedCVote} from '../types/internal'
import type {CIP36Vote} from '../types/public'
import {parseBIP32Path, parseHexString, validate} from '../utils/parse'

const CVOTE_VOTE_PLAN_ID_LENGTH = 32
const CVOTE_PROPOSAL_INDEX_LENGTH = 1
const CVOTE_PAYLOAD_TYPE_TAG_LENGTH = 1
const MIN_VOTECAST_LENGTH =
  CVOTE_VOTE_PLAN_ID_LENGTH +
  CVOTE_PROPOSAL_INDEX_LENGTH +
  CVOTE_PAYLOAD_TYPE_TAG_LENGTH

export function parseCVote(cVote: CIP36Vote): ParsedCVote {
  const voteCastDataHex = parseHexString(
    cVote.voteCastDataHex,
    InvalidDataReason.CVOTE_INVALID_VOTECAST_DATA,
  )

  // The app parses votePlanId, proposalIndex, and payloadTypeTag
  // from the votecast payload during INIT, so shorter payloads are rejected.
  validate(
    voteCastDataHex.length >= 2 * MIN_VOTECAST_LENGTH,
    InvalidDataReason.CVOTE_INVALID_VOTECAST_DATA,
  )

  const witnessPath = parseBIP32Path(
    cVote.witnessPath,
    InvalidDataReason.CVOTE_INVALID_WITNESS,
  )

  return {
    voteCastDataHex,
    witnessPath,
  }
}

import {DeviceVersionUnsupported} from '../errors'
import type {ParsedCVote, Version} from '../types/internal'
import type {SignedCIP36VoteData} from '../types/public'
import {getVersionString} from '../utils'
import type {Interaction} from './common/types'
import {getCompatibility, isV8App} from './getVersion'
import {signCVoteV7} from './v7/signCVote'
import {signCVote as signCVoteV8} from './v8/signCVote'

export function* signCVote(
  version: Version,
  cVote: ParsedCVote,
): Interaction<SignedCIP36VoteData> {
  if (!isV8App(version) && !getCompatibility(version).supportsCIP36Vote) {
    throw new DeviceVersionUnsupported(
      `CIP36 voting not supported by Ledger app version ${getVersionString(
        version,
      )}.`,
    )
  }

  if (isV8App(version)) {
    return yield* signCVoteV8(version, cVote)
  }
  return yield* signCVoteV7(version, cVote)
}

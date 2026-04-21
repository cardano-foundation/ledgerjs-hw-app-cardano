import type {ParsedCVote, Version} from '../types/internal'
import type {SignedCIP36VoteData} from '../types/public'
import {ensureCVoteSigningSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV7App} from './getVersion'
import {signCVoteV7} from './v7/signCVote'
import {signCVote as signCVoteV8} from './v8/signCVote'

export function* signCVote(
  version: Version,
  cVote: ParsedCVote,
): Interaction<SignedCIP36VoteData> {
  ensureCVoteSigningSupported(version, cVote)

  if (isV7App(version)) {
    return yield* signCVoteV7(version, cVote)
  }

  return yield* signCVoteV8(version, cVote)
}

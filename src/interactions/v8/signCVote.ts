import type {ParsedCVote, Version} from '../../types/internal'
import {ED25519_SIGNATURE_LENGTH} from '../../types/internal'
import type {SignedCIP36VoteData} from '../../types/public'
import type {Interaction} from '../common/types'
import {sendSignCVote} from './commandSender'

export function* signCVote(
  _version: Version,
  cVote: ParsedCVote,
): Interaction<SignedCIP36VoteData> {
  const response = yield* sendSignCVote(cVote)
  const HASH_LENGTH = 32
  const dataHashHex = response.slice(0, HASH_LENGTH).toString('hex')
  const witnessSignatureHex = response
    .slice(HASH_LENGTH, HASH_LENGTH + ED25519_SIGNATURE_LENGTH)
    .toString('hex')

  return {
    dataHashHex,
    witnessPath: cVote.witnessPath,
    witnessSignatureHex,
  }
}

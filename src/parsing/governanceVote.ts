import { InvalidDataReason } from "../errors/invalidDataReason"
import type { ParsedGovernanceVote } from "../types/internal"
import type { GovernanceVote } from "../types/public"
import { parseBIP32Path, parseHexString, validate } from "../utils/parse"

export function parseGovernanceVote(
    governanceVote: GovernanceVote
): ParsedGovernanceVote {
    const voteCastDataHex = parseHexString(governanceVote.voteCastDataHex, InvalidDataReason.GOVERNANCE_VOTE_INVALID_VOTECAST_DATA)

    // we don't know what is the true minimal length
    // this just assures that the Cardano ledger app will be happy
    const MIN_VOTECAST_LENGTH = 32 + 1 + 1 + 1
    validate(voteCastDataHex.length >= 2 * MIN_VOTECAST_LENGTH, InvalidDataReason.GOVERNANCE_VOTE_INVALID_VOTECAST_DATA)

    const witnessPath = parseBIP32Path(governanceVote.witnessPath, InvalidDataReason.GOVERNANCE_VOTE_INVALID_WITNESS)

    return {
        voteCastDataHex,
        witnessPath,
    }
}

import { InvalidDataReason } from "../errors/invalidDataReason"
import type { ParsedCVote } from "../types/internal"
import type { CIP36Vote } from "../types/public"
import { parseBIP32Path, parseHexString, validate } from "../utils/parse"

export function parseCVote(
    cVote: CIP36Vote
): ParsedCVote {
    const voteCastDataHex = parseHexString(cVote.voteCastDataHex, InvalidDataReason.CVOTE_INVALID_VOTECAST_DATA)

    // we don't know what is the true minimal length
    // this just assures that the Cardano ledger app will be happy
    const MIN_VOTECAST_LENGTH = 32 + 1 + 1 + 1
    validate(voteCastDataHex.length >= 2 * MIN_VOTECAST_LENGTH, InvalidDataReason.CVOTE_INVALID_VOTECAST_DATA)

    const witnessPath = parseBIP32Path(cVote.witnessPath, InvalidDataReason.CVOTE_INVALID_WITNESS)

    return {
        voteCastDataHex,
        witnessPath,
    }
}

import { InvalidData } from "../errors"
import { InvalidDataReason } from "../errors/invalidDataReason"
import type { ParsedCVoteDelegation, ParsedCVoteRegistrationParams, ParsedTxAuxiliaryData } from "../types/internal"
import { CVOTE_PUBLIC_KEY_LENGTH , AUXILIARY_DATA_HASH_LENGTH } from "../types/internal"
import type { CIP36VoteDelegation, CIP36VoteRegistrationParams, Network,TxAuxiliaryData } from "../types/public"
import { CIP36VoteDelegationType, CIP36VoteRegistrationFormat , TxAuxiliaryDataType } from "../types/public"
import { isArray, parseBIP32Path, parseHexStringOfLength, parseUint32_t, parseUint64_str , validate } from "../utils/parse"
import { parseTxDestination } from "./transaction"

export const CVOTE_VKEY_LENGTH = 32

function parseCVoteDelegation(delegation: CIP36VoteDelegation): ParsedCVoteDelegation {
    const weight = parseUint32_t(delegation.weight, InvalidDataReason.CVOTE_DELEGATION_INVALID_WEIGHT)

    switch(delegation.type) {
    case CIP36VoteDelegationType.KEY:
        return {
            type: delegation.type,
            voteKey: parseHexStringOfLength(delegation.voteKeyHex, CVOTE_PUBLIC_KEY_LENGTH, InvalidDataReason.CVOTE_DELEGATION_INVALID_KEY),
            weight,
        }
    case CIP36VoteDelegationType.PATH:
        return {
            type: delegation.type,
            voteKeyPath: parseBIP32Path(delegation.voteKeyPath, InvalidDataReason.CVOTE_DELEGATION_INVALID_PATH),
            weight,
        }
    default:
        throw new InvalidData(InvalidDataReason.CVOTE_DELEGATION_UNKNOWN_DELEGATION_TYPE)
    }
}

function parseCVoteDelegations(delegations: Array<CIP36VoteDelegation>): Array<ParsedCVoteDelegation> {
    validate(isArray(delegations), InvalidDataReason.CVOTE_REGISTRATION_DELEGATIONS_NOT_ARRAY)
    return delegations.map(d => parseCVoteDelegation(d))
}

function parseCVoteRegistrationParams(network: Network, params: CIP36VoteRegistrationParams): ParsedCVoteRegistrationParams {
    switch (params.format) {
    case CIP36VoteRegistrationFormat.CIP_15:
        validate(params.delegations == null, InvalidDataReason.CVOTE_REGISTRATION_INCONSISTENT_WITH_CIP15)
        validate(params.voteKeyHex != null, InvalidDataReason.CVOTE_REGISTRATION_INCONSISTENT_WITH_CIP15)
        validate(params.votingPurpose == null, InvalidDataReason.CVOTE_REGISTRATION_INCONSISTENT_WITH_CIP15)
        break

    case CIP36VoteRegistrationFormat.CIP_36:
        // exactly one of delegations, voteKeyHex, voteKeyPath must be given
        if (params.delegations != null) {
            validate(params.voteKeyHex == null && params.voteKeyPath == null, InvalidDataReason.CVOTE_REGISTRATION_INCONSISTENT_WITH_CIP36)
        } else {
            validate(params.delegations == null, InvalidDataReason.CVOTE_REGISTRATION_INCONSISTENT_WITH_CIP36)
            validate(params.voteKeyHex == null || params.voteKeyPath == null, InvalidDataReason.CVOTE_REGISTRATION_BOTH_KEY_AND_PATH)
            validate(params.voteKeyHex != null || params.voteKeyPath != null, InvalidDataReason.CVOTE_REGISTRATION_MISSING_VOTE_KEY)
        }
        break

    default:
        throw new InvalidData(InvalidDataReason.CVOTE_DELEGATION_UNKNOWN_FORMAT)
    }

    const voteKey = params.voteKeyHex == null
        ? null
        : parseHexStringOfLength(params.voteKeyHex, CVOTE_VKEY_LENGTH, InvalidDataReason.CVOTE_REGISTRATION_INVALID_VOTE_KEY)

    const voteKeyPath = params.voteKeyPath == null
        ? null
        : parseBIP32Path(params.voteKeyPath, InvalidDataReason.CVOTE_REGISTRATION_INVALID_VOTE_KEY_PATH)

    const delegations = params.delegations == null
        ? null
        : parseCVoteDelegations(params.delegations)

    const votingPurpose = params.votingPurpose == null
        ? null
        : parseUint64_str(params.votingPurpose, {}, InvalidDataReason.CVOTE_REGISTRATION_INVALID_VOTING_PURPOSE)

    return {
        format: params.format,
        votePublicKey: voteKey,
        votePublicKeyPath: voteKeyPath,
        delegations,
        stakingPath: parseBIP32Path(params.stakingPath, InvalidDataReason.CVOTE_REGISTRATION_INVALID_STAKING_KEY_PATH),
        paymentDestination: parseTxDestination(network, params.paymentDestination, false),
        nonce: parseUint64_str(params.nonce, {}, InvalidDataReason.CVOTE_REGISTRATION_INVALID_NONCE),
        votingPurpose,
    }
}

export function parseTxAuxiliaryData(network: Network, auxiliaryData: TxAuxiliaryData): ParsedTxAuxiliaryData {
    switch (auxiliaryData.type) {
    case TxAuxiliaryDataType.ARBITRARY_HASH: {
        return {
            type: TxAuxiliaryDataType.ARBITRARY_HASH,
            hashHex: parseHexStringOfLength(auxiliaryData.params.hashHex, AUXILIARY_DATA_HASH_LENGTH, InvalidDataReason.AUXILIARY_DATA_INVALID_HASH),
        }
    }
    case TxAuxiliaryDataType.CIP36_REGISTRATION: {
        return {
            type: TxAuxiliaryDataType.CIP36_REGISTRATION,
            params: parseCVoteRegistrationParams(network, auxiliaryData.params),
        }
    }
    default:
        throw new InvalidData(InvalidDataReason.AUXILIARY_DATA_UNKNOWN_TYPE)
    }
}

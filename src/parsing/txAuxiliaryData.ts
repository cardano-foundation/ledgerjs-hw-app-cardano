import { InvalidData } from "../errors"
import { InvalidDataReason } from "../errors/invalidDataReason"
import type { ParsedGovernanceVotingDelegation, ParsedGovernanceVotingRegistrationParams, ParsedTxAuxiliaryData } from "../types/internal"
import { GOVERNANCE_VOTING_PUBLIC_KEY_LENGTH } from "../types/internal"
import { AUXILIARY_DATA_HASH_LENGTH } from "../types/internal"
import type { GovernanceVotingDelegation, GovernanceVotingRegistrationParams, Network,TxAuxiliaryData } from "../types/public"
import { GovernanceVotingDelegationType, GovernanceVotingRegistrationFormat } from "../types/public"
import { TxAuxiliaryDataType } from "../types/public"
import { isArray, parseBIP32Path, parseHexStringOfLength, parseUint32_t, parseUint64_str } from "../utils/parse"
import { validate } from "../utils/parse"
import { parseTxDestination } from "./transaction"

export const GOVERNANCE_VOTING_REGISTRATION_VOTING_VKEY_LENGTH = 32

export function parseTxAuxiliaryData(network: Network, auxiliaryData: TxAuxiliaryData): ParsedTxAuxiliaryData {
    switch (auxiliaryData.type) {
    case TxAuxiliaryDataType.ARBITRARY_HASH: {
        return {
            type: TxAuxiliaryDataType.ARBITRARY_HASH,
            hashHex: parseHexStringOfLength(auxiliaryData.params.hashHex, AUXILIARY_DATA_HASH_LENGTH, InvalidDataReason.AUXILIARY_DATA_INVALID_HASH),
        }
    }
    case TxAuxiliaryDataType.GOVERNANCE_VOTING_REGISTRATION: {
        return {
            type: TxAuxiliaryDataType.GOVERNANCE_VOTING_REGISTRATION,
            params: parseGovernanceVotingRegistrationParams(network, auxiliaryData.params),
        }
    }
    default:
        throw new InvalidData(InvalidDataReason.AUXILIARY_DATA_UNKNOWN_TYPE)
    }
}

function parseGovernanceVotingDelegation(delegation: GovernanceVotingDelegation): ParsedGovernanceVotingDelegation {
    const weight = parseUint32_t(delegation.weight, InvalidDataReason.GOVERNANCE_VOTING_DELEGATION_INVALID_WEIGHT)

    switch(delegation.type) {
    case GovernanceVotingDelegationType.KEY:
        return {
            type: delegation.type,
            votingPublicKey: parseHexStringOfLength(delegation.votingPublicKeyHex, GOVERNANCE_VOTING_PUBLIC_KEY_LENGTH, InvalidDataReason.GOVERNANCE_VOTING_DELEGATION_INVALID_KEY),
            weight,
        }
    case GovernanceVotingDelegationType.PATH:
        return {
            type: delegation.type,
            votingKeyPath: parseBIP32Path(delegation.votingKeyPath, InvalidDataReason.GOVERNANCE_VOTING_DELEGATION_INVALID_PATH),
            weight,
        }
    default:
        throw new InvalidData(InvalidDataReason.GOVERNANCE_VOTING_DELEGATION_UNKNOWN_DELEGATION_TYPE)
    }
}

function parseGovernanceVotingDelegations(delegations: Array<GovernanceVotingDelegation>): Array<ParsedGovernanceVotingDelegation> {
    validate(isArray(delegations), InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_DELEGATIONS_NOT_ARRAY)
    return delegations.map(d => parseGovernanceVotingDelegation(d))
}

function parseGovernanceVotingRegistrationParams(network: Network, params: GovernanceVotingRegistrationParams): ParsedGovernanceVotingRegistrationParams {
    switch (params.format) {
    case GovernanceVotingRegistrationFormat.CIP_15:
        validate(params.delegations == null, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INCONSISTENT_WITH_CIP15)
        validate(params.votingPublicKeyHex != null, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INCONSISTENT_WITH_CIP15)
        validate(params.votingPurpose == null, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INCONSISTENT_WITH_CIP15)
        break

    case GovernanceVotingRegistrationFormat.CIP_36:
        // exactly one of delegations, votingPublicKeyHex, votingPublicKeyPath must be given
        if (params.delegations != null) {
            validate(params.votingPublicKeyHex == null && params.votingPublicKeyPath == null, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INCONSISTENT_WITH_CIP36)
        } else {
            validate(params.delegations == null, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INCONSISTENT_WITH_CIP36)
            validate(params.votingPublicKeyHex == null || params.votingPublicKeyPath == null, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_BOTH_KEY_AND_PATH)
            validate(params.votingPublicKeyHex != null || params.votingPublicKeyPath != null, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_MISSING_VOTING_KEY)
        }
        break

    default:
        throw new InvalidData(InvalidDataReason.GOVERNANCE_VOTING_DELEGATION_UNKNOWN_FORMAT)
    }

    const votingPublicKey = params.votingPublicKeyHex == null
        ? null
        : parseHexStringOfLength(params.votingPublicKeyHex, GOVERNANCE_VOTING_REGISTRATION_VOTING_VKEY_LENGTH, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INVALID_VOTING_KEY)

    const votingPublicKeyPath = params.votingPublicKeyPath == null
        ? null
        : parseBIP32Path(params.votingPublicKeyPath, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INVALID_VOTING_KEY_PATH)

    const delegations = params.delegations == null
        ? null
        : parseGovernanceVotingDelegations(params.delegations)

    const votingPurpose = params.votingPurpose == null
        ? null
        : parseUint64_str(params.votingPurpose, {}, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INVALID_VOTING_PURPOSE)

    return {
        format: params.format,
        votingPublicKey,
        votingPublicKeyPath,
        delegations,
        stakingPath: parseBIP32Path(params.stakingPath, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INVALID_STAKING_KEY_PATH),
        rewardsDestination: parseTxDestination(network, params.rewardsDestination, false),
        nonce: parseUint64_str(params.nonce, {}, InvalidDataReason.GOVERNANCE_VOTING_REGISTRATION_INVALID_NONCE),
        votingPurpose,
    }
}
import { InvalidData } from "../errors"
import { InvalidDataReason } from "../errors/invalidDataReason"
import type { ParsedCatalystRegistrationParams, ParsedTxAuxiliaryData, ShelleyAddressParams } from "../types/internal"
import { AUXILIARY_DATA_HASH_LENGTH } from "../types/internal"
import type { CatalystRegistrationParams,Network,TxAuxiliaryData } from "../types/public"
import { AddressType } from "../types/public"
import { TxAuxiliaryDataType } from "../types/public"
import { parseBIP32Path, parseHexStringOfLength, parseUint64_str } from "../utils/parse"
import { validate } from "../utils/parse"
import { parseAddress } from "./address"

export const CATALYST_REGISTRATION_VOTING_VKEY_LENGTH = 32

export function parseTxAuxiliaryData(network: Network, auxiliaryData: TxAuxiliaryData): ParsedTxAuxiliaryData {
    switch (auxiliaryData.type) {
    case TxAuxiliaryDataType.ARBITRARY_HASH: {
        return {
            type: TxAuxiliaryDataType.ARBITRARY_HASH,
            hashHex: parseHexStringOfLength(auxiliaryData.params.hashHex, AUXILIARY_DATA_HASH_LENGTH, InvalidDataReason.AUXILIARY_DATA_INVALID_HASH),
        }
    }
    case TxAuxiliaryDataType.CATALYST_REGISTRATION: {
        return {
            type: TxAuxiliaryDataType.CATALYST_REGISTRATION,
            params: parseCatalystRegistrationParams(network, auxiliaryData.params),
        }
    }
    default:
        throw new InvalidData(InvalidDataReason.AUXILIARY_DATA_UNKNOWN_TYPE)
    }
}

function parseCatalystRegistrationParams(network: Network, params: CatalystRegistrationParams): ParsedCatalystRegistrationParams {
    validate(params.rewardsDestination.type !== AddressType.BYRON, InvalidDataReason.CATALYST_REGISTRATION_INVALID_REWARDS_DESTINATION_BYRON)

    return {
        type: TxAuxiliaryDataType.CATALYST_REGISTRATION,
        votingPublicKey: parseHexStringOfLength(params.votingPublicKeyHex, CATALYST_REGISTRATION_VOTING_VKEY_LENGTH, InvalidDataReason.CATALYST_REGISTRATION_INVALID_VOTING_KEY),
        stakingPath: parseBIP32Path(params.stakingPath, InvalidDataReason.CATALYST_REGISTRATION_INVALID_STAKING_KEY_PATH),
        rewardsDestination: parseAddress(network, params.rewardsDestination) as ShelleyAddressParams,
        nonce: parseUint64_str(params.nonce, {}, InvalidDataReason.CATALYST_REGISTRATION_INVALID_NONCE),
    }
}
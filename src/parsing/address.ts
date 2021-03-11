import { InvalidData } from "../errors";
import { InvalidDataReason } from "../errors/invalidDataReason";
import type { ParsedAddressParams } from "../types/internal";
import { AddressType, KEY_HASH_LENGTH, StakingChoiceType } from "../types/internal";
import type { BIP32Path, BlockchainPointer, DeviceOwnedAddress, Network } from "../types/public";
import { parseBIP32Path, parseHexStringOfLength, parseUint32_t, validate } from "../utils/parse";
import { parseNetwork } from "./network";

export function parseAddress(
    network: Network,
    address: DeviceOwnedAddress
): ParsedAddressParams {
    const parsedNetwork = parseNetwork(network)

    // Cast to union of all param fields
    const params = address.params as {
        stakingPath?: BIP32Path
        stakingKeyHashHex?: string
        stakingBlockchainPointer?: BlockchainPointer
    }

    if (address.type === AddressType.BYRON) {
        validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
        validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
        validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

        return {
            type: address.type,
            protocolMagic: parsedNetwork.protocolMagic,
            spendingPath: parseBIP32Path(address.params.spendingPath, InvalidDataReason.ADDRESS_INVALID_SPENDING_PATH),
            stakingChoice: { type: StakingChoiceType.NO_STAKING }
        }
    }

    const networkId = parsedNetwork.networkId
    const spendingPath = parseBIP32Path(address.params.spendingPath, InvalidDataReason.ADDRESS_INVALID_SPENDING_PATH)

    switch (address.type) {
        case AddressType.BASE: {

            validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            const _hash = params.stakingKeyHashHex != null ? 'hash' : ''
            const _path = params.stakingPath != null ? 'path' : ''
            switch (_hash + _path) {
                case 'hash': {
                    const hashHex = parseHexStringOfLength(params.stakingKeyHashHex!, KEY_HASH_LENGTH, InvalidDataReason.ADDRESS_INVALID_STAKING_KEY_HASH)
                    return {
                        type: address.type,
                        networkId,
                        spendingPath,
                        stakingChoice: {
                            type: StakingChoiceType.STAKING_KEY_HASH,
                            hashHex,
                        }
                    }
                }

                case 'path': {
                    const path = parseBIP32Path(params.stakingPath!, InvalidDataReason.ADDRESS_INVALID_STAKING_KEY_PATH)

                    return {
                        type: address.type,
                        networkId,
                        spendingPath,
                        stakingChoice: {
                            type: StakingChoiceType.STAKING_KEY_PATH,
                            path,
                        }
                    }
                }

                default:
                    throw new InvalidData(InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            }
        }
        case AddressType.ENTERPRISE: {
            validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

            return {
                type: address.type,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.NO_STAKING,
                }
            }
        }
        case AddressType.POINTER: {
            validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

            validate(params.stakingBlockchainPointer != null, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER)
            const pointer = params.stakingBlockchainPointer!

            return {
                type: address.type,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.BLOCKCHAIN_POINTER,
                    pointer: {
                        blockIndex: parseUint32_t(pointer.blockIndex, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER),
                        txIndex: parseUint32_t(pointer.txIndex, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER),
                        certificateIndex: parseUint32_t(pointer.certificateIndex, InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER)
                    },
                }
            }
        }
        case AddressType.REWARD: {
            validate(params.stakingBlockchainPointer == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingKeyHashHex == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            validate(params.stakingPath == null, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)

            return {
                type: address.type,
                networkId,
                spendingPath,
                stakingChoice: {
                    type: StakingChoiceType.NO_STAKING
                }
            }
        }
        default:
            throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE);
    }
}

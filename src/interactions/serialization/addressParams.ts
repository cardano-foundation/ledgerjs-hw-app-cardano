import { DeviceVersionUnsupported } from "../../errors"
import { InvalidDataReason } from "../../errors/invalidDataReason"
import type { ParsedAddressParams, SpendingDataSource, StakingDataSource, Uint8_t, Version } from "../../types/internal"
import { SpendingDataSourceType } from "../../types/internal"
import { AddressType, StakingDataSourceType } from "../../types/internal"
import { getVersionString } from "../../utils"
import { assert } from "../../utils/assert"
import { hex_to_buf, path_to_buf, uint8_to_buf, uint32_to_buf } from "../../utils/serialize"
import { getCompatibility } from "../getVersion"

function serializeSpendingDataSource(dataSource: SpendingDataSource): Buffer {
    switch (dataSource.type) {
    case SpendingDataSourceType.PATH:
        return path_to_buf(dataSource.path)
    case SpendingDataSourceType.SCRIPT_HASH:
        return hex_to_buf(dataSource.scriptHash)
    case SpendingDataSourceType.NONE:
        return Buffer.alloc(0)
    }
}

function serializeStakingDataSource(dataSource: StakingDataSource): Buffer {
    const stakingChoicesEncoding = {
        [StakingDataSourceType.NONE]: 0x11,
        [StakingDataSourceType.KEY_PATH]: 0x22,
        [StakingDataSourceType.KEY_HASH]: 0x33,
        [StakingDataSourceType.BLOCKCHAIN_POINTER]: 0x44,
        [StakingDataSourceType.SCRIPT_HASH]: 0x55,
    } as const

    switch (dataSource.type) {
    case StakingDataSourceType.NONE: {
        return Buffer.concat([
            uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
        ])
    }
    case StakingDataSourceType.KEY_HASH: {
        return Buffer.concat([
            uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
            hex_to_buf(dataSource.keyHash),
        ])
    }
    case StakingDataSourceType.SCRIPT_HASH: {
        return Buffer.concat([
            uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
            hex_to_buf(dataSource.scriptHash),
        ])
    }
    case StakingDataSourceType.KEY_PATH: {
        return Buffer.concat([
            uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
            path_to_buf(dataSource.path),
        ])
    }
    case StakingDataSourceType.BLOCKCHAIN_POINTER: {
        return Buffer.concat([
            uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
            uint32_to_buf(dataSource.pointer.blockIndex),
            uint32_to_buf(dataSource.pointer.txIndex),
            uint32_to_buf(dataSource.pointer.certificateIndex),
        ])
    }
    }
}

export function serializeAddressParams(
    params: ParsedAddressParams,
    version: Version,
): Buffer {
    let spending: SpendingDataSource = params.spendingDataSource
    let staking: StakingDataSource = params.stakingDataSource
    if (!getCompatibility(version).supportsMultisigTransaction) {
        if (params.type === AddressType.REWARD_KEY) {
            assert(staking.type === StakingDataSourceType.KEY_PATH, InvalidDataReason.ADDRESS_INVALID_STAKING_INFO)
            spending = {
                type: SpendingDataSourceType.PATH,
                path: staking.path,
            }
            staking = {
                type: StakingDataSourceType.NONE,
            }
        } else if (params.type === AddressType.REWARD_SCRIPT) {
            throw new DeviceVersionUnsupported(`Scripthash based address derivation not supported by Ledger app version ${getVersionString(version)}.`)
        }
    }
    return Buffer.concat([
        uint8_to_buf(params.type as Uint8_t),
        params.type === AddressType.BYRON
            ? uint32_to_buf(params.protocolMagic)
            : uint8_to_buf(params.networkId),
        serializeSpendingDataSource(spending),
        serializeStakingDataSource(staking),
    ])
}

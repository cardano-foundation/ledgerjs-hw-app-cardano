import type {
  ParsedAddressParams,
  SpendingDataSource,
  StakingDataSource,
  Uint8_t,
} from '../../../types/internal'
import {
  AddressType,
  SpendingDataSourceType,
  StakingDataSourceType,
} from '../../../types/internal'
import {unreachable} from '../../../utils/assert'
import {
  hex_to_buf,
  path_to_buf,
  uint8_to_buf,
  uint32_to_buf,
} from '../../../utils/serialize'

function serializeSpendingDataSource(dataSource: SpendingDataSource): Buffer {
  switch (dataSource.type) {
    case SpendingDataSourceType.PATH:
      return path_to_buf(dataSource.path)
    case SpendingDataSourceType.SCRIPT_HASH:
      return hex_to_buf(dataSource.scriptHashHex)
    case SpendingDataSourceType.NONE:
      return Buffer.alloc(0)
    default:
      unreachable(dataSource)
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
    case StakingDataSourceType.NONE:
      return Buffer.concat([
        uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
      ])
    case StakingDataSourceType.KEY_HASH:
      return Buffer.concat([
        uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
        hex_to_buf(dataSource.keyHashHex),
      ])
    case StakingDataSourceType.SCRIPT_HASH:
      return Buffer.concat([
        uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
        hex_to_buf(dataSource.scriptHashHex),
      ])
    case StakingDataSourceType.KEY_PATH:
      return Buffer.concat([
        uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
        path_to_buf(dataSource.path),
      ])
    case StakingDataSourceType.BLOCKCHAIN_POINTER:
      return Buffer.concat([
        uint8_to_buf(stakingChoicesEncoding[dataSource.type] as Uint8_t),
        uint32_to_buf(dataSource.pointer.blockIndex),
        uint32_to_buf(dataSource.pointer.txIndex),
        uint32_to_buf(dataSource.pointer.certificateIndex),
      ])
    default:
      unreachable(dataSource)
  }
}

export function serializeAddressParams(params: ParsedAddressParams): Buffer {
  return Buffer.concat([
    uint8_to_buf(params.type as Uint8_t),
    params.type === AddressType.BYRON
      ? uint32_to_buf(params.protocolMagic)
      : uint8_to_buf(params.networkId),
    serializeSpendingDataSource(params.spendingDataSource),
    serializeStakingDataSource(params.stakingDataSource),
  ])
}

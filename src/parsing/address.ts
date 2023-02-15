import {InvalidData} from '../errors'
import {InvalidDataReason} from '../errors/invalidDataReason'
import type {
  ParsedAddressParams,
  SpendingDataSource,
  StakingDataSource,
} from '../types/internal'
import {
  AddressType,
  KEY_HASH_LENGTH,
  SCRIPT_HASH_LENGTH,
  SpendingDataSourceType,
  StakingDataSourceType,
} from '../types/internal'
import type {
  BIP32Path,
  BlockchainPointer,
  DeviceOwnedAddress,
  Network,
} from '../types/public'
import {
  parseBIP32Path,
  parseHexStringOfLength,
  parseUint32_t,
  validate,
} from '../utils/parse'
import {parseNetwork} from './network'

function extractSpendingDataSource(
  spendingPath?: BIP32Path,
  spendingScriptHash?: string,
): SpendingDataSource {
  if (null != spendingPath) {
    validate(
      spendingScriptHash == null,
      InvalidDataReason.ADDRESS_INVALID_SPENDING_SCRIPT_HASH,
    )
    return {
      type: SpendingDataSourceType.PATH,
      path: parseBIP32Path(
        spendingPath,
        InvalidDataReason.ADDRESS_INVALID_SPENDING_KEY_PATH,
      ),
    }
  }
  if (null != spendingScriptHash) {
    validate(
      spendingPath == null,
      InvalidDataReason.ADDRESS_INVALID_SPENDING_KEY_PATH,
    )
    return {
      type: SpendingDataSourceType.SCRIPT_HASH,
      scriptHashHex: parseHexStringOfLength(
        spendingScriptHash,
        SCRIPT_HASH_LENGTH,
        InvalidDataReason.ADDRESS_INVALID_SPENDING_SCRIPT_HASH,
      ),
    }
  }
  return {
    type: SpendingDataSourceType.NONE,
  }
}

function extractStakingDataSource(
  stakingPath?: BIP32Path,
  stakingKeyHashHex?: string,
  stakingBlockchainPointer?: BlockchainPointer,
  stakingScriptHashHex?: string,
): StakingDataSource {
  if (null != stakingPath) {
    validate(
      stakingKeyHashHex == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingBlockchainPointer == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingScriptHashHex == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    const codedStakingPath = parseBIP32Path(
      stakingPath,
      InvalidDataReason.ADDRESS_INVALID_SPENDING_KEY_PATH,
    )
    return {
      type: StakingDataSourceType.KEY_PATH,
      path: codedStakingPath,
    }
  }
  if (null != stakingKeyHashHex) {
    validate(
      stakingPath == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingBlockchainPointer == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingScriptHashHex == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    const hashHex = parseHexStringOfLength(
      stakingKeyHashHex,
      KEY_HASH_LENGTH,
      InvalidDataReason.ADDRESS_INVALID_STAKING_KEY_HASH,
    )
    return {
      type: StakingDataSourceType.KEY_HASH,
      keyHashHex: hashHex,
    }
  }
  if (null != stakingBlockchainPointer) {
    validate(
      stakingPath == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingKeyHashHex == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingScriptHashHex == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    const pointer = stakingBlockchainPointer
    return {
      type: StakingDataSourceType.BLOCKCHAIN_POINTER,
      pointer: {
        blockIndex: parseUint32_t(
          pointer.blockIndex,
          InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER,
        ),
        txIndex: parseUint32_t(
          pointer.txIndex,
          InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER,
        ),
        certificateIndex: parseUint32_t(
          pointer.certificateIndex,
          InvalidDataReason.ADDRESS_INVALID_BLOCKCHAIN_POINTER,
        ),
      },
    }
  }
  if (null != stakingScriptHashHex) {
    validate(
      stakingPath == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingKeyHashHex == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    validate(
      stakingBlockchainPointer == null,
      InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
    )
    const stakingHash = parseHexStringOfLength(
      stakingScriptHashHex,
      SCRIPT_HASH_LENGTH,
      InvalidDataReason.ADDRESS_INVALID_STAKING_SCRIPT_HASH,
    )
    return {
      type: StakingDataSourceType.SCRIPT_HASH,
      scriptHashHex: stakingHash,
    }
  }
  return {
    type: StakingDataSourceType.NONE,
  }
}

function validateSpendingDataSource(
  addressType: AddressType,
  spending: SpendingDataSource,
) {
  switch (addressType) {
    case AddressType.BASE_PAYMENT_KEY_STAKE_KEY:
    case AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT:
    case AddressType.POINTER_KEY:
    case AddressType.ENTERPRISE_KEY:
    case AddressType.BYRON:
      validate(
        spending.type === SpendingDataSourceType.PATH,
        InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO,
      )
      break
    case AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY:
    case AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT:
    case AddressType.POINTER_SCRIPT:
    case AddressType.ENTERPRISE_SCRIPT:
      validate(
        spending.type === SpendingDataSourceType.SCRIPT_HASH,
        InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO,
      )
      break
    case AddressType.REWARD_KEY:
    case AddressType.REWARD_SCRIPT:
      validate(
        spending.type === SpendingDataSourceType.NONE,
        InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO,
      )
      break
    default:
      throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE)
  }
}

function validateStakingDataSource(
  addressType: AddressType,
  staking: StakingDataSource,
) {
  switch (addressType) {
    case AddressType.BASE_PAYMENT_KEY_STAKE_KEY:
    case AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY:
    case AddressType.REWARD_KEY:
      validate(
        staking.type === StakingDataSourceType.KEY_PATH ||
          staking.type === StakingDataSourceType.KEY_HASH,
        InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
      )
      break
    case AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT:
    case AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT:
    case AddressType.REWARD_SCRIPT:
      validate(
        staking.type === StakingDataSourceType.SCRIPT_HASH,
        InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
      )
      break
    case AddressType.POINTER_KEY:
    case AddressType.POINTER_SCRIPT:
      validate(
        staking.type === StakingDataSourceType.BLOCKCHAIN_POINTER,
        InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
      )
      break
    case AddressType.BYRON:
    case AddressType.ENTERPRISE_KEY:
    case AddressType.ENTERPRISE_SCRIPT:
      validate(
        staking.type === StakingDataSourceType.NONE,
        InvalidDataReason.ADDRESS_INVALID_STAKING_INFO,
      )
      break
    default:
      throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE)
  }
}

export function parseAddress(
  network: Network,
  address: DeviceOwnedAddress,
): ParsedAddressParams {
  const parsedNetwork = parseNetwork(network)

  // Cast to union of all param fields
  const params = address.params as {
    spendingPath?: BIP32Path
    spendingScriptHashHex?: string
    stakingPath?: BIP32Path
    stakingKeyHashHex?: string
    stakingBlockchainPointer?: BlockchainPointer
    stakingScriptHashHex?: string
  }

  // will be cast to 'any' since the extract functions guarantee the type match
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const spendingDataSource = extractSpendingDataSource(
    params.spendingPath,
    params.spendingScriptHashHex,
  )
  const stakingDataSource = extractStakingDataSource(
    params.stakingPath,
    params.stakingKeyHashHex,
    params.stakingBlockchainPointer,
    params.stakingScriptHashHex,
  )
  validateSpendingDataSource(address.type, spendingDataSource)
  validateStakingDataSource(address.type, stakingDataSource)
  if (address.type === AddressType.BYRON) {
    return {
      type: address.type,
      protocolMagic: parsedNetwork.protocolMagic,
      spendingDataSource: spendingDataSource as any,
      stakingDataSource: stakingDataSource as any,
    }
  } else {
    const networkId = parsedNetwork.networkId
    return {
      type: address.type,
      networkId,
      spendingDataSource: spendingDataSource as any,
      stakingDataSource: stakingDataSource as any,
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

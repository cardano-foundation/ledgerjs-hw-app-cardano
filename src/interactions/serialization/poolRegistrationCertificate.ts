import type {
  ParsedPoolKey,
  ParsedPoolMetadata,
  ParsedPoolOwner,
  ParsedPoolParams,
  ParsedPoolRelay,
  ParsedPoolRewardAccount,
  Uint8_t,
  Uint32_t,
} from '../../types/internal'
import {
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  RelayType,
} from '../../types/internal'
import {assert, unreachable} from '../../utils/assert'
import {
  hex_to_buf,
  path_to_buf,
  uint8_to_buf,
  uint16_to_buf,
  uint32_to_buf,
  uint64_to_buf,
} from '../../utils/serialize'

const SignTxIncluded = Object.freeze({
  SIGN_TX_INCLUDED_NO: 1,
  SIGN_TX_INCLUDED_YES: 2,
})

export function serializePoolInitialParams(pool: ParsedPoolParams): Buffer {
  return Buffer.concat([
    uint32_to_buf(pool.owners.length as Uint32_t),
    uint32_to_buf(pool.relays.length as Uint32_t),
  ])
}

export function serializePoolInitialParamsLegacy(
  pool: ParsedPoolParams,
): Buffer {
  return Buffer.concat([
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    serializePoolKeyLegacy(pool.poolKey),
    hex_to_buf(pool.vrfHashHex),
    uint64_to_buf(pool.pledge),
    uint64_to_buf(pool.cost),
    uint64_to_buf(pool.margin.numerator),
    uint64_to_buf(pool.margin.denominator),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    serializePoolRewardAccountLegacy(pool.rewardAccount),
    uint32_to_buf(pool.owners.length as Uint32_t),
    uint32_to_buf(pool.relays.length as Uint32_t),
  ])
}

export function serializeFinancials(pool: ParsedPoolParams): Buffer {
  return Buffer.concat([
    uint64_to_buf(pool.pledge),
    uint64_to_buf(pool.cost),
    uint64_to_buf(pool.margin.numerator),
    uint64_to_buf(pool.margin.denominator),
  ])
}

export function serializePoolKey(key: ParsedPoolKey): Buffer {
  const typeHeader: Record<PoolKeyType, Uint8_t> = {
    [PoolKeyType.DEVICE_OWNED]: 1 as Uint8_t,
    [PoolKeyType.THIRD_PARTY]: 2 as Uint8_t,
  }
  switch (key.type) {
    case PoolKeyType.DEVICE_OWNED: {
      return Buffer.concat([
        uint8_to_buf(typeHeader[key.type]),
        path_to_buf(key.path),
      ])
    }
    case PoolKeyType.THIRD_PARTY: {
      return Buffer.concat([
        uint8_to_buf(typeHeader[key.type]),
        hex_to_buf(key.hashHex),
      ])
    }
    default:
      unreachable(key)
  }
}

export function serializePoolKeyLegacy(key: ParsedPoolKey): Buffer {
  assert(
    key.type === PoolKeyType.THIRD_PARTY,
    'invalid pool key type for legacy Ledger version',
  )
  return hex_to_buf(key.hashHex)
}

export function serializePoolOwner(owner: ParsedPoolOwner): Buffer {
  const typeHeader: Record<PoolOwnerType, Uint8_t> = {
    [PoolOwnerType.DEVICE_OWNED]: 1 as Uint8_t,
    [PoolOwnerType.THIRD_PARTY]: 2 as Uint8_t,
  }
  switch (owner.type) {
    case PoolOwnerType.DEVICE_OWNED: {
      return Buffer.concat([
        uint8_to_buf(typeHeader[owner.type]),
        path_to_buf(owner.path),
      ])
    }
    case PoolOwnerType.THIRD_PARTY: {
      return Buffer.concat([
        uint8_to_buf(typeHeader[owner.type]),
        hex_to_buf(owner.hashHex),
      ])
    }
    default:
      unreachable(owner)
  }
}

export function serializePoolRewardAccount(
  rewardAccount: ParsedPoolRewardAccount,
): Buffer {
  const typeHeader: Record<PoolRewardAccountType, Uint8_t> = {
    [PoolRewardAccountType.DEVICE_OWNED]: 1 as Uint8_t,
    [PoolRewardAccountType.THIRD_PARTY]: 2 as Uint8_t,
  }
  switch (rewardAccount.type) {
    case PoolRewardAccountType.DEVICE_OWNED: {
      return Buffer.concat([
        uint8_to_buf(typeHeader[rewardAccount.type]),
        path_to_buf(rewardAccount.path),
      ])
    }
    case PoolRewardAccountType.THIRD_PARTY: {
      return Buffer.concat([
        uint8_to_buf(typeHeader[rewardAccount.type]),
        hex_to_buf(rewardAccount.rewardAccountHex),
      ])
    }
    default:
      unreachable(rewardAccount)
  }
}

export function serializePoolRewardAccountLegacy(
  rewardAccount: ParsedPoolRewardAccount,
): Buffer {
  assert(
    rewardAccount.type === PoolRewardAccountType.THIRD_PARTY,
    'invalid pool reward account type for legacy Ledger version',
  )
  return hex_to_buf(rewardAccount.rewardAccountHex)
}

export function serializePoolRelay(relay: ParsedPoolRelay): Buffer {
  function serializeOptional<T>(x: T | null, cb: (t: T) => Buffer): Buffer {
    const enum Optional {
      NONE = 1,
      SOME = 2,
    }

    if (x == null) {
      return Buffer.concat([uint8_to_buf(Optional.NONE as Uint8_t)])
    } else {
      return Buffer.concat([uint8_to_buf(Optional.SOME as Uint8_t), cb(x)])
    }
  }

  switch (relay.type) {
    case RelayType.SINGLE_HOST_IP_ADDR: {
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        serializeOptional(relay.port, (port) => uint16_to_buf(port)),
        serializeOptional(relay.ipv4, (ipv4) => ipv4),
        serializeOptional(relay.ipv6, (ipv6) => ipv6),
      ])
    }
    case RelayType.SINGLE_HOST_HOSTNAME: {
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        serializeOptional(relay.port, (port) => uint16_to_buf(port)),
        Buffer.from(relay.dnsName, 'ascii'),
      ])
    }
    case RelayType.MULTI_HOST: {
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        Buffer.from(relay.dnsName, 'ascii'),
      ])
    }
    default:
      unreachable(relay)
  }
}

export function serializePoolMetadata(
  metadata: ParsedPoolMetadata | null,
): Buffer {
  if (metadata == null) {
    return Buffer.concat([
      uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_NO as Uint8_t),
    ])
  } else {
    return Buffer.concat([
      uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_YES as Uint8_t),
      hex_to_buf(metadata.hashHex),
      Buffer.from(metadata.url, 'ascii'),
    ])
  }
}

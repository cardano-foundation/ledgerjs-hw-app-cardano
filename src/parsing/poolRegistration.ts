import {InvalidData} from '../errors'
import {InvalidDataReason} from '../errors/invalidDataReason'
import type {
  ParsedMargin,
  ParsedPoolKey,
  ParsedPoolMetadata,
  ParsedPoolOwner,
  ParsedPoolParams,
  ParsedPoolRelay,
  ParsedPoolRewardAccount,
  Uint16_t,
  Uint64_str,
  VarlenAsciiString,
} from '../types/internal'
import {
  AUXILIARY_DATA_HASH_LENGTH,
  KEY_HASH_LENGTH,
  RelayType,
  REWARD_ACCOUNT_HEX_LENGTH,
  VRF_KEY_HASH_LENGTH,
} from '../types/internal'
import type {
  MultiHostRelayParams,
  PoolKey,
  PoolMetadataParams,
  PoolOwner,
  PoolRegistrationParams,
  PoolRewardAccount,
  Relay,
  SingleHostHostnameRelayParams,
  SingleHostIpAddrRelayParams,
} from '../types/public'
import {
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
} from '../types/public'
import {
  isHexStringOfLength,
  isString,
  isUint8,
  isUint16,
  parseAscii,
  parseBIP32Path,
  parseHexStringOfLength,
  parseIntFromStr,
  parseUint64_str,
  validate,
} from '../utils/parse'
import {hex_to_buf} from '../utils/serialize'
import {
  MAX_LOVELACE_SUPPLY_STR,
  POOL_REGISTRATION_OWNERS_MAX,
  POOL_REGISTRATION_RELAYS_MAX,
} from './constants'

function parseMargin(params: PoolRegistrationParams['margin']): ParsedMargin {
  const POOL_MARGIN_DENOMINATOR_MAX_STR = '1 000 000 000 000 000 000'.replace(
    /[ ]/,
    '',
  )

  const marginDenominator = parseUint64_str(
    params.denominator,
    {max: POOL_MARGIN_DENOMINATOR_MAX_STR},
    InvalidDataReason.POOL_REGISTRATION_INVALID_MARGIN_DENOMINATOR,
  )

  const marginNumerator = parseUint64_str(
    params.numerator,
    {max: marginDenominator},
    InvalidDataReason.POOL_REGISTRATION_INVALID_MARGIN,
  )

  return {
    numerator: marginNumerator as Uint64_str,
    denominator: marginDenominator as Uint64_str,
  }
}

function parsePoolKey(poolKey: PoolKey): ParsedPoolKey {
  switch (poolKey.type) {
    case PoolKeyType.DEVICE_OWNED: {
      const params = poolKey.params
      const path = parseBIP32Path(
        params.path,
        InvalidDataReason.POOL_KEY_INVALID_PATH,
      )

      return {
        type: PoolKeyType.DEVICE_OWNED,
        path,
      }
    }
    case PoolKeyType.THIRD_PARTY: {
      const params = poolKey.params
      const hashHex = parseHexStringOfLength(
        params.keyHashHex,
        KEY_HASH_LENGTH,
        InvalidDataReason.POOL_KEY_INVALID_KEY_HASH,
      )

      return {
        type: PoolKeyType.THIRD_PARTY,
        hashHex,
      }
    }
    default:
      throw new InvalidData(InvalidDataReason.POOL_KEY_INVALID_TYPE)
  }
}

function parsePoolOwnerParams(poolOwner: PoolOwner): ParsedPoolOwner {
  switch (poolOwner.type) {
    case PoolOwnerType.DEVICE_OWNED: {
      const params = poolOwner.params
      const path = parseBIP32Path(
        params.stakingPath,
        InvalidDataReason.POOL_OWNER_INVALID_PATH,
      )

      return {
        type: PoolOwnerType.DEVICE_OWNED,
        path,
      }
    }
    case PoolOwnerType.THIRD_PARTY: {
      const params = poolOwner.params
      const hashHex = parseHexStringOfLength(
        params.stakingKeyHashHex,
        KEY_HASH_LENGTH,
        InvalidDataReason.POOL_OWNER_INVALID_KEY_HASH,
      )

      return {
        type: PoolOwnerType.THIRD_PARTY,
        hashHex,
      }
    }
    default:
      throw new InvalidData(InvalidDataReason.POOL_OWNER_INVALID_TYPE)
  }
}

function parseRewardAccount(
  poolRewardAccount: PoolRewardAccount,
): ParsedPoolRewardAccount {
  switch (poolRewardAccount.type) {
    case PoolRewardAccountType.DEVICE_OWNED: {
      const params = poolRewardAccount.params
      const path = parseBIP32Path(
        params.path,
        InvalidDataReason.POOL_REWARD_ACCOUNT_INVALID_PATH,
      )

      return {
        type: PoolRewardAccountType.DEVICE_OWNED,
        path,
      }
    }
    case PoolRewardAccountType.THIRD_PARTY: {
      const params = poolRewardAccount.params
      const rewardAccountHex = parseHexStringOfLength(
        params.rewardAccountHex,
        REWARD_ACCOUNT_HEX_LENGTH,
        InvalidDataReason.POOL_REWARD_ACCOUNT_INVALID_HEX,
      )

      return {
        type: PoolRewardAccountType.THIRD_PARTY,
        rewardAccountHex,
      }
    }
    default:
      throw new InvalidData(InvalidDataReason.POOL_REWARD_ACCOUNT_INVALID_TYPE)
  }
}

function parsePort(portNumber: number, errMsg: InvalidDataReason): Uint16_t {
  validate(isUint16(portNumber), errMsg)
  return portNumber
}

function parseIPv4(ipv4: string, errMsg: InvalidDataReason): Buffer {
  validate(isString(ipv4), errMsg)
  const ipParts = ipv4.split('.')
  validate(ipParts.length === 4, errMsg)

  const ipBytes = Buffer.alloc(4)
  for (let i = 0; i < 4; i++) {
    const ipPart = parseIntFromStr(
      ipParts[i],
      InvalidDataReason.RELAY_INVALID_IPV4,
    )
    validate(isUint8(ipPart), errMsg)
    ipBytes.writeUInt8(ipPart, i)
  }
  return ipBytes
}

// FIXME(ppershing): This is terrible and wrong implementation
function parseIPv6(ipv6: string, errMsg: InvalidDataReason): Buffer {
  validate(isString(ipv6), errMsg)
  const ipHex = ipv6.split(':').join('')
  validate(isHexStringOfLength(ipHex, 16), errMsg)
  return hex_to_buf(ipHex)
}

function parseDnsName(
  dnsName: string,
  errMsg: InvalidDataReason,
): VarlenAsciiString {
  validate(isString(dnsName), errMsg)
  validate(dnsName.length <= 64, errMsg)
  validate(dnsName.length > 0, errMsg)
  // eslint-disable-next-line no-control-regex
  validate(/^[\x00-\x7F]*$/.test(dnsName), errMsg)
  validate(
    dnsName
      .split('')
      .every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126),
    errMsg,
  )
  return dnsName as VarlenAsciiString
}

function parsePoolRelayParams(relayParams: Relay): ParsedPoolRelay {
  switch (relayParams.type) {
    case RelayType.SINGLE_HOST_IP_ADDR: {
      const params = relayParams.params as SingleHostIpAddrRelayParams
      return {
        type: RelayType.SINGLE_HOST_IP_ADDR,
        port:
          'portNumber' in params && params.portNumber != null
            ? parsePort(params.portNumber, InvalidDataReason.RELAY_INVALID_PORT)
            : null,
        ipv4:
          'ipv4' in params && params.ipv4 != null
            ? parseIPv4(params.ipv4, InvalidDataReason.RELAY_INVALID_IPV4)
            : null,
        ipv6:
          'ipv6' in params && params.ipv6 != null
            ? parseIPv6(params.ipv6, InvalidDataReason.RELAY_INVALID_IPV6)
            : null,
      }
    }
    case RelayType.SINGLE_HOST_HOSTNAME: {
      const params = relayParams.params as SingleHostHostnameRelayParams

      return {
        type: RelayType.SINGLE_HOST_HOSTNAME,
        port:
          'portNumber' in params && params.portNumber != null
            ? parsePort(params.portNumber, InvalidDataReason.RELAY_INVALID_PORT)
            : null,
        dnsName: parseDnsName(
          params.dnsName,
          InvalidDataReason.RELAY_INVALID_DNS,
        ),
      }
    }
    case RelayType.MULTI_HOST: {
      const params = relayParams.params as MultiHostRelayParams
      return {
        type: RelayType.MULTI_HOST,
        dnsName: parseDnsName(
          params.dnsName,
          InvalidDataReason.RELAY_INVALID_DNS,
        ),
      }
    }
    default:
      throw new InvalidData(InvalidDataReason.RELAY_INVALID_TYPE)
  }
}

function parsePoolMetadataParams(
  params: PoolMetadataParams,
): ParsedPoolMetadata {
  const url = parseAscii(
    params.metadataUrl,
    InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL,
  )
  // Additional length check
  validate(
    url.length <= 64,
    InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL,
  )

  const hashHex = parseHexStringOfLength(
    params.metadataHashHex,
    AUXILIARY_DATA_HASH_LENGTH,
    InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_HASH,
  )

  return {
    url,
    hashHex,
    __brand: 'pool_metadata' as const,
  }
}

export function parsePoolParams(
  params: PoolRegistrationParams,
): ParsedPoolParams {
  const poolKey = parsePoolKey(params.poolKey)
  const vrfHashHex = parseHexStringOfLength(
    params.vrfKeyHashHex,
    VRF_KEY_HASH_LENGTH,
    InvalidDataReason.POOL_REGISTRATION_INVALID_VRF_KEY_HASH,
  )
  const pledge = parseUint64_str(
    params.pledge,
    {max: MAX_LOVELACE_SUPPLY_STR},
    InvalidDataReason.POOL_REGISTRATION_INVALID_PLEDGE,
  )
  const cost = parseUint64_str(
    params.cost,
    {max: MAX_LOVELACE_SUPPLY_STR},
    InvalidDataReason.POOL_REGISTRATION_INVALID_COST,
  )
  const margin = parseMargin(params.margin)
  const rewardAccount = parseRewardAccount(params.rewardAccount)

  const owners = params.poolOwners.map((owner) => parsePoolOwnerParams(owner))
  const relays = params.relays.map((relay) => parsePoolRelayParams(relay))
  const metadata =
    params.metadata == null ? null : parsePoolMetadataParams(params.metadata)

  // Additional checks
  validate(
    owners.length <= POOL_REGISTRATION_OWNERS_MAX,
    InvalidDataReason.POOL_REGISTRATION_OWNERS_TOO_MANY,
  )
  validate(
    relays.length <= POOL_REGISTRATION_RELAYS_MAX,
    InvalidDataReason.POOL_REGISTRATION_RELAYS_TOO_MANY,
  )

  return {
    poolKey,
    vrfHashHex,
    pledge,
    cost,
    margin,
    rewardAccount,
    owners,
    relays,
    metadata,
  }
}

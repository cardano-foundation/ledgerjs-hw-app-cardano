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
  VarLenAsciiString,
} from '../types/internal'
import {
  KEY_HASH_LENGTH,
  POOL_METADATA_HASH_LENGTH,
  RelayType,
  REWARD_ACCOUNT_HEX_LENGTH,
  VRF_KEY_HASH_LENGTH,
  MAX_DNS_NAME_LENGTH,
  MAX_URL_LENGTH,
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
  isString,
  isUint8,
  isUint16,
  parseAscii,
  parseBIP32Path,
  parseHexStringOfLength,
  parseIntFromStr,
  parseUint64_str,
  validate,
  parseCoin,
} from '../utils/parse'
import {
  POOL_REGISTRATION_OWNERS_MAX,
  POOL_REGISTRATION_RELAYS_MAX,
} from './constants'

function parseMargin(params: PoolRegistrationParams['margin']): ParsedMargin {
  const POOL_MARGIN_DENOMINATOR_MAX_STR = '1 000 000 000 000 000 000'.replace(
    /[ ]/g,
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

function parseIPv6Section(
  section: string,
  allowEmbeddedIPv4: boolean,
  errMsg: InvalidDataReason,
): Buffer[] {
  if (section === '') return []

  const parts = section.split(':')
  validate(
    parts.every((part) => part.length > 0),
    errMsg,
  )

  return parts.map((part, index) => {
    const isEmbeddedIPv4 = part.includes('.')
    validate(
      !isEmbeddedIPv4 || (allowEmbeddedIPv4 && index === parts.length - 1),
      errMsg,
    )

    if (isEmbeddedIPv4) {
      return parseIPv4(part, errMsg)
    }

    validate(/^[0-9a-fA-F]{1,4}$/.test(part), errMsg)
    const group = parseInt(part, 16)
    const groupBytes = Buffer.alloc(2)
    groupBytes.writeUInt16BE(group, 0)
    return groupBytes
  })
}

function parseIPv6(ipv6: string, errMsg: InvalidDataReason): Buffer {
  validate(isString(ipv6), errMsg)

  const doubleColonIndex = ipv6.indexOf('::')
  const hasCompression = doubleColonIndex !== -1
  validate(
    !hasCompression || doubleColonIndex === ipv6.lastIndexOf('::'),
    errMsg,
  )

  const [leftSection, rightSection = ''] = hasCompression
    ? ipv6.split('::')
    : [ipv6]

  const leftChunks = parseIPv6Section(leftSection, !hasCompression, errMsg)
  const rightChunks = hasCompression
    ? parseIPv6Section(rightSection, true, errMsg)
    : []

  const leftLengthInWords = leftChunks.reduce(
    (sum, chunk) => sum + chunk.length / 2,
    0,
  )
  const rightLengthInWords = rightChunks.reduce(
    (sum, chunk) => sum + chunk.length / 2,
    0,
  )

  validate(leftLengthInWords + rightLengthInWords <= 8, errMsg)

  if (hasCompression) {
    const missingWords = 8 - leftLengthInWords - rightLengthInWords
    validate(missingWords > 0, errMsg)
    return Buffer.concat([
      ...leftChunks,
      Buffer.alloc(missingWords * 2),
      ...rightChunks,
    ])
  }

  validate(leftLengthInWords === 8, errMsg)
  return Buffer.concat(leftChunks)
}

function parseDnsName(
  dnsName: string,
  errMsg: InvalidDataReason,
): VarLenAsciiString {
  validate(isString(dnsName), errMsg)
  validate(dnsName.length <= MAX_DNS_NAME_LENGTH, errMsg)
  validate(dnsName.length > 0, errMsg)
  // eslint-disable-next-line no-control-regex
  validate(/^[\x00-\x7F]*$/.test(dnsName), errMsg)
  validate(
    dnsName
      .split('')
      .every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126),
    errMsg,
  )
  return dnsName as VarLenAsciiString
}

function parsePoolRelayParams(relayParams: Relay): ParsedPoolRelay {
  switch (relayParams.type) {
    case RelayType.SINGLE_HOST_IP_ADDR: {
      const params = relayParams.params as SingleHostIpAddrRelayParams
      const ipv4 =
        'ipv4' in params && params.ipv4 != null
          ? parseIPv4(params.ipv4, InvalidDataReason.RELAY_INVALID_IPV4)
          : null
      const ipv6 =
        'ipv6' in params && params.ipv6 != null
          ? parseIPv6(params.ipv6, InvalidDataReason.RELAY_INVALID_IPV6)
          : null
      validate(
        ipv4 != null || ipv6 != null,
        InvalidDataReason.RELAY_SINGLE_HOST_IP_MISSING_BOTH_ADDRESSES,
      )
      return {
        type: RelayType.SINGLE_HOST_IP_ADDR,
        port:
          'portNumber' in params && params.portNumber != null
            ? parsePort(params.portNumber, InvalidDataReason.RELAY_INVALID_PORT)
            : null,
        ipv4,
        ipv6,
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
    url.length <= MAX_URL_LENGTH,
    InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL,
  )

  const hashHex = parseHexStringOfLength(
    params.metadataHashHex,
    POOL_METADATA_HASH_LENGTH,
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
  const pledge = parseCoin(
    params.pledge,
    InvalidDataReason.POOL_REGISTRATION_INVALID_PLEDGE,
  )
  const cost = parseCoin(
    params.cost,
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

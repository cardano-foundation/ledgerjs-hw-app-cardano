import {InvalidDataReason} from '../errors/invalidDataReason'
import type {ParsedNetwork} from '../types/internal'
import type {Network} from '../types/public'
import {validate, parseUint8_t, parseUint32_t} from '../utils/parse'

export function parseNetwork(network: Network): ParsedNetwork {
  const parsed = {
    protocolMagic: parseUint32_t(
      network.protocolMagic,
      InvalidDataReason.NETWORK_INVALID_PROTOCOL_MAGIC,
    ),
    networkId: parseUint8_t(
      network.networkId,
      InvalidDataReason.NETWORK_INVALID_NETWORK_ID,
    ),
  }
  validate(
    parsed.networkId <= 0b00001111,
    InvalidDataReason.NETWORK_INVALID_NETWORK_ID,
  )
  return parsed
}

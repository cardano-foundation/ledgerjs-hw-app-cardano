import type {
  HexString,
  ParsedDatum,
  ParsedOutput,
  ParsedOutputDestination,
  Uint8_t,
  Uint32_t,
} from '../../types/internal'
import {TxOutputDestinationType} from '../../types/internal'
import type {Version} from '../../types/public'
import {DatumType} from '../../types/public'
import {unreachable} from '../../utils/assert'
import {
  hex_to_buf,
  serializeOptionFlag,
  uint8_to_buf,
  uint32_to_buf,
  serializeCoin,
} from '../../utils/serialize'
import {getCompatibility} from '../getVersion'
import {serializeAddressParams} from './addressParams'

// should be the same as in the Ledger app
export const MAX_CHUNK_SIZE = 240

export function serializeTxOutputDestination(
  destination: ParsedOutputDestination,
  version: Version,
) {
  const typeEncoding = {
    [TxOutputDestinationType.THIRD_PARTY]: 1 as Uint8_t,
    [TxOutputDestinationType.DEVICE_OWNED]: 2 as Uint8_t,
  }

  switch (destination.type) {
    case TxOutputDestinationType.THIRD_PARTY:
      return Buffer.concat([
        uint8_to_buf(typeEncoding[destination.type]),
        uint32_to_buf((destination.addressHex.length / 2) as Uint32_t),
        hex_to_buf(destination.addressHex),
      ])
    case TxOutputDestinationType.DEVICE_OWNED:
      return Buffer.concat([
        uint8_to_buf(typeEncoding[destination.type]),
        serializeAddressParams(destination.addressParams, version),
      ])
    default:
      unreachable(destination)
  }
}

export function serializeTxOutputBasicParams(
  output: ParsedOutput,
  version: Version,
): Buffer {
  const serializationFormatBuffer = getCompatibility(version).supportsBabbage
    ? uint8_to_buf(output.format as Uint8_t)
    : Buffer.from([])

  const includeDatumBuffer = getCompatibility(version).supportsAlonzo
    ? serializeOptionFlag(output.datum != null)
    : Buffer.from([])

  const includeScriptBuffer = getCompatibility(version).supportsBabbage
    ? serializeOptionFlag(output.referenceScriptHex != null)
    : Buffer.from([])

  return Buffer.concat([
    serializationFormatBuffer,
    serializeTxOutputDestination(output.destination, version),
    serializeCoin(output.amount),
    uint32_to_buf(output.tokenBundle.length as Uint32_t),
    includeDatumBuffer,
    includeScriptBuffer,
  ])
}

export function serializeTxOutputDatum(
  datum: ParsedDatum,
  version: Version,
): Buffer {
  switch (datum.type) {
    case DatumType.HASH: {
      // Do not include datum option for legacy version
      const datumHashBuffer = getCompatibility(version).supportsBabbage
        ? uint8_to_buf(DatumType.HASH as Uint8_t)
        : Buffer.concat([])

      return Buffer.concat([datumHashBuffer, hex_to_buf(datum.datumHashHex)])
    }

    case DatumType.INLINE: {
      const totalDatumSize = datum.datumHex.length / 2
      let chunkHex: HexString

      if (totalDatumSize > MAX_CHUNK_SIZE) {
        chunkHex = datum.datumHex.substring(0, MAX_CHUNK_SIZE * 2) as HexString
      } else {
        chunkHex = datum.datumHex
      }
      const chunkSize = chunkHex.length / 2

      return Buffer.concat([
        uint8_to_buf(DatumType.INLINE as Uint8_t),
        uint32_to_buf(totalDatumSize as Uint32_t),
        uint32_to_buf(chunkSize as Uint32_t), // first chunk
        hex_to_buf(chunkHex),
      ])
    }

    default:
      return unreachable(datum)
  }
}

export function serializeTxOutputRefScript(
  referenceScriptHex: HexString,
): Buffer {
  const totalScriptSize = referenceScriptHex.length / 2
  let chunkHex: HexString

  if (totalScriptSize > MAX_CHUNK_SIZE) {
    chunkHex = referenceScriptHex.substring(0, MAX_CHUNK_SIZE * 2) as HexString
  } else {
    chunkHex = referenceScriptHex
  }
  const chunkSize = chunkHex.length / 2

  return Buffer.concat([
    uint32_to_buf(totalScriptSize as Uint32_t),
    uint32_to_buf(chunkSize as Uint32_t), // first chunk
    hex_to_buf(chunkHex),
  ])
}

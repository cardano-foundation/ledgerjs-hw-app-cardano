import {
  base58_encode,
  bech32_decodeAddress,
  bech32_encodeAddress,
} from './utils/address'
import type {Version} from './types/public'
import {assert} from './utils/assert'
import {isArray, isBuffer, isInteger} from './utils/parse'
import {buf_to_hex, buf_to_uint16, hex_to_buf} from './utils/serialize'

const sum = (arr: Array<number>) => arr.reduce((x, y) => x + y, 0)

export function chunkBy(data: Buffer, chunkLengths: Array<number>): Buffer[] {
  assert(isBuffer(data), 'invalid buffer')
  assert(isArray(chunkLengths), 'invalid chunks')
  for (const len of chunkLengths) {
    assert(isInteger(len), 'bad chunk length')
    assert(len > 0, 'bad chunk length')
  }
  assert(data.length <= sum(chunkLengths), 'data too short')

  let offset = 0
  const result = []

  const restLength = data.length - sum(chunkLengths)

  for (const c of [...chunkLengths, restLength]) {
    result.push(data.subarray(offset, offset + c))

    offset += c
  }

  return result
}

export function stripRetcodeFromResponse(response: Buffer): Buffer {
  assert(isBuffer(response), 'invalid buffer')
  assert(response.length >= 2, 'response too short')

  const L = response.length - 2
  const retcode = buf_to_uint16(response.subarray(L, L + 2))
  assert(retcode === 0x9000, `Invalid retcode ${retcode}`)
  return response.subarray(0, L)
}

export default {
  // reexporting for tests
  hex_to_buf,
  buf_to_hex,

  assert,

  base58_encode,

  bech32_encodeAddress,
  bech32_decodeAddress,

  chunkBy,
  stripRetcodeFromResponse,
}

export function getVersionString(version: Version): string {
  return `${version.major}.${version.minor}.${version.patch}`
}

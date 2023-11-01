import {MAX_LOVELACE_SUPPLY_STR} from '../parsing/constants'
import {InvalidData, InvalidDataReason} from '../errors/index'
import type {
  _Int64_bigint,
  _Int64_num,
  _Uint64_bigint,
  _Uint64_num,
  FixLenHexString,
  HexString,
  Int64_str,
  ParsedCredential,
  Uint8_t,
  Uint16_t,
  Uint32_t,
  Uint64_str,
  ValidBIP32Path,
  VarLenAsciiString,
  ParsedAnchor,
} from '../types/internal'
import {
  ANCHOR_HASH_LENGTH,
  KEY_HASH_LENGTH,
  SCRIPT_HASH_LENGTH,
  CredentialType,
  MAX_URL_LENGTH,
} from '../types/internal'
import type {AnchorParams, bigint_like, CredentialParams} from '../types/public'
import {CredentialParamsType} from '../types/public'
import {unreachable} from './assert'

export const MAX_UINT_64_STR = '18446744073709551615'
export const MIN_INT_64_STR = '-9223372036854775808'
export const MAX_INT_64_STR = '9223372036854775807'

export const isString = (data: unknown): data is string =>
  typeof data === 'string'

export const isInteger = (data: unknown): data is number =>
  Number.isInteger(data)

export const isArray = (data: unknown): data is Array<unknown> =>
  Array.isArray(data)

export const isBuffer = (data: unknown): data is Buffer => Buffer.isBuffer(data)

export const isUint32 = (data: unknown): data is Uint32_t =>
  isInteger(data) && data >= 0 && data <= 4294967295

export const isUint16 = (data: unknown): data is Uint16_t =>
  isInteger(data) && data >= 0 && data <= 65535

export const isUint8 = (data: unknown): data is Uint8_t =>
  isInteger(data) && data >= 0 && data <= 255

export const isHexString = (data: unknown): data is HexString =>
  isString(data) && data.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(data)

export const isHexStringOfLength = <L extends number>(
  data: unknown,
  expectedByteLength: L,
): data is FixLenHexString<L> =>
  isHexString(data) && data.length === expectedByteLength * 2

export const isValidPath = (data: unknown): data is ValidBIP32Path =>
  isArray(data) && data.every((x) => isUint32(x)) && data.length <= 5

export const isUintStr = (
  data: unknown,
  constraints: {min?: string; max?: string},
): data is string => {
  const min = constraints.min ?? '0'
  const max = constraints.max ?? MAX_UINT_64_STR

  return (
    isString(data) &&
    /^[0-9]*$/.test(data) &&
    // Length checks
    data.length > 0 &&
    data.length <= max.length &&
    // Leading zeros
    (data.length === 1 || data[0] !== '0') &&
    // less or equal than max value
    (data.length < max.length ||
      // Note: this is string comparison!
      data <= max) &&
    (data.length > min.length ||
      // Note: this is string comparison!
      data >= min)
  )
}

export const isUint64str = (data: unknown): data is Uint64_str =>
  isUintStr(data, {})

export const isUint64Number = (data: unknown): data is _Uint64_num =>
  isInteger(data) && data >= 0 && data <= Number.MAX_SAFE_INTEGER

export const isUint64Bigint = (data: unknown): data is _Uint64_bigint =>
  typeof data === 'bigint' && isUint64str(data.toString())

export const isIntStr = (
  data: unknown,
  constraints: {min?: string; max?: string},
): data is string => {
  const min = constraints.min ?? MIN_INT_64_STR
  const max = constraints.max ?? MAX_INT_64_STR

  const hasValidFormat =
    isString(data) &&
    // check format via RegExp
    /^-?[0-9]*$/.test(data) &&
    // Length checks
    data.length > 0

  const isValidNegativeNumber =
    isString(data) &&
    data.startsWith('-') &&
    // leading zeros
    (data.length === 2 || data[1] !== '0') &&
    // if number is negative: greater or equal than min value (Note: this is string comparison!)
    (data.length < min.length || data <= min)
  const isValidPositiveNumber =
    isString(data) &&
    !data.startsWith('-') &&
    // leading zeros
    (data.length === 1 || data[0] !== '0') &&
    // if number is positive: less or equal than max value (Note: this is string comparison!)
    (data.length < max.length || data <= max)

  return hasValidFormat && (isValidNegativeNumber || isValidPositiveNumber)
}

export const isInt64str = (data: unknown): data is Int64_str =>
  isIntStr(data, {})

export const isInt64Number = (data: unknown): data is _Int64_num =>
  isInteger(data) &&
  data >= Number.MIN_SAFE_INTEGER &&
  data <= Number.MAX_SAFE_INTEGER

export const isInt64Bigint = (data: unknown): data is _Int64_bigint =>
  typeof data === 'bigint' && isInt64str(data.toString())

export function validate(
  cond: boolean,
  errMsg: InvalidDataReason,
): asserts cond {
  if (!cond) throw new InvalidData(errMsg)
}

export function parseAscii(
  str: unknown,
  errMsg: InvalidDataReason,
): VarLenAsciiString {
  validate(isString(str), errMsg)
  validate(
    str.split('').every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126),
    errMsg,
  )
  return str as VarLenAsciiString
}

export function parseHexString(
  str: unknown,
  errMsg: InvalidDataReason,
): HexString {
  validate(isHexString(str), errMsg)
  return str
}

export function parseHexStringOfLength<L extends number>(
  str: unknown,
  length: L,
  errMsg: InvalidDataReason,
): FixLenHexString<L> {
  validate(isHexStringOfLength(str, length), errMsg)
  return str
}

export function parseInt64_str(
  val: unknown,
  constraints: {min?: string; max?: string},
  errMsg: InvalidDataReason,
): Int64_str {
  switch (typeof val) {
    case 'string':
      validate(isInt64str(val) && isIntStr(val, constraints), errMsg)
      return val
    case 'number':
      validate(
        isInt64Number(val) && isIntStr(val.toString(), constraints),
        errMsg,
      )
      return val.toString() as Int64_str
    case 'bigint':
      validate(
        isInt64Bigint(val) && isIntStr(val.toString(), constraints),
        errMsg,
      )
      return val.toString() as Int64_str
    default:
      validate(false, errMsg)
  }
}

export function parseUint64_str(
  val: unknown,
  constraints: {min?: string; max?: string},
  errMsg: InvalidDataReason,
): Uint64_str {
  switch (typeof val) {
    case 'string':
      validate(isUint64str(val) && isUintStr(val, constraints), errMsg)
      return val
    case 'number':
      validate(
        isUint64Number(val) && isUintStr(val.toString(), constraints),
        errMsg,
      )
      return val.toString() as Uint64_str
    case 'bigint':
      validate(
        isUint64Bigint(val) && isUintStr(val.toString(), constraints),
        errMsg,
      )
      return val.toString() as Uint64_str
    default:
      validate(false, errMsg)
  }
}

export function parseUint32_t(
  value: unknown,
  errMsg: InvalidDataReason,
): Uint32_t {
  validate(isUint32(value), errMsg)
  return value
}

export function parseUint16_t(
  value: unknown,
  errMsg: InvalidDataReason,
): Uint16_t {
  validate(isUint16(value), errMsg)
  return value
}

export function parseUint8_t(
  value: number,
  errMsg: InvalidDataReason,
): Uint8_t {
  validate(isUint8(value), errMsg)
  return value
}

export function parseBIP32Path(
  value: unknown,
  errMsg: InvalidDataReason,
): ValidBIP32Path {
  validate(isValidPath(value), errMsg)
  return value
}

export function parseIntFromStr(
  str: string,
  errMsg: InvalidDataReason,
): number {
  validate(isString(str), errMsg)
  const i = parseInt(str, 10)
  // Check that we parsed everything
  validate(`${i}` === str, errMsg)
  // Could be invalid
  validate(!isNaN(i), errMsg)
  // Could still be float
  validate(isInteger(i), errMsg)
  return i
}

export function parseCoin(
  coin: bigint_like,
  errMsg: InvalidDataReason,
): Uint64_str {
  return parseUint64_str(coin, {max: MAX_LOVELACE_SUPPLY_STR}, errMsg)
}

export function parseCredential(
  credential: CredentialParams,
  errMsg: InvalidDataReason,
): ParsedCredential {
  switch (credential.type) {
    case CredentialParamsType.KEY_PATH:
      return {
        type: CredentialType.KEY_PATH,
        path: parseBIP32Path(credential.keyPath, errMsg),
      }
    case CredentialParamsType.KEY_HASH:
      return {
        type: CredentialType.KEY_HASH,
        keyHashHex: parseHexStringOfLength(
          credential.keyHashHex,
          KEY_HASH_LENGTH,
          errMsg,
        ),
      }
    case CredentialParamsType.SCRIPT_HASH:
      return {
        type: CredentialType.SCRIPT_HASH,
        scriptHashHex: parseHexStringOfLength(
          credential.scriptHashHex,
          SCRIPT_HASH_LENGTH,
          errMsg,
        ),
      }
    default:
      unreachable(credential)
  }
}

export function parseAnchor(params: AnchorParams): ParsedAnchor | null {
  const url = parseAscii(params.url, InvalidDataReason.ANCHOR_INVALID_URL)
  // Additional length check
  validate(url.length <= MAX_URL_LENGTH, InvalidDataReason.ANCHOR_INVALID_URL)

  const hashHex = parseHexStringOfLength(
    params.hashHex,
    ANCHOR_HASH_LENGTH,
    InvalidDataReason.ANCHOR_INVALID_HASH,
  )

  return {
    url,
    hashHex,
    __brand: 'anchor' as const,
  }
}

import {unreachable} from '../utils/assert'
import {InvalidDataReason} from '../errors/invalidDataReason'
import type {ParsedMessageData} from '../types/internal'
import type {MessageData} from '../types/public'
import {MessageAddressFieldType} from '../types/public'
import {parseBIP32Path, parseHexString} from '../utils/parse'
import {parseAddress} from './address'

// check if a non-null-terminated buffer contains printable ASCII between 32 and 126 (inclusive)
// copied from Ledger app
function isPrintableAscii(buffer: Buffer): boolean {
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] > 126) return false
    if (buffer[i] < 32) return false
  }

  return true
}

// check if the string can be unambiguously displayed to the user
// copied from Ledger app
function isAscii(msg: string): boolean {
  const buffer = Buffer.from(msg, 'hex')

  // must not be empty
  if (buffer.length === 0) return false

  // no non-printable characters except spaces
  if (!isPrintableAscii(buffer)) return false

  const space = ' '.charCodeAt(0)

  // no leading spaces
  if (buffer[0] === space) return false

  // no trailing spaces
  if (buffer[buffer.length - 1] === space) return false

  // only single spaces
  for (let i = 0; i + 1 < buffer.length; i++) {
    if (buffer[i] === space && buffer[i + 1] === space) return false
  }

  return true
}

export function parseMessageData(data: MessageData): ParsedMessageData {
  const preferHexDisplay = data.preferHexDisplay || false
  const common = {
    signingPath: parseBIP32Path(
      data.signingPath,
      InvalidDataReason.MESSAGE_DATA_INVALID_WITNESS_PATH,
    ),
    isAscii: isAscii(data.messageHex) && !preferHexDisplay,
    hashPayload: data.hashPayload,
    messageHex: parseHexString(
      data.messageHex,
      InvalidDataReason.MESSAGE_DATA_INVALID_MESSAGE_HEX,
    ),
  }

  switch (data.addressFieldType) {
    case MessageAddressFieldType.ADDRESS:
      return {
        ...common,
        addressFieldType: MessageAddressFieldType.ADDRESS,
        address: parseAddress(data.network, data.address),
      }
    case MessageAddressFieldType.KEY_HASH:
      return {
        ...common,
        addressFieldType: MessageAddressFieldType.KEY_HASH,
      }
    default:
      unreachable(data)
  }
}

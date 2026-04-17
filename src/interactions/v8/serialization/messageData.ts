import {MessageAddressFieldType} from '../../../types/public'
import type {
  ParsedMessageData,
  Uint32_t,
  Uint8_t,
} from '../../../types/internal'
import {
  path_to_buf,
  uint32_to_buf,
  uint8_to_buf,
} from '../../../utils/serialize'
import {serializeAddressParams} from './addressParams'
import {CIP8AddressFieldType, Included} from './wireTypes'

export function serializeMessageDataInit(msgData: ParsedMessageData): Buffer {
  const addressFieldTypeEncoding = {
    [MessageAddressFieldType.ADDRESS]: CIP8AddressFieldType.ADDRESS,
    [MessageAddressFieldType.KEY_HASH]: CIP8AddressFieldType.KEYHASH,
  } as const

  const msgLengthBuffer = uint32_to_buf(
    (msgData.messageHex.length / 2) as Uint32_t,
  )

  const hashPayloadBuffer = uint8_to_buf(
    (msgData.hashPayload ? Included.YES : Included.NO) as Uint8_t,
  )

  const isAsciiBuffer = uint8_to_buf(
    (msgData.isAscii ? Included.YES : Included.NO) as Uint8_t,
  )

  const addressFieldTypeBuffer = uint8_to_buf(
    addressFieldTypeEncoding[msgData.addressFieldType] as Uint8_t,
  )

  const addressBuffer =
    msgData.addressFieldType === MessageAddressFieldType.ADDRESS
      ? serializeAddressParams(msgData.address)
      : Buffer.alloc(0)

  return Buffer.concat([
    msgLengthBuffer,
    path_to_buf(msgData.signingPath),
    hashPayloadBuffer,
    isAsciiBuffer,
    addressFieldTypeBuffer,
    addressBuffer,
  ])
}

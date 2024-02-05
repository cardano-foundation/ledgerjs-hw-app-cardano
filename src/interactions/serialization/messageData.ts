import type {Version} from '../../types/public'
import {MessageAddressFieldType} from '../../types/public'
import type {ParsedMessageData, Uint32_t, Uint8_t} from '../../types/internal'
import {path_to_buf, uint32_to_buf, uint8_to_buf} from '../../utils/serialize'
import {serializeAddressParams} from './addressParams'

export function serializeMessageDataInit(
  version: Version,
  msgData: ParsedMessageData,
): Buffer {
  const msgLengthBuffer = uint32_to_buf(
    (msgData.messageHex.length / 2) as Uint32_t,
  )

  const hashPayloadBuffer = msgData.hashPayload
    ? uint8_to_buf(1 as Uint8_t)
    : uint8_to_buf(0 as Uint8_t)

  const isAsciiBuffer = msgData.isAscii
    ? uint8_to_buf(1 as Uint8_t)
    : uint8_to_buf(0 as Uint8_t)

  const addressFieldTypeEncoding = {
    [MessageAddressFieldType.ADDRESS]: 0x01,
    [MessageAddressFieldType.KEY_HASH]: 0x02,
  } as const
  const addressFieldTypeBuffer = uint8_to_buf(
    addressFieldTypeEncoding[msgData.addressFieldType] as Uint8_t,
  )

  const addressBuffer =
    msgData.addressFieldType === MessageAddressFieldType.ADDRESS
      ? serializeAddressParams(msgData.address, version)
      : Buffer.concat([])

  return Buffer.concat([
    msgLengthBuffer,
    path_to_buf(msgData.signingPath),
    hashPayloadBuffer,
    isAsciiBuffer,
    addressFieldTypeBuffer,
    addressBuffer,
  ])
}

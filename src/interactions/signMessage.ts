import {buf_to_uint32, hex_to_buf, uint32_to_buf} from '../utils/serialize'
import {DeviceVersionUnsupported, InvalidDataReason} from '../errors'
import type {ParsedMessageData} from '../types/internal'
import {
  ED25519_SIGNATURE_LENGTH,
  PUBLIC_KEY_LENGTH,
  Uint32_t,
} from '../types/internal'
import type {SignedMessageData, Version} from '../types/public'
import {getVersionString} from '../utils'
import {INS} from './common/ins'
import type {Interaction, SendParams} from './common/types'
import {getCompatibility} from './getVersion'
import {serializeMessageDataInit} from './serialization/messageData'
import {validate} from '../utils/parse'

const send = (params: {
  p1: number
  p2: number
  data: Buffer
  expectedResponseLength?: number
}): SendParams => ({ins: INS.SIGN_MESSAGE, ...params})

export function* signMessage(
  version: Version,
  msgData: ParsedMessageData,
): Interaction<SignedMessageData> {
  if (!getCompatibility(version).supportsMessageSigning) {
    throw new DeviceVersionUnsupported(
      `CIP-8 message signing not supported by Ledger app version ${getVersionString(
        version,
      )}.`,
    )
  }

  const enum P1 {
    STAGE_INIT = 0x01,
    STAGE_CHUNK = 0x02,
    STAGE_CONFIRM = 0x03,
  }
  const enum P2 {
    UNUSED = 0x00,
  }

  // INIT
  yield send({
    p1: P1.STAGE_INIT,
    p2: P2.UNUSED,
    data: serializeMessageDataInit(version, msgData),
    expectedResponseLength: 0,
  })

  // CHUNK
  const MAX_CIP8_MSG_FIRST_CHUNK_ASCII_SIZE = 198
  const MAX_CIP8_MSG_FIRST_CHUNK_HEX_SIZE = 99
  const MAX_CIP8_MSG_HIDDEN_CHUNK_SIZE = 250

  const msgBytes = hex_to_buf(msgData.messageHex)

  const getChunkData = (start: number, end: number) => {
    const chunk = msgBytes.slice(start, end)
    return Buffer.concat([uint32_to_buf(chunk.length as Uint32_t), chunk])
  }

  const firstChunkSize = msgData.isAscii
    ? MAX_CIP8_MSG_FIRST_CHUNK_ASCII_SIZE
    : MAX_CIP8_MSG_FIRST_CHUNK_HEX_SIZE

  let start = 0
  let end = Math.min(msgBytes.length, firstChunkSize)

  yield send({
    p1: P1.STAGE_CHUNK,
    p2: P2.UNUSED,
    data: getChunkData(start, end),
    expectedResponseLength: 0,
  })
  start = end

  if (start < msgBytes.length) {
    // non-hashed messages must be processed in a single APDU
    validate(
      msgData.hashPayload,
      InvalidDataReason.MESSAGE_DATA_LONG_NON_HASHED_MSG,
    )
  }
  while (start < msgBytes.length) {
    end = Math.min(msgBytes.length, start + MAX_CIP8_MSG_HIDDEN_CHUNK_SIZE)

    yield send({
      p1: P1.STAGE_CHUNK,
      p2: P2.UNUSED,
      data: getChunkData(start, end),
      expectedResponseLength: 0,
    })

    start = end
  }

  // CONFIRM
  const MAX_ADDRESS_SIZE = 128

  const confirmResponse = yield send({
    p1: P1.STAGE_CONFIRM,
    p2: P2.UNUSED,
    data: Buffer.concat([]),
    expectedResponseLength:
      ED25519_SIGNATURE_LENGTH + PUBLIC_KEY_LENGTH + 4 + MAX_ADDRESS_SIZE,
  })

  let s = 0
  const signatureHex = confirmResponse
    .slice(s, s + ED25519_SIGNATURE_LENGTH)
    .toString('hex')
  s += ED25519_SIGNATURE_LENGTH

  const signingPublicKeyHex = confirmResponse
    .slice(s, s + PUBLIC_KEY_LENGTH)
    .toString('hex')
  s += PUBLIC_KEY_LENGTH

  const addressFieldSizeBuf = confirmResponse.slice(s, s + 4)
  s += 4
  const addressFieldSize = buf_to_uint32(addressFieldSizeBuf)
  const addressFieldHex = confirmResponse
    .slice(s, s + addressFieldSize)
    .toString('hex')

  return {
    signatureHex,
    signingPublicKeyHex,
    addressFieldHex,
  }
}

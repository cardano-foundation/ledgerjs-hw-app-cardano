import type {
  ParsedAddressParams,
  ParsedComplexNativeScript,
  ParsedCVote,
  ParsedCVoteDelegation,
  ParsedCVoteRegistrationParams,
  ParsedMessageData,
  ParsedOperationalCertificate,
  ParsedSigningRequest,
  ParsedSimpleNativeScript,
  ParsedTransaction,
  Uint32_t,
  ValidBIP32Path,
} from '../../types/internal'
import {
  ED25519_SIGNATURE_LENGTH,
  EXTENDED_PUBLIC_KEY_LENGTH,
  NATIVE_SCRIPT_HASH_LENGTH,
} from '../../types/internal'
import type {NativeScriptHashDisplayFormat} from '../../types/public'
import {INS} from '../common/ins'
import type {SendParams} from '../common/types'
import {
  buildCommand,
  buildSignOperationalCertificateCommand,
  V8P1_UNUSED,
  V8P2_UNUSED,
} from './common/apdu'
import {
  MAX_SIGN_TX_CHUNK_SIZE,
  serializeTransactionRaw,
  serializeTxAuxiliaryDataDelegation,
  serializeTxAuxiliaryDataInit,
  serializeTxInitData,
} from './serialization/tx'
import {serializeAddressParams} from './serialization/addressParams'
import {serializeMessageDataInit} from './serialization/messageData'
import {
  serializeComplexNativeScriptStart,
  serializeSimpleNativeScript,
  serializeWholeNativeScriptFinish,
} from './serialization/nativeScript'
import {serializeOperationalCertificate} from './serialization/operationalCertificate'
import {hex_to_buf, path_to_buf, uint32_to_buf} from '../../utils/serialize'

const MAX_CIP36_PAYLOAD_SIZE = 250
const MAX_CIP8_MSG_CHUNK_SIZE = 250
const AUXILIARY_DATA_HASH_LENGTH = 32

export const V8AddressP1 = {
  RETURN: 0x01,
  DISPLAY: 0x02,
} as const

export const V8NativeScriptP1 = {
  INIT: 0x00,
  START_COMPLEX: 0x01,
  ADD_SIMPLE: 0x02,
  FINISH: 0x03,
} as const

export const V8CVoteP1 = {
  INIT: 0x50,
  CHUNK: 0x51,
  CONFIRM: 0x52,
} as const

export const V8MessageP1 = {
  INIT: 0x01,
  CHUNK: 0x02,
  CONFIRM: 0x03,
} as const

export const V8TxP1 = {
  SIGN_WITNESS: 0x0f,
  INIT: 0x10,
  CHUNK: 0x11,
  CONFIRM: 0x12,
  AUX_DATA: 0x13,
} as const

export const V8TxP2 = {
  AUX_DATA_INIT: 0x36,
  AUX_DATA_DELEGATION: 0x37,
} as const

export function buildSignOperationalCertificate(
  operationalCertificate: ParsedOperationalCertificate,
): SendParams {
  return buildSignOperationalCertificateCommand(
    serializeOperationalCertificate(operationalCertificate),
    ED25519_SIGNATURE_LENGTH,
  )
}

export function buildDeriveAddress(
  p1: number,
  addressParams: ParsedAddressParams,
  expectedResponseLength?: number,
): SendParams {
  return buildCommand({
    ins: INS.DERIVE_ADDRESS,
    p1,
    p2: V8P2_UNUSED,
    data: serializeAddressParams(addressParams),
    expectedResponseLength,
  })
}

export function buildGetExtendedPublicKey(path: ValidBIP32Path): SendParams {
  return buildCommand({
    ins: INS.GET_EXT_PUBLIC_KEY,
    p1: V8P1_UNUSED,
    p2: V8P2_UNUSED,
    data: path_to_buf(path),
    expectedResponseLength: EXTENDED_PUBLIC_KEY_LENGTH,
  })
}

export function buildSignCVoteInit(cVote: ParsedCVote): SendParams {
  const payloadHex = cVote.voteCastDataHex
  const dataSize = payloadHex.length / 2
  const chunkSize = Math.min(MAX_CIP36_PAYLOAD_SIZE * 2, payloadHex.length)

  return buildCommand({
    ins: INS.SIGN_CIP36_VOTE,
    p1: V8CVoteP1.INIT,
    p2: V8P2_UNUSED,
    data: Buffer.concat([
      uint32_to_buf(dataSize as Uint32_t),
      hex_to_buf(
        payloadHex.substring(0, chunkSize) as typeof cVote.voteCastDataHex,
      ),
    ]),
    expectedResponseLength: 0,
  })
}

export function buildSignCVoteChunks(cVote: ParsedCVote): SendParams[] {
  const payload = cVote.voteCastDataHex.substring(MAX_CIP36_PAYLOAD_SIZE * 2)
  const apdus: SendParams[] = []
  let cursor = 0
  const maxPayloadSize = MAX_CIP36_PAYLOAD_SIZE * 2

  while (cursor < payload.length) {
    const chunk = payload.substring(cursor, cursor + maxPayloadSize)
    apdus.push(
      buildCommand({
        ins: INS.SIGN_CIP36_VOTE,
        p1: V8CVoteP1.CHUNK,
        p2: V8P2_UNUSED,
        data: hex_to_buf(chunk as typeof cVote.voteCastDataHex),
        expectedResponseLength: 0,
      }),
    )
    cursor += maxPayloadSize
  }

  return apdus
}

export function buildSignCVoteConfirm(cVote: ParsedCVote): SendParams {
  const HASH_LENGTH = 32
  return buildCommand({
    ins: INS.SIGN_CIP36_VOTE,
    p1: V8CVoteP1.CONFIRM,
    p2: V8P2_UNUSED,
    data: path_to_buf(cVote.witnessPath),
    expectedResponseLength: HASH_LENGTH + ED25519_SIGNATURE_LENGTH,
  })
}

export function buildSignMessageInit(msgData: ParsedMessageData): SendParams {
  return buildCommand({
    ins: INS.SIGN_MESSAGE,
    p1: V8MessageP1.INIT,
    p2: V8P2_UNUSED,
    data: serializeMessageDataInit(msgData),
    expectedResponseLength: 0,
  })
}

export function buildSignMessageChunks(
  msgData: ParsedMessageData,
): SendParams[] {
  const messageBytes = hex_to_buf(msgData.messageHex)
  let offset = 0
  const apdus: SendParams[] = []

  while (offset < messageBytes.length) {
    const size = Math.min(MAX_CIP8_MSG_CHUNK_SIZE, messageBytes.length - offset)
    const chunkData = messageBytes.slice(offset, offset + size)
    apdus.push(
      buildCommand({
        ins: INS.SIGN_MESSAGE,
        p1: V8MessageP1.CHUNK,
        p2: V8P2_UNUSED,
        data: Buffer.concat([
          uint32_to_buf(chunkData.length as Uint32_t),
          chunkData,
        ]),
        expectedResponseLength: 0,
      }),
    )
    offset += size
  }

  return apdus
}

export function buildSignMessageConfirm(): SendParams {
  return buildCommand({
    ins: INS.SIGN_MESSAGE,
    p1: V8MessageP1.CONFIRM,
    p2: V8P2_UNUSED,
    data: Buffer.alloc(0),
  })
}

export function buildDeriveNativeScriptHashInit(): SendParams {
  return buildCommand({
    ins: INS.DERIVE_NATIVE_SCRIPT_HASH,
    p1: V8NativeScriptP1.INIT,
    p2: V8P2_UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: 0,
  })
}

export function buildDeriveNativeScriptHashStartComplex(
  script: ParsedComplexNativeScript,
): SendParams {
  return buildCommand({
    ins: INS.DERIVE_NATIVE_SCRIPT_HASH,
    p1: V8NativeScriptP1.START_COMPLEX,
    p2: V8P2_UNUSED,
    data: serializeComplexNativeScriptStart(script),
    expectedResponseLength: 0,
  })
}

export function buildDeriveNativeScriptHashAddSimple(
  script: ParsedSimpleNativeScript,
): SendParams {
  return buildCommand({
    ins: INS.DERIVE_NATIVE_SCRIPT_HASH,
    p1: V8NativeScriptP1.ADD_SIMPLE,
    p2: V8P2_UNUSED,
    data: serializeSimpleNativeScript(script),
    expectedResponseLength: 0,
  })
}

export function buildDeriveNativeScriptHashFinish(
  displayFormat: NativeScriptHashDisplayFormat,
): SendParams {
  return buildCommand({
    ins: INS.DERIVE_NATIVE_SCRIPT_HASH,
    p1: V8NativeScriptP1.FINISH,
    p2: V8P2_UNUSED,
    data: serializeWholeNativeScriptFinish(displayFormat),
    expectedResponseLength: NATIVE_SCRIPT_HASH_LENGTH,
  })
}

export function buildSignTxInit(
  request: ParsedSigningRequest,
  witnessPaths: ValidBIP32Path[],
): SendParams {
  return buildCommand({
    ins: INS.SIGN_TX,
    p1: V8TxP1.INIT,
    p2: V8P2_UNUSED,
    data: serializeTxInitData(request, witnessPaths),
    expectedResponseLength: 0,
  })
}

export function buildSignTxAuxiliaryDataInit(
  params: ParsedCVoteRegistrationParams,
): SendParams {
  return buildCommand({
    ins: INS.SIGN_TX,
    p1: V8TxP1.AUX_DATA,
    p2: V8TxP2.AUX_DATA_INIT,
    data: serializeTxAuxiliaryDataInit(params),
    expectedResponseLength:
      (params.delegations?.length ?? 0) === 0
        ? AUXILIARY_DATA_HASH_LENGTH + ED25519_SIGNATURE_LENGTH
        : 0,
  })
}

export function buildSignTxAuxiliaryDataDelegation(
  delegation: ParsedCVoteDelegation,
  isLast: boolean,
): SendParams {
  return buildCommand({
    ins: INS.SIGN_TX,
    p1: V8TxP1.AUX_DATA,
    p2: V8TxP2.AUX_DATA_DELEGATION,
    data: serializeTxAuxiliaryDataDelegation(delegation),
    expectedResponseLength: isLast
      ? AUXILIARY_DATA_HASH_LENGTH + ED25519_SIGNATURE_LENGTH
      : 0,
  })
}

export function buildSignTxChunks(tx: ParsedTransaction): SendParams[] {
  const txData = serializeTransactionRaw(tx)
  const apdus: SendParams[] = []
  let offset = 0

  while (offset < txData.length) {
    const size = Math.min(MAX_SIGN_TX_CHUNK_SIZE, txData.length - offset)
    const chunkData = txData.slice(offset, offset + size)
    offset += size

    apdus.push(
      buildCommand({
        ins: INS.SIGN_TX,
        p1: offset < txData.length ? V8TxP1.CHUNK : V8TxP1.CONFIRM,
        p2: V8P2_UNUSED,
        data: chunkData,
        expectedResponseLength:
          offset < txData.length ? 0 : ED25519_SIGNATURE_LENGTH / 2,
      }),
    )
  }

  return apdus
}

export function buildSignTxWitness(path: ValidBIP32Path): SendParams {
  return buildCommand({
    ins: INS.SIGN_TX,
    p1: V8TxP1.SIGN_WITNESS,
    p2: V8P2_UNUSED,
    data: path_to_buf(path),
    expectedResponseLength: ED25519_SIGNATURE_LENGTH,
  })
}

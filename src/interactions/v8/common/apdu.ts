import {INS} from '../../common/ins'
import type {SendParams} from '../../common/types'

const CLA = 0xd7

export const V8P1_UNUSED = 0x00
export const V8P2_UNUSED = 0x00

export function buildCommand(params: SendParams): SendParams {
  return params
}

export function serializeApdu(params: SendParams): Buffer {
  if (params.data.length > 255) {
    throw new Error('APDU too large, likely a bug')
  }

  return Buffer.concat([
    Buffer.from([
      CLA,
      params.ins,
      params.p1,
      params.p2,
      params.data.length,
    ]),
    params.data,
  ])
}

export function buildSignOperationalCertificateCommand(
  data: Buffer,
  expectedResponseLength?: number,
): SendParams {
  return buildCommand({
    ins: INS.SIGN_OPERATIONAL_CERTIFICATE,
    p1: V8P1_UNUSED,
    p2: V8P2_UNUSED,
    data,
    expectedResponseLength,
  })
}

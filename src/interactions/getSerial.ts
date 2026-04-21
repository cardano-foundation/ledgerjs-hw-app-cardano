import type {Version} from '../types/internal'
import type {Serial} from '../types/public'
import utils from '../utils'
import {INS} from './common/ins'
import type {Interaction, SendParams} from './common/types'
import {ensureLedgerAppVersionCompatible} from '../validation/deviceCapabilities'

const send = (params: {
  p1: number
  p2: number
  data: Buffer
  expectedResponseLength?: number
}): SendParams => ({ins: INS.GET_SERIAL, ...params})

export function* getSerial(version: Version): Interaction<Serial> {
  ensureLedgerAppVersionCompatible(version)

  const P1_UNUSED = 0x00
  const P2_UNUSED = 0x00
  // GET_SERIAL returns a fixed-width 7-byte payload from current Ledger devices.
  // There is no payload length prefix; the trailing APDU status words are stripped in Ada._send.
  // Keep the strict length check for now and revisit only if future devices change this contract.
  const response = yield send({
    p1: P1_UNUSED,
    p2: P2_UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: 7,
  })

  const serialHex = utils.buf_to_hex(response)
  return {serialHex}
}

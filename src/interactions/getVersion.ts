import type {Version} from '../types/internal'
import {INS} from './common/ins'
import type {Interaction, SendParams} from './common/types'

const send = (params: {
  p1: number
  p2: number
  data: Buffer
  expectedResponseLength?: number
}): SendParams => ({ins: INS.GET_VERSION, ...params})

export function* getVersion(): Interaction<Version> {
  // moving getVersion() logic to private function in order
  // to disable concurrent execution protection done by this.transport.decorateAppAPIMethods()
  // when invoked from within other calls to check app version

  const P1_UNUSED = 0x00
  const P2_UNUSED = 0x00
  const response = yield send({
    p1: P1_UNUSED,
    p2: P2_UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: 4,
  })
  const [major, minor, patch, flags_value] = response

  const FLAG_IS_DEBUG = 1
  // const FLAG_IS_HEADLESS = 2;
  const FLAG_IS_APP_XS = 4

  const flags = {
    // eslint-disable-next-line no-bitwise
    isDebug: (flags_value & FLAG_IS_DEBUG) === FLAG_IS_DEBUG,
    // eslint-disable-next-line no-bitwise
    isAppXS: (flags_value & FLAG_IS_APP_XS) === FLAG_IS_APP_XS,
  }
  return {major, minor, patch, flags}
}

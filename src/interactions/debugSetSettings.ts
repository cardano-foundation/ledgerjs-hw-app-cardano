import {INS} from './common/ins'
import type {Interaction, SendParams} from './common/types'

export type DebugSettings = {
  expertMode: boolean
  silentPubkeyExport?: boolean
  blindSigning?: boolean
}

export type ConfirmedDebugSettings = {
  expertMode: boolean
  silentPubkeyExport: boolean
  blindSigning: boolean
}

const send = (params: {
  p1: number
  p2: number
  data: Buffer
  expectedResponseLength?: number
}): SendParams => ({ins: INS.RUN_TESTS, ...params})

export function* debugSetSettings(
  settings: DebugSettings,
): Interaction<ConfirmedDebugSettings> {
  const data = Buffer.from([
    settings.expertMode ? 0x01 : 0x00,
    settings.silentPubkeyExport ? 0x01 : 0x00,
    settings.blindSigning ? 0x01 : 0x00,
  ])

  const response = yield send({
    p1: 0x00,
    p2: 0x00,
    data,
    expectedResponseLength: 3,
  })

  return {
    expertMode: response[0] === 0x01,
    silentPubkeyExport: response[1] === 0x01,
    blindSigning: response[2] === 0x01,
  }
}
